import { Handle, Position } from "reactflow";

// Define the shape of our data based on the agreed JSON schema
interface TaskNodeData {
  label: string;
  note?: string;
  quadrant: "do_now" | "schedule" | "delegate" | "drop";
}

export default function TaskNode({ data }: { data: TaskNodeData }) {
  // Determine border color based on quadrant value
  const getBorderColor = () => {
    switch (data.quadrant) {
      case "do_now":
        return "border-red-500";
      case "schedule":
        return "border-teal-500";
      case "delegate":
        return "border-amber-500";
      case "drop":
        return "border-gray-500";
      default:
        return "border-gray-700";
    }
  };

  return (
    <div
      className={`bg-[#242424] text-white p-4 rounded-lg border-2 shadow-lg min-w-[200px] ${getBorderColor()}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 !bg-gray-500"
      />

      <div className="flex flex-col gap-2">
        <div className="font-bold text-sm">{data.label}</div>
        {data.note && (
          <div className="text-xs text-gray-400 italic">{data.note}</div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 !bg-gray-500"
      />
    </div>
  );
}
