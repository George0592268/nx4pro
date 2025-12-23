
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY),
      // Добавляем глобальный URL прокси для всех пользователей
      'process.env.PROXY_URL': JSON.stringify(env.VITE_PROXY_URL || env.PROXY_URL || "")
    }
  }
})
