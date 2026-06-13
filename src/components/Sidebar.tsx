"use client";

import { useState } from "react";

interface SidebarProps {
  onNodesReceived: (nodes: any[]) => void;
}

export default function Sidebar({ onNodesReceived }: SidebarProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/braindump", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (data.nodes) {
        onNodesReceived(data.nodes);
        setText("");
        setCharCount(0);
      } else {
        setError("Something went wrong. Try again.");
      }
    } catch (err) {
      setError("API error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "320px",
        height: "100vh",
        background: "#242424",
        borderRight: "1px solid #333",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        fontFamily: "Inter, sans-serif",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 10,
      }}
    >
      <h2 style={{ color: "#fff", margin: 0, fontSize: "16px" }}>
        🧠 Brain Dump
      </h2>

      <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>
        Dump everything on your mind. AI will sort it.
      </p>

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setCharCount(e.target.value.length);
        }}
        placeholder="Dump everything on your mind..."
        style={{
          background: "#1a1a1a",
          border: "1px solid #444",
          borderRadius: "8px",
          color: "#fff",
          padding: "12px",
          fontSize: "13px",
          resize: "none",
          height: "200px",
          fontFamily: "Inter, sans-serif",
        }}
      />

      <p
        style={{
          color: "#6b7280",
          fontSize: "11px",
          margin: 0,
          textAlign: "right",
        }}
      >
        {charCount} characters
      </p>

      {error && (
        <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !text.trim()}
        style={{
          background: loading ? "#1a3a2a" : "#2d5a3f",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "12px",
          fontSize: "14px",
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {loading ? "Processing..." : "Organize My Thoughts →"}
      </button>
    </div>
  );
}
