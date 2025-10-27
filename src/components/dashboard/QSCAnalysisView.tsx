'use client';

import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import WordCloudChart from './WordCloudChart';
import Card from '@/components/shared/Card';
import { Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface QSCAnalysisViewProps {
  data: {
    summary: {
      google_rating: number;
      review_count: number;
      sentiment_ratio: { positive: number; negative: number };
    };
    trend_comparison: Array<{
      date: string;
      sales: number;
      rating: number;
    }>;
    topics: Array<{
      text: string;
      value: number;
      sentiment: 'positive' | 'negative';
    }>;
    reviews: Array<{
      text: string;
      keywords: string[];
      author: string;
      date: string;
    }>;
  };
}

export default function QSCAnalysisView({ data }: QSCAnalysisViewProps) {
  // グラフデータの整形
  const chartData = data.trend_comparison.map((item) => ({
    date: new Date(item.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
    売上: item.sales,
    評価点: item.rating,
  }));

  // 星評価の生成
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < fullStars
                ? 'fill-yellow-400 text-yellow-400'
                : i === fullStars && hasHalfStar
                ? 'fill-yellow-200 text-yellow-400'
                : 'fill-none text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 上段：サマリーKPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-sm text-gray-600 mb-2">Googleマップ評価</div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {data.summary.google_rating}
          </div>
          {renderStars(data.summary.google_rating)}
        </Card>
        
        <Card>
          <div className="text-sm text-gray-600 mb-2">口コミ投稿数</div>
          <div className="text-3xl font-bold text-gray-800">
            {data.summary.review_count}
            <span className="text-lg text-gray-500 ml-1">件</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">直近30日間</div>
        </Card>
        
        <Card>
          <div className="text-sm text-gray-600 mb-2">ポジティブ比率</div>
          <div className="text-3xl font-bold text-green-600">
            {data.summary.sentiment_ratio.positive}%
          </div>
          <div className="text-xs text-gray-500 mt-2">
            ネガティブ: {data.summary.sentiment_ratio.negative}%
          </div>
        </Card>
      </div>

      {/* 中段：トレンド比較グラフ */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 font-serif">
          売上 × 口コミ評価 トレンド比較
        </h3>
        
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis
              yAxisId="left"
              stroke="#6b7280"
              tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#6b7280"
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
            />
            <Tooltip
              formatter={(value: any, name: string) => {
                if (name === '売上') return formatCurrency(value);
                return value.toFixed(1);
              }}
            />
            <Legend />
            
            <Bar yAxisId="left" dataKey="売上" fill="#0B7FAD" name="売上高" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="評価点"
              stroke="#f59e0b"
              strokeWidth={3}
              name="Google評価点"
              dot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            💡 口コミ評価が上昇した週は、売上も連動して増加する傾向が見られます
          </p>
        </div>
      </div>

      {/* 下段：ワードクラウド */}
      {data.topics && data.reviews && (
        <WordCloudChart topics={data.topics} reviews={data.reviews} />
      )}
    </div>
  );
}

