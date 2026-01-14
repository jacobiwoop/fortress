import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { Loan, LoanStatus } from '../../types';
import { CircleDollarSign, Clock, CheckCircle2, XCircle } from 'lucide-react';

export const Loans: React.FC = () => {
  const [user, setUser] = useState(store.getCurrentUser());
  const [loans, setLoans] = useState<Loan[]>([]);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [lang, setLang] = useState(store.getLanguage());

  useEffect(() => {
    store.fetchLoans(); 
    const unsub = store.subscribe(() => {
        const u = store.getCurrentUser();
        setUser(u);
        setLang(store.getLanguage());
        if (u) {
            setLoans(store.getLoans().filter(l => l.userId === u.id));
        }
    });
    
    // Initial load
    if (user) {
        setLoans(store.getLoans().filter(l => l.userId === user.id));
    }

    return unsub;
  }, [submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !purpose) return;

    await store.requestLoan(user.id, parseFloat(amount), purpose);
    setAmount('');
    setPurpose('');
    setSubmitted(!submitted);
  };

  if (!user) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Request Form */}
      <div>
         <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-brand-yellow/10 rounded-full text-brand-yellow">
                    <CircleDollarSign size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">{store.t('loans.title')}</h2>
                    <p className="text-sm text-zinc-400">{store.t('loans.subtitle')}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">{store.t('loans.amount_needed')}</label>
                    <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:border-brand-yellow focus:outline-none"
                        placeholder="e.g. 5000"
                        min="100"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">{store.t('loans.reason')}</label>
                    <textarea 
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:border-brand-yellow focus:outline-none h-24 resize-none"
                        placeholder="..."
                        required
                    />
                </div>
                <button className="w-full py-3 bg-brand-yellow text-black font-bold rounded hover:bg-yellow-400 transition-colors">
                    {store.t('loans.submit')}
                </button>
            </form>
         </div>
      </div>

      {/* History */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">{store.t('loans.history')}</h3>
        {loans.length === 0 ? (
            <p className="text-zinc-500 italic">{store.t('loans.no_history')}</p>
        ) : (
            loans.map(loan => (
                <div key={loan.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-white font-semibold text-lg">{loan.amount} €</p>
                            <p className="text-sm text-zinc-400">{loan.purpose}</p>
                        </div>
                        <StatusBadge status={loan.status} />
                    </div>
                    <div className="mt-2 pt-2 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
                        <span>{new Date(loan.requestDate).toLocaleDateString()}</span>
                        {loan.adminReason && (
                            <span className="text-zinc-300 italic max-w-[200px] truncate">Note: {loan.adminReason}</span>
                        )}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: LoanStatus }) => {
    switch (status) {
        case LoanStatus.PENDING:
            return <span className="flex items-center gap-1 px-2 py-1 bg-yellow-900/30 text-yellow-500 text-xs rounded border border-yellow-900/50"><Clock size={12}/> {store.t('loans.status.pending')}</span>;
        case LoanStatus.APPROVED:
            return <span className="flex items-center gap-1 px-2 py-1 bg-emerald-900/30 text-emerald-500 text-xs rounded border border-emerald-900/50"><CheckCircle2 size={12}/> {store.t('loans.status.approved')}</span>;
        case LoanStatus.REJECTED:
            return <span className="flex items-center gap-1 px-2 py-1 bg-red-900/30 text-red-500 text-xs rounded border border-red-900/50"><XCircle size={12}/> {store.t('loans.status.rejected')}</span>;
    }
};