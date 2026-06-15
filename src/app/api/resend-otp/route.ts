import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();

    // Enforce a 60-second cooldown to prevent spamming
    const existingToken = await prisma.verificationToken.findFirst({
      where: { identifier: email },
    });

    if (existingToken) {
      const createdAt = new Date(existingToken.expires.getTime() - 10 * 60 * 1000);
      const timePassed = Date.now() - createdAt.getTime();
      if (timePassed < 60 * 1000) {
        const secondsRemaining = Math.ceil((60 * 1000 - timePassed) / 1000);
        return NextResponse.json(
          { error: `Please wait ${secondsRemaining} seconds before requesting a new code.` },
          { status: 429 },
        );
      }
    }

    // Generate, save and send new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: otp,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    await sendOtpEmail(email, otp);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[resend-otp] Error:", error?.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
