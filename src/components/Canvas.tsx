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
      if (saved) {
        const parsed = JSON.parse(saved);
        setNodes(parsed);
      }
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
        background: "#1a1a1a",
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
        <QuadrantOverlay />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
        >
          <Background color="#333" gap={24} />
          <Controls
            style={{
              background: "#242424",
              border: "1px solid #333",
              borderRadius: "8px",
            }}
          />
          <MiniMap
            style={{
              background: "#242424",
              border: "1px solid #333",
              borderRadius: "8px",
            }}
            nodeColor={(n) => {
              const q = n.data?.quadrant;
              if (q === "do_now") return "#ef4444";
              if (q === "schedule") return "#14b8a6";
              if (q === "delegate") return "#f59e0b";
              return "#6b7280";
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
