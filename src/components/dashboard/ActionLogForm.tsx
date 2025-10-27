'use client';

import { useState } from 'react';
import Button from '@/components/shared/Button';
import { toast } from 'react-hot-toast';

interface ActionLogFormProps {
  onSubmit: (text: string, date: string) => void;
  currentDate: string;
}

export default function ActionLogForm({ onSubmit, currentDate }: ActionLogFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [actionText, setActionText] = useState('');

  const handleSubmit = () => {
    if (!actionText.trim()) {
      toast.error('対策内容を入力してください');
      return;
    }

    onSubmit(actionText, currentDate);
    setActionText('');
    setIsExpanded(false);
    toast.success('対策を記録しました');
  };

  if (!isExpanded) {
    return (
      <div className="mt-4">
        <Button
          variant="secondary"
          onClick={() => setIsExpanded(true)}
          className="w-full"
        >
          ＋ 対策を記録する
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-accordion">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        実施した対策を記録
      </label>
      <textarea
        value={actionText}
        onChange={(e) => setActionText(e.target.value)}
        placeholder="例：新しいディナーセットを導入し、SNSで告知した"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-chibic-primary"
        rows={3}
      />
      <div className="mt-3 flex gap-2 justify-end">
        <Button
          variant="secondary"
          onClick={() => {
            setIsExpanded(false);
            setActionText('');
          }}
          className="font-semibold"
        >
          キャンセル
        </Button>
        <Button variant="primary" onClick={handleSubmit} className="font-semibold">
          記録する
        </Button>
      </div>
    </div>
  );
}

