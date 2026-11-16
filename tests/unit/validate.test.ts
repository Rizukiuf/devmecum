import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, expect, test } from 'vitest';
import { loadProject, validateProject, type Problem } from '../../src/lib/validate.ts';

const repoData = fileURLToPath(new URL('../../src/data/', import.meta.url));
const NOW = new Date('2026-11-15T00:00:00Z');

const pythonYaml = `name: Python
slug: python
type: language
domain: bahasa
template: A
website: https://www.python.org
docs: https://docs.python.org/3/
latestVersion: "3.x"
versionSource: { kind: github, repo: python/cpython }
requires: []
alternatives: []
tags: [serbaguna]
useCases: [otomasi]
adoption: arus-utama
trend: stabil
`;

type Fm = Record<string, unknown>;
const page = (fm: Fm, body = 'Isi.\n') =>
  `---\n${Object.entries(fm)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n')}\n---\n${body}`;

const ringkasan: Fm = {
  title: 'Python',
  description: 'Ringkasan Python.',
  tech: 'python',
  chapter: 1,
  level: 'umum',
  status: 'terbit',
  techVersion: '3.x',
  lastVerified: '2026-11-14',
  factChecked: '2026-11-14',
  sources: ['https://docs.python.org/3/', 'https://www.python.org/about/'],
  codeTested: true,
};
/** Halaman bab 4 (Sintaks dasar, level dasar di templat A). */
const bab4: Fm = { ...ringkasan, title: 'Variabel', chapter: 4, level: 'dasar', sources: ['https://docs.python.org/3/'] };

const PY = 'src/content/docs/bahasa/python/';
const baseFiles: Record<string, string> = {
  'src/data/tech/python.yaml': pythonYaml,
  [PY + 'index.mdx']: page(ringkasan),
  'src/content/docs/index.mdx': page({ title: 'Beranda', description: 'Beranda Devmecum.' }),
};

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

/** Proyek kecil yang sah di folder sementara; `files` menimpa atau menambah file (null = hapus). */
async function makeProject(files: Record<string, string | null> = {}): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'devmecum-validate-'));
  roots.push(root);
  await mkdir(join(root, 'src/data'), { recursive: true });
  await copyFile(repoData + 'domains.yaml', join(root, 'src/data/domains.yaml'));
  await copyFile(repoData + 'templates.yaml', join(root, 'src/data/templates.yaml'));
  for (const [file, content] of Object.entries({ ...baseFiles, ...files })) {
    if (content === null) continue;
    await mkdir(dirname(join(root, file)), { recursive: true });
    await writeFile(join(root, file), content);
  }
  return root;
}

async function problems(files: Record<string, string | null> = {}): Promise<Problem[]> {
  return validateProject(await loadProject(await makeProject(files)), NOW);
}
const errors = async (files: Record<string, string | null> = {}) =>
  (await problems(files)).filter((p) => p.severity === 'error');

/** Tepat satu galat, di file yang diharapkan, dengan pesan yang memuat `fragment`. */
async function expectOneError(files: Record<string, string | null>, file: string, fragment: string) {
  const found = await errors(files);
  expect(found.map((p) => `${p.file}: ${p.message}`)).toHaveLength(1);
  expect(found[0]!.file).toBe(file);
  expect(found[0]!.message).toContain(fragment);
}

test('proyek sah tanpa masalah', async () => {
  expect(await problems()).toEqual([]);
});

test('V1 slug beda dengan nama file', async () => {
  await expectOneError(
    { 'src/data/tech/python.yaml': null, 'src/data/tech/py.yaml': pythonYaml },
    'src/data/tech/py.yaml',
    'python',
  );
});

test('V1 kunci tak dikenal di data teknologi', async () => {
  await expectOneError({ 'src/data/tech/python.yaml': pythonYaml + 'lisense: MIT\n' }, 'src/data/tech/python.yaml', 'lisense');
});

test('V2 domain tidak ada', async () => {
  await expectOneError(
    { 'src/data/tech/python.yaml': pythonYaml.replace('domain: bahasa', 'domain: sihir'), [PY + 'index.mdx']: null },
    'src/data/tech/python.yaml',
    'sihir',
  );
});

test('V3 requires menunjuk teknologi tak terdaftar', async () => {
  await expectOneError(
    { 'src/data/tech/python.yaml': pythonYaml.replace('requires: []', 'requires: [logika-fuzzy]') },
    'src/data/tech/python.yaml',
    'logika-fuzzy',
  );
});

test('V4 alternatives tak terdaftar hanya peringatan', async () => {
  const found = await problems({
    'src/data/tech/python.yaml': pythonYaml.replace('alternatives: []', 'alternatives: [ruby]'),
  });
  expect(found).toHaveLength(1);
  expect(found[0]!.severity).toBe('warning');
  expect(found[0]!.message).toContain('ruby');
});

