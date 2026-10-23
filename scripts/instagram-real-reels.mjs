import dotenv from 'dotenv';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
dotenv.config({path:'.env.local',quiet:true});
const root='D:/Downloads/tmp/RIESCADE/arts/instagram/reels/capturas-reais-01';
const slugs=['02_riescade-em-acao','03_navegue-pela-biblioteca','04_dois-visuais-riescade'];
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const account=await db.from('instagram_account').select('instagram_user_id,username').eq('id','primary').single();
if(account.error||account.data?.username?.toLowerCase()!=='riescade')throw new Error('Expected account unavailable');
const owner=await db.from('instagram_posts').select('created_by').eq('id','c956ae2f-34e8-45b2-9469-734c5990dcef').eq('account_id',account.data.instagram_user_id).single();
if(owner.error||!owner.data)throw new Error('Verified owner unavailable');
const results=[];
for(const slug of slugs){
 const hex=createHash('sha256').update('riescade-real-reels-01-'+slug).digest('hex');
 const id=`${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
 const folder=root+'/'+slug;
 const existing=await db.from('instagram_posts').select('id,status,instagram_media_id,updated_at,error').eq('id',id).maybeSingle();
 if(existing.error)throw new Error('Draft lookup failed');
 if(process.argv.includes('--record')){
  if(!existing.data)throw new Error('Missing record');
  await writeFile(folder+'/publication-result.json',JSON.stringify(existing.data,null,2));results.push({slug,...existing.data});continue;
 }
 if(existing.data){results.push({slug,...existing.data});continue;}
 const bytes=await readFile(folder+'/'+slug+'_1080x1920.mp4');
 if(bytes.length>8388608)throw new Error('Media too large');
 const caption=await readFile(folder+'/legenda.txt','utf8');
 if(!caption.trim()||[...caption].length>2200)throw new Error('Invalid caption');
 const media_path=id+'.mp4';
 const upload=await db.storage.from('instagram-media').upload(media_path,bytes,{contentType:'video/mp4',upsert:false});
 if(upload.error)throw new Error('Video upload failed');
 const response=await fetch(db.storage.from('instagram-media').getPublicUrl(media_path).data.publicUrl);
 if(!response.ok)throw new Error('Public media unavailable');
 const remote=Buffer.from(await response.arrayBuffer());
 const hash=b=>createHash('sha256').update(b).digest('hex');
 if(hash(remote)!==hash(bytes))throw new Error('Media integrity mismatch');
 await writeFile(folder+'/media-verification.json',JSON.stringify({matchesApprovedFile:true,sha256:hash(bytes),bytes:bytes.length,contentType:response.headers.get('content-type')},null,2));
 const insert=await db.from('instagram_posts').insert({id,account_id:account.data.instagram_user_id,created_by:owner.data.created_by,media_path,caption,status:'draft'});
 if(insert.error)throw new Error('Could not create draft');
 results.push({slug,id,status:'draft'});
}
await writeFile(root+'/publication-results.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results));
