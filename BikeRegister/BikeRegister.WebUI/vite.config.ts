import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { heyApiPlugin } from '@hey-api/vite-plugin';
import { tanstackRouter } from '@tanstack/router-plugin/vite'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    heyApiPlugin({
      config: {
        input: 'https://localhost:26786/openapi/v1.json',
        output: 'src/hey-api',
        plugins: ['@tanstack/react-query']
      }
    })
  ],
})
