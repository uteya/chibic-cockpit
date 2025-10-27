// ============================================
// ユーティリティ関数
// ============================================

/**
 * 数値を日本円形式でフォーマット
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  }).format(value);
}

/**
 * パーセント形式でフォーマット
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * 日付を日本語形式でフォーマット
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdays[date.getDay()];
  
  return `${year}年${month}月${day}日(${weekday})`;
}

/**
 * 変化率の表示（+/- 付き）
 */
export function formatChangeRate(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * クラス名を結合
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}


