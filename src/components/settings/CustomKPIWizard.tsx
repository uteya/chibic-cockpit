'use client';

import { useState } from 'react';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';

interface CustomKPI {
  id: string;
  name: string;
  unit: string;
  target: number;
}

export default function CustomKPIWizard() {
  const [kpis, setKpis] = useState<CustomKPI[]>([
    { id: 'kpi_001', name: 'Google口コミ数', unit: '件', target: 10 },
    { id: 'kpi_002', name: 'ボトルキープ本数', unit: '本', target: 5 },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newKPI, setNewKPI] = useState({ name: '', unit: '', target: 0 });

  const handleAdd = () => {
    if (newKPI.name && newKPI.unit) {
      setKpis([
        ...kpis,
        {
          id: `kpi_${Date.now()}`,
          ...newKPI,
        },
      ]);
      setNewKPI({ name: '', unit: '', target: 0 });
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    setKpis(kpis.filter((kpi) => kpi.id !== id));
  };

  return (
    <div className="mb-6">
      <label className="text-sm font-semibold text-gray-700 mb-3 block">
        カスタムKPI管理
      </label>

      {/* KPIリスト */}
      <div className="space-y-3 mb-4">
        {kpis.map((kpi) => (
          <Card key={kpi.id} className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-800">{kpi.name}</div>
              <div className="text-sm text-gray-600">
                目標: {kpi.target}
                {kpi.unit}/日
              </div>
            </div>
            <button
              onClick={() => handleDelete(kpi.id)}
              className="text-red-600 hover:text-red-700 px-3 py-1"
            >
              削除
            </button>
          </Card>
        ))}
      </div>

      {/* 新規追加フォーム */}
      {isAdding ? (
        <Card className="bg-gray-50">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 block mb-1">
                KPI名
              </label>
              <input
                type="text"
                value={newKPI.name}
                onChange={(e) =>
                  setNewKPI({ ...newKPI, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="例: Google口コミ数"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">単位</label>
              <input
                type="text"
                value={newKPI.unit}
                onChange={(e) =>
                  setNewKPI({ ...newKPI, unit: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="例: 件"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">
                目標値
              </label>
              <input
                type="number"
                value={newKPI.target}
                onChange={(e) =>
                  setNewKPI({ ...newKPI, target: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleAdd}>
                保存
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsAdding(false)}
              >
                キャンセル
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button variant="secondary" onClick={() => setIsAdding(true)}>
          ＋ 新規KPIを追加
        </Button>
      )}
    </div>
  );
}


