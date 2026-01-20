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
      <h2 className="text-3xl font-extrabold text-brand-navy mb-8">{store.t('cards.title')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Virtual Card Visualization */}
        <div className="relative h-60 bg-gradient-to-br from-brand-navy to-blue-900 rounded-[30px] p-8 shadow-2xl flex flex-col justify-between overflow-hidden group transition-all hover:scale-[1.02]">
          <div className="absolute top-0 right-0 p-32 bg-brand-blue opacity-10 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
          
          <div className="flex justify-between items-start z-10">
            <h3 className="text-2xl font-extrabold text-white italic tracking-tighter">Fortress</h3>
            <Wifi className="text-white/50 rotate-90" />
          </div>

          <div className="z-10 mt-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-yellow-400/80 rounded flex overflow-hidden relative shadow-lg">
                    <div className="absolute left-0 top-2 w-full h-[1px] bg-yellow-200/40"></div>
                    <div className="absolute left-2 top-0 h-full w-[1px] bg-yellow-200/40"></div>
                </div>
                <Wifi className="rotate-90 text-white/50" size={20}/>
            </div>
            <p className="text-xl font-mono text-white tracking-widest mt-6 drop-shadow-md">
                {user.cardNumber || '**** **** **** ****'}
            </p>
          </div>

          <div className="flex justify-between items-end z-10">
            <div>
              <p className="text-[10px] text-blue-200/70 font-bold uppercase tracking-wider">{store.t('cards.holder')}</p>
              <p className="text-sm font-bold text-white tracking-wide">{user.name.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-200/70 font-bold uppercase tracking-wider">{store.t('cards.expires')}</p>
              <p className="text-sm font-bold text-white tracking-wide">12/28</p>
            </div>
             <div className="w-12 h-8 bg-white/20 rounded-md backdrop-blur-sm border border-white/10"></div>
          </div>
        </div>

        {/* Card Details & Controls */}
        <div className="bg-white border border-gray-100 rounded-[30px] p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-gray-100">
            <span className="text-gray-500 font-bold">{store.t('cards.status')}</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-extrabold rounded-full border border-emerald-100 uppercase tracking-wide">
              ACTIVE
            </span>
          </div>

          <div className="space-y-4">
             <div>
                <label className="text-xs text-brand-blue font-bold uppercase tracking-wider block mb-2">{store.t('cards.number')}</label>
                <div className="flex gap-2">
                    <input readOnly value={user.cardNumber || ''} className="bg-gray-50 border border-gray-200 text-brand-navy p-3 rounded-xl flex-1 font-mono text-sm font-medium focus:outline-none" />
                    <button className="p-3 bg-gray-100 hover:bg-gray-200 text-brand-navy rounded-xl transition-colors"><Copy size={18} /></button>
                </div>
             </div>
             <div>
                <label className="text-xs text-brand-blue font-bold uppercase tracking-wider block mb-2">{store.t('cards.cvv')}</label>
                 <div className="flex gap-2">
                    <input type="password" readOnly value={user.cvv || '***'} className="bg-gray-50 border border-gray-200 text-brand-navy p-3 rounded-xl w-24 font-mono text-sm font-medium focus:outline-none" />
                </div>
             </div>
          </div>

          <div className="pt-2 flex gap-4">
             <button className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-brand-navy font-bold text-sm rounded-xl transition-colors">{store.t('cards.freeze')}</button>
             <button className="flex-1 py-3 bg-brand-navy text-white text-sm font-bold rounded-xl hover:bg-brand-navy/90 transition-colors shadow-lg shadow-brand-navy/20">{store.t('cards.settings')}</button>
          </div>
        </div>
      </div>
      
      <div className="mt-12">
        <h3 className="text-xl font-extrabold text-brand-navy mb-6 text-brand-navy">{store.t('cards.history')}</h3>
        <div className="bg-white border border-gray-100 rounded-[30px] overflow-hidden shadow-sm">
             {user.transactions.filter(t => t.type === 'PAYMENT').length === 0 ? (
                 <div className="p-12 text-center text-gray-400 font-medium italic">{store.t('cards.no_tx')}</div>
             ) : (
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="bg-gray-50 text-brand-navy font-bold uppercase tracking-wider text-xs">
                        <tr>
                            <th className="p-6">{store.t('cards.date')}</th>
                            <th className="p-6">{store.t('cards.merchant')}</th>
                            <th className="p-6 text-right">{store.t('transfer.amount')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {user.transactions.filter(t => t.type === 'PAYMENT').map(t => (
                            <tr key={t.id} className="hover:bg-blue-50/50 transition-colors">
                                <td className="p-6 font-medium">{new Date(t.date).toLocaleDateString()}</td>
                                <td className="p-6 text-brand-navy font-bold">{t.description}</td>
                                <td className="p-6 text-right text-brand-navy font-bold">{t.amount} €</td>
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