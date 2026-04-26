# AIエージェント指示書 (CLAUDE.md)

## 1. プロジェクト概要

- **名称**: 不動産空室状況管理アプリ (Web)
- **目的**: 大阪拠点の不動産情報を一般ユーザーへ公開し、閲覧ログを分析する。
- **制約**: **完全無料（Free Tier）**での運用。パフォーマンスとデータ節約を最優先する。

## 2. 技術スタック

- **Frontend**: Next.js 14+ (App Router) / TypeScript / Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (物件画像・チラシ等)
- **Auth**: Supabase Auth (Email/Password)
- **Monitoring/Analytics**: Microsoft Clarity (Project ID: wg7zmfbgva) / GA4 (G-GL5JN0BH2B)
- **Mail/Job**: Resend (Email API) / GitHub Actions (Cron)
- **Test**: Vitest / React Testing Library / MSW

## 3. 基本ルール

### Backend-less Philosophy
サーバーを立てず、Next.js の Server Actions と Supabase RLS で完結させる。

### Zero-Cost Strategy
- 重い集計処理は Supabase Materialized View で行う。
- 大量の閲覧ログは Supabase DB に溜め込まず、Clarity/GA4 に逃がす。
- DB メンテナンスは GitHub Actions の無料枠で実行する。

### Security
- 一般ユーザーは `is_approved: true` かつ `is_active: true` の時のみデータを取得可能。
- 管理者機能は `role: admin` または `role: developer` で制限。
- `createAdminClient()` (service role) を使用し RLS をバイパスしてサーバー側処理を行う。

## 4. データベース設計

### テーブル定義

#### ① properties (物件マスタ)

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | uuid (PK) | 物件の一意識別子 |
| name | text | 物件名 |
| address | text | 所在地 |
| image_paths | text[] | Supabase Storage の画像パス一覧 |
| created_at | timestamptz | 登録日 |

#### ② rooms (部屋詳細)

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | uuid (PK) | 部屋の一意識別子 |
| property_id | uuid (FK) | properties.id への参照 |
| room_number | text | 号室（例：205） |
| rent | integer | 家賃（例：35000） |
| common_fee | integer | 共益費（例：3000） |
| status | text | 状態（'vacant':空室, 'occupied':決定済, 'hidden':非表示） |
| updated_at | timestamptz | 最終更新日 |

#### ③ profiles (ユーザー管理)

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | uuid (PK) | auth.users.id への参照 |
| email | text | メールアドレス |
| company_name | text | 会社名 |
| full_name | text | 氏名 |
| phone_number | text | 電話番号 |
| role | text | 'admin' / 'developer' / 'user' |
| is_approved | boolean | 管理者承認フラグ（初期値 false） |
| is_active | boolean | ログイン許可フラグ（初期値 true） |
| created_at | timestamptz | ユーザー登録日 |
| updated_at | timestamptz | 更新日 |
| approval_date | timestamptz | 承認日時（監査用） |
| admin_notes | text | 管理者メモ |
| last_login_at | timestamptz | 最終ログイン日時 |

#### ④ view_logs (閲覧ログ)

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | bigint (PK) | ログID |
| user_id | uuid (FK) | profiles.id への参照 |
| room_id | uuid (FK) | rooms.id への参照 |
| viewed_at | timestamptz | 閲覧日時（default: now()） |

#### ⑤ system_settings (システム設定)

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | int (PK) | 固定値 1 |
| users_login_enabled | boolean | 全ユーザーのログイン許可フラグ |
| notify_users_on_property_change | boolean | 物件変更時の通知フラグ |
| updated_at | timestamptz | 更新日 |

### パフォーマンス対策と運用

#### Materialized View（集計済みビュー）
```sql
CREATE MATERIALIZED VIEW daily_room_stats AS
SELECT
  room_id,
  DATE(viewed_at) AS view_date,
  count(*) AS daily_count
FROM view_logs
GROUP BY room_id, view_date;

CREATE UNIQUE INDEX idx_daily_room_stats_room_date
  ON daily_room_stats (room_id, view_date);
```

**運用**: GitHub Actions から毎日 02:00 UTC に Supabase REST API 経由で更新。
SQL は `refresh_daily_stats()` PostgreSQL 関数としてラップ済み。

#### view_logs の定期パージ
Free Tier の 500MB 制限を維持するため、3ヶ月以上前のログを削除。

**運用**: GitHub Actions から毎日 02:10 UTC に実行。
SQL は `purge_old_view_logs()` PostgreSQL 関数としてラップ済み。

#### インデックス戦略
```sql
CREATE INDEX idx_view_logs_room_at ON view_logs (room_id, viewed_at);
CREATE INDEX idx_profiles_is_approved ON profiles(is_approved);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_property_id ON rooms(property_id);
```

