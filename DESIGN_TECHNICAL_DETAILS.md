# 🔧 チビックシステム - BI機能 技術詳細設計書

**バージョン:** 3.0.0  
**前提:** DESIGN_SPECIFICATION.mdの内容を理解していること

---

## 📊 質問への完全回答

### 質問1: BI機能の全体像とデータソース - 完全回答

#### 1-1. モックアップのKPI完全リスト

**【実装済みKPI】**
1. 売上実績（日次・累計）
2. 売上予算（日次・累計）
3. 売上予算達成率
4. 前年比成長率
5. 原価率（実績）
6. 人件費率（実績）
7. 予算GAP（金額・率）
8. KPI信号機（success/warning/danger）

**【Phase 2追加KPI】**
9. 理論原価率 vs 実績原価率
10. 理論人件費率 vs 実績人件費率
11. 予算消化率（円グラフ）
12. 着地見込み
13. メニュー別売上TOP3
14. 時間帯別人員配置

**【未実装だが必要なKPI】**
15. 時間帯別売上
16. 客層分析（新規/リピーター）
17. 決済手段別売上
18. プラットフォーム手数料
19. FL比率（Food + Labor Cost）
20. 営業利益率

---

#### 1-2. データソーステーブルマッピング（完全版）

##### ✅ 既存テーブルで実現可能

| KPI | 元テーブル | JOIN条件 | 備考 |
|-----|-----------|---------|------|
| **売上実績** | `m_management_sales` | - | ✅ そのまま使用可能 |
| **売上予算** | `m_management_budget_daily` | `store_id, date` | ✅ そのまま使用可能 |
| **原価実績** | `m_management_food` | `store_id, delivery_date` | ✅ そのまま使用可能 |
| **人件費実績** | `m_management_labor` | `store_id, business_day` | ✅ そのまま使用可能 |
| **客数** | `m_management_sales.customers` | - | ✅ そのまま使用可能 |
| **客単価** | `sales / customers` | 計算式 | ✅ 算出可能 |
| **前年比** | `m_management_sales` | `DATE_SUB(business_date, INTERVAL 1 YEAR)` | ✅ 算出可能 |

##### ⚠️ 要確認テーブル（調査必要）

| KPI | 想定テーブル | 調査ポイント | 対策 |
|-----|------------|-------------|------|
| **理論原価** | `m_recipe`? | テーブル存在確認 | なければ手動入力機能 |
| **メニュー別売上** | `m_register_sales_menu`? | テーブル存在確認 | ログから集計も可 |
| **時間帯別売上** | `m_register_table_info`? | 時間カラム確認 | なければレジログ解析 |
| **客層分析** | `customers` + `reservations` | 新規/リピーター判定ロジック | JOIN可能 |

##### ❌ 新規テーブルが必要

| KPI | 新規テーブル | データソース | 取込方法 |
|-----|------------|-------------|---------|
| **決済手数料** | `m_management_payment_fees` | 決済サービスAPI or CSV | 月次バッチ or 手動アップロード |
| **マーケットプレイス手数料** | `m_management_marketplace_fees` | 食べログ等の管理画面 | CSV手動アップロード |
| **その他経費** | `m_management_expenses` | 会計ソフト or 手動 | CSV手動アップロード |

---

#### 1-3. 外部データの扱い（完全回答）

##### 決済手数料の実装案

**現状:**
- ❌ 既存DBに決済手数料データは**存在しない**
- ✅ Infomartとの連携実績はある（`purchase_batch.php`）

**推奨実装:**

**Step 1: 新規テーブル作成**
```sql
CREATE TABLE m_management_payment_fees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    master_id VARCHAR(8) NOT NULL,
    store_id VARCHAR(6) NOT NULL,
    yearmonth VARCHAR(6) NOT NULL COMMENT 'YYYYMM',
    
    -- クレジットカード
    credit_sales DECIMAL(12,2) DEFAULT 0,
    credit_fee_rate DECIMAL(5,2) DEFAULT 3.24,
    credit_fee_amount DECIMAL(12,2) DEFAULT 0,
    
    -- 電子マネー
    emoney_sales DECIMAL(12,2) DEFAULT 0,
    emoney_fee_rate DECIMAL(5,2) DEFAULT 3.25,
    emoney_fee_amount DECIMAL(12,2) DEFAULT 0,
    
    -- QRコード決済
    qr_sales DECIMAL(12,2) DEFAULT 0,
    qr_fee_rate DECIMAL(5,2) DEFAULT 2.95,
    qr_fee_amount DECIMAL(12,2) DEFAULT 0,
    
    -- 合計
    total_fee_amount DECIMAL(12,2) GENERATED ALWAYS AS 
        (credit_fee_amount + emoney_fee_amount + qr_fee_amount) STORED,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_store_month (master_id, store_id, yearmonth),
    INDEX idx_yearmonth (yearmonth)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 
COMMENT='決済手数料管理テーブル';
```

