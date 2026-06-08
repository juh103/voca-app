import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use root base when deployed to Vercel; keep '/voca-app/' for GitHub Pages production builds
  base: process.env.VERCEL ? '/' : (process.env.NODE_ENV === 'production' ? '/voca-app/' : '/')
})
