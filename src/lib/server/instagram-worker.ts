import { getSupabaseAdmin } from './supabase-admin';
import { graph, refreshToken, InstagramError } from './instagram-api';
import { seal, unseal } from './instagram-security';
import { SOCIAL_BUCKET, type SocialPost } from '@/lib/instagram-post';

type Account = { instagram_user_id:string; encrypted_token:string; expires_at:string; refreshed_at:string };
const now = () => new Date().toISOString();

export async function publishDuePost() {
  if (process.env.INSTAGRAM_PUBLISHING_ENABLED !== 'true') return { state:'disabled' };
  const db = getSupabaseAdmin();
  const check = (error: unknown) => { if(error) throw new Error('Instagram queue persistence failed'); };
  // A terminated worker must never cause automatic publication retries.
  const stale = await db.from('instagram_posts').update({ status:'uncertain',error:'Execução interrompida. Confira o Instagram antes de criar outra publicação.',updated_at:now() }).eq('status','processing').lt('updated_at',new Date(Date.now()-10*60000).toISOString());
  check(stale.error);
  const { data:account, error:accountError } = await db.from('instagram_account').select('instagram_user_id,encrypted_token,expires_at,refreshed_at').eq('id','primary').maybeSingle();
  check(accountError);
  if (!account) return { state:'disconnected' };
  const a = account as Account;
  if (Date.parse(a.expires_at) <= Date.now()) return { state:'expired' };
  let token = unseal(a.encrypted_token);
  if (Date.parse(a.expires_at)-Date.now() < 14*86400000 && Date.now()-Date.parse(a.refreshed_at)>86400000) {
    const fresh = await refreshToken(token);
    if (!fresh.access_token || !Number.isFinite(fresh.expires_in) || fresh.expires_in <= 0) throw new Error('Invalid refresh');
    const updated = await db.from('instagram_account').update({ encrypted_token:seal(fresh.access_token),expires_at:new Date(Date.now()+fresh.expires_in*1000).toISOString(),refreshed_at:now() }).eq('id','primary').eq('encrypted_token',a.encrypted_token).select('id');
    check(updated.error);
    if (!updated.data?.length) return { state:'connection_changed' };
    token = fresh.access_token;
  }
  const candidate = await db.from('instagram_posts').select('*').eq('status','scheduled').eq('account_id',a.instagram_user_id).lte('scheduled_at',now()).order('scheduled_at').limit(1).maybeSingle();
  check(candidate.error);
  if (!candidate.data) return { state:'idle' };
  const row = candidate.data as SocialPost & { attempts:number };
  const claimed = await db.from('instagram_posts').update({ status:'processing',updated_at:now(), attempts:row.attempts+1 }).eq('id',row.id).eq('status','scheduled').eq('attempts',row.attempts).select('id');
  check(claimed.error);
  if (!claimed.data?.length) return { state:'busy' };
  async function save(values: Record<string, unknown>) {
    const result = await db.from('instagram_posts').update({ ...values,updated_at:now() }).eq('id',row.id);
    check(result.error);
  }
  let publishing = false;
  try {
    if (row.attempts >= 30) throw new Error('Container preparation timeout');
    let container = row.container_id;
    if (!container) {
      const imageUrl = db.storage.from(SOCIAL_BUCKET).getPublicUrl(row.media_path).data.publicUrl;
      const created = await graph<{ id:string }>(`${a.instagram_user_id}/media`,token,{ image_url:imageUrl,caption:row.caption },true);
      if (!created.id) throw new Error('Missing container');
      container = created.id;
      await save({ container_id:container });
    }
    const status = await graph<{ status_code:string }>(container,token,{ fields:'status_code' });
    if (status.status_code === 'IN_PROGRESS') {
      await save({ status:'scheduled',scheduled_at:new Date(Date.now()+60000).toISOString() });
      return { state:'preparing' };
    }
    if (status.status_code !== 'FINISHED') throw new Error('Container unavailable');
    // Persist the uncertainty BEFORE the external side effect. Never auto-retry this state.
    await save({ status:'uncertain',error:'Aguardando confirmação de publicação. Confira o Instagram antes de reenviar.' });
    publishing = true;
    const published = await graph<{ id:string }>(`${a.instagram_user_id}/media_publish`,token,{ creation_id:container },true);
    if (!published.id) throw new Error('Missing publication id');
    await save({ status:'published',instagram_media_id:published.id,error:null });
    return { state:'published' };
  } catch(e) {
    await save({ status:publishing ? 'uncertain' : 'failed',error:publishing ? 'Resultado não confirmado. Confira o Instagram antes de reenviar.' : e instanceof InstagramError && e.code===190 ? 'Autorização inválida. Reconecte o Instagram.' : 'Não foi possível preparar o post. Confira a conexão e a imagem.' });
    return { state:publishing ? 'uncertain' : 'failed' };
  }
}
