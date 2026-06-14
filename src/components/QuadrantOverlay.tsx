const quadrants = [
  {
    label: "Do Now",
    color: "rgba(239, 68, 68, 0.32)",
    borderRight: true,
    borderBottom: true,
    tip: "Important AND urgent — there are consequences if it slips. Do it today (e.g. exam tomorrow).",
  },
  {
    label: "Schedule",
    color: "rgba(20, 184, 166, 0.32)",
    borderRight: false,
    borderBottom: true,
    tip: "Important but NOT urgent yet. Plan a time so it doesn't get ignored (e.g. build your portfolio).",
  },
  {
    label: "Delegate",
    color: "rgba(245, 158, 11, 0.40)",
    borderRight: true,
    borderBottom: false,
    tip: "Urgent but NOT important to you. Hand it off or do it fast (e.g. routine email).",
  },
  {
    label: "Drop",
    color: "rgba(107, 114, 128, 0.32)",
    borderRight: false,
    borderBottom: false,
    tip: "Neither urgent nor important — distractions to let go (e.g. doomscrolling).",
  },
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
            title={q.tip}
            style={{
              fontSize: "3rem",
              fontWeight: 700,
              color: q.color,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              userSelect: "none",
              pointerEvents: "auto",
              cursor: "help",
            }}
          >
            {q.label}
          </span>
        </div>
      ))}
    </div>
  );
}
