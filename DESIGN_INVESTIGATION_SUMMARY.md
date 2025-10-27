# 📊 チビックシステム - BI機能設計のための調査結果サマリー

**調査日:** 2025年10月25日  
**調査者:** Claude (Cursor AI)  
**対象:** チビックシステムの既存コードベース  
**目的:** 経営コックピット（BI機能）の完全設計書作成

---

## 🎯 調査の結論（エグゼクティブサマリー）

### 主要な発見事項

1. **データソースは既に存在している** ✅
   - 売上・予算・原価・人件費の全データが`chibic` DBに格納済み
   - 追加のDBテーブル作成は**不要**
   
2. **技術スタックは統一されている** ✅
   - バックエンド: Laravel (PHP 8.x)
   - フロントエンド: Next.js + TypeScript (モノレポ)
   - API: RESTful + OpenAPI 3.0定義
   
3. **バッチ処理の仕組みが存在** ✅
   - 夜間バッチで売上・原価・人件費を集計
   - `costs_batch.php`, `sales_management_batch.php`等
   
4. **権限管理の仕組みが確立** ✅
   - master（経営者）/ staff（店長）の2階層
   - `m_master_staff_store`テーブルで店舗紐付け

---

## 📊 調査結果の詳細

### 1. データベーステーブル構造

#### 1.1 売上関連テーブル（store-main/chibic DB）

| テーブル名 | 用途 | 主要カラム | 更新頻度 |
|-----------|------|-----------|---------|
| **m_management_sales** | 日別売上実績 | `business_date`, `total_amount`, `customers`, `pairs` | 日次バッチ |
| **m_management_budget** | 月間予算 | `target_yearmonth`, `budget_amount`, `rate_food`, `rate_labor` | 手動登録 |
| **m_management_budget_daily** | 日別予算 | `date`, `budget_amount`, `is_holiday` | 手動登録 |
| **m_management_sales_mode** | モード別売上 | `mode_id`, `customers`, `total_amount` | 日次バッチ |
| **m_register_table_info_cum** | 伝票累計 | `account_no`, `people`, `total_amount` | リアルタイム |

**重要な発見:**
- `reservation_extras.total_bill`には予約時の売上が格納されている
- 実際の会計データは`m_register_table_info_cum`（レジシステム）
- **2つのデータソースを統合する必要がある**

#### 1.2 原価関連テーブル（store-main/chibic DB）

| テーブル名 | 用途 | 主要カラム | 更新頻度 |
|-----------|------|-----------|---------|
| **m_management_food** | 食材原価 | `delivery_date`, `price`, `tax_price`, `category` | 日次バッチ |
| **m_management_food_upd_informart** | Infomart連携データ | `data_kind`, `lesaler_id`, `price` | 外部API |

**バッチ処理:**
- `purchase_batch.php`: 仕入データをInfomartから取得し、`m_management_food`に集計
- カテゴリ別（1-9）に原価を分類

#### 1.3 人件費関連テーブル（store-main/chibic DB + time_and_attendance DB）

| テーブル名 | 用途 | 主要カラム | 更新頻度 |
|-----------|------|-----------|---------|
| **m_management_labor** | 人件費実績 | `business_day`, `cost`, `work_time`, `over_time` | 日次バッチ |
| **m_management_labor_etc** | その他人件費 | `target_day`, `cost`, `num_of_people` | 手動登録 |
| **wk_download** | 人件費計算結果 | `business_day`, `employee_id`, `cost`, `salary` | 勤怠システム連携 |
| **m_attendance_worktable** | 勤務実績 | `clock_in`, `clock_out`, `work_time`, `break_time` | リアルタイム |
| **m_attendance_salary** | 給与マスタ | `salary`, `allowance`, `salary_unit` | マスタ管理 |

**バッチ処理:**
- `costs_batch.php`: 勤怠システムから人件費データを取得し、`m_management_labor`に集計
- `wk_download`テーブルから日次でコスト計算

#### 1.4 店舗・マスタテーブル

| テーブル名 | 用途 | 主要カラム | データベース |
|-----------|------|-----------|-------------|
| **m_store** | 店舗マスタ | `store_id`, `store_name`, `master_id`, `fc_kbn` | chibic (PRIMARY) |
| **m_master** | マスターユーザー | `id`, `name`, `d_name` | chibic (PRIMARY) |
| **m_master_staff** | スタッフマスタ | `staff_id`, `name`, `master_id` | chibic (PRIMARY) |
| **m_master_staff_store** | スタッフ店舗紐付け | `staff_id`, `store_id`, `master_id` | chibic (PRIMARY) |

**重要な発見:**
- `fc_kbn`: フランチャイズ区分（'1'=直営、'2'=FC）
- `fc_owner`: FC本部のmaster_id
- 権限管理は`m_master_staff_store`で実現

---

### 2. 既存APIアーキテクチャ

#### 2.1 バックエンド構成

