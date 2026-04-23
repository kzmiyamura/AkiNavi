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
- **Monitoring/Analytics**: Microsoft Clarity / GA4 (Log storage reduction strategy)
- **Mail/Job**: Resend (Email API) / GitHub Actions (Cron)
- **Test**: Vitest / React Testing Library / MSW

## 3. 基本ルール

### Backend-less Philosophy
サーバーを立てず、Next.js の Server Actions と Supabase RLS で完結させる。

### Zero-Cost Strategy
- 重い集計処理は Supabase View または Materialized View で行う。
- 大量の閲覧ログは Supabase DB に溜め込まず、Clarity/GA4 に逃がす。
- 承認リマインド等は GitHub Actions の無料枠で実行する。

### Security
- 一般ユーザーは `is_approved: true` の時のみデータを取得可能。
- 管理者機能は `role: admin` または特定のメールアドレスで制限。

## 4. データベース設計

### テーブル定義

#### ① properties (物件マスタ)
物件の基本情報を保持します。

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | uuid (PK) | 物件の一意識別子 |
| name | text | 物件名（例：ホワイトハウス平野） |
| address | text | 所在地 |
| created_at | timestamptz | 登録日 |

#### ② rooms (部屋詳細)
号室ごとの情報を保持します。properties と 1:N の関係です。

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
一般ユーザーと管理者の権限、承認状態を管理します。

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | uuid (PK) | auth.users.id への参照 |
| email | text | メールアドレス |
| company_name | text | 会社名（承認時に確認する項目） |
| full_name | text | 氏名 |
| role | text | 'admin' or 'user' |
| is_approved | boolean | 管理者承認フラグ（初期値 false） |
| created_at | timestamptz | ユーザー登録日 |
| updated_at | timestamptz | 更新日 |
| approval_date | timestamptz | 承認日時（監査用） |
| admin_notes | text | 承認/却下時のメモ |
| last_login_at | timestamptz | 最終ログイン日時 |

#### ④ view_logs (閲覧ログ)
閲覧回数や「誰が何を見たか」を記録します。

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | bigint (PK) | ログID |
| user_id | uuid (FK) | profiles.id への参照 |
| room_id | uuid (FK) | rooms.id への参照 |
| viewed_at | timestamptz | 閲覧日時（default: now()） |

### パフォーマンス対策と運用

#### Materialized View（集計済みビュー）
```sql
CREATE MATERIALIZED VIEW daily_room_stats AS
SELECT 
  room_id,
  DATE(viewed_at) as view_date,
  count(*) as daily_count
FROM view_logs
GROUP BY room_id, view_date;
```

