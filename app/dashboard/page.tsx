"use client";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card, Hero, Metric, Loading, Alert, Pill } from "@/components/ui";
import { Donut, Gauge } from "@/components/charts";
import { money, moneyShort, pct, signedPct } from "@/lib/format";

export default function Dashboard() {
  const { data, loading } = useProfile();
  if (!data) return <Loading />;
  const { current, target, drift, maxDrift, profile, score } = data;
  const hs = data.horizonSummary.current;
  const tenY = hs.find((h) => h.horizon === "10Y")!;
  const oneY = hs.find((h) => h.horizon === "1Y")!;
  const worst = Object.entries(drift).reduce((a, b) => Math.abs(b[1]) > Math.abs(a[1]) ? b : a);
  const gfc = data.stress.find((s) => s.name.includes("2008"))!;

  return (
    <div style={{ opacity: loading ? 0.6 : 1, transition: "opacity .2s" }}>
      <Hero name="Alexandra" value={money(current ? data.input.value : 0)} profile={profile} score={score} />

      <div className="grid g5">
        <Metric label="Portfolio value" value={money(data.input.value)} />
        <Metric label="Expected return / yr" value={pct(current.mu)} />
        <Metric label="Expected volatility" value={pct(current.vol)} />
        <Metric label="Risk profile fit" value={<span style={{ fontSize: 18 }}>{profile}</span>} />
        <Metric label="Largest drift" value={pct(maxDrift)}
          delta={maxDrift > 0.05 ? "Rebalance advised" : "Within tolerance"}
          deltaType={maxDrift > 0.05 ? "warn" : "up"} />
      </div>

      <div style={{ margin: "16px 0" }}>
        {maxDrift > 0.05 ? (
          <Alert kind="warn">
            <b>{worst[0]}</b> is {pct(Math.abs(worst[1]))} {worst[1] > 0 ? "above" : "below"} your
            recommended target. See the rebalancing plan below.
          </Alert>
        ) : (
          <Alert kind="ok">Your allocation is within ±5% of the recommended targets — no action needed.</Alert>
        )}
      </div>

      <div className="grid g2">
        <Card title="Where your money sits today" sub="Current allocation across the three buckets">
          <Donut weights={current.weights} height={250} />
        </Card>
        <Card title="🔭 10-year outlook" sub="From 2,500 Monte Carlo simulations on your current mix">
          <div className="grid g3" style={{ gap: 12 }}>
            <Metric label="Median outcome" value={moneyShort(tenY.p50)} delta={signedPct(tenY.p50 / data.input.value - 1, 0)} deltaType="up" />
            <Metric label="If markets disappoint" value={moneyShort(tenY.p5)} />
            <Metric label="If markets delight" value={moneyShort(tenY.p95)} />
          </div>
          <div style={{ height: 12 }} />
          <div className="grid g3" style={{ gap: 12 }}>
            <Metric label="1Y median" value={moneyShort(oneY.p50)} />
            <Metric label="1Y chance of loss" value={pct(oneY.chanceLoss, 0)} />
            <Metric label="2008-style hit" value={pct(gfc.currentImpact)} deltaType="down" />
          </div>
          <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
            Explore the <Link href="/future" style={{ color: "#1F2A44", fontWeight: 700 }}>Future Paths</Link> and{" "}
            <Link href="/stress" style={{ color: "#1F2A44", fontWeight: 700 }}>Stress Lab</Link> tabs for the full picture.
          </p>
        </Card>
      </div>

      <h2 style={{ fontSize: 19, margin: "28px 0 4px" }}>🎯 Allocation advisor</h2>
      <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>{data.profileBlurb}</p>

      <div className="grid g3">
        <Card title="Risk capacity score" sub="From your age, horizon, comfort & liquidity">
          <Gauge score={score} />
          <div className="center"><Pill>{profile}</Pill></div>
        </Card>
        <Card title="Current" sub="Your mix today">
          <Donut weights={current.weights} height={200} />
        </Card>
        <Card title={`Recommended · ${profile}`} sub="What we'd target" accent color="#9C5A6B">
          <Donut weights={target.weights} height={200} />
        </Card>
      </div>

      <div className="grid g2" style={{ marginTop: 16 }}>
        <Card title="🔁 Rebalancing plan" sub="Trades to align with your recommended mix">
          <table className="tbl">
            <thead><tr><th>Asset</th><th className="num">Current</th><th className="num">Target</th><th className="num">Drift</th><th>Action</th></tr></thead>
            <tbody>
              {data.rebalance.map((r) => (
                <tr key={r.asset}>
                  <td>{r.asset}</td>
                  <td className="num">{pct(r.current)}</td>
                  <td className="num">{pct(r.target)}</td>
                  <td className="num">{signedPct(r.drift)}</td>
                  <td className={r.action === "Buy" ? "tag-buy" : r.action === "Sell" ? "tag-sell" : "tag-hold"}>
                    {r.action === "Hold" ? "Hold" : `${r.action} ${moneyShort(Math.abs(r.dollars))}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="⚖️ What following the advice changes" sub="Current vs. recommended">
          <table className="tbl">
            <thead><tr><th>Metric</th><th className="num">Current</th><th className="num">{profile}</th></tr></thead>
            <tbody>
              <tr><td>Expected return / yr</td><td className="num">{pct(current.mu)}</td><td className="num">{pct(target.mu)}</td></tr>
              <tr><td>Expected volatility</td><td className="num">{pct(current.vol)}</td><td className="num">{pct(target.vol)}</td></tr>
              <tr><td>2008-style crisis impact</td><td className="num">{pct(gfc.currentImpact)}</td><td className="num">{pct(gfc.targetImpact)}</td></tr>
              <tr><td>1Y chance of loss</td><td className="num">{pct(oneY.chanceLoss, 0)}</td><td className="num">—</td></tr>
            </tbody>
          </table>
        </Card>
      </div>

      <p className="disclaimer">
        ⚠️ WealthLens is an illustrative analytics tool. Figures come from {data.meta.dataSource} market
        data (SPY/AGG/GLD) as of {data.meta.asOf} and Monte Carlo simulation. Not investment advice.
      </p>
    </div>
  );
}
