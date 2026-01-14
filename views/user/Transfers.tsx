import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { User, Beneficiary } from '../../types';
import { Send, Plus, Trash2 } from 'lucide-react';

export const Transfers: React.FC = () => {
  const [user, setUser] = useState<User | null>(store.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'new' | 'beneficiaries'>('new');
  const [lang, setLang] = useState(store.getLanguage());
  
  // Transfer State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBen, setSelectedBen] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Beneficiary State
  const [newBenName, setNewBenName] = useState('');
  const [newBenIban, setNewBenIban] = useState('');
  const [newBenBank, setNewBenBank] = useState('');

  useEffect(() => {
    return store.subscribe(() => {
        setUser(store.getCurrentUser());
        setLang(store.getLanguage());
    });
  }, []);

  if (!user) return null;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !selectedBen) return;
    
    try {
      const benName = user.beneficiaries.find(b => b.id === selectedBen)?.name || 'Unknown';
      await store.createTransfer(user.id, parseFloat(amount), description || 'Transfer', benName);
      setMessage({ type: 'success', text: store.t('transfer.success') });
      setAmount('');
      setDescription('');
      // Update local state is handled by subscription, but we might want to ensure fetch
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleAddBeneficiary = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!newBenName || !newBenIban) return;

      await store.addBeneficiary(user.id, {
          name: newBenName,
          accountNumber: newBenIban,
          bankName: newBenBank || 'External Bank'
      });
      // Subscription should update user
      setNewBenName('');
      setNewBenIban('');
      setNewBenBank('');
      setMessage({ type: 'success', text: store.t('transfer.ben_added')});
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Transfer Form Area */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex border-b border-zinc-800">
            <button 
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-4 text-sm font-medium ${activeTab === 'new' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              {store.t('transfer.tab.new')}
            </button>
            <button 
              onClick={() => setActiveTab('beneficiaries')}
              className={`flex-1 py-4 text-sm font-medium ${activeTab === 'beneficiaries' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              {store.t('transfer.tab.ben')}
            </button>
          </div>

          <div className="p-6">
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                {message.text}
              </div>
            )}

            {activeTab === 'new' ? (
              <form onSubmit={handleTransfer} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">{store.t('transfer.recipient')}</label>
                  <select 
                    value={selectedBen}
                    onChange={(e) => setSelectedBen(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-yellow focus:outline-none"
                    required
                  >
                    <option value="">{store.t('transfer.select_ben')}</option>
                    {user.beneficiaries.map(ben => (
                      <option key={ben.id} value={ben.id}>{ben.name} ({ben.bankName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">{store.t('transfer.amount')}</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-yellow focus:outline-none text-xl font-bold"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">{store.t('transfer.desc')}</label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-yellow focus:outline-none"
                    placeholder="Payment for..."
                  />
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full bg-brand-yellow text-black font-bold py-3 rounded-lg hover:bg-yellow-400 flex items-center justify-center gap-2">
                    <Send size={18} />
                    {store.t('transfer.confirm')}
                  </button>
                </div>
              </form>
            ) : (
                <div className="space-y-6">
                    <form onSubmit={handleAddBeneficiary} className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 space-y-4">
                        <h4 className="text-white font-medium flex items-center gap-2"><Plus size={16}/> {store.t('transfer.add_new')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <input 
                                type="text"
                                placeholder={store.t('transfer.name')}
                                value={newBenName}
                                onChange={e => setNewBenName(e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 rounded p-2 text-white text-sm"
                                required
                             />
                             <input 
                                type="text"
                                placeholder={store.t('transfer.bank')}
                                value={newBenBank}
                                onChange={e => setNewBenBank(e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 rounded p-2 text-white text-sm"
                             />
                        </div>
                        <input 
                            type="text"
                            placeholder={store.t('transfer.iban')}
                            value={newBenIban}
                            onChange={e => setNewBenIban(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white text-sm"
                            required
                        />
                         <button type="submit" className="text-sm bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded">{store.t('transfer.save_ben')}</button>
                    </form>

                    <div className="space-y-2">
                        {user.beneficiaries.map(ben => (
                            <div key={ben.id} className="flex justify-between items-center p-3 bg-zinc-950 rounded border border-zinc-800">
                                <div>
                                    <p className="text-white font-medium">{ben.name}</p>
                                    <p className="text-xs text-zinc-500">{ben.accountNumber} • {ben.bankName}</p>
                                </div>
                                <button className="text-zinc-600 hover:text-red-500"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="space-y-6">
        <div className="bg-brand-darkgreen p-6 rounded-xl text-white relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
            <h3 className="font-bold text-lg mb-2">{store.t('transfer.safe_title')}</h3>
            <p className="text-sm text-emerald-100/70 mb-4">
                {store.t('transfer.safe_desc')}
            </p>
        </div>
      </div>
    </div>
  );
};