import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' permite servir o app em qualquer caminho (/app no backend, APK via Capacitor)
export default defineConfig({
  base: './',
  plugins: [react()],
})
