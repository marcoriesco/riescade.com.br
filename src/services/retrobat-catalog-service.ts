import gamesCatalog from "@/data/games-catalog.json";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { buildRetrobatCatalog, type CatalogRow } from "@/lib/retrobat-catalog";

export async function generateRetrobatCatalog() {
  const rows:CatalogRow[]=[];
  for(let offset=0;;offset+=1000){
    const {data,error}=await getSupabaseAdmin().from("download_assets")
      .select("id,platform,filename,title,file_size,md5_checksum,install_name")
      .eq("category","rom").eq("active",true).order("id").range(offset,offset+999);
    if(error)throw new Error(`Unable to export RetroBat catalog: ${error.message}`);
    rows.push(...(data??[]) as CatalogRow[]);
    if((data??[]).length<1000)break;
  }
  return buildRetrobatCatalog(rows,gamesCatalog.platforms);
}
