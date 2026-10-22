import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';
const root='D:/Downloads/tmp/RIESCADE/arts/instagram';
const source=join(root,'campanha-01');
const out=join(root,'reels','01_sua-infancia-tem-um-novo-play');
await mkdir(out,{recursive:true});
const campaign=JSON.parse(await readFile(join(source,'campaign.json'),'utf8'));
function ff(args){const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{encoding:'utf8',windowsHide:true});if(r.status!==0)throw new Error(r.stderr||'FFmpeg failed');}
const rate=44100,duration=20,count=rate*duration;
const pcm=Buffer.alloc(count*4);
const melody=[69,72,76,79,76,72,67,71,74,79,74,71,65,69,72,77];
const roots=[45,43,41,43];
for(let i=0;i<count;i++){
 const t=i/rate,step=Math.floor(t/.25),phase=t%.25;
 const note=melody[step%melody.length],hz=440*2**((note-69)/12);
 const env=Math.exp(-phase*15)*Math.min(1,phase/.008);
 const lead=(Math.sin(2*Math.PI*hz*t)+.2*Math.sin(6*Math.PI*hz*t))*env*.18;
 const bassHz=440*2**((roots[Math.floor(t/2)%4]-69)/12);
 const bass=Math.sin(2*Math.PI*bassHz*t)*Math.exp(-(t%.5)*8)*.18;
 const beat=t%.5,kick=Math.sin(2*Math.PI*(55*beat+6*(1-Math.exp(-beat*35))))*Math.exp(-beat*35)*.3;
 const hat=Math.sin(2*Math.PI*7300*t)*Math.sin(2*Math.PI*9100*t)*Math.exp(-(t%.25)*100)*.035;
 const fade=Math.min(1,t/.25,(duration-t)/1);
 const sample=Math.max(-1,Math.min(1,(lead+bass+kick+hat)*fade));
 pcm.writeInt16LE(Math.round(sample*29000),i*4);pcm.writeInt16LE(Math.round(sample*29000),i*4+2);
}
const header=Buffer.alloc(44);header.write('RIFF');header.writeUInt32LE(36+pcm.length,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(2,22);header.writeUInt32LE(rate,24);header.writeUInt32LE(rate*4,28);header.writeUInt16LE(4,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);
await writeFile(join(out,'trilha-original.wav'),Buffer.concat([header,pcm]));
for(const [i,p]of campaign.posts.entries()){
 const svg=`<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="1080" height="200" fill="#100e18" fill-opacity="0.9"/><text x="540" y="125" text-anchor="middle" font-family="Arial" font-size="40" font-weight="bold" fill="#c4ff00">RIESCADE • DÊ O PLAY</text><rect x="0" y="1550" width="1080" height="370" fill="#100e18" fill-opacity="0.9"/><text x="540" y="1660" text-anchor="middle" font-family="Arial" font-size="38" fill="white">${i===4?'Conheça o RIESCADE Membro':'Conheça o aplicativo gratuito'}</text><text x="540" y="1730" text-anchor="middle" font-family="Arial" font-size="43" font-weight="bold" fill="#c4ff00">riescade.com.br</text><text x="540" y="1790" text-anchor="middle" font-family="Arial" font-size="26" fill="#d6d2df">${i===4?'Aplicativo gratuito. Assinatura opcional.':'Sua central de jogos para Windows.'}</text></svg>`;
 const overlay=join(out,`overlay-${i+1}.png`);await sharp(Buffer.from(svg)).png().toFile(overlay);
 ff(['-loop','1','-framerate','30','-i',join(source,p.slug+'.jpg'),'-loop','1','-framerate','30','-i',overlay,'-filter_complex',
 '[0:v]split[bg][fg];[bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=35,eq=brightness=-0.2[blur];[fg]scale=1000:1250[front];[blur][front]overlay=40:250[scene];[scene][1:v]overlay=0:0,fade=t=in:st=0:d=0.15,fade=t=out:st=3.85:d=0.15,format=yuv420p[v]',
 '-map','[v]','-t','4','-r','30','-an','-c:v','libx264','-preset','veryfast','-crf','20',join(out,`scene-${i+1}.mp4`)]);
 console.log(`Rendered scene ${i+1}/5`);
}
await writeFile(join(out,'concat.txt'),campaign.posts.map((_,i)=>`file 'scene-${i+1}.mp4'`).join('\n'));
const result=join(out,'riescade-reel-01_1080x1920.mp4');
ff(['-f','concat','-safe','0','-i',join(out,'concat.txt'),'-i',join(out,'trilha-original.wav'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',result]);
ff(['-ss','1','-i',result,'-frames:v','1',join(out,'capa.jpg')]);
ff(['-i',result,'-vf','fps=1/4,scale=216:384,tile=5x1','-frames:v','1',join(out,'storyboard.jpg')]);
await writeFile(join(out,'legenda.txt'),'Sua infância tem um novo play. 🎮💚\n\nConheça o RIESCADE OS: sua central de jogos para Windows. O aplicativo é gratuito, e os benefícios do RIESCADE Membro são opcionais.\n\nAcesse riescade.com.br pelo link no perfil.\n\nQual jogo marcou sua infância? Conta nos comentários!\n\n#RIESCADE #Retrogaming #JogosRetro #NostalgiaGamer');
await writeFile(join(out,'README.txt'),'Reel 01 — 20 segundos, 1080x1920, 30 fps, H.264 + AAC.\nMontagem das cinco artes aprovadas com transições de fade. Trilha instrumental original sintetizada por código, sem amostras externas. Sem narração. Não publicado.\nScript de reprodução: scripts/create-instagram-reel.mjs.');
console.log(result);
