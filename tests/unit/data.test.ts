import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import { parse } from 'yaml';
import { domainSchema, techSchema, templateSchema, type Template } from '../../src/lib/schemas.ts';

const dataDir = fileURLToPath(new URL('../../src/data/', import.meta.url));
const load = (name: string): unknown => parse(readFileSync(dataDir + name, 'utf8'));

const templates = (load('templates.yaml') as unknown[]).map((t) => templateSchema.parse(t));
const domains = (load('domains.yaml') as unknown[]).map((d) => domainSchema.parse(d));
const template = (id: string): Template => templates.find((t) => t.id === id)!;
const levelOf = (id: string, chapter: number) => template(id).chapters[chapter - 1]!.level;

test.each([
  ['A', 26],
  ['B', 21],
  ['C', 16],
  ['D', 16],
  ['E', 13],
] as const)('templat %s punya %i bab bernomor urut dari 1', (id, count) => {
  const numbers = template(id).chapters.map((c) => c.number);
  expect(numbers).toEqual(Array.from({ length: count }, (_, i) => i + 1));
});

test('bab 1 selalu berlevel umum', () => {
  for (const t of templates) expect(t.chapters[0]!.level).toBe('umum');
});

test.each([
  ['A', 2, 'dasar'], ['A', 6, 'dasar'], ['A', 7, 'menengah'], ['A', 15, 'menengah'],
  ['A', 16, 'lanjut'], ['A', 21, 'lanjut'], ['A', 22, 'profesional'], ['A', 23, 'umum'], ['A', 26, 'umum'],
  ['B', 5, 'dasar'], ['B', 6, 'menengah'], ['B', 11, 'menengah'], ['B', 12, 'lanjut'],
  ['B', 16, 'lanjut'], ['B', 17, 'profesional'], ['B', 18, 'umum'],
  ['C', 5, 'dasar'], ['C', 6, 'menengah'], ['C', 7, 'menengah'], ['C', 8, 'lanjut'],
  ['C', 10, 'lanjut'], ['C', 11, 'profesional'], ['C', 12, 'umum'], ['C', 16, 'umum'],
  ['D', 4, 'dasar'], ['D', 5, 'menengah'], ['D', 7, 'menengah'], ['D', 8, 'lanjut'],
  ['D', 12, 'lanjut'], ['D', 13, 'profesional'], ['D', 14, 'umum'], ['D', 16, 'umum'],
  ['E', 3, 'dasar'], ['E', 4, 'menengah'], ['E', 6, 'menengah'], ['E', 7, 'lanjut'],
  ['E', 8, 'profesional'], ['E', 9, 'umum'], ['E', 11, 'umum'], ['E', 13, 'umum'],
] as const)('templat %s bab %i berlevel %s', (id, chapter, level) => {
  expect(levelOf(id, chapter)).toBe(level);
});

test('judul bab disalin dari Lampiran B', () => {
  expect(template('A').chapters[11]!.title).toBe('File, I/O, dan serialisasi');
  expect(template('B').chapters[20]!.title).toBe('Referensi dan cheat sheet');
  expect(template('E').chapters[0]!.title).toBe('Ringkasan dan peta konsep');
});

test.each([['A', 23], ['B', 18], ['C', 12], ['D', 14], ['E', 11]] as const)(
  'templat %s memuat bab Bekerja dengan AI di bab %i',
  (id, chapter) => expect(template(id).chapters[chapter - 1]!.title).toBe('Bekerja dengan AI'),
);

test('ada 18 domain dengan id unik dan urutan 1–18', () => {
  expect(domains).toHaveLength(18);
  expect(new Set(domains.map((d) => d.id)).size).toBe(18);
  expect(domains.map((d) => d.order)).toEqual(Array.from({ length: 18 }, (_, i) => i + 1));
});

test('setiap domain punya description 1–200 karakter', () => {
  const raw = load('domains.yaml') as { id: string; description?: unknown }[];
  for (const d of raw) {
    expect(typeof d.description, d.id).toBe('string');
    const length = (d.description as string).length;
    expect(length, d.id).toBeGreaterThanOrEqual(1);
    expect(length, d.id).toBeLessThanOrEqual(200);
  }
});

test('skema domain menolak domain tanpa description', () => {
  const { description: _d, ...rest } = domains[0]!;
  expect(domainSchema.safeParse(rest).success).toBe(false);
  expect(domainSchema.safeParse({ ...rest, description: '' }).success).toBe(false);
  expect(domainSchema.safeParse({ ...rest, description: 'x'.repeat(201) }).success).toBe(false);
});

test('batas kedaluwarsa 3 bulan hanya untuk web-frontend, genai, dan cloud', () => {
  const fast = domains.filter((d) => d.freshnessMonths === 3).map((d) => d.id);
  expect(fast.sort()).toEqual(['cloud', 'genai', 'web-frontend']);
});

test('setiap file teknologi lolos skema dan slug-nya sama dengan nama file', () => {
  const files = readdirSync(dataDir + 'tech').filter((f) => f.endsWith('.yaml'));
  expect(files).toContain('python.yaml');
  expect(files).toContain('uji-komponen.yaml');
  expect(files).toContain('uji-terdaftar.yaml');
  for (const file of files) {
    const tech = techSchema.parse(load('tech/' + file));
    expect(tech.slug + '.yaml').toBe(file);
    expect(domains.map((d) => d.id)).toContain(tech.domain);
  }
});
