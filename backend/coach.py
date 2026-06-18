"""WealthLens AI Coach — a Claude-powered educational chat grounded in the user's plan.

Uses the official Anthropic SDK with claude-opus-4-8 and streaming. If no
ANTHROPIC_API_KEY is configured (or the call fails), it streams a graceful,
context-aware fallback so the app still works end-to-end.
"""
from __future__ import annotations

import os
import time

MODEL = "claude-opus-4-8"


def _pct(x, d=1):
    try:
        return f"{x * 100:.{d}f}%"
    except Exception:
        return "—"


def _money(x):
    try:
        return f"${x:,.0f}"
    except Exception:
        return "—"


def build_system(ctx: dict) -> str:
    cw = ctx.get("currentWeights", {})
    tw = ctx.get("targetWeights", {})
    def mix(w):
        return ", ".join(f"{k} {_pct(w.get(k, 0), 0)}" for k in ["Equity", "Fixed Income", "Alternatives"])
    return f"""You are WealthLens Coach, a friendly, plain-English financial educator built into the WealthLens app. You help the user understand their own plan and core investing concepts.

THE USER'S CURRENT PLAN (live numbers from the app):
- Portfolio value: {_money(ctx.get('value'))}
- Recommended risk profile: {ctx.get('profile', '—')} (risk score {ctx.get('score', '—')}/100)
- Current allocation: {mix(cw)}
- Recommended allocation: {mix(tw)}
- Expected return / volatility — current: {_pct(ctx.get('curMu'))} / {_pct(ctx.get('curVol'))}; recommended: {_pct(ctx.get('tgtMu'))} / {_pct(ctx.get('tgtVol'))}
- Largest drift from target: {_pct(ctx.get('maxDrift'))}
- 10-year median projection: {_money(ctx.get('tenYMedian'))}; 1-year chance of loss: {_pct(ctx.get('oneYLoss'), 0)}
- Worst stress scenario: {ctx.get('worstScenario', '—')} → current impact {_pct(ctx.get('worstImpact'))}
- Market data: {ctx.get('dataSource', '—')} (SPY/AGG/GLD), as of {ctx.get('asOf', '—')}

GUIDELINES:
- You are educational only — NOT a licensed financial advisor. Do not give individualized buy/sell, tax, or legal advice, and do not recommend specific securities. Explain concepts and what the user's own numbers mean.
- When relevant, ground your answer in the numbers above, and point the user to the right app section: Dashboard (allocation & rebalancing), Stress Lab, Future Paths, Performance, or the Learn Hub.
- Plain English. Define any jargon you use. Be concise — a few short paragraphs or a tight list. Warm and encouraging.
- If asked for personalized advice, gently reframe to education and suggest consulting a licensed advisor for decisions.
- Respond only with your final answer — no meta-commentary about your reasoning."""


def _fallback_text(ctx: dict, question: str) -> str:
    return (
        "I'm your WealthLens Coach. I'm running in **offline mode** right now "
        "(no `ANTHROPIC_API_KEY` is configured on the server), so I can't give a "
        "full conversational answer yet — but here's a quick read on your plan:\n\n"
        f"• Your recommended profile is **{ctx.get('profile', '—')}** "
        f"(risk score {ctx.get('score', '—')}/100).\n"
        f"• Expected return is about {_pct(ctx.get('curMu'))} a year with "
        f"{_pct(ctx.get('curVol'))} volatility.\n"
        f"• Over 10 years the median projection is {_money(ctx.get('tenYMedian'))}, "
        f"and a {ctx.get('worstScenario', 'major crisis')} would hit you about "
        f"{_pct(ctx.get('worstImpact'))}.\n\n"
        "Add an Anthropic API key to the backend (`ANTHROPIC_API_KEY`) to unlock "
        "full, grounded Q&A powered by Claude. In the meantime, the Learn Hub and "
        "Stress Lab tabs explain all of these numbers in plain English."
    )


def stream_reply(messages: list, ctx: dict):
    """Yield text chunks for the assistant reply."""
    msgs = [{"role": m["role"], "content": str(m["content"])[:6000]}
            for m in messages if m.get("role") in ("user", "assistant")][-12:]
    if not msgs or msgs[0]["role"] != "user":
        yield "Ask me anything about your plan or investing in general!"
        return

    if not os.environ.get("ANTHROPIC_API_KEY"):
        text = _fallback_text(ctx, msgs[-1]["content"])
        for word in text.split(" "):
            yield word + " "
            time.sleep(0.012)
        return

    try:
        import anthropic
        client = anthropic.Anthropic()
        with client.messages.stream(
            model=MODEL,
            max_tokens=1500,
            system=build_system(ctx),
            messages=msgs,
            thinking={"type": "adaptive"},
            output_config={"effort": "low"},
        ) as stream:
            for text in stream.text_stream:
                yield text
    except Exception as e:  # network, auth, rate limit, etc.
        yield ("\n\n⚠️ The coach hit an error reaching Claude "
               f"({type(e).__name__}). Please try again in a moment.")
