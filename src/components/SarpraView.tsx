import React, { useState, useEffect } from 'react';
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
  Coffee,
  X,
  Save,
  Trash2,
  Users,
  Hash,
  RefreshCw,
  Banknote
} from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import { motion, AnimatePresence } from 'motion/react';

const iconMap: Record<string, any> = {
  'Monitor': Monitor,
  'Printer': Printer,
  'Coffee': Coffee,
  'Wrench': Wrench,
  'RefreshCw': RefreshCw
};

export const SarpraView = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  // Modals state
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [assetForm, setAssetForm] = useState<any>({
    name: '', ownership: '', quantity: 1, price: 0, status: 'Baik', icon: 'Monitor'
  });
  
  const [activeAssetLogs, setActiveAssetLogs] = useState<any | null>(null);
  const [logForm, setLogForm] = useState<any>({ date: '', notes: '' });
  const [isAddingLog, setIsAddingLog] = useState(false);

  useEffect(() => {
    const unsubAssets = firebaseService.subscribe('sarpra_assets', setAssets);
    const unsubLogs = firebaseService.subscribe('sarpra_logs', setLogs);
    return () => {
      unsubAssets();
      unsubLogs();
    }
  }, []);

  const totalAssets = assets.length;
  const conditions = {
    baik: assets.filter(a => a.status === 'Baik').length,
    servis: assets.filter(a => a.status === 'Servis').length,
    rusak: assets.filter(a => a.status === 'Rusak').length
  };

  const handleSaveAsset = async () => {
    if (!assetForm.name || !assetForm.ownership || assetForm.quantity < 1) return;
    try {
      await firebaseService.create('sarpra_assets', {
        ...assetForm
      });
      setIsAddingAsset(false);
      setAssetForm({ name: '', ownership: '', quantity: 1, price: 0, status: 'Baik', icon: 'Monitor' });
    } catch (e) {
      console.error(e);
    }
  };

  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

  const handleDeleteAsset = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (assetToDelete === id) {
      try {
        await firebaseService.delete('sarpra_assets', id);
        setAssetToDelete(null);
      } catch (err) {
        console.error(err);
      }
    } else {
      setAssetToDelete(id);
      setTimeout(() => setAssetToDelete(null), 3000);
    }
  };

  const handleSaveLog = async () => {
    if (!activeAssetLogs || !logForm.date || !logForm.notes) return;
    try {
      await firebaseService.create('sarpra_logs', {
        assetId: activeAssetLogs.id,
        date: logForm.date,
        notes: logForm.notes
      });
      setIsAddingLog(false);
      setLogForm({ date: '', notes: '' });
      
      // Update asset status to 'Servis' automatically when logged? Or leave it to manual
    } catch (e) {
      console.error(e);
    }
  };
  
  const toggleStatus = async (asset: any) => {
    const statuses = ['Baik', 'Servis', 'Rusak'];
    const next = statuses[(statuses.indexOf(asset.status) + 1) % statuses.length];
    await firebaseService.update('sarpra_assets', asset.id, { status: next });
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-2 italic">Aset & Sarana</h1>
          <p className="text-sm text-slate-500 font-medium">Monitoring kesehatan aset fisik bisnis Anda.</p>
        </div>
        <button 
          onClick={() => setIsAddingAsset(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
          <Plus className="w-4 h-4" /> Daftar Aset Baru
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {[
          { label: 'Total Aset', value: totalAssets, unit: 'Unit', icon: Monitor, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Kondisi Baik', value: conditions.baik, unit: 'Unit', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Perlu Servis', value: conditions.servis, unit: 'Unit', icon: Wrench, color: 'bg-amber-50 text-amber-600' },
          { label: 'Broken', value: conditions.rusak, unit: 'Unit', icon: AlertCircle, color: 'bg-rose-50 text-rose-600' },
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

      {assets.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <Monitor className="w-16 h-16 text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Belum ada aset</h3>
          <p className="text-sm text-slate-500 max-w-sm mb-6">Klik tombol "Daftar Aset Baru" untuk mulai mendata sarana dan prasarana Anda.</p>
          <button 
            onClick={() => setIsAddingAsset(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors">
            <Plus className="w-4 h-4" /> Tambah Aset Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {assets.map((asset) => {
            const IconComponent = iconMap[asset.icon] || Monitor;
            const assetLogs = logs.filter(l => l.assetId === asset.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const lastMain = assetLogs.length > 0 ? assetLogs[0].date : 'Belum pernah';

            return (
            <div key={asset.id} className="bg-white rounded-3xl border border-slate-100 p-5 md:p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-5 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <IconComponent className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button 
                    onClick={() => toggleStatus(asset)}
                    className={cn(
                    "px-2 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-colors cursor-pointer",
                    asset.status === 'Baik' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : 
                    asset.status === 'Servis' ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                  )}>
                    {asset.status}
                  </button>
                  <button 
                    onClick={(e) => handleDeleteAsset(asset.id, e)} 
                    className={cn(
                      "transition-all",
                      assetToDelete === asset.id 
                        ? "text-xs font-bold text-white bg-rose-500 px-2 py-0.5 rounded-lg opacity-100 hover:bg-rose-600" 
                        : "text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100"
                    )}>
                    {assetToDelete === asset.id ? "Hapus?" : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <h3 className="font-black text-slate-900 mb-1 text-sm md:text-base leading-tight">{asset.name}</h3>

              <div className="space-y-2.5 flex-1 mt-4">
                <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-500 font-medium">
                  <Hash className="w-3 md:w-3.5 h-3 md:h-3.5 shrink-0" />
                  <span className="truncate">Jumlah: {asset.quantity} {asset.quantity > 1 ? 'Units' : 'Unit'}</span>
                </div>
                {asset.price > 0 && (
                  <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-500 font-medium">
                    <Banknote className="w-3 md:w-3.5 h-3 md:h-3.5 shrink-0" />
                    <span className="truncate">Harga: Rp {asset.price.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-500 font-medium">
                  <Users className="w-3 md:w-3.5 h-3 md:h-3.5 shrink-0" />
                  <span className="truncate">{asset.ownership || 'Belum ada keterangan'}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-500 font-medium">
                  <Calendar className="w-3 md:w-3.5 h-3 md:h-3.5 shrink-0" />
                  <span className="truncate">Servis Terakhir: {lastMain}</span>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button 
                  onClick={() => setActiveAssetLogs({ ...asset, logs: assetLogs })}
                  className="flex-1 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-slate-100">
                  <History className="w-3 h-3" /> History
                </button>
                <button 
                  onClick={() => { setActiveAssetLogs({ ...asset, logs: assetLogs }); setIsAddingLog(true); }}
                  className="flex-1 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-indigo-100">
                  <Wrench className="w-3 h-3" /> Catat Servis
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Asset Modal */}
      <AnimatePresence>
        {isAddingAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddingAsset(false)} />
             <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-[2rem] p-6 lg:p-8 w-full max-w-md relative z-10 shadow-2xl">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-black text-slate-800">Aset Baru</h2>
                 <button onClick={() => setIsAddingAsset(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5"/></button>
               </div>
               
               <div className="space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1.5">Nama Aset</label>
                   <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300" placeholder="Mesin Espresso..." value={assetForm.name} onChange={e => setAssetForm({...assetForm, name: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1.5">Kepemilikan</label>
                     <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300" placeholder="Contoh: PT Prima..." value={assetForm.ownership} onChange={e => setAssetForm({...assetForm, ownership: e.target.value})} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1.5">Jumlah</label>
                     <input type="number" min="1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300" placeholder="1" value={assetForm.quantity} onChange={e => setAssetForm({...assetForm, quantity: parseInt(e.target.value) || 0})} />
                   </div>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1.5">Harga Aset</label>
                   <input type="number" min="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300" placeholder="0" value={assetForm.price || ''} onChange={e => setAssetForm({...assetForm, price: parseInt(e.target.value) || 0})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1.5">Kondisi Awal</label>
                     <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={assetForm.status} onChange={e => setAssetForm({...assetForm, status: e.target.value})}>
                        <option value="Baik">Baik</option>
                        <option value="Servis">Servis</option>
                        <option value="Rusak">Rusak</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1.5">Ikon</label>
                     <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={assetForm.icon} onChange={e => setAssetForm({...assetForm, icon: e.target.value})}>
                        <option value="Monitor">Monitor</option>
                        <option value="Printer">Printer</option>
                        <option value="Coffee">Alat F&B</option>
                        <option value="Wrench">Perkakas</option>
                        <option value="RefreshCw">Mesin Produksi</option>
                     </select>
                   </div>
                 </div>
                 
                 <button onClick={handleSaveAsset} className="w-full mt-2 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                   <Save className="w-4 h-4" /> Simpan Aset
                 </button>
               </div>
             </motion.div>
          </div>
        )}

        {/* Logs Modal */}
        {activeAssetLogs && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setActiveAssetLogs(null); setIsAddingLog(false); }} />
             <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-[2rem] p-6 lg:p-8 w-full max-w-xl relative z-10 shadow-2xl flex flex-col max-h-[90vh]">
               <div className="flex justify-between items-center mb-6 shrink-0">
                 <div>
                   <h2 className="text-xl font-black text-slate-800">Riwayat Servis</h2>
                   <p className="text-sm font-medium text-slate-500">{activeAssetLogs.name}</p>
                 </div>
                 <button onClick={() => { setActiveAssetLogs(null); setIsAddingLog(false); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5"/></button>
               </div>

               <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-3 custom-scrollbar">
                 {logs.filter(l => l.assetId === activeAssetLogs.id).length === 0 ? (
                   <div className="py-8 text-center text-slate-400 text-sm font-medium">Belum ada riwayat servis.</div>
                 ) : (
                   logs.filter(l => l.assetId === activeAssetLogs.id)
                     .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                     .map((log: any) => (
                       <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="flex justify-between items-start mb-2">
                           <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded shadow-sm">{log.date}</span>
                           <button 
                             onClick={async () => {
                               if (log.isDeleting) return;
                               setLogs(prev => prev.map(l => l.id === log.id ? { ...l, isDeleting: true } : l));
                               try {
                                 await firebaseService.delete('sarpra_logs', log.id);
                               } catch (e) {
                                 console.error(e);
                                 setLogs(prev => prev.map(l => l.id === log.id ? { ...l, isDeleting: false } : l));
                               }
                             }} 
                             disabled={log.isDeleting}
                             className={cn("transition-colors", log.isDeleting ? "text-slate-200" : "text-slate-300 hover:text-rose-500")}
                           >
                             <Trash2 className={cn("w-3.5 h-3.5", log.isDeleting && "animate-pulse")} />
                           </button>
                         </div>
                         <p className="text-sm text-slate-700 font-medium leading-relaxed">{log.notes}</p>
                       </div>
                   ))
                 )}
               </div>

               {isAddingLog ? (
                 <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 shrink-0">
                   <h4 className="text-sm font-bold text-indigo-900 mb-3">Catat Info Servis / Kerusakan</h4>
                   <div className="space-y-3">
                     <input type="date" className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-indigo-300" value={logForm.date} onChange={e => setLogForm({...logForm, date: e.target.value})} />
                     <textarea className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-indigo-300 resize-none h-24 placeholder:text-slate-400" placeholder="Jelaskan apa yang diservis atau dikeluhkan..." value={logForm.notes} onChange={e => setLogForm({...logForm, notes: e.target.value})}></textarea>
                     <div className="flex justify-end gap-2">
                       <button onClick={() => { setIsAddingLog(false); setLogForm({date:'',notes:''}); }} className="px-4 py-2 text-slate-500 text-sm font-bold hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                       <button onClick={handleSaveLog} className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5"><Save className="w-4 h-4"/> Simpan Catatan</button>
                     </div>
                   </div>
                 </div>
               ) : (
                 <button onClick={() => { setIsAddingLog(true); setLogForm({date: new Date().toISOString().split('T')[0], notes: ''}); }} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shrink-0">
                   <Plus className="w-4 h-4" /> Catat Servis / Input Info Baru
                 </button>
               )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
