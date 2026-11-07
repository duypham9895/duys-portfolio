-- Cloudflare D1 schema for referral & resume download tracking
-- Create DB: npx wrangler d1 create portfolio-referrals
-- Apply:     npx wrangler d1 execute portfolio-referrals --remote --file=workers/referral-tracker/schema.sql

CREATE TABLE IF NOT EXISTS referral_hits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT,                -- 6-hex visitor tag from IP + UA (e.g. '#7F3A9C')
  channel TEXT NOT NULL,          -- 'cv' | 'in' | 'gh' | 'resume_pdf' | 'home' | 'labs' | 'page'
  path TEXT NOT NULL,             -- '/cv', '/in', '/gh', '/resume.pdf', '/', '/labs'
  country TEXT,                   -- ISO country code from request.cf.country (e.g. 'VN', 'SG', 'ID')
  city TEXT,                      -- City from request.cf.city
  region TEXT,                    -- Region from request.cf.region
  asn_org TEXT,                   -- ISP / Company network from request.cf.asOrganization
  language TEXT,                  -- Top Accept-Language tags (e.g. 'vi-VN, vi, en-US')
  referer TEXT,
  user_agent TEXT,
  is_bot INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_referral_hits_channel_date
  ON referral_hits (channel, is_bot, created_at DESC);
