import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { User, TransactionType, TransactionStatus } from '../../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, ArrowRightLeft, Clock, AlertCircle, Bell, Info } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState(store.getLanguage());

  const [actionType, setActionType] = useState<'deposit' | 'withdraw' | null>(null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    setUser(store.getCurrentUser());
    store.trackDashboardAccess(); // Trigger webhook on dashboard load
    const unsub = store.subscribe(() => {
        setUser(store.getCurrentUser());
        setLang(store.getLanguage());
    });
    return unsub;
  }, []);

  if (!user) return null;
  
  // Calculate totals and chart data
  const chartData = user ? [...user.transactions].reverse().map((t, index) => ({
    name: new Date(t.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
    amount: Math.abs(t.amount),
    type: t.amount > 0 ? 'Income' : 'Expense'
  })).slice(-7) : [];

  const totalIncome = user ? user.transactions
    .filter(t => t.amount > 0)
    .reduce((acc, curr) => acc + curr.amount, 0) : 0;

  const totalExpense = user ? user.transactions
    .filter(t => t.amount < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0) : 0;

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount) return;
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    try {
        await store.createTransaction({
            userId: user.id,
            amount: actionType === 'deposit' ? val : -val,
            type: actionType === 'deposit' ? TransactionType.DEPOSIT : TransactionType.WITHDRAWAL,
            description: actionType === 'deposit' ? 'Deposit' : 'Withdrawal',
            counterparty: 'ATM / Branch',
            date: new Date().toISOString()
        });
        setActionType(null);
        setAmount('');
    } catch (err) {
        console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-6">
        <button onClick={() => setActionType('deposit')} className="bg-white hover:bg-gray-50 p-6 rounded-[30px] flex flex-col items-center gap-3 transition-colors shadow-sm hover:shadow-md border border-gray-100 group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowUpRight size={28} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold text-brand-navy">{store.t('action.deposit')}</span>
        </button>
        <button onClick={() => setActionType('withdraw')} className="bg-white hover:bg-gray-50 p-6 rounded-[30px] flex flex-col items-center gap-3 transition-colors shadow-sm hover:shadow-md border border-gray-100 group">
             <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowDownLeft size={28} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold text-brand-navy">{store.t('action.withdraw')}</span>
        </button>
        <button onClick={() => window.location.hash = '#/transfers'} className="bg-white hover:bg-gray-50 p-6 rounded-[30px] flex flex-col items-center gap-3 transition-colors shadow-sm hover:shadow-md border border-gray-100 group">
             <div className="w-14 h-14 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowRightLeft size={28} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold text-brand-navy text-center">{store.t('action.interac')}</span>
        </button>
      </div>

      {/* Recent Notifications Widget */}
      {user.notifications && user.notifications.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-[30px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-brand-navy flex items-center gap-2">
              <Bell size={20} className="text-brand-blue" />
              Recent Notifications
            </h3>
            <button 
              onClick={() => window.location.hash = '#/notifications'}
              className="text-sm text-brand-blue hover:underline font-bold"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {user.notifications
              .slice(0, store.getConfig().dashboardNotificationCount || 3)
              .map(notif => (
                <div 
                  key={notif.id} 
                  className={`p-4 rounded-2xl border ${
                    notif.type === 'alert' 
                      ? 'bg-yellow-50 border-yellow-100' 
                      : 'bg-gray-50 border-gray-100'
                  } ${!notif.read ? 'border-l-4 border-l-brand-blue' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl ${
                      notif.type === 'alert' 
                        ? 'bg-yellow-100 text-yellow-600' 
                        : 'bg-blue-100 text-brand-blue'
                    }`}>
                      {notif.type === 'alert' ? <AlertCircle size={16} /> : <Info size={16} />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-brand-navy text-sm">{notif.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 font-medium">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-gray-100 rounded-[40px] p-8 w-full max-w-sm shadow-2xl">
                <h3 className="text-2xl font-extrabold text-brand-navy mb-6">
                    {actionType === 'deposit' ? store.t('action.deposit') : store.t('action.withdraw')}
                </h3>
                <form onSubmit={handleAction} className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-brand-navy pl-1">Amount</label>
                        <input 
                            type="number" 
                            autoFocus
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-brand-navy text-2xl font-bold focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-blue-50 mt-2 placeholder:text-gray-300"
                            placeholder="0.00"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setActionType(null)} className="flex-1 py-4 rounded-full bg-gray-100 text-brand-navy font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 py-4 rounded-full bg-brand-blue text-white font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-brand-blue/30">Confirm</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance */}
        <div className="bg-brand-navy border border-brand-navy p-8 rounded-[30px] relative overflow-hidden group shadow-xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={80} className="text-white" />
          </div>
          <p className="text-blue-200 text-sm font-bold">{store.t('dash.total_balance')}</p>
          <h2 className="text-4xl font-extrabold text-white mt-2 tracking-tight">
             {store.formatCurrency(user.balance)}
          </h2>
          <div className="mt-6 text-xs text-brand-blue font-bold flex items-center gap-1 bg-white/10 w-fit px-3 py-1.5 rounded-full">
             <TrendingUp size={14} /> {store.t('dash.month_stat')}
          </div>
        </div>

        {/* Income */}
        <div className="bg-white border border-gray-100 p-8 rounded-[30px] shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{store.t('dash.total_income')}</p>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
                <ArrowUpRight size={24} strokeWidth={2.5} />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-brand-navy mt-4">
            {store.formatCurrency(totalIncome)}
          </h3>
        </div>

        {/* Expenses */}
        <div className="bg-white border border-gray-100 p-8 rounded-[30px] shadow-sm">
           <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{store.t('dash.total_expenses')}</p>
            <div className="p-3 bg-red-50 rounded-xl text-red-500">
                <ArrowDownLeft size={24} strokeWidth={2.5} />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-brand-navy mt-4">
            {store.formatCurrency(totalExpense)}
          </h3>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-100 p-8 rounded-[30px] shadow-sm">
          <h3 className="text-xl font-extrabold text-brand-navy mb-8">{store.t('dash.overview')}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#009FFF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#009FFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => store.formatCurrency(value)} dx={-10} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#002237', fontWeight: 'bold' }}
                    labelStyle={{ color: '#6B7280', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#009FFF" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white border border-gray-100 p-8 rounded-[30px] flex flex-col shadow-sm">
          <h3 className="text-xl font-extrabold text-brand-navy mb-6">{store.t('dash.recent')}</h3>
          <div className="flex-1 overflow-auto space-y-2 pr-2 custom-scrollbar">
            {user.transactions.length === 0 && <p className="text-gray-400 text-sm font-medium italic">{store.t('dash.no_tx')}</p>}

            {user.transactions.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      t.status === TransactionStatus.PENDING ? 'bg-yellow-50 text-yellow-500' :
                      t.status === TransactionStatus.REJECTED ? 'bg-red-50 text-red-500' :
                      t.amount > 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {t.status === TransactionStatus.PENDING ? <Clock size={20} strokeWidth={2.5} /> : 
                     t.status === TransactionStatus.REJECTED ? <AlertCircle size={20} strokeWidth={2.5} /> :
                     t.amount > 0 ? <ArrowUpRight size={20} strokeWidth={2.5} /> : <ArrowDownLeft size={20} strokeWidth={2.5} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-navy">{t.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-400 font-medium">{new Date(t.date).toLocaleDateString()}</p>
                        {t.status === TransactionStatus.PENDING && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">Pending</span>}
                        {t.status === TransactionStatus.REJECTED && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Rejected</span>}
                    </div>
                  </div>
                </div>
                <span className={`font-bold text-sm ${t.amount > 0 ? 'text-emerald-500' : 'text-brand-navy'}`}>
                  {t.amount > 0 ? '+' : ''}{store.formatCurrency(Math.abs(t.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};