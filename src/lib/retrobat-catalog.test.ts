import {describe,it,expect} from "vitest";
import {buildRetrobatCatalog,type CatalogRow} from "./retrobat-catalog";
import extractPaths from "./retrobat-extract-paths.json";
const row:CatalogRow={id:"a".repeat(64),platform:"snes",filename:"Mario.zip",title:"Mario",file_size:3,md5_checksum:"b".repeat(32)};
const platforms=[{id:"snes",extensions:[".zip"]},{id:"nes",extensions:[".nes"]}];
describe("RetroBat marker snapshot",()=>{
  it("preserves direct ROM folders while keeping download names and existing extraction rules",()=>{
    const result=buildRetrobatCatalog([
      {...row,platform:"neogeo",filename:"cabalng.zip",install_name:"+ports/Arcade/cabalng.zip"},
      {...row,id:"c".repeat(64),platform:"neogeo",filename:"cabalng.extract.zip",install_name:"Packages/cabalng.extract.zip",file_size:extractPaths["neogeo/cabalng.extract.zip"].file_size,md5_checksum:extractPaths["neogeo/cabalng.extract.zip"].md5},
    ],[{id:"neogeo",extensions:[".zip"]}]);
    expect(result.assets.find(a=>a.install_mode==="file")).toMatchObject({download_name:"cabalng.zip",launch_path:"+ports/Arcade/cabalng.zip"});
    expect(result.assets.find(a=>a.install_mode==="extract")?.launch_path).toBe("+ports/cabalng.zip");
    for(const install_name of ["../cabalng.zip","/cabalng.zip","+ports/../cabalng.zip","CON/cabalng.zip","+ports/other.zip"]){
      expect(buildRetrobatCatalog([{...row,filename:"cabalng.zip",install_name}],platforms).total).toBe(0);
    }
  });
  it("preserves all four verified Neo Geo folders",()=>{
    const rows=Object.entries(extractPaths).filter(([key])=>key.startsWith("neogeo/")).map(([key,value],index)=>({...row,id:index.toString(16).padStart(64,"0"),platform:"neogeo",filename:key.slice(7),file_size:value.file_size,md5_checksum:value.md5}));
    const result=buildRetrobatCatalog(rows,[{id:"neogeo",extensions:[".zip"]}]);
    expect(result.assets).toHaveLength(47);
    const counts:Record<string,number>={};
    for(const asset of result.assets){
      expect(asset.install_mode).toBe("extract");
      expect(asset.launch_path).toBe(extractPaths[`neogeo/${asset.download_name}` as keyof typeof extractPaths].launch_path);
      const folder=asset.launch_path.split("/")[0];counts[folder]=(counts[folder]??0)+1;
    }
    expect(counts).toEqual({"+homebrew":26,"+ports":7,"+hacks":8,"+unreleased":6});
  });
  it("preserves all four verified Neo Geo folders",()=>{
    const rows=Object.entries(extractPaths).filter(([key])=>key.startsWith("neogeo/")).map(([key,value],index)=>({...row,id:index.toString(16).padStart(64,"0"),platform:"neogeo",filename:key.slice(7),file_size:value.file_size,md5_checksum:value.md5}));
    const result=buildRetrobatCatalog(rows,[{id:"neogeo",extensions:[".zip"]}]);
    expect(result.assets).toHaveLength(47);
    const counts:Record<string,number>={};
    for(const asset of result.assets){
      expect(asset.install_mode).toBe("extract");
      expect(asset.launch_path).toBe(extractPaths[`neogeo/${asset.download_name}` as keyof typeof extractPaths].launch_path);
      const folder=asset.launch_path.split("/")[0];counts[folder]=(counts[folder]??0)+1;
    }
    expect(counts).toEqual({"+homebrew":26,"+ports":7,"+hacks":8,"+unreleased":6});
  });
  it("keeps N64 ZIPs direct and routes all Japanese packages into the shared system",()=>{
    const rows=Object.entries(extractPaths).filter(([key])=>key.startsWith("n64/")).map(([key,value],index)=>({...row,id:index.toString(16).padStart(64,"0"),platform:"n64",filename:key.slice(4),file_size:value.file_size,md5_checksum:value.md5}));
    expect(rows).toHaveLength(88);
    const result=buildRetrobatCatalog([...rows,{...row,platform:"n64",filename:"Example (USA).zip"},{...row,platform:"n64",filename:"_media.zip"},{...row,platform:"n64j"}],[{id:"n64",extensions:[".z64",".n64",".zip"]}]);
    expect(result.platforms).toEqual(["n64"]);
    expect(result.assets).toHaveLength(89);
    expect(result.media).toHaveLength(1);
    expect(result.assets.find(asset=>asset.download_name==="Example (USA).zip")).toMatchObject({install_mode:"file",launch_path:"Example (USA).zip"});
    for(const asset of result.assets.filter(asset=>asset.install_mode==="extract")){
      expect(asset.launch_path).toBe(`+japan/${asset.download_name.replace(/\.extract\.zip$/, ".z64")}`);
    }
  });
  it("exports Arcade Dumps packages with BAT launchers",()=>{
    const result=buildRetrobatCatalog([{...row,platform:"arcadedumps",filename:"Halo Fireteam Raven.extract.zip"}],[{id:"arcadedumps",extensions:[".bat",".cmd"]}]);
    expect(result.assets[0]).toMatchObject({platform:"arcadedumps",download_name:"Halo Fireteam Raven.extract.zip",launch_path:"Halo Fireteam Raven.bat",install_mode:"extract"});
  });
  it("exports Kitsune packages with .game launchers",()=>{
    const result=buildRetrobatCatalog([{...row,platform:"pgm3viper",filename:"Silent Scope EX.extract.zip"}],[{id:"pgm3viper",extensions:[".game"]}]);
    expect(result.assets[0]).toMatchObject({platform:"pgm3viper",download_name:"Silent Scope EX.extract.zip",launch_path:"Silent Scope EX.game",install_mode:"extract"});
  });
  it("exports PS5 only as direct ZAR files",()=>{
    const rows=["Test.zar","Old.game","Old.extract.zip"].map((filename,index)=>({...row,id:index.toString(16).padStart(64,"0"),platform:"ps5",filename}));
    const result=buildRetrobatCatalog(rows,[{id:"ps5",extensions:[".game",".zar",".zip"]}]);
    expect(result.assets).toHaveLength(1);
    expect(result.assets[0]).toMatchObject({download_name:"Test.zar",launch_path:"Test.zar",install_mode:"file"});
  });
  it("uses all verified Lindbergh paths and rejects outdated package mappings",()=>{
    const rows=Object.entries(extractPaths).filter(([key])=>key.startsWith("lindbergh/")).map(([key,value],index)=>({...row,id:index.toString(16).padStart(64,"0"),platform:"lindbergh",filename:key.split("/")[1],file_size:value.file_size,md5_checksum:value.md5}));
    const result=buildRetrobatCatalog(rows,[{id:"lindbergh",extensions:[".game"]}]);
    expect(result.assets).toHaveLength(26);
    for(const asset of result.assets){expect(asset.launch_path).toBe(extractPaths[`lindbergh/${asset.download_name}` as keyof typeof extractPaths].launch_path);}
    const stale=buildRetrobatCatalog([{...rows.find(row=>row.filename==="vtennis3.extract.zip")!,md5_checksum:"f".repeat(32)}],[{id:"lindbergh",extensions:[".game"]}]);
    expect(stale.assets[0].launch_path).toBe("vtennis3.game");
  });
  it("exports only populated platforms and sanitized metadata",()=>{
    const result=buildRetrobatCatalog([{...row,web_content_link:"secret",drive_file_id:"secret"} as CatalogRow],platforms);
    expect(result.platforms).toEqual(["snes"]);expect(result.total).toBe(1);
    expect(JSON.stringify(result)).not.toContain("secret");
  });
  it("keeps Japanese packages and shared media in the single 3do catalog",()=>{
    const rows=Object.entries(extractPaths).filter(([key,value])=>key.startsWith("3do/")&&value.launch_path.startsWith("+japan/")).map(([key,value],index)=>({...row,id:index.toString(16).padStart(64,"0"),platform:"3do",filename:key.slice(4),file_size:value.file_size,md5_checksum:value.md5}));
    const media={...row,id:"f".repeat(64),platform:"3do",filename:"_media.zip"};
    const result=buildRetrobatCatalog([...rows,media,{...row,platform:"3doj"}],[{id:"3do",extensions:[".cue",".iso",".chd"]}]);
    expect(result.assets).toHaveLength(38);
    expect(result.platforms).toEqual(["3do"]);
    expect(result.media).toHaveLength(1);
    for(const asset of result.assets){
      expect(asset.install_mode).toBe("extract");
      expect(asset.launch_path).toBe(`+japan/${asset.download_name.replace(/\.extract\.zip$/, ".chd")}`);
    }
  });
  it("excludes unsafe names, media and unsupported systems",()=>{
    const rows=["../Mario.zip","CON.zip","_media.zip","Mario.exe"].map(filename=>({...row,filename}));
    expect(buildRetrobatCatalog([...rows,{...row,platform:"unknown"}],platforms).total).toBe(0);
  });
  it("exports all four verified 3DO multidisc packages through their M3U entry",()=>{
    const rows=Object.entries(extractPaths).filter(([key,value])=>key.startsWith("3do/")&&value.launch_path.endsWith(".m3u")).map(([key,value],index)=>({...row,id:index.toString(16).padStart(64,"0"),platform:"3do",filename:key.slice(4),file_size:value.file_size,md5_checksum:value.md5}));
    const result=buildRetrobatCatalog(rows,[{id:"3do",extensions:[".cue",".iso",".chd",".m3u"]}]);
    expect(result.assets).toHaveLength(4);
    for(const asset of result.assets){
      expect(asset.install_mode).toBe("extract");
      expect(asset.launch_path).toBe(asset.download_name.replace(/\.extract\.zip$/, ".m3u"));
    }
  });
  it("includes extract packages with separate download and launch names",()=>{
    const result=buildRetrobatCatalog([{...row,filename:"Mario.extract.zip"}],platforms);
    expect(result.assets[0]).toMatchObject({download_name:"Mario.extract.zip",launch_path:"Mario.sfc",install_mode:"extract"});
    const daphne=buildRetrobatCatalog([{...row,platform:"daphne",filename:"astron.extract.zip"}],[{id:"daphne",extensions:[".daphne"]}]);
    expect(daphne.assets[0].launch_path).toBe("astron.daphne");
  });
  it("has a stable revision regardless of input order and changes with metadata",()=>{
    const other={...row,id:"c".repeat(64)};
    expect(buildRetrobatCatalog([row,other],platforms).revision).toBe(buildRetrobatCatalog([other,row],platforms).revision);
    expect(buildRetrobatCatalog([row],platforms).revision).not.toBe(buildRetrobatCatalog([{...row,md5_checksum:"d".repeat(32)}],platforms).revision);
  });
  it("exports media separately only for populated systems and tracks updates",()=>{
    const pack={...row,id:"e".repeat(64),filename:"_media.zip"};
    const result=buildRetrobatCatalog([row,pack,{...pack,id:"f".repeat(64),platform:"nes"}],platforms);
    expect(result.total).toBe(1);expect(result.media).toHaveLength(1);
    expect(result.media[0]).toMatchObject({platform:"snes",download_name:"_media.zip"});
    expect(result.revision).not.toBe(buildRetrobatCatalog([row,{...pack,md5_checksum:"f".repeat(32)}],platforms).revision);
  });
});
