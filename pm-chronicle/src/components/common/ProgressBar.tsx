/**
 * ProgressBarコンポーネント
 */

interface ProgressBarProps {
    value: number;
    max?: number;
    label?: string;
    showValue?: boolean;
    variant?: 'default' | 'success' | 'warning' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function ProgressBar({
    value,
    max = 100,
    label,
    showValue = true,
    variant = 'default',
    size = 'md',
    className = '',
}: ProgressBarProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const sizeClasses = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-4',
    };

    const variantClasses = {
        default: 'bg-blue-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        danger: 'bg-red-500',
    };

    // 自動で色を決定（閾値ベース）
    const autoVariant = percentage >= 80 ? 'success' : percentage >= 50 ? 'warning' : 'danger';
    const actualVariant = variant === 'default' ? autoVariant : variant;

    return (
        <div className={className}>
            {(label || showValue) && (
                <div className="flex justify-between text-sm mb-1">
                    {label && <span className="text-gray-400">{label}</span>}
                    {showValue && <span className="text-white font-medium">{value}/{max}</span>}
                </div>
            )}
            <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
                <div
                    className={`${variantClasses[actualVariant]} ${sizeClasses[size]} rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

/** スタミナバー（専用バリエーション） */
export function StaminaBar({ current, max }: { current: number; max: number }) {
    const percentage = (current / max) * 100;
    let variant: 'success' | 'warning' | 'danger' = 'success';
    if (percentage < 30) variant = 'danger';
    else if (percentage < 60) variant = 'warning';

    return (
        <ProgressBar
            value={current}
            max={max}
            label="スタミナ"
            variant={variant}
            size="md"
        />
    );
}