### Row Level Security (RLS) ポリシー

#### 一般ユーザーの制限
```sql
CREATE POLICY "Only approved users see visible rooms"
ON rooms FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_approved = true
  ) AND status != 'hidden'
);
```

#### 管理者の全操作許可
```sql
CREATE POLICY "Admins unrestricted"
ON rooms FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## 5. フォルダ構造とコーディング規約

| パス | 説明 |
|------|------|
| `src/app/(auth)/` | 認証画面（login, signup, pending, reset-password） |
| `src/app/(user)/` | 一般ユーザー画面（properties, profile） |
| `src/app/(admin)/admin/` | 管理者画面（dashboard, properties, users, settings） |
| `src/app/actions/` | Server Actions（auth, properties, users, settings, viewLog 等） |
| `src/components/user/` | 一般ユーザー用コンポーネント |
| `src/components/admin/` | 管理者用コンポーネント |
| `src/components/analytics/` | Clarity / GA4 連携コンポーネント |
| `src/components/ui/` | 共通 UI コンポーネント |
| `src/utils/` | ビジネスロジック・ユーティリティ |
| `src/lib/supabase/` | Supabase クライアント設定（server / admin） |
| `src/lib/mailer.ts` | メール送信クライアント（Resend） |
| `src/lib/email/` | メールテンプレート |
| `supabase/migrations/` | DB マイグレーション SQL |
| `.github/workflows/` | GitHub Actions ワークフロー |

## 6. 特定の実装フロー

### ユーザー承認フロー
1. サインアップ（初期状態 `is_approved: false`）
2. 管理者へ通知メール送信（Resend）
3. 管理画面 `/admin/users` で承認・ロール選択（admin / developer / user）
4. 承認後 `profiles.is_approved = true` に更新 → ユーザーへ通知メール送信
5. RLS ポリシーによりデータ取得許可

### ロール体系
| ロール | 説明 |
|--------|------|
| admin | 全機能利用可。ユーザー管理・物件管理・設定変更すべて可能 |
| developer | 管理画面の閲覧のみ可。設定変更・ユーザー操作不可 |
| user | 一般ユーザー。承認済みの場合のみ物件閲覧可能 |

### 閲覧データ計測
- `ViewLogger` コンポーネントが物件詳細ページ表示時に `view_logs` へ自動保存
- `ClarityIdentify` コンポーネントがログイン済みユーザーのメールを `clarity('identify', email)` で紐付け
- GA4 はルートレイアウトに `gtag.js` を読み込み全ページのページビューを計測

### GitHub Actions DB メンテナンス
psql ではなく Supabase REST API（curl）経由で PostgreSQL 関数を呼び出す。

必要な GitHub Secrets:
- `SUPABASE_URL`: `https://[PROJECT_ID].supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase の service_role キー

## 7. テスト方針

- **Business Logic**: `src/utils` のロジックはカバレッジ 100% を目指す。
- **Component**: ユーザーのインタラクション（ボタンクリック等）を中心にテスト。
- **API Mocking**: MSW を使用して Supabase のレスポンスをモックする。

## 8. 画面設計

### デザイン方針
- **モバイルファースト**: 不動産業者の外出先スマホ利用を想定。
- **清潔感のある UI**: 空室状況がひと目で分かるレイアウト。
- **Tailwind CSS** で実装。全入力フィールドは `text-base`（16px）以上（iOS Safari ズーム防止）。

---

### 一般ユーザー用画面

#### 物件・空室一覧ページ (`/properties`)
| エリア | 内容 |
|--------|------|
| ヘッダー | ロゴ（AkiNavi）、会社名/メール（クリックで /profile へ）、ログアウトボタン |
| 物件カード | 物件写真、物件名・所在地、空室バッジ（例：「2部屋空き」） |
| 部屋リスト | アコーディオン形式。号室 / 家賃 / 共益費。色分け：空室（緑）/ 入居者決定（グレー） |

#### 物件詳細ページ (`/properties/[id]`)
| エリア | 内容 |
|--------|------|
| 画像スライダー | チラシ・物件画像をスライド表示 |
| 部屋一覧テーブル | 号室 / 家賃 / 共益費 / 状態 |
| 問い合わせボタン | 管理者の電話番号・メールアドレスを DB から取得して表示 |

#### プロフィールページ (`/profile`)
| エリア | 内容 |
|--------|------|
| プロフィール編集 | 氏名・会社名・電話番号を変更可能 |
| メールアドレス | 読み取り専用（変更は管理者へ依頼） |
| パスワード変更 | 確認フィールド入力時のみ処理（自動補完誤検知防止） |

---

### 管理者用画面

