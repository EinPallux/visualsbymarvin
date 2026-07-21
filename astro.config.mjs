// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // ✏️ Change this to your real domain before going live (used for SEO / og tags)
  site: 'https://visualsbymarvin.com',
  vite: {
    plugins: [tailwindcss()],
  },
});
