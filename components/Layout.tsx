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
  FileText,
  Building2,
  User
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
    { name: store.t('nav.history'), path: '/history', icon: <History size={20} /> },
    { name: store.t('nav.documents'), path: '/documents', icon: <FileText size={20} /> },
    { name: store.t('nav.cards'), path: '/cards', icon: <CreditCard size={20} /> },
    { name: store.t('nav.loans'), path: '/loans', icon: <HandCoins size={20} /> },
  ];

  const adminLinks = [
    { name: store.t('nav.overview'), path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: store.t('nav.users'), path: '/admin/users', icon: <Users size={20} /> },
    { name: store.t('nav.requests'), path: '/admin/loans', icon: <ShieldCheck size={20} /> },
    { name: 'Tx Approvals', path: '/admin/transactions', icon: <ArrowRightLeft size={20} /> },
    { name: 'Institution Requests', path: '/admin/institution-requests', icon: <Building2 size={20} /> },
    { name: store.t('nav.notifications'), path: '/admin/notifications', icon: <Bell size={20} /> },
    { name: store.t('nav.documents'), path: '/admin/documents', icon: <FileText size={20} /> },
    { name: store.t('nav.settings'), path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  const unreadCount = currentUser?.notifications.filter(n => !n.read).length || 0;

  const handleAlertClose = async (notificationId: string) => {
    await store.markNotificationAsRead(notificationId);
  };

  return (
    <div className="flex h-screen bg-brand-light text-brand-navy overflow-hidden font-sans">
      
      {/* Mobile Menu Overlay for Sidebar (Optional now with Bottom Nav but kept for consistency) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar (Desktop Hidden on Mobile except if toggled, but we use Bottom Nav for main) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
          {/* ... Desktop Sidebar Content Same as Before ... */}
         <div className="flex items-center h-20 px-6 border-b border-gray-100">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
             {config.logoUrl ? (
                <img src={config.logoUrl} alt={config.name} className="h-8 w-auto" />
             ) : (
             <div className="text-brand-blue font-extrabold text-2xl tracking-tighter flex items-center gap-1">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-brand-blue">
                    <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-2 1L12 15.5l7-3.5-2-1-5 2.5z"/>
                </svg>
                <span>{config.logoText || config.name}</span>
             </div>
             )}
          </div>
        </div>

        <nav className="p-4 space-y-1">
          <div className="px-2 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            {isAdmin ? store.t('nav.admin') : store.t('nav.menu')}
          </div>
          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setIsMobileMenuOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200
                ${location.pathname === link.path 
                  ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-brand-navy'}
              `}
            >
              {link.icon}
              {link.name}
            </button>
          ))}
          
          {/* Mobile Only: Profile and Logout */}
          <div className="lg:hidden pt-4 mt-4 border-t border-gray-100 space-y-1">
            <button
              onClick={() => {
                navigate('/profile');
                setIsMobileMenuOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-colors
                ${location.pathname === '/profile' 
                  ? 'bg-brand-blue text-white' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-brand-navy'}
              `}
            >
              <User size={20} />
              Profile
            </button>
            
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={20} />
              {store.t('nav.signout')}
            </button>
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-gray-100 space-y-2 bg-white">
            <div 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors group"
            >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-brand-navy group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    {currentUser.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-brand-navy truncate">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">View Profile</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-brand-light">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-brand-navy"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <h1 className="text-xl font-extrabold text-brand-navy hidden md:block tracking-tight">
              {config.name}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell (User only) */}
            {!isAdmin && (
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Notifications"
              >
                <Bell size={20} className="text-gray-400 hover:text-brand-blue transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Language Selector */}
            <select
              value={currentLang}
              onChange={handleLangChange}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-navy font-bold focus:outline-none focus:border-brand-blue cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <option value="en">🇬🇧 EN</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="pt">🇵🇹 PT</option>
              <option value="de">🇩🇪 DE</option>
            </select>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-brand-navy">{currentUser.name}</p>
                <p className="text-xs text-gray-400 font-medium">{isAdmin ? 'Administrator' : 'User'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 rounded-full transition-colors text-gray-400 hover:text-red-500"
                title={store.t('nav.logout')}
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 pb-28 lg:pb-6">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 lg:hidden z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-20">
          {links.slice(0, 5).map((link) => (
             <button
               key={link.path}
               onClick={() => navigate(link.path)}
               className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${location.pathname === link.path ? 'text-brand-blue' : 'text-gray-400 hover:text-brand-navy'}`}
             >
               {React.cloneElement(link.icon as React.ReactElement, { size: 24, strokeWidth: location.pathname === link.path ? 2.5 : 2 })}
               <span className="text-[10px] font-bold">{link.name}</span>
             </button>
          ))}
        </div>
      </div>
    </div>
  );
};