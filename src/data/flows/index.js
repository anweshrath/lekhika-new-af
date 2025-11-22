import { supabase } from '../../lib/supabase.js'

// Import all flow categories
import { BUSINESS_FLOWS, syncBusinessFlows } from './businessFlows.js'
import { MARKETING_FLOWS, syncMarketingFlows } from './marketingFlows.js'
import { FINANCE_FLOWS, syncFinanceFlows } from './financeFlows.js'
import { LIFESTYLE_FLOWS, syncLifestyleFlows } from './lifestyleFlows.js'
import { PROFESSIONAL_FLOWS, syncProfessionalFlows } from './professionalFlows.js'

// ============================================================================
// COMBINED ELITE TEMPLATES - ALL CATEGORIES
// ============================================================================

export const ELITE_TEMPLATES = {
  ...BUSINESS_FLOWS,
  ...MARKETING_FLOWS,
  ...FINANCE_FLOWS,
  ...LIFESTYLE_FLOWS,
  ...PROFESSIONAL_FLOWS
}

// ============================================================================
// SYNC ALL ELITE TEMPLATES TO SUPABASE
// ============================================================================

export const syncAllEliteTemplates = async () => {
  try {
    console.log('🚀 Starting comprehensive elite templates sync to Supabase...')

    // Sync all categories
    const syncResults = await Promise.all([
      syncBusinessFlows(supabase),
      syncMarketingFlows(supabase),
      syncFinanceFlows(supabase),
      syncLifestyleFlows(supabase),
      syncProfessionalFlows(supabase)
    ])

    // Check if all syncs were successful
    const allSuccessful = syncResults.every(result => result === true)

    if (allSuccessful) {
      console.log('🎉 ALL 14 ELITE TEMPLATES SYNCED SUCCESSFULLY TO SUPABASE!')
      console.log('📊 Categories synced:')
      console.log('   • Business Flows: 2 templates')
      console.log('   • Marketing Flows: 3 templates')
      console.log('   • Finance Flows: 2 templates')
      console.log('   • Lifestyle Flows: 3 templates')
      console.log('   • Professional Flows: 4 templates')
      console.log('   • TOTAL: 14 elite templates')
      return true
    } else {
      console.error('❌ Some syncs failed. Check logs above.')
      return false
    }

  } catch (error) {
    console.error('💥 Error syncing elite templates:', error)
    return false
  }
}

// ============================================================================
// LEGACY EXPORTS FOR BACKWARD COMPATIBILITY
// ============================================================================

export const TOP_NOTCH_TEMPLATES = ELITE_TEMPLATES
export const COMPLETE_DFY_FLOWS = ELITE_TEMPLATES
export const syncAllDFYFlows = syncAllEliteTemplates

// ============================================================================
// CATEGORY EXPORTS FOR SPECIFIC USE CASES
// ============================================================================

export {
  BUSINESS_FLOWS,
  MARKETING_FLOWS,
  FINANCE_FLOWS,
  LIFESTYLE_FLOWS,
  PROFESSIONAL_FLOWS,
  syncBusinessFlows,
  syncMarketingFlows,
  syncFinanceFlows,
  syncLifestyleFlows,
  syncProfessionalFlows
}
