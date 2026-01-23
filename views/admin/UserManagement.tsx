import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { User, AccountStatus, UserRole, TransactionType } from '../../types';
import { 
    Search, Ban, CheckCircle, DollarSign, ArrowLeft, 
    ShieldAlert, MessageSquare, Lock, History, PauseCircle,
    Trash2, CreditCard, Wallet, Smartphone
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [lang, setLang] = useState(store.getLanguage());

  // Action States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: UserRole.USER, balance: 0 });

  const [manualTxAmount, setManualTxAmount] = useState('');
  const [manualTxDesc, setManualTxDesc] = useState('');
  const [manualTxType, setManualTxType] = useState<TransactionType>(TransactionType.DEPOSIT);
  
  const [adjustBalanceAmount, setAdjustBalanceAmount] = useState('');
  
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');

  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    store.fetchUsers(); // Load users on mount
    setUsers(store.getUsers().filter(u => u.role === UserRole.USER));
    const unsub = store.subscribe(() => {
        setUsers(store.getUsers().filter(u => u.role === UserRole.USER));
        setLang(store.getLanguage());
        if (selectedUser) {
            // Refresh selected user data if it changes in store
            const updated = store.getUsers().find(u => u.id === selectedUser.id);
            if (updated) setSelectedUser(updated);
        }
    });
    return unsub;
  }, [selectedUser]);

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search));

  const handleAction = async (action: () => Promise<void> | void) => {
      try {
          await action();
          setFeedback(store.t('admin.act.success'));
          setTimeout(() => setFeedback(null), 3000);
          // Clear inputs
          setManualTxAmount('');
          setManualTxDesc('');
          setAdjustBalanceAmount('');
          setNotifTitle('');
          setNotifBody('');
          setShowCreateForm(false);
          setNewUser({ name: '', email: '', password: '', role: UserRole.USER, balance: 0 });
      } catch (e: any) {
          console.error(e);
          setFeedback(e.message || "Error");
      }
  };

  const handleCreateUser = () => {
      handleAction(() => store.createUser(newUser));
  };

  // --- Views ---

  const renderCreateUserForm = () => (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Create New User</h3>
              
              <div className="space-y-4">
                  <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Full Name</label>
                      <input 
                          type="text" 
                          value={newUser.name}
                          onChange={e => setNewUser({...newUser, name: e.target.value})}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Email</label>
                      <input 
                          type="email" 
                          value={newUser.email}
                          onChange={e => setNewUser({...newUser, email: e.target.value})}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Password</label>
                      <input 
                          type="password" 
                          value={newUser.password}
                          onChange={e => setNewUser({...newUser, password: e.target.value})}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Initial Balance</label>
                      <input 
                          type="number" 
                          value={newUser.balance}
                          onChange={e => setNewUser({...newUser, balance: parseFloat(e.target.value)})}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                      />
                  </div>

                  {feedback && !feedback.startsWith("Success") && (
                      <div className="text-red-400 text-sm mt-2">{feedback}</div>
                  )}

                  <div className="flex gap-3 mt-6">
                      <button 
                          onClick={() => setShowCreateForm(false)}
                          className="flex-1 py-2 border border-zinc-700 rounded text-zinc-300 hover:bg-zinc-800"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleCreateUser}
                          className="flex-1 py-2 bg-brand-yellow text-black font-bold rounded hover:bg-yellow-400"
                      >
                          Create User
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderUserList = () => (
    <div className="space-y-6 animate-fade-in relative">
      {showCreateForm && renderCreateUserForm()}
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">{store.t('users.title')}</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                    type="text" 
                    placeholder={store.t('users.search')} 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-white pl-10 pr-4 py-2 rounded-lg focus:border-brand-yellow focus:outline-none w-full sm:w-64"
                />
            </div>
            <button 
                onClick={() => setShowCreateForm(true)}
                className="bg-brand-yellow text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors whitespace-nowrap"
            >
                + Create User
            </button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-400 min-w-[600px]">
            <thead className="bg-zinc-950 text-zinc-200 border-b border-zinc-800">
                <tr>
                    <th className="p-4">{store.t('users.col.name')}</th>
                    <th className="p-4 hidden sm:table-cell">{store.t('users.col.email')}</th>
                    <th className="p-4">{store.t('users.col.balance')}</th>
                    <th className="p-4">{store.t('users.col.status')}</th>
                </tr>
            </thead>
            <tbody>
                {filteredUsers.map(user => (
                    <tr 
                        key={user.id} 
                        onClick={() => setSelectedUser(user)}
                        className="border-b border-zinc-800/50 hover:bg-zinc-800/40 cursor-pointer transition-colors"
                    >
                        <td className="p-4 font-medium text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <div>{user.name}</div>
                                    <div className="text-xs text-zinc-500 sm:hidden">{user.email}</div>
                                </div>
                            </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">{user.email}</td>
                        <td className="p-4 font-mono text-emerald-400">{store.formatCurrency(user.balance)}</td>
                        <td className="p-4">
                            <StatusBadge status={user.status} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );

  const renderUserDetail = () => {
    if (!selectedUser) return null;
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setSelectedUser(null)} className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-white text-zinc-400 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-white">{selectedUser.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                        <span>{selectedUser.email}</span>
                        <span>•</span>
                        <span className="font-mono text-zinc-300">{selectedUser.id}</span>
                        <span>•</span>
                        <StatusBadge status={selectedUser.status} />
                    </div>
                </div>
                <div className="ml-auto text-right">
                     <p className="text-zinc-500 text-sm">Balance</p>
                     <p className="text-3xl font-bold text-brand-yellow font-mono">
                        {store.formatCurrency(selectedUser.balance)}
                     </p>
                </div>
            </div>

            {feedback && (
                <div className="bg-emerald-900/20 border border-emerald-900/50 text-emerald-400 p-4 rounded-xl flex items-center gap-2">
                    <CheckCircle size={18} /> {feedback}
                </div>
            )}

            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Manual Transaction */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-3 mb-4 text-white font-medium">
                        <div className="p-2 bg-blue-900/30 text-blue-400 rounded-lg"><History size={20}/></div>
                        {store.t('admin.act.manual_tx')}
                    </div>
                    <div className="space-y-3">
                         <input 
                            type="number" 
                            placeholder={store.t('transfer.amount')} 
                            value={manualTxAmount}
                            onChange={e => setManualTxAmount(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white"
                        />
                        <select 
                            value={manualTxType}
                            onChange={e => setManualTxType(e.target.value as TransactionType)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white"
                        >
                            <option value={TransactionType.DEPOSIT}>Deposit (+)</option>
                            <option value={TransactionType.WITHDRAWAL}>Withdrawal (-)</option>
                        </select>
                        <input 
                            type="text" 
                            placeholder={store.t('admin.act.desc')} 
                            value={manualTxDesc}
                            onChange={e => setManualTxDesc(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white"
                        />
                        <button 
                            onClick={() => handleAction(() => store.adminCreateTransaction(selectedUser.id, parseFloat(manualTxAmount), manualTxType, manualTxDesc))}
                            className="w-full py-2 bg-blue-600/20 text-blue-400 border border-blue-600/50 rounded hover:bg-blue-600/30 font-medium text-sm"
                        >
                            {store.t('admin.act.execute')}
                        </button>
                    </div>
                </div>

                {/* 2. Adjust Balance (Magic Fix) */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-3 mb-4 text-white font-medium">
                        <div className="p-2 bg-brand-yellow/20 text-brand-yellow rounded-lg"><DollarSign size={20}/></div>
                        {store.t('admin.act.adjust')}
                    </div>
                     <div className="space-y-3">
                        <p className="text-xs text-zinc-500">Set exact balance value</p>
                         <input 
                            type="number" 
                            placeholder="New balance (exact value)" 
                            value={adjustBalanceAmount}
                            onChange={e => setAdjustBalanceAmount(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white"
                        />
                         <div className="h-[92px]"></div> {/* Spacer for alignment */}
                        <button 
                             onClick={() => handleAction(() => store.adminSetBalance(selectedUser.id, parseFloat(adjustBalanceAmount)))}
                            className="w-full py-2 bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/50 rounded hover:bg-brand-yellow/30 font-medium text-sm"
                        >
                            {store.t('admin.act.execute')}
                        </button>
                    </div>
                </div>

                {/* 3. Communication */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-3 mb-4 text-white font-medium">
                        <div className="p-2 bg-purple-900/30 text-purple-400 rounded-lg"><MessageSquare size={20}/></div>
                        {store.t('admin.act.send_notif')}
                    </div>
                    <div className="space-y-3">
                        <input 
                            type="text" 
                            placeholder={store.t('admin.act.msg_title')} 
                            value={notifTitle}
                            onChange={e => setNotifTitle(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white"
                        />
                        <textarea 
                            placeholder={store.t('admin.act.msg_body')} 
                            value={notifBody}
                            onChange={e => setNotifBody(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white h-[78px] resize-none"
                        />
                         <button 
                            onClick={() => handleAction(() => store.createNotification(selectedUser.id, notifTitle, notifBody, 'info'))}
                            className="w-full py-2 bg-purple-600/20 text-purple-400 border border-purple-600/50 rounded hover:bg-purple-600/30 font-medium text-sm"
                        >
                            {store.t('admin.act.send')}
                        </button>
                    </div>
                </div>

                {/* 4. Status Control */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
                     <div className="flex items-center gap-3 mb-4 text-white font-medium">
                        <div className="p-2 bg-red-900/30 text-red-400 rounded-lg"><ShieldAlert size={20}/></div>
                        {store.t('admin.act.status')}
                    </div>
                    <div className="space-y-3 flex flex-col justify-end h-[160px]">
                        <button 
                            onClick={() => handleAction(() => store.updateUserStatus('admin', selectedUser.id, AccountStatus.ACTIVE))}
                            className={`w-full py-2 rounded border font-medium text-sm flex items-center justify-center gap-2 ${selectedUser.status === AccountStatus.ACTIVE ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed' : 'bg-emerald-900/20 border-emerald-900 text-emerald-500 hover:bg-emerald-900/30'}`}
                            disabled={selectedUser.status === AccountStatus.ACTIVE}
                        >
                            <CheckCircle size={14} /> {store.t('admin.act.activate')}
                        </button>
                        <button 
                            onClick={() => handleAction(() => store.updateUserStatus('admin', selectedUser.id, AccountStatus.SUSPENDED))}
                            className={`w-full py-2 rounded border font-medium text-sm flex items-center justify-center gap-2 ${selectedUser.status === AccountStatus.SUSPENDED ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed' : 'bg-orange-900/20 border-orange-900 text-orange-500 hover:bg-orange-900/30'}`}
                            disabled={selectedUser.status === AccountStatus.SUSPENDED}
                        >
                            <PauseCircle size={14} /> {store.t('admin.act.suspend')}
                        </button>
                        <button 
                             onClick={() => handleAction(() => store.updateUserStatus('admin', selectedUser.id, AccountStatus.BLOCKED))}
                            className={`w-full py-2 rounded border font-medium text-sm flex items-center justify-center gap-2 ${selectedUser.status === AccountStatus.BLOCKED ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed' : 'bg-red-900/20 border-red-900 text-red-500 hover:bg-red-900/30'}`}
                            disabled={selectedUser.status === AccountStatus.BLOCKED}
                        >
                            <Ban size={14} /> {store.t('admin.act.block')}
                        </button>
                    </div>
                </div>

                {/* 5. Security */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
                     <div className="flex items-center gap-3 mb-4 text-white font-medium">
                        <div className="p-2 bg-zinc-800 text-zinc-300 rounded-lg"><Lock size={20}/></div>
                        {store.t('admin.act.security')}
                    </div>
                    <div className="space-y-4">
                        <p className="text-sm text-zinc-400">
                            Reset user password and clear active sessions. The user will receive an email with instructions.
                        </p>
                        <div className="h-[55px]"></div>
                        <button 
                            onClick={() => handleAction(() => store.resetUserSecurity(selectedUser.id))}
                            className="w-full py-2 bg-zinc-800 text-white border border-zinc-700 rounded hover:bg-zinc-700 font-medium text-sm"
                        >
                            {store.t('admin.act.reset_confirm')}
                        </button>
                    </div>
                </div>

                {/* 6. Withdrawal Methods (New) */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
                     <div className="flex items-center gap-3 mb-4 text-white font-medium">
                        <div className="p-2 bg-zinc-800 text-zinc-300 rounded-lg"><Wallet size={20}/></div>
                        Moyens de Retrait
                    </div>
                    <div className="space-y-3">
                        {(!selectedUser.withdrawalMethods || selectedUser.withdrawalMethods.length === 0) && (
                            <p className="text-sm text-zinc-500 italic">Aucun moyen configuré.</p>
                        )}
                         {selectedUser.withdrawalMethods?.map(m => {
                            let details: any = {};
                            try {
                                details = typeof m.details === 'string' ? JSON.parse(m.details) : m.details;
                            } catch(e) {}
                            
                            return (
                                <div key={m.id} className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="text-zinc-400 flex-shrink-0">
                                            {m.type === 'BANK_CARD' && <CreditCard size={16} />}
                                            {m.type === 'CRYPTO' && <Wallet size={16} />}
                                            {m.type === 'GPAY' && <Smartphone size={16} />}
                                        </div>
                                        <div className="text-sm text-white overflow-hidden">
                                            <div className="font-bold text-xs">{m.type}</div>
                                            <div className="text-zinc-500 text-xs truncate">
                                                {m.type === 'BANK_CARD' && `•••• ${details.cardNumber?.slice(-4) || '****'}`}
                                                {m.type === 'CRYPTO' && (details.walletAddress || 'Unknown')}
                                                {m.type === 'GPAY' && (details.email || 'Unknown')}
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if(confirm("Refuser (Supprimer) ce moyen de retrait ?")) {
                                                handleAction(() => store.deleteWithdrawalMethod(m.id))
                                            }
                                        }}
                                        className="text-red-500 hover:text-red-400 p-2 hover:bg-red-900/20 rounded flex-shrink-0 transition-colors"
                                        title="Refuser"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            );
                         })}
                    </div>
                </div>
            </div>

            {/* Recent Transactions List (Read Only) */}
            <div className="mt-8">
                 <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
                 <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="bg-zinc-950 text-zinc-200">
                            <tr>
                                <th className="p-3">Date</th>
                                <th className="p-3">Description</th>
                                <th className="p-3">Type</th>
                                <th className="p-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedUser.transactions.slice(0, 5).map(t => (
                                <tr key={t.id} className="border-t border-zinc-800">
                                    <td className="p-3">{new Date(t.date).toLocaleDateString()}</td>
                                    <td className="p-3 text-white">{t.description}</td>
                                    <td className="p-3 text-xs">{t.type}</td>
                                    <td className={`p-3 text-right font-medium ${t.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                                        {t.amount > 0 ? '+' : ''}{store.formatCurrency(Math.abs(t.amount))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
  };

  return selectedUser ? renderUserDetail() : renderUserList();
};

const StatusBadge = ({ status }: { status: AccountStatus }) => {
    let classes = "";
    switch(status) {
        case AccountStatus.ACTIVE: classes = "bg-emerald-900/30 text-emerald-500"; break;
        case AccountStatus.SUSPENDED: classes = "bg-orange-900/30 text-orange-500"; break;
        case AccountStatus.BLOCKED: classes = "bg-red-900/30 text-red-500"; break;
    }
    return <span className={`px-2 py-1 rounded text-xs font-bold ${classes}`}>{status}</span>;
};