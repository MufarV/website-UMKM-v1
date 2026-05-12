import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Instagram, 
  Facebook, 
  Twitter, 
  Layout, 
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

export const PemasaranView = () => {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!productName || !description) return;
    
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Buatkan caption ${platform} yang menarik (dalam Bahasa Indonesia) untuk produk berikut:
      Nama Produk: ${productName}
      Deskripsi: ${description}
      Berikan beberapa hashtag yang relevan juga. Tampilan harus mahasiswa-friendly (keren, santai tapi profesional).`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setGeneratedPost(response.text || 'Gagal menghasilkan konten. Coba lagi.');
    } catch (error) {
      console.error(error);
      setGeneratedPost('Terjadi kesalahan saat menghubungi AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-2 italic">Pemasaran & Brand</h1>
        <p className="text-sm text-slate-500 font-medium">Bantuan AI untuk narasi bisnis dan jangkauan pelanggan.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* AI Content Generator */}
        <div className="bg-white p-5 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-800">AI Content Wizard</h3>
          </div>

          <div className="space-y-5 lg:space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Produk / Promo</label>
              <input 
                type="text" 
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Contoh: Kopi Susu Senja"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:bg-white focus:border-indigo-600 outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Pesan Utama</label>
              <textarea 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Apa yang membuat produk ini spesial?"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:bg-white focus:border-indigo-600 outline-none transition-all resize-none text-sm leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Platform</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Instagram', icon: Instagram },
                  { name: 'TikTok', icon: Layout },
                  { name: 'Twitter', icon: Twitter },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setPlatform(item.name)}
                    className={cn(
                      "flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-2.5 rounded-xl border text-[10px] font-bold transition-all",
                      platform === item.name 
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                        : "bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
                    )}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span className="truncate">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !productName || !description}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 active:scale-[0.98]"
            >
              {isGenerating ? 'GENERATE...' : 'GENERATE KONTEN'}
              {!isGenerating && <Sparkles className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Result Area */}
        <div className="flex flex-col gap-6">
          <div className="flex-1 bg-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden min-h-[350px] shadow-2xl">
            <h3 className="text-base md:text-lg font-bold mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
              Hasil Analisis AI
            </h3>
            
            <div className="font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-indigo-500/30">
              {generatedPost || (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-10">
                  <Send className="w-12 h-12 mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">Silakan masukkan data produk</p>
                </div>
              )}
            </div>

            {generatedPost && (
              <div className="mt-8 flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10">
                <button className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-xs transition-all border border-white/10 active:scale-95">
                  Salin Teks
                </button>
                <button className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-400 rounded-xl font-bold text-xs transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                  Publish Sekarang
                </button>
              </div>
            )}
            
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[120px] pointer-events-none"></div>
          </div>

          <div className="bg-white p-5 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-sm md:text-base">Kampanye Terkini</h3>
              <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Kopi Senja Launch', status: 'Running', reach: '12.4k', growth: '+12%' },
                { name: 'Gajian Promo', status: 'Planned', reach: '-', growth: '0%' },
                { name: 'Flash Sale Jumat', status: 'Running', reach: '5.2k', growth: '+5%' },
              ].map((campaign, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100 group">
                  <div className="flex gap-3 items-center">
                    <div className="w-1.5 h-6 bg-indigo-100 group-hover:bg-indigo-600 rounded-full transition-colors"></div>
                    <div>
                      <p className="font-bold text-xs leading-none mb-1">{campaign.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{campaign.reach} Reach</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest",
                      campaign.status === 'Running' ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                    )}>
                      {campaign.status}
                    </span>
                    <p className="text-[10px] font-black text-emerald-600 mt-1">{campaign.growth}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
