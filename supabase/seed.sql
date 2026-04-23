-- ============================================================
-- AkiNavi 初期シードデータ
-- 実行方法: Supabase ダッシュボード > SQL Editor で実行
-- ============================================================

-- ① 管理者ユーザーの profiles 登録
-- 前提: Supabase Auth にて admin@example.com のユーザーを先に作成し、
--       その UUID を下記 <ADMIN_USER_UUID> に置き換えて実行してください。

INSERT INTO profiles (
  id,
  email,
  company_name,
  full_name,
  role,
  is_approved,
  created_at,
  updated_at,
  approval_date
)
VALUES (
  '<ADMIN_USER_UUID>',     -- Supabase Auth のユーザー ID に差し替える
  'admin@example.com',     -- 管理者メールアドレス
  '管理会社',
  '管理者',
  'admin',
  true,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
  SET role        = EXCLUDED.role,
      is_approved = EXCLUDED.is_approved,
      updated_at  = NOW();


-- ② サンプル物件データ（動作確認用）
INSERT INTO properties (id, name, address, created_at)
VALUES
  (gen_random_uuid(), 'ホワイトハウス平野', '大阪市平野区平野本町1-1-1', NOW()),
  (gen_random_uuid(), 'グリーンマンション都島', '大阪市都島区都島本通2-2-2', NOW())
ON CONFLICT DO NOTHING;


-- ③ サンプル部屋データ（上記物件の ID を使用）
-- ※ 実行後に properties テーブルから ID を確認して追加する場合は個別に INSERT する

-- 例: 以下は手動で確認した property_id に差し替えて使用
-- INSERT INTO rooms (id, property_id, room_number, rent, common_fee, status, updated_at)
-- VALUES
--   (gen_random_uuid(), '<PROPERTY_UUID>', '101', 35000, 3000, 'vacant',   NOW()),
--   (gen_random_uuid(), '<PROPERTY_UUID>', '102', 38000, 3000, 'occupied', NOW()),
--   (gen_random_uuid(), '<PROPERTY_UUID>', '201', 40000, 3000, 'vacant',   NOW());
