-- Cloudflare D1 schema for duypham.me referral & traffic tracker
-- Initialize locally:  npx wrangler d1 execute portfolio-referrals --local --file=workers/referral-tracker/schema.sql
-- Initialize remotely: npx wrangler d1 execute portfolio-referrals --remote --file=workers/referral-tracker/schema.sql

CREATE TABLE IF NOT EXISTS referral_hits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT,
  channel TEXT NOT NULL,
  path TEXT NOT NULL,
  country TEXT,
  city TEXT,
  region TEXT,
  asn_org TEXT,
  language TEXT,
  referer TEXT,
  user_agent TEXT,
  is_bot INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_referral_hits_channel_created
  ON referral_hits (channel, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_referral_hits_created
  ON referral_hits (created_at DESC);

CREATE TABLE IF NOT EXISTS radar_mutes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  value TEXT NOT NULL UNIQUE,
  note TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS radar_otps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code_hash TEXT NOT NULL,
  ip TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS radar_sessions (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  user_agent TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
