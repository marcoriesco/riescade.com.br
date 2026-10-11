import { createHash } from "node:crypto";
import { isExtractPackage, downloadPackageTitle } from "./download-package";
import extractPaths from "./retrobat-extract-paths.json";

export interface CatalogRow {
  id: string; platform: string | null; filename: string; title: string;
  file_size: number | null; md5_checksum: string | null;
}
export function buildRetrobatCatalog(rows: CatalogRow[], platforms: {id:string;extensions:string[]}[]) {
  const supported=new Map(platforms.map(p=>[p.id,new Set(p.extensions.map(e=>e.toLowerCase()))]));
  const assets=rows.filter(row=>{
    const name=row.filename;
    const extension=name.slice(name.lastIndexOf(".")).toLowerCase();
    return /^[a-f0-9]{64}$/i.test(row.id) && row.platform && supported.has(row.platform)
      && (row.platform!=="ps5" || extension===".zar")
      && (isExtractPackage(name) || supported.get(row.platform)!.has(extension))
      && !/[\x00-\x1f<>:"/\\|?*]/.test(name) && !/[. ]$/.test(name)
      && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])\./i.test(name)
      && name.toLowerCase()!=="_media.zip";
  }).map(row=>({id:row.id,platform:row.platform!,title:row.title,
    download_name:row.filename,file_size:row.file_size,
    md5:row.md5_checksum,sha256:null,install_mode:isExtractPackage(row.filename)?"extract":"file",
    launch_path:isExtractPackage(row.filename)?mappedExtractPath(row)??extractLaunchPath(row.platform!,row.filename,platforms.find(p=>p.id===row.platform)!.extensions):row.filename,
  })).sort((a,b)=>a.platform.localeCompare(b.platform,"en")||a.id.localeCompare(b.id,"en"));
  const populated=new Set(assets.map(a=>a.platform));
  const media=rows.filter(row=>row.platform && populated.has(row.platform)
    && /^[a-f0-9]{64}$/i.test(row.id) && row.filename.toLowerCase()==="_media.zip")
    .map(row=>({id:row.id,platform:row.platform!,download_name:"_media.zip",file_size:row.file_size,md5:row.md5_checksum,sha256:null}))
    .sort((a,b)=>a.platform.localeCompare(b.platform,"en")||a.id.localeCompare(b.id,"en"));
  const revision=createHash("sha256").update(JSON.stringify({assets,media})).digest("hex");
  return {schema_version:1,revision,total:assets.length,platforms:[...populated],assets,media};
}
function mappedExtractPath(row:CatalogRow){
  const entry=(extractPaths as Record<string,{launch_path:string;file_size:number;md5:string}>)[`${row.platform}/${row.filename}`];
  return entry && entry.file_size===row.file_size && entry.md5===row.md5_checksum ? entry.launch_path : undefined;
}
export function extractLaunchPath(platform:string,filename:string,extensions:string[]){
  const base=downloadPackageTitle(filename);
  if(platform==="daphne")return `${base}.daphne`;
  if(platform==="singe")return `roms/${base}.zip`;
  if(platform==="namco2x6")return `${base}.acgame`;
  if(platform==="arcadedumps")return `${base}.bat`;
  if(extensions.some(ext=>base.toLowerCase().endsWith(ext.toLowerCase())))return base;
  const preferred:Record<string,string>={ps3:".ps3",psvita:".psvita",wiiu:".rpx",dos:".pc",windows:".game",teknoparrot:".teknoparrot",scummvm:".scummvm",ports:".game",snes:".sfc",dreamcast:".gdi",psx:".cue",ps2:".iso"};
  return `${base}${preferred[platform]??extensions[0]}`;
}
