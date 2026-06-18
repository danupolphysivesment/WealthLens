"use client";
import { useState } from "react";
import { useProfile } from "@/lib/store";
import { Card, PageHead, Loading, Metric } from "@/components/ui";
import { FanChart, Histogram } from "@/components/charts";
import { money, moneyShort, pct } from "@/lib/format";

export default function Future() {
  const { data } = useProfile();
  const [useTarget, setUseTarget] = useState(false);
  const [hz, setHz] = useState("1Y");
  if (!data) return <Loading />;
  const value = data.input.value;
  const side = useTarget ? data.future.target : data.future.current;
  const block = side.horizons.find((h) => h.horizon === hz)!;
  const HZ = side.horizons.map((h) => h.horizon);

  return (
    <>
      <PageHead title="🔮 Future paths">
        Nobody knows the future, so we simulate 2,500 of them from real market behaviour. The bands
        show where outcomes land; the median is the most typical path — never a promise.
      </PageHead>

      <Card>
        <div className="segmented">
          <button className={!useTarget ? "on" : ""} onClick={() => setUseTarget(false)}>Current allocation</button>
          <button className={useTarget ? "on" : ""} onClick={() => setUseTarget(true)}>Recommended ({data.profile})</button>
        </div>
      </Card>

      <Card title="2,500 simulated futures" sub="Dark band = most likely half · light band = 9 in 10 outcomes" style={{ marginTop: 16 }}>
        <FanChart band={side.fan.band} base={value} height={400} />
      </Card>

      <Card title="📅 What the simulations say at each horizon" style={{ marginTop: 16 }}>
        <table className="tbl">
          <thead><tr><th>Horizon</th><th className="num">Pessimistic</th><th className="num">Median</th>
            <th className="num">Optimistic</th><th className="num">Chance of loss</th></tr></thead>
          <tbody>
            {side.horizons.map((h) => (
              <tr key={h.horizon}>
                <td><b>{h.horizon}</b></td>
                <td className="num">{moneyShort(h.p5)}</td>
                <td className="num">{money(h.median)}</td>
                <td className="num">{moneyShort(h.p95)}</td>
                <td className="num">
                  <span style={{ display: "inline-block", width: 54, height: 7, background: "#eee", borderRadius: 4, marginRight: 8, verticalAlign: "middle", position: "relative", overflow: "hidden" }}>
                    <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${h.chanceLoss * 100}%`, background: "#9C5A6B" }} />
                  </span>
                  {pct(h.chanceLoss, 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="🔍 Zoom into one horizon" style={{ marginTop: 16 }}>
        <div className="segmented" style={{ marginBottom: 14 }}>
          {HZ.map((h) => <button key={h} className={hz === h ? "on" : ""} onClick={() => setHz(h)}>{h}</button>)}
        </div>
        <div className="grid g4" style={{ marginBottom: 14 }}>
          <Metric label={`Median at ${hz}`} value={moneyShort(block.median)} />
          <Metric label="Chance of gain" value={pct(block.chanceGain, 0)} deltaType="up" />
          <Metric label="1-in-20 bad case" value={moneyShort(block.p5)} />
          <Metric label="1-in-20 great case" value={moneyShort(block.p95)} />
        </div>
        <Histogram data={block.hist} base={value} />
        <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
          All 2,500 simulated outcomes at {hz}. The dashed line is today's value ({money(value)}).
        </p>
      </Card>

      <p className="disclaimer">
        Monte Carlo simulation from {data.meta.dataSource} return/risk estimates. Simulations explore
        possibilities — they are not predictions.
      </p>
    </>
  );
}
