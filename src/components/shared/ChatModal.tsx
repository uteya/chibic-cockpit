'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';

interface ChatModalProps {
  chatResponses: Record<string, string>;
}

export default function ChatModal({ chatResponses }: ChatModalProps) {
  const { messages, addMessage, isModalOpen, setIsModalOpen } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  // サジェスト
  const suggestions = [
    '人時売上を計算して',
    '昨日のピークタイムは？',
    '一番売れたメニューは？',
  ];

  // 新しいメッセージが追加されたら最下部にスクロール
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // ユーザーメッセージを追加
    addMessage('user', text);
    setInputValue('');
    setIsLoading(true);

    // 1秒待機（モックAI処理）
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // AI応答を取得
    const response = chatResponses[text] || chatResponses['default'] || 'ご質問ありがとうございます。';
    addMessage('ai', response);
    setIsLoading(false);
  };

  const handleSuggestionClick = (text: string) => {
    setInputValue(text);
  };

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center"
      onClick={() => setIsModalOpen(false)}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl h-[80vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 font-serif">
            チビックAIに質問する
          </h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4" ref={messageListRef}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>何でもお気軽にご質問ください</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-chibic-primary text-white font-medium'
                        : 'bg-gray-100 text-gray-900 font-medium'
                    }`}
                    style={{ whiteSpace: 'pre-line' }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 border-t border-gray-100 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-full text-sm hover:bg-blue-200 transition-colors whitespace-nowrap"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(inputValue);
                }
              }}
              placeholder="質問を入力してください..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-chibic-primary"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

