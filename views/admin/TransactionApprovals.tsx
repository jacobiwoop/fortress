import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { Transaction, User, TransactionStatus } from '../../types';
import { Check, X, Clock, Send, DollarSign } from 'lucide-react';

export const TransactionApprovals: React.FC = () => {
    const [pendingTxs, setPendingTxs] = useState<{ tx: Transaction, user: User }[]>([]);
    const [msg, setMsg] = useState('');
    const [reasons, setReasons] = useState<Record<string, string>>({});
    const [paymentLinks, setPaymentLinks] = useState<Record<string, string>>({});
    const [paymentMessages, setPaymentMessages] = useState<Record<string, string>>({});

    useEffect(() => {
        // Fetch all users (which includes their transactions)
        store.fetchUsers();
        
        setPendingTxs(store.getPendingTransactions());
        const unsub = store.subscribe(() => {
            setPendingTxs(store.getPendingTransactions());
        });
        return unsub;
    }, []);

    const handleApprove = (txId: string) => {
        const reason = reasons[txId] || '';
        store.approveTransaction(txId, reason);
        setMsg('Transaction approved successfully.');
        setReasons(prev => {
            const newReasons = { ...prev };
            delete newReasons[txId];
            return newReasons;
        });
        setTimeout(() => setMsg(''), 3000);
    };

    const handleReject = (txId: string) => {
        const reason = reasons[txId] || '';
        if (confirm('Are you sure you want to reject this transaction? Funds will be refunded to the user.')) {
            store.rejectTransaction(txId, reason);
            setMsg('Transaction rejected and funds refunded.');
            setReasons(prev => {
                const newReasons = { ...prev };
                delete newReasons[txId];
                return newReasons;
            });
            setTimeout(() => setMsg(''), 3000);
        }
    };

    const handleSendPaymentInstructions = async (txId: string) => {
        const paymentLink = paymentLinks[txId] || '';
        const adminMessage = paymentMessages[txId] || '';
        
        if (!paymentLink || !adminMessage) {
            alert('Please provide both payment link and message');
            return;
        }

        const success = await store.sendDepositInstructions(txId, paymentLink, adminMessage);
        if (success) {
            setMsg('Payment instructions sent to user.');
            setPaymentLinks(prev => {
                const newLinks = { ...prev };
                delete newLinks[txId];
                return newLinks;
            });
            setPaymentMessages(prev => {
                const newMessages = { ...prev };
                delete newMessages[txId];
                return newMessages;
            });
            setTimeout(() => setMsg(''), 3000);
        }
    };

    const pendingDeposits = pendingTxs.filter(({ tx }) => tx.type === 'DEPOSIT' && !tx.paymentLink);
    const pendingOthers = pendingTxs.filter(({ tx }) => tx.type !== 'DEPOSIT' || tx.paymentLink);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Transaction Approvals</h2>
            
            {msg && (
                <div className="p-4 bg-emerald-900/20 border border-emerald-900/50 rounded-lg text-emerald-400">
                    {msg}
                </div>
            )}

            {/* Pending Deposit Requests - Need Payment Instructions */}
            {pendingDeposits.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <DollarSign size={24} className="text-brand-yellow" />
                        Pending Deposits - Send Payment Instructions ({pendingDeposits.length})
                    </h3>
                    <div className="grid gap-4">
                        {pendingDeposits.map(({ tx, user }) => (
                            <div key={tx.id} className="bg-zinc-900 border-2 border-brand-yellow/30 p-6 rounded-xl space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{user.name}</h4>
                                        <p className="text-zinc-400 text-sm">{user.email}</p>
                                        <p className="text-xs text-zinc-500 mt-1">{new Date(tx.date).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-brand-yellow">
                                            {store.formatCurrency(tx.amount)}
                                        </p>
                                        <p className="text-xs text-zinc-500">Deposit Request</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                                            Payment Link *
                                        </label>
                                        <input
                                            type="url"
                                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-yellow focus:outline-none"
                                            placeholder="https://payment.example.com/..."
                                            value={paymentLinks[tx.id] || ''}
                                            onChange={(e) => setPaymentLinks(prev => ({ ...prev, [tx.id]: e.target.value }))}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                                            Message to User *
                                        </label>
                                        <textarea
                                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-yellow focus:outline-none"
                                            placeholder="Confirmez votre dépôt de [montant] via ce lien, l'argent est reversé automatiquement"
                                            rows={3}
                                            value={paymentMessages[tx.id] || ''}
                                            onChange={(e) => setPaymentMessages(prev => ({ ...prev, [tx.id]: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={() => handleSendPaymentInstructions(tx.id)}
                                        className="py-2 px-4 bg-brand-yellow hover:bg-yellow-400 text-black rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Send size={18} /> Send Payment Instructions
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Other Pending Transactions */}
            {pendingOthers.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Other Pending Transactions ({pendingOthers.length})</h3>
                    <div className="grid gap-4">
                        {pendingOthers.map(({ tx, user }) => (
                            <div key={tx.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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

                                    <span className="text-xl font-bold text-white">
                                        {store.formatCurrency(Math.abs(tx.amount))}
                                    </span>
                                </div>

                                {/* Reason Input */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                                        Reason (optional)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-yellow focus:outline-none"
                                        placeholder="Explain why you're approving or rejecting..."
                                        value={reasons[tx.id] || ''}
                                        onChange={(e) => setReasons(prev => ({ ...prev, [tx.id]: e.target.value }))}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 justify-end">
                                    <button 
                                        onClick={() => handleReject(tx.id)}
                                        className="px-4 py-2 hover:bg-red-900/30 text-zinc-400 hover:text-red-400 rounded-lg transition-colors flex items-center gap-2"
                                        title="Reject"
                                    >
                                        <X size={18} /> Reject
                                    </button>
                                    <button 
                                        onClick={() => handleApprove(tx.id)}
                                        className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Check size={18} /> Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {pendingTxs.length === 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center text-zinc-500">
                    <Check size={48} className="mb-4 text-emerald-500/50"/>
                    <p>No pending transactions.</p>
                </div>
            )}
        </div>
    );
};
