import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const apiOrigin = env.VITE_ROUTINE_ORIGIN ?? 'http://127.0.0.1:8000'

  return {
    base: '/mobile/routine',
    plugins: [vue()],
    server: {
      proxy: {
        '/api': {
          target: apiOrigin,
          changeOrigin: true,
        },
        '/health': {
          target: apiOrigin,
          changeOrigin: true,
        },
      },
    },
  }
})
