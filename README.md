## Latency Topology Visualizer

Next.js 14 + TypeScript dashboard that renders a real-time 3D globe of major crypto exchange points-of-presence, their cloud co-location regions, and live/historical latency telemetry. The UI combines a react-globe.gl WebGL scene, interactive filtering, and Recharts-based historical analysis to understand how AWS, GCP, and Azure infrastructures impact trading latency.

### Prerequisites

Before running the project locally, ensure you have:

- **Node.js** 18.x or higher (recommended: 20.x LTS)
- **npm** 9.x or higher (comes with Node.js)
- A modern web browser with WebGL support (Chrome, Firefox, Safari, Edge)

### Local Development Setup

#### 1. Clone or Navigate to the Project

```bash
cd latency-topology-visualizer
```

#### 2. Install Dependencies

Install all required npm packages:

```bash
npm install
```

This will install all dependencies listed in `package.json`, including:
- Next.js framework
- React and React DOM
- Three.js and react-globe.gl for 3D visualization
- Zustand for state management
- SWR for data fetching
- Recharts for charts
- And other dependencies

#### 3. Start the Development Server

Run the development server:

```bash
npm run dev
```

The server will start on `http://localhost:3000` by default. You should see output like:

```
  ▲ Next.js 16.0.5
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

#### 4. Open in Browser

Open your browser and navigate to:

```
http://localhost:3000
```

The application will automatically reload when you make changes to the code.

#### 5. Verify the Application

Once loaded, you should see:
- A 3D interactive globe with exchange markers
- Real-time latency connections (updates every 8 seconds)
- Control panel on the right side
- Stats dashboard at the top
- Historical latency charts

### Available Scripts

- **`npm run dev`** - Starts the development server with hot-reload
- **`npm run build`** - Creates an optimized production build
- **`npm run start`** - Starts the production server (requires `npm run build` first)
- **`npm run lint`** - Runs ESLint to check for code issues

### Troubleshooting

#### Port Already in Use

If port 3000 is already in use, Next.js will automatically try the next available port (3001, 3002, etc.). Check the terminal output for the actual port number.

To use a specific port:

```bash
PORT=3001 npm run dev
```

#### Dependencies Installation Issues

If you encounter issues installing dependencies:

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### WebGL Not Supported

If the 3D globe doesn't render, your browser may not support WebGL. Try:
- Updating your browser to the latest version
- Enabling hardware acceleration in browser settings
- Trying a different browser

#### API Endpoints Not Responding

The application pings real exchange APIs. If some endpoints are slow or timeout:
- This is expected behavior - the app handles timeouts gracefully
- Check your internet connection
- Some exchanges may rate-limit requests

### Live Data Strategy

The `/api/latency` route pings public exchange REST endpoints (Binance, OKX, Bybit, Deribit, Coinbase, Kraken, Bitfinex, BitMEX) and measures the round-trip latency server-side. These live measurements flow into client components via SWR, get normalized into inter-exchange paths, and are cached in a Zustand store for historical charting.

**Update Frequency:** The application fetches new latency data every **8 seconds** automatically.

### Key Features

- **3D Interactive World Map** - Orbit controls, exchange markers, provider clusters, and animated latency arcs
- **Real-time Latency Visualization** - Updates every 8 seconds with color-coded connections (green/yellow/red)
- **Animated Data Streams** - Pulse effects and dynamic animations on latency connections
- **Historical Latency Explorer** - Time-series charts with 1h/24h/7d/30d windows and per-path statistics
- **Interactive Controls** - Search, provider/exchange filters, latency range sliders, and layer toggles
- **Cloud Provider Overview** - Cards summarizing co-location capacity across AWS/GCP/Azure regions
- **Exchange Markers** - 16+ major exchange locations with hover tooltips showing details
- **Color-coded Legend** - Visual guide for latency bands and cloud provider markers

### Tech stack

- Next.js App Router + TypeScript
- Tailwind CSS for theming
- `react-globe.gl` + `three` for 3D visualization
- `zustand` for global state & history buffer
- `swr` for polling live measurements
- `recharts` for time-series rendering
- `lucide-react` icons, `date-fns` utilities

### Production Build

To create an optimized production build:

```bash
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Optimize React components
- Bundle and minify assets
- Generate static pages where possible

Then start the production server:

```bash
npm start
```

The production server will run on `http://localhost:3000` (or the next available port).

### Project Structure

```
latency-topology-visualizer/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (latency endpoint)
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main dashboard page
│   ├── components/            # React components
│   │   ├── GlobeVisualization.tsx
│   │   ├── ControlPanel.tsx
│   │   ├── StatsDashboard.tsx
│   │   ├── HistoricalLatencyChart.tsx
│   │   ├── RegionOverview.tsx
│   │   └── LatencyLegend.tsx
│   ├── data/                  # Static data files
│   │   ├── exchanges.ts      # Exchange locations
│   │   ├── providerRegions.ts
│   │   └── baseConnections.ts
│   ├── hooks/                # Custom React hooks
│   │   └── useLatencyFeed.ts
│   ├── lib/                  # Utility functions
│   │   └── latencyApi.ts
│   ├── store/                # Zustand state management
│   │   └── latencyStore.ts
│   └── types/                # TypeScript type definitions
│       └── latency.ts
├── public/                   # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

### Environment Variables

Currently, no environment variables are required. The application uses public APIs and doesn't require API keys.

### Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Requires WebGL support for 3D globe rendering

### Contributing

1. Make your changes
2. Run `npm run lint` to check for code issues
3. Test locally with `npm run dev`
4. Ensure all features work as expected

### License

This project is private and proprietary.
