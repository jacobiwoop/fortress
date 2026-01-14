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
  Languages
} from 'lucide-react';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [config, setConfig] = useState(store.getConfig());
  const [currentLang, setCurrentLang] = useState(store.getLanguage());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Subscribe to store updates
    const unsubscribe = store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
      setConfig(store.getConfig());
      setCurrentLang(store.getLanguage());
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
    { name: store.t('nav.cards'), path: '/cards', icon: <CreditCard size={20} /> },
    { name: store.t('nav.loans'), path: '/loans', icon: <HandCoins size={20} /> },
  ];

  const adminLinks = [
    { name: store.t('nav.overview'), path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: store.t('nav.users'), path: '/admin/users', icon: <Users size={20} /> },
    { name: store.t('nav.requests'), path: '/admin/loans', icon: <ShieldCheck size={20} /> },
    { name: store.t('nav.settings'), path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <div className="flex h-screen bg-black text-zinc-100 overflow-hidden font-sans">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
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
          <button className="ml-auto lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          <div className="px-2 pb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
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
            {/* Clickable Profile Section */}
            <div 
                onClick={() => {
                    navigate('/profile');
                    setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer hover:bg-zinc-900 transition-colors group"
            >
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold group-hover:bg-zinc-700">
                    {currentUser.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{currentUser.email}</p>
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-zinc-950/50 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-4 sm:px-8">
            <div className="flex items-center gap-4">
                <button 
                    className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-xl font-semibold text-white">
                    {location.pathname === '/profile' 
                        ? store.t('profile.title') 
                        : (links.find(l => l.path === location.pathname)?.name || 'Fortress Bank')}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Language Selector */}
                <div className="relative flex items-center bg-zinc-900 rounded-lg border border-zinc-800 px-2 py-1">
                    <Languages size={16} className="text-zinc-500 mr-2" />
                    <select 
                        value={currentLang}
                        onChange={handleLangChange}
                        className="bg-transparent text-sm text-zinc-300 focus:outline-none cursor-pointer"
                    >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="pt">Português</option>
                        <option value="de">Deutsch</option>
                    </select>
                </div>

                {/* Notifications Bell (Demo Only) */}
                <div className="relative">
                    <Bell size={20} className="text-zinc-400 hover:text-white cursor-pointer" />
                    {currentUser.notifications.some(n => !n.read) && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black"></span>
                    )}
                </div>
            </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};