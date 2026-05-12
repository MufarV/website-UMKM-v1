import React from 'react';
import { 
  Globe, 
  Smartphone, 
  ShoppingBag, 
  Settings, 
  ExternalLink,
  ChevronRight,
  Monitor,
  Zap,
  Lock,
  Search
} from 'lucide-react';

export const DigitalView = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Digital Ecosystem</h1>
          <p className="text-slate-500">Kelola kehadiran online Anda mulai dari website, toko online, hingga SEO.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
          <Zap className="w-4 h-4" /> Luncurkan Campaign Digital
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Web Presence Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all">
            <div className="p-8 bg-slate-900 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-20">
                <Globe className="w-40 h-40" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Monitor className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">Website Utama UMKM</h3>
                </div>
                <h4 className="text-2xl font-bold mb-2">www.senjakopi.com</h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    Online
                  </div>
                  <div className="text-white/40 text-xs font-bold uppercase tracking-wider">SSL Secure</div>
                </div>
              </div>
            </div>
            <div className="p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pengunjung Unik</p>
                <h5 className="text-xl font-bold text-slate-900">4,281</h5>
                <p className="text-xs text-emerald-600 font-bold">+12%</p>
              </div>
              <div className="sm:pl-6 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Load Speed</p>
                <h5 className="text-xl font-bold text-slate-900">0.8s</h5>
                <p className="text-xs text-indigo-600 font-bold">Fastest</p>
              </div>
              <div className="sm:pl-6 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SEO Score</p>
                <h5 className="text-xl font-bold text-slate-900">92 / 100</h5>
                <p className="text-xs text-emerald-600 font-bold">Optimized</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-100 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">Marketplace Sync</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">Terhubung dengan Shopee, Tokopedia, dan TikTok Shop.</p>
              </div>
              <button className="text-sm font-bold text-indigo-600 flex items-center gap-2 group-hover:gap-3 transition-all">
                Kelola Integrasi <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-100 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">Google My Business</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">Kelola profil bisnis di Maps dan hasil pencarian lokal.</p>
              </div>
              <button className="text-sm font-bold text-indigo-600 flex items-center gap-2 group-hover:gap-3 transition-all">
                Update Profil <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Digital Tools */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-8">
          <h3 className="font-bold">Layanan Digital Aktif</h3>
          <div className="space-y-4">
            {[
              { name: 'Hosting Personal', status: 'Aktif', provider: 'Niagahoster', icon: Monitor },
              { name: 'Business Email', status: 'Aktif', provider: 'Google Workspace', icon: Smartphone },
              { name: 'POS Subscription', status: 'Lapse', provider: 'Moka POS', icon: Lock },
              { name: 'Domain .COM', status: 'Aktif', provider: 'Cloudflare', icon: Globe },
            ].map((tool, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-slate-400">
                    <tool.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{tool.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{tool.provider}</p>
                  </div>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded-md",
                  tool.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                )}>
                  {tool.status}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-slate-100">
            <button className="w-full flex items-center justify-between items-center group">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                   <Settings className="w-4 h-4" />
                 </div>
                 <span className="text-sm font-bold text-slate-700">Digital Settings</span>
               </div>
               <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShoppingBagLoc = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
)

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
