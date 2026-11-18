import { SignJWT, jwtVerify } from 'jose';

const secret = () => {
  const s = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  return s ? new TextEncoder().encode('mobile:' + s) : null;
};

export async function signMobileToken(userId: string): Promise<string | null> {
  const key = secret();
  if (!key) return null;
  return new SignJWT({ uid: userId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('30d').sign(key);
}

export async function verifyMobileToken(token: string): Promise<string | null> {
  const key = secret();
  if (!key) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    return typeof payload.uid === 'string' ? payload.uid : null;
  } catch { return null; }
}
