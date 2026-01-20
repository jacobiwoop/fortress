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
         <div className="bg-white border border-gray-100 rounded-[30px] p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-blue-50 rounded-2xl text-brand-blue">
                    <CircleDollarSign size={28} strokeWidth={2.5} />
                </div>
                <div>
                    <h2 className="text-2xl font-extrabold text-brand-navy">{store.t('loans.title')}</h2>
                    <p className="text-sm text-gray-400 font-bold">{store.t('loans.subtitle')}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-brand-navy pl-1 mb-2">{store.t('loans.amount_needed')}</label>
                    <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-brand-navy font-bold focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-gray-400"
                        placeholder="e.g. 5000"
                        min="100"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-brand-navy pl-1 mb-2">{store.t('loans.reason')}</label>
                    <textarea 
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-brand-navy font-bold focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-gray-400 h-32 resize-none"
                        placeholder="..."
                        required
                    />
                </div>
                <button className="w-full py-4 bg-brand-blue text-white font-bold rounded-full hover:bg-blue-600 transition-colors shadow-lg shadow-brand-blue/30 mt-2">
                    {store.t('loans.submit')}
                </button>
            </form>
         </div>
      </div>

      {/* History */}
      <div className="space-y-6">
        <h3 className="text-xl font-extrabold text-brand-navy pl-2">{store.t('loans.history')}</h3>
        {loans.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-[30px] p-12 text-center text-gray-400">
                <p className="font-bold italic">{store.t('loans.no_history')}</p>
            </div>
        ) : (
            <div className="space-y-4">
                {loans.map(loan => (
                    <div key={loan.id} className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 group">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-brand-navy font-extrabold text-xl">{loan.amount} €</p>
                                <p className="text-sm text-gray-500 font-medium">{loan.purpose}</p>
                            </div>
                            <StatusBadge status={loan.status} />
                        </div>
                        <div className="mt-2 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400 font-bold">
                            <span>{new Date(loan.requestDate).toLocaleDateString()}</span>
                            {loan.adminReason && (
                                <span className="text-brand-blue italic max-w-[200px] truncate">Note: {loan.adminReason}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: LoanStatus }) => {
    switch (status) {
        case LoanStatus.PENDING:
            return <span className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full"><Clock size={14} strokeWidth={2.5}/> {store.t('loans.status.pending')}</span>;
        case LoanStatus.APPROVED:
            return <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full"><CheckCircle2 size={14} strokeWidth={2.5}/> {store.t('loans.status.approved')}</span>;
        case LoanStatus.REJECTED:
            return <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-full"><XCircle size={14} strokeWidth={2.5}/> {store.t('loans.status.rejected')}</span>;
    }
};