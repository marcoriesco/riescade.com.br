import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppApiError } from '@/lib/server/app-errors';
const mocks=vi.hoisted(()=>({authenticateSupabaseRequest:vi.fn(),getSupabaseAdmin:vi.fn(),publishDuePost:vi.fn()}));
vi.mock('@/lib/server/app-auth',()=>({authenticateSupabaseRequest:mocks.authenticateSupabaseRequest}));
vi.mock('@/lib/server/supabase-admin',()=>({getSupabaseAdmin:mocks.getSupabaseAdmin}));
vi.mock('@/lib/server/instagram-worker',()=>({publishDuePost:mocks.publishDuePost}));
import { POST } from './route';
afterEach(()=>{vi.unstubAllEnvs();vi.resetAllMocks();});
const request=(id:unknown)=>new NextRequest('https://example.com/api/admin/instagram?action=publish-now',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
describe('manual Instagram publication authorization',()=>{
 it('rejects a signed-in subscriber before accessing the database or publisher',async()=>{
  vi.stubEnv('SOCIAL_ADMIN_USER_IDS','owner');mocks.authenticateSupabaseRequest.mockResolvedValue({id:'subscriber'});
  expect((await POST(request('9784c777-75dd-44a1-a52f-5fa4d7a875cb'))).status).toBe(403);
  expect(mocks.publishDuePost).not.toHaveBeenCalled();expect(mocks.getSupabaseAdmin).not.toHaveBeenCalled();
 });
 it('rejects an unauthenticated request',async()=>{
  mocks.authenticateSupabaseRequest.mockRejectedValue(new AppApiError(401,'Login necessário'));
  expect((await POST(request('9784c777-75dd-44a1-a52f-5fa4d7a875cb'))).status).toBe(401);
  expect(mocks.publishDuePost).not.toHaveBeenCalled();
 });
 it('publishes only the exact selected post for an administrator',async()=>{
  vi.stubEnv('SOCIAL_ADMIN_USER_IDS','owner');mocks.authenticateSupabaseRequest.mockResolvedValue({id:'owner'});mocks.getSupabaseAdmin.mockReturnValue({});
  mocks.publishDuePost.mockResolvedValue({state:'published'});
  expect((await POST(request('invalid'))).status).toBe(400);
  expect(mocks.publishDuePost).not.toHaveBeenCalled();
  const response=await POST(request('9784c777-75dd-44a1-a52f-5fa4d7a875cb'));
  expect(response.status).toBe(200);expect(mocks.publishDuePost).toHaveBeenCalledWith({postId:'9784c777-75dd-44a1-a52f-5fa4d7a875cb'});
 });
});
