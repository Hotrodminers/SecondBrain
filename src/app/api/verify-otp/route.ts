import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { otp } = await req.json();
    if (!otp || typeof otp !== "string" || otp.length !== 6) {
      return NextResponse.json({ error: "Please enter a valid 6-digit code." }, { status: 400 });
    }

    const email = session.user.email.toLowerCase();

    // Look up the token in the database
    const tokenRecord = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token: otp,
        },
      },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
    }

    if (tokenRecord.expires < new Date()) {
      return NextResponse.json({ error: "This verification code has expired." }, { status: 400 });
    }

    // Mark user as verified
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // Delete verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[verify-otp] Error:", error?.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
