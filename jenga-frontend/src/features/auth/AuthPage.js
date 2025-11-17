import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import './AuthPage.css'; 

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const switchToLogin = () => setIsLogin(true);
  const switchToRegister = () => setIsLogin(false);

  return (
    <div className="auth-container">
      {isLogin ? (
        <LoginForm switchToRegister={switchToRegister} />
      ) : (
        <RegisterForm switchToLogin={switchToLogin} />
      )}
    </div>
  );
};

export default AuthPage;