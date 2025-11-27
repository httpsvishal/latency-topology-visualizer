"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef } from "react";
import type GlobeT from "react-globe.gl";
import { useLatencyStore } from "@/store/latencyStore";
import { useLatencyFeed } from "@/hooks/useLatencyFeed";
import { LatencyLink } from "@/types/latency";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

type PointDatum = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
  type: "exchange" | "region";
  meta: string;
};

const bandColors: Record<string, string> = {
  low: "#34d399",
  medium: "#fbbf24",
  high: "#f87171",
};

export const GlobeVisualization = () => {
  const connections = useLatencyStore((state) => state.connections);
  const exchanges = useLatencyStore((state) => state.exchanges);
  const regions = useLatencyStore((state) => state.regions);
  const filters = useLatencyStore((state) => state.filters);

  const globeRef = useRef<GlobeT | null>(null);
  const { isLoading, error } = useLatencyFeed();

  const filteredConnections = useMemo(() => {
    let dataset: LatencyLink[] = connections;
    if (filters.selectedProvider !== "ALL") {
      dataset = dataset.filter((link) => link.provider === filters.selectedProvider);
    }
    if (filters.selectedExchange !== "ALL") {
      dataset = dataset.filter(
        (link) => link.fromId === filters.selectedExchange || link.toId === filters.selectedExchange
      );
    }
    dataset = dataset.filter(
      (link) => link.latencyMs >= filters.latencyRange[0] && link.latencyMs <= filters.latencyRange[1]
    );
    if (filters.search) {
      const term = filters.search.toLowerCase();
      dataset = dataset.filter((link) => link.label.toLowerCase().includes(term));
    }
    return dataset;
  }, [connections, filters]);

  const exchangePoints = useMemo<PointDatum[]>(
    () =>
      exchanges
        .filter((exchange) => filters.selectedProvider === "ALL" || exchange.provider === filters.selectedProvider)
        .map<PointDatum>((exchange) => ({
          id: exchange.id,
          name: exchange.name,
          lat: exchange.latitude,
          lng: exchange.longitude,
          color: exchange.provider === "AWS" ? "#60a5fa" : exchange.provider === "GCP" ? "#a855f7" : "#f472b6",
          type: "exchange",
          meta: `${exchange.city}, ${exchange.country}`,
        })),
    [exchanges, filters.selectedProvider]
  );

  const regionPoints = useMemo<PointDatum[]>(
    () =>
      filters.showRegions
        ? regions
            .filter((region) => filters.selectedProvider === "ALL" || region.provider === filters.selectedProvider)
            .map<PointDatum>((region) => ({
              id: region.id,
              name: `${region.provider} ${region.name}`,
              lat: region.latitude,
              lng: region.longitude,
              color: region.provider === "AWS" ? "#2563eb" : region.provider === "GCP" ? "#9333ea" : "#be185d",
              type: "region",
              meta: `${region.regionCode} • ${region.serverCount} servers`,
            }))
        : [],
    [regions, filters.showRegions, filters.selectedProvider]
  );

  const pointsData = useMemo<PointDatum[]>(() => [...exchangePoints, ...regionPoints], [exchangePoints, regionPoints]);
  const arcsData = filters.showRealtime ? filteredConnections : [];

  return (
    <div className="relative h-full w-full rounded-3xl border border-white/10 bg-slate-900/40 p-4 shadow-lg shadow-slate-900/30">
      <div className="absolute left-4 top-4 z-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Global Network Topology</p>
        <p className="text-sm text-white/60">
          {isLoading ? "Loading live latencies…" : error ? "Live feed unavailable" : "Live latency stream"}
        </p>
      </div>
      <Globe
        ref={globeRef}
        height={600}
        width={600}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        arcsData={arcsData}
        arcColor={(arc: LatencyLink) => bandColors[arc.band]}
        arcStroke={0.8}
        arcDashLength={(arc) => (arc.band === "high" ? 0.25 : 0.4)}
        arcDashGap={0.02}
        arcDashAnimateTime={4000}
        pointsData={pointsData}
        pointAltitude={(point: PointDatum) => (point.type === "exchange" ? 0.08 : 0.04)}
        pointColor={(point: PointDatum) => point.color}
        pointLabel={(point: PointDatum) => `<div><strong>${point.name}</strong><br/>${point.meta}</div>`}
        arcLabel={(arc: LatencyLink) => `${arc.label}\n${arc.latencyMs} ms`}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
    </div>
  );
};

