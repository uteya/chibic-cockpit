'use client';

interface MenuItem {
  name: string;
  quantity: number;
  revenue: number;
  change_rate: number;
}

interface MenuAnalysisPanelProps {
  items: MenuItem[];
}

export default function MenuAnalysisPanel({ items }: MenuAnalysisPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        🍽️ メニュー分析（TOP3）
      </h3>
      
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            {/* 順位バッジ */}
            <div className="flex items-center gap-4 flex-1">
              <div className="w-8 h-8 rounded-full bg-chibic-primary text-white flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              
              <div className="flex-1">
                <div className="font-semibold text-gray-800 text-lg">
                  {item.name}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  販売数: <span className="font-semibold">{item.quantity}</span>個 
                  <span className="mx-2">|</span>
                  売上: <span className="font-semibold">¥{item.revenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 前年比 */}
            <div className="text-right">
              <div className={`text-lg font-bold ${
                item.change_rate >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {item.change_rate >= 0 ? '↑' : '↓'} {Math.abs(item.change_rate).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">前年比</div>
            </div>
          </div>
        ))}
      </div>

      {/* 補足メッセージ */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          💡 <span className="font-semibold">唐揚げ</span>の売上が前年比-3.1%です。価格見直しやセット販売を検討しませんか？
        </p>
      </div>
    </div>
  );
}


