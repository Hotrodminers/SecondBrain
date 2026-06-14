export default function QuadrantOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 grid grid-cols-2 grid-rows-2">
      {/* Top Left: Do Now */}
      <div className="border-r border-b border-[rgba(173,188,255,0.08)] flex items-center justify-center">
        <span className="text-5xl font-bold text-red-500/15 uppercase tracking-widest select-none">
          Do Now
        </span>
      </div>

      {/* Top Right: Schedule */}
      <div className="border-b border-[rgba(173,188,255,0.08)] flex items-center justify-center">
        <span className="text-5xl font-bold text-teal-500/15 uppercase tracking-widest select-none">
          Schedule
        </span>
      </div>

      {/* Bottom Left: Delegate */}
      <div className="border-r border-[rgba(173,188,255,0.08)] flex items-center justify-center">
        <span className="text-5xl font-bold text-amber-500/15 uppercase tracking-widest select-none">
          Delegate
        </span>
      </div>

      {/* Bottom Right: Drop */}
      <div className="flex items-center justify-center">
        <span className="text-5xl font-bold text-gray-500/15 uppercase tracking-widest select-none">
          Drop
        </span>
      </div>
    </div>
  );
}
