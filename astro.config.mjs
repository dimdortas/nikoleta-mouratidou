// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Το τελικό site ζει στο https://www.nikoletamouratidou.gr (στη ρίζα).
 *
 * Για προσωρινές δημοσιεύσεις σε υποφάκελο (π.χ. GitHub Pages project site)
 * περνάμε τις δύο μεταβλητές περιβάλλοντος — χωρίς αυτές τίποτα δεν αλλάζει:
 *
 *   SITE_URL=https://dimdortas.github.io BASE_PATH=/nikoleta-mouratidou npm run build
 */
const SITE_URL = process.env.SITE_URL || 'https://www.nikoletamouratidou.gr';
const BASE_PATH = process.env.BASE_PATH || '/';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'ignore',
  compressHTML: true,
  build: { inlineStylesheets: 'auto' },
});
