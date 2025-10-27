'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SideMenu from '@/components/dashboard/SideMenu';
import MainChart from '@/components/dashboard/MainChart';
import AIInsightPanel from '@/components/dashboard/AIInsightPanel';
import ActionButtons from '@/components/dashboard/ActionButtons';
import MenuAnalysisPanel from '@/components/dashboard/MenuAnalysisPanel';
import StaffAnalysisPanel from '@/components/dashboard/StaffAnalysisPanel';
import TheoryVsActualPanel from '@/components/dashboard/TheoryVsActualPanel';
import ActionLogForm from '@/components/dashboard/ActionLogForm';
import QSCAnalysisView from '@/components/dashboard/QSCAnalysisView';
import EngagementActionModal from '@/components/dashboard/EngagementActionModal';
import Button from '@/components/shared/Button';
import type { MockData } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Smile } from 'lucide-react';

const MENU_ITEMS = [
  { id: 'sales', label: '売上分析', icon: '💰' },
  { id: 'cost', label: '原価分析', icon: '🍽️' },
  { id: 'labor', label: '人件費分析', icon: '👥' },
  { id: 'menu', label: 'メニュー分析', icon: '📊' },
  { id: 'staff', label: '人員配置分析', icon: '👔' },
  { id: 'qsc', label: 'QSC分析', icon: '😊' },
];

export default function DetailDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;

  const [mockData, setMockData] = useState<MockData | null>(null);
  const [activeMenu, setActiveMenu] = useState('sales');
  const [actionLogs, setActionLogs] = useState<Array<{ date: string; text: string }>>([]);
  const [currentDate] = useState('2025-10-24');
  const [isEngagementModalOpen, setIsEngagementModalOpen] = useState(false);
  const [engagementData, setEngagementData] = useState<any>(null);

  useEffect(() => {
    fetch('/mockData.json')
      .then((res) => res.json())
      .then((data) => {
        setMockData(data);
        const storeAnalytics = data.detail_analytics[storeId];
        if (storeAnalytics?.action_logs) {
          setActionLogs(storeAnalytics.action_logs);
        }
        // エンゲージメントインサイトの確認
        if (data.engagement_insight && data.engagement_insight.store_id === storeId) {
          setEngagementData(data.engagement_insight);
        }
      })
      .catch((err) => console.error('モックデータの読み込みに失敗:', err));
  }, [storeId]);

  if (!mockData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    );
  }

  const store = mockData.stores.find((s) => s.store_id === storeId);
  const insight = mockData.ai_insights.find((i) => i.store_id === storeId);
  const analytics = mockData.detail_analytics[storeId];

  if (!store || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">店舗が見つかりません</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* サイドメニュー */}
      <SideMenu
        items={MENU_ITEMS}
        activeItem={activeMenu}
        onItemClick={setActiveMenu}
      />

      {/* メインコンテンツ */}
      <main className="flex-1 p-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <Button
            variant="text"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            ← コックピットに戻る
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">
            {store.store_name}
          </h1>
        </div>

        {/* KPIサマリー */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">売上実績</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              {formatCurrency(store.kpis.sales.actual)}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              予算比: {formatPercent((store.kpis.sales.actual / store.kpis.sales.budget) * 100 - 100)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">原価率</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              {formatPercent(store.kpis.cost_rate.actual)}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              予算: {formatPercent(store.kpis.cost_rate.budget)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">人件費率</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              {formatPercent(store.kpis.labor_cost_rate.actual)}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              予算: {formatPercent(store.kpis.labor_cost_rate.budget)}
            </div>
          </div>
        </div>

        {/* 売上分析 */}
        {activeMenu === 'sales' && (
          <div className="mb-8">
            <MainChart
              data={analytics.sales_trend}
              title="売上トレンド（過去7日間）"
              actionLogs={actionLogs}
            />
          </div>
        )}

        {/* 原価分析 */}
        {activeMenu === 'cost' && store.theory_vs_actual && (
          <div className="mb-8">
            <TheoryVsActualPanel
              type="cost_rate"
              theoryValue={store.theory_vs_actual.cost_rate.theory_value}
              actualValue={store.theory_vs_actual.cost_rate.actual_value}
              overPercentage={store.theory_vs_actual.cost_rate.over_percentage}
              monthlyImpact={store.theory_vs_actual.cost_rate.monthly_impact}
            />
          </div>
        )}

        {/* 人件費分析 */}
        {activeMenu === 'labor' && store.theory_vs_actual && (
          <div className="mb-8">
            <TheoryVsActualPanel
              type="labor_cost_rate"
              theoryValue={store.theory_vs_actual.labor_cost_rate.theory_value}
              actualValue={store.theory_vs_actual.labor_cost_rate.actual_value}
              overPercentage={store.theory_vs_actual.labor_cost_rate.over_percentage}
              monthlyImpact={store.theory_vs_actual.labor_cost_rate.monthly_impact}
            />
          </div>
        )}

        {/* メニュー分析 */}
        {activeMenu === 'menu' && analytics.menu_analysis && (
          <div className="mb-8">
            <MenuAnalysisPanel items={analytics.menu_analysis.top_items} />
          </div>
        )}

        {/* 人員配置分析 */}
        {activeMenu === 'staff' && analytics.staff_analysis && (
          <div className="mb-8">
            <StaffAnalysisPanel shifts={analytics.staff_analysis.shifts} />
          </div>
        )}

        {/* QSC分析 */}
        {activeMenu === 'qsc' && analytics.qsc_analysis && (
          <div className="mb-8">
            <QSCAnalysisView data={analytics.qsc_analysis} />
          </div>
        )}

        {/* AI分析パネル */}
        {(insight || engagementData) && (
          <>
            <div className="mb-8">
              <AIInsightPanel
                insight={engagementData || insight}
                isEngagementType={!!engagementData}
                onEngagementAction={() => setIsEngagementModalOpen(true)}
              />
            </div>

            {/* アクションボタン */}
            {!engagementData && insight && (
              <div className="mb-4">
                <ActionButtons actions={insight.recommended_actions} />
              </div>
            )}

            {/* 対策ログフォーム */}
            <ActionLogForm
              onSubmit={(text, date) => {
                setActionLogs([...actionLogs, { date, text }]);
              }}
              currentDate={currentDate}
            />
          </>
        )}

        {/* エンゲージメントモーダル */}
        {engagementData && mockData && (
          <EngagementActionModal
            isOpen={isEngagementModalOpen}
            onClose={() => setIsEngagementModalOpen(false)}
            targetCustomers={engagementData.target_customers || []}
            couponTemplates={mockData.coupon_templates || []}
          />
        )}
      </main>
    </div>
  );
}

