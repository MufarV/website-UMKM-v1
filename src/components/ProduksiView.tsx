import React from 'react';
import { 
  Package, 
  Layers, 
  Activity, 
  Plus, 
  AlertTriangle,
  RefreshCw,
  Box,
  Truck
} from 'lucide-react';
import { motion } from 'motion/react';

export const ProduksiView = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Produksi & Stok</h1>
          <p className="text-slate-500">Kelola ketersediaan barang dan pantau progres produksi tepat waktu.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
          <Plus className="w-4 h-4" /> Input Stok Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Item Aktif', value: '142 SKU', icon: Box, color: 'bg-blue-50 text-blue-600' },
          { label: 'Dalam Produksi', value: '45 Batch', icon: Activity, color: 'bg-amber-50 text-amber-600' },
          { label: 'Siap Kirim', value: '89 Unit', icon: Truck, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Stok Kritis', value: '12 Item', icon: AlertTriangle, color: 'bg-rose-50 text-rose-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className={cn("p-2 w-fit rounded-xl mb-4", stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-xl font-bold">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Inventory Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold">Daftar Inventaris</h3>
            <button className="p-2 hover:bg-slate-50 rounded-lg transition-all">
              <RefreshCw className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nama Produk</th>
                  <th className="px-6 py-4">Stok</th>
                  <th className="px-6 py-4">Satuan</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {[
                  { name: 'Kopi Arabika (Roasted)', stock: 50, unit: 'kg', status: 'Aman' },
                  { name: 'Gula Aren Cair', stock: 12, unit: 'liter', status: 'Rendah' },
                  { name: 'Cup Plastik 12oz', stock: 1200, unit: 'pcs', status: 'Aman' },
                  { name: 'Susu UHT Full Cream', stock: 5, unit: 'karton', status: 'Kritis' },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-bold">{item.name}</td>
                    <td className="px-6 py-4 font-mono">{item.stock}</td>
                    <td className="px-6 py-4 text-slate-500">{item.unit}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide",
                        item.status === 'Aman' ? "bg-emerald-100 text-emerald-700" : 
                        item.status === 'Rendah' ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Production Pipeline */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200">
          <h3 className="font-bold mb-8">Pipa Produksi</h3>
          <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {[
              { step: 'Order Masuk', desc: '15 pesanan menunggu diproses', time: '10:00 AM', active: true },
              { step: 'Persiapan Bahan', desc: 'Bahan baku telah disiapkan dr gudang', time: '11:30 AM', active: true },
              { step: 'Proses Produksi', desc: 'Batch #42 sedang berlangsung', time: 'Sekarang', active: true, pulse: true },
              { step: 'Quality Control', desc: 'Menunggu pengecekan akhir', time: '-', active: false },
              { step: 'Packaging', desc: 'Persiapan pengiriman', time: '-', active: false },
            ].map((step, i) => (
              <div key={i} className={cn("relative pl-12 transition-all", step.active ? 'opacity-100' : 'opacity-40')}>
                <div className={cn(
                  "absolute left-0 top-0 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center z-10 shadow-sm",
                  step.active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                )}>
                   {step.pulse && <div className="absolute inset-0 bg-indigo-600 rounded-full animate-ping opacity-25"></div>}
                   <span className="text-xs font-bold">{i + 1}</span>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-slate-900">{step.step}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{step.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
