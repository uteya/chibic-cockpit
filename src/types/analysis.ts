// ============================================
// 予算管理・分析関連の型定義
// ============================================

// 予算管理関連の型定義
export interface BudgetData {
  monthly_budget: number;      // 月間予算
  cumulative_budget: number;   // 累計予算（今日まで）
  cumulative_actual: number;   // 累計実績
  forecast: number;            // 着地予測
  gap: number;                 // GAP金額
  gap_percentage: number;      // GAP率
}

// 理論値vs実績値
export interface TheoryVsActual {
  type: 'cost_rate' | 'labor_cost_rate';
  theory_value: number;        // 理論値
  actual_value: number;        // 実績値
  over_percentage: number;     // オーバー率
  monthly_impact: number;      // 月間影響額
}

// GAP情報
export interface GAPInfo {
  kpi_type: string;
  gap_amount: number;
  gap_percentage: number;
  is_positive: boolean;        // プラスかマイナスか
  recommendation: string;
}


