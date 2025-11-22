import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const USER_FIELDS = 'id,email,username,full_name,tier,access_level,level_id'

const normalizePolicy = (row) => {
  if (!row) return null
  return {
    id: row.id,
    levelId: row.level_id,
    baseAllocation: row.base_allocation ?? 0,
    monthlyCap: row.monthly_cap ?? null,
    monthlyAllocation: row.monthly_allocation ?? null,
    allocationMode: row.allocation_mode ?? 'lifetime',
    rolloverPercent: Number(row.rollover_percent ?? 0),
    enforcementMode: row.enforcement_mode ?? 'monitor',
    priorityWeight: row.priority_weight ?? 1,
    allowManualOverride: row.allow_manual_override ?? true,
    notes: row.notes ?? '',
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    level: row.level || null
  }
}

const normalizeWallet = (row) => {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    levelId: row.level_id,
    currentTokens: Number(row.current_tokens ?? 0),
    reservedTokens: Number(row.reserved_tokens ?? 0),
    lifetimeTokens: Number(row.lifetime_tokens ?? 0),
    monthlyAllocationTokens: Number(row.monthly_allocation_tokens ?? 0),
    borrowedTokens: Number(row.borrowed_tokens ?? 0),
    lastResetAt: row.last_reset_at,
    lastMonthlyReset: row.last_monthly_reset,
    nextResetAt: row.next_reset_at,
    status: row.status ?? 'active',
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    level: row.level || null,
    user: row.user || null
  }
}

const normalizeLedgerEntry = (row) => {
  if (!row) return null
  return {
    id: row.id,
    walletId: row.wallet_id,
    userId: row.user_id,
    levelId: row.level_id,
    direction: row.direction,
    amount: Number(row.amount ?? 0),
    balanceAfter: Number(row.balance_after ?? 0),
    reservedAfter: Number(row.reserved_after ?? 0),
    lifetimeAfter: Number(row.lifetime_after ?? 0),
    reason: row.reason,
    source: row.source,
    referenceType: row.reference_type,
    referenceId: row.reference_id,
    executionId: row.execution_id,
    metadata: row.metadata ?? {},
    createdAt: row.created_at
  }
}

