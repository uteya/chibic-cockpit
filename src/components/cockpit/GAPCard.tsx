'use client';

interface GAPCardProps {
  title: string;
  budget: number;
  actual: number;
  gap: number;
  unit: 'currency' | 'percent';
  recommendation?: string;
}

export default function GAPCard({
  title,
  budget,
  actual,
  gap,
  unit,
  recommendation,
}: GAPCardProps) {
  const isPositive = gap >= 0;
  const formatValue = (value: number) => {
    if (unit === 'currency') {
      return `¥${value.toLocaleString()}`;
    }
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* タイトル */}
      <h3 className="text-sm font-semibold text-gray-600 mb-4">{title}</h3>

      {/* GAP金額を大きく表示 */}
      <div className="text-center mb-6">
        <div className="text-xs text-gray-500 mb-1">GAP</div>
        <div
          className={`text-5xl font-bold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {isPositive ? '+' : ''}
          {formatValue(gap)}
        </div>
      </div>

      {/* 予算vs実績の棒グラフ */}
      <div className="space-y-3 mb-4">
        {/* 予算 */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">予算</span>
            <span className="font-semibold text-gray-800">
              {formatValue(budget)}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>

        {/* 実績 */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">実績</span>
            <span className="font-semibold text-gray-800">
              {formatValue(actual)}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                isPositive ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{
                width: `${Math.min((Math.abs(actual) / Math.abs(budget)) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* レコメンデーション */}
      {recommendation && (
        <div className={`p-3 rounded-lg ${
          isPositive ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className="text-sm text-gray-700">
            💡 {recommendation}
          </p>
        </div>
      )}
    </div>
  );
}


