import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Background-remove/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@imgly/background-removal'],
  },
})
