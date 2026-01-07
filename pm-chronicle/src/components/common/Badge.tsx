/**
 * Badgeコンポーネント
 * index.cssで定義されたデザイントークンを使用
 */

import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'md';
    className?: string;
}

export function Badge({
    children,
    variant = 'default',
    size = 'md',
    className = '',
}: BadgeProps) {
    // index.cssで定義されたデザイントークンクラスを使用
    const variantClasses = {
        default: 'badge',
        success: 'badge badge-success',
        warning: 'badge badge-warning',
        danger: 'badge badge-danger',
        info: 'badge badge-info',
    };

    const sizeClasses = {
        sm: '!px-2 !py-0.5 !text-xs',
        md: '',  // デフォルトはCSSクラスで定義済み
    };

    return (
        <span className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
            {children}
        </span>
    );
}

