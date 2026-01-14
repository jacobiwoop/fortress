import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { Transaction, User, TransactionStatus } from '../../types';
import { Check, X, Clock, HelpCircle } from 'lucide-react';

export const TransactionApprovals: React.FC = () => {
    const [pendingTxs, setPendingTxs] = useState<{ tx: Transaction, user: User }[]>([]);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        setPendingTxs(store.getPendingTransactions());
        const unsub = store.subscribe(() => {
            setPendingTxs(store.getPendingTransactions());
        });
        return unsub;
    }, []);

    const handleApprove = (txId: string) => {
        store.approveTransaction(txId);
        setMsg('Transaction approved successfully.');
        setTimeout(() => setMsg(''), 3000);
    };

    const handleReject = (txId: string) => {
        if (confirm('Are you sure you want to reject this transaction? Funds will be refunded to the user.')) {
            store.rejectTransaction(txId);
            setMsg('Transaction rejected and funds refunded.');
            setTimeout(() => setMsg(''), 3000);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Transaction Approvals</h2>
            
            {msg && (
                <div className="p-4 bg-emerald-900/20 border border-emerald-900/50 rounded-lg text-emerald-400">
                    {msg}
                </div>
            )}

            {pendingTxs.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center text-zinc-500">
                    <Check size={48} className="mb-4 text-emerald-500/50"/>
                    <p>No pending transactions.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pendingTxs.map(({ tx, user }) => (
                        <div key={tx.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-yellow-900/20 text-yellow-400 flex items-center justify-center">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">{user.name}</h4>
                                    <p className="text-zinc-400 text-sm">{tx.description}</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                                        <span>{new Date(tx.date).toLocaleString()}</span>
                                        <span>•</span>
                                        <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">{tx.type}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                <span className="text-xl font-bold text-white">
                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Math.abs(tx.amount))}
                                </span>
                                
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleReject(tx.id)}
                                        className="p-2 hover:bg-red-900/30 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"
                                        title="Reject"
                                    >
                                        <X size={20} />
                                    </button>
                                    <button 
                                        onClick={() => handleApprove(tx.id)}
                                        className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Check size={18} /> Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
