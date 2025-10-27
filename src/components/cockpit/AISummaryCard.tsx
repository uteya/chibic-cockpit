'use client';

import { useState } from 'react';
import Card from '@/components/shared/Card';
import Badge from '@/components/shared/Badge';
import type { AIInsight } from '@/types';

interface AISummaryCardProps {
  insights: AIInsight[];
}

export default function AISummaryCard({ insights }: AISummaryCardProps) {
  const [showModal, setShowModal] = useState(false);

  const severityVariant = {
    high: 'danger' as const,
    medium: 'warning' as const,
    low: 'info' as const,
  };

  const severityLabel = {
    high: '要注意',
    medium: '注意',
    low: '情報',
  };

  return (
    <>
      {/* メインカード */}
      <Card
        className="bg-gradient-to-r from-semantic-info to-blue-600 text-white cursor-pointer hover:shadow-lg transition-all"
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-center gap-4">
          {/* パルスアイコン */}
          <div className="relative">
            <div className="w-12 h-12 bg-white rounded-full opacity-30 animate-pulse-slow"></div>
            <div className="absolute inset-0 w-12 h-12 bg-white rounded-full opacity-50"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
          </div>

          {/* メッセージ */}
          <div className="flex-1">
            <p className="text-lg font-semibold">
              【気づき】{insights.length}件の改善機会が見つかりました
            </p>
            <p className="text-sm opacity-90 mt-1">
              タップして全ての気づきを確認 →
            </p>
          </div>
        </div>
      </Card>

      {/* モーダル */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                AI分析の詳細 ({insights.length}件)
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* 気づき一覧 */}
            <div className="p-6 space-y-4">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start gap-4">
                    {/* 絵文字 */}
                    <span className="text-4xl">{insight.emoji}</span>

                    {/* コンテンツ */}
                    <div className="flex-1">
                      {/* タイトルとバッジ */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-800 text-lg">
                          {insight.message}
                        </h3>
                        <Badge variant={severityVariant[insight.severity]}>
                          {severityLabel[insight.severity]}
                        </Badge>
                      </div>

                      {/* 3ステップ分析 */}
                      <div className="space-y-3 mb-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <span className="font-semibold text-chibic-primary">
                            📊 観察
                          </span>
                          <p className="text-gray-700 mt-1">{insight.observation}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <span className="font-semibold text-chibic-primary">
                            🔍 手がかり
                          </span>
                          <p className="text-gray-700 mt-1">{insight.clue}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <span className="font-semibold text-chibic-primary">
                            💡 結論
                          </span>
                          <p className="text-gray-700 mt-1">{insight.logic}</p>
                        </div>
                      </div>

                      {/* アクションボタン */}
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-chibic-primary text-white rounded-lg hover:bg-chibic-primary-hover font-medium text-sm">
                          詳細を見る
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm text-gray-700">
                          ✅ 確認済みにする
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
