import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import UserLogin from '../components/UserLogin';
import UserRegister from '../components/UserRegister';
import { useUserAuth } from '../contexts/UserAuthContext';

const UserAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, login, register } = useUserAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/app/studio" replace />;
  }

  const handleLogin = async (userData) => {
    await login(userData.email, userData.password);
  };

  const handleRegister = (userData) => {
    register(userData);
  };

  return (
    <div>
      {isLogin ? (
        <UserLogin 
          onLogin={handleLogin}
          onSwitchToRegister={() => setIsLogin(false)}
        />
      ) : (
        <UserRegister 
          onRegister={handleRegister}
          onSwitchToLogin={() => setIsLogin(true)}
        />
      )}
    </div>
  );
};

export default UserAuth;
