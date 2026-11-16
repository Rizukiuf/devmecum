import { expect, test } from 'vitest';
import {
  buildCatalog,
  filtersToSearch,
  matchesFilters,
  parseFilters,
  type CatalogEntry,
  type CatalogFilters,
} from '../../src/lib/catalog.ts';
import type { Domain, Tech } from '../../src/lib/schemas.ts';

const domains: Domain[] = [
  { id: 'bahasa', name: 'Bahasa', description: 'Bahasa pemrograman', order: 1, freshnessMonths: 6 },
  { id: 'web', name: 'Web', description: 'Pengembangan web', order: 2, freshnessMonths: 3 },
];
const ids = domains.map((d) => d.id);

function tech(over: Partial<Tech> & Pick<Tech, 'slug' | 'name' | 'domain'>): Tech {
  return {
    type: 'language',
    template: 'A',
    website: 'https://example.com',
    docs: 'https://example.com/docs',
    requires: [],
    alternatives: [],
    tags: [],
    useCases: [],
    ...over,
  };
}

const techs: Tech[] = [
  tech({ slug: 'react', name: 'React', domain: 'web', type: 'library', tags: ['ui'] }),
  tech({ slug: 'rust', name: 'Rust', domain: 'bahasa', adoption: 'berkembang', trend: 'naik' }),
  tech({ slug: 'python', name: 'Python', domain: 'bahasa', tags: ['scripting'], latestVersion: '3.13' }),
  tech({ slug: 'ada', name: 'Ada', domain: 'bahasa' }),
];

function build() {
  return buildCatalog({
    techs,
    domains,
    stages: new Map([
      ['python', 2],
      ['react', 1],
    ]),
    hrefs: new Map([['python', '/python/']]),
  });
}

test('katalog urut domain lalu nama', () => {
  const catalog = build();
  expect(catalog.map((e) => e.slug)).toEqual(['ada', 'python', 'rust', 'react']);
  const python = catalog.find((e) => e.slug === 'python') as CatalogEntry;
  expect(python).toMatchObject({
    domainName: 'Bahasa',
    domainOrder: 1,
    stage: 2,
    href: '/python/',
    latestVersion: '3.13',
    tags: ['scripting'],
  });
  expect(catalog.find((e) => e.slug === 'rust')).not.toHaveProperty('href');
  expect(catalog.find((e) => e.slug === 'rust')?.stage).toBe(0);
});

test('parseFilters mengabaikan nilai tak dikenal', () => {
  expect(parseFilters('?domain=tidak-ada&jenis=xx&tingkat=9', ids)).toEqual({});
});

test('parseFilters menormalkan huruf dan memakai nilai pertama', () => {
  expect(parseFilters('?ADOPSI=x&adopsi=Mapan&adopsi=khusus', ids)).toEqual({ adopsi: 'mapan' });
});

test('parseFilters membaca semua kunci dan memangkas q', () => {
  expect(parseFilters('?domain=Web&jenis=Library&tingkat=3&adopsi=mapan&tren=NAIK&q=%20%20Re%20', ids)).toEqual({
    domain: 'web',
    jenis: 'library',
    tingkat: 3,
    adopsi: 'mapan',
    tren: 'naik',
    q: 'Re',
  });
  expect(parseFilters('?q=%20%20', ids)).toEqual({});
  expect(parseFilters('tingkat=0', ids)).toEqual({ tingkat: 0 });
});

test('filtersToSearch berurutan tetap dan kosong tanpa filter', () => {
  expect(filtersToSearch({ tren: 'naik', domain: 'bahasa' })).toBe('?domain=bahasa&tren=naik');
  expect(filtersToSearch({})).toBe('');
});

test('pulang-pergi', () => {
  const f: CatalogFilters = {
    domain: 'web',
    jenis: 'library',
    tingkat: 0,
    adopsi: 'arus-utama',
    tren: 'stabil',
    q: 'a b&c',
  };
  expect(parseFilters(filtersToSearch(f), ids)).toEqual(f);
});

test('q mencocokkan nama, slug, dan tag tanpa peka huruf', () => {
  const python = build().find((e) => e.slug === 'python') as CatalogEntry;
  expect(matchesFilters(python, { q: 'PYT' })).toBe(true);
  expect(matchesFilters(python, { q: 'SCRIPT' })).toBe(true);
  expect(matchesFilters(python, { q: 'zzz' })).toBe(false);
  expect(matchesFilters(python, { domain: 'bahasa', jenis: 'language', tingkat: 2 })).toBe(true);
  expect(matchesFilters(python, { tingkat: 3 })).toBe(false);
});

test('entri tanpa adoption tidak lolos filter adopsi', () => {
  const catalog = build();
  const python = catalog.find((e) => e.slug === 'python') as CatalogEntry;
  const rust = catalog.find((e) => e.slug === 'rust') as CatalogEntry;
  expect(matchesFilters(python, { adopsi: 'berkembang' })).toBe(false);
  expect(matchesFilters(python, { tren: 'naik' })).toBe(false);
  expect(matchesFilters(rust, { adopsi: 'berkembang', tren: 'naik' })).toBe(true);
});
