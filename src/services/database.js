// Database Service - Wrapper around Supabase
import { supabase } from '../lib/supabase'

class DatabaseService {
  constructor() {
    this.client = supabase
  }

  // Books operations
  async getBooks(userId) {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  async getBook(bookId) {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single()
    
    if (error) throw error
    return data
  }

  async createBook(bookData) {
    const { data, error } = await supabase
      .from('books')
      .insert([bookData])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateBook(bookId, updates) {
    const { data, error } = await supabase
      .from('books')
      .update(updates)
      .eq('id', bookId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async deleteBook(bookId) {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId)
    
    if (error) throw error
    return true
  }

  // User operations
  async getUser(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  }

  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Usage logs
  async createUsageLog(logData) {
    const { data, error } = await supabase
      .from('usage_logs')
      .insert([logData])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async getUserUsage(userId) {
    const { data, error } = await supabase
      .from('usage_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  // Analytics
  async getAnalytics(userId) {
    const { data, error } = await supabase
      .from('usage_logs')
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    return data
  }

  // Generic query method
  async query(table, options = {}) {
    let query = supabase.from(table).select(options.select || '*')
    
    if (options.eq) {
      Object.entries(options.eq).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }
    
    if (options.order) {
      query = query.order(options.order.column, options.order.options || {})
    }
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  }

  // Direct supabase access
  get supabase() {
    return supabase
  }

  // Engine operations
  async getDefaultEngines(userId) {
    const { data, error } = await supabase
      .from('user_engines')
      .select(`
        *,
        ai_engines (
          id,
          name,
          description,
          nodes,
          edges,
          metadata,
          type,
          tier
        )
      `)
      .eq('user_id', userId)
      .eq('is_default', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data?.map(userEngine => ({
      ...userEngine,
      engine: userEngine.ai_engines
    })) || []
  }

  async getAllUserEngines(userId) {
    const { data, error } = await supabase
      .from('user_engines')
      .select(`
        *,
        ai_engines (
          id,
          name,
          description,
          nodes,
          edges,
          metadata,
          type,
          tier
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data?.map(userEngine => ({
      ...userEngine,
      engine: userEngine.ai_engines
    })) || []
  }

  async getEngineBlueprint(engineId) {
    const { data, error } = await supabase
      .from('ai_engines')
      .select('id, name, nodes, edges')
      .eq('id', engineId)
      .single()
    
    if (error) throw error
    return data
  }

  // Admin-only: Set master engine as default
  async setMasterEngineAsDefault(engineId, defaultOrder = 1) {
    try {
      // First, unset all other defaults
      await supabase
        .from('ai_engines')
        .update({ is_default: false, default_order: null })
        .neq('id', engineId)
      
      // Then set this engine as default
      const { data, error } = await supabase
        .from('ai_engines')
        .update({ 
          is_default: true, 
          default_order: defaultOrder 
        })
        .eq('id', engineId)
        .select()
        .single()
      
      if (error) throw error
      
      // Update all user copies to inherit default status
      await supabase
        .from('user_engines')
        .update({ is_default: true })
        .eq('engine_id', engineId)
      
      return data
    } catch (error) {
      console.error('Error setting master engine as default:', error)
      throw error
    }
  }

  // Admin-only: Remove default status from master engine
  async removeMasterEngineDefault(engineId) {
    try {
      // Remove default from master engine
      const { data, error } = await supabase
        .from('ai_engines')
        .update({ 
          is_default: false, 
          default_order: null 
        })
        .eq('id', engineId)
        .select()
        .single()
      
      if (error) throw error
      
      // Remove default from all user copies
      await supabase
        .from('user_engines')
        .update({ is_default: false })
        .eq('engine_id', engineId)
      
      return data
    } catch (error) {
      console.error('Error removing master engine default:', error)
      throw error
    }
  }
  async getGoToEngines(userId) {
    const { data, error } = await supabase
      .from('user_engines')
      .select(`
        *,
        ai_engines (
          id,
          name,
          description,
          nodes,
          edges,
          metadata,
          type,
          tier
        )
      `)
      .eq('user_id', userId)
      .eq('is_go_to', true)
      .eq('status', 'active')
      .order('go_to_order', { ascending: true })
    
    if (error) throw error
    return data?.map(userEngine => ({
      ...userEngine,
      engine: userEngine.ai_engines
    })) || []
  }

  async getDefaultEngines(userId) {
    const { data, error } = await supabase
      .from('user_engines')
      .select(`
        *,
        ai_engines (
          id,
          name,
          description,
          nodes,
          edges,
          metadata,
          type,
          tier
        )
      `)
      .eq('user_id', userId)
      .eq('is_default', true)
      .eq('status', 'active')
      .order('default_order', { ascending: true })
    
    if (error) throw error
    return data?.map(userEngine => ({
      ...userEngine,
      engine: userEngine.ai_engines
    })) || []
  }

  async setEngineAsGoTo(userEngineId, userId, goToOrder = null) {
    try {
      // Check if user already has 5 Go To engines
      const { data: currentGoTo, error: countError } = await supabase
        .from('user_engines')
        .select('id')
        .eq('user_id', userId)
        .eq('is_go_to', true)
        .neq('id', userEngineId)

      if (countError) throw countError

      if (currentGoTo.length >= 5) {
        throw new Error('Maximum 5 Go To engines allowed per user')
      }

      // If no order specified, assign next available order
      if (!goToOrder) {
        const maxOrder = currentGoTo.length > 0 ? 
          Math.max(...currentGoTo.map(e => e.go_to_order || 0)) : 0
        goToOrder = maxOrder + 1
      }

      // Set engine as Go To
      const { data, error } = await supabase
        .from('user_engines')
        .update({ 
          is_go_to: true, 
          go_to_order: goToOrder 
        })
        .eq('id', userEngineId)
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error setting engine as Go To:', error)
      throw error
    }
  }

  async removeEngineFromGoTo(userEngineId, userId) {
    const { data, error } = await supabase
      .from('user_engines')
      .update({ 
        is_go_to: false, 
        go_to_order: null 
      })
      .eq('id', userEngineId)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async reorderGoToEngines(userId, engineOrders) {
    // engineOrders should be array of { id, go_to_order }
    const updates = engineOrders.map(({ id, go_to_order }) => 
      supabase
        .from('user_engines')
        .update({ go_to_order })
        .eq('id', id)
        .eq('user_id', userId)
    )

    const results = await Promise.all(updates)
    
    // Check for any errors
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      throw new Error(`Failed to reorder engines: ${errors[0].error.message}`)
    }

    return results.map(result => result.data)
  }

  async getAllUserEnginesWithGoToStatus(userId) {
    const { data, error } = await supabase
      .from('user_engines')
      .select(`
        *,
        ai_engines (
          id,
          name,
          description,
          nodes,
          edges,
          metadata,
          type,
          tier
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('is_go_to', { ascending: false })
      .order('go_to_order', { ascending: true })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data?.map(userEngine => ({
      ...userEngine,
      engine: userEngine.ai_engines
    })) || []
  }
}

// Export singleton instance
export const dbService = new DatabaseService()
export default dbService

