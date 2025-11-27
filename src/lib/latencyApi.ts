import { exchangeLocations } from "@/data/exchanges";
import { providerRegions } from "@/data/providerRegions";
import { baseConnections, exchangeToRegionConnections, getCoords } from "@/data/baseConnections";
import { LatencyLink, LatencySnapshot, LatencyBand } from "@/types/latency";

type LatencyApiResponse = {
  fetchedAt: number;
  measurements: Array<{
    id: string;
    name: string;
    provider: "AWS" | "GCP" | "Azure";
    latencyMs: number;
    success: boolean;
  }>;
};

const connectionBlueprints = [...baseConnections, ...exchangeToRegionConnections];

const haversineDistance = (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
  const R = 6371; // km
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLon = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getBand = (latency: number): LatencyBand => {
  if (latency < 90) return "low";
  if (latency < 180) return "medium";
  return "high";
};

const getStatus = (latency: number): LatencyLink["status"] => {
  if (latency < 120) return "healthy";
  if (latency < 220) return "degraded";
  return "critical";
};

const computeLinkLatency = (fromLatency: number, toLatency: number, kmDistance: number) => {
  const base = (fromLatency + toLatency) / 2;
  const propagationCost = kmDistance / 60; // ~1.6 ms per 100km
  const jitter = (Math.random() - 0.5) * 20;
  return Math.round(Math.max(10, base * 0.5 + propagationCost + jitter));
};

export async function fetchLatencySnapshot(): Promise<LatencySnapshot> {
  const response = await fetch("/api/latency", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to load live latency data");
  }

  const payload = (await response.json()) as LatencyApiResponse;
  const measurementMap = new Map(payload.measurements.map((m) => [m.id, m]));
  const providerBuckets = payload.measurements.reduce<Record<string, number[]>>((acc, measurement) => {
    if (!acc[measurement.provider]) acc[measurement.provider] = [];
    if (measurement.success) acc[measurement.provider].push(measurement.latencyMs);
    return acc;
  }, {});

  const providerFallback = new Map(
    Object.entries(providerBuckets).map(([provider, values]) => [
      provider,
      values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 150,
    ])
  );

  const links: LatencyLink[] = connectionBlueprints.map((blueprint) => {
    const fromCoords = getCoords(blueprint.fromId);
    const toCoords = getCoords(blueprint.toId);
    const fromMeasurement = measurementMap.get(blueprint.fromId);
    const toMeasurement = measurementMap.get(blueprint.toId);

    const fromLatency =
      fromMeasurement?.latencyMs ?? providerFallback.get(fromMeasurement?.provider ?? blueprint.provider) ?? 160;
    const toLatency =
      toMeasurement?.latencyMs ?? providerFallback.get(toMeasurement?.provider ?? blueprint.provider) ?? 160;

    const kmDistance = haversineDistance(fromCoords, toCoords);
    const linkLatency = computeLinkLatency(fromLatency, toLatency, kmDistance);
    const band = getBand(linkLatency);
    const status = getStatus(linkLatency);

    const fromName =
      exchangeLocations.find((exchange) => exchange.id === blueprint.fromId)?.name ??
      providerRegions.find((region) => region.id === blueprint.fromId)?.name ??
      blueprint.fromId;
    const toName =
      exchangeLocations.find((exchange) => exchange.id === blueprint.toId)?.name ??
      providerRegions.find((region) => region.id === blueprint.toId)?.name ??
      blueprint.toId;

    return {
      id: blueprint.id,
      fromId: blueprint.fromId,
      toId: blueprint.toId,
      fromCoords,
      toCoords,
      provider: blueprint.provider,
      latencyMs: linkLatency,
      band,
      status,
      label: `${fromName} → ${toName}`,
    };
  });

  const latencies = links.map((link) => link.latencyMs);
  const stats = {
    min: Math.min(...latencies),
    max: Math.max(...latencies),
    avg: parseFloat((latencies.reduce((sum, value) => sum + value, 0) / latencies.length).toFixed(1)),
  };

  return {
    links,
    stats,
    lastUpdated: payload.fetchedAt,
  };
}

