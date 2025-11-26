// Supabase Service - Helper functions for Supabase operations
import { supabase } from '../lib/supabase'

class SupabaseService {
  constructor() {
    this.client = supabase
  }

  // Generic CRUD operations
  async get(table, filters = {}) {
    let query = supabase.from(table).select('*')
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    const { data, error } = await query
    if (error) throw error
    return data
  }

  async getOne(table, filters = {}) {
    let query = supabase.from(table).select('*')
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    const { data, error } = await query.single()
    if (error) throw error
    return data
  }

  async create(table, data) {
    const { data: result, error } = await supabase
      .from(table)
      .insert([data])
      .select()
      .single()
    
    if (error) throw error
    return result
  }

  async update(table, id, updates) {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async delete(table, id) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }

  async query(table, options = {}) {
    let query = supabase.from(table).select(options.select || '*')
    
    if (options.eq) {
      Object.entries(options.eq).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }
    
    if (options.neq) {
      Object.entries(options.neq).forEach(([key, value]) => {
        query = query.neq(key, value)
      })
    }
    
    if (options.in) {
      Object.entries(options.in).forEach(([key, values]) => {
        query = query.in(key, values)
      })
    }
    
    if (options.order) {
      query = query.order(options.order.column, options.order.options || {})
    }
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    if (options.single) {
      const { data, error } = await query.single()
      if (error) throw error
      return data
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }

  // Batch operations
  async createMany(table, dataArray) {
    const { data, error } = await supabase
      .from(table)
      .insert(dataArray)
      .select()
    
    if (error) throw error
    return data
  }

  async updateMany(table, updates, filters = {}) {
    let query = supabase.from(table).update(updates)
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    const { data, error } = await query.select()
    if (error) throw error
    return data
  }

  async deleteMany(table, filters = {}) {
    let query = supabase.from(table).delete()
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    const { error } = await query
    if (error) throw error
    return true
  }

  // Storage operations
  async uploadFile(bucket, path, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    
    if (error) throw error
    return data
  }

  async downloadFile(bucket, path) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path)
    
    if (error) throw error
    return data
  }

  async deleteFile(bucket, path) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    if (error) throw error
    return true
  }

  async getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  }

  // Direct supabase access
  get supabase() {
    return supabase
  }
}

// Export singleton instance
const supabaseService = new SupabaseService()
export default supabaseService
export { SupabaseService }

