"use client";

import { useState } from "react";
import { createYouTubeEdges } from "@/lib/quadrants";

interface SidebarProps {
  onNodesReceived: (nodes: any[]) => void;
  onEdgesReceived?: (edges: any[]) => void;
  onClear: () => void;
  onLoadingChange: (loading: boolean) => void;
}

export default function Sidebar({
  onNodesReceived,
  onEdgesReceived,
  onClear,
  onLoadingChange,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"dump" | "youtube">("dump");
  const [text, setText] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleBrainDumpSubmit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    onLoadingChange(true);
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
      onLoadingChange(false);
    }
  };

  const handleYoutubeSubmit = async () => {
    if (!ytUrl.trim() || loading) return;
    setLoading(true);
    onLoadingChange(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: ytUrl }),
      });

      const data = await response.json();

      if (data.steps && data.steps.length > 0) {
        const mappedNodes = data.steps.map((step: any, index: number) => ({
          id: step.id || `yt_${Date.now()}_${index}`,
          label: step.label,
          note: data.title || "YouTube Roadmap",
          quadrant: "schedule",
          order: step.order || index + 1,
        }));

        const mappedEdges = createYouTubeEdges(mappedNodes);

        onNodesReceived(mappedNodes);
        if (onEdgesReceived) {
          onEdgesReceived(mappedEdges);
        }

        setYtUrl("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError("Could not extract a learning path from this video.");
      }
    } catch (err) {
      console.error("YouTube Error:", err);
      setError("Failed to process YouTube video. Check the console.");
    } finally {
      setLoading(false);
      onLoadingChange(false);
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
            Visual Second Brain
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
          Organize chaos and learn step-by-step
        </p>
      </div>

      {/* Tab Selector */}
      <div
        style={{
          display: "flex",
          background: "#161616",
          borderRadius: "8px",
          padding: "4px",
          gap: "4px",
        }}
      >
        <button
          onClick={() => setActiveTab("dump")}
          style={{
            flex: 1,
            background: activeTab === "dump" ? "#222" : "transparent",
            color: activeTab === "dump" ? "#fff" : "#666",
            border: "none",
            borderRadius: "6px",
            padding: "8px",
            fontSize: "12px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Brain Dump
        </button>
        <button
          onClick={() => setActiveTab("youtube")}
          style={{
            flex: 1,
            background: activeTab === "youtube" ? "#222" : "transparent",
            color: activeTab === "youtube" ? "#fff" : "#666",
            border: "none",
            borderRadius: "6px",
            padding: "8px",
            fontSize: "12px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          YT Roadmap
        </button>
      </div>

      {/* Main Form Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {activeTab === "dump" ? (
          <>
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
                if (e.key === "Enter" && e.ctrlKey) handleBrainDumpSubmit();
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

            <button
              onClick={handleBrainDumpSubmit}
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
          </>
        ) : (
          <>
            <label
              style={{
                color: "#888",
                fontSize: "11px",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              YouTube Video URL
            </label>
            <input
              type="text"
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleYoutubeSubmit();
              }}
              placeholder="https://www.youtube.com/watch?v=..."
              style={{
                background: "#161616",
                border: "1px solid #2a2a2a",
                borderRadius: "10px",
                color: "#e5e5e5",
                padding: "14px",
                fontSize: "13px",
                fontFamily: "Inter, sans-serif",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#2d5a3f")}
              onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
            />
            <p
              style={{
                color: "#555",
                fontSize: "11px",
                margin: 0,
                lineHeight: "1.4",
              }}
            >
              Paste any tutorial URL. AI will break it down into a linear
              learning milestone chain inside your Schedule quadrant.
            </p>

            <button
              onClick={handleYoutubeSubmit}
              disabled={loading || !ytUrl.trim()}
              style={{
                background: loading || !ytUrl.trim() ? "#1a1a1a" : "#14b8a6",
                color: loading || !ytUrl.trim() ? "#444" : "#fff",
                border: "1px solid",
                borderColor: loading || !ytUrl.trim() ? "#2a2a2a" : "#14b8a6",
                borderRadius: "10px",
                padding: "13px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: loading || !ytUrl.trim() ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif",
                transition: "all 0.2s",
                letterSpacing: "0.3px",
                marginTop: "8px",
              }}
            >
              {loading ? "⏳ Building Roadmap..." : "⚡ Generate Study Path"}
            </button>
          </>
        )}
      </div>

      {/* Status Messages */}
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
          ✓ Canvas synced perfectly!
        </div>
      )}

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
