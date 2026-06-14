"use client";

import { useState } from "react";

interface SidebarProps {
  onNodesReceived: (nodes: any[]) => void;
  onClear: () => void;
}

export default function Sidebar({ onNodesReceived, onClear }: SidebarProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/braindump", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (data.nodes && data.nodes.length > 0) {
        onNodesReceived(data.nodes);
        setText("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError("No tasks found. Try being more specific.");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "320px",
        height: "100vh",
        background: "#0f0f0f",
        borderRight: "1px solid #2a2a2a",
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "Inter, sans-serif",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 10,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "4px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#2d5a3f",
              boxShadow: "0 0 8px #2d5a3f",
            }}
          />
          <h2
            style={{
              color: "#fff",
              margin: 0,
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "0.3px",
            }}
          >
            Brain Dump
          </h2>
        </div>
        <p
          style={{
            color: "#555",
            fontSize: "12px",
            margin: 0,
            paddingLeft: "18px",
          }}
        >
          AI sorts chaos into your Eisenhower matrix
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "#1e1e1e" }} />

      {/* Textarea */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <label
          style={{
            color: "#888",
            fontSize: "11px",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          What's on your mind?
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) handleSubmit();
          }}
          placeholder="Study for DBMS exam tomorrow, finish portfolio, stop scrolling Instagram, reply to prof email..."
          style={{
            background: "#161616",
            border: "1px solid #2a2a2a",
            borderRadius: "10px",
            color: "#e5e5e5",
            padding: "14px",
            fontSize: "13px",
            resize: "none",
            height: "220px",
            fontFamily: "Inter, sans-serif",
            lineHeight: "1.6",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#2d5a3f")}
          onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
        />
        <p
          style={{
            color: "#444",
            fontSize: "11px",
            margin: 0,
            textAlign: "right",
          }}
        >
          {text.length} chars · Ctrl+Enter to submit
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "#2a1515",
            border: "1px solid #ef444440",
            borderRadius: "8px",
            padding: "10px 12px",
            color: "#ef4444",
            fontSize: "12px",
          }}
        >
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div
          style={{
            background: "#0f2a1a",
            border: "1px solid #2d5a3f",
            borderRadius: "8px",
            padding: "10px 12px",
            color: "#4ade80",
            fontSize: "12px",
          }}
        >
          ✓ Nodes added to your canvas!
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || !text.trim()}
        style={{
          background: loading || !text.trim() ? "#1a1a1a" : "#2d5a3f",
          color: loading || !text.trim() ? "#444" : "#fff",
          border: "1px solid",
          borderColor: loading || !text.trim() ? "#2a2a2a" : "#2d5a3f",
          borderRadius: "10px",
          padding: "13px",
          fontSize: "14px",
          fontWeight: 600,
          cursor: loading || !text.trim() ? "not-allowed" : "pointer",
          fontFamily: "Inter, sans-serif",
          transition: "all 0.2s",
          letterSpacing: "0.3px",
        }}
      >
        {loading ? "⏳ Organizing..." : "→ Organize My Thoughts"}
      </button>

      {/* Quadrant Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <p
          style={{
            color: "#444",
            fontSize: "10px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Quadrants
        </p>
        {[
          { color: "#ef4444", label: "Do Now", desc: "Urgent + Important" },
          {
            color: "#14b8a6",
            label: "Schedule",
            desc: "Important, not urgent",
          },
          {
            color: "#f59e0b",
            label: "Delegate",
            desc: "Urgent, not important",
          },
          { color: "#6b7280", label: "Drop", desc: "Neither" },
        ].map((q) => (
          <div
            key={q.label}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "2px",
                background: q.color,
                flexShrink: 0,
              }}
            />
            <span style={{ color: "#666", fontSize: "11px" }}>
              <span style={{ color: "#999" }}>{q.label}</span> — {q.desc}
            </span>
          </div>
        ))}
      </div>

      {/* Clear Button */}
      <button
        onClick={onClear}
        style={{
          background: "transparent",
          color: "#444",
          border: "1px solid #222",
          borderRadius: "8px",
          padding: "8px",
          fontSize: "12px",
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Clear Canvas
      </button>
    </div>
  );
}
