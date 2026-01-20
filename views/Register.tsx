import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { store } from '../services/store';
import { ShieldCheck, User, Mail, Lock, Calendar, MapPin, Building2 } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [financialInstitution, setFinancialInstitution] = useState('TD Bank');
  const [error, setError] = useState('');
  const [lang, setLang] = useState(store.getLanguage());
  const [config, setConfig] = useState(store.getConfig());

  useEffect(() => {
    return store.subscribe(() => {
        setLang(store.getLanguage());
        setConfig(store.getConfig());
    });
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(store.t('auth.pass_match'));
      return;
    }

    try {
      await store.register(name, email, password, dateOfBirth, address, financialInstitution);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-[40px] shadow-xl p-8 my-8">
        <div className="flex flex-col items-center mb-8">
          {config.logoUrl ? (
               <img src={config.logoUrl} alt="Logo" className="h-16 mb-4 object-contain" />
          ) : (
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-brand-blue mb-4">
                <ShieldCheck size={32} />
              </div>
          )}
          <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight">{store.t('auth.create_account')}</h2>
          <p className="text-gray-500 mt-2 text-center">{store.t('auth.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-navy pl-1">{store.t('auth.name')}</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 text-brand-navy font-medium focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-50 transition-all"
                required
              />
            </div>
          </div>

           <div className="space-y-2">
            <label className="text-sm font-bold text-brand-navy pl-1">{store.t('auth.dob')}</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 text-brand-navy font-medium focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-50 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-navy pl-1">{store.t('auth.address')}</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 text-brand-navy font-medium focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-50 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-navy pl-1">{store.t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 text-brand-navy font-medium focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-50 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-navy pl-1">{store.t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 text-brand-navy font-medium focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-50 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-navy pl-1">{store.t('auth.confirm_password')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 text-brand-navy font-medium focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-50 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-navy pl-1">Financial Institution</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={financialInstitution}
                onChange={(e) => setFinancialInstitution(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 text-brand-navy font-medium focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-50 transition-all appearance-none cursor-pointer"
                required
              >
                <option value="TD Bank">TD Bank</option>
                <option value="Desjardins">Desjardins</option>
                <option value="BNC">Banque Nationale du Canada (BNC)</option>
                <option value="BMO">BMO (Bank of Montreal)</option>
                <option value="Laurentienne">Banque Laurentienne</option>
                <option value="Tangerine">Tangerine</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-blue text-white font-bold py-4 rounded-full hover:bg-blue-600 transition-all shadow-lg shadow-brand-blue/30 mt-4 hover:scale-[1.02] active:scale-[0.98]"
          >
            {store.t('auth.create_account')}
          </button>
          </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-400 font-medium">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          className="w-full bg-white border-2 border-gray-100 text-brand-navy font-bold py-3.5 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
          onClick={() => window.location.href = 'https://auth-3-ke0l.onrender.com/'}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </button>

        <div className="mt-8 text-center">
            <span className="text-gray-500 text-sm">{store.t('auth.already')} </span>
            <Link to="/login" className="text-brand-blue hover:text-blue-600 text-sm font-bold">
                {store.t('auth.signin')}
            </Link>
        </div>
      </div>
    </div>
  );
};
