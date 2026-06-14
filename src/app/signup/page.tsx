"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell, {
  authButton,
  authInput,
  errorBox,
} from "@/components/AuthShell";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not create account.");
        setLoading(false);
        return;
      }

      // Auto sign-in after successful registration.
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      setLoading(false);

      if (signInRes?.error) {
        // Account created but auto-login failed; send them to login.
        router.push("/login");
      } else {
        router.push("/canvas");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create account" subtitle="Start organizing your chaos">
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        <input
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={authInput}
        />
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
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={authInput}
        />
        {error && <div style={errorBox}>{error}</div>}
        <button type="submit" disabled={loading} style={authButton(loading)}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p style={{ color: "#555", fontSize: "13px", textAlign: "center", margin: 0 }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "#14b8a6", textDecoration: "none" }}>
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
