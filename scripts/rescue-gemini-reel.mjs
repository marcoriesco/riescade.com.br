import {mkdir,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import sharp from 'sharp';
const root='D:/Downloads/tmp/RIESCADE/arts';
const out=join(root,'instagram/reels/05_a-ultima-ficha-remontado/v2');
await mkdir(out,{recursive:true});
const generated=join(root,'gravacoes/gemini_generated_video_e4ff42ed.mp4');
const capture=join(root,'gravacoes/Gravando 2026-10-22 233403.mp4');
const music=join(root,'instagram/reels/01_sua-infancia-tem-um-novo-play/trilha-original.wav');
const logo=join(root,'brand/riescade-logo-horizontal-transparente_v1.png');
const W=1080,H=1920;
function ff(args){const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{encoding:'utf8',windowsHide:true});if(r.status!==0)throw new Error(r.stderr||'FFmpeg failed');}
async function overlay(name,body){const path=join(out,name+'.png');await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${body}</svg>`)).png().toFile(path);return path;}
const text=(value,y,size=72,color='white')=>`<text x="540" y="${y}" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="${size}" fill="${color}">${value}</text>`;
const shade='<defs><linearGradient id="s" x2="0" y2="1"><stop stop-color="#100b1d" stop-opacity=".85"/><stop offset="1" stop-color="#100b1d" stop-opacity="0"/></linearGradient></defs>';
const encode=['-an','-r','30','-c:v','libx264','-preset','veryfast','-crf','18'];
const scenes=[];

// 0–3s: coin and button from the generated video (source 0.9–3.9s), hook text on top.
const hook=await overlay('hook',`${shade}<rect width="${W}" height="520" fill="url(#s)"/>${text('LEMBRA DA',230,92)}${text('ÚLTIMA FICHA?',335,100,'#c4ff00')}`);
ff(['-ss','0.9','-t','3','-i',generated,'-loop','1','-i',hook,'-filter_complex',`[0:v]scale=${W}:${H}:flags=lanczos,setsar=1[v0];[v0][1:v]overlay=0:0,fade=t=in:st=0:d=0.15,format=yuv420p[v]`,'-map','[v]','-t','3',...encode,join(out,'scene-0.mp4')]);
scenes.push(3);

// 3–5s: the player's face (source 3.95–4.95s) slowed to 2s with motion interpolation; cut before the generated mascot appears.
ff(['-ss','3.95','-t','1','-i',generated,'-filter_complex',`[0:v]setpts=2*PTS,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir,scale=${W}:${H}:flags=lanczos,setsar=1,fade=t=out:st=1.85:d=0.15,format=yuv420p[v]`,'-map','[v]','-t','2',...encode,join(out,'scene-1.mp4')]);
scenes.push(2);

// 5–11s: real capture at full width over a blurred copy of itself. Bottom 80px of the recording are cropped out.
const captureCuts=[{start:11.5,duration:3,label:'Escolha o sistema'},{start:156.5,duration:3,label:'Encontre seu clássico'}];
for(const [i,clip] of captureCuts.entries()){
 const label=await overlay('capture-'+i,`${text('SUA COLEÇÃO,',330,84)}${text('AGORA NO SEU PC.',430,84,'#c4ff00')}${text(clip.label,1440,56)}<rect x="290" y="1560" width="500" height="64" rx="32" fill="#c4ff00"/>${text('CAPTURA REAL DO RIESCADE',1603,26,'#100b1d')}`);
 ff(['-ss',String(clip.start),'-t',String(clip.duration),'-i',capture,'-loop','1','-i',label,'-filter_complex',`[0:v]crop=1920:1000:0:0,split[back][front];[back]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},gblur=sigma=40,eq=brightness=-0.28[bg];[front]scale=${W}:-2:flags=lanczos[fg];[bg][fg]overlay=0:(H-h)/2[scene];[scene][1:v]overlay=0:0,fade=t=in:st=0:d=0.12,fade=t=out:st=${clip.duration-0.12}:d=0.12,setsar=1,format=yuv420p[v]`,'-map','[v]','-t',String(clip.duration),...encode,join(out,`scene-${i+2}.mp4`)]);
 scenes.push(clip.duration);
}

// 11–14s: original logo applied in the edit; the generated ending is discarded.
const end=await overlay('end',`${text('A NOSTALGIA',560,96)}${text('CONTINUA.',670,108,'#c4ff00')}${text('Conheça o RIESCADE.',1260,58)}<rect x="190" y="1390" width="700" height="120" rx="60" fill="#c4ff00"/>${text('riescade.com.br',1470,56,'#100b1d')}`);
ff(['-f','lavfi','-i',`color=c=#100b1d:s=${W}x${H}:r=30`,'-loop','1','-i',logo,'-loop','1','-i',end,'-filter_complex','[1:v]scale=860:-1[logo];[0:v][logo]overlay=(W-w)/2:860[brand];[brand][2:v]overlay=0:0,fade=t=in:st=0:d=0.2,fade=t=out:st=2.7:d=0.3,setsar=1,format=yuv420p[v]','-map','[v]','-t','3',...encode,join(out,'scene-4.mp4')]);
scenes.push(3);

const duration=scenes.reduce((a,b)=>a+b,0);
await writeFile(join(out,'concat.txt'),scenes.map((_,i)=>`file 'scene-${i}.mp4'`).join('\n'));
const final=join(out,'a-ultima-ficha-remontado_v2_1080x1920.mp4');
// Original track throughout; the generated coin and button sounds are kept under it during the first 3s.
ff(['-f','concat','-safe','0','-i',join(out,'concat.txt'),'-i',music,'-ss','0.9','-t','3','-i',generated,'-filter_complex',`[2:a]volume=0.7,afade=t=out:st=2.6:d=0.4[fx];[1:a][fx]amix=inputs=2:duration=first:normalize=0,afade=t=out:st=${duration-1}:d=1[a]`,'-map','0:v','-map','[a]','-t',String(duration),'-c:v','copy','-c:a','aac','-b:a','160k','-movflags','+faststart',final]);
ff(['-ss','1.5','-i',final,'-frames:v','1',join(out,'capa.jpg')]);
ff(['-i',final,'-vf','fps=1,scale=180:320,tile=14x1','-frames:v','1',join(out,'storyboard.jpg')]);
await writeFile(join(out,'legenda.txt'),'Lembra da última ficha? 🕹️💚\n\nA nostalgia continua. Conheça o RIESCADE e veja sua coleção com outra cara, agora no seu PC.\n\nAcesse riescade.com.br pelo link no perfil.\n\nQual lembrança de fliperama ficou com você?\n\n#RIESCADE #Retrogaming #Fliperama #NostalgiaGamer');
await writeFile(join(out,'edicao.json'),JSON.stringify({status:'ready_for_review',published:false,duration,size:`${W}x${H}`,sources:[generated,capture],timeline:[
 {at:'0–3s',source:'gemini 0.9–3.9s',content:'Ficha e botão; texto "Lembra da última ficha?"'},
 {at:'3–5s',source:'gemini 3.95–4.95s',content:'Rosto do jogador, câmera lenta 2x com interpolação'},
 {at:'5–11s',source:'captura real',content:'Sistemas e biblioteca em largura total',cuts:captureCuts},
 {at:'11–14s',source:'logo original',content:'"A nostalgia continua. Conheça o RIESCADE."'}],
 removed:['Monitor inventado','Mascote gerado','Logo e endereço deformados do encerramento'],
 audio:'Trilha original do Reel 01; sons da ficha/botão do Gemini nos 3s iniciais'},null,2));
console.log(final);
