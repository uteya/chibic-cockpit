'use client';

interface TheoryVsActualPanelProps {
  type: 'cost_rate' | 'labor_cost_rate';
  theoryValue: number;
  actualValue: number;
  overPercentage: number;
  monthlyImpact: number;
}

export default function TheoryVsActualPanel({
  type,
  theoryValue,
  actualValue,
  overPercentage,
  monthlyImpact,
}: TheoryVsActualPanelProps) {
  const labels = {
    cost_rate: '原価率',
    labor_cost_rate: '人件費率',
  };

  const icons = {
    cost_rate: '🍽️',
    labor_cost_rate: '👥',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* タイトル */}
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        {icons[type]} {labels[type]} - 理論値との比較
      </h3>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* 理論値 */}
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <div className="text-sm text-gray-600 mb-1">理論値</div>
          <div className="text-3xl font-bold text-blue-600">
            {theoryValue.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            レシピ・シフト通り
          </div>
        </div>

        {/* 実績値 */}
        <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
          <div className="text-sm text-gray-600 mb-1">実績値</div>
          <div className="text-3xl font-bold text-red-600">
            {actualValue.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            実際の数値
          </div>
        </div>
      </div>

      {/* オーバー率の強調表示 */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 mb-4 border border-red-200">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">
            理論値からのズレ
          </div>
          <div className="text-5xl font-bold text-red-600">
            +{overPercentage.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 mt-2">
            月間影響額: <span className="font-bold text-red-600">
              ¥{monthlyImpact.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* スケールゲージ */}
      <div className="relative h-16 mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-2 bg-gray-200 rounded-full"></div>
        </div>
        <div className="absolute inset-0 flex items-center">
          {/* 理論値マーカー */}
          <div className="absolute" style={{ left: `${(theoryValue / 40) * 100}%` }}>
            <div className="w-1 h-8 bg-blue-600"></div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-blue-600 font-semibold whitespace-nowrap">
              理論: {theoryValue}%
            </div>
          </div>
          {/* 実績値マーカー */}
          <div className="absolute" style={{ left: `${(actualValue / 40) * 100}%` }}>
            <div className="w-1 h-8 bg-red-600"></div>
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-red-600 font-semibold whitespace-nowrap">
              実績: {actualValue}%
            </div>
          </div>
        </div>
      </div>

      {/* レコメンデーション */}
      <div className="bg-blue-50 rounded-lg p-4 mt-8">
        <p className="text-sm text-gray-700">
          💡 {type === 'cost_rate' 
            ? 'ロスや廃棄が多い可能性があります。発注量の見直しを検討しましょう。' 
            : 'シフト配置が理論値を超えています。時間帯別の人員配置を最適化しましょう。'}
        </p>
      </div>

      {/* アクションボタン */}
      <div className="mt-4 flex gap-2">
        <button className="flex-1 px-4 py-2 bg-chibic-primary text-white rounded-lg hover:bg-chibic-primary-hover font-medium text-sm">
          詳細分析を見る
        </button>
        <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm text-gray-700">
          {type === 'cost_rate' ? 'ロス適正化' : 'シフト最適化'}
        </button>
      </div>
    </div>
  );
}


