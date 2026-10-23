'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { saoPauloToUTC, type SocialPost } from '@/lib/instagram-post';

type Panel = { account: { username:string; expires_at:string } | null; posts:SocialPost[]; mediaBase:string; publishingEnabled:boolean };
const labels:Record<SocialPost['status'],string> = { draft:'Rascunho',scheduled:'Agendado',processing:'Processando',published:'Publicado',failed:'Falhou',uncertain:'Conferir no Instagram',cancelled:'Cancelado' };

export default function InstagramPanel() {
  const [data,setData] = useState<Panel|null>(null);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [busy,setBusy] = useState(false);
  const [caption,setCaption] = useState('');
  const [path,setPath] = useState('');
  const [preview,setPreview] = useState('');
  const [date,setDate] = useState('');
  const [loading,setLoading] = useState(true);
  const api = useCallback(async (action?:string,body?:object|FormData) => {
    const { data:{ session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Entre com sua conta do site e volte a esta página.');
    const headers:Record<string,string> = { Authorization:`Bearer ${session.access_token}` };
    if (body && !(body instanceof FormData)) headers['Content-Type']='application/json';
    const response = await fetch(`/api/admin/instagram${action ? `?action=${action}` : ''}`,{ method:body ? 'POST':'GET',headers,body:body instanceof FormData ? body : body ? JSON.stringify(body):undefined,cache:'no-store' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Não foi possível concluir.');
    return result;
  },[]);
  const refresh = useCallback(async () => { setData(await api()); },[api]);
  useEffect(()=>{
    refresh().catch(e=>setError(e.message)).finally(()=>setLoading(false));
    const result = new URLSearchParams(window.location.search).get('connection');
    if (result) setNotice(result==='connected' ? 'Instagram conectado.' : 'Conexão não concluída. Confira o app, a autorização e a conta esperada.');
  },[refresh]);
  async function run(task:()=>Promise<void>) {
    setBusy(true);setError('');setNotice('');
    try { await task(); } catch(e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function publishNow(id:string) {
    const result=await api('publish-now',{id});
    await refresh();
    const messages:Record<string,string>={published:'Publicação confirmada no Instagram.',preparing:'O Instagram está preparando a imagem. Clique em Publicar agora novamente em alguns instantes.',uncertain:'Resultado não confirmado. Confira o Instagram antes de reenviar.',failed:'Não foi possível preparar o post. Confira o histórico.',expired:'Reconecte o Instagram: autorização expirada.',disconnected:'Conecte o Instagram primeiro.',idle:'Este post já foi processado ou não está disponível.',busy:'Outra execução está processando este post.'};
    setNotice(messages[result.state]||'Confira o histórico.');
  }
  const input = 'w-full rounded-xl border border-white/15 bg-black/30 p-3 text-white focus:outline-none focus:ring-2 focus:ring-lime-400';
  const button = 'rounded-xl bg-lime-400 px-5 py-3 font-semibold text-black disabled:opacity-40';
  return <main id="main-content" className="min-h-screen bg-[#100e18] px-5 py-12 text-white">
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div><p className="text-sm tracking-[.25em] text-lime-400">RIESCADE / ESTÚDIO</p><h1 className="mt-3 text-4xl font-bold">Instagram</h1><p className="mt-2 text-white/60">Prepare a próxima partida da sua comunidade.</p></div>
        <a href="/dashboard" className="text-sm text-white/70 underline">Minha conta / entrar</a>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-4">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-lime-400/10 p-4 text-lime-200">{notice}</p>}
      {loading && <p>Verificando acesso…</p>}
      {data && <>
        <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div><h2 className="text-xl font-semibold">{data.account ? `@${data.account.username}`:'Conecte o RIESCADE'}</h2><p className="mt-1 text-sm text-white/60">{data.account ? `Autorização válida até ${new Date(data.account.expires_at).toLocaleDateString('pt-BR',{ timeZone:'America/Sao_Paulo' })}`:'Autorize a conta profissional para preparar publicações.'}</p><p className="mt-2 text-sm text-lime-300">Publicação manual disponível nos rascunhos. Nenhum agendador é necessário.</p></div>
          <button disabled={busy} className={button} onClick={()=>run(async()=>{ const result=await api('connect',{});window.location.assign(result.url); })}>{data.account ? 'Reconectar Instagram':'Conectar Instagram'}</button>
        </section>
        <div className="grid gap-8 lg:grid-cols-2">
          <form className="space-y-5 rounded-2xl border border-white/10 p-6" onSubmit={e=>{e.preventDefault();run(async()=>{
            if (!data.account) throw new Error('Conecte o Instagram primeiro.');
            await api('create',{ caption,media_path:path,status:'scheduled',scheduled_at:saoPauloToUTC(date) });
            setCaption('');setPath('');setPreview('');setDate('');await refresh();setNotice('Publicação agendada.');
          });}}>
            <h2 className="text-2xl font-semibold">Nova publicação</h2>
            <label className="block space-y-2"><span>Arte do post</span><input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} className={input} onChange={e=>{
              const file=e.target.files?.[0];if(!file)return;
              run(async()=>{const form=new FormData();form.set('file',file);const result=await api('upload',form);setPath(result.path);setPreview(result.url);});
            }}/><span className="block text-xs text-white/50">Até 3 MB. A imagem será ajustada para 1080 × 1350, preservando o conteúdo.</span></label>
            <label className="block space-y-2"><span>Legenda</span><textarea required rows={7} maxLength={2200} value={caption} onChange={e=>setCaption(e.target.value)} className={input}/></label>
            <label className="block space-y-2"><span>Data e hora de Brasília (São Paulo)</span><input type="datetime-local" required value={date} onChange={e=>setDate(e.target.value)} className={input}/></label>
            <p className="text-sm text-white/60">Ao agendar, você autoriza a publicação desta imagem e legenda no perfil conectado.</p>
            <div className="flex flex-wrap gap-3"><button disabled={busy||!path||!caption.trim()||!data.account} className={button}>Agendar publicação</button><button type="button" disabled={busy||!path||!caption.trim()||!data.account} className="rounded-xl border border-white/20 px-4 py-3 disabled:opacity-40" onClick={()=>run(async()=>{await api('create',{caption,media_path:path,status:'draft'});await refresh();setNotice('Rascunho salvo.');})}>Salvar rascunho</button></div>
          </form>
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <h2 className="border-b border-white/10 p-5 font-semibold">Prévia • @{data.account?.username ?? 'riescade'}</h2>
            {preview ? <Image src={preview} alt="Prévia da arte enviada" width={1080} height={1350} unoptimized className="aspect-[4/5] w-full object-contain"/>:<div className="flex aspect-[4/5] items-center justify-center bg-gradient-to-br from-purple-950/60 to-black text-white/40">Envie sua próxima arte</div>}
            <p className="whitespace-pre-wrap p-5 text-sm">{caption || 'Sua legenda aparece aqui.'}</p>
          </section>
        </div>
        <section className="space-y-4"><div className="flex justify-between"><h2 className="text-2xl font-semibold">Fila e histórico</h2><button disabled={busy} className="text-lime-300 underline" onClick={()=>run(refresh)}>Atualizar</button></div>
          {!data.posts.length && <p className="text-white/50">Nenhuma publicação preparada ainda.</p>}
          {data.posts.map(post=><article key={post.id} className="flex flex-wrap gap-5 rounded-2xl border border-white/10 bg-white/5 p-5">
            {post.media_path.endsWith('.mp4') ? <video src={`${data.mediaBase.replace(/\/$/,'')}/${post.media_path}`} controls preload="metadata" className="h-40 w-24 rounded-lg object-contain" aria-label="Prévia do Reel"/> : <Image src={`${data.mediaBase.replace(/\/$/,'')}/${post.media_path}`} alt="Arte da publicação" width={96} height={112} unoptimized className="h-28 w-24 rounded-lg object-cover"/>}
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-lime-300">{labels[post.status]} · {post.media_type === 'STORIES' ? 'Story' : post.media_path.endsWith('.mp4') ? 'Reel' : 'Post'}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm">{post.caption}</p><p className="mt-2 text-xs text-white/50">{post.scheduled_at ? new Date(post.scheduled_at).toLocaleString('pt-BR',{ timeZone:'America/Sao_Paulo' })+' · Brasília':'Sem horário definido'}</p>{post.error && <p className="mt-2 text-sm text-amber-300">{post.error}</p>}{post.instagram_media_id && <p className="mt-2 text-xs text-white/50">ID no Instagram: {post.instagram_media_id}</p>}</div>
            <div className="flex items-start gap-3">{['draft','scheduled'].includes(post.status) && <button disabled={busy} className={button} onClick={()=>run(()=>publishNow(post.id))}>Publicar agora</button>}{post.status==='draft' && !post.media_path.endsWith('.mp4') && <button disabled={busy} className="text-sm text-lime-300 underline" onClick={()=>{setCaption(post.caption);setPath(post.media_path);setPreview(`${data.mediaBase.replace(/\/$/,'')}/${post.media_path}`);setNotice('Rascunho carregado no formulário.');window.scrollTo({top:0,behavior:'smooth'});}}>Usar rascunho</button>}{['draft','scheduled','failed'].includes(post.status) && <button disabled={busy} className="text-sm text-white/60 underline" onClick={()=>run(async()=>{await api('cancel',{id:post.id});await refresh();})}>Cancelar</button>}</div>
          </article>)}
        </section>
      </>}
    </div>
  </main>;
}
