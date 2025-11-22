class AIEngineService {
  constructor() {
    this.engines = []
    this.initialized = false
  }

  init() {
    if (this.initialized) return
    
    // Load engines from localStorage
    const saved = localStorage.getItem('ai_engines')
    if (saved) {
      try {
        this.engines = JSON.parse(saved)
      } catch (error) {
        console.error('Failed to load engines from localStorage:', error)
        this.engines = []
      }
    }
    
    this.initialized = true
    console.log('AI Engine service initialized with', this.engines.length, 'engines')
  }

  saveEngines() {
    try {
      localStorage.setItem('ai_engines', JSON.stringify(this.engines))
    } catch (error) {
      console.error('Failed to save engines to localStorage:', error)
    }
  }

  async getAllEngines() {
    this.init()
    return [...this.engines]
  }

  async createEngine(engineData) {
    this.init()
    
    const newEngine = {
      id: `engine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: engineData.name,
      description: engineData.description,
      models: engineData.models || [],
      executionMode: engineData.executionMode || 'sequential',
      fallbackConfig: engineData.fallbackConfig || { enabled: false },
      taskAssignments: engineData.taskAssignments || [],
      tier: engineData.tier || 'hobby',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.engines.push(newEngine)
    this.saveEngines()
    
    return newEngine
  }

  async updateEngine(engineId, updates) {
    this.init()
    
    const index = this.engines.findIndex(e => e.id === engineId)
    if (index === -1) {
      throw new Error('Engine not found')
    }
    
    this.engines[index] = {
      ...this.engines[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    this.saveEngines()
    return this.engines[index]
  }

  async deleteEngine(engineId) {
    this.init()
    
    const index = this.engines.findIndex(e => e.id === engineId)
    if (index === -1) {
      throw new Error('Engine not found')
    }
    
    this.engines.splice(index, 1)
    this.saveEngines()
    
    return true
  }

  async duplicateEngine(engineId) {
    this.init()
    
    const engine = this.engines.find(e => e.id === engineId)
    if (!engine) {
      throw new Error('Engine not found')
    }
    
    const duplicated = {
      ...engine,
      id: `engine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${engine.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.engines.push(duplicated)
    this.saveEngines()
    
    return duplicated
  }

  async updateEngineOrder(engineIds) {
    this.init()
    
    const reorderedEngines = []
    engineIds.forEach(id => {
      const engine = this.engines.find(e => e.id === id)
      if (engine) {
        reorderedEngines.push(engine)
      }
    })
    
    this.engines = reorderedEngines
    this.saveEngines()
    
    return true
  }

  async getEngineAnalytics() {
    this.init()
    
    const activeEngines = this.engines.filter(e => e.active).length
    const totalModels = this.engines.reduce((sum, e) => sum + e.models.length, 0)
    
    return {
      activeEngines,
      totalEngines: this.engines.length,
      totalModels,
      lastUpdated: new Date().toISOString()
    }
  }

  async executeEngine(engineId, prompt, context = {}) {
    throw new Error('FAKE ENGINE EXECUTION DISABLED. Use real AI flows only. NO SIMULATED BULLSHIT ALLOWED.')
  }
}

export const aiEngineService = new AIEngineService()
