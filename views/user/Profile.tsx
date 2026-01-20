import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { User, UserRole } from '../../types';
import { UserCircle, Shield, Key, Edit2 } from 'lucide-react';

export const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(store.getCurrentUser());
  const [isEditing, setIsEditing] = useState(false);
  const [lang, setLang] = useState(store.getLanguage());

  // Mock Form State
  const [name, setName] = useState('');

  useEffect(() => {
    if (user) setName(user.name);
    return store.subscribe(() => {
        setUser(store.getCurrentUser());
        setLang(store.getLanguage());
    });
  }, []);

  if (!user) return null;

  const handleSave = () => {
      // In a real app, you would call store.updateUser()
      setIsEditing(false);
      // store notification for effect
      alert("Profile updated (Mock)");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-extrabold text-brand-navy">{store.t('profile.title')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Basic Info */}
        <div className="md:col-span-1 space-y-6">
            <div className="bg-white border border-gray-100 rounded-[30px] p-8 flex flex-col items-center text-center shadow-sm">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-brand-blue mb-4">
                    <UserCircle size={64} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-extrabold text-brand-navy">{user.name}</h3>
                <p className="text-sm text-gray-500 font-bold mb-4">{user.email}</p>
                <div className={`px-3 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-brand-blue'}`}>
                    {user.role}
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[30px] p-8 shadow-sm">
                <h4 className="text-brand-navy font-extrabold mb-6 flex items-center gap-2">
                    <Shield size={20} className="text-brand-blue" /> {store.t('profile.security')}
                </h4>
                <div className="space-y-4">
                    <button className="w-full text-left text-sm text-gray-500 font-bold hover:text-brand-blue hover:bg-blue-50 p-3 rounded-xl transition-colors flex items-center gap-3">
                        <Key size={18} /> {store.t('profile.password')}
                    </button>
                    <button className="w-full text-left text-sm text-gray-500 font-bold hover:text-brand-blue hover:bg-blue-50 p-3 rounded-xl transition-colors flex items-center gap-3">
                        <Shield size={18} /> {store.t('profile.2fa')}
                    </button>
                </div>
            </div>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-2 bg-white border border-gray-100 rounded-[30px] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-extrabold text-brand-navy">{store.t('profile.details')}</h3>
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-sm text-brand-blue font-bold hover:text-blue-600 flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg transition-colors"
                >
                    <Edit2 size={16} /> {isEditing ? store.t('users.cancel') : store.t('profile.edit')}
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">{store.t('profile.name')}</label>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-brand-navy font-bold focus:border-brand-blue focus:outline-none"
                        />
                    ) : (
                        <p className="text-brand-navy text-lg font-bold">{user.name}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">{store.t('profile.email')}</label>
                    <p className="text-brand-navy text-lg font-bold">{user.email}</p>
                </div>

                {user.role === UserRole.USER && (
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">Banque de réception</label>
                        <div className="flex items-center gap-3">
                             <p className="text-brand-navy text-lg font-bold">{user.financialInstitution || 'TD Bank'}</p>
                             <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Active</span>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">{store.t('profile.joined')}</label>
                    <p className="text-brand-navy font-bold">October 24, 2023</p>
                </div>

                {isEditing && (
                    <div className="pt-6 border-t border-gray-100">
                        <button 
                            onClick={handleSave}
                            className="px-8 py-3 bg-brand-blue text-white font-bold rounded-full hover:bg-blue-600 shadow-lg shadow-brand-blue/30 transition-colors"
                        >
                            {store.t('profile.save')}
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};