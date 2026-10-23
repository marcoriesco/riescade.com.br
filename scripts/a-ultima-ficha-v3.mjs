import {mkdir,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import sharp from 'sharp';
// Reel "A última ficha" v3: generated coin and player clips (Magnific / Seedance 2.5), a beat-cut montage
// of real RIESCADE screens over a generated techno track, and an end card on the real mascot intro.
const root='D:/Downloads/tmp/RIESCADE/arts';
const site='D:/DEV/Web/riescade/riescade.com.br/public';
const out=join(root,'instagram/reels/05_a-ultima-ficha-remontado/v3');
const gen=join(out,'gerados');
const work=join(out,'cenas');
await mkdir(work,{recursive:true});
const capture=join(root,'gravacoes/Gravando 2026-10-22 233403.mp4');
const logo=join(root,'brand/riescade-logo-horizontal-transparente_v1.png');
const W=1080,H=1920,FPS=30;
const BEAT=60/140; // generated track measured at ~140 BPM, first beat at 0s
const coin={file:join(gen,'ficha.mp4'),start:0,duration:10};
const face={file:join(gen,'rosto.mp4'),start:0,duration:3.4};
const MUSIC_IN=0.4; // music starts this many seconds before the montage, on the player's nod

function ff(args){const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{encoding:'utf8',windowsHide:true});if(r.status!==0)throw new Error(r.stderr||'FFmpeg failed');}
async function png(name,body){const path=join(work,name+'.png');await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${body}</svg>`)).png().toFile(path);return path;}
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
const text=(value,y,size=72,color='white',extra='')=>`<text x="540" y="${y}" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="${size}" fill="${color}" ${extra}>${esc(value)}</text>`;
const encode=['-an','-r',String(FPS),'-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p'];
const scenes=[];

// 1. Coin: generated clip with its own sound effects, hook text fading in.
const hook=await png('hook',`<defs><linearGradient id="s" x2="0" y2="1"><stop stop-color="#100b1d" stop-opacity=".85"/><stop offset="1" stop-color="#100b1d" stop-opacity="0"/></linearGradient></defs><rect width="${W}" height="560" fill="url(#s)"/>${text('LEMBRA DA',240,96)}${text('ÚLTIMA FICHA?',350,104,'#c4ff00')}`);
ff(['-ss',String(coin.start),'-t',String(coin.duration),'-i',coin.file,'-loop','1','-t',String(coin.duration),'-i',hook,'-filter_complex',`[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1[v0];[1:v]format=rgba,fade=t=in:st=0.6:d=0.5:alpha=1[t];[v0][t]overlay=0:0,fade=t=in:st=0:d=0.3[v]`,'-map','[v]','-t',String(coin.duration),...encode,join(work,'a-coin.mp4')]);
scenes.push({file:'a-coin.mp4',duration:coin.duration,audio:{file:coin.file,start:coin.start}});

// 2. Player looks into the camera and nods.
ff(['-ss',String(face.start),'-t',String(face.duration),'-i',face.file,'-vf',`scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1`,'-t',String(face.duration),...encode,join(work,'b-face.mp4')]);
scenes.push({file:'b-face.mp4',duration:face.duration,audio:{file:face.file,start:face.start}});

// 3. Montage cut on the beat. Each shot: the real screen at full width over a blurred copy, slow push-in,
// white flash at the start of each block, block headline on top.
const blocks=[
 {title:['TODOS OS','CONSOLES'],shots:[{video:11.5,beats:8}]},
 {title:['ARCADES E','CLÁSSICOS'],shots:['arcade','sf3','mariowonder','switch'].map(s=>({image:`screenshots/${s}.webp`,beats:2}))},
 {title:['PORTÁTEIS,','PINBALL E PC'],shots:['n64dd','psvita','pinballm','doom3'].map(s=>({image:`screenshots/${s}.webp`,beats:2}))},
 {title:['TUDO PRONTO','NO APP'],shots:[{image:'screenshots/emulators.webp',beats:2},{image:'screenshots/allgames.webp',beats:2}]},
 {title:['SEU PC VIRA','FLIPERAMA'],shots:[{video:42,beats:4}]},
 {title:['VÁRIOS','TEMAS'],shots:[{video:156.5,beats:8}]},
 {title:['ESCOLHA SEU','VISUAL'],shots:[...['coinops','hyperspin','ps5','switch2','xboxs','edition'].map(s=>({image:`themes/retrobat/${s}.webp`,beats:1})),{video:27,beats:2}]},
];
let shotIndex=0,montage=0;
for(const [b,block] of blocks.entries()){
 const head=await png('block-'+b,`<defs><linearGradient id="s" x2="0" y2="1"><stop stop-color="#100b1d" stop-opacity=".9"/><stop offset="1" stop-color="#100b1d" stop-opacity="0"/></linearGradient></defs><rect width="${W}" height="620" fill="url(#s)"/>${text(block.title[0],300,104)}${text(block.title[1],420,112,'#c4ff00')}<rect x="260" y="1530" width="560" height="96" rx="48" fill="#c4ff00"/>${text('RIESCADE',1598,52,'#100b1d','letter-spacing="8"')}`);
 for(const [s,shot] of block.shots.entries()){
  const d=shot.beats*BEAT,frames=Math.round(d*FPS),name=`c-${String(shotIndex++).padStart(2,'0')}.mp4`;
  const input=shot.video!==undefined?['-ss',String(shot.video),'-t',String(d+0.1),'-i',capture]:['-loop','1','-t',String(d+0.1),'-i',join(site,shot.image)];
  // Recording has an 80px strip at the bottom; screenshots are 1919x1079.
  // The screen is shown 860px tall, cropping the sides, so it reads on a phone.
  const src=shot.video!==undefined?'crop=1920:1000:0:0':'scale=1920:1080';
  const flash=s===0?`,fade=t=in:st=0:d=0.12:color=white`:'';
  ff([...input,'-loop','1','-t',String(d+0.1),'-i',head,'-filter_complex',`[0:v]fps=${FPS},${src},split[back][front];[back]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},gblur=sigma=40,eq=brightness=-0.12:saturation=1.3[bg];[front]scale=-2:1720,crop=2160:1720,zoompan=z='1+0.10*on/${frames}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=${W}x860:fps=${FPS}[fg];[bg][fg]overlay=0:600[scene];[scene][1:v]overlay=0:0${flash},setsar=1[v]`,'-map','[v]','-frames:v',String(frames),...encode,join(work,name)]);
  scenes.push({file:name,duration:frames/FPS});montage+=frames/FPS;
 }
}

