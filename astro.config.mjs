// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'

// 1. On change l'import ici
import vercel from '@astrojs/vercel';

export default defineConfig({
  // 2. Change l'URL pour ton futur domaine (important pour le sitemap)
  site: 'https://nexus-devops.fr',

  integrations: [
    react(),
    mdx(),
    sitemap({
      // Ton code de sitemap actuel est très bien, garde-le tel quel
      // ... (ton code sitemap ici)
    })
  ],

  // 3. ON PASSE EN HYBRIDE pour tes fonctions serveur (Resend)
  output: 'static',
  compressHTML: true,

  build: {
    inlineStylesheets: 'auto'
  },

  vite: {
    plugins: [tailwindcss()],
    // ... (ton code vite ici)
  },

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },

  // 4. ON UTILISE L'ADAPTATEUR VERCEL
  adapter: vercel()
})
