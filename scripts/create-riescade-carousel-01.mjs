// Code-native editorial layout. Screenshots are embedded verbatim, never regenerated.
import {mkdir,readdir,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import sharp from 'sharp';
const root='D:/Downloads/tmp/RIESCADE/arts/instagram/carousel';
const output=join(root,'carrossel-01-v1');
await mkdir(output,{recursive:true});
const files=(await readdir(root)).filter(n=>n.endsWith('.png')).sort();
const images=await Promise.all(files.map(async file=>'data:image/png;base64,'+(await readFile(join(root,file))).toString('base64')));
const logo='data:image/png;base64,'+(await readFile('D:/Downloads/tmp/RIESCADE/arts/brand/riescade-logo-horizontal-transparente_v1.png')).toString('base64');
const mascot='data:image/webp;base64,'+(await readFile('D:/Downloads/tmp/RIESCADE/arts/brand/riescade-mascote-original.webp')).toString('base64');
const W=1080,H=1350;
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
const t=(s,x,y,size=36,color='#f5f3fa',weight=400,more='')=>`<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" ${more}>${esc(s)}</text>`;
const lines=(a,x,y,size=76,color='#f5f3fa',weight=900,gap=size*1.04)=>a.map((s,i)=>t(s,x,y+i*gap,size,color,weight,'letter-spacing="-2"')).join('');
const pill=(s,x,y,width,color='#c4ff00')=>`<rect x="${x}" y="${y}" width="${width}" height="46" rx="23" fill="${color}"/>${t(s,x+width/2,y+30,20,'#0b0b10',700,'text-anchor="middle"')}`;
function shot(index,x,y,w,h,label){
 return `<rect x="${x-2}" y="${y-2}" width="${w+4}" height="${h+4}" rx="16" fill="#26222f"/><clipPath id="shot-${index}-${x}-${y}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14"/></clipPath><image href="${images[index-1]}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" clip-path="url(#shot-${index}-${x}-${y})"/>${label?t(label,x,y-18,21,'#bcb5ca',500):''}`;
}
function base(n,section,content){
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><radialGradient id="glow"><stop stop-color="#7833bc" stop-opacity=".22"/><stop offset="1" stop-color="#0b0b10" stop-opacity="0"/></radialGradient></defs><rect width="1080" height="1350" fill="#0b0b10"/><ellipse cx="970" cy="400" rx="650" ry="650" fill="url(#glow)"/><path d="M64 135H1016M64 1230H1016" stroke="#302938" stroke-width="1"/><image href="${logo}" x="64" y="34" width="290" height="97" preserveAspectRatio="xMidYMid meet"/>${t(section,1016,94,19,'#b8b0c5',700,'text-anchor="end" letter-spacing="2"')}${t(String(n).padStart(2,'0'),1010,325,185,'#ffffff',900,'text-anchor="end" opacity=".035"')}${content}${t('riescade.com.br',64,1280,25,'#c4ff00',700)}${t(n===7?'@riescade':'DESLIZE PARA CONHECER →',1016,1280,19,'#c8c2d2',600,'text-anchor="end"')}${Array.from({length:7},(_,i)=>`<rect x="${64+i*138}" y="1310" width="120" height="4" rx="2" fill="${i===n-1?'#c4ff00':'#302938'}"/>`).join('')}</svg>`;
}
const slides=[];
slides.push({name:'01_capa',sources:[10],svg:base(1,'CONHEÇA O RIESCADE',
 pill('NOSTALGIA COM OUTRA CARA',64,175,350)+lines(['SEU PC.'],64,325,98)+lines(['OUTRA FASE.'],64,432,98,'#c4ff00')+
 t('Uma central para reencontrar seus clássicos.',68,490,31,'#c6bfd2')+shot(10,64,540,952,535)+
 pill('BIBLIOTECA',64,1115,260)+pill('TEMAS',350,1115,200,'#cb93ff')+pill('WINDOWS',576,1115,230,'#ffffff'))});
slides.push({name:'02_sistemas',sources:[5,3],svg:base(2,'EXPLORE OS SISTEMAS',
 lines(['CADA SISTEMA,'],64,245,76)+lines(['UMA LEMBRANÇA.'],64,330,76,'#c4ff00')+
 t('Consoles, portáteis e arcades no universo RIESCADE.',66,390,29,'#c6bfd2')+
 shot(5,64,445,660,371,'PORTÁTEIS E CLÁSSICOS')+t('01',770,615,95,'#c4ff00',900)+t('Portáteis',770,663,27,'#c6bfd2')+
 shot(3,356,840,660,371,'O CLIMA DO FLIPERAMA')+t('02',64,1004,95,'#cb93ff',900)+t('Arcades',64,1052,27,'#c6bfd2'))});
slides.push({name:'03_biblioteca',sources:[9],svg:base(3,'SUA COLEÇÃO EM DESTAQUE',
 lines(['MENOS PROCURA.'],64,245,75)+lines(['MAIS DESCOBERTAS.'],64,329,75,'#c4ff00')+
 t('Capas e organização para explorar sua biblioteca.',66,390,29,'#c6bfd2')+shot(9,64,445,952,535)+
 `<rect x="64" y="1020" width="952" height="140" rx="20" fill="#15121c"/>`+
 t('REENCONTRE UM FAVORITO.',94,1078,31,'#ffffff',700)+t('OU ESCOLHA SUA PRÓXIMA DESCOBERTA.',94,1124,26,'#c6bfd2',500))});
slides.push({name:'04_escolha-seu-jogo',sources:[4],svg:base(4,'DA BIBLIOTECA À ESCOLHA',
 lines(['UM CLÁSSICO'],64,245,82)+lines(['PUXA O OUTRO.'],64,336,82,'#c4ff00')+
 t('Explore os títulos e escolha sua próxima partida.',66,399,30,'#c6bfd2')+shot(4,64,455,952,535)+
 pill('CAPA E NOME EM DESTAQUE',64,1035,390)+t('Você reconhece este arcade?',64,1140,39,'#ffffff',700))});
slides.push({name:'05_dois-visuais',sources:[1,7],svg:base(5,'PERSONALIZAÇÃO',
 lines(['MESMO SISTEMA.'],64,245,77)+lines(['OUTRO VISUAL.'],64,332,77,'#c4ff00')+
 t('Duas apresentações da plataforma Sega Lindbergh.',66,376,28,'#c6bfd2')+
 shot(1,211,425,658,370,'VISUAL 01')+shot(7,211,840,658,370,'VISUAL 02'))});
slides.push({name:'06_app-e-membro',sources:[14],svg:base(6,'ENTENDA A ASSINATURA',
 lines(['APP GRATUITO.'],64,245,82)+lines(['MEMBRO OPCIONAL.'],64,334,74,'#c4ff00')+
 t('Conheça a diferença e escolha como começar.',66,395,29,'#c6bfd2')+
 `<rect x="64" y="465" width="450" height="545" rx="24" fill="#15121c" stroke="#393140"/><rect x="540" y="465" width="476" height="545" rx="24" fill="#1a1120" stroke="#bf65e9"/>`+
 t('RIESCADE OS',94,530,27,'#ffffff',700)+t('GRÁTIS',94,634,58,'#c4ff00',900)+
 lines(['Central para Windows','Organize sua biblioteca','Navegue com controle'],94,745,30,'#d0cad9',400,54)+
 t('RIESCADE MEMBRO',574,530,25,'#e3b0ff',700)+t('R$ 30',574,634,70,'#ffffff',900)+t('/mês',797,632,28,'#c6bfd2')+
 lines(['Downloads no aplicativo','Suporte prioritário','Sem fidelidade'],574,745,30,'#d0cad9',400,54)+
 t('Veja os benefícios completos no site.',64,1094,34,'#ffffff',700)+t('Assinatura mensal. Cancele pela sua conta.',64,1150,26,'#bcb5c9'))});
slides.push({name:'07_proximo-play',sources:[2,13],svg:base(7,'AGORA É COM VOCÊ',
 lines(['QUAL VAI SER'],64,245,88)+lines(['SEU PRÓXIMO'],64,343,88)+lines(['PLAY?'],64,451,110,'#c4ff00')+
 shot(2,64,525,462,260)+shot(13,554,525,462,260)+
 t('Conta nos comentários:',64,873,38,'#ffffff',700)+t('qual sistema marcou a sua infância?',64,926,34,'#c6bfd2')+
 `<rect x="64" y="1010" width="952" height="130" rx="24" fill="#c4ff00"/>`+t('CONHEÇA O RIESCADE',104,1065,28,'#0b0b10',700)+t('Acesse o link do perfil.',104,1110,31,'#0b0b10',500)+
 `<image href="${mascot}" x="875" y="1027" width="105" height="100"/>`)});
for(const slide of slides){
 await writeFile(join(output,slide.name+'.svg'),slide.svg);
 await sharp(Buffer.from(slide.svg)).jpeg({quality:96,chromaSubsampling:'4:4:4'}).toFile(join(output,slide.name+'.jpg'));
 await sharp(Buffer.from(slide.svg)).png().toFile(join(output,slide.name+'.png'));
 console.log(slide.name);
}
const thumb=await Promise.all(slides.map(slide=>sharp(join(output,slide.name+'.jpg')).resize(324,405).toBuffer()));
await sharp({create:{width:1296,height:810,channels:3,background:'#08080d'}}).composite(thumb.map((input,i)=>({input,left:(i%4)*324,top:Math.floor(i/4)*405}))).jpeg({quality:93}).toFile(join(output,'preview-carrossel.jpg'));
const caption='Seu PC pode ganhar outra fase. 🎮💚\n\nDeslize para conhecer o universo RIESCADE: sistemas, biblioteca, seleção de jogos e diferentes visuais em capturas reais.\n\nO RIESCADE OS é gratuito. A assinatura RIESCADE Membro é opcional, custa R$ 30/mês e oferece benefícios como downloads no aplicativo e suporte prioritário, sem fidelidade. Veja todos os detalhes no site.\n\nQual sistema marcou sua infância? Conta nos comentários. 👇\n\nConheça em riescade.com.br — link no perfil.\n\n#RIESCADE #Retrogaming #JogosRetro #Fliperama #NostalgiaGamer';
await writeFile(join(output,'legenda.txt'),caption);
await writeFile(join(output,'preview.html'),`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RIESCADE — Carrossel 01</title><style>body{margin:0;background:#09090d;color:#fff;font:16px Arial}header{padding:28px;max-width:1080px;margin:auto}h1{font-size:25px}p{color:#aaa}main{display:flex;gap:24px;overflow-x:auto;scroll-snap-type:x mandatory;padding:0 28px 32px}figure{margin:0;flex:0 0 min(85vw,540px);scroll-snap-align:center}img{display:block;width:100%;border-radius:12px}figcaption{padding:14px 0;color:#c4ff00}a{color:#c4ff00}</style><header><h1>RIESCADE — Seu PC. Outra fase.</h1><p>Sete páginas. Deslize para revisar em tamanho legível. Não publicado.</p><a href="legenda.txt">Abrir legenda</a></header><main>${slides.map((slide,i)=>`<figure><img src="${slide.name}.jpg" alt="Página ${i+1} do carrossel RIESCADE"><figcaption>${i+1} / 7</figcaption></figure>`).join('')}</main></html>`);
await writeFile(join(output,'manifest.json'),JSON.stringify({status:'ready_for_review',published:false,dimensions:{width:1080,height:1350},slides:slides.map((slide,i)=>({order:i+1,file:slide.name+'.jpg',sources:slide.sources.map(n=>files[n-1])})),notes:['Capturas originais preservadas; interface não regenerada por IA.','Captura 12 não utilizada por conter contador de desempenho.','As telas apresentam diferentes interfaces e temas RIESCADE. Não prometem compatibilidade ou disponibilidade de um jogo em qualquer PC.','Captura 14 usada como referência de preço e benefícios, reescritos no layout para legibilidade.','A tela 4 mostra seleção, capa e título; não foi inventada uma descrição de jogo.'],missingEssentialScreens:false},null,2));
await writeFile(join(output,'LEIA-ME.txt'),'CARROSSEL 01 — V1\n\nSete páginas, 1080x1350 (4:5). Arquivos 01 a 07 são a ordem de publicação.\nJPEG: prontos para Instagram. PNG: cópias sem perdas. SVG: layouts editáveis com capturas incorporadas.\nlegenda.txt: texto sugerido. manifest.json: fontes usadas e observações.\nOriginais preservados na pasta acima. Nenhuma publicação realizada.\nMaterial suficiente: não faltou tela essencial. A captura de seleção não inclui sinopse; o carrossel não afirma que ela está visível.\n');
console.log(output);
