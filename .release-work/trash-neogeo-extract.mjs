import dotenv from 'dotenv';
import {GoogleAuth} from 'google-auth-library';
import {readFile,writeFile,stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
dotenv.config({path:'.env.local',quiet:true});
const work='D:/Downloads/tmp/RIESCADE/tmp/RIESCADE_RETROBAT/.release-work/neogeo-extract';
const manifest=JSON.parse(await readFile(path.join(work,'downloads-manifest.json'),'utf8'));
if(manifest.files.length!==47)throw Error('Expected exactly 47 verified downloads');
const expected=new Map(manifest.files.map(f=>[f.filename,f]));
const auth=new GoogleAuth({credentials:{client_email:process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,private_key:process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g,'\n')},scopes:['https://www.googleapis.com/auth/drive']});
const client=await auth.getClient();
async function list(parent){let files=[],pageToken;do{const response=await client.request({url:'https://www.googleapis.com/drive/v3/files',params:{q:`'${parent}' in parents and trashed = false`,fields:'nextPageToken,files(id,name,mimeType,size,md5Checksum,parents,capabilities(canTrash))',pageSize:1000,supportsAllDrives:true,includeItemsFromAllDrives:true,pageToken}});files.push(...response.data.files);pageToken=response.data.nextPageToken;}while(pageToken);return files;}
const roots=await list(process.env.GOOGLE_SHARED_DRIVE_ID);
const roms=roots.filter(f=>f.name.toLowerCase()==='roms');if(roms.length!==1)throw Error('Ambiguous roms folder');
const systems=await list(roms[0].id);const neo=systems.filter(f=>f.name.toLowerCase()==='neogeo');if(neo.length!==1)throw Error('Ambiguous Neo Geo folder');
const remote=await list(neo[0].id);
const targets=remote.filter(f=>expected.has(f.name));
if(process.argv.includes('--audit')){console.log(JSON.stringify({remaining:targets.length,files:targets.map(f=>({id:f.id,name:f.name}))},null,2));process.exit(0);}
if(targets.length!==47)throw Error(`Expected exactly 47 matching Neo Geo packages, got ${targets.length}`);
for(const file of targets){
 const old=expected.get(file.name);
 if(!file.name.endsWith('.extract.zip')||Number(file.size)!==old.size||file.md5Checksum!==old.md5||file.capabilities?.canTrash!==true)throw Error('Remote validation: '+JSON.stringify({name:file.name,sizeMatches:Number(file.size)===old.size,md5Matches:file.md5Checksum===old.md5,canTrash:file.capabilities?.canTrash}));
 const local=path.join(work,'downloads',file.name);const hash=createHash('md5');for await(const chunk of createReadStream(local))hash.update(chunk);
 if((await stat(local)).size!==old.size||hash.digest('hex')!==old.md5)throw Error('Local copy mismatch: '+file.name);
}
const report={started:new Date().toISOString(),folder:neo[0].id,targets,trashed:[],verified:false};
const reportPath=path.join(work,'drive-trash-report.json');await writeFile(reportPath,JSON.stringify(report,null,2)+'\n');
for(const file of targets){
 const result=await client.request({url:`https://www.googleapis.com/drive/v3/files/${file.id}`,method:'PATCH',params:{supportsAllDrives:true,fields:'id,name,trashed'},data:{trashed:true}});
 if(result.data.trashed!==true||result.data.id!==file.id)throw Error('Trash verification failed: '+file.name);
 report.trashed.push(result.data);await writeFile(reportPath,JSON.stringify(report,null,2)+'\n');console.log(`${report.trashed.length}/47 trashed ${file.name}`);
}
const remaining=await list(neo[0].id);if(remaining.some(f=>targets.some(t=>t.id===f.id)))throw Error('A target is still active');
const untouched=remote.filter(f=>!targets.some(t=>t.id===f.id));if(!untouched.every(f=>remaining.some(x=>x.id===f.id)))throw Error('Unrelated file inventory changed');
report.verified=true;report.completed=new Date().toISOString();await writeFile(reportPath,JSON.stringify(report,null,2)+'\n');
console.log('Verified: only the 47 requested packages were moved to trash; local downloads preserved.');
