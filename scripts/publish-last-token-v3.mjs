import dotenv from 'dotenv';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
dotenv.config({path:'.env.local',quiet:true});
const folder='D:/Downloads/tmp/RIESCADE/arts/instagram/reels/05_a-ultima-ficha-remontado/v3';
const ids={REELS:'8b33e8dc-f730-43cb-83dc-aa6371ee167f',STORIES:'8104eb36-49b9-4778-bdef-701fb35f7821'};
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
if(process.argv.includes('--record')){
 const {data,error}=await db.from('instagram_posts').select('id,status,media_type,instagram_media_id,updated_at,error').in('id',Object.values(ids));
 if(error)throw new Error('Publication lookup failed');
 await writeFile(folder+'/publication-results.json',JSON.stringify(data,null,2));console.log(JSON.stringify(data));
}else{
 const account=await db.from('instagram_account').select('instagram_user_id,username').eq('id','primary').single();
 if(account.error||account.data?.username?.toLowerCase()!=='riescade')throw new Error('Expected account unavailable');
 const owner=await db.from('instagram_posts').select('created_by').eq('id','c956ae2f-34e8-45b2-9469-734c5990dcef').eq('account_id',account.data.instagram_user_id).single();
 if(owner.error||!owner.data)throw new Error('Verified owner unavailable');
 const bytes=await readFile(folder+'/a-ultima-ficha_v3_1080x1920.mp4');
 if(bytes.length>52428800)throw new Error('Video exceeds upload limit');
 const sha=b=>createHash('sha256').update(b).digest('hex');
 const media_path=ids.REELS+'.mp4';
 const asset=await db.storage.from('instagram-media').list('',{search:media_path});
 if(asset.error)throw new Error('Media lookup failed');
 if(!asset.data.some(row=>row.name===media_path)){
  const uploaded=await db.storage.from('instagram-media').upload(media_path,bytes,{contentType:'video/mp4',upsert:false});
  if(uploaded.error)throw new Error('Video upload failed');
 }
 const response=await fetch(db.storage.from('instagram-media').getPublicUrl(media_path).data.publicUrl);
 if(!response.ok)throw new Error('Public video unavailable');
 const remote=Buffer.from(await response.arrayBuffer());
 if(sha(remote)!==sha(bytes))throw new Error('Uploaded video differs from approved v3');
 await writeFile(folder+'/media-verification.json',JSON.stringify({matchesApprovedV3:true,bytes:bytes.length,sha256:sha(bytes),contentType:response.headers.get('content-type')},null,2));
 const caption='A nostalgia continua. 🕹️💚\n\nConheça o RIESCADE: arcades, clássicos, portáteis e temas para explorar no seu PC.\n\nVeja o projeto em riescade.com.br — link no perfil.\n\nQual sistema marcou a sua infância? Conta nos comentários!\n\n#RIESCADE #Retrogaming #Fliperama #JogosRetro #NostalgiaGamer';
 for(const [media_type,id]of Object.entries(ids)){
  const existing=await db.from('instagram_posts').select('id,status,media_type').eq('id',id).maybeSingle();
  if(existing.error)throw new Error('Publication lookup failed');
  if(existing.data){console.log(JSON.stringify(existing.data));continue;}
  const result=await db.from('instagram_posts').insert({id,account_id:account.data.instagram_user_id,created_by:owner.data.created_by,media_path,media_type,caption:media_type==='STORIES'?'Story — A nostalgia continua (vídeo v3 aprovado).':caption,status:'draft'});
  if(result.error)throw new Error('Draft creation failed');
  console.log(JSON.stringify({id,media_type,status:'draft'}));
 }
 await writeFile(folder+'/legenda-reel.txt',caption);
}
