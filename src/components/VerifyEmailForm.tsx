"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import AuthShell, { authButton, authInput, errorBox } from "@/components/AuthShell";

interface VerifyEmailFormProps {
  email: string;
}

export default function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Handle cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError("Please enter a 6-digit numeric code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess("Email verified successfully! Loading your canvas...");
      
      // Perform a full page redirect to `/canvas` to ensure the Server Component
      // queries the database and renders the protected route.
      window.location.href = "/canvas";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending || cooldown > 0) return;
    setError("");
    setSuccess("");
    setResending(true);

    try {
      const res = await fetch("/api/resend-otp", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send code.");
      } else {
        setSuccess("A new verification code has been sent to your email.");
        setCooldown(60);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell title="Verify your email" subtitle={`We sent a 6-digit code to ${email}`}>
      <div
        style={{
          background: "#1f1a0e",
          border: "1px solid #f59e0b40",
          borderRadius: "8px",
          padding: "10px 12px",
          color: "#fbbf24",
          fontSize: "12.5px",
          lineHeight: 1.5,
        }}
      >
        📩 Can&apos;t find the email? Check your <strong>spam / junk</strong> folder
        — and mark it &quot;Not spam&quot; so future codes land in your inbox.
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          type="text"
          maxLength={6}
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          required
          style={{
            ...authInput,
            textAlign: "center",
            fontSize: "24px",
            letterSpacing: "8px",
            fontFamily: "var(--font-ibm-plex-mono), monospace",
            fontWeight: 600,
          }}
        />
        {error && <div style={errorBox}>{error}</div>}
        {success && (
          <div style={{ background: "#11221b", border: "1px solid #10b98140", borderRadius: "8px", padding: "10px 12px", color: "#10b981", fontSize: "13px" }}>
            {success}
          </div>
        )}
        <button type="submit" disabled={loading} style={authButton(loading)}>
          {loading ? "Verifying..." : "Verify Code"}
        </button>
      </form>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", fontSize: "13px" }}>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          style={{
            background: "none",
            border: "none",
            color: cooldown > 0 || resending ? "#444" : "#14b8a6",
            cursor: cooldown > 0 || resending ? "not-allowed" : "pointer",
            fontSize: "13px",
            padding: 0,
            textDecoration: "none",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? "Sending..." : "Resend Code"}
        </button>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            background: "none",
            border: "none",
            color: "#888",
            cursor: "pointer",
            fontSize: "13px",
            padding: 0,
            fontFamily: "Inter, sans-serif",
          }}
        >
          Sign Out
        </button>
      </div>
    </AuthShell>
  );
}
