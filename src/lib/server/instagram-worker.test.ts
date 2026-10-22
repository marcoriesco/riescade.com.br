import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
const mocks=vi.hoisted(()=>({ graph:vi.fn(),refreshToken:vi.fn(),getSupabaseAdmin:vi.fn() }));
vi.mock('./instagram-api',()=>({...mocks,InstagramError:class extends Error{code=190;}}));
vi.mock('./supabase-admin',()=>({getSupabaseAdmin:mocks.getSupabaseAdmin}));
vi.mock('./instagram-security',()=>({seal:(s:string)=>s,unseal:(s:string)=>s}));
import { publishDuePost } from './instagram-worker';

type Row=Record<string,unknown>;
let post:Row;
let account:Row;
// In-memory conditional updates model PostgREST's compare-and-set behavior.
function table(name:string) {
  const filters:Array<(row:Row)=>boolean>=[];
  let change:Row|undefined;
  let selected=false;
  let single=false;
  const builder={
    select:()=>{selected=true;return builder;},
    update:(value:Row)=>{change=value;return builder;},
    eq:(key:string,value:unknown)=>{filters.push(r=>r[key]===value);return builder;},
    in:(key:string,values:unknown[])=>{filters.push(r=>values.includes(r[key]));return builder;},
    lt:(key:string,value:string)=>{filters.push(r=>String(r[key])<value);return builder;},
    lte:(key:string,value:string)=>{filters.push(r=>String(r[key])<=value);return builder;},
    order:()=>builder,limit:()=>builder,
    maybeSingle:()=>{single=true;return builder;},
    then:(resolve:(value:unknown)=>unknown)=>{
      const row=name==='instagram_account' ? account:post;
      const matches=filters.every(f=>f(row));
      if(matches&&change)Object.assign(row,change);
      const data=matches ? (single ? {...row} : selected ? [{...row}]:null) : single ? null:[];
      return Promise.resolve(resolve({data,error:null}));
    },
  };
  return builder;
}
beforeEach(()=>{
  vi.resetAllMocks();vi.stubEnv('INSTAGRAM_PUBLISHING_ENABLED','true');
  account={id:'primary',instagram_user_id:'ig1',encrypted_token:'token',expires_at:new Date(Date.now()+30*86400000).toISOString(),refreshed_at:new Date().toISOString()};
  post={id:'p1',account_id:'ig1',caption:'Approved',media_path:'image.jpg',scheduled_at:new Date(Date.now()-1000).toISOString(),updated_at:new Date().toISOString(),status:'scheduled',attempts:0,container_id:null};
  mocks.getSupabaseAdmin.mockReturnValue({from:table,storage:{from:()=>({getPublicUrl:()=>({data:{publicUrl:'https://assets.example/image.jpg'}})})}});
  mocks.graph.mockImplementation(async(path:string)=>path.endsWith('/media') ? {id:'container'} : path.endsWith('/media_publish') ? {id:'published'} : {status_code:'FINISHED'});
});
afterEach(()=>vi.unstubAllEnvs());
describe('Instagram publisher',()=>{
  it('creates a Reel container and preserves manual control while video is processing',async()=>{
    vi.stubEnv('INSTAGRAM_PUBLISHING_ENABLED','false');post.status='draft';post.media_path='reel.mp4';
    mocks.graph.mockImplementation(async(path:string)=>path.endsWith('/media')?{id:'video-container'}:{status_code:'IN_PROGRESS'});
    expect(await publishDuePost({postId:'p1'})).toEqual({state:'preparing'});
    expect(mocks.graph).toHaveBeenCalledWith('ig1/media','token',expect.objectContaining({media_type:'REELS',video_url:'https://assets.example/image.jpg',share_to_feed:'true'}),true);
    expect(post.status).toBe('draft');expect(post.container_id).toBe('video-container');
    mocks.graph.mockImplementation(async(path:string)=>path.endsWith('/media_publish')?{id:'reel-published'}:{status_code:'FINISHED'});
    expect(await publishDuePost({postId:'p1'})).toEqual({state:'published'});
    expect(post.instagram_media_id).toBe('reel-published');
  });
  it('publishes only the admin-selected draft manually while automation is disabled',async()=>{
    vi.stubEnv('INSTAGRAM_PUBLISHING_ENABLED','false');post.status='draft';
    expect(await publishDuePost({postId:'other'})).toEqual({state:'idle'});
    expect(mocks.graph).not.toHaveBeenCalled();
    expect(await publishDuePost({postId:'p1'})).toEqual({state:'published'});
    expect(post.status).toBe('published');
    expect(await publishDuePost({postId:'p1'})).toEqual({state:'idle'});
  });
  it('has a master off switch and never publishes drafts',async()=>{
    vi.stubEnv('INSTAGRAM_PUBLISHING_ENABLED','false');
    expect(await publishDuePost()).toEqual({state:'disabled'});
    expect(mocks.getSupabaseAdmin).not.toHaveBeenCalled();
    vi.stubEnv('INSTAGRAM_PUBLISHING_ENABLED','true');post.status='draft';
    expect(await publishDuePost()).toEqual({state:'idle'});
    expect(mocks.graph).not.toHaveBeenCalled();
  });
  it('only publishes once when two workers race for the same post',async()=>{
    await Promise.all([publishDuePost(),publishDuePost()]);
    expect(mocks.graph.mock.calls.filter(([path])=>path.endsWith('/media_publish'))).toHaveLength(1);
    expect(post.status).toBe('published');expect(post.instagram_media_id).toBe('published');
  });
  it('reuses an existing container without publishing while it prepares',async()=>{
    post.container_id='container';
    mocks.graph.mockResolvedValue({status_code:'IN_PROGRESS'});
    expect(await publishDuePost()).toEqual({state:'preparing'});
    expect(mocks.graph).toHaveBeenCalledTimes(1);
    expect(post.status).toBe('scheduled');expect(post.container_id).toBe('container');
  });
  it('does not retry an ambiguous publish timeout',async()=>{
    mocks.graph.mockImplementation(async(path:string)=>{
      if(path.endsWith('/media_publish')) {expect(post.status).toBe('uncertain');throw new Error('timeout');}
      return path.endsWith('/media') ? {id:'container'}:{status_code:'FINISHED'};
    });
    expect(await publishDuePost()).toEqual({state:'uncertain'});
    expect(await publishDuePost()).toEqual({state:'idle'});
    expect(mocks.graph.mock.calls.filter(([path])=>path.endsWith('/media_publish'))).toHaveLength(1);
  });
  it('leaves posts untouched for an expired or different account',async()=>{
    account.expires_at=new Date(Date.now()-1000).toISOString();
    expect(await publishDuePost()).toEqual({state:'expired'});
    account.expires_at=new Date(Date.now()+30*86400000).toISOString();post.account_id='other';
    expect(await publishDuePost()).toEqual({state:'idle'});
    expect(mocks.graph).not.toHaveBeenCalled();
  });
});
