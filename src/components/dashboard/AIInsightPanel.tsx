'use client';

import Card from '@/components/shared/Card';
import Badge from '@/components/shared/Badge';
import type { AIInsight } from '@/types';
import { Megaphone } from 'lucide-react';

interface AIInsightPanelProps {
  insight: AIInsight;
  onEngagementAction?: () => void;
  isEngagementType?: boolean;
}

export default function AIInsightPanel({
  insight,
  onEngagementAction,
  isEngagementType = false,
}: AIInsightPanelProps) {
  const severityVariant = {
    high: 'danger' as const,
    medium: 'warning' as const,
    low: 'info' as const,
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{insight.emoji}</span>
          <h3 className="text-lg font-bold text-gray-800">AI分析</h3>
        </div>
        <Badge variant={severityVariant[insight.severity]}>
          {insight.severity === 'high' && '要注意'}
          {insight.severity === 'medium' && '注意'}
          {insight.severity === 'low' && '情報'}
        </Badge>
      </div>

      {/* 3ステップ分析 */}
      <div className="space-y-4">
        {/* 観察 */}
        <div>
          <h4 className="text-sm font-semibold text-chibic-primary mb-2">
            📊 観察
          </h4>
          <p className="text-gray-700">{insight.observation}</p>
        </div>

        {/* 手がかり */}
        <div>
          <h4 className="text-sm font-semibold text-chibic-primary mb-2">
            🔍 手がかり
          </h4>
          <p className="text-gray-700">{insight.clue}</p>
        </div>

        {/* 論理 */}
        <div>
          <h4 className="text-sm font-semibold text-chibic-primary mb-2">
            💡 結論
          </h4>
          <p className="text-gray-700">{insight.logic}</p>
        </div>
      </div>

      {/* エンゲージメントボタン（条件付き表示） */}
      {isEngagementType && onEngagementAction && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onEngagementAction}
            className="w-full px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-bold text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Megaphone className="w-6 h-6" />
            「特別クーポン」を、対象顧客にLINEで送信する
          </button>
        </div>
      )}
    </Card>
  );
}


