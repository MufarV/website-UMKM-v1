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
  Image as ImageIcon,
  Code,
  Copy,
  X,
  Check,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { firebaseService } from '../services/firebaseService';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import firebaseConfig from '../../firebase-applet-config.json';

export const DigitalView = () => {
  const [settings, setSettings] = useState<any>({
    products: ['Cilok Kuah Pedas', 'Cilok Saos Kacang', 'Cilok Saos Kecap'],
    openTime: '10:00',
    closeTime: '20:00',
    menerimaPesanan: true
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reviewInputRef = useRef<HTMLInputElement>(null);
  const bestSellerInputRef = useRef<HTMLInputElement>(null);
  const [editingImageKey, setEditingImageKey] = useState<{prodIdx: number, optIdx: number} | null>(null);
  const [editingReviewImageIdx, setEditingReviewImageIdx] = useState<number | null>(null);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateSnippet = () => {
    const uid = auth.currentUser?.uid;
    
    if (!uid) {
      return `<!-- PESAN: SILAKAN LOGIN KE DASHBOARD TERLEBIH DAHULU UNTUK MENDAPATKAN ID INTEGRASI ANDA -->`;
    }

    const snippet = `<script>
/**
 * SISTEM INTEGRASI OTOMATIS DASHBOARD PEMESANAN
 * Copy-paste kode ini ke website pemesanan Anda.
 */

// 1. Inisialisasi otomatis data saat halaman dimuat
window.addEventListener('DOMContentLoaded', () => {
    loadKatalogMenu();
    loadReviews();
    
    const selectHari = document.getElementById('select_hari');
    const selectJam = document.getElementById('select_jam');
    
    if (selectHari && selectJam) {
        const updateSlot = () => updateTampilanSlot(selectHari.value, selectJam.value);
        selectHari.addEventListener('change', updateSlot);
        selectJam.addEventListener('change', updateSlot);
        // initial call
        setTimeout(updateSlot, 500); // give time to populate options if needed
    }
});

// Fungsi untuk mengecek status buka/tutup toko
async function cekBukaToko() {
  try {
    const res = await fetch('https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/pengaturan/pengaturan_toko');
    if (res.ok) {
      const data = await res.json();
      const fields = data.fields;
      if (fields) {
        const isBuka = fields.menerimaPesanan?.booleanValue !== false;
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
  return true;
}

// Fungsi memuat menu & harga langsung dari Dashboard
async function loadKatalogMenu() {
  try {
    const res = await fetch('https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/pengaturan/pengaturan_toko');
    if (res.ok) {
      const data = await res.json();
      const fields = data.fields || {};
      
      // Update Text Hero & Kontak
      const heroText = fields.heroText?.stringValue || '';
      const waNumber = fields.whatsappNumber?.stringValue || '';
      const igLink = fields.instagramLink?.stringValue || '';
      const bestSellerImg = fields.bestSellerImage?.stringValue || '';

      const elHero = document.getElementById('hero_text');
      if (elHero && heroText) elHero.innerText = heroText;

      const elBestSeller = document.getElementById('best_seller_image');
      if (elBestSeller && bestSellerImg) elBestSeller.src = bestSellerImg;

      if (waNumber) {
        ['btn_wa_kritik_saran', 'btn_wa_footer'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.href = 'https://wa.me/62' + waNumber;
        });
      }

      const btnIG = document.getElementById('btn_ig_footer');
      if (btnIG && igLink) btnIG.href = 'https://instagram.com/' + igLink;

      // Update Produk (Jika element tersedia)
      if (fields.products && fields.products.arrayValue.values) {
        const products = fields.products.arrayValue.values.map(val => {
          const f = val.mapValue?.fields || {};
          return {
            name: f.name?.stringValue || '',
            image: f.image?.stringValue || '',
            options: (f.options?.arrayValue?.values || []).map(opt => ({
              name: opt.mapValue?.fields?.name?.stringValue || '',
              image: opt.mapValue?.fields?.image?.stringValue || '',
              price: parseInt(opt.mapValue?.fields?.price?.integerValue || 0)
            }))
          };
        });
        console.log("Katalog Terkoneksi:", products);
      }

      // Update Opsi Open PO Dates & Times
      window.__poDatesConfig = fields.poDatesConfig?.mapValue?.fields || {};
      const openPoDates = (fields.openPoDates?.arrayValue?.values || []).map(v => v.stringValue);
      
      const selectHari = document.getElementById('select_hari');
      if (selectHari && openPoDates.length > 0) {
        selectHari.innerHTML = '';
        openPoDates.forEach(dateStr => {
          const opt = document.createElement('option');
          opt.value = dateStr;
          // Format date for better readability if desired, or keep as YYYY-MM-DD
          const d = new Date(dateStr);
          opt.textContent = isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
          selectHari.appendChild(opt);
        });
        
        // Trigger population of times
        const selectJam = document.getElementById('select_jam');
        if (selectJam) {
            const populateTimes = () => {
                const selectedDate = selectHari.value;
                const poConfig = window.__poDatesConfig[selectedDate]?.mapValue?.fields;
                selectJam.innerHTML = '';
                if (poConfig && poConfig.times && poConfig.times.arrayValue.values) {
                    const timesArr = poConfig.times.arrayValue.values;
                    const limitsArr = poConfig.limits?.arrayValue?.values || [];
                    const bookedArr = (poConfig.booked?.arrayValue?.values || []);

                    timesArr.forEach((tOpt, idx) => {
                       if (tOpt.stringValue) {
                          const limitRaw = limitsArr[idx]?.mapValue?.fields || limitsArr[idx];
                          const limit = parseInt(limitRaw?.integerValue || limitRaw?.doubleValue || 0);
                          
                          const bookedRaw = bookedArr[idx]?.mapValue?.fields || bookedArr[idx];
                          const booked = parseInt(bookedRaw?.integerValue || bookedRaw?.doubleValue || 0);
                          
                          const sisa = limit > 0 ? Math.max(0, limit - booked) : -1;

                          const opt = document.createElement('option');
                          opt.value = tOpt.stringValue;
                          let text = tOpt.stringValue;
                          if (limit > 0) {
                              text += " (Sisa: " + sisa + " pcs)";
                          }
                          opt.textContent = text;
                          if (limit > 0 && sisa === 0) opt.disabled = true;
                          selectJam.appendChild(opt);
                       }
                    });
                } else {
                    // Fallback to default poTimes if per-date config not found
                    const fallbackTimes = (fields.poTimes?.arrayValue?.values || []).map(v => v.stringValue);
                    if (fallbackTimes.length > 0) {
                        fallbackTimes.forEach(t => {
                            const opt = document.createElement('option');
                            opt.value = t;
                            opt.textContent = t;
                            selectJam.appendChild(opt);
                        });
                    } else {
                       const opt = document.createElement('option');
                       opt.value = "Pagi";
                       opt.textContent = "Sesi Pagi";
                       selectJam.appendChild(opt);
                    }
                }
                // trigger slot update
                if(typeof updateTampilanSlot === 'function') {
                   updateTampilanSlot(selectHari.value, selectJam.value);
                }
            };
            
            selectHari.removeEventListener('change', populateTimes);
            selectHari.addEventListener('change', populateTimes);
            populateTimes(); // initial load
        }
      }
    }
  } catch(e) { console.error("Gagal sinkron menu:", e); }
}

// Memuat ulasan dari dashboard
async function loadReviews() {
  try {
    const res = await fetch('https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/pengaturan/pengaturan_toko');
    if (res.ok) {
      const data = await res.json();
      const reviews = data.fields?.reviews?.arrayValue?.values || [];
      const container = document.getElementById('ulasan_container');
      if (container && reviews.length > 0) {
          container.innerHTML = '';
          reviews.forEach(val => {
            const r = val.mapValue?.fields;
            container.innerHTML += \`
              <div style="border:1px solid #e2e8f0; padding: 16px; margin-bottom: 12px; border-radius: 12px; background: #fff;">
                \${r.image?.stringValue ? \`<img src="\${r.image.stringValue}" style="width:48px; height:48px; border-radius:50%; object-fit:cover; float:left; margin-right:12px;">\` : ''}
                <strong style="display:block; font-size: 14px; margin-bottom: 4px;">\${r.name?.stringValue}</strong>
                <p style="margin: 0; font-size: 13px; color: #64748b;">"\${r.text?.stringValue}"</p>
                <div style="clear:both;"></div>
              </div>
            \`;
          });
      }
    }
  } catch(e) { console.error("Gagal muat ulasan:", e); }
}

// Menampilkan sisa slot per sesi waktu
async function updateTampilanSlot(hari, jam) {
    const el = document.getElementById('info_slot');
    const selectPcs = document.getElementById('input_pcs');
    if (!el) return;
    el.innerText = "Mengecek slot...";
    
    try {
      const res = await fetch('https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/pengaturan/pengaturan_toko');
      if (res.ok) {
          const data = await res.json();
          const pConfig = data.fields?.poDatesConfig?.mapValue?.fields || {};
          let produksi = 0;
          let pesanan = 0;
          if (pConfig[hari]) {
              const conf = pConfig[hari].mapValue.fields;
              const idx = (conf.times?.arrayValue?.values || []).map(v => v.stringValue).indexOf(jam);
              if (idx !== -1) {
                  const limitRaw = conf.limits?.arrayValue?.values[idx]?.mapValue?.fields || conf.limits?.arrayValue?.values[idx];
                  produksi = parseInt(limitRaw?.integerValue || limitRaw?.doubleValue || 0);
                  
                  const bookedRaw = conf.booked?.arrayValue?.values[idx]?.mapValue?.fields || conf.booked?.arrayValue?.values[idx];
                  pesanan = parseInt(bookedRaw?.integerValue || bookedRaw?.doubleValue || 0);
              }
          }
          
          const sisaPcs = produksi > 0 ? Math.max(0, produksi - pesanan) : -1;

          if (produksi > 0) {
              el.innerText = "Sisa Slot: " + sisaPcs + " pcs";
              const elBatas = document.getElementById('batas');
              if (elBatas) elBatas.innerText = sisaPcs;
          } else {
              el.innerText = "Slot tersedia (Tanpa Batas)";
          }

          // Otomatis update dropdown jumlah pcs jika ada elementnya
          if (selectPcs) {
              const currentVal = selectPcs.value;
              selectPcs.innerHTML = '';
              if (sisaPcs === 0) {
                  const opt = document.createElement('option');
                  opt.value = "0";
                  opt.textContent = "Slot Penuh";
                  selectPcs.appendChild(opt);
              } else {
                  const maxRange = sisaPcs === -1 ? 50 : sisaPcs;
                  for (let i = 1; i <= maxRange; i++) {
                      const opt = document.createElement('option');
                      opt.value = i;
                      opt.textContent = i + " pcs";
                      selectPcs.appendChild(opt);
                  }
                  if (currentVal && parseInt(currentVal) <= maxRange) selectPcs.value = currentVal;
              }
          }
      }
    } catch(e) { el.innerText = "Gagal cek slot"; }
}

// FUNGSI UTAMA: MENGIRIM PESANAN KE DASHBOARD
async function kirimPesanan() {
  const sedangBuka = await cekBukaToko();
  if (!sedangBuka) return;

  // Sesuaikan ID elemen input di website Anda:
  const inputNama = document.getElementById('input_nama');
  const selectHari = document.getElementById('select_hari');
  const selectJam = document.getElementById('select_jam');
  const selectMetode = document.getElementById('select_metode');
  const selectPcs = document.getElementById('input_pcs');
  
  if (!inputNama || !selectHari || !selectJam) {
    alert("Terjadi kesalahan teknis: Element input tidak ditemukan.");
    return;
  }

  const pesananPcs = selectPcs ? parseInt(selectPcs.value) : 1; 

  // -- BACA DATA (SISA SLOT) UNTUK VERIFIKASI AKHIR --
  try {
      const res = await fetch('https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/pengaturan/pengaturan_toko');
      if (res.ok) {
          const data = await res.json();
          const pConfig = data.fields?.poDatesConfig?.mapValue?.fields || {};
          let produksi = 0;
          let pesanan = 0;
          let hari = selectHari.value;
          let jam = selectJam.value;
          
          if (pConfig[hari]) {
              const conf = pConfig[hari].mapValue.fields;
              const idx = (conf.times?.arrayValue?.values || []).map(v => v.stringValue).indexOf(jam);
              if (idx !== -1) {
                  const limitRaw = conf.limits?.arrayValue?.values[idx]?.mapValue?.fields || conf.limits?.arrayValue?.values[idx];
                  produksi = parseInt(limitRaw?.integerValue || limitRaw?.doubleValue || 0);
                  
                  const bookedRaw = conf.booked?.arrayValue?.values[idx]?.mapValue?.fields || conf.booked?.arrayValue?.values[idx];
                  pesanan = parseInt(bookedRaw?.integerValue || bookedRaw?.doubleValue || 0);
              }
          }
          
          if (produksi > 0) {
              const sisaBatas = Math.max(0, produksi - pesanan); 
              
              if (pesananPcs > sisaBatas) {
                  alert("Pemesanan Ditolak: Tersedia sisa " + sisaBatas + " pcs. Anda memesan " + pesananPcs + " pcs.");
                  return; 
              }
              if (pesananPcs <= 0) {
                  alert("Jumlah pesanan tidak valid.");
                  return;
              }
          }
      }
  } catch(e) { console.error("Gagal verifikasi slot:", e); }

  const dataPesanan = {
      fields: {
        ownerId: { stringValue: "${uid}" },
        status: { stringValue: "Baru" },
        createdAt: { stringValue: new Date().toISOString() },
        customerName: { stringValue: inputNama.value },
        tanggal_po: { stringValue: selectHari.value },
        waktu_po: { stringValue: selectJam.value },
        paymentMethod: { stringValue: selectMetode ? selectMetode.value : "Transfer" },
        items: { stringValue: "Pesanan dari Website" }, // Custom: Bisa diisi detail item dari keranjang Anda
        totalHarga: { integerValue: "0" }, // Custom: Isi dengan total harga dari keranjang
        totalPcs: { integerValue: String(pesananPcs) } // Custom: Isi dengan total pcs dari keranjang
      }
  };

  fetch('https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/pesanan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dataPesanan)
  })
  .then(response => {
    if(response.ok) {
       alert("Pesanan Anda telah diterima! Admin akan segera memproses.");
       // Reset form atau redirect ke halaman sukses
    } else {
       alert("Maaf, gagal mengirim pesanan. Silakan coba lagi.");
    }
  });
}
</script>`;
    return snippet;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    const unsubSettings = firebaseService.subscribe('pengaturan', (docs) => {
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

    const unsubOrders = firebaseService.subscribe('pesanan', (data) => {
      setOrders(data);
    });

    return () => {
      unsubSettings();
      unsubOrders();
    };
  }, []);

  useEffect(() => {
    if (!settings?.poDatesConfig || !orders) return;
    
    let updated = false;
    const newConfig = JSON.parse(JSON.stringify(settings.poDatesConfig));
    
    for (const dateStr of Object.keys(newConfig)) {
      const times = newConfig[dateStr].times || [];
      const currentBooked = newConfig[dateStr].booked || [];
      const computedBooked = times.map((t: string) => 0);
      
      orders.forEach((o: any) => {
        if (o.status !== 'Dibatalkan' && o.tanggal_po === dateStr) {
           const idx = times.indexOf(o.waktu_po);
           if (idx !== -1) {
             computedBooked[idx] += Number(o.totalPcs || o.total_pcs || 1);
           }
        }
      });
      
      if (JSON.stringify(currentBooked) !== JSON.stringify(computedBooked)) {
        newConfig[dateStr].booked = computedBooked;
        updated = true;
      }
    }
    
    if (updated) {
       // Auto-sync booked slots so anonymous users can read them
       firebaseService.set('pengaturan', 'pengaturan_toko', { ...settings, poDatesConfig: newConfig }).catch(console.error);
    }
  }, [orders, settings]);

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
            <button 
              onClick={() => setShowIntegrationModal(true)} 
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-600 border border-indigo-100 rounded-xl text-xs font-black shadow-lg shadow-slate-200/50 hover:bg-slate-50 transition-all"
            >
              <Code className="w-4 h-4" /> INTEGRASI WEB
            </button>
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

        <div className="flex flex-col gap-10 pt-8 border-t border-slate-100">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <ShoppingBag className="w-4 h-4 text-slate-300" /> Katalog Menu (Web Pemesanan)
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
                             {[0, 1, 2].map((idx) => {
                                const timeStr = dateConfig.times[idx];
                                const limit = dateConfig.limits?.[idx] || 0;
                                let pesananCount = 0;
                                if (timeStr) {
                                  orders.forEach(o => {
                                    if (o.status !== 'Dibatalkan' && o.tanggal_po === dateStr && o.waktu_po === timeStr) {
                                      pesananCount += Number(o.totalPcs || o.total_pcs || 1);
                                    }
                                  });
                                }
                                const sisaBatas = limit > 0 ? Math.max(0, limit - pesananCount) : 0;

                                return (
                                <div key={idx} className="flex flex-col xl:flex-row items-start xl:items-center gap-2">
                                  <input 
                                    type="text" 
                                    placeholder={`Opsi Jam ${idx + 1}`}
                                    className="w-full xl:flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-500"
                                    value={dateConfig.times[idx] || ''}
                                    onChange={(e) => {
                                      const newConfig = { ...(settings.poDatesConfig || {}) };
                                      if (!newConfig[dateStr]) newConfig[dateStr] = { times: [...dateConfig.times], limits: [...dateConfig.limits] };
                                      newConfig[dateStr].times[idx] = e.target.value;
                                      setSettings({ ...settings, poDatesConfig: newConfig });
                                    }}
                                  />
                                  <div className="flex flex-wrap sm:flex-nowrap items-center w-full xl:w-auto gap-2">
                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 group focus-within:border-indigo-500 transition-colors shrink-0 flex-1 sm:max-w-[140px]">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Produksi:</span>
                                      <input 
                                        type="number"
                                        placeholder="∞"
                                        className="w-full bg-transparent py-2.5 text-sm font-bold outline-none text-slate-700 placeholder:text-slate-300 min-w-[40px] max-w-[60px]"
                                        value={dateConfig.limits?.[idx] === 0 ? '' : dateConfig.limits?.[idx]}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const newConfig = { ...(settings.poDatesConfig || {}) };
                                          if (!newConfig[dateStr]) newConfig[dateStr] = { times: [...dateConfig.times], limits: [...dateConfig.limits] };
                                          newConfig[dateStr].limits[idx] = val === '' ? 0 : parseInt(val);
                                          setSettings({ ...settings, poDatesConfig: newConfig });
                                        }}
                                      />
                                      <span className="text-[10px] font-bold text-slate-400">pcs</span>
                                    </div>
                                    
                                    {timeStr && (
                                      <>
                                        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5 shrink-0 flex-1 sm:flex-none justify-between sm:justify-start">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Terjual:</span>
                                            <span className="text-sm font-bold text-indigo-700">{pesananCount}</span>
                                        </div>
                                        <div className={cn("flex items-center gap-2 border rounded-xl px-3 py-2.5 shrink-0 flex-1 sm:flex-none justify-between sm:justify-start",
                                          sisaBatas > 0 ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
                                        )}>
                                            <span className={cn("text-[10px] font-black uppercase tracking-widest leading-none",
                                              sisaBatas > 0 ? "text-emerald-500" : "text-rose-500"
                                            )}>Sisa:</span>
                                            <span className={cn("text-sm font-bold",
                                              sisaBatas > 0 ? "text-emerald-700" : "text-rose-700"
                                            )}>{dateConfig.limits?.[idx] > 0 ? sisaBatas : '∞'}</span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                              })}
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
              <Smartphone className="w-4 h-4 text-slate-300" /> Review Mahasiswi (Web Pemesanan)
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
              <Globe className="w-4 h-4 text-slate-300" /> Teks Promosi & Kontak (Web Pemesanan)
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

      {/* Integrasi Modal */}
      <AnimatePresence>
        {showIntegrationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIntegrationModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <Code className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">Integrasi Website</h3>
                    <p className="text-xs font-medium text-slate-400">Hubungkan dashboard dengan web pemesanan Anda</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowIntegrationModal(false)}
                  className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-4">
                  <Zap className="w-5 h-5 text-indigo-500 mt-1 flex-shrink-0" />
                  <p className="text-xs leading-relaxed text-indigo-700 font-medium">
                    Copy kode di bawah ini dan tempelkan di file <code className="bg-indigo-100 px-1.5 py-0.5 rounded font-bold">index.html</code> atau file utama aplikasi web pemesanan Anda tepat sebelum tag <code className="bg-indigo-100 px-1.5 py-0.5 rounded font-bold">&lt;/body&gt;</code>.
                  </p>
                </div>

                <div className="relative group">
                  <div className="absolute top-4 right-4 z-10">
                    <button 
                      onClick={copyToClipboard}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-lg",
                        copied ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-white text-indigo-600 hover:bg-slate-50 shadow-slate-200"
                      )}
                    >
                      {copied ? (
                        <><Check className="w-4 h-4" /> Tersalin!</>
                      ) : (
                        <><Copy className="w-4 h-4" /> Salin Kode</>
                      )}
                    </button>
                  </div>
                  <div className="w-full h-64 bg-slate-900 rounded-2xl p-6 overflow-y-auto scrollbar-hide border border-slate-800 shadow-inner">
                    <pre className="text-[10px] sm:text-xs font-mono text-indigo-300 whitespace-pre-wrap leading-relaxed">
                      {generateSnippet()}
                    </pre>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Monitor className="w-4 h-4 text-indigo-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinkronisasi</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                      Sisa slot, harga menu, dan jam operasional akan terupdate otomatis mengikuti dashboard ini.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                        <ShoppingBag className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Masuk</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                      Pesanan dari web akan langsung muncul di tab "Daftar Pesanan" dengan status "Baru".
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Lock className="w-4 h-4" />
                  <span className="text-[10px] font-bold">Koneksi Terenkripsi & Aman</span>
                </div>
                <button 
                   onClick={() => setShowIntegrationModal(false)}
                   className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-black shadow-lg shadow-slate-200 hover:bg-slate-700 transition-all"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
