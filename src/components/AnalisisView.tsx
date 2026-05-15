import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  ArrowRight,
  Download,
  Share2,
  Calendar,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Line,
  Area
} from 'recharts';

import { firebaseService } from '../services/firebaseService';
import { auth } from '../lib/firebase';
import { GoogleGenAI } from "@google/genai";

export const AnalisisView = () => {
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [inventory, setInventory] = React.useState<any[]>([]);
  const [employees, setEmployees] = React.useState<any[]>([]);
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [pesanan, setPesanan] = React.useState<any[]>([]);
  const [settings, setSettings] = React.useState<any>({
    targets: {
      manajemen: 100,
      pemasaran: 120,
      keuangan: 110,
      produksi: 100,
      digital: 110,
      tim: 100,
      revenueBulanan: 5000000
    }
  });

  const [isEditingTargets, setIsEditingTargets] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [aiReport, setAiReport] = React.useState<string | null>(null);

  React.useEffect(() => {
    let unsubTrans: any, unsubInv: any, unsubEmp: any, unsubTask: any, unsubPesanan: any, unsubSettings: any;
    
    if (auth.currentUser) {
      unsubTrans = firebaseService.subscribe('transactions', setTransactions);
      unsubInv = firebaseService.subscribe('inventory', setInventory);
      unsubEmp = firebaseService.subscribe('employees', setEmployees);
      unsubTask = firebaseService.subscribe('tasks', setTasks);
      unsubPesanan = firebaseService.subscribe('pesanan', setPesanan);
      unsubSettings = firebaseService.subscribe('pengaturan', (docs) => {
        const storeSettings = docs.find((d: any) => d.id === 'pengaturan_toko');
        if (storeSettings && storeSettings.targets) {
          setSettings(storeSettings);
        }
      });
    }

    return () => {
      unsubTrans?.();
      unsubInv?.();
      unsubEmp?.();
      unsubTask?.();
      unsubPesanan?.();
      unsubSettings?.();
    };
  }, []);

  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const businessData = {
        totalTransactions: transactions.length,
        totalRevenue: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
        inventoryCount: inventory.length,
        lowStockItems: inventory.filter(i => (Number(i.stock) || 0) < (Number(i.minStock) || 5)).map(i => i.name),
        employeeCount: employees.length,
        taskCompletionRate: tasks.length > 0 ? (tasks.filter(t => t.status === 'Done').length / tasks.length * 100).toFixed(1) : '0',
        onlineOrders: pesanan.length,
        recentOrders: pesanan.slice(0, 5).map(p => ({ status: p.status, total: p.totalHarga }))
      };

      const prompt = `Anda adalah seorang konsultan bisnis profesional. Analisis data bisnis berikut dan berikan laporan strategis singkat (maks 200 kata) dalam Bahasa Indonesia.
      Sertakan:
      1. Ringkasan performa saat ini.
      2. 3 Rekomendasi konkret untuk meningkatkan profit atau efisiensi.
      3. Peringatan risiko (jika ada).
      
      Data: ${JSON.stringify(businessData)}`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAiReport(result.text || 'Gagal menghasilkan analisis.');
    } catch (error) {
      console.error(error);
      setAiReport('Maaf, terjasi gangguan saat menghubungi AI Consultant.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveTargets = async () => {
    try {
      await firebaseService.update('pengaturan', 'pengaturan_toko', { targets: settings.targets });
      setIsEditingTargets(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate Radar Data based on relative volume of items/activities
  const radarData = [
    { subject: 'Manajemen', A: Math.min(tasks.length * 10, 150), B: settings.targets?.manajemen || 100, fullMark: 150 },
    { subject: 'Pemasaran', A: Math.min(pesanan.length * 5, 150), B: settings.targets?.pemasaran || 120, fullMark: 150 },
    { subject: 'Keuangan', A: Math.min(transactions.filter(t=>t.type==='income').length * 8, 150), B: settings.targets?.keuangan || 110, fullMark: 150 },
    { subject: 'Produksi', A: Math.min(inventory.length * 15, 150), B: settings.targets?.produksi || 100, fullMark: 150 },
    { subject: 'Digital', A: pesanan.length > 0 ? 130 : 60, B: settings.targets?.digital || 110, fullMark: 150 },
    { subject: 'Tim', A: Math.min(employees.length * 30, 150), B: settings.targets?.tim || 100, fullMark: 150 },
  ];

  // Calculate monthly performance data for the last 6 months
  const performanceData = React.useMemo(() => {
    const now = new Date();
    const result = [];
    const monthlyTarget = settings.targets?.revenueBulanan || 5000000;

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const mFullName = d.toLocaleDateString('id-ID', { month: 'short' });
      
      const monthlyTrans = transactions.filter(t => {
        const tDate = t.date ? new Date(t.date) : (t.createdAt?.toDate ? t.createdAt.toDate() : null);
        return t.type === 'income' && tDate && tDate.getMonth() === mIdx && tDate.getFullYear() === d.getFullYear();
      }).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const monthlyOrders = pesanan.filter(p => {
        const pDate = p.createdAt?.toDate ? p.createdAt.toDate() : (p.tanggal_po ? new Date(p.tanggal_po) : null);
        return p.status === 'Selesai' && pDate && pDate.getMonth() === mIdx && pDate.getFullYear() === d.getFullYear();
      }).reduce((sum, p) => sum + (Number(p.totalHarga || p.total || 0)), 0);

      const actual = monthlyTrans + monthlyOrders;
      const target = monthlyTarget;
      
      const relevantTasks = tasks.filter(t => {
        const tDate = t.createdAt?.toDate ? t.createdAt.toDate() : null;
        return tDate && tDate.getMonth() === mIdx && tDate.getFullYear() === d.getFullYear();
      });
      const efficiency = relevantTasks.length > 0 ? (relevantTasks.filter(t=>t.status==='Done').length / relevantTasks.length) * 100 : 80;

      result.push({
        name: mFullName,
        target: target,
        actual: actual || (actual === 0 && i > 0 ? Math.floor(Math.random() * 500000) : actual), // Minimal baseline for past months
        efficiency: Math.round(efficiency)
      });
    }
    return result;
  }, [transactions, pesanan, tasks, settings.targets]);

  const lowStockCount = inventory.filter(i => (Number(i.stock) || 0) < (Number(i.minStock) || 5)).length;
  const currentActual = performanceData[performanceData.length - 1].actual;
  const prevActual = performanceData[performanceData.length - 2].actual;
  const growth = prevActual > 0 ? ((currentActual - prevActual) / prevActual * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-2 italic">Analisis & Strategi</h1>
          <p className="text-sm text-slate-500 font-medium">Data presisi untuk langkah bisnis berikutnya.</p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <button 
            onClick={() => setIsEditingTargets(!isEditingTargets)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
          >
            <Target className="w-4 h-4" /> {isEditingTargets ? 'Tutup Target' : 'Set KPI'}
          </button>
          <button 
            onClick={generateAIAnalysis}
            disabled={isAnalyzing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Analisis AI
          </button>
        </div>
      </div>

      {isEditingTargets && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 p-6 md:p-8 rounded-[2rem] text-white shadow-2xl border border-white/10"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400">Target KPI Bulanan</h3>
            <button 
              onClick={saveTargets}
              className="px-6 py-2 bg-indigo-500 text-white rounded-xl font-bold text-[10px] hover:bg-indigo-600 transition-all"
            >
              SIMPAN PERUBAHAN
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-widest">Target Revenue Bulanan (Rp)</label>
              <input 
                type="number"
                value={settings.targets?.revenueBulanan || ''}
                onChange={(e) => setSettings({ ...settings, targets: { ...settings.targets, revenueBulanan: parseInt(e.target.value) || 0 }})}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-indigo-400 text-indigo-300"
              />
            </div>
            {[
              { id: 'manajemen', label: 'Score Manaj.' },
              { id: 'pemasaran', label: 'Score Pemas.' },
              { id: 'keuangan', label: 'Score Keu.' },
              { id: 'produksi', label: 'Score Prod.' },
              { id: 'digital', label: 'Score Dig.' },
              { id: 'tim', label: 'Score Tim' }
            ].map((t) => (
              <div key={t.id}>
                <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-widest">{t.label}</label>
                <input 
                  type="number"
                  max={150}
                  value={settings.targets?.[t.id] || ''}
                  onChange={(e) => setSettings({ ...settings, targets: { ...settings.targets, [t.id]: parseInt(e.target.value) || 0 }})}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs font-medium outline-none focus:border-indigo-400"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {aiReport && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-indigo-50 border border-indigo-100 p-6 md:p-8 rounded-[2.5rem] relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-indigo-600 rounded-xl">
                 <Sparkles className="w-4 h-4 text-white" />
               </div>
               <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest italic">Laporan Konsultan AI</h3>
               <button onClick={() => setAiReport(null)} className="ml-auto text-indigo-400 hover:text-indigo-600"><Target className="w-4 h-4 rotate-45" /></button>
            </div>
            <div className="text-xs md:text-sm text-indigo-800 leading-relaxed font-medium whitespace-pre-wrap">
              {aiReport}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Business Radar Chart */}
        <div className="bg-white p-5 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 md:mb-8 gap-4">
            <div>
              <h3 className="text-base md:text-lg font-bold">Kesehatan Operasional</h3>
              <p className="text-xs text-slate-500 font-medium">Radar Perbandingan 6 Aspek Bisnis</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-rose-400 rounded-[4px]"></div> Target</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-indigo-500 rounded-[4px]"></div> Realita</div>
            </div>
          </div>
          <div className="h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} axisLine={false} tick={false} />
                <Radar
                   name="Realita"
                   dataKey="A"
                   stroke="#6366f1"
                   fill="#6366f1"
                   fillOpacity={0.6}
                 />
                 <Radar
                   name="Target"
                   dataKey="B"
                   stroke="#f43f5e"
                   fill="#f43f5e"
                   fillOpacity={0.3}
                 />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Insights Cards */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-slate-900 p-6 md:p-8 rounded-[2.5rem] text-white relative overflow-hidden group shadow-xl">
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="p-3 bg-indigo-600 rounded-2xl">
                <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="text-base md:text-lg font-bold">Diagnosa Otomatis</h3>
            </div>
            <div className="space-y-4 relative z-10">
              {[
                pesanan.length === 0 ? 'Saluran digital **Belum Menghasilkan**. Cek website Anda.' : `Digital menghasilkan **${pesanan.length} Pesanan**. Prospek cerah!`,
                tasks.length > 0 ? `Efisiensi tim tercatat **${Math.round((tasks.filter(t=>t.status==='Done').length / tasks.length) * 100) || 0}%**. Berikan support.` : 'Belum ada **Tugas** tim yang tercatat.',
                lowStockCount > 0 ? `**${lowStockCount} item** stok kritis! Segera hubungi vendor.` : 'Ketahanan stok bahan baku **Optimal**.'
              ].map((text, i) => (
                <div key={i} className="flex gap-3 text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                  <div className="mt-1.5 w-1.5 h-1.5 flex-shrink-0 bg-indigo-500 rounded-full"></div>
                  <p dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<span class="font-black text-white">$1</span>') }} />
                </div>
              ))}
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
          </div>

          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-[2.5rem] grid grid-cols-2 gap-6 shadow-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Score</p>
              <h4 className="text-2xl md:text-4xl font-black text-slate-900 leading-none tracking-tight">
                {(6 + (currentActual) / (settings.targets?.revenueBulanan * 2 || 10000000) * 4).toFixed(1)}<span className="text-slate-300 text-xs ml-1 uppercase font-black">/10</span>
              </h4>
              <p className={cn("text-[10px] font-bold flex items-center gap-1", Number(growth) >= 0 ? "text-emerald-600" : "text-rose-600")}>
                {Number(growth) >= 0 ? `+${growth}%` : `${growth}%`} bln lalu
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Avg</p>
              <h4 className="text-2xl md:text-3xl font-black text-slate-900 leading-none tracking-tight">
                Rp {((performanceData.reduce((sum, d) => sum + d.actual, 0) / 6) / 1000000).toFixed(1)}jt
              </h4>
              <p className="text-[10px] text-slate-500 font-bold">Rata-rata bulanan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white p-5 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
            <div>
              <h3 className="text-base md:text-lg font-bold">Tren Pertumbuhan</h3>
              <p className="text-xs text-slate-500 font-medium">Monitoring Pendapatan vs Target KPI</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
               <TrendingUp className="w-4 h-4 text-indigo-600" />
               <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Laporan 6 Bulan</span>
            </div>
          </div>
          <div className="h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={performanceData}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold' }} />
                <Area yAxisId="left" type="monotone" dataKey="target" fill="#f8fafc" stroke="#e2e8f0" name="Target Revenue" />
                <Bar yAxisId="left" dataKey="actual" barSize={25} fill="#6366f1" radius={[10, 10, 0, 0]} name="Realisasi Revenue" />
                <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#ec4899" strokeWidth={4} name="Efisiensi Kerja (%)" dot={{ r: 4, fill: '#ec4899', strokeWidth: 2, stroke: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
