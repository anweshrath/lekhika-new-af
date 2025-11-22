BEGIN;

CREATE TABLE IF NOT EXISTS public.user_token_policies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  level_id uuid REFERENCES public.levels(id) ON DELETE SET NULL,
  base_allocation integer NOT NULL DEFAULT 0,
  monthly_cap integer,
  rollover_percent numeric(5,2) NOT NULL DEFAULT 0,
  enforcement_mode text NOT NULL DEFAULT 'monitor',
  priority_weight integer NOT NULL DEFAULT 10,
  allow_manual_override boolean NOT NULL DEFAULT true,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  reset_anchor timestamptz,
  next_reset_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_token_policies_enforcement_mode_check CHECK (enforcement_mode = ANY(ARRAY['monitor','warn','hard'])),
  CONSTRAINT user_token_policies_rollover_check CHECK (rollover_percent >= 0 AND rollover_percent <= 100)
);

CREATE INDEX IF NOT EXISTS user_token_policies_level_id_idx ON public.user_token_policies(level_id);
CREATE INDEX IF NOT EXISTS user_token_policies_enforcement_idx ON public.user_token_policies(enforcement_mode);
CREATE INDEX IF NOT EXISTS user_token_policies_reset_anchor_idx ON public.user_token_policies(reset_anchor);

DROP FUNCTION IF EXISTS public.adjust_user_tokens(uuid, bigint, text, text, jsonb, uuid, text, text, uuid, uuid);

