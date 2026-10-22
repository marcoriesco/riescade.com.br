import dotenv from 'dotenv';
import {readFile,writeFile} from 'node:fs/promises';
import {createClient} from '@supabase/supabase-js';
dotenv.config({path:'.env.local',quiet:true});
const folder='D:/Downloads/tmp/RIESCADE/arts/instagram/reels/01_sua-infancia-tem-um-novo-play';
const id='c956ae2f-34e8-45b2-9469-734c5990dcef';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
if(process.argv.includes('--record')){
 const {data,error}=await db.from('instagram_posts').select('id,status,instagram_media_id,updated_at,error').eq('id',id).single();
 if(error)throw new Error('Reel status unavailable');
 await writeFile(folder+'/publication-result.json',JSON.stringify(data,null,2));console.log(JSON.stringify(data));
 process.exit(0);
}
const existing=await db.from('instagram_posts').select('id,status').eq('id',id).maybeSingle();
if(existing.error)throw new Error('Reel lookup failed');
if(existing.data){console.log(JSON.stringify(existing.data));process.exit(0);}
const account=await db.from('instagram_account').select('instagram_user_id,username').eq('id','primary').single();
if(account.error||account.data?.username?.toLowerCase()!=='riescade')throw new Error('Expected account unavailable');
const owner=await db.from('instagram_posts').select('created_by').eq('id','9784c777-75dd-44a1-a52f-5fa4d7a875cb').eq('account_id',account.data.instagram_user_id).single();
if(owner.error||!owner.data)throw new Error('Campaign owner unavailable');
const bucket=await db.storage.getBucket('instagram-media');
if(bucket.error||!bucket.data)throw new Error('Bucket unavailable');
const allowed=bucket.data.allowed_mime_types;
if(allowed&&!allowed.includes('video/mp4')){
 const updated=await db.storage.updateBucket('instagram-media',{public:bucket.data.public,fileSizeLimit:bucket.data.file_size_limit??8388608,allowedMimeTypes:[...allowed,'video/mp4']});
 if(updated.error)throw new Error('Could not enable MP4 media');
}
const media_path=id+'.mp4';
const bytes=await readFile(folder+'/riescade-reel-01_1080x1920.mp4');
if(bytes.length>8388608)throw new Error('Video exceeds media limit');
const upload=await db.storage.from('instagram-media').upload(media_path,bytes,{contentType:'video/mp4',upsert:false});
if(upload.error)throw new Error('Video upload failed');
const caption=await readFile(folder+'/legenda.txt','utf8');
const inserted=await db.from('instagram_posts').insert({id,account_id:account.data.instagram_user_id,created_by:owner.data.created_by,media_path,caption,status:'draft'});
if(inserted.error)throw new Error('Reel draft failed');
console.log(JSON.stringify({id,status:'draft',username:'riescade',type:'REELS'}));
