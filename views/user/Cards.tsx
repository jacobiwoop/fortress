import React, { useEffect, useState } from 'react';
import { store } from '../../services/store';
import { Wifi, Copy } from 'lucide-react';

export const Cards: React.FC = () => {
  const [user, setUser] = useState(store.getCurrentUser());
  const [lang, setLang] = useState(store.getLanguage());

  useEffect(() => {
    return store.subscribe(() => {
        setUser(store.getCurrentUser());
        setLang(store.getLanguage());
    });
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">{store.t('cards.title')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Virtual Card Visualization */}
        <div className="relative h-56 bg-gradient-to-br from-zinc-800 to-black rounded-2xl p-6 shadow-2xl border border-zinc-700 flex flex-col justify-between overflow-hidden group">
          <div className="absolute top-0 right-0 p-32 bg-brand-yellow opacity-5 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
          
          <div className="flex justify-between items-start z-10">
            <h3 className="text-xl font-bold text-white italic">Fortress</h3>
            <Wifi className="text-zinc-500 rotate-90" />
          </div>

          <div className="z-10 mt-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-yellow-600/50 rounded flex overflow-hidden relative">
                    <div className="absolute left-0 top-2 w-full h-[1px] bg-yellow-300/40"></div>
                    <div className="absolute left-2 top-0 h-full w-[1px] bg-yellow-300/40"></div>
                </div>
                <Wifi className="rotate-90 text-white/50" size={20}/>
            </div>
            <p className="text-xl font-mono text-white tracking-widest mt-4">
                {user.cardNumber || '**** **** **** ****'}
            </p>
          </div>

          <div className="flex justify-between items-end z-10">
            <div>
              <p className="text-xs text-zinc-500 uppercase">{store.t('cards.holder')}</p>
              <p className="text-sm font-medium text-zinc-200">{user.name.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase">{store.t('cards.expires')}</p>
              <p className="text-sm font-medium text-zinc-200">12/28</p>
            </div>
             <div className="w-10 h-6 bg-white/20 rounded-sm"></div>
          </div>
        </div>

        {/* Card Details & Controls */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <span className="text-zinc-400">{store.t('cards.status')}</span>
            <span className="px-3 py-1 bg-emerald-900/50 text-emerald-400 text-xs font-bold rounded-full border border-emerald-900">
              ACTIVE
            </span>
          </div>

          <div className="space-y-4">
             <div>
                <label className="text-xs text-zinc-500 uppercase block mb-1">{store.t('cards.number')}</label>
                <div className="flex gap-2">
                    <input readOnly value={user.cardNumber || ''} className="bg-zinc-950 border border-zinc-800 text-zinc-300 p-2 rounded flex-1 font-mono text-sm" />
                    <button className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded"><Copy size={16} /></button>
                </div>
             </div>
             <div>
                <label className="text-xs text-zinc-500 uppercase block mb-1">{store.t('cards.cvv')}</label>
                 <div className="flex gap-2">
                    <input type="password" readOnly value={user.cvv || '***'} className="bg-zinc-950 border border-zinc-800 text-zinc-300 p-2 rounded w-20 font-mono text-sm" />
                </div>
             </div>
          </div>

          <div className="pt-4 flex gap-4">
             <button className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded transition-colors">{store.t('cards.freeze')}</button>
             <button className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded transition-colors">{store.t('cards.settings')}</button>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-bold text-white mb-4">{store.t('cards.history')}</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
             {user.transactions.filter(t => t.type === 'PAYMENT').length === 0 ? (
                 <div className="p-8 text-center text-zinc-500">{store.t('cards.no_tx')}</div>
             ) : (
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-zinc-950 text-zinc-200">
                        <tr>
                            <th className="p-4">{store.t('cards.date')}</th>
                            <th className="p-4">{store.t('cards.merchant')}</th>
                            <th className="p-4 text-right">{store.t('transfer.amount')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {user.transactions.filter(t => t.type === 'PAYMENT').map(t => (
                            <tr key={t.id} className="border-t border-zinc-800 hover:bg-zinc-800/30">
                                <td className="p-4">{new Date(t.date).toLocaleDateString()}</td>
                                <td className="p-4 text-white">{t.description}</td>
                                <td className="p-4 text-right text-white">{t.amount} €</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             )}
        </div>
      </div>
    </div>
  );
};