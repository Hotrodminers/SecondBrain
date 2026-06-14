"use client";

import { Suspense, useEffect, useState } from "react";
import { signIn, getProviders } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthShell, {
  authButton,
  authInput,
  oauthButton,
  errorBox,
} from "@/components/AuthShell";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/canvas";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauth, setOauth] = useState({ google: false, github: false });

  useEffect(() => {
    getProviders().then((p) => {
      setOauth({ google: !!p?.google, github: !!p?.github });
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your second brain">
      {(oauth.google || oauth.github) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {oauth.google && (
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl })}
              style={oauthButton}
            >
              Continue with Google
            </button>
          )}
          {oauth.github && (
            <button
              type="button"
              onClick={() => signIn("github", { callbackUrl })}
              style={oauthButton}
            >
              Continue with GitHub
            </button>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "#444",
              fontSize: "11px",
              margin: "4px 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#2a2a2a" }} />
            OR
            <div style={{ flex: 1, height: "1px", background: "#2a2a2a" }} />
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={authInput}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={authInput}
        />
        {error && <div style={errorBox}>{error}</div>}
        <button type="submit" disabled={loading} style={authButton(loading)}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p style={{ color: "#555", fontSize: "13px", textAlign: "center", margin: 0 }}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" style={{ color: "#14b8a6", textDecoration: "none" }}>
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
