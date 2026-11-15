// Route middleware Starlight: dijalankan untuk setiap halaman sebelum dirender.
// Di sini sidebar diganti menjadi sidebar per teknologi, navigasi
// sebelumnya/berikutnya dibatasi ke teknologi yang sama, dan nilai filter
// pencarian ditambahkan ke <head>.
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { getDomain, getTech, getTechPages, getTemplate } from './lib/data.ts';
import { LEVEL_LABELS, TYPE_LABELS } from './lib/labels.ts';
import { buildTechSidebar, homeSidebar, paginate } from './lib/sidebar.ts';

export const onRequest = defineRouteMiddleware(async (context) => {
  const route = context.locals.starlightRoute;
  const { tech: techSlug, level } = route.entry.data;
  const currentHref = context.url.pathname.endsWith('/') ? context.url.pathname : `${context.url.pathname}/`;

  const tech = techSlug === undefined ? undefined : await getTech(techSlug);
  const template = tech === undefined ? undefined : await getTemplate(tech.template);

  if (tech === undefined || template === undefined) {
    route.sidebar = homeSidebar(currentHref);
    route.pagination = { prev: undefined, next: undefined };
    return;
  }

  const pages = await getTechPages(tech.slug);
  route.sidebar = buildTechSidebar({ techName: tech.name, template, pages, currentHref });
  route.pagination = paginate(pages, currentHref);

  // Filter Pagefind: bisa dipakai menyaring hasil pencarian per domain, level, dan jenis.
  const domain = await getDomain(tech.domain);
  const filters: Record<string, string | undefined> = {
    domain: domain?.name,
    level: level === undefined ? undefined : LEVEL_LABELS[level],
    jenis: TYPE_LABELS[tech.type],
  };
  for (const [name, content] of Object.entries(filters)) {
    if (content === undefined) continue;
    route.head.push({ tag: 'meta', attrs: { 'data-pagefind-filter': `${name}[content]`, content } });
  }
});
