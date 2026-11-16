// Pembaca data untuk kode Astro (komponen, halaman, route middleware).
// Berkas ini memakai `astro:content`, jadi TIDAK bisa diimpor skrip Node;
// skrip memakai src/lib/validate.ts.
import { getCollection, getEntry } from 'astro:content';
import { buildIdIndex, pageSlug, type IdIndex } from './ids.ts';
import { computeStage, type Stage } from './maturity.ts';
import { buildCatalog, type CatalogEntry } from './catalog.ts';
import { readMetricsFile, type TechMetrics } from './metrics.ts';
import { isFixtureTech, type Domain, type Tech, type Template } from './schemas.ts';

export type TechPage = {
  /** ID entri Starlight, mis. `bahasa/python/04-sintaks-dasar/variabel`. */
  id: string;
  href: string;
  title: string;
  chapter: number;
  /** Path relatif terhadap folder teknologi, mis. `04-sintaks-dasar/variabel.mdx`. */
  relPath: string;
  /** Slug halaman untuk ID rujukan; teks kosong untuk Ringkasan. */
  slug: string;
  status: 'draf' | 'terbit';
};

const fixturesEnabled = () => process.env.DEVMECUM_FIXTURES === '1';

// Di build produksi data tidak berubah, jadi hasilnya disimpan: tanpa ini setiap
// halaman membaca ulang seluruh koleksi. Di mode dev selalu dibaca ulang.
const cache = new Map<string, Promise<unknown>>();
function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!import.meta.env.PROD) return load();
  if (!cache.has(key)) cache.set(key, load());
  return cache.get(key) as Promise<T>;
}

const loadTechs = () =>
  cached('tech', async () => (await getCollection('tech')).map((entry) => entry.data as Tech));

/** Semua teknologi untuk daftar publik. Teknologi uji hanya ikut bila DEVMECUM_FIXTURES=1. */
export async function getAllTech(): Promise<Tech[]> {
  const techs = await loadTechs();
  return fixturesEnabled() ? techs : techs.filter((tech) => !isFixtureTech(tech.slug));
}

export async function getTech(slug: string): Promise<Tech | undefined> {
  return (await loadTechs()).find((tech) => tech.slug === slug);
}

export async function getDomain(id: string): Promise<Domain | undefined> {
  return (await getEntry('domains', id))?.data as Domain | undefined;
}

/** Semua domain, urut `order`. */
export function getAllDomains(): Promise<Domain[]> {
  return cached('domains', async () =>
    (await getCollection('domains')).map((entry) => entry.data as Domain).sort((a, b) => a.order - b.order),
  );
}

export async function getTemplate(id: string): Promise<Template | undefined> {
  return (await getEntry('templates', id))?.data as Template | undefined;
}

const loadPages = () =>
  cached('pages', async () => {
    const techs = new Map((await loadTechs()).map((tech) => [tech.slug, tech]));
    // Di produksi halaman draf tidak ada di situs, jadi tidak boleh muncul di navigasi.
    const entries = await getCollection('docs', (entry) => !(import.meta.env.PROD && entry.data.draft));
    const pages = new Map<string, TechPage[]>();

    for (const entry of entries) {
      const tech = entry.data.tech === undefined ? undefined : techs.get(entry.data.tech);
      if (tech === undefined || entry.data.chapter === undefined) continue;

      const base = `${tech.domain}/${tech.slug}`;
      const rest = entry.id === base ? '' : entry.id.slice(base.length + 1);
      const relPath = rest === '' ? 'index.mdx' : `${rest}.mdx`;
      const list = pages.get(tech.slug) ?? [];
      list.push({
        id: entry.id,
        href: `/${entry.id}/`,
        title: entry.data.title,
        chapter: entry.data.chapter,
        relPath,
        slug: pageSlug(relPath),
        status: entry.data.status ?? 'draf',
      });
      pages.set(tech.slug, list);
    }

    for (const list of pages.values()) {
      list.sort((a, b) => a.chapter - b.chapter || a.relPath.localeCompare(b.relPath));
    }
    return pages;
  });

/** Halaman satu teknologi, urut bab lalu nama file. */
export async function getTechPages(slug: string): Promise<TechPage[]> {
  return (await loadPages()).get(slug) ?? [];
}

/** Peta ID rujukan → URL (lihat src/lib/ids.ts). */
export function getIdIndex(): Promise<IdIndex> {
  return cached('ids', async () => {
    const techs = await loadTechs();
    const pages = [...(await loadPages()).entries()].flatMap(([tech, list]) =>
      list.map((page) => ({ tech, relPath: page.relPath })),
    );
    return buildIdIndex(techs, pages).index;
  });
}

/** Tingkat kematangan teknologi, dihitung dari halaman yang terbit. */
export async function getStage(slug: string): Promise<Stage> {
  const tech = await getTech(slug);
  const template = tech === undefined ? undefined : await getTemplate(tech.template);
  if (template === undefined) return 0;
  const published = (await getTechPages(slug)).filter((page) => page.status === 'terbit');
  return computeStage({ template, published });
}

/**
 * Label dan tautan untuk rujukan ke teknologi lain (prasyarat, alternatif).
 * Tautan hanya diberikan bila teknologi itu sudah punya halaman Ringkasan yang
 * terbit; yang baru terdaftar tampil sebagai nama, yang tak dikenal sebagai ID.
 */
export async function getTechRef(id: string): Promise<{ label: string; href?: string }> {
  const tech = await getTech(id);
  if (tech === undefined) return { label: id };
  const href = (await getStage(tech.slug)) >= 1 ? (await getIdIndex()).get(tech.slug) : undefined;
  return href === undefined ? { label: tech.name } : { label: tech.name, href };
}

/**
 * Entri katalog untuk halaman domain dan katalog. Tautan hanya untuk teknologi
 * yang sudah punya Ringkasan terbit (tingkat 1 ke atas); tingkat 0 tidak punya halaman.
 */
export function getCatalog(): Promise<CatalogEntry[]> {
  return cached('catalog', async () => {
    const techs = await getAllTech();
    const stages = new Map<string, Stage>();
    const hrefs = new Map<string, string>();
    const index = await getIdIndex();
    for (const tech of techs) {
      const stage = await getStage(tech.slug);
      stages.set(tech.slug, stage);
      const href = index.get(tech.slug);
      if (stage >= 1 && href !== undefined) hrefs.set(tech.slug, href);
    }
    return buildCatalog({ techs, domains: await getAllDomains(), stages, hrefs });
  });
}

/**
 * Metrik popularitas satu teknologi dari berkas yang ditulis saat deploy
 * (`DEVMECUM_METRICS_FILE`, bawaan `src/data/metrics/metrics.json`). Tanpa berkas
 * atau tanpa entri, hasilnya `undefined` dan angka tidak ditampilkan.
 */
export async function getMetrics(slug: string): Promise<TechMetrics | undefined> {
  const file = await cached('metrics', async () =>
    readMetricsFile(process.env.DEVMECUM_METRICS_FILE ?? 'src/data/metrics/metrics.json'),
  );
  return file?.tech[slug];
}
