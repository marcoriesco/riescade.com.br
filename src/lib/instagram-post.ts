export const SOCIAL_BUCKET = 'instagram-media';
export type SocialPost = {
  media_type?: 'IMAGE' | 'REELS' | 'STORIES';
  id: string; caption: string; media_path: string; scheduled_at: string | null;
  status: 'draft' | 'scheduled' | 'processing' | 'published' | 'failed' | 'uncertain' | 'cancelled';
  container_id: string | null; instagram_media_id: string | null; error: string | null;
  created_at: string; updated_at: string; account_id: string;
};

export function validatePost(input: Record<string, unknown>) {
  if (typeof input.caption !== 'string' || !input.caption.trim() || [...input.caption].length > 2200) throw new Error('A legenda deve ter entre 1 e 2.200 caracteres.');
  if (typeof input.media_path !== 'string' || !/^[a-f0-9-]{36}\.jpg$/.test(input.media_path)) throw new Error('Envie uma imagem pelo painel.');
  if (input.status !== 'draft' && input.status !== 'scheduled') throw new Error('Estado inválido.');
  const date = typeof input.scheduled_at === 'string' ? new Date(input.scheduled_at) : null;
  if (input.status === 'scheduled' && (!date || !Number.isFinite(date.getTime()) || date.getTime() < Date.now() + 60000)) throw new Error('Escolha um horário pelo menos um minuto no futuro.');
  return { caption: input.caption.trim(), media_path: input.media_path, status: input.status, scheduled_at: input.status === 'scheduled' ? date!.toISOString() : null };
}

// datetime-local is explicitly São Paulo (UTC-03), independent of the operator's device.
export function saoPauloToUTC(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error('Data inválida.');
  return new Date(`${value}:00-03:00`).toISOString();
}
