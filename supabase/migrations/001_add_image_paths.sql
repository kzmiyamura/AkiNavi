-- ============================================================
-- Migration 001: properties テーブルに image_paths カラムを追加
-- 実行方法: Supabase ダッシュボード > SQL Editor で実行
-- ============================================================

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS image_paths text[] DEFAULT '{}';


-- ============================================================
-- Supabase Storage: property-images バケット設定
-- ダッシュボードの「Storage > New bucket」からも作成可能
-- ============================================================

-- バケット作成 (すでに存在する場合はスキップ)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- Storage RLS ポリシー
-- ============================================================

-- 一般ユーザー含む全員が読み取り可（公開バケット）
CREATE POLICY "Public read property images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

-- 管理者のみアップロード可
CREATE POLICY "Admin upload property images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-images'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 管理者のみ削除可
CREATE POLICY "Admin delete property images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-images'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
