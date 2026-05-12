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
  ChevronDown,
  CheckCircle2
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
import { serverTimestamp } from 'firebase/firestore';

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

  const handleDelete = async (id: string) => {
    if (confirm('Hapus akun ini?')) {
      await firebaseService.delete('accounts', id);
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
                    onClick={() => handleDelete(acc.id)}
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

  const handleAddItem = () => setItems([...items, { accountId: '', debit: 0, credit: 0 }]);
  
  const handleSave = async () => {
    const totalDebit = items.reduce((sum, i) => sum + i.debit, 0);
    const totalCredit = items.reduce((sum, i) => sum + i.credit, 0);
    
    if (totalDebit !== totalCredit || totalDebit === 0) {
      alert('Jurnal tidak balance atau kosong!');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 md:p-6 rounded-3xl border border-slate-200 gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold">Jurnal Umum</h2>
          <p className="text-xs text-slate-500">Catat transaksi keuangan bisnis harian Anda.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all font-mono text-sm"
        >
          <Plus className="w-4 h-4" /> POST JURNAL
        </button>
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
                <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 sm:bg-transparent sm:border-none sm:p-0">
                  <select 
                    className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm bg-white"
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
                  <div className="flex w-full sm:w-auto gap-3">
                    <input 
                      type="number" 
                      placeholder="Debit" 
                      className="flex-1 sm:w-32 px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
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
                      className="flex-1 sm:w-32 px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                      value={item.credit || ''}
                      onChange={e => {
                        const newItems = [...items];
                        newItems[idx].credit = Number(e.target.value);
                        newItems[idx].debit = 0;
                        setItems(newItems);
                      }}
                    />
                    <button 
                      onClick={() => setItems(items.filter((_, i) => i !== idx))}
                      className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
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
        {entries.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0)).map(entry => (
          <div key={entry.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                  {entry.date?.toDate ? entry.date.toDate().toLocaleDateString('id-ID') : 'Pending...'}
                </p>
                <h4 className="font-bold text-slate-800">{entry.description}</h4>
              </div>
              <div className="px-3 py-1 bg-white rounded-full border border-slate-200 text-[10px] font-bold text-indigo-600">
                REF: {entry.id.slice(0, 6).toUpperCase()}
              </div>
            </div>
            <table className="w-full text-sm">
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
        ))}
      </div>
    </div>
  );
};

const TrialBalanceList = ({ accounts, entries }: { accounts: any[], entries: any[] }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
       <div className="p-8 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Neraca Saldo</h2>
          <p className="text-sm text-slate-500">Mengecek keseimbangan total debit dan kredit seluruh akun.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
          <div className="flex items-center gap-2 text-emerald-600 font-bold">
            <CheckCircle2 className="w-4 h-4" /> BALANCED
          </div>
        </div>
      </div>
      <table className="w-full text-left">
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
            return (
              <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-4 font-bold text-slate-700">{acc.name}</td>
                <td className="px-8 py-4 text-right font-mono text-indigo-600">{isDebitSide ? `Rp 0` : '-'}</td>
                <td className="px-8 py-4 text-right font-mono text-slate-400">{!isDebitSide ? `Rp 0` : '-'}</td>
              </tr>
            )
          })}
        </tbody>
        <tfoot className="bg-indigo-50 font-black text-indigo-900 border-t border-indigo-100">
          <tr>
            <td className="px-8 py-4 uppercase text-xs tracking-widest">Total Keseluruhan</td>
            <td className="px-8 py-4 text-right font-mono">Rp 0</td>
            <td className="px-8 py-4 text-right font-mono">Rp 0</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

