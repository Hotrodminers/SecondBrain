import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Canvas from "@/components/Canvas";

export default async function CanvasPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/canvas");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
  });

  if (!user) {
    redirect("/login");
  }

  if (!user.emailVerified) {
    redirect("/verify-email");
  }

  return <Canvas />;
}
