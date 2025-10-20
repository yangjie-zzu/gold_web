import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => {
          console.log('proxy rewrite path:', path);
          path = path.replace(/^\/api/, '');
          console.log('proxy rewrite path:', path);
          return path;
        },
      },
    },
  }
})
