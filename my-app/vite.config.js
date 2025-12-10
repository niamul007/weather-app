import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // For username.github.io → base must be "/"
  base: '/',

  plugins: [
    react(),
    tailwindcss(),
  ],
})
