"use client";

import { Handle, Position } from "reactflow";

const quadrantColors: Record<string, string> = {
  do_now: "#ef4444",
  schedule: "#14b8a6",
  delegate: "#f59e0b",
  drop: "#6b7280",
};

const quadrantLabels: Record<string, string> = {
  do_now: "DO NOW",
  schedule: "SCHEDULE",
  delegate: "DELEGATE",
  drop: "DROP",
};

export default function TaskNode({ data }: { data: any }) {
  const color = quadrantColors[data.quadrant] || "#6b7280";
  const label = quadrantLabels[data.quadrant] || "";

  return (
    <div
      style={{
        background: "#161616",
        border: `1.5px solid ${color}33`,
        borderLeft: `3px solid ${color}`,
        borderRadius: "10px",
        padding: "12px 14px",
        minWidth: "180px",
        maxWidth: "220px",
        fontFamily: "Inter, sans-serif",
        boxShadow: `0 4px 24px ${color}15, 0 1px 4px #00000060`,
        transition: "box-shadow 0.2s",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />

      {/* Quadrant badge */}
      <div
        style={{
          fontSize: "9px",
          fontWeight: 700,
          letterSpacing: "1.5px",
          color: color,
          opacity: 0.8,
          marginBottom: "6px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      {/* Label */}
      <p
        style={{
          margin: 0,
          fontSize: "13px",
          fontWeight: 600,
          color: "#e5e5e5",
          lineHeight: "1.4",
        }}
      >
        {data.label}
      </p>

      {/* Note */}
      {data.note && (
        <p
          style={{
            margin: "6px 0 0",
            fontSize: "11px",
            color: "#666",
            lineHeight: "1.4",
            fontStyle: "italic",
          }}
        >
          {data.note}
        </p>
      )}

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}
