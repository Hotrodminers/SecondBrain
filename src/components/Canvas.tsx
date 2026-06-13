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

const nodeTypes = { taskNode: TaskNode };

const quadrantPositions: Record<string, { x: number; y: number }> = {
  do_now: { x: 100, y: 100 },
  schedule: { x: 900, y: 100 },
  delegate: { x: 100, y: 500 },
  drop: { x: 900, y: 500 },
};

const initialNodes: any[] = [
  {
    id: "1",
    position: { x: 100, y: 100 },
    type: "taskNode",
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

  const handleNodesReceived = (newNodes: any[]) => {
    const positioned = newNodes.map((node, index) => {
      const base = quadrantPositions[node.quadrant] || { x: 400, y: 300 };
      return {
        id: node.id || crypto.randomUUID(),
        type: "taskNode",
        position: {
          x: base.x + (index % 2) * 250,
          y: base.y + Math.floor(index / 2) * 150,
        },
        data: {
          label: node.label,
          note: node.note,
          quadrant: node.quadrant,
        },
      };
    });

    // ADDS to existing nodes, doesn't replace them
    setNodes((prev) => [...prev, ...positioned]);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex" }}>
      <Sidebar onNodesReceived={handleNodesReceived} />

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
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
