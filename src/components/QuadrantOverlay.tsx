const quadrants = [
  { label: "Do Now", color: "rgba(239, 68, 68, 0.32)", borderRight: true, borderBottom: true },
  { label: "Schedule", color: "rgba(20, 184, 166, 0.32)", borderRight: false, borderBottom: true },
  { label: "Delegate", color: "rgba(245, 158, 11, 0.40)", borderRight: true, borderBottom: false },
  { label: "Drop", color: "rgba(107, 114, 128, 0.32)", borderRight: false, borderBottom: false },
];

const borderColor = "rgba(173, 188, 255, 0.08)";

export default function QuadrantOverlay() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
      }}
    >
      {quadrants.map((q) => (
        <div
          key={q.label}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRight: q.borderRight ? `1px solid ${borderColor}` : "none",
            borderBottom: q.borderBottom ? `1px solid ${borderColor}` : "none",
          }}
        >
          <span
            style={{
              fontSize: "3rem",
              fontWeight: 700,
              color: q.color,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              userSelect: "none",
            }}
          >
            {q.label}
          </span>
        </div>
      ))}
    </div>
  );
}
