-- ============================================================
-- Migration 003: ユーザー停止機能
-- 実行方法: Supabase ダッシュボード > SQL Editor で実行
-- ============================================================

-- profiles に is_active カラムを追加
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- システム設定テーブル（全ユーザーログイン制御など）
CREATE TABLE IF NOT EXISTS system_settings (
  id integer PRIMARY KEY DEFAULT 1,
  users_login_enabled boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- 初期レコードを挿入（存在しない場合のみ）
INSERT INTO system_settings (id, users_login_enabled)
VALUES (1, true)
ON CONFLICT (id) DO NOTHING;
