import { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET ?? 'salle-resa-fallback-secret-key-2024',
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublic = ['/', '/login', '/register'].includes(nextUrl.pathname);
      if (isPublic) return true;
      if (!isLoggedIn) return false;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as {
          id: number; name: string; email: string; password: string; role: string;
        } | undefined;
        if (!user) return null;
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;
        return { id: String(user.id), name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
};
