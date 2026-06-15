"use client";
import QuadrantOverlay from "./QuadrantOverlay";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import TaskNode from "./TaskNode";
import SkeletonNode from "./SkeletonNode";
import Sidebar from "./Sidebar";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { getNodePosition, computeGroups } from "@/lib/quadrants";
import { saveCanvasState, loadCanvasState, clearCanvasState } from "@/lib/storage";
import { ClusterContext } from "./ClusterContext";

const nodeTypes = { taskNode: TaskNode, skeletonNode: SkeletonNode };

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
  const [collapsed, setCollapsed] = useState(false);

  // Keep a live reference to the latest nodes for async relationship refreshes.
  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Disjoint sets computed live over the whole board (all nodes + all edges,
  // AI-made or hand-drawn). Shared via context so nodes recolor on any change.
  const cluster = useMemo(() => {
    const real = nodes.filter((n) => n.type !== "skeletonNode");
    const rels = edges.map((e) => ({
      source: e.source,
      target: e.target,
      type: (e.data as any)?.relType || "manual",
    }));
    const { setColorOf, setIdOf } = computeGroups(
      real.map((n) => ({ id: n.id, category: n.data?.category ?? null })),
      rels,
    );
    return { setColorOf, setIdOf };
  }, [nodes, edges]);

  useEffect(() => {
    const saved = loadCanvasState();
    if (saved && saved.nodes.length > 0) {
      setNodes(saved.nodes);
      setEdges(saved.edges);
    } else {
      setNodes(initialDemoNodes);
      setEdges(initialDemoEdges);
    }
    setIsLoaded(true);
  }, [setNodes, setEdges]);

  useEffect(() => {
    if (!isLoaded) return;
    const realNodes = nodes.filter((n) => n.type !== "skeletonNode");
    saveCanvasState(realNodes, edges);
  }, [nodes, edges, isLoaded]);

  useEffect(() => {
    if (showSkeleton) {
      setNodes((prev) => [...prev, ...skeletonNodes]);
    } else {
      setNodes((prev) => prev.filter((n) => n.type !== "skeletonNode"));
    }
  }, [showSkeleton, setNodes]);

  // Re-link the WHOLE board: send every current task node to the relationship
  // engine and merge in any new edges (deduping by source→target).
  const refreshRelationships = useCallback(async () => {
    const real = nodesRef.current.filter((n) => n.type !== "skeletonNode");
    if (real.length < 2) return;

    const payload = real.map((n) => ({
      id: n.id,
      label: n.data?.label,
      note: n.data?.note ?? null,
    }));

    try {
      const res = await fetch("/api/relationships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: payload }),
      });
      const data = await res.json();
      if (!data.edges?.length) return;

      setEdges((prev) => {
        // Dedupe by node PAIR (either direction, any type) so a re-link never
        // draws a second edge between two tasks that are already connected.
        const pairKey = (a: string, b: string) => [a, b].sort().join("|");
        const seen = new Set(prev.map((e) => pairKey(e.source, e.target)));
        const fresh = data.edges.filter((e: any) => {
          const k = pairKey(e.source, e.target);
          if (seen.has(k)) return false;
          seen.add(k); // also dedupe within this batch
          return true;
        });
        return [...prev, ...fresh];
      });
    } catch (err) {
      console.error("[relationships] refresh failed:", err);
    }
  }, [setEdges]);

  const handleNodesReceived = useCallback(
    (newNodes: any[], options?: { linkAll?: boolean }) => {
      const cleanedPrev = nodesRef.current.filter(
        (n) => n.type !== "skeletonNode",
      );

      const quadrantCount: Record<string, number> = {};
      cleanedPrev.forEach((n) => {
        if (n.data?.quadrant) {
          quadrantCount[n.data.quadrant] =
            (quadrantCount[n.data.quadrant] || 0) + 1;
        }
      });

      const positioned = newNodes.map((node) => {
        const count = quadrantCount[node.quadrant] || 0;
        quadrantCount[node.quadrant] = count + 1;

        return {
          id:
            node.id ||
            `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          type: "taskNode",
          position: getNodePosition(node.quadrant, count),
          data: {
            label: node.label,
            note: node.note,
            quadrant: node.quadrant,
            category: node.category ?? null,
          },
        };
      });

      const merged = [...cleanedPrev, ...positioned];
      nodesRef.current = merged; // sync so refreshRelationships sees new nodes
      setNodes(merged);

      // After a brain dump, re-link across everything on the board.
      if (options?.linkAll) refreshRelationships();
    },
    [setNodes, refreshRelationships],
  );

  // Manual linking: dragging between node handles creates an edge.
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            data: { relType: "manual" },
            style: { stroke: "#9ca3af", strokeWidth: 2 },
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  const handleEdgesReceived = useCallback((newEdges: any[]) => {
    setEdges((prev) => [...prev, ...newEdges]);
  }, [setEdges]);

  const handleClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    clearCanvasState();
  }, [setNodes, setEdges]);

  return (
    <ClusterContext.Provider value={cluster}>
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        background: "#0a0a0a",
      }}
    >
      <Sidebar
        onNodesReceived={handleNodesReceived}
        onEdgesReceived={handleEdgesReceived}
        onClear={handleClear}
        onLoadingChange={setShowSkeleton}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <div
        style={{
          marginLeft: collapsed ? "0px" : "320px",
          transition: "margin-left 0.25s ease",
          flex: 1,
          height: "100vh",
          position: "relative",
        }}
      >
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
          onConnect={onConnect}
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
            style={{
              width: 160,
              height: 100,
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
    </ClusterContext.Provider>
  );
}
