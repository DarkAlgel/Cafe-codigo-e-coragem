import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/openaq': {
        target: 'https://api.openaq.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openaq/, ''),
        headers: {
          'X-API-Key': '488037f32133ffcbcd7c7043cfb49d25d3203142a75275e356e3813168293b7a'
        }
      }
    }
  }
})
