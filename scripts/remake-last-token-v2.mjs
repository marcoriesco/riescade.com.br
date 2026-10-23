import {mkdir,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import sharp from 'sharp';
const root='D:/Downloads/tmp/RIESCADE/arts';
const folder=join(root,'instagram/reels/06_a-ultima-ficha-roteiro-v2');
await mkdir(folder,{recursive:true});
const gemini=join(root,'gravacoes/gemini_generated_video_e4ff42ed.mp4');
const capture=join(root,'gravacoes/Gravando 2026-10-22 233403.mp4');
const music=join(root,'instagram/reels/01_sua-infancia-tem-um-novo-play/trilha-original.wav');
function ff(args){const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{encoding:'utf8',windowsHide:true});if(r.status!==0)throw new Error(r.stderr||'FFmpeg failed');}
const text=(s,y,size=48,color='white')=>`<text x="360" y="${y}" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="${size}" fill="${color}">${s}</text>`;
async function art(name,body){const p=join(folder,name+'.png');await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280">${body}</svg>`)).png().toFile(p);return p;}
const enc=['-an','-r','30','-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p'];
const hook=await art('hook',`<defs><linearGradient id="g" x2="0" y2="1"><stop stop-color="#100c19" stop-opacity=".9"/><stop offset="1" stop-color="#100c19" stop-opacity="0"/></linearGradient></defs><rect width="720" height="400" fill="url(#g)"/>${text('LEMBRA DA',170,48)}${text('ÚLTIMA FICHA?',230,55,'#c4ff00')}`);
ff(['-i',gemini,'-loop','1','-i',hook,'-filter_complex','[0:v]scale=720:1280,setsar=1[base];[base][1:v]overlay=0:0,format=yuv420p[v]','-map','[v]','-t','3',...enc,join(folder,'01_ficha.mp4')]);
// The useful face shot is about half a second; extend only that shot to 2s.
ff(['-ss','4.05','-i',gemini,'-vf','trim=duration=0.5,setpts=4*(PTS-STARTPTS),fps=30,scale=720:1280,setsar=1','-t','2',...enc,join(folder,'02_rosto.mp4')]);
const demo=await art('demo',`<rect width="720" height="1280" fill="#100b1d" fill-opacity=".1"/><rect width="720" height="310" fill="#100b1d" fill-opacity=".65"/>${text('A NOSTALGIA',180,48)}${text('CONTINUA.',245,58,'#c4ff00')}<rect x="0" y="416" width="720" height="4" fill="#c4ff00"/><rect x="0" y="795" width="720" height="4" fill="#c4ff00"/>${text('CAPTURA REAL DO RIESCADE',885,25,'#c4ff00')}${text('Sua biblioteca em movimento.',950,30)}${text('riescade.com.br',1110,35)}`);
ff(['-ss','158','-i',capture,'-loop','1','-i',demo,'-filter_complex','[0:v]crop=1920:1000:0:0,split[full][back];[back]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,gblur=sigma=40,eq=brightness=-0.32[bg];[full]scale=720:375[front];[bg][front]overlay=0:420[scene];[scene][1:v]overlay=0:0,setsar=1,format=yuv420p[v]','-map','[v]','-t','6',...enc,join(folder,'03_captura-real.mp4')]);
const end=await art('encerramento',`${text('A NOSTALGIA CONTINUA.',375,44,'#c4ff00')}${text('Conheça o RIESCADE.',830,38)}<rect x="100" y="920" width="520" height="90" rx="45" fill="#c4ff00"/>${text('riescade.com.br',978,37,'#100b1d')}`);
ff(['-f','lavfi','-i','color=c=#100b1d:s=720x1280:r=30','-loop','1','-i',join(root,'brand/riescade-logo-horizontal-transparente_v1.png'),'-loop','1','-i',end,'-filter_complex','[1:v]scale=620:-1[logo];[0:v][logo]overlay=(W-w)/2:530[brand];[brand][2:v]overlay=0:0,fade=t=in:st=0:d=0.12,fade=t=out:st=2.8:d=0.2,setsar=1,format=yuv420p[v]','-map','[v]','-t','3',...enc,join(folder,'04_logo-original.mp4')]);
await writeFile(join(folder,'concat.txt'),['01_ficha.mp4','02_rosto.mp4','03_captura-real.mp4','04_logo-original.mp4'].map(p=>`file '${p}'`).join('\n'));
const final=join(folder,'a-ultima-ficha_v2_14s_720x1280.mp4');
ff(['-f','concat','-safe','0','-i',join(folder,'concat.txt'),'-i',music,'-filter_complex','[1:a]afade=t=in:st=0:d=0.15,afade=t=out:st=13:d=1[a]','-map','0:v','-map','[a]','-t','14','-c:v','copy','-c:a','aac','-b:a','160k','-movflags','+faststart',final]);
ff(['-ss','1','-i',final,'-frames:v','1',join(folder,'capa.jpg')]);
ff(['-i',final,'-vf','fps=2/3,scale=180:320,tile=5x2','-frames:v','1',join(folder,'storyboard.jpg')]);
await writeFile(join(folder,'roteiro.json'),JSON.stringify({status:'ready_for_review',published:false,duration:14,resolution:'720x1280',shots:[{from:0,to:3,scene:'Ficha e botão',source:gemini,sourceStart:0},{from:3,to:5,scene:'Rosto do jogador',source:gemini,sourceStart:4.05,sourceDuration:.5,slowMotion:4},{from:5,to:11,scene:'Biblioteca real em movimento; largura completa, sem duplicação',source:capture,sourceStart:158},{from:11,to:14,scene:'Logo original e chamada A nostalgia continua. Conheça o RIESCADE.'}],audio:'Instrumental original sintetizado, sem narração; áudio do Gemini não utilizado.'},null,2));
await writeFile(join(folder,'legenda.txt'),'Lembra da última ficha? 🕹️💚\n\nA nostalgia continua. Conheça o RIESCADE em riescade.com.br — link no perfil.\n\nQual jogo te leva de volta ao fliperama?\n\n#RIESCADE #Retrogaming #Fliperama #NostalgiaGamer');
console.log(final);
