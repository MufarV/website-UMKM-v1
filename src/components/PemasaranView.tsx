import React, { useState, useEffect } from 'react';
import { 
  Plus,
  Target,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Save,
  Search,
  ShoppingCart,
  RefreshCw,
  Megaphone,
  Heart,
  FileText,
  X,
  Edit3,
  AlignLeft,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { firebaseService } from '../services/firebaseService';
import { auth } from '../lib/firebase';

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

export const PemasaranView = () => {
  // Customer Journey State
  const [journey, setJourney] = useState({
    awareness: 5000,
    interest: 1200,
    action: 350,
    retention: 120,
    advocacy: 45,
    awarenessNotes: '',
    interestNotes: '',
    actionNotes: '',
    retentionNotes: '',
    advocacyNotes: ''
  });
  const [isEditingJourney, setIsEditingJourney] = useState(false);

  // STP State
  const [stp, setStp] = useState({
    segmentasi: '',
    targeting: '',
    positioning: ''
  });
  const [isEditingStp, setIsEditingStp] = useState(false);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [longNoteInput, setLongNoteInput] = useState('');
  const [noteType, setNoteType] = useState<'idea' | 'reminder' | 'highlight'>('idea');
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isLongNoteModalOpen, setIsLongNoteModalOpen] = useState(false);

  useEffect(() => {
    let unsubJourney: any, unsubNotes: any, unsubStp: any;
    if (auth.currentUser) {
      unsubJourney = firebaseService.subscribe('marketing_journey', (data) => {
        if (data.length > 0) setJourney(data[0] as any);
      });
      unsubNotes = firebaseService.subscribe('marketing_calendar', setNotes);
      unsubStp = firebaseService.subscribe('marketing_stp', (data) => {
        if (data.length > 0) setStp(data[0] as any);
      });
    }
    return () => {
      unsubJourney?.();
      unsubNotes?.();
      unsubStp?.();
    };
  }, []);

  const saveJourney = async () => {
    try {
      const journeyId = (journey as any).id;
      if (journeyId) {
        await firebaseService.update('marketing_journey', journeyId, journey);
      } else {
        await firebaseService.create('marketing_journey', journey);
      }
      setIsEditingJourney(false);
    } catch (e) { console.error(e); }
  };

  const saveStp = async () => {
    try {
      const stpId = (stp as any).id;
      if (stpId) {
        await firebaseService.update('marketing_stp', stpId, stp);
      } else {
        await firebaseService.create('marketing_stp', stp);
      }
      setIsEditingStp(false);
    } catch (e) { console.error(e); }
  };

  const saveNote = async () => {
    if (!selectedDate) return;
    
    const title = noteInput.trim() || 'Ide Tanpa Judul';
    
    try {
      const existingNote = notes.find(n => n.date === selectedDate);
      const payload = { 
        note: title, 
        longNote: longNoteInput,
        type: noteType, 
        isHighlighted,
        date: selectedDate,
        ownerId: auth.currentUser?.uid
      };
      if (existingNote) {
        await firebaseService.update('marketing_calendar', existingNote.id, payload);
      } else {
        await firebaseService.create('marketing_calendar', payload);
      }
      setNoteInput('');
      setLongNoteInput('');
      setSelectedDate(null);
      setIsLongNoteModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan catatan: " + (e as Error).message);
    }
  };

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Empty cells for shift
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-slate-100 bg-slate-50/30"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasNote = notes.find(n => n.date === dateStr);
      const isSelected = selectedDate === dateStr;
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push(
        <div 
          key={d} 
          onClick={() => {
            setSelectedDate(dateStr);
            setNoteInput(hasNote?.note || '');
            setLongNoteInput(hasNote?.longNote || '');
            setNoteType(hasNote?.type || 'idea');
            setIsHighlighted(hasNote?.isHighlighted || false);
            setIsLongNoteModalOpen(true);
          }}
          className={cn(
            "h-24 border border-slate-100 p-2 cursor-pointer transition-all hover:bg-indigo-50 relative group scrollbar-hide overflow-hidden",
            isSelected ? "ring-2 ring-indigo-500 ring-inset bg-indigo-50" : "bg-white",
            isToday && !isSelected ? "bg-amber-50/50" : "",
            hasNote?.isHighlighted && "bg-amber-100/30"
          )}
        >
          <div className="flex justify-between items-start">
            <span className={cn(
              "text-[10px] font-black",
              isToday ? "text-indigo-600 underline decoration-2 underline-offset-4" : "text-slate-400"
            )}>{d}</span>
            {hasNote?.type === 'highlight' && <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>}
            {hasNote?.type === 'reminder' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>}
            {hasNote?.type === 'idea' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
          </div>
          {hasNote && (
            <div className="mt-1 relative group-hover:block">
              <p className={cn(
                "text-[8px] font-medium leading-tight line-clamp-3",
                hasNote.isHighlighted ? "text-slate-900 font-bold" : "text-slate-600"
              )}>{hasNote.note}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDate(dateStr);
                  setNoteInput(hasNote?.note || '');
                  setLongNoteInput(hasNote?.longNote || '');
                  setNoteType(hasNote?.type || 'idea');
                  setIsHighlighted(hasNote?.isHighlighted || false);
                  setIsLongNoteModalOpen(true);
                }}
                className="absolute -bottom-1 -right-1 p-1 bg-white border border-slate-200 text-slate-500 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:bg-slate-50 shadow-sm"
              >
                <Edit3 className="w-3 h-3" /> Catatan
              </button>
            </div>
          )}
          {!hasNote && (
             <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDate(dateStr);
                  setNoteInput('');
                  setLongNoteInput('');
                  setNoteType('idea');
                  setIsHighlighted(false);
                  setIsLongNoteModalOpen(true);
                }}
                className="absolute bottom-1 right-1 p-1 bg-white border border-slate-200 text-slate-500 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:bg-slate-50 shadow-sm"
             >
               <Plus className="w-3 h-3" /> Tambah
             </button>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-2 italic">Pemasaran & Strategi</h1>
          <p className="text-sm text-slate-500 font-medium">Analisis customer journey dan perencanaan kampanye brand.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <button 
             onClick={() => setIsEditingJourney(!isEditingJourney)}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
           >
             <RefreshCw className="w-4 h-4" /> Edit Journey
           </button>
        </div>
      </div>

      {isEditingJourney && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-slate-900 p-6 rounded-[2rem] text-white overflow-hidden shadow-2xl border border-white/10"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400">Update Journey Stats & Analisis</h3>
            <button onClick={saveJourney} className="px-4 py-2 bg-indigo-500 rounded-xl text-[10px] font-black hover:bg-indigo-600 transition-all">SIMPAN DATA</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { id: 'awareness', label: 'Awareness' },
              { id: 'interest', label: 'Interest' },
              { id: 'action', label: 'Action' },
              { id: 'retention', label: 'Retention' },
              { id: 'advocacy', label: 'Advocacy' }
            ].map(key => (
              <div key={key.id} className="space-y-4">
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{key.label} Stat</label>
                  <input 
                    type="number"
                    value={(journey as any)[key.id]}
                    onChange={(e) => setJourney({ ...journey, [key.id]: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-400 text-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Analisis {key.label}</label>
                  <textarea 
                    rows={4}
                    value={(journey as any)[`${key.id}Notes`] || ''}
                    onChange={(e) => setJourney({ ...journey, [`${key.id}Notes`]: e.target.value })}
                    placeholder={`Apa langkah ${key.label.toLowerCase()} saat ini?`}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-[10px] font-medium outline-none focus:border-indigo-400 resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* STP Section */}
      <div className="bg-white p-5 md:p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 rounded-xl">
              <Compass className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-800">Segmentasi, Targeting, Positioning (STP)</h2>
              <p className="text-xs text-slate-500 font-medium">Fondasi strategi pemasaran brand Anda.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditingStp(!isEditingStp)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl font-bold text-xs text-indigo-600 hover:bg-indigo-100 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" /> Edit STP
          </button>
        </div>

        {isEditingStp ? (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100"
          >
            {[
              { id: 'segmentasi', label: 'Segmentasi', placeholder: 'Siapa saja profil konsumen Anda secara umum?', icon: AlignLeft },
              { id: 'targeting', label: 'Targeting', placeholder: 'Siapa target utama Anda?', icon: Target },
              { id: 'positioning', label: 'Positioning', placeholder: 'Bagaimana brand Anda ingin diingat?', icon: Megaphone }
            ].map(key => (
              <div key={key.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <key.icon className="w-4 h-4 text-slate-500" />
                  <label className="text-sm font-bold text-slate-700">{key.label}</label>
                </div>
                <textarea 
                  rows={5}
                  value={(stp as any)[key.id] || ''}
                  onChange={(e) => setStp({ ...stp, [key.id]: e.target.value })}
                  placeholder={key.placeholder}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none shadow-sm"
                />
              </div>
            ))}
            <div className="md:col-span-3 flex justify-end">
              <button 
                onClick={saveStp} 
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Simpan STP
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { id: 'segmentasi', label: 'Segmentasi', bg: 'bg-rose-50', color: 'text-rose-600', border: 'border-rose-100' },
              { id: 'targeting', label: 'Targeting', bg: 'bg-amber-50', color: 'text-amber-600', border: 'border-amber-100' },
              { id: 'positioning', label: 'Positioning', bg: 'bg-emerald-50', color: 'text-emerald-600', border: 'border-emerald-100' }
            ].map((item, i) => (
              <div key={i} className={cn("p-5 rounded-2xl border", item.border, item.bg)}>
                <h4 className={cn("text-sm font-black mb-3", item.color)}>{item.label}</h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {(stp as any)[item.id] || <span className="text-slate-400 italic">Belum ada {item.label.toLowerCase()} yang diatur.</span>}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Journey Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {[
          { label: 'Awareness', icon: Megaphone, color: 'bg-indigo-600', val: journey.awareness, width: 'w-full', desc: 'Jangkauan Iklan / Konten' },
          { label: 'Interest', icon: Search, color: 'bg-indigo-500', val: journey.interest, width: 'w-[85%]', desc: 'Kunjungan Profil / Web' },
          { label: 'Action', icon: ShoppingCart, color: 'bg-indigo-400', val: journey.action, width: 'w-[70%]', desc: 'Checkout / Pembelian' },
          { label: 'Retention', icon: RefreshCw, color: 'bg-indigo-300', val: journey.retention, width: 'w-[55%]', desc: 'Pembelian Berulang' },
          { label: 'Advocacy', icon: Heart, iconColor: 'text-rose-500', color: 'bg-indigo-200', val: journey.advocacy, width: 'w-[40%]', desc: 'Review / Rekomendasi' },
        ].map((stage, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className={cn(
              "h-24 flex flex-col items-center justify-center text-white rounded-2xl relative overflow-hidden transition-all hover:scale-[1.02] cursor-default shadow-lg",
              stage.color,
              stage.width
            )}>
              <stage.icon className={cn("w-5 h-5 mb-1", stage.iconColor || "text-white/80")} />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{stage.label}</span>
              <span className="text-xl font-black">{stage.val.toLocaleString()}</span>
              {/* Converssion rate arrow */}
              {i < 4 && (
                <div className="absolute -bottom-2 right-1/2 translate-x-1/2 z-10">
                   <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white/30"></div>
                </div>
              )}
            </div>
            <div className="text-center mt-3">
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{stage.desc}</p>
               {i > 0 && (
                 <p className="text-[10px] font-black text-indigo-600">
                    {Math.round((stage.val / (i === 1 ? journey.awareness : i === 2 ? journey.interest : i === 3 ? journey.action : journey.retention)) * 100)}% Conv
                 </p>
               )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Journey Analysis Section */}
        <div className="bg-white p-5 md:p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800">Proses Analisis Journey</h1>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-1 scrollbar-hide">
            {[
              { id: 'awareness', label: '1. Awareness (Kesadaran)', icon: Megaphone, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { id: 'interest', label: '2. Interest & Consideration', icon: Search, color: 'text-blue-600', bg: 'bg-blue-50' },
              { id: 'action', label: '3. Action / Conversion', icon: ShoppingCart, color: 'text-amber-600', bg: 'bg-amber-50' },
              { id: 'retention', label: '4. Retention', icon: RefreshCw, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { id: 'advocacy', label: '5. Advocacy', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' }
            ].map((step, i) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-100 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("p-2 rounded-lg", step.bg)}>
                    <step.icon className={cn("w-4 h-4", step.color)} />
                  </div>
                  <h4 className="text-sm font-black text-slate-800">{step.label}</h4>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 min-h-[60px]">
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    {(journey as any)[`${step.id}Notes`] || 'Belum ada catatan analisis. Klik "Edit Journey" untuk mengisi.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar & Notes Area */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-5 md:p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <CalendarIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Kalender Brand & Ide</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </button>
                <span className="text-xs font-black text-slate-700 w-28 text-center uppercase tracking-widest">
                  {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </span>
                <button 
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-t border-l border-slate-100">
               {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
                 <div key={d} className="bg-slate-50 py-2 border-b border-r border-slate-100 text-[9px] font-black text-slate-400 text-center uppercase tracking-widest">{d}</div>
               ))}
               {renderCalendar()}
            </div>

            {isLongNoteModalOpen && selectedDate && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
                >
                  <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Catatan Tanggal</h2>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setIsLongNoteModalOpen(false);
                        setSelectedDate(null);
                      }}
                      className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                  
                  <div className="p-5 md:p-6 overflow-y-auto space-y-5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Ide / Judul Singkat</label>
                      <input 
                        type="text"
                        autoFocus
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        placeholder="Tulis ide atau rencana..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Catatan Luas</label>
                      <textarea 
                        value={longNoteInput}
                        onChange={(e) => setLongNoteInput(e.target.value)}
                        placeholder="Tulis detail lengkap rencana, copywriting, atau strategi di sini..."
                        rows={10}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between pt-2">
                       <div className="flex gap-2">
                         {[
                           { id: 'idea', label: 'Ide', color: 'bg-indigo-500' },
                           { id: 'reminder', label: 'Penting', color: 'bg-amber-500' },
                           { id: 'highlight', label: 'Tonjolkan', color: 'bg-rose-500' }
                         ].map(t => (
                           <button
                             key={t.id}
                             onClick={() => setNoteType(t.id as any)}
                             className={cn(
                               "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                               noteType === t.id 
                                 ? `${t.color} text-white border-transparent shadow-[0_4px_12px_rgba(0,0,0,0.1)]` 
                                 : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                             )}
                           >
                             {t.label}
                           </button>
                         ))}
                       </div>

                       <label className="flex items-center gap-2 cursor-pointer group">
                         <input 
                           type="checkbox" 
                           checked={isHighlighted}
                           onChange={(e) => setIsHighlighted(e.target.checked)}
                           className="w-4 h-4 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500/20"
                         />
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-700">Beri Tanda Spesial</span>
                       </label>
                    </div>
                  </div>
                  
                  <div className="p-5 md:p-6 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={saveNote}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 text-[10px] md:text-xs font-black uppercase tracking-widest"
                    >
                      <Save className="w-4 h-4" /> Simpan Catatan
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
            

          </div>
        </div>
      </div>
    </div>
  );
};
