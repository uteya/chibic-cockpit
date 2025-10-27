'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface BudgetProgressCircleProps {
  monthlyBudget: number;
  cumulativeBudget: number;
  cumulativeActual: number;
  forecast: number;
  storeName: string;
}

export default function BudgetProgressCircle({
  monthlyBudget,
  cumulativeBudget,
  cumulativeActual,
  forecast,
  storeName,
}: BudgetProgressCircleProps) {
  const achievementRate = (cumulativeActual / cumulativeBudget) * 100;
  const forecastRate = (forecast / monthlyBudget) * 100;
  const gap = cumulativeActual - cumulativeBudget;

  // 円グラフ用データ
  const data = [
    { name: '達成', value: cumulativeActual, color: gap >= 0 ? '#22c55e' : '#ef4444' },
    { name: '未達成', value: Math.max(0, cumulativeBudget - cumulativeActual), color: '#e5e7eb' },
    { name: '残り予算', value: Math.max(0, monthlyBudget - cumulativeBudget), color: '#d1d5db' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* 店舗名 */}
      <h3 className="text-lg font-bold text-gray-800 mb-4">{storeName}</h3>

      <div className="flex items-center gap-6">
        {/* 円グラフ */}
        <div className="relative w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* 中央のGAP表示 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xs text-gray-500">GAP</div>
            <div
              className={`text-2xl font-bold ${
                gap >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {gap >= 0 ? '+' : ''}¥{Math.abs(gap / 10000).toFixed(0)}万
            </div>
          </div>
        </div>

        {/* 数値情報 */}
        <div className="flex-1 space-y-3">
          <div>
            <div className="text-xs text-gray-500">月間予算</div>
            <div className="text-lg font-semibold text-gray-800">
              ¥{(monthlyBudget / 10000).toFixed(0)}万
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">累計予算（今日まで）</div>
            <div className="text-lg font-semibold text-gray-800">
              ¥{(cumulativeBudget / 10000).toFixed(0)}万
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">累計実績</div>
            <div className="text-lg font-semibold text-gray-800">
              ¥{(cumulativeActual / 10000).toFixed(0)}万
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">着地見込み</div>
            <div className={`text-lg font-semibold ${
              forecastRate >= 100 ? 'text-green-600' : 'text-yellow-600'
            }`}>
              ¥{(forecast / 10000).toFixed(0)}万
              <span className="text-sm ml-2">
                ({forecastRate.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* アクション */}
      <div className="mt-4 flex gap-2">
        <button className="flex-1 px-4 py-2 bg-chibic-primary text-white rounded-lg hover:bg-chibic-primary-hover font-medium text-sm">
          ⇒ 対策を見る
        </button>
        <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm text-gray-700">
          ⇨ 結果を確認
        </button>
      </div>
    </div>
  );
}


