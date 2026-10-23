import {readdir} from 'node:fs/promises';
import sharp from 'sharp';
const root='D:/Downloads/tmp/RIESCADE/arts/instagram/carousel';
const names=(await readdir(root)).filter(n=>n.endsWith('.png')).sort();
const layers=[];
for(const [i,name]of names.entries()){
 const path=root+'/'+name;const m=await sharp(path).metadata();
 console.log(JSON.stringify({number:i+1,name,width:m.width,height:m.height}));
 layers.push({input:await sharp(path).resize(480,270,{fit:'contain',background:'#111'}).toBuffer(),left:i%3*480,top:Math.floor(i/3)*300});
 layers.push({input:Buffer.from(`<svg width="480" height="30"><rect width="480" height="30" fill="#111"/><text x="12" y="22" fill="white" font-size="18">${i+1} — ${name.slice(-21)}</text></svg>`),left:i%3*480,top:Math.floor(i/3)*300+270});
}
await sharp({create:{width:1440,height:Math.ceil(names.length/3)*300,channels:3,background:'#111'}}).composite(layers).jpeg({quality:90}).toFile('docs/carousel-captures-review.jpg');
