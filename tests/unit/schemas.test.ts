import { afterEach, expect, test, vi } from 'vitest';
import { deriveDraft, materiSchema, techSchema } from '../../src/lib/schemas.ts';

const page = {
  title: 'T',
  description: 'D',
  tech: 'python',
  chapter: 7,
  level: 'menengah',
  status: 'terbit',
  techVersion: '3.x',
  lastVerified: new Date('2026-11-14'),
  factChecked: new Date('2026-11-14'),
  sources: ['https://docs.python.org/3/'],
  codeTested: true,
};

const validTech = {
  name: 'Python',
  slug: 'python',
  type: 'language',
  domain: 'bahasa',
  template: 'A',
  website: 'https://www.python.org',
  docs: 'https://docs.python.org/3/',
  latestVersion: '3.14',
  versionSource: { kind: 'github', repo: 'python/cpython' },
  requires: [],
  alternatives: [],
  tags: ['serbaguna'],
  useCases: ['otomasi'],
};

afterEach(() => vi.unstubAllEnvs());

test('halaman materi lengkap lolos', () => {
  expect(materiSchema.safeParse(page).success).toBe(true);
});

test('terbit tanpa factChecked ditolak', () => {
  expect(materiSchema.safeParse({ ...page, factChecked: undefined }).success).toBe(false);
});

test('terbit tanpa sumber ditolak', () => {
  expect(materiSchema.safeParse({ ...page, sources: [] }).success).toBe(false);
});

test('Ringkasan terbit butuh dua sumber', () => {
  expect(materiSchema.safeParse({ ...page, chapter: 1, level: 'umum' }).success).toBe(false);
});

test('Ringkasan terbit dengan dua sumber lolos', () => {
  const sources = ['https://docs.python.org/3/', 'https://www.python.org/about/'];
  expect(materiSchema.safeParse({ ...page, chapter: 1, level: 'umum', sources }).success).toBe(true);
});

test('draf boleh tanpa factChecked dan sumber', () => {
  const r = materiSchema.safeParse({ ...page, status: 'draf', factChecked: undefined, sources: [] });
  expect(r.success).toBe(true);
});

test('codeTested false tetap boleh terbit', () => {
  expect(materiSchema.safeParse({ ...page, codeTested: false }).success).toBe(true);
});

test('sumber bukan https ditolak', () => {
  expect(materiSchema.safeParse({ ...page, sources: ['http://contoh.id/'] }).success).toBe(false);
});

test('halaman materi tanpa level ditolak', () => {
  expect(materiSchema.safeParse({ ...page, level: undefined }).success).toBe(false);
});

test('versi berupa angka ditolak dengan petunjuk tanda kutip', () => {
  const r = materiSchema.safeParse({ ...page, techVersion: 3.1 });
  expect(r.success).toBe(false);
  expect(JSON.stringify(r.error?.issues)).toContain('tanda kutip');
});

test('tanggal berupa teks YYYY-MM-DD diterima sebagai tanggal UTC', () => {
  const r = materiSchema.safeParse({ ...page, lastVerified: '2026-11-14', factChecked: '2026-11-14' });
  expect(r.success).toBe(true);
  expect(r.data?.lastVerified).toEqual(new Date('2026-11-14T00:00:00Z'));
});

test('tanggal berupa angka ditolak', () => {
  expect(materiSchema.safeParse({ ...page, lastVerified: 2026 }).success).toBe(false);
});

test('halaman lepas cukup title dan description', () => {
  expect(materiSchema.safeParse({ title: 'Beranda', description: 'D' }).success).toBe(true);
});

test('halaman tanpa description ditolak', () => {
  expect(materiSchema.safeParse({ title: 'Beranda' }).success).toBe(false);
});

test('data teknologi yang sah lolos', () => {
  expect(techSchema.safeParse(validTech).success).toBe(true);
});

test('kunci tak dikenal di data teknologi ditolak', () => {
  expect(techSchema.safeParse({ ...validTech, lisense: 'MIT' }).success).toBe(false);
});

test('latestVersion berupa angka ditolak dengan petunjuk tanda kutip', () => {
  const r = techSchema.safeParse({ ...validTech, latestVersion: 3.1 });
  expect(r.success).toBe(false);
  expect(JSON.stringify(r.error?.issues)).toContain('tanda kutip');
});

test('slug berhuruf kapital ditolak', () => {
  expect(techSchema.safeParse({ ...validTech, slug: 'Python' }).success).toBe(false);
});

test('versionSource github tanpa repo ditolak', () => {
  expect(techSchema.safeParse({ ...validTech, versionSource: { kind: 'github' } }).success).toBe(false);
});

test('deriveDraft: draf selalu disembunyikan, terbit tidak', () => {
  expect(deriveDraft({ status: 'draf' })).toBe(true);
  expect(deriveDraft({ status: 'terbit', tech: 'python' })).toBe(false);
  expect(deriveDraft({})).toBe(false);
  expect(deriveDraft({ draft: true })).toBe(true);
});

test('deriveDraft: konten uji hanya tampil bila DEVMECUM_FIXTURES=1', () => {
  expect(deriveDraft({ status: 'terbit', tech: 'uji-komponen' })).toBe(true);
  vi.stubEnv('DEVMECUM_FIXTURES', '1');
  expect(deriveDraft({ status: 'terbit', tech: 'uji-komponen' })).toBe(false);
  expect(deriveDraft({ status: 'draf', tech: 'uji-komponen' })).toBe(true);
});
