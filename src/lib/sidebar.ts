// Sidebar per teknologi (rancangan §8.2): HTML satu halaman hanya memuat bab
// teknologi yang sedang dibuka, bukan sidebar seluruh situs.
import type { StarlightRouteData } from '@astrojs/starlight/route-data';
import type { TechPage } from './data.ts';
import type { Template } from './schemas.ts';

export type SidebarEntry = StarlightRouteData['sidebar'][number];
type SidebarLink = Extract<SidebarEntry, { type: 'link' }>;
type SidebarGroup = Extract<SidebarEntry, { type: 'group' }>;
export type Pagination = { prev: SidebarLink | undefined; next: SidebarLink | undefined };

const link = (label: string, href: string, currentHref: string): SidebarLink => ({
  type: 'link',
  label,
  href,
  isCurrent: href === currentHref,
  badge: undefined,
  attrs: {},
});

const group = (label: string, entries: SidebarEntry[], collapsed: boolean): SidebarGroup => ({
  type: 'group',
  label,
  entries,
  collapsed,
  badge: undefined,
});

type DomainRef = { id: string; name: string };

const topLinks = (currentHref: string): SidebarLink[] => [
  link('Beranda', '/', currentHref),
  link('Katalog', '/katalog/', currentHref),
];

/** Sidebar untuk halaman yang bukan milik teknologi mana pun: beranda, katalog, dan semua domain. */
export function siteSidebar(currentHref: string, domains: DomainRef[]): SidebarEntry[] {
  return [
    ...topLinks(currentHref),
    group(
      'Domain',
      domains.map((domain) => link(domain.name, `/${domain.id}/`, currentHref)),
      false,
    ),
  ];
}

/**
 * `pages` harus sudah urut (bab, lalu nama file). Bab yang belum punya halaman
 * tidak ditampilkan; subgrup bab tertutup kecuali yang memuat halaman aktif.
 */
export function buildTechSidebar(input: {
  techName: string;
  template: Template;
  pages: TechPage[];
  currentHref: string;
  domain: DomainRef;
}): SidebarEntry[] {
  const { techName, template, pages, currentHref, domain } = input;
  const entries: SidebarEntry[] = [];

  for (const chapter of template.chapters) {
    const chapterPages = pages.filter((page) => page.chapter === chapter.number);
    if (chapterPages.length === 0) continue;

    if (chapter.number === 1) {
      entries.push(...chapterPages.map((page) => link('Ringkasan', page.href, currentHref)));
      continue;
    }
    const links = chapterPages.map((page) => link(page.title, page.href, currentHref));
    const containsCurrent = links.some((item) => item.isCurrent);
    entries.push(group(`${chapter.number} · ${chapter.title}`, links, !containsCurrent));
  }

  return [
    ...topLinks(currentHref),
    link(domain.name, `/${domain.id}/`, currentHref),
    group(techName, entries, false),
  ];
}

/** Sebelumnya/berikutnya di antara halaman teknologi yang sama. */
export function paginate(pages: TechPage[], currentHref: string): Pagination {
  const index = pages.findIndex((page) => page.href === currentHref);
  if (index === -1) return { prev: undefined, next: undefined };
  const at = (i: number) => {
    const page = pages[i];
    return page === undefined ? undefined : link(page.title, page.href, currentHref);
  };
  return { prev: at(index - 1), next: at(index + 1) };
}
