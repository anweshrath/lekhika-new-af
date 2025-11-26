class ClaudeService {
  constructor() {
    this.apiKey = null;
    // Use proxy URL instead of direct API URL
    this.baseURL = '/api/claude';
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  async validateApiKey(apiKey = null) {
    const keyToUse = apiKey || this.apiKey;
    
    if (!keyToUse) {
      throw new Error('API key is required');
    }

    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': keyToUse,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 10,
          messages: [
            {
              role: 'user',
              content: 'Hello'
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API key validation failed: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error validating API key:', error);
      throw error;
    }
  }

  async generateContent(prompt, apiKey = null) {
    let keyToUse = apiKey || this.apiKey;
    
    if (!keyToUse) {
      throw new Error('API key is required');
    }

    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': keyToUse,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw error;
    }
  }

  async generateChapter(chapterOutline, bookContext, apiKey = null) {
    let keyToUse = apiKey || this.apiKey;
    
    if (!keyToUse) {
      throw new Error('API key is required');
    }

    const prompt = `
You are an expert book writer. Generate a complete chapter based on the following:

Book Context: ${bookContext}

Chapter Outline: ${chapterOutline}

Requirements:
- Write a complete, engaging chapter (2000-3000 words)
- Use proper narrative structure
- Include dialogue where appropriate
- Maintain consistency with the book context
- Write in a professional, engaging style
- Format with proper paragraphs and sections

Generate only the chapter content, no additional commentary.
`;

    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': keyToUse,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Error generating chapter:', error);
      throw error;
    }
  }

  async generateOutline(topic, requirements, apiKey = null) {
    let keyToUse = apiKey || this.apiKey;
    
    if (!keyToUse) {
      throw new Error('API key is required');
    }

    const prompt = `
Create a detailed book outline for: ${topic}

Requirements: ${requirements}

Please provide:
1. A compelling book title
2. A brief book description (2-3 sentences)
3. 8-12 chapter outlines, each with:
   - Chapter title
   - 3-4 key points to cover
   - Brief description of chapter content

Format as JSON with this structure:
{
  "title": "Book Title",
  "description": "Book description",
  "chapters": [
    {
      "title": "Chapter Title",
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "description": "Chapter description"
    }
  ]
}
`;

    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': keyToUse,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.content[0].text;
      
      // Try to parse JSON from the response
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Could not parse JSON from response, returning raw content');
      }
      
      return { content };
    } catch (error) {
      console.error('Error generating outline:', error);
      throw error;
    }
  }
}

// Export both named and default exports for compatibility
export const claudeService = new ClaudeService();
export default claudeService;
