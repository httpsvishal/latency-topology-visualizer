import { NextResponse } from "next/server";
import { performance } from "perf_hooks";

export const runtime = "nodejs";

type TargetEndpoint = {
  id: string;
  name: string;
  provider: "AWS" | "GCP" | "Azure";
  url: string;
  method?: "GET" | "POST";
};

const TARGET_ENDPOINTS: TargetEndpoint[] = [
  {
    id: "binance-tokyo",
    name: "Binance",
    provider: "AWS",
    url: "https://api.binance.com/api/v3/ping",
  },
  {
    id: "okx-singapore",
    name: "OKX",
    provider: "GCP",
    url: "https://www.okx.com/api/v5/public/time",
  },
  {
    id: "deribit-amsterdam",
    name: "Deribit",
    provider: "Azure",
    url: "https://www.deribit.com/api/v2/public/ping",
  },
  {
    id: "bybit-frankfurt",
    name: "Bybit",
    provider: "AWS",
    url: "https://api.bybit.com/v5/market/time",
  },
  {
    id: "coinbase-london",
    name: "Coinbase",
    provider: "Azure",
    url: "https://api.exchange.coinbase.com/time",
  },
  {
    id: "kraken-newark",
    name: "Kraken",
    provider: "GCP",
    url: "https://api.kraken.com/0/public/Time",
  },
  {
    id: "bitfinex-hongkong",
    name: "Bitfinex",
    provider: "AWS",
    url: "https://api-pub.bitfinex.com/v2/platform/status",
  },
  {
    id: "bitmex-dublin",
    name: "BitMEX",
    provider: "Azure",
    url: "https://www.bitmex.com/api/v1/announcement?columns=date",
  },
];

const REQUEST_TIMEOUT_MS = 8000;

async function measureEndpoint(target: TargetEndpoint) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const startedAt = performance.now();

  try {
    const response = await fetch(target.url, {
      method: target.method ?? "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: { "user-agent": "LatencyVisualizer/1.0" },
    });

    // drain body to complete request
    await response.text();
    const latencyMs = Math.max(1, Math.round(performance.now() - startedAt));
    return {
      ...target,
      latencyMs,
      success: response.ok,
      status: response.status,
    };
  } catch (error) {
    return {
      ...target,
      latencyMs: REQUEST_TIMEOUT_MS,
      success: false,
      status: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const measurements = await Promise.all(TARGET_ENDPOINTS.map(measureEndpoint));
  return NextResponse.json({
    fetchedAt: Date.now(),
    measurements,
  });
}

