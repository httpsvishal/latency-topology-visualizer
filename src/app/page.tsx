import { GlobeVisualization } from "@/components/GlobeVisualization";
import { ControlPanel } from "@/components/ControlPanel";
import { StatsDashboard } from "@/components/StatsDashboard";
import { HistoricalLatencyChart } from "@/components/HistoricalLatencyChart";
import { RegionOverview } from "@/components/RegionOverview";
import { LatencyLegend } from "@/components/LatencyLegend";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 lg:px-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Latency topology visualizer</p>
          <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
            Real-time crypto exchange latency across global cloud regions
          </h1>
          <p className="max-w-3xl text-lg text-white/70">
            Inspect live network performance, historical trends, and co-location capacity for AWS, GCP, and Azure regions
            powering institutional crypto execution stacks.
          </p>
        </header>

        <StatsDashboard />

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <GlobeVisualization />
          <div className="flex flex-col gap-6">
            <ControlPanel />
            <LatencyLegend />
          </div>
        </section>

        <HistoricalLatencyChart />
        <RegionOverview />
      </div>
    </main>
  );
}
