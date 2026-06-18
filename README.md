# 🧭 WealthLens — financial literacy & planning web app

A modern web product that turns the proven **WealthLens** analytics engine into a
client-facing experience: learn investing, see your portfolio, stress-test it, and
explore your future paths — all powered by **real market data**.

Built as the V1 MVP from the product blueprint
(`../WealthLens - App Blueprint.excalidraw`).

## Architecture

```
wealthlens-web/
├── backend/            FastAPI — wraps the quant engine
│   ├── engine.py       risk profiling · Monte Carlo · stress · backtest (reused verbatim)
│   ├── market.py       REAL data via yfinance (SPY→Equity, AGG→Fixed Income, GLD→Alternatives)
│   │                   cached to cache/history.csv · synthetic fallback if offline
│   ├── auth.py         accounts: SQLite + salted PBKDF2 + HMAC tokens (stdlib only)  [V2]
│   ├── content.py      Learn Hub content, lesson bodies, quizzes, badges
│   └── main.py         POST /api/analyze · /api/content /api/meta /api/health
│                       + /api/auth/{signup,login,me} · /api/user/state            [V2]
└── frontend/           Next.js 14 (App Router) + Recharts
    ├── app/            onboarding · dashboard · performance · stress · future
    │                   learn · learn/[id] (lesson+quiz) · actions · login          [V2]
    ├── components/     Shell (nav+account) · charts · ui · gamify (XP/badges)      [V2]
    └── lib/            api · store (auth + progress + server sync) · gamify · types · format
```

## V2 (done): accounts + gamified Learn Hub + AI coach
- **Accounts** — sign up / log in; profile, progress, XP and badges saved server-side
  and restored on any device. Try anonymously first; progress carries into your account
  on sign-up (stored in `localStorage` until then).
- **Gamification** — XP & levels, daily streaks, 8 unlockable badges, and an interactive
  multiple-choice quiz on every lesson with instant feedback.
- **AI coach** — a floating chat (`components/Coach.tsx`) on every page, powered by Claude
  (`claude-opus-4-8`) and grounded in the user's live numbers. Streams responses; `backend/coach.py`
  falls back to a context-aware offline summary when no `ANTHROPIC_API_KEY` is set, so it always runs.
  Set `ANTHROPIC_API_KEY` in the backend env for full live Q&A.
- Demo login (created during testing): `carry@wealthlens.com` / `demo12345`.

The frontend calls `/api/*`, which `next.config.js` proxies to the backend on :8000.

## The six pillars (+ onboarding)

| Page | What it does |
|------|--------------|
| **Onboarding** | Portfolio + risk questionnaire → live recommended mix |
| **Dashboard** | Overview metrics, drift alert, allocation advisor, rebalancing plan |
| **Performance** | 20-yr backtest: growth, drawdowns, calendar returns, scorecard |
| **Stress Lab** | Replay 2008 / COVID / 2022 + custom, damage waterfall, recovery |
| **Future Paths** | 2,500-path Monte Carlo fan chart + per-horizon histograms |
| **Learn Hub** | Lessons, concept cards, data-driven explainers, glossary |
| **Action Center** | Personalised, prioritised next-best-actions |

## Run it

**1. Backend**
```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn main:app --port 8000
```
First start fetches real ETF history from Yahoo Finance and caches it to `cache/`.

**2. Frontend** (separate terminal)
```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

## Notes
- Data source and as-of date are shown in the sidebar (green = live, amber = synthetic fallback).
- Educational tool only — not personalised investment advice.
- Auth is intentionally lightweight (SQLite + stdlib). Set `WEALTHLENS_SECRET` in the
  backend env to pin the token-signing key; otherwise one is generated to `cache/secret.txt`.
- AI coach uses Claude `claude-opus-4-8` via the `anthropic` SDK; set `ANTHROPIC_API_KEY` to enable live answers (works in offline-fallback mode without one).
- Remaining V2: premium tier / feature gating (needs Stripe for real payments).
- For production: pin Next.js to a patched 14.2.x, move auth to Postgres + a managed
  provider, and refresh market data on a schedule (see blueprint roadmap V3).
