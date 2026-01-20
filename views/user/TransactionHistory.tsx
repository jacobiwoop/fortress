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
                return <ArrowDownLeft size={24} className="text-emerald-500" strokeWidth={2.5} />;
            case TransactionType.WITHDRAWAL:
            case TransactionType.TRANSFER_OUT:
                return <ArrowUpRight size={24} className="text-red-500" strokeWidth={2.5} />;
            case TransactionType.TRANSFER:
                return <ArrowRightLeft size={24} className="text-brand-blue" strokeWidth={2.5} />;
            case TransactionType.PAYMENT:
                return <CreditCard size={24} className="text-purple-500" strokeWidth={2.5} />;
            default:
                return <ArrowRightLeft size={24} className="text-gray-400" strokeWidth={2.5} />;
        }
    };

    // Get status badge
    const getStatusBadge = (status: TransactionStatus) => {
        switch (status) {
            case TransactionStatus.PENDING:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                        <Clock size={12} strokeWidth={2.5} /> Pending
                    </span>
                );
            case TransactionStatus.COMPLETED:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        <CheckCircle size={12} strokeWidth={2.5} /> Completed
                    </span>
                );
            case TransactionStatus.REJECTED:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        <XCircle size={12} strokeWidth={2.5} /> Rejected
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-3xl font-extrabold text-brand-navy">Transaction History</h2>
                
                {/* Filters */}
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-brand-navy font-bold focus:border-brand-blue focus:outline-none cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
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
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-brand-navy font-bold focus:border-brand-blue focus:outline-none cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
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
                <div className="bg-white border border-gray-100 rounded-[30px] p-16 flex flex-col items-center justify-center text-gray-400 shadow-sm">
                    <Filter size={64} className="mb-6 opacity-20" />
                    <p className="font-bold text-lg">No transactions found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTransactions.map((tx) => (
                        <div 
                            key={tx.id} 
                            className="bg-white border border-gray-100 rounded-[30px] p-6 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-start justify-between gap-6">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0">
                                        {getTypeIcon(tx.type)}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-bold text-brand-navy truncate text-lg">{tx.description}</h4>
                                            {getStatusBadge(tx.status)}
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-medium">
                                            <span>{tx.date && !isNaN(new Date(tx.date).getTime()) ? new Date(tx.date).toLocaleDateString() : 'N/A'}</span>
                                            <span className="text-gray-300">•</span>
                                            <span>{tx.date && !isNaN(new Date(tx.date).getTime()) ? new Date(tx.date).toLocaleTimeString() : 'N/A'}</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="bg-gray-100 px-2 py-0.5 rounded-md text-brand-navy">{tx.type}</span>
                                            {tx.counterparty && (
                                                <>
                                                    <span className="text-gray-300">•</span>
                                                    <span>{tx.counterparty}</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Admin Reason (if rejected) */}
                                        {tx.status === TransactionStatus.REJECTED && tx.adminReason && (
                                            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium">
                                                <span className="font-bold">Reason: </span>{tx.adminReason}
                                            </div>
                                        )}

                                        {/* Admin Note (if approved with reason) */}
                                        {tx.status === TransactionStatus.COMPLETED && tx.adminReason && (
                                            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-600 font-medium">
                                                <span className="font-bold">Note: </span>{tx.adminReason}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <p className={`text-xl font-extrabold ${tx.amount >= 0 ? 'text-emerald-500' : 'text-brand-navy'}`}>
                                        {tx.amount >= 0 ? '+' : ''}{store.formatCurrency(tx.amount)}
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
