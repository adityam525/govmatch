// Signed, expiring admin session tokens. Web Crypto only, so this runs in both
// the proxy and route handlers. Token format: "<adminId>.<expires>.<signature>".
export const ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;
export const BOOTSTRAP_ADMIN_ID = 'bootstrap';

const encoder = new TextEncoder();

// Key = NEXTAUTH_SECRET + ADMIN_PASSWORD, so changing either one invalidates every existing session.
function keyMaterial(): string | null {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  const password = process.env.ADMIN_PASSWORD;
  if (!secret || !password) return null;
  return `${secret}:${password}`;
}

const importKey = (material: string, usage: 'sign' | 'verify') =>
  crypto.subtle.importKey('raw', encoder.encode(material), { name: 'HMAC', hash: 'SHA-256' }, false, [usage]);

const toHex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');

function fromHex(hex: string) {
  if (hex.length === 0 || hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export async function createAdminSessionToken(adminId: string = BOOTSTRAP_ADMIN_ID): Promise<string | null> {
  const material = keyMaterial();
  if (!material || !/^[A-Za-z0-9_-]+$/.test(adminId)) return null;
  const expires = Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000;
  const key = await importKey(material, 'sign');
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`admin:${adminId}:${expires}`));
  return `${adminId}.${expires}.${toHex(signature)}`;
}

// The admin id inside a valid, unexpired token, or null.
export async function verifyAdminToken(token: string | null | undefined): Promise<string | null> {
  if (!token) return null;
  const material = keyMaterial();
  if (!material) return null;
  const [adminId, expiresStr, signatureHex] = token.split('.');
  const expires = Number(expiresStr);
  if (!adminId || !Number.isFinite(expires) || expires < Date.now()) return null;
  const signature = fromHex(signatureHex ?? '');
  if (!signature) return null;
  const key = await importKey(material, 'verify');
  const ok = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(`admin:${adminId}:${expires}`));
  return ok ? adminId : null;
}

export async function verifyAdminSessionToken(token: string | null | undefined): Promise<boolean> {
  return (await verifyAdminToken(token)) !== null;
}
