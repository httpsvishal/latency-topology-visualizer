"use client";

import { Activity, Globe2, SignalHigh } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLatencyStore } from "@/store/latencyStore";

export const StatsDashboard = () => {
  const stats = useLatencyStore((state) => state.stats);
  const lastUpdated = useLatencyStore((state) => state.lastUpdated);
  const connections = useLatencyStore((state) => state.connections);

  const highestCritical = connections.filter((link) => link.band === "high").length;
  const formattedTime = lastUpdated ? formatDistanceToNow(new Date(lastUpdated), { addSuffix: true }) : "—";

  const cards = [
    {
      label: "Average latency",
      value: `${stats.avg.toFixed(1)} ms`,
      icon: Activity,
      trend: `Min ${stats.min} ms • Max ${stats.max} ms`,
    },
    {
      label: "Active paths",
      value: `${connections.length}`,
      icon: Globe2,
      trend: `${connections.length - highestCritical} healthy • ${highestCritical} hot`,
    },
    {
      label: "Last refresh",
      value: formattedTime,
      icon: SignalHigh,
      trend: "Updates every 10s",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-3xl border border-white/5 bg-slate-900/50 px-4 py-5 shadow-inner shadow-slate-950/40">
          <div className="mb-3 flex items-center gap-3 text-white/70">
            <card.icon className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest">{card.label}</span>
          </div>
          <p className="text-2xl font-semibold text-white">{card.value}</p>
          <p className="text-sm text-white/60">{card.trend}</p>
        </div>
      ))}
    </div>
  );
};

