-- Whole state document (one row, id 'main'). Phone numbers live only here.
CREATE TABLE IF NOT EXISTS app_state (
  id TEXT PRIMARY KEY,
  json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1
);

-- Append-only copy of the activity feed. Never holds phone numbers.
CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  at TEXT NOT NULL,
  text TEXT NOT NULL,
  kind TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS activity_log_at ON activity_log (at);
