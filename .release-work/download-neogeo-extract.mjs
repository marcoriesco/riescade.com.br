import dotenv from 'dotenv';
import {GoogleAuth} from 'google-auth-library';
import {mkdir,readFile,rename,writeFile,stat} from 'node:fs/promises';
import {createWriteStream,createReadStream} from 'node:fs';
import {pipeline} from 'node:stream/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
dotenv.config({path:'.env.local',quiet:true});
const root='D:/Downloads/tmp/RIESCADE/tmp/RIESCADE_RETROBAT';
const output=path.join(root,'.release-work/neogeo-extract/downloads');
await mkdir(output,{recursive:true});
const auth=new GoogleAuth({credentials:{client_email:process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,private_key:process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g,'\n')},scopes:['https://www.googleapis.com/auth/drive.readonly']});
const client=await auth.getClient();
async function list(parent){let files=[],pageToken;do{const response=await client.request({url:'https://www.googleapis.com/drive/v3/files',params:{q:`'${parent}' in parents and trashed = false`,fields:'nextPageToken,files(id,name,mimeType,size,md5Checksum)',pageSize:1000,supportsAllDrives:true,includeItemsFromAllDrives:true,pageToken}});files.push(...response.data.files);pageToken=response.data.nextPageToken;}while(pageToken);return files;}
let files=await list(process.env.GOOGLE_SHARED_DRIVE_ID);
const roms=files.find(f=>f.name.toLowerCase()==='roms');if(!roms)throw Error('roms folder absent');
files=await list(roms.id);const neogeo=files.find(f=>f.name.toLowerCase()==='neogeo');if(!neogeo)throw Error('neogeo folder absent');
files=(await list(neogeo.id)).filter(f=>f.name.toLowerCase().endsWith('.extract.zip'));
const catalog=JSON.parse(await readFile(path.join(root,'system/riescade-native/catalog.json'),'utf8'));
const expected=catalog.assets.filter(a=>a.platform==='neogeo'&&a.download_name.endsWith('.extract.zip'));
for(const a of expected)if(!files.some(f=>f.name===a.download_name))throw Error('Missing remote package: '+a.download_name);
console.log(`Downloading ${files.length} extract packages; ${files.reduce((n,f)=>n+Number(f.size),0)} bytes`);
async function md5(file){const hash=createHash('md5');for await(const chunk of createReadStream(file))hash.update(chunk);return hash.digest('hex');}
let cursor=0;const completed=[];
async function worker(){while(cursor<files.length){const file=files[cursor++];if(path.basename(file.name)!==file.name)throw Error('Unsafe filename');const target=path.join(output,file.name);let valid=false;try{valid=(await stat(target)).size===Number(file.size)&&await md5(target)===file.md5Checksum;}catch{}
if(!valid){const response=await client.request({url:`https://www.googleapis.com/drive/v3/files/${file.id}`,params:{alt:'media',supportsAllDrives:true},responseType:'stream'});const part=target+'.partial';await pipeline(response.data,createWriteStream(part));if((await stat(part)).size!==Number(file.size)||await md5(part)!==file.md5Checksum)throw Error('Hash mismatch: '+file.name);await rename(part,target);}
completed.push({filename:file.name,size:Number(file.size),md5:file.md5Checksum});console.log(`${completed.length}/${files.length} ${file.name}`);}}
await Promise.all([worker(),worker(),worker()]);
await writeFile(path.join(output,'../downloads-manifest.json'),JSON.stringify({files:completed,remoteChanged:false},null,2)+'\n');
console.log('Complete; all sizes and MD5 verified.');
