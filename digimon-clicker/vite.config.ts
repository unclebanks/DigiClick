import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages project site serves from /<repo-name>/, not the domain root.
  base: command === 'build' ? '/DigiClick/' : '/',
  plugins: [react()],
}))
