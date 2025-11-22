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
      rawTotal: 0
    };
  }

  const available = Number(wallet.currentTokens || 0);
  const reserved = Number(wallet.reservedTokens || 0);
  const lifetime = Number(wallet.lifetimeTokens || 0);

  const normalizeBound = (value) => {
    if (value == null) return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  };

  const policyCap = normalizeBound(policy?.monthlyCap);
  const baseAllocation = normalizeBound(policy?.baseAllocation);

  let total = policyCap ?? baseAllocation ?? null;
  let used;

  if (total != null) {
    if (total < 0) total = 0;
    used = Math.max(total - available, 0);
    if (used > total) used = total;
  } else {
    total = available + lifetime;
    used = lifetime;
  }

  const remaining = Math.max(total - used, 0);
  const usagePercent = total > 0 ? used / total : 0;

  return {
    available,
    reserved,
    lifetime,
    used,
    total,
    remaining,
    usagePercent,
    rawTotal: available + lifetime
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
        console.debug('[TokenWallet] Computed stats', {
          userId,
          stats: normalizedStats,
          userPolicy,
          levelPolicy
        });

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

  const stats = useMemo(() => normalizeWalletSnapshot(wallet, policy?.effective), [wallet, policy]);

  return {
    wallet,
    policy,
    stats,
    loading,
    error
  };
};

export default useTokenWallet;
