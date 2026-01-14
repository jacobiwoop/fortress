import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { store } from '../services/store';
import { UserRole, Language } from '../types';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  CreditCard, 
  HandCoins, 
  LogOut, 
  Users, 
  Settings, 
  Bell, 
  ShieldCheck,
  Menu,
  X,
  Languages,
  History,
  FileText
} from 'lucide-react';
import { AlertModal } from './AlertModal';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [config, setConfig] = useState(store.getConfig());
  const [currentLang, setCurrentLang] = useState(store.getLanguage());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [alertNotifications, setAlertNotifications] = useState(store.getCurrentUser()?.notifications.filter(n => n.type === 'alert' && !n.read) || []);

  useEffect(() => {
    // Subscribe to store updates
    const unsubscribe = store.subscribe(() => {
      const user = store.getCurrentUser();
      setCurrentUser(user);
      setConfig(store.getConfig());
      setCurrentLang(store.getLanguage());
      
      // Update alert notifications
      if (user) {
        const alerts = user.notifications.filter(n => n.type === 'alert' && !n.read);
        setAlertNotifications(alerts);
      }
    });
    
    if (!currentUser) {
      navigate('/login');
    }

    return () => unsubscribe();
  }, [currentUser, navigate]);

  const handleLogout = () => {
    store.logout();
    navigate('/login');
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      store.setLanguage(e.target.value as Language);
  };

  if (!currentUser) return null;

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const userLinks = [
    { name: store.t('nav.dashboard'), path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: store.t('nav.transfers'), path: '/transfers', icon: <ArrowRightLeft size={20} /> },
    { name: store.t('nav.services'), path: '/services', icon: <ShieldCheck size={20} /> },
    { name: 'History', path: '/history', icon: <History size={20} /> },
    { name: 'Documents', path: '/documents', icon: <FileText size={20} /> },
    { name: store.t('nav.cards'), path: '/cards', icon: <CreditCard size={20} /> },
    { name: store.t('nav.loans'), path: '/loans', icon: <HandCoins size={20} /> },
  ];

  const adminLinks = [
    { name: store.t('nav.overview'), path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: store.t('nav.users'), path: '/admin/users', icon: <Users size={20} /> },
    { name: store.t('nav.requests'), path: '/admin/loans', icon: <ShieldCheck size={20} /> },
    { name: 'Tx Approvals', path: '/admin/transactions', icon: <ArrowRightLeft size={20} /> },
    { name: 'Notifications', path: '/admin/notifications', icon: <Bell size={20} /> },
    { name: 'Documents', path: '/admin/documents', icon: <FileText size={20} /> },
    { name: store.t('nav.settings'), path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  const unreadCount = currentUser?.notifications.filter(n => !n.read).length || 0;

  const handleAlertClose = async (notificationId: string) => {
    await store.markNotificationAsRead(notificationId);
  };

  return (
    <div className="flex h-screen bg-black text-zinc-100 overflow-hidden font-sans">
      
      {/* Mobile Menu Overlay for Sidebar (Optional now with Bottom Nav but kept for consistency) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar (Desktop Hidden on Mobile except if toggled, but we use Bottom Nav for main) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
        hidden lg:block 
      `}>
          {/* ... Desktop Sidebar Content Same as Before ... */}
         <div className="flex items-center h-16 px-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt={config.name} className="w-8 h-8 object-contain" />
            ) : (
              <div className="w-8 h-8 rounded bg-brand-yellow flex items-center justify-center text-black font-bold text-xl">
                {config.logoText}
              </div>
            )}
            <span className="text-lg font-bold tracking-tight text-white">{config.name}</span>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          <div className="px-2 pb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {isAdmin ? store.t('nav.admin') : store.t('nav.menu')}
          </div>
          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${location.pathname === link.path 
                  ? 'bg-brand-yellow text-black' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}
              `}
            >
              {link.icon}
              {link.name}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-zinc-800 space-y-2">
            <div 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer hover:bg-zinc-900 transition-colors group"
            >
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold group-hover:bg-zinc-700">
                    {currentUser.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                </div>
            </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            {store.t('nav.signout')}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <h1 className="text-xl font-bold text-white hidden md:block">
              {config.name}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell (User only) */}
            {!isAdmin && (
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Notifications"
              >
                <Bell size={20} className="text-zinc-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Language Selector */}
            <select
              value={currentLang}
              onChange={handleLangChange}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-yellow"
            >
              <option value="en">🇬🇧 EN</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="pt">🇵🇹 PT</option>
              <option value="de">🇩🇪 DE</option>
            </select>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{currentUser.name}</p>
                <p className="text-xs text-zinc-500">{isAdmin ? 'Administrator' : 'User'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                title={store.t('nav.logout')}
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Alert Modal */}
      {alertNotifications.length > 0 && (
        <AlertModal 
          notifications={alertNotifications}
          onClose={handleAlertClose}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 lg:hidden z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          {links.slice(0, 5).map((link) => (
             <button
               key={link.path}
               onClick={() => navigate(link.path)}
               className={`flex flex-col items-center gap-1 w-full h-full justify-center ${location.pathname === link.path ? 'text-brand-yellow' : 'text-zinc-500'}`}
             >
               {React.cloneElement(link.icon as React.ReactElement, { size: 24 })}
               <span className="text-[10px] font-medium">{link.name}</span>
             </button>
          ))}
        </div>
      </div>
    </div>
  );
};