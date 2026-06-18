"""Capital-market data for WealthLens.

Primary source: **real** monthly history from Yahoo Finance via yfinance, using
liquid ETF proxies for the three asset classes:

    Equity        -> SPY   (US large-cap equities)
    Fixed Income  -> AGG    (US aggregate bonds)
    Alternatives  -> GLD    (gold / real assets sleeve)

Returns are cached to disk (cache/history.csv) for the day so the server starts
fast and stays reliable. If the network/yfinance is unavailable, we fall back to
the original seeded *synthetic* generator so the app always runs.

`MU`, `VOL`, `CORR`, `COV` are estimated from whichever history we end up using,
so every downstream number (Monte Carlo, stress recovery, stats) is driven by
the same data the Track Record tab shows.
"""
from __future__ import annotations

import datetime as _dt
import os

import numpy as np
import pandas as pd

ASSETS = ["Equity", "Fixed Income", "Alternatives"]
PROXIES = {"Equity": "SPY", "Fixed Income": "AGG", "Alternatives": "GLD"}

COLORS = {
    "Equity": "#6C5CE7",
    "Fixed Income": "#00B894",
    "Alternatives": "#F39C12",
    "Portfolio": "#0984E3",
    "Recommended": "#E84393",
}

_CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")
_CACHE_FILE = os.path.join(_CACHE_DIR, "history.csv")
_START = "2005-01-01"

# --- synthetic fallback (seeded, reproducible) -----------------------------
_SYNTH_MU = np.array([0.085, 0.038, 0.062])
_SYNTH_VOL = np.array([0.16, 0.05, 0.10])
_SYNTH_CORR = np.array([
    [1.00, -0.10, 0.60],
    [-0.10, 1.00, 0.10],
    [0.60, 0.10, 1.00],
])
_SYNTH_COV = np.outer(_SYNTH_VOL, _SYNTH_VOL) * _SYNTH_CORR
_CRISES = {
    ("2008-06", "2009-02"): (-0.065, 0.004, -0.035),
    ("2009-03", "2009-12"): (0.035, 0.001, 0.015),
    ("2011-07", "2011-09"): (-0.045, 0.006, -0.020),
    ("2015-08", "2016-01"): (-0.020, 0.001, -0.010),
    ("2018-10", "2018-12"): (-0.045, 0.002, -0.020),
    ("2020-02", "2020-03"): (-0.160, 0.005, -0.070),
    ("2020-04", "2020-08"): (0.050, 0.002, 0.025),
    ("2022-01", "2022-09"): (-0.028, -0.018, -0.008),
}


def _synthetic_history(seed: int = 11) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    dates = pd.date_range("2006-01-31", "2026-05-31", freq="ME")
    rets = rng.multivariate_normal(_SYNTH_MU / 12, _SYNTH_COV / 12, size=len(dates))
    df = pd.DataFrame(rets, index=dates, columns=ASSETS)
    for (start, end), shock in _CRISES.items():
        end_ts = pd.Timestamp(end) + pd.offsets.MonthEnd(0)
        mask = (df.index >= pd.Timestamp(start)) & (df.index <= end_ts)
        df.loc[mask] = df.loc[mask] * 0.6 + np.array(shock)
    df = df + (_SYNTH_MU / 12 - df.mean(axis=0).to_numpy())
    return df


# --- real data via yfinance ------------------------------------------------
def _download_real() -> pd.DataFrame | None:
    """Monthly returns for the proxy ETFs, or None if it can't be fetched."""
    try:
        import yfinance as yf
    except Exception:
        return None
    try:
        tickers = [PROXIES[a] for a in ASSETS]
        raw = yf.download(tickers, start=_START, interval="1mo",
                          auto_adjust=True, progress=False, threads=True)
        if raw is None or len(raw) == 0:
            return None
        close = raw["Close"] if "Close" in raw.columns.get_level_values(0) else raw
        close = close[tickers].dropna(how="all")
        close.columns = ASSETS  # SPY/AGG/GLD -> Equity/Fixed Income/Alternatives
        rets = close.pct_change().dropna()
        if len(rets) > 2:
            rets = rets.iloc[:-1]  # drop the latest (partial) month
        rets.index = pd.to_datetime(rets.index)
        rets.index = rets.index + pd.offsets.MonthEnd(0)
        return rets[ASSETS] if len(rets) >= 36 else None
    except Exception:
        return None


def _load_history() -> tuple[pd.DataFrame, str]:
    """(monthly-returns DataFrame, source label). Tries cache -> live -> synthetic."""
    # fresh same-day cache?
    if os.path.exists(_CACHE_FILE):
        age_days = (_dt.date.today()
                    - _dt.date.fromtimestamp(os.path.getmtime(_CACHE_FILE))).days
        if age_days <= 1:
            try:
                df = pd.read_csv(_CACHE_FILE, index_col=0, parse_dates=True)
                if list(df.columns) == ASSETS and len(df) >= 36:
                    return df, "live (cached)"
            except Exception:
                pass
    # live download
    real = _download_real()
    if real is not None:
        try:
            os.makedirs(_CACHE_DIR, exist_ok=True)
            real.to_csv(_CACHE_FILE)
        except Exception:
            pass
        return real, "live"
    # last resort
    return _synthetic_history(), "synthetic (fallback)"


# --- module-level capital-market assumptions, estimated from the history ----
_HISTORY, DATA_SOURCE = _load_history()
AS_OF = str(_HISTORY.index[-1].date())
DATA_START = str(_HISTORY.index[0].date())

MU = (_HISTORY.mean(axis=0) * 12).to_numpy()
COV = (_HISTORY.cov() * 12).to_numpy()
VOL = np.sqrt(np.diag(COV))
CORR = COV / np.outer(VOL, VOL)


def monthly_history(seed: int = 11) -> pd.DataFrame:
    """Monthly asset-class returns backing the app (real where available)."""
    return _HISTORY.copy()
