-- profiles.role の CHECK 制約に 'developer' を追加
-- 既存の制約名を確認して DROP → 再作成

DO $$
DECLARE
  constraint_name text;
BEGIN
  -- role カラムの CHECK 制約名を取得
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'profiles'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%role%';

  -- 制約が存在すれば DROP して再作成
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE profiles DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'user', 'developer'));
