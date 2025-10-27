'use client';

import { useRouter } from 'next/navigation';
import Card from '@/components/shared/Card';
import KPIIcon from './KPIIcon';
import { Store } from '@/types';

interface StoreTileProps {
  store: Store;
}

export default function StoreTile({ store }: StoreTileProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/${store.store_id}/kpis`);
  };

  // スパークライン（簡易版）
  const max = Math.max(...store.sparkline);
  const min = Math.min(...store.sparkline);
  const range = max - min;

  return (
    <Card
      className="hover:shadow-lg transition-all cursor-pointer"
      onClick={handleClick}
    >
      {/* 店舗名 */}
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        {store.store_name}
      </h3>

      {/* KPI信号機 */}
      <div className="flex justify-around mb-4 pb-4 border-b border-gray-200">
        <KPIIcon
          type="sales"
          status={store.kpis.sales.status}
          value={store.kpis.sales.actual}
        />
        <KPIIcon
          type="cost_rate"
          status={store.kpis.cost_rate.status}
          value={store.kpis.cost_rate.actual}
          unit="%"
        />
        <KPIIcon
          type="labor_cost_rate"
          status={store.kpis.labor_cost_rate.status}
          value={store.kpis.labor_cost_rate.actual}
          unit="%"
        />
      </div>

      {/* 売上トレンド（スパークライン） */}
      <div className="relative h-16">
        <div className="absolute inset-0 flex items-end justify-between gap-1">
          {store.sparkline.map((value, index) => {
            const height = range > 0 ? ((value - min) / range) * 100 : 50;
            return (
              <div
                key={index}
                className="flex-1 bg-chibic-primary rounded-t opacity-60"
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
        <div className="absolute bottom-0 left-0 text-xs text-gray-500">
          過去7日間
        </div>
      </div>
    </Card>
  );
}


