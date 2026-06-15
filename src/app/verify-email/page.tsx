import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import VerifyEmailForm from "@/components/VerifyEmailForm";

export default async function VerifyEmailPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  const email = session.user.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    redirect("/login");
  }

  // If already verified, bypass verification page entirely and head to canvas
  if (user.emailVerified) {
    redirect("/canvas");
  }

  return <VerifyEmailForm email={user.email} />;
}
