"use client";

import { Handle, Position } from "reactflow";

const quadrantColors: Record<string, string> = {
  do_now: "#ef4444", // red
  schedule: "#14b8a6", // teal
  delegate: "#f59e0b", // amber
  drop: "#6b7280", // gray
};

interface TaskNodeData {
  label: string;
  note?: string;
  quadrant: string;
}

export default function TaskNode({ data }: { data: TaskNodeData }) {
  const borderColor = quadrantColors[data.quadrant] || "#6b7280";

  return (
    <div
      style={{
        background: "#1e1e2e",
        border: `2px solid ${borderColor}`,
        borderRadius: "8px",
        padding: "12px 16px",
        minWidth: "160px",
        maxWidth: "220px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <Handle type="target" position={Position.Top} />

      <p style={{ margin: 0, fontSize: "14px", fontWeight: 500 }}>
        {data.label}
      </p>
      {data.note && (
        <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#9ca3af" }}>
          {data.note}
        </p>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
