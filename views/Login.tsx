import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../services/store';
import { ShieldCheck, Lock, User } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [lang, setLang] = useState(store.getLanguage()); // Force update on lang change

  useEffect(() => {
    return store.subscribe(() => setLang(store.getLanguage()));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await store.login(email, password);
      if (user) {
        if (user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(store.t('auth.error_creds'));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Helper to fill demo credentials
  const fillDemo = (role: 'user' | 'admin') => {
      if(role === 'user') {
          setEmail('user@bank.com');
          setPassword('password');
      } else {
          setEmail('admin@bank.com');
          setPassword('admin');
      }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-yellow rounded-xl flex items-center justify-center text-black mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">{store.t('auth.welcome')}</h2>
          <p className="text-zinc-500 mt-2">{store.t('auth.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">{store.t('auth.email')}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">{store.t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-yellow text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors shadow-[0_0_20px_rgba(250,204,21,0.3)]"
          >
            {store.t('auth.signin')}
          </button>
        </form>

        <div className="mt-8 flex gap-4 justify-center">
            <button onClick={() => fillDemo('user')} className="text-xs text-zinc-500 hover:text-brand-yellow underline">{store.t('auth.demo_user')}</button>
            <button onClick={() => fillDemo('admin')} className="text-xs text-zinc-500 hover:text-brand-yellow underline">{store.t('auth.demo_admin')}</button>
        </div>

        <div className="mt-6 text-center">
            <a href="#/register" className="text-brand-yellow hover:text-yellow-400 text-sm font-medium">
                {store.t('auth.create_account')}
            </a>
        </div>
      </div>
    </div>
  );
};