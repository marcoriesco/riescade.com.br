import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from 'node:crypto';
import { authenticateSupabaseRequest } from './app-auth';
import { AppApiError } from './app-errors';

export function adminIds() {
  return (process.env.SOCIAL_ADMIN_USER_IDS ?? '').split(',').map(s => s.trim()).filter(Boolean);
}

export async function requireSocialAdmin(request: Request) {
  const user = await authenticateSupabaseRequest(request);
  if (!adminIds().includes(user.id)) throw new AppApiError(403, 'Acesso restrito à administração.');
  return user;
}

function key() {
  const value = process.env.INSTAGRAM_TOKEN_ENCRYPTION_KEY ?? '';
  if (!/^[a-f0-9]{64}$/i.test(value)) throw new AppApiError(503, 'Configure a chave de criptografia do Instagram.');
  return Buffer.from(value, 'hex');
}

export function seal(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map(v => v.toString('base64url')).join('.');
}

export function unseal(value: string) {
  const parts = value.split('.');
  if (parts.length !== 3) throw new Error('Invalid encrypted value');
  const [iv, tag, data] = parts.map(v => Buffer.from(v, 'base64url'));
  const cipher = createDecipheriv('aes-256-gcm', key(), iv);
  cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(data), cipher.final()]).toString('utf8');
}

export function equalSecret(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length > 0 && left.length === right.length && timingSafeEqual(left, right);
}

export function socialOrigin() {
  const url = new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000');
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') throw new Error('HTTPS required');
  return url.origin;
}

export function socialError(error: unknown) {
  if (error instanceof AppApiError) return Response.json({ error: error.message }, { status: error.status });
  // Never return provider payloads, URLs, codes or tokens to the browser/logs.
  return Response.json({ error: 'Não foi possível concluir. Confira a configuração e tente novamente.' }, { status: 500 });
}
