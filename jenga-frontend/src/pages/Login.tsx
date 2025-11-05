import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/ui/Toast';
import { IconApple } from '../components/icons';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ open: boolean; message: string; type: 'success' | 'error' | 'info' }>({ open: false, message: '', type: 'info' });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      setError('Enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      setLoading(true);
      await login(email, password);
      setToast({ open: true, message: 'Signed in successfully', type: 'success' });
      navigate('/app', { replace: true });
    } catch (err) {
      setError('Login failed');
      setToast({ open: true, message: 'Login failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
      <div className="container-max">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center mb-4 text-black dark:text-white">
            <IconApple size={32} />
          </div>
          <Card title="Sign in">
            <form className="space-y-4" onSubmit={onSubmit}>
              <label className="label">Email
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <label className="label">Password
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </label>
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
              )}
              <div className="flex items-center justify-between">
                <div className="text-sm opacity-70">Use any email/password</div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
              </div>
            </form>
          </Card>
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-zinc-300">
            <a href="/" className="hover:underline">Back to introduction</a>
          </div>
        </div>
      </div>
    </div>
  );
}
