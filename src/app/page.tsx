import Link from "next/link";
import { auth } from "@/auth";
import NeuralBackground from "@/components/NeuralBackground";

const features = [
  {
    title: "Brain dump → structure",
    body: "Spill everything on your mind. AI sorts each thought into the right Eisenhower quadrant.",
  },
  {
    title: "YouTube → roadmap",
    body: "Drop a tutorial link and get a linked, step-by-step learning path on your canvas.",
  },
  {
    title: "See what matters now",
    body: "An infinite canvas that surfaces what's urgent, what can wait, and what to drop.",
  },
];

export default async function Home() {
  const session = await auth();
  const loggedIn = !!session?.user;

  return (
    <main className="home">
      <div className="home-bg">
        <NeuralBackground />
      </div>

      <nav className="home-nav">
        <div className="home-brand">
          <span className="home-brand-dot" />
          Visual Second Brain
        </div>
        <div className="home-nav-actions">
          {loggedIn ? (
            <>
              <Link href="/account" className="ghost-button">
                Account
              </Link>
              <Link href="/canvas" className="primary-button">
                Open Canvas
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="ghost-button">
                Log in
              </Link>
              <Link href="/signup" className="primary-button">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="home-hero">
        <p className="home-eyebrow">Track 6 · Visual Second Brain</p>
        <h1 className="home-title">Second Brain</h1>
        <p className="home-quote-sub">
          You tell us what to do.{" "}
          <span className="accent">We&apos;ll tell you when.</span>
        </p>
        <p className="home-sub">
          An infinite canvas for goals, deadlines, and ideas — powered by a brain
          that turns your chaos into a clear, prioritized plan.
        </p>
        <div className="home-cta">
          <Link href={loggedIn ? "/canvas" : "/signup"} className="primary-button">
            {loggedIn ? "Open Canvas" : "Get started — it's free"}
          </Link>
          <Link href={loggedIn ? "/account" : "/login"} className="secondary-button">
            {loggedIn ? "View account" : "Log in"}
          </Link>
        </div>
      </section>

      <section className="home-features">
        {features.map((f) => (
          <article className="home-feature" key={f.title}>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
