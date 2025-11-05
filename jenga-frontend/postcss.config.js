// postcss.config.js
import tailwind from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default {
  // Use an array so Vite receives a proper plugin list
  plugins: [
    tailwind,
    autoprefixer,
  ],
}
