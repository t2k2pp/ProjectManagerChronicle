import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages用: リポジトリ名に合わせて変更
  base: process.env.GITHUB_ACTIONS ? '/ProjectManagerChronicle/' : '/',
})

