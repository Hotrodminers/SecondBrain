import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isOnCanvas = pathname.startsWith("/canvas");
  const isOnAccount = pathname.startsWith("/account");
  const isOnVerify = pathname.startsWith("/verify-email");

  // 1. If trying to access protected pages and not logged in, redirect to login
  if ((isOnCanvas || isOnAccount) && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If trying to visit /verify-email and not logged in, redirect to login
  if (isOnVerify && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/canvas/:path*", "/account/:path*", "/verify-email"],
};
