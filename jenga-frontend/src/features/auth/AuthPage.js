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
      <div className="bg"></div>
      <div className="bg2"></div>
      <div className="bg3"></div>

      <div className='auth-content'>
        <h1 className="auth-title">Jenga Stacks</h1>
        {isLogin ? (
          <LoginForm switchToRegister={switchToRegister} />
        ) : (
          <RegisterForm switchToLogin={switchToLogin} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;