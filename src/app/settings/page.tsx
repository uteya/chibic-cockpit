'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/shared/Button';
import KPISlider from '@/components/settings/KPISlider';
import NotificationControl from '@/components/settings/NotificationControl';
import CustomKPIWizard from '@/components/settings/CustomKPIWizard';

export default function SettingsPage() {
  const router = useRouter();

  const [salesThreshold, setSalesThreshold] = useState(95);
  const [costRateThreshold, setCostRateThreshold] = useState(32);
  const [laborCostThreshold, setLaborCostThreshold] = useState(30);
  const [notificationLevel, setNotificationLevel] = useState<
    'low' | 'medium' | 'high'
  >('medium');

  const handleSave = () => {
    alert('設定を保存しました（モックアップ）');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800"
          >
            × 閉じる
          </button>
          <h1 className="text-2xl font-bold text-gray-800">設定</h1>
          <Button onClick={handleSave}>保存する</Button>
        </div>

        {/* セクション1: KPI閾値設定 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">
            信号機の色が変わる閾値
          </h2>

          <KPISlider
            label="売上達成率"
            initialValue={salesThreshold}
            min={80}
            max={100}
            unit="%"
            onChange={setSalesThreshold}
          />

          <KPISlider
            label="原価率"
            initialValue={costRateThreshold}
            min={25}
            max={40}
            unit="%"
            onChange={setCostRateThreshold}
          />

          <KPISlider
            label="人件費率"
            initialValue={laborCostThreshold}
            min={20}
            max={40}
            unit="%"
            onChange={setLaborCostThreshold}
          />
        </div>

        {/* セクション2: AI通知設定 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">
            AI通知設定
          </h2>
          <NotificationControl
            initialLevel={notificationLevel}
            onChange={setNotificationLevel}
          />
        </div>

        {/* セクション3: カスタムKPI */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">
            カスタムKPI管理
          </h2>
          <CustomKPIWizard />
        </div>
      </div>
    </div>
  );
}


