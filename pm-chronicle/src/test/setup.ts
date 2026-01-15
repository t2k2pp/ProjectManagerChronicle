/**
 * Vitestセットアップファイル
 */

import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// グローバルモック
(globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

