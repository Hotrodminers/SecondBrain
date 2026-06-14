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
import SkeletonNode from "./SkeletonNode";
import Sidebar from "./Sidebar";
import { useEffect, useState } from "react";

const nodeTypes = { taskNode: TaskNode, skeletonNode: SkeletonNode };

const quadrantPositions: Record<string, { x: number; y: number }> = {
  do_now: { x: 200, y: 150 },
  schedule: { x: 900, y: 150 },
  delegate: { x: 200, y: 600 },
  drop: { x: 900, y: 600 },
};

const skeletonNodes = [
  {
    id: "skeleton-1",
    type: "skeletonNode",
    position: { x: 250, y: 200 },
    data: {},
  },
  {
    id: "skeleton-2",
    type: "skeletonNode",
    position: { x: 950, y: 200 },
    data: {},
  },
  {
    id: "skeleton-3",
    type: "skeletonNode",
    position: { x: 250, y: 650 },
    data: {},
  },
  {
    id: "skeleton-4",
    type: "skeletonNode",
    position: { x: 950, y: 650 },
    data: {},
  },
];

// Pre-seeded demo state for high-impact first load
const initialDemoNodes = [
  {
    id: "demo-1",
    type: "taskNode",
    position: { x: 150, y: 120 },
    data: {
      label: "File SOP application",
      note: "Get final approval from Prof. Anita",
      quadrant: "do_now",
    },
  },
  {
    id: "demo-2",
    type: "taskNode",
    position: { x: 450, y: 120 },
    data: {
      label: "Optimize stereo vision pipeline",
      note: "SGBM algorithm refinement in Python",
      quadrant: "do_now",
    },
  },
  {
    id: "demo-3",
    type: "taskNode",
    position: { x: 900, y: 120 },
    data: {
      label: "Plan PS-1 station list",
      note: "Targeting Mumbai/Pune/Bangalore tech roles",
      quadrant: "schedule",
    },
  },
  {
    id: "demo-4",
    type: "taskNode",
    position: { x: 150, y: 600 },
    data: {
      label: "Follow up on consumer case",
      note: "Asus laptop grievance / replacement",
      quadrant: "delegate",
    },
  },
  {
    id: "demo-5",
    type: "taskNode",
    position: { x: 900, y: 600 },
    data: {
      label: "Valorant ranked grind",
      note: "Just one more game...",
      quadrant: "drop",
    },
  },

  // YouTube Roadmap Chain (Schedule Quadrant)
  {
    id: "yt-1",
    type: "taskNode",
    position: { x: 900, y: 280 },
    data: {
      label: "Intro to React Flow",
      note: "YouTube Tutorial: Core Concepts",
      quadrant: "schedule",
    },
  },
  {
    id: "yt-2",
    type: "taskNode",
    position: { x: 900, y: 380 },
    data: {
      label: "Building Custom Nodes",
      note: "YouTube Tutorial: UI/UX Design",
      quadrant: "schedule",
    },
  },
  {
    id: "yt-3",
    type: "taskNode",
    position: { x: 900, y: 480 },
    data: {
      label: "Complex State Management",
      note: "YouTube Tutorial: Zustand integration",
      quadrant: "schedule",
    },
  },
];

const initialDemoEdges = [
  {
    id: "e-yt1-yt2",
    source: "yt-1",
    target: "yt-2",
    animated: true,
    style: { stroke: "#14b8a6", strokeWidth: 2 },
  },
  {
    id: "e-yt2-yt3",
    source: "yt-2",
    target: "yt-3",
    animated: true,
    style: { stroke: "#14b8a6", strokeWidth: 2 },
  },
];

export default function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage or inject demo data on mount
  useEffect(() => {
    try {
      const savedNodes = localStorage.getItem("second-brain-nodes");
      const savedEdges = localStorage.getItem("second-brain-edges");

      const parsedNodes = savedNodes ? JSON.parse(savedNodes) : [];
      const parsedEdges = savedEdges ? JSON.parse(savedEdges) : [];

      if (parsedNodes.length > 0) {
        setNodes(parsedNodes);
        setEdges(parsedEdges);
      } else {
        // Pre-seed demo state if empty
        setNodes(initialDemoNodes);
        setEdges(initialDemoEdges);
      }
    } catch (e) {
      console.error("Failed to load saved data", e);
      setNodes(initialDemoNodes);
      setEdges(initialDemoEdges);
    } finally {
      setIsLoaded(true);
    }
  }, [setNodes, setEdges]);

  // Save to localStorage on changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("second-brain-nodes", JSON.stringify(nodes));
      localStorage.setItem("second-brain-edges", JSON.stringify(edges));
    } catch (e) {
      console.error("Failed to save data", e);
    }
  }, [nodes, edges, isLoaded]);

  // Force React Flow state to accept or remove skeletons dynamically
  useEffect(() => {
    if (showSkeleton) {
      setNodes((prev) => [...prev, ...skeletonNodes]);
    } else {
      setNodes((prev) => prev.filter((n) => n.type !== "skeletonNode"));
    }
  }, [showSkeleton, setNodes]);

  const handleNodesReceived = (newNodes: any[]) => {
    setNodes((prev) => {
      // Clean out skeletons immediately if they somehow lingered
      const cleanedPrev = prev.filter((n) => n.type !== "skeletonNode");

      const quadrantCount: Record<string, number> = {
        do_now: 0,
        schedule: 0,
        delegate: 0,
        drop: 0,
      };
      cleanedPrev.forEach((n) => {
        if (n.data?.quadrant)
          quadrantCount[n.data.quadrant] =
            (quadrantCount[n.data.quadrant] || 0) + 1;
      });

      const positioned = newNodes.map((node) => {
        const base = quadrantPositions[node.quadrant] || { x: 400, y: 300 };
        const count = quadrantCount[node.quadrant] || 0;
        quadrantCount[node.quadrant] = count + 1;

        return {
          id:
            node.id ||
            `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          type: "taskNode",
          position: {
            x: base.x + (count % 2) * 280,
            y: base.y + Math.floor(count / 2) * 160,
          },
          data: { label: node.label, note: node.note, quadrant: node.quadrant },
        };
      });

      return [...cleanedPrev, ...positioned];
    });
  };

  const handleEdgesReceived = (newEdges: any[]) => {
    setEdges((prev) => [...prev, ...newEdges]);
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    localStorage.removeItem("second-brain-nodes");
    localStorage.removeItem("second-brain-edges");
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
      {/* SIDEBAR UPDATED WITH onEdgesReceived PROP */}
      <Sidebar
        onNodesReceived={handleNodesReceived}
        onEdgesReceived={handleEdgesReceived}
        onClear={handleClear}
        onLoadingChange={setShowSkeleton}
      />

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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
              const count = nodes.filter(
                (n) => n.data?.quadrant === q && n.type !== "skeletonNode",
              ).length;
              return (
                <div
                  key={q}
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
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
              {nodes.filter((n) => n.type !== "skeletonNode").length} total
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
