'use client';

interface ShiftData {
  time: string;
  required: number;
  actual: number;
  status: 'optimal' | 'overstaffed' | 'understaffed';
}

interface StaffAnalysisPanelProps {
  shifts: ShiftData[];
}

export default function StaffAnalysisPanel({ shifts }: StaffAnalysisPanelProps) {
  const statusConfig = {
    optimal: {
      label: '適正',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: '✓',
    },
    overstaffed: {
      label: '過剰',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: '△',
    },
    understaffed: {
      label: '不足',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: '✕',
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        👥 人員配置分析
      </h3>
      
      <div className="space-y-3">
        {shifts.map((shift, index) => {
          const config = statusConfig[shift.status];
          const diff = shift.actual - shift.required;
          
          return (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg border ${config.borderColor} ${config.bgColor}`}
            >
              {/* 時間帯 */}
              <div className="flex items-center gap-4 flex-1">
                <div className="w-32">
                  <div className="font-semibold text-gray-800">{shift.time}</div>
                </div>
                
                {/* 人数比較 */}
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">
                    必要: <span className="font-semibold">{shift.required}</span>人
                  </div>
                  <span className="text-gray-400">→</span>
                  <div className="text-sm text-gray-600">
                    実際: <span className="font-semibold">{shift.actual}</span>人
                  </div>
                </div>
              </div>

              {/* ステータス */}
              <div className="text-right">
                <div className={`text-lg font-bold ${config.color}`}>
                  {config.icon} {config.label}
                </div>
                {diff !== 0 && (
                  <div className="text-xs text-gray-500">
                    {diff > 0 ? `+${diff}` : diff}人
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* アクション */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          💡 18:00-22:00のディナータイムで1名不足しています。シフト調整を検討しませんか？
        </p>
      </div>
    </div>
  );
}


