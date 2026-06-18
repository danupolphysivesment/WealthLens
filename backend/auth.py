"""Lightweight accounts for WealthLens — SQLite + salted PBKDF2 + HMAC tokens.

No external dependencies (stdlib only). Each user row also stores a JSON blob of
their saved state (profile inputs + gamification progress) so accounts persist
across devices. Swap for Postgres + a managed auth provider in production.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import time

_DIR = os.path.join(os.path.dirname(__file__), "cache")
_DB = os.path.join(_DIR, "wealthlens.db")
_TTL = 60 * 60 * 24 * 30  # 30 days


def _secret() -> bytes:
    env = os.environ.get("WEALTHLENS_SECRET")
    if env:
        return env.encode()
    os.makedirs(_DIR, exist_ok=True)
    path = os.path.join(_DIR, "secret.txt")
    if not os.path.exists(path):
        with open(path, "w") as f:
            f.write(secrets.token_hex(32))
    with open(path) as f:
        return f.read().strip().encode()


def _conn() -> sqlite3.Connection:
    os.makedirs(_DIR, exist_ok=True)
    c = sqlite3.connect(_DB)
    c.row_factory = sqlite3.Row
    return c


def init_db() -> None:
    with _conn() as c:
        c.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                email     TEXT UNIQUE NOT NULL,
                name      TEXT NOT NULL,
                salt      TEXT NOT NULL,
                pw_hash   TEXT NOT NULL,
                state     TEXT NOT NULL DEFAULT '{}',
                created   REAL NOT NULL
            )
        """)


# ---- passwords -------------------------------------------------------------
def _hash(pw: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", pw.encode(), bytes.fromhex(salt), 200_000).hex()


def create_user(email: str, name: str, pw: str) -> dict:
    email = email.strip().lower()
    salt = secrets.token_hex(16)
    with _conn() as c:
        cur = c.execute(
            "INSERT INTO users (email, name, salt, pw_hash, state, created) VALUES (?,?,?,?,?,?)",
            (email, name.strip() or email.split("@")[0], salt, _hash(pw, salt), "{}", time.time()),
        )
        return {"id": cur.lastrowid, "email": email, "name": name.strip() or email.split("@")[0]}


def verify_user(email: str, pw: str) -> dict | None:
    with _conn() as c:
        row = c.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),)).fetchone()
    if not row or not hmac.compare_digest(row["pw_hash"], _hash(pw, row["salt"])):
        return None
    return {"id": row["id"], "email": row["email"], "name": row["name"]}


def get_user(uid: int) -> dict | None:
    with _conn() as c:
        row = c.execute("SELECT id, email, name FROM users WHERE id = ?", (uid,)).fetchone()
    return dict(row) if row else None


def email_exists(email: str) -> bool:
    with _conn() as c:
        return c.execute("SELECT 1 FROM users WHERE email = ?",
                         (email.strip().lower(),)).fetchone() is not None


# ---- saved state -----------------------------------------------------------
def get_state(uid: int) -> dict:
    with _conn() as c:
        row = c.execute("SELECT state FROM users WHERE id = ?", (uid,)).fetchone()
    try:
        return json.loads(row["state"]) if row and row["state"] else {}
    except Exception:
        return {}


def set_state(uid: int, state: dict) -> None:
    with _conn() as c:
        c.execute("UPDATE users SET state = ? WHERE id = ?", (json.dumps(state), uid))


# ---- tokens ----------------------------------------------------------------
def _b64(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).decode().rstrip("=")


def _unb64(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def make_token(uid: int) -> str:
    payload = _b64(json.dumps({"uid": uid, "exp": time.time() + _TTL}).encode())
    sig = _b64(hmac.new(_secret(), payload.encode(), hashlib.sha256).digest())
    return f"{payload}.{sig}"


def verify_token(token: str) -> int | None:
    try:
        payload, sig = token.split(".")
        expected = _b64(hmac.new(_secret(), payload.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(sig, expected):
            return None
        data = json.loads(_unb64(payload))
        if data["exp"] < time.time():
            return None
        return int(data["uid"])
    except Exception:
        return None
