import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import {
  deriveDraft,
  domainSchema,
  pageExtension,
  refinePage,
  techSchema,
  templateSchema,
} from './lib/schemas.ts';

export const collections = {
  // Semua materi. Skema Starlight diperluas dengan kolom Devmecum; kolom `draft`
  // diturunkan dari `status`, sehingga halaman draf tidak ikut build produksi.
  docs: defineCollection({
    loader: docsLoader(),
    schema: (context) =>
      docsSchema({ extend: pageExtension })(context)
        .superRefine(refinePage)
        .transform((data) => ({ ...data, draft: deriveDraft(data) })),
  }),
  // Teks antarmuka Starlight yang ditimpa (src/content/i18n/id.json).
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
  // Satu file YAML per teknologi.
  tech: defineCollection({
    loader: glob({ base: './src/data/tech', pattern: '*.yaml' }),
    schema: techSchema,
  }),
  domains: defineCollection({ loader: file('src/data/domains.yaml'), schema: domainSchema }),
  templates: defineCollection({ loader: file('src/data/templates.yaml'), schema: templateSchema }),
};
