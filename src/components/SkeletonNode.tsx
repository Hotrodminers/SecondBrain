"use client";

export default function SkeletonNode() {
  return (
    <div
      style={{
        background: "#161616",
        border: "1.5px solid #2a2a2a",
        borderLeft: "3px solid #333",
        borderRadius: "10px",
        padding: "12px 14px",
        minWidth: "180px",
        maxWidth: "220px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          width: "50px",
          height: "8px",
          borderRadius: "4px",
          background: "#2a2a2a",
          marginBottom: "8px",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <div
        style={{
          width: "100%",
          height: "12px",
          borderRadius: "4px",
          background: "#2a2a2a",
          marginBottom: "6px",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <div
        style={{
          width: "70%",
          height: "10px",
          borderRadius: "4px",
          background: "#222",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
