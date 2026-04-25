-- ============================================================
-- Migration 002: profiles テーブルに phone_number カラムを追加
-- 実行方法: Supabase ダッシュボード > SQL Editor で実行
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone_number text DEFAULT NULL;
