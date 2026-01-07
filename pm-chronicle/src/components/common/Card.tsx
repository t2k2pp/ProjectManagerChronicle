/**
 * Cardコンポーネント
 * index.cssで定義されたデザイントークンを使用
 */

import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'bordered';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
    children,
    className = '',
    variant = 'default',
    padding = 'md',
}: CardProps) {
    // index.cssで定義されたデザイントークンクラスを使用
    const variantClasses = {
        default: 'card',
        glass: 'glass-card',
        bordered: 'card-bordered',
    };

    const paddingClasses = {
        none: '!p-0',
        sm: '!p-3',
        md: '',  // デフォルトはCSSクラスで定義済み
        lg: '!p-8',
    };

    return (
        <div className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}>
            {children}
        </div>
    );
}

/** カードヘッダー */
interface CardHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
    return (
        <div className="flex items-start justify-between mb-4">
            <div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

/** カードボディ */
export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={className}>{children}</div>;
}

/** カードフッター */
export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`border-t border-gray-700 pt-4 mt-4 ${className}`}>
            {children}
        </div>
    );
}
