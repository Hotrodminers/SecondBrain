"use client";

import type { CSSProperties } from "react";
import Link from "next/link";

export const authInput: CSSProperties = {
  background: "#161616",
  border: "1px solid #2a2a2a",
  borderRadius: "10px",
  color: "#e5e5e5",
  padding: "13px 14px",
  fontSize: "14px",
  outline: "none",
  fontFamily: "Inter, sans-serif",
};

export const oauthButton: CSSProperties = {
  background: "#161616",
  border: "1px solid #2a2a2a",
  borderRadius: "10px",
  color: "#e5e5e5",
  padding: "12px",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "Inter, sans-serif",
};

export const errorBox: CSSProperties = {
  background: "#2a1515",
  border: "1px solid #ef444440",
  borderRadius: "8px",
  padding: "10px 12px",
  color: "#ef4444",
  fontSize: "13px",
};

export function authButton(loading: boolean): CSSProperties {
  return {
    background: loading ? "#1a1a1a" : "#2d5a3f",
    color: loading ? "#444" : "#fff",
    border: "1px solid",
    borderColor: loading ? "#2a2a2a" : "#2d5a3f",
    borderRadius: "10px",
    padding: "13px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer",
    fontFamily: "Inter, sans-serif",
    marginTop: "4px",
  };
}

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
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
          maxWidth: "380px",
          background: "#0f0f0f",
          border: "1px solid #2a2a2a",
          borderRadius: "16px",
          padding: "32px 28px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#666",
            fontSize: "13px",
            textDecoration: "none",
          }}
        >
          <span style={{ fontSize: "15px", lineHeight: 1 }}>←</span> Back to home
        </Link>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#2d5a3f",
                boxShadow: "0 0 8px #2d5a3f",
              }}
            />
            <h1
              style={{
                color: "#fff",
                margin: 0,
                fontSize: "20px",
                fontWeight: 600,
              }}
            >
              {title}
            </h1>
          </div>
          <p style={{ color: "#555", fontSize: "13px", margin: 0, paddingLeft: "18px" }}>
            {subtitle}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
