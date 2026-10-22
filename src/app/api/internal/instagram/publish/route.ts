import { equalSecret, socialError } from '@/lib/server/instagram-security';
import { publishDuePost } from '@/lib/server/instagram-worker';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.INSTAGRAM_CRON_SECRET ?? '';
  if (secret.length < 32 || !equalSecret(request.headers.get('authorization') ?? '',`Bearer ${secret}`)) {
    return Response.json({ error:'Não autorizado.' },{ status:401 });
  }
  try { return Response.json(await publishDuePost(),{ headers:{ 'Cache-Control':'no-store' } }); }
  catch(e) { return socialError(e); }
}
