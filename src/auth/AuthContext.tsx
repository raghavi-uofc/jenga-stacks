import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  user: { email: string } | null;
  login: (email: string, _password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('auth:user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.email) {
          setIsAuthenticated(true);
          setUser({ email: parsed.email });
        }
      } catch {}
    }
  }, []);

  const login = async (email: string) => {
    // Fake async to mimic a real request
    await new Promise((r) => setTimeout(r, 300));
    setIsAuthenticated(true);
    setUser({ email });
    localStorage.setItem('auth:user', JSON.stringify({ email }));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('auth:user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

