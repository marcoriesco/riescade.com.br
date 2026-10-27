import dotenv from 'dotenv';
import {GoogleAuth} from 'google-auth-library';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {inflateRawSync,crc32} from 'node:zlib';
import {createHash} from 'node:crypto';
dotenv.config({path:'.env.local',quiet:true});
const root='D:/Downloads/tmp/RIESCADE/tmp/RIESCADE_RETROBAT';
const work=root+'/.release-work/neogeocd-fanart';await mkdir(work,{recursive:true});
const client=await new GoogleAuth({credentials:{client_email:process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,private_key:process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g,'\n')},scopes:['https://www.googleapis.com/auth/drive.readonly']}).getClient();
const files=await client.request({url:'https://www.googleapis.com/drive/v3/files',params:{q:"'1sAoFixQQXH2FLh0_oRBN4P2ptPldtr_z' in parents and trashed=false and name='_media.zip'",supportsAllDrives:true,includeItemsFromAllDrives:true,fields:'files(id,name,size,md5Checksum)'}});
if(files.data.files.length!==1)throw Error('Expected one Neo Geo media archive');
const file=files.data.files[0],size=Number(file.size);
async function range(start,end){const response=await client.request({url:`https://www.googleapis.com/drive/v3/files/${file.id}`,params:{alt:'media',supportsAllDrives:true},headers:{Range:`bytes=${start}-${end}`},responseType:'stream'});if(response.status!==206){response.data.destroy();throw Error('Range unsupported');}const chunks=[];let length=0;for await(const c of response.data){length+=c.length;if(length>end-start+1){response.data.destroy();throw Error('Oversized range');}chunks.push(c);}const result=Buffer.concat(chunks);if(result.length!==end-start+1)throw Error('Short range');return result;}
const tail=await range(Math.max(0,size-65557),size-1);let eo=-1;for(let p=tail.length-22;p>=0;p--){if(tail.readUInt32LE(p)===0x06054b50){eo=p;break;}}if(eo<0)throw Error('ZIP directory not found');
const cdSize=tail.readUInt32LE(eo+12),cdOffset=tail.readUInt32LE(eo+16);if(cdSize>8e6)throw Error('Oversized directory');const cd=await range(cdOffset,cdOffset+cdSize-1),entries=new Map();
for(let p=0;p<cd.length;){if(cd.readUInt32LE(p)!==0x02014b50)throw Error('Invalid ZIP directory');const n=cd.readUInt16LE(p+28),e=cd.readUInt16LE(p+30),c=cd.readUInt16LE(p+32);const name=cd.subarray(p+46,p+46+n).toString('utf8');entries.set(name,{method:cd.readUInt16LE(p+10),crc:cd.readUInt32LE(p+16),compressed:cd.readUInt32LE(p+20),size:cd.readUInt32LE(p+24),offset:cd.readUInt32LE(p+42)});p+=46+n+e+c;}
const receipt=JSON.parse(await readFile(root+'/system/riescade-native/state/media/neogeo/installed.json','utf8'));
const sources=[];
for(const [rom,title]of [['janshin','Janshin Densetsu - Quest of Jongmaster'],['quizkof','Quiz King of Fighters'],['totc','Treasure of The Caribbean'],['zintrckb','Zintrick']]){
 const name=`media/fanart/${rom}.webp`;const entry=entries.get(name);if(!entry||entry.size>8e6)throw Error('Missing or oversized fanart '+name);
 const h=await range(entry.offset,entry.offset+29);if(h.readUInt32LE(0)!==0x04034b50)throw Error('Invalid local header');const start=entry.offset+30+h.readUInt16LE(26)+h.readUInt16LE(28);const compressed=await range(start,start+entry.compressed-1);const raw=entry.method===0?compressed:entry.method===8?inflateRawSync(compressed):null;
 if(!raw||raw.length!==entry.size||(crc32(raw)>>>0)!==entry.crc)throw Error('CRC mismatch');const hash=createHash('sha256').update(raw).digest('hex');const previous=receipt.outputs.find(o=>o.path===name);if(previous&&previous.sha256!==hash)throw Error('Installed media receipt differs');
 await writeFile(`${work}/${title}.webp`,raw);sources.push({game:title,source:`https://drive.google.com/file/d/${file.id}/view`,archive:'neogeo/_media.zip',entry:name,sha256:hash,size:raw.length});console.log(title+': fanart fetched and CRC verified');
}
await writeFile(work+'/sources.json',JSON.stringify(sources,null,2)+'\n');
