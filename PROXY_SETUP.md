# 🚀 Vite Proxy Setup for AI Services

This project uses Vite's built-in proxy to avoid CORS issues when validating AI service API keys.

## 🔧 How It Works

The Vite dev server acts as a proxy, routing API calls through your local development server instead of making direct calls from the browser.

### Proxy Routes

| Local Endpoint | Target API | Purpose |
|----------------|------------|---------|
| `/api/openai/*` | `https://api.openai.com/v1/*` | OpenAI API validation |
| `/api/mistral/*` | `https://api.mistral.ai/v1/*` | Mistral AI validation |
| `/api/claude/*` | `https://api.anthropic.com/v1/*` | Anthropic Claude validation |
| `/api/gemini/*` | `https://generativelanguage.googleapis.com/v1beta/*` | Google Gemini validation |
| `/api/perplexity/*` | `https://api.perplexity.ai/*` | Perplexity AI validation |
| `/api/cohere/*` | `https://api.cohere.ai/v1/*` | Cohere AI validation |
| `/api/grok/*` | `https://api.x.ai/v1/*` | xAI GROK validation |

## 🚀 Getting Started

1. **Start the dev server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. **The proxy is automatically configured** in `vite.config.js`

3. **Test the proxy:**
   ```bash
   node test-proxy.js
   ```

## 🔍 Troubleshooting

### Common Issues

1. **"Failed to fetch" errors:**
   - Make sure your Vite dev server is running
   - Check that the proxy routes are correctly configured
   - Verify the target API endpoints are accessible

2. **CORS errors still occurring:**
   - The proxy should handle CORS automatically
   - Check browser console for specific error messages
   - Ensure you're using the proxy endpoints (`/api/service/*`) not direct URLs

3. **API validation failing:**
   - Check the browser console for detailed error logs
   - Verify your API keys are valid
   - Check the network tab to see if requests are going through the proxy

### Debug Mode

Enable detailed logging by checking the browser console:
- All proxy requests are logged with service names
- Error details include HTTP status codes and response bodies
- Network tab shows the actual requests being made

## 📝 Configuration

The proxy configuration is in `vite.config.js`:

```javascript
server: {
  proxy: {
    '/api/mistral': {
      target: 'https://api.mistral.ai',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/mistral/, '/v1'),
      secure: true
    }
    // ... other services
  }
}
```

## 🎯 Benefits

- ✅ **No CORS issues** - All requests go through your dev server
- ✅ **Better error handling** - Detailed logging and error messages
- ✅ **Consistent API** - Same validation logic for all services
- ✅ **Development friendly** - Easy to debug and test
- ✅ **Production ready** - Proxy only active in development

## 🚀 Production Notes

- The proxy is **only active during development**
- In production, API calls go directly to the services
- Ensure your production environment has proper CORS configuration
- Consider using a backend proxy for production if needed