**運用**: GitHub Actions から毎日深夜（2:00 UTC）に以下を実行：
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_room_stats;
```

#### view_logs の定期パージ設定
Free Tier の 500MB 制限を維持するため、3ヶ月以上前のログを削除します。

**GitHub Actions タスク（毎日 2:10 UTC）:**
```sql
DELETE FROM view_logs 
WHERE viewed_at < NOW() - INTERVAL '3 months';
```

#### インデックス戦略
```sql
CREATE INDEX idx_view_logs_room_at ON view_logs (room_id, viewed_at);
CREATE INDEX idx_profiles_is_approved ON profiles(is_approved);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_property_id ON rooms(property_id);
```

### 初期データ設定（seed.sql）

```sql
INSERT INTO profiles (id, email, company_name, full_name, role, is_approved, created_at, approval_date)
VALUES (
  '<admin-user-id>',
  'admin@example.com',
  'Admin Company',
  'Admin User',
  'admin',
  true,
  NOW(),
  NOW()
);
```

**運用**: `supabase/seed.sql` に記述し、`supabase db push` 時に自動実行。

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
| `src/app/` | App Router。ページごとに `page.tsx` を配置。 |
| `src/components/` | 再利用可能な UI コンポーネント。インタラクションテストを Vitest + RTL で記述。 |
| `src/utils/` | ビジネスロジック。ユニットテストを Vitest で記述。 |
| `src/lib/supabase/` | Supabase クライアント設定（Server用/Client用）。 |

## 6. 特定の実装フロー

### ユーザー承認フロー
1. サインアップ（初期状態 `is_approved: false`）
2. Supabase Trigger -> Edge Functions -> Resend で管理者に通知。
3. 管理画面で承認後、`profiles.is_approved = true` に更新。
4. RLS ポリシーによりログイン許可。

### 閲覧データ計測
- ページ遷移時に `window.clarity("identify", user.email)` を実行。
- 重要なクリックイベントは GA4 / PostHog にカスタムイベントとして送信。
- view_logs は一定期間保管後、削除可能。

## 7. テスト方針

- **Business Logic**: `src/utils` のロジックはカバレッジ 100% を目指す。
- **Component**: ユーザーのインタラクション（ボタンクリック等）を中心にテスト。
- **API Mocking**: MSW を使用して Supabase のレスポンスをモックする。

## 8. 画面設計

### デザイン方針
- **モバイルファースト**: 不動産業者の外出先スマホ利用を想定。表形式よりカード形式を優先。
- **清潔感のある UI**: 空室状況がひと目で分かるレイアウト。
- **Tailwind CSS** で実装。

---

### 一般ユーザー用画面

#### 物件・空室一覧ページ (`/properties`)
| エリア | 内容 |
|--------|------|
| ヘッダー | ロゴ（AkiNavi）、ユーザー名、ログアウトボタン |
| 検索・フィルタ | 物件名検索、エリア選択、家賃上限クイックフィルタ |
| 物件カード (Grid) | 物件写真（Supabase Storage）、物件名・所在地、ステータスバッジ（例：「2部屋空き」） |
| 部屋リスト | アコーディオン形式。号室 / 家賃 / 共益費。色分け：空室（緑）/ 入居者決定（グレー） |

#### 物件詳細モーダル/ページ (`/properties/[id]`)
| エリア | 内容 |
|--------|------|
| 画像スライダー | チラシ全体画像・部屋写真を大きく表示 |
| 詳細スペック | 所在地、築年数（任意）、周辺環境メモ |
| 問い合わせボタン | 管理者へ直接電話 or メール起動。アクション自体も閲覧ログとして計測。 |

---

### 管理者用画面

#### ダッシュボード (`/admin`)
| エリア | 内容 |
|--------|------|
| サマリーカード | 今日の閲覧数 / 承認待ちユーザー数 / 現在の空室合計 |
| トレンドグラフ (Recharts) | 日別の総閲覧数推移（折れ線グラフ） |
| 人気ランキング (Recharts) | 物件・部屋別の閲覧数（棒グラフ） |
| ユーザー別アクティビティ | 「誰が」「いつ」「何を見たか」をリスト表示。Clarity の操作録画へのリンクも配置。 |

#### ユーザー承認管理ページ (`/admin/users`)
| エリア | 内容 |
|--------|------|
| 未承認リスト | 会社名 / 氏名 / 登録日 / admin_notes 入力欄 |
| アクション | 承認ボタン（緑）/ 拒否ボタン（赤） |
| 承認時の処理 | `approval_date` を記録 → Resend でユーザーへ通知メール送信 |

#### 物件・部屋編集ページ (`/admin/properties/[id]/edit`)
| エリア | 内容 |
|--------|------|
| 一括編集フォーム | 1物件に対して複数部屋（号室・家賃・状態）をスプレッドシート感覚で入力・更新 |
| 画像アップロード | ドラッグ＆ドロップでチラシ画像をアップロード → Supabase Storage へ保存 |

---

### 共通：認証画面

#### ログイン (`/login`)
- メールアドレス + パスワード

#### サインアップ (`/signup`)
- 必須項目: メールアドレス / パスワード / **会社名** / **氏名**
- 登録後は `is_approved: false` で承認待ち状態へ遷移

#### 承認待ち画面 (`/pending`)
- メッセージ: 「現在管理者が確認中です。承認まで1〜2営業日お待ちください」
- 承認前はその他の操作をロック

#### パスワードリセット (`/reset-password`)
- 「忘れた方はこちら」からメール送信画面へ

---

### UI/UX 共通の工夫

| 要素 | 実装方針 |
|------|----------|
| スケルトン・ローディング | Next.js `Suspense` + スケルトン UI でレイアウト崩れを防止 |
| トースト通知 | 承認完了・物件更新時に画面端へふわっと「保存しました」を表示 |
| レスポンシブ | モバイルファースト。カード形式を基本に、タブレット以上でグリッドを拡張 |

---

## 9. 開発ロードマップ（目安：3〜4週間）

### 第1週：インフラ構築 & 認証基盤
| Day | タスク |
|-----|--------|
| Day 1-2 | Supabase プロジェクト作成。テーブル・インデックス・RLS の作成。✅ |
| Day 3 | Next.js プロジェクト初期化（Vitest, Tailwind 設定）。✅ |
| Day 4-5 | サインアップ・ログイン機能の実装。`is_approved` フラグによる承認待ち画面の制御。 |
| Day 6-7 | 管理者用ログインと、初期シードデータの投入確認。 |

### 第2週：管理画面 & 物件登録機能（MVP完了）
| Day | タスク |
|-----|--------|
| Day 8-9 | 物件一覧・登録・編集画面（Admin）の実装。 |
| Day 10-11 | Supabase Storage を使用したチラシ画像アップロード機能の実装。 |
| Day 12-13 | ユーザー承認管理画面（一覧・承認/拒否ボタン）の実装。 |
| Day 14 | 管理者への承認依頼メール通知（Resend）の設定。 |

### 第3週：一般ユーザー画面 & 計測の実装
| Day | タスク |
|-----|--------|
| Day 15-17 | 物件一覧・詳細画面（User）の実装。アコーディオン形式での空室表示。 |
| Day 18-19 | 閲覧ログ（`view_logs`）の自動保存処理の実装。 |
| Day 20 | Microsoft Clarity / GA4 の導入と `identify` の紐付け。 |
| Day 21 | 内部テスト（管理者で登録した物件が、承認済みユーザーで見えるか確認）。 |

### 第4週：統計機能 & 自動化（運用フェーズ）
| Day | タスク |
|-----|--------|
| Day 22-23 | 管理者ダッシュボード（Recharts）による閲覧数グラフ化。 |
| Day 24 | Materialized View の作成と、GitHub Actions による更新バッチの設定。 |
| Day 25 | 3ヶ月前ログの自動削除バッチ（パージ）の設定。 |
| Day 26-28 | 予備日・バグ修正・ドキュメント（運用マニュアル）作成。 |

### 並行タスク（開発外）
| 項目 | 内容 |
|------|------|
| ドメイン取得 | `akinavi.app` や `akinavi.io` などの確保 |
| Resend 設定 | 独自ドメインでのメール送信設定（DNS 認証） |
| 初期物件データ準備 | 物件情報を CSV にまとめておき、一括インポートに備える |

---

## 10. CI/CD と自動化

### GitHub Actions スケジュール
- **02:00 UTC**: Materialized View を更新
  ```sql
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_room_stats;
  ```

- **02:10 UTC**: 3ヶ月以上前の view_logs を削除
  ```sql
  DELETE FROM view_logs WHERE viewed_at < NOW() - INTERVAL '3 months';
  ```

- **プルリクエスト時**: Vitest を実行

### 無料枠運用のポイント
- Supabase RLS により、DB レベルでデータ制限を厳密に管理
- Materialized View で複雑な集計処理をオフロード
- GitHub Actions 無料枠を活用した定期タスク実行
- Clarity / GA4 でログ分析コストを削減
- 定期パージで 500MB ストレージ制限を物理的に回避
