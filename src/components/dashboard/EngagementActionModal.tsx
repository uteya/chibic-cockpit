'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/shared/Button';

interface Customer {
  id: string;
  name: string;
}

interface CouponTemplate {
  id: string;
  name: string;
  message: string;
}

interface EngagementActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCustomers: Customer[];
  couponTemplates: CouponTemplate[];
}

export default function EngagementActionModal({
  isOpen,
  onClose,
  targetCustomers,
  couponTemplates,
}: EngagementActionModalProps) {
  const [selectedCouponId, setSelectedCouponId] = useState<string>('');

  if (!isOpen) return null;

  const selectedCoupon = couponTemplates.find((c) => c.id === selectedCouponId);

  const handleSend = () => {
    if (!selectedCouponId) {
      alert('クーポンを選択してください');
      return;
    }
    
    alert('対象の顧客に、特別クーポンがLINEで送信されました（モックアップ）');
    onClose();
  };

  // メッセージ内の顧客名を置換
  const getPreviewMessage = (template: string, customerName: string) => {
    return template.replace(/〇〇様/g, `${customerName}様`);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-[600px] w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 font-serif">
            特別クーポン送信の確認
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 送信対象顧客 */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3 font-serif">
              送信対象顧客
            </h3>
            <ol className="space-y-2 pl-5 list-decimal">
              {targetCustomers.map((customer) => (
                <li key={customer.id} className="text-gray-900 font-medium">
                  {customer.name}
                </li>
              ))}
            </ol>
          </div>

          {/* クーポン選択 */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3 font-serif">
              使用するクーポン
            </h3>
            <select
              value={selectedCouponId}
              onChange={(e) => setSelectedCouponId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chibic-primary"
            >
              <option value="">クーポンを選択してください</option>
              {couponTemplates.map((coupon) => (
                <option key={coupon.id} value={coupon.id}>
                  {coupon.name}
                </option>
              ))}
            </select>
          </div>

          {/* メッセージプレビュー */}
          {selectedCoupon && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 font-serif">
                送信メッセージ（プレビュー）
              </h3>
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">
                  例: {targetCustomers[0]?.name || '〇〇'}様への送信内容
                </div>
                <p className="text-gray-900 font-medium whitespace-pre-line">
                  {getPreviewMessage(selectedCoupon.message, targetCustomers[0]?.name || '〇〇')}
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={onClose}>
              キャンセル
            </Button>
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={!selectedCouponId}
            >
              送信する
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

