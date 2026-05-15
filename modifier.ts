import fs from 'fs';
const file = 'src/components/ManajemenView.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/bg-white p-8 rounded-\[2\.5rem\] border border-slate-200 shadow-sm/g, "bg-white/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden");
fs.writeFileSync(file, content);
console.log('done');
