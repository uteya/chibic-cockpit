// ============================================
// 型定義
// ============================================

export interface KPI {
  actual: number;
  budget: number;
  last_year: number;
  change_rate: number;
  status: 'success' | 'warning' | 'danger';
}

export interface Store {
  store_id: string;
  store_name: string;
  master_id: string;
  region: string;
  kpis: {
    sales: KPI;
    cost_rate: KPI;
    labor_cost_rate: KPI;
  };
  sparkline: number[];
  budget_data?: {
    monthly_budget: number;
    cumulative_budget: number;
    cumulative_actual: number;
    forecast: number;
    gap: number;
    gap_percentage: number;
  };
  theory_vs_actual?: {
    cost_rate: {
      type: 'cost_rate';
      theory_value: number;
      actual_value: number;
      over_percentage: number;
      monthly_impact: number;
    };
    labor_cost_rate: {
      type: 'labor_cost_rate';
      theory_value: number;
      actual_value: number;
      over_percentage: number;
      monthly_impact: number;
    };
  };
  gap_info?: Array<{
    kpi_type: string;
    gap_amount: number;
    gap_percentage: number;
    is_positive: boolean;
    recommendation: string;
  }>;
}

export interface AIInsight {
  id: string;
  store_id: string;
  kpi_type: string;
  severity: 'high' | 'medium' | 'low';
  emoji: string;
  message: string;
  observation: string;
  clue: string;
  logic: string;
  recommended_actions: RecommendedAction[];
}

export interface RecommendedAction {
  id: string;
  label: string;
  icon: string;
  action_type: 'navigate' | 'external' | 'dismiss';
  target: string | null;
}

export interface SalesTrend {
  dates: string[];
  actual: number[];
  last_year: number[];
  forecast: (number | null)[];
  normal_range?: {
    upper: number[];
    lower: number[];
  };
}

export interface HourlyBreakdown {
  hours: string[];
  sales_actual: number[];
  sales_last_year: number[];
}

export interface DetailAnalytics {
  [storeId: string]: {
    sales_trend: SalesTrend;
    hourly_breakdown: HourlyBreakdown;
    menu_analysis?: {
      top_items: Array<{
        name: string;
        quantity: number;
        revenue: number;
        change_rate: number;
      }>;
    };
    staff_analysis?: {
      shifts: Array<{
        time: string;
        required: number;
        actual: number;
        status: 'optimal' | 'overstaffed' | 'understaffed';
      }>;
    };
  };
}

export interface MockData {
  version: string;
  last_updated: string;
  user: {
    id: string;
    name: string;
    role: string;
    managed_stores: string[];
  };
  stores: Store[];
  ai_insights: AIInsight[];
  detail_analytics: DetailAnalytics;
}

