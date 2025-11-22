import { useEffect, useMemo, useState } from 'react';
import { useUserAuth } from '../contexts/UserAuthContext';
import tokenManagementService from '../services/tokenManagementService';

const normalizeWalletSnapshot = (wallet, policy) => {
  if (!wallet) {
    return {
      available: 0,
      reserved: 0,
      lifetime: 0,
      used: 0,
      total: 0,
      remaining: 0,
      usagePercent: 0,
      rawTotal: 0,
      allocationMode: 'lifetime'
    };
  }

  const currentTokens = Number(wallet.currentTokens || 0);
  const reserved = Number(wallet.reservedTokens || 0);
  const lifetimeTokens = Number(wallet.lifetimeTokens || 0);
  const monthlyAllocationTokens = Number(wallet.monthlyAllocationTokens || 0);

  const normalizeBound = (value) => {
    if (value == null) return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  };

  // Determine allocation mode (user policy overrides level policy)
  const allocationMode = policy?.allocationMode || 'lifetime';
  const monthlyAllocation = normalizeBound(policy?.monthlyAllocation);
  const policyCap = normalizeBound(policy?.monthlyCap);
  const baseAllocation = normalizeBound(policy?.baseAllocation);

  let total, used, available, policyLimit;

  if (allocationMode === 'monthly') {
    // MONTHLY MODE:
    // total = monthly_allocation (from policy)
    // available = monthly_allocation_tokens (current month's pool)
    // used = monthly_allocation - monthly_allocation_tokens (spent this month)
    total = monthlyAllocation || 0;
    available = monthlyAllocationTokens;
    used = total - available;
    policyLimit = monthlyAllocation; // Monthly allocation is the limit
  } else {
    // LIFETIME MODE:
    // lifetime_tokens = Total allocated (from credits)
    // current_tokens = Tokens spent (from execution debits)
    // available = lifetime_tokens - current_tokens (calculated)
    total = lifetimeTokens;
    used = currentTokens;
    available = total - used;
    policyLimit = policyCap ?? baseAllocation ?? null;
  }

  const remaining = Math.max(available, 0);
  const usagePercent = policyLimit && policyLimit > 0 ? Math.min(used / policyLimit, 1) : 0;

  return {
    available,
    reserved,
    lifetime: lifetimeTokens,
    used,
    total,
    remaining,
    usagePercent,
    rawTotal: total,
    policyLimit,
    allocationMode
  };
};

const useTokenWallet = () => {
  const { user } = useUserAuth();
  const [wallet, setWallet] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchWallet = async () => {
      if (!user?.id && !user?.user_id) {
        if (isMounted) {
          setWallet(null);
          setPolicy(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const userId = user.id || user.user_id;
        const preferredLevelId =
          user.level_id ||
          user.levelId ||
          user.level?.id ||
          user.default_level_id ||
          null;

        let walletData = await tokenManagementService.fetchWalletByUser(userId);
        console.debug('[TokenWallet] Wallet payload', { userId, walletData });

        // Auto-provision the wallet if it doesn't exist yet
        if (!walletData) {
          walletData = await tokenManagementService.ensureWalletForUser(userId, preferredLevelId);
          console.debug('[TokenWallet] Wallet auto-provisioned', { userId, walletData });
        }

        if (!walletData) {
          if (isMounted) {
            setWallet(null);
            setPolicy(null);
            setLoading(false);
          }
          return;
        }

        let userPolicy = null;
        let levelPolicy = null;

        try {
          const policySnapshot = await tokenManagementService.fetchUserPolicy(
            userId,
            walletData.levelId || preferredLevelId
          );
          userPolicy = policySnapshot.userPolicy;
          levelPolicy = policySnapshot.levelPolicy;
        } catch (policyError) {
          console.warn('[TokenWallet] Falling back to wallet-only stats (policy fetch failed)', policyError);
        }

        const effectivePolicy = userPolicy || levelPolicy || null;
        
        const normalizedStats = normalizeWalletSnapshot(walletData, effectivePolicy);

        if (isMounted) {
          setWallet(walletData);
          setPolicy({
            effective: effectivePolicy,
            user: userPolicy,
            level: levelPolicy
          });
          setError(null);
        }
      } catch (err) {
        console.error('❌ Failed to fetch token wallet:', err);
        if (isMounted) {
          setError(err);
          setWallet(null);
          setPolicy(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWallet();

    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.user_id]);

  // SURGICAL FIX: Only recalculate when wallet or executionUsage changes
  // Policy is only used for limit checking (usagePercent), not for display calculation (total)
  // CRITICAL: total is ALWAYS actualBalance (available + lifetime), never policy limit
  // CRITICAL: used is ALWAYS executionUsage from ledger (actual token spend), not wallet.lifetimeTokens
  // This prevents the flash when policy loads after wallet
  const stats = useMemo(() => {
    if (!wallet) {
      return {
        available: 0,
        reserved: 0,
        lifetime: 0,
        used: 0,
        total: 0,
        remaining: 0,
        usagePercent: 0,
        rawTotal: 0,
        policyLimit: null
      };
    }
    // Always use the latest wallet data, policy is only for enforcement
    // Display MUST show whatever is in the wallet
    return normalizeWalletSnapshot(wallet, policy?.effective);
  }, [wallet, policy?.effective]);

  return {
    wallet,
    policy,
    stats,
    loading,
    error
  };
};

export default useTokenWallet;
