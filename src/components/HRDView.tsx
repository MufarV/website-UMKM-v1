import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  MoreVertical, 
  Search,
  Mail,
  Shield,
  Heart,
  Zap,
  TrendingUp,
  ChevronRight,
  Plus,
  FileText,
  X,
  Save,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { firebaseService } from '../services/firebaseService';
import { auth } from '../lib/firebase';

export const HRDView = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [absensi, setAbsensi] = useState<any[]>([]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [newEmployee, setNewEmployee] = useState({ 
    name: '', 
    role: '', 
    status: 'Active', 
    email: '', 
    phone: '',
    notes: ''
  });

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubEmployees = firebaseService.subscribe('employees', setEmployees);
    const unsubAbsensi = firebaseService.subscribe('absensi', setAbsensi);
    return () => {
      unsubEmployees();
      unsubAbsensi();
    };
  }, []);

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.role) return;
    await firebaseService.create('employees', { ...newEmployee, ownerId: auth.currentUser?.uid });
    setNewEmployee({ 
      name: '', 
      role: '', 
      status: 'Active', 
      email: '', 
      phone: '',
      notes: ''
    });
    setShowAddEmployee(false);
  };

  const handleDelete = async (id: string) => {
    if (confirmDeleteId === id) {
      await firebaseService.delete('employees', id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const handleUpdateEmp = async (id: string, field: string, value: string) => {
    await firebaseService.update('employees', id, { [field]: value });
  };

  const saveNote = async () => {
    if (editingNoteId) {
      await handleUpdateEmp(editingNoteId, 'notes', tempNote);
      setEditingNoteId(null);
    }
  };

  const getAbsensiStats = (empName: string) => {
    const stats = { Hadir: 0, Telat: 0, Izin: 0, Sakit: 0, Alpa: 0 };
    absensi.forEach(rec => {
      if (rec.name === empName && stats[rec.status as keyof typeof stats] !== undefined) {
        stats[rec.status as keyof typeof stats]++;
      }
    });
    return stats;
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Human Resource Development (HRD) 👥</h1>
          <p className="text-slate-600 font-medium leading-relaxed">Kelola database SDM, pengembangan kapasitas, dan kesejahteraan tim.</p>
        </div>
        <button 
          onClick={() => setShowAddEmployee(!showAddEmployee)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" /> TAMBAH STAF BARU
        </button>
      </div>

      <AnimatePresence>
        {showAddEmployee && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 rounded-[2.5rem] border-2 border-indigo-50 shadow-xl space-y-6"
          >
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">Registrasi Karyawan / Staf</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nama Lengkap</label>
                <input 
                  placeholder="e.g. Ahmad Zaky" 
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 ring-indigo-500/10 font-bold"
                  value={newEmployee.name}
                  onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Posisi / Jabatan</label>
                <input 
                  placeholder="e.g. Manajer Operasional" 
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 ring-indigo-500/10 font-bold"
                  value={newEmployee.role}
                  onChange={e => setNewEmployee({...newEmployee, role: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nomor WhatsApp</label>
                <input 
                  placeholder="e.g. 628123456789" 
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 ring-indigo-500/10 font-bold"
                  value={newEmployee.phone}
                  onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Status Kerja</label>
                <select 
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 ring-indigo-500/10 font-bold"
                  value={newEmployee.status}
                  onChange={e => setNewEmployee({...newEmployee, status: e.target.value})}
                >
                  <option value="Active">Aktif</option>
                  <option value="On Leave">Cuti</option>
                  <option value="Inactive">Non-Aktif</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleAddEmployee}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
              >
                SIMPAN KE DATABASE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(emp => {
          const stats = getAbsensiStats(emp.name);
          return (
          <div key={emp.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden group">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-2xl shadow-inner">
                    {emp.name[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">{emp.name}</h3>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">{emp.role}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(emp.id)} 
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    confirmDeleteId === emp.id 
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-200" 
                      : "text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                  )}
                >
                  {confirmDeleteId === emp.id ? (
                    <span className="text-xs font-bold px-2">Hapus?</span>
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Absensi Summary */}
              <div className="grid grid-cols-5 gap-2 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-wider">Hadir</span>
                  <span className="text-sm font-black text-emerald-700">{stats.Hadir}</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-[8px] font-black text-orange-600 uppercase tracking-wider">Telat</span>
                  <span className="text-sm font-black text-orange-700">{stats.Telat}</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-[8px] font-black text-blue-600 uppercase tracking-wider">Izin</span>
                  <span className="text-sm font-black text-blue-700">{stats.Izin}</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-[8px] font-black text-amber-600 uppercase tracking-wider">Sakit</span>
                  <span className="text-sm font-black text-amber-700">{stats.Sakit}</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-[8px] font-black text-rose-600 uppercase tracking-wider">Alpa</span>
                  <span className="text-sm font-black text-rose-700">{stats.Alpa}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={() => { setEditingNoteId(emp.id); setTempNote(emp.notes || ''); }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  <FileText className="w-4 h-4" /> Buka Catatan Staf
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[10px] font-bold py-1">
                  <span className="text-slate-400 uppercase">Kontak Staf:</span>
                  <input 
                    className="text-slate-700 bg-transparent text-right outline-none w-32 border-b border-dashed border-slate-200 focus:border-indigo-400 focus:text-indigo-700 transition-colors"
                    value={emp.phone || ''}
                    onChange={(e) => handleUpdateEmp(emp.id, 'phone', e.target.value)}
                    placeholder="Masukkan kontak"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold py-1">
                  <span className="text-slate-400 uppercase">Status Aktif:</span>
                  <select 
                    className={cn(
                      "px-2 py-1 rounded-lg outline-none cursor-pointer border-none text-right font-black",
                      emp.status === 'Active' ? "bg-emerald-50 text-emerald-600" : 
                      emp.status === 'On Leave' ? "bg-amber-50 text-amber-600" :
                      "bg-rose-50 text-rose-600"
                    )}
                    value={emp.status || 'Active'}
                    onChange={(e) => handleUpdateEmp(emp.id, 'status', e.target.value)}
                  >
                    <option value="Active">Aktif</option>
                    <option value="On Leave">Cuti</option>
                    <option value="Inactive">Non-Aktif</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          );
        })}

        {employees.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest italic">Belum ada database staf yang terdaftar</p>
          </div>
        )}
      </div>

      {/* Note Modal */}
      <AnimatePresence>
        {editingNoteId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setEditingNoteId(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 md:p-8 flex justify-between items-center border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">Catatan Staf</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail & Evaluasi</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingNoteId(null)}
                  className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 md:p-8 flex-1 overflow-y-auto bg-slate-50/50">
                <textarea 
                  className="w-full h-full min-h-[300px] p-6 bg-white rounded-2xl text-sm font-medium text-slate-700 border border-slate-200 outline-none focus:ring-4 ring-indigo-500/10 focus:border-indigo-400 transition-all resize-none shadow-sm"
                  placeholder="Tuliskan catatan evaluasi, peringatan, atau prestasi staf di sini..."
                  value={tempNote}
                  onChange={(e) => setTempNote(e.target.value)}
                />
              </div>

              <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                <button 
                  onClick={() => setEditingNoteId(null)}
                  className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl text-xs uppercase tracking-widest transition-colors"
                >
                  BATAL
                </button>
                <button 
                  onClick={saveNote}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all"
                >
                  <Save className="w-4 h-4" /> SIMPAN CATATAN
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
