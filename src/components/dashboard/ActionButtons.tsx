'use client';

import type { RecommendedAction } from '@/types';

interface ActionButtonsProps {
  actions: RecommendedAction[];
}

export default function ActionButtons({ actions }: ActionButtonsProps) {
  const handleAction = (action: RecommendedAction) => {
    if (action.action_type === 'navigate') {
      alert(`画面遷移（モックアップ）: ${action.target}`);
    } else if (action.action_type === 'external') {
      alert(`外部連携（モックアップ）: ${action.label}`);
    } else if (action.action_type === 'dismiss') {
      alert('この気づきを確認済みにしました');
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        💡 推奨アクション
      </h3>
      <div className="flex flex-wrap gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action)}
            className={`
              px-5 py-3 rounded-lg font-medium transition-all
              ${
                action.action_type === 'dismiss'
                  ? 'bg-white border-2 border-gray-400 text-gray-900 font-semibold hover:bg-gray-50 hover:border-gray-500'
                  : 'bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md hover:shadow-lg'
              }
            `}
          >
            <span className="mr-2">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
