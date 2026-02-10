// src/components/chat/TextChat.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import MessageBubble, { Message } from './MessageBubble';
import ChatControls from './ChatControls';
import Avatar from '../common/Avatar';
import LoadingSpinner from '../common/LoadingSpinner';

type ChatStatus = 'connecting' | 'connected' | 'disconnected' | 'searching';

interface TextChatProps {
  messages: Message[];
  currentUserId: string;
  partner?: {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline' | 'away';
  };
  chatStatus: ChatStatus;
  onSendMessage: (message: string) => void;
  onTyping?: (isTyping: boolean) => void;
  onSkip?: () => void;
  onReport?: (userId: string) => void;
  onAddFriend?: (userId: string) => void;
  partnerTyping?: boolean;
  connectionTime?: number; // seconds connected
}

const TextChat: React.FC<TextChatProps> = ({
  messages,
  currentUserId,
  partner,
  chatStatus,
  onSendMessage,
  onTyping,
  onSkip,
  onReport,
  onAddFriend,
  partnerTyping = false,
  connectionTime = 0,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Auto scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
    });
  }, []);

  useEffect(() => {
    if (isAtBottom) scrollToBottom();
  }, [messages, isAtBottom, scrollToBottom]);

  // Show/hide scroll button
  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsAtBottom(distFromBottom < 60);
    setShowScrollBtn(distFromBottom > 200);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Group messages by date
  const groupedMessages = messages.reduce<{ date: string; messages: Message[] }[]>((groups, msg) => {
    const date = msg.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.date === date) {
      lastGroup.messages.push(msg);
    } else {
      groups.push({ date, messages: [msg] });
    }
    return groups;
  }, []);

  const isDisabled = chatStatus === 'connecting' || chatStatus === 'searching';

  return (
    <div className="flex flex-col h-full bg-gray-950 overflow-hidden">

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800/60">
        <div className="flex items-center gap-3">
          {partner ? (
            <>
              <Avatar
                src={partner.avatar}
                name={partner.name}
                size="md"
                status={partner.status}
                showStatus
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-100">{partner.name}</h3>
                  {chatStatus === 'connected' && connectionTime > 0 && (
                    <span className="text-xs text-gray-600 font-mono">{formatDuration(connectionTime)}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`
                    w-1.5 h-1.5 rounded-full
                    ${chatStatus === 'connected' ? 'bg-emerald-400' :
                      chatStatus === 'connecting' ? 'bg-amber-400 animate-pulse' :
                      'bg-gray-600'}
                  `} />
                  <span className="text-xs text-gray-500 capitalize">{chatStatus}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-800/80 border border-gray-700/40 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-500">
                  {chatStatus === 'searching' ? 'Finding a match...' : 'Stranger'}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs text-gray-600">{chatStatus}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {partner && chatStatus === 'connected' && (
          <div className="flex items-center gap-1">
            {onAddFriend && (
              <button
                onClick={() => onAddFriend(partner.id)}
                className="p-2 rounded-xl text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-150"
                title="Add as friend"
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </button>
            )}
            {onReport && (
              <button
                onClick={() => onReport(partner.id)}
                className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
                title="Report user"
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#1f2937 transparent' }}
      >
        {/* Searching state */}
        {chatStatus === 'searching' && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 flex items-center justify-center border border-violet-500/20">
                <LoadingSpinner variant="ring" size="lg" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-300">Finding your match</p>
              <p className="text-xs text-gray-600 mt-1">This usually takes a few seconds</p>
            </div>
          </div>
        )}

        {/* No messages yet */}
        {chatStatus === 'connected' && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-800/60 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-xs text-gray-600">Say hello! 👋</p>
          </div>
        )}

        {/* Messages grouped by date */}
        {groupedMessages.map(group => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-800/60" />
              <span className="text-xs text-gray-600 shrink-0">{group.date}</span>
              <div className="flex-1 h-px bg-gray-800/60" />
            </div>

            {/* Messages */}
            {group.messages.map((msg, i) => {
              const prevMsg = group.messages[i - 1];
              const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  showAvatar={showAvatar}
                  showTimestamp
                  onReact={(id, emoji) => console.log('react', id, emoji)}
                  onReport={(id) => console.log('report', id)}
                />
              );
            })}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-24 right-4 p-2 rounded-xl bg-gray-800 border border-gray-700/60 text-gray-400 hover:text-gray-200 shadow-lg transition-all duration-150 z-10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* Chat controls */}
      <div className="shrink-0 border-t border-gray-800/60">
        <ChatControls
          onSendMessage={onSendMessage}
          onTyping={onTyping}
          disabled={isDisabled}
          partnerTyping={partnerTyping}
          partnerName={partner?.name}
          onSkip={onSkip}
          mode="text"
        />
      </div>
    </div>
  );
};

export default TextChat;
