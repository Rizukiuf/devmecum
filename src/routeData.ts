// Route middleware Starlight: dijalankan untuk setiap halaman sebelum dirender.
// Di sini sidebar diganti menjadi sidebar per teknologi (atau sidebar situs
// untuk halaman tanpa teknologi), navigasi sebelumnya/berikutnya dibatasi ke
// teknologi yang sama, dan nilai filter pencarian ditambahkan ke <head>.
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { getAllDomains, getDomain, getTech, getTechPages, getTemplate } from './lib/data.ts';
import { LEVEL_LABELS, TYPE_LABELS } from './lib/labels.ts';
import { buildTechSidebar, paginate, siteSidebar } from './lib/sidebar.ts';
import site from '../site.config.mjs';

export const onRequest = defineRouteMiddleware(async (context) => {
  const route = context.locals.starlightRoute;
  const { tech: techSlug, level } = route.entry.data;
  const currentHref = context.url.pathname.endsWith('/') ? context.url.pathname : `${context.url.pathname}/`;

  const tech = techSlug === undefined ? undefined : await getTech(techSlug);
  const template = tech === undefined ? undefined : await getTemplate(tech.template);
  const domain = tech === undefined ? undefined : await getDomain(tech.domain);

  if (tech === undefined || template === undefined || domain === undefined) {
    route.sidebar = siteSidebar(currentHref, await getAllDomains());
    route.pagination = { prev: undefined, next: undefined };
    return;
  }

  const pages = await getTechPages(tech.slug);
  route.sidebar = buildTechSidebar({ techName: tech.name, template, pages, currentHref, domain });
  route.pagination = paginate(pages, currentHref);

  // Filter Pagefind: bisa dipakai menyaring hasil pencarian per domain, level, dan jenis.
  const filters: Record<string, string | undefined> = {
    domain: domain.name,
    level: level === undefined ? undefined : LEVEL_LABELS[level],
    jenis: TYPE_LABELS[tech.type],
  };
  // Satu gambar pratinjau per teknologi (src/pages/og/[tech].png.ts).
  const image = `${site.url}/og/${tech.slug}.png`;
  route.head.push(
    { tag: 'meta', attrs: { property: 'og:image', content: image } },
    { tag: 'meta', attrs: { name: 'twitter:image', content: image } },
    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
  );

  for (const [name, content] of Object.entries(filters)) {
    if (content === undefined) continue;
    route.head.push({ tag: 'meta', attrs: { 'data-pagefind-filter': `${name}[content]`, content } });
  }
});
