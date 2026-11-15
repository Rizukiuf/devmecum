// Rujukan antarhalaman memakai ID, bukan path atau URL (rancangan §5.8):
//   `python`                     → halaman Ringkasan teknologi
//   `python/variabel-tipe-data`  → satu halaman di dalam teknologi
// Berkas ini satu-satunya tempat ID diterjemahkan menjadi URL.
import { SLUG_RE } from './schemas.ts';

export type PageRef = { tech: string; page?: string };
export type IdIndex = Map<string, string>;

export function parseId(id: string): PageRef | null {
  const parts = id.split('/');
  if (parts.length > 2 || !parts.every((part) => SLUG_RE.test(part))) return null;
  const [tech, page] = parts as [string, string?];
  return page === undefined ? { tech } : { tech, page };
}

/** Slug halaman = nama file tanpa folder dan ekstensi; `index` menjadi teks kosong. */
export function pageSlug(relPath: string): string {
  const fileName = relPath.replaceAll('\\', '/').split('/').pop() ?? '';
  const name = fileName.replace(/\.(md|mdx)$/i, '');
  return name === 'index' ? '' : name;
}

/**
 * Membangun peta ID → URL. `relPath` relatif terhadap folder teknologi,
 * misalnya `04-sintaks-dasar/variabel-tipe-data.mdx`.
 */
export function buildIdIndex(
  techs: { slug: string; domain: string }[],
  pages: { tech: string; relPath: string }[],
): { index: IdIndex; duplicates: string[] } {
  const index: IdIndex = new Map();
  const duplicates: string[] = [];
  const bases = new Map<string, string>();

  for (const tech of techs) {
    const base = `/${tech.domain}/${tech.slug}/`;
    bases.set(tech.slug, base);
    index.set(tech.slug, base);
  }

  for (const page of pages) {
    const base = bases.get(page.tech);
    const slug = pageSlug(page.relPath);
    if (base === undefined || slug === '') continue;

    const id = `${page.tech}/${slug}`;
    if (index.has(id)) {
      if (!duplicates.includes(id)) duplicates.push(id);
      continue;
    }
    const path = page.relPath.replaceAll('\\', '/').replace(/\.(md|mdx)$/i, '');
    index.set(id, `${base}${path}/`);
  }

  return { index, duplicates };
}

export function resolveId(id: string, index: IdIndex): string | undefined {
  return parseId(id) === null ? undefined : index.get(id);
}
