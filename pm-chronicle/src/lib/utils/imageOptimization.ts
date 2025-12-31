/**
 * 画像最適化設定・ユーティリティ
 */

/**
 * 遅延読み込み用の画像コンポーネント設定
 */
export const LAZY_IMAGE_CONFIG = {
    // IntersectionObserver設定
    rootMargin: '50px',
    threshold: 0.1,
};

/**
 * 推奨画像サイズ
 */
export const RECOMMENDED_IMAGE_SIZES = {
    icon: { width: 32, height: 32 },
    avatar: { width: 64, height: 64 },
    thumbnail: { width: 150, height: 150 },
    card: { width: 300, height: 200 },
    banner: { width: 1200, height: 400 },
};

/**
 * WebP対応チェック
 */
export async function supportsWebP(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * 画像URL最適化（CDN対応）
 */
export function optimizeImageUrl(url: string, width?: number, quality = 80): string {
    // 外部CDNを使用する場合のURL変換
    // ローカル開発では変換なし
    if (import.meta.env.DEV) {
        return url;
    }

    // 本番では圧縮パラメータを追加（CDN対応時）
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    params.set('q', quality.toString());

    return url + (url.includes('?') ? '&' : '?') + params.toString();
}

/**
 * プレースホルダーSVG生成
 */
export function generatePlaceholder(width: number, height: number, color = '#1f2937'): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect fill="${color}" width="100%" height="100%"/></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
