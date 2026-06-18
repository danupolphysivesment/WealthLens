"use client";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { Card, PageHead, Loading } from "@/components/ui";

const ORDER = { high: 0, medium: 1, low: 2 } as const;
const LABEL = { high: "Do now", medium: "Worth doing", low: "Good habit" } as const;

export default function Actions() {
  const { data } = useProfile();
  if (!data) return <Loading />;
  const actions = [...data.actions].sort((a, b) => ORDER[a.priority] - ORDER[b.priority]);

  return (
    <>
      <PageHead title="🧭 Action center">
        Your personalised next best actions — turned from all the analysis into a short, prioritised
        to-do list. Nothing here happens automatically; you stay in control.
      </PageHead>

      <div className="grid" style={{ gap: 14 }}>
        {actions.map((a, i) => (
          <Card key={i} accent
            color={a.priority === "high" ? "#9E3B3B" : a.priority === "medium" ? "#B0894F" : "#5E8C6A"}>
            <div className="action">
              <span className="ico">{a.icon}</span>
              <div className="body">
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h3 style={{ fontSize: 15.5 }}>{a.title}</h3>
                  <span className={`pill-tag badge-${a.priority}`}>{LABEL[a.priority]}</span>
                </div>
                <p>{a.body}</p>
                <Link className="cta" href={a.page}>{a.cta} →</Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <p className="disclaimer">
        Suggestions are generated from your inputs and simulations for education only — not
        personalised financial advice.
      </p>
    </>
  );
}
