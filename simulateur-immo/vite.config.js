import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change '/simulateur-immo-wallonie/' to match your GitHub repository name
// e.g. if your repo is github.com/username/mon-simulateur, use '/mon-simulateur/'
export default defineConfig({
  plugins: [react()],
  base: '/simulateur-immo-wallonie/',
})
