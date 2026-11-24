"""SQLite helpers for Shaadi Card."""
import json, sqlite3, time
from pathlib import Path

DB_PATH = Path(__file__).parent / "data" / "shaadi.db"
SCHEMA = """
CREATE TABLE IF NOT EXISTS items(
  id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'video',           -- video | pdf | website | savethedate | card
  occasion TEXT DEFAULT 'wedding', tradition TEXT DEFAULT 'hindu', languages TEXT DEFAULT 'English',
  style TEXT DEFAULT 'Traditional', price INTEGER DEFAULT 0, mrp INTEGER DEFAULT 0, badge TEXT DEFAULT '',
  theme TEXT DEFAULT 't1', vpack TEXT DEFAULT '', preview_video TEXT DEFAULT '', thumb TEXT DEFAULT '',
  images TEXT DEFAULT '[]', description TEXT DEFAULT '', moq INTEGER DEFAULT 0, material TEXT DEFAULT '',
  active INTEGER DEFAULT 1, likes INTEGER DEFAULT 0, sales INTEGER DEFAULT 0, sort INTEGER DEFAULT 100,
  created_at INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT UNIQUE NOT NULL, name TEXT DEFAULT '', created_at INTEGER);
CREATE TABLE IF NOT EXISTS otps(phone TEXT PRIMARY KEY, code TEXT, expires INTEGER, tries INTEGER DEFAULT 0, sent_at TEXT DEFAULT '[]');
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id INTEGER, expires INTEGER);
CREATE TABLE IF NOT EXISTS admin_sessions(token TEXT PRIMARY KEY, expires INTEGER);
CREATE TABLE IF NOT EXISTS invites(id TEXT PRIMARY KEY, user_id INTEGER, item_id INTEGER, owner_token TEXT, data TEXT, created_at INTEGER);
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, item_id INTEGER, invite_id TEXT,
  amount INTEGER, status TEXT DEFAULT 'created', gateway_order_id TEXT DEFAULT '', payment_id TEXT DEFAULT '', created_at INTEGER);
CREATE TABLE IF NOT EXISTS enquiries(id INTEGER PRIMARY KEY AUTOINCREMENT, item_id INTEGER, invite_id TEXT, name TEXT, phone TEXT,
  city TEXT, qty TEXT, note TEXT, status TEXT DEFAULT 'new', created_at INTEGER);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT);
"""
DEFAULT_SETTINGS = {"site_name": "Shaadi Card", "whatsapp": "", "support_email": "", "announcement": "Unlimited edits after purchase · No watermark",
                    "currency": "₹"}


def conn():
    DB_PATH.parent.mkdir(exist_ok=True)
    c = sqlite3.connect(DB_PATH, timeout=15)
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA journal_mode=WAL")
    c.execute("PRAGMA foreign_keys=ON")
    return c


def init():
    with conn() as c:
        c.executescript(SCHEMA)
        for k, v in DEFAULT_SETTINGS.items():
            c.execute("INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)", (k, v))


def q(sql, args=(), one=False):
    with conn() as c:
        cur = c.execute(sql, args)
        rows = [dict(r) for r in cur.fetchall()]
    return (rows[0] if rows else None) if one else rows


def run(sql, args=()):
    with conn() as c:
        cur = c.execute(sql, args)
        return cur.lastrowid


def settings():
    return {r["key"]: r["value"] for r in q("SELECT key,value FROM settings")}


def now():
    return int(time.time())