| リポジトリ | 技術スタック | 用途 | API形式 |
|-----------|-------------|------|---------|
| **store-main** | PHP 7.x (生PHP) | 店舗管理・レジ・発注 | なし（画面直結） |
| **reservation-develop** | Laravel 11 + PHP 8.3 | 予約管理 | RESTful（未実装） |
| **time_and_attendance-develop** | Laravel 11 + PHP 8.3 | 勤怠管理 | RESTful + OpenAPI 3.0 |
| **auth-develop** | Laravel 11 + PHP 8.3 | 認証基盤 | Session based |

**重要な発見:**
- **store-mainは生PHPで実装されており、APIが存在しない**
- Laravel系システムは新規開発（2024-2025年）
- **BI機能のAPIは新規作成が必要**

#### 2.2 認証・権限の仕組み

**認証方式:**
```php
// auth-develop/app/Support/SharedAuth
// セッションベース認証
// Cookieで既存PHPシステムと連携
```

**ロール構造:**
- `master` (経営者): 全店舗データ閲覧可能
- `staff` (店長・エリアマネージャー): 紐付け店舗のみ閲覧可能

**権限チェック実装例:**
```php
// store-main/docs/store/management/labor.php:81-96
if ($_SESSION['authority'] == 'master') {
    // 全店舗データ取得
} else {
    // m_master_staff_store JOIN で紐付け店舗のみ
}
```

---

### 3. フロントエンド技術スタック（tna_front-develop）

#### 3.1 技術構成

```
技術スタック:
├── Next.js (App Router)
├── TypeScript 5.x
├── pnpm workspace (モノレポ)
├── Tailwind CSS
├── @lingui (多言語対応)
├── dayjs (日付処理)
└── TanStack Query (データフェッチ）
```

#### 3.2 パッケージ構成

```
packages/
├── api-client/      # APIクライアント自動生成
├── api-schema/      # OpenAPIスキーマ（JSON）
├── api-spec/        # OpenAPIスキーマ（YAML）
├── api-type/        # TypeScript型定義
├── api-zod/         # Zodスキーマ
├── entities/        # エンティティ層
├── features/        # 機能層
├── pages/           # ページコンポーネント
├── shared/          # 共通ライブラリ
└── widgets/         # UIウィジェット
```

**コード生成フロー:**
```
OpenAPI YAML (api-spec/)
    ↓ kubb generate
├── api-type/   (TypeScript型)
├── api-zod/    (バリデーション)
├── api-client/ (APIクライアント)
└── api-mock/   (モックデータ)
```

---

### 4. バッチ処理とデータフロー

#### 4.1 既存のバッチ処理

| バッチ名 | 実行タイミング | 処理内容 | 対象テーブル |
|---------|--------------|---------|------------|
| `sales_management_batch.php` | 日次（深夜） | 売上データ集計 | `m_management_sales` |
| `purchase_batch.php` | 日次（深夜） | 仕入データ集計 | `m_management_food` |
| `costs_batch.php` | 日次（深夜） | 人件費データ集計 | `m_management_labor` |
| `closing_batch.sh` | 月次（月初） | 月次締め処理 | 複数テーブル |

**実行方法:**
```bash
# cron設定（推定）
0 1 * * * /usr/bin/php /var/www/chibic/docs/store/sales_management_batch.php
0 2 * * * /usr/bin/php /var/www/chibic/docs/store/purchase_batch.php
0 3 * * * /usr/bin/php /var/www/chibic/docs/store/costs_batch.php
```

#### 4.2 データフロー図

```
[レジシステム (m_register_table_info_cum)]
    ↓ リアルタイム
[予約システム (reservations)]
    ↓ 日次バッチ (sales_management_batch.php)
[売上実績テーブル (m_management_sales)]
    ↓
    
[Infomart API]
    ↓ 日次バッチ (purchase_batch.php)
[原価実績テーブル (m_management_food)]
    ↓
    
[勤怠システム (m_attendance_worktable)]
    ↓ 日次バッチ (costs_batch.php)
[人件費実績テーブル (m_management_labor)]
    ↓
    
【BI機能で集計・分析】
```

---

### 5. インフラ構成

#### 5.1 Docker構成

```yaml
services:
  nginx:       # Webサーバー
  php-fpm:     # PHP実行環境
  mysql84:     # メインDB (chibic)
  redis:       # セッション・キャッシュ
  mailhog:     # メール開発環境
```

**アクセスURL:**
- 管理画面: `http://localhost/admin/login.php`
- 店舗画面: `http://localhost/store/login.php`
- phpMyAdmin: `http://localhost:8080`

#### 5.2 データベース構成

```
chibic (PRIMARY)
├── m_store
├── m_master
├── m_management_sales     # 売上実績
├── m_management_budget    # 予算
├── m_management_food      # 原価実績
├── m_management_labor     # 人件費実績
└── m_register_*           # レジシステム

reservation (Laravelアプリ独自DB)
├── reservations
├── customers
└── reservation_*

time_and_attendance (Laravelアプリ独自DB)
├── m_attendance_employee
├── m_attendance_worktable
└── m_attendance_salary
```

---

## 📝 調査完了！

次のドキュメントで詳細設計書を作成中...


