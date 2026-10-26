import {describe,it,expect} from "vitest";
import {buildRetrobatCatalog,type CatalogRow} from "./retrobat-catalog";
import extractPaths from "./retrobat-extract-paths.json";
const row:CatalogRow={id:"a".repeat(64),platform:"snes",filename:"Mario.zip",title:"Mario",file_size:3,md5_checksum:"b".repeat(32)};
const platforms=[{id:"snes",extensions:[".zip"]},{id:"nes",extensions:[".nes"]}];
describe("RetroBat marker snapshot",()=>{
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
    const rows=Object.entries(extractPaths).map(([key,value],index)=>({...row,id:index.toString(16).padStart(64,"0"),platform:"lindbergh",filename:key.split("/")[1],file_size:value.file_size,md5_checksum:value.md5}));
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
  it("excludes unsafe names, media and unsupported systems",()=>{
    const rows=["../Mario.zip","CON.zip","_media.zip","Mario.exe"].map(filename=>({...row,filename}));
    expect(buildRetrobatCatalog([...rows,{...row,platform:"unknown"}],platforms).total).toBe(0);
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
