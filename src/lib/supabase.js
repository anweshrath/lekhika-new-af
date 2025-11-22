import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

console.log('🔍 Supabase Environment Check (v2):')
console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
console.log('🔍 Actual values:')
console.log('URL:', supabaseUrl)
console.log('Key starts with:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'undefined')

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && 
                             supabaseAnonKey && 
                             supabaseUrl.startsWith('https://') &&
                             supabaseUrl.includes('.supabase.co') &&
                             supabaseAnonKey.startsWith('eyJ');

console.log('🔍 Configuration check:')
console.log('- URL exists:', !!supabaseUrl)
console.log('- Key exists:', !!supabaseAnonKey)
console.log('- URL starts with https://:', supabaseUrl ? supabaseUrl.startsWith('https://') : false)
console.log('- URL contains .supabase.co:', supabaseUrl ? supabaseUrl.includes('.supabase.co') : false)
console.log('- Key starts with eyJ:', supabaseAnonKey ? supabaseAnonKey.startsWith('eyJ') : false)
console.log('🔍 Final result:', isSupabaseConfigured)

let supabase;

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase not configured - creating mock client with all required methods')
  
  // Create a complete mock client that matches Supabase API
  const mockAuth = {
    getSession: async () => {
      console.log('📱 Mock getSession called');
      return { data: { session: null }, error: null };
    },
    
    getUser: async () => {
      console.log('👤 Mock getUser called');
      return { data: { user: null }, error: null };
    },
    
    onAuthStateChange: (callback) => {
      console.log('🔄 Mock onAuthStateChange called');
      // Immediately call with signed out state
      setTimeout(() => {
        try {
          callback('SIGNED_OUT', null);
        } catch (e) {
          console.error('Error in auth callback:', e);
        }
      }, 0);
      
      return { 
        data: { 
          subscription: { 
            unsubscribe: () => console.log('🔌 Mock auth subscription unsubscribed') 
          } 
        } 
      };
    },
    
    signUp: async (credentials) => {
      console.log('📝 Mock signUp called');
      return { 
        data: { user: null, session: null }, 
        error: { message: 'Supabase not configured - please set up your environment variables' } 
      };
    },
    
    signInWithPassword: async (credentials) => {
      console.log('🔐 Mock signInWithPassword called');
      return { 
        data: { user: null, session: null }, 
        error: { message: 'Supabase not configured - please set up your environment variables' } 
      };
    },
    
    signOut: async () => {
      console.log('🚪 Mock signOut called');
      return { error: null };
    },
    
    resetPasswordForEmail: async (email, options) => {
      console.log('🔄 Mock resetPasswordForEmail called');
      return { 
        data: null, 
        error: { message: 'Supabase not configured - please set up your environment variables' } 
      };
    },
    
    updateUser: async (attributes) => {
      console.log('✏️ Mock updateUser called');
      return { 
        data: { user: null }, 
        error: { message: 'Supabase not configured - please set up your environment variables' } 
      };
    }
  };

  const mockFrom = (table) => {
    console.log(`🗄️ Mock database query on table: ${table}`);
    
    const mockError = { message: 'Supabase not configured - please set up your environment variables' };
    
    return {
      select: (columns = '*') => ({
        eq: (column, value) => ({
          eq: (column2, value2) => Promise.resolve({ data: [], error: mockError }),
          single: () => Promise.resolve({ data: null, error: mockError }),
          limit: (count) => Promise.resolve({ data: [], error: mockError })
        }),
        limit: (count) => Promise.resolve({ data: [], error: mockError }),
        single: () => Promise.resolve({ data: null, error: mockError }),
        order: (column, options) => Promise.resolve({ data: [], error: mockError })
      }),
      
      insert: (values) => ({
        select: (columns) => Promise.resolve({ data: null, error: mockError }),
        single: () => Promise.resolve({ data: null, error: mockError })
      }),
      
      upsert: (values, options) => ({
        select: (columns) => Promise.resolve({ data: null, error: mockError }),
        single: () => Promise.resolve({ data: null, error: mockError })
      }),
      
      update: (values) => ({
        eq: (column, value) => ({
          eq: (column2, value2) => Promise.resolve({ data: null, error: mockError }),
          select: (columns) => Promise.resolve({ data: null, error: mockError })
        })
      }),
      
      delete: () => ({
        eq: (column, value) => Promise.resolve({ data: null, error: mockError })
      })
    };
  };

  // Create the mock supabase object
  supabase = {
    auth: mockAuth,
    from: mockFrom
  };
  
  console.log('✅ Mock Supabase client created with all required methods');
  
} else {
  try {
    console.log('🚀 Creating real Supabase client...');
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Real Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    throw new Error(`Supabase initialization failed: ${error.message}`);
  }
}

// Verify the client has required methods
console.log('🔍 Verifying Supabase client methods:');
console.log('- auth.getSession:', typeof supabase.auth.getSession);
console.log('- auth.getUser:', typeof supabase.auth.getUser);
console.log('- auth.onAuthStateChange:', typeof supabase.auth.onAuthStateChange);
console.log('- from:', typeof supabase.from);

// Export the client
export { supabase };
export const db = supabase;
export default supabase;
