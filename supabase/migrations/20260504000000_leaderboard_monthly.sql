-- leaderboard_monthly: 월별 사용자 순위 기록
CREATE TABLE IF NOT EXISTS leaderboard_monthly (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname      text NOT NULL DEFAULT '익명',
  photo         text DEFAULT '🥑',
  photo_uri     text,
  streak        int  NOT NULL DEFAULT 0,
  monthly_coins int  NOT NULL DEFAULT 0,
  month         text NOT NULL,              -- 'YYYY-MM' 형식
  updated_at    timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);

-- Row Level Security
ALTER TABLE leaderboard_monthly ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있음 (순위 조회)
CREATE POLICY "Anyone can read leaderboard"
  ON leaderboard_monthly FOR SELECT
  USING (true);

-- 본인 행만 insert 가능
CREATE POLICY "Users can insert own row"
  ON leaderboard_monthly FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 본인 행만 update 가능
CREATE POLICY "Users can update own row"
  ON leaderboard_monthly FOR UPDATE
  USING (auth.uid() = user_id);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_leaderboard_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leaderboard_updated_at
  BEFORE UPDATE ON leaderboard_monthly
  FOR EACH ROW EXECUTE FUNCTION update_leaderboard_updated_at();
