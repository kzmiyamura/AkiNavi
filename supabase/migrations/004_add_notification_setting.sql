-- ============================================================
-- Migration 004: system_settings に物件変更通知フラグを追加
-- 実行方法: Supabase ダッシュボード > SQL Editor で実行
-- ============================================================

ALTER TABLE system_settings
  ADD COLUMN IF NOT EXISTS notify_users_on_property_change boolean DEFAULT false;
