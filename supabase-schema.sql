-- Supabase에서 SQL Editor에 붙여넣고 실행하세요

CREATE TABLE IF NOT EXISTS watch_requests (
  id                       BIGSERIAL PRIMARY KEY,
  target_instagram_username VARCHAR(30)  NOT NULL,
  user_instagram_username   VARCHAR(30)  NOT NULL,
  initial_status            VARCHAR(10)  NOT NULL DEFAULT 'unknown',
  current_status            VARCHAR(10)  NOT NULL DEFAULT 'unknown',
  last_checked_at           TIMESTAMPTZ,
  notification_sent         BOOLEAN      NOT NULL DEFAULT FALSE,
  notified_at               TIMESTAMPTZ,
  created_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 인덱스 (검색/필터 성능)
CREATE INDEX IF NOT EXISTS idx_current_status ON watch_requests (current_status);
CREATE INDEX IF NOT EXISTS idx_notification_sent ON watch_requests (notification_sent);
CREATE INDEX IF NOT EXISTS idx_created_at ON watch_requests (created_at DESC);

-- RLS 비활성화 (anon key로 서버에서 직접 접근)
ALTER TABLE watch_requests DISABLE ROW LEVEL SECURITY;
