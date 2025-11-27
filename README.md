## Latency Topology Visualizer

Next.js 14 + TypeScript dashboard that renders a real-time 3D globe of major crypto exchange points-of-presence, their cloud co-location regions, and live/historical latency telemetry. The UI combines a react-globe.gl WebGL scene, interactive filtering, and Recharts-based historical analysis to understand how AWS, GCP, and Azure infrastructures impact trading latency.

### Live data strategy

The `/api/latency` route pings public exchange REST endpoints (Binance, OKX, Bybit, Deribit, Coinbase, Kraken, Bitfinex, BitMEX) and measures the round-trip latency server-side. These live measurements flow into client components via SWR, get normalized into inter-exchange paths, and are cached in a Zustand store for historical charting.

### Local development

```bash
npm install
npm run dev
# open http://localhost:3000
```

### Key features

- 3D interactive world map with orbit controls, exchange markers, provider clusters, and animated latency arcs.
- Real-time latency updates every 10 seconds with color-coded link health and legend.
- Historical latency explorer with 1h/24h/7d/30d windows and per-path statistics.
- Control panel for search, provider/exchange filters, latency range sliders, and layer toggles (real-time, historical, regions).
- Cloud provider overview cards summarizing co-location capacity across AWS/GCP/Azure hotspots.

### Tech stack

- Next.js App Router + TypeScript
- Tailwind CSS for theming
- `react-globe.gl` + `three` for 3D visualization
- `zustand` for global state & history buffer
- `swr` for polling live measurements
- `recharts` for time-series rendering
- `lucide-react` icons, `date-fns` utilities

### Production build

```bash
npm run build
npm start
```
