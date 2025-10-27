'use client';

import { useState, useEffect } from 'react';
import { Noto_Serif_JP } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { ChatProvider } from '@/contexts/ChatContext';
import FloatingActionButton from '@/components/shared/FloatingActionButton';
import ChatModal from '@/components/shared/ChatModal';
import './globals.css';

const notoSerifJP = Noto_Serif_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-serif',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [chatResponses, setChatResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/mockData.json')
      .then((res) => res.json())
      .then((data) => setChatResponses(data.chat_responses || {}))
      .catch((err) => console.error('chat_responses読み込み失敗:', err));
  }, []);

  return (
    <html lang="ja">
      <body className={`min-h-screen bg-gray-50 ${notoSerifJP.variable}`}>
        <Toaster position="top-right" />
        <ChatProvider>
          {children}
          <FloatingActionButton />
          <ChatModal chatResponses={chatResponses} />
        </ChatProvider>
      </body>
    </html>
  );
}


