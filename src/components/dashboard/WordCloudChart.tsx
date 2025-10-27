'use client';

import { useState } from 'react';

interface Topic {
  text: string;
  value: number;
  sentiment: 'positive' | 'negative';
}

interface Review {
  text: string;
  keywords: string[];
  author: string;
  date: string;
}

interface WordCloudChartProps {
  topics: Topic[];
  reviews: Review[];
}

export default function WordCloudChart({ topics, reviews }: WordCloudChartProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  // データが空の場合の早期リターン
  if (!topics || topics.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 font-serif">
          AIによる口コミトピック分析
        </h3>
        <div className="h-80 flex items-center justify-center text-gray-500">
          <p>口コミデータがありません</p>
        </div>
      </div>
    );
  }

  // 選択された単語を含む口コミを抽出
  const relatedReviews = selectedWord && reviews && Array.isArray(reviews)
    ? reviews.filter((review) => review.keywords && review.keywords.includes(selectedWord)).slice(0, 3)
    : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 font-serif">
        AIによる口コミトピック分析
      </h3>
      
      {/* シンプルなワードクラウド風表示（React 19対応版） */}
      <div className="h-80 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100 p-8">
        <div className="flex flex-wrap gap-4 items-center justify-center max-w-2xl">
          {topics.map((topic) => {
            // valueに応じてサイズを調整
            const fontSize = 14 + (topic.value * 8);
            const fontWeight = topic.value > 3 ? 'bold' : 'semibold';
            
            return (
              <button
                key={topic.text}
                onClick={() => setSelectedWord(topic.text)}
                className={`transition-all hover:scale-110 cursor-pointer ${
                  topic.sentiment === 'positive'
                    ? 'text-semantic-success hover:text-green-700'
                    : 'text-semantic-danger hover:text-red-700'
                }`}
                style={{
                  fontSize: `${fontSize}px`,
                  fontWeight: fontWeight,
                }}
              >
                {topic.text}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-semantic-success rounded-full"></div>
          <span className="text-gray-600">ポジティブ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-semantic-danger rounded-full"></div>
          <span className="text-gray-600">ネガティブ</span>
        </div>
        <div className="text-gray-500">※ 単語の大きさ = 出現頻度</div>
      </div>

      {/* 単語クリック時のポップオーバー */}
      {selectedWord && relatedReviews.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedWord(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[70vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-gray-800 font-serif">
                「{selectedWord}」に関する口コミ（{relatedReviews.length}件）
              </h4>
              <button
                onClick={() => setSelectedWord(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {relatedReviews.map((review, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span className="font-semibold">{review.author}</span>
                    <span>{review.date}</span>
                  </div>
                  <p className="text-gray-800">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
