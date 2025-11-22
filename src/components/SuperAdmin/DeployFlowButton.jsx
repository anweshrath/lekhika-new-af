import React, { useState } from 'react'
import { Rocket, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { engineDeploymentService } from '../../services/engineDeploymentService'
import toast from 'react-hot-toast'

const DeployFlowButton = ({ 
  activeFlow, 
  stepConfigurations, 
  getCurrentSteps, 
  calculateFlowReadiness, 
  selectedFlow,
  onDeploySuccess 
}) => {
  const [deploying, setDeploying] = useState(false)

  const extractModelsFromConfigurations = () => {
    const allModels = []
    
    Object.values(stepConfigurations || {}).forEach(config => {
      if (config.models && Array.isArray(config.models)) {
        config.models.forEach(model => {
          if (!allModels.find(m => m.service === model.service && m.model === model.modelId)) {
            allModels.push({
              service: model.service,
              model: model.modelId || model.model,
              maxTokens: model.maxTokens || 2000
            })
          }
        })
      }
    })

    return allModels
  }

  const handleDeployFlow = async () => {
    try {
      const readiness = calculateFlowReadiness()
      if (readiness !== 100) {
        toast.error('Please configure all steps before deploying')
        return
      }

      setDeploying(true)
      
      // Convert flow to engine configuration
      const engineConfig = {
        name: selectedFlow?.name || `${activeFlow === 'full' ? 'Comprehensive' : 'Streamlined'} Engine`,
        description: selectedFlow?.description || `Auto-generated ${activeFlow === 'full' ? '7-step comprehensive' : '2-step streamlined'} book generation engine`,
        flow_config: {
          type: activeFlow,
          steps: getCurrentSteps().map(step => ({
            id: step.id,
            name: step.name,
            description: step.description,
            purpose: step.purpose,
            configuration: stepConfigurations[step.id] || {},
            estimatedTokens: step.estimatedTokens,
            recommendedServices: step.recommendedServices,
            dependencies: step.dependencies,
            outputs: step.outputs
          }))
        },
        models: extractModelsFromConfigurations(),
        execution_mode: 'sequential',
        tier: activeFlow === 'full' ? 'pro' : 'hobby', // Default tier based on flow type
        active: true
      }

      // Validate engine configuration
      if (engineConfig.models.length === 0) {
        toast.error('No AI models configured. Please configure at least one model in your flow steps.')
        return
      }

      // Deploy to database
      const deployedEngine = await engineDeploymentService.deployEngine(engineConfig)
      
      toast.success(`🚀 Engine "${engineConfig.name}" deployed successfully!`, {
        duration: 4000,
        icon: '🚀'
      })

      // Call success callback if provided
      if (onDeploySuccess) {
        onDeploySuccess(deployedEngine)
      }
      
    } catch (error) {
      console.error('Deployment error:', error)
      toast.error(`Failed to deploy engine: ${error.message}`)
    } finally {
      setDeploying(false)
    }
  }

  const readiness = calculateFlowReadiness()
  const isReady = readiness === 100
  const modelCount = extractModelsFromConfigurations().length
  const stepCount = getCurrentSteps().length

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-dashed border-green-300">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isReady ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            {isReady ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {isReady ? '🚀 Ready to Deploy!' : '⚠️ Configuration Incomplete'}
        </h3>
        
        <p className="text-gray-600 mb-4">
          {isReady 
            ? `Your ${activeFlow === 'full' ? 'comprehensive' : 'streamlined'} flow is ready to be deployed as an AI engine.`
            : `Complete all step configurations to deploy your flow. Currently ${readiness}% complete.`
          }
        </p>

        {/* Flow Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stepCount}</div>
            <div className="text-sm text-gray-500">Process Steps</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{modelCount}</div>
            <div className="text-sm text-gray-500">AI Models</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{readiness}%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>

        {/* Deploy Button */}
        <button
          onClick={handleDeployFlow}
          disabled={!isReady || deploying}
          className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-3 ${
            isReady && !deploying
              ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {deploying ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Deploying Engine...</span>
            </>
          ) : (
            <>
              <Rocket className="w-6 h-6" />
              <span>Deploy as AI Engine</span>
            </>
          )}
        </button>

        {!isReady && (
          <p className="text-sm text-gray-500 mt-3">
            Configure all process steps to enable deployment
          </p>
        )}

        {isReady && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>What happens next:</strong> Your flow will be deployed as an AI engine that can be assigned to user tiers and used for book generation.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeployFlowButton
