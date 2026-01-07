/**
 * モーダルコンポーネント
 */

import { useEffect, useCallback, type ReactNode } from 'react';
import { Button } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnOverlay?: boolean;
    closeOnEsc?: boolean;
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
};

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
    closeOnOverlay = true,
    closeOnEsc = true,
}: ModalProps) {
    // ESCキーで閉じる
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (closeOnEsc && e.key === 'Escape') {
                onClose();
            }
        },
        [closeOnEsc, onClose]
    );

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* オーバーレイ */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={closeOnOverlay ? onClose : undefined}
            />

            {/* モーダル本体 */}
            <div
                className={`relative bg-surface-dark border border-gray-700 rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}
            >
                {/* ヘッダー */}
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* コンテンツ */}
                <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

                {/* フッター */}
                {footer && (
                    <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

/** 確認ダイアログ */
interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = '確認',
    cancelText = 'キャンセル',
    variant = 'info',
}: ConfirmDialogProps) {
    const confirmVariant = variant === 'danger' ? 'danger' : 'primary';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={confirmVariant}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </Button>
                </>
            }
        >
            <p className="text-gray-300">{message}</p>
        </Modal>
    );
}
