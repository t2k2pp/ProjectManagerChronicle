import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages用: リポジトリ名に合わせて変更
  base: process.env.GITHUB_ACTIONS ? '/ProjectManagerChronicle/' : '/',
  build: {
    // Code Splitting設定
    rollupOptions: {
      output: {
        manualChunks: {
          // ベンダーライブラリを分離
          'vendor-react': ['react', 'react-dom'],
          'vendor-charts': ['recharts'],
          'vendor-motion': ['framer-motion'],
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable'],
          'vendor-state': ['zustand', 'dexie'],
        },
      },
    },
    // チャンクサイズ警告調整
    chunkSizeWarningLimit: 500,
    // ソースマップ（本番では無効）
    sourcemap: false,
  },
  // 開発時の最適化
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand', 'dexie', 'recharts', 'framer-motion'],
  },
})
