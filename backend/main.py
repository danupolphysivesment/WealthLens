"""WealthLens API — wraps the proven analytics engine for the web front-end."""
from __future__ import annotations

import numpy as np
import pandas as pd
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

import auth
import coach
import content
import engine
import market

app = FastAPI(title="WealthLens API", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
auth.init_db()

ASSETS = market.ASSETS


# ----------------------------------------------------------------- auth
class SignupReq(BaseModel):
    email: str
    name: str = ""
    password: str = Field(min_length=6)


class LoginReq(BaseModel):
    email: str
    password: str


class StateReq(BaseModel):
    state: dict


def current_user(authorization: str = Header(None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Not authenticated")
    uid = auth.verify_token(authorization.split(" ", 1)[1])
    user = auth.get_user(uid) if uid else None
    if not user:
        raise HTTPException(401, "Invalid or expired token")
    return user


@app.post("/api/auth/signup")
def signup(req: SignupReq):
    if "@" not in req.email or "." not in req.email:
        raise HTTPException(400, "Please enter a valid email address.")
    if auth.email_exists(req.email):
        raise HTTPException(409, "An account with that email already exists.")
    user = auth.create_user(req.email, req.name, req.password)
    return {"token": auth.make_token(user["id"]), "user": user}


@app.post("/api/auth/login")
def login(req: LoginReq):
    user = auth.verify_user(req.email, req.password)
    if not user:
        raise HTTPException(401, "Wrong email or password.")
    return {"token": auth.make_token(user["id"]), "user": user}


@app.get("/api/auth/me")
def me(user: dict = Depends(current_user)):
    return {"user": user}


@app.get("/api/user/state")
def read_state(user: dict = Depends(current_user)):
    return {"state": auth.get_state(user["id"])}


@app.put("/api/user/state")
def write_state(req: StateReq, user: dict = Depends(current_user)):
    auth.set_state(user["id"], req.state)
    return {"ok": True}


# --------------------------------------------------------------------- models
class AnalyzeRequest(BaseModel):
    value: float = Field(500_000, gt=0)
    equity: float = 60          # current allocation %, any positive numbers
    fixed_income: float = 25
    alternatives: float = 15
    age: int = 40
    horizon_years: int = 20
    tolerance: int = 6          # 1..10
    liquidity: str = "Low"      # Low | Medium | High


# ----------------------------------------------------------------- helpers
def _f(x) -> float:
    return float(x)


def _weights(req: AnalyzeRequest) -> dict:
    raw = {"Equity": max(req.equity, 0), "Fixed Income": max(req.fixed_income, 0),
           "Alternatives": max(req.alternatives, 0)}
    total = sum(raw.values()) or 1.0
    return {a: raw[a] / total for a in ASSETS}


def _fan(paths: np.ndarray, base: float) -> dict:
    n = paths.shape[1]
    dates = pd.date_range(pd.Timestamp.today().normalize(), periods=n, freq="ME")
    vals = paths * base
    q = {p: np.percentile(vals, p, axis=0) for p in (5, 25, 50, 75, 95)}
    band = [{
        "t": i,
        "date": dates[i].strftime("%Y-%m"),
        "p5": _f(q[5][i]), "p25": _f(q[25][i]), "p50": _f(q[50][i]),
        "p75": _f(q[75][i]), "p95": _f(q[95][i]),
    } for i in range(n)]
    sample = [[_f(v) for v in paths[i] * base] for i in range(24)]
    return {"band": band, "samples": sample, "dates": [d.strftime("%Y-%m") for d in dates]}


def _horizon_blocks(paths: np.ndarray, base: float) -> list:
    out = []
    for label, m in engine.HORIZONS.items():
        vals = paths[:, m] * base
        counts, edges = np.histogram(vals, bins=36)
        out.append({
            "horizon": label,
            "median": _f(np.median(vals)),
            "p5": _f(np.percentile(vals, 5)),
            "p25": _f(np.percentile(vals, 25)),
            "p75": _f(np.percentile(vals, 75)),
            "p95": _f(np.percentile(vals, 95)),
            "chanceGain": _f((vals >= base).mean()),
            "chanceLoss": _f((vals < base).mean()),
            "hist": [{"x": _f((edges[i] + edges[i + 1]) / 2), "n": int(counts[i])}
                     for i in range(len(counts))],
        })
    return out


def _actions(req, current_w, target_w, profile, drifts, max_drift,
             cur_vol, tgt_vol, stress_rows) -> list:
    actions = []
    worst = max(drifts, key=lambda a: abs(drifts[a]))
    if max_drift > 0.05:
        d = drifts[worst]
        actions.append({
            "priority": "high", "icon": "🔁", "page": "/dashboard",
            "title": f"Rebalance — {worst} is off target",
            "body": f"{worst} is {abs(d) * 100:.0f}% {'above' if d > 0 else 'below'} your "
                    f"recommended weight. Rebalancing realigns risk with your {profile} plan.",
            "cta": "See rebalancing plan",
        })
    else:
        actions.append({
            "priority": "low", "icon": "✅", "page": "/dashboard",
            "title": "Allocation is on target",
            "body": "Every asset class is within ±5% of your recommended weights. "
                    "Nothing to do — check back after big market moves.",
            "cta": "View allocation",
        })
    if cur_vol > tgt_vol + 0.015:
        actions.append({
            "priority": "high", "icon": "🎯", "page": "/dashboard",
            "title": "You're taking more risk than your profile suggests",
            "body": f"Your current mix swings about {cur_vol * 100:.0f}% a year vs "
                    f"{tgt_vol * 100:.0f}% for the recommended {profile} mix. "
                    "Consider trimming equities toward target.",
            "cta": "Review risk fit",
        })
    worst_scn = min(stress_rows, key=lambda s: s["currentImpact"])
    actions.append({
        "priority": "medium", "icon": "🌪️", "page": "/stress",
        "title": f"Know your worst case: {worst_scn['name']}",
        "body": f"A {worst_scn['name']} would hit this portfolio about "
                f"{worst_scn['currentImpact'] * 100:.0f}%. The recommended mix would lose "
                f"{worst_scn['targetImpact'] * 100:.0f}% — more resilient.",
        "cta": "Open the Stress Lab",
    })
    if req.horizon_years >= 5:
        actions.append({
            "priority": "medium", "icon": "💧", "page": "/future",
            "title": "Automate contributions to widen the odds",
            "body": "Time is your biggest edge. Steady monthly contributions lift the "
                    "whole fan chart and cut the chance of ending below today's value.",
            "cta": "See Future Paths",
        })
    if req.liquidity == "High":
        actions.append({
            "priority": "medium", "icon": "🏦", "page": "/learn",
            "title": "Keep a cash buffer outside this portfolio",
            "body": "You flagged high near-term cash needs. Hold 6–12 months of expenses "
                    "in cash so you're never forced to sell investments at a bad time.",
            "cta": "Learn why",
        })
    actions.append({
        "priority": "low", "icon": "🎓", "page": "/learn",
        "title": "Understand every number you just saw",
        "body": "Bite-size lessons explain diversification, volatility, drawdowns and the "
                "fan chart in plain English. Build the habit — knowledge compounds too.",
        "cta": "Go to Learn Hub",
    })
    return actions


# ----------------------------------------------------------------- routes
@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/meta")
def meta():
    return {
        "assets": ASSETS,
        "colors": market.COLORS,
        "proxies": market.PROXIES,
        "dataSource": market.DATA_SOURCE,
        "asOf": market.AS_OF,
        "dataStart": market.DATA_START,
        "assetStats": [
            {"asset": a, "expectedReturn": _f(market.MU[i]),
             "volatility": _f(market.VOL[i]), "proxy": market.PROXIES[a],
             "color": market.COLORS[a]}
            for i, a in enumerate(ASSETS)
        ],
        "profiles": {p: engine.RISK_PROFILES[p] for p in engine.RISK_PROFILES},
    }


class CoachReq(BaseModel):
    messages: list = []
    context: dict = {}


@app.post("/api/coach")
def coach_chat(req: CoachReq):
    gen = coach.stream_reply(req.messages, req.context)
    return StreamingResponse(gen, media_type="text/plain; charset=utf-8")


@app.get("/api/coach/status")
def coach_status():
    import os
    return {"configured": bool(os.environ.get("ANTHROPIC_API_KEY")), "model": coach.MODEL}


@app.get("/api/content")
def get_content():
    return {
        "assetCards": content.ASSET_CARDS,
        "bigIdeas": content.BIG_IDEAS,
        "glossary": [{"term": t, "meaning": m} for t, m in content.GLOSSARY],
        "lessons": content.LESSONS,
        "lessonBodies": content.LESSON_BODIES,
        "quizzes": content.QUIZZES,
        "badges": content.BADGES,
    }


@app.post("/api/analyze")
def analyze(req: AnalyzeRequest):
    current_w = _weights(req)
    score = engine.risk_score(req.age, req.horizon_years, req.tolerance, req.liquidity)
    profile = engine.profile_for_score(score)
    target_w = engine.RISK_PROFILES[profile]

    cur_mu, cur_vol = engine.stats(current_w)
    tgt_mu, tgt_vol = engine.stats(target_w)
    cur_paths = engine.simulate_unit_paths(current_w)
    tgt_paths = engine.simulate_unit_paths(target_w)

    drifts = {a: current_w[a] - target_w[a] for a in ASSETS}
    max_drift = max(abs(d) for d in drifts.values())
    rebalance = []
    for a in ASSETS:
        d = drifts[a]
        dollars = -d * req.value
        action = "Hold" if abs(d) < 0.02 else ("Sell" if dollars < 0 else "Buy")
        rebalance.append({
            "asset": a, "current": _f(current_w[a]), "target": _f(target_w[a]),
            "drift": _f(d), "dollars": _f(dollars), "action": action,
        })

    # stress
    stress_rows = []
    for name, scn in engine.STRESS_SCENARIOS.items():
        cur_impact = engine.stress_impact(current_w, scn["shocks"])
        tgt_impact = engine.stress_impact(target_w, scn["shocks"])
        stress_rows.append({
            "name": name, "icon": scn["icon"], "desc": scn["desc"],
            "shocks": scn["shocks"],
            "currentImpact": _f(cur_impact), "targetImpact": _f(tgt_impact),
            "valueAfter": _f(req.value * (1 + cur_impact)),
            "recoveryMonths": engine.recovery_months(cur_impact, current_w),
            "contribs": {a: _f(req.value * current_w[a] * scn["shocks"][a]) for a in ASSETS},
        })

    # track record
    history = market.monthly_history()
    cur_ret = engine.backtest(current_w, history)
    tgt_ret = engine.backtest(target_w, history)
    cur_growth = req.value * (1 + cur_ret).cumprod()
    tgt_growth = req.value * (1 + tgt_ret).cumprod()
    cur_dd = (cur_growth / cur_growth.cummax() - 1)
    annual_cur = (1 + cur_ret).resample("YE").prod() - 1
    annual_tgt = (1 + tgt_ret).resample("YE").prod() - 1
    track = {
        "dates": [d.strftime("%Y-%m") for d in cur_growth.index],
        "currentGrowth": [_f(v) for v in cur_growth],
        "targetGrowth": [_f(v) for v in tgt_growth],
        "drawdown": [_f(v) for v in cur_dd],
        "annual": [{"year": int(y.year), "current": _f(c), "target": _f(t)}
                   for y, c, t in zip(annual_cur.index, annual_cur, annual_tgt)],
        "metrics": {
            "current": {k: _f(v) for k, v in engine.perf_metrics(cur_ret).items()},
            "target": {k: _f(v) for k, v in engine.perf_metrics(tgt_ret).items()},
        },
    }

    # learn visuals (data-driven)
    eq_growth = (1 + history["Equity"]).cumprod()
    mix_ret = engine.backtest({"Equity": .5, "Fixed Income": .35, "Alternatives": .15}, history)
    mix_growth = (1 + mix_ret).cumprod()
    cur_summary = engine.horizon_summary(cur_paths, req.value)
    dd = eq_growth / eq_growth.cummax() - 1
    trough = dd.idxmin()
    peak = eq_growth.loc[:trough].idxmax()
    after = eq_growth.loc[trough:]
    rec_idx = after[after >= eq_growth.loc[peak]].index
    learn = {
        "diversification": [
            {"date": d.strftime("%Y-%m"), "equity": _f(e), "balanced": _f(b)}
            for d, e, b in zip(eq_growth.index, eq_growth, mix_growth)
        ],
        "lossByHorizon": [
            {"horizon": r["Horizon"], "chanceLoss": _f(r["Chance of loss"])}
            for _, r in cur_summary.iterrows()
        ],
        "drawdownAnatomy": {
            "series": [{"date": d.strftime("%Y-%m"), "v": _f(v)}
                       for d, v in zip(eq_growth.index, eq_growth)],
            "peak": {"date": peak.strftime("%Y-%m"), "v": _f(eq_growth.loc[peak])},
            "trough": {"date": trough.strftime("%Y-%m"), "v": _f(eq_growth.loc[trough]),
                       "depth": _f(dd.min())},
            "recovered": ({"date": rec_idx[0].strftime("%Y-%m"),
                           "v": _f(eq_growth.loc[rec_idx[0]])} if len(rec_idx) else None),
        },
    }

    actions = _actions(req, current_w, target_w, profile, drifts, max_drift,
                       cur_vol, tgt_vol, stress_rows)

    return {
        "input": req.model_dump(),
        "profile": profile, "score": score,
        "profileBlurb": engine.PROFILE_BLURBS[profile],
        "current": {"weights": {a: _f(current_w[a]) for a in ASSETS},
                    "mu": _f(cur_mu), "vol": _f(cur_vol)},
        "target": {"weights": {a: _f(target_w[a]) for a in ASSETS},
                   "mu": _f(tgt_mu), "vol": _f(tgt_vol)},
        "drift": {a: _f(drifts[a]) for a in ASSETS},
        "maxDrift": _f(max_drift),
        "rebalance": rebalance,
        "horizonSummary": {
            "current": [
                {"horizon": r["Horizon"], "p5": _f(r["Pessimistic (5th)"]),
                 "p25": _f(r["Cautious (25th)"]), "p50": _f(r["Median (50th)"]),
                 "p75": _f(r["Optimistic (75th)"]), "p95": _f(r["Best case (95th)"]),
                 "chanceLoss": _f(r["Chance of loss"])}
                for _, r in cur_summary.iterrows()
            ],
        },
        "stress": stress_rows,
        "future": {
            "current": {"fan": _fan(cur_paths, req.value),
                        "horizons": _horizon_blocks(cur_paths, req.value)},
            "target": {"fan": _fan(tgt_paths, req.value),
                       "horizons": _horizon_blocks(tgt_paths, req.value)},
        },
        "track": track,
        "learn": learn,
        "actions": actions,
        "meta": {"dataSource": market.DATA_SOURCE, "asOf": market.AS_OF,
                 "colors": market.COLORS, "assets": ASSETS},
    }
