import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import { parse } from 'yaml';
import { computeStage, STAGE_LABELS, type OutlineChapter } from '../../src/lib/maturity.ts';
import { templateSchema, type Template } from '../../src/lib/schemas.ts';

const templatesFile = fileURLToPath(new URL('../../src/data/templates.yaml', import.meta.url));
const templates = (parse(readFileSync(templatesFile, 'utf8')) as unknown[]).map((t) => templateSchema.parse(t));
const tplA = templates.find((t) => t.id === 'A') as Template;
const tplE = templates.find((t) => t.id === 'E') as Template;

type Input = Parameters<typeof computeStage>[0];
const r1 = { chapter: 1, slug: '' };
const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

/** Outline satu halaman per bab, semuanya terbit. Bab 1 berarti Ringkasan terbit. */
function full(chapters: number[], template: Template = tplA): Input {
  const body = chapters.filter((c) => c !== 1);
  return {
    template,
    published: chapters.map((c) => (c === 1 ? r1 : { chapter: c, slug: `h${c}` })),
    outline: body.map((c) => ({ chapter: c, pages: [`h${c}`] })),
  };
}
const withOutline = (input: Input, extra: OutlineChapter): Input => ({
  ...input,
  outline: [...(input.outline ?? []), extra],
});

test('label tingkat sesuai rancangan', () => {
  expect(STAGE_LABELS).toEqual(['Terdaftar', 'Ringkasan', 'Dasar', 'Menengah', 'Lanjut', 'Profesional']);
});

test('belum ada halaman terbit → 0', () => {
  expect(computeStage({ template: tplA, published: [] })).toBe(0);
});

test('Ringkasan terbit → 1', () => {
  expect(computeStage({ template: tplA, published: [r1] })).toBe(1);
});

test('tanpa outline tidak pernah lebih dari 1', () => {
  const many = range(2, 6).map((c) => ({ chapter: c, slug: `h${c}` }));
  expect(computeStage({ template: tplA, published: [r1, ...many] })).toBe(1);
});

test('bab Dasar 2–6 lengkap → 2', () => {
  expect(computeStage(full([1, 2, 3, 4, 5, 6]))).toBe(2);
});

test('bab Dasar lengkap tanpa Ringkasan → 0', () => {
  expect(computeStage(full([2, 3, 4, 5, 6]))).toBe(0);
});

test('Menengah lengkap tapi satu bab Dasar kurang → 1', () => {
  expect(computeStage(full([1, 2, 3, 4, 5, ...range(7, 15)]))).toBe(1);
});

test('bab tidak-berlaku dihitung lengkap', () => {
  expect(computeStage(withOutline(full([1, 2, 3, 4, 5]), { chapter: 6, tidakBerlaku: true }))).toBe(2);
});

test('bab dengan daftar halaman kosong belum lengkap', () => {
  expect(computeStage(withOutline(full([1, 2, 3, 4, 5]), { chapter: 6, pages: [] }))).toBe(1);
});

test('bab yang halamannya baru sebagian terbit belum lengkap', () => {
  const input = full([1, 2, 3, 4, 5]);
  const withPartial = withOutline(input, { chapter: 6, pages: ['h6', 'h6b'] });
  withPartial.published = [...withPartial.published, { chapter: 6, slug: 'h6' }];
  expect(computeStage(withPartial)).toBe(1);
});

test('Dasar dan Menengah lengkap → 3', () => {
  expect(computeStage(full(range(1, 15)))).toBe(3);
});

test('sampai Lanjut lengkap → 4', () => {
  expect(computeStage(full(range(1, 21)))).toBe(4);
});

test('semua kecuali bab umum 23 → 4', () => {
  expect(computeStage(full(range(1, 26).filter((n) => n !== 23)))).toBe(4);
});

test('seluruh templat A → 5', () => {
  expect(computeStage(full(range(1, 26)))).toBe(5);
});

test('seluruh templat E → 5', () => {
  expect(computeStage(full(range(1, 12), tplE))).toBe(5);
});
