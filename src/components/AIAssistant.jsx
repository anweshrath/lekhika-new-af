import React, { useState } from 'react';
import { MessageCircle, Send, Loader2, Bot, User, Key, AlertCircle } from 'lucide-react';
// import bookService from '../services/bookService'; // REMOVED

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m your AI writing assistant powered by Claude AI. I can help you with book ideas, writing advice, and content creation. Please set your Claude API key to get started with AI-powered responses.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!bookService.hasApiKey());

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    if (!bookService.hasApiKey()) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'assistant',
        content: 'Please set your Claude API key first to get AI-powered responses. I only provide real AI assistance, no template responses.'
      }]);
      setShowApiKeyInput(true);
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await bookService.generateContent(
        `You are an expert writing assistant. The user asked: "${currentInput}"
        
        Provide helpful, detailed advice about writing, book creation, publishing, or any related topic. Be practical, actionable, and encouraging.`
      );
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `AI response failed: ${error.message}. Please check your Claude API key.`
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSetApiKey = () => {
    if (!apiKey.trim()) return;

    bookService.setClaudeApiKey(apiKey);
    setShowApiKeyInput(false);
    
    const confirmMessage = {
      id: Date.now(),
      type: 'assistant',
      content: 'Claude API key has been set successfully! Now I can provide AI-powered writing assistance. What would you like help with?'
    };
    
    setMessages(prev => [...prev, confirmMessage]);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md flex flex-col h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <Bot className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">AI Writing Assistant</h2>
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Claude AI Only
            </span>
          </div>
          <button
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <Key className="w-4 h-4 mr-1" />
            {bookService.hasApiKey() ? 'Update API Key' : 'Set Claude API Key'}
          </button>
        </div>

        {/* API Key Input */}
        {showApiKeyInput && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex space-x-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Claude API key (sk-ant-...)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSetApiKey}
                disabled={!apiKey.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Set Key
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Required for AI responses. Get your key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.anthropic.com</a>
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[80%] ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white ml-2'
                      : 'bg-gray-200 text-gray-600 mr-2'
                  }`}
                >
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 mr-2 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>Claude AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          {!bookService.hasApiKey() && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-center">
              <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-700">Claude API key required for AI responses</span>
            </div>
          )}
          
          <div className="flex space-x-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={bookService.hasApiKey() ? "Ask me anything about writing, book creation, or publishing..." : "Set your Claude API key first to get AI responses"}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="2"
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || loading || !bookService.hasApiKey()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            🤖 Powered by Claude AI - 100% real AI responses, no templates
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