#### ダッシュボード (`/admin`)
| エリア | 内容 |
|--------|------|
| サマリーカード | 今日の閲覧数 / 承認待ちユーザー数 / 現在の空室合計 |
| トレンドグラフ (Recharts) | 日別の総閲覧数推移（折れ線グラフ） |
| 人気ランキング (Recharts) | 物件・部屋別の閲覧数（棒グラフ） |

#### ユーザー承認管理ページ (`/admin/users`)
| エリア | 内容 |
|--------|------|
| 承認待ちリスト | 会社名 / 氏名 / 登録日 / admin_notes 入力欄 |
| 承認アクション | ロール選択（admin / developer / user）して承認 / 拒否 |
| 承認済みユーザー | ログイン停止・再開 / ロール変更 / 削除 |
| 全体ログイン制御 | 全ユーザーのログインを一括停止・再開（admin のみ） |
| CSV出力 | ユーザー一覧を CSV でエクスポート |

#### 物件管理ページ (`/admin/properties`)
| エリア | 内容 |
|--------|------|
| 物件一覧 | 物件名・所在地・空室数・編集/削除ボタン |
| 物件登録 | `/admin/properties/new` |
| 物件編集 | `/admin/properties/[id]/edit` |

#### 物件・部屋編集ページ (`/admin/properties/[id]/edit`)
| エリア | 内容 |
|--------|------|
| 物件情報 | 物件名・所在地 |
| 画像アップロード | ドラッグ＆ドロップ → Supabase Storage へ保存 |
| 部屋一括編集 | 号室・家賃・共益費・状態をテーブル形式で編集 |

#### 設定ページ (`/admin/settings`)
| エリア | 内容 |
|--------|------|
| プロフィール | 氏名・会社名・電話番号・メールアドレス変更 |
| パスワード変更 | 新しいパスワード入力（空欄で変更なし） |

---

### 共通：認証画面

#### ログイン (`/login`)
- メールアドレス + パスワード

#### サインアップ (`/signup`)
- 必須項目: メールアドレス / パスワード / 会社名 / 氏名
- 登録後は `is_approved: false` で承認待ち状態へ遷移

#### 承認待ち画面 (`/pending`)
- 承認前はその他の操作をロック

#### パスワードリセット (`/reset-password`)
- メールアドレス入力 → リセットメール送信

---

## 9. 開発ロードマップ（完了）

| Day | タスク | 状態 |
|-----|--------|------|
| Day 1-2 | Supabase プロジェクト作成。テーブル・インデックス・RLS の作成 | ✅ |
| Day 3 | Next.js プロジェクト初期化（Vitest, Tailwind 設定） | ✅ |
| Day 4-5 | サインアップ・ログイン機能・承認待ち画面の実装 | ✅ |
| Day 6-7 | 管理者用ログインと初期シードデータの投入 | ✅ |
| Day 8-9 | 物件一覧・登録・編集画面（Admin）の実装 | ✅ |
| Day 10-11 | Supabase Storage を使用したチラシ画像アップロード機能 | ✅ |
| Day 12-13 | ユーザー承認管理画面の実装 | ✅ |
| Day 14 | 管理者への承認依頼メール通知（Resend）の設定 | ✅ |
| Day 15-17 | 物件一覧・詳細画面（User）の実装 | ✅ |
| Day 18-19 | 閲覧ログ（view_logs）の自動保存処理の実装 | ✅ |
| Day 20 | Microsoft Clarity / GA4 の導入と identify の紐付け | ✅ |
| Day 21 | 内部テスト | ✅ |
| Day 22-23 | 管理者ダッシュボード（Recharts）による閲覧数グラフ化 | ✅ |
| Day 24 | Materialized View の作成と GitHub Actions による更新バッチ | ✅ |
| Day 25 | 3ヶ月前ログの自動削除バッチ（パージ） | ✅ |

---

## 10. CI/CD と自動化

### GitHub Actions スケジュール（`.github/workflows/db-maintenance.yml`）

- **02:00 UTC**: `refresh_daily_stats()` 関数を呼び出し Materialized View を更新
- **02:10 UTC**: `purge_old_view_logs()` 関数を呼び出し 3ヶ月以上前の view_logs を削除

接続方式: psql ではなく **Supabase REST API（curl）** を使用。
直接 DB 接続は Free Tier で IPv6 問題があるため。

必要な GitHub Secrets:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 無料枠運用のポイント
- Supabase RLS により DB レベルでデータ制限を厳密に管理
- Materialized View で複雑な集計処理をオフロード
- GitHub Actions 無料枠を活用した定期タスク実行
- Clarity / GA4 でログ分析コストを削減
- 定期パージで 500MB ストレージ制限を物理的に回避
