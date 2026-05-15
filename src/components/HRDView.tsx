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
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { firebaseService } from '../services/firebaseService';
import { auth } from '../lib/firebase';

export const HRDView = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
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
    const unsub = firebaseService.subscribe('employees', setEmployees);
    return () => unsub();
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
    if (window.confirm('Hapus staf ini?')) {
      await firebaseService.delete('employees', id);
    }
  };

  const handleUpdateNote = async (id: string, notes: string) => {
    await firebaseService.update('employees', id, { notes });
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
        {employees.map(emp => (
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
                <button onClick={() => handleDelete(emp.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Catatan</label>
                <textarea 
                  className="w-full p-3 bg-slate-50 rounded-2xl text-xs font-medium text-slate-700 border border-slate-100 outline-none focus:ring-2 ring-indigo-500/10 focus:bg-white transition-colors resize-none h-20"
                  placeholder="Tambahkan catatan..."
                  defaultValue={emp.notes || ''}
                  onBlur={(e) => handleUpdateNote(emp.id, e.target.value)}
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-slate-400 uppercase">Kontak Staf:</span>
                  <span className="text-slate-700">{emp.phone || '-'}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-slate-400 uppercase">Status Aktif:</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-lg",
                    emp.status === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  )}>{emp.status}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {employees.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest italic">Belum ada database staf yang terdaftar</p>
          </div>
        )}
      </div>
    </div>
  );
};
