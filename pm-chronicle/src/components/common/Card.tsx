/**
 * Cardコンポーネント
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
    const baseClasses = 'rounded-xl';

    const variantClasses = {
        default: 'bg-gray-800 shadow-lg border border-gray-700',
        glass: 'bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl',
        bordered: 'bg-transparent border-2 border-gray-600',
    };

    const paddingClasses = {
        none: '',
        sm: 'p-3',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}>
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