const FinancialReports = ({ accounts, entries }: { accounts: any[], entries: any[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
            <BarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Laporan Laba Rugi</h3>
            <p className="text-xs text-slate-400">Ringkasan pendapatan dan beban bisnis.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between font-bold text-slate-400 text-[10px] uppercase tracking-widest">
            <span>Pendapatan</span>
            <span>Jumlah</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Pendapatan Jasa</span>
            <span className="font-mono text-emerald-600">Rp 0</span>
          </div>
          <div className="h-px bg-slate-100" />
          <div className="flex justify-between font-bold text-slate-400 text-[10px] uppercase tracking-widest">
            <span>Beban-Beban</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Beban Gaji</span>
            <span className="font-mono text-rose-600">(Rp 0)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Beban Sewa</span>
            <span className="font-mono text-rose-600">(Rp 0)</span>
          </div>
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center mt-8">
            <span className="font-bold text-emerald-900">Total Laba Bersih</span>
            <span className="font-black text-emerald-600 text-lg">Rp 0</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Posisi Keuangan (Neraca)</h3>
            <p className="text-xs text-slate-400">Status aset, kewajiban, dan ekuitas.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between font-bold text-indigo-600 text-[10px] uppercase tracking-widest">
            <span>Aktiva (Aset)</span>
            <span>Saldo Bersih</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Kas & Bank</span>
            <span className="font-mono">Rp 128.450.000</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Peralatan</span>
            <span className="font-mono">Rp 15.000.000</span>
          </div>
          <div className="h-px bg-slate-100 mt-6" />
          <div className="flex justify-between font-bold text-amber-600 text-[10px] uppercase tracking-widest">
            <span>Passiva (Kewajiban & Ekuitas)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Utang Usaha</span>
            <span className="font-mono">Rp 5.000.000</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Modal Pemilik</span>
            <span className="font-mono font-bold">Rp 138.450.000</span>
          </div>
          <div className="p-4 bg-slate-900 rounded-2xl flex justify-between items-center mt-8 text-white">
            <span className="font-bold opacity-70">Total Passiva</span>
            <span className="font-black text-lg">Rp 143.450.000</span>
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
  const [selectedPeriod, setSelectedPeriod] = useState('Bulanan');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);

  React.useEffect(() => {
    if (!auth.currentUser) return;
    const unsubTrans = firebaseService.subscribe('transactions', setTransactions);
    const unsubAccounts = firebaseService.subscribe('accounts', setAccounts);
    const unsubJournal = firebaseService.subscribe('journal_entries', setJournalEntries);
    
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
    };
  }, []);

  const tabs = [
    { id: 'overview', label: 'Ringkasan', icon: PieIcon },
    { id: 'jurnal', label: 'Jurnal Umum', icon: BookOpen },
    { id: 'neraca', label: 'Neraca Saldo', icon: Scale },
    { id: 'laporan', label: 'Laporan Keuangan', icon: FileText },
    { id: 'akun', label: 'Edit Akun', icon: Settings },
  ];

  const handleAddTransaction = async () => {
    try {
      await firebaseService.create('transactions', {
        date: serverTimestamp(),
        description: 'Penjualan Kopi Batch #' + Math.floor(Math.random() * 100),
        amount: Math.floor(Math.random() * 5000000) + 1000000,
        type: 'income',
        category: 'Sales',
        ownerId: auth.currentUser?.uid
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Keuangan & Akuntansi</h1>
          <p className="text-slate-500">Kelola arus kas dan pembukuan standar akuntansi bisnis Anda.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={handleAddTransaction}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" /> Transaksi Baru
          </button>
        </div>
      </div>

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
        <div className="space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-indigo-600 rounded-3xl p-5 md:p-6 text-white overflow-hidden relative group shadow-lg shadow-indigo-100 col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <p className="text-indigo-100/80 text-xs font-medium mb-1">Total Saldo Kas</p>
              <h2 className="text-2xl md:text-3xl font-black mb-4 tracking-tight">Rp 128.45jt</h2>
              <div className="flex items-center gap-2 text-indigo-50 text-[10px] font-bold bg-white/10 w-fit px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3 h-3" /> +Rp 12.5M vs bln lalu
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <ArrowDownLeft className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">Pemasukan</p>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-1">Rp 42.18jt</h2>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> 8.2% Growth
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                  <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">Pengeluaran</p>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-1">Rp 18.92jt</h2>
              <p className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                <ArrowDownLeft className="w-3 h-3" /> 4.1% Reduced
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
            {/* Cash Flow Chart */}
            <div className="xl:col-span-2 bg-white p-5 md:p-8 rounded-3xl border border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
                <h3 className="text-base md:text-lg font-bold">Analisis Arus Kas</h3>
                <div className="flex gap-1 p-1 bg-slate-50 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto scrollbar-hide">
                  {['Mingguan', 'Bulanan', 'Tahunan'].map((p) => (
                    <button 
                      key={p}
                      onClick={() => setSelectedPeriod(p)}
                      className={cn(
                        "flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap",
                        selectedPeriod === p ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-indigo-600"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[250px] md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={incomeData}>
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
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-6">
                {categoryData.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                      <span className="text-xs font-medium text-slate-600">{cat.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">{((cat.value / 1300) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction List */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-bold text-sm md:text-base">Transaksi Terbaru</h3>
              <button className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-tight">Lihat Semua</button>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {transactions.length > 0 ? transactions.map((t, i) => (
                    <tr key={t.id || i} className="hover:bg-slate-50 transition-colors group cursor-pointer">
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
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                        Belum ada transaksi. Tambahkan sekarang!
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
