BEGIN;

-- Add allocation_mode and monthly_allocation to level_token_policies
ALTER TABLE public.level_token_policies
  ADD COLUMN IF NOT EXISTS allocation_mode text NOT NULL DEFAULT 'lifetime'
    CHECK (allocation_mode IN ('lifetime', 'monthly')),
  ADD COLUMN IF NOT EXISTS monthly_allocation integer;

COMMENT ON COLUMN public.level_token_policies.allocation_mode IS 'Token allocation mode: lifetime (accumulated) or monthly (resets each month)';
COMMENT ON COLUMN public.level_token_policies.monthly_allocation IS 'Monthly token allocation (only used when allocation_mode = monthly)';

-- Add allocation_mode and monthly_allocation to user_token_policies
ALTER TABLE public.user_token_policies
  ADD COLUMN IF NOT EXISTS allocation_mode text
    CHECK (allocation_mode IN ('lifetime', 'monthly')),
  ADD COLUMN IF NOT EXISTS monthly_allocation integer;

COMMENT ON COLUMN public.user_token_policies.allocation_mode IS 'Token allocation mode: lifetime (accumulated) or monthly (resets each month). Overrides level policy if set.';
COMMENT ON COLUMN public.user_token_policies.monthly_allocation IS 'Monthly token allocation (only used when allocation_mode = monthly). Overrides level policy if set.';

-- Add monthly_allocation_tokens and last_monthly_reset to user_token_wallets
ALTER TABLE public.user_token_wallets
  ADD COLUMN IF NOT EXISTS monthly_allocation_tokens bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_monthly_reset timestamptz;

COMMENT ON COLUMN public.user_token_wallets.monthly_allocation_tokens IS 'Current month allocated tokens (only used when allocation_mode = monthly). Resets monthly with rollover.';
COMMENT ON COLUMN public.user_token_wallets.last_monthly_reset IS 'Last monthly reset timestamp (only used when allocation_mode = monthly)';

-- Update constraint to include monthly_allocation_tokens
ALTER TABLE public.user_token_wallets
  DROP CONSTRAINT IF EXISTS user_token_wallets_non_negative;

ALTER TABLE public.user_token_wallets
  ADD CONSTRAINT user_token_wallets_non_negative
    CHECK (
      current_tokens >= 0 AND
      reserved_tokens >= 0 AND
      lifetime_tokens >= 0 AND
      borrowed_tokens >= 0 AND
      monthly_allocation_tokens >= 0
    );

COMMIT;

