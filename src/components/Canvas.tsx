"use client";
import QuadrantOverlay from "./QuadrantOverlay";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import TaskNode from "./TaskNode";
import Sidebar from "./Sidebar";
import { useEffect } from "react";

const nodeTypes = { taskNode: TaskNode };

const quadrantPositions: Record<string, { x: number; y: number }> = {
  do_now: { x: 200, y: 150 },
  schedule: { x: 900, y: 150 },
  delegate: { x: 200, y: 600 },
  drop: { x: 900, y: 600 },
};

export default function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("second-brain-nodes");
      if (saved) setNodes(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load saved nodes", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("second-brain-nodes", JSON.stringify(nodes));
    } catch (e) {
      console.error("Failed to save nodes", e);
    }
  }, [nodes]);

  const handleNodesReceived = (newNodes: any[]) => {
    setNodes((prev) => {
      const quadrantCount: Record<string, number> = {
        do_now: 0,
        schedule: 0,
        delegate: 0,
        drop: 0,
      };
      prev.forEach((n) => {
        if (n.data?.quadrant)
          quadrantCount[n.data.quadrant] =
            (quadrantCount[n.data.quadrant] || 0) + 1;
      });

      const positioned = newNodes.map((node) => {
        const base = quadrantPositions[node.quadrant] || { x: 400, y: 300 };
        const count = quadrantCount[node.quadrant] || 0;
        quadrantCount[node.quadrant] = count + 1;
        return {
          id: `${node.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          type: "taskNode",
          position: {
            x: base.x + (count % 2) * 280,
            y: base.y + Math.floor(count / 2) * 160,
          },
          data: {
            label: node.label,
            note: node.note,
            quadrant: node.quadrant,
          },
        };
      });

      return [...prev, ...positioned];
    });
  };

  const handleClear = () => {
    setNodes([]);
    localStorage.removeItem("second-brain-nodes");
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        background: "#0a0a0a",
      }}
    >
      <Sidebar onNodesReceived={handleNodesReceived} onClear={handleClear} />

      <div
        style={{
          marginLeft: "320px",
          flex: 1,
          height: "100vh",
          position: "relative",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "48px",
            background: "linear-gradient(180deg, #0a0a0a 0%, transparent 100%)",
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: "12px",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#2d5a3f",
                boxShadow: "0 0 8px #2d5a3f",
              }}
            />
            <span
              style={{
                color: "#444",
                fontSize: "11px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Visual Second Brain · Canvas
            </span>
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: "16px",
              alignItems: "center",
            }}
          >
            {["do_now", "schedule", "delegate", "drop"].map((q) => {
              const colors: Record<string, string> = {
                do_now: "#ef4444",
                schedule: "#14b8a6",
                delegate: "#f59e0b",
                drop: "#6b7280",
              };
              const count = nodes.filter((n) => n.data?.quadrant === q).length;
              return (
                <div
                  key={q}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "2px",
                      background: colors[q],
                    }}
                  />
                  <span
                    style={{
                      color: "#555",
                      fontSize: "11px",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
            <span
              style={{
                color: "#333",
                fontSize: "11px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {nodes.length} total
            </span>
          </div>
        </div>

        <QuadrantOverlay />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          style={{ background: "transparent" }}
        >
          <Background color="#1e1e1e" gap={32} size={1} />

          <Controls
            style={{
              background: "#0f0f0f",
              border: "1px solid #2a2a2a",
              borderRadius: "10px",
              boxShadow: "0 4px 16px #00000080",
            }}
          />

          <MiniMap
            width={160}
            height={100}
            style={{
              background: "#0f0f0f",
              border: "1px solid #2a2a2a",
              borderRadius: "12px",
              boxShadow: "0 4px 16px #00000080",
            }}
            maskColor="rgba(0,0,0,0.7)"
            nodeColor={(n) => {
              const q = n.data?.quadrant;
              if (q === "do_now") return "#ef4444";
              if (q === "schedule") return "#14b8a6";
              if (q === "delegate") return "#f59e0b";
              return "#6b7280";
            }}
            nodeStrokeWidth={3}
            nodeBorderRadius={4}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
