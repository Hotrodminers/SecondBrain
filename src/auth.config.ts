import type { NextAuthConfig } from "next-auth";

// Edge-safe config: NO Prisma/bcrypt imports here, because this is loaded by
// middleware which runs on the Edge runtime. The full provider list (with the
// database-backed credentials authorize) lives in auth.ts.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.emailVerified = (user as any).emailVerified;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        session.user.emailVerified = token.emailVerified as any;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
