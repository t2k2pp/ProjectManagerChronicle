/**
 * Buttonコンポーネント
 * index.cssで定義されたデザイントークンを使用
 */

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    className = '',
    children,
    ...props
}: ButtonProps) {
    // index.cssで定義されたデザイントークンクラスを使用
    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        danger: 'btn-danger',
        ghost: 'btn-ghost',
    };

    const sizeClasses = {
        sm: 'text-sm !px-3 !py-1.5',
        md: '',  // デフォルトサイズはCSSクラスで定義済み
        lg: 'text-lg !px-8 !py-4',
    };

    const disabledClasses = disabled || loading
        ? 'opacity-50 cursor-not-allowed hover:scale-100'
        : '';

    return (
        <button
            className={`${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} flex items-center justify-center gap-2 ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            {children}
        </button>
    );
}
