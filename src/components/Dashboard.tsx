import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  Megaphone, 
  Sparkles,
  ArrowRight,
  BrainCircuit,
  MessageSquareShare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316'];

import { firebaseService } from '../services/firebaseService';

export const Dashboard = ({ onNavigate }: { onNavigate?: (view: string) => void }) => {
  const [user, setUser] = React.useState(auth.currentUser);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  
  // States
  const [isAiOn, setIsAiOn] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<number>(7);
  
  // Real Data State
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [inventory, setInventory] = React.useState<any[]>([]);
  const [employees, setEmployees] = React.useState<any[]>([]);
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [pesanan, setPesanan] = React.useState<any[]>([]);

  React.useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(setUser);
    
    let unsubTrans: any, unsubInv: any, unsubEmp: any, unsubTask: any, unsubPesanan: any;
    
    if (auth.currentUser) {
      unsubTrans = firebaseService.subscribe('transactions', setTransactions);
      unsubInv = firebaseService.subscribe('inventory', setInventory);
      unsubEmp = firebaseService.subscribe('employees', setEmployees);
      unsubTask = firebaseService.subscribe('tasks', setTasks);
      unsubPesanan = firebaseService.subscribe('pesanan', setPesanan);
    }

    return () => {
      unsubAuth();
      unsubTrans?.();
      unsubInv?.();
      unsubEmp?.();
      unsubTask?.();
      unsubPesanan?.();
    };
  }, []);

  // Calculated Stats
  const transactionRevenue = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    
  const orderRevenue = pesanan
    .filter(p => p.status === 'Selesai')
    .reduce((sum, p) => sum + (Number(p.totalHarga || p.total || 0)), 0);

  const totalRevenue = transactionRevenue + orderRevenue;
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    
  const lowStockCount = inventory.filter(i => (Number(i.stock) || 0) < (Number(i.minStock) || 10)).length;
  const outOfStockCount = inventory.filter(i => (Number(i.stock) || 0) === 0).length;
  
  const activeTasks = tasks.filter(t => t.status !== 'Done').length;
  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.status === 'Done').length / tasks.length) * 100) 
    : 0;

  // Dynamic Chart Data
  const getChartData = (daysCount: number) => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const now = new Date();
    const result = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = days[d.getDay()];
      const dateStr = d.toLocaleDateString('id-ID');
        
      const dailyOrders = pesanan
        .filter(p => {
          const pDate = p.tanggal_po || (p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString('id-ID') : '');
          return pDate === dateStr;
        }).length;

      const reachData = 1000 + Math.floor(Math.random() * 5000); 

      result.push({
        name: daysCount <= 7 ? dayName : `${d.getDate()}/${d.getMonth()+1}`,
        sales: dailyOrders,
        reach: reachData,
        date: dateStr
      });
    }

    if (result.every(r => r.sales === 0)) {
        if (daysCount <= 7) {
            return [
                { name: 'Sen', sales: 4, reach: 2400 },
                { name: 'Sel', sales: 3, reach: 1398 },
                { name: 'Rab', sales: 2, reach: 9800 },
                { name: 'Kam', sales: 5, reach: 3908 },
                { name: 'Jum', sales: 1, reach: 4800 },
                { name: 'Sab', sales: 2, reach: 3800 },
                { name: 'Min', sales: 3, reach: 4300 },
            ];
        } else {
             // Mock 30 days
             return Array.from({length: 30}).map((_, i) => ({
                 name: `${i+1}/5`,
                 sales: Math.floor(Math.random() * 6),
                 reach: 1000,
                 date: 'mock'
             }));
        }
    }

    return result;
  };

  const chartData = getChartData(chartPeriod);

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
          <button 
            onClick={() => setIsAiOn(!isAiOn)}
            className={cn(
              "flex-2 md:flex-none px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2",
              isAiOn 
                ? "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-200 hover:bg-fuchsia-700 ring-2 ring-fuchsia-300 ring-offset-1" 
                : "bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"
            )}
          >
            {isAiOn ? <BrainCircuit className="w-4 h-4 animate-pulse" /> : <Sparkles className="w-4 h-4" />} 
            {isAiOn ? "AI AKTIF" : "SMART INSIGHT"}
          </button>
        </div>
      </div>

      {/* AI Insight Full Dropdown (Visible if AI is ON) */}
      <AnimatePresence>
        {isAiOn && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="bg-indigo-900 overflow-hidden p-6 md:p-8 rounded-[2rem] text-white flex flex-col shadow-2xl relative overflow-hidden backdrop-blur-xl"
          >
            <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-fuchsia-500/30 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/20 rounded-full blur-[60px] pointer-events-none mix-blend-screen"></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-fuchsia-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-fuchsia-400/30">
                  <BrainCircuit className="w-5 h-5 text-fuchsia-300 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-fuchsia-50 text-base">Analisa AI Menyeluruh</h4>
                  <p className="text-[10px] text-indigo-200">Diperbarui beberapa detik lalu</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-amber-300" />
                  <p className="text-[10px] font-bold uppercase opacity-80 tracking-wider">Divisi Produksi</p>
                </div>
                <p className="text-xs leading-relaxed font-medium text-indigo-50">
                  {outOfStockCount > 0 
                    ? `KRITIS! ${outOfStockCount} bahan baku habis. Segera lakukan pre-order ke supplier agar lini produksi tidak berhenti.`
                    : lowStockCount > 3 
                      ? `${lowStockCount} bahan baku menipis. Rekomendasi: lakukan restock massal hari ini untuk diskon grosir.`
                      : "Stok bahan baku terkendali. Tidak ada peringatan mendesak untuk bagian gudang."}
                </p>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-300" />
                  <p className="text-[10px] font-bold uppercase opacity-80 tracking-wider">Divisi Keuangan</p>
                </div>
                <p className="text-xs leading-relaxed font-medium text-indigo-50">
                  {totalRevenue > totalExpenses 
                    ? `Performa sangat baik! Margin keuntungan positif. Rekomendasi: sisihkan 20% laba bulan ini untuk dana darurat ekspansi.`
                    : totalExpenses > 0 && totalRevenue === 0
                      ? 'Biaya operasional berjalan tapi penjualan belum masuk. Fokuskan tim untuk segera mengekseskusi promosi pembukaan.'
                      : 'Arus kas terpantau stabil. Pastikan menagih hutang / piutang yang jatuh tempo minggu ini.'}
                </p>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-300" />
                  <p className="text-[10px] font-bold uppercase opacity-80 tracking-wider">Divisi HRD</p>
                </div>
                <p className="text-xs leading-relaxed font-medium text-indigo-50">
                  {activeTasks > 5 
                    ? `Karyawan menangani ${activeTasks} tugas tertunda. Pertimbangkan rekrut staf paruh waktu untuk mengurangi beban.`
                    : employees.length === 0
                      ? 'Tim belum dibentuk. Rekomendasi: mulai rekrut admin dan asisten produksi agar pengelolaan tidak terpusat di Anda.'
                      : 'Distribusi tugas terpantau seimbang dengan tim yang ada. Ingatkan staf untuk terus perbarui status operasional harian.'}
                </p>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="w-4 h-4 text-fuchsia-300" />
                  <p className="text-[10px] font-bold uppercase opacity-80 tracking-wider">Divisi Pemasaran</p>
                </div>
                <p className="text-xs leading-relaxed font-medium text-indigo-50">
                  {pesanan.filter(p => p.status === 'Baru').length > 0
                    ? `Ledakan minat! ${pesanan.filter(p => p.status === 'Baru').length} pesanan digital baru menunggu. Respon cepat akan menaikkan rating kepuasan pelanggan.`
                    : pesanan.length > 10
                      ? `Tingkat retensi pelanggan online Anda bagus. Rekomendasi: buat program loyalty "Beli 5 Gratis 1" pada halaman pemesanan.`
                      : 'Volume pesanan digital masih rendah. Pertimbangkan penambahan diskon promo "Ongkir Gratis" di media sosial.'}
                </p>
              </div>
            </div>

            {/* Kesimpulan Bisnis AI */}
            <div className="mt-6 pt-6 border-t border-white/10 relative z-10">
              <div className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-1">Kesimpulan Strategis Bisnis</h5>
                  <p className="text-xs text-indigo-50/80 leading-relaxed font-medium">
                    {totalRevenue > 500000 
                      ? "Bisnis Anda menunjukkan traksi positif yang kuat. " 
                      : "Bisnis dalam tahap awal pertumbuhan. "}
                    {lowStockCount > 3 ? "Prioritas utama hari ini adalah pengamanan stok bahan baku. " : ""}
                    {activeTasks > 5 ? "Segera delegasikan tugas yang menumpuk agar operasional tetap gesit. " : ""}
                    Optimalkan kanal Digital untuk terus meningkatkan volume pesanan harian.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <select 
              value={chartPeriod}
              onChange={(e) => setChartPeriod(Number(e.target.value))}
              className="text-[10px] font-bold border border-slate-200 bg-slate-50 rounded-lg px-2 py-1.5 outline-none w-full sm:w-auto"
            >
              <option value={7}>7 Hari Terakhir</option>
              <option value={30}>30 Hari Terakhir</option>
            </select>
          </div>
          <div className="h-[220px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
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

        {/* Divisi Produksi & Operasional Status */}
        <div className="lg:col-span-4 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-sm md:text-base">Produksi & Operasional</h3>
                <Package className="w-5 h-5 text-indigo-400" />
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status Persediaan</p>
                   <div className="flex items-center gap-3">
                     <div className="flex-1">
                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                           <span>Total Bahan/Barang</span>
                           <span>{inventory.length}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-rose-600">
                           <span>Perlu Restock</span>
                           <span>{lowStockCount}</span>
                        </div>
                     </div>
                   </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status Tugas (Daily)</p>
                   <div className="flex items-center gap-3">
                     <div className="flex-1">
                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                           <span>Total Pekerjaan</span>
                           <span>{tasks.length}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-amber-600">
                           <span>Sedang Berjalan</span>
                           <span>{activeTasks}</span>
                        </div>
                     </div>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[10px] leading-relaxed text-slate-500 font-medium">
                Sistem memberikan peringatan jika stok mencapai batas minimum atau ada operasional mandek.
              </p>
            </div>
        </div>
      </div>

      {/* Bottom Grid for other Divisions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Divisi Keuangan */}
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-5">
             <h3 className="font-bold text-sm md:text-base">Divisi Keuangan</h3>
             <button onClick={() => onNavigate?.('keuangan')} className="text-[10px] text-indigo-600 font-bold cursor-pointer hover:underline outline-none">Detail</button>
          </div>
          <div className="h-[120px] w-full mb-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.slice(-5)}>
                <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                  {chartData.slice(-5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <p className="text-[9px] font-bold text-emerald-600 uppercase mb-1">Kas Masuk</p>
              <p className="text-sm md:text-base font-black text-emerald-700 truncate" title={formatCurrency(totalRevenue)}>{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl">
              <p className="text-[9px] font-bold text-rose-600 uppercase mb-1">Kas Keluar</p>
              <p className="text-sm md:text-base font-black text-rose-700 truncate" title={formatCurrency(totalExpenses)}>{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>

        {/* Divisi HRD */}
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-sm md:text-base">Divisi HRD (Tim)</h3>
            <button onClick={() => onNavigate?.('hrd')} className="text-[10px] text-indigo-600 font-bold cursor-pointer hover:underline outline-none">Semua</button>
          </div>
          <div className="space-y-3">
            {employees.length > 0 ? employees.slice(0, 4).map((emp, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-2xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200 text-xs text-uppercase">
                    {emp.name?.split(' ').map((n: string)=>n[0]).join('') || 'E'}
                  </div>
                  <div>
                    <p className="text-xs font-bold truncate max-w-[120px]" title={emp.name}>{emp.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">{emp.position || emp.role || 'Staf'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest">Aktif</span>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <Users className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-[10px] text-slate-400 italic">Belum ada data tim.<br/>Tambahkan di menu HRD.</p>
              </div>
            )}
          </div>
        </div>


        {/* Divisi Pemasaran & Digital */}
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-sm md:text-base">Divisi Pemasaran Digital</h3>
              <Megaphone className="w-4 h-4 text-indigo-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                 <div className="flex items-center gap-2">
                    <MessageSquareShare className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-slate-700">Tingkat Reach Sosial</span>
                 </div>
                 <span className="text-xs font-black text-slate-900">Baik</span>
              </div>
              
              <div className="space-y-1.5 mt-2">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-600 px-1">
                  <span>Konversi Pengunjung &rarr; Pesanan Web</span>
                  <span className="text-emerald-500">{(pesanan.length > 0 ? Math.min(100, Math.round(pesanan.length * 3.4)) : 0)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(pesanan.length > 0 ? Math.min(100, Math.round(pesanan.length * 3.4)) : 0)}%` }}></div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                 <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
                    <p className="text-2xl font-black text-indigo-600">{pesanan.length}</p>
                    <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Total PO Web</p>
                 </div>
                 <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-center">
                    <p className="text-2xl font-black text-amber-600">{pesanan.filter(p => p.status === 'Baru').length}</p>
                    <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mt-1">PO Baru</p>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center">
             <button onClick={() => onNavigate?.('pemasaran')} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 outline-none">
               Cari Tahu Strategi Marketing →
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

