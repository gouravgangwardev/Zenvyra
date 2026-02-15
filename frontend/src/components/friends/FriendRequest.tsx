// src/components/friends/FriendRequest.tsx
import React, { useState } from 'react';

export type RequestDirection = 'incoming' | 'outgoing';
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface FriendRequestData {
  id: string;
  userId: string;
  username: string;
  avatar?: string | null;
  direction: RequestDirection;
  status: RequestStatus;
  sentAt: Date;
  mutualFriends?: number;
  message?: string;
}

interface FriendRequestProps {
  request: FriendRequestData;
  onAccept?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
  onViewProfile?: (userId: string) => void;
  isLoading?: boolean;
}

const getGradient = (name: string) => {
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-cyan-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-blue-600',
  ];
  return gradients[name.charCodeAt(0) % gradients.length];
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
};

const FriendRequest: React.FC<FriendRequestProps> = ({
  request,
  onAccept,
  onReject,
  onCancel,
  onViewProfile,
  isLoading = false,
}) => {
  const [actionTaken, setActionTaken] = useState<'accepted' | 'rejected' | 'cancelled' | null>(null);
  const gradient = getGradient(request.username);
  const initials = request.username.slice(0, 2).toUpperCase();

  const handleAccept = () => {
    setActionTaken('accepted');
    onAccept?.(request.id);
  };

  const handleReject = () => {
    setActionTaken('rejected');
    onReject?.(request.id);
  };

  const handleCancel = () => {
    setActionTaken('cancelled');
    onCancel?.(request.id);
  };

  // Resolved state (after action or from props)
  const resolvedStatus = actionTaken || (request.status !== 'pending' ? request.status : null);

  if (resolvedStatus) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-900/40 border border-gray-800/40 opacity-60">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden`}>
          {request.avatar
            ? <img src={request.avatar} alt={request.username} className="w-full h-full object-cover" />
            : initials
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-400 truncate">{request.username}</p>
          <p className={`text-xs mt-0.5 ${
            resolvedStatus === 'accepted' ? 'text-emerald-500' :
            resolvedStatus === 'rejected' ? 'text-red-500' :
            'text-gray-600'
          }`}>
            {resolvedStatus === 'accepted' && '✓ Friend request accepted'}
            {resolvedStatus === 'rejected' && '✕ Request declined'}
            {resolvedStatus === 'cancelled' && '✕ Request cancelled'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-gray-900/60 border border-gray-800/60 hover:border-gray-700/60 transition-all duration-200">

      {/* Top row */}
      <div className="flex items-start gap-3">

        {/* Avatar */}
        <div
          className={`w-11 h-11 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-violet-500/40 transition-all`}
          onClick={() => onViewProfile?.(request.userId)}
        >
          {request.avatar
            ? <img src={request.avatar} alt={request.username} className="w-full h-full object-cover" />
            : initials
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onViewProfile?.(request.userId)}
              className="text-sm font-semibold text-gray-100 hover:text-violet-300 transition-colors truncate"
            >
              {request.username}
            </button>

            {/* Direction badge */}
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
              request.direction === 'incoming'
                ? 'bg-violet-500/15 text-violet-400 border border-violet-500/20'
                : 'bg-gray-700/60 text-gray-400 border border-gray-600/30'
            }`}>
              {request.direction === 'incoming' ? 'Wants to connect' : 'Request sent'}
            </span>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-500">{formatTimeAgo(request.sentAt)}</span>
            {request.mutualFriends !== undefined && request.mutualFriends > 0 && (
              <>
                <span className="text-gray-700">·</span>
                <span className="text-xs text-gray-500">
                  {request.mutualFriends} mutual {request.mutualFriends === 1 ? 'friend' : 'friends'}
                </span>
              </>
            )}
          </div>

          {/* Optional message */}
          {request.message && (
            <p className="text-xs text-gray-400 mt-1.5 italic bg-gray-800/40 rounded-lg px-2.5 py-1.5 border border-gray-700/30">
              "{request.message}"
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {request.direction === 'incoming' ? (
          <>
            {/* Accept */}
            <button
              onClick={handleAccept}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition-all duration-150 shadow-md shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isLoading ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              Accept
            </button>

            {/* Reject */}
            <button
              onClick={handleReject}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 border border-gray-700/60 hover:border-gray-600/60 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Decline
            </button>
          </>
        ) : (
          /* Cancel outgoing request */
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold bg-gray-800/80 hover:bg-gray-700/80 text-gray-400 hover:text-gray-200 border border-gray-700/60 hover:border-gray-600/60 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel Request
          </button>
        )}
      </div>
    </div>
  );
};

export default FriendRequest;
