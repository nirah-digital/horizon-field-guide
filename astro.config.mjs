import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

// Public wiki for Horizon, served at https://nirah.co/horizon/ (reverse-proxy →
// horizon-wiki-web). Every page is static HTML; only the live market prices
// and the search box run in the browser.
export default defineConfig({
  site: 'https://nirah.co',
  base: '/horizon',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
})
