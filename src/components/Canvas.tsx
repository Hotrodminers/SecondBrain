"use client";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
} from "reactflow";

import "reactflow/dist/style.css";
import TaskNode from "./TaskNode";

const nodeTypes = { taskNode: TaskNode };

const initialNodes = [
  {
    id: "1",
    position: { x: 100, y: 100 },
    type: "taskNode",
    data: {
      label: "DBMS exam prep",
      note: "Thursday deadline",
      quadrant: "do_now",
    },
  },
  {
    id: "2",
    position: { x: 400, y: 100 },
    type: "taskNode",
    data: { label: "Prepare portfolio", quadrant: "schedule" },
  },
  {
    id: "3",
    position: { x: 100, y: 300 },
    type: "taskNode",
    data: { label: "Reply to emails", quadrant: "delegate" },
  },
  {
    id: "4",
    position: { x: 400, y: 300 },
    type: "taskNode",
    data: { label: "Random tab hoarding", quadrant: "drop" },
  },
];

export default function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel
          position="top-left"
          style={{ width: "100%", height: "100%", pointerEvents: "none" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "1fr 1fr",
              width: "100vw",
              height: "100vh",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            {[
              { label: "DO NOW", color: "#ef4444" },
              { label: "SCHEDULE", color: "#14b8a6" },
              { label: "DELEGATE", color: "#f59e0b" },
              { label: "DROP", color: "#6b7280" },
            ].map((zone) => (
              <div
                key={zone.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px dashed rgba(255,255,255,0.07)",
                }}
              >
                <span
                  style={{
                    fontSize: "64px",
                    fontWeight: 800,
                    color: zone.color,
                    opacity: 0.08,
                    letterSpacing: "4px",
                    userSelect: "none",
                  }}
                >
                  {zone.label}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
