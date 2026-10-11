// Signed, expiring admin session tokens. Web Crypto only, so this runs in both
// the proxy and route handlers.
export const ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();

// Key = NEXTAUTH_SECRET + ADMIN_PASSWORD, so changing either one invalidates every existing session.
function keyMaterial(): string | null {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  const password = process.env.ADMIN_PASSWORD;
  if (!secret || !password) return null;
  return `${secret}:${password}`;
}

function importKey(material: string, usage: 'sign' | 'verify') {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(material),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage],
  );
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string) {
  if (hex.length === 0 || hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export async function createAdminSessionToken(): Promise<string | null> {
  const material = keyMaterial();
  if (!material) return null;
  const expires = Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000;
  const key = await importKey(material, 'sign');
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`admin:${expires}`));
  return `${expires}.${toHex(signature)}`;
}

export async function verifyAdminSessionToken(token: string | null | undefined): Promise<boolean> {
  if (!token) return false;
  const material = keyMaterial();
  if (!material) return false;

  const [expiresStr, signatureHex] = token.split('.');
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;

  const signature = fromHex(signatureHex ?? '');
  if (!signature) return false;

  const key = await importKey(material, 'verify');
  return crypto.subtle.verify('HMAC', key, signature, encoder.encode(`admin:${expires}`));
}
