"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useLatencyStore } from "@/store/latencyStore";

const TIME_WINDOWS = [
  { label: "1h", ms: 60 * 60 * 1000 },
  { label: "24h", ms: 24 * 60 * 60 * 1000 },
  { label: "7d", ms: 7 * 24 * 60 * 60 * 1000 },
  { label: "30d", ms: 30 * 24 * 60 * 60 * 1000 },
];

export const HistoricalLatencyChart = () => {
  const historical = useLatencyStore((state) => state.historical);
  const connections = useLatencyStore((state) => state.connections);
  const filters = useLatencyStore((state) => state.filters);
  const lastUpdated = useLatencyStore((state) => state.lastUpdated);

  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [selectedWindow, setSelectedWindow] = useState(TIME_WINDOWS[1]);

  const hasConnections = connections.length > 0;
  const linkId = hasConnections ? selectedLinkId ?? connections[0]!.id : "";
  const series = useMemo(() => (hasConnections ? historical[linkId] ?? [] : []), [hasConnections, historical, linkId]);

  const referenceTimestamp = lastUpdated || (series.length ? series[series.length - 1]!.timestamp : 0);

  const filteredSeries = useMemo(
    () => series.filter((point) => referenceTimestamp - point.timestamp <= selectedWindow.ms),
    [series, referenceTimestamp, selectedWindow]
  );

  const chartData = filteredSeries.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    latency: point.latencyMs,
  }));

  const stats = useMemo(() => {
    if (!filteredSeries.length) return { min: 0, max: 0, avg: 0 };
    const latencies = filteredSeries.map((point) => point.latencyMs);
    const sum = latencies.reduce((total, value) => total + value, 0);
    return {
      min: Math.min(...latencies),
      max: Math.max(...latencies),
      avg: Math.round(sum / latencies.length),
    };
  }, [filteredSeries]);

  if (!hasConnections) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-white/70 shadow-lg shadow-slate-900/30">
        <p className="text-sm">Waiting for live latency data to populate historical series…</p>
      </div>
    );
  }

  if (!filters.showHistorical) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 text-white shadow-lg shadow-slate-900/30">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/50">Historical trends</p>
          <h3 className="text-xl font-semibold">Latency time-series</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={linkId}
            onChange={(event) => setSelectedLinkId(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
          >
            {connections.map((link) => (
              <option key={link.id} value={link.id}>
                {link.label}
              </option>
            ))}
          </select>
          <div className="flex rounded-full border border-white/10 bg-slate-950/60 p-1 text-sm text-white/70">
            {TIME_WINDOWS.map((window) => (
              <button
                key={window.label}
                onClick={() => setSelectedWindow(window)}
                className={`rounded-full px-3 py-1 ${
                  window.ms === selectedWindow.ms ? "bg-white/20 text-white" : "text-white/70"
                }`}
              >
                {window.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-white/70 md:grid-cols-3">
        <p>
          <span className="text-white/50">Min:</span> {stats.min} ms
        </p>
        <p>
          <span className="text-white/50">Max:</span> {stats.max} ms
        </p>
        <p>
          <span className="text-white/50">Avg:</span> {stats.avg} ms
        </p>
      </div>
      <div className="h-64 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" unit=" ms" />
            <Tooltip
              contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
            />
            <Line type="monotone" dataKey="latency" stroke="#34d399" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

