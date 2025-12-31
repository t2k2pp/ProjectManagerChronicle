/**
 * ツールチップコンポーネント
 */

import { useState, type ReactNode } from 'react';

interface TooltipProps {
    content: ReactNode;
    children: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
}

const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-800',
};

export function Tooltip({
    content,
    children,
    position = 'top',
    delay = 300,
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = () => {
        const id = setTimeout(() => setIsVisible(true), delay);
        setTimeoutId(id);
    };

    const handleMouseLeave = () => {
        if (timeoutId) clearTimeout(timeoutId);
        setIsVisible(false);
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}

            {isVisible && (
                <div
                    className={`absolute z-50 ${positionStyles[position]} pointer-events-none`}
                    role="tooltip"
                >
                    <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-xl max-w-xs">
                        {content}
                    </div>
                    {/* Arrow */}
                    <div
                        className={`absolute w-0 h-0 border-4 border-transparent ${arrowStyles[position]}`}
                    />
                </div>
            )}
        </div>
    );
}

/** ヘルプアイコン付きツールチップ */
interface HelpTooltipProps {
    content: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export function HelpTooltip({ content, position = 'top' }: HelpTooltipProps) {
    return (
        <Tooltip content={content} position={position}>
            <span className="inline-flex items-center justify-center w-4 h-4 text-xs text-gray-400 bg-gray-700 rounded-full cursor-help hover:bg-gray-600">
                ?
            </span>
        </Tooltip>
    );
}
