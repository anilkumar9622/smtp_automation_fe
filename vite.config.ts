import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   optimizeDeps: {
    include: ['easy-email-editor', 'easy-email-extensions', 'easy-email-core'],
  },
})