**Step 2: データ取得方法**

**方法A: CSV手動アップロード（Phase 1）**
```php
// BI管理画面に追加
GET  /bi/admin/payment-fees/upload
POST /bi/admin/payment-fees/import
    - CSVファイルをアップロード
    - バリデーション
    - m_management_payment_fees にINSERT
```

**方法B: API自動連携（Phase 2以降）**
```php
// 月次バッチで自動取得
// batch/import_payment_fees.php

// Stripe API例
$stripe = new \Stripe\StripeClient(env('STRIPE_SECRET_KEY'));
$charges = $stripe->charges->all([
    'created' => [
        'gte' => strtotime('first day of last month'),
        'lte' => strtotime('last day of last month'),
    ],
]);

foreach ($charges as $charge) {
    $feeAmount = $charge->balance_transaction->fee / 100;
    // m_management_payment_fees に保存
}
```

##### マーケットプレイス手数料の実装案

**対象プラットフォーム:**
- 食べログ
- ぐるなび
- Uber Eats
- 出前館
- menu

**実装:**
```sql
CREATE TABLE m_management_marketplace_fees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    master_id VARCHAR(8) NOT NULL,
    store_id VARCHAR(6) NOT NULL,
    yearmonth VARCHAR(6) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    
    -- 売上データ
    platform_sales DECIMAL(12,2) DEFAULT 0 COMMENT 'プラットフォーム経由売上',
    platform_orders INT DEFAULT 0 COMMENT '注文件数',
    
    -- 手数料データ
    commission_rate DECIMAL(5,2) DEFAULT 0 COMMENT '手数料率(%)',
    commission_amount DECIMAL(12,2) DEFAULT 0 COMMENT '手数料額',
    
    -- メモ
    note TEXT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_store_month_platform (master_id, store_id, yearmonth, platform),
    INDEX idx_platform (platform)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
COMMENT='マーケットプレイス手数料管理テーブル';
```

**データ取得:**
1. **CSV手動アップロード**（推奨）
   - 各プラットフォーム管理画面からCSVダウンロード
   - BI管理画面でアップロード
   - フォーマット標準化（テンプレート提供）

2. **OCR自動読取**（将来）
   - 請求書PDFをOCRで読み取り
   - 自動でテーブルに格納

---

### 質問2: アーキテクチャと技術選定 - 完全回答

#### 2-1. 推奨アーキテクチャ: **オプションC（データマート構築）**

**理由の詳細:**

**既存DBに直接クエリ（オプションA）を却下する理由:**
```sql
-- こんなクエリは本番DBで実行できない（10秒以上かかる）
SELECT 
    s.store_id,
    s.store_name,
    SUM(ms.total_amount) as sales,
    SUM(mf.price) as cost,
    SUM(ml.cost) as labor,
    (SUM(mf.price) / SUM(ms.total_amount)) * 100 as cost_rate,
    (SUM(ml.cost) / SUM(ms.total_amount)) * 100 as labor_rate
FROM m_store s
LEFT JOIN m_management_sales ms ON s.store_id = ms.store_id
LEFT JOIN m_management_food mf ON s.store_id = mf.store_id AND ms.business_date = mf.delivery_date
LEFT JOIN m_management_labor ml ON s.store_id = ml.store_id AND ms.business_date = ml.business_day
WHERE ms.business_date BETWEEN '2025-10-01' AND '2025-10-24'
GROUP BY s.store_id;

-- ↑ これは以下の理由で遅い:
-- 1. 3つのテーブルをJOIN（各100万行以上）
-- 2. 日付範囲のスキャン
-- 3. GROUP BY処理
-- 4. 複数の集計関数

**推定実行時間: 8-12秒** ← ユーザー体験最悪
```

