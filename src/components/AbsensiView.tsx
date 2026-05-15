import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Plus, 
  Trash2, 
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { firebaseService } from '../services/firebaseService';
import { auth } from '../lib/firebase';

export const AbsensiView = () => {
  const [absensi, setAbsensi] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [newEntry, setNewEntry] = useState({
    name: '',
    tanggal: new Date().toISOString().split('T')[0],
    waktu: '',
    status: 'Hadir',
    noted: '',
    lokasi_manual: '',
    location: null as { lat: number; lng: number } | null
  });

  useEffect(() => {
    if (showAdd) {
      setNewEntry(prev => ({
        ...prev,
        waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      }));
    }
  }, [showAdd]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubAbsensi = firebaseService.subscribe('absensi', setAbsensi);
    const unsubEmployees = firebaseService.subscribe('employees', setEmployees);
    return () => {
      unsubAbsensi();
      unsubEmployees();
    };
  }, []);

  const handleAdd = async () => {
    if (!newEntry.name || !newEntry.tanggal) return;
    
    setIsLocating(true);
    let location = null;
    
    try {
      if ("geolocation" in navigator) {
        // Handle potential permission denial or timeout
        location = await new Promise<any>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => {
               console.warn("GPS Access Denied/Error:", err);
               resolve(null); // Resolve with null so we can still save
            },
            { enableHighAccuracy: true, timeout: 6000 }
          );
        });
      }
    } catch (error) {
      console.error("Geolocation Error:", error);
    } finally {
      setIsLocating(false);
    }

    const actualTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    await firebaseService.create('absensi', { 
      ...newEntry, 
      waktu: actualTime,
      location,
      ownerId: auth.currentUser?.uid 
    });
    
    setNewEntry({
      name: '',
      tanggal: new Date().toISOString().split('T')[0],
      waktu: '',
      status: 'Hadir',
      noted: '',
      lokasi_manual: '',
      location: null
    });
    setShowAdd(false);
  };

  const handleDelete = async (id: string) => {
    if (confirmDeleteId === id) {
      await firebaseService.delete('absensi', id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Absensi Tim 📅</h1>
          <p className="text-slate-600 font-medium leading-relaxed">Kelola pencatatan kehadiran, cuti, izin, dan rekap karyawan harian.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> CATAT KEHADIRAN
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 rounded-[2.5rem] border-2 border-indigo-50 shadow-xl space-y-6"
          >
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">Log Kehadiran Baru</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nama Karyawan</label>
                {employees.length > 0 ? (
                  <select
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 ring-indigo-500/10 font-bold bg-white"
                    value={newEntry.name}
                    onChange={e => setNewEntry({...newEntry, name: e.target.value})}
                  >
                    <option value="">-- Pilih Staf --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    placeholder="e.g. Ahmad Zaky" 
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 ring-indigo-500/10 font-bold"
                    value={newEntry.name}
                    onChange={e => setNewEntry({...newEntry, name: e.target.value})}
                  />
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Tanggal</label>
                <input 
                  type="date"
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 ring-indigo-500/10 font-bold"
                  value={newEntry.tanggal}
                  onChange={e => setNewEntry({...newEntry, tanggal: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Status</label>
                <select 
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 ring-indigo-500/10 font-bold bg-white"
                  value={newEntry.status}
                  onChange={e => setNewEntry({...newEntry, status: e.target.value})}
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Telat">Telat</option>
                  <option value="Izin">Izin</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Alpa">Alpa</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Keterangan</label>
                <input 
                  placeholder="Keterangan..." 
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 ring-indigo-500/10 font-bold"
                  value={newEntry.noted}
                  onChange={e => setNewEntry({...newEntry, noted: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Lokasi/Tempat</label>
                <input 
                  placeholder="e.g. Cabang Bandung" 
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 ring-indigo-500/10 font-bold"
                  value={newEntry.lokasi_manual}
                  onChange={e => setNewEntry({...newEntry, lokasi_manual: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-between items-center pt-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <Clock className="w-3 h-3" />
                <span>Waktu Catat: {newEntry.waktu} (Auto)</span>
              </div>
              <button 
                disabled={isLocating}
                onClick={handleAdd}
                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isLocating ? 'Mengambil Lokasi...' : 'Simpan Log'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-xs text-slate-400 uppercase tracking-widest font-black">
              <tr>
                <th className="px-8 py-6 rounded-tl-[2rem]">Tanggal</th>
                <th className="px-8 py-6">Nama & Keterangan</th>
                <th className="px-8 py-6">Lokasi / Maps</th>
                <th className="px-8 py-6 text-center">Status</th>
                <th className="px-8 py-6 text-right rounded-tr-[2rem]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border-t border-slate-100">
              {absensi.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-400">
                    <CalendarCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-bold">Belum ada log absensi</p>
                    <p className="text-xs mt-1">Mulai catat kehadiran tim Anda</p>
                  </td>
                </tr>
              ) : (
                absensi.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6 font-bold text-slate-700 whitespace-nowrap">
                      <div>{new Date(rec.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> {rec.waktu || '--:--'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900 mb-1 flex items-center flex-wrap gap-2">
                        {rec.name || 'NN'}
                      </div>
                      {rec.noted && <div className="text-xs text-slate-500">{rec.noted}</div>}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2 items-start justify-center">
                        {rec.lokasi_manual && (
                           <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                             {rec.lokasi_manual}
                           </span>
                        )}
                        {rec.location && (
                          <a 
                            href={`https://www.google.com/maps?q=${rec.location.lat},${rec.location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[9px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-bold hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            title="Buka lokasi di Google Maps"
                          >
                            <MapPin className="w-2.5 h-2.5" /> Buka Maps
                          </a>
                        )}
                        {!rec.lokasi_manual && !rec.location && (
                          <span className="text-[10px] text-slate-300 italic">Tidak ada lokasi</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider",
                        rec.status === 'Hadir' && "bg-emerald-100 text-emerald-700",
                        rec.status === 'Telat' && "bg-orange-100 text-orange-700",
                        rec.status === 'Izin' && "bg-blue-100 text-blue-700",
                        rec.status === 'Sakit' && "bg-amber-100 text-amber-700",
                        rec.status === 'Alpa' && "bg-rose-100 text-rose-700"
                      )}>
                        {rec.status === 'Hadir' && <UserCheck className="w-3.5 h-3.5" />}
                        {rec.status === 'Telat' && <Clock className="w-3.5 h-3.5" />}
                        {rec.status === 'Izin' && <Clock className="w-3.5 h-3.5" />}
                        {rec.status === 'Sakit' && <AlertCircle className="w-3.5 h-3.5" />}
                        {rec.status === 'Alpa' && <UserX className="w-3.5 h-3.5" />}
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleDelete(rec.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg transition-all text-xs font-bold flex items-center gap-1 ml-auto",
                          confirmDeleteId === rec.id 
                            ? "bg-rose-500 text-white" 
                            : "text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                        )}
                      >
                        {confirmDeleteId === rec.id ? (
                          <>Hapus?</>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
