import React, { useState, useEffect } from 'react';
import { Wand2, BookOpen, Loader2, CheckCircle, AlertCircle, Settings, RotateCcw, Trash2, Database, TestTube } from 'lucide-react';
// import bookService from '../services/bookService'; // REMOVED
import { supabase } from '../lib/supabase';

const BookCreator = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showProviderSetup, setShowProviderSetup] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    topic: '',
    requirements: '',
    genre: '',
    targetAudience: '',
    length: 'medium'
  });
  const [outline, setOutline] = useState(null);
  const [generatedBook, setGeneratedBook] = useState(null);
  const [providerInfo, setProviderInfo] = useState({ available: 0, queue: [], next: null, status: {} });

  useEffect(() => {
    // Check auth status and initialize
    const initializeAuth = async () => {
      try {
        console.log('🔍 Checking authentication status...');
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('❌ Auth error:', error);
          setError(`Authentication error: ${error.message}`);
          return;
        }

        console.log('👤 User status:', user ? `Logged in as ${user.email}` : 'Not logged in');
        setUser(user);
        
        if (user) {
          // Test Supabase connection first
          console.log('🧪 Testing Supabase connection...');
          const connectionOk = await bookService.testSupabaseConnection();
          
          if (!connectionOk) {
            setError('Supabase connection failed. Please check your database setup.');
            return;
          }

          // Set user in AI service and load keys
          console.log('🔑 Setting user in AI service...');
          await bookService.setUser(user);
          
          const info = bookService.getProviderInfo();
          console.log('📊 Provider info after user set:', info);
          setProviderInfo(info);
          
          if (info.available === 0) {
            console.log('⚠️ No providers available, showing setup');
            setShowProviderSetup(true);
          }
        } else {
          setError('Please log in to use AI features');
        }
      } catch (error) {
        console.error('💥 Initialization error:', error);
        setError(`Initialization failed: ${error.message}`);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email || 'no user');
      setUser(session?.user || null);
      
      if (session?.user) {
        await bookService.setUser(session.user);
        refreshProviderInfo();
      } else {
        await bookService.setUser(null);
        setProviderInfo({ available: 0, queue: [], next: null, status: {} });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProviderInfo = () => {
    const info = bookService.getProviderInfo();
    setProviderInfo(info);
    console.log('🔄 Provider info refreshed:', info);
  };

  const handleGenerateOutline = async () => {
    if (!user) {
      setError('Please log in to use AI features');
      return;
    }

    if (!formData.topic.trim()) {
      setError('Please enter a book topic');
      return;
    }

    if (!bookService.hasAnyProvider()) {
      setError('Please configure at least one AI provider first.');
      setShowProviderSetup(true);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const requirements = `Genre: ${formData.genre}, Target Audience: ${formData.targetAudience}, Length: ${formData.length}, Additional Requirements: ${formData.requirements}`;
      
      console.log('🚀 Starting AI outline generation for:', formData.topic);
      
      const outline = await bookService.generateBookOutline(formData.topic, requirements);
      
      console.log('✅ AI outline generated successfully:', outline);
      setOutline(outline);
      setStep(2);
    } catch (error) {
      console.error('❌ Outline generation failed:', error);
      setError(`AI outline generation failed: ${error.message}`);
    } finally {
      setLoading(false);
      refreshProviderInfo();
    }
  };

  const handleCreateBook = async () => {
    if (!outline) return;

    setLoading(true);
    setError(null);
    
    try {
      console.log('📚 Creating book with AI outline:', outline.title);
      
      const bookData = {
        title: outline.title,
        description: outline.description,
        genre: formData.genre,
        targetAudience: formData.targetAudience,
        outline: outline.chapters,
        status: 'draft',
        chapters: [],
        wordCount: 0
      };

      const newBook = await bookService.createBook(bookData);
      console.log('✅ Book created successfully:', newBook.id);
      
      setGeneratedBook(newBook);
      setStep(3);
    } catch (error) {
      console.error('❌ Book creation failed:', error);
      setError(`Failed to create book: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateChapter = async (chapterIndex) => {
    if (!outline || !generatedBook) return;

    if (!bookService.hasAnyProvider()) {
      setError('AI provider required for chapter generation');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const chapter = outline.chapters[chapterIndex];
      console.log(`📝 Generating chapter ${chapterIndex + 1}:`, chapter.title);
      
      const chapterData = await bookService.generateChapter(
        chapter,
        `Book: ${outline.title}\nDescription: ${outline.description}`
      );

      console.log(`✅ Chapter generated: ${chapterData.wordCount} words`);

      // Update the book with the generated chapter
      const updatedChapters = [...(generatedBook.chapters || [])];
      updatedChapters[chapterIndex] = {
        ...chapter,
        content: chapterData.content,
        wordCount: chapterData.wordCount,
        status: 'generated'
      };

      const updatedBookData = {
        chapters: updatedChapters,
        wordCount: updatedChapters.reduce((total, ch) => total + (ch.wordCount || 0), 0)
      };

      const updatedBook = await bookService.updateBook(generatedBook.id, updatedBookData);
      setGeneratedBook(updatedBook);
      
      console.log('✅ Book updated with new chapter');
    } catch (error) {
      console.error('❌ Chapter generation failed:', error);
      setError(`AI chapter generation failed: ${error.message}`);
    } finally {
      setLoading(false);
      refreshProviderInfo();
    }
  };

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Database className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Authentication Required</h1>
        <p className="text-gray-600 mb-6">
          Please log in to use AI features. Your API keys will be securely stored in Supabase.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show provider setup if no providers configured
  if (showProviderSetup) {
    return (
      <AIProviderSetup 
        user={user}
        onComplete={() => {
          setShowProviderSetup(false);
          refreshProviderInfo();
        }} 
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Book Creator</h1>
        <p className="text-gray-600">Smart AI queue system - API keys stored securely in Supabase</p>
        <div className="flex items-center justify-center mt-2 space-x-4">
          <div className="flex items-center">
            <Database className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-sm text-green-600">
              {providerInfo.available} AI Provider{providerInfo.available !== 1 ? 's' : ''} in Supabase
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Next: <span className="font-medium capitalize">{providerInfo.next || 'None'}</span>
          </div>
          <button
            onClick={() => setShowProviderSetup(true)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
          >
            <Settings className="w-4 h-4 mr-1" />
            Configure
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Logged in as: {user?.email}</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            3
          </div>
        </div>
      </div>

      {/* Step 1: Book Details */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Book Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Book Topic *
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                placeholder="e.g., Digital Marketing, Python Programming, Personal Finance"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Genre
              </label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Genre</option>
                <option value="business">Business</option>
                <option value="technology">Technology</option>
                <option value="self-help">Self Help</option>
                <option value="education">Education</option>
                <option value="fiction">Fiction</option>
                <option value="non-fiction">Non-Fiction</option>
                <option value="biography">Biography</option>
                <option value="health">Health & Wellness</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                placeholder="e.g., Beginners, Professionals, Students"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Book Length
              </label>
              <select
                value={formData.length}
                onChange={(e) => setFormData(prev => ({ ...prev, length: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="short">Short (5-8 chapters)</option>
                <option value="medium">Medium (8-12 chapters)</option>
                <option value="long">Long (12+ chapters)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Requirements
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                placeholder="Any specific requirements, style preferences, or topics to include/exclude"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <button
              onClick={handleGenerateOutline}
              disabled={!formData.topic.trim() || loading || providerInfo.available === 0}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              {loading ? 'AI Queue Working...' : 'Generate AI Book Outline'}
            </button>
            
            <p className="text-xs text-center text-blue-600">
              🔒 Supabase Queue: {providerInfo.queue.map(p => p.toUpperCase()).join(' → ')}
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Review Outline */}
      {step === 2 && outline && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">AI Generated Outline</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{outline.title}</h3>
              <p className="text-gray-600 mt-1">{outline.description}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Chapters ({outline.chapters.length})</h4>
              <div className="space-y-3">
                {outline.chapters.map((chapter, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <h5 className="font-medium text-gray-900">
                      Chapter {index + 1}: {chapter.title}
                    </h5>
                    <p className="text-sm text-gray-600 mt-1">{chapter.description}</p>
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">Key Points: </span>
                      <span className="text-xs text-gray-600">
                        {chapter.keyPoints.join(', ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setStep(1)}
              disabled={loading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Back to Edit
            </button>
            <button
              onClick={handleCreateBook}
              disabled={loading}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <BookOpen className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Creating Book...' : 'Create Book'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Book Created */}
      {step === 3 && generatedBook && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">AI Book Created Successfully!</h2>
            <p className="text-gray-600">Your book "{generatedBook.title}" has been created with AI-generated outline.</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Generate AI Chapters</h3>
            <p className="text-sm text-gray-600">
              Click on any chapter below to generate its content using the Supabase AI queue system.
            </p>
            
            <div className="space-y-2">
              {outline.chapters.map((chapter, index) => {
                const isGenerated = generatedBook.chapters?.[index]?.status === 'generated';
                return (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        Chapter {index + 1}: {chapter.title}
                      </h4>
                      <p className="text-sm text-gray-600">{chapter.description}</p>
                      {isGenerated && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ AI Generated ({generatedBook.chapters[index].wordCount} words)
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleGenerateChapter(index)}
                      disabled={loading || isGenerated}
                      className={`px-3 py-1 text-sm rounded-md ml-3 ${
                        isGenerated
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } disabled:opacity-50`}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isGenerated ? (
                        'AI Generated ✓'
                      ) : (
                        'Generate with AI'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-gray-500 text-center">
              🔒 Supabase AI Queue: Securely stored API keys, automatic provider rotation
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const AIProviderSetup = ({ user, onComplete }) => {
  const [providers, setProviders] = useState({
    openai: { apiKey: '', model: 'gpt-4' },
    mistral: { apiKey: '', model: 'mistral-large-latest' },
    gemini: { apiKey: '', model: 'gemini-pro' },
    claude: { apiKey: '', model: 'claude-3-sonnet-20240229' }
  });

  const [savedProviders, setSavedProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load current provider status
    const info = bookService.getProviderInfo();
    setSavedProviders(info.queue);
    console.log('🔍 Current provider info in setup:', info);
  }, []);

  const handleSaveProvider = async (provider) => {
    const config = providers[provider];
    if (!config.apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log(`💾 Attempting to save ${provider} API key...`);
      
      await bookService.setApiKey(provider, config.apiKey, config.model);
      
      // Update saved providers list
      const info = bookService.getProviderInfo();
      setSavedProviders(info.queue);
      
      // Clear the input
      setProviders(prev => ({
        ...prev,
        [provider]: { ...prev[provider], apiKey: '' }
      }));
      
      console.log(`✅ ${provider} saved successfully`);
      alert(`✅ ${provider.toUpperCase()} saved to Supabase!`);
    } catch (error) {
      console.error(`❌ Error saving ${provider}:`, error);
      setError(`Error saving ${provider}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProvider = async (provider) => {
    if (confirm(`Remove ${provider.toUpperCase()} from Supabase?`)) {
      setLoading(true);
      setError(null);
      
      try {
        await bookService.removeApiKey(provider);
        
        // Update saved providers list
        const info = bookService.getProviderInfo();
        setSavedProviders(info.queue);
        
        console.log(`✅ ${provider} removed successfully`);
      } catch (error) {
        console.error(`❌ Error removing ${provider}:`, error);
        setError(`Error removing ${provider}: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleComplete = () => {
    if (savedProviders.length === 0) {
      setError('Please configure at least one AI provider');
      return;
    }
    onComplete();
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const connectionOk = await bookService.testSupabaseConnection();
      if (connectionOk) {
        alert('✅ Supabase connection successful!');
      } else {
        setError('❌ Supabase connection failed');
      }
    } catch (error) {
      setError(`Connection test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const providerLabels = {
    openai: 'OpenAI (GPT-4)',
    mistral: 'Mistral AI',
    gemini: 'Google Gemini',
    claude: 'Anthropic Claude'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <Database className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configure AI Queue</h1>
        <p className="text-gray-600">Add your AI providers - they'll be securely stored in Supabase</p>
        <p className="text-sm text-gray-500 mt-1">Logged in as: {user?.email}</p>
        
        <button
          onClick={handleTestConnection}
          disabled={loading}
          className="mt-2 flex items-center justify-center mx-auto px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
        >
          <TestTube className="w-4 h-4 mr-1" />
          Test Supabase Connection
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Saved Providers Status */}
      {savedProviders.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-green-900 mb-2">🔒 Saved in Supabase ({savedProviders.length})</h3>
          <div className="flex flex-wrap gap-2">
            {savedProviders.map(provider => (
              <div key={provider} className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <Database className="w-3 h-3 mr-1" />
                <span className="capitalize">{provider}</span>
                <button
                  onClick={() => handleRemoveProvider(provider)}
                  disabled={loading}
                  className="ml-2 text-green-600 hover:text-green-800 disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(providers).map((provider) => {
            const isSaved = savedProviders.includes(provider);
            return (
              <div key={provider} className={`border rounded-lg p-4 ${
                isSaved ? 'border-green-300 bg-green-50' : 'border-gray-200'
              }`}>
                <h3 className="font-medium text-gray-900 mb-3">
                  {providerLabels[provider]}
                  {isSaved && <span className="ml-2 text-green-600 text-sm">🔒 In Supabase</span>}
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={providers[provider].apiKey}
                      onChange={(e) => setProviders(prev => ({
                        ...prev,
                        [provider]: { ...prev[provider], apiKey: e.target.value }
                      }))}
                      placeholder={isSaved ? 'Already in Supabase - enter new key to update' : `Enter your ${providerLabels[provider]} API key`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      value={providers[provider].model}
                      onChange={(e) => setProviders(prev => ({
                        ...prev,
                        [provider]: { ...prev[provider], model: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                  </div>
                  
                  <button
                    onClick={() => handleSaveProvider(provider)}
                    disabled={!providers[provider].apiKey.trim() || loading}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Database className="w-4 h-4 mr-2" />
                    )}
                    {isSaved ? 'Update in Supabase' : 'Save to Supabase'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              🔒 Keys are encrypted and stored securely in your Supabase database
            </p>
            <button
              onClick={handleComplete}
              disabled={loading || savedProviders.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {savedProviders.length > 0 ? 'Continue to Book Creator' : 'Add at least one provider'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCreator;
