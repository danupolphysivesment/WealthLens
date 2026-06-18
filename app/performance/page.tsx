"use client";
import { useProfile } from "@/lib/store";
import { Card, PageHead, Loading, Metric } from "@/components/ui";
import { GrowthChart, DrawdownChart, AnnualBars } from "@/components/charts";
import { money, pct, num } from "@/lib/format";

const FMT: Record<string, (v: number) => string> = {
  "Sharpe ratio": (v) => num(v, 2),
};
const f = (k: string, v: number) => (FMT[k] || ((x: number) => pct(x)))(v);

export default function Performance() {
  const { data } = useProfile();
  if (!data) return <Loading />;
  const { track, profile } = data;
  const m = track.metrics;
  const keys = Object.keys(m.current);

  return (
    <>
      <PageHead title="📈 Track record">
        How your current mix and the recommended {profile} mix would have behaved over the last{" "}
        {Math.round(track.dates.length / 12)} years of real market history (SPY · AGG · GLD, monthly rebalanced).
      </PageHead>

      <div className="grid g4">
        <Metric label="Annualised return" value={pct(m.current["Annualised return"])} />
        <Metric label="Volatility" value={pct(m.current["Volatility"])} />
        <Metric label="Sharpe ratio" value={num(m.current["Sharpe ratio"], 2)} />
        <Metric label="Max drawdown" value={pct(m.current["Max drawdown"])} deltaType="down" />
      </div>

      <Card title={`If ${money(data.input.value)} had been invested ${Math.round(track.dates.length / 12)} years ago`}
        sub="Current allocation vs. recommended" style={{ marginTop: 16 }}>
        <GrowthChart dates={track.dates} current={track.currentGrowth} target={track.targetGrowth} profile={profile} />
      </Card>

      <div className="grid g2" style={{ marginTop: 16 }}>
        <Card title="Drawdowns" sub="How far below the previous peak (current mix)">
          <DrawdownChart dates={track.dates} drawdown={track.drawdown} />
        </Card>
        <Card title="Calendar-year returns" sub="Current vs. recommended, every year">
          <AnnualBars annual={track.annual} profile={profile} />
        </Card>
      </div>

      <Card title="📋 Performance scorecard" sub="Full backtest, monthly rebalanced" style={{ marginTop: 16 }}>
        <table className="tbl">
          <thead><tr><th>Metric</th><th className="num">Current allocation</th><th className="num">Recommended ({profile})</th></tr></thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k}><td>{k}</td><td className="num">{f(k, m.current[k])}</td><td className="num">{f(k, m.target[k])}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>

      <p className="disclaimer">
        Backtest uses real {data.meta.dataSource} ETF history with monthly rebalancing.
        Past performance never guarantees future results.
      </p>
    </>
  );
}
