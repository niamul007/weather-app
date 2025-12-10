import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/weather-app/',   // <-- ONLY the repo name, starting and ending with '/'
  plugins: [react(), tailwindcss()],
})
