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

// 1. Register the custom node type
const nodeTypes = {
  taskNode: TaskNode,
};

// 2. Update initial nodes to use the new type and schema structure
const initialNodes = [
  {
    id: "1",
    position: { x: 100, y: 100 },
    type: "taskNode", // Use our custom type
    data: {
      label: "DBMS exam prep",
      quadrant: "do_now",
      note: "Thursday deadline",
    },
  },
  {
    id: "2",
    position: { x: 350, y: 100 },
    type: "taskNode",
    data: { label: "Find hackathon team", quadrant: "schedule" },
  },
];

export default function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <QuadrantOverlay />
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
      </ReactFlow>
    </div>
  );
}
