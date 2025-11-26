BEGIN;

-- Function to reset monthly allocation tokens with rollover
CREATE OR REPLACE FUNCTION public.reset_monthly_token_allocation(
  p_user_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet public.user_token_wallets%ROWTYPE;
  v_user_policy public.user_token_policies%ROWTYPE;
  v_level_policy public.level_token_policies%ROWTYPE;
  v_allocation_mode text;
  v_monthly_allocation integer;
  v_rollover_percent numeric(5,2);
  v_unused_tokens bigint;
  v_rollover_amount bigint;
  v_new_allocation bigint;
  v_reset_count integer := 0;
  v_results jsonb := '[]'::jsonb;
BEGIN
  -- Process all wallets with monthly allocation mode, or specific user if provided
  FOR v_wallet IN
    SELECT w.*
    FROM public.user_token_wallets w
    WHERE w.status = 'active'
      AND (p_user_id IS NULL OR w.user_id = p_user_id)
      AND (
        -- Check if wallet needs reset (last reset was last month or never)
        w.last_monthly_reset IS NULL
        OR w.last_monthly_reset < date_trunc('month', now())
      )
  LOOP
    -- Get effective policy (user policy overrides level policy)
    SELECT * INTO v_user_policy
    FROM public.user_token_policies
    WHERE user_id = v_wallet.user_id;

    IF FOUND THEN
      v_allocation_mode := COALESCE(v_user_policy.allocation_mode, 'lifetime');
      v_monthly_allocation := v_user_policy.monthly_allocation;
      v_rollover_percent := COALESCE(v_user_policy.rollover_percent, 0);
    ELSIF v_wallet.level_id IS NOT NULL THEN
      SELECT * INTO v_level_policy
      FROM public.level_token_policies
      WHERE level_id = v_wallet.level_id;
      
      IF FOUND THEN
        v_allocation_mode := COALESCE(v_level_policy.allocation_mode, 'lifetime');
        v_monthly_allocation := v_level_policy.monthly_allocation;
        v_rollover_percent := COALESCE(v_level_policy.rollover_percent, 0);
      ELSE
        -- No policy found, skip this wallet
        CONTINUE;
      END IF;
    ELSE
      -- No level assigned, skip
      CONTINUE;
    END IF;

    -- Only process monthly allocation mode
    IF v_allocation_mode <> 'monthly' OR v_monthly_allocation IS NULL OR v_monthly_allocation <= 0 THEN
      CONTINUE;
    END IF;

    -- Calculate rollover from unused tokens
    v_unused_tokens := COALESCE(v_wallet.monthly_allocation_tokens, 0);
    v_rollover_amount := FLOOR(v_unused_tokens * (v_rollover_percent / 100.0));
    v_new_allocation := v_monthly_allocation + v_rollover_amount;

    -- Update wallet with new monthly allocation
    UPDATE public.user_token_wallets
    SET monthly_allocation_tokens = v_new_allocation,
        last_monthly_reset = date_trunc('month', now()),
        updated_at = now()
    WHERE id = v_wallet.id;

    v_reset_count := v_reset_count + 1;

    -- Add result to array
    v_results := v_results || jsonb_build_object(
      'user_id', v_wallet.user_id,
      'previous_allocation', v_unused_tokens,
      'rollover_percent', v_rollover_percent,
      'rollover_amount', v_rollover_amount,
      'monthly_allocation', v_monthly_allocation,
      'new_allocation', v_new_allocation
    );
  END LOOP;

  RETURN jsonb_build_object(
    'reset_count', v_reset_count,
    'reset_timestamp', now(),
    'results', v_results
  );
END;
$$;

COMMENT ON FUNCTION public.reset_monthly_token_allocation IS 'Resets monthly token allocation for users with monthly allocation mode. Applies rollover percentage to unused tokens.';

COMMIT;

