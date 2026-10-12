import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { rateLimit, resetRateLimit } from './rate-limit';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).trim().toLowerCase();

        // Throttle guessing per account: 10 attempts / 15 min.
        // (authorize() has no request IP, so the limit is keyed on the email.)
        const key = `login:${email}`;
        if (!rateLimit(key, 10, 15 * 60 * 1000).allowed) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash || !user.isActive) return null;

        const isValid = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!isValid) return null;

        resetRateLimit(key);
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    // Deactivated accounts can't sign in through any provider (including Google).
    async signIn({ user }) {
      if (!user?.email) return true;
      const existing = await prisma.user.findUnique({
        where: { email: user.email.toLowerCase() },
        select: { isActive: true },
      });
      return existing ? existing.isActive : true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.id;
      return session;
    },
  },
});
