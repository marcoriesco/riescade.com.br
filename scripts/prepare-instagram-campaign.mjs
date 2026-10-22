import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
const root='D:/Downloads/tmp/RIESCADE/arts/instagram/campanha-01';
await mkdir(root,{recursive:true});
const campaign=JSON.parse(await readFile('docs/instagram-campanha-01.json','utf8'));
const generated='C:/Users/marcoriesco/.codex/generated_images/01a165ac-36c1-7783-871d-a803998bce7e';
const sources=[
 'D:/Downloads/tmp/RIESCADE/arts/instagram/posts/2026-10-22_sua-infancia-tem-um-novo-play_v1.png',
 join(generated,'exec-92215aa4-d9d7-4e95-925d-17b36e577b64.png'),
 join(generated,'exec-1d472570-c790-4018-8017-08d9e23cb9e8.png'),
 join(generated,'exec-99e232bb-735e-48cf-84b2-6fbc9b5c2441.png'),
 join(generated,'exec-85ffe890-1621-4d9a-a344-a98240ffb0df.png')
];
for(const [i,p]of campaign.posts.entries()){
 await copyFile(sources[i],join(root,p.slug+'.png'));
 await sharp(sources[i]).resize(1080,1350,{fit:'contain',background:'#17131f'}).flatten({background:'#17131f'}).jpeg({quality:94}).toFile(join(root,p.slug+'.jpg'));
 await writeFile(join(root,p.slug+'.txt'),p.caption,'utf8');
}
campaign.status='ready_for_manual_publication';
await writeFile(join(root,'campaign.json'),JSON.stringify(campaign,null,2));
const thumbs=await Promise.all(campaign.posts.map(p=>sharp(join(root,p.slug+'.jpg')).resize(216,270).toBuffer()));
await sharp({create:{width:1080,height:270,channels:3,background:'#17131f'}}).composite(thumbs.map((input,i)=>({input,left:i*216,top:0}))).jpeg({quality:90}).toFile(join(root,'preview-cinco-posts.jpg'));
console.log(JSON.stringify({folder:root,posts:campaign.posts.length,format:'JPEG 1080x1350 + original PNG + captions'}));
