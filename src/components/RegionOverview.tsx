"use client";

import { useLatencyStore } from "@/store/latencyStore";

const providerColors: Record<string, string> = {
  AWS: "from-blue-500/30 via-blue-500/10 to-transparent",
  GCP: "from-purple-500/30 via-purple-500/10 to-transparent",
  Azure: "from-pink-500/30 via-pink-500/10 to-transparent",
};

export const RegionOverview = () => {
  const regions = useLatencyStore((state) => state.regions);
  const filters = useLatencyStore((state) => state.filters);

  if (!filters.showRegions) {
    return null;
  }

  const filtered = regions.filter(
    (region) =>
      (filters.selectedProvider === "ALL" || region.provider === filters.selectedProvider) &&
      region.name.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 text-white shadow-lg shadow-slate-900/30">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/50">Cloud regions</p>
          <h3 className="text-xl font-semibold">Co-location snapshots</h3>
        </div>
        <span className="text-sm text-white/60">{filtered.length} regions visible</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {filtered.map((region) => (
          <div key={region.id} className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <div className={`absolute inset-0 ${providerColors[region.provider]} opacity-70`} />
            <div className="relative">
              <p className="text-xs uppercase tracking-widest text-white/60">{region.provider}</p>
              <h4 className="text-lg font-semibold">{region.name}</h4>
              <p className="text-sm text-white/70">{region.regionCode}</p>
              <p className="mt-3 text-sm text-white/80">
                {region.serverCount.toLocaleString()} co-located servers supporting low-latency trading
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

