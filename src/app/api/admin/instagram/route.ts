import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import { requireSocialAdmin, seal, socialError, socialOrigin } from '@/lib/server/instagram-security';
import { instagramConfig } from '@/lib/server/instagram-api';
import { AppApiError } from '@/lib/server/app-errors';
import { SOCIAL_BUCKET, validatePost } from '@/lib/instagram-post';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireSocialAdmin(request);
    const db = getSupabaseAdmin();
    const [account, posts] = await Promise.all([
      db.from('instagram_account').select('username,instagram_user_id,expires_at,refreshed_at').eq('id','primary').maybeSingle(),
      db.from('instagram_posts').select('id,account_id,caption,media_path,scheduled_at,status,container_id,instagram_media_id,error,created_at,updated_at').order('created_at', { ascending:false }).limit(100),
    ]);
    if (account.error || posts.error) throw new Error('Database unavailable');
    return Response.json({ account:account.data, posts:posts.data, mediaBase:db.storage.from(SOCIAL_BUCKET).getPublicUrl('').data.publicUrl, publishingEnabled:process.env.INSTAGRAM_PUBLISHING_ENABLED === 'true' }, { headers: { 'Cache-Control':'no-store' } });
  } catch (e) { return socialError(e); }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireSocialAdmin(request);
    const db = getSupabaseAdmin();
    const action = request.nextUrl.searchParams.get('action');
    if (action === 'connect') {
      const { id } = instagramConfig();
      const state = randomBytes(32).toString('hex');
      const url = new URL('https://www.instagram.com/oauth/authorize');
      url.search = new URLSearchParams({ client_id:id, redirect_uri:`${socialOrigin()}/api/admin/instagram/callback`, response_type:'code', scope:'instagram_business_basic,instagram_business_content_publish', state, enable_fb_login:'0' }).toString();
      const response = NextResponse.json({ url:url.toString() });
      response.cookies.set('riescade_ig_state', seal(JSON.stringify({ state, userId:user.id, expires:Date.now()+600000 })), { httpOnly:true, secure:socialOrigin().startsWith('https:'), sameSite:'lax', path:'/api/admin/instagram', maxAge:600 });
      return response;
    }
    if (action === 'upload') {
      // Reject oversized bodies before decoding images; deployment body limit also applies.
      if (Number(request.headers.get('content-length') ?? 0) > 4_000_000) throw new AppApiError(413,'Envie uma imagem de até 3 MB.');
      const file = (await request.formData()).get('file');
      if (!(file instanceof File) || file.size > 3_000_000 || !['image/png','image/jpeg','image/webp'].includes(file.type)) throw new AppApiError(400,'Envie PNG, JPG ou WebP de até 3 MB.');
      const source = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels:25_000_000 }).rotate();
      const metadata = await source.metadata();
      if (!['png','jpeg','webp'].includes(metadata.format ?? '') || (metadata.pages ?? 1) > 1) throw new AppApiError(400,'Envie uma imagem estática.');
      const buffer = await source.resize(1080,1350,{ fit:'contain', background:'#17131f' }).flatten({ background:'#17131f' }).jpeg({ quality:92 }).toBuffer();
      const path = `${randomUUID()}.jpg`;
      const { error } = await db.storage.from(SOCIAL_BUCKET).upload(path,buffer,{ contentType:'image/jpeg', upsert:false });
      if (error) throw new Error('Upload failed');
      return Response.json({ path, url:db.storage.from(SOCIAL_BUCKET).getPublicUrl(path).data.publicUrl });
    }
    const body = await request.json();
    if (action === 'cancel') {
      const { data, error } = await db.from('instagram_posts').update({ status:'cancelled',updated_at:new Date().toISOString() }).eq('id',body.id).in('status',['draft','scheduled','failed']).select('id');
      if (error) throw new Error('Cancel failed');
      if (!data?.length) throw new AppApiError(409,'A publicação já está em processamento ou foi encerrada.');
      return Response.json({ ok:true });
    }
    if (action !== 'create') throw new AppApiError(400,'Ação inválida.');
    let post;
    try { post = validatePost(body); } catch(e) { throw new AppApiError(400,(e as Error).message); }
    const { data:account, error:accountError } = await db.from('instagram_account').select('instagram_user_id,expires_at').eq('id','primary').maybeSingle();
    if (accountError) throw new Error('Account unavailable');
    if (!account || Date.parse(account.expires_at) <= Date.now()) throw new AppApiError(409,'Conecte uma conta válida do Instagram primeiro.');
    const { data:asset, error:assetError } = await db.storage.from(SOCIAL_BUCKET).list('',{ search:post.media_path, limit:1 });
    if (assetError || !asset?.some(item=>item.name===post.media_path)) throw new AppApiError(400,'Imagem não encontrada. Envie novamente.');
    const { error } = await db.from('instagram_posts').insert({ ...post,account_id:account.instagram_user_id,created_by:user.id });
    if (error) throw new Error('Create failed');
    return Response.json({ ok:true },{ status:201 });
  } catch(e) { return socialError(e); }
}
