import { afterEach, describe, expect, it, vi } from 'vitest';
const auth = vi.hoisted(()=>({ authenticateSupabaseRequest:vi.fn() }));
vi.mock('./app-auth',()=>auth);
import { equalSecret, requireSocialAdmin, seal, unseal } from './instagram-security';
import { saoPauloToUTC, validatePost } from '@/lib/instagram-post';

afterEach(()=>{vi.unstubAllEnvs();vi.clearAllMocks();});
describe('private Instagram studio',()=>{
  it('rejects non-administrators even when authenticated',async()=>{
    vi.stubEnv('SOCIAL_ADMIN_USER_IDS','owner');
    auth.authenticateSupabaseRequest.mockResolvedValue({id:'subscriber'});
    await expect(requireSocialAdmin(new Request('https://example.com'))).rejects.toMatchObject({status:403});
    auth.authenticateSupabaseRequest.mockResolvedValue({id:'owner'});
    await expect(requireSocialAdmin(new Request('https://example.com'))).resolves.toMatchObject({id:'owner'});
    vi.stubEnv('SOCIAL_ADMIN_USER_IDS','');
    await expect(requireSocialAdmin(new Request('https://example.com'))).rejects.toMatchObject({status:403});
  });
  it('encrypts tokens with a fresh nonce and detects tampering',()=>{
    vi.stubEnv('INSTAGRAM_TOKEN_ENCRYPTION_KEY','ab'.repeat(32));
    const encrypted=seal('sensitive-token');
    expect(encrypted).not.toContain('sensitive-token');
    expect(encrypted).not.toBe(seal('sensitive-token'));
    expect(unseal(encrypted)).toBe('sensitive-token');
    const parts=encrypted.split('.');parts[1]=Buffer.alloc(16).toString('base64url');
    expect(()=>unseal(parts.join('.'))).toThrow();
    expect(equalSecret('é','aa')).toBe(false);
    expect(equalSecret('','')).toBe(false);
  });
  it('uses Brasília regardless of the device timezone and rejects unsafe posts',()=>{
    expect(saoPauloToUTC('2026-11-01T19:30')).toBe('2026-11-01T22:30:00.000Z');
    const base={caption:'Olá!',media_path:'12345678-1234-1234-1234-123456789012.jpg',status:'scheduled'};
    expect(()=>validatePost({...base,scheduled_at:'2020-01-01'})).toThrow();
    expect(()=>validatePost({...base,status:'published'})).toThrow();
    expect(()=>validatePost({...base,status:'draft',media_path:'https://attacker/image.jpg'})).toThrow();
    expect(validatePost({...base,status:'draft'}).scheduled_at).toBeNull();
  });
});
