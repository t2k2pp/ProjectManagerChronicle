/**
 * Vitestセットアップファイル
 */

import '@testing-library/jest-dom';

// グローバルモック
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// IndexedDB モック
const indexedDB = {
    open: () => ({
        result: {
            createObjectStore: () => { },
            transaction: () => ({
                objectStore: () => ({
                    put: () => ({ onsuccess: null, onerror: null }),
                    get: () => ({ onsuccess: null, onerror: null }),
                    delete: () => ({ onsuccess: null, onerror: null }),
                }),
            }),
        },
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
    }),
};
Object.defineProperty(window, 'indexedDB', { value: indexedDB });
