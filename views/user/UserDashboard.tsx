import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { User, TransactionType } from '../../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState(store.getLanguage());

  useEffect(() => {
    setUser(store.getCurrentUser());
    const unsub = store.subscribe(() => {
        setUser(store.getCurrentUser());
        setLang(store.getLanguage());
    });
    return unsub;
  }, []);

  if (!user) return null;

  // Prepare chart data (cumulative balance over last 5 tx)
  const chartData = [...user.transactions].reverse().map((t, index) => ({
    name: new Date(t.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
    amount: Math.abs(t.amount),
    type: t.amount > 0 ? 'Income' : 'Expense'
  })).slice(-7);

  const totalIncome = user.transactions
    .filter(t => t.amount > 0)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = user.transactions
    .filter(t => t.amount < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  return (
    <div className="space-y-6">
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
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.amount > 0 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    {t.amount > 0 ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.description}</p>
                    <p className="text-xs text-zinc-500">{new Date(t.date).toLocaleDateString()}</p>
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