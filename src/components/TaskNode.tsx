"use client";

import { Handle, Position } from "reactflow";
import { useState, useCallback } from "react";
import { useReactFlow } from "reactflow";

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

export default function TaskNode({ id, data }: { id: string; data: any }) {
  const color = quadrantColors[data.quadrant] || "#6b7280";
  const label = quadrantLabels[data.quadrant] || "";
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const [hovered, setHovered] = useState(false);
  const { setNodes, deleteElements } = useReactFlow();

  const handleDelete = useCallback(() => {
    deleteElements({ nodes: [{ id }] });
  }, [id, deleteElements]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleEditDone = useCallback(() => {
    setIsEditing(false);
    if (editValue.trim()) {
      setNodes((nodes) =>
        nodes.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, label: editValue.trim() } }
            : n,
        ),
      );
    } else {
      setEditValue(data.label);
    }
  }, [editValue, id, setNodes, data.label]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={handleDoubleClick}
      style={{
        background: "#161616",
        border: `1.5px solid ${hovered ? color + "66" : color + "33"}`,
        borderLeft: `3px solid ${color}`,
        borderRadius: "10px",
        padding: "12px 14px",
        minWidth: "180px",
        maxWidth: "220px",
        fontFamily: "Inter, sans-serif",
        boxShadow: hovered
          ? `0 4px 24px ${color}30, 0 1px 4px #00000060`
          : `0 4px 24px ${color}15, 0 1px 4px #00000060`,
        transition: "all 0.2s",
        position: "relative",
        cursor: "grab",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />

      {/* Delete button */}
      {hovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            background: "#2a2a2a",
            border: "1px solid #444",
            borderRadius: "4px",
            color: "#888",
            width: "18px",
            height: "18px",
            fontSize: "10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      )}

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

      {/* Label — editable on double click */}
      {isEditing ? (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleEditDone}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleEditDone();
            if (e.key === "Escape") {
              setEditValue(data.label);
              setIsEditing(false);
            }
          }}
          style={{
            background: "#0f0f0f",
            border: `1px solid ${color}`,
            borderRadius: "4px",
            color: "#e5e5e5",
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: "Inter, sans-serif",
            width: "100%",
            padding: "2px 6px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      ) : (
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
      )}

      {/* Note */}
      {data.note && !isEditing && (
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

      {/* Double click hint */}
      {hovered && !isEditing && (
        <p
          style={{
            margin: "6px 0 0",
            fontSize: "9px",
            color: "#444",
            letterSpacing: "0.5px",
          }}
        >
          double-click to edit
        </p>
      )}

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}
