"use client";

import { Zap, Server } from "lucide-react";

const latencyItems = [
  { label: "Low latency", range: "< 90ms", color: "bg-emerald-400", borderColor: "border-emerald-400/50" },
  { label: "Medium latency", range: "90-180ms", color: "bg-amber-400", borderColor: "border-amber-400/50" },
  { label: "High latency", range: "> 180ms", color: "bg-rose-400", borderColor: "border-rose-400/50" },
];

const providerItems = [
  { label: "AWS", exchanges: "Binance, Bybit, Bitfinex, Huobi", color: "bg-blue-400", borderColor: "border-blue-400/50", icon: "☁️" },
  { label: "GCP", exchanges: "OKX, Kraken, KuCoin", color: "bg-purple-400", borderColor: "border-purple-400/50", icon: "☁️" },
  { label: "Azure", exchanges: "Deribit, Coinbase, BitMEX", color: "bg-pink-400", borderColor: "border-pink-400/50", icon: "☁️" },
];

export const LatencyLegend = () => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-sm text-white/80">
    <div className="mb-4 flex items-center gap-2">
      <Zap className="h-4 w-4 text-emerald-400" />
      <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Legend</p>
    </div>
    
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
          <Zap className="h-3 w-3" />
          Latency Bands
        </div>
        <ul className="space-y-2">
          {latencyItems.map((item) => (
            <li key={item.label} className="flex items-center gap-3">
              <span className={`inline-flex h-3 w-3 rounded-full border ${item.color} ${item.borderColor}`} />
              <div className="flex-1">
                <span className="text-white/90">{item.label}</span>
                <span className="ml-2 text-xs text-white/60">({item.range})</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
          <Server className="h-3 w-3" />
          Exchange Markers
        </div>
        <ul className="space-y-2.5">
          {providerItems.map((item) => (
            <li key={item.label} className="flex items-start gap-3">
              <span className={`mt-0.5 inline-flex h-3 w-3 rounded-full border ${item.color} ${item.borderColor}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white/90 font-medium">{item.label}</span>
                  <span className="text-xs">{item.icon}</span>
                </div>
                <div className="mt-0.5 text-xs text-white/60">{item.exchanges}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-white/10 pt-3">
        <p className="text-xs text-white/50">
          💡 Hover over markers to see exchange details, location, and cloud provider information.
        </p>
      </div>
    </div>
  </div>
);

