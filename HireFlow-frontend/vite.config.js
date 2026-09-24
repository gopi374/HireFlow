import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import t from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),t()],
})
