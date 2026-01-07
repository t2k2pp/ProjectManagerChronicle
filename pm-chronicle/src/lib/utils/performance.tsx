/**
 * 繝代ヵ繧ｩ繝ｼ繝槭Φ繧ｹ譛驕ｩ蛹悶Θ繝ｼ繝・ぅ繝ｪ繝・ぅ
 */

import React, { memo, useMemo, useCallback, type ComponentType, type ReactNode } from 'react';

/**
 * 繧ｳ繝ｳ繝昴・繝阪Φ繝医Γ繝｢蛹悶・繝ｫ繝代・
 * 荳崎ｦ√↑蜀阪Ξ繝ｳ繝繝ｪ繝ｳ繧ｰ繧帝亟縺・
 */
export function withMemo<P extends object>(
    Component: ComponentType<P>,
    displayName?: string
): ComponentType<P> {
    const MemoizedComponent = memo(Component);
    MemoizedComponent.displayName = displayName || Component.displayName || Component.name;
    return MemoizedComponent;
}

/**
 * 驥阪＞繝ｪ繧ｹ繝育畑縺ｮ莉ｮ諠ｳ蛹冶ｨｭ螳・
 */
export const VIRTUALIZATION_CONFIG = {
    overscan: 5,
    estimatedItemSize: 50,
    threshold: 100, // 縺薙・謨ｰ莉･荳翫〒繝舌・繝√Ε繝ｫ蛹匁耳螂ｨ
};

/**
 * IndexedDB繧｢繧ｯ繧ｻ繧ｹ繧偵ヰ繝・メ蜃ｦ逅・
 */
export function batchDBOperations<T>(
    operations: (() => Promise<T>)[],
    batchSize = 10
): Promise<T[]> {
    const results: T[] = [];

    return operations.reduce(async (prev, op, index) => {
        await prev;
        results.push(await op());

        // 繝舌ャ繝√＃縺ｨ縺ｫ遏ｭ縺・ｼ第ｭ｢
        if (index > 0 && index % batchSize === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        return results;
    }, Promise.resolve(results));
}

/**
 * 蜀阪Ξ繝ｳ繝繝ｪ繝ｳ繧ｰ讀懷・逕ｨ繝・ヰ繝・げ繝輔ャ繧ｯ
 */
export function useRenderCount(componentName: string): void {
    if (import.meta.env.DEV) {
        const countRef = { current: 0 };
        countRef.current += 1;
        console.debug(`[Render] ${componentName}: ${countRef.current}`);
    }
}

/**
 * 鬮倥さ繧ｹ繝医↑險育ｮ礼ｵ先棡縺ｮ繧ｭ繝｣繝・す繝･
 */
export function useMemoizedValue<T>(
    factory: () => T,
    deps: React.DependencyList
): T {
    return useMemo(factory, deps);
}

/**
 * 繧ｳ繝ｼ繝ｫ繝舌ャ繧ｯ縺ｮ螳牙ｮ壼喧
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
    callback: T
): T {
    return useCallback(callback, []);
}

/**
 * 驕・ｻｶ隱ｭ縺ｿ霎ｼ縺ｿ繝ｩ繝・ヱ繝ｼ
 */
export function LazyComponent({
    children,
    fallback = null
}: {
    children: ReactNode;
    fallback?: ReactNode
}): React.ReactElement {
    return <>{children || fallback}</>;
}
