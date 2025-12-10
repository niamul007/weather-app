import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Import the Tailwind CSS plugin (MANDATORY)
import tailwindcss from '@tailwindcss/vite'

// CRITICAL: Replace 'YOUR-REPO-NAME-HERE' with the exact name of your GitHub repository.
// The base path must start and end with a slash '/'.
const repoName = '/weather-app/'; 

// https://vitejs.dev/config/
export default defineConfig({
  // --- CRITICAL CONFIGURATION FOR GITHUB PAGES ---
  // This tells Vite where the production assets will be served from (the sub-directory on GitHub Pages).
  base: weather-app, 
  // --------------------------------------------------

  plugins: [
    react(), 
    // Add the Tailwind CSS plugin here (MANDATORY)
    tailwindcss(),
  ],
})