import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Layers,
  Zap,
  Shield, 
  Edit,
  Plus,
  RefreshCw,
  Users,
  Coins,
  LineChart,
  Search,
  Activity,
  ArrowUpRight,
  X,
  UserPlus,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import UltraCard from '../UltraCard'
import UltraButton from '../UltraButton'
import UltraInput from '../UltraInput'
import UltraLoader from '../UltraLoader'
import tokenManagementService from '../../services/tokenManagementService'

const enforcementModes = [
  { value: 'monitor', label: 'Monitor (no block)' },
  { value: 'warn', label: 'Warn at limits' },
  { value: 'hard', label: 'Hard stop' }
]

const walletStatuses = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'locked', label: 'Locked' },
  { value: 'suspended', label: 'Suspended' }
]

const limits = [25, 50, 100, 250]

const formatNumber = (value = 0) => {
  if (value == null) return '0'
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return Number(value).toLocaleString()
}

const formatDateTime = (value) => {
  if (!value) return '—'
  try {
    const date = new Date(value)
    return `${date.toLocaleDateString()} · ${date.toLocaleTimeString()}`
  } catch (_error) {
    return value
  }
}

const buildPersonalPolicyFormState = (overridePolicy, fallbackPolicy) => {
  const resolvedFallback = fallbackPolicy || {}
  const resolvedOverride = overridePolicy || {}

  const baseAllocation =
    resolvedOverride.baseAllocation != null
      ? String(resolvedOverride.baseAllocation)
      : resolvedFallback.baseAllocation != null
        ? String(resolvedFallback.baseAllocation)
        : '0'

  const monthlyCap =
    resolvedOverride.monthlyCap != null
      ? String(resolvedOverride.monthlyCap)
      : resolvedFallback.monthlyCap != null
        ? String(resolvedFallback.monthlyCap)
        : ''

  const rolloverPercent =
    resolvedOverride.rolloverPercent != null
      ? String(resolvedOverride.rolloverPercent)
      : resolvedFallback.rolloverPercent != null
        ? String(resolvedFallback.rolloverPercent)
        : '0'

  const allocationMode =
    resolvedOverride.allocationMode != null
      ? resolvedOverride.allocationMode
      : resolvedFallback.allocationMode != null
        ? resolvedFallback.allocationMode
        : 'lifetime'

  const monthlyAllocation =
    resolvedOverride.monthlyAllocation != null
      ? String(resolvedOverride.monthlyAllocation)
      : resolvedFallback.monthlyAllocation != null
        ? String(resolvedFallback.monthlyAllocation)
        : ''

  return {
    baseAllocation,
    monthlyCap,
    monthlyAllocation,
    allocationMode,
    rolloverPercent,
    enforcementMode: resolvedOverride.enforcementMode || resolvedFallback.enforcementMode || 'monitor',
    allowManualOverride:
      resolvedOverride.allowManualOverride ??
      resolvedFallback.allowManualOverride ??
      true,
    notes: resolvedOverride.notes || ''
  }
}

