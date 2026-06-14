import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Build an edge-safe NextAuth instance (no Prisma/bcrypt) just for the
// proxy's session check.
const { auth } = NextAuth(authConfig);

// Protect the canvas: unauthenticated users are redirected to /login.
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnCanvas = req.nextUrl.pathname.startsWith("/canvas");

  if (isOnCanvas && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/canvas/:path*"],
};
