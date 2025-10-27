'use client';

import { useState } from 'react';

interface NotificationControlProps {
  initialLevel: 'low' | 'medium' | 'high';
  onChange: (level: 'low' | 'medium' | 'high') => void;
}

export default function NotificationControl({
  initialLevel,
  onChange,
}: NotificationControlProps) {
  const [level, setLevel] = useState(initialLevel);

  const levels = [
    { id: 'low' as const, label: '低', description: '重要な問題のみ通知' },
    { id: 'medium' as const, label: '中', description: '標準的な通知' },
    { id: 'high' as const, label: '高', description: '小さな変化も通知' },
  ];

  const handleChange = (newLevel: 'low' | 'medium' | 'high') => {
    setLevel(newLevel);
    onChange(newLevel);
  };

  return (
    <div className="mb-6">
      <label className="text-sm font-semibold text-gray-700 mb-3 block">
        AI通知感度
      </label>
      <div className="flex gap-3">
        {levels.map((item) => (
          <button
            key={item.id}
            onClick={() => handleChange(item.id)}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              level === item.id
                ? 'border-chibic-primary bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold text-gray-800 mb-1">
              {item.label}
            </div>
            <div className="text-xs text-gray-600">{item.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}


