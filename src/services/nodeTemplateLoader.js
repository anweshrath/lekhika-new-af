// Node Template Loader - Loads and manages node templates
import { supabase } from '../lib/supabase'

class NodeTemplateLoader {
  constructor() {
    this.templates = new Map()
    this.loaded = false
  }

  async loadTemplates() {
    if (this.loaded) {
      return Array.from(this.templates.values())
    }

    try {
      const { data, error } = await supabase
        .from('alchemist_node_palette')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        data.forEach(template => {
          this.templates.set(template.id, template)
        })
      }

      this.loaded = true
      console.log(`✅ Loaded ${this.templates.size} node templates`)
      return Array.from(this.templates.values())
    } catch (error) {
      console.error('Error loading node templates:', error)
      return []
    }
  }

  async getTemplate(templateId) {
    if (!this.loaded) {
      await this.loadTemplates()
    }

    return this.templates.get(templateId)
  }

  async getAllTemplates() {
    if (!this.loaded) {
      await this.loadTemplates()
    }

    return Array.from(this.templates.values())
  }

  async getTemplatesByCategory(category) {
    if (!this.loaded) {
      await this.loadTemplates()
    }

    return Array.from(this.templates.values()).filter(template => template.category === category)
  }

  async getTemplatesByRole(role) {
    if (!this.loaded) {
      await this.loadTemplates()
    }

    return Array.from(this.templates.values()).filter(template => template.role === role)
  }

  async searchTemplates(query) {
    if (!this.loaded) {
      await this.loadTemplates()
    }

    const lowerQuery = query.toLowerCase()
    return Array.from(this.templates.values()).filter(template => 
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery)
    )
  }

  async reloadTemplates() {
    this.templates.clear()
    this.loaded = false
    return await this.loadTemplates()
  }

  clearCache() {
    this.templates.clear()
    this.loaded = false
  }
}

// Export singleton instance
const nodeTemplateLoader = new NodeTemplateLoader()
export default nodeTemplateLoader
export { NodeTemplateLoader }