test('V5 halaman materi tanpa tech', async () => {
  const { tech: _tech, ...tanpaTech } = bab4;
  await expectOneError(
    { [PY + '04-sintaks-dasar/variabel.mdx']: page(tanpaTech) },
    PY + '04-sintaks-dasar/variabel.mdx',
    'tech',
  );
});

test('V5 halaman di folder domain yang salah', async () => {
  await expectOneError(
    { [PY + 'index.mdx']: null, 'src/content/docs/web-frontend/python/index.mdx': page(ringkasan) },
    'src/content/docs/web-frontend/python/index.mdx',
    'bahasa/python',
  );
});

test('V5 tech tidak terdaftar', async () => {
  await expectOneError(
    { 'src/content/docs/bahasa/cobol/index.mdx': page({ ...ringkasan, tech: 'cobol' }) },
    'src/content/docs/bahasa/cobol/index.mdx',
    'cobol',
  );
});

test('V6 terbit tanpa factChecked', async () => {
  const { factChecked: _f, ...tanpa } = ringkasan;
  await expectOneError({ [PY + 'index.mdx']: page(tanpa) }, PY + 'index.mdx', 'factChecked');
});

test('V6 file tanpa frontmatter', async () => {
  await expectOneError({ [PY + 'index.mdx']: '# Python\n' }, PY + 'index.mdx', 'frontmatter');
});

test('V7 index.mdx ber-chapter 2', async () => {
  await expectOneError({ [PY + 'index.mdx']: page({ ...ringkasan, chapter: 2, level: 'dasar' }) }, PY + 'index.mdx', '2');
});

test('V7 halaman bab ber-chapter 1', async () => {
  await expectOneError(
    { [PY + '04-sintaks-dasar/variabel.mdx']: page({ ...ringkasan, title: 'Variabel' }) },
    PY + '04-sintaks-dasar/variabel.mdx',
    'index',
  );
});

test('V8 folder 03-… berisi halaman chapter 4', async () => {
  await expectOneError(
    { [PY + '03-lingkungan-kerja/variabel.mdx']: page(bab4) },
    PY + '03-lingkungan-kerja/variabel.mdx',
    '03',
  );
});

test('V8 halaman bab tidak berada di folder bernomor', async () => {
  await expectOneError({ [PY + 'variabel.mdx']: page(bab4) }, PY + 'variabel.mdx', 'folder');
});

test('V8 chapter 27 pada templat A', async () => {
  await expectOneError(
    { [PY + '27-bonus/ekstra.mdx']: page({ ...bab4, chapter: 27 }) },
    PY + '27-bonus/ekstra.mdx',
    '27',
  );
});

test('V8 level tidak cocok dengan templat', async () => {
  await expectOneError(
    { [PY + '07-fungsi/closure.mdx']: page({ ...bab4, chapter: 7, level: 'dasar' }) },
    PY + '07-fungsi/closure.mdx',
    'menengah',
  );
});

test('V9 dua halaman berslug sama', async () => {
  await expectOneError(
    {
      [PY + '04-sintaks-dasar/variabel.mdx']: page(bab4),
      [PY + '05-alur-kontrol/variabel.mdx']: page({ ...bab4, chapter: 5 }),
    },
    PY + '05-alur-kontrol/variabel.mdx',
    'variabel',
  );
});

test('V10 prerequisites menunjuk halaman tak ada', async () => {
  await expectOneError(
    { [PY + '04-sintaks-dasar/variabel.mdx']: page({ ...bab4, prerequisites: ['python/tidak-ada'] }) },
    PY + '04-sintaks-dasar/variabel.mdx',
    'python/tidak-ada',
  );
});

test('V10 prerequisites berupa path, bukan ID', async () => {
  await expectOneError(
    { [PY + '04-sintaks-dasar/variabel.mdx']: page({ ...bab4, prerequisites: ['/bahasa/python/'] }) },
    PY + '04-sintaks-dasar/variabel.mdx',
    '/bahasa/python/',
  );
});

test('V10 halaman terbit mensyaratkan halaman draf', async () => {
  await expectOneError(
    {
      [PY + '04-sintaks-dasar/variabel.mdx']: page({ ...bab4, status: 'draf' }),
      [PY + '05-alur-kontrol/percabangan.mdx']: page({
        ...bab4,
        title: 'Percabangan',
        chapter: 5,
        prerequisites: ['python/variabel'],
      }),
    },
    PY + '05-alur-kontrol/percabangan.mdx',
    'python/variabel',
  );
});

