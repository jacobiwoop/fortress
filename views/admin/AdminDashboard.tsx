import React, { useEffect, useState } from 'react';
import { store } from '../../services/store';
import { User, LoanStatus } from '../../types';
import { Users, AlertTriangle, Briefcase, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>(store.getUsers());
  const [loans, setLoans] = useState(store.getLoans());
  const [lang, setLang] = useState(store.getLanguage());

  useEffect(() => {
    const unsub = store.subscribe(() => {
        setUsers(store.getUsers());
        setLoans(store.getLoans());
        setLang(store.getLanguage());
    });
    return unsub;
  }, []);

  const totalFunds = users.reduce((acc, u) => acc + u.balance, 0);
  const pendingLoans = loans.filter(l => l.status === LoanStatus.PENDING).length;
  const activeUsers = users.filter(u => u.role === 'USER').length;

  // Mock data for chart
  const data = [
    { name: 'Mon', active: 40 },
    { name: 'Tue', active: 55 },
    { name: 'Wed', active: 45 },
    { name: 'Thu', active: 80 },
    { name: 'Fri', active: 70 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users />} label={store.t('admin.total_users')} value={activeUsers.toString()} />
        <StatCard icon={<Briefcase />} label={store.t('admin.total_deposits')} value={`${(totalFunds/1000).toFixed(1)}k €`} />
        <StatCard icon={<AlertTriangle />} label={store.t('admin.pending_loans')} value={pendingLoans.toString()} alert={pendingLoans > 0} />
        <StatCard icon={<TrendingUp />} label={store.t('admin.daily_vol')} value="124" />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
        <h3 className="text-white font-bold mb-6">{store.t('admin.user_activity')}</h3>
        <div className="h-64">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" stroke="#52525b" />
                <YAxis stroke="#52525b" />
                <Tooltip 
                    cursor={{fill: '#27272a'}}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                />
                <Bar dataKey="active" fill="#FACC15" radius={[4, 4, 0, 0]} />
              </BarChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, alert }: { icon: React.ReactNode, label: string, value: string, alert?: boolean }) => (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
        <div>
            <p className="text-zinc-400 text-sm font-medium">{label}</p>
            <h3 className={`text-2xl font-bold mt-1 ${alert ? 'text-red-500' : 'text-white'}`}>{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${alert ? 'bg-red-900/20 text-red-500' : 'bg-zinc-800 text-zinc-400'}`}>
            {icon}
        </div>
    </div>
);