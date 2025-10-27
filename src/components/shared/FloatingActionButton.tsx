'use client';

import { MessageCircle } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';

export default function FloatingActionButton() {
  const { setIsModalOpen } = useChat();

  return (
    <button
      onClick={() => setIsModalOpen(true)}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg flex items-center justify-center transition-all duration-150 z-40"
      aria-label="AIチャットを開く"
    >
      <MessageCircle className="w-6 h-6 text-white" />
    </button>
  );
}

