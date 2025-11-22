import React, { useState, useEffect } from 'react';
import { Database, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SupabaseStatus = () => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);

  useEffect(() => {
    checkSupabaseStatus();
  }, []);

  const checkSupabaseStatus = async () => {
    try {
      console.log('🧪 Checking Supabase status...');
      
      // Try to get session (this will work even with mock client)
      const { data, error } = await supabase.auth.getSession();
      
      if (error && error.message === 'Supabase not configured') {
        setStatus('not-configured');
        setError('Supabase environment variables not set');
      } else if (error) {
        setStatus('error');
        setError(error.message);
      } else {
        setStatus('connected');
        setError(null);
      }
    } catch (error) {
      console.error('💥 Supabase status check error:', error);
      setStatus('error');
      setError(error.message);
    }
  };

  if (status === 'checking') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Database className="w-5 h-5 text-blue-600 mr-2 animate-spin" />
          <span className="text-blue-800">Checking Supabase connection...</span>
        </div>
      </div>
    );
  }

  if (status === 'not-configured') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-yellow-800 font-medium">Supabase Not Configured</h3>
            <p className="text-yellow-700 text-sm mt-1">
              To use AI features with persistent storage, please configure your Supabase connection:
            </p>
            <ol className="text-yellow-700 text-sm mt-2 ml-4 list-decimal">
              <li>Create a <code className="bg-yellow-100 px-1 rounded">.env</code> file in your project root</li>
              <li>Add your Supabase URL and anon key</li>
              <li>Run the database migration to create the ai_providers table</li>
            </ol>
            <div className="mt-3 p-2 bg-yellow-100 rounded text-xs font-mono">
              VITE_SUPABASE_URL=https://your-project.supabase.co<br/>
              VITE_SUPABASE_ANON_KEY=your_anon_key_here
            </div>
            <p className="text-yellow-700 text-xs mt-2">
              💡 The app will work in demo mode without Supabase, but API keys won't be saved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <div>
            <span className="text-red-800 font-medium">Supabase Connection Error</span>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
        <span className="text-green-800">Supabase connected successfully</span>
      </div>
    </div>
  );
};

export default SupabaseStatus;
