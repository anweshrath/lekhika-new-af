class ModelSelectionService {
  constructor() {
    this.selectedModels = this.loadSelectedModels()
  }

  loadSelectedModels() {
    try {
      const saved = localStorage.getItem('selectedAIModels')
      return saved ? JSON.parse(saved) : {}
    } catch (error) {
      console.error('Error loading selected models:', error)
      return {}
    }
  }

  saveSelectedModels(models) {
    try {
      localStorage.setItem('selectedAIModels', JSON.stringify(models))
      this.selectedModels = models
    } catch (error) {
      console.error('Error saving selected models:', error)
    }
  }

  getSelectedModel(serviceId) {
    return this.selectedModels[serviceId] || null
  }

  setSelectedModel(serviceId, modelId) {
    this.selectedModels[serviceId] = modelId
    this.saveSelectedModels(this.selectedModels)
  }

  getAllSelectedModels() {
    return { ...this.selectedModels }
  }

  hasSelectedModel(serviceId) {
    return !!this.selectedModels[serviceId]
  }

  getContentCreationModels() {
    return {
      openai: this.selectedModels.openai || 'gpt-4',
      claude: this.selectedModels.claude || 'claude-3-sonnet-20240229',
      gemini: this.selectedModels.gemini || 'gemini-pro',
      grok: this.selectedModels.grok || 'grok-beta',
      perplexity: this.selectedModels.perplexity || 'llama-3.1-sonar-small-128k-online'
    }
  }

  updateServiceModel(serviceId, modelId) {
    this.setSelectedModel(serviceId, modelId)
    console.log(`✅ Content creation model updated: ${serviceId} -> ${modelId}`)
  }
}

export const modelSelectionService = new ModelSelectionService()
