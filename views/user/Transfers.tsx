import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { User, TransactionType } from '../../types';
import { Send, Plus, Trash2, ArrowRight, CheckCircle, ShieldAlert, ChevronLeft, User as UserIcon } from 'lucide-react';

export const Transfers: React.FC = () => {
  const [user, setUser] = useState<User | null>(store.getCurrentUser());
  const [lang, setLang] = useState(store.getLanguage());
  
  // Wizard State
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form Data
  const [recipientName, setRecipientName] = useState('');
  const [contactInfo, setContactInfo] = useState(''); // Email or Phone
  const [addToContacts, setAddToContacts] = useState(false);
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [confirmAnswer, setConfirmAnswer] = useState('');
  
  const [msg, setMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    return store.subscribe(() => {
        setUser(store.getCurrentUser());
        setLang(store.getLanguage());
    });
  }, []);

  if (!user) return null;

  const nextStep = () => {
      setMsg(null);
      if (step === 1) {
          if (!recipientName || !contactInfo) {
              setMsg({type: 'error', text: 'Please fill in all fields.'});
              return;
          }
      }
      if (step === 2) {
          if (!amount || parseFloat(amount) <= 0) {
              setMsg({type: 'error', text: 'Invalid amount.'});
              return;
          }
          if (parseFloat(amount) > user.balance) {
              setMsg({type: 'error', text: 'Insufficient funds.'});
              return;
          }
      }
      if (step === 3) {
          if (!securityQuestion || !securityAnswer || !confirmAnswer) {
               setMsg({type: 'error', text: 'All security fields are required.'});
               return;
          }
          if (securityAnswer !== confirmAnswer) {
              setMsg({type: 'error', text: 'Answers do not match.'});
              return;
          }
      }
      setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleTransfer = async () => {
    try {
      await store.createTransaction({
          userId: user.id,
          amount: -parseFloat(amount),
          type: TransactionType.TRANSFER,
          description: `Interac: ${recipientName} (${description})`,
          counterparty: recipientName,
          date: new Date().toISOString()
      });
      
      // If add to contacts was checked
      if (addToContacts) {
          await store.addBeneficiary(user.id, {
              name: recipientName,
              accountNumber: contactInfo,
              bankName: 'Interac Contact'
          });
      }

      setMsg({ type: 'success', text: store.t('transfer.success') });
      setTimeout(() => {
          // Reset form
          setStep(1);
          setRecipientName('');
          setContactInfo('');
          setAmount('');
          setDescription('');
          setSecurityQuestion('');
          setSecurityAnswer('');
          setConfirmAnswer('');
          setMsg(null);
      }, 3000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      
      {/* Stepper */}
      <div className="flex items-center justify-between relative mb-8">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-zinc-800 -z-10"></div>
            {[1, 2, 3, 4].map(s => (
                <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-4 border-black ${step >= s ? 'bg-brand-yellow text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                    {step > s ? <CheckCircle size={18}/> : s}
                </div>
            ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
                {step === 1 && store.t('interac.step1')}
                {step === 2 && store.t('interac.step2')}
                {step === 3 && store.t('interac.step3')}
                {step === 4 && store.t('interac.step4')}
            </h2>
            <p className="text-zinc-400 text-sm">Step {step} of {totalSteps}</p>
        </div>

        {msg && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/50' : 'bg-red-900/30 text-red-400 border border-red-900/50'}`}>
            {msg.text}
            </div>
        )}

        {/* Form Steps */}
        <div className="space-y-6">
            
            {/* Step 1: Recipient */}
            {step === 1 && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">{store.t('transfer.recipient')}</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                            <input 
                                type="text"
                                className="w-full bg-black border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-white focus:border-brand-yellow focus:outline-none"
                                placeholder="Name"
                                value={recipientName}
                                onChange={e => setRecipientName(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">{store.t('interac.contact_info')}</label>
                        <input 
                            type="text"
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-yellow focus:outline-none"
                            placeholder="email@example.com / 514-555-0199"
                            value={contactInfo}
                            onChange={e => setContactInfo(e.target.value)}
                        />
                    </div>
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${addToContacts ? 'bg-brand-yellow border-brand-yellow' : 'border-zinc-700 bg-zinc-800'}`}>
                            {addToContacts && <CheckCircle size={14} className="text-black" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={addToContacts} onChange={e => setAddToContacts(e.target.checked)} />
                        <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">{store.t('interac.add_contact')}</span>
                    </label>
                </>
            )}

            {/* Step 2: Amount */}
            {step === 2 && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">{store.t('transfer.amount')}</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-zinc-500">€</span>
                            <input 
                                type="number"
                                className="w-full bg-black border border-zinc-800 rounded-lg py-4 pl-10 pr-4 text-white text-3xl font-bold focus:border-brand-yellow focus:outline-none"
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <p className="text-right text-xs text-brand-yellow mt-2 font-medium">{store.t('interac.fees')}</p>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">{store.t('transfer.desc')}</label>
                        <input 
                            type="text"
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-yellow focus:outline-none"
                            placeholder="Optional message..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>
                </>
            )}

            {/* Step 3: Security */}
            {step === 3 && (
                <>
                    <div className="p-4 bg-brand-yellow/10 border border-brand-yellow/20 rounded-lg flex items-start gap-3">
                        <ShieldAlert className="text-brand-yellow shrink-0 mt-0.5" size={20} />
                        <p className="text-sm text-brand-yellow/90 leading-relaxed font-medium">
                            {store.t('interac.warning')}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">{store.t('interac.security_q')}</label>
                        <input 
                            type="text"
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-yellow focus:outline-none"
                            placeholder="e.g. Name of my first pet?"
                            value={securityQuestion}
                            onChange={e => setSecurityQuestion(e.target.value)}
                            autoFocus
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">{store.t('interac.security_a')}</label>
                        <input 
                            type="password"
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-yellow focus:outline-none"
                            value={securityAnswer}
                            onChange={e => setSecurityAnswer(e.target.value)}
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">{store.t('interac.security_a_confirm')}</label>
                        <input 
                            type="password"
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-yellow focus:outline-none"
                            value={confirmAnswer}
                            onChange={e => setConfirmAnswer(e.target.value)}
                        />
                    </div>
                </>
            )}

            {/* Step 4: Summary */}
            {step === 4 && (
                <div className="space-y-4">
                    <div className="bg-black/50 rounded-xl p-4 space-y-4 border border-zinc-800">
                        <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                            <span className="text-zinc-500">{store.t('interac.step1')}</span>
                            <div className="text-right">
                                <p className="text-white font-medium">{recipientName}</p>
                                <p className="text-xs text-zinc-500">{contactInfo}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                            <span className="text-zinc-500">{store.t('interac.step2')}</span>
                            <span className="text-xl font-bold text-white">€{amount}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                             <span className="text-zinc-500">{store.t('interac.security_q')}</span>
                             <span className="text-white text-sm italic">"{securityQuestion}"</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4">
                {step > 1 && (
                    <button 
                        onClick={prevStep}
                        className="flex-1 py-3 px-4 rounded-lg bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <ChevronLeft size={20} /> Back
                    </button>
                )}
                
                {step < totalSteps ? (
                    <button 
                        onClick={nextStep}
                        className="flex-1 py-3 px-4 rounded-lg bg-white text-black font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                    >
                        Next <ArrowRight size={20} />
                    </button>
                ) : (
                    <button 
                        onClick={handleTransfer}
                        className="flex-1 py-3 px-4 rounded-lg bg-brand-yellow text-black font-bold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                    >
                        {store.t('interac.send')} <Send size={18} />
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};