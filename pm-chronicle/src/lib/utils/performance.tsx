/**
 * パフォーマンス最適化ユーティリティ
 */

import React, { memo, useMemo, useCallback, type ComponentType, type ReactNode } from 'react';

/**
 * コンポーネントメモ化ヘルパー
 * 不要な再レンダリングを防ぐ
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
 * 重いリスト用の仮想化設定
 */
export const VIRTUALIZATION_CONFIG = {
    overscan: 5,
    estimatedItemSize: 50,
    threshold: 100, // この数以上でバーチャル化推奨
};

/**
 * IndexedDBアクセスをバッチ処理
 */
export function batchDBOperations<T>(
    operations: (() => Promise<T>)[],
    batchSize = 10
): Promise<T[]> {
    const results: T[] = [];

    return operations.reduce(async (prev, op, index) => {
        await prev;
        results.push(await op());

        // バッチごとに短い休止
        if (index > 0 && index % batchSize === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        return results;
    }, Promise.resolve(results));
}

/**
 * 再レンダリング検出用デバッグフック
 */
export function useRenderCount(componentName: string): void {
    if (import.meta.env.DEV) {
        const countRef = { current: 0 };
        countRef.current += 1;
        console.debug(`[Render] ${componentName}: ${countRef.current}`);
    }
}

/**
 * 高コストな計算結果のキャッシュ
 */
export function useMemoizedValue<T>(
    factory: () => T,
    deps: React.DependencyList
): T {
    return useMemo(factory, deps);
}

/**
 * コールバックの安定化
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
    callback: T
): T {
    return useCallback(callback, []);
}

/**
 * 遅延読み込みラッパー
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
