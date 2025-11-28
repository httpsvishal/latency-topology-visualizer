"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useEffect, useState } from "react";
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
  provider?: string;
  city?: string;
  country?: string;
  regionCode?: string;
};

const bandColors: Record<string, string> = {
  low: "#34d399", // Green
  medium: "#fbbf24", // Yellow/Amber
  high: "#f87171", // Red
};

export const GlobeVisualization = () => {
  const connections = useLatencyStore((state) => state.connections);
  const exchanges = useLatencyStore((state) => state.exchanges);
  const regions = useLatencyStore((state) => state.regions);
  const filters = useLatencyStore((state) => state.filters);
  const lastUpdated = useLatencyStore((state) => state.lastUpdated);

  const globeRef = useRef<GlobeT | null>(null);
  const { isLoading, error } = useLatencyFeed();
  const [pulsePhase, setPulsePhase] = useState(0);

  // Pulse animation for visual feedback - continuous animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 60);
    }, 100);
    return () => clearInterval(interval);
  }, []);

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
          provider: exchange.provider,
          city: exchange.city,
          country: exchange.country,
          regionCode: exchange.regionCode,
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

  // Enhanced arc properties with dynamic animations
  const getArcStrokeWidth = (arc: LatencyLink) => {
    // Vary stroke width based on latency and pulse phase
    const baseWidth = arc.band === "high" ? 1.2 : arc.band === "medium" ? 1.0 : 0.8;
    const pulse = Math.sin((pulsePhase / 60) * Math.PI * 2) * 0.2;
    return baseWidth + pulse;
  };

  const getArcOpacity = (arc: LatencyLink) => {
    // Pulse opacity for high latency connections
    if (arc.band === "high") {
      return 0.7 + Math.sin((pulsePhase / 60) * Math.PI * 2) * 0.3;
    }
    return 0.85;
  };

  return (
    <div className="relative h-full w-full rounded-3xl border border-white/10 bg-slate-900/40 p-4 shadow-lg shadow-slate-900/30">
      <div className="absolute left-4 top-4 z-10">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Global Network Topology</p>
          {!isLoading && !error && (
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          )}
        </div>
        <p className="text-sm text-white/60">
          {isLoading ? "Loading live latencies…" : error ? "Live feed unavailable" : "Live latency stream"}
        </p>
        {!isLoading && !error && lastUpdated > 0 && (
          <p className="text-xs text-white/40">
            Updated {new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        )}
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
        arcStroke={(arc: LatencyLink) => getArcStrokeWidth(arc)}
        arcOpacity={(arc: LatencyLink) => getArcOpacity(arc)}
        arcDashLength={(arc: LatencyLink) => {
          // Dynamic dash length based on latency band
          if (arc.band === "high") return 0.2;
          if (arc.band === "medium") return 0.35;
          return 0.5;
        }}
        arcDashGap={0.015}
        arcDashAnimateTime={(arc: LatencyLink) => {
          // Faster animation for high latency (more urgent)
          if (arc.band === "high") return 2000;
          if (arc.band === "medium") return 3000;
          return 4000;
        }}
        arcDashInitialGap={(arc: LatencyLink) => {
          // Stagger initial positions for visual variety
          return (arc.id.charCodeAt(0) % 10) * 0.1;
        }}
        pointsData={pointsData}
        pointAltitude={(point: PointDatum) => (point.type === "exchange" ? 0.08 : 0.04)}
        pointRadius={(point: PointDatum) => {
          // Add subtle pulse to exchange points
          if (point.type === "exchange") {
            const pulse = Math.sin((pulsePhase / 60) * Math.PI * 2) * 0.1;
            return 0.8 + pulse;
          }
          return 0.5;
        }}
        pointColor={(point: PointDatum) => point.color}
        pointResolution={12}
        pointLabel={(point: PointDatum) => {
          if (point.type === "exchange" && point.provider) {
            const providerColor = point.provider === "AWS" ? "#60a5fa" : point.provider === "GCP" ? "#a855f7" : "#f472b6";
            return `
              <div style="padding: 10px 12px; background: rgba(15, 23, 42, 0.98); border: 1px solid ${providerColor}40; border-radius: 8px; min-width: 220px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <div style="font-weight: 700; font-size: 15px; color: ${providerColor}; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 18px;">●</span>
                  ${point.name}
                </div>
                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.95); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                  <span>📍</span>
                  <span>${point.city}, ${point.country}</span>
                </div>
                <div style="font-size: 11px; color: rgba(255, 255, 255, 0.75); display: flex; align-items: center; gap: 6px;">
                  <span>☁️</span>
                  <span><strong>${point.provider}</strong> • ${point.regionCode}</span>
                </div>
              </div>
            `;
          }
          return `<div style="padding: 8px 10px; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px;">
            <strong>${point.name}</strong><br/>
            <span style="font-size: 11px; color: rgba(255, 255, 255, 0.7);">${point.meta}</span>
          </div>`;
        }}
        arcLabel={(arc: LatencyLink) => {
          const color = bandColors[arc.band];
          const statusIcon = arc.status === "healthy" ? "✓" : arc.status === "degraded" ? "⚠" : "✗";
          return `
            <div style="padding: 6px 10px; background: rgba(15, 23, 42, 0.98); border: 2px solid ${color}80; border-radius: 6px; box-shadow: 0 2px 8px ${color}40;">
              <div style="font-size: 11px; color: rgba(255, 255, 255, 0.7); margin-bottom: 4px;">
                ${arc.label}
              </div>
              <div style="font-weight: 700; font-size: 14px; color: ${color}; display: flex; align-items: center; gap: 6px;">
                <span>${statusIcon}</span>
                <span>${arc.latencyMs} ms</span>
                <span style="font-size: 10px; color: rgba(255, 255, 255, 0.5);">(${arc.band})</span>
              </div>
            </div>
          `;
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
    </div>
  );
};