// 4. End card on the real mascot intro: logo, the site's own descriptions and the address, appearing on the beat.
const endBeats=16,endDur=endBeats*BEAT;
const card=[
 ['end-0',`<defs><linearGradient id="g" x2="0" y2="1"><stop offset="0" stop-color="#100b1d" stop-opacity="0"/><stop offset=".25" stop-color="#100b1d"/></linearGradient></defs><rect y="820" width="${W}" height="1100" fill="url(#g)"/>`,0],
 ['end-1',`${text('A NOSTALGIA',1370,76)}${text('CONTINUA.',1455,84,'#c4ff00')}`,2],
 ['end-2',`<text x="540" y="1545" text-anchor="middle" font-family="Arial" font-size="38" fill="#d8d0e8">Mais de 250 consoles, arcades e</text><text x="540" y="1593" text-anchor="middle" font-family="Arial" font-size="38" fill="#d8d0e8">computadores clássicos no seu PC.</text><text x="540" y="1650" text-anchor="middle" font-family="Arial" font-size="32" fill="#a99fc0">Biblioteca, emuladores e downloads em um só lugar.</text>`,4],
 ['end-3',`<rect x="190" y="1700" width="700" height="116" rx="58" fill="#c4ff00"/>${text('riescade.com.br',1778,56,'#100b1d')}`,6],
];
const cardPngs=[];for(const [name,body] of card)cardPngs.push(await png(name,body));
const inputs=['-ss','0.5','-i',join(site,'video/riescade-os.mp4'),'-loop','1','-i',logo,...cardPngs.flatMap(p=>['-loop','1','-i',p])];
let graph=`color=c=#100b1d:s=${W}x${H}:r=${FPS}[base];[0:v]fps=${FPS},crop=640:640:600:20,scale=${W}:${W}:flags=lanczos,zoompan=z='1+0.06*on/${Math.round(endDur*FPS)}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=${W}x${W}:fps=${FPS}[m];[base][m]overlay=0:0[v0];`;
let last='v0';
for(const [i,[, ,beat]] of card.entries()){const st=(beat*BEAT).toFixed(3);graph+=`[${i+2}:v]format=rgba,fade=t=in:st=${st}:d=0.25:alpha=1[c${i}];[${last}][c${i}]overlay=0:0[w${i}];`;last=`w${i}`;if(i===0){graph+=`[1:v]scale=700:-1,format=rgba,fade=t=in:st=${(1*BEAT).toFixed(3)}:d=0.25:alpha=1[lg];[${last}][lg]overlay=(W-w)/2:1030[wl];`;last='wl';}}
graph+=`[${last}]fade=t=in:st=0:d=0.12:color=white,fade=t=out:st=${(endDur-0.5).toFixed(3)}:d=0.5,setsar=1[v]`;
ff([...inputs,'-filter_complex',graph,'-map','[v]','-frames:v',String(Math.round(endDur*FPS)),...encode,join(work,'d-end.mp4')]);
scenes.push({file:'d-end.mp4',duration:Math.round(endDur*FPS)/FPS});

