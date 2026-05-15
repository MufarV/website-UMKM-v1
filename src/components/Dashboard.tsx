import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  Megaphone, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const data = [
  { name: 'Senin', sales: 4000, reach: 2400 },
  { name: 'Selasa', sales: 3000, reach: 1398 },
  { name: 'Rabu', sales: 2000, reach: 9800 },
  { name: 'Kamis', sales: 2780, reach: 3908 },
  { name: 'Jumat', sales: 1890, reach: 4800 },
  { name: 'Sabtu', sales: 2390, reach: 3800 },
  { name: 'Minggu', sales: 3490, reach: 4300 },
];

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316'];

import { firebaseService } from '../services/firebaseService';

export const Dashboard = () => {
  const [user, setUser] = React.useState(auth.currentUser);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  
  // Real Data State
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [inventory, setInventory] = React.useState<any[]>([]);
  const [employees, setEmployees] = React.useState<any[]>([]);
  const [tasks, setTasks] = React.useState<any[]>([]);

  React.useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(setUser);
    
    let unsubTrans: any, unsubInv: any, unsubEmp: any, unsubTask: any;
    
    if (auth.currentUser) {
      unsubTrans = firebaseService.subscribe('transactions', setTransactions);
      unsubInv = firebaseService.subscribe('inventory', setInventory);
      unsubEmp = firebaseService.subscribe('employees', setEmployees);
      unsubTask = firebaseService.subscribe('tasks', setTasks);
    }

    return () => {
      unsubAuth();
      unsubTrans?.();
      unsubInv?.();
      unsubEmp?.();
      unsubTask?.();
    };
  }, []);

  // Calculated Stats
  const totalRevenue = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    
  const lowStockCount = inventory.filter(i => i.stock < 10).length;
  const activeTasks = tasks.filter(t => t.status !== 'Done').length;
  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.status === 'Done').length / tasks.length) * 100) 
    : 0;

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error: any) {
      if (error.code !== 'auth/cancelled-popup-request') {
        console.error(error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mb-8">
          <TrendingUp className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Mulai Perjalanan Bisnis Anda</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
          Masuk ke dashboard Wirausaha Muda untuk mengelola pemasaran, keuangan, dan analisis bisnis UMKM Anda dalam satu tempat.
        </p>
        <button 
          onClick={handleLogin}
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3"
        >
          Masuk dengan Google <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)}M`;
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}jt`;
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const statCards = [
    { label: 'Omzet Penjualan', value: formatCurrency(totalRevenue), change: 'Total Akumulasi', progress: 100, color: 'bg-indigo-500' },
    { label: 'Stok Kritis', value: `${lowStockCount} Item`, change: 'Perlu Re-stock', progress: lowStockCount > 0 ? 33 : 100, color: lowStockCount > 5 ? 'bg-rose-500' : 'bg-amber-500' },
    { label: 'Penyelesaian Tugas', value: `${completionRate}%`, change: `${tasks.length} Total Tugas`, progress: completionRate, color: 'bg-purple-500' },
    { label: 'Ukuran Tim', value: `${employees.length} Orang`, change: 'Karyawan Aktif', progress: 100, color: 'bg-emerald-500' }
  ];

  return (
    <div className="space-y-6 lg:space-y-8 pb-4">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-1 lg:mb-2 italic">
            Halo, {user?.displayName?.split(' ')[0] || 'Juragan'}! 👋
          </h1>
          <p className="text-sm text-slate-500 font-medium">Inilah ringkasan bisnis Anda hari ini.</p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <button className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors shadow-sm">
            Eksport
          </button>
          <button className="flex-2 md:flex-none px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> SMART INSIGHT
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={i} 
            className="bg-white/70 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
            <p className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-wider mb-2">{stat.label}</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
              <h3 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">{stat.value}</h3>
              <span className={cn(
                "text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-lg w-fit shadow-sm",
                stat.color.replace('bg-', 'text-').replace('500', '700'),
                stat.color.replace('bg-', 'bg-').replace('500', '100')
              )}>
                {stat.change}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200/50 mt-5 rounded-full overflow-hidden">
              <div 
                className={cn("h-full transition-all duration-1000 rounded-full", stat.color)} 
                style={{ width: `${stat.progress}%` }}
              ></div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart Visualization */}
        <div className="lg:col-span-8 bg-white/70 backdrop-blur-xl p-5 md:p-8 rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl -ml-32 -mt-32 pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-3">
            <div>
              <h4 className="font-bold text-slate-800 text-sm md:text-base">Grafik Performa</h4>
              <p className="text-[10px] text-slate-400">Analisis mingguan terintegrasi</p>
            </div>
            <select className="text-[10px] font-bold border border-slate-200 bg-slate-50 rounded-lg px-2 py-1.5 outline-none w-full sm:w-auto">
              <option>7 Hari Terakhir</option>
              <option>30 Hari Terakhir</option>
            </select>
          </div>
          <div className="h-[220px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 9, fontWeight: 600 }}
                  dy={10}
                  hide={window.innerWidth < 640}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 9, fontWeight: 600 }}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reporting & Decisions */}
        <div className="lg:col-span-4 bg-indigo-900 p-6 md:p-8 rounded-[2rem] text-white flex flex-col shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-fuchsia-500/30 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/20 rounded-full blur-[60px] pointer-events-none mix-blend-screen"></div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold">Bisnis AI Insight</h4>
          </div>
          
          <div className="space-y-3 flex-1">
            {[
              { label: 'PRODUKSI', text: 'Naikkan produksi 15% untuk lonjakan weekend.' },
              { label: 'MARKETING', text: 'IG Ads Mahasiswa ROAS 4.2x. Pertahankan.' },
              { label: 'KEUANGAN', text: 'Ada pengeluaran sarpra mendadak. Cek data.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/10 p-3.5 rounded-2xl border border-white/10 active:scale-[0.98] transition-transform">
                <p className="text-[9px] font-bold uppercase opacity-60 mb-1 tracking-wider">{item.label}</p>
                <p className="text-[11px] leading-relaxed font-medium">{item.text}</p>
              </div>
            ))}
          </div>
          
          <button className="mt-6 w-full py-3.5 bg-white text-indigo-900 rounded-2xl font-bold text-xs hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
            Laporan Lengkap (.pdf) <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Quick Management */}
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-sm md:text-base">Manajemen Tim</h3>
            <span className="text-[10px] text-indigo-600 font-bold cursor-pointer hover:underline">Semua</span>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Ahmad Zaky', role: 'Produksi', status: 'Online' },
              { name: 'Sarah Putri', role: 'Pemasaran', status: 'Meeting' },
              { name: 'Budi Santoso', role: 'Logistik', status: 'Online' },
            ].map((user, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-2xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200 text-xs">
                    {user.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-xs font-bold">{user.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{user.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-full">
                  <div className={cn("w-1 h-1 rounded-full", user.status === 'Online' ? 'bg-emerald-500' : 'bg-amber-500')}></div>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{user.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Finance Pulse */}
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold mb-5 text-sm md:text-base">Kesehatan Dana</h3>
          <div className="h-[160px] w-full mb-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.slice(0, 5)}>
                <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                  {data.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <p className="text-[9px] font-bold text-emerald-600 uppercase mb-1">Masuk</p>
              <p className="text-sm md:text-base font-black text-emerald-700">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl">
              <p className="text-[9px] font-bold text-rose-600 uppercase mb-1">Keluar</p>
              <p className="text-sm md:text-base font-black text-rose-700">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>

        {/* Digital Presence */}
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold mb-5 text-sm md:text-base">Status Digital</h3>
            <div className="space-y-4">
              {[
                { label: 'SEO Speed', value: 85, color: 'bg-indigo-600' },
                { label: 'Social Reach', value: 62, color: 'bg-purple-600' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-600 px-1">
                    <span>{item.label}</span>
                    <span className="text-slate-400">{item.value}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all duration-1000", item.color)} style={{ width: `${item.value}%` }}></div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between px-1 pt-2">
                <span className="text-[11px] font-bold text-slate-600">Google Rating</span>
                <div className="flex text-amber-400 gap-0.5">
                  {'★'.repeat(4)}<span className="text-slate-200">★</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 p-3.5 bg-indigo-50/50 border border-dashed border-indigo-200 rounded-2xl text-center">
            <p className="text-[10px] text-slate-500 mb-2 font-medium">Website aktif 99.9% hari ini.</p>
            <button className="text-[10px] font-bold text-indigo-600 hover:indigo-700 hover:underline">Kelola Portal Digital →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
