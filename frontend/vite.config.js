import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production-only build config.
// The API base URL is hardcoded in src/services/api.js pointing to Render.
// Local dev server is intentionally not configured — use the deployed Vercel app.
export default defineConfig({
  plugins: [react()],
})
