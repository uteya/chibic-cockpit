'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/cockpit/Header';
import AISummaryCard from '@/components/cockpit/AISummaryCard';
import StoreTile from '@/components/cockpit/StoreTile';
import GAPCard from '@/components/cockpit/GAPCard';
import BudgetProgressCircle from '@/components/cockpit/BudgetProgressCircle';
import Button from '@/components/shared/Button';
import type { MockData } from '@/types';

export default function CockpitPage() {
  const router = useRouter();
  const [mockData, setMockData] = useState<MockData | null>(null);
  const [currentDate, setCurrentDate] = useState('2025-10-24');
  const [showAllStores, setShowAllStores] = useState(false);

  // モックデータ読み込み
  useEffect(() => {
    fetch('/mockData.json')
      .then((res) => res.json())
      .then((data) => setMockData(data))
      .catch((err) => console.error('モックデータの読み込みに失敗:', err));
  }, []);

  if (!mockData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    );
  }

  // 要注意店舗のフィルタリング
  const alertStores = mockData.stores.filter((store) =>
    Object.values(store.kpis).some(
      (kpi) => kpi.status === 'danger' || kpi.status === 'warning'
    )
  );

  const displayStores = showAllStores ? mockData.stores : alertStores;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <Header
        date={currentDate}
        onPrevDay={() => {
          const prev = new Date(currentDate);
          prev.setDate(prev.getDate() - 1);
          setCurrentDate(prev.toISOString().split('T')[0]);
        }}
        onNextDay={() => {
          const next = new Date(currentDate);
          next.setDate(next.getDate() + 1);
          setCurrentDate(next.toISOString().split('T')[0]);
        }}
        onSettingsClick={() => router.push('/settings')}
      />

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* AIサマリーカード */}
        <div className="mb-8">
          <AISummaryCard insights={mockData.ai_insights} />
        </div>

        {/* GAP分析セクション */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            📊 予算GAP分析
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockData.stores.map((store) => (
              store.budget_data && (
                <GAPCard
                  key={store.store_id}
                  title={store.store_name}
                  budget={store.budget_data.cumulative_budget}
                  actual={store.budget_data.cumulative_actual}
                  gap={store.budget_data.gap}
                  unit="currency"
                  recommendation={store.gap_info?.[0]?.recommendation}
                />
              )
            ))}
          </div>
        </div>

        {/* 予算消化率セクション */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🎯 予算消化率（着地見込み）
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockData.stores.map((store) => (
              store.budget_data && (
                <BudgetProgressCircle
                  key={store.store_id}
                  monthlyBudget={store.budget_data.monthly_budget}
                  cumulativeBudget={store.budget_data.cumulative_budget}
                  cumulativeActual={store.budget_data.cumulative_actual}
                  forecast={store.budget_data.forecast}
                  storeName={store.store_name}
                />
              )
            ))}
          </div>
        </div>

        {/* 要注意店舗セクション */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {showAllStores ? '全店舗' : '要注意店舗'}
            <span className="ml-3 text-lg text-gray-500">
              ({displayStores.length}店舗)
            </span>
          </h2>
        </div>

        {/* 店舗タイル一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {displayStores.map((store) => (
            <StoreTile key={store.store_id} store={store} />
          ))}
        </div>

        {/* 全店舗表示切り替え */}
        {!showAllStores && (
          <div className="flex justify-center">
            <Button
              variant="secondary"
              onClick={() => setShowAllStores(true)}
            >
              全店舗を表示する
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

