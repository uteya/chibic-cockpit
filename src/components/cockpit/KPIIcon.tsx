interface KPIIconProps {
  type: 'sales' | 'cost_rate' | 'labor_cost_rate';
  status: 'success' | 'warning' | 'danger';
  value: number;
  unit?: string;
}

export default function KPIIcon({ type, status, value, unit }: KPIIconProps) {
  // ステータスごとの設定
  const statusConfig = {
    success: { 
      bgColor: 'bg-semantic-success',
      textColor: 'text-white',
      icon: '●',
      shadow: 'shadow-green-200'
    },
    warning: { 
      bgColor: 'bg-semantic-warning',
      textColor: 'text-white',
      icon: '▲',
      shadow: 'shadow-yellow-200'
    },
    danger: { 
      bgColor: 'bg-semantic-danger',
      textColor: 'text-white',
      icon: '✕',
      shadow: 'shadow-red-200'
    },
  };

  const labels = {
    sales: '売上',
    cost_rate: '原価',
    labor_cost_rate: '人件費',
  };

  const config = statusConfig[status];

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 信号機アイコン */}
      <div
        className={`w-14 h-14 rounded-full ${config.bgColor} ${config.textColor} flex items-center justify-center font-bold text-2xl shadow-lg ${config.shadow}`}
      >
        {config.icon}
      </div>

      {/* KPIラベル */}
      <span className="text-xs text-gray-600 font-medium">
        {labels[type]}
      </span>

      {/* 値 */}
      <span className="text-sm font-semibold text-gray-800">
        {value.toLocaleString()}
        {unit && <span className="text-xs text-gray-500 ml-0.5">{unit}</span>}
      </span>
    </div>
  );
}

