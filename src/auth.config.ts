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
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
