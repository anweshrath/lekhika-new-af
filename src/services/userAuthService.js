// Independent User Authentication Service
// Zero dependencies on auth.users or superadmin_users
import { supabase } from '../lib/supabase';

class UserAuthService {
  constructor() {
    this.currentUser = null;
    this.currentSession = null;
  }

  // =====================================================
  // USER REGISTRATION
  // =====================================================

  async registerUser(userData) {
    try {
      const { email, password, full_name, username } = userData;
      
      // Validate input
      if (!email || !password || !full_name || !username) {
        throw new Error('All fields are required');
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Check if username already exists
      const { data: existingUsername } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (existingUsername) {
        throw new Error('Username already taken');
      }

      // Hash password (simple hash for now - should use bcrypt in production)
      const password_hash = await this.hashPassword(password);

      // Create user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          email,
          password_hash,
          full_name,
          username,
          role: 'user',
          tier: 'hobby',
          access_level: 1,
          credits_balance: 1000,
          monthly_limit: 1000,
          features_enabled: [],
          is_active: true,
          onboarding_completed: false,
          metadata: { username, full_name }
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ User registered successfully:', newUser.id);
      return newUser;

    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  }

  // =====================================================
  // USER LOGIN
  // =====================================================

  async loginUser(email, password) {
    try {
      // Get user by email
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Create session
      const sessionData = {
        user_id: user.id,
        id: user.id, // Add id for compatibility
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        tier: user.tier,
        access_level: user.access_level,
        created_at: user.created_at,
        avatar_url: user.avatar_url,
        bio: user.bio,
        date_of_birth: user.date_of_birth
      };

      const { data: sessionId, error: sessionError } = await supabase
        .rpc('create_user_session', {
          p_user_id: user.id,
          p_session_data: sessionData,
          p_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        });

      if (sessionError) throw sessionError;

      // Store session in localStorage
      localStorage.setItem('user_session', JSON.stringify({
        sessionId,
        userData: sessionData,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));

      this.currentUser = user;
      this.currentSession = { sessionId, userData: sessionData };

      console.log('✅ User logged in successfully:', user.email);
      return { user, sessionId };

    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================

  async validateSession() {
    try {
      const sessionData = localStorage.getItem('user_session');
      if (!sessionData) {
        return null;
      }

      const { sessionId, expiresAt } = JSON.parse(sessionData);
      
      // Check if session expired
      if (new Date(expiresAt) < new Date()) {
        this.logout();
        return null;
      }

      // Validate session with database
      const { data: validation, error } = await supabase
        .rpc('validate_user_session', { p_session_id: sessionId });

      if (error || !validation || !validation[0]?.is_valid) {
        this.logout();
        return null;
      }

      let userData = validation[0].session_data;
      
      // Check if session data is missing new fields (backward compatibility)
      if (!userData.created_at || !userData.full_name) {
        console.log('🔄 Session data missing fields, refreshing from database...');
        
        // Fetch fresh user data from database
        const { data: freshUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userData.user_id || userData.id)
          .single();
          
        if (userError) {
          console.error('❌ Failed to fetch fresh user data:', userError);
        } else {
          // Update session data with fresh user data
          userData = {
            user_id: freshUser.id,
            id: freshUser.id,
            email: freshUser.email,
            username: freshUser.username,
            full_name: freshUser.full_name,
            role: freshUser.role,
            tier: freshUser.tier,
            access_level: freshUser.access_level,
            created_at: freshUser.created_at,
            avatar_url: freshUser.avatar_url,
            bio: freshUser.bio,
            date_of_birth: freshUser.date_of_birth
          };
          
          // Note: Session data refreshed in memory, database session will be updated on next login
          
          console.log('✅ Session data refreshed with fresh user data');
        }
      }
      
      this.currentUser = userData;
      this.currentSession = { sessionId, userData };

      return userData;

    } catch (error) {
      console.error('❌ Session validation failed:', error);
      this.logout();
      return null;
    }
  }

  async logout() {
    try {
      const sessionData = localStorage.getItem('user_session');
      if (sessionData) {
        const { sessionId } = JSON.parse(sessionData);
        
        // Invalidate session in database
        await supabase.rpc('logout_user_session', { p_session_id: sessionId });
      }

      // Clear localStorage
      localStorage.removeItem('user_session');
      
      // Clear current state
      this.currentUser = null;
      this.currentSession = null;

      console.log('✅ User logged out successfully');

    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  }

  // =====================================================
  // USER MANAGEMENT
  // =====================================================

  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Update current user if it's the same user
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser = { ...this.currentUser, ...updates };
      }

      return data;

    } catch (error) {
      console.error('❌ Profile update failed:', error);
      throw error;
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Get current user
      const { data: user, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Verify current password
      const isValidPassword = await this.verifyPassword(currentPassword, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update password
      const { data, error: updateError } = await supabase
        .from('users')
        .update({ password_hash: newPasswordHash })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log('✅ Password changed successfully');
      return data;

    } catch (error) {
      console.error('❌ Password change failed:', error);
      throw error;
    }
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  async hashPassword(password) {
    // Use PostgreSQL's crypt function with bcrypt
    const { data, error } = await supabase
      .rpc('hash_password', { p_password: password });
    
    if (error) throw error;
    return data;
  }

  async verifyPassword(password, hash) {
    // Use PostgreSQL's crypt function to verify
    const { data, error } = await supabase
      .rpc('verify_password', { p_password: password, p_hash: hash });
    
    if (error) throw error;
    return data;
  }

  // =====================================================
  // GETTERS
  // =====================================================

  getCurrentUser() {
    return this.currentUser;
  }

  getCurrentSession() {
    return this.currentSession;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  hasRole(role) {
    return this.currentUser?.role === role;
  }

  hasTier(tier) {
    return this.currentUser?.tier === tier;
  }

  hasAccessLevel(level) {
    return this.currentUser?.access_level >= level;
  }
}

// Create singleton instance
const userAuthService = new UserAuthService();

export default userAuthService;
