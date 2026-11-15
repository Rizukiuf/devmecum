import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import { parse } from 'yaml';
import type { TechPage } from '../../src/lib/data.ts';
import { templateSchema } from '../../src/lib/schemas.ts';
import { buildTechSidebar, homeSidebar, paginate } from '../../src/lib/sidebar.ts';

const templatesFile = fileURLToPath(new URL('../../src/data/templates.yaml', import.meta.url));
const tplA = (parse(readFileSync(templatesFile, 'utf8')) as unknown[])
  .map((t) => templateSchema.parse(t))
  .find((t) => t.id === 'A')!;

const BASE = '/bahasa/python/';
const p = (chapter: number, relPath: string, title: string): TechPage => {
  const path = relPath.replace(/\.mdx$/, '');
  const isIndex = relPath === 'index.mdx';
  return {
    id: isIndex ? 'bahasa/python' : `bahasa/python/${path}`,
    href: isIndex ? BASE : `${BASE}${path}/`,
    title,
    chapter,
    relPath,
    slug: isIndex ? '' : path.split('/').pop()!,
    status: 'terbit',
  };
};
const pages = [
  p(1, 'index.mdx', 'Python'),
  p(2, '02-pengenalan/apa-itu.mdx', 'Apa itu Python'),
  p(4, '04-sintaks-dasar/operator.mdx', 'Operator'),
  p(4, '04-sintaks-dasar/variabel.mdx', 'Variabel'),
];
const current = `${BASE}04-sintaks-dasar/variabel/`;
const sb = buildTechSidebar({ techName: 'Python', template: tplA, pages, currentHref: current });

type Entry = (typeof sb)[number];
const group = (entries: Entry[], label: string) => {
  const found = entries.find((e) => e.type === 'group' && e.label === label);
  if (found?.type !== 'group') throw new Error(`grup ${label} tidak ada`);
  return found;
};
const tech = group(sb, 'Python');

test('hanya Beranda dan grup teknologi', () => {
  expect(sb.map((e) => e.label)).toEqual(['Beranda', 'Python']);
  expect(sb[0]).toMatchObject({ type: 'link', href: '/', isCurrent: false });
});

test('Ringkasan lalu subgrup per bab berurutan', () => {
  expect(tech.entries.map((e) => e.label)).toEqual(['Ringkasan', '2 · Pengenalan', '4 · Sintaks dasar']);
  expect(tech.entries[0]).toMatchObject({ type: 'link', href: BASE });
});

test('bab tanpa halaman tidak muncul', () => {
  expect(tech.entries.map((e) => e.label)).not.toContain('3 · Lingkungan kerja');
});

test('halaman dalam bab mengikuti urutan yang diberikan', () => {
  expect(group(tech.entries, '4 · Sintaks dasar').entries.map((e) => e.label)).toEqual(['Operator', 'Variabel']);
});

test('halaman aktif ditandai dan grupnya terbuka', () => {
  const bab4 = group(tech.entries, '4 · Sintaks dasar');
  expect(bab4.entries.find((e) => e.label === 'Variabel')).toMatchObject({ isCurrent: true, href: current });
  expect(bab4.entries.find((e) => e.label === 'Operator')).toMatchObject({ isCurrent: false });
  expect(bab4.collapsed).toBe(false);
  expect(group(tech.entries, '2 · Pengenalan').collapsed).toBe(true);
  expect(tech.collapsed).toBe(false);
});

test('setiap entri punya bentuk yang diminta Starlight', () => {
  expect(sb[0]).toEqual({ type: 'link', label: 'Beranda', href: '/', isCurrent: false, badge: undefined, attrs: {} });
  expect(tech.badge).toBeUndefined();
});

test('halaman tanpa teknologi hanya mendapat Beranda', () => {
  expect(homeSidebar('/').map((e) => e.label)).toEqual(['Beranda']);
  expect(homeSidebar('/')[0]).toMatchObject({ isCurrent: true });
});

test('pagination tetap di dalam teknologi', () => {
  const first = paginate(pages, pages[0]!.href);
  expect(first.prev).toBeUndefined();
  expect(first.next).toMatchObject({ type: 'link', href: pages[1]!.href, label: 'Apa itu Python' });

  const last = paginate(pages, pages.at(-1)!.href);
  expect(last.next).toBeUndefined();
  expect(last.prev).toMatchObject({ href: pages[2]!.href, label: 'Operator' });
});

test('pagination untuk halaman yang tidak dikenal kosong', () => {
  expect(paginate(pages, '/lain/')).toEqual({ prev: undefined, next: undefined });
});
