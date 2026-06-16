import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/account");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    include: { accounts: true },
  });

  if (!user) redirect("/login");

  const signInMethod =
    user.accounts.length > 0
      ? user.accounts.map((a) => a.provider).join(", ")
      : user.passwordHash
        ? "Email & Password"
        : "Unknown";

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const initial = (user.name || user.email).charAt(0).toUpperCase();

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        fontFamily: "Inter, sans-serif",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#0f0f0f",
          border: "1px solid #2a2a2a",
          borderRadius: "16px",
          padding: "32px 28px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt="Avatar"
              style={{ width: "56px", height: "56px", borderRadius: "50%" }}
            />
          ) : (
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#2d5a3f",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: 600,
              }}
            >
              {initial}
            </div>
          )}
          <div>
            <h1 style={{ color: "#fff", margin: 0, fontSize: "20px", fontWeight: 600 }}>
              {user.name || "Your account"}
            </h1>
            <p style={{ color: "#555", fontSize: "13px", margin: "2px 0 0" }}>
              {user.email}
            </p>
          </div>
        </div>

        {/* Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          {[
            { label: "Name", value: user.name || "—" },
            { label: "Email", value: user.email },
            { label: "Sign-in method", value: signInMethod },
            { label: "Member since", value: memberSince },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 0",
                borderBottom: "1px solid #1f1f1f",
              }}
            >
              <span style={{ color: "#666", fontSize: "13px" }}>{row.label}</span>
              <span
                style={{
                  color: "#e5e5e5",
                  fontSize: "13px",
                  fontWeight: 500,
                  textTransform: row.label === "Sign-in method" ? "capitalize" : "none",
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            href="/canvas"
            style={{
              flex: 1,
              background: "#2d5a3f",
              color: "#fff",
              border: "1px solid #2d5a3f",
              borderRadius: "10px",
              padding: "12px",
              fontSize: "14px",
              fontWeight: 600,
              textAlign: "center",
              textDecoration: "none",
            }}
          >
            Back to Canvas
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
            style={{ flex: 1 }}
          >
            <button
              type="submit"
              style={{
                width: "100%",
                background: "transparent",
                color: "#888",
                border: "1px solid #2a2a2a",
                borderRadius: "10px",
                padding: "12px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
