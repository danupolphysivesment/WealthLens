"use client";
import React, { useEffect, useRef, useState, Fragment } from "react";
import { useProfile } from "@/lib/store";
import type { Analysis } from "@/lib/types";

interface Msg { role: "user" | "assistant"; content: string; }

const STARTERS = [
  "Is my portfolio too risky?",
  "What does my 10-year projection mean?",
  "Explain diversification simply",
  "Should I rebalance now?",
];

function ctxFrom(d: Analysis) {
  const hs = d.horizonSummary.current;
  const ten = hs.find((h) => h.horizon === "10Y");
  const one = hs.find((h) => h.horizon === "1Y");
  const worst = d.stress.reduce((a, b) => (b.currentImpact < a.currentImpact ? b : a));
  return {
    value: d.input.value, profile: d.profile, score: d.score,
    currentWeights: d.current.weights, targetWeights: d.target.weights,
    curMu: d.current.mu, curVol: d.current.vol, tgtMu: d.target.mu, tgtVol: d.target.vol,
    maxDrift: d.maxDrift,
    tenYMedian: ten?.p50, oneYLoss: one?.chanceLoss,
    worstScenario: worst?.name, worstImpact: worst?.currentImpact,
    dataSource: d.meta.dataSource, asOf: d.meta.asOf,
  };
}

// minimal markdown: **bold**, `code`, bullet/numbered lines, blank lines
function rich(text: string) {
  return text.split("\n").map((line, i) => {
    const bullet = /^\s*[•\-]\s+/.test(line);
    const clean = bullet ? line.replace(/^\s*[•\-]\s+/, "") : line;
    const parts = clean.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, j) => {
      if (p.startsWith("**") && p.endsWith("**")) return <b key={j}>{p.slice(2, -2)}</b>;
      if (p.startsWith("`") && p.endsWith("`")) return <code key={j}>{p.slice(1, -1)}</code>;
      return <Fragment key={j}>{p}</Fragment>;
    });
    if (line.trim() === "") return <div key={i} style={{ height: 6 }} />;
    return <div key={i} className={bullet ? "coach-bullet" : ""}>{parts}</div>;
  });
}

export default function Coach() {
  const { data } = useProfile();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/coach/status").then((r) => r.json()).then((s) => setConfigured(s.configured)).catch(() => {});
  }, []);
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, open]);

  const send = async (text: string) => {
    if (!text.trim() || busy || !data) return;
    const history = [...msgs, { role: "user" as const, content: text }];
    setMsgs([...history, { role: "assistant", content: "" }]);
    setInput(""); setBusy(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, context: ctxFrom(data) }),
      });
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value, { stream: true });
        setMsgs((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + chunk };
          return copy;
        });
      }
    } catch {
      setMsgs((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: "Sorry — I couldn't reach the coach. Please try again." };
        return copy;
      });
    } finally { setBusy(false); }
  };

  return (
    <>
      {!open && (
        <button className="coach-fab" onClick={() => setOpen(true)} aria-label="Open AI coach">
          <span style={{ fontSize: 20 }}>💬</span> Ask coach
        </button>
      )}
      {open && (
        <div className="coach-panel">
          <div className="coach-header">
            <div>
              <div className="coach-title">🧭 WealthLens Coach</div>
              <div className="coach-sub">
                {configured === false ? "Offline mode · add API key for live answers" : "Powered by Claude · grounded in your plan"}
              </div>
            </div>
            <button className="coach-x" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          <div className="coach-body" ref={bodyRef}>
            {msgs.length === 0 && (
              <div className="coach-welcome">
                <p>Hi! I can explain your numbers and investing concepts in plain English. Try:</p>
                <div className="coach-starters">
                  {STARTERS.map((q) => (
                    <button key={q} onClick={() => send(q)} disabled={!data}>{q}</button>
                  ))}
                </div>
                <p className="coach-disc">Educational only — not personalised financial advice.</p>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`coach-msg ${m.role}`}>
                {m.role === "assistant" && m.content === "" ? <span className="coach-dots">●●●</span> : rich(m.content)}
              </div>
            ))}
          </div>

          <form className="coach-input" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <input value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={data ? "Ask about your plan…" : "Loading your plan…"} disabled={!data || busy} />
            <button type="submit" disabled={!input.trim() || busy || !data}>↑</button>
          </form>
        </div>
      )}
    </>
  );
}
