"use client";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/store";
import { Card, PageHead } from "@/components/ui";
import { Donut } from "@/components/charts";
import { money, pct } from "@/lib/format";

const LIQ = ["Low", "Medium", "High"] as const;

export default function Onboarding() {
  const router = useRouter();
  const { input, setInput, data, setOnboarded } = useProfile();
  const sum = input.equity + input.fixed_income + input.alternatives || 1;
  const norm = {
    Equity: input.equity / sum,
    "Fixed Income": input.fixed_income / sum,
    Alternatives: input.alternatives / sum,
  };

  return (
    <>
      <PageHead title="Set up your plan">
        Tell us about your money and your appetite for risk. Everything in WealthLens —
        your recommended mix, stress tests and future paths — updates instantly from these answers.
      </PageHead>

      <div className="grid g2">
        <Card title="① Your portfolio" sub="What you have today">
          <div className="field">
            <label>Portfolio value <span className="range-val">{money(input.value)}</span></label>
            <input type="range" min={50000} max={10000000} step={50000} value={input.value}
              onChange={(e) => setInput({ value: +e.target.value })} />
          </div>
          <div className="field">
            <label>Current allocation</label>
            <div className="hint" style={{ marginBottom: 10 }}>
              Drag to match how your money is split today. We normalise to 100%.
            </div>
            {([["equity", "Equity", "#1F2A44"], ["fixed_income", "Fixed Income", "#5E8C6A"],
              ["alternatives", "Alternatives", "#B0894F"]] as const).map(([k, label, c]) => (
              <div className="field" key={k} style={{ marginBottom: 12 }}>
                <label style={{ color: c }}>
                  {label}
                  <span className="range-val" style={{ color: c }}>
                    {pct((input as any)[k] / sum, 0)}
                  </span>
                </label>
                <input type="range" min={0} max={100} value={(input as any)[k]}
                  style={{ accentColor: c }}
                  onChange={(e) => setInput({ [k]: +e.target.value } as any)} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="② Your risk profile" sub="How we size growth vs. safety">
          <div className="field">
            <label>Age <span className="range-val">{input.age}</span></label>
            <input type="range" min={18} max={85} value={input.age}
              onChange={(e) => setInput({ age: +e.target.value })} />
          </div>
          <div className="field">
            <label>Investment horizon <span className="range-val">{input.horizon_years} yrs</span></label>
            <input type="range" min={1} max={40} value={input.horizon_years}
              onChange={(e) => setInput({ horizon_years: +e.target.value })} />
          </div>
          <div className="field">
            <label>Comfort with market swings <span className="range-val">{input.tolerance}/10</span></label>
            <input type="range" min={1} max={10} value={input.tolerance}
              onChange={(e) => setInput({ tolerance: +e.target.value })} />
            <div className="hint">1 = sell in a panic · 10 = buy the dip without flinching</div>
          </div>
          <div className="field">
            <label>Cash needs from this portfolio</label>
            <div className="segmented">
              {LIQ.map((l) => (
                <button key={l} className={input.liquidity === l ? "on" : ""}
                  onClick={() => setInput({ liquidity: l })}>{l}</button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid g2" style={{ marginTop: 16 }}>
        <Card title="Your current mix" sub="Normalised to 100%">
          <Donut weights={norm} height={230} />
        </Card>
        <Card accent color="#1F2A44" title="Our live recommendation"
          sub={data ? `Risk score ${data.score}/100` : "Calculating…"}>
          {data ? (
            <>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#1F2A44" }}>{data.profile}</div>
              <p className="muted" style={{ fontSize: 13, margin: "8px 0 14px", lineHeight: 1.5 }}>
                {data.profileBlurb}
              </p>
              <Donut weights={data.target.weights} height={170} />
            </>
          ) : <div className="skel" style={{ height: 230 }} />}
          <button className="btn block" style={{ marginTop: 16 }}
            onClick={() => { setOnboarded(true); router.push("/dashboard"); }}>
            See my full dashboard →
          </button>
        </Card>
      </div>

      <p className="disclaimer">
        WealthLens is an educational analytics tool. It is not personalised investment advice;
        consult a licensed advisor before acting. Your inputs stay in your browser.
      </p>
    </>
  );
}
