// src/components/common/Modal.tsx
import React, { useEffect, useCallback, useRef } from 'react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: ModalSize;
  showClose?: boolean;
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
  footer?: React.ReactNode;
}

const sizeClasses: Record<ModalSize, string> = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-xl',
  full: 'max-w-[95vw] max-h-[95vh]',
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
  closeOnOverlay = true,
  closeOnEsc = true,
  footer,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && closeOnEsc) onClose();
  }, [closeOnEsc, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlay && e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`
        fixed inset-0 z-50
        flex items-center justify-center p-4
        bg-black/70 backdrop-blur-sm
        animate-in fade-in duration-200
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Modal panel */}
      <div
        className={`
          ${sizeClasses[size]} w-full
          bg-gray-900 border border-gray-800/80
          rounded-2xl shadow-2xl shadow-black/60
          flex flex-col
          animate-in zoom-in-95 slide-in-from-bottom-4 duration-200
          overflow-hidden
        `}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between p-5 border-b border-gray-800/60">
            <div className="flex flex-col gap-1 pr-4">
              {title && (
                <h2
                  id="modal-title"
                  className="text-base font-semibold text-gray-100 tracking-tight"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-gray-400 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {showClose && (
              <button
                onClick={onClose}
                className={`
                  shrink-0 p-1.5 rounded-lg
                  text-gray-500 hover:text-gray-300
                  hover:bg-gray-800/80
                  transition-all duration-150
                  focus:outline-none focus:ring-2 focus:ring-gray-600
                `}
                aria-label="Close modal"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 p-5 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-4 border-t border-gray-800/60 bg-gray-900/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Confirm Modal - special variant
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  const iconConfig = {
    danger: {
      bg: 'bg-red-500/10',
      icon: 'text-red-400',
      btn: 'bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white shadow-red-500/25',
    },
    warning: {
      bg: 'bg-amber-500/10',
      icon: 'text-amber-400',
      btn: 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-500/25',
    },
    info: {
      bg: 'bg-violet-500/10',
      icon: 'text-violet-400',
      btn: 'bg-gradient-to-br from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white shadow-violet-500/25',
    },
  };

  const config = iconConfig[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="flex flex-col items-center text-center gap-4">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl ${config.bg} flex items-center justify-center`}>
          {variant === 'danger' && (
            <svg className={`w-7 h-7 ${config.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
          {variant === 'warning' && (
            <svg className={`w-7 h-7 ${config.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {variant === 'info' && (
            <svg className={`w-7 h-7 ${config.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-base font-semibold text-gray-100">{title}</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full pt-1">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700/60 transition-all duration-150 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all duration-150 disabled:opacity-50 ${config.btn}`}
          >
            {loading ? 'Loading...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;
