import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import { parseFrontmatter } from '../../src/lib/frontmatter.ts';
import { materiSchema } from '../../src/lib/schemas.ts';

const file = fileURLToPath(new URL('../../templates/ringkasan.mdx', import.meta.url));
const parsed = parseFrontmatter(readFileSync(file, 'utf8'))!;

test('kerangka Ringkasan memuat bagian §5.5 berurutan', () => {
  const headings = parsed.body
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => line.slice(3).trim());

  // Keunggulan dan kelemahan (§5.5 butir 5 dan 6) ditampilkan berdampingan oleh <ProsCons>.
  expect(headings).toEqual([
    'Sekilas',
    'Kartu data',
    'Untuk apa dan siapa pemakainya',
    'Popularitas dan status',
    'Keunggulan dan kelemahan',
    'Kapan dipakai, kapan tidak',
    'Contoh minimal',
    'Konsep kunci',
    'Prasyarat dan langkah berikutnya',
    'Alternatif',
    'Sumber resmi',
  ]);
  expect(parsed.body).toContain('slot="keunggulan"');
  expect(parsed.body).toContain('slot="kelemahan"');
  expect(parsed.body).toContain('<TechCard />');
});

test('frontmatter kerangka berstatus draf dan belum mengklaim verifikasi', () => {
  expect(parsed.data.status).toBe('draf');
  expect(parsed.data.chapter).toBe(1);
  expect(parsed.data.level).toBe('umum');
  expect(parsed.data).not.toHaveProperty('factChecked');
  expect(parsed.data.codeTested).toBe(false);
});

test('frontmatter kerangka lolos skema setelah penanda GANTI diisi', () => {
  const filled = JSON.parse(
    JSON.stringify(parsed.data)
      .replaceAll('GANTI-SLUG', 'python')
      .replaceAll('GANTI-VERSI', '3.x')
      .replaceAll('GANTI-TANGGAL', '2026-11-15')
      .replaceAll(/GANTI[^"]*/g, 'Contoh'),
  );
  const result = materiSchema.safeParse(filled);
  expect(result.error?.issues ?? []).toEqual([]);
});

test('kerangka yang belum diisi ditolak validasi', () => {
  expect(materiSchema.safeParse(parsed.data).success).toBe(false);
});
