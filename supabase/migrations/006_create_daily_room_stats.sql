-- 日別部屋閲覧数の集計ビュー
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_room_stats AS
SELECT
  room_id,
  DATE(viewed_at) AS view_date,
  count(*) AS daily_count
FROM view_logs
GROUP BY room_id, view_date;

-- 高速リフレッシュ用のユニークインデックス
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_room_stats_room_date
  ON daily_room_stats (room_id, view_date);
