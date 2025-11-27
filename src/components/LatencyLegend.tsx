"use client";

const legendItems = [
  { label: "Low latency (< 90ms)", color: "bg-emerald-400" },
  { label: "Medium latency (90-180ms)", color: "bg-amber-400" },
  { label: "High latency (> 180ms)", color: "bg-rose-400" },
  { label: "AWS exchanges", color: "bg-blue-400" },
  { label: "GCP exchanges", color: "bg-purple-400" },
  { label: "Azure exchanges", color: "bg-pink-400" },
];

export const LatencyLegend = () => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-white/80">
    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">Legend</p>
    <ul className="space-y-2">
      {legendItems.map((item) => (
        <li key={item.label} className="flex items-center gap-3">
          <span className={`inline-flex h-3 w-3 rounded-full ${item.color}`} />
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  </div>
);