CREATE OR REPLACE FUNCTION public.adjust_user_tokens(
  p_user_id uuid,
  p_amount bigint,
  p_change_type text,
  p_reason text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_level_id uuid DEFAULT NULL,
  p_source text DEFAULT 'manual',
  p_reference_type text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL,
  p_execution_id uuid DEFAULT NULL
) RETURNS public.user_token_ledger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet public.user_token_wallets%ROWTYPE;
  v_user_policy public.user_token_policies%ROWTYPE;
  v_level_policy public.level_token_policies%ROWTYPE;
  v_direction text;
  v_abs_amount bigint;
  v_new_balance bigint;
  v_new_reserved bigint;
  v_new_lifetime bigint;
  v_result public.user_token_ledger%ROWTYPE;
  v_policy_enforcement text := 'monitor';
  v_policy_monthly_cap integer;
  v_policy_allow_override boolean := true;
  v_policy_rollover numeric(5,2) := 0;
  v_policy_source text := 'none';
  v_effective_level_id uuid;
  v_period_anchor timestamptz := date_trunc('month', now());
  v_monthly_usage bigint := 0;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'p_user_id is required';
  END IF;

  IF p_amount = 0 THEN
    RAISE EXCEPTION 'p_amount must be non-zero';
  END IF;

  v_direction := lower(p_change_type);
  IF v_direction NOT IN ('credit','debit','reserve','release','adjustment') THEN
    RAISE EXCEPTION 'Invalid change type: %', p_change_type;
  END IF;

  v_abs_amount := abs(p_amount);

  SELECT * INTO v_wallet
  FROM public.user_token_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.user_token_wallets (user_id, level_id)
    VALUES (p_user_id, p_level_id)
    RETURNING * INTO v_wallet;
  ELSIF p_level_id IS NOT NULL AND v_wallet.level_id IS DISTINCT FROM p_level_id THEN
    UPDATE public.user_token_wallets
    SET level_id = p_level_id,
        updated_at = now()
    WHERE id = v_wallet.id
    RETURNING * INTO v_wallet;
  END IF;

  IF v_wallet.status <> 'active' THEN
    RAISE EXCEPTION 'Token wallet for user % is %', p_user_id, v_wallet.status;
  END IF;

  v_effective_level_id := COALESCE(p_level_id, v_wallet.level_id);

  SELECT * INTO v_user_policy
  FROM public.user_token_policies
  WHERE user_id = p_user_id;

  IF FOUND THEN
    v_policy_source := 'user';
    v_policy_enforcement := COALESCE(v_user_policy.enforcement_mode, 'monitor');
    v_policy_monthly_cap := v_user_policy.monthly_cap;
    v_policy_allow_override := v_user_policy.allow_manual_override;
    v_policy_rollover := v_user_policy.rollover_percent;
    v_period_anchor := COALESCE(v_user_policy.reset_anchor, date_trunc('month', now()));
    v_effective_level_id := COALESCE(v_user_policy.level_id, v_effective_level_id);
  ELSIF v_effective_level_id IS NOT NULL THEN
    SELECT * INTO v_level_policy
    FROM public.level_token_policies
    WHERE level_id = v_effective_level_id;
    IF FOUND THEN
      v_policy_source := 'level';
      v_policy_enforcement := COALESCE(v_level_policy.enforcement_mode, 'monitor');
      v_policy_monthly_cap := v_level_policy.monthly_cap;
      v_policy_allow_override := v_level_policy.allow_manual_override;
      v_policy_rollover := v_level_policy.rollover_percent;
      v_period_anchor := date_trunc('month', now());
    END IF;
  END IF;

  IF v_policy_enforcement IS NULL OR v_policy_enforcement NOT IN ('monitor','warn','hard') THEN
    v_policy_enforcement := 'monitor';
  END IF;

  IF (v_direction = 'reserve' OR v_direction = 'debit') AND v_policy_monthly_cap IS NOT NULL THEN
    SELECT COALESCE(SUM(amount), 0) INTO v_monthly_usage
    FROM public.user_token_ledger
    WHERE user_id = p_user_id
      AND direction = 'debit'
      AND created_at >= v_period_anchor;

    IF v_policy_enforcement = 'hard' AND v_monthly_usage + v_abs_amount > v_policy_monthly_cap THEN
      RAISE EXCEPTION 'Token allowance exceeded (used %, cap %).', v_monthly_usage + v_abs_amount, v_policy_monthly_cap;
    ELSIF v_policy_enforcement = 'warn' AND v_monthly_usage + v_abs_amount > v_policy_monthly_cap THEN
      RAISE NOTICE 'Token usage is exceeding allowance (used %, cap %).', v_monthly_usage + v_abs_amount, v_policy_monthly_cap;
    END IF;
  END IF;

  IF v_direction = 'credit' AND v_policy_source <> 'none' AND NOT v_policy_allow_override THEN
    RAISE EXCEPTION 'Manual credits are disabled by policy.';
  END IF;

  v_new_balance := v_wallet.current_tokens;
  v_new_reserved := v_wallet.reserved_tokens;
  v_new_lifetime := v_wallet.lifetime_tokens;

  IF v_direction = 'credit' THEN
    v_new_balance := v_new_balance + v_abs_amount;
  ELSIF v_direction = 'debit' THEN
    IF v_new_balance < v_abs_amount THEN
      RAISE EXCEPTION 'Insufficient tokens. Available: %, requested: %', v_new_balance, v_abs_amount;
    END IF;
    v_new_balance := v_new_balance - v_abs_amount;
    v_new_lifetime := v_new_lifetime + v_abs_amount;
  ELSIF v_direction = 'reserve' THEN
    IF v_new_balance < v_abs_amount THEN
      RAISE EXCEPTION 'Insufficient tokens to reserve. Available: %, requested: %', v_new_balance, v_abs_amount;
    END IF;
    v_new_balance := v_new_balance - v_abs_amount;
    v_new_reserved := v_new_reserved + v_abs_amount;
  ELSIF v_direction = 'release' THEN
    IF v_new_reserved < v_abs_amount THEN
      RAISE EXCEPTION 'Insufficient reserved tokens to release. Reserved: %, requested: %', v_new_reserved, v_abs_amount;
    END IF;
    v_new_balance := v_new_balance + v_abs_amount;
    v_new_reserved := v_new_reserved - v_abs_amount;
  ELSE
    v_new_balance := v_new_balance + p_amount;
  END IF;

  IF v_new_balance < 0 OR v_new_reserved < 0 THEN
    RAISE EXCEPTION 'Token balances cannot be negative';
  END IF;

  UPDATE public.user_token_wallets
  SET current_tokens = v_new_balance,
      reserved_tokens = v_new_reserved,
      lifetime_tokens = v_new_lifetime,
      updated_at = now()
  WHERE id = v_wallet.id
  RETURNING * INTO v_wallet;

  INSERT INTO public.user_token_ledger (
    wallet_id,
    user_id,
    level_id,
    direction,
    amount,
    balance_after,
    reserved_after,
    lifetime_after,
    reason,
    source,
    reference_type,
    reference_id,
    execution_id,
    metadata
  )
  VALUES (
    v_wallet.id,
    v_wallet.user_id,
    COALESCE(v_wallet.level_id, v_effective_level_id),
    v_direction,
    v_abs_amount,
    v_wallet.current_tokens,
    v_wallet.reserved_tokens,
    v_wallet.lifetime_tokens,
    p_reason,
    p_source,
    p_reference_type,
    p_reference_id,
    p_execution_id,
    COALESCE(p_metadata, '{}'::jsonb) || jsonb_build_object(
      'policy_source', v_policy_source,
      'policy_enforcement', v_policy_enforcement,
      'policy_monthly_cap', v_policy_monthly_cap,
      'policy_rollover_percent', v_policy_rollover
    )
  )
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.adjust_user_tokens IS 'Adjusts user token balances with policy enforcement and creates immutable ledger entries';

ALTER TABLE public.user_token_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on user_token_policies" ON public.user_token_policies;
CREATE POLICY "SuperAdmin full access on user_token_policies"
  ON public.user_token_policies
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMIT;

