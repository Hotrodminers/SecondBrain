"use client";
import QuadrantOverlay from "./QuadrantOverlay";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import TaskNode from "./TaskNode";
import SkeletonNode from "./SkeletonNode";
import Sidebar from "./Sidebar";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  saveCanvasState,
  loadCanvasState,
  clearCanvasState,
} from "@/lib/storage";
import { computeGroups } from "@/lib/quadrants";
import { ClusterContext } from "./ClusterContext";

// Defined OUTSIDE component — prevents React Flow nodeTypes/edgeTypes warning
const nodeTypes = { taskNode: TaskNode, skeletonNode: SkeletonNode };

const quadrantPositions: Record<string, { x: number; y: number }> = {
  do_now: { x: 200, y: 150 },
  schedule: { x: 900, y: 150 },
  delegate: { x: 200, y: 600 },
  drop: { x: 900, y: 600 },
};

const skeletonNodes = [
  { id: "skeleton-1", type: "skeletonNode", position: { x: 250, y: 200 }, data: {} },
  { id: "skeleton-2", type: "skeletonNode", position: { x: 950, y: 200 }, data: {} },
  { id: "skeleton-3", type: "skeletonNode", position: { x: 250, y: 650 }, data: {} },
  { id: "skeleton-4", type: "skeletonNode", position: { x: 950, y: 650 }, data: {} },
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
    id: "demo-edge-yt1-yt2",
    source: "yt-1",
    target: "yt-2",
    animated: true,
    style: { stroke: "#14b8a6", strokeWidth: 2 },
  },
  {
    id: "demo-edge-yt2-yt3",
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

  // Ref-based seen-set: synchronous guard against duplicate edge IDs.
  const seenEdgeIds = useRef<Set<string>>(new Set());

  // Live reference to the latest nodes for async relationship refreshes.
  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Disjoint-set grouping computed live from category + edges, shared via
  // context so TaskNodes recolor on any change.
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

  // Load from storage on mount
  useEffect(() => {
    try {
      const hadOldNodes = localStorage.getItem("second-brain-nodes");
      const hadOldEdges = localStorage.getItem("second-brain-edges");
      if (hadOldNodes || hadOldEdges) {
        localStorage.removeItem("second-brain-nodes");
        localStorage.removeItem("second-brain-edges");
      }

      const saved = loadCanvasState();

      if (saved && saved.nodes.length > 0) {
        setNodes(saved.nodes);
        setEdges(saved.edges);
        saved.edges.forEach((e: any) => seenEdgeIds.current.add(e.id));
      } else {
        setNodes(initialDemoNodes);
        setEdges(initialDemoEdges);
        initialDemoEdges.forEach((e) => seenEdgeIds.current.add(e.id));
      }
    } catch (e) {
      console.error("Failed to load saved data", e);
      setNodes(initialDemoNodes);
      setEdges(initialDemoEdges);
      initialDemoEdges.forEach((e) => seenEdgeIds.current.add(e.id));
    } finally {
      setIsLoaded(true);
    }
  }, [setNodes, setEdges]);

  // Persist to storage on every change
  useEffect(() => {
    if (!isLoaded) return;
    const realNodes = nodes.filter((n) => n.type !== "skeletonNode");
    saveCanvasState(realNodes, edges);
  }, [nodes, edges, isLoaded]);

  // Add/remove skeleton nodes while AI is thinking
  useEffect(() => {
    if (showSkeleton) {
      setNodes((prev) => [...prev, ...skeletonNodes]);
    } else {
      setNodes((prev) => prev.filter((n) => n.type !== "skeletonNode"));
    }
  }, [showSkeleton, setNodes]);

  // Manual linking — drag from a node handle to another node.
  const onConnect = useCallback(
    (connection: Connection) => {
      const edgeId = `manual-${connection.source}-${connection.target}-${Date.now()}`;
      if (seenEdgeIds.current.has(edgeId)) return;
      seenEdgeIds.current.add(edgeId);

      setEdges((prev) =>
        addEdge(
          {
            ...connection,
            id: edgeId,
            animated: false,
            data: { relType: "manual" },
            style: { stroke: "#9ca3af", strokeWidth: 2 },
          },
          prev,
        ),
      );
    },
    [setEdges],
  );

  // Re-link the WHOLE board: send every current task node to the relationship
  // engine and merge in new dependency edges (deduped by node pair + id).
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
        const pairKey = (a: string, b: string) => [a, b].sort().join("|");
        const seenPairs = new Set(prev.map((e) => pairKey(e.source, e.target)));
        const fresh = data.edges.filter((e: any) => {
          const k = pairKey(e.source, e.target);
          if (seenPairs.has(k) || seenEdgeIds.current.has(e.id)) return false;
          seenPairs.add(k);
          seenEdgeIds.current.add(e.id);
          return true;
        });
        return fresh.length > 0 ? [...prev, ...fresh] : prev;
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

      // After a brain dump, link new tasks against the whole board.
      if (options?.linkAll) refreshRelationships();
    },
    [setNodes, refreshRelationships],
  );

  const handleEdgesReceived = (newEdges: any[]) => {
    const uniqueNewEdges = newEdges.filter((edge) => {
      if (seenEdgeIds.current.has(edge.id)) return false;
      seenEdgeIds.current.add(edge.id);
      return true;
    });

    if (uniqueNewEdges.length === 0) return;

    setEdges((prev) => {
      const existingIds = new Set(prev.map((e) => e.id));
      const deduped = uniqueNewEdges.filter((e) => !existingIds.has(e.id));
      return deduped.length > 0 ? [...prev, ...deduped] : prev;
    });
  };

  const handleClear = () => {
    seenEdgeIds.current.clear();
    setNodes([]);
    setEdges([]);
    nodesRef.current = [];
    clearCanvasState();
    localStorage.removeItem("second-brain-nodes");
    localStorage.removeItem("second-brain-edges");
  };

  const handleEdgeDoubleClick = (event: React.MouseEvent, edge: any) => {
    event.stopPropagation();
    seenEdgeIds.current.delete(edge.id);
    setEdges((prevEdges) => prevEdges.filter((e) => e.id !== edge.id));
  };

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
            onConnect={onConnect}
            onEdgeDoubleClick={handleEdgeDoubleClick}
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