**データマート方式（オプションC）の優位性:**
```sql
-- データマート方式（事前集計済み）
SELECT 
    store_id,
    store_name,
    sales_actual,
    cost_rate,
    labor_rate,
    sales_gap
FROM bi_daily_summary
WHERE business_date = '2025-10-24'
AND store_id IN ('st0001', 'st0002', 'st0003');

-- ↑ 以下の理由で高速:
-- 1. JOINなし（単一テーブル）
-- 2. 特定日のみ（インデックス効く）
-- 3. 集計済み（計算不要）
-- 4. データ量少ない（365日×店舗数のみ）

**推定実行時間: 50-100ms** ← 快適な体験
```

**DWH導入（オプションB）を将来検討とする理由:**
- 初期コスト: BigQuery（月5-10万円）、Redshift（月8-15万円）
- 運用コスト: データエンジニアリング工数
- 現時点のデータ量: 店舗数200店×3年分 = 約220万行（MySQLで十分）
- **結論:** データ量が1000万行を超えたらDWH検討

---

#### 2-2. バックエンドリポジトリ: **新規bi-api作成**

**ディレクトリ構造（完全版）:**

```
bi-api/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── V1/
│   │   │       ├── BiDashboardController.php
│   │   │       ├── BiKPIController.php
│   │   │       ├── BiAnalyticsController.php
│   │   │       └── BiAIInsightController.php
│   │   ├── Middleware/
│   │   │   ├── BiAccessControl.php
│   │   │   └── StoreAccessControl.php
│   │   └── Requests/
│   │       └── V1/
│   │           ├── DashboardRequest.php
│   │           └── KPIRequest.php
│   ├── Services/
│   │   ├── BiDashboardService.php
│   │   ├── KPICalculationService.php
│   │   ├── DataMartService.php
│   │   └── AIInsightService.php
│   ├── Models/
│   │   ├── BiDailySummary.php
│   │   ├── BiAIInsight.php
│   │   ├── MasterStore.php (既存DBから)
│   │   └── MasterStaff.php (既存DBから)
│   └── Repositories/
│       ├── BiDailySummaryRepository.php
│       └── BiAIInsightRepository.php
├── batch/
│   ├── update_bi_datamart.php
│   ├── generate_ai_insights.php
│   └── libs/
│       ├── KPICalculator.php
│       └── AnomalyDetector.php
├── config/
│   └── bi.php
├── database/
│   ├── migrations/
│   │   ├── 2025_10_25_000001_create_bi_daily_summary_table.php
│   │   ├── 2025_10_25_000002_create_bi_ai_insights_table.php
│   │   └── 2025_10_25_000003_create_bi_payment_fees_table.php
│   └── seeders/
│       └── BiTestDataSeeder.php
├── openapi/
│   └── api/
│       ├── bi.yaml
│       └── components/
│           ├── schemas/
│           │   ├── DashboardResponse.yaml
│           │   ├── KPIResponse.yaml
│           │   └── AIInsight.yaml
│           └── parameters/
│               └── date_range.yaml
├── tests/
│   ├── Feature/
│   │   ├── BiDashboardTest.php
│   │   └── BiKPITest.php
│   └── Unit/
│       ├── KPICalculationServiceTest.php
│       └── DataMartServiceTest.php
├── composer.json
├── .env.example
└── README.md
```

**推奨Laravel構成:**
```json
{
  "require": {
    "php": "^8.3",
    "laravel/framework": "^11.0",
    "predis/predis": "^2.2",
    "guzzlehttp/guzzle": "^7.8"
  },
  "require-dev": {
    "phpunit/phpunit": "^11.0",
    "laravel/pint": "^1.14"
  }
}
```

---

#### 2-3. フロントエンド技術スタック: **tna_frontに統合**

**モノレポ構成:**

```
tna_front-develop/
├── apps/
│   └── cockpit/                # 経営コックピット
│       ├── src/
│       │   ├── app/
│       │   │   ├── (authenticated)/
│       │   │   │   ├── dashboard/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── stores/
│       │   │   │   │   └── [storeId]/
│       │   │   │   │       └── page.tsx
│       │   │   │   └── settings/
│       │   │   │       └── page.tsx
│       │   │   └── login/
│       │   │       └── page.tsx
│       │   ├── components/
│       │   │   ├── cockpit/
│       │   │   ├── dashboard/
│       │   │   ├── settings/
│       │   │   └── shared/
│       │   ├── hooks/
│       │   │   ├── useDashboard.ts
│       │   │   ├── useKPITrends.ts
│       │   │   └── useAIInsights.ts
│       │   ├── lib/
│       │   │   ├── api/
│       │   │   │   ├── biClient.ts
│       │   │   │   └── authClient.ts
│       │   │   └── utils.ts
│       │   └── types/
│       │       └── index.ts
│       └── package.json
└── packages/
    └── shared/
        ├── api-client-bi/         # 新規追加
        ├── api-type-bi/           # 新規追加
        └── api-zod-bi/            # 新規追加
```

