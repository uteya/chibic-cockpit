'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ComposedChart,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import type { SalesTrend } from '@/types';
import { formatCurrency } from '@/lib/utils';
import FlagMarker from './FlagMarker';

interface ActionLog {
  date: string;
  text: string;
}

interface MainChartProps {
  data: SalesTrend;
  title: string;
  actionLogs?: ActionLog[];
}

export default function MainChart({ data, title, actionLogs = [] }: MainChartProps) {
  const [tooltipData, setTooltipData] = useState<any>(null);
  const [selectedLog, setSelectedLog] = useState<{ date: string; text: string } | null>(null);

  // Recharts用のデータ整形
  const chartData = data.dates.map((date, index) => {
    const logsForDate = actionLogs.filter((log) => log.date === date);
    return {
      date: new Date(date).toLocaleDateString('ja-JP', {
        month: 'numeric',
        day: 'numeric',
      }),
      fullDate: date,
      actual: data.actual[index],
      lastYear: data.last_year[index],
      forecast: data.forecast[index],
      upperBound: data.normal_range?.upper[index] || null,
      lowerBound: data.normal_range?.lower[index] || null,
      hasAction: logsForDate.length > 0,
      actionLogs: logsForDate,
    };
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">{title}</h3>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" />
          <YAxis
            stroke="#6b7280"
            tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(label) => `日付: ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                actual: '実績売上',
                lastYear: '昨年同曜日',
                forecast: '予測',
                upperBound: '正常範囲（上限）',
                lowerBound: '正常範囲（下限）',
              };
              return labels[value] || value;
            }}
          />

          {/* 正常範囲（シェード）- 凡例に表示しない */}
          {data.normal_range && (
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="none"
              fill="#3b82f6"
              fillOpacity={0.1}
              legendType="none"
            />
          )}

          {/* 昨年同曜日 */}
          <Line
            type="monotone"
            dataKey="lastYear"
            stroke="#9ca3af"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="昨年同曜日"
            dot={false}
          />

          {/* 実績売上 */}
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#0B7FAD"
            strokeWidth={3}
            name="実績売上"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />

          {/* 予測 */}
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="3 3"
            name="予測"
            dot={false}
          />
          
          {/* 旗マーカー */}
          {chartData.map((entry, index) =>
            entry.hasAction ? (
              <ReferenceDot
                key={`flag-${index}`}
                x={entry.date}
                y={entry.actual}
                r={0}
                shape={(props: any) => (
                  <FlagMarker
                    cx={props.cx}
                    cy={props.cy}
                    onClick={() => {
                      const allLogs = entry.actionLogs.map((log) => log.text).join('\n\n---\n\n');
                      setSelectedLog({ date: entry.fullDate, text: allLogs });
                    }}
                  />
                )}
              />
            ) : null
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* 旗クリック時のポップオーバー */}
      {selectedLog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-bold text-gray-800 mb-3 font-serif">
              実施した対策（{new Date(selectedLog.date).toLocaleDateString('ja-JP')}）
            </h4>
            <p className="text-gray-700 whitespace-pre-line">{selectedLog.text}</p>
            <button
              onClick={() => setSelectedLog(null)}
              className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* スワイプ操作のヒント */}
      <div className="mt-4 text-center text-sm text-gray-500">
        💡 左右にスワイプで日付を移動 | グラフを長押しで詳細表示
      </div>
    </div>
  );
}

