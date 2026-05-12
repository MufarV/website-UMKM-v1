import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  Wallet, 
  Package, 
  Wrench, 
  Globe, 
  UserCheck,
  BarChart3,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface SidebarItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick: () => void;
  isCollapsed?: boolean;
  key?: React.Key;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, isCollapsed }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full group",
      active 
        ? "bg-indigo-50 text-indigo-700 font-semibold" 
        : "text-slate-500 hover:bg-slate-50"
    )}
  >
    {active ? (
      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full flex-shrink-0" />
    ) : (
      <Icon className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
    )}
    {!isCollapsed && <span className="text-sm">{label}</span>}
  </button>
);

export const Layout = ({ children, activeView, setActiveView }: { 
  children: React.ReactNode, 
  activeView: string,
  setActiveView: (view: string) => void 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Auto-collapse sidebar on smaller screens
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code !== 'auth/cancelled-popup-request') {
        console.error("Login failed:", error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const menuGroups = [
    { label: 'Utama', items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
    { label: 'Manajemen & Ops', items: [
      { id: 'manajemen', label: 'Manajemen', icon: Users },
      { id: 'hrd', label: 'HRD', icon: UserCheck },
      { id: 'produksi', label: 'Produksi', icon: Package },
      { id: 'sarpra', label: 'Sarpra', icon: Wrench },
    ]},
    { label: 'Bisnis & Keuangan', items: [
      { id: 'keuangan', label: 'Keuangan', icon: Wallet },
      { id: 'pemasaran', label: 'Pemasaran', icon: Megaphone },
      { id: 'digital', label: 'Digital Tools', icon: Globe },
      { id: 'analisis', label: 'Analisis', icon: BarChart3 },
    ]},
  ];

  const bottomNavItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'keuangan', label: 'Cuan', icon: Wallet },
    { id: 'analisis', label: 'AI', icon: Sparkles },
    { id: 'manajemen', label: 'Tim', icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-[70] bg-white border-r border-slate-200 transition-all duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none",
          isSidebarOpen ? "w-64" : "w-20",
          isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl ring-4 ring-indigo-50">U</div>
                {(isSidebarOpen || isMobileMenuOpen) && (
                  <motion.h1 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xl font-extrabold tracking-tight text-indigo-900 leading-none"
                  >
                    UMKM<span className="block text-xs font-medium text-slate-400">Pro Student Hub</span>
                  </motion.h1>
                )}
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-2 pb-20 lg:pb-4 scrollbar-hide">
            {menuGroups.map((group) => (
              <div key={group.label} className="mt-6 first:mt-0">
                {(isSidebarOpen || isMobileMenuOpen) && (
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">
                    {group.label}
                  </div>
                )}
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    active={activeView === item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    isCollapsed={!isSidebarOpen && !isMobileMenuOpen}
                  />
                ))}
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100 mt-auto">
            {(isSidebarOpen || isMobileMenuOpen) && (
              <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-xl p-4 text-white relative overflow-hidden mb-4 shadow-lg shadow-indigo-100">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">Status Akun</p>
                <p className="text-sm font-bold">Premium Student</p>
                <Sparkles className="absolute top-2 right-2 w-4 h-4 text-white/20" />
              </div>
            )}
            {user ? (
              <button 
                onClick={handleLogout}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl w-full text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all font-medium",
                  (!isSidebarOpen && !isMobileMenuOpen) && "justify-center"
                )}
              >
                <LogOut className="w-5 h-5" />
                {(isSidebarOpen || isMobileMenuOpen) && <span className="text-sm">Keluar Akun</span>}
              </button>
            ) : (
              <button 
                onClick={handleLogin}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl w-full text-indigo-600 hover:bg-indigo-50 transition-all font-bold",
                  (!isSidebarOpen && !isMobileMenuOpen) && "justify-center"
                )}
              >
                <Users className="w-5 h-5" />
                {(isSidebarOpen || isMobileMenuOpen) && <span className="text-sm">Login Juragan</span>}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 min-h-screen flex flex-col transition-all duration-300 pb-20 lg:pb-0",
        isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
      )}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsMobileMenuOpen(true);
                } else {
                  setIsSidebarOpen(!isSidebarOpen);
                }
              }}
              className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block lg:ml-2">
              <h2 className="text-sm font-bold text-slate-800">
                {user ? `Halo, ${user.displayName?.split(' ')[0]}!` : 'Wirausaha Muda Hub'}
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} • {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
              </p>
            </div>
            {/* Mobile Title */}
            <div className="sm:hidden font-extrabold text-indigo-900 tracking-tight text-lg">
              {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors lg:hidden">
              <LogOut className="w-5 h-5" onClick={handleLogout} />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 ml-1">
              {user ? (
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 border border-indigo-200 overflow-hidden shadow-sm">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    user.displayName?.split(' ').map(n=>n[0]).join('') || 'UM'
                  )}
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  Masuk
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-8 max-w-[1600px] w-full mx-auto flex-grow overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation (Mobile Only) */}
        <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-lg border-t border-slate-200 sm:hidden flex items-center justify-around px-4 h-16 safe-bottom">
          {bottomNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all px-3 py-1 rounded-xl",
                activeView === item.id 
                  ? "text-indigo-600 scale-110" 
                  : "text-slate-400 opacity-70 hover:opacity-100"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeView === item.id ? "fill-indigo-600/10" : "")} />
              <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
              {activeView === item.id && (
                <motion.div 
                  layoutId="bottomNavDot"
                  className="absolute -bottom-1 w-1 h-1 bg-indigo-600 rounded-full" 
                />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Activity Tracker (Desktop Only) */}
        <footer className="hidden lg:flex bg-white border-t border-slate-200 px-8 py-3 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Sistem Online
              </span>
            </div>
          </div>
          <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> Dashboard Terpadu UMKM
          </div>
        </footer>
      </main>
    </div>
  );
};
