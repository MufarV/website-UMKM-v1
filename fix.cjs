const fs = require('fs');
let code = fs.readFileSync('src/components/DigitalView.tsx', 'utf8');

const regex = /\{\[0, 1, 2\]\.map\(\(idx\) => \([\s\S]*?<span className="text-xs font-bold text-slate-400">pcs<\/span>\s*<\/div>\s*<\/div>\s*\)\)\}/;
const match = code.match(regex);
if (match) {
  const replacement = `{[0, 1, 2].map((idx) => {
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
                                const frontEnd = limit > 0 ? Math.max(0, limit - pesananCount) : 0;

                                return (
                                <div key={idx} className="flex flex-col xl:flex-row items-start xl:items-center gap-2">
                                  <input 
                                    type="text" 
                                    placeholder={\`Opsi Jam \${idx + 1}\`}
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
                                      <span className="text-xs font-bold text-slate-400">Batas:</span>
                                      <input 
                                        type="number"
                                        placeholder="∞"
                                        className="w-full bg-transparent py-2.5 text-sm font-bold outline-none text-slate-700 placeholder:text-slate-300 min-w-[50px] max-w-[80px]"
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
                                    
                                    {timeStr && dateConfig.limits?.[idx] > 0 && (
                                      <>
                                        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5 shrink-0 flex-1 sm:flex-none justify-between sm:justify-start">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Pesanan:</span>
                                            <span className="text-sm font-bold text-indigo-700">{pesananCount}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 shrink-0 flex-1 sm:flex-none justify-between sm:justify-start">
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Front-end:</span>
                                            <span className="text-sm font-bold text-emerald-700">{frontEnd}</span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                              })}`;

  code = code.replace(regex, replacement);
  fs.writeFileSync('src/components/DigitalView.tsx', code);
  console.log('regex replaced correctly');
} else {
  console.log('regex failed to match');
}