// Assemble: generated sound effects for the first two scenes, then the track from the nod to the end.
await writeFile(join(work,'concat.txt'),scenes.map(s=>`file '${s.file}'`).join('\n'));
const duration=scenes.reduce((n,s)=>n+s.duration,0);
const musicAt=coin.duration+face.duration-MUSIC_IN;
const music=join(gen,'musica-techno.mp3');
const final=join(out,'a-ultima-ficha_v3_1080x1920.mp4');
ff(['-f','concat','-safe','0','-i',join(work,'concat.txt'),
 '-ss',String(coin.start),'-t',String(coin.duration),'-i',coin.file,
 '-ss',String(face.start),'-t',String(face.duration),'-i',face.file,
 '-i',music,
 '-filter_complex',`[1:a]aresample=48000,volume=3.5,afade=t=out:st=${coin.duration-0.3}:d=0.3[a1];[2:a]aresample=48000,adelay=${coin.duration*1000}|${coin.duration*1000},volume=2.5,afade=t=out:st=${musicAt}:d=0.6[a2];[3:a]aresample=48000,adelay=${Math.round(musicAt*1000)}|${Math.round(musicAt*1000)},afade=t=out:st=${(duration-1.2).toFixed(2)}:d=1.2[a3];[a1][a2][a3]amix=inputs=3:duration=longest:normalize=0,alimiter=limit=0.95[a]`,
 '-map','0:v','-map','[a]','-t',duration.toFixed(3),'-c:v','copy','-c:a','aac','-b:a','192k','-movflags','+faststart',final]);
ff(['-ss','2','-i',final,'-frames:v','1',join(out,'capa.jpg')]);
ff(['-i',final,'-vf','fps=1,scale=135:240,tile=13x3','-frames:v','1',join(out,'storyboard.jpg')]);
await writeFile(join(out,'legenda.txt'),'Lembra da última ficha? 🪙🕹️\n\nA nostalgia continua. Mais de 250 consoles, arcades e computadores clássicos no seu PC, com biblioteca, emuladores e downloads em um só lugar.\n\nConheça o RIESCADE em riescade.com.br — link no perfil.\n\nQual foi o fliperama que marcou a sua infância?\n\n#RIESCADE #Retrogaming #Fliperama #MagicPlay #NostalgiaGamer #PCGamer');
await writeFile(join(out,'edicao.json'),JSON.stringify({status:'ready_for_review',published:false,duration:+duration.toFixed(2),size:`${W}x${H}`,
 generated:{coin:'Magnific / Seedance 2.5, referência: ficha Magic Play real',face:'Magnific / Seedance 2.5, quadro inicial do vídeo Gemini',music:'Magnific / ElevenLabs Music v2, techno 140 BPM original'},
 timeline:[{scene:'Ficha Magic Play e botão',seconds:coin.duration},{scene:'Jogador olha para a câmera e acena',seconds:face.duration},{scene:'Montagem das telas reais no ritmo',seconds:+montage.toFixed(2),blocks:blocks.map(b=>b.title.join(' '))},{scene:'Encerramento com mascote, logo, descrição e site',seconds:+endDur.toFixed(2)}]},null,2));
console.log(JSON.stringify({final,duration:+duration.toFixed(2)}));
