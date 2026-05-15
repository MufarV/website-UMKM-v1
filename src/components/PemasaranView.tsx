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
  Heart
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

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [noteType, setNoteType] = useState<'idea' | 'reminder' | 'highlight'>('idea');
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    let unsubJourney: any, unsubNotes: any;
    if (auth.currentUser) {
      unsubJourney = firebaseService.subscribe('marketing_journey', (data) => {
        if (data.length > 0) setJourney(data[0] as any);
      });
      unsubNotes = firebaseService.subscribe('marketing_calendar', setNotes);
    }
    return () => {
      unsubJourney?.();
      unsubNotes?.();
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

  const saveNote = async () => {
    if (!selectedDate || !noteInput) return;
    try {
      const existingNote = notes.find(n => n.date === selectedDate);
      const payload = { 
        note: noteInput, 
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
      setSelectedDate(null);
    } catch (e) { console.error(e); }
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
            setNoteType(hasNote?.type || 'idea');
            setIsHighlighted(hasNote?.isHighlighted || false);
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
            <div className="mt-1">
              <p className={cn(
                "text-[8px] font-medium leading-tight line-clamp-3",
                hasNote.isHighlighted ? "text-slate-900 font-bold" : "text-slate-600"
              )}>{hasNote.note}</p>
            </div>
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

            <AnimatePresence>
              {selectedDate && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
                      Catatan: {new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                    </p>
                    <button onClick={() => setSelectedDate(null)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-lg"><Plus className="w-4 h-4 rotate-45" /></button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <input 
                        type="text" 
                        autoFocus
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        placeholder="Ide atau rencana pemasaran..."
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
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
                                ? `${t.color} text-white border-transparent shadow-lg shadow-indigo-100` 
                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                            )}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={isHighlighted}
                            onChange={(e) => setIsHighlighted(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500/20"
                          />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-700">Beri Tanda Spesial</span>
                        </label>
                        
                        <button 
                          onClick={saveNote}
                          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 text-[10px] font-black uppercase tracking-widest"
                        >
                          <Save className="w-4 h-4" /> Simpan
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
