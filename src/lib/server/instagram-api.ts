import { AppApiError } from './app-errors';

export class InstagramError extends Error {
  constructor(public readonly code: number) { super('Instagram request failed'); }
}

export function instagramConfig() {
  const id = process.env.INSTAGRAM_APP_ID;
  const secret = process.env.INSTAGRAM_APP_SECRET;
  const version = process.env.INSTAGRAM_GRAPH_VERSION;
  if (!id || !secret || !version || !/^v\d+\.\d+$/.test(version)) {
    throw new AppApiError(503, 'Configure o app e a versão da API do Instagram.');
  }
  return { id, secret, version };
}

async function parse<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok || body.error || body.error_type) throw new InstagramError(Number(body.error?.code ?? 0));
  return body as T;
}

export async function graph<T>(path: string, token: string, params: Record<string, string> = {}, post = false): Promise<T> {
  const { version } = instagramConfig();
  if (!/^[\w/]+$/.test(path)) throw new Error('Invalid Graph path');
  const url = new URL(`https://graph.instagram.com/${version}/${path}`);
  if (!post) url.search = new URLSearchParams(params).toString();
  return parse<T>(await fetch(url, {
    method: post ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${token}` },
    body: post ? new URLSearchParams(params) : undefined,
    cache: 'no-store', signal: AbortSignal.timeout(12000),
  }));
}

export async function exchangeCode(code: string, redirect: string) {
  const { id, secret } = instagramConfig();
  const short = await parse<{ access_token: string }>(await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST', body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: 'authorization_code', redirect_uri: redirect, code }),
    signal: AbortSignal.timeout(12000), cache: 'no-store',
  }));
  const url = new URL('https://graph.instagram.com/access_token');
  url.search = new URLSearchParams({ grant_type: 'ig_exchange_token', client_secret: secret, access_token: short.access_token }).toString();
  return parse<{ access_token: string; expires_in: number }>(await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(12000) }));
}

export async function refreshToken(token: string) {
  const url = new URL('https://graph.instagram.com/refresh_access_token');
  url.search = new URLSearchParams({ grant_type: 'ig_refresh_token', access_token: token }).toString();
  return parse<{ access_token: string; expires_in: number }>(await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(12000) }));
}
