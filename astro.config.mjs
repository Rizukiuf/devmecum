// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import site from './site.config.mjs';

export default defineConfig({
  site: site.url,
  integrations: [
    starlight({
      title: site.title,
      description: site.tagline,
      locales: {
        root: { label: 'Bahasa Indonesia', lang: 'id' },
      },
      customCss: ['./src/styles/base.css'],
    }),
  ],
});
