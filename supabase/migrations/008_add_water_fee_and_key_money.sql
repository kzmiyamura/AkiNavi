-- 水道代と礼金カラムを rooms テーブルに追加
ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS water_fee_type text CHECK (water_fee_type IN ('fixed', 'meter')),
  ADD COLUMN IF NOT EXISTS water_fee_amount integer,
  ADD COLUMN IF NOT EXISTS key_money integer;
