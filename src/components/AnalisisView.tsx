import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  ArrowRight,
  Download,
  Share2,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';
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

const radarData = [
  { subject: 'Manajemen', A: 120, B: 110, fullMark: 150 },
  { subject: 'Pemasaran', A: 98, B: 130, fullMark: 150 },
  { subject: 'Keuangan', A: 86, B: 130, fullMark: 150 },
  { subject: 'Produksi', A: 99, B: 100, fullMark: 150 },
  { subject: 'Digital', A: 85, B: 90, fullMark: 150 },
  { subject: 'Sarpra', A: 65, B: 85, fullMark: 150 },
];

const performanceData = [
  { name: 'Jan', target: 4000, actual: 4400, efficiency: 85 },
  { name: 'Feb', target: 3000, actual: 2398, efficiency: 70 },
  { name: 'Mar', target: 2000, actual: 5800, efficiency: 95 },
  { name: 'Apr', target: 2780, actual: 3908, efficiency: 88 },
  { name: 'Mei', target: 1890, actual: 4800, efficiency: 92 },
  { name: 'Jun', target: 2390, actual: 3800, efficiency: 80 },
];

export const AnalisisView = () => {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-2 italic">Analisis & Strategi</h1>
          <p className="text-sm text-slate-500 font-medium">Data presisi untuk langkah bisnis berikutnya.</p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 transition-all active:scale-95">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Business Radar Chart */}
        <div className="bg-white p-5 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 md:mb-8 gap-4">
            <div>
              <h3 className="text-base md:text-lg font-bold">Kesehatan Operasional</h3>
              <p className="text-xs text-slate-500 font-medium">Radar Perbandingan 6 Aspek</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-indigo-500 rounded-[4px]"></div> Target</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-rose-400 rounded-[4px]"></div> Realita</div>
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

        {/* Detailed Insight Cards */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-indigo-600 p-6 md:p-8 rounded-3xl text-white relative overflow-hidden group shadow-xl shadow-indigo-100">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <Lightbulb className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="text-base md:text-lg font-bold">AI Strategist Insight</h3>
            </div>
            <div className="space-y-4 relative z-10">
              {[
                'Sektor **Digital** di bawah target. Perlu aktivasi GMB.',
                'Efisiensi **Produksi** naik 15% sejak April. Lanjutkan.',
                'Stok bahan baku kritis di sektor **Sarpra**. Re-order Hari ini.'
              ].map((text, i) => (
                <div key={i} className="flex gap-3 text-xs md:text-sm text-indigo-50 leading-relaxed font-medium">
                  <div className="mt-1.5 w-1.5 h-1.5 flex-shrink-0 bg-indigo-300 rounded-full"></div>
                  <p>{text.replace(/\*\*(.*?)\*\*/g, '<span class="font-black text-white">$1</span>')}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl grid grid-cols-2 gap-4 shadow-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Score</p>
              <h4 className="text-2xl md:text-3xl font-black text-slate-900 leading-none tracking-tight">8.4<span className="text-slate-300 text-sm ml-1">/10</span></h4>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">+0.4 bln lalu</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Burn</p>
              <h4 className="text-2xl md:text-3xl font-black text-slate-900 leading-none tracking-tight">Rp 2.4jt</h4>
              <p className="text-[10px] text-slate-500 font-bold">Harian rata-rata</p>
            </div>
          </div>
        </div>
      </div>

      {/* Target vs Actual Chart */}
      <div className="bg-white p-5 md:p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
            <div>
              <h3 className="text-base md:text-lg font-bold">Target vs Realisasi</h3>
              <p className="text-xs text-slate-500 font-medium">Performa KPI Bisnis 6 Bulan Terakhir</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto whitespace-nowrap scrollbar-hide">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Januar - Juni 2024</span>
            </div>
          </div>
          <div className="h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={performanceData}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '10px' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold' }} />
                <Area yAxisId="left" type="monotone" dataKey="target" fill="#f8fafc" stroke="#e2e8f0" name="Target" />
                <Bar yAxisId="left" dataKey="actual" barSize={20} fill="#6366f1" radius={[8, 8, 0, 0]} name="Realisasi" />
                <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#ec4899" strokeWidth={3} name="Efisiensi (%)" dot={{r: 2}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
