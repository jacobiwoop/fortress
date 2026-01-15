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
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <button onClick={() => setActionType('deposit')} className="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors border border-zinc-800 group">
            <div className="w-12 h-12 rounded-full bg-emerald-900/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowUpRight size={24} />
            </div>
            <span className="text-sm font-medium text-zinc-300">{store.t('action.deposit')}</span>
        </button>
        <button onClick={() => setActionType('withdraw')} className="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors border border-zinc-800 group">
             <div className="w-12 h-12 rounded-full bg-red-900/30 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowDownLeft size={24} />
            </div>
            <span className="text-sm font-medium text-zinc-300">{store.t('action.withdraw')}</span>
        </button>
        <button onClick={() => window.location.hash = '#/transfers'} className="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors border border-zinc-800 group">
             <div className="w-12 h-12 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowRightLeft size={24} />
            </div>
            <span className="text-sm font-medium text-zinc-300 text-center">{store.t('action.interac')}</span>
        </button>
      </div>

      {/* Recent Notifications Widget */}
      {user.notifications && user.notifications.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell size={20} className="text-brand-yellow" />
              Recent Notifications
            </h3>
            <button 
              onClick={() => window.location.hash = '#/notifications'}
              className="text-sm text-brand-yellow hover:underline"
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
                  className={`p-4 rounded-lg border ${
                    notif.type === 'alert' 
                      ? 'bg-yellow-900/10 border-yellow-900/30' 
                      : 'bg-zinc-800/50 border-zinc-700'
                  } ${!notif.read ? 'border-l-4 border-l-brand-yellow' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      notif.type === 'alert' 
                        ? 'bg-yellow-900/30 text-yellow-400' 
                        : 'bg-blue-900/30 text-blue-400'
                    }`}>
                      {notif.type === 'alert' ? <AlertCircle size={16} /> : <Info size={16} />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-sm">{notif.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1">{notif.message}</p>
                      <p className="text-xs text-zinc-500 mt-2">
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm">
                <h3 className="text-xl font-bold text-white mb-4">
                    {actionType === 'deposit' ? store.t('action.deposit') : store.t('action.withdraw')}
                </h3>
                <form onSubmit={handleAction} className="space-y-4">
                    <div>
                        <label className="text-sm text-zinc-400">Amount</label>
                        <input 
                            type="number" 
                            autoFocus
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white text-lg focus:border-brand-yellow focus:outline-none mt-1"
                            placeholder="0.00"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setActionType(null)} className="flex-1 py-3 rounded-lg bg-zinc-800 text-white font-medium">Cancel</button>
                        <button type="submit" className="flex-1 py-3 rounded-lg bg-brand-yellow text-black font-bold">Confirm</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={64} className="text-brand-yellow" />
          </div>
          <p className="text-zinc-400 text-sm font-medium">{store.t('dash.total_balance')}</p>
          <h2 className="text-3xl font-bold text-white mt-2">
             {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(user.balance)}
          </h2>
          <div className="mt-4 text-xs text-brand-yellow font-medium flex items-center gap-1">
             <TrendingUp size={14} /> {store.t('dash.month_stat')}
          </div>
        </div>

        {/* Income */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-zinc-400 text-sm font-medium">{store.t('dash.total_income')}</p>
            <div className="p-2 bg-emerald-950 rounded-lg text-emerald-400">
                <ArrowUpRight size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mt-2">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalIncome)}
          </h3>
        </div>

        {/* Expenses */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
           <div className="flex items-center justify-between">
            <p className="text-zinc-400 text-sm font-medium">{store.t('dash.total_expenses')}</p>
            <div className="p-2 bg-red-950 rounded-lg text-red-400">
                <ArrowDownLeft size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mt-2">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalExpense)}
          </h3>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-6">{store.t('dash.overview')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FACC15" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}€`} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#FACC15" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">{store.t('dash.recent')}</h3>
          <div className="flex-1 overflow-auto space-y-4">
            {user.transactions.length === 0 && <p className="text-zinc-500 text-sm">{store.t('dash.no_tx')}</p>}

            {user.transactions.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      t.status === TransactionStatus.PENDING ? 'bg-yellow-900/30 text-yellow-500' :
                      t.status === TransactionStatus.REJECTED ? 'bg-red-900/30 text-red-500' :
                      t.amount > 0 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {t.status === TransactionStatus.PENDING ? <Clock size={18} /> : 
                     t.status === TransactionStatus.REJECTED ? <AlertCircle size={18} /> :
                     t.amount > 0 ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.description}</p>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-zinc-500">{new Date(t.date).toLocaleDateString()}</p>
                        {t.status === TransactionStatus.PENDING && <span className="text-[10px] bg-yellow-900/30 text-yellow-500 px-1.5 rounded">Pending</span>}
                        {t.status === TransactionStatus.REJECTED && <span className="text-[10px] bg-red-900/30 text-red-500 px-1.5 rounded">Rejected</span>}
                    </div>
                  </div>
                </div>
                <span className={`font-medium text-sm ${t.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                  {t.amount > 0 ? '+' : ''}{t.amount} €
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};