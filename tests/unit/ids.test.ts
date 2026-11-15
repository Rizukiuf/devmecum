import { expect, test } from 'vitest';
import { buildIdIndex, pageSlug, parseId, resolveId } from '../../src/lib/ids.ts';

test('parseId menerima ID teknologi dan ID halaman', () => {
  expect(parseId('python')).toEqual({ tech: 'python' });
  expect(parseId('python/variabel-tipe-data')).toEqual({ tech: 'python', page: 'variabel-tipe-data' });
});

test.each(['', 'Python', '/python', 'python/', 'a/b/c', 'bahasa/python/index.mdx', 'https://x.dev', 'python/Variabel'])(
  'parseId menolak %j',
  (bad) => {
    expect(parseId(bad)).toBeNull();
  },
);

test('pageSlug mengambil nama file tanpa folder dan ekstensi', () => {
  expect(pageSlug('02-pengenalan/apa-itu.mdx')).toBe('apa-itu');
  expect(pageSlug('02-pengenalan\apa-itu.md')).toBe('apa-itu');
  expect(pageSlug('index.mdx')).toBe('');
});

const { index, duplicates } = buildIdIndex(
  [
    { slug: 'python', domain: 'bahasa' },
    { slug: 'react', domain: 'web-frontend' },
  ],
  [
    { tech: 'python', relPath: 'index.mdx' },
    { tech: 'python', relPath: '04-sintaks-dasar/variabel-tipe-data.mdx' },
    { tech: 'python', relPath: '05-alur-kontrol/variabel-tipe-data.mdx' },
  ],
);

test('URL mengikuti /{domain}/{teknologi}/…', () => {
  expect(resolveId('python', index)).toBe('/bahasa/python/');
  expect(resolveId('python/variabel-tipe-data', index)).toBe('/bahasa/python/04-sintaks-dasar/variabel-tipe-data/');
});

test('teknologi terdaftar punya URL walau belum punya halaman', () => {
  expect(resolveId('react', index)).toBe('/web-frontend/react/');
});

test('ID tak dikenal atau tidak sah → undefined', () => {
  expect(resolveId('vue', index)).toBeUndefined();
  expect(resolveId('python/tidak-ada', index)).toBeUndefined();
  expect(resolveId('Bukan ID', index)).toBeUndefined();
});

test('slug halaman ganda dilaporkan dan yang pertama dipakai', () => {
  expect(duplicates).toEqual(['python/variabel-tipe-data']);
});

test('halaman milik teknologi tak terdaftar diabaikan', () => {
  const r = buildIdIndex([], [{ tech: 'hantu', relPath: 'index.mdx' }]);
  expect(r.index.size).toBe(0);
});
