import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { store } from '../services/store';
import { ShieldCheck, User, Mail, Lock, Calendar, MapPin } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [lang, setLang] = useState(store.getLanguage());
  const [config, setConfig] = useState(store.getConfig());

  useEffect(() => {
    return store.subscribe(() => {
        setLang(store.getLanguage());
        setConfig(store.getConfig());
    });
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(store.t('auth.pass_match'));
      return;
    }

    try {
      store.register(name, email, password, dateOfBirth, address);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8 my-8">
        <div className="flex flex-col items-center mb-8">
          {config.logoUrl ? (
               <img src={config.logoUrl} alt="Logo" className="h-16 mb-4 object-contain" />
          ) : (
              <div className="w-16 h-16 bg-brand-yellow rounded-xl flex items-center justify-center text-black mb-4">
                <ShieldCheck size={32} />
              </div>
          )}
          <h2 className="text-3xl font-bold text-white tracking-tight">{store.t('auth.create_account')}</h2>
          <p className="text-zinc-500 mt-2">{store.t('auth.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">{store.t('auth.name')}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
                required
              />
            </div>
          </div>

           <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">{store.t('auth.dob')}</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">{store.t('auth.address')}</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">{store.t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
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
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">{store.t('auth.confirm_password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-yellow text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors shadow-[0_0_20px_rgba(250,204,21,0.3)] mt-2"
          >
            {store.t('auth.create_account')}
          </button>
        </form>

        <div className="mt-6 text-center">
            <span className="text-zinc-500 text-sm">{store.t('auth.already')} </span>
            <Link to="/login" className="text-brand-yellow hover:text-yellow-400 text-sm font-medium">
                {store.t('auth.signin')}
            </Link>
        </div>
      </div>
    </div>
  );
};
