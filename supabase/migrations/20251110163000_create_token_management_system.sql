-- TOKEN MANAGEMENT FOUNDATION
-- Surgical rollout of level policies, user wallets, and immutable ledgers

BEGIN;

-- 1. LEVEL TOKEN POLICIES
CREATE TABLE IF NOT EXISTS public.level_token_policies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  level_id uuid NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
  base_allocation integer NOT NULL DEFAULT 0,
  monthly_cap integer,
  rollover_percent numeric(5,2) NOT NULL DEFAULT 0,
  enforcement_mode text NOT NULL DEFAULT 'monitor',
  priority_weight integer NOT NULL DEFAULT 1,
  allow_manual_override boolean NOT NULL DEFAULT true,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT level_token_policies_enforcement_mode_check
    CHECK (enforcement_mode IN ('monitor', 'warn', 'hard')),
  CONSTRAINT level_token_policies_rollover_check
    CHECK (rollover_percent >= 0 AND rollover_percent <= 100)
);

CREATE UNIQUE INDEX IF NOT EXISTS level_token_policies_level_id_key
  ON public.level_token_policies(level_id);

CREATE INDEX IF NOT EXISTS level_token_policies_enforcement_mode_idx
  ON public.level_token_policies(enforcement_mode);


-- 2. USER TOKEN WALLETS
CREATE TABLE IF NOT EXISTS public.user_token_wallets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  level_id uuid REFERENCES public.levels(id) ON DELETE SET NULL,
  current_tokens bigint NOT NULL DEFAULT 0,
  reserved_tokens bigint NOT NULL DEFAULT 0,
  lifetime_tokens bigint NOT NULL DEFAULT 0,
  borrowed_tokens bigint NOT NULL DEFAULT 0,
  last_reset_at timestamptz,
  next_reset_at timestamptz,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_token_wallets_status_check
    CHECK (status IN ('active', 'locked', 'suspended')),
  CONSTRAINT user_token_wallets_non_negative
    CHECK (
      current_tokens >= 0 AND
      reserved_tokens >= 0 AND
      lifetime_tokens >= 0 AND
      borrowed_tokens >= 0
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS user_token_wallets_user_id_key
  ON public.user_token_wallets(user_id);

CREATE INDEX IF NOT EXISTS user_token_wallets_level_id_idx
  ON public.user_token_wallets(level_id);

CREATE INDEX IF NOT EXISTS user_token_wallets_status_idx
  ON public.user_token_wallets(status);


-- 3. USER TOKEN LEDGER
CREATE TABLE IF NOT EXISTS public.user_token_ledger (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id uuid NOT NULL REFERENCES public.user_token_wallets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  level_id uuid REFERENCES public.levels(id) ON DELETE SET NULL,
  direction text NOT NULL,
  amount bigint NOT NULL,
  balance_after bigint,
  reserved_after bigint,
  lifetime_after bigint,
  reason text,
  source text,
  reference_type text,
  reference_id uuid,
  execution_id uuid REFERENCES public.engine_executions(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_token_ledger_direction_check
    CHECK (direction IN ('credit', 'debit', 'reserve', 'release', 'adjustment')),
  CONSTRAINT user_token_ledger_amount_check
    CHECK (amount >= 0)
);

CREATE INDEX IF NOT EXISTS user_token_ledger_wallet_id_idx
  ON public.user_token_ledger(wallet_id);

CREATE INDEX IF NOT EXISTS user_token_ledger_user_id_idx
  ON public.user_token_ledger(user_id);

CREATE INDEX IF NOT EXISTS user_token_ledger_direction_idx
  ON public.user_token_ledger(direction);

CREATE INDEX IF NOT EXISTS user_token_ledger_execution_idx
  ON public.user_token_ledger(execution_id);


-- 4. DEFAULT POLICIES FOR EXISTING LEVELS
INSERT INTO public.level_token_policies (level_id, base_allocation, monthly_cap, rollover_percent, enforcement_mode, priority_weight, metadata)
SELECT
  l.id,
  COALESCE(l.credits_monthly, 0),
  NULLIF(l.monthly_limit, 0),
  0,
  'monitor',
  GREATEST(1, COALESCE(l.tier_level, 1)),
  jsonb_build_object(
    'display_name', l.display_name,
    'seeded', true
  )
FROM public.levels AS l
ON CONFLICT (level_id) DO NOTHING;


-- 5. TOKEN ADJUSTMENT FUNCTION
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
  v_wallet public.user_token_wallets;
  v_policy public.level_token_policies;
  v_direction text;
  v_abs_amount bigint;
  v_new_balance bigint;
  v_new_reserved bigint;
  v_new_lifetime bigint;
  v_result public.user_token_ledger%ROWTYPE;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'p_user_id is required';
  END IF;

  IF p_amount = 0 THEN
    RAISE EXCEPTION 'p_amount must be non-zero';
  END IF;

  v_direction := lower(p_change_type);
  IF v_direction NOT IN ('credit', 'debit', 'reserve', 'release', 'adjustment') THEN
    RAISE EXCEPTION 'Invalid change type: %', p_change_type;
  END IF;

  v_abs_amount := abs(p_amount);

  SELECT *
  INTO v_wallet
  FROM public.user_token_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.user_token_wallets (user_id, level_id)
    VALUES (p_user_id, p_level_id)
    RETURNING * INTO v_wallet;
  ELSIF p_level_id IS NOT NULL AND v_wallet.level_id IS DISTINCT FROM p_level_id THEN
    UPDATE public.user_token_wallets
    SET level_id = p_level_id, updated_at = now()
    WHERE id = v_wallet.id
    RETURNING * INTO v_wallet;
  END IF;

  IF v_wallet.status <> 'active' THEN
    RAISE EXCEPTION 'Token wallet for user % is %', p_user_id, v_wallet.status;
  END IF;

  IF v_wallet.level_id IS NOT NULL THEN
    SELECT *
    INTO v_policy
    FROM public.level_token_policies
    WHERE level_id = v_wallet.level_id;
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
  ELSE -- adjustment
    v_new_balance := v_new_balance + p_amount;
  END IF;

  IF v_new_balance < 0 OR v_new_reserved < 0 THEN
    RAISE EXCEPTION 'Token balances cannot be negative';
  END IF;

  UPDATE public.user_token_wallets
  SET
    current_tokens = v_new_balance,
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
    v_wallet.level_id,
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
    coalesce(p_metadata, '{}'::jsonb)
  )
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

ALTER FUNCTION public.adjust_user_tokens OWNER TO postgres;


-- 6. PERMISSIONS / RLS (TEMPORARY FULL ACCESS - tighten when admin auth tokens available)
ALTER TABLE public.level_token_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_token_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_token_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on level_token_policies" ON public.level_token_policies;
CREATE POLICY "Allow all on level_token_policies"
  ON public.level_token_policies
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on user_token_wallets" ON public.user_token_wallets;
CREATE POLICY "Allow all on user_token_wallets"
  ON public.user_token_wallets
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on user_token_ledger" ON public.user_token_ledger;
CREATE POLICY "Allow all on user_token_ledger"
  ON public.user_token_ledger
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMIT;

