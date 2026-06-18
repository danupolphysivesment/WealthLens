"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/store";
import { getContent } from "@/lib/api";
import type { Content } from "@/lib/types";
import { COLORS } from "@/lib/types";
import { Card, PageHead, Loading } from "@/components/ui";
import { LevelHeader, BadgeShelf } from "@/components/gamify";
import { DiversificationChart, LossBars } from "@/components/charts";

export default function Learn() {
  const { data, progress } = useProfile();
  const [content, setContent] = useState<Content | null>(null);
  useEffect(() => { getContent().then(setContent).catch(() => {}); }, []);
  if (!data || !content) return <Loading label="Loading the Learn Hub…" />;

  const done = new Set(progress.completedLessons);

  return (
    <>
      <PageHead title="🎓 Learn Hub">
        Level up your money knowledge. Complete lessons, ace the quizzes, keep your streak alive —
        knowledge compounds just like your portfolio.
      </PageHead>

      <LevelHeader progress={progress} badges={content.badges} />

      <h2 style={{ fontSize: 18, margin: "6px 0 12px" }}>Bite-size lessons</h2>
      <div className="grid g4">
        {content.lessons.map((l) => {
          const score = progress.quizScores[l.id];
          return (
            <Link key={l.id} href={`/learn/${l.id}`} className="card card-accent lesson-tile"
              style={{ borderTopColor: COLORS.purple }}>
              {done.has(l.id) && <span className="lesson-done">✓ Done</span>}
              <div className="lesson">
                <span className="ico">{l.icon}</span>
                <div>
                  <h3 style={{ fontSize: 14.5 }}>{l.title}</h3>
                  <div className="meta">{l.level} · {l.minutes} min</div>
                </div>
              </div>
              <p className="muted" style={{ fontSize: 12.5, margin: "10px 0 12px", lineHeight: 1.5 }}>{l.summary}</p>
              <span className="xp-chip">
                {score != null ? `Quiz ${Math.round(score * 100)}%` : "+25 XP"}
              </span>
            </Link>
          );
        })}
      </div>

      <h2 style={{ fontSize: 18, margin: "26px 0 12px" }}>🏅 Your badges</h2>
      <BadgeShelf progress={progress} badges={content.badges} />

      <h2 style={{ fontSize: 18, margin: "26px 0 12px" }}>Your money lives in three buckets</h2>
      <div className="grid g3">
        {content.assetCards.map((c) => (
          <div className="edu-card" key={c.key} style={{ borderTopColor: (COLORS as any)[c.key] }}>
            <div className="ico">{c.icon}</div>
            <div className="t">{c.title}</div>
            <div className="b">{c.body}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 18, margin: "26px 0 12px" }}>Seeing is believing</h2>
      <div className="grid g2">
        <Card title="Diversification: similar destination, calmer journey"
          sub="Growth of $1 — 100% equity vs a balanced 50/35/15 mix">
          <DiversificationChart data={data.learn.diversification} />
        </Card>
        <Card title="Time is your best friend" sub="Chance of ending below today's value, by horizon">
          <LossBars data={data.learn.lossByHorizon} />
        </Card>
      </div>

      <Card title="📖 Glossary" sub="Every term on this dashboard, in plain English" style={{ marginTop: 16 }}>
        <table className="tbl">
          <thead><tr><th style={{ width: "30%" }}>Term</th><th>Plain-English meaning</th></tr></thead>
          <tbody>
            {content.glossary.map((g) => (
              <tr key={g.term}><td><b>{g.term}</b></td><td className="muted">{g.meaning}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>

      <p className="disclaimer">Educational content only. WealthLens does not provide personalised investment advice.</p>
    </>
  );
}
