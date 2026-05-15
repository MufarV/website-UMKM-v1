import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Mail,
  Calendar,
  Layers,
  ChevronRight,
  Filter,
  LayoutGrid,
  GanttChart,
  ChevronLeft,
  Briefcase,
  Target,
  Shield,
  Zap,
  TrendingUp,
  FileText,
  Save,
  Rocket,
  Package,
  Heart,
  Share2,
  CreditCard,
  Wallet,
  Activity,
  UserCheck,
  ClipboardList,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { firebaseService } from '../services/firebaseService';
import { auth } from '../lib/firebase';
import { 
  format, 
  startOfToday, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addDays, 
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths
} from 'date-fns';
import { id } from 'date-fns/locale';

// --- Types ---
interface Task {
  id: string;
  title: string;
  assigneeId: string;
  projectId?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Todo' | 'In Progress' | 'Done';
  deadline: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold';
  startDate: string;
  endDate: string;
}

interface Division {
  id: string;
  name: string;
  description: string;
  employeeIds: string[];
}

// --- Components ---

const BMCBlock = ({ label, icon: Icon, value, placeholder, onChange }: { label: string, icon: any, value: string, placeholder: string, onChange: (val: string) => void }) => (
  <div className="bg-white p-4 border border-slate-200 hover:border-indigo-300 transition-colors flex flex-col gap-2">
    <div className="flex items-center gap-2 text-indigo-600">
      <Icon className="w-3.5 h-3.5" />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <textarea 
      className="flex-1 bg-transparent text-xs font-medium text-slate-700 outline-none resize-none min-h-[140px] placeholder:text-slate-300 leading-relaxed"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

const PlanningView = ({ planning, projects, onUpdate }: { planning: any, projects: any[], onUpdate: (data: any) => void }) => {
  const [data, setData] = useState(planning || {
    vision: '',
    mission: '',
    financialTargets: [],
    nonFinancialTargets: [],
    assumptions: '',
    swot: { s: [], w: [], o: [], t: [] },
    strategicIssues: { iu: [], inu: [], niu: [], ninu: [] },
    jobdesks: { pra: '', pas: '', pasca: '' },
    strategies: [],
    bmc: {
      partners: '',
      activities: '',
      resources: '',
      valueProps: '',
      relations: '',
      channels: '',
      segments: '',
      costs: '',
      revenues: ''
    },
    schedules: []
  });

  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', startDate: '', endDate: '', status: 'Active' });

  const handleAddProject = () => {
    if (!newProject.name) return;
    firebaseService.create('projects', { ...newProject, ownerId: auth.currentUser?.uid });
    setNewProject({ name: '', startDate: '', endDate: '', status: 'Active' });
    setShowAddProject(false);
  };

  useEffect(() => {
    if (planning) {
      setData({
        ...planning,
        assumptions: planning.assumptions || '',
        swot: planning.swot || { s: [], w: [], o: [], t: [] },
        strategicIssues: planning.strategicIssues || { iu: [], inu: [], niu: [], ninu: [] },
        jobdesks: planning.jobdesks || { pra: '', pas: '', pasca: '' },
        bmc: planning.bmc || {
          partners: '',
          activities: '',
          resources: '',
          valueProps: '',
          relations: '',
          channels: '',
          segments: '',
          costs: '',
          revenues: ''
        },
        schedules: planning.schedules || []
      });
    }
  }, [planning]);

  const handleSave = () => {
    onUpdate({ ...data, updatedAt: new Date().toISOString() });
  };

  const addTarget = (type: 'financial' | 'nonFinancial') => {
    const newTarget = { id: Date.now().toString(), title: '', value: '', deadline: '', status: 'Pending' };
    if (type === 'financial') {
      setData({ ...data, financialTargets: [...data.financialTargets, newTarget] });
    } else {
      setData({ ...data, nonFinancialTargets: [...data.nonFinancialTargets, newTarget] });
    }
  };

  const removeTarget = (type: 'financial' | 'nonFinancial', id: string) => {
    const newSchedules = (data.schedules || []).filter((s: any) => s.targetId !== id);
    if (type === 'financial') {
      const newTargets = data.financialTargets.filter((t: any) => t.id !== id);
      const newData = { ...data, financialTargets: newTargets, schedules: newSchedules };
      setData(newData);
      onUpdate({ ...newData, updatedAt: new Date().toISOString() });
    } else {
      const newTargets = data.nonFinancialTargets.filter((t: any) => t.id !== id);
      const newData = { ...data, nonFinancialTargets: newTargets, schedules: newSchedules };
      setData(newData);
      onUpdate({ ...newData, updatedAt: new Date().toISOString() });
    }
  };

  const updateTarget = (type: 'financial' | 'nonFinancial', id: string, field: string, value: string) => {
    const list = type === 'financial' ? 'financialTargets' : 'nonFinancialTargets';
    const newList = data[list].map((t: any) => t.id === id ? { ...t, [field]: value } : t);
    setData({ ...data, [list]: newList });
  };

  const addSwotItem = (key: keyof typeof data.swot) => {
    const newItem = '';
    setData({ ...data, swot: { ...data.swot, [key]: [...data.swot[key], newItem] } });
  };

  const updateSwotItem = (key: keyof typeof data.swot, index: number, value: string) => {
    const newItems = [...data.swot[key]];
    newItems[index] = value;
    setData({ ...data, swot: { ...data.swot, [key]: newItems } });
  };

  const removeSwotItem = (key: keyof typeof data.swot, index: number) => {
    const newItems = data.swot[key].filter((_: any, i: number) => i !== index);
    setData({ ...data, swot: { ...data.swot, [key]: newItems } });
  };

  const addStrategicIssueItem = (key: keyof typeof data.strategicIssues) => {
    const newItem = '';
    const currentList = data.strategicIssues?.[key] || [];
    setData({ ...data, strategicIssues: { ...data.strategicIssues, [key]: [...currentList, newItem] } });
  };

  const updateStrategicIssueItem = (key: keyof typeof data.strategicIssues, index: number, value: string) => {
    const newItems = [...(data.strategicIssues?.[key] || [])];
    newItems[index] = value;
    setData({ ...data, strategicIssues: { ...data.strategicIssues, [key]: newItems } });
  };

  const removeStrategicIssueItem = (key: keyof typeof data.strategicIssues, index: number) => {
    const newItems = (data.strategicIssues?.[key] || []).filter((_: any, i: number) => i !== index);
    setData({ ...data, strategicIssues: { ...data.strategicIssues, [key]: newItems } });
  };

  const addSchedule = () => {
    const newSched = { id: Date.now().toString(), task: '', projectId: '', targetId: '', startDate: '', endDate: '', status: 'Planned' };
    setData({ ...data, schedules: [...(data.schedules || []), newSched] });
  };

  const removeSchedule = (id: string) => {
    const newSchedules = data.schedules.filter((s: any) => s.id !== id);
    setData({ ...data, schedules: newSchedules });
    onUpdate({ ...data, schedules: newSchedules, updatedAt: new Date().toISOString() });
  };

  const updateSchedule = (id: string, field: string, value: string) => {
    const newSchedules = data.schedules.map((s: any) => s.id === id ? { ...s, [field]: value } : s);
    setData({ ...data, schedules: newSchedules });
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Hapus proyek ini beserta tugas terkaitnya?')) {
      await firebaseService.delete('projects', id);
      const newSchedules = (data.schedules || []).filter((s: any) => s.projectId !== id);
      const newData = { ...data, schedules: newSchedules };
      setData(newData);
      onUpdate({ ...newData, updatedAt: new Date().toISOString() });
    }
  };

  const allTargets = [
    ...(data.financialTargets || []).map((t: any) => ({ ...t, type: 'Financial' })),
    ...(data.nonFinancialTargets || []).map((t: any) => ({ ...t, type: 'Operational' }))
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Perencanaan Strategis Bisnis</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tentukan arah dan strategi pertumbuhan bisnis Anda</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" /> SIMPAN PERENCANAAN
        </button>
      </div>

        {/* Visi & Misi */}
        <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden space-y-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" /> Visi & Misi Bisnis
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Visi (Tujuan Jangka Panjang)</label>
              <textarea 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 ring-indigo-500/10 font-bold text-slate-700 min-h-[100px]"
                placeholder="Apa impian besar bisnis Anda ke depan?"
                value={data.vision}
                onChange={e => setData({ ...data, vision: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Misi (Langkah Strategis)</label>
              <textarea 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 ring-indigo-500/10 font-bold text-slate-700 min-h-[100px]"
                placeholder="Langkah apa yang dilakukan untuk mencapai visi?"
                value={data.mission}
                onChange={e => setData({ ...data, mission: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Asumsi Sebelum SWOT */}
        <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-amber-500" /> Asumsi (Catatan Sebelum SWOT)
          </h3>
          <textarea
            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 ring-indigo-500/10 font-bold text-slate-700 min-h-[100px]"
            placeholder="Tuliskan asumsi, catatan, atau informasi penting sebelum melakukan analisis SWOT..."
            value={data.assumptions || ''}
            onChange={e => setData({ ...data, assumptions: e.target.value })}
          />
        </div>

        {/* SWORDS -> SWOT Analysis */}
        <div className="bg-slate-900/90 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-slate-700/50 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none -mr-48 -mt-48 mix-blend-screen"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none -ml-32 -mb-32 mix-blend-screen"></div>
          
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 relative z-10">
            <Shield className="w-4 h-4 text-indigo-400" /> SWOT Analysis
          </h3>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            {(['s', 'w', 'o', 't'] as const).map(key => (
              <div key={key} className={cn(
                "p-4 rounded-3xl border space-y-3",
                key === 's' ? "bg-emerald-500/10 border-emerald-500/20" :
                key === 'w' ? "bg-rose-500/10 border-rose-500/20" :
                key === 'o' ? "bg-indigo-500/10 border-indigo-500/20" :
                "bg-amber-500/10 border-amber-500/20"
              )}>
                <div className="flex justify-between items-center text-white px-2">
                  <span className="text-[10px] font-black uppercase">{key === 's' ? 'Strengths' : key === 'w' ? 'Weaknesses' : key === 'o' ? 'Opportunities' : 'Threats'}</span>
                  <button 
                    onClick={() => addSwotItem(key)}
                    className="p-1 hover:bg-white/10 rounded-lg"
                  >
                    <Plus className="w-3 h-3 text-white" />
                  </button>
                </div>
                <div className="space-y-2 max-h-[100px] overflow-y-auto custom-scrollbar">
                  {data.swot[key].map((item: string, idx: number) => (
                    <div key={idx} className="relative group">
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[9px] text-white font-bold outline-none focus:border-white/30"
                        value={item}
                        onChange={e => updateSwotItem(key, idx, e.target.value)}
                      />
                      <button 
                        onClick={() => removeSwotItem(key, idx)}
                        className="absolute right-2 top-1.5 opacity-0 group-hover:opacity-100 text-rose-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Isu Strategis (Eisenhower Matrix) */}
        <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden space-y-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-rose-500" /> Hasil SWOT (Isu Strategis) - Eisenhower Matrix
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['iu', 'inu', 'niu', 'ninu'] as const).map(key => (
              <div key={key} className={cn(
                "p-4 rounded-3xl border space-y-3",
                key === 'iu' ? "bg-rose-50 border-rose-100" :
                key === 'inu' ? "bg-amber-50 border-amber-100" :
                key === 'niu' ? "bg-indigo-50 border-indigo-100" :
                "bg-slate-50 border-slate-200"
              )}>
                <div className="flex justify-between items-center px-2">
                  <span className={cn("text-[10px] font-black uppercase",
                    key === 'iu' ? "text-rose-700" :
                    key === 'inu' ? "text-amber-700" :
                    key === 'niu' ? "text-indigo-700" :
                    "text-slate-600"
                  )}>
                    {key === 'iu' ? 'Penting & Mendesak (Do First)' : 
                     key === 'inu' ? 'Penting & Tidak Mendesak (Schedule)' : 
                     key === 'niu' ? 'Tidak Penting & Mendesak (Delegate)' : 
                     'Tidak Penting & Tidak Mendesak (Eliminate)'}
                  </span>
                  <button 
                    onClick={() => addStrategicIssueItem(key)}
                    className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-700"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar">
                  {(data.strategicIssues?.[key] || []).map((item: string, idx: number) => (
                    <div key={idx} className="relative group flex items-center">
                      <input 
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-bold outline-none focus:border-indigo-500"
                        value={item}
                        onChange={e => updateStrategicIssueItem(key, idx, e.target.value)}
                        placeholder="Tulis isu strategis..."
                      />
                      <button 
                        onClick={() => removeStrategicIssueItem(key, idx)}
                        className="absolute right-2 opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 bg-white"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {(data.strategicIssues?.[key] || []).length === 0 && (
                    <p className="text-[10px] text-slate-400 font-bold italic px-2">Belum ada isu...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jobdesks */}
        <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden space-y-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-emerald-500" /> Kebutuhan Tugas & Jobdesk (Catatan)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pra Pelaksanaan</label>
              <textarea
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-500/10 font-bold text-slate-700 text-xs min-h-[120px]"
                placeholder="Persiapan sebelum proyek dimulai..."
                value={data.jobdesks?.pra || ''}
                onChange={e => setData({ ...data, jobdesks: { ...data.jobdesks, pra: e.target.value } })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pas Pelaksanaan</label>
              <textarea
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-500/10 font-bold text-slate-700 text-xs min-h-[120px]"
                placeholder="Tugas saat proyek berjalan..."
                value={data.jobdesks?.pas || ''}
                onChange={e => setData({ ...data, jobdesks: { ...data.jobdesks, pas: e.target.value } })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pasca Pelaksanaan</label>
              <textarea
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-500/10 font-bold text-slate-700 text-xs min-h-[120px]"
                placeholder="Evaluasi dan penutupan proyek..."
                value={data.jobdesks?.pasca || ''}
                onChange={e => setData({ ...data, jobdesks: { ...data.jobdesks, pasca: e.target.value } })}
              />
            </div>
          </div>
        </div>

      {/* Projects Management SECTION */}
      <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden space-y-6">
        <div className="flex items-center justify-between border-[#95ade8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-900 rounded-xl flex items-center justify-center text-white">
              <Briefcase className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Manajemen Proyek Utama</h2>
          </div>
          <button 
            onClick={() => setShowAddProject(!showAddProject)}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 text-xs"
          >
            <Plus className="w-4 h-4" /> PROYEK BARU
          </button>
        </div>

        <AnimatePresence>
          {showAddProject && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <input 
                placeholder="Nama Proyek" 
                className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 outline-none font-bold text-sm"
                value={newProject.name}
                onChange={e => setNewProject({...newProject, name: e.target.value})}
              />
              <div className="flex gap-2">
                <input 
                  type="date"
                  className="flex-1 px-4 py-2 bg-white rounded-xl border border-slate-200 outline-none font-bold text-[10px]"
                  value={newProject.startDate}
                  onChange={e => setNewProject({...newProject, startDate: e.target.value})}
                />
                <input 
                  type="date"
                  className="flex-1 px-4 py-2 bg-white rounded-xl border border-slate-200 outline-none font-bold text-[10px]"
                  value={newProject.endDate}
                  onChange={e => setNewProject({...newProject, endDate: e.target.value})}
                />
              </div>
              <button 
                onClick={handleAddProject}
                className="w-full bg-indigo-600 text-white rounded-xl font-black text-xs uppercase hover:bg-indigo-700"
              >
                SIMPAN PROYEK
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {projects.map(proj => (
            <div key={proj.id} className="min-w-[280px] bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{proj.status}</span>
                <button onClick={() => handleDeleteProject(proj.id)} className="text-slate-300 hover:text-rose-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h4 className="font-black text-slate-800">{proj.name}</h4>
              <div className="flex gap-2 text-[10px] font-bold text-slate-400">
                <Calendar className="w-3 h-3" /> {proj.startDate} s/d {proj.endDate}
              </div>
            </div>
          ))}
          {projects.length === 0 && <p className="text-center text-xs text-slate-300 italic py-8 border-2 border-dashed border-slate-100 rounded-3xl w-full">Belum ada proyek aktif</p>}
        </div>
      </div>

      {/* Financial Targets */}
      <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden space-y-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" /> Target Finansial (Financial Targets)
          </div>
          <button onClick={() => addTarget('financial')} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100">
            <Plus className="w-4 h-4" />
          </button>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.financialTargets.map((t: any) => (
            <div key={t.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-start">
                <input 
                  placeholder="Nama Target (Contoh: Omzet Bulanan)" 
                  className="bg-transparent font-black text-sm outline-none w-full"
                  value={t.title}
                  onChange={e => updateTarget('financial', t.id, 'title', e.target.value)}
                />
                <button onClick={() => removeTarget('financial', t.id)} className="text-slate-300 hover:text-rose-500 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nilai Target</label>
                  <input 
                    placeholder="Contoh: 100jt" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold outline-none"
                    value={t.value}
                    onChange={e => updateTarget('financial', t.id, 'value', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Batas Waktu</label>
                  <input 
                    type="date"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold outline-none"
                    value={t.deadline}
                    onChange={e => updateTarget('financial', t.id, 'deadline', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          {data.financialTargets.length === 0 && <p className="col-span-full text-center text-xs text-slate-300 italic py-8 border-2 border-dashed border-slate-100 rounded-[2rem]">Belum ada target finansial yang dibuat</p>}
        </div>
      </div>

      {/* Non-Financial Targets */}
      <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden space-y-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" /> Target Operasional & Non-Finansial
          </div>
          <button onClick={() => addTarget('nonFinancial')} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100">
            <Plus className="w-4 h-4" />
          </button>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.nonFinancialTargets.map((t: any) => (
            <div key={t.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-start">
                <input 
                  placeholder="Target Operasional (Contoh: Kepuasan Pelanggan)" 
                  className="bg-transparent font-black text-sm outline-none w-full"
                  value={t.title}
                  onChange={e => updateTarget('nonFinancial', t.id, 'title', e.target.value)}
                />
                <button onClick={() => removeTarget('nonFinancial', t.id)} className="text-slate-300 hover:text-rose-500 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Detail Goal</label>
                  <input 
                    placeholder="Contoh: 95% Rating" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold outline-none"
                    value={t.value}
                    onChange={e => updateTarget('nonFinancial', t.id, 'value', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Batas Waktu</label>
                  <input 
                    type="date"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold outline-none"
                    value={t.deadline}
                    onChange={e => updateTarget('nonFinancial', t.id, 'deadline', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          {data.nonFinancialTargets.length === 0 && <p className="col-span-full text-center text-xs text-slate-300 italic py-8 border-2 border-dashed border-slate-100 rounded-[2rem]">Belum ada target operasional yang dibuat</p>}
        </div>
      </div>

      {/* Business Model Canvas */}
      <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-indigo-600" /> Business Model Canvas (BMC)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 border-l border-t border-slate-200 bg-white">
          <div className="md:col-span-1 grid grid-rows-2">
            <BMCBlock label="Key Partners" icon={Users} value={data.bmc.partners} placeholder="Siapa mitra strategis kita?" onChange={(val) => setData({ ...data, bmc: { ...data.bmc, partners: val } })} />
          </div>
          <div className="md:col-span-1 grid grid-rows-2">
            <BMCBlock label="Key Activities" icon={Activity} value={data.bmc.activities} placeholder="Apa kegiatan utama bisnis?" onChange={(val) => setData({ ...data, bmc: { ...data.bmc, activities: val } })} />
            <BMCBlock label="Key Resources" icon={Briefcase} value={data.bmc.resources} placeholder="Apa sumber daya utama yang dibutuhkan?" onChange={(val) => setData({ ...data, bmc: { ...data.bmc, resources: val } })} />
          </div>
          <div className="md:col-span-1">
            <BMCBlock label="Value Propositions" icon={Rocket} value={data.bmc.valueProps} placeholder="Nilai apa yang kita berikan ke pelanggan?" onChange={(val) => setData({ ...data, bmc: { ...data.bmc, valueProps: val } })} />
          </div>
          <div className="md:col-span-1 grid grid-rows-2">
            <BMCBlock label="Customer Relationships" icon={Heart} value={data.bmc.relations} placeholder="Bagaimana cara menjaga pelanggan?" onChange={(val) => setData({ ...data, bmc: { ...data.bmc, relations: val } })} />
            <BMCBlock label="Channels" icon={Share2} value={data.bmc.channels} placeholder="Media apa untuk menjangkau mereka?" onChange={(val) => setData({ ...data, bmc: { ...data.bmc, channels: val } })} />
          </div>
          <div className="md:col-span-1">
            <BMCBlock label="Customer Segments" icon={UserCheck} value={data.bmc.segments} placeholder="Siapa pelanggan utama kita?" onChange={(val) => setData({ ...data, bmc: { ...data.bmc, segments: val } })} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 border-l border-t border-b border-r border-slate-200 bg-white">
          <BMCBlock label="Cost Structure" icon={Wallet} value={data.bmc.costs} placeholder="Apa saja pengeluaran utama?" onChange={(val) => setData({ ...data, bmc: { ...data.bmc, costs: val } })} />
          <BMCBlock label="Revenue Streams" icon={CreditCard} value={data.bmc.revenues} placeholder="Dari mana sumber keuntungan?" onChange={(val) => setData({ ...data, bmc: { ...data.bmc, revenues: val } })} />
        </div>
      </div>

      {/* Schedules Section */}
      <div className="bg-white/80 backdrop-blur-2xl p-4 md:p-8 rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden space-y-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" /> Penjadwalan & Eksekusi Target (Schedules)
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setShowAddProject(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-tight hover:bg-slate-800 transition-all border border-slate-800"
            >
              <Briefcase className="w-3 h-3" /> + Proyek
            </button>
            <button onClick={addSchedule} className="flex items-center justify-center p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </h3>
        <div className="space-y-4">
          <div className="hidden lg:grid grid-cols-[1fr_150px_150px_130px_130px_100px_40px] gap-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Tugas / Pekerjaan</span>
            <span>Proyek</span>
            <span>Target Terkait</span>
            <span>Tgl Mulai</span>
            <span>Tgl Selesai</span>
            <span>Status</span>
            <span></span>
          </div>

          {/* Mobile View (Cards) */}
          <div className="lg:hidden space-y-4">
            {(data.schedules || []).map((s: any) => (
              <div key={s.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 relative">
                <div className="absolute right-4 top-4">
                  <button onClick={() => removeSchedule(s.id)} className="text-slate-300 hover:text-rose-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-1 pr-8">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Tugas</label>
                  <input 
                    placeholder="Apa yang akan dilakukan?" 
                    className="w-full bg-transparent font-bold text-sm outline-none"
                    value={s.task}
                    onChange={e => updateSchedule(s.id, 'task', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proyek</label>
                    <select 
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none"
                      value={s.projectId || ''}
                      onChange={e => updateSchedule(s.id, 'projectId', e.target.value)}
                    >
                      <option value="">Pilih Proyek...</option>
                      {projects.map(proj => (
                        <option key={proj.id} value={proj.id}>{proj.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                    <select 
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none"
                      value={s.status}
                      onChange={e => updateSchedule(s.id, 'status', e.target.value)}
                    >
                      <option value="Planned">Rencana</option>
                      <option value="Working">Proses</option>
                      <option value="Done">Selesai</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Terkait</label>
                  <select 
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none"
                    value={s.targetId}
                    onChange={e => updateSchedule(s.id, 'targetId', e.target.value)}
                  >
                    <option value="">Pilih Target...</option>
                    {allTargets.map((t: any) => (
                      <option key={t.id} value={t.id}>[{t.type}] {t.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mulai</label>
                    <input 
                      type="date"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none"
                      value={s.startDate}
                      onChange={e => updateSchedule(s.id, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selesai</label>
                    <input 
                      type="date"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none"
                      value={s.endDate}
                      onChange={e => updateSchedule(s.id, 'endDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden lg:grid space-y-3">
            {(data.schedules || []).map((s: any) => (
              <div key={s.id} className="grid grid-cols-[1fr_150px_150px_130px_130px_100px_40px] gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 items-center">
                <input 
                  placeholder="Apa yang akan dilakukan?" 
                  className="bg-transparent font-bold text-xs outline-none"
                  value={s.task}
                  onChange={e => updateSchedule(s.id, 'task', e.target.value)}
                />
                <select 
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none"
                  value={s.projectId || ''}
                  onChange={e => updateSchedule(s.id, 'projectId', e.target.value)}
                >
                  <option value="">Pilih Proyek...</option>
                  {projects.map(proj => (
                    <option key={proj.id} value={proj.id}>{proj.name}</option>
                  ))}
                </select>
                <select 
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none"
                  value={s.targetId}
                  onChange={e => updateSchedule(s.id, 'targetId', e.target.value)}
                >
                  <option value="">Pilih Target...</option>
                  {allTargets.map((t: any) => (
                    <option key={t.id} value={t.id}>[{t.type}] {t.title}</option>
                  ))}
                </select>
                <input 
                  type="date"
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none"
                  value={s.startDate}
                  onChange={e => updateSchedule(s.id, 'startDate', e.target.value)}
                />
                <input 
                  type="date"
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none"
                  value={s.endDate}
                  onChange={e => updateSchedule(s.id, 'endDate', e.target.value)}
                />
                <select 
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none"
                  value={s.status}
                  onChange={e => updateSchedule(s.id, 'status', e.target.value)}
                >
                  <option value="Planned">Rencana</option>
                  <option value="Working">Proses</option>
                  <option value="Done">Selesai</option>
                </select>
                <button onClick={() => removeSchedule(s.id)} className="text-slate-300 hover:text-rose-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          {(data.schedules || []).length === 0 && (
            <div className="py-12 border-2 border-dashed border-slate-100 rounded-3xl text-center">
              <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-bold italic">Belum ada jadwal pekerjaan yang dibuat</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CalendarMonthView = ({ tasks, currentDate }: { tasks: any[], currentDate: Date }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="grid grid-cols-7 border-l border-t border-slate-100">
      {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(day => (
        <div key={day} className="bg-slate-50 p-3 text-center border-r border-b border-slate-100 font-black text-[10px] text-slate-400 uppercase">
          {day}
        </div>
      ))}
      {calendarDays.map((day, idx) => {
        const dayTasks = tasks.filter(t => t.deadline && isSameDay(new Date(t.deadline), day));
        const isCurrentMonth = format(day, 'M') === format(currentDate, 'M');
        
        return (
          <div 
            key={idx} 
            className={cn(
              "min-h-[120px] p-2 border-r border-b border-slate-100 transition-colors",
              !isCurrentMonth ? "bg-slate-50/50" : "bg-white",
              isSameDay(day, new Date()) && "ring-2 ring-inset ring-indigo-500/20 bg-indigo-50/10"
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={cn(
                "text-xs font-bold",
                !isCurrentMonth ? "text-slate-300" : isSameDay(day, new Date()) ? "text-indigo-600" : "text-slate-700"
              )}>
                {format(day, 'd')}
              </span>
              {dayTasks.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              )}
            </div>
            <div className="space-y-1">
              {dayTasks.slice(0, 3).map(task => (
                <div 
                  key={task.id} 
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[8px] font-bold truncate border",
                    task.status === 'Done' ? "bg-emerald-50 text-emerald-600 border-emerald-100 opacity-60" :
                    task.priority === 'High' ? "bg-rose-600 text-white border-rose-700" :
                    "bg-indigo-600 text-white border-indigo-700"
                  )}
                >
                  {task.title}
                </div>
              ))}
              {dayTasks.length > 3 && (
                <p className="text-[8px] font-bold text-slate-400 pl-1">+{dayTasks.length - 3} lainnya</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TimelineView = ({ tasks, projects, employees }: { tasks: any[], projects: any[], employees: any[] }) => {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigate = (direction: 'next' | 'prev') => {
    if (viewMode === 'day') setCurrentDate(direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1));
    if (viewMode === 'week') setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    if (viewMode === 'month') setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
  };

  const getDayInterval = () => {
    const start = viewMode === 'day' ? currentDate : startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = viewMode === 'day' ? currentDate : endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const days = getDayInterval();

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-800 text-lg">Timeline Proyek</h3>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['day', 'week', 'month'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  viewMode === mode ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {mode === 'day' ? 'Harian' : mode === 'week' ? 'Mingguan' : 'Bulanan'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('prev')} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 group">
              <ChevronLeft className="w-5 h-5 group-active:scale-90 transition-transform" />
            </button>
            <span className="font-bold text-slate-700 min-w-[140px] text-center bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100">
              {viewMode === 'month' ? format(currentDate, 'MMMM yyyy', { locale: id }) : 
               viewMode === 'week' ? `Minggu ${format(currentDate, 'w', { locale: id })}, ${format(currentDate, 'yyyy')}` :
               format(currentDate, 'dd MMMM yyyy', { locale: id })}
            </span>
            <button onClick={() => navigate('next')} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 group">
              <ChevronRight className="w-5 h-5 group-active:scale-90 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'month' ? (
        <CalendarMonthView tasks={tasks} currentDate={currentDate} />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-[240px_1fr] border-b border-slate-100">
              <div className="p-4 bg-slate-50 font-black text-[10px] text-slate-400 uppercase border-r border-slate-100 tracking-widest">Daftar Proyek & Petugas</div>
              <div className="flex bg-slate-50 overflow-hidden">
                {days.map(day => (
                  <div key={day.toString()} className={cn(
                    "flex-1 p-2 text-center border-r border-slate-100 last:border-r-0 min-w-[80px]",
                    isSameDay(day, new Date()) && "bg-indigo-50/50"
                  )}>
                    <p className="text-[10px] font-black text-slate-400 uppercase">{format(day, 'EEE', { locale: id })}</p>
                    <p className={cn("text-xs font-black", isSameDay(day, new Date()) ? "text-indigo-600" : "text-slate-700")}>{format(day, 'dd')}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {projects.map(proj => (
                <div key={proj.id} className="grid grid-cols-[240px_1fr] group">
                  <div className="p-4 border-r border-slate-100 bg-white">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">{proj.name}</p>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {proj.startDate ? format(new Date(proj.startDate), 'dd/MM') : '??'} - {proj.endDate ? format(new Date(proj.endDate), 'dd/MM') : '??'}
                    </p>
                  </div>
                  <div className="flex relative bg-slate-50/20">
                    {days.map(day => {
                      const dayTasks = tasks.filter(t => t.projectId === proj.id && t.deadline && isSameDay(new Date(t.deadline), day));
                      return (
                        <div key={day.toString()} className={cn(
                          "flex-1 border-r border-slate-100 last:border-r-0 min-w-[80px] p-1.5 flex flex-col gap-1.5",
                          isSameDay(day, new Date()) && "bg-indigo-50/30"
                        )}>
                          {dayTasks.map(task => {
                            const assignee = employees.find(e => e.id === task.assigneeId);
                            return (
                              <div 
                                key={task.id} 
                                className={cn(
                                  "p-2 rounded-xl text-[9px] font-black leading-tight shadow-sm border transition-transform hover:scale-[1.02] cursor-default",
                                  task.status === 'Done' ? "bg-emerald-50 text-emerald-700 border-emerald-100 opacity-60" :
                                  task.priority === 'High' ? "bg-rose-600 text-white border-rose-700" :
                                  "bg-white text-slate-700 border-slate-200"
                                )}
                                title={`${task.title} - PIC: ${assignee?.name || 'Unassigned'}`}
                              >
                                <p className="line-clamp-2 mb-1.5">{task.title}</p>
                                <div className="flex items-center gap-1 opacity-80 border-t border-black/5 pt-1">
                                  <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[7px] text-white">
                                    {assignee?.name?.[0] || '?'}
                                  </div>
                                  <span className="truncate">{assignee?.name?.split(' ')[0] || '-'}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="col-span-2 py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest italic">
                  Belum ada proyek terdaftar untuk timeline.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrganizingView = ({ divisions, employees, planning, onUpdatePlanning }: { divisions: any[], employees: any[], planning: any, onUpdatePlanning: (data: any) => void }) => {
  const [showAddDivision, setShowAddDivision] = useState(false);
  const [newDivision, setNewDivision] = useState({ name: '', description: '', employeeIds: [] });

  const handleAddDivision = () => {
    if (!newDivision.name) return;
    firebaseService.create('divisions', { ...newDivision, ownerId: auth.currentUser?.uid });
    setNewDivision({ name: '', description: '', employeeIds: [] });
    setShowAddDivision(false);
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Pemetaan Divisi & Struktur</h2>
          </div>
          <button 
            onClick={() => setShowAddDivision(!showAddDivision)}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black shadow-lg shadow-slate-100 hover:bg-slate-800 transition-all text-xs"
          >
            <Plus className="w-4 h-4" /> DIVISI BARU
          </button>
        </div>

        <AnimatePresence>
          {showAddDivision && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-xl space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  placeholder="Nama Divisi (e.g. Produksi)" 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none font-bold"
                  value={newDivision.name}
                  onChange={e => setNewDivision({...newDivision, name: e.target.value})}
                />
                <input 
                  placeholder="Deskripsi Singkat" 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none font-bold"
                  value={newDivision.description}
                  onChange={e => setNewDivision({...newDivision, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end">
                <button onClick={handleAddDivision} className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-black text-xs uppercase">Simpan Divisi</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {divisions.map(div => (
            <div key={div.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-black text-lg text-slate-900">{div.name}</h3>
                <button onClick={() => firebaseService.delete('divisions', div.id)} className="text-slate-300 hover:text-rose-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs font-bold text-slate-400 leading-relaxed">{div.description}</p>
              
              <div className="space-y-2">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Anggota Divisi</p>
                <div className="flex flex-wrap gap-2">
                  {employees.filter(e => div.employeeIds?.includes(e.id)).map(e => (
                    <div key={e.id} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-600">
                      {e.name}
                    </div>
                  ))}
                  <button className="px-2 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-[9px] font-black">+ Anggota</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 pt-12 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Penugasan Tugas (Dari Planning)</h2>
        </div>
        
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          {/* Desktop view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tugas (Dari Planning)</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Penanggung Jawab (SDM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(planning?.schedules || []).map((schedule: any) => (
                  <tr key={schedule.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5">
                      <p className="font-bold text-slate-800 text-sm">{schedule.task || 'Tugas Tanpa Nama'}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status: {schedule.status}</p>
                    </td>
                    <td className="p-5">
                      <select
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-indigo-500/20"
                        value={schedule.assigneeId || ''}
                        onChange={(e) => {
                          const newSchedules = (planning.schedules || []).map((s: any) => s.id === schedule.id ? { ...s, assigneeId: e.target.value } : s);
                          onUpdatePlanning({ ...planning, schedules: newSchedules });
                        }}
                      >
                        <option value="">-- Pilih SDM --</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View (Cards) */}
          <div className="md:hidden divide-y divide-slate-100">
            {(planning?.schedules || []).map((schedule: any) => (
              <div key={schedule.id} className="p-4 space-y-4">
                <div className="space-y-1">
                  <p className="font-black text-slate-800 text-[13px] leading-tight">{schedule.task || 'Tugas Tanpa Nama'}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status: {schedule.status}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Penanggung Jawab (SDM)</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-indigo-500/20"
                    value={schedule.assigneeId || ''}
                    onChange={(e) => {
                      const newSchedules = (planning.schedules || []).map((s: any) => s.id === schedule.id ? { ...s, assigneeId: e.target.value } : s);
                      onUpdatePlanning({ ...planning, schedules: newSchedules });
                    }}
                  >
                    <option value="">-- Pilih SDM --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {(!planning || !planning.schedules || planning.schedules.length === 0) && (
            <div className="py-12 text-center text-slate-400 font-bold text-xs uppercase italic">Belum ada tugas di Planning</div>
          )}
        </div>
      </section>
    </div>
  );
};

const ActuatingView = ({ planning, employees, onUpdatePlanning }: { planning: any, employees: any[], onUpdatePlanning: (data: any) => void }) => {
  const getAssignee = (id: string) => employees.find(e => e.id === id);

  const toggleTaskStatus = (scheduleId: string) => {
    const schedule = planning.schedules.find((s: any) => s.id === scheduleId);
    if (!schedule) return;
    const newStatus = schedule.status === 'Done' ? 'Working' : 'Done';
    const newSchedules = planning.schedules.map((s: any) => s.id === scheduleId ? { ...s, status: newStatus } : s);
    onUpdatePlanning({ ...planning, schedules: newSchedules });
  };

  const sendWhatsApp = (task: any) => {
    const emp = getAssignee(task.assigneeId);
    if (!emp?.phone) {
      alert('Nomor telepon SDM belum diisi!');
      return;
    }
    const message = `Halo ${emp.name}, Ada tugas baru untuk kamu:\n\n*${task.task}*\nDeadline: ${task.endDate || '-'}\n\nSemangat mengerjakannya!`;
    const url = `https://wa.me/${emp.phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const delegatedSchedules = (planning?.schedules || []).filter((s: any) => s.assigneeId);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
          <Rocket className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Eksekusi Tugas (Actuating)</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pantau dan centang penyelesaian tugas</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tugas</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">PJ / SDM</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status / Aksi</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tindakan Delegasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {delegatedSchedules.map((task: any) => {
                const emp = getAssignee(task.assigneeId);
                return (
                  <tr key={task.id} className={cn("transition-colors", task.status === 'Done' ? "bg-emerald-50/30" : "hover:bg-slate-50/50")}>
                    <td className="p-5">
                      <p className={cn("font-bold text-sm", task.status === 'Done' ? "text-slate-500 line-through" : "text-slate-800")}>{task.task || 'Tugas Tanpa Nama'}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Deadline: {task.endDate || '-'}</p>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-[10px]">
                          {emp?.name?.[0] || '?'}
                        </div>
                        <span className="text-xs font-bold text-slate-600">{emp?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <button 
                        onClick={() => toggleTaskStatus(task.id)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                          task.status === 'Done' ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {task.status === 'Done' ? 'Selesai' : 'Tandai Selesai'}
                      </button>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => sendWhatsApp(task)}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600"
                        >
                          <Mail className="w-3 h-3" /> Kirim WA
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {delegatedSchedules.map((task: any) => {
            const emp = getAssignee(task.assigneeId);
            return (
              <div key={task.id} className={cn("p-4 space-y-4", task.status === 'Done' ? "bg-emerald-50/20" : "")}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className={cn("font-black text-sm leading-tight", task.status === 'Done' ? "text-slate-400 line-through" : "text-slate-800")}>{task.task || 'Tugas Tanpa Nama'}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Deadline: {task.endDate || '-'}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg">
                    <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-[7px]">
                      {emp?.name?.[0] || '?'}
                    </div>
                    <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest max-w-[80px] truncate">{emp?.name || '-'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleTaskStatus(task.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                      task.status === 'Done' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {task.status === 'Done' ? 'Selesai' : 'Tandai Selesai'}
                  </button>
                  <button 
                    onClick={() => sendWhatsApp(task)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600"
                  >
                    <Mail className="w-4 h-4" /> WA
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {delegatedSchedules.length === 0 && (
          <div className="py-20 text-center text-slate-300 font-bold text-xs uppercase italic">Tidak ada tugas yang sudah diberi SDM di Organizing</div>
        )}
      </div>
    </div>
  );
};

const ControllingView = ({ projects, planning, employees, onUpdateProject, onUpdatePlanning, onUpdateEmployee }: { projects: any[], planning: any, employees: any[], onUpdateProject: (id: string, data: any) => void, onUpdatePlanning: (data: any) => void, onUpdateEmployee: (id: string, data: any) => void }) => {
  const schedules = planning?.schedules || [];
  const totalTasks = schedules.length;
  const completedTasks = schedules.filter((t: any) => t.status === 'Done').length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const getAssignee = (id: string) => employees.find((e: any) => e.id === id);

  const toggleProjectStatus = (project: any) => {
    const newStatus = project.status === 'Done' ? 'Active' : 'Done';
    onUpdateProject(project.id, { status: newStatus });
  };

  const toggleTargetStatus = (type: 'financialTargets' | 'nonFinancialTargets', targetId: string) => {
    if (!planning) return;
    const targets = planning[type] || [];
    const newTargets = targets.map((t: any) => t.id === targetId ? { ...t, status: t.status === 'Achieved' ? 'Pending' : 'Achieved' } : t);
    onUpdatePlanning({ ...planning, [type]: newTargets });
  };

  const updateTaskEvaluation = (scheduleId: string, field: string, value: string) => {
    if (!planning) return;
    const newSchedules = planning.schedules.map((s: any) => s.id === scheduleId ? { ...s, [field]: value } : s);
    onUpdatePlanning({ ...planning, schedules: newSchedules });
  };

  const updateEmployeeCapacity = (employeeId: string, field: string, value: string | number) => {
    onUpdateEmployee(employeeId, { [field]: value });
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Progress Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Progres Tugas</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-indigo-600 leading-none">{Math.round(progress)}%</span>
            <span className="text-[10px] font-bold text-slate-400 mb-1">{completedTasks}/{totalTasks} Selesai</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Proyek Selesai</p>
          <div className="flex items-end gap-2 text-3xl font-black text-slate-900 leading-none">
            {projects.filter(p => p.status === 'Done').length}
          </div>
          <p className="text-[10px] font-bold text-slate-400">Total {projects.length} Proyek Terdaftar</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Target Tercapai</p>
          <div className="flex items-end gap-2 text-3xl font-black text-emerald-600 leading-none">
            {planning?.financialTargets?.filter((t: any) => t.status === 'Achieved').length + (planning?.nonFinancialTargets?.filter((t: any) => t.status === 'Achieved').length || 0)}
          </div>
          <p className="text-[10px] font-bold text-slate-400">Dari Total Strategi Planning</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Efisiensi Tim</p>
          <div className="flex items-end gap-2 text-3xl font-black text-amber-600 leading-none">
            High
          </div>
          <p className="text-[10px] font-bold text-slate-400">Status Produktivitas Global</p>
        </div>
      </div>

      <section className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-black text-slate-800 text-lg">Pencapaian Proyek</h3>
            <div className="space-y-3">
              {projects.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className={cn("font-bold text-sm", p.status === 'Done' ? "text-slate-400 line-through" : "text-slate-800")}>{p.name}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.status}</p>
                  </div>
                  <button onClick={() => toggleProjectStatus(p)} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", p.status === 'Done' ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600 hover:bg-slate-300")}>
                    {p.status === 'Done' ? 'Terpenuhi' : 'Tandai Selesai'}
                  </button>
                </div>
              ))}
              {projects.length === 0 && <p className="text-xs font-bold text-slate-400 italic">Belum ada proyek.</p>}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-black text-slate-800 text-lg">Pencapaian Target Planning</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Finansial</h4>
                <div className="space-y-2">
                  {(planning?.financialTargets || []).map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <div>
                        <p className={cn("font-bold text-sm", t.status === 'Achieved' ? "text-emerald-400 line-through" : "text-emerald-800")}>{t.title || 'Tanpa Judul'}</p>
                        <p className={cn("text-[10px] font-black uppercase tracking-widest mt-0.5", t.status === 'Achieved' ? "text-emerald-300" : "text-emerald-600/60")}>Nilai: Rp {t.value || '-'} • Deadline: {t.deadline || '-'}</p>
                      </div>
                      <button onClick={() => toggleTargetStatus('financialTargets', t.id)} className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ml-4", t.status === 'Achieved' ? "bg-emerald-200 text-emerald-800" : "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-100")}>
                        {t.status === 'Achieved' ? 'Terpenuhi' : 'Check'}
                      </button>
                    </div>
                  ))}
                  {(!planning?.financialTargets || planning.financialTargets.length === 0) && <p className="text-xs text-slate-400">Tidak ada target finansial.</p>}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Non-Finansial</h4>
                <div className="space-y-2">
                  {(planning?.nonFinancialTargets || []).map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <div>
                        <p className={cn("font-bold text-sm", t.status === 'Achieved' ? "text-indigo-400 line-through" : "text-indigo-800")}>{t.title || 'Tanpa Judul'}</p>
                        <p className={cn("text-[10px] font-black uppercase tracking-widest mt-0.5", t.status === 'Achieved' ? "text-indigo-300" : "text-indigo-600/60")}>Nilai: {t.value || '-'} • Deadline: {t.deadline || '-'}</p>
                      </div>
                      <button onClick={() => toggleTargetStatus('nonFinancialTargets', t.id)} className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ml-4", t.status === 'Achieved' ? "bg-indigo-200 text-indigo-800" : "bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-100")}>
                        {t.status === 'Achieved' ? 'Terpenuhi' : 'Check'}
                      </button>
                    </div>
                  ))}
                  {(!planning?.nonFinancialTargets || planning.nonFinancialTargets.length === 0) && <p className="text-xs text-slate-400">Tidak ada target non-finansial.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SDM Performance Matrix & Task Evaluation */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Evaluasi Tugas & Kapasitas SDM</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {schedules.map((task: any) => {
            const emp = getAssignee(task.assigneeId);
            return (
              <div key={task.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 relative overflow-hidden group">
                <div className={cn("absolute top-0 left-0 w-full h-1", task.status === 'Done' ? "bg-emerald-500" : "bg-amber-500")} />
                
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Tugas</p>
                  <p className="font-bold text-sm text-slate-800">{task.task || 'Tanpa Nama'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest", task.status === 'Done' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>{task.status}</span>
                  </div>
                </div>

                {emp ? (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-black text-xs">
                        {emp.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-800 leading-none">{emp.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Penanggung Jawab</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Catatan Evaluasi Kapasitas SDM</p>
                      <textarea 
                        placeholder="Tulis catatan evaluasi terkait skill, motivasi, dan insight SDM..."
                        className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50 min-h-[80px]"
                        value={emp.capacityNote || ''}
                        onChange={(e) => updateEmployeeCapacity(emp.id, 'capacityNote', e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400 italic">Belum ada SDM yang ditugaskan</p>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Evaluasi Pelaksanaan Tugas</p>
                  <div className="space-y-2">
                    <textarea 
                      placeholder="Catatan Proses Pengerjaan..."
                      className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50 min-h-[60px]"
                      value={task.evalProses || ''}
                      onChange={(e) => updateTaskEvaluation(task.id, 'evalProses', e.target.value)}
                    />
                    <textarea 
                      placeholder="Catatan Hasil Pengerjaan..."
                      className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50 min-h-[60px]"
                      value={task.evalHasil || ''}
                      onChange={(e) => updateTaskEvaluation(task.id, 'evalHasil', e.target.value)}
                    />
                  </div>
                </div>

              </div>
            )
          })}
          {schedules.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs italic font-bold">Belum ada tugas dari Planning.</div>
          )}
        </div>
      </section>
    </div>
  );
};

const EmployeeCard = ({ employee, onDelete, onEdit }: { employee: any, onDelete: (id: string) => void, onEdit: (employee: any) => void }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="bg-white p-6 rounded-3xl border border-[#b3cbeb] shadow-sm hover:shadow-md transition-shadow group relative"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-lg border-2 border-white shadow-sm">
        {employee.name.split(' ').map((n: string) => n[0]).join('')}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onEdit(employee)}
          className="p-2 text-slate-400 hover:text-indigo-600 transition-all bg-white rounded-full shadow-sm border border-slate-100"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onDelete(employee.id)}
          className="p-2 text-slate-400 hover:text-rose-600 transition-all bg-white rounded-full shadow-sm border border-slate-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
    <h3 className="font-black text-slate-900 leading-none mb-1 text-base">{employee.name}</h3>
    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-4">{employee.role}</p>
    
    <div className="space-y-2">
      <div className="flex items-center justify-between mt-4">
        <span className={cn(
          "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border",
          employee.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
          employee.status === 'On Leave' ? "bg-amber-50 text-amber-600 border-amber-200" :
          "bg-rose-50 text-rose-600 border-rose-200"
        )}>
          {employee.status}
        </span>
        <button 
          onClick={() => onEdit(employee)}
          className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group/btn bg-indigo-50/50 px-3 py-1 rounded-xl transition-colors"
        >
          EDIT <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  </motion.div>
);

const TaskItem = ({ task, employees, onUpdate, onDelete }: { task: any, employees: any[], onUpdate: (id: string, data: any) => void, onDelete: (id: string) => void, key?: any }) => {
  const assignee = employees.find(e => e.id === task.assigneeId);
  
  return (
    <motion.div 
      layout
      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 group"
    >
      <div className="flex items-start justify-between">
        <h4 className={cn("font-bold text-sm text-slate-800 leading-tight", task.status === 'Done' && "line-through text-slate-400")}>
          {task.title}
        </h4>
        <button 
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className={cn(
          "text-[10px] font-black px-2 py-0.5 rounded shadow-sm",
          task.priority === 'High' ? "text-white bg-rose-600" :
          task.priority === 'Medium' ? "text-white bg-amber-600" :
          "text-white bg-slate-600"
        )}>
          {task.priority.toUpperCase()}
        </span>
        {task.deadline && (
          <span className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" /> {new Date(task.deadline).toLocaleDateString('id-ID')}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-black">
            {assignee ? assignee.name.split(' ').map((n: string) => n[0]).join('') : '?'}
          </div>
          <span className="text-[10px] font-bold text-slate-700">{assignee?.name || 'Unassigned'}</span>
        </div>
        <select 
          className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg outline-none"
          value={task.status}
          onChange={(e) => onUpdate(task.id, { status: e.target.value })}
        >
          <option value="Todo">Todo</option>
          <option value="In Progress">Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>
    </motion.div>
  );
};

export const ManajemenView = () => {
  const [activeTab, setActiveTab] = useState<'planning' | 'organizing' | 'actuating' | 'controlling'>('planning');
  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [planning, setPlanning] = useState<any>(null);
  
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  
  const [newEmployee, setNewEmployee] = useState({ name: '', role: '', status: 'Active' });
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', status: 'Active', startDate: '', endDate: '' });

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubEmployees = firebaseService.subscribe('employees', setEmployees);
    const unsubProjects = firebaseService.subscribe('projects', setProjects);
    const unsubDivisions = firebaseService.subscribe('divisions', setDivisions);
    const unsubPlanning = firebaseService.subscribe('planning', (docs) => setPlanning(docs[0] || null));
    return () => {
      unsubEmployees();
      unsubProjects();
      unsubDivisions();
      unsubPlanning();
    };
  }, []);

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.role) return;
    await firebaseService.create('employees', { ...newEmployee, ownerId: auth.currentUser?.uid });
    setNewEmployee({ name: '', role: '', status: 'Active' });
    setShowAddEmployee(false);
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee || !selectedEmployee.name) return;
    await firebaseService.update('employees', selectedEmployee.id, selectedEmployee);
    setShowEditEmployee(false);
    setSelectedEmployee(null);
  };

  const handleAddProject = async () => {
    if (!newProject.name) return;
    await firebaseService.create('projects', { ...newProject, ownerId: auth.currentUser?.uid });
    setNewProject({ name: '', description: '', status: 'Active', startDate: '', endDate: '' });
    setShowAddProject(false);
  };

  const toggleProjectStatus = async (project: any) => {
    const newStatus = project.status === 'Completed' ? 'Active' : 'Completed';
    await firebaseService.update('projects', project.id, { status: newStatus });
  };

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Decorative background glow for header */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen -z-10"></div>
      
      {/* Header & Quick Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 md:p-8 bg-white/60 backdrop-blur-3xl border border-white/60 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/40 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-indigo-100">
            <Briefcase className="w-3 h-3" /> Workspace
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Manajemen <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500">Operasi</span> 🚀</h1>
          <p className="text-slate-500 font-medium leading-relaxed max-w-md">Bangun struktur, atur tim, dan pantau kemajuan proyek layaknya startup kekinian.</p>
        </div>
        <div className="flex gap-3 relative z-10 w-full md:w-auto">
          <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl border border-slate-200/50 flex items-center justify-between gap-6 shadow-sm w-full md:w-auto">
            <div className="text-center md:text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center md:justify-end gap-1"><Users className="w-3 h-3"/> Kru Aktif</p>
              <p className="text-2xl font-black text-slate-800">{employees.length}</p>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div className="text-center md:text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center md:justify-start gap-1"><Target className="w-3 h-3"/> Misi</p>
              <p className="text-2xl font-black text-indigo-600">{(planning?.schedules || []).filter((t: any) => t.status !== 'Done').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Tab Switcher */}
      <div className="flex overflow-x-auto items-center gap-2 bg-white/60 backdrop-blur-xl border border-white/50 p-2 rounded-2xl w-full md:w-fit shadow-sm custom-scrollbar sticky top-2 z-40 bg-white/90">
        {[
          { id: 'planning', label: '1. Planning', icon: Target },
          { id: 'organizing', label: '2. Organizing', icon: Users },
          { id: 'actuating', label: '3. Actuating', icon: LayoutGrid },
          { id: 'controlling', label: '4. Controlling', icon: CheckCircle2 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
              activeTab === tab.id ? "bg-white text-indigo-600 shadow-lg shadow-indigo-100/50" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <tab.icon className="w-4 h-4 shrink-0" /> {tab.label.split('. ')[1]}
          </button>
        ))}
      </div>

      {activeTab === 'planning' && (
        <PlanningView 
          planning={planning} 
          projects={projects}
          onUpdate={(data) => planning?.id ? firebaseService.update('planning', planning.id, data) : firebaseService.create('planning', { ...data, ownerId: auth.currentUser?.uid })} 
        />
      )}

      {activeTab === 'organizing' && (
        <OrganizingView 
          divisions={divisions}
          employees={employees}
          planning={planning}
          onUpdatePlanning={(data) => planning?.id ? firebaseService.update('planning', planning.id, data) : firebaseService.create('planning', { ...data, ownerId: auth.currentUser?.uid })}
        />
      )}

      {activeTab === 'actuating' && (
        <ActuatingView 
          employees={employees}
          planning={planning}
          onUpdatePlanning={(data) => planning?.id ? firebaseService.update('planning', planning.id, data) : firebaseService.create('planning', { ...data, ownerId: auth.currentUser?.uid })}
        />
      )}

      {activeTab === 'controlling' && (
        <ControllingView 
          projects={projects}
          planning={planning}
          employees={employees}
          onUpdateProject={(id, data) => firebaseService.update('projects', id, data)}
          onUpdatePlanning={(data) => planning?.id ? firebaseService.update('planning', planning.id, data) : firebaseService.create('planning', { ...data, ownerId: auth.currentUser?.uid })}
          onUpdateEmployee={(id, data) => firebaseService.update('employees', id, data)}
        />
      )}
    </div>
  );
};
