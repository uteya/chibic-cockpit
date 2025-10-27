# 🎯 完璧な実装計画書 - インタラクティブBI Ver.2.0

**作成日:** 2025年10月25日  
**ステータス:** 実行準備完了  
**想定所要時間:** 7-9.5時間  
**バックアップ戦略:** 各Phase前にバックアップ取得

---

## 📋 目次

1. [実装の前提条件と確定事項](#1-実装の前提条件と確定事項)
2. [Phase 0: 事前準備とバックアップ](#phase-0-事前準備とバックアップ)
3. [Phase 1: 対話型インターフェース](#phase-1-対話型インターフェース最優先)
4. [Phase 2: PDCAサイクル支援](#phase-2-pdcaサイクル支援優先度2)
5. [Phase 3: QSC分析](#phase-3-qsc分析優先度3)
6. [Phase 4: 顧客エンゲージメント](#phase-4-顧客エンゲージメント優先度4)
7. [Phase 5: 最終確認とドキュメント更新](#phase-5-最終確認とドキュメント更新)

---

## 1. 実装の前提条件と確定事項

### 1.1 技術的確定事項

| 項目 | 確定内容 |
|-----|---------|
| **プロジェクト構成** | 現在の`cockpit-mockup`を継続使用 |
| **既存コンポーネント** | 現状維持（独自のButton, Card, Badge） |
| **フォント** | 見出しのみ`font-serif`（Noto Serif JP）適用 |
| **TypeScript** | strict mode継続（any禁止） |
| **エラー表示** | react-hot-toastを導入 |
| **モックデータ** | 最低限のデータ（1-2パターン） |

### 1.2 新規導入ライブラリ

```json
{
  "dependencies": {
    "@chatscope/chat-ui-kit-react": "^2.0.3",
    "lucide-react": "^0.460.0",
    "react-wordcloud": "^1.2.7",
    "react-hot-toast": "^2.4.1"
  }
}
```

### 1.3 状態管理戦略

| 機能 | 管理方法 | 永続化 |
|-----|---------|-------|
| **チャット履歴** | React Context | 画面遷移時も保持 |
| **チャットモーダル開閉** | Context | - |
| **対策ログ** | DetailDashboardのローカルstate | なし |
| **Engagementモーダル** | DetailDashboardのローカルstate | なし |
| **QSCタブ** | DetailDashboardのactiveMenu | なし |

### 1.4 ファイル配置規則

```
src/components/
├── shared/              # 全画面共通（新規追加ここ）
│   ├── FloatingActionButton.tsx
│   ├── ChatModal.tsx
│   └── Toast.tsx
├── cockpit/            # S-01専用
├── dashboard/          # S-02専用
│   ├── ActionLogForm.tsx        # 新規
│   ├── FlagMarker.tsx           # 新規
│   ├── QSCAnalysisView.tsx      # 新規
│   ├── WordCloudChart.tsx       # 新規
│   └── EngagementActionModal.tsx # 新規
└── settings/           # S-03専用
```

---

## Phase 0: 事前準備とバックアップ（15分）

### Step 0.1: 現在の完成版バックアップ

```bash
# 実行コマンド
cd /Users/apple/Downloads/選択項目から作成したフォルダ/cockpit-mockup
cp -r src src_phase2_complete
cp public/mockData.json public/mockData_phase2_complete.json
git add -A
git commit -m "backup: Phase 2完了版（Ver.2.0実装前）"
```

### Step 0.2: 新規ライブラリのインストール

```bash
# 実行コマンド
pnpm add @chatscope/chat-ui-kit-react lucide-react react-wordcloud react-hot-toast
pnpm add -D @types/react-wordcloud
```

**想定出力:**
```
dependencies:
+ @chatscope/chat-ui-kit-react 2.0.3
+ lucide-react 0.460.0
+ react-wordcloud 1.2.7
+ react-hot-toast 2.4.1

devDependencies:
+ @types/react-wordcloud 1.2.7
```

### Step 0.3: Noto Serif JPフォントの追加

**ファイル:** `src/app/layout.tsx`

```tsx
// 追加するimport
import { Noto_Serif_JP } from 'next/font/google';

// フォント設定
const notoSerifJP = Noto_Serif_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-serif',
});

// body要素に追加
<body className={`min-h-screen bg-gray-50 ${notoSerifJP.variable}`}>
```

### Step 0.4: Toastプロバイダーの追加

**ファイル:** `src/app/layout.tsx`

```tsx
import { Toaster } from 'react-hot-toast';

// bodyの子要素として追加
<body className={`min-h-screen bg-gray-50 ${notoSerifJP.variable}`}>
  <Toaster position="top-right" />
  {children}
</body>
```

---

## Phase 1: 対話型インターフェース（最優先）- 2.5時間

### バックアップ: Phase 1開始前

```bash
cp -r src src_before_phase1_chat
cp public/mockData.json public/mockData_before_phase1.json
```

---

### Step 1.1: ChatContextの作成（15分）

**新規ファイル:** `src/contexts/ChatContext.tsx`

```tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: Message[];
  addMessage: (sender: 'user' | 'ai', text: string) => void;
  clearMessages: () => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addMessage = (sender: 'user' | 'ai', text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender,
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        addMessage,
        clearMessages,
        isModalOpen,
        setIsModalOpen,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
```

**実装チェック:**
- ✅ TypeScript strict対応
- ✅ 画面遷移後も履歴保持
- ✅ Context APIで全画面共有

---

### Step 1.2: ChatProviderをlayout.tsxに追加（5分）

**ファイル:** `src/app/layout.tsx`

```tsx
import { ChatProvider } from '@/contexts/ChatContext';

// 既存のbodyを囲む
<body className={`min-h-screen bg-gray-50 ${notoSerifJP.variable}`}>
  <Toaster position="top-right" />
  <ChatProvider>
    {children}
  </ChatProvider>
</body>
```

---

### Step 1.3: FloatingActionButton.tsx の実装（20分）

**新規ファイル:** `src/components/shared/FloatingActionButton.tsx`

```tsx
'use client';

import { MessageCircle } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';

export default function FloatingActionButton() {
  const { setIsModalOpen } = useChat();

  return (
    <button
      onClick={() => setIsModalOpen(true)}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-chibic-primary hover:bg-chibic-primary-hover active:bg-chibic-primary-active shadow-lg flex items-center justify-center transition-all duration-150 z-40"
      aria-label="AIチャットを開く"
    >
      <MessageCircle className="w-6 h-6 text-white" />
    </button>
  );
}
```

**実装チェック:**
- ✅ 直径56px（w-14 h-14）
- ✅ 画面右下に固定（bottom-6 right-6 = 24px）
- ✅ z-index 40（モーダルより下）
- ✅ chibic-primaryカラー使用
- ✅ Lucide-reactアイコン使用

---

### Step 1.4: ChatModal.tsx の実装（60分）

**新規ファイル:** `src/components/shared/ChatModal.tsx`

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
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
                        ? 'bg-chibic-primary text-white'
                        : 'bg-gray-100 text-gray-800'
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
                className="px-4 py-2 bg-blue-50 text-chibic-primary rounded-full text-sm hover:bg-blue-100 transition-colors whitespace-nowrap"
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
              className="px-4 py-2 bg-chibic-primary text-white rounded-lg hover:bg-chibic-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**実装チェック:**
- ✅ 画面下からスライドイン（animate-slide-up）
- ✅ 高さ80vh
- ✅ サジェストチップ横スクロール対応
- ✅ 送信ボタン無効化とスピナー
- ✅ Enterキーで送信（Shift+Enterで改行）
- ✅ 完全一致でレスポンス検索
- ✅ white-space: pre-lineで改行表示
- ✅ 自動スクロール

---

### Step 1.5: globals.cssにアニメーション追加（5分）

**ファイル:** `src/app/globals.css`

```css
/* 既存の内容の後に追加 */

@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 300ms ease-out;
}

.animate-bounce {
  animation: bounce 1s infinite;
}

.delay-100 {
  animation-delay: 100ms;
}

.delay-200 {
  animation-delay: 200ms;
}
```

---

### Step 1.6: S-01, S-02にFAB追加（10分）

**ファイル:** `src/app/layout.tsx`

```tsx
import FloatingActionButton from '@/components/shared/FloatingActionButton';
import ChatModal from '@/components/shared/ChatModal';

// ChatProvider内、childrenの後に追加
<ChatProvider>
  {children}
  <FloatingActionButton />
  <ChatModal chatResponses={mockChatResponses} />
</ChatProvider>
```

**注意:** `mockChatResponses`は後でmockData.jsonから読み込みます。

---

### Step 1.7: mockData.jsonにchat_responses追加（10分）

**ファイル:** `public/mockData.json`

トップレベルに以下を追加：

```json
{
  "version": "2.0.0",
  "chat_responses": {
    "人時売上を計算して": "承知いたしました。全店舗の本日付けの人時売上は以下の通りです。\n\n- 八重洲店: 5,250円\n- 新橋店: 4,800円\n- 渋谷店: 5,500円",
    "昨日のピークタイムは？": "昨日の売上ピークタイムは、19:00〜20:00でした。この時間帯の売上は全体の25%を占めています。",
    "一番売れたメニューは？": "昨日、全店舗で最も売れたメニューは「生ビール」で、合計350杯です。次いで「唐揚げ」が280皿でした。",
    "default": "ご質問ありがとうございます。申し訳ありませんが、そのご質問には現在お答えできません。（モックアップ）"
  },
  "stores": [ ... ]
}
```

---

### Step 1.8: layout.tsxでmockData読み込み（15分）

**ファイル:** `src/app/layout.tsx`

```tsx
'use client';

// ※ layout.tsxをClient Componentに変更する必要があります

import { useState, useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
```

---

### Step 1.9: 動作確認（10分）

**確認項目:**
- ✅ FABが右下に表示される
- ✅ FABクリックでモーダル表示
- ✅ サジェストチップクリックで入力欄に反映
- ✅ 送信ボタンで質問送信
- ✅ 1秒後にAI応答表示
- ✅ 改行が正しく表示される
- ✅ 画面遷移後も履歴保持

---

## Phase 2: PDCAサイクル支援（優先度2）- 2時間

### バックアップ: Phase 2開始前

```bash
cp -r src src_before_phase2_pdca
cp public/mockData.json public/mockData_before_phase2.json
```

---

### Step 2.1: ActionLogForm.tsx の実装（30分）

**新規ファイル:** `src/components/dashboard/ActionLogForm.tsx`

```tsx
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
        >
          キャンセル
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          記録する
        </Button>
      </div>
    </div>
  );
}
```

**追加CSS:** `src/app/globals.css`

```css
@keyframes accordion {
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 500px;
    opacity: 1;
  }
}

.animate-accordion {
  animation: accordion 200ms ease-out;
}
```

---

### Step 2.2: FlagMarker.tsx の実装（20分）

**新規ファイル:** `src/components/dashboard/FlagMarker.tsx`

```tsx
import { Flag } from 'lucide-react';

interface FlagMarkerProps {
  cx: number;
  cy: number;
  onClick: () => void;
}

export default function FlagMarker({ cx, cy, onClick }: FlagMarkerProps) {
  return (
    <g transform={`translate(${cx},${cy})`}>
      <circle
        r={12}
        fill="#3b82f6"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onClick}
      />
      <foreignObject x="-10" y="-10" width="20" height="20">
        <div className="flex items-center justify-center">
          <Flag className="w-3 h-3 text-white" />
        </div>
      </foreignObject>
    </g>
  );
}
```

---

### Step 2.3: MainChart.tsxに旗プロット機能追加（40分）

**ファイル:** `src/components/dashboard/MainChart.tsx`

```tsx
// 追加のimport
import { useState } from 'react';
import { ReferenceDot } from 'recharts';
import FlagMarker from './FlagMarker';

// propsに追加
interface MainChartProps {
  data: SalesTrend;
  title: string;
  actionLogs?: Array<{ date: string; text: string }>;
}

export default function MainChart({ data, title, actionLogs = [] }: MainChartProps) {
  const [selectedLog, setSelectedLog] = useState<{ date: string; text: string } | null>(null);

  // ... 既存のコード ...

  // グラフデータに旗フラグを追加
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
      <h3 className="text-xl font-bold text-gray-800 mb-6 font-serif">{title}</h3>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          {/* 既存のグラフコード */}
          
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
                    cy={props.cy - 20}
                    onClick={() => {
                      // 複数ログがある場合は全て表示
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
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h4 className="text-lg font-bold text-gray-800 mb-3 font-serif">
              実施した対策（{selectedLog.date}）
            </h4>
            <p className="text-gray-700 whitespace-pre-line">{selectedLog.text}</p>
            <button
              onClick={() => setSelectedLog(null)}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
```

---

### Step 2.4: DetailDashboard([storeId]/kpis/page.tsx)に統合（20分）

```tsx
// 追加のstate
const [actionLogs, setActionLogs] = useState<Array<{ date: string; text: string }>>([]);

// useEffectでmockDataから初期ログを読み込み
useEffect(() => {
  if (analytics.action_logs) {
    setActionLogs(analytics.action_logs);
  }
}, [analytics]);

// ActionLogFormの追加（AI分析パネルの下）
{insight && (
  <>
    <div className="mb-8">
      <AIInsightPanel insight={insight} />
    </div>
    
    {/* アクションボタン */}
    <div className="mb-4">
      <ActionButtons actions={insight.recommended_actions} />
    </div>
    
    {/* 対策ログフォーム */}
    <ActionLogForm
      onSubmit={(text, date) => {
        setActionLogs([...actionLogs, { date, text }]);
      }}
      currentDate={currentDate}
    />
  </>
)}

// MainChartにactionLogsを渡す
<MainChart
  data={analytics.sales_trend}
  title="売上トレンド（過去7日間）"
  actionLogs={actionLogs}
/>
```

---

### Step 2.5: mockData.jsonにaction_logs追加（5分）

```json
"detail_analytics": {
  "st0002": {
    "sales_trend": { ... },
    "action_logs": [
      {
        "date": "2025-10-22",
        "text": "新しいディナーセットの提供を開始し、Instagramで告知キャンペーンを実施。"
      }
    ],
    ...
  }
}
```

---

### Step 2.6: Phase 2動作確認（10分）

**確認項目:**
- ✅ 「＋対策を記録する」ボタン表示
- ✅ クリックでフォーム展開（アニメーション）
- ✅ テキスト入力→記録ボタン
- ✅ トースト通知「記録しました」
- ✅ グラフに旗が表示される
- ✅ 旗クリックでポップオーバー表示
- ✅ 複数ログがある場合も正常動作

---

## Phase 3: QSC分析（優先度3）- 2.5時間

### バックアップ: Phase 3開始前

```bash
cp -r src src_before_phase3_qsc
cp public/mockData.json public/mockData_before_phase3.json
```

---

### Step 3.1: WordCloudChart.tsx の実装（40分）

**新規ファイル:** `src/components/dashboard/WordCloudChart.tsx`

```tsx
'use client';

import { useState } from 'react';
import ReactWordcloud from 'react-wordcloud';

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

  // ワードクラウド用のデータ整形
  const words = topics.map((topic) => ({
    text: topic.text,
    value: topic.value,
  }));

  // カスタムカラーコールバック
  const callbacks = {
    getWordColor: (word: any) => {
      const topic = topics.find((t) => t.text === word.text);
      return topic?.sentiment === 'positive' ? '#22c55e' : '#ef4444';
    },
    onWordClick: (word: any) => {
      setSelectedWord(word.text);
    },
  };

  // 選択された単語を含む口コミを抽出
  const relatedReviews = selectedWord
    ? reviews.filter((review) => review.keywords.includes(selectedWord)).slice(0, 3)
    : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 font-serif">
        AIによる口コミトピック分析
      </h3>
      
      <div className="h-80">
        <ReactWordcloud words={words} callbacks={callbacks} />
      </div>

      {/* 単語クリック時のポップオーバー */}
      {selectedWord && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[70vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-gray-800 font-serif">
                「{selectedWord}」に関する口コミ（{relatedReviews.length}件）
              </h4>
              <button
                onClick={() => setSelectedWord(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {relatedReviews.map((review, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{review.author}</span>
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
```

---

### Step 3.2: QSCAnalysisView.tsx の実装（50分）

**新規ファイル:** `src/components/dashboard/QSCAnalysisView.tsx`

```tsx
'use client';

import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import WordCloudChart from './WordCloudChart';
import Card from '@/components/shared/Card';
import { Star } from 'lucide-react';

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
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < fullStars
                ? 'fill-yellow-400 text-yellow-400'
                : i === fullStars && hasHalfStar
                ? 'fill-yellow-200 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 上段：サマリーKPI */}
      <div className="grid grid-cols-3 gap-6">
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
            <YAxis yAxisId="right" orientation="right" stroke="#6b7280" domain={[0, 5]} />
            <Tooltip />
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
        
        <div className="mt-4 text-sm text-gray-600">
          💡 口コミ評価が上昇した週は、売上も連動して増加する傾向が見られます
        </div>
      </div>

      {/* 下段：ワードクラウド */}
      <WordCloudChart topics={data.topics} reviews={data.reviews} />
    </div>
  );
}
```

---

### Step 3.3: サイドメニューにQSCタブ追加（10分）

**ファイル:** `src/app/[storeId]/kpis/page.tsx`

```tsx
// import追加
import { Smile } from 'lucide-react';
import QSCAnalysisView from '@/components/dashboard/QSCAnalysisView';

// MENU_ITEMSに追加
const MENU_ITEMS = [
  { id: 'sales', label: '売上分析', icon: '💰' },
  { id: 'cost', label: '原価分析', icon: '🍽️' },
  { id: 'labor', label: '人件費分析', icon: '👥' },
  { id: 'menu', label: 'メニュー分析', icon: '📊' },
  { id: 'staff', label: '人員配置分析', icon: '👔' },
  { id: 'qsc', label: 'QSC分析', icon: <Smile className="w-5 h-5 inline" /> },
];

// レンダリングに追加
{activeMenu === 'qsc' && analytics.qsc_analysis && (
  <div className="mb-8">
    <QSCAnalysisView data={analytics.qsc_analysis} />
  </div>
)}
```

---

### Step 3.4: mockData.jsonにqsc_analysis追加（15分）

```json
"detail_analytics": {
  "st0002": {
    "qsc_analysis": {
      "summary": {
        "google_rating": 4.2,
        "review_count": 15,
        "sentiment_ratio": { "positive": 80, "negative": 20 }
      },
      "trend_comparison": [
        { "date": "2025-10-18", "sales": 520000, "rating": 4.1 },
        { "date": "2025-10-19", "sales": 550000, "rating": 4.3 },
        { "date": "2025-10-20", "sales": 450000, "rating": 3.9 },
        { "date": "2025-10-21", "sales": 600000, "rating": 4.5 },
        { "date": "2025-10-22", "sales": 620000, "rating": 4.2 },
        { "date": "2025-10-23", "sales": 580000, "rating": 4.4 },
        { "date": "2025-10-24", "sales": 480000, "rating": 4.0 }
      ],
      "topics": [
        { "text": "接客が丁寧", "value": 5, "sentiment": "positive" },
        { "text": "刺身が新鮮", "value": 3, "sentiment": "positive" },
        { "text": "提供が遅い", "value": 4, "sentiment": "negative" },
        { "text": "個室が良い", "value": 2, "sentiment": "positive" },
        { "text": "トイレが汚い", "value": 1, "sentiment": "negative" }
      ],
      "reviews": [
        {
          "text": "いつも接客が丁寧で、料理も美味しいです。ただ、週末は提供が遅いのが少し残念。",
          "keywords": ["接客が丁寧", "提供が遅い"],
          "author": "山田太郎",
          "date": "2025-10-23"
        },
        {
          "text": "刺身が新鮮で本当に美味しい！個室もあって使いやすいです。",
          "keywords": ["刺身が新鮮", "個室が良い"],
          "author": "佐藤花子",
          "date": "2025-10-22"
        },
        {
          "text": "料理は美味しいのですが、トイレの清掃をもう少し頻繁にお願いしたいです。",
          "keywords": ["トイレが汚い"],
          "author": "鈴木一郎",
          "date": "2025-10-20"
        }
      ]
    }
  }
}
```

---

### Step 3.5: 型定義の追加（10分）

**ファイル:** `src/types/index.ts`

```typescript
export interface QSCAnalysis {
  summary: {
    google_rating: number;
    review_count: number;
    sentiment_ratio: {
      positive: number;
      negative: number;
    };
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
}

// DetailAnalyticsに追加
export interface DetailAnalytics {
  [storeId: string]: {
    sales_trend: SalesTrend;
    hourly_breakdown: HourlyBreakdown;
    menu_analysis?: { ... };
    staff_analysis?: { ... };
    qsc_analysis?: QSCAnalysis;  // 追加
    action_logs?: Array<{ date: string; text: string }>;  // 追加
  };
}
```

---

### Step 3.6: Phase 3動作確認（15分）

**確認項目:**
- ✅ サイドメニューに「QSC分析」タブ表示
- ✅ タブクリックでQSC画面表示
- ✅ サマリーKPIが3つ表示
- ✅ 星アイコンが正しく表示
- ✅ 複合グラフが表示（左軸=売上、右軸=評価点）
- ✅ ワードクラウドが表示
- ✅ 単語クリックで口コミポップオーバー表示

---

## Phase 4: 顧客エンゲージメント（優先度4）- 1.5時間

### バックアップ: Phase 4開始前

```bash
cp -r src src_before_phase4_engagement
cp public/mockData.json public/mockData_before_phase4.json
```

---

### Step 4.1: EngagementActionModal.tsx の実装（45分）

**新規ファイル:** `src/components/dashboard/EngagementActionModal.tsx`

```tsx
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
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
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
            <ol className="space-y-2">
              {targetCustomers.map((customer, index) => (
                <li key={customer.id} className="text-gray-700">
                  {index + 1}. {customer.name}
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">例: 田中太郎様への送信内容</div>
                <p className="text-gray-800 whitespace-pre-line">
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
```

---

### Step 4.2: AIInsightPanelに条件付きボタン追加（20分）

**ファイル:** `src/components/dashboard/AIInsightPanel.tsx`

```tsx
// propsに追加
interface AIInsightPanelProps {
  insight: AIInsight;
  onEngagementAction?: () => void;  // 追加
  isEngagementType?: boolean;        // 追加
}

export default function AIInsightPanel({
  insight,
  onEngagementAction,
  isEngagementType = false,
}: AIInsightPanelProps) {
  // ... 既存のコード ...

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white">
      {/* 既存のコンテンツ */}
      
      {/* エンゲージメントボタン（条件付き表示） */}
      {isEngagementType && onEngagementAction && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onEngagementAction}
            className="w-full px-5 py-3 bg-chibic-primary text-white rounded-lg hover:bg-chibic-primary-hover font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Megaphone className="w-5 h-5" />
            「特別クーポン」を、対象顧客にLINEで送信する
          </button>
        </div>
      )}
    </Card>
  );
}
```

---

### Step 4.3: DetailDashboardに統合（15分）

**ファイル:** `src/app/[storeId]/kpis/page.tsx`

```tsx
// import追加
import EngagementActionModal from '@/components/dashboard/EngagementActionModal';

// state追加
const [isEngagementModalOpen, setIsEngagementModalOpen] = useState(false);
const [engagementData, setEngagementData] = useState<any>(null);

// useEffectでengagement_insightを読み込み
useEffect(() => {
  fetch('/mockData.json')
    .then((res) => res.json())
    .then((data) => {
      setMockData(data);
      if (data.engagement_insight && data.engagement_insight.store_id === storeId) {
        setEngagementData(data.engagement_insight);
      }
    });
}, [storeId]);

// AIInsightPanelの呼び出しを修正
{insight && (
  <div className="mb-8">
    <AIInsightPanel
      insight={engagementData || insight}
      isEngagementType={!!engagementData}
      onEngagementAction={() => setIsEngagementModalOpen(true)}
    />
  </div>
)}

// モーダルを追加
{engagementData && (
  <EngagementActionModal
    isOpen={isEngagementModalOpen}
    onClose={() => setIsEngagementModalOpen(false)}
    targetCustomers={engagementData.target_customers || []}
    couponTemplates={mockData?.coupon_templates || []}
  />
)}
```

---

### Step 4.4: mockData.jsonに追加（10分）

```json
{
  "engagement_insight": {
    "store_id": "st0002",
    "type": "engagement",
    "observation": "「ゴールドランク顧客」の平均来店間隔が、先月の25日から、今月は40日へと長期化しています。",
    "clue": "来店が途絶えている顧客リスト（5名）",
    "logic": "主要な常連客が離反する兆候です。早急なフォローアップを検討しませんか？",
    "target_customers": [
      { "id": "c001", "name": "田中 太郎" },
      { "id": "c002", "name": "鈴木 一郎" },
      { "id": "c003", "name": "佐藤 次郎" },
      { "id": "c004", "name": "高橋 三郎" },
      { "id": "c005", "name": "伊藤 四郎" }
    ]
  },
  "coupon_templates": [
    {
      "id": "coupon01",
      "name": "【特別ご優待】ドリンク1杯無料クーポン",
      "message": "〇〇様、いつもありがとうございます！最近お会いできず寂しいです。ささやかですが、ドリンク1杯無料クーポンをお送りします。またのご来店を心よりお待ちしております！"
    },
    {
      "id": "coupon02",
      "name": "【感謝を込めて】お会計から10%OFFクーポン",
      "message": "〇〇様へ。日頃の感謝を込めて、お会計から10%OFFとなる特別なクーポンをご用意しました。ぜひ、またお顔を見せにいらしてください。"
    }
  ]
}
```

---

## Phase 5: 最終確認とドキュメント更新（30分）

### Step 5.1: 全機能の統合テスト（20分）

**テストシナリオ:**

1. **対話型インターフェース**
   - [ ] FABが全画面で表示
   - [ ] FABクリックでチャットモーダル表示
   - [ ] サジェストチップ動作
   - [ ] 質問送信とAI応答
   - [ ] 画面遷移後も履歴保持

2. **PDCAサイクル**
   - [ ] 対策記録ボタン表示
   - [ ] フォーム展開（アニメーション）
   - [ ] 対策記録とトースト表示
   - [ ] グラフに旗表示
   - [ ] 旗クリックでポップオーバー

3. **QSC分析**
   - [ ] QSCタブ表示
   - [ ] サマリーKPI3つ表示
   - [ ] 複合グラフ表示
   - [ ] ワードクラウド表示
   - [ ] 単語クリックで口コミ表示

4. **顧客エンゲージメント**
   - [ ] エンゲージメントボタン表示（st0002のみ）
   - [ ] モーダル表示
   - [ ] 顧客リスト5名表示
   - [ ] クーポン選択
   - [ ] メッセージプレビュー
   - [ ] 送信処理

---

### Step 5.2: READMEの更新（10分）

**ファイル:** `README.md`

```markdown
# チビックシステム 経営コックピット Ver.2.0

## 🆕 Ver.2.0の新機能

### 1. 対話型インターフェース
- 右下のFABからAIチャットを起動
- 自然言語で質問可能

### 2. PDCAサイクル支援
- 対策の記録機能
- グラフ上に実施日を旗で表示

### 3. QSC分析
- 売上×口コミ評価の複合分析
- AIによるワードクラウド

### 4. 顧客エンゲージメント連携
- 離反顧客への自動クーポン送信（デモ）

## 新規追加ライブラリ

- @chatscope/chat-ui-kit-react
- lucide-react
- react-wordcloud
- react-hot-toast
```

---

## 📊 実装完了チェックリスト

### Phase 1: 対話型インターフェース
- [ ] ChatContext作成
- [ ] ChatProvider統合
- [ ] FloatingActionButton実装
- [ ] ChatModal実装
- [ ] globals.cssにアニメーション追加
- [ ] mockData.jsonにchat_responses追加
- [ ] 動作確認

### Phase 2: PDCAサイクル
- [ ] ActionLogForm実装
- [ ] FlagMarker実装
- [ ] MainChartに旗プロット追加
- [ ] DetailDashboardに統合
- [ ] mockData.jsonにaction_logs追加
- [ ] 動作確認

### Phase 3: QSC分析
- [ ] WordCloudChart実装
- [ ] QSCAnalysisView実装
- [ ] サイドメニューにタブ追加
- [ ] 型定義追加
- [ ] mockData.jsonにqsc_analysis追加
- [ ] 動作確認

### Phase 4: 顧客エンゲージメント
- [ ] EngagementActionModal実装
- [ ] AIInsightPanel修正
- [ ] DetailDashboardに統合
- [ ] mockData.jsonに追加
- [ ] 動作確認

### Phase 5: 最終確認
- [ ] 全機能統合テスト
- [ ] README更新
- [ ] ドキュメント整理

---

## 🚨 注意事項

### バックアップからの復元方法

```bash
# Phase 1前に戻す
rm -rf src
cp -r src_before_phase1_chat src
cp public/mockData_before_phase1.json public/mockData.json

# Phase 2完了版に戻す
rm -rf src
cp -r src_phase2_complete src
cp public/mockData_phase2_complete.json public/mockData.json
```

### トラブルシューティング

**問題:** ライブラリのインストールでエラー
```bash
# キャッシュクリア
rm -rf node_modules .next
pnpm install
```

**問題:** TypeScriptエラー
```bash
# 型チェック
pnpm type-check
```

---

## ⏱️ 所要時間の見積もり

| Phase | 想定時間 | 実測時間 |
|-------|---------|---------|
| Phase 0: 準備 | 15分 | ___分 |
| Phase 1: 対話型UI | 2.5時間 | ___時間 |
| Phase 2: PDCA | 2時間 | ___時間 |
| Phase 3: QSC | 2.5時間 | ___時間 |
| Phase 4: エンゲージメント | 1.5時間 | ___時間 |
| Phase 5: 最終確認 | 30分 | ___分 |
| **合計** | **9時間** | ___時間 |

---

**この計画書に従って、一発で完璧な実装を実現します！**

準備が整いました。実装を開始してよろしいですか？


: エンゲージメント連携**
4. モーダル表示
5. クーポン選択とプレビュー
6. 送信処理

**これで完璧な実装計画書が完成しました！**

実装を開始する準備が整いました。Phase 0からスタートしてよろしいですか？ 🚀
