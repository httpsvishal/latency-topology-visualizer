"use client";

import { ChangeEvent } from "react";
import { Search, RefreshCw, Filter, Layers } from "lucide-react";
import { useLatencyStore } from "@/store/latencyStore";

const providers = ["ALL", "AWS", "GCP", "Azure"] as const;

export const ControlPanel = () => {
  const filters = useLatencyStore((state) => state.filters);
  const setFilters = useLatencyStore((state) => state.setFilters);
  const resetFilters = useLatencyStore((state) => state.resetFilters);
  const exchanges = useLatencyStore((state) => state.exchanges);

  const handleRangeChange = (event: ChangeEvent<HTMLInputElement>, bound: "min" | "max") => {
    const value = Number(event.target.value);
    if (bound === "min") {
      const nextMin = Math.min(value, filters.latencyRange[1] - 10);
      setFilters({ latencyRange: [nextMin, filters.latencyRange[1]] });
    } else {
      const nextMax = Math.max(value, filters.latencyRange[0] + 10);
      setFilters({ latencyRange: [filters.latencyRange[0], nextMax] });
    }
  };

  return (
    <div className="space-y-5 rounded-3xl border border-white/10 bg-slate-900/60 p-5 text-white shadow-lg shadow-slate-900/30">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/50">Controls</p>
          <h2 className="text-lg font-semibold">Topology Filters</h2>
        </div>
        <button
          onClick={resetFilters}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-sm text-white/80 transition hover:border-white/40"
        >
          <RefreshCw className="h-4 w-4" />
          Reset
        </button>
      </header>

      <div className="space-y-4">
        <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white/70 focus-within:border-white/40">
          <Search className="h-4 w-4" />
          <input
            type="text"
            value={filters.search}
            placeholder="Search exchanges or regions"
            onChange={(event) => setFilters({ search: event.target.value })}
            className="w-full bg-transparent text-white placeholder:text-white/40 focus:outline-none"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Cloud Provider</span>
            <select
              value={filters.selectedProvider}
              onChange={(event) => setFilters({ selectedProvider: event.target.value as (typeof providers)[number] })}
              className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
            >
              {providers.map((provider) => (
                <option key={provider} value={provider}>
                  {provider === "ALL" ? "All Providers" : provider}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Exchange</span>
            <select
              value={filters.selectedExchange}
              onChange={(event) => setFilters({ selectedExchange: event.target.value as string | "ALL" })}
              className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
            >
              <option value="ALL">All Exchanges</option>
              {exchanges.map((exchange) => (
                <option key={exchange.id} value={exchange.id}>
                  {exchange.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Latency Window</span>
              <p className="text-sm text-white/70">{filters.latencyRange[0]}ms – {filters.latencyRange[1]}ms</p>
            </div>
            <Filter className="h-5 w-5 text-white/50" />
          </div>
          <div className="space-y-3">
            <input
              type="range"
              min={0}
              max={400}
              value={filters.latencyRange[0]}
              onChange={(event) => handleRangeChange(event, "min")}
              className="w-full accent-emerald-400"
            />
            <input
              type="range"
              min={filters.latencyRange[0]}
              max={450}
              value={filters.latencyRange[1]}
              onChange={(event) => handleRangeChange(event, "max")}
              className="w-full accent-rose-400"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="mb-3 flex items-center gap-2 text-white/70">
            <Layers className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Layers</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <TogglePill
              label="Real-time arcs"
              active={filters.showRealtime}
              onToggle={() => setFilters({ showRealtime: !filters.showRealtime })}
            />
            <TogglePill
              label="Historical series"
              active={filters.showHistorical}
              onToggle={() => setFilters({ showHistorical: !filters.showHistorical })}
            />
            <TogglePill
              label="Cloud regions"
              active={filters.showRegions}
              onToggle={() => setFilters({ showRegions: !filters.showRegions })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const TogglePill = ({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) => (
  <button
    onClick={onToggle}
    className={`rounded-2xl border px-3 py-2 text-sm transition ${
      active
        ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-100"
        : "border-white/10 bg-slate-900/40 text-white/60 hover:border-white/30"
    }`}
  >
    {label}
  </button>
);