test('V10 halaman draf boleh mensyaratkan halaman draf', async () => {
  expect(
    await errors({
      [PY + '04-sintaks-dasar/variabel.mdx']: page({ ...bab4, status: 'draf' }),
      [PY + '05-alur-kontrol/percabangan.mdx']: page({
        ...bab4,
        title: 'Percabangan',
        chapter: 5,
        status: 'draf',
        prerequisites: ['python/variabel', 'python'],
      }),
    }),
  ).toEqual([]);
});

test('V11 lastVerified besok', async () => {
  await expectOneError(
    { [PY + 'index.mdx']: page({ ...ringkasan, lastVerified: '2026-11-16' }) },
    PY + 'index.mdx',
    '16 November 2026',
  );
});

test('V12 beranda tanpa tech lolos, tetapi tetap butuh description', async () => {
  await expectOneError(
    { 'src/content/docs/index.mdx': page({ title: 'Beranda' }) },
    'src/content/docs/index.mdx',
    'description',
  );
});

test('versi tanpa kutip di file YAML ditolak', async () => {
  await expectOneError(
    { 'src/data/tech/python.yaml': pythonYaml.replace('"3.x"', '3.10') },
    'src/data/tech/python.yaml',
    'tanda kutip',
  );
});

test('file CRLF berawalan BOM tetap tervalidasi', async () => {
  const crlf = '﻿' + page(ringkasan).replaceAll('\n', '\r\n');
  expect(await problems({ [PY + 'index.mdx']: crlf })).toEqual([]);
});

test('YAML teknologi yang rusak dilaporkan, bukan melempar', async () => {
  await expectOneError(
    { 'src/data/tech/python.yaml': 'name: "Python\n', [PY + 'index.mdx']: null },
    'src/data/tech/python.yaml',
    'YAML',
  );
});

const techYaml = (slug: string, name: string, requires: string[] = [], alternatives: string[] = []) => `name: ${name}
slug: ${slug}
type: language
domain: bahasa
template: A
website: https://example.com
docs: https://example.com/docs
latestVersion: "1.x"
versionSource: { kind: github, repo: contoh/${slug} }
requires: [${requires.join(', ')}]
alternatives: [${alternatives.join(', ')}]
tags: [serbaguna]
useCases: [otomasi]
adoption: mapan
trend: stabil
`;

test('requires yang melingkar ditolak', async () => {
  await expectOneError(
    {
      'src/data/tech/a.yaml': techYaml('a', 'A', ['b']),
      'src/data/tech/b.yaml': techYaml('b', 'B', ['a']),
    },
    'src/data/tech/a.yaml',
    'requires membentuk lingkaran: a → b → a',
  );
});

test('requires dan alternatives tidak boleh menunjuk dirinya sendiri', async () => {
  const selfRequires = await errors({ 'src/data/tech/python.yaml': pythonYaml.replace('requires: []', 'requires: [python]') });
  expect(selfRequires).toHaveLength(1);
  expect(selfRequires[0]!.message).toContain('requires');
  expect(selfRequires[0]!.message).toContain('dirinya sendiri');
  const selfAlt = await errors({ 'src/data/tech/python.yaml': pythonYaml.replace('alternatives: []', 'alternatives: [python]') });
  expect(selfAlt).toHaveLength(1);
  expect(selfAlt[0]!.message).toContain('alternatives');
  expect(selfAlt[0]!.message).toContain('dirinya sendiri');
});

test('nama teknologi kembar ditolak', async () => {
  const found = await errors({ 'src/data/tech/ruby.yaml': techYaml('ruby', 'PYTHON') });
  expect(found).toHaveLength(1);
  expect(found[0]!.file).toBe('src/data/tech/ruby.yaml');
  expect(found[0]!.message).toContain('src/data/tech/python.yaml');
});

test('halaman di <domain>/index.mdx ditolak', async () => {
  await expectOneError(
    { 'src/content/docs/bahasa/index.mdx': page({ title: 'Bahasa', description: 'Halaman domain.' }) },
    'src/content/docs/bahasa/index.mdx',
    'Halaman domain dibangkitkan otomatis dari src/data/domains.yaml',
  );
});

test('adoption atau trend kosong menjadi peringatan', async () => {
  const yaml = pythonYaml.replace('adoption: arus-utama\n', '').replace('trend: stabil\n', '');
  const found = await problems({ 'src/data/tech/python.yaml': yaml });
  expect(found).toHaveLength(2);
  for (const problem of found) {
    expect(problem.severity).toBe('warning');
    expect(problem.file).toBe('src/data/tech/python.yaml');
    expect(problem.message).toContain('belum dinilai menurut docs/rubrik-adopsi.md');
  }
  expect(found.map((p) => p.message.split(' ')[0]).sort()).toEqual(['adoption', 'trend']);
});
