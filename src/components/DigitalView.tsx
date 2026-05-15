import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Smartphone, 
  ShoppingBag, 
  Settings, 
  ExternalLink,
  ChevronRight,
  Monitor,
  Zap,
  Lock,
  Search,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon
} from 'lucide-react';
import { firebaseService } from '../services/firebaseService';

export const DigitalView = () => {
  const [settings, setSettings] = useState<any>({
    products: ['Cilok Kuah Pedas', 'Cilok Saos Kacang', 'Cilok Saos Kecap'],
    openTime: '10:00',
    closeTime: '20:00',
    menerimaPesanan: true
  });
  const [newProduct, setNewProduct] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reviewInputRef = useRef<HTMLInputElement>(null);
  const bestSellerInputRef = useRef<HTMLInputElement>(null);
  const [editingImageKey, setEditingImageKey] = useState<{prodIdx: number, optIdx: number} | null>(null);
  const [editingReviewImageIdx, setEditingReviewImageIdx] = useState<number | null>(null);

  const handleBestSellerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', 0.9);
          
          setSettings({ ...settings, bestSellerImage: base64 });
          if (bestSellerInputRef.current) bestSellerInputRef.current.value = '';
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingReviewImageIdx !== null) {
      const reader = new FileReader();
      const idx = editingReviewImageIdx;
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', 0.9);
          
          const newReviews = [...(settings.reviews || [])];
          newReviews[idx] = { ...newReviews[idx], image: base64 };
          
          setSettings({ ...settings, reviews: newReviews });
          setEditingReviewImageIdx(null);
          if (reviewInputRef.current) reviewInputRef.current.value = '';
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingImageKey !== null) {
      const reader = new FileReader();
      const { prodIdx, optIdx } = editingImageKey;
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', 0.9);
          
          const newProducts = [...(settings.products || [])];
          let prod = newProducts[prodIdx];
          if (typeof prod === 'string') {
              prod = { name: prod, options: [] };
          }
          if (!prod.options) {
             prod.options = [];
          }
          const options = [...prod.options];
          options[optIdx] = { ...options[optIdx], image: base64 };
          prod.options = options;
          newProducts[prodIdx] = prod;
          
          setSettings({ ...settings, products: newProducts });
          setEditingImageKey(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const unsub = firebaseService.subscribe('pengaturan', (docs) => {
      const storeSettings = docs.find((d: any) => d.id === 'pengaturan_toko');
      if (storeSettings) {
        setSettings(storeSettings);
      } else {
        setSettings({
          id: 'pengaturan_toko',
          products: ['Cilok Kuah Pedas', 'Cilok Saos Kacang', 'Cilok Kuah Original', 'Cilok Saos Kecap'],
          openTime: '10:00',
          closeTime: '20:00',
          menerimaPesanan: true,
          openPoDates: [],
          heroText: 'Jajanan Cilok Estetik & Lezat untuk Harimu!',
          whatsappNumber: '',
          instagramLink: '',
          bestSellerImage: ''
        });
      }
    });
    return unsub;
  }, []);

  const [saveStatus, setSaveStatus] = useState({ loading: false, message: '', type: '' });

  const saveSettings = async () => {
    setSaveStatus({ loading: true, message: 'Menyimpan, mohon tunggu...', type: 'info' });
    try {
      await firebaseService.set('pengaturan', 'pengaturan_toko', settings);
      setSaveStatus({ loading: false, message: 'Pengaturan berhasil disimpan!', type: 'success' });
      setTimeout(() => setSaveStatus({ loading: false, message: '', type: '' }), 3000);
    } catch (e: any) {
      setSaveStatus({ loading: false, message: 'Gagal: ' + e.message, type: 'error' });
      setTimeout(() => setSaveStatus({ loading: false, message: '', type: '' }), 5000);
    }
  };

  const addProduct = () => {
    if (newProduct.trim()) {
      const currentProds = Array.isArray(settings.products) ? settings.products : [];
      setSettings({ ...settings, products: [...currentProds, { name: newProduct.trim(), image: '', options: [] }] });
      setNewProduct('');
    }
  };

  const removeProduct = (idx: number) => {
    const currentProds = Array.isArray(settings.products) ? settings.products : [];
    setSettings({ ...settings, products: currentProds.filter((_: any, i: number) => i !== idx) });
  };

  const addOption = (prodIdx: number, optionName: string) => {
    if (!optionName.trim()) return;
    const newProducts = [...(settings.products || [])];
    let prod = newProducts[prodIdx];
    if (typeof prod === 'string') {
        prod = { name: prod, options: [] };
    }
    if (!prod.options) prod.options = [];
    prod.options = [...prod.options, { name: optionName.trim(), image: '', price: 0 }];
    newProducts[prodIdx] = prod;
    setSettings({ ...settings, products: newProducts });
  };

  const updateOptionPrice = (prodIdx: number, optIdx: number, newPrice: number) => {
    const newProducts = [...(settings.products || [])];
    let prod = newProducts[prodIdx];
    if (prod.options) {
       const options = [...prod.options];
       options[optIdx] = { ...options[optIdx], price: newPrice };
       prod.options = options;
    }
    newProducts[prodIdx] = prod;
    setSettings({ ...settings, products: newProducts });
  };

  const removeOption = (prodIdx: number, optIdx: number) => {
    const newProducts = [...(settings.products || [])];
    let prod = newProducts[prodIdx];
    if (prod.options) {
       prod.options = prod.options.filter((_: any, i: number) => i !== optIdx);
    }
    newProducts[prodIdx] = prod;
    setSettings({ ...settings, products: newProducts });
  };

  const addReview = () => {
    setSettings({ ...settings, reviews: [...(settings.reviews || []), { name: 'Nama Mahasiswi', text: 'Tulis review disini...', image: '' }] });
  };

  const updateReview = (idx: number, field: string, value: string) => {
    const newReviews = [...(settings.reviews || [])];
    newReviews[idx] = { ...newReviews[idx], [field]: value };
    setSettings({ ...settings, reviews: newReviews });
  };

  const removeReview = (idx: number) => {
    setSettings({ ...settings, reviews: (settings.reviews || []).filter((_: any, i: number) => i !== idx) });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl flex-shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg leading-tight">Pengaturan Web Pemesanan</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Edit jenis produk yang dapat ditampilkan serta waktu pemesanan untuk pelanggan.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {saveStatus.message && (
              <span className={cn("text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-lg flex-1 sm:flex-initial", 
                saveStatus.type === 'success' ? "bg-emerald-100 text-emerald-700" :
                saveStatus.type === 'error' ? "bg-rose-100 text-rose-700" :
                "bg-indigo-100 text-indigo-700 animate-pulse"
              )}>
                {saveStatus.message}
              </span>
            )}
            <button 
              onClick={saveSettings} 
              disabled={saveStatus.loading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saveStatus.loading ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-slate-100">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <ShoppingBag className="w-4 h-4 text-slate-300" /> Katalog Menu (Front-End)
            </h4>
            
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="Tambah menu baru (e.g. Cilok Kuah Pedas)"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-500"
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addProduct()}
              />
              <button onClick={addProduct} className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
              {settings.products?.map((prod: any, idx: number) => {
                const prodName = typeof prod === 'string' ? prod : prod.name;
                const prodOptions = typeof prod === 'object' && prod.options ? prod.options : [];
                return (
                  <div key={idx} className="flex flex-col gap-2 p-3 bg-white border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-700 flex-1">{prodName}</span>
                      <button onClick={() => removeProduct(idx)} className="text-slate-300 hover:text-rose-500 transition-colors p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="pl-4 space-y-2 border-l-2 border-slate-100">
                      {prodOptions.map((opt: any, optIdx: number) => (
                          <div key={optIdx} className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <button
                              onClick={() => {
                                setEditingImageKey({prodIdx: idx, optIdx: optIdx});
                                fileInputRef.current?.click();
                              }}
                              className="w-10 h-10 flex-shrink-0 bg-slate-200 rounded flex items-center justify-center overflow-hidden border border-slate-300 hover:border-indigo-400 group relative"
                            >
                              {opt.image ? (
                                <>
                                  <img src={opt.image} alt={opt.name} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ImageIcon className="w-3 h-3 text-white" />
                                  </div>
                                </>
                              ) : (
                                <ImageIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                              )}
                            </button>
                            <div className="flex-1 flex flex-col">
                              <span className="text-sm font-bold text-slate-700">{opt.name}</span>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs text-slate-400 font-medium">Rp</span>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={opt.price === 0 && opt.price !== undefined ? '' : opt.price}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateOptionPrice(idx, optIdx, val === '' ? 0 : parseInt(val));
                                  }}
                                  className="w-24 bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-bold outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>
                            <button onClick={() => removeOption(idx, optIdx)} className="text-slate-300 hover:text-rose-500 transition-colors p-1">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                      ))}
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          placeholder="Tambah opsi (e.g. Kuah Pedas)... Tekan Enter"
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium outline-none focus:border-indigo-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addOption(idx, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              {settings.products?.length === 0 && (
                <p className="text-center text-xs text-slate-400 italic py-4">Belum ada menu yang ditampilkan.</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Monitor className="w-4 h-4 text-slate-300" /> Operasional Toko Online
            </h4>
            
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-700">Terima Pesanan Online</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.menerimaPesanan}
                    onChange={(e) => setSettings({ ...settings, menerimaPesanan: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Jam Buka</label>
                  <input 
                    type="time" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-500"
                    value={settings.openTime}
                    onChange={(e) => setSettings({ ...settings, openTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Jam Tutup</label>
                  <input 
                    type="time" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-500"
                    value={settings.closeTime}
                    onChange={(e) => setSettings({ ...settings, closeTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">Tanggal Pre-Order (PO) Buka</label>
                <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto p-1 mb-4">
                  {Array.from({length: 60}).map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() + i);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${day}`;
                    const isSelected = (settings.openPoDates || []).includes(dateStr);
                    const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
                    const dateNum = d.getDate();
                    const monthName = d.toLocaleDateString('id-ID', { month: 'short' });

                    return (
                      <button
                        key={dateStr}
                        onClick={() => {
                          const dates = settings.openPoDates || [];
                          if (isSelected) {
                            const newConfig = { ...(settings.poDatesConfig || {}) };
                            delete newConfig[dateStr];
                            setSettings({ ...settings, openPoDates: dates.filter((ds: string) => ds !== dateStr), poDatesConfig: newConfig });
                          } else {
                            // Initialize new date with default times
                            const config = { ...(settings.poDatesConfig || {}) };
                            if (!config[dateStr]) {
                               config[dateStr] = {
                                 times: settings.poTimes || ['Sesi Pagi (09:00 - 12:00)', 'Sesi Siang (13:00 - 16:00)', 'Sesi Sore (17:00 - 20:00)'],
                                 limits: settings.poLimits || [0, 0, 0]
                               };
                            }
                            setSettings({ ...settings, openPoDates: [...dates, dateStr].sort(), poDatesConfig: config });
                          }
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all w-[60px] h-[64px] shrink-0 ${
                          isSelected 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <span className={`text-[9px] uppercase ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>{dayName}</span>
                        <span className="text-base leading-tight mt-0.5">{dateNum}</span>
                        <span className={`text-[9px] uppercase ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>{monthName}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 font-medium pb-2 border-b border-slate-100">Klik pada tanggal untuk membuka/menutup jadwal pemesanan pada hari tersebut.</p>
                
                {/* Per-Date Configurations */}
                {(settings.openPoDates || []).length > 0 && (
                  <div className="space-y-4 pt-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">Atur Opsi Jam & Batas Pcs per Tanggal</label>
                    {(settings.openPoDates || []).map((dateStr: string) => {
                      const d = new Date(dateStr);
                      const formattedDate = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                      const dateConfig = (settings.poDatesConfig && settings.poDatesConfig[dateStr]) || { times: settings.poTimes || ['Sesi Pagi', 'Sesi Siang', 'Sesi Sore'], limits: settings.poLimits || [0, 0, 0] };
                      
                      return (
                        <div key={dateStr} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 relative group">
                           <button 
                             onClick={() => {
                               const newConfig = { ...(settings.poDatesConfig || {}) };
                               delete newConfig[dateStr];
                               setSettings({ 
                                 ...settings, 
                                 openPoDates: (settings.openPoDates || []).filter((ds: string) => ds !== dateStr), 
                                 poDatesConfig: newConfig 
                               });
                             }}
                             className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-100 rounded-lg transition-colors bg-white shadow-sm"
                             title="Hapus Tanggal"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                           <div className="font-bold text-sm text-slate-700 pr-8">{formattedDate}</div>
                           <div className="grid grid-cols-1 gap-2">
                             {[0, 1, 2].map((idx) => (
                               <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                 <input 
                                   type="text" 
                                   placeholder={`Opsi Jam ${idx + 1}`}
                                   className="w-full sm:flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-500"
                                   value={dateConfig.times[idx] || ''}
                                   onChange={(e) => {
                                     const newConfig = { ...(settings.poDatesConfig || {}) };
                                     if (!newConfig[dateStr]) newConfig[dateStr] = { times: [...dateConfig.times], limits: [...dateConfig.limits] };
                                     newConfig[dateStr].times[idx] = e.target.value;
                                     setSettings({ ...settings, poDatesConfig: newConfig });
                                   }}
                                 />
                                 <div className="flex items-center w-full sm:w-auto gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 group focus-within:border-indigo-500 transition-colors shrink-0 sm:max-w-[140px]">
                                   <span className="text-xs font-bold text-slate-400">Batas:</span>
                                   <input 
                                     type="number"
                                     placeholder="∞"
                                     className="w-full bg-transparent py-2.5 text-sm font-bold outline-none text-slate-700 placeholder:text-slate-300"
                                     value={dateConfig.limits?.[idx] === 0 ? '' : dateConfig.limits?.[idx]}
                                     onChange={(e) => {
                                       const val = e.target.value;
                                       const newConfig = { ...(settings.poDatesConfig || {}) };
                                       if (!newConfig[dateStr]) newConfig[dateStr] = { times: [...dateConfig.times], limits: [...dateConfig.limits] };
                                       newConfig[dateStr].limits[idx] = val === '' ? 0 : parseInt(val);
                                       setSettings({ ...settings, poDatesConfig: newConfig });
                                     }}
                                   />
                                   <span className="text-xs font-bold text-slate-400">pcs</span>
                                 </div>
                               </div>
                             ))}
                           </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Review Pelanggan --- */}
        <div className="pt-8 border-t border-slate-100 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-300" /> Review Mahasiswi (Front-End)
            </h4>
            <button onClick={addReview} className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tambah Review
            </button>
          </div>
          
          <input type="file" accept="image/*" ref={reviewInputRef} className="hidden" onChange={handleReviewImageUpload} />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(settings.reviews || []).map((review: any, idx: number) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all flex flex-col gap-4 relative group">
                <button 
                  onClick={() => removeReview(idx)}
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border border-rose-200 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setEditingReviewImageIdx(idx);
                      reviewInputRef.current?.click();
                    }}
                    className="w-12 h-12 flex-shrink-0 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border border-slate-200 hover:border-indigo-400 group/img relative"
                  >
                    {review.image ? (
                      <>
                        <img src={review.image} alt={review.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                          <ImageIcon className="w-4 h-4 text-white" />
                        </div>
                      </>
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-400 group-hover/img:text-indigo-500" />
                    )}
                  </button>
                  <input
                    type="text"
                    value={review.name}
                    onChange={(e) => updateReview(idx, 'name', e.target.value)}
                    placeholder="Nama Mahasiswi"
                    className="flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none font-bold text-slate-800 px-1 py-0.5 text-sm transition-colors"
                  />
                </div>
                <div>
                  <textarea
                    value={review.text}
                    onChange={(e) => updateReview(idx, 'text', e.target.value)}
                    placeholder="Tulis ulasan disini..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none h-24"
                  />
                </div>
              </div>
            ))}
            {(settings.reviews || []).length === 0 && (
              <div className="col-span-full py-8 text-center text-sm font-medium text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                Belum ada review. Klik "Tambah Review" di atas.
              </div>
            )}
          </div>
        </div>

        {/* --- Pengaturan Teks & Kontak --- */}
        <div className="pt-8 border-t border-slate-100 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-300" /> Teks Promosi & Kontak (Front-End)
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">Teks Promosi (Judul Utama)</label>
                  <textarea
                    value={settings.heroText || ''}
                    onChange={(e) => setSettings({ ...settings, heroText: e.target.value })}
                    placeholder="Contoh: Jajanan Cilok Estetik..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 min-h-[100px]"
                  />
               </div>
               <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">Pesan WhatsApp (Kritik & Saran / Bantuan)</label>
                  <div className="flex items-center">
                    <span className="bg-slate-100 border border-slate-200 border-r-0 px-4 py-3 rounded-l-xl text-slate-500 font-medium text-sm">+62</span>
                    <input
                      type="text"
                      value={settings.whatsappNumber || ''}
                      onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value.replace(/\D/g, '') })}
                      placeholder="81234567890"
                      className="w-full bg-slate-50 border border-slate-200 rounded-r-xl p-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500"
                    />
                  </div>
               </div>
               <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">Link/Username Instagram</label>
                  <div className="flex items-center">
                    <span className="bg-slate-100 border border-slate-200 border-r-0 px-4 py-3 rounded-l-xl text-slate-500 font-medium text-sm">@</span>
                    <input
                      type="text"
                      value={settings.instagramLink || ''}
                      onChange={(e) => setSettings({ ...settings, instagramLink: e.target.value })}
                      placeholder="senjakopi.id"
                      className="w-full bg-slate-50 border border-slate-200 rounded-r-xl p-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500"
                    />
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">Foto Terlaris (Hero Image)</label>
               <input type="file" accept="image/*" ref={bestSellerInputRef} className="hidden" onChange={handleBestSellerImageUpload} />
                <button
                  onClick={() => bestSellerInputRef.current?.click()}
                  className="w-full aspect-[4/3] bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-indigo-400 hover:bg-slate-100 transition-all group relative overflow-hidden shadow-inner"
                >
                  {settings.bestSellerImage ? (
                    <>
                      <img src={settings.bestSellerImage} alt="Foto Terlaris" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3 border border-white/30">
                          <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-black text-white uppercase tracking-widest">Ganti Foto Utama</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-white shadow-xl shadow-slate-200/50 rounded-full flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-all group-hover:scale-110 duration-300">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                      <div className="text-center px-8">
                        <span className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors block mb-1">Upload Hero Banner</span>
                        <span className="text-[10px] text-slate-400 font-medium leading-relaxed">Format landscape 4:3 disarankan untuk hasil terbaik di website.</span>
                      </div>
                    </>
                  )}
                </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

const ShoppingBagLoc = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
)

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