const TokenManagement = () => {
  const [levels, setLevels] = useState([])
  const [policies, setPolicies] = useState([])
  const [policyLoading, setPolicyLoading] = useState(true)

  const [wallets, setWallets] = useState([])
  const [walletLoading, setWalletLoading] = useState(true)
  const [walletFilters, setWalletFilters] = useState({
    levelId: 'all',
    status: 'all',
    limit: 50,
    search: ''
  })

  const [selectedWallet, setSelectedWallet] = useState(null)
  const [ledgerEntries, setLedgerEntries] = useState([])
  const [ledgerLoading, setLedgerLoading] = useState(false)
  const [userPolicy, setUserPolicy] = useState(null)
  const [inheritedPolicy, setInheritedPolicy] = useState(null)
  const [userPolicyForm, setUserPolicyForm] = useState(buildPersonalPolicyFormState(null, null))
  const [userPolicyLoading, setUserPolicyLoading] = useState(false)
  const [userPolicySaving, setUserPolicySaving] = useState(false)
  const [userPolicyRemoving, setUserPolicyRemoving] = useState(false)

  const [policyModalOpen, setPolicyModalOpen] = useState(false)
  const [policyForm, setPolicyForm] = useState(null)

  const [adjustModalOpen, setAdjustModalOpen] = useState(false)
  const [adjustForm, setAdjustForm] = useState({
    changeType: 'credit',
    amount: '',
    reason: '',
    metadataNote: ''
  })

  const [ensureModalOpen, setEnsureModalOpen] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [userSearchResults, setUserSearchResults] = useState([])
  const [userSearchLoading, setUserSearchLoading] = useState(false)
  const [ensuringUserId, setEnsuringUserId] = useState(null)

  const levelMap = useMemo(() => {
    const map = new Map()
    levels.forEach((lvl) => map.set(lvl.id, lvl))
    return map
  }, [levels])

  useEffect(() => {
    loadSeedData()
  }, [])

  useEffect(() => {
    if (!policyLoading) {
      loadPolicies()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadWallets(walletFilters)
    }, walletFilters.search ? 300 : 0)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletFilters.levelId, walletFilters.status, walletFilters.limit, walletFilters.search])

  useEffect(() => {
    if (!ensureModalOpen) {
      return
    }

    const timer = setTimeout(() => {
      handleUserSearch(userSearchQuery)
    }, 250)

    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ensureModalOpen, userSearchQuery])

  const loadSeedData = async () => {
    try {
      setPolicyLoading(true)
      const [levelRows, policyRows] = await Promise.all([
        tokenManagementService.fetchLevels(),
        tokenManagementService.fetchLevelPolicies()
      ])
      setLevels(levelRows)
      setPolicies(policyRows)
    } catch (error) {
      console.error('Failed to load token management seed data:', error)
      toast.error(error.message || 'Failed to load token management data')
    } finally {
      setPolicyLoading(false)
    }
  }

  const loadPolicies = async () => {
    try {
      const data = await tokenManagementService.fetchLevelPolicies()
      setPolicies(data)
    } catch (error) {
      console.error('Failed to refresh level policies:', error)
      toast.error(error.message || 'Failed to refresh level policies')
    }
  }

  const loadWallets = async (filters) => {
    try {
      setWalletLoading(true)
      const data = await tokenManagementService.fetchUserWallets({
        levelId: filters.levelId !== 'all' ? filters.levelId : null,
        status: filters.status !== 'all' ? filters.status : null,
        limit: filters.limit,
        search: filters.search
      })
      setWallets(data)
      if (selectedWallet) {
        const updated = data.find((wallet) => wallet.userId === selectedWallet.userId)
        if (updated) {
          setSelectedWallet(updated)
          await loadUserPolicyForWallet(updated)
        }
      }
    } catch (error) {
      console.error('Failed to load token wallets:', error)
      toast.error(error.message || 'Failed to load token wallets')
    } finally {
      setWalletLoading(false)
    }
  }

  const loadUserPolicyForWallet = async (wallet) => {
    if (!wallet?.userId) {
      setUserPolicy(null)
      setInheritedPolicy(null)
      setUserPolicyForm(buildPersonalPolicyFormState(null, null))
      return
    }

    try {
      setUserPolicyLoading(true)
      const { userPolicy: personalPolicy, levelPolicy } = await tokenManagementService.fetchUserPolicy(
        wallet.userId,
        wallet.levelId || null
      )
      setUserPolicy(personalPolicy)
      setInheritedPolicy(levelPolicy)
      setUserPolicyForm(buildPersonalPolicyFormState(personalPolicy, levelPolicy))
    } catch (error) {
      console.error('Failed to load personal token policy:', error)
      toast.error(error.message || 'Failed to load personal policy')
    } finally {
      setUserPolicyLoading(false)
    }
  }

  const loadLedgerEntries = async (wallet) => {
    if (!wallet?.userId) {
      setLedgerEntries([])
      return
    }
    try {
      setLedgerLoading(true)
      const entries = await tokenManagementService.fetchLedgerEntries(wallet.userId, 40)
      setLedgerEntries(entries)
    } catch (error) {
      console.error('Failed to fetch ledger entries:', error)
      toast.error(error.message || 'Failed to fetch ledger history')
    } finally {
      setLedgerLoading(false)
    }
  }

  const handleUserSearch = async (query) => {
    try {
      setUserSearchLoading(true)
      const results = await tokenManagementService.searchUsers(query || '')
      setUserSearchResults(results)
    } catch (error) {
      console.error('Failed to search users:', error)
      toast.error(error.message || 'Failed to search users')
    } finally {
      setUserSearchLoading(false)
    }
  }

  const openEnsureWalletModal = () => {
    setUserSearchQuery('')
    setUserSearchResults([])
    setEnsureModalOpen(true)
    handleUserSearch('')
  }

  const closeEnsureWalletModal = () => {
    setEnsureModalOpen(false)
    setUserSearchResults([])
    setEnsuringUserId(null)
  }

  const handleEnsureWallet = async (user) => {
    try {
      setEnsuringUserId(user.id)
      await tokenManagementService.ensureWalletForUser(user.id, user.level_id || null)

      await loadWallets(walletFilters)
      const freshWallet = await tokenManagementService.fetchWalletByUser(user.id)

      if (!freshWallet) {
        throw new Error('Wallet creation failed')
      }

      setSelectedWallet(freshWallet)
      await loadLedgerEntries(freshWallet)
      await loadUserPolicyForWallet(freshWallet)
      toast.success(`Wallet ready for ${user.email || user.username || 'user'}`)
      closeEnsureWalletModal()
    } catch (error) {
      console.error('Failed to ensure wallet:', error)
      toast.error(error.message || 'Failed to create wallet')
    } finally {
      setEnsuringUserId(null)
    }
  }

  const handleOpenWalletFromSearch = async (user) => {
    try {
      const wallet = user.wallet || (await tokenManagementService.fetchWalletByUser(user.id))
      if (!wallet) {
        toast.error('Wallet not found for this user')
        return
      }

      await loadWallets(walletFilters)
      setSelectedWallet(wallet)
      await loadLedgerEntries(wallet)
      await loadUserPolicyForWallet(wallet)
      closeEnsureWalletModal()
    } catch (error) {
      console.error('Failed to open wallet:', error)
      toast.error(error.message || 'Failed to open wallet')
    }
  }

  const openPolicyModal = (policy) => {
    const levelOptions = policy?.levelId ? [] : levels.filter((lvl) => !policies.some((p) => p.levelId === lvl.id))
    const initial = {
      id: policy?.id ?? null,
      levelId: policy?.levelId ?? levelOptions[0]?.id ?? levels[0]?.id ?? null,
      baseAllocation: policy?.baseAllocation ?? 0,
      monthlyCap: policy?.monthlyCap ?? '',
      monthlyAllocation: policy?.monthlyAllocation ?? '',
      allocationMode: policy?.allocationMode ?? 'lifetime',
      rolloverPercent: policy?.rolloverPercent ?? 0,
      enforcementMode: policy?.enforcementMode ?? 'monitor',
      priorityWeight: policy?.priorityWeight ?? 1,
      allowManualOverride: policy?.allowManualOverride ?? true,
      notes: policy?.notes ?? ''
    }
    setPolicyForm(initial)
    setPolicyModalOpen(true)
  }

  const handlePolicyChange = (field, value) => {
    setPolicyForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const savePolicy = async () => {
    try {
      const payload = {
        ...policyForm,
        monthlyCap: policyForm.monthlyCap === '' ? null : Number(policyForm.monthlyCap),
        monthlyAllocation: policyForm.monthlyAllocation === '' ? null : Number(policyForm.monthlyAllocation),
        allocationMode: policyForm.allocationMode || 'lifetime'
      }
      const saved = await tokenManagementService.upsertLevelPolicy(payload)
      setPolicies((prev) => {
        const existingIndex = prev.findIndex((item) => item.levelId === saved.levelId)
        if (existingIndex >= 0) {
          const next = [...prev]
          next[existingIndex] = saved
          return next
        }
        return [...prev, saved]
      })
      toast.success('Level policy updated')
      setPolicyModalOpen(false)
    } catch (error) {
      console.error('Failed to save level policy:', error)
      toast.error(error.message || 'Failed to save policy')
    }
  }

  const handleSelectWallet = async (wallet) => {
    setSelectedWallet(wallet)
    await loadLedgerEntries(wallet)
    await loadUserPolicyForWallet(wallet)
  }

  const clearSelectedWallet = () => {
    setSelectedWallet(null)
    setLedgerEntries([])
    setUserPolicy(null)
    setInheritedPolicy(null)
    setUserPolicyForm(buildPersonalPolicyFormState(null, null))
  }

  const handleUserPolicyFieldChange = (field, value) => {
    setUserPolicyForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const toggleAllowManualOverride = () => {
    setUserPolicyForm((prev) => ({
      ...prev,
      allowManualOverride: !prev.allowManualOverride
    }))
  }

  const handleSavePersonalPolicy = async () => {
    if (!selectedWallet) {
      toast.error('Select a wallet first')
      return
    }

    try {
      setUserPolicySaving(true)
      const payload = {
        userId: selectedWallet.userId,
        levelId: selectedWallet.levelId,
        baseAllocation: userPolicyForm.baseAllocation === '' ? 0 : Number(userPolicyForm.baseAllocation),
        monthlyCap: userPolicyForm.monthlyCap === '' ? null : Number(userPolicyForm.monthlyCap),
        monthlyAllocation: userPolicyForm.monthlyAllocation === '' ? null : Number(userPolicyForm.monthlyAllocation),
        allocationMode: userPolicyForm.allocationMode || null,
        rolloverPercent: userPolicyForm.rolloverPercent === '' ? 0 : Number(userPolicyForm.rolloverPercent),
        enforcementMode: userPolicyForm.enforcementMode,
        allowManualOverride: userPolicyForm.allowManualOverride,
        notes: userPolicyForm.notes
      }

      const saved = await tokenManagementService.upsertUserPolicy(payload)
      setUserPolicy(saved)
      setUserPolicyForm(buildPersonalPolicyFormState(saved, inheritedPolicy))
      toast.success('Personal policy saved')
    } catch (error) {
      console.error('Failed to save personal policy:', error)
      toast.error(error.message || 'Failed to save personal policy')
    } finally {
      setUserPolicySaving(false)
    }
  }

  const handleRemovePersonalPolicy = async () => {
    if (!selectedWallet) {
      toast.error('Select a wallet first')
      return
    }

    try {
      setUserPolicyRemoving(true)
      await tokenManagementService.removeUserPolicy(selectedWallet.userId)
      setUserPolicy(null)
      setUserPolicyForm(buildPersonalPolicyFormState(null, inheritedPolicy))
      toast.success('Personal policy removed. Using level defaults.')
    } catch (error) {
      console.error('Failed to remove personal policy:', error)
      toast.error(error.message || 'Failed to remove personal policy')
    } finally {
      setUserPolicyRemoving(false)
    }
  }

  useEffect(() => {
    if (!selectedWallet) {
      setUserPolicy(null)
      setInheritedPolicy(null)
      setUserPolicyForm(buildPersonalPolicyFormState(null, null))
    }
  }, [selectedWallet])

  const openAdjustModal = () => {
    if (!selectedWallet) {
      toast.error('Select a wallet first')
      return
    }
    setAdjustForm({
      changeType: 'credit',
      amount: '',
      reason: '',
      metadataNote: ''
    })
    setAdjustModalOpen(true)
  }

  const performAdjustment = async () => {
    try {
      if (!selectedWallet) {
        throw new Error('No wallet selected')
      }
      const amount = Number(adjustForm.amount)
      if (!amount || Number.isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be a positive number')
      }

      await tokenManagementService.adjustUserTokens({
        userId: selectedWallet.userId,
        levelId: selectedWallet.levelId,
        amount,
        changeType: adjustForm.changeType,
        reason: adjustForm.reason,
        metadata: adjustForm.metadataNote ? { note: adjustForm.metadataNote } : {},
        source: 'superadmin'
      })

      const refreshedWallet = await tokenManagementService.fetchWalletByUser(selectedWallet.userId)
      setSelectedWallet(refreshedWallet)
      await loadWallets(walletFilters)
      await loadLedgerEntries(refreshedWallet)
      toast.success('Token adjustment applied')
      setAdjustModalOpen(false)
    } catch (error) {
      console.error('Token adjustment failed:', error)
      toast.error(error.message || 'Failed to adjust tokens')
    }
  }

  const policyStats = useMemo(() => {
    return policies.reduce(
      (acc, policy) => {
        acc.totalBase += Number(policy.baseAllocation ?? 0)
        if (policy.monthlyCap) acc.totalCaps += Number(policy.monthlyCap)
        if (policy.enforcementMode === 'hard') acc.hardCount += 1
        if (policy.enforcementMode === 'warn') acc.warnCount += 1
        acc.totalPolicies += 1
        return acc
      },
      { totalPolicies: 0, totalBase: 0, totalCaps: 0, hardCount: 0, warnCount: 0 }
    )
  }, [policies])

  const walletStats = useMemo(() => {
    return wallets.reduce(
      (acc, wallet) => {
        acc.totalWallets += 1
        acc.activeWallets += wallet.status === 'active' ? 1 : 0
        // currentTokens = tokens spent/used (from execution debits)
        acc.totalUsed += Number(wallet.currentTokens ?? 0)
        acc.totalReserved += Number(wallet.reservedTokens ?? 0)
        // lifetimeTokens = total allocated (from credits)
        acc.totalAllocated += Number(wallet.lifetimeTokens ?? 0)
        return acc
      },
      { totalWallets: 0, activeWallets: 0, totalUsed: 0, totalReserved: 0, totalAllocated: 0 }
    )
  }, [wallets])

  const effectivePolicy = useMemo(() => {
    return userPolicy || inheritedPolicy || null
  }, [userPolicy, inheritedPolicy])

  const effectivePolicySource = useMemo(() => {
    if (userPolicy) return 'Personal Override'
    if (inheritedPolicy) return 'Level Policy'
    return 'No Active Policy'
  }, [userPolicy, inheritedPolicy])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Token Control Center</h1>
        <p className="text-sm text-gray-400 max-w-3xl">
          Surgical dashboard to define level policies, monitor balances, and apply manual adjustments with full audit trails.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <UltraCard className="p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Level Policies</p>
              <p className="text-2xl font-bold text-white">{policyStats.totalPolicies}</p>
            </div>
            <div className="p-3 bg-slate-700/40 rounded-xl">
              <Layers className="w-5 h-5 text-sky-300" />
            </div>
          </div>
          <p className="text-xs text-slate-400">
            {policyStats.hardCount} hard caps · {policyStats.warnCount} warning thresholds
          </p>
        </UltraCard>

        <UltraCard className="p-6 bg-gradient-to-br from-emerald-900/80 to-emerald-800/60 border border-emerald-700/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-200">Total Allocation</p>
              <p className="text-2xl font-bold text-white">{formatNumber(policyStats.totalBase)}</p>
            </div>
            <div className="p-3 bg-emerald-700/40 rounded-xl">
              <Zap className="w-5 h-5 text-emerald-200" />
            </div>
          </div>
          <p className="text-xs text-emerald-100">
            {policyStats.totalCaps ? `${formatNumber(policyStats.totalCaps)} monthly cap` : 'Unlimited monthly throughput'}
          </p>
        </UltraCard>

        <UltraCard className="p-6 bg-gradient-to-br from-blue-900/80 to-blue-800/60 border border-blue-700/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-200">Active Wallets</p>
              <p className="text-2xl font-bold text-white">{walletStats.activeWallets}</p>
            </div>
            <div className="p-3 bg-blue-700/40 rounded-xl">
              <Users className="w-5 h-5 text-blue-200" />
            </div>
          </div>
          <p className="text-xs text-blue-100">
            {walletStats.totalWallets} total wallets monitored
          </p>
        </UltraCard>

        <UltraCard className="p-6 bg-gradient-to-br from-amber-900/80 to-amber-800/60 border border-amber-700/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-amber-200">Total Allocated</p>
              <p className="text-2xl font-bold text-white">{formatNumber(walletStats.totalAllocated)}</p>
            </div>
            <div className="p-3 bg-amber-700/40 rounded-xl">
              <Coins className="w-5 h-5 text-amber-200" />
            </div>
          </div>
          <p className="text-xs text-amber-100">
            {formatNumber(walletStats.totalUsed)} spent · {formatNumber(Math.max(walletStats.totalAllocated - walletStats.totalUsed, 0))} available · {formatNumber(walletStats.totalReserved)} reserved
          </p>
        </UltraCard>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-sky-300" />
            Level Token Policies
          </h2>
          <p className="text-sm text-gray-400">Granular token guardrails per level with rollover and enforcement mode.</p>
        </div>
        <UltraButton
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => openPolicyModal(null)}
        >
          New Policy
        </UltraButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {policyLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <UltraLoader type="pulse" size="lg" />
          </div>
        ) : policies.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 border border-dashed border-slate-700 rounded-2xl bg-slate-900/60">
            <Layers className="w-10 h-10 text-slate-500 mb-3" />
            <p className="text-slate-300 font-medium mb-1">No policies yet</p>
            <p className="text-sm text-slate-500 mb-4">Seed baseline allocations to stay ahead of runaway usage.</p>
            <UltraButton variant="secondary" size="sm" icon={Plus} onClick={() => openPolicyModal(null)}>
              Create policy
            </UltraButton>
          </div>
        ) : (
          policies.map((policy) => {
            const level = levelMap.get(policy.levelId)
            return (
        <motion.div
                key={policy.id || policy.levelId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
              >
                <UltraCard className="p-6 h-full bg-slate-900/70 border border-slate-800 hover:border-sky-500/40 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {level?.display_name || level?.name || 'Unknown level'}
                      </p>
                      <p className="text-2xl font-semibold text-white mt-1">
                        {formatNumber(policy.baseAllocation)} tokens
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Priority weight {policy.priorityWeight}
                      </p>
                    </div>
                    <UltraButton
                      variant="subtle"
                      size="sm"
                      icon={Edit}
                      onClick={() => openPolicyModal(policy)}
                    >
                      Edit
                    </UltraButton>
                  </div>
                  <div className="space-y-3 text-sm text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>Monthly cap</span>
                      <span className="font-semibold">
                        {policy.monthlyCap ? formatNumber(policy.monthlyCap) : 'Unlimited'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Rollover</span>
                      <span className="font-semibold">{policy.rolloverPercent}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Enforcement</span>
                      <span className="font-semibold capitalize">{policy.enforcementMode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Manual override</span>
                      <span className={`font-semibold ${policy.allowManualOverride ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {policy.allowManualOverride ? 'Allowed' : 'Locked'}
                      </span>
                    </div>
                    {policy.notes && (
                      <p className="text-xs text-slate-400 border border-slate-800 rounded-lg p-2 bg-slate-900/80">
                        {policy.notes}
                      </p>
                    )}
                  </div>
                </UltraCard>
        </motion.div>
            )
          })
        )}
      </div>

              <div className="flex items-center justify-between">
                <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <LineChart className="w-5 h-5 text-emerald-300" />
            User Token Wallets
          </h2>
          <p className="text-sm text-gray-400">Real-time balances, reservations, and manual override controls.</p>
                </div>
        <div className="flex items-center gap-3">
          <UltraButton
            variant="secondary"
            size="sm"
            icon={UserPlus}
            onClick={openEnsureWalletModal}
          >
            Create Wallet
          </UltraButton>
          <UltraButton
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={() => loadWallets(walletFilters)}
          >
            Refresh
          </UltraButton>
          <UltraButton
            variant="primary"
            size="sm"
            icon={Activity}
            onClick={openAdjustModal}
          >
            Adjust Tokens
          </UltraButton>
              </div>
            </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <UltraCard className="p-0 col-span-2 bg-slate-900/70 border border-slate-800 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2 flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400" />
              <UltraInput
                value={walletFilters.search}
                onChange={(e) => setWalletFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Search by email, username, or name"
                size="sm"
              />
            </div>
            <select
              value={walletFilters.levelId}
              onChange={(e) => setWalletFilters((prev) => ({ ...prev, levelId: e.target.value }))}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
              <option value="all">All levels</option>
              {levels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.display_name || lvl.name}
                </option>
              ))}
            </select>
            <select
              value={walletFilters.status}
              onChange={(e) => setWalletFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {walletStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <select
              value={walletFilters.limit}
              onChange={(e) => setWalletFilters((prev) => ({ ...prev, limit: Number(e.target.value) }))}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {limits.map((limit) => (
                <option key={limit} value={limit}>
                  {limit} rows
                </option>
            ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-950/70">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Allocation</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Available</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Reserved</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Allocated</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-slate-900 divide-y divide-slate-800">
                {walletLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <UltraLoader type="pulse" size="md" />
                        <span className="text-sm">Loading wallets...</span>
                        </div>
                    </td>
                  </tr>
                ) : wallets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                      No wallets match your filters yet.
                    </td>
                  </tr>
                ) : (
                  wallets.map((wallet) => {
                    const level = wallet.level || levelMap.get(wallet.levelId)
                    const levelPolicy = policies.find((p) => p.levelId === wallet.levelId)
                    const allocationMode = levelPolicy?.allocationMode || 'lifetime'
                    const isSelected = selectedWallet?.id === wallet.id
                    return (
                      <tr
                        key={wallet.id}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-sky-900/40' : 'hover:bg-slate-800/40'}`}
                        onClick={() => handleSelectWallet(wallet)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-100">{wallet.user?.email || wallet.user?.username || wallet.userId}</div>
                          <div className="text-xs text-slate-400">
                            {wallet.user?.full_name ? `${wallet.user.full_name} · ` : ''}
                            ID {wallet.userId.slice(0, 8)}…
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {level?.display_name || level?.name || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                              allocationMode === 'monthly'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-purple-500/20 text-purple-300'
                            }`}
                          >
                            {allocationMode === 'monthly' ? 'Monthly' : 'Lifetime'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-emerald-300">
                          {formatNumber(Math.max((wallet.lifetimeTokens || 0) - (wallet.currentTokens || 0), 0))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-amber-300">
                          {formatNumber(wallet.reservedTokens)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-300">
                          {formatNumber(wallet.lifetimeTokens)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                              wallet.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : wallet.status === 'locked'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {wallet.status}
                        </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
                      </div>
        </UltraCard>

        <UltraCard className="p-0 bg-slate-900/70 border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Selected wallet</p>
              <p className="text-lg font-semibold text-white">
                {selectedWallet?.user?.email || selectedWallet?.user?.username || 'Pick a wallet'}
              </p>
                    </div>
            {selectedWallet && (
              <button
                onClick={clearSelectedWallet}
                className="text-slate-400 hover:text-slate-200 transition"
                aria-label="Clear selection"
              >
                <X className="w-5 h-5" />
              </button>
            )}
                </div>

          {selectedWallet ? (
            <div className="px-6 py-5 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-4">
                  <p className="text-xs uppercase text-slate-400">Available Tokens</p>
                  <p className="text-xl font-semibold text-emerald-300 mt-1">
                    {formatNumber(Math.max((selectedWallet.lifetimeTokens || 0) - (selectedWallet.currentTokens || 0), 0))}
                  </p>
                    </div>
                <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-4">
                  <p className="text-xs uppercase text-slate-400">Reserved</p>
                  <p className="text-xl font-semibold text-amber-300 mt-1">
                    {formatNumber(selectedWallet.reservedTokens)}
                  </p>
                    </div>
                <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-4">
                  <p className="text-xs uppercase text-slate-400">Total Allocated</p>
                  <p className="text-xl font-semibold text-slate-200 mt-1">
                    {formatNumber(selectedWallet.lifetimeTokens)}
                  </p>
                    </div>
                <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-4">
                  <p className="text-xs uppercase text-slate-400">Tokens Spent</p>
                  <p className="text-xl font-semibold text-rose-300 mt-1">
                    {formatNumber(selectedWallet.currentTokens)}
                  </p>
                    </div>
                <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-4">
                  <p className="text-xs uppercase text-slate-400">Borrowed</p>
                  <p className="text-xl font-semibold text-rose-300 mt-1">
                    {formatNumber(selectedWallet.borrowedTokens)}
                  </p>
                  </div>
                </div>

              <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/80">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase text-slate-400">Last reset</p>
                    <p className="text-sm text-slate-200">{formatDateTime(selectedWallet.lastResetAt)}</p>
              </div>
                  <div className="text-right">
                    <p className="text-xs uppercase text-slate-400">Next reset</p>
                    <p className="text-sm text-slate-200">{formatDateTime(selectedWallet.nextResetAt)}</p>
            </div>
                </div>
                <p className="text-xs text-slate-500">
                  Level enforcement:{' '}
                  <span className="font-semibold text-slate-200">
                    {policies.find((policy) => policy.levelId === selectedWallet.levelId)?.enforcementMode || 'monitor'}
                  </span>
                </p>
              </div>

              <div className="border border-slate-800 rounded-xl p-5 bg-slate-900/85 space-y-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      Personal Policy Override
                      {userPolicy && <CheckCircle className="w-4 h-4 text-emerald-300" />}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Customize token guardrails for this user. Leave values blank to inherit the level policy.
                    </p>
                  </div>
                  {userPolicy && (
                    <UltraButton
                      variant="ghost"
                      size="xs"
                      onClick={handleRemovePersonalPolicy}
                      loading={userPolicyRemoving}
                    >
                      Remove Override
                    </UltraButton>
                  )}
                </div>

                {userPolicyLoading ? (
                  <div className="flex justify-center py-6">
                    <UltraLoader type="pulse" size="md" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs uppercase text-slate-400 mb-1">Allocation Mode</label>
                        <select
                          className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          value={userPolicyForm.allocationMode || 'lifetime'}
                          onChange={(e) => handleUserPolicyFieldChange('allocationMode', e.target.value)}
                        >
                          <option value="">Inherit from level</option>
                          <option value="lifetime">Lifetime Tokens (Accumulated)</option>
                          <option value="monthly">Monthly Tokens (Resets Monthly)</option>
                        </select>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Inherited: {inheritedPolicy?.allocationMode || 'lifetime'}
                        </p>
                      </div>

                      {userPolicyForm.allocationMode === 'lifetime' || (!userPolicyForm.allocationMode && (inheritedPolicy?.allocationMode || 'lifetime') === 'lifetime') ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs uppercase text-slate-400 mb-1">Base allocation</label>
                            <UltraInput
                              type="number"
                              min="0"
                              value={userPolicyForm.baseAllocation}
                              onChange={(e) => handleUserPolicyFieldChange('baseAllocation', e.target.value)}
                              placeholder="Inherited"
                            />
                            <p className="text-[11px] text-slate-500 mt-1">
                              Inherited: {inheritedPolicy ? formatNumber(inheritedPolicy.baseAllocation) : '0'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs uppercase text-slate-400 mb-1">Monthly cap</label>
                            <UltraInput
                              type="number"
                              min="0"
                              value={userPolicyForm.monthlyCap}
                              onChange={(e) => handleUserPolicyFieldChange('monthlyCap', e.target.value)}
                              placeholder="Unlimited"
                            />
                            <p className="text-[11px] text-slate-500 mt-1">
                              Inherited:{' '}
                              {inheritedPolicy?.monthlyCap != null ? formatNumber(inheritedPolicy.monthlyCap) : 'Unlimited'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs uppercase text-slate-400 mb-1">Monthly allocation</label>
                          <UltraInput
                            type="number"
                            min="1"
                            value={userPolicyForm.monthlyAllocation}
                            onChange={(e) => handleUserPolicyFieldChange('monthlyAllocation', e.target.value)}
                            placeholder="Inherited"
                          />
                          <p className="text-[11px] text-slate-500 mt-1">
                            Inherited: {inheritedPolicy?.monthlyAllocation ? formatNumber(inheritedPolicy.monthlyAllocation) : 'Not set'}
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs uppercase text-slate-400 mb-1">Rollover %</label>
                        <UltraInput
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={userPolicyForm.rolloverPercent}
                          onChange={(e) => handleUserPolicyFieldChange('rolloverPercent', e.target.value)}
                          placeholder="0"
                        />
                        <p className="text-[11px] text-slate-500 mt-1">
                          Inherited: {inheritedPolicy ? `${inheritedPolicy.rolloverPercent}%` : '0%'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs uppercase text-slate-400 mb-1">Enforcement mode</label>
                        <select
                          className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          value={userPolicyForm.enforcementMode}
                          onChange={(e) => handleUserPolicyFieldChange('enforcementMode', e.target.value)}
                        >
                          {enforcementModes.map((mode) => (
                            <option key={mode.value} value={mode.value}>
                              {mode.label}
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Inherited:{' '}
                          {inheritedPolicy?.enforcementMode
                            ? enforcementModes.find((mode) => mode.value === inheritedPolicy.enforcementMode)?.label ||
                              inheritedPolicy.enforcementMode
                            : 'Monitor'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-3">
                <button
                          type="button"
                          onClick={toggleAllowManualOverride}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            userPolicyForm.allowManualOverride ? 'bg-emerald-500/60' : 'bg-slate-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                              userPolicyForm.allowManualOverride ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                </button>
                        <div>
                          <p className="text-sm font-medium text-slate-200">
                            Manual credits {userPolicyForm.allowManualOverride ? 'allowed' : 'locked'}
                          </p>
                          <p className="text-xs text-slate-500">
                            Inherited:{' '}
                            {inheritedPolicy
                              ? inheritedPolicy.allowManualOverride
                                ? 'Allowed'
                                : 'Locked'
                              : 'Allowed'}
                          </p>
                        </div>
                      </div>
                      <UltraButton
                        variant="primary"
                        size="sm"
                        onClick={handleSavePersonalPolicy}
                        loading={userPolicySaving}
                      >
                        Save Personal Policy
                      </UltraButton>
              </div>

                          <div>
                      <label className="block text-xs uppercase text-slate-400 mb-1">Notes</label>
                      <textarea
                        className="w-full min-h-[72px] bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                        value={userPolicyForm.notes}
                        onChange={(e) => handleUserPolicyFieldChange('notes', e.target.value)}
                        placeholder="Optional context for this override"
                      />
                          </div>

                    <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/60">
                      <p className="text-xs uppercase text-slate-400 mb-2">Effective enforcement</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Source</span>
                          <span className="text-slate-200 font-semibold">{effectivePolicySource}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Total allocated</span>
                          <span className="text-slate-200 font-semibold">
                            {formatNumber(selectedWallet.lifetimeTokens || 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Tokens spent</span>
                          <span className="text-slate-200 font-semibold">
                            {formatNumber(selectedWallet.currentTokens || 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Available</span>
                          <span className="text-slate-200 font-semibold">
                            {formatNumber(Math.max((selectedWallet.lifetimeTokens || 0) - (selectedWallet.currentTokens || 0), 0))}
                          </span>
                        </div>
                        {effectivePolicy?.monthlyCap != null && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Monthly cap</span>
                            <span className="text-slate-200 font-semibold">
                              {formatNumber(effectivePolicy.monthlyCap)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Rollover</span>
                          <span className="text-slate-200 font-semibold">
                            {effectivePolicy?.rolloverPercent != null
                              ? `${effectivePolicy.rolloverPercent}%`
                              : '0%'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Enforcement</span>
                          <span className="text-slate-200 font-semibold capitalize">
                            {effectivePolicy?.enforcementMode || 'monitor'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Manual credits</span>
                          <span
                            className={`font-semibold ${
                              effectivePolicy?.allowManualOverride ?? true ? 'text-emerald-300' : 'text-rose-300'
                            }`}
                          >
                            {effectivePolicy?.allowManualOverride ?? true ? 'Allowed' : 'Locked'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

                          <div>
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  Ledger history
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </h3>
                <div className="max-h-72 overflow-y-auto pr-2 space-y-3">
                  {ledgerLoading ? (
                    <div className="flex justify-center py-4">
                      <UltraLoader type="pulse" size="sm" />
                          </div>
                  ) : ledgerEntries.length === 0 ? (
                    <p className="text-xs text-slate-500">No ledger entries yet.</p>
                  ) : (
                    ledgerEntries.map((entry) => (
                      <div key={entry.id} className="border border-slate-800 rounded-lg p-3 bg-slate-900/80">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className={`font-semibold capitalize ${entry.direction === 'debit' ? 'text-rose-300' : entry.direction === 'credit' ? 'text-emerald-300' : 'text-sky-300'}`}>
                            {entry.direction}
                          </span>
                          <span className="text-xs text-slate-500">{formatDateTime(entry.createdAt)}</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          <div>Amount: {formatNumber(entry.amount)}</div>
                          <div>Balance after: {formatNumber(entry.balanceAfter)}</div>
                          {entry.reason && <div className="mt-1 text-slate-300">Reason: {entry.reason}</div>}
                          {entry.metadata?.note && <div className="mt-1 italic text-slate-400">Note: {entry.metadata.note}</div>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-slate-400">
              Select a wallet to inspect balances and ledger history.
            </div>
          )}
        </UltraCard>
      </div>

      <AnimatePresence>
        {policyModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl p-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">{policyForm?.id ? 'Edit level policy' : 'Create level policy'}</h3>
                  <p className="text-sm text-slate-400">Define allocation, rollover, and enforcement mode for the selected level.</p>
                </div>
                            <button
                  onClick={() => setPolicyModalOpen(false)}
                  className="text-slate-400 hover:text-slate-200 transition"
                  aria-label="Close policy modal"
                            >
                  <X className="w-5 h-5" />
                            </button>
                          </div>

              {policyForm && (
                <div className="space-y-5">
                  {!policyForm.id && (
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">Level</label>
                      <select
                        value={policyForm.levelId || ''}
                        onChange={(e) => handlePolicyChange('levelId', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        {levels.map((lvl) => (
                          <option key={lvl.id} value={lvl.id}>
                            {lvl.display_name || lvl.name}
                          </option>
                        ))}
                      </select>
            </div>
          )}

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">Allocation Mode</label>
                    <select
                      value={policyForm.allocationMode}
                      onChange={(e) => handlePolicyChange('allocationMode', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="lifetime">Lifetime Tokens (Accumulated)</option>
                      <option value="monthly">Monthly Tokens (Resets Monthly)</option>
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {policyForm.allocationMode === 'lifetime' 
                        ? 'Tokens accumulate over time. Monthly cap limits spending per month.'
                        : 'Tokens reset monthly. Rollover applies to unused tokens.'}
                    </p>
                  </div>

                  {policyForm.allocationMode === 'lifetime' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">Base allocation</label>
                        <UltraInput
                          type="number"
                          value={policyForm.baseAllocation}
                          min={0}
                          onChange={(e) => handlePolicyChange('baseAllocation', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">Monthly cap</label>
                        <UltraInput
                          type="number"
                          value={policyForm.monthlyCap}
                          min={0}
                          onChange={(e) => handlePolicyChange('monthlyCap', e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="Unlimited"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">Monthly allocation</label>
                      <UltraInput
                        type="number"
                        value={policyForm.monthlyAllocation}
                        min={1}
                        onChange={(e) => handlePolicyChange('monthlyAllocation', e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="Tokens allocated each month"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Number of tokens allocated to users each month. Resets automatically.
                      </p>
                    </div>
                  )}
              
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">Rollover %</label>
                      <UltraInput
                        type="number"
                        value={policyForm.rolloverPercent}
                        min={0}
                        max={100}
                        onChange={(e) => handlePolicyChange('rolloverPercent', Number(e.target.value))}
                      />
              </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">Priority weight</label>
                      <UltraInput
                        type="number"
                        value={policyForm.priorityWeight}
                        min={1}
                        onChange={(e) => handlePolicyChange('priorityWeight', Number(e.target.value))}
                      />
            </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">Enforcement mode</label>
                      <select
                        value={policyForm.enforcementMode}
                        onChange={(e) => handlePolicyChange('enforcementMode', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        {enforcementModes.map((mode) => (
                          <option key={mode.value} value={mode.value}>
                            {mode.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">Manual override</label>
                      <select
                        value={policyForm.allowManualOverride ? 'yes' : 'no'}
                        onChange={(e) => handlePolicyChange('allowManualOverride', e.target.value === 'yes')}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="yes">Allow manual adjustments</option>
                        <option value="no">Disallow manual adjustments</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">Notes</label>
                    <textarea
                      value={policyForm.notes}
                      onChange={(e) => handlePolicyChange('notes', e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Optional internal notes about this policy"
                    />
              </div>
            </div>
          )}

              <div className="flex items-center justify-end gap-3 mt-8">
                <UltraButton variant="ghost" onClick={() => setPolicyModalOpen(false)}>
                  Cancel
                </UltraButton>
                <UltraButton variant="primary" icon={Shield} onClick={savePolicy}>
                  Save policy
                </UltraButton>
              </div>
        </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {adjustModalOpen && (
            <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg p-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">Manual token adjustment</h3>
                  <p className="text-sm text-slate-400">Apply a controlled credit or debit with a full audit trail.</p>
                </div>
                <button
                  onClick={() => setAdjustModalOpen(false)}
                  className="text-slate-400 hover:text-slate-200 transition"
                  aria-label="Close adjustment modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">Change type</label>
                  <select
                    value={adjustForm.changeType}
                    onChange={(e) => setAdjustForm((prev) => ({ ...prev, changeType: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                    <option value="reserve">Reserve</option>
                    <option value="release">Release</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>

                  <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">Amount</label>
                  <UltraInput
                      type="number"
                    min={1}
                    value={adjustForm.amount}
                    onChange={(e) => setAdjustForm((prev) => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>

                  <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">Reason</label>
                  <UltraInput
                    value={adjustForm.reason}
                    onChange={(e) => setAdjustForm((prev) => ({ ...prev, reason: e.target.value }))}
                    placeholder="Short internal reason for this adjustment"
                    />
                  </div>

                  <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">Internal note</label>
                  <textarea
                    value={adjustForm.metadataNote}
                    onChange={(e) => setAdjustForm((prev) => ({ ...prev, metadataNote: e.target.value }))}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Optional note stored in ledger metadata"
                    />
                  </div>
                </div>

              <div className="flex items-center justify-end gap-3 mt-8">
                <UltraButton variant="ghost" onClick={() => setAdjustModalOpen(false)}>
                    Cancel
                </UltraButton>
                <UltraButton variant="primary" icon={Coins} onClick={performAdjustment}>
                  Apply adjustment
                </UltraButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ensureModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl p-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">Ensure Wallet</h3>
                  <p className="text-sm text-slate-400">Search for a user and create or open their token wallet.</p>
                </div>
                  <button
                  onClick={closeEnsureWalletModal}
                  className="text-slate-400 hover:text-slate-200 transition"
                  aria-label="Close ensure wallet modal"
                  >
                  <X className="w-5 h-5" />
                  </button>
                </div>

              <div className="flex items-center gap-3 mb-6">
                <Search className="w-4 h-4 text-slate-400" />
                <UltraInput
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search by email, username, or name"
                  size="sm"
                />
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {userSearchLoading ? (
                  <div className="flex justify-center py-6">
                    <UltraLoader type="pulse" size="md" />
          </div>
                ) : userSearchResults.length === 0 ? (
                  <div className="text-sm text-slate-400 text-center py-6">
                    {userSearchQuery ? 'No users match your search.' : 'Start typing to find a user.'}
                  </div>
                ) : (
                  userSearchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between gap-4 border border-slate-800 rounded-xl px-4 py-3 bg-slate-900/70"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{user.email || user.username || 'Unknown user'}</p>
                        <p className="text-xs text-slate-400">
                          {user.full_name ? `${user.full_name} · ` : ''}ID {user.id.slice(0, 8)}…
                        </p>
                        {user.hasWallet ? (
                          <div className="flex items-center gap-2 text-emerald-300 text-xs mt-1">
                            <CheckCircle className="w-3 h-3" />
                            Wallet exists
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        {user.hasWallet ? (
                          <UltraButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenWalletFromSearch(user)}
                          >
                            Open Wallet
                          </UltraButton>
                        ) : (
                          <UltraButton
                            variant="primary"
                            size="sm"
                            onClick={() => handleEnsureWallet(user)}
                            loading={ensuringUserId === user.id}
                            disabled={ensuringUserId === user.id}
                          >
                            {ensuringUserId === user.id ? 'Creating…' : 'Create Wallet'}
                          </UltraButton>
        )}
      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TokenManagement
