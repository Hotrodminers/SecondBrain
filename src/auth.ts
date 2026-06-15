import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

// OAuth providers are only registered when their credentials exist, so the
// app works with email/password alone until you add Google/GitHub keys.
const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "Email and Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email as string | undefined;
      const password = credentials?.password as string | undefined;
      if (!email || !password) return null;

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (!user || !user.passwordHash) return null;

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: user.emailVerified,
      };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      console.log(`[NextAuth JWT] Trigger: "${trigger || "none"}", sub: "${token.sub || ""}", id: "${token.id || ""}"`);
      if (user) {
        token.id = user.id;
        // Query the database to get the latest emailVerified status
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { emailVerified: true },
        });
        token.emailVerified = dbUser?.emailVerified ? dbUser.emailVerified.toISOString() : null;
        console.log(`[NextAuth JWT] Sign-in verified status: ${token.emailVerified}`);
      }
      if (trigger === "update") {
        const userId = token.id || token.sub;
        console.log(`[NextAuth JWT] Update triggered for user ID: "${userId || ""}"`);
        if (userId) {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId as string },
            select: { emailVerified: true },
          });
          token.emailVerified = dbUser?.emailVerified ? dbUser.emailVerified.toISOString() : null;
          console.log(`[NextAuth JWT] Updated verified status to: ${token.emailVerified}`);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.emailVerified = token.emailVerified ? new Date(token.emailVerified as string) : null;
      }
      return session;
    },
    // For OAuth sign-ins, ensure a User row exists (JWT strategy skips the
    // adapter, so we upsert manually to persist social accounts).
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;
      if (!user.email) return false;

      await prisma.user.upsert({
        where: { email: user.email.toLowerCase() },
        update: {
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          emailVerified: new Date(), // Pre-verified since it comes from OAuth provider
        },
        create: {
          email: user.email.toLowerCase(),
          name: user.name,
          image: user.image,
          emailVerified: new Date(), // Pre-verified since it comes from OAuth provider
        },
      });
      return true;
    },
  },
});
