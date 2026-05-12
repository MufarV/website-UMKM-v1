import React from 'react';
import { 
  Wrench, 
  MapPin, 
  Calendar, 
  History, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Monitor,
  Printer,
  Coffee
} from 'lucide-react';

export const SarpraView = () => {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-2 italic">Aset & Sarana</h1>
          <p className="text-sm text-slate-500 font-medium">Monitoring kesehatan aset fisik bisnis Anda.</p>
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
          <Plus className="w-4 h-4" /> Daftar Aset
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {[
          { label: 'Total Aset', value: '42', unit: 'Unit', icon: Monitor, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Kondisi Baik', value: '38', unit: 'Unit', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Perlu Servis', value: '3', unit: 'Unit', icon: Wrench, color: 'bg-amber-50 text-amber-600' },
          { label: 'Broken', value: '1', unit: 'Unit', icon: AlertCircle, color: 'bg-rose-50 text-rose-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className={cn("p-2 w-fit rounded-xl mb-3 md:mb-4", stat.color)}>
              <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-lg md:text-2xl font-black text-slate-900">{stat.value}<span className="text-xs md:text-sm text-slate-400 ml-1 font-bold">{stat.unit}</span></h3>
          </div>
        ))}
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[
          { name: 'Mesin Espresso Pro', icon: Coffee, location: 'Outlet Utama', lastMain: '12 Jan 2024', status: 'Baik' },
          { name: 'Printer Label v2', icon: Printer, location: 'Gudang 1', lastMain: '05 Mar 2024', status: 'Servis' },
          { name: 'Laptop Admin', icon: Monitor, location: 'Kantor', lastMain: '10 Apr 2024', status: 'Baik' },
          { name: 'Timbangan Digital', icon: Wrench, location: 'Produksi', lastMain: '15 Feb 2024', status: 'Baik' },
          { name: 'Mixer Tepung Large', icon: RefreshCw, location: 'Gudang 1', lastMain: '20 Meo 2024', status: 'Rusak' },
        ].map((asset, i) => (
          <div key={i} className="bg-white rounded-3xl border border-slate-100 p-5 md:p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative shadow-sm">
            <div className="flex justify-between items-start mb-5 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <asset.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className={cn(
                "px-2 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest",
                asset.status === 'Baik' ? 'bg-emerald-50 text-emerald-600' : 
                asset.status === 'Servis' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
              )}>
                {asset.status}
              </span>
            </div>
            <h3 className="font-black text-slate-900 mb-4 text-sm md:text-base leading-tight">{asset.name}</h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-500 font-medium">
                <MapPin className="w-3 md:w-3.5 h-3 md:h-3.5" />
                <span>{asset.location}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-500 font-medium">
                <Calendar className="w-3 md:w-3.5 h-3 md:h-3.5" />
                <span>Servis: {asset.lastMain}</span>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button className="flex-1 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-slate-100">
                <History className="w-3 h-3" /> History
              </button>
              <button className="flex-1 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-indigo-100">
                <Wrench className="w-3 h-3" /> Servis
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RefreshCw = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
