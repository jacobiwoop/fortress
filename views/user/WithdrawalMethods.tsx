import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { WithdrawalMethod, WithdrawalMethodType } from '../../types';
import { CreditCard, Wallet, Smartphone, Plus, Trash2, ShieldCheck, Calendar, User as UserIcon } from 'lucide-react';

export const WithdrawalMethods: React.FC = () => {
    const [methods, setMethods] = useState<WithdrawalMethod[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newType, setNewType] = useState<WithdrawalMethodType>(WithdrawalMethodType.BANK_CARD);
    const [loading, setLoading] = useState(false);

    // Form States
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [dob, setDob] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [gpayEmail, setGpayEmail] = useState('');

    useEffect(() => {
        const user = store.getCurrentUser();
        if (user && user.withdrawalMethods) {
            setMethods(user.withdrawalMethods);
        }
        
        // Listen for updates
        return store.subscribe(() => {
            const updatedUser = store.getCurrentUser();
            if (updatedUser && updatedUser.withdrawalMethods) {
                setMethods(updatedUser.withdrawalMethods);
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const user = store.getCurrentUser();
        if(!user) return;

        try {
            let details: any = {};

            if (newType === WithdrawalMethodType.BANK_CARD) {
                details = { cardNumber, expiryDate, cvv, dateOfBirth: dob };
            } else if (newType === WithdrawalMethodType.CRYPTO) {
                details = { walletAddress };
            } else if (newType === WithdrawalMethodType.GPAY) {
                details = { email: gpayEmail };
            }

            await store.addWithdrawalMethod(user.id, newType, details);
            setIsAdding(false);
            // Reset form
            setCardNumber(''); setExpiryDate(''); setCvv(''); setDob('');
            setWalletAddress(''); setGpayEmail('');
        } catch (err) {
            alert("Failed to add method");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type: WithdrawalMethodType) => {
        switch(type) {
            case WithdrawalMethodType.BANK_CARD: return <CreditCard size={20} />;
            case WithdrawalMethodType.CRYPTO: return <Wallet size={20} />;
            case WithdrawalMethodType.GPAY: return <Smartphone size={20} />;
        }
    };

    const getTypeLabel = (type: WithdrawalMethodType) => {
         switch(type) {
            case WithdrawalMethodType.BANK_CARD: return 'Credit/Debit Card';
            case WithdrawalMethodType.CRYPTO: return 'Crypto Wallet';
            case WithdrawalMethodType.GPAY: return 'Google Pay';
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Moyens de Retrait</h3>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-sm text-brand-yellow font-bold hover:text-yellow-300 flex items-center gap-2 px-3 py-1.5 bg-brand-yellow/10 rounded-lg transition-colors"
                >
                    <Plus size={16} /> Ajouter
                </button>
            </div>

            {/* List Existing Methods */}
            <div className="space-y-4 mb-8">
                {methods.length === 0 && !isAdding && (
                    <p className="text-zinc-500 text-sm font-medium italic">Aucun moyen de retrait configuré.</p>
                )}
                {methods.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                                {getTypeIcon(m.type)}
                            </div>
                            <div>
                                <p className="font-bold text-white">{getTypeLabel(m.type)}</p>
                                <p className="text-xs text-zinc-500 font-mono">
                                    {m.type === WithdrawalMethodType.BANK_CARD && `•••• ${JSON.parse(JSON.stringify(m.details)).cardNumber?.slice(-4) || '****'}`}
                                    {m.type === WithdrawalMethodType.CRYPTO && `${JSON.parse(JSON.stringify(m.details)).walletAddress?.slice(0, 6)}...`}
                                    {m.type === WithdrawalMethodType.GPAY && JSON.parse(JSON.stringify(m.details)).email}
                                </p>
                            </div>
                        </div>
                        <div className="px-2 py-1 bg-emerald-900/20 text-emerald-500 text-xs font-bold rounded uppercase border border-emerald-900/50">
                            {m.status}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add New Method Form */}
            {isAdding && (
                <form onSubmit={handleSubmit} className="border-t border-zinc-800 pt-6 animate-fade-in">
                    <h4 className="font-bold text-white mb-4">Nouveau Moyen de Retrait</h4>
                    
                    {/* Type Selection */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {Object.values(WithdrawalMethodType).map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setNewType(t)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors border ${
                                    newType === t 
                                    ? 'bg-brand-yellow text-black border-brand-yellow' 
                                    : 'bg-zinc-950 text-zinc-400 border-zinc-700 hover:border-zinc-600'
                                }`}
                            >
                                {getTypeLabel(t)}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {newType === WithdrawalMethodType.BANK_CARD && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1">Numéro de Carte</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16}/>
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="0000 0000 0000 0000"
                                            value={cardNumber}
                                            onChange={e => setCardNumber(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-medium focus:border-brand-yellow focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 mb-1">Expiration</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16}/>
                                            <input 
                                                required
                                                type="text" 
                                                placeholder="MM/YY"
                                                value={expiryDate}
                                                onChange={e => setExpiryDate(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-medium focus:border-brand-yellow focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 mb-1">CVV</label>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16}/>
                                            <input 
                                                required
                                                type="text" 
                                                placeholder="123"
                                                value={cvv}
                                                onChange={e => setCvv(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-medium focus:border-brand-yellow focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1">Date de Naissance</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16}/>
                                        <input 
                                            required
                                            type="date" 
                                            value={dob}
                                            onChange={e => setDob(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-medium focus:border-brand-yellow focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {newType === WithdrawalMethodType.CRYPTO && (
                             <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Adresse Portefeuille</label>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="0x..."
                                    value={walletAddress}
                                    onChange={e => setWalletAddress(e.target.value)}
                                    className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-medium focus:border-brand-yellow focus:outline-none"
                                />
                            </div>
                        )}

                        {newType === WithdrawalMethodType.GPAY && (
                             <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Email Google Pay</label>
                                <input 
                                    required
                                    type="email" 
                                    placeholder="email@gmail.com"
                                    value={gpayEmail}
                                    onChange={e => setGpayEmail(e.target.value)}
                                    className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-medium focus:border-brand-yellow focus:outline-none"
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-4">
                            <button 
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-zinc-500 font-bold hover:bg-zinc-800 rounded-xl transition-colors"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-brand-yellow text-black font-bold rounded-xl hover:bg-yellow-400 shadow-lg shadow-brand-yellow/10 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Ajout...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};
