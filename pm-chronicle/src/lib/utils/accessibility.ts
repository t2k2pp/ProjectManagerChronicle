/**
 * アクセシビリティユーティリティ
 * WCAG 2.1 AA準拠サポート
 */

import { useEffect, useRef, type RefObject } from 'react';

/**
 * キーボードナビゲーション用のキーコード
 */
export const Keys = {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
} as const;

/**
 * フォーカストラップフック
 * モーダル内にフォーカスを閉じ込める
 */
export function useFocusTrap(isActive: boolean): RefObject<HTMLDivElement | null> {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== Keys.TAB) return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);
        firstElement?.focus();

        return () => container.removeEventListener('keydown', handleKeyDown);
    }, [isActive]);

    return containerRef;
}

/**
 * スクリーンリーダー用のライブリージョン通知
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * キーボードクリックハンドラー
 * Enter/Spaceキーでクリック動作
 */
export function handleKeyboardClick(
    callback: () => void
): (e: React.KeyboardEvent) => void {
    return (e: React.KeyboardEvent) => {
        if (e.key === Keys.ENTER || e.key === Keys.SPACE) {
            e.preventDefault();
            callback();
        }
    };
}

/**
 * ARIA属性ヘルパー
 */
export const ariaProps = {
    button: (label: string, disabled = false) => ({
        role: 'button' as const,
        'aria-label': label,
        'aria-disabled': disabled,
        tabIndex: disabled ? -1 : 0,
    }),

    modal: (title: string, isOpen: boolean) => ({
        role: 'dialog' as const,
        'aria-modal': true,
        'aria-labelledby': `modal-title-${title.replace(/\s+/g, '-')}`,
        'aria-hidden': !isOpen,
    }),

    progressBar: (value: number, max: number, label: string) => ({
        role: 'progressbar' as const,
        'aria-valuenow': value,
        'aria-valuemin': 0,
        'aria-valuemax': max,
        'aria-label': label,
    }),

    list: (label: string) => ({
        role: 'list' as const,
        'aria-label': label,
    }),

    listItem: () => ({
        role: 'listitem' as const,
    }),
};

/**
 * スキップリンク用CSS（グローバルに追加推奨）
 */
export const skipLinkStyles = `
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    padding: 8px 16px;
    background: #1f2937;
    color: white;
    z-index: 9999;
    transition: top 0.2s;
  }
  .skip-link:focus {
    top: 0;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;
