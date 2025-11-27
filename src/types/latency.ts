export type CloudProvider = "AWS" | "GCP" | "Azure";

export interface ExchangeLocation {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  provider: CloudProvider;
  regionCode: string;
  cloudRegionId: string;
}

export interface ProviderRegion {
  id: string;
  provider: CloudProvider;
  regionCode: string;
  name: string;
  latitude: number;
  longitude: number;
  serverCount: number;
}

export type LatencyBand = "low" | "medium" | "high";

export interface LatencyLink {
  id: string;
  fromId: string;
  toId: string;
  fromCoords: { lat: number; lng: number };
  toCoords: { lat: number; lng: number };
  provider: CloudProvider;
  latencyMs: number;
  band: LatencyBand;
  status: "healthy" | "degraded" | "critical";
  label: string;
}

export interface HistoricalPoint {
  timestamp: number;
  latencyMs: number;
  linkId: string;
}

export interface LatencySnapshot {
  links: LatencyLink[];
  stats: {
    min: number;
    max: number;
    avg: number;
  };
  lastUpdated: number;
}

export interface FilterState {
  search: string;
  selectedProvider: CloudProvider | "ALL";
  selectedExchange: string | "ALL";
  latencyRange: [number, number];
  showRealtime: boolean;
  showHistorical: boolean;
  showRegions: boolean;
}

