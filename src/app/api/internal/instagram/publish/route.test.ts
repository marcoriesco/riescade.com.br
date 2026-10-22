import { afterEach, describe, expect, it, vi } from 'vitest';
const mocks=vi.hoisted(()=>({publishDuePost:vi.fn()}));
vi.mock('@/lib/server/instagram-worker',()=>mocks);
vi.mock('@/lib/server/app-auth',()=>({authenticateSupabaseRequest:vi.fn()}));
import { GET } from './route';
afterEach(()=>{vi.unstubAllEnvs();vi.clearAllMocks();});
describe('Instagram scheduler authorization',()=>{
  it('fails closed for absent, short or wrong secrets',async()=>{
    for(const secret of ['', 'short', 'a'.repeat(32)]) {
      vi.stubEnv('INSTAGRAM_CRON_SECRET',secret);
      expect((await GET(new Request('https://example.com',{headers:{authorization:'Bearer incorrect'}}))).status).toBe(401);
    }
    expect(mocks.publishDuePost).not.toHaveBeenCalled();
  });
  it('accepts only the configured bearer secret',async()=>{
    vi.stubEnv('INSTAGRAM_CRON_SECRET','a'.repeat(32));
    mocks.publishDuePost.mockResolvedValue({state:'idle'});
    const response=await GET(new Request('https://example.com',{headers:{authorization:`Bearer ${'a'.repeat(32)}`}}));
    expect(response.status).toBe(200);expect(await response.json()).toEqual({state:'idle'});
  });
});