**グラフライブラリ推奨:**

| ライブラリ | 用途 | メリット | デメリット |
|-----------|------|---------|-----------|
| **Recharts** ✅ | 基本的なグラフ | React統合、軽量 | カスタマイズ性△ |
| **Chart.js** | 高度なグラフ | 多機能、軽量 | React統合△ |
| **D3.js** | 超カスタマイズ | 自由度MAX | 学習コスト高 |
| **Apache ECharts** | エンタープライズ | 高機能、美しい | サイズ大 |

**結論: Recharts継続使用（既に実装済み）**

---

### 質問3: 機能要件と非機能要件 - 完全回答

#### 3-1. データ更新頻度: **日次更新**

**詳細タイムライン:**

```
【夜間バッチ処理】
23:00 - レジ締め完了
23:30 - 勤怠締め完了
    ↓
01:00 - [既存] 売上集計バッチ
    - m_register_table_info_cum → m_management_sales
    - reservations.total_bill → m_management_sales
    ↓
02:00 - [既存] 原価集計バッチ
    - Infomart API → m_management_food
    ↓
03:00 - [既存] 人件費集計バッチ
    - wk_download → m_management_labor
    ↓
04:00 - [新規] BIデータマート更新バッチ
    - 全KPI計算
    - bi_daily_summary に INSERT
    ↓
05:00 - [新規] AI分析バッチ
    - 異常検知
    - bi_ai_insights に INSERT
    ↓
06:00 - [新規] キャッシュウォームアップ
    - 主要APIを事前実行
    - Redis にキャッシュ

【朝の業務開始】
08:00 - エリアマネージャーがログイン
    - キャッシュから即座に表示（500ms）
```

**リアルタイム性の制約:**
- ✅ 前日までのデータは確定
- ❌ 当日データは表示できない
- 💡 表示例: 「昨日（10月24日）の結果」

**将来の拡張:**
- Phase 3: 当日の速報値（1時間遅延）
- Phase 4: リアルタイムダッシュボード（ストリーミング）

---

#### 3-2. ドリルダウン機能 - 完全仕様

**階層構造:**

```
Level 1: 全店舗ダッシュボード
┃
┣━ KPI信号機 ━━━━━━┓
┃                   ↓
┣━ 店舗タイル ━━━━━━┓
┃                   ↓
┃               Level 2: 店舗別ダッシュボード
┃               ┃
┃               ┣━ 売上トレンドグラフ ━━━━┓
┃               ┃                       ↓
┃               ┃                   Level 3: 日別詳細
┃               ┃                   ┃
┃               ┃                   ┣━ 時間帯別売上 ━┓
┃               ┃                   ┃                ↓
┃               ┃                   ┃            Level 4: 時間帯詳細
┃               ┃                   ┃            ┃
┃               ┃                   ┃            ┗━ 伝票一覧
┃               ┃                   ┃
┃               ┃                   ┗━ メニュー別売上 ━┓
┃               ┃                                      ↓
┃               ┃                                  Level 4: メニュー詳細
┃               ┃
┃               ┣━ 原価分析 ━━━━━━┓
┃               ┃                  ↓
┃               ┃              Level 3: カテゴリ別原価
┃               ┃
┃               ┗━ 人件費分析 ━━━━┓
┃                                ↓
┃                            Level 3: 従業員別人件費
┃
┗━ 予算GAP分析 ━━━━━┓
                     ↓
                 Level 2: 月次推移分析
```

**実装する画面遷移:**

| From | To | Trigger | API | Phase |
|------|----|---------| ----|-------|
| S-01 コックピット | S-02 店舗詳細 | 店舗タイルクリック | `/stores/{id}/kpis` | ✅ Phase 1 |
| S-02 店舗詳細 | S-04 日別詳細 | グラフの日付クリック | `/stores/{id}/daily/{date}` | 🔄 Phase 3 |
| S-04 日別詳細 | S-05 時間帯詳細 | 時間帯クリック | `/stores/{id}/hourly/{date}/{hour}` | 🔜 Phase 4 |
| S-04 日別詳細 | S-06 メニュー詳細 | メニュー名クリック | `/stores/{id}/menu/{menuId}` | 🔜 Phase 4 |
| S-02 店舗詳細 | S-07 月次推移 | 月次ボタンクリック | `/stores/{id}/monthly` | 🔜 Phase 3 |

