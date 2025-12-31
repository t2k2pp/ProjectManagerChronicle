/**
 * Service Worker for PM Chronicle
 * オフライン動作とキャッシュ管理
 */

const CACHE_NAME = 'pm-chronicle-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
];

// インストール時にキャッシュ
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// アクティベート時に古いキャッシュを削除
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// フェッチ時のキャッシュ戦略（Network First with Cache Fallback）
self.addEventListener('fetch', (event) => {
    // APIリクエストはキャッシュしない
    if (event.request.url.includes('/api/') ||
        event.request.url.includes('localhost:11434') ||
        event.request.url.includes('localhost:1234') ||
        event.request.url.includes('localhost:8080')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // 成功したらキャッシュを更新
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // ネットワークエラー時はキャッシュから返す
                return caches.match(event.request);
            })
    );
});

// バックグラウンド同期（オプション）
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-save-data') {
        console.log('Service Worker: Syncing save data');
    }
});

// プッシュ通知（オプション）
self.addEventListener('push', (event) => {
    const data = event.data?.json() || {};
    const title = data.title || 'PM Chronicle';
    const options = {
        body: data.body || '新しい通知があります',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});
