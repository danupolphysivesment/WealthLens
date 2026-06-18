"use client";
import { useState } from "react";
import { useProfile } from "@/lib/store";
import { Card, PageHead, Loading, Metric, Alert } from "@/components/ui";
import { Waterfall, StressBars } from "@/components/charts";
import { money, moneyShort, pct } from "@/lib/format";

export default function Stress() {
  const { data } = useProfile();
  const [idx, setIdx] = useState(0);
  if (!data) return <Loading />;
  const scn = data.stress[idx];
  const value = data.input.value;
  const loss = scn.currentImpact;

  return (
    <>
      <PageHead title="🌪️ Stress Lab">
        Pick a crisis and watch exactly how it would hit your portfolio. Stress testing turns a
        2008-style shock from a nightmare into a known quantity you've already planned for.
      </PageHead>

      <Card>
        <div className="field" style={{ marginBottom: 8 }}>
          <label>Scenario</label>
          <select value={idx} onChange={(e) => setIdx(+e.target.value)}>
            {data.stress.map((s, i) => <option key={s.name} value={i}>{s.icon} {s.name}</option>)}
          </select>
        </div>
        <Alert kind="info">{scn.icon} <b>{scn.name}</b> — {scn.desc}</Alert>
      </Card>

      <div className="grid g4" style={{ marginTop: 16 }}>
        <Metric label="Portfolio impact" value={pct(loss)} delta={money(loss * value)} deltaType="down" />
        <Metric label="Value after shock" value={moneyShort(value * (1 + loss))} />
        <Metric label="Estimated recovery" value={scn.recoveryMonths ? `${scn.recoveryMonths} mo` : "—"} />
        <Metric label="Recommended-mix impact" value={pct(scn.targetImpact)}
          delta={scn.targetImpact > loss ? "more resilient" : ""} deltaType="up" />
      </div>

      <div className="grid g2" style={{ marginTop: 16 }}>
        <Card title="Where the damage comes from" sub="Contribution of each asset class to the loss">
          <Waterfall value={value} contribs={scn.contribs} assets={data.meta.assets} />
        </Card>
        <Card title="How each crisis would hit you" sub="Current vs. recommended mix, across all scenarios">
          <StressBars stress={data.stress} profile={data.profile} />
        </Card>
      </div>

      <p className="disclaimer">
        Shocks are illustrative instantaneous moves applied to your live allocation. Recovery time
        assumes growth resumes at the portfolio's expected return.
      </p>
    </>
  );
}
