import React, { useRef, useEffect, useState } from 'react';
import ChatControls from './ChatControls';
import Avatar from '../common/Avatar';
import LoadingSpinner from '../common/LoadingSpinner';
import MessageBubble, { Message } from './MessageBubble';

interface VideoChatProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;

  currentUserId: string;

  partner?: {
    id: string;
    name: string;
    avatar?: string;
  };

  messages?: Message[];

  isConnected: boolean;
  isConnecting?: boolean;

  isMuted: boolean;
  isVideoOff: boolean;

  partnerMuted?: boolean;
  partnerVideoOff?: boolean;

  onToggleMute: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
  onSkip?: () => void;

  onSendMessage?: (msg: string) => void;
  onTyping?: (typing: boolean) => void;
  partnerTyping?: boolean;

  connectionTime?: number;
}

const VideoChat: React.FC<VideoChatProps> = ({
  localStream,
  remoteStream,
  currentUserId,
  partner,
  messages = [],
  isConnected,
  isConnecting = false,
  isMuted,
  isVideoOff,
  partnerMuted = false,
  partnerVideoOff = false,
  onToggleMute,
  onToggleVideo,
  onEndCall,
  onSkip,
  onSendMessage,
  onTyping,
  partnerTyping = false,
  connectionTime = 0,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showChat, setShowChat] = useState(false);
  const [isLocalPip, setIsLocalPip] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* STREAM BINDING */

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* AUTO HIDE CONTROLS */

  const resetControlsTimer = () => {
    setShowControls(true);

    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }

    controlsTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    if (isConnected) resetControlsTimer();

    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleSwap = () => {
    setIsLocalPip((prev) => !prev);
  };

  return (
    <div
      className="relative w-full h-full bg-gray-950 overflow-hidden"
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      {/* MAIN VIDEO */}
      <div className="absolute inset-0">
        {isLocalPip ? (
          remoteStream && isConnected ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
              {isConnecting ? (
                <LoadingSpinner variant="ring" size="xl" label="Connecting..." />
              ) : (
                <>
                  {partner && (
                    <Avatar
                      name={partner.name}
                      src={partner.avatar}
                      size="2xl"
                    />
                  )}
                  <p className="text-gray-400 text-sm mt-3">
                    {partnerVideoOff
                      ? `${partner?.name ?? 'Partner'} turned off camera`
                      : 'Waiting for connection...'}
                  </p>
                </>
              )}
            </div>
          )
        ) : localStream && !isVideoOff ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <p className="text-gray-500 text-sm">Camera is off</p>
          </div>
        )}
      </div>

      {/* SWAP PREVIEW */}
      <button
        onClick={handleSwap}
        className="absolute top-14 right-3 z-20 w-28 h-40 rounded-xl overflow-hidden border border-gray-700 bg-gray-900"
      >
        {!isLocalPip ? (
          remoteStream && isConnected ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Avatar name={partner?.name ?? 'P'} size="md" />
            </div>
          )
        ) : localStream && !isVideoOff ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-xs text-gray-500">No Camera</p>
          </div>
        )}
      </button>

      {/* TOP BAR */}
      <div
        className={`absolute top-0 inset-x-0 z-10 px-4 py-3 flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-3">
          {partner && (
            <Avatar name={partner.name} src={partner.avatar} size="sm" />
          )}
          <div>
            <p className="text-sm font-semibold text-white">
              {partner?.name ?? 'Stranger'}
              {partnerMuted && (
                <span className="ml-2 text-xs text-red-400">(muted)</span>
              )}
            </p>
            {isConnected && (
              <p className="text-xs text-emerald-400 font-mono">
                {formatDuration(connectionTime)}
              </p>
            )}
          </div>
        </div>

        {onSendMessage && (
          <button
            onClick={() => setShowChat((prev) => !prev)}
            className="text-xs px-3 py-1 rounded-lg bg-gray-800 text-gray-300"
          >
            {showChat ? 'Hide Chat' : 'Chat'}
          </button>
        )}
      </div>

      {/* SIDE CHAT */}
      {showChat && onSendMessage && (
        <div className="absolute top-0 right-0 bottom-0 w-72 z-20 flex flex-col bg-gray-950 border-l border-gray-800">
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === currentUserId}
                showAvatar={
                  i === 0 ||
                  messages[i - 1]?.senderId !== msg.senderId
                }
                showTimestamp
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <ChatControls
            onSendMessage={onSendMessage}
            onTyping={onTyping}
            isPartnerTyping={partnerTyping}
          />
        </div>
      )}

      {/* BOTTOM CONTROLS */}
      <div
        className={`absolute bottom-0 inset-x-0 z-10 pb-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        } ${showChat ? 'pr-72' : ''}`}
      >
        <ChatControls
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          onToggleMute={onToggleMute}
          onToggleVideo={onToggleVideo}
          onEndCall={onEndCall}
          onSkip={onSkip}
          disabled={!isConnected}
        />
      </div>
    </div>
  );
};

export default VideoChat;
