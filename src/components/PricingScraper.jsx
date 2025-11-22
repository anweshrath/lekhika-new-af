import React, { useState } from 'react'
import { pricingScraperService } from '../services/pricingScraperService'
import { Download, Globe, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const PricingScraper = () => {
  const [url, setUrl] = useState('')
  const [scraping, setScraping] = useState(false)
  const [lastScrapedProvider, setLastScrapedProvider] = useState('')

  const handleScrape = async () => {
    if (!url.trim()) {
      toast.error('Please enter a pricing URL')
      return
    }

    setScraping(true)
    try {
      const result = await pricingScraperService.scrapePricingData(url)
      
      if (result.success) {
        // Download the CSV file
        const filename = `ai_models_${result.provider}_${new Date().toISOString().split('T')[0]}.csv`
        pricingScraperService.downloadCSV(result.data, filename)
        
        setLastScrapedProvider(result.provider)
        toast.success(`CSV file downloaded successfully! Provider: ${result.provider}`)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Scraping error:', error)
      toast.error(`Scraping failed: ${error.message}`)
    } finally {
      setScraping(false)
    }
  }

  const supportedUrls = pricingScraperService.getSupportedUrls()

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">AI Pricing Scraper</h3>
      </div>
      
      <p className="text-gray-400 text-sm mb-4">
        Enter a pricing page URL to scrape AI model data and download as CSV file in your exact table format.
      </p>

      <div className="space-y-4">
        {/* URL Input */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">Pricing Page URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://openai.com/pricing or https://ai.google.dev/pricing"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
          />
        </div>

        {/* Scrape Button */}
        <button
          onClick={handleScrape}
          disabled={scraping || !url.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          {scraping ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Scrape & Download CSV
            </>
          )}
        </button>

        {/* Success Message */}
        {lastScrapedProvider && (
          <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-700 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-300 text-sm">
              Last scraped: {lastScrapedProvider} - CSV file downloaded
            </span>
          </div>
        )}

        {/* Supported URLs */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Supported Pricing Pages:</h4>
          <div className="space-y-1">
            {supportedUrls.map((supportedUrl, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <a 
                  href={supportedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  {supportedUrl}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Format Info */}
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2">CSV Output Format:</h4>
          <div className="text-xs text-gray-300 space-y-1">
            <p>• <strong>provider:</strong> Your naming convention (e.g., GEMIN-02-2, OPENAI-01-1)</p>
            <p>• <strong>model_name:</strong> Full model path (e.g., models/gemini-1.5-flash)</p>
            <p>• <strong>input_cost:</strong> Cost per million input tokens</p>
            <p>• <strong>output_cost:</strong> Cost per million output tokens</p>
            <p>• <strong>context_window:</strong> Maximum context window in tokens</p>
            <p>• <strong>specialties:</strong> Comma-separated specialties</p>
            <p>• <strong>description:</strong> Model description</p>
            <p>• <strong>is_active:</strong> TRUE (all scraped models are active)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingScraper
