import { exchangeLocations } from "@/data/exchanges";
import { providerRegions } from "@/data/providerRegions";
import { LatencyLink, LatencySnapshot, FilterState, HistoricalPoint } from "@/types/latency";
import { create } from "zustand";

const MAX_HISTORY_POINTS = 240;

const defaultFilters: FilterState = {
  search: "",
  selectedProvider: "ALL",
  selectedExchange: "ALL",
  latencyRange: [0, 400],
  showRealtime: true,
  showHistorical: true,
  showRegions: true,
};

interface LatencyState {
  exchanges: typeof exchangeLocations;
  regions: typeof providerRegions;
  connections: LatencyLink[];
  historical: Record<string, HistoricalPoint[]>;
  filters: FilterState;
  stats: LatencySnapshot["stats"];
  lastUpdated: number;
  setFilters: (partial: Partial<FilterState>) => void;
  resetFilters: () => void;
  updateSnapshot: (snapshot: LatencySnapshot) => void;
}

export const useLatencyStore = create<LatencyState>((set) => ({
  exchanges: exchangeLocations,
  regions: providerRegions,
  connections: [],
  historical: {},
  filters: defaultFilters,
  stats: { min: 0, max: 0, avg: 0 },
  lastUpdated: 0,
  setFilters: (partial) =>
    set((state) => ({
      filters: { ...state.filters, ...partial },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
  updateSnapshot: (snapshot) =>
    set((state) => {
      const nextHistorical: Record<string, HistoricalPoint[]> = { ...state.historical };
      snapshot.links.forEach((link) => {
        const existing = nextHistorical[link.id] ?? [];
        const updated = [...existing, { timestamp: snapshot.lastUpdated, latencyMs: link.latencyMs, linkId: link.id }];
        nextHistorical[link.id] = updated.slice(-MAX_HISTORY_POINTS);
      });

      return {
        connections: snapshot.links,
        stats: snapshot.stats,
        lastUpdated: snapshot.lastUpdated,
        historical: nextHistorical,
      };
    }),
}));

