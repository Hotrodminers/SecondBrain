import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/admin");
  }

  const admin = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { role: true },
  });

  if (admin?.role !== "ADMIN") {
    redirect("/canvas");
  }

  const [users, totalUsers, verifiedUsers, adminUsers] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.user.count(),
    prisma.user.count({ where: { emailVerified: { not: null } } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
  ]);

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Second Brain</p>
          <h1 className="admin-title">Admin dashboard</h1>
          <p className="admin-subtitle">
            Review accounts and monitor access across the application.
          </p>
        </div>

        <div className="admin-actions">
          <Link className="secondary-button" href="/canvas">
            Back to canvas
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="secondary-button" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="admin-metrics" aria-label="User statistics">
        <article className="admin-card">
          <span>Total users</span>
          <strong>{totalUsers}</strong>
        </article>
        <article className="admin-card">
          <span>Verified users</span>
          <strong>{verifiedUsers}</strong>
        </article>
        <article className="admin-card">
          <span>Administrators</span>
          <strong>{adminUsers}</strong>
        </article>
      </section>

      <section className="admin-table-card">
        <div className="admin-table-heading">
          <div>
            <h2>Users</h2>
            <p>Showing the 100 most recently created accounts.</p>
          </div>
        </div>

        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name || "Unnamed user"}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`admin-badge admin-badge-${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.emailVerified ? "Verified" : "Unverified"}</td>
                  <td>
                    {user.createdAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
