// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import site from './site.config.mjs';

// Build dengan konten uji memakai cache sendiri. Astro menyimpan hasil olahan
// frontmatter di cache; tanpa pemisahan ini, build produksi sesudah build uji
// akan memakai ulang entri yang menganggap konten uji boleh terbit.
const withFixtures = process.env.DEVMECUM_FIXTURES === '1';

export default defineConfig({
  site: site.url,
  cacheDir: withFixtures ? './node_modules/.astro-uji' : './node_modules/.astro',
  integrations: [
    starlight({
      title: site.title,
      description: site.tagline,
      locales: {
        root: { label: 'Bahasa Indonesia', lang: 'id' },
      },
      customCss: ['./src/styles/base.css'],
      routeMiddleware: './src/routeData.ts',
    }),
  ],
});
