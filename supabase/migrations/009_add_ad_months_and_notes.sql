-- 広告料・備考カラムを rooms テーブルに追加
ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS ad_months numeric CHECK (ad_months IN (1, 1.5, 2, 2.5, 3)),
  ADD COLUMN IF NOT EXISTS notes text;

-- 物件単位の備考カラムを properties テーブルに追加
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS notes text;
