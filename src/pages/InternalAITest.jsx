import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Brain,
  Search,
  FileText,
  Image,
  Settings
} from 'lucide-react'
import { specializedAiRouter } from '../services/specializedAiRouter'
import { multiLlmService } from '../services/multiLlmService'
import toast from 'react-hot-toast'

const InternalAITest = () => {
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [teamStatus, setTeamStatus] = useState(null)

  const runAITests = async () => {
    setTesting(true)
    setTestResults(null)
    
    try {
      console.log('🧪 Starting AI functionality tests...')
      
      const results = {
        research: null,
        writing: null,
        images: null,
        outline: null,
        teamStatus: null
      }
      
      // Test Research Team
      try {
        console.log('🔍 Testing Research Team...')
        const researchResult = await specializedAiRouter.routeResearchRequest(
          'business', 
          'ebook', 
          'Business Professional'
        )
        results.research = {
          success: true,
          data: researchResult,
          teamUsed: researchResult.teamUsed,
          serviceUsed: researchResult.serviceUsed,
          fallbackUsed: researchResult.fallbackUsed || false
        }
        console.log('✅ Research Team test passed')
      } catch (error) {
        results.research = {
          success: false,
          error: error.message
        }
        console.log('❌ Research Team test failed:', error.message)
      }
      
      // Test Writing Team
      try {
        console.log('📝 Testing Writing Team...')
        const writingResult = await specializedAiRouter.routeWritingRequest(
          'Introduction to Business Strategy',
          { keyTopics: ['strategy', 'planning', 'execution'] },
          'professional',
          { name: 'Business Professional' },
          ''
        )
        results.writing = {
          success: true,
          data: writingResult,
          teamUsed: writingResult.teamUsed,
          serviceUsed: writingResult.serviceUsed,
          fallbackUsed: writingResult.fallbackUsed || false,
          contentLength: writingResult.content?.length || 0
        }
        console.log('✅ Writing Team test passed')
      } catch (error) {
        results.writing = {
          success: false,
          error: error.message
        }
        console.log('❌ Writing Team test failed:', error.message)
      }
      
      // Test Image Team
      try {
        console.log('🎨 Testing Image Team...')
        const imageResult = await specializedAiRouter.routeImageRequest(
          ['Business strategy diagram', 'Professional meeting'],
          ['diagrams', 'stock']
        )
        results.images = {
          success: true,
          data: imageResult,
          teamUsed: imageResult.teamUsed,
          serviceUsed: imageResult.serviceUsed,
          fallbackUsed: imageResult.fallbackUsed || false,
          imageCount: imageResult.images?.length || 0
        }
        console.log('✅ Image Team test passed')
      } catch (error) {
        results.images = {
          success: false,
          error: error.message
        }
        console.log('❌ Image Team test failed:', error.message)
      }
      
      // Test Outline Generation
      try {
        console.log('📋 Testing Outline Generation...')
        const outlineResult = await specializedAiRouter.routeOutlineRequest(
          {
            type: 'ebook',
            niche: 'business',
            bookTitle: 'Test Business Guide',
            numberOfChapters: 5
          },
          { keyTopics: ['strategy', 'planning', 'execution'] }
        )
        results.outline = {
          success: true,
          data: outlineResult,
          teamUsed: outlineResult.teamUsed,
          serviceUsed: outlineResult.serviceUsed,
          fallbackUsed: outlineResult.fallbackUsed || false,
          sectionCount: outlineResult.sections?.length || 0
        }
        console.log('✅ Outline Generation test passed')
      } catch (error) {
        results.outline = {
          success: false,
          error: error.message
        }
        console.log('❌ Outline Generation test failed:', error.message)
      }
      
      // Get Team Status
      try {
        console.log('📊 Getting team status...')
        const status = await specializedAiRouter.getTeamStatus()
        results.teamStatus = status
        setTeamStatus(status)
        console.log('✅ Team status retrieved')
      } catch (error) {
        console.log('❌ Team status failed:', error.message)
      }
      
      setTestResults(results)
      
      const successCount = Object.values(results).filter(r => r && r.success).length
      const totalTests = Object.keys(results).filter(k => k !== 'teamStatus').length
      
      if (successCount === totalTests) {
        toast.success(`🎉 All AI tests passed! (${successCount}/${totalTests})`)
      } else {
        toast.error(`⚠️ Some tests failed (${successCount}/${totalTests})`)
      }
      
    } catch (error) {
      console.error('❌ AI test suite failed:', error)
      toast.error('❌ AI test suite failed')
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (success) => {
    if (success === null) return AlertCircle
    return success ? CheckCircle : XCircle
  }

  const getStatusColor = (success) => {
    if (success === null) return 'text-gray-400'
    return success ? 'text-green-500' : 'text-red-500'
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🧪 Internal AI Testing Suite
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Developer tool to verify AI functionality and team routing
        </p>
      </div>

      {/* Test Controls */}
      <div className="card mb-8 text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={runAITests}
          disabled={testing}
          className="btn-primary text-lg px-8 py-4"
        >
          {testing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Run AI Tests
            </>
          )}
        </motion.button>
      </div>

      {/* Team Status */}
      {teamStatus && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🤖 AI Team Status
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(teamStatus).map(([teamName, team]) => (
              <div key={teamName} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {team.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {team.role}
                </p>
                <div className="space-y-2">
                  {team.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{service.name}</span>
                      <div className={`flex items-center ${
                        service.status === 'online' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {service.status === 'online' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className={`mt-2 text-sm font-medium ${
                  team.teamStatus === 'operational' ? 'text-green-600' : 'text-red-600'
                }`}>
                  Status: {team.teamStatus}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 Test Results
          </h2>

          {/* Research Team Test */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Search className="w-6 h-6 text-blue-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Research Team Test
              </h3>
              {React.createElement(getStatusIcon(testResults.research?.success), {
                className: `w-5 h-5 ml-auto ${getStatusColor(testResults.research?.success)}`
              })}
            </div>
            {testResults.research?.success ? (
              <div className="space-y-2">
                <p className="text-green-600">✅ Research generation successful</p>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Team Used: {testResults.research.teamUsed}</p>
                  <p>Service Used: {testResults.research.serviceUsed}</p>
                  <p>Fallback Used: {testResults.research.fallbackUsed ? 'Yes' : 'No'}</p>
                  <p>Topics Generated: {testResults.research.data?.keyTopics?.length || 0}</p>
                  <p>Statistics: {testResults.research.data?.statistics?.length || 0}</p>
                </div>
              </div>
            ) : (
              <p className="text-red-600">❌ {testResults.research?.error || 'Test failed'}</p>
            )}
          </div>

          {/* Writing Team Test */}
          <div className="card">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-green-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Writing Team Test
              </h3>
              {React.createElement(getStatusIcon(testResults.writing?.success), {
                className: `w-5 h-5 ml-auto ${getStatusColor(testResults.writing?.success)}`
              })}
            </div>
            {testResults.writing?.success ? (
              <div className="space-y-2">
                <p className="text-green-600">✅ Content generation successful</p>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Team Used: {testResults.writing.teamUsed}</p>
                  <p>Service Used: {testResults.writing.serviceUsed}</p>
                  <p>Fallback Used: {testResults.writing.fallbackUsed ? 'Yes' : 'No'}</p>
                  <p>Content Length: {testResults.writing.contentLength} characters</p>
                </div>
              </div>
            ) : (
              <p className="text-red-600">❌ {testResults.writing?.error || 'Test failed'}</p>
            )}
          </div>

          {/* Image Team Test */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Image className="w-6 h-6 text-purple-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Image Team Test
              </h3>
              {React.createElement(getStatusIcon(testResults.images?.success), {
                className: `w-5 h-5 ml-auto ${getStatusColor(testResults.images?.success)}`
              })}
            </div>
            {testResults.images?.success ? (
              <div className="space-y-2">
                <p className="text-green-600">✅ Image generation successful</p>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Team Used: {testResults.images.teamUsed}</p>
                  <p>Service Used: {testResults.images.serviceUsed}</p>
                  <p>Fallback Used: {testResults.images.fallbackUsed ? 'Yes' : 'No'}</p>
                  <p>Images Generated: {testResults.images.imageCount}</p>
                </div>
              </div>
            ) : (
              <p className="text-red-600">❌ {testResults.images?.error || 'Test failed'}</p>
            )}
          </div>

          {/* Outline Test */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Settings className="w-6 h-6 text-orange-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Outline Generation Test
              </h3>
              {React.createElement(getStatusIcon(testResults.outline?.success), {
                className: `w-5 h-5 ml-auto ${getStatusColor(testResults.outline?.success)}`
              })}
            </div>
            {testResults.outline?.success ? (
              <div className="space-y-2">
                <p className="text-green-600">✅ Outline generation successful</p>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Team Used: {testResults.outline.teamUsed}</p>
                  <p>Service Used: {testResults.outline.serviceUsed}</p>
                  <p>Fallback Used: {testResults.outline.fallbackUsed ? 'Yes' : 'No'}</p>
                  <p>Sections Generated: {testResults.outline.sectionCount}</p>
                </div>
              </div>
            ) : (
              <p className="text-red-600">❌ {testResults.outline?.error || 'Test failed'}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default InternalAITest
