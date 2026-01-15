import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { User, Transaction, TransactionType, TransactionStatus } from '../../types';
import { 
    ArrowUpRight, 
    ArrowDownLeft, 
    ArrowRightLeft, 
    CreditCard,
    Clock,
    CheckCircle,
    XCircle,
    Filter
    
} from 'lucide-react';

export const TransactionHistory: React.FC = () => {
    const [user, setUser] = useState<User | null>(store.getCurrentUser());
    const [filterType, setFilterType] = useState<string>('ALL');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');

    useEffect(() => {
        return store.subscribe(() => {
            setUser(store.getCurrentUser());
        });
    }, []);

    if (!user) return null;

    // Filter transactions
    const filteredTransactions = user.transactions.filter(tx => {
        const typeMatch = filterType === 'ALL' || tx.type === filterType;
        const statusMatch = filterStatus === 'ALL' || tx.status === filterStatus;
        return typeMatch && statusMatch;
    });

    // Get icon for transaction type
    const getTypeIcon = (type: TransactionType) => {
        switch (type) {
            case TransactionType.DEPOSIT:
            case TransactionType.TRANSFER_IN:
                return <ArrowDownLeft size={20} className="text-emerald-400" />;
            case TransactionType.WITHDRAWAL:
            case TransactionType.TRANSFER_OUT:
                return <ArrowUpRight size={20} className="text-red-400" />;
            case TransactionType.TRANSFER:
                return <ArrowRightLeft size={20} className="text-blue-400" />;
            case TransactionType.PAYMENT:
                return <CreditCard size={20} className="text-purple-400" />;
            default:
                return <ArrowRightLeft size={20} className="text-zinc-400" />;
        }
    };

    // Get status badge
    const getStatusBadge = (status: TransactionStatus) => {
        switch (status) {
            case TransactionStatus.PENDING:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400 border border-yellow-900/50">
                        <Clock size={12} /> Pending
                    </span>
                );
            case TransactionStatus.COMPLETED:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-900/50">
                        <CheckCircle size={12} /> Completed
                    </span>
                );
            case TransactionStatus.REJECTED:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-900/50">
                        <XCircle size={12} /> Rejected
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-white">Transaction History</h2>
                
                {/* Filters */}
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-yellow focus:outline-none"
                        >
                            <option value="ALL">All Types</option>
                            <option value={TransactionType.DEPOSIT}>Deposit</option>
                            <option value={TransactionType.WITHDRAWAL}>Withdrawal</option>
                            <option value={TransactionType.TRANSFER}>Transfer</option>
                            <option value={TransactionType.TRANSFER_IN}>Transfer In</option>
                            <option value={TransactionType.TRANSFER_OUT}>Transfer Out</option>
                            <option value={TransactionType.PAYMENT}>Payment</option>
                        </select>
                    </div>
                    <div className="flex-1 sm:flex-none">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-yellow focus:outline-none"
                        >
                            <option value="ALL">All Status</option>
                            <option value={TransactionStatus.PENDING}>Pending</option>
                            <option value={TransactionStatus.COMPLETED}>Completed</option>
                            <option value={TransactionStatus.REJECTED}>Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Transaction List */}
            {filteredTransactions.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center text-zinc-500">
                    <Filter size={48} className="mb-4 opacity-50" />
                    <p>No transactions found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredTransactions.map((tx) => (
                        <div 
                            key={tx.id} 
                            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                                        {getTypeIcon(tx.type)}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-white truncate">{tx.description}</h4>
                                            {getStatusBadge(tx.status)}
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                                            <span>{new Date(tx.date).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{new Date(tx.date).toLocaleTimeString()}</span>
                                            <span>•</span>
                                            <span className="bg-zinc-800 px-2 py-0.5 rounded">{tx.type}</span>
                                            {tx.counterparty && (
                                                <>
                                                    <span>•</span>
                                                    <span>{tx.counterparty}</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Admin Reason (if rejected) */}
                                        {tx.status === TransactionStatus.REJECTED && tx.adminReason && (
                                            <div className="mt-2 p-2 bg-red-900/10 border border-red-900/30 rounded text-xs text-red-400">
                                                <span className="font-medium">Reason: </span>{tx.adminReason}
                                            </div>
                                        )}

                                        {/* Admin Note (if approved with reason) */}
                                        {tx.status === TransactionStatus.COMPLETED && tx.adminReason && (
                                            <div className="mt-2 p-2 bg-emerald-900/10 border border-emerald-900/30 rounded text-xs text-emerald-400">
                                                <span className="font-medium">Note: </span>{tx.adminReason}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <p className={`text-lg font-bold ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {tx.amount >= 0 ? '+' : ''}{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(tx.amount)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
