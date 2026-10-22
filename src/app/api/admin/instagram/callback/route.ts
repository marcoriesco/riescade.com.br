import { NextRequest, NextResponse } from 'next/server';
import { adminIds, equalSecret, seal, socialOrigin, unseal } from '@/lib/server/instagram-security';
import { exchangeCode, graph } from '@/lib/server/instagram-api';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';

export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
  const destination = new URL('/admin/instagram',socialOrigin());
  let result = 'error';
  try {
    const cookie = request.cookies.get('riescade_ig_state')?.value;
    if (!cookie) throw new Error('Missing state');
    const saved = JSON.parse(unseal(cookie));
    if (saved.expires < Date.now() || !adminIds().includes(saved.userId) || !equalSecret(saved.state,request.nextUrl.searchParams.get('state') ?? '')) throw new Error('Invalid state');
    const code = request.nextUrl.searchParams.get('code');
    if (!code || request.nextUrl.searchParams.has('error')) throw new Error('Authorization denied');
    const token = await exchangeCode(code,`${socialOrigin()}/api/admin/instagram/callback`);
    const profile = await graph<{ user_id: string; username: string }>('me',token.access_token,{ fields:'user_id,username' });
    const expected = process.env.INSTAGRAM_EXPECTED_USERNAME?.trim().toLowerCase() || 'riescade';
    if (!profile.user_id || profile.username?.toLowerCase() !== expected || !Number.isFinite(token.expires_in) || token.expires_in <= 0) throw new Error('Unexpected account');
    const { error } = await getSupabaseAdmin().from('instagram_account').upsert({ id:'primary', instagram_user_id:String(profile.user_id), username:profile.username, encrypted_token:seal(token.access_token), expires_at:new Date(Date.now()+token.expires_in*1000).toISOString(), refreshed_at:new Date().toISOString() });
    if (error) throw new Error('Unable to persist account');
    result = 'connected';
  } catch { /* Never expose the authorization code or provider token/error. */ }
  destination.searchParams.set('connection',result);
  const response = NextResponse.redirect(destination);
  response.cookies.set('riescade_ig_state','',{ path:'/api/admin/instagram',maxAge:0 });
  response.headers.set('Referrer-Policy','no-referrer');
  response.headers.set('Cache-Control','no-store');
  return response;
}
