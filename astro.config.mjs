// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import site from './site.config.mjs';

// Build dengan konten uji memakai cache sendiri. Astro menyimpan hasil olahan
// frontmatter di cache; tanpa pemisahan ini, build produksi sesudah build uji
// akan memakai ulang entri yang menganggap konten uji boleh terbit.
const withFixtures = process.env.DEVMECUM_FIXTURES === '1';

export default defineConfig({
  site: site.url,
  cacheDir: withFixtures ? './node_modules/.astro-uji' : './node_modules/.astro',
  // Komponen Tabs Starlight memakai `satteri`, yang memuat berkas biner (.node).
  // Bila ikut dibundel, berkas biner itu tidak ditemukan saat halaman dirender.
  // Halaman statis dirender di environment Vite bernama `prerender`.
  vite: { environments: { prerender: { resolve: { external: ['satteri'] } } } },
  integrations: [
    starlight({
      title: site.title,
      description: site.tagline,
      locales: {
        root: { label: 'Bahasa Indonesia', lang: 'id' },
      },
      customCss: [
        './src/styles/base.css',
        './src/styles/settings.css',
        './src/styles/themes/light.css',
        './src/styles/themes/dark.css',
        './src/styles/themes/sepia.css',
        './src/styles/themes/contrast.css',
      ],
      components: {
        ThemeProvider: './src/overrides/ThemeProvider.astro',
        ThemeSelect: './src/overrides/ThemeSelect.astro',
        PageTitle: './src/overrides/PageTitle.astro',
        EditLink: './src/overrides/EditLink.astro',
      },
      routeMiddleware: './src/routeData.ts',
      // Gagalkan build bila ada tautan internal yang menunjuk halaman yang tidak ada.
      // Validator hanya mengenal halaman konten Starlight; halaman kustom di
      // `src/pages` (katalog.astro) ia tolak sebagai "invalid link to custom page".
      // Daftarkan di `exclude` hanya rute kustom yang ditautkan dari konten.
      plugins: [starlightLinksValidator({ exclude: ['/katalog/'] })],
      // Tautan ke GitHub hanya aktif bila repositorinya publik.
      editLink: site.repo.public
        ? { baseUrl: `https://github.com/${site.repo.owner}/${site.repo.name}/edit/${site.repo.branch}/` }
        : undefined,
    }),
  ],
});
