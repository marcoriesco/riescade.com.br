import 'dotenv/config';
import dotenv from 'dotenv';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
dotenv.config({path:'.env.local',quiet:true});
const folder='D:/Downloads/tmp/RIESCADE/arts/instagram/campanha-01';
const campaign=JSON.parse(await readFile(join(folder,'campaign.json'),'utf8'));
const email=process.argv[2];
if(!email)throw new Error('Pass the email visible in the authenticated admin dashboard');
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
let owner;
for(let page=1;page<=20;page++){
 const {data,error}=await db.auth.admin.listUsers({page,perPage:100});
 if(error)throw new Error('User lookup failed');
 owner=data.users.find(u=>u.email?.toLowerCase()===email.toLowerCase());
 if(owner||data.users.length<100)break;
}
if(!owner)throw new Error('Dashboard owner not found');
const account=await db.from('instagram_account').select('instagram_user_id,username').eq('id','primary').single();
if(account.error||account.data?.username?.toLowerCase()!=='riescade')throw new Error('Expected Instagram account unavailable');
const results=[];
for(const p of campaign.posts){
 const hex=createHash('sha256').update('riescade-campaign-01-'+p.slug).digest('hex');
 const id=`${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
 const existing=await db.from('instagram_posts').select('id,status').eq('id',id).maybeSingle();
 if(existing.error)throw new Error('Draft lookup failed');
 if(existing.data){results.push({order:p.order,...existing.data});continue;}
 const media_path=id+'.jpg';
 const upload=await db.storage.from('instagram-media').upload(media_path,await readFile(join(folder,p.slug+'.jpg')),{contentType:'image/jpeg',upsert:false});
 if(upload.error)throw new Error('Upload failed');
 const insert=await db.from('instagram_posts').insert({id,account_id:account.data.instagram_user_id,caption:p.caption,media_path,created_by:owner.id,status:'draft'});
 if(insert.error)throw new Error('Draft creation failed');
 results.push({order:p.order,id,status:'draft'});
}
await writeFile(join(folder,'draft-results.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify({username:'riescade',drafts:results}));
