// Logika katalog teknologi, dipakai halaman Astro dan elemen kustom di browser.
// Murni: tanpa API Node dan tanpa `astro:content`. Nilai enum diambil dari kunci
// label supaya berkas ini tidak menarik zod ke bundel browser.
import { ADOPTION_LABELS, TREND_LABELS, TYPE_LABELS } from './labels.ts';
import type { Stage } from './maturity.ts';
import type { Adoption, Domain, Tech, TechType, Trend } from './schemas.ts';

export type CatalogEntry = {
  slug: string;
  name: string;
  domain: string;
  domainName: string;
  domainOrder: number;
  type: TechType;
  stage: Stage;
  adoption?: Adoption;
  trend?: Trend;
  latestVersion?: string;
  useCases: string[];
  tags: string[];
  website: string;
  docs: string;
  href?: string;
};

export type CatalogFilters = {
  domain?: string;
  jenis?: TechType;
  tingkat?: Stage;
  adopsi?: Adoption;
  tren?: Trend;
  q?: string;
};

const TYPES = Object.keys(TYPE_LABELS) as TechType[];
const ADOPTIONS = Object.keys(ADOPTION_LABELS) as Adoption[];
const TRENDS = Object.keys(TREND_LABELS) as Trend[];
const STAGES: readonly Stage[] = [0, 1, 2, 3, 4, 5];

export function buildCatalog(input: {
  techs: Tech[];
  domains: Domain[];
  stages: Map<string, Stage>;
  hrefs: Map<string, string>;
}): CatalogEntry[] {
  const domains = new Map(input.domains.map((domain) => [domain.id, domain]));
  const entries: CatalogEntry[] = [];
  for (const tech of input.techs) {
    const domain = domains.get(tech.domain);
    const href = input.hrefs.get(tech.slug);
    entries.push({
      slug: tech.slug,
      name: tech.name,
      domain: tech.domain,
      domainName: domain?.name ?? tech.domain,
      domainOrder: domain?.order ?? Number.MAX_SAFE_INTEGER,
      type: tech.type,
      stage: input.stages.get(tech.slug) ?? 0,
      ...(tech.adoption !== undefined && { adoption: tech.adoption }),
      ...(tech.trend !== undefined && { trend: tech.trend }),
      ...(tech.latestVersion !== undefined && { latestVersion: tech.latestVersion }),
      useCases: tech.useCases,
      tags: tech.tags,
      website: tech.website,
      docs: tech.docs,
      ...(href !== undefined && { href }),
    });
  }
  return entries.sort((a, b) => a.domainOrder - b.domainOrder || a.name.localeCompare(b.name, 'id'));
}

function pickEnum<T extends string>(raw: string | null, allowed: readonly T[]): T | undefined {
  if (raw === null) return undefined;
  const value = raw.toLowerCase();
  return allowed.find((item) => item === value);
}

/** Kunci peka huruf, nilai tidak; nilai pertama menang; nilai tak dikenal diabaikan. */
export function parseFilters(search: string, domainIds: readonly string[]): CatalogFilters {
  const params = new URLSearchParams(search);
  const filters: CatalogFilters = {};

  const domain = pickEnum(params.get('domain'), domainIds);
  if (domain !== undefined) filters.domain = domain;
  const jenis = pickEnum(params.get('jenis'), TYPES);
  if (jenis !== undefined) filters.jenis = jenis;
  const tingkat = params.get('tingkat');
  if (tingkat !== null) {
    const stage = STAGES.find((item) => String(item) === tingkat.trim());
    if (stage !== undefined) filters.tingkat = stage;
  }
  const adopsi = pickEnum(params.get('adopsi'), ADOPTIONS);
  if (adopsi !== undefined) filters.adopsi = adopsi;
  const tren = pickEnum(params.get('tren'), TRENDS);
  if (tren !== undefined) filters.tren = tren;
  const q = params.get('q')?.trim();
  if (q) filters.q = q;

  return filters;
}

/** Urutan kunci tetap: domain, jenis, tingkat, adopsi, tren, q. Kosong bila tanpa filter. */
export function filtersToSearch(filters: CatalogFilters): string {
  const params = new URLSearchParams();
  if (filters.domain !== undefined) params.set('domain', filters.domain);
  if (filters.jenis !== undefined) params.set('jenis', filters.jenis);
  if (filters.tingkat !== undefined) params.set('tingkat', String(filters.tingkat));
  if (filters.adopsi !== undefined) params.set('adopsi', filters.adopsi);
  if (filters.tren !== undefined) params.set('tren', filters.tren);
  if (filters.q !== undefined && filters.q.trim() !== '') params.set('q', filters.q.trim());
  const text = params.toString();
  return text === '' ? '' : `?${text}`;
}

/** Bagian entri yang dibaca filter; elemen kustom katalog membangunnya dari atribut kartu. */
export type FilterableEntry = Pick<CatalogEntry, 'slug' | 'name' | 'domain' | 'type' | 'stage' | 'adoption' | 'trend' | 'tags'>;

export function matchesFilters(entry: FilterableEntry, filters: CatalogFilters): boolean {
  if (filters.domain !== undefined && entry.domain !== filters.domain) return false;
  if (filters.jenis !== undefined && entry.type !== filters.jenis) return false;
  if (filters.tingkat !== undefined && entry.stage !== filters.tingkat) return false;
  if (filters.adopsi !== undefined && entry.adoption !== filters.adopsi) return false;
  if (filters.tren !== undefined && entry.trend !== filters.tren) return false;
  const q = filters.q?.trim().toLowerCase();
  if (q) {
    const haystack = [entry.name, entry.slug, ...entry.tags];
    if (!haystack.some((text) => text.toLowerCase().includes(q))) return false;
  }
  return true;
}
