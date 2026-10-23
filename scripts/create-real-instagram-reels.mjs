import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';
const root='D:/Downloads/tmp/RIESCADE/arts';
const input=join(root,'gravacoes','Gravando 2026-10-22 233403.mp4');
const music=join(root,'instagram/reels/01_sua-infancia-tem-um-novo-play/trilha-original.wav');
const output=join(root,'instagram/reels/capturas-reais-01');
const reels=[
 {slug:'02_riescade-em-acao',title:['SEU PC.','OUTRO CLIMA.'],clips:[[2,2,'Dê o play na nostalgia'],[8,4,'Explore os sistemas'],[20,4,'Encontre seu próximo clássico'],[156,5,'Conheça o RIESCADE']],caption:'Seu PC, outro clima. 🎮💚\n\nUma captura real do RIESCADE: abertura, sistemas e navegação pela biblioteca.\n\nConheça o projeto em riescade.com.br — link no perfil.\n\nQual sistema você abriria primeiro?\n\n#RIESCADE #Retrogaming #JogosRetro #PCGamer'},
 {slug:'03_navegue-pela-biblioteca',title:['QUAL VAI SER','O PRÓXIMO?'],clips:[[10,4,'Passe pelos seus sistemas'],[18,4,'Reencontre seus clássicos'],[28,3,'Escolha o que explorar'],[160,5,'Sua próxima descoberta começa aqui']],caption:'Qual vai ser o próximo? 🕹️\n\nVeja a navegação real pela biblioteca do RIESCADE. Sistemas e estilos diferentes para explorar sua coleção.\n\nConta nos comentários: qual console marcou sua história?\n\nConheça em riescade.com.br — link no perfil.\n\n#RIESCADE #BibliotecaGamer #Retrogaming #NostalgiaGamer'},
 {slug:'04_dois-visuais-riescade',title:['QUAL VISUAL','É A SUA CARA?'],clips:[[40,4,'Um visual com clima de arcade'],[156,5,'Outra forma de explorar'],[164,3,'A biblioteca com outra cara'],[176,4,'Qual você prefere?']],caption:'Qual visual é a sua cara? 💜💚\n\nNesta gravação real, o RIESCADE aparece com dois visuais diferentes. Veja a navegação e escolha seu favorito.\n\nVocê prefere o clima de arcade ou a interface em blocos?\n\nConheça o RIESCADE em riescade.com.br — link no perfil.\n\n#RIESCADE #TemasGamer #Retrogaming #Personalizacao'}
];
function ff(args){const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{encoding:'utf8',windowsHide:true});if(r.status!==0)throw new Error(r.stderr||'FFmpeg failed');}
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
await mkdir(output,{recursive:true});
// Avoid the incomplete library refresh later in the recording.
reels[2].clips=[[42,5,'Um visual com clima de arcade'],[156,10,'Outra forma de explorar']];
for(const reel of reels.filter(reel=>!process.argv[2]||reel.slug===process.argv[2])){
 const folder=join(output,reel.slug);await mkdir(folder,{recursive:true});
 for(const [i,[start,length,label]] of reel.clips.entries()){
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><defs><linearGradient id="shade" x2="0" y2="1"><stop stop-color="#100b1d" stop-opacity=".9"/><stop offset="1" stop-color="#100b1d" stop-opacity=".72"/></linearGradient></defs><rect width="1080" height="550" fill="url(#shade)"/><rect y="1200" width="1080" height="720" fill="url(#shade)"/><text x="540" y="160" text-anchor="middle" font-family="Arial" font-size="30" font-weight="bold" letter-spacing="3" fill="#c4ff00">CAPTURA REAL • RIESCADE</text>${reel.title.map((line,j)=>`<text x="540" y="${310+j*100}" text-anchor="middle" font-family="Arial" font-size="84" font-weight="bold" fill="${j?'#c4ff00':'white'}">${esc(line)}</text>`).join('')}<rect x="18" y="618" width="1044" height="546" rx="8" fill="none" stroke="#c4ff00" stroke-opacity=".6" stroke-width="3"/><text x="540" y="1390" text-anchor="middle" font-family="Arial" font-size="43" font-weight="bold" fill="white">${esc(label)}</text><text x="540" y="1500" text-anchor="middle" font-family="Arial" font-size="30" fill="#d8d0e8">Conheça o projeto no link do perfil</text><rect x="180" y="1560" width="720" height="100" rx="50" fill="#c4ff00"/><text x="540" y="1625" text-anchor="middle" font-family="Arial" font-size="43" font-weight="bold" fill="#100b1d">riescade.com.br</text><text x="540" y="1760" text-anchor="middle" font-family="Arial" font-size="25" fill="#d8d0e8">${i+1} / ${reel.clips.length} • Imagens do aplicativo em uso</text></svg>`;
  const overlay=join(folder,`overlay-${i}.png`);await sharp(Buffer.from(svg)).png().toFile(overlay);
  ff(['-ss',String(start),'-i',input,'-loop','1','-framerate','30','-i',overlay,'-filter_complex',`[0:v]crop=1920:1000:0:0,split[back][front];[back]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=40,eq=brightness=-0.2[bg];[front]scale=1040:542[fg];[bg][fg]overlay=20:620[scene];[scene][1:v]overlay=0:0,fade=t=in:st=0:d=0.12,fade=t=out:st=${length-.12}:d=0.12,format=yuv420p[v]`,'-map','[v]','-t',String(length),'-r','30','-an','-c:v','libx264','-preset','veryfast','-crf','22','-maxrate','3000k','-bufsize','6000k',join(folder,`scene-${i}.mp4`)]);
 }
 const length=reel.clips.reduce((n,c)=>n+c[1],0);
 await writeFile(join(folder,'concat.txt'),reel.clips.map((_,i)=>`file 'scene-${i}.mp4'`).join('\n'));
 const video=join(folder,reel.slug+'_1080x1920.mp4');
 ff(['-f','concat','-safe','0','-i',join(folder,'concat.txt'),'-i',music,'-filter_complex',`[1:a]afade=t=out:st=${length-1}:d=1[a]`,'-map','0:v','-map','[a]','-t',String(length),'-c:v','copy','-c:a','aac','-b:a','160k','-movflags','+faststart',video]);
 ff(['-ss','1','-i',video,'-frames:v','1',join(folder,'capa.jpg')]);
 ff(['-i',video,'-vf','fps=1/3,scale=216:384,tile=6x1','-frames:v','1',join(folder,'storyboard.jpg')]);
 await writeFile(join(folder,'legenda.txt'),reel.caption);
 await writeFile(join(folder,'edicao.json'),JSON.stringify({source:input,duration:length,clips:reel.clips.map(([start,duration,label])=>({start,duration,label})),audio:'Trilha original sintetizada do Reel 01; áudio da gravação não utilizado.',status:'ready_for_review',notes:'Sem gameplay: a gravação não mostra uma partida iniciada com sucesso. Cortados carregamentos longos, erros e faixa inferior de 80 pixels.'},null,2));
 console.log(JSON.stringify({reel:reel.slug,duration:length,video}));
}
await writeFile(join(output,'LEIA-ME.txt'),'Três Reels com capturas reais. Não publicados.\nA gravação mostra navegação e mudança de tema, mas não uma partida iniciada com sucesso. Por isso, o terceiro vídeo demonstra os visuais.\nOriginais preservados. Cada pasta contém MP4 vertical, capa, legenda, storyboard e lista dos cortes.\nVerificar as prévias antes de publicar.');