const normalizeUserPolicy = (row) => {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    levelId: row.level_id,
    baseAllocation: row.base_allocation ?? 0,
    monthlyCap: row.monthly_cap ?? null,
    monthlyAllocation: row.monthly_allocation ?? null,
    allocationMode: row.allocation_mode ?? null,
    rolloverPercent: Number(row.rollover_percent ?? 0),
    enforcementMode: row.enforcement_mode ?? 'monitor',
    priorityWeight: row.priority_weight ?? 10,
    allowManualOverride: row.allow_manual_override ?? true,
    notes: row.notes ?? '',
    metadata: row.metadata ?? {},
    resetAnchor: row.reset_anchor,
    nextResetAt: row.next_reset_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

const fetchUsersByIds = async (userIds = []) => {
  if (!userIds.length) return {}
  const { data, error } = await supabase
    .from('users')
    .select(USER_FIELDS)
    .in('id', userIds)

  if (error) {
    console.error('❌ Failed to fetch users for wallets:', error)
    throw error
  }

  return (data || []).reduce((acc, user) => {
    acc[user.id] = user
    return acc
  }, {})
}

const tokenManagementService = {
  async fetchLevels() {
    const { data, error } = await supabase
      .from('levels')
      .select('id, name, display_name, description, tier_level, is_active')
      .order('tier_level', { ascending: true })

    if (error) {
      console.error('❌ Failed to fetch levels:', error)
      throw error
    }

    return data || []
  },

  async fetchLevelPolicies() {
    const { data, error } = await supabase
      .from('level_token_policies')
      .select(`
        *,
        level:levels (
          id,
          name,
          display_name,
          description,
          tier_level
        )
      `)
      .order('priority_weight', { ascending: true })
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('❌ Failed to fetch level policies:', error)
      throw error
    }

    return (data || []).map(normalizePolicy)
  },

  async upsertLevelPolicy(policy) {
    if (!policy?.levelId) {
      throw new Error('Level ID is required')
    }

    const payload = {
      id: policy.id || undefined,
      level_id: policy.levelId,
      base_allocation: Number(policy.baseAllocation ?? 0),
      monthly_cap: policy.monthlyCap != null ? Number(policy.monthlyCap) : null,
      monthly_allocation: policy.monthlyAllocation != null ? Number(policy.monthlyAllocation) : null,
      allocation_mode: policy.allocationMode ?? 'lifetime',
      rollover_percent: Number(policy.rolloverPercent ?? 0),
      enforcement_mode: policy.enforcementMode ?? 'monitor',
      priority_weight: Number(policy.priorityWeight ?? 1),
      allow_manual_override: policy.allowManualOverride ?? true,
      notes: policy.notes ?? null,
      metadata: policy.metadata ?? {}
    }

    const { data, error } = await supabase
      .from('level_token_policies')
      .upsert([payload], { onConflict: 'level_id' })
      .select(`
        *,
        level:levels (
          id,
          name,
          display_name,
          description,
          tier_level
        )
      `)
      .single()

    if (error) {
      console.error('❌ Failed to upsert level policy:', error)
      throw error
    }

    return normalizePolicy(data)
  },

  async fetchUserWallets({ levelId = null, status = null, limit = 100, search = '' } = {}) {
    const { data, error } = await supabase
      .from('user_token_wallets')
      .select(`
        *,
        level:levels (
          id,
          name,
          display_name,
          description,
          tier_level
        )
      `)
      .order('current_tokens', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('❌ Failed to fetch token wallets:', error)
      throw error
    }

    let rows = data || []

    if (levelId) {
      rows = rows.filter(row => row.level_id === levelId)
    }

    if (status && status !== 'all') {
      rows = rows.filter(row => row.status === status)
    }

    const userIds = Array.from(new Set(rows.map(row => row.user_id).filter(Boolean)))
    const usersById = await fetchUsersByIds(userIds)

    const wallets = rows.map(row => {
      const wallet = normalizeWallet(row)
      wallet.user = usersById[wallet.userId] || null
      return wallet
    })

    if (search) {
      const lowered = search.toLowerCase()
      return wallets.filter(wallet => {
        const email = wallet.user?.email?.toLowerCase() || ''
        const username = wallet.user?.username?.toLowerCase() || ''
        const fullName = wallet.user?.full_name?.toLowerCase() || ''
        return email.includes(lowered) || username.includes(lowered) || fullName.includes(lowered)
      })
    }

    return wallets
  },

  async fetchWalletByUser(userId) {
    const { data, error } = await supabase
      .from('user_token_wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('❌ Failed to fetch wallet by user:', error)
      throw error
    }

    if (!data) return null

    const wallet = normalizeWallet(data)

    if (wallet.userId) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(USER_FIELDS)
        .eq('id', wallet.userId)
        .maybeSingle()

      if (userError) {
        console.error('❌ Failed to fetch user for wallet:', userError)
      } else {
        wallet.user = userData || null
      }
    }

    return wallet
  },

  async fetchLedgerEntries(userId, limit = 50) {
    if (!userId) {
      throw new Error('User ID required for ledger query')
    }

    const { data, error } = await supabase
      .from('user_token_ledger')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('❌ Failed to fetch ledger entries:', error)
      throw error
    }

    return (data || []).map(normalizeLedgerEntry)
  },

  /**
   * Calculate actual execution token usage from ledger
   * Only counts debits from workflow executions (source='worker' AND reason='workflow_execution*')
   * This is the TRUE source of truth for "tokens used"
   */
  async getExecutionTokenUsage(userId) {
    if (!userId) {
      return 0
    }

    const { data, error } = await supabase
      .from('user_token_ledger')
      .select('amount, reason')
      .eq('user_id', userId)
      .eq('direction', 'debit')
      .eq('source', 'worker')

    if (error) {
      console.error('❌ Failed to fetch execution token usage:', error)
      return 0
    }

    // Filter for execution-related reasons only
    const executionEntries = (data || []).filter(entry => {
      const reason = entry.reason || ''
      return reason === 'workflow_execution' || 
             reason === 'workflow_execution_failed' ||
             reason.startsWith('workflow_execution')
    })

    return executionEntries.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0)
  },

  async adjustUserTokens({
    userId,
    amount,
    changeType,
    reason,
    metadata = {},
    levelId = null,
    source = 'manual',
    referenceType = null,
    referenceId = null,
    executionId = null
  }) {
    if (!userId) {
      throw new Error('User ID is required')
    }
    if (!amount || amount === 0) {
      throw new Error('Amount must be non-zero')
    }
    if (!changeType) {
      throw new Error('Change type is required')
    }

    const payload = {
      p_user_id: userId,
      p_amount: Number(amount),
      p_change_type: changeType,
      p_reason: reason ?? null,
      p_metadata: metadata,
      p_level_id: levelId,
      p_source: source,
      p_reference_type: referenceType,
      p_reference_id: referenceId,
      p_execution_id: executionId
    }

    const { data, error } = await supabase.rpc('adjust_user_tokens', payload)

    if (error) {
      console.error('❌ adjust_user_tokens failed:', error)
      throw error
    }

    return normalizeLedgerEntry(data)
  },

  async ensureWalletForUser(userId, levelId = null) {
    try {
      const existing = await this.fetchWalletByUser(userId)
      if (existing) {
        if (levelId && existing.levelId !== levelId) {
          return await this.updateWalletLevel(existing.id, levelId)
        }
        return existing
      }

      const { error } = await supabase
        .from('user_token_wallets')
        .insert({
          user_id: userId,
          level_id: levelId
        })

      if (error) {
        throw error
      }

      const newWallet = await this.fetchWalletByUser(userId)
      
      // Auto-allocate tokens based on level policy
      if (levelId && newWallet) {
        await this.autoAllocateTokensForLevel(userId, levelId)
        return this.fetchWalletByUser(userId)
      }

      return newWallet
    } catch (error) {
      console.error('❌ Failed to ensure wallet for user:', error)
      throw error
    }
  },

  async updateWalletLevel(walletId, levelId) {
    if (!walletId) throw new Error('Wallet ID required')

    const { data, error } = await supabase
      .from('user_token_wallets')
      .update({
        level_id: levelId,
        updated_at: new Date().toISOString()
      })
      .eq('id', walletId)
      .select('*')
      .maybeSingle()

    if (error) {
      console.error('❌ Failed to update wallet level:', error)
      throw error
    }

    if (!data) return null

    const baseWallet = normalizeWallet(data)
    if (!baseWallet.userId) {
      return null
    }

    // Auto-allocate tokens based on new level policy
    if (levelId) {
      await this.autoAllocateTokensForLevel(baseWallet.userId, levelId)
    }

    return this.fetchWalletByUser(baseWallet.userId)
  },

  async autoAllocateTokensForLevel(userId, levelId) {
    try {
      // Get current wallet to check if it's empty
      const wallet = await this.fetchWalletByUser(userId)
      if (!wallet) {
        return // Wallet doesn't exist yet
      }

      // Only auto-allocate if wallet is empty (no tokens allocated yet)
      const hasLifetimeTokens = (wallet.lifetimeTokens || 0) > 0
      const hasMonthlyTokens = (wallet.monthlyAllocationTokens || 0) > 0
      if (hasLifetimeTokens || hasMonthlyTokens) {
        return // Wallet already has tokens, don't auto-allocate
      }

      // Get level policy
      const { data: levelPolicy, error: policyError } = await supabase
        .from('level_token_policies')
        .select('*')
        .eq('level_id', levelId)
        .maybeSingle()

      if (policyError) {
        console.error('❌ Failed to fetch level policy for auto-allocation:', policyError)
        return // Don't throw - level might not have a policy yet
      }

      if (!levelPolicy) {
        return // No policy, nothing to allocate
      }

      const allocationMode = levelPolicy.allocation_mode || 'lifetime'
      const baseAllocation = Number(levelPolicy.base_allocation || 0)
      const monthlyAllocation = Number(levelPolicy.monthly_allocation || 0)

      // Only auto-allocate if there's an allocation amount
      if (allocationMode === 'lifetime' && baseAllocation > 0) {
        // Credit lifetime tokens
        await this.adjustUserTokens({
          userId,
          amount: baseAllocation,
          changeType: 'credit',
          reason: 'level_assignment_auto_allocation',
          source: 'system',
          levelId,
          metadata: { levelId, allocationMode: 'lifetime' }
        })
      } else if (allocationMode === 'monthly' && monthlyAllocation > 0) {
        // Credit monthly allocation tokens
        await this.adjustUserTokens({
          userId,
          amount: monthlyAllocation,
          changeType: 'credit',
          reason: 'level_assignment_auto_allocation',
          source: 'system',
          levelId,
          metadata: { levelId, allocationMode: 'monthly' }
        })
      }
    } catch (error) {
      console.error('❌ Failed to auto-allocate tokens for level:', error)
      // Don't throw - this is a convenience feature, not critical
    }
  },

  async searchUsers(query = '', limit = 10) {
    try {
      let searchQuery = supabase
        .from('users')
        .select(USER_FIELDS)
        .limit(limit)
        .order('created_at', { ascending: false })

      if (query) {
        const like = `%${query}%`
        searchQuery = searchQuery.or(
          `email.ilike.${like},username.ilike.${like},full_name.ilike.${like}`
        )
      }

      const { data: users, error } = await searchQuery

      if (error) {
        throw error
      }

      const userIds = (users || []).map(user => user.id)
      const { data: walletRows, error: walletError } = userIds.length
        ? await supabase
            .from('user_token_wallets')
            .select('*')
            .in('user_id', userIds)
        : { data: [], error: null }

      if (walletError) {
        throw walletError
      }

      const walletsByUser = (walletRows || []).reduce((acc, row) => {
        acc[row.user_id] = normalizeWallet(row)
        return acc
      }, {})

      return (users || []).map(user => {
        const wallet = walletsByUser[user.id] || null
        if (wallet && !wallet.user) {
          wallet.user = user
        }
        return {
          ...user,
          hasWallet: Boolean(wallet),
          wallet
        }
      })
    } catch (error) {
      console.error('❌ Failed to search users for wallets:', error)
      throw error
    }
  },

  async fetchUserPolicy(userId, levelId = null) {
    if (!userId) throw new Error('User ID is required to fetch policy')

    const {
      data: userPolicyRow,
      error: userPolicyError,
      status: userPolicyStatus
    } = await supabase
      .from('user_token_policies')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (userPolicyError) {
      const notFound =
        userPolicyStatus === 404 ||
        userPolicyError.code === 'PGRST116' ||
        userPolicyError.code === 'PGRST302'

      if (notFound) {
        console.warn('⚠️ No user-level token policy found; falling back to level policy', {
          userId,
          levelId
        })
      } else {
        console.error('❌ Failed to fetch user token policy:', userPolicyError)
        throw userPolicyError
      }
    }

    const effectiveLevelId = levelId || userPolicyRow?.level_id || null

    let levelPolicy = null
    if (effectiveLevelId) {
      const { data: levelPolicyRow, error: levelPolicyError } = await supabase
        .from('level_token_policies')
        .select('*')
        .eq('level_id', effectiveLevelId)
        .maybeSingle()

      if (levelPolicyError) {
        console.error('❌ Failed to fetch inherited level policy:', levelPolicyError)
        throw levelPolicyError
      }

      levelPolicy = normalizePolicy(levelPolicyRow)
    }

    return {
      userPolicy: normalizeUserPolicy(userPolicyRow),
      levelPolicy
    }
  },

  async upsertUserPolicy(policy) {
    if (!policy?.userId) throw new Error('userId is required for user policy upsert')

    const payload = {
      user_id: policy.userId,
      level_id: policy.levelId || null,
      base_allocation: Number(policy.baseAllocation ?? 0),
      monthly_cap: policy.monthlyCap == null || policy.monthlyCap === '' ? null : Number(policy.monthlyCap),
      monthly_allocation: policy.monthlyAllocation == null || policy.monthlyAllocation === '' ? null : Number(policy.monthlyAllocation),
      allocation_mode: policy.allocationMode || null,
      rollover_percent: Number(policy.rolloverPercent ?? 0),
      enforcement_mode: policy.enforcementMode || 'monitor',
      priority_weight: Number(policy.priorityWeight ?? 10),
      allow_manual_override: policy.allowManualOverride !== false,
      notes: policy.notes || null,
      metadata: policy.metadata || {}
    }

    const { data, error } = await supabase
      .from('user_token_policies')
      .upsert([payload], { onConflict: 'user_id' })
      .select('*')
      .single()

    if (error) {
      console.error('❌ Failed to upsert user token policy:', error)
      throw error
    }

    return normalizeUserPolicy(data)
  },

  async removeUserPolicy(userId) {
    if (!userId) throw new Error('userId is required to remove policy')

    const { error } = await supabase
      .from('user_token_policies')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('❌ Failed to remove user token policy:', error)
      throw error
    }

    return true
  },

  async resetMonthlyTokenAllocation(userId = null) {
    const { data, error } = await supabase.rpc('reset_monthly_token_allocation', {
      p_user_id: userId
    })

    if (error) {
      console.error('❌ Failed to reset monthly token allocation:', error)
      throw error
    }

    return data
  },

  notifySuccess(message) {
    toast.success(message)
  },

  notifyError(error) {
    if (!error) return
    const message = typeof error === 'string' ? error : error.message || 'Operation failed'
    toast.error(message)
  }
};

export default tokenManagementService;
