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
  CalendarCheck,
  BarChart3,
  ShoppingCart,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  Sparkles,
  RefreshCw,
  Moon,
  Sun
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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [businessLogo, setBusinessLogo] = useState<string | null>(() => localStorage.getItem('businessLogo') || null);
  const [businessNameMain, setBusinessNameMain] = useState(() => localStorage.getItem('businessNameMain') || 'UMKM');
  const [businessNameSub, setBusinessNameSub] = useState(() => localStorage.getItem('businessNameSub') || 'Pro Student Hub');

  React.useEffect(() => {
    localStorage.setItem('businessNameMain', businessNameMain);
  }, [businessNameMain]);

  React.useEffect(() => {
    localStorage.setItem('businessNameSub', businessNameSub);
  }, [businessNameSub]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setBusinessLogo(result);
        localStorage.setItem('businessLogo', result);
      };
      reader.readAsDataURL(file);
    }
  };

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

  const handleLogin = async (forceSelect = false) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    if (forceSelect) {
      provider.setCustomParameters({ prompt: 'select_account' });
    }
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

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const isDark = !prev;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return isDark;
    });
  };

  const menuGroups = [
    { label: 'Utama', items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
    { label: 'Manajemen & Ops', items: [
      { id: 'manajemen', label: 'Manajemen', icon: Users },
      { id: 'hrd', label: 'HRD', icon: UserCheck },
      { id: 'absensi', label: 'Absensi', icon: CalendarCheck },
      { id: 'produksi', label: 'Produksi', icon: Package },
      { id: 'pesanan', label: 'Pesanan', icon: ShoppingCart },
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
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-slate-900 overflow-x-hidden relative">
      {/* Decorative animated background blurs for a modern student/startup vibe */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />
      <div className="fixed top-[20%] right-[-10%] w-[400px] h-[400px] bg-fuchsia-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
      <div className="fixed bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />

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
          "fixed inset-y-0 left-0 z-[70] bg-white/70 backdrop-blur-3xl border-r border-white/60 transition-all duration-300 ease-in-out lg:translate-x-0 lg:bg-transparent lg:shadow-none shadow-[4px_0_24px_rgba(0,0,0,0.02)]",
          isSidebarOpen ? "w-64" : "w-20",
          isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleLogoUpload} 
                />
                <div 
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl ring-4 ring-indigo-50 shrink-0 cursor-pointer overflow-hidden hover:opacity-80 transition-opacity",
                    !businessLogo && "bg-indigo-600 text-white"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  title="Klik untuk mengubah logo"
                >
                  {businessLogo ? (
                    <img src={businessLogo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    businessNameMain.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                {(isSidebarOpen || isMobileMenuOpen) && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col flex-1 min-w-0"
                  >
                    <input 
                      value={businessNameMain}
                      onChange={(e) => setBusinessNameMain(e.target.value)}
                      className="text-xl font-extrabold tracking-tight text-indigo-900 leading-none bg-transparent outline-none w-full placeholder-indigo-300"
                      placeholder="Nama Utama"
                    />
                    <input 
                      value={businessNameSub}
                      onChange={(e) => setBusinessNameSub(e.target.value)}
                      className="text-xs font-medium text-slate-400 bg-transparent outline-none w-full placeholder-slate-300"
                      placeholder="Sub Judul"
                    />
                  </motion.div>
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
            {user ? (
              <div className="space-y-1">
                <button 
                  onClick={() => handleLogin(true)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl w-full text-indigo-600 hover:bg-indigo-50 transition-all font-medium",
                    (!isSidebarOpen && !isMobileMenuOpen) && "justify-center"
                  )}
                >
                  <RefreshCw className="w-5 h-5" />
                  {(isSidebarOpen || isMobileMenuOpen) && <span className="text-sm">Ganti Akun</span>}
                </button>
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
              </div>
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
        "flex-1 min-h-screen flex flex-col transition-all duration-300 pb-20 lg:pb-0 relative z-10",
        isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
      )}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 h-16 lg:h-20 bg-white/40 backdrop-blur-2xl border-b border-white/60 px-4 lg:px-8 flex items-center justify-between shadow-[0_4px_30px_rgb(0,0,0,0.02)]">
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
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {user && (
              <button 
                onClick={() => handleLogin(true)}
                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors lg:hidden"
                title="Ganti Akun"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 transition-colors lg:hidden"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
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