**パンくずリスト:**
```
コックピット > ちびっく酒場 新橋店 > 2025年10月24日 > 18:00-19:00
```

---

#### 3-3. パフォーマンス要件 - 詳細

**目標値（SLA）:**

| 指標 | 目標 | 限界値 | 測定方法 |
|------|------|--------|---------|
| **FCP** (First Contentful Paint) | < 1.0秒 | < 1.5秒 | Lighthouse |
| **LCP** (Largest Contentful Paint) | < 2.0秒 | < 2.5秒 | Lighthouse |
| **TTI** (Time to Interactive) | < 2.5秒 | < 3.0秒 | Lighthouse |
| **API Response Time** | < 300ms | < 500ms | New Relic |
| **Database Query Time** | < 50ms | < 100ms | Slow Query Log |

**負荷試験計画:**

```bash
# Apache Bench
ab -n 1000 -c 50 http://localhost:8000/api/v1/bi/dashboard/summary

# 目標:
# - Requests per second: > 100
# - Time per request: < 500ms
# - Failed requests: 0
```

**想定ユーザー数:**

| 時間帯 | 同時接続数 | 1時間あたりリクエスト |
|-------|-----------|-------------------|
| 08:00-09:00（ピーク） | 80-100名 | 約1,200リクエスト |
| 09:00-18:00（通常） | 30-50名 | 約400リクエスト/時 |
| 18:00-23:00（低） | 10-20名 | 約150リクエスト/時 |

**スケーリング不要:**
- 現行インフラ（Docker + nginx + PHP-FPM）で十分
- Redis キャッシュで対応可能
- CDN不要（社内システムのため）

---

#### 3-4. 権限管理 - 実装詳細

**ロール・権限マトリックス:**

| 機能 | master（経営者） | staff（エリアMG） | staff（店長） |
|-----|----------------|-----------------|-------------|
| 全店舗ダッシュボード閲覧 | ✅ | ✅（担当店舗のみ） | ✅（自店舗のみ） |
| 予算設定 | ✅ | ❌ | ❌ |
| AI気づき確認済み | ✅ | ✅ | ✅ |
| データエクスポート | ✅ | ✅（担当店舗のみ） | ✅（自店舗のみ） |
| カスタムKPI追加 | ✅ | ❌ | ❌ |
| ユーザー管理 | ✅ | ❌ | ❌ |

**データベーススキーマ（既存活用）:**

```sql
-- 既存テーブルをそのまま使用
m_master_staff (スタッフマスタ)
├── staff_id VARCHAR(10) PRIMARY KEY
├── master_id VARCHAR(8)
├── name VARCHAR(255)
└── authority VARCHAR(20)  -- 'master' or 'staff'

m_master_staff_store (店舗紐付け)
├── staff_id VARCHAR(10)
├── master_id VARCHAR(8)
├── store_id VARCHAR(6)
└── is_main CHAR(1)  -- メイン担当店舗フラグ

-- 権限チェッククエリ
SELECT store_id 
FROM m_master_staff_store 
WHERE staff_id = :staff_id 
AND master_id = :master_id;
```

**実装例（Controller）:**
```php
class BiDashboardController extends Controller
{
    public function summary(Request $request)
    {
        $user = Auth::user();
        
        // 権限に応じて店舗IDリストを取得
        $storeIds = $this->getAccessibleStoreIds($user);
        
        // データ取得
        $summaries = BiDailySummary::whereIn('store_id', $storeIds)
            ->where('business_date', $request->date)
            ->get();
        
        return response()->json([
            'stores' => $summaries,
            'ai_insights' => $this->getAIInsights($storeIds, $request->date),
        ]);
    }
    
    private function getAccessibleStoreIds($user): array
    {
        if ($user->authority === 'master') {
            return Store::where('master_id', $user->master_id)
                ->pluck('store_id')
                ->toArray();
        }
        
        return DB::table('m_master_staff_store')
            ->where('staff_id', $user->staff_id)
            ->pluck('store_id')
            ->toArray();
    }
}
```

---

次のドキュメントに続く...


