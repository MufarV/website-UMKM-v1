import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  ShoppingBag,
  Plus, 
  Search,
  Filter,
  ArrowUpRight,
  RefreshCw,
  Code,
  Copy,
  X,
  Check,
  Edit2,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { firebaseService } from '../services/firebaseService';
import { auth } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';

export const PesananView = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [storeSettings, setStoreSettings] = useState<any>(null);
  
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const defaultTanggal = storeSettings?.openPoDates?.[0] || new Date().toLocaleDateString('id-ID');
  const defaultWaktu = storeSettings?.poTimes?.[0] || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const [orderForm, setOrderForm] = useState({
    customerName: '',
    itemsData: [{ name: '', quantity: 1, price: 0 }],
    items: '', // fallback or for string representation
    totalHarga: 0,
    paymentMethod: 'Transfer',
    tanggal_po: defaultTanggal,
    waktu_po: defaultWaktu,
  });

  // Re-init when settings load
  useEffect(() => {
    if (storeSettings && !isAddingOrder && !editingOrderId) {
      setOrderForm(prev => ({
        ...prev,
        tanggal_po: storeSettings.openPoDates?.[0] || prev.tanggal_po,
        waktu_po: storeSettings.poTimes?.[0] || prev.waktu_po,
      }));
    }
  }, [storeSettings, isAddingOrder, editingOrderId]);

  useEffect(() => {
    const unsubOrders = firebaseService.subscribe('pesanan', (data) => {
      // Sort by date desc
      const sorted = [...data].sort((a: any, b: any) => {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      setOrders(sorted);
    });

    const unsubSettings = firebaseService.subscribe('pengaturan', (docs) => {
      const settings = docs.find((d: any) => d.id === 'pengaturan_toko');
      if (settings) setStoreSettings(settings);
    });

    return () => {
      unsubOrders();
      unsubSettings();
    };
  }, []);

  const updateOrderStatus = async (id: string, currentStatus: string) => {
    const statuses = ['Baru', 'Diproses', 'Dikirim', 'Selesai'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    await firebaseService.update('pesanan', id, { status: nextStatus, updatedAt: new Date().toISOString() });
  };

  const generateSnippet = () => {
    const uid = auth.currentUser?.uid || 'USER_ID_ANDA';
    return `<script>
// Fungsi untuk mengecek apakah toko sedang buka atau tutup
async function cekBukaToko() {
  try {
    const res = await fetch('https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/pengaturan/pengaturan_toko');
    if (res.ok) {
      const data = await res.json();
      const fields = data.fields;
      if (fields) {
        const isBuka = fields.menerimaPesanan?.booleanValue !== false; // default true
        const openTime = fields.openTime?.stringValue || "00:00";
        const closeTime = fields.closeTime?.stringValue || "23:59";
        
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
        
        let isOpenHour = false;
        if (openTime <= closeTime) {
          isOpenHour = currentTime >= openTime && currentTime <= closeTime;
        } else {
          isOpenHour = currentTime >= openTime || currentTime <= closeTime;
        }
        
        if (!isBuka || !isOpenHour) {
          alert("Mohon maaf, pemesanan online saat ini sedang tutup.\\n" + 
               (!isBuka ? "Toko sedang tidak menerima pesanan." : ("Jam operasional: " + openTime + " - " + closeTime)));
          return false;
        }
        return true;
      }
    }
  } catch (e) {
    console.error("Gagal cek status toko:", e);
  }
  return true; // Jika gagal cek, default biarkan lewat
}

// Panggil fungsi ini untuk memuat menu (harga dan foto) langsung dari Dashboard
async function loadKatalogMenu() {
  try {
    const res = await fetch('https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/pengaturan/pengaturan_toko');
    if (res.ok) {
      const data = await res.json();
      const fields = data.fields;
      if (fields) {
        // --- 1. SETTINGS TEKS DAN KONTAK ---
        const heroText = fields.heroText?.stringValue || '';
        const waNumber = fields.whatsappNumber?.stringValue || '';
        const igLink = fields.instagramLink?.stringValue || '';
        const bestSellerImg = fields.bestSellerImage?.stringValue || '';

        const elHero = document.getElementById('hero_text');
        if (elHero && heroText) elHero.innerText = heroText;

        const elBestSeller = document.getElementById('best_seller_image');
        if (elBestSeller && bestSellerImg) elBestSeller.src = bestSellerImg;

        // Kritik dan Saran / Header WA Target
        const btnWA = document.getElementById('btn_wa_kritik_saran');
        if (btnWA && waNumber) {
           btnWA.href = 'https://wa.me/62' + waNumber;
        }

        // Footer IG Target
        const btnIG = document.getElementById('btn_ig_footer');
        if (btnIG && igLink) {
           btnIG.href = 'https://instagram.com/' + igLink;
        }

        // Footer WA Target
        const btnWAFooter = document.getElementById('btn_wa_footer');
        if (btnWAFooter && waNumber) {
           btnWAFooter.href = 'https://wa.me/62' + waNumber;
        }

        // --- 2. KATALOG MENU ---
        if (fields.products && fields.products.arrayValue.values) {
          const products = fields.products.arrayValue.values.map(val => {
          let name = '';
          let image = '';
          let options = [];
          if (val.mapValue && val.mapValue.fields) {
            name = val.mapValue.fields.name?.stringValue || '';
            image = val.mapValue.fields.image?.stringValue || '';
            if (val.mapValue.fields.options && val.mapValue.fields.options.arrayValue.values) {
               options = val.mapValue.fields.options.arrayValue.values.map(opt => ({
                 name: opt.mapValue?.fields?.name?.stringValue || '',
                 image: opt.mapValue?.fields?.image?.stringValue || '',
                 price: parseInt(opt.mapValue?.fields?.price?.integerValue || 0)
               }));
            }
          } else {
            name = val.stringValue || '';
          }
          return { name, image, options };
        });
        
        console.log("Data Katalog Menu:", products);
        // => [ 
        //   { name: 'Cilok', image: '...', options: [ { name: 'Kuah Pedas', image: '...', price: 10000 } ] }
        // ]
        // 
        // GUNAKAN DATA INI UNTUK MENG-UPDATE TAMPILAN PRODUK DI WEB ANDA!
        // Misalnya: document.getElementById('harga_cilok_pedas').innerText = products[0].options[0].price;
        // Dan: document.getElementById('foto_cilok_pedas').src = products[0].options[0].image;
        }
      }
    }
  } catch(e) {
    console.error("Gagal memuat katalog", e);
  }
}

// Panggil fungsi ini untuk memuat data ulasan pelanggan dari Dashboard
async function loadReviews() {
  try {
    const res = await fetch('https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/pengaturan/pengaturan_toko');
    if (res.ok) {
      const data = await res.json();
      const fields = data.fields;
      if (fields && fields.reviews && fields.reviews.arrayValue.values) {
        const reviews = fields.reviews.arrayValue.values.map(val => {
           return {
             name: val.mapValue?.fields?.name?.stringValue || '',
             text: val.mapValue?.fields?.text?.stringValue || '',
             image: val.mapValue?.fields?.image?.stringValue || ''
           };
        });
        console.log("Data Ulasan:", reviews);
        
        // Auto-update HTML jika ada elemen dengan id "ulasan_container" di web pemesanan Anda
        const container = document.getElementById('ulasan_container');
        if (container) {
           container.innerHTML = '';
           reviews.forEach(rev => {
              container.innerHTML += \`
                <div style="border:1px solid #e2e8f0; padding: 16px; margin-bottom: 12px; border-radius: 12px; background: #fff;">
                  \${rev.image ? \`<img src="\${rev.image}" style="width:48px; height:48px; border-radius:50%; object-fit:cover; float:left; margin-right:12px;">\` : ''}
                  <strong style="display:block; font-size: 14px; margin-bottom: 4px;">\${rev.name}</strong>
                  <p style="margin: 0; font-size: 13px; color: #64748b;">"\${rev.text}"</p>
                  <div style="clear:both;"></div>
                </div>
              \`;
           });
        }
      }
    }
  } catch(e) {
    console.error("Gagal memuat ulasan", e);
  }
}

// Panggil fungsi ini saat user ingin menambahkan menu ke keranjang (Bisa dicegah di awal)
async function tambahKeTasBelanja(item) {
   const sedangBuka = await cekBukaToko();
   if (!sedangBuka) return; // Hentikan jika tutup
   
   // LOGIKA TAMBAH KE KERANJANG ANDA DI SINI
   console.log(item + " ditambahkan ke keranjang");
}

// Fungsi untuk mengecek apakah stok jam tertentu masih tersedia
async function cekBatasPcs(hariPilihan, jamPilihan, jumlahPcsDipesan) {
  try {
    // 1. Ambil pengaturan limits
    let times = [];
    let limits = [];
    
    const resToko = await fetch('https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/pengaturan/pengaturan_toko');
    if (resToko.ok) {
        const tokoData = await resToko.json();
        const fields = tokoData.fields;
        
        if (fields) {
            if (fields.poDatesConfig && fields.poDatesConfig.mapValue && fields.poDatesConfig.mapValue.fields && fields.poDatesConfig.mapValue.fields[hariPilihan]) {
                const dateConfig = fields.poDatesConfig.mapValue.fields[hariPilihan].mapValue.fields;
                if (dateConfig && dateConfig.times && dateConfig.limits) {
                    times = dateConfig.times.arrayValue.values.map(v => v.stringValue);
                    limits = dateConfig.limits.arrayValue.values.map(v => parseInt(v.integerValue || v.doubleValue || v.stringValue || 0));
                }
            } else if (fields.poTimes && fields.poLimits) { // Fallback
                times = fields.poTimes.arrayValue.values.map(v => v.stringValue);
                limits = fields.poLimits.arrayValue.values.map(v => parseInt(v.integerValue || v.doubleValue || v.stringValue || 0));
            }
        }
    }
    
    if (times.length === 0 || limits.length === 0) return true;
    
    const idx = times.indexOf(jamPilihan);
    if (idx === -1 || limits[idx] === 0) return true; // Tidak ada batas
    const batasMaksimals = limits[idx];
    
    // 2. Hitung jumlah pcs dari pesanan yang sudah ada berdasarkan logika "rekapitulasi harian"
    const resPesanan = await fetch('https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/pesanan?pageSize=1000');
    if (!resPesanan.ok) return true;
    const pesananData = await resPesanan.json();
    
    let totalPcsSudahDipesan = 0;
    if (pesananData.documents) {
       for (const doc of pesananData.documents) {
          const docFields = doc.fields;
          if (!docFields || docFields.status?.stringValue === 'Dibatalkan') continue;
          
          if (docFields.tanggal_po?.stringValue === hariPilihan && docFields.waktu_po?.stringValue === jamPilihan) {
             // LOGIKA REKAPITULASI UNTUK MENGHITUNG TOTAL PCS
             let orderQty = 0;
             if (docFields.items) {
               if (docFields.items.arrayValue && docFields.items.arrayValue.values) {
                 docFields.items.arrayValue.values.forEach(it => {
                    const obj = it.mapValue?.fields;
                    if (obj) orderQty += parseInt(obj.quantity?.integerValue || obj.quantity?.stringValue || obj.jumlah?.integerValue || obj.jumlah?.stringValue || 1);
                 });
               } else if (docFields.items.stringValue) {
                 const parts = docFields.items.stringValue.split(/[\\n,;+]+/);
                 parts.forEach(part => {
                    if (!part.trim()) return;
                    let qty = 1;
                    const matchEnd = part.match(/^(.*?)\\s*\\(?(?:x\\s*(\\d+)|(\\d+)\\s*x)\\)?$/i);
                    if (matchEnd) {
                       qty = parseInt(matchEnd[2] || matchEnd[3]);
                    } else {
                       const matchStart = part.match(/^\\(?(?:x\\s*(\\d+)|(\\d+)\\s*x)\\)?\\s*(.*)$/i);
                       if (matchStart) {
                          qty = parseInt(matchStart[1] || matchStart[2]);
                       }
                    }
                    orderQty += qty;
                 });
               }
             }
             if (orderQty === 0 && docFields.totalPcs) {
                orderQty = parseInt(docFields.totalPcs.integerValue || docFields.totalPcs.stringValue || 1);
             }
             if (orderQty === 0) orderQty = 1;
             totalPcsSudahDipesan += orderQty;
          }
       }
    }
    
    if (totalPcsSudahDipesan + jumlahPcsDipesan > batasMaksimals) {
       alert("Maaf, waktu tersebut sudah penuh. Sisa slot: " + Math.max(0, batasMaksimals - totalPcsSudahDipesan) + " pcs. Mohon pilih waktu lain yang tersedia.");
       return false;
    }
    return true;
  } catch (e) {
    console.error("Gagal cek batas pcs:", e);
    return true;
  }
}

// Panggil fungsi ini saat tombol 'Beli Sekarang' atau 'Checkout' di-klik di web Anda
async function kirimPesanan() {
  // 1. Cek status toko (Buka/Tutup) di saat-saat terakhir
  const sedangBuka = await cekBukaToko();
  if (!sedangBuka) return;

  // 2. Ambil nilai dari input/form di web Anda (Sesuaikan ID-nya)
  const nama = document.getElementById('input_nama').value;
  const hari = document.getElementById('select_hari').value;
  const jam = document.getElementById('select_jam').value;
  const metode = document.getElementById('select_metode').value;

  // 3. Data barang & total (Disesuaikan dengan keranjang web Anda)
  const itemBeli = "Cilok (2x), Tahu (1x)"; // Contoh
  const totalHarga = "15000";
  const jumlahPcsDipesan = 3; // Contoh: 2 cilok + 1 tahu = 3 pcs
  
  // 4. Cek batas Pcs!
  const bisaPesan = await cekBatasPcs(hari, jam, jumlahPcsDipesan);
  if (!bisaPesan) return;

  // 5. Sistem mengirim langsung ke Dashboard Admin ini
  fetch('https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/pesanan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        ownerId: { stringValue: "${uid}" },
        status: { stringValue: "Baru" },
        createdAt: { stringValue: new Date().toISOString() },
        customerName: { stringValue: nama },
        tanggal_po: { stringValue: hari },
        waktu_po: { stringValue: jam },
        paymentMethod: { stringValue: metode },
        items: { stringValue: itemBeli },
        totalHarga: { integerValue: totalHarga },
        totalPcs: { integerValue: jumlahPcsDipesan.toString() }
      }
    })
  })
  .then(response => {
    if(response.ok) {
       alert("Pesanan otomatis terhubung ke Dashboard!");
    } else {
       alert("Gagal mengirim pesanan.");
    }
  });
}
</script>`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getProductPrice = (itemName: string) => {
    if (!storeSettings || !storeSettings.products) return 0;
    
    for (const prod of storeSettings.products) {
      if (typeof prod === 'string') continue;
      
      if (prod.options && prod.options.length > 0) {
        for (const opt of prod.options) {
          if (`${prod.name} - ${opt.name}` === itemName) {
            return Number(opt.price) || 0;
          }
        }
      } else {
         if (prod.name === itemName) {
            return Number(prod.price) || 0;
         }
      }
    }
    return 0;
  };

  const handleSaveOrder = async () => {
    if (!orderForm.customerName) return;
    const itemsToSave = orderForm.itemsData.filter(i => i.name.trim() !== '');
    if (itemsToSave.length === 0) return;
    
    // Auto-calculate total Pcs for limits
    const totalPcs = itemsToSave.reduce((acc, curr) => acc + curr.quantity, 0);

    // Cek batas pcs di waktu tersebut
    if (storeSettings) {
       const rawTanggal = orderForm.tanggal_po; // This could be raw like "2026-05-14" or Localized
       // we should find the exact date match
       let matchingDateStr = rawTanggal;
       
       const times = storeSettings.poDatesConfig?.[matchingDateStr]?.times || storeSettings.poTimes;
       const limits = storeSettings.poDatesConfig?.[matchingDateStr]?.limits || storeSettings.poLimits;
       
       if (times && limits) {
           const idx = times.indexOf(orderForm.waktu_po);
           if (idx !== -1 && limits[idx] > 0) {
              const limit = limits[idx];
              // count how many pcs are ordered for this tanggal_po and waktu_po
              let totalPcsSudahDipesan = 0;
              let currentOrderPcs = 0;
              orders.forEach(o => {
                 if (o.status !== 'Dibatalkan' && 
                     o.tanggal_po === orderForm.tanggal_po && 
                     o.waktu_po === orderForm.waktu_po) {
                     if (editingOrderId && o.id === editingOrderId) {
                        currentOrderPcs = Number(o.totalPcs || 0); // Don't count the current state of order being edited
                     } else {
                        totalPcsSudahDipesan += Number(o.totalPcs || o.total_pcs || 1);
                     }
                 }
              });
              if (totalPcsSudahDipesan + totalPcs > limit) {
                 alert(`Maaf, batas pcs maksimal untuk ${orderForm.waktu_po} adalah ${limit} pcs.\nSisa slot yang tersedia: ${Math.max(0, limit - totalPcsSudahDipesan)} pcs`);
                 return;
              }
           }
       }
    }

    const dataToSave = {
      ...orderForm,
      items: itemsToSave,
      totalPcs: totalPcs
    };
    // @ts-ignore
    delete dataToSave.itemsData;
    
    try {
      if (editingOrderId) {
        await firebaseService.update('pesanan', editingOrderId, dataToSave);
      } else {
        await firebaseService.create('pesanan', {
          ...dataToSave,
          status: 'Selesai',
        });
      }
      setIsAddingOrder(false);
      setEditingOrderId(null);
      setOrderForm({
        customerName: '',
        items: '',
        itemsData: [{ name: '', quantity: 1, price: 0 }],
        totalHarga: 0,
        paymentMethod: 'Transfer',
        tanggal_po: new Date().toLocaleDateString('id-ID'),
        waktu_po: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (e) {
      console.error("Gagal menyimpan:", e);
      alert("Gagal menyimpan pesanan.");
    }
  };

  const handleEditClick = (order: any) => {
    setEditingOrderId(order.id);
    setOrderForm({
      customerName: order.customerName || order.name || order.nama_pelanggan || '',
      items: order.items || '',
      itemsData: Array.isArray(order.items) ? order.items.map((it: any) => ({ name: it.name || it.nama || '', quantity: parseInt(it.quantity || it.jumlah || 1), price: it.price || 0 })) : [{ name: order.items || '', quantity: 1, price: 0 }],
      totalHarga: order.totalHarga || order.total || 0,
      paymentMethod: order.paymentMethod || order.payment || 'Transfer',
      tanggal_po: order.tanggal_po || order.date || order.tanggal || '',
      waktu_po: order.waktu_po || order.time || order.jam || '',
    });
    setIsAddingOrder(true);
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirmDeleteId === id) {
      try {
        await firebaseService.delete('pesanan', id);
        setConfirmDeleteId(null);
      } catch (error) {
        console.error('Failed to delete order:', error);
        alert('Gagal menghapus pesanan');
      }
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(cur => cur === id ? null : cur), 3000);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.id && order.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.name && order.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.items && typeof order.items === 'string' && order.items.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesFilter = filterStatus === 'Semua' || order.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStats = () => {
    const today = new Date().toLocaleDateString('id-ID');
    const baru = orders.filter(o => o.status === 'Baru');
    const diproses = orders.filter(o => o.status === 'Diproses');
    const dikirim = orders.filter(o => o.status === 'Dikirim');
    const selesai = orders.filter(o => o.status === 'Selesai');
    
    const baruToday = baru.filter(o => o.tanggal_po === today || (o.createdAt && new Date(o.createdAt).toLocaleDateString('id-ID') === today)).length;
    
    return [
      { label: 'Pesanan Baru', value: baru.length.toString(), sub: `+${baruToday} hari ini`, icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
      { label: 'Diproses', value: diproses.length.toString(), sub: 'Sedang disiapkan', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
      { label: 'Sedang Dikirim', value: dikirim.length.toString(), sub: 'Dalam perjalanan', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
      { label: 'Selesai', value: selesai.length.toString(), sub: 'Berhasil diantar', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    ];
  };

  const availableDates = Array.from(new Set(orders.map(o => o.tanggal_po || o.date || o.tanggal || (o.createdAt ? new Date(o.createdAt).toLocaleDateString('id-ID') : '-')))).filter(d => d !== '-').sort().reverse();
  const activeRekapDate = selectedDate || availableDates[0] || new Date().toLocaleDateString('id-ID');

  const getRekapForDate = (date: string) => {
     const ordersForDate = orders.filter(o => {
        const d = o.tanggal_po || o.date || o.tanggal || (o.createdAt ? new Date(o.createdAt).toLocaleDateString('id-ID') : '-');
        return d === date && o.status !== 'Dibatalkan';
     });

     const groupedByTime: Record<string, Record<string, number>> = {};

     ordersForDate.forEach(order => {
        const waktu_po = order.waktu_po || order.time || order.jam || 'Tanpa Keterangan Waktu';
        if (!groupedByTime[waktu_po]) groupedByTime[waktu_po] = {};

        if (Array.isArray(order.items)) {
           order.items.forEach((it: any) => {
              const name = it.name || it.nama;
              const qty = parseInt(it.quantity || it.jumlah || 1);
              if (name) {
                 groupedByTime[waktu_po][name] = (groupedByTime[waktu_po][name] || 0) + qty;
              }
           });
        } else if (typeof order.items === 'string') {
           const parts = order.items.split(/[\n,;+]+/);
           parts.forEach(part => {
              if (!part.trim()) return;
              let qty = 1;
              let name = part.trim();
              
              const matchEnd = name.match(/^(.*?)\s*\(?(?:x\s*(\d+)|(\d+)\s*x)\)?$/i);
              if (matchEnd) {
                 name = matchEnd[1].trim();
                 qty = parseInt(matchEnd[2] || matchEnd[3]);
              } else {
                 const matchStart = name.match(/^\(?(?:x\s*(\d+)|(\d+)\s*x)\)?\s*(.*)$/i);
                 if (matchStart) {
                    qty = parseInt(matchStart[1] || matchStart[2]);
                    name = matchStart[3].trim();
                 }
              }
              name = name.replace(/^[-:\s]+|[-:\s]+$/g, '');
              if (name) {
                 groupedByTime[waktu_po][name] = (groupedByTime[waktu_po][name] || 0) + qty;
              }
           });
        }
     });

     // Sort times and then sort items within each time
     const result: { waktu: string; items: [string, number][] }[] = [];
     Object.keys(groupedByTime).sort().forEach(waktu => {
         const items = Object.entries(groupedByTime[waktu]).sort((a, b) => b[1] - a[1]);
         result.push({ waktu, items });
     });

     return result;
  };
  const rekapItemsGrouped = getRekapForDate(activeRekapDate);

  return (
    <div className="space-y-8 relative pb-12">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen -z-10"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 md:p-8 bg-white/60 backdrop-blur-3xl border border-white/60 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/40 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-amber-100">
            <ShoppingCart className="w-3 h-3" /> Manajemen Order
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Pesanan <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-500">Pelanggan</span> 📦</h1>
          <p className="text-slate-500 font-medium leading-relaxed max-w-md">Pantau semua pesanan masuk, proses pengiriman, dan riwayat transaksi dengan mudah.</p>
        </div>
        <div className="flex gap-3 relative z-10 w-full md:w-auto">
          <button 
            onClick={() => setShowIntegrationModal(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white text-indigo-600 border border-indigo-100 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-xl shadow-slate-200/50"
          >
            <Code className="w-4 h-4" /> INTEGRASI WEB
          </button>
          <button 
            onClick={() => setIsAddingOrder(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
          >
            <Plus className="w-4 h-4" /> PESANAN BARU
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStats().map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all"
          >
            <div className={cn("p-3 w-fit rounded-2xl mb-4 border", stat.bg, stat.color, stat.border)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-800">{stat.value}</h3>
            <p className="text-xs font-bold mt-2 text-slate-500">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-800 mb-1">Rekapitulasi Harian</h2>
            <p className="text-sm font-medium text-slate-500">Total pesanan menu per tanggal pengiriman/PO diklasifikasikan berdasar sesi waktu.</p>
          </div>
          <div>
            <select 
              value={activeRekapDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none min-w-[200px]"
            >
               {availableDates.length > 0 ? availableDates.map(date => (
                  <option key={date} value={date}>{date}</option>
               )) : (
                  <option value={new Date().toLocaleDateString('id-ID')}>{new Date().toLocaleDateString('id-ID')}</option>
               )}
            </select>
          </div>
        </div>
        
        {rekapItemsGrouped.length > 0 ? (
          <div className="space-y-6">
            {rekapItemsGrouped.map((group, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest border-b border-slate-100 pb-2">{group.waktu}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {group.items.map(([namaMenu, qty], i) => (
                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-slate-700 line-clamp-2 leading-snug">{namaMenu}</span>
                      <span className="text-lg font-black text-indigo-600 bg-white shadow-sm border border-indigo-50 px-3 py-1 rounded-xl shrink-0">{qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <p className="text-sm font-bold text-slate-400">Belum ada pesanan pada tanggal ini.</p>
          </div>
        )}
      </div>

      <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-xl font-black text-slate-800">Daftar Pesanan</h2>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari Pesanan..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none min-w-[120px]"
            >
              <option value="Semua">Semua Status</option>
              <option value="Baru">Baru</option>
              <option value="Diproses">Diproses</option>
              <option value="Dikirim">Dikirim</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>

        <div className="hidden sm:block overflow-x-auto custom-scrollbar pb-4">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Pesanan</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pelanggan</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pesanan</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total & Pembayaran</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-sm font-medium">
                    Tidak ada pesanan yang sesuai.
                  </td>
                </tr>
              ) : filteredOrders.map((order, i) => {
                const getStatusColor = (status: string) => {
                  switch(status) {
                    case 'Baru': return 'bg-indigo-100 text-indigo-700';
                    case 'Diproses': return 'bg-amber-100 text-amber-700';
                    case 'Dikirim': return 'bg-blue-100 text-blue-700';
                    case 'Selesai': return 'bg-emerald-100 text-emerald-700';
                    default: return 'bg-slate-100 text-slate-700';
                  }
                };

                return (
                  <tr key={order.id || i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-4">
                      <span className="text-xs font-black text-slate-800">#{order.id?.slice(-5).toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold text-slate-700">{order.customerName || order.name || order['nama pelanggan'] || order.nama_pelanggan || order.namaPelanggan || 'Tanpa Nama'}</span>
                    </td>
                    <td className="px-4 py-4 max-w-[200px]">
                      <span className="text-xs font-medium text-slate-600 line-clamp-2">
                        {Array.isArray(order.items) 
                          ? order.items.map((it: any) => `${it.name || it.nama}${it.topping ? ` + ${it.topping}` : ''} (${it.quantity || it.jumlah || 1}x)`).join(', ') 
                          : typeof order.items === 'string' ? order.items 
                          : order.itemString ? order.itemString 
                          : order.itemsStr ? order.itemsStr
                          : order['barang-barang'] ? order['barang-barang'] : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800 text-nowrap">{order.tanggal_po || order.date || order.tanggal || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID') : '-')}</span>
                        <span className="text-[10px] font-medium text-slate-500">{order.waktu_po || order.time || order.jam || (order.createdAt ? new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                          {order.totalHarga ? `Rp ${order.totalHarga.toLocaleString('id-ID')}` 
                           : order['Harga total'] ? `Rp ${Number(order['Harga total']).toLocaleString('id-ID')}`
                           : order.total ? `Rp ${Number(order.total).toLocaleString('id-ID')}` : '-'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md bg-white whitespace-nowrap">
                          {order.paymentMethod || order.payment || order.metodePembayaran || order['metode pembayaran'] || order.metode_pembayaran || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer", getStatusColor(order.status || 'Baru'))} onClick={() => updateOrderStatus(order.id, order.status || 'Baru')}>
                        {order.status || 'Baru'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEditClick(order)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Pesanan">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteOrder(order.id)} 
                          className={cn(
                            "p-2 rounded-lg transition-colors flex items-center gap-1",
                            confirmDeleteId === order.id ? "bg-rose-500 text-white hover:bg-rose-600 px-3" : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          )}
                          title="Hapus Pesanan"
                        >
                          <Trash2 className="w-4 h-4" />
                          {confirmDeleteId === order.id && <span className="text-xs font-bold">Hapus?</span>}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="sm:hidden space-y-4">
          {filteredOrders.length === 0 ? (
            <p className="text-center text-slate-400 text-sm font-medium py-8">Tidak ada pesanan yang sesuai.</p>
          ) : filteredOrders.map((order, i) => {
             const getStatusColor = (status: string) => {
              switch(status) {
                case 'Baru': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
                case 'Diproses': return 'bg-amber-100 text-amber-700 border-amber-200';
                case 'Dikirim': return 'bg-blue-100 text-blue-700 border-blue-200';
                case 'Selesai': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
                default: return 'bg-slate-100 text-slate-700 border-slate-200';
              }
            };

            return (
              <div key={order.id || i} className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{order.id?.slice(-5).toUpperCase() || 'NEW'}</span>
                    <h3 className="font-bold text-slate-900">{order.customerName || order.name || order['nama pelanggan'] || order.nama_pelanggan || 'Tanpa Nama'}</h3>
                  </div>
                  <span 
                    onClick={() => updateOrderStatus(order.id, order.status || 'Baru')}
                    className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border", getStatusColor(order.status || 'Baru'))}
                  >
                    {order.status || 'Baru'}
                  </span>
                </div>
                
                <div className="py-3 border-y border-slate-50">
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    {Array.isArray(order.items) 
                      ? order.items.map((it: any) => `${it.name || it.nama}${it.topping ? ` + ${it.topping}` : ''} (${it.quantity || it.jumlah || 1}x)`).join(', ') 
                      : typeof order.items === 'string' ? order.items 
                      : order.itemString || order['barang-barang'] || '-'}
                  </p>
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waktu PO & Pembayaran</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <span>{order.tanggal_po || order.date || '-'}</span>
                      <span className="text-slate-300">•</span>
                      <span>{order.paymentMethod || order.payment || order.metode_pembayaran || '-'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-sm font-black text-indigo-600">
                      {order.totalHarga ? `Rp ${order.totalHarga.toLocaleString('id-ID')}` 
                       : order['Harga total'] ? `Rp ${Number(order['Harga total']).toLocaleString('id-ID')}`
                       : order.total ? `Rp ${Number(order.total).toLocaleString('id-ID')}` : '-'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => handleEditClick(order)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Pesanan">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteOrder(order.id)} 
                      className={cn(
                        "p-2 rounded-lg transition-colors flex items-center gap-1",
                        confirmDeleteId === order.id ? "bg-rose-500 text-white hover:bg-rose-600 px-3" : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      )}
                      title="Hapus Pesanan"
                    >
                      <Trash2 className="w-4 h-4" />
                      {confirmDeleteId === order.id && <span className="text-xs font-bold">Hapus?</span>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {isAddingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddingOrder(false)} />
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-[2rem] p-6 lg:p-8 w-full max-w-md relative z-10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-800">Pesanan Baru</h2>
                <button onClick={() => setIsAddingOrder(false)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Nama Pelanggan</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300" placeholder="Nama..." value={orderForm.customerName} onChange={e => setOrderForm({...orderForm, customerName: e.target.value})} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-500">Item Pesanan</label>
                    <button 
                      onClick={() => setOrderForm({...orderForm, itemsData: [...orderForm.itemsData, {name: '', quantity: 1, price: 0}]})}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      + Tambah Item
                    </button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                    {orderForm.itemsData.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <select
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-indigo-500"
                          value={item.name}
                          onChange={e => {
                            const newItems = [...orderForm.itemsData];
                            newItems[idx].name = e.target.value;
                            newItems[idx].price = getProductPrice(e.target.value);
                            const newTotal = newItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
                            setOrderForm({...orderForm, itemsData: newItems, totalHarga: newTotal});
                          }}
                        >
                          <option value="">Pilih Menu...</option>
                          {storeSettings?.products?.map((prod: any, i: number) => {
                            if (typeof prod === 'string') return <option key={i} value={prod}>{prod}</option>;
                            if (prod?.options?.length > 0) {
                              return (
                                <optgroup key={i} label={prod.name}>
                                  {prod.options.map((opt: any, j: number) => (
                                    <option key={j} value={`${prod.name} - ${opt.name}`}>{prod.name} - {opt.name}</option>
                                  ))}
                                </optgroup>
                              );
                            }
                            return <option key={i} value={prod.name}>{prod.name}</option>;
                          })}
                        </select>
                        <input 
                          type="number" min="1" 
                          className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-indigo-500"
                          value={item.quantity || ''}
                          onChange={e => {
                            const newItems = [...orderForm.itemsData];
                            newItems[idx].quantity = parseInt(e.target.value) || 1;
                            const newTotal = newItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
                            setOrderForm({...orderForm, itemsData: newItems, totalHarga: newTotal});
                          }}
                        />
                        <button 
                          onClick={() => {
                            const newItems = orderForm.itemsData.filter((_, i) => i !== idx);
                            setOrderForm({...orderForm, itemsData: newItems.length > 0 ? newItems : [{name: '', quantity: 1, price: 0}]});
                          }}
                          className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Tanggal PO</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      value={orderForm.tanggal_po}
                      onChange={e => setOrderForm({...orderForm, tanggal_po: e.target.value})}
                    >
                      {storeSettings?.openPoDates?.length > 0 
                        ? storeSettings.openPoDates.map((d: any, i: number) => <option key={i} value={d}>{d}</option>)
                        : <option value={new Date().toLocaleDateString('id-ID')}>{new Date().toLocaleDateString('id-ID')}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Waktu / Sesi</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      value={orderForm.waktu_po}
                      onChange={e => setOrderForm({...orderForm, waktu_po: e.target.value})}
                    >
                      {(() => {
                        const times = storeSettings?.poDatesConfig?.[orderForm.tanggal_po]?.times || storeSettings?.poTimes || [];
                        return times.length > 0 
                          ? times.map((t: any, i: number) => <option key={i} value={t}>{t}</option>)
                          : <option value={new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</option>
                      })()}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Metode Bayar</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      value={orderForm.paymentMethod} 
                      onChange={e => setOrderForm({...orderForm, paymentMethod: e.target.value})}
                    >
                      <option value="Transfer">Transfer</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Total Harga (Rp)</label>
                    <input type="number" min="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300" placeholder="50000" value={orderForm.totalHarga || ''} onChange={e => setOrderForm({...orderForm, totalHarga: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
                
                <div className="pt-2">
                  <button onClick={handleSaveOrder} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-lg shadow-indigo-100 transition-all flex justify-center items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> {editingOrderId ? 'Simpan Perubahan' : 'Simpan Pesanan'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIntegrationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowIntegrationModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 pb-0 shrink-0">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Panduan Integrasi Website</h2>
                    <p className="text-slate-500 font-medium text-sm">Hubungkan otomatis tombol <strong className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded">Beli Sekarang</strong> di website Anda dengan dashboard ini.</p>
                  </div>
                  <button 
                    onClick={() => setShowIntegrationModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 md:p-8 pt-4 overflow-y-auto custom-scrollbar">
                <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
                  <div className="flex justify-between items-center px-4 py-3 bg-slate-800/80 border-b border-white/10">
                     <span className="text-slate-400 font-mono text-xs font-bold">Script Integrasi (JavaScript)</span>
                     <button 
                       onClick={copyToClipboard}
                       className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors", copied ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white")}
                     >
                       {copied ? <><Check className="w-3.5 h-3.5" /> TERSALIN</> : <><Copy className="w-3.5 h-3.5" /> SALIN KODE</>}
                     </button>
                  </div>
                  <div className="p-4 overflow-x-auto custom-scrollbar">
                    <pre className="text-xs font-mono text-teal-400">
                      <code>{generateSnippet()}</code>
                    </pre>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3 bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                   <h4 className="font-bold text-indigo-900 text-sm">Cara Pemasangan:</h4>
                   <ol className="text-sm font-medium text-indigo-700 space-y-2 list-decimal list-inside">
                     <li>Salin kode di atas.</li>
                     <li>Tempelkan kode di dalam tag <code className="bg-white/60 px-1 font-bold rounded">{'<head>'}</code> atau sebelum <code className="bg-white/60 px-1 font-bold rounded">{'</body>'}</code> di website Anda.</li>
                     <li>Sesuaikan <strong>ID dari Form & Input</strong> yang ada di website Anda dengan baris kode <i>document.getElementById(...)</i>.</li>
                     <li>Panggil fungsi <code className="bg-white/60 px-1 font-bold rounded">kirimPesanan()</code> pada tombol Beli, contoh: <br/><code className="text-xs bg-slate-800 text-teal-400 px-2 py-1 rounded inline-block mt-1">{'<button onclick="kirimPesanan()">Beli Sekarang</button>'}</code></li>
                   </ol>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
