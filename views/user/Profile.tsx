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
      <h2 className="text-2xl font-bold text-white">{store.t('profile.title')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Basic Info */}
        <div className="md:col-span-1 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 mb-4">
                    <UserCircle size={64} />
                </div>
                <h3 className="text-xl font-bold text-white">{user.name}</h3>
                <p className="text-sm text-zinc-500 mb-4">{user.email}</p>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === UserRole.ADMIN ? 'bg-purple-900/30 text-purple-400' : 'bg-brand-yellow/20 text-brand-yellow'}`}>
                    {user.role}
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Shield size={18} /> {store.t('profile.security')}
                </h4>
                <div className="space-y-3">
                    <button className="w-full text-left text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 p-2 rounded transition-colors flex items-center gap-2">
                        <Key size={14} /> {store.t('profile.password')}
                    </button>
                    <button className="w-full text-left text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 p-2 rounded transition-colors flex items-center gap-2">
                        <Shield size={14} /> {store.t('profile.2fa')}
                    </button>
                </div>
            </div>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">{store.t('profile.details')}</h3>
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-sm text-brand-yellow hover:text-yellow-300 flex items-center gap-1"
                >
                    <Edit2 size={14} /> {isEditing ? store.t('users.cancel') : store.t('profile.edit')}
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-1">{store.t('profile.name')}</label>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white"
                        />
                    ) : (
                        <p className="text-white text-lg">{user.name}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-1">{store.t('profile.email')}</label>
                    <p className="text-white text-lg">{user.email}</p>
                </div>

                {user.role === UserRole.USER && (
                    <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">Banque de réception</label>
                        <div className="flex items-center gap-2">
                             <p className="text-white text-lg">{user.financialInstitution || 'TD Bank'}</p>
                             <span className="text-xs text-emerald-500 bg-emerald-900/20 px-2 py-0.5 rounded">Active</span>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-1">{store.t('profile.joined')}</label>
                    <p className="text-white">October 24, 2023</p>
                </div>

                {isEditing && (
                    <div className="pt-4 border-t border-zinc-800">
                        <button 
                            onClick={handleSave}
                            className="px-6 py-2 bg-brand-yellow text-black font-bold rounded hover:bg-yellow-400"
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