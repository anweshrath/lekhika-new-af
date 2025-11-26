import React, { createContext, useContext, useEffect, useState } from 'react';
import userAuthService from '../services/userAuthService';

const UserAuthContext = createContext({});

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Initializing user authentication...');

      // Validate existing session
      const userData = await userAuthService.validateSession();
      
      if (userData) {
        setUser(userData);
        setSession(userAuthService.getCurrentSession());
        console.log('✅ User session validated:', userData.email);
      } else {
        console.log('❌ No valid session found');
      }

    } catch (error) {
      console.error('❌ Auth initialization failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const result = await userAuthService.loginUser(email, password);
      
      setUser(result.user);
      setSession(result.sessionId);
      
      console.log('✅ Login successful:', result.user.email);
      return result;

    } catch (error) {
      console.error('❌ Login failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const newUser = await userAuthService.registerUser(userData);
      
      console.log('✅ Registration successful:', newUser.email);
      return newUser;

    } catch (error) {
      console.error('❌ Registration failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      await userAuthService.logout();
      
      setUser(null);
      setSession(null);
      setError(null);
      
      console.log('✅ Logout successful');

    } catch (error) {
      console.error('❌ Logout failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');

      const userId = user.id || user.user_id;
      if (!userId) throw new Error('User ID not found');
      
      const updatedUser = await userAuthService.updateUserProfile(userId, updates);
      
      setUser(updatedUser);
      
      console.log('✅ Profile updated successfully');
      return updatedUser;

    } catch (error) {
      console.error('❌ Profile update failed:', error);
      setError(error.message);
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      if (!user) throw new Error('No user logged in');

      await userAuthService.changePassword(user.id, currentPassword, newPassword);
      
      console.log('✅ Password changed successfully');

    } catch (error) {
      console.error('❌ Password change failed:', error);
      setError(error.message);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    user,
    session,
    loading,
    error,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    
    // Utilities
    isAuthenticated: !!user,
    hasRole: (role) => user?.role === role,
    hasTier: (tier) => user?.tier === tier,
    hasAccessLevel: (level) => user?.access_level >= level,
  };

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
};
