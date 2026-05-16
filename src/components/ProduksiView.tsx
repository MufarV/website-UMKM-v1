import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Layers, 
  Activity, 
  Plus, 
  AlertTriangle,
  RefreshCw,
  Box,
  Truck,
  Edit2,
  CheckCircle2,
  Circle,
  Save,
  X,
  History,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { firebaseService } from '../services/firebaseService';

export const ProduksiView = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'planner' | 'products'>('inventory');
  
  // Inventory State
  const [inventory, setInventory] = useState<any[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  // Filtering
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Planner State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [plans, setPlans] = useState<any[]>([]);
  const [editingPlanDate, setEditingPlanDate] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<{notes: string, capacity: number | string}>({ notes: '', capacity: '' });
  
  // Logs State
  const [logs, setLogs] = useState<any[]>([]);

  // Products State
  const [products, setProducts] = useState<any[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState<any>({ category: 'Fix' });
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);

  // Subscriptions
  useEffect(() => {
    const unsubInv = firebaseService.subscribe('inventory', setInventory);
    const unsubProducts = firebaseService.subscribe('production_products', setProducts);
    const unsubLogs = firebaseService.subscribe('production_logs', (data) => {
      setLogs(data.sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)).slice(0, 50));
    });
    return () => {
      unsubInv();
      unsubProducts();
      unsubLogs();
    };
  }, []);

  useEffect(() => {
    fetchPlans(currentMonth);
  }, [currentMonth]);

  const fetchPlans = async (date: Date) => {
    try {
      const allPlans = (await firebaseService.list('production_plans')) as any[] || [];
      const monthPrefix = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      setPlans(allPlans.filter(p => p.date.startsWith(monthPrefix)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveItem = async () => {
    if (!editForm.name || !editForm.category) return;
    
    if (editingItem === 'new') {
      const initialStock = Number(editForm.stock) || 0;
      await firebaseService.create('inventory', {
        name: editForm.name,
        stock: initialStock,
        unit: editForm.unit || 'pcs',
        category: editForm.category,
        price: Number(editForm.price) || 0,
        minStock: Number(editForm.minStock) || 0,
        batches: initialStock > 0 ? [{ id: Date.now().toString(), date: new Date().toISOString(), qty: initialStock }] : []
      });
    } else if (editingItem) {
      const oldItem = inventory.find(i => i.id === editingItem);
      const newStock = Number(editForm.stock) || 0;
      const oldStock = oldItem.stock || 0;
      let finalBatches = [...(oldItem.batches || [])];
      
      if (newStock > oldStock) {
        // Stock IN: add new batch
        const diff = newStock - oldStock;
        finalBatches.push({ id: Date.now().toString(), date: new Date().toISOString(), qty: diff });
      } else if (newStock < oldStock) {
        // Stock OUT: deduct from oldest batches (FIFO)
        let toDeduct = oldStock - newStock;
        finalBatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        for (let i = 0; i < finalBatches.length && toDeduct > 0; i++) {
          if (finalBatches[i].qty <= toDeduct) {
             toDeduct -= finalBatches[i].qty;
             finalBatches[i].qty = 0;
          } else {
             finalBatches[i].qty -= toDeduct;
             toDeduct = 0;
          }
        }
        finalBatches = finalBatches.filter(b => b.qty > 0);
      }

      await firebaseService.update('inventory', editingItem, {
        name: editForm.name,
        stock: newStock,
        unit: editForm.unit || oldItem.unit,
        category: editForm.category || oldItem.category,
        minStock: Number(editForm.minStock) || 0,
        batches: finalBatches
      });
      
      // Log stock change
      const diff = newStock - oldStock;
      if (diff !== 0) {
         await firebaseService.create('production_logs', {
           date: new Date().toISOString().split('T')[0],
           itemId: editingItem,
           itemName: editForm.name,
           quantityChange: diff,
           type: diff > 0 ? 'in' : 'out',
           note: 'Manual Update (FIFO Applied)'
         });
      }
    }
    
    setEditingItem(null);
    setEditForm({});
    setIsAddingItem(false);
  };

  const handleDeleteItem = async (id: string) => {
    await firebaseService.delete('inventory', id);
    setDeletingItem(null);
  };

  const handleUpdateCapacity = async (dateStr: string, capacity: string) => {
    const existing = plans.find(p => p.date === dateStr);
    const numCap = Number(capacity) || 0;
    
    if (existing) {
      await firebaseService.update('production_plans', existing.id, { capacity: numCap });
    } else if (numCap > 0) {
      await firebaseService.create('production_plans', { date: dateStr, notes: '', capacity: numCap });
    }
    fetchPlans(currentMonth);
  };

  const handleSavePlanNote = async () => {
    if (!editingPlanDate) return;
    const existing = plans.find(p => p.date === editingPlanDate);
    
    if (existing) {
      await firebaseService.update('production_plans', existing.id, { notes: planForm.notes });
    } else if (planForm.notes.trim() || Number(planForm.capacity) > 0) {
      await firebaseService.create('production_plans', { 
        date: editingPlanDate, 
        notes: planForm.notes, 
        capacity: Number(planForm.capacity) || 0 
      });
    }
    
    fetchPlans(currentMonth);
    setEditingPlanDate(null);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.category) return;
    
    if (editingProduct === 'new') {
      await firebaseService.create('production_products', {
        name: productForm.name,
        category: productForm.category,
        description: productForm.description || ''
      });
    } else if (editingProduct) {
      await firebaseService.update('production_products', editingProduct, {
        name: productForm.name,
        category: productForm.category,
        description: productForm.description || ''
      });
    }
    
    setIsAddingProduct(false);
    setEditingProduct(null);
    setProductForm({ category: 'Fix' });
  };

  const handleDeleteProduct = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await firebaseService.delete('production_products', id);
    setDeletingProduct(null);
  };

  const getStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return 'Habis';
    if (stock <= minStock) return 'Kritis';
    if (stock <= minStock * 1.5) return 'Rendah';
    return 'Aman';
  };

  const filteredInventory = inventory.filter(item => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Produksi & Stok 📦</h1>
          <p className="text-slate-500 font-medium">Kelola ketersediaan barang dan rencana produksi bulanan.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100/80 w-fit rounded-xl">
        <button 
          onClick={() => setActiveTab('inventory')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === 'inventory' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Inventaris Barang & Riwayat
        </button>
        <button 
          onClick={() => setActiveTab('planner')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === 'planner' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Rencana Produksi
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === 'products' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Daftar Produk
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex gap-2">
              {['all', 'Bahan Mentah', 'Barang Setengah Jadi', 'Barang Jadi'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    categoryFilter === cat ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent"
                  )}
                >
                  {cat === 'all' ? 'Semua Kategori' : cat}
                </button>
              ))}
            </div>
            <button 
              onClick={() => {
                setEditingItem('new');
                setEditForm({ category: 'Bahan Mentah', unit: 'pcs' });
                setIsAddingItem(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              <Plus className="w-4 h-4" /> Tambah Barang
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Nama Item</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Stok</th>
                    <th className="px-6 py-4">Satuan</th>
                    <th className="px-6 py-4">Status / Min</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {isAddingItem && editingItem === 'new' && (
                    <tr className="bg-indigo-50/30">
                      <td className="px-4 py-3">
                        <input className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white" placeholder="Nama..." value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                      </td>
                      <td className="px-4 py-3">
                         <select className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white" value={editForm.category || ''} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                           <option value="Bahan Mentah">Bahan Mentah</option>
                           <option value="Barang Setengah Jadi">Barang Setengah Jadi</option>
                           <option value="Barang Jadi">Barang Jadi</option>
                         </select>
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" className="w-20 p-2 border border-slate-200 rounded-lg text-sm bg-white" placeholder="Stok" value={editForm.stock || ''} onChange={e => setEditForm({...editForm, stock: e.target.value})} />
                      </td>
                      <td className="px-4 py-3">
                        <input className="w-20 p-2 border border-slate-200 rounded-lg text-sm bg-white" placeholder="Unit" value={editForm.unit || ''} onChange={e => setEditForm({...editForm, unit: e.target.value})} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                           <span className="text-xs text-slate-400">Min:</span>
                           <input type="number" className="w-20 p-2 border border-slate-200 rounded-lg text-sm bg-white" placeholder="Min Stok" value={editForm.minStock || ''} onChange={e => setEditForm({...editForm, minStock: e.target.value})} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={handleSaveItem} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"><Save className="w-4 h-4" /></button>
                          <button onClick={() => { setIsAddingItem(false); setEditingItem(null); }} className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {filteredInventory.map((item) => {
                    const status = getStatus(item.stock, item.minStock || 0);
                    const isEditing = editingItem === item.id;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          {isEditing ? 
                            <input className="w-full p-2 border border-slate-200 bg-white rounded-lg text-sm" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /> : 
                            <span className="font-bold text-slate-800">{item.name}</span>
                          }
                        </td>
                        <td className="px-6 py-4">
                           {isEditing ? 
                             <select className="p-2 border border-slate-200 bg-white rounded-lg text-sm" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                               <option value="Bahan Mentah">Bahan Mentah</option>
                               <option value="Barang Setengah Jadi">Barang Setengah Jadi</option>
                               <option value="Barang Jadi">Barang Jadi</option>
                             </select> : 
                             <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">{item.category || 'N/A'}</span>
                           }
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? 
                            <input type="number" className="w-20 p-2 border border-slate-200 bg-white rounded-lg text-sm" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: e.target.value})} /> : 
                            <div className="relative group/stock inline-block">
                              <span className="font-mono text-lg font-black text-slate-700 border-b border-dashed border-slate-300 pb-0.5 cursor-help">{item.stock}</span>
                              {item.batches && item.batches.length > 0 && (
                                <div className="absolute left-0 bottom-full mb-2 bg-slate-800 text-white text-[10px] p-2 rounded-lg w-40 opacity-0 group-hover/stock:opacity-100 transition-opacity z-10 pointer-events-none shadow-xl">
                                  <p className="font-bold border-b border-slate-600 pb-1 mb-1 text-slate-300">Sistem FIFO - Stok</p>
                                  <div className="space-y-1">
                                    {item.batches.map((b: any, idx: number) => (
                                      <div key={idx} className="flex justify-between items-center">
                                        <span className="text-slate-400">{new Date(b.date).toLocaleDateString('id-ID', {day:'numeric', month:'short'})}</span>
                                        <span className="font-mono font-bold">{b.qty}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          }
                        </td>
                        <td className="px-6 py-4">
                           {isEditing ? 
                            <input className="w-20 p-2 border border-slate-200 bg-white rounded-lg text-sm" value={editForm.unit} onChange={e => setEditForm({...editForm, unit: e.target.value})} /> : 
                            <span className="text-slate-500 uppercase text-xs font-bold">{item.unit}</span>
                          }
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? 
                             <div className="flex items-center gap-2">
                               <span className="text-xs text-slate-400">Min:</span>
                               <input type="number" className="w-16 p-2 border border-slate-200 bg-white rounded-lg text-sm" value={editForm.minStock} onChange={e => setEditForm({...editForm, minStock: e.target.value})} /> 
                             </div>
                             : 
                             <span className={cn(
                              "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                              status === 'Aman' ? "bg-emerald-100 text-emerald-700" : 
                              status === 'Rendah' ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                            )}>
                              {status}
                              <span className="ml-1 opacity-60 normal-case font-medium">({item.minStock || 0})</span>
                            </span>
                          }
                        </td>
                        <td className="px-6 py-4 text-right">
                           {isEditing ? (
                             <div className="flex justify-end gap-2">
                               <button onClick={handleSaveItem} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"><Save className="w-4 h-4" /></button>
                               <button onClick={() => setEditingItem(null)} className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"><X className="w-4 h-4" /></button>
                             </div>
                           ) : deletingItem === item.id ? (
                             <div className="flex justify-end gap-2 animate-in slide-in-from-right-2 duration-200">
                               <button onClick={() => handleDeleteItem(item.id)} className="px-3 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-colors shadow-sm">Ya, Hapus</button>
                               <button onClick={() => setDeletingItem(null)} className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"><X className="w-4 h-4" /></button>
                             </div>
                           ) : (
                             <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button 
                                 onClick={() => { setEditingItem(item.id); setEditForm({...item}); setDeletingItem(null); }}
                                 className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                >
                                 <Edit2 className="w-4 h-4" />
                               </button>
                               <button 
                                 onClick={() => setDeletingItem(item.id)}
                                 className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             </div>
                           )}
                        </td>
                      </tr>
                    );
                  })}
                  {!isAddingItem && filteredInventory.length === 0 && (
                     <tr>
                       <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium bg-slate-50/30">
                         <Box className="w-8 h-8 opacity-20 mx-auto mb-3" />
                         Belum ada barang di kategori ini.
                       </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </div>
          
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px] xl:h-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 shrink-0">
              <History className="w-5 h-5 text-indigo-500" /> 
              Riwayat Stok Terbaru
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[600px]">
              {logs.length > 0 ? logs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center group border border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                       <p className="font-bold text-slate-800 text-sm">{log.itemName}</p>
                       <span className="text-[10px] text-slate-400 font-medium">{log.date}</span>
                    </div>
                    <p className="text-xs text-slate-500">{log.note || 'Manual Update'}</p>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-lg text-sm font-black text-center min-w-[3rem]",
                    log.type === 'in' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  )}>
                    {log.type === 'in' ? '+' : ''}{log.quantityChange}
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                   <Box className="w-12 h-12 mb-4 opacity-20" />
                   <p className="font-medium text-sm text-center">Belum ada riwayat stok.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'planner' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-bold text-slate-900">Rencana Produksi Bulanan</h3>
             <div className="flex items-center gap-4 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200">
               <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 text-slate-500 hover:text-indigo-600 border border-transparent hover:border-slate-200 hover:bg-white rounded-lg transition-colors shadow-sm"><ChevronLeft className="w-5 h-5" /></button>
               <span className="font-extrabold text-sm text-slate-700 min-w-[120px] text-center">{currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
               <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 text-slate-500 hover:text-indigo-600 border border-transparent hover:border-slate-200 hover:bg-white rounded-lg transition-colors shadow-sm"><ChevronRight className="w-5 h-5" /></button>
             </div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
             {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
               const day = i + 1;
               const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
               const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
               const plan = plans.find(p => p.date === dateStr);
               
               // robust today check covering timezone diffs
               const now = new Date();
               const isToday = dateObj.getFullYear() === now.getFullYear() && dateObj.getMonth() === now.getMonth() && dateObj.getDate() === now.getDate();
               
               return (
                 <div key={dateStr} className={cn("border rounded-[2rem] p-5 min-h-[160px] flex flex-col transition-all group", isToday ? "border-indigo-400 bg-indigo-50/50 shadow-md shadow-indigo-100" : "border-slate-200 hover:border-indigo-200 hover:shadow-md bg-white")}>
                   <div className="flex justify-between items-center mb-3">
                     <span className={cn("font-black text-xs uppercase tracking-widest", isToday ? "text-indigo-600" : "text-slate-400")}>
                        {dateObj.toLocaleDateString('id-ID', { weekday: 'long' })}
                     </span>
                     <span className={cn("font-black text-lg", isToday ? "text-indigo-600 bg-indigo-100 px-3 py-1 rounded-xl" : "text-slate-700")}>
                        {dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                     </span>
                   </div>
                   
                   <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                     <button 
                       onClick={() => {
                         setEditingPlanDate(dateStr);
                         setPlanForm({ notes: plan?.notes || '', capacity: plan?.capacity || '' });
                       }}
                       className={cn(
                          "relative p-3 rounded-xl border transition-all duration-300 hover:-translate-y-0.5",
                          plan?.notes?.trim() 
                            ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm" 
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300"
                       )}
                       title="Catatan Produksi"
                     >
                       <FileText className="w-5 h-5" />
                       {plan?.notes?.trim() && (
                         <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
                       )}
                     </button>
                     
                     <div className="flex flex-col items-end flex-1">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Kapasitas</span>
                       <input 
                         type="number"
                         min="0"
                         className="w-full max-w-[100px] text-right bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 ring-indigo-50 shadow-sm transition-all"
                         placeholder="0"
                         defaultValue={plan?.capacity || ''}
                         onBlur={(e) => handleUpdateCapacity(dateStr, e.target.value)}
                       />
                     </div>
                   </div>
                 </div>
               );
             })}
           </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex justify-between items-center mb-8">
             <div>
               <h3 className="text-xl font-bold text-slate-900">Katalog Produk</h3>
               <p className="text-sm text-slate-500 mt-1">Kelola daftar produk Fix & Pengembangan.</p>
             </div>
             <button 
               onClick={() => {
                 setEditingProduct('new');
                 setProductForm({ category: 'Fix' });
                 setIsAddingProduct(true);
               }}
               className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
             >
               <Plus className="w-4 h-4" /> Tambah Produk
             </button>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Nama Produk</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Keterangan</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {isAddingProduct && editingProduct === 'new' && (
                    <tr className="bg-indigo-50/30">
                      <td className="px-4 py-3">
                        <input className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white" placeholder="Nama Produk..." value={productForm.name || ''} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                      </td>
                      <td className="px-4 py-3">
                         <select className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white" value={productForm.category || ''} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                           <option value="Fix">Fix</option>
                           <option value="Pengembangan">Pengembangan</option>
                         </select>
                      </td>
                      <td className="px-4 py-3">
                        <input className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white" placeholder="Keterangan..." value={productForm.description || ''} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={handleSaveProduct} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"><Save className="w-4 h-4" /></button>
                          <button onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {products.map((p) => {
                    const isEditing = editingProduct === p.id;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          {isEditing ? 
                            <input className="w-full p-2 border border-slate-200 bg-white rounded-lg text-sm" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} /> : 
                            <span className="font-bold text-slate-800">{p.name}</span>
                          }
                        </td>
                        <td className="px-6 py-4">
                           {isEditing ? 
                             <select className="p-2 border border-slate-200 bg-white rounded-lg text-sm" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                               <option value="Fix">Fix</option>
                               <option value="Pengembangan">Pengembangan</option>
                             </select> : 
                             <span className={cn(
                               "text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg",
                               p.category === 'Fix' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                             )}>
                               {p.category}
                             </span>
                           }
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                           {isEditing ? 
                            <input className="w-full p-2 border border-slate-200 bg-white rounded-lg text-sm" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} /> : 
                             <span>{p.description || '-'}</span>
                          }
                        </td>
                        <td className="px-6 py-4 text-right">
                           {isEditing ? (
                             <div className="flex justify-end gap-2">
                               <button onClick={handleSaveProduct} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"><Save className="w-4 h-4" /></button>
                               <button onClick={() => setEditingProduct(null)} className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"><X className="w-4 h-4" /></button>
                             </div>
                           ) : deletingProduct === p.id ? (
                             <div className="flex justify-end gap-2 animate-in slide-in-from-right-2 duration-200">
                               <button onClick={(e) => handleDeleteProduct(p.id, e)} className="px-3 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-colors shadow-sm">Ya, Hapus</button>
                               <button onClick={(e) => { e.stopPropagation(); setDeletingProduct(null); }} className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"><X className="w-4 h-4" /></button>
                             </div>
                           ) : (
                             <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button 
                                 onClick={() => { setEditingProduct(p.id); setProductForm({...p}); setDeletingProduct(null); }}
                                 className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                >
                                 <Edit2 className="w-4 h-4" />
                               </button>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); setDeletingProduct(p.id); }}
                                 className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             </div>
                           )}
                        </td>
                      </tr>
                    );
                  })}
                  {!isAddingProduct && products.length === 0 && (
                     <tr>
                       <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium bg-slate-50/30">
                         <Package className="w-8 h-8 opacity-20 mx-auto mb-3" />
                         Belum ada produk.
                       </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>
      )}

      {/* Plan Note Modal */}
      <AnimatePresence>
        {editingPlanDate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setEditingPlanDate(null)}
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
                    <h3 className="font-black text-slate-900 text-lg">Catatan Rencana Produksi</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(editingPlanDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingPlanDate(null)}
                  className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 md:p-8 flex-1 overflow-y-auto bg-slate-50/50">
                <textarea 
                  className="w-full h-full min-h-[300px] p-6 bg-white rounded-2xl text-sm font-medium text-slate-700 border border-slate-200 outline-none focus:ring-4 ring-indigo-500/10 focus:border-indigo-400 transition-all resize-none shadow-sm"
                  placeholder="Tuliskan catatan produksi, rincian, daftar bahan, atau instruksi khusus di sini..."
                  value={planForm.notes}
                  onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })}
                />
              </div>

              <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                <button 
                  onClick={() => setEditingPlanDate(null)}
                  className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl text-xs uppercase tracking-widest transition-colors"
                >
                  BATAL
                </button>
                <button 
                  onClick={handleSavePlanNote}
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

export const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
