import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { Loan, LoanStatus } from '../../types';
import { Check, X, Search } from 'lucide-react';

export const LoanApprovals: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [decisionNote, setDecisionNote] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [lang, setLang] = useState(store.getLanguage());

  useEffect(() => {
    store.fetchLoans(); // Fetch from API
    setLoans(store.getLoans());
    const unsub = store.subscribe(() => {
        setLoans(store.getLoans());
        setLang(store.getLanguage());
    });
    return unsub;
  }, []);

  const handleDecision = (approved: boolean) => {
      if(!processingId || !decisionNote) {
          alert("Please provide a reason.");
          return;
      }
      store.processLoan(processingId, approved, decisionNote);
      setProcessingId(null);
      setDecisionNote('');
  };

  const pendingLoans = loans.filter(l => l.status === LoanStatus.PENDING);
  const historyLoans = loans.filter(l => l.status !== LoanStatus.PENDING);

  return (
    <div className="space-y-8">
      {/* Pending Requests */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">{store.t('approvals.pending')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingLoans.length === 0 && <p className="text-zinc-500">{store.t('approvals.no_pending')}</p>}
            {pendingLoans.map(loan => (
                <div key={loan.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative">
                     {processingId === loan.id ? (
                         <div className="absolute inset-0 bg-zinc-900 p-6 flex flex-col gap-4 z-10 rounded-xl">
                             <h4 className="text-white font-bold">{store.t('approvals.confirm_dec')}</h4>
                             <textarea 
                                value={decisionNote}
                                onChange={e => setDecisionNote(e.target.value)}
                                className="flex-1 bg-zinc-950 border border-zinc-700 p-2 text-white rounded text-sm resize-none"
                                placeholder={store.t('approvals.reason_ph')}
                             />
                             <div className="flex gap-2">
                                 <button onClick={() => setProcessingId(null)} className="flex-1 bg-zinc-800 text-white py-2 rounded">{store.t('users.cancel')}</button>
                                 <button onClick={() => handleDecision(false)} className="flex-1 bg-red-900/50 text-red-400 py-2 rounded border border-red-900">{store.t('approvals.reject')}</button>
                                 <button onClick={() => handleDecision(true)} className="flex-1 bg-emerald-900/50 text-emerald-400 py-2 rounded border border-emerald-900">{store.t('approvals.approve')}</button>
                             </div>
                         </div>
                     ) : null}

                     <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-zinc-500 text-sm">{store.t('approvals.applicant')}</p>
                            <p className="text-white font-medium">{loan.userName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-zinc-500 text-sm">{store.t('transfer.amount')}</p>
                            <p className="text-emerald-400 font-bold text-xl">{loan.amount} €</p>
                        </div>
                     </div>
                     <div className="bg-zinc-950 p-3 rounded text-zinc-300 text-sm mb-4">
                         <span className="text-zinc-500 text-xs block uppercase mb-1">{store.t('approvals.purpose')}</span>
                         {loan.purpose}
                     </div>
                     <div className="flex gap-2">
                         <button 
                            onClick={() => setProcessingId(loan.id)}
                            className="w-full py-2 bg-brand-yellow text-black font-bold rounded hover:bg-yellow-400"
                        >
                            {store.t('approvals.review')}
                         </button>
                     </div>
                </div>
            ))}
        </div>
      </div>

      {/* History Table */}
      <div>
         <h2 className="text-xl font-bold text-white mb-4">{store.t('approvals.history')}</h2>
         <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-zinc-950 text-zinc-200">
                    <tr>
                        <th className="p-3">{store.t('approvals.col.user')}</th>
                        <th className="p-3">{store.t('transfer.amount')}</th>
                        <th className="p-3">{store.t('users.col.status')}</th>
                        <th className="p-3">{store.t('approvals.col.reason')}</th>
                    </tr>
                </thead>
                <tbody>
                    {historyLoans.map(loan => (
                        <tr key={loan.id} className="border-t border-zinc-800">
                            <td className="p-3">{loan.userName}</td>
                            <td className="p-3">{loan.amount} €</td>
                            <td className="p-3">
                                <span className={`text-xs px-2 py-1 rounded ${loan.status === LoanStatus.APPROVED ? 'text-emerald-500 bg-emerald-900/20' : 'text-red-500 bg-red-900/20'}`}>
                                    {loan.status}
                                </span>
                            </td>
                            <td className="p-3 truncate max-w-xs">{loan.adminReason}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};