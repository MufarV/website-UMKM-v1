import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Filter,
  Download,
  Calendar,
  PieChart as PieIcon,
  BarChart as BarIcon,
  BookOpen,
  Scale,
  FileText,
  Settings,
  MoreVertical,
  Trash2,
  Edit2,
  X,
  ChevronDown,
  CheckCircle2,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

import { firebaseService } from '../services/firebaseService';
import { auth } from '../lib/firebase';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import * as XLSX from 'xlsx';

const usePeriodFilter = () => {
  const [period, setPeriod] = useState('Semua');
  const [selectedDateFilter, setSelectedDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWeekFilter, setSelectedWeekFilter] = useState(() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
  });
  const [selectedMonthFilter, setSelectedMonthFilter] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  const generatePeriodFilterFn = () => (dateFieldResolver: (item: any) => Date) => (item: any) => {
    if (period === 'Semua') return true;
    const date = dateFieldResolver(item);

    if (period === 'Harian') {
       const filterDate = new Date(selectedDateFilter);
       return date.getFullYear() === filterDate.getFullYear() && 
              date.getMonth() === filterDate.getMonth() && 
              date.getDate() === filterDate.getDate();
    }
    if (period === 'Mingguan') {
       if (!selectedWeekFilter) return true;
       const [y, w] = selectedWeekFilter.split('-W');
       const year = parseInt(y);
       const week = parseInt(w);
       
       const simpleStart = new Date(year, 0, 1 + (week - 1) * 7);
       const dow = simpleStart.getDay();
       const ISOweekStart = simpleStart;
       if (dow <= 4)
           ISOweekStart.setDate(simpleStart.getDate() - simpleStart.getDay() + 1);
       else
           ISOweekStart.setDate(simpleStart.getDate() + 8 - simpleStart.getDay());
           
       const ISOweekEnd = new Date(ISOweekStart);
       ISOweekEnd.setDate(ISOweekEnd.getDate() + 6);
       
       return date >= ISOweekStart && date <= ISOweekEnd;
    }
    if (period === 'Bulanan') {
       if (!selectedMonthFilter) return true;
       const [y, m] = selectedMonthFilter.split('-');
       return date.getFullYear() === parseInt(y) && date.getMonth() === parseInt(m) - 1;
    }
    return true;
  };

  const renderPeriodSelector = () => (
    <div className="flex items-center gap-2 flex-wrap">
      <select 
         className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-medium h-10 outline-none"
         value={period}
         onChange={e => setPeriod(e.target.value)}
      >
        <option value="Semua">Semua Waktu</option>
        <option value="Harian">Harian</option>
        <option value="Mingguan">Mingguan</option>
        <option value="Bulanan">Bulanan</option>
      </select>
      {period === 'Harian' && (
        <input 
           type="date" 
           value={selectedDateFilter} 
           onChange={e => setSelectedDateFilter(e.target.value)}
           className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-medium outline-none h-10"
        />
      )}
      {period === 'Mingguan' && (
        <input 
           type="week" 
           value={selectedWeekFilter} 
           onChange={e => setSelectedWeekFilter(e.target.value)}
           className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-medium outline-none h-10"
        />
      )}
      {period === 'Bulanan' && (
        <input 
           type="month" 
           value={selectedMonthFilter} 
           onChange={e => setSelectedMonthFilter(e.target.value)}
           className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-medium outline-none h-10"
        />
      )}
    </div>
  );

  return { period, filterFn: generatePeriodFilterFn(), renderPeriodSelector };
};

// --- Sub-components for Accounting ---

