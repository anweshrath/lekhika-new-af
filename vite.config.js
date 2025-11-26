import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  server: {
    proxy: {
      // OpenAI API proxy
      '/api/openai': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openai/, '/v1'),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('OpenAI proxy error:', err)
          })
        }
      },
      
      // Mistral AI API proxy
      '/api/mistral': {
        target: 'https://api.mistral.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mistral/, '/v1'),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Mistral proxy error:', err)
          })
        }
      },
      
      // Google Gemini API proxy
      '/api/gemini': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gemini/, '/v1beta').replace('/models/models/', '/models/'),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Preserve query parameters for Gemini API key
            console.log('🔍 Proxying Gemini request:', req.url)
            console.log('📋 Headers:', req.headers)
            if (req.url.includes('key=')) {
              console.log('🔑 Gemini API key detected in query params')
            }
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📡 Gemini response status:', proxyRes.statusCode)
          });
          proxy.on('error', (err, req, res) => {
            console.log('❌ Gemini proxy error:', err)
          })
        }
      },
      
      // Anthropic Claude API proxy
      '/api/claude': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/claude/, '/v1'),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Add required CORS header for Claude API
            proxyReq.setHeader('anthropic-dangerous-direct-browser-access', 'true')
            console.log('🔍 Proxying Claude request:', req.url)
            console.log('📋 Headers:', req.headers)
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📡 Claude response status:', proxyRes.statusCode)
          });
          proxy.on('error', (err, req, res) => {
            console.log('❌ Claude proxy error:', err)
          })
        }
      },
      
      // Perplexity AI API proxy
      '/api/perplexity': {
        target: 'https://api.perplexity.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/perplexity/, ''),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Perplexity proxy error:', err)
          })
        }
      },
      
      // Cohere AI API proxy
      '/api/cohere': {
        target: 'https://api.cohere.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cohere/, '/v1'),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Cohere proxy error:', err)
          })
        }
      },
      
      // xAI GROK API proxy
      '/api/grok': {
        target: 'https://api.x.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/grok/, '/v1'),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('GROK proxy error:', err)
          })
        }
      },
      
      // Stability AI (Stable Diffusion) API proxy
      '/api/stability': {
        target: 'https://api.stability.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stability/, '/v1'),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Stability AI proxy error:', err)
          })
        }
      },
      
      // ElevenLabs API proxy
      '/api/elevenlabs': {
        target: 'https://api.elevenlabs.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/elevenlabs/, ''),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('ElevenLabs proxy error:', err)
          })
        }
      },
      
      // Hugging Face Inference API proxy
      '/api/huggingface': {
        target: 'https://api-inference.huggingface.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/huggingface/, ''),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Hugging Face proxy error:', err)
          })
        }
      },
      
      // Craiyon API proxy
      '/api/craiyon': {
        target: 'https://api.craiyon.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/craiyon/, ''),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Craiyon proxy error:', err)
          })
        }
      },
      
      // ModelsLab API proxy
      '/api/modelslab': {
        target: 'https://modelslab.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/modelslab/, '/api'),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('ModelsLab proxy error:', err)
          })
        }
      },
      
      // Pricing scraper proxy - route to external sites directly
      '/api/scrape-pricing': {
        target: 'https://openai.com',
        changeOrigin: true,
        rewrite: (path) => '/api/pricing/',
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔍 Proxying pricing scrape request:', req.url)
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
            proxyReq.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
          })
        }
      }
    }
  }
})
