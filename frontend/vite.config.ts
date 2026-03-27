import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  // VITE_ROUTINE_ORIGIN is the full API base URL, e.g. "http://127.0.0.1:8000/api"
  const apiBase = env.VITE_ROUTINE_ORIGIN ?? 'http://127.0.0.1:8000/api'

  // Extract the pathname ("/api") and origin ("http://127.0.0.1:8000") for the proxy.
  // If apiBase is a relative path (e.g. "/api/routine"), no proxy is needed in dev.
  let proxyPath = '/api'
  let proxyTarget = 'http://127.0.0.1:8000'
  try {
    const url = new URL(apiBase)
    proxyPath = url.pathname.replace(/\/$/, '') || '/api'
    proxyTarget = url.origin
  } catch {
    // Relative path: same-origin, no CORS proxy needed
    proxyPath = ''
  }

  return {
    base: '/mobile/routine',
    plugins: [vue()],
    server: {
      proxy: proxyPath
        ? { [proxyPath]: { target: proxyTarget, changeOrigin: true } }
        : {},
    },
  }
})