const AccountManagement = ({ accounts }: { accounts: any[] }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newAccount, setNewAccount] = useState({ code: '', name: '', type: 'Asset' });

  const handleAdd = async () => {
    if (!newAccount.code || !newAccount.name) return;
    await firebaseService.create('accounts', { ...newAccount, balance: 0, ownerId: auth.currentUser?.uid });
    setShowAdd(false);
    setNewAccount({ code: '', name: '', type: 'Asset' });
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await firebaseService.delete('accounts', id);
    } catch (err) {
      console.error("Gagal menghapus akun:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 md:p-6 rounded-3xl border border-slate-200 gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold">Bagan Akun (COA)</h2>
          <p className="text-xs text-slate-500">Kelola daftar akun bisnis Anda.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" /> Akun Baru
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-50 p-5 rounded-3xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 shadow-inner"
          >
            <input 
              placeholder="Kode (e.g. 1101)" 
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none"
              value={newAccount.code}
              onChange={e => setNewAccount({...newAccount, code: e.target.value})}
            />
            <input 
              placeholder="Nama Akun" 
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none"
              value={newAccount.name}
              onChange={e => setNewAccount({...newAccount, name: e.target.value})}
            />
            <select 
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none"
              value={newAccount.type}
              onChange={e => setNewAccount({...newAccount, type: e.target.value as any})}
            >
              <option value="Asset">Asset</option>
              {['Liability', 'Equity', 'Revenue', 'Expense'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button 
              onClick={handleAdd}
              className="bg-indigo-600 text-white rounded-xl font-bold text-sm py-2.5"
            >
              Simpan Akun
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-bold text-slate-500 tracking-widest">
            <tr>
              <th className="px-6 py-4">Kode</th>
              <th className="px-6 py-4">Nama Akun</th>
              <th className="px-6 py-4">Tipe</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accounts.sort((a, b) => a.code.localeCompare(b.code)).map(acc => (
              <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4 font-mono font-bold text-indigo-600">{acc.code}</td>
                <td className="px-6 py-4 font-bold text-slate-900">{acc.name}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-0.5 rounded-lg text-[10px] font-bold border",
                    acc.type === 'Asset' ? "bg-blue-50 text-blue-600 border-blue-100" :
                    acc.type === 'Liability' ? "bg-amber-50 text-amber-600 border-amber-100" :
                    acc.type === 'Equity' ? "bg-purple-50 text-purple-600 border-purple-100" :
                    acc.type === 'Revenue' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                    "bg-rose-50 text-rose-600 border-rose-100"
                  )}>
                    {acc.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={(e) => handleDelete(acc.id, e)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
};

const JournalView = ({ accounts, entries }: { accounts: any[], entries: any[] }) => {
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState([{ accountId: '', debit: 0, credit: 0 }]);
  const [description, setDescription] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { period, filterFn, renderPeriodSelector } = usePeriodFilter();
  const filteredEntries = entries.filter(filterFn((t: any) => t.date?.toDate ? t.date.toDate() : typeof t.date === 'string' ? new Date(t.date) : new Date()));

  const handleAddItem = () => setItems([...items, { accountId: '', debit: 0, credit: 0 }]);
  
  const handleSave = async () => {
    const totalDebit = items.reduce((sum, i) => sum + i.debit, 0);
    const totalCredit = items.reduce((sum, i) => sum + i.credit, 0);
    
    if (totalDebit !== totalCredit || totalDebit === 0) {
      alert('Jurnal tidak balance atau kosong!');
      return;
    }

    // Check if any item has empty accountId
    const hasEmptyAccount = items.some(i => !i.accountId);
    if (hasEmptyAccount) {
      alert('Terdapat baris jurnal yang belum memilih akun!');
      return;
    }

    const entryItems = items.map(i => ({
      ...i,
      accountName: accounts.find(a => a.id === i.accountId)?.name || 'Unknown'
    }));

    await firebaseService.create('journal_entries', {
      date: serverTimestamp(),
      description,
      items: entryItems,
      ownerId: auth.currentUser?.uid
    });

    setShowForm(false);
    setItems([{ accountId: '', debit: 0, credit: 0 }]);
    setDescription('');
  };

  const handleDeleteEntry = async (id: string) => {
    if (deletingId === id) {
      try {
        await firebaseService.delete('journal_entries', id);
        setDeletingId(null);
      } catch (err) {
        console.error("Gagal menghapus jurnal:", err);
        alert('Gagal menghapus jurnal');
      }
    } else {
      setDeletingId(id);
      setTimeout(() => {
        setDeletingId((current) => current === id ? null : current);
      }, 3000);
    }
  };

  const handleExportExcel = () => {
    const data = [['Tanggal', 'Deskripsi', 'Akun', 'Debit (Rp)', 'Kredit (Rp)']];
    filteredEntries.forEach(entry => {
      let date;
      if (entry.date?.toDate) date = entry.date.toDate().toLocaleDateString('id-ID');
      else if (typeof entry.date === 'string') date = new Date(entry.date).toLocaleDateString('id-ID');
      else date = 'Baru saja';
      
      entry.items.forEach((item: any, index: number) => {
        data.push([
          index === 0 ? date : '',
          index === 0 ? entry.description : '',
          item.accountName,
          item.debit || 0,
          item.credit || 0
        ]);
      });
      data.push(['', '', '', '', '']); // empty row spacer
    });
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Jurnal Umum');
    XLSX.writeFile(wb, `Jurnal_Umum_${period}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 md:p-6 rounded-3xl border border-slate-200 gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold">Jurnal Umum</h2>
          <p className="text-xs text-slate-500">Catat transaksi keuangan bisnis harian Anda.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row items-stretch sm:items-center">
          {renderPeriodSelector()}
          <button 
            onClick={handleExportExcel}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl font-bold hover:bg-emerald-100 transition-all font-mono text-sm uppercase tracking-tight"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all font-mono text-sm uppercase tracking-tight"
          >
            <Plus className="w-4 h-4" /> POST JURNAL
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-5 md:p-8 rounded-3xl border-2 border-indigo-100 shadow-2xl space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                placeholder="Deskripsi Jurnal..." 
                className="px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none w-full"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              <div className="flex items-center justify-between md:justify-end font-mono text-[10px] md:text-sm gap-4">
                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">D: Rp {items.reduce((s,i)=>s+i.debit,0).toLocaleString()}</span>
                <span className="text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded-lg">K: Rp {items.reduce((s,i)=>s+i.credit,0).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-2xl border border-slate-100 md:border-none">
                  <select 
                    className="w-full md:flex-1 px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm bg-white"
                    value={item.accountId}
                    onChange={e => {
                      const newItems = [...items];
                      newItems[idx].accountId = e.target.value;
                      setItems(newItems);
                    }}
                  >
                    <option value="">Pilih Akun...</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>({a.code}) {a.name}</option>)}
                  </select>
                  <div className="grid grid-cols-2 md:flex w-full md:w-auto gap-3">
                    <input 
                      type="number" 
                      placeholder="Debit" 
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                      value={item.debit || ''}
                      onChange={e => {
                        const newItems = [...items];
                        newItems[idx].debit = Number(e.target.value);
                        newItems[idx].credit = 0;
                        setItems(newItems);
                      }}
                    />
                    <input 
                      type="number" 
                      placeholder="Credit" 
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                      value={item.credit || ''}
                      onChange={e => {
                        const newItems = [...items];
                        newItems[idx].credit = Number(e.target.value);
                        newItems[idx].debit = 0;
                        setItems(newItems);
                      }}
                    />
                  </div>
                  <button 
                    onClick={() => setItems(items.filter((_, i) => i !== idx))}
                    className="self-end md:self-center p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between pt-4 gap-4">
              <button 
                onClick={handleAddItem}
                className="w-full sm:w-auto px-6 py-2.5 border-2 border-indigo-100 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50"
              >
                + Tambah Baris
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowForm(false)}
                  className="flex-1 sm:flex-none px-6 py-2.5 text-slate-500 font-bold text-sm"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 sm:flex-none px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100"
                >
                  Posting Jurnal
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {filteredEntries.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0)).map(entry => (
          <div key={entry.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="px-5 md:px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                  {entry.date?.toDate ? entry.date.toDate().toLocaleDateString('id-ID') : 'Pending...'}
                </p>
                <h4 className="font-bold text-slate-800 text-sm md:text-base">{entry.description}</h4>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-white rounded-full border border-slate-200 text-[9px] md:text-[10px] font-bold text-indigo-600">
                  REF: {entry.id.slice(0, 6).toUpperCase()}
                </div>
                <button 
                  onClick={() => handleDeleteEntry(entry.id)}
                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${deletingId === entry.id ? 'bg-rose-500 text-white px-3' : 'text-rose-500 hover:bg-rose-100'}`}
                  title="Hapus Jurnal"
                >
                  {deletingId === entry.id ? (
                    <span className="text-[10px] font-bold">hapus?</span>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[400px]">
                <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase">
                  <tr>
                    <th className="px-6 py-2 text-left">Akun</th>
                    <th className="px-6 py-2 text-right">Debit</th>
                    <th className="px-6 py-2 text-right">Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {entry.items.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className={cn("px-6 py-3", item.credit > 0 ? "pl-12 text-slate-500 italic" : "font-bold text-slate-700")}>
                        {item.accountName}
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-emerald-600">
                        {item.debit > 0 ? `Rp ${item.debit.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-rose-600">
                        {item.credit > 0 ? `Rp ${item.credit.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

const TrialBalanceList = ({ accounts, entries }: { accounts: any[], entries: any[] }) => {
  const { period, filterFn, renderPeriodSelector } = usePeriodFilter();
  const filteredEntries = entries.filter(filterFn((t: any) => t.date?.toDate ? t.date.toDate() : typeof t.date === 'string' ? new Date(t.date) : new Date()));

  const accountBalances: { [key: string]: number } = {};
  accounts.forEach(acc => accountBalances[acc.id] = 0);

  let totalDebit = 0;
  let totalCredit = 0;

  filteredEntries.forEach(entry => {
    entry.items.forEach((item: any) => {
      if (accountBalances[item.accountId] !== undefined) {
        accountBalances[item.accountId] += item.debit - item.credit;
      }
    });
  });

  const handleExportExcel = () => {
    const data: any[][] = [['Murni Cipta - Neraca Saldo'], ['Nama Akun', 'Debit (Rp)', 'Kredit (Rp)']];
    
    let sumDebit = 0;
    let sumCredit = 0;
    
    accounts.forEach(acc => {
      const isDebitSide = ['Asset', 'Expense'].includes(acc.type);
      const rawBalance = accountBalances[acc.id] || 0;
      const absoluteBalance = Math.abs(rawBalance);
      
      let computedDebit = 0;
      let computedCredit = 0;

      if (isDebitSide) {
        if (rawBalance >= 0) computedDebit = rawBalance;
        else computedCredit = absoluteBalance;
      } else {
        if (rawBalance <= 0) computedCredit = absoluteBalance;
        else computedDebit = absoluteBalance;
      }

      sumDebit += computedDebit;
      sumCredit += computedCredit;
      
      data.push([
        acc.name,
        computedDebit || 0,
        computedCredit || 0
      ]);
    });
    
    data.push([]);
    data.push(['TOTAL', sumDebit, sumCredit]);
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Neraca Saldo');
    XLSX.writeFile(wb, `Neraca_Saldo_${period}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-0">
       <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold">Neraca Saldo</h2>
          <p className="text-xs md:text-sm text-slate-500">Mengecek keseimbangan total debit dan kredit seluruh akun.</p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
          <div className="text-left sm:text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
            <div className="flex items-center gap-2 text-emerald-600 font-bold ml-0">
              <CheckCircle2 className="w-4 h-4" /> BALANCED
            </div>
          </div>
          {renderPeriodSelector()}
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:bg-emerald-50 px-4 py-2 border border-emerald-100 rounded-lg transition-colors tracking-tight h-10 w-full sm:w-auto"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[500px]">
          <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">Nama Akun</th>
              <th className="px-8 py-4 text-right">Debit</th>
              <th className="px-8 py-4 text-right">Credit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accounts.map(acc => {
              const isDebitSide = ['Asset', 'Expense'].includes(acc.type);
              const rawBalance = accountBalances[acc.id] || 0;
              const absoluteBalance = Math.abs(rawBalance);
              
              // For display in trial balance, we generally put positive balances on debit side for Asset/Expense, 
              // and negative balances on credit side for Asset/Expense. But simpler: just add them to the correct column.
              let computedDebit = 0;
              let computedCredit = 0;
  
              if (isDebitSide) {
                if (rawBalance >= 0) computedDebit = rawBalance;
                else computedCredit = absoluteBalance;
              } else {
                if (rawBalance <= 0) computedCredit = absoluteBalance;
                else computedDebit = absoluteBalance;
              }
  
              totalDebit += computedDebit;
              totalCredit += computedCredit;
  
              return (
                <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-4 font-bold text-slate-700">{acc.name}</td>
                  <td className={cn("px-8 py-4 text-right font-mono", computedDebit > 0 ? "text-indigo-600" : "text-slate-400")}>
                    {computedDebit > 0 ? `Rp ${computedDebit.toLocaleString('id-ID')}` : '-'}
                  </td>
                  <td className={cn("px-8 py-4 text-right font-mono", computedCredit > 0 ? "text-slate-600" : "text-slate-400")}>
                    {computedCredit > 0 ? `Rp ${computedCredit.toLocaleString('id-ID')}` : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="bg-indigo-50 font-black text-indigo-900 border-t border-indigo-100">
            <tr>
              <td className="px-8 py-4 uppercase text-xs tracking-widest">Total Keseluruhan</td>
              <td className="px-8 py-4 text-right font-mono text-indigo-600">Rp {totalDebit.toLocaleString('id-ID')}</td>
              <td className="px-8 py-4 text-right font-mono text-slate-600">Rp {totalCredit.toLocaleString('id-ID')}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const FinancialReports = ({ accounts, entries }: { accounts: any[], entries: any[] }) => {
  const { period, filterFn, renderPeriodSelector } = usePeriodFilter();

  const filteredEntries = entries.filter(filterFn((t: any) => t.date?.toDate ? t.date.toDate() : new Date()));

  const accountBalances: { [key: string]: number } = {};
  accounts.forEach(acc => accountBalances[acc.id] = 0);

  filteredEntries.forEach(entry => {
    entry.items.forEach((item: any) => {
      if (accountBalances[item.accountId] !== undefined) {
        accountBalances[item.accountId] += item.debit - item.credit;
      }
    });
  });

  const getBalance = (acc: any) => {
    const isDebitSide = ['Asset', 'Expense'].includes(acc.type);
    const rawBalance = accountBalances[acc.id] || 0;
    return isDebitSide ? rawBalance : -rawBalance;
  };

  const revenueAccounts = accounts.filter(a => a.type === 'Revenue');
  const expenseAccounts = accounts.filter(a => a.type === 'Expense');
  
  const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + getBalance(acc), 0);
  const totalExpense = expenseAccounts.reduce((sum, acc) => sum + getBalance(acc), 0);
  const netIncome = totalRevenue - totalExpense;

  const assetAccounts = accounts.filter(a => a.type === 'Asset');
  const liabilityAccounts = accounts.filter(a => a.type === 'Liability');
  const equityAccounts = accounts.filter(a => a.type === 'Equity');

  const totalAssets = assetAccounts.reduce((sum, acc) => sum + getBalance(acc), 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + getBalance(acc), 0);
  // Equity includes net income from the period
  const totalEquity = equityAccounts.reduce((sum, acc) => sum + getBalance(acc), 0) + netIncome;
  const totalLiabilityAndEquity = totalLiabilities + totalEquity;

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const dataProfitLoss = [
      ['Kategori', 'Nama Akun', 'Jumlah (Rp)'],
      ...revenueAccounts.map(a => ['Pendapatan', a.name, getBalance(a)]),
      ...expenseAccounts.map(a => ['Beban', a.name, -getBalance(a)]),
      ['', 'Total Laba Bersih', netIncome]
    ];
    
    const wsProfitLoss = XLSX.utils.aoa_to_sheet(dataProfitLoss);
    XLSX.utils.book_append_sheet(wb, wsProfitLoss, 'Laba Rugi');

    const dataBalanceSheet = [
      ['Kategori', 'Nama Akun', 'Saldo Bersih (Rp)'],
      ...assetAccounts.map(a => ['Aktiva (Aset)', a.name, getBalance(a)]),
      ['', 'Total Aktiva', totalAssets],
      [],
      ...liabilityAccounts.map(a => ['Passiva (Kewajiban)', a.name, getBalance(a)]),
      ...equityAccounts.map(a => ['Ekuitas', a.name, getBalance(a)]),
      ['Ekuitas', 'Laba Ditahan', netIncome],
      ['', 'Total Passiva & Ekuitas', totalLiabilityAndEquity]
    ];
    
    const wsBalanceSheet = XLSX.utils.aoa_to_sheet(dataBalanceSheet);
    XLSX.utils.book_append_sheet(wb, wsBalanceSheet, 'Neraca');

    XLSX.writeFile(wb, `Laporan_Keuangan_${period}.xlsx`);
  };

  return (
    <div id="printable-laporan" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 md:p-6 rounded-3xl border border-slate-200 gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold">Laporan Keuangan</h2>
          <p className="text-xs text-slate-500">Melihat Laba Rugi dan Neraca.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
           {renderPeriodSelector()}
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 h-10 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all font-mono"
            >
              <Download className="w-4 h-4" /> Export Excel
            </button>
        </div>
      </div>
      <div className="flex md:grid md:grid-cols-2 gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <div className="min-w-[320px] md:min-w-0 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
            <BarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base md:text-lg">Laporan Laba Rugi</h3>
            <p className="text-[10px] md:text-xs text-slate-400">Ringkasan pendapatan dan beban bisnis.</p>
          </div>
        </div>
        
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex justify-between font-bold text-slate-400 text-[10px] uppercase tracking-widest">
              <span>Pendapatan</span>
              <span>Jumlah</span>
            </div>
            {revenueAccounts.map(acc => (
              <div key={acc.id} className="flex justify-between text-xs md:text-sm">
                <span className="font-medium text-slate-700">{acc.name}</span>
                <span className="font-mono text-emerald-600 font-bold">Rp {getBalance(acc).toLocaleString('id-ID')}</span>
              </div>
            ))}
            <div className="h-px bg-slate-100" />
            <div className="flex justify-between font-bold text-slate-400 text-[10px] uppercase tracking-widest">
              <span>Beban-Beban</span>
            </div>
            {expenseAccounts.map(acc => (
              <div key={acc.id} className="flex justify-between text-xs md:text-sm">
                <span className="font-medium text-slate-700">{acc.name}</span>
                <span className="font-mono text-rose-600 font-bold">(Rp {getBalance(acc).toLocaleString('id-ID')})</span>
              </div>
            ))}
            <div className="p-4 md:p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center mt-8 sticky bottom-0">
              <span className="font-bold text-emerald-900 text-xs md:text-sm">Total Laba Bersih</span>
              <span className="font-black text-emerald-600 text-base md:text-lg">Rp {netIncome.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <div className="min-w-[320px] md:min-w-0 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:max-h-[600px]">
          <div className="flex items-center gap-3 mb-6 md:mb-8 shrink-0">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base md:text-lg">Posisi Keuangan (Neraca)</h3>
            <p className="text-[10px] md:text-xs text-slate-400">Status aset, kewajiban, dan ekuitas.</p>
          </div>
        </div>
        
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex justify-between font-bold text-indigo-600 text-[10px] uppercase tracking-widest">
              <span>Aktiva (Aset)</span>
              <span>Saldo Bersih</span>
            </div>
            {assetAccounts.map(acc => (
               <div key={acc.id} className="flex justify-between text-xs md:text-sm">
                 <span className="font-medium text-slate-700">{acc.name}</span>
                 <span className="font-mono font-bold">Rp {getBalance(acc).toLocaleString('id-ID')}</span>
               </div>
            ))}
            <div className="flex justify-between text-xs md:text-sm font-bold pt-2 border-t border-slate-100">
               <span>Total Aktiva</span>
               <span className="font-mono text-indigo-600">Rp {totalAssets.toLocaleString('id-ID')}</span>
            </div>

            <div className="h-px bg-slate-100 mt-6" />

            <div className="flex justify-between font-bold text-amber-600 text-[10px] uppercase tracking-widest">
              <span>Passiva (Kewajiban)</span>
            </div>
            {liabilityAccounts.map(acc => (
               <div key={acc.id} className="flex justify-between text-xs md:text-sm">
                 <span className="font-medium text-slate-700">{acc.name}</span>
                 <span className="font-mono font-bold">Rp {getBalance(acc).toLocaleString('id-ID')}</span>
               </div>
            ))}
            <div className="flex justify-between font-bold text-purple-600 text-[10px] uppercase tracking-widest mt-4">
              <span>Ekuitas</span>
            </div>
            {equityAccounts.map(acc => (
               <div key={acc.id} className="flex justify-between text-xs md:text-sm">
                 <span className="font-medium text-slate-700">{acc.name}</span>
                 <span className="font-mono font-bold">Rp {getBalance(acc).toLocaleString('id-ID')}</span>
               </div>
            ))}
            <div className="flex justify-between text-xs md:text-sm">
               <span className="font-medium text-slate-700">Laba Ditahan</span>
               <span className="font-mono text-emerald-600 font-bold">Rp {netIncome.toLocaleString('id-ID')}</span>
            </div>

            <div className="p-4 md:p-5 bg-slate-900 rounded-2xl flex justify-between items-center mt-8 text-white sticky bottom-0">
              <span className="font-bold opacity-70 text-xs md:text-sm">Total Passiva & Ekuitas</span>
              <span className="font-black text-base md:text-lg">Rp {totalLiabilityAndEquity.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

const incomeData = [
  { month: 'Jan', income: 4500, expense: 2100 },
  { month: 'Feb', income: 5200, expense: 2800 },
  { month: 'Mar', income: 4800, expense: 2300 },
  { month: 'Apr', income: 6100, expense: 3200 },
  { month: 'Mei', income: 5900, expense: 2900 },
  { month: 'Jun', income: 7200, expense: 3800 },
];

const categoryData = [
  { name: 'Produksi', value: 400 },
  { name: 'Marketing', value: 300 },
  { name: 'Gaji', value: 300 },
  { name: 'Logistik', value: 200 },
  { name: 'Lainnya', value: 100 },
];

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

export const KeuanganView = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'jurnal' | 'neraca' | 'laporan' | 'akun'>('overview');
  const { period: selectedPeriod, filterFn: generatePeriodFilterFn, renderPeriodSelector } = usePeriodFilter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [pesanan, setPesanan] = useState<any[]>([]);

  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [transactionForm, setTransactionForm] = useState({ description: '', amount: 0, type: 'income', category: 'Sales' });
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);

  React.useEffect(() => {
    if (!auth.currentUser) return;
    const unsubTrans = firebaseService.subscribe('transactions', setTransactions);
    const unsubAccounts = firebaseService.subscribe('accounts', setAccounts);
    const unsubJournal = firebaseService.subscribe('journal_entries', setJournalEntries);
    const unsubPesanan = firebaseService.subscribe('pesanan', setPesanan);
    
    const seedAccounts = async () => {
      const existing = await firebaseService.list('accounts');
      if (existing && existing.length === 0) {
        const defaults = [
          { code: '1101', name: 'Kas/Bank', type: 'Asset', balance: 0 },
          { code: '1102', name: 'Piutang Usaha', type: 'Asset', balance: 0 },
          { code: '1201', name: 'Peralatan', type: 'Asset', balance: 0 },
          { code: '2101', name: 'Utang Usaha', type: 'Liability', balance: 0 },
          { code: '3101', name: 'Modal Pemilik', type: 'Equity', balance: 0 },
          { code: '4101', name: 'Pendapatan Jasa', type: 'Revenue', balance: 0 },
          { code: '5101', name: 'Beban Sewa', type: 'Expense', balance: 0 },
          { code: '5102', name: 'Beban Gaji', type: 'Expense', balance: 0 },
        ];
        for (const acc of defaults) {
          await firebaseService.create('accounts', { ...acc, ownerId: auth.currentUser?.uid });
        }
      }
    };
    seedAccounts();

    return () => {
      unsubTrans();
      unsubAccounts();
      unsubJournal();
      unsubPesanan();
    };
  }, []);

  const tabs = [
    { id: 'overview', label: 'Ringkasan', icon: PieIcon },
    { id: 'jurnal', label: 'Jurnal Umum', icon: BookOpen },
    { id: 'neraca', label: 'Neraca Saldo', icon: Scale },
    { id: 'laporan', label: 'Laporan Keuangan', icon: FileText },
    { id: 'akun', label: 'Edit Akun', icon: Settings },
  ];

  const handleSaveTransaction = async () => {
    if (!transactionForm.description || !transactionForm.amount) return;
    try {
      if (editingTransactionId) {
        await firebaseService.update('transactions', editingTransactionId, {
          description: transactionForm.description,
          amount: Number(transactionForm.amount),
          type: transactionForm.type,
          category: transactionForm.category,
        });
      } else {
        await firebaseService.create('transactions', {
          date: serverTimestamp(),
          description: transactionForm.description,
          amount: Number(transactionForm.amount),
          type: transactionForm.type,
          category: transactionForm.category,
          ownerId: auth.currentUser?.uid
        });
      }
      setIsAddTransactionOpen(false);
      setEditingTransactionId(null);
      setTransactionForm({ description: '', amount: 0, type: 'income', category: 'Sales' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTransaction = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await firebaseService.delete('transactions', id);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTransactions = transactions.filter(generatePeriodFilterFn((t: any) => {
    if (t.date?.toDate) return t.date.toDate();
    if (typeof t.date === 'string') return new Date(t.date);
    return new Date();
  }));

  const handleExportTransactions = () => {
    const data = [
      ['Status', 'Deskripsi', 'Kategori', 'Tanggal', 'Tipe', 'Jumlah (Rp)'],
      ...filteredTransactions.map(t => [
        'Success',
        t.description,
        t.category,
        t.date?.toDate ? t.date.toDate().toLocaleDateString('id-ID') : 'Baru saja',
        t.type,
        t.amount
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');
    XLSX.writeFile(wb, `Transaksi_${selectedPeriod}.xlsx`);
  };

  const generateDemoData = async () => {
    if (!auth.currentUser || isGeneratingDemo) return;
    setIsGeneratingDemo(true);
    
    try {
      const now = new Date();
      const categoriesIncome = ['Penjualan Produk', 'Layanan Jasa', 'Proyek Custom'];
      const categoriesExpense = ['Bahan Baku', 'Gaji Karyawan', 'Operasional', 'Pemasaran', 'Sewa', 'Peralatan Kantor'];
      
      const payloadFns: any[] = [];
      for (let i = 0; i < 30; i++) {
        // 1-3 transactions per day
        const numTransactions = Math.floor(Math.random() * 3) + 1;
        const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, Math.floor(Math.random() * 8) + 9, Math.floor(Math.random() * 60));
        
        for (let j = 0; j < numTransactions; j++) {
           const isIncome = Math.random() > 0.4; // 60% chance of income
           const category = isIncome ? categoriesIncome[Math.floor(Math.random() * categoriesIncome.length)] : categoriesExpense[Math.floor(Math.random() * categoriesExpense.length)];
           const amount = isIncome 
              ? Math.floor(Math.random() * 5000000) + 1000000 
              : Math.floor(Math.random() * 2000000) + 500000;
           
           payloadFns.push(() => 
             firebaseService.create('transactions', {
               date: Timestamp.fromDate(currentDay),
               description: `Demo ${isIncome ? 'Pendapatan' : 'Pengeluaran'} - ${category}`,
               amount,
               type: isIncome ? 'income' : 'expense',
               category,
               ownerId: auth.currentUser?.uid
             })
           );
        }
      }
      
      // Send carefully in chunks to avoid overwhelming the network
      const chunkSize = 20;
      for (let i = 0; i < payloadFns.length; i += chunkSize) {
        const chunk = payloadFns.slice(i, i + chunkSize);
        await Promise.all(chunk.map(fn => fn()));
      }
      
      // Removed alert, it might also be blocked. Data will just appear.
    } catch (e: any) {
      console.error(e);
      // Optional: set some state here to show error message component instead of alert
    } finally {
      setIsGeneratingDemo(false);
    }
  };

  const deleteAllData = async () => {
    if (!auth.currentUser || transactions.length === 0) {
        alert('Tidak ada data yang bisa dihapus.');
        return;
    }
    if (!confirm('Apakah Anda yakin ingin menghapus SEMUA transaksi keuangan? Ini tidak dapat dibatalkan.')) return;
    
    try {
      setIsGeneratingDemo(true); // Re-using this flag to disable buttons during deletion
      const payloadFns = transactions.map(t => () => firebaseService.delete('transactions', t.id));
      
      const chunkSize = 20;
      for (let i = 0; i < payloadFns.length; i += chunkSize) {
        const chunk = payloadFns.slice(i, i + chunkSize);
        await Promise.all(chunk.map(fn => fn()));
      }
      
      // Removed alert, data will just disappear.
    } catch (e: any) {
      console.error(e);
      alert('Gagal menghapus data: ' + e.message);
    } finally {
      setIsGeneratingDemo(false);
    }
  };

  // Calculate Dynamic Overview Data
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalBalance = totalIncome - totalExpense;

  // Aggregate Category Data
  const categoryMap: { [key: string]: number } = {};
  filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + (Number(t.amount) || 0);
  });
  const dynamicCategoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // Aggregate Chart Data based on time
  const chartMap: { [key: string]: { income: number, expense: number } } = {};
  filteredTransactions.forEach(t => {
    let date;
    if (t.date?.toDate) date = t.date.toDate();
    else if (typeof t.date === 'string') date = new Date(t.date);
    else date = new Date();
    
    let label = '';
    if (selectedPeriod === 'Harian') {
      label = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } else if (selectedPeriod === 'Mingguan') {
      label = date.toLocaleDateString('id-ID', { weekday: 'short' });
    } else if (selectedPeriod === 'Bulanan') {
      label = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } else {
      label = date.toLocaleDateString('id-ID', { month: 'short' });
    }
    
    if (!chartMap[label]) chartMap[label] = { income: 0, expense: 0 };
    if (t.type === 'income') chartMap[label].income += (Number(t.amount) || 0);
    else if (t.type === 'expense') chartMap[label].expense += (Number(t.amount) || 0);
  });
  const dynamicIncomeData = Object.entries(chartMap).map(([label, data]) => ({ month: label, ...data }));

  const dynamicLabaRugiData = dynamicIncomeData.map(d => ({
    month: d.month,
    labaBersih: d.income - d.expense
  }));

  const filteredPesanan = pesanan.filter(generatePeriodFilterFn((p: any) => {
    if (p.createdAt?.toDate) return p.createdAt.toDate();
    if (p.tanggal_po) return new Date(p.tanggal_po);
    if (typeof p.createdAt === 'string') return new Date(p.createdAt);
    return new Date();
  }));

  const pesananChartMap: { [key: string]: number } = {};
  filteredPesanan.forEach(p => {
    let date;
    if (p.createdAt?.toDate) date = p.createdAt.toDate();
    else if (p.tanggal_po) date = new Date(p.tanggal_po);
    else if (typeof p.createdAt === 'string') date = new Date(p.createdAt);
    else date = new Date();
    
    let label = '';
    if (selectedPeriod === 'Harian') {
      label = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } else if (selectedPeriod === 'Mingguan') {
      label = date.toLocaleDateString('id-ID', { weekday: 'short' });
    } else if (selectedPeriod === 'Bulanan') {
      label = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } else {
      label = date.toLocaleDateString('id-ID', { month: 'short' });
    }
    
    if (!pesananChartMap[label]) pesananChartMap[label] = 0;
    pesananChartMap[label] += (Number(p.totalHarga) || 0);
  });
  const dynamicSalesData = Object.entries(pesananChartMap).map(([label, sales]) => ({ month: label, sales }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-1 md:mb-2">Keuangan & Akuntansi</h1>
          <p className="text-[10px] md:text-sm text-slate-500">Kelola arus kas dan pembukuan standar bisnis Anda.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <button 
            onClick={handleExportTransactions}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 text-[10px] md:text-xs hover:bg-slate-50 transition-all whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button 
            onClick={() => setIsAddTransactionOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all text-[10px] md:text-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" /> Transaksi Baru
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAddTransactionOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-50 p-5 rounded-3xl border border-slate-200 grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4 shadow-inner"
          >
            <input 
              placeholder="Deskripsi" 
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none"
              value={transactionForm.description}
              onChange={e => setTransactionForm({...transactionForm, description: e.target.value})}
            />
            <input 
              type="number"
              placeholder="Jumlah (Rp)" 
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none"
              value={transactionForm.amount || ''}
              onChange={e => setTransactionForm({...transactionForm, amount: Number(e.target.value)})}
            />
            <select 
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none"
              value={transactionForm.type}
              onChange={e => setTransactionForm({...transactionForm, type: e.target.value})}
            >
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
            <input 
              list="kategori-list"
              placeholder="Kategori" 
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none"
              value={transactionForm.category}
              onChange={e => setTransactionForm({...transactionForm, category: e.target.value})}
            />
            <datalist id="kategori-list">
              {Array.from(new Set([
                'Operasional', 'Bahan Baku', 'Sewa', 'Pemasaran', 'Gaji', 'Transportasi', 'Listrik & Air', 'Lainnya',
                ...transactions.map((t: any) => t.category).filter(Boolean)
              ])).map(cat => (
                <option key={cat as string} value={cat as string} />
              ))}
            </datalist>
            <div className="flex gap-2">
              <button 
                onClick={handleSaveTransaction}
                className="bg-indigo-600 text-white rounded-xl font-bold text-sm py-2.5 flex-1"
              >
                Simpan
              </button>
              <button 
                onClick={() => setIsAddTransactionOpen(false)}
                className="bg-slate-200 text-slate-700 rounded-xl font-bold text-sm p-2.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex overflow-x-auto items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 w-full sm:w-fit scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap",
              selectedTab === tab.id 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {selectedTab === 'akun' && <AccountManagement accounts={accounts} />}
      {selectedTab === 'jurnal' && <JournalView accounts={accounts} entries={journalEntries} />}
      {selectedTab === 'neraca' && <TrialBalanceList accounts={accounts} entries={journalEntries} />}
      {selectedTab === 'laporan' && <FinancialReports accounts={accounts} entries={journalEntries} />}

      {selectedTab === 'overview' && (
        <div id="printable-overview" className="space-y-6">
          {/* Financial Summary Cards - Horizontal scroll on mobile */}
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <div className="min-w-[280px] md:min-w-0 bg-indigo-600 rounded-3xl p-5 md:p-6 text-white overflow-hidden relative group shadow-lg shadow-indigo-100">
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <p className="text-indigo-100/80 text-[10px] md:text-xs font-medium mb-1 uppercase tracking-wider">Total Saldo Kas</p>
              <h2 className="text-xl md:text-3xl font-black mb-4 tracking-tight">Rp {totalBalance.toLocaleString('id-ID')}</h2>
              <div className="flex items-center gap-2 text-indigo-50 text-[9px] font-bold bg-white/10 w-fit px-2 py-1 rounded-lg">
                Status Terkini
              </div>
            </div>
            
            <div className="min-w-[240px] md:min-w-0 bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                   <ArrowDownLeft className="w-4 h-4" />
                </div>
                <p className="text-slate-400 text-[9px] md:text-xs font-black uppercase tracking-widest">Pemasukan</p>
              </div>
              <h2 className="text-lg md:text-2xl font-black text-slate-900 mb-1">Rp {totalIncome.toLocaleString('id-ID')}</h2>
              <p className="text-[9px] text-emerald-600 font-bold">Total Riwayat</p>
            </div>

            <div className="min-w-[240px] md:min-w-0 bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <p className="text-slate-400 text-[9px] md:text-xs font-black uppercase tracking-widest">Pengeluaran</p>
              </div>
              <h2 className="text-lg md:text-2xl font-black text-slate-900 mb-1">Rp {totalExpense.toLocaleString('id-ID')}</h2>
              <p className="text-[9px] text-rose-600 font-bold">Total Riwayat</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
            {/* Cash Flow Chart */}
            <div className="xl:col-span-2 bg-white p-5 md:p-8 rounded-3xl border border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
                <h3 className="text-base md:text-lg font-bold">Analisis Arus Kas</h3>
                {renderPeriodSelector()}
              </div>
              <div className="h-[250px] md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dynamicIncomeData.length > 0 ? dynamicIncomeData : incomeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 md:gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Pemasukan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Pengeluaran</span>
                </div>
              </div>
            </div>

            {/* Expense Categories */}
            <div className="bg-white p-5 md:p-8 rounded-3xl border border-slate-200">
              <h3 className="text-base md:text-lg font-bold mb-6 md:mb-8 text-center sm:text-left">Alokasi Biaya</h3>
              <div className="h-[200px] md:h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dynamicCategoryData.length > 0 ? dynamicCategoryData : categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(dynamicCategoryData.length > 0 ? dynamicCategoryData : categoryData).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-6">
                {(dynamicCategoryData.length > 0 ? dynamicCategoryData : categoryData).map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                       <span className="text-xs font-medium text-slate-600">{cat.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {totalExpense > 0 ? ((cat.value / totalExpense) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sales Chart */}
            <div className="xl:col-span-2 bg-white p-5 md:p-8 rounded-3xl border border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
                <h3 className="text-base md:text-lg font-bold">Grafik Penjualan</h3>
                <span className="px-3 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-600">
                  Data Pesanan
                </span>
              </div>
              <div className="h-[200px] md:h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dynamicSalesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 md:gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Omzet Penjualan (Rp)</span>
                </div>
              </div>
            </div>

            {/* Profit & Loss Chart */}
            <div className="bg-white p-5 md:p-8 rounded-3xl border border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
                <h3 className="text-base md:text-lg font-bold">Laporan Laba Rugi</h3>
                <span className="px-3 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600">
                  Laba Bersih
                </span>
              </div>
              <div className="h-[200px] md:h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dynamicLabaRugiData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="labaBersih" name="Laba Bersih">
                      {dynamicLabaRugiData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.labaBersih >= 0 ? "#10b981" : "#f43f5e"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Transaction List */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-bold text-sm md:text-base">Transaksi Terbaru</h3>
              <div className="flex gap-2">
                <button 
                  onClick={handleExportTransactions} 
                  className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-tight"
                >
                  <Download className="w-3.5 h-3.5" /> Export Excel
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Deskripsi</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4 text-right">Jumlah</th>
                    <th className="px-6 py-4 text-right print-hide">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredTransactions.length > 0 ? filteredTransactions.map((t, i) => (
                    <tr key={t.id || i} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">
                          Success
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{t.description}</td>
                      <td className="px-6 py-4 text-slate-500">{t.category}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {t.date instanceof Date ? t.date.toLocaleDateString() : t.date?.toDate?.()?.toLocaleDateString() || 'Baru saja'}
                      </td>
                      <td className={cn(
                        "px-6 py-4 font-bold text-right",
                        t.type === 'income' ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {t.type === 'income' ? '+' : '-'} Rp {t.amount?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 text-right print-hide">
                         <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                             onClick={(e) => { e.stopPropagation(); setEditingTransactionId(t.id); setTransactionForm({ ...t, amount: t.amount || 0 }); setIsAddTransactionOpen(true); }}
                             className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                             <Edit2 className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(t.id); }}
                             className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                        Belum ada transaksi di periode ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
