import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, expect, test } from 'vitest';
import {
  isContentPath,
  isProtectedPath,
  loadProjectFor,
  resolveRepoPath,
  toRepoRelative,
  validateFile,
} from '../../src/lib/hook-io.ts';

test('path Windows dengan huruf drive beda kapital', () => {
  expect(
    toRepoRelative('c:\\D\\vibapps\\devmecum\\src\\data\\tech\\python.yaml', 'C:\\D\\vibapps\\devmecum'),
  ).toBe('src/data/tech/python.yaml');
});

test('path Windows bergaris miring dan root berakhiran garis miring', () => {
  expect(toRepoRelative('C:/D/vibapps/devmecum/src/content/docs/index.mdx', 'c:\\D\\vibapps\\devmecum\\')).toBe(
    'src/content/docs/index.mdx',
  );
});

test('path POSIX', () => {
  expect(toRepoRelative('/home/r/devmecum/src/content/docs/index.mdx', '/home/r/devmecum')).toBe(
    'src/content/docs/index.mdx',
  );
});

test('di luar repo → null', () => {
  expect(toRepoRelative('C:\\D\\lain\\a.md', 'C:\\D\\vibapps\\devmecum')).toBeNull();
  expect(toRepoRelative('C:\\D\\vibapps\\devmecum-lama\\a.md', 'C:\\D\\vibapps\\devmecum')).toBeNull();
  expect(toRepoRelative('/home/r/lain/a.md', '/home/r/devmecum')).toBeNull();
});

test('path POSIX tetap peka kapital', () => {
  expect(toRepoRelative('/home/r/Devmecum/a.md', '/home/r/devmecum')).toBeNull();
});

test('resolveRepoPath sama di semua platform: absolut atau relatif, `\\` atau `/`', () => {
  // Root POSIX dengan path bergaris miring terbalik (CI Linux).
  expect(resolveRepoPath('\\home\\r\\devmecum\\src\\data\\tech\\python.yaml', '/home/r/devmecum')).toBe(
    'src/data/tech/python.yaml',
  );
  expect(resolveRepoPath('/home/r/devmecum/src/content/docs/index.mdx', '/home/r/devmecum/')).toBe(
    'src/content/docs/index.mdx',
  );
  // Root Windows dengan path Windows (hook di Windows).
  expect(
    resolveRepoPath('c:\\D\\vibapps\\devmecum\\src\\content\\docs\\index.mdx', 'C:\\D\\vibapps\\devmecum\\'),
  ).toBe('src/content/docs/index.mdx');
  expect(resolveRepoPath('C:/D/vibapps/devmecum/src/data/domains.yaml', 'c:\\D\\vibapps\\devmecum')).toBe(
    'src/data/domains.yaml',
  );
  // Relatif terhadap root.
  expect(resolveRepoPath('src\\data\\tech\\python.yaml', '/home/r/devmecum')).toBe('src/data/tech/python.yaml');
  expect(resolveRepoPath('./src/data/tech/python.yaml', 'C:\\D\\vibapps\\devmecum')).toBe('src/data/tech/python.yaml');
  // Di luar repo.
  expect(resolveRepoPath('\\home\\r\\lain\\a.md', '/home/r/devmecum')).toBeNull();
  expect(resolveRepoPath('D:\\lain\\a.md', 'C:\\D\\vibapps\\devmecum')).toBeNull();
});

test('klasifikasi path konten', () => {
  expect(isContentPath('src/data/tech/python.yaml')).toBe(true);
  expect(isContentPath('src/content/docs/bahasa/python/index.mdx')).toBe(true);
  expect(isContentPath('src/lib/ids.ts')).toBe(false);
  expect(isContentPath('src/content.config.ts')).toBe(false);
});

test('klasifikasi path terlindungi', () => {
  expect(isProtectedPath('pnpm-lock.yaml')).toBe(true);
  expect(isProtectedPath('src/data/metrics/github.json')).toBe(true);
  expect(isProtectedPath('src/data/tech/python.yaml')).toBe(false);
  expect(isProtectedPath('docs/pnpm-lock.yaml')).toBe(false);
});

const repoData = fileURLToPath(new URL('../../src/data/', import.meta.url));
const NOW = new Date('2026-11-15T00:00:00Z');
let root: string | undefined;
afterEach(async () => {
  if (root) await rm(root, { recursive: true, force: true });
  root = undefined;
});

async function projectWith(pythonYaml: string): Promise<string> {
  root = await mkdtemp(join(tmpdir(), 'devmecum-hook-'));
  await mkdir(join(root, 'src/data/tech'), { recursive: true });
  await copyFile(repoData + 'domains.yaml', join(root, 'src/data/domains.yaml'));
  await copyFile(repoData + 'templates.yaml', join(root, 'src/data/templates.yaml'));
  await writeFile(join(root, 'src/data/tech/python.yaml'), pythonYaml);
  await writeFile(join(root, 'README.md'), '# uji\n');
  return root;
}

const goodYaml = `name: Python
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
`;

test('file konten yang sah tidak menghasilkan galat', async () => {
  const dir = await projectWith(goodYaml);
  expect(await validateFile(dir, join(dir, 'src/data/tech/python.yaml'), NOW)).toEqual([]);
});

test('file konten yang salah menghasilkan galat untuk file itu', async () => {
  const dir = await projectWith(goodYaml.replace('"3.x"', '3.10'));
  const errors = await validateFile(dir, join(dir, 'src/data/tech/python.yaml'), NOW);
  expect(errors).toHaveLength(1);
  expect(errors[0]).toContain('src/data/tech/python.yaml');
  expect(errors[0]).toContain('tanda kutip');
});

test('file di luar konten tidak divalidasi walau proyeknya bermasalah', async () => {
  const dir = await projectWith(goodYaml.replace('"3.x"', '3.10'));
  expect(await validateFile(dir, join(dir, 'README.md'), NOW)).toEqual([]);
});

const rubyYaml = goodYaml
  .replace('name: Python', 'name: Ruby')
  .replace('slug: python', 'slug: ruby')
  .replace('https://www.python.org', 'https://www.ruby-lang.org')
  .replace('https://docs.python.org/3/', 'https://docs.ruby-lang.org/')
  .replace('python/cpython', 'ruby/ruby');

type Fm = Record<string, unknown>;
const page = (fm: Fm) =>
  `---\n${Object.entries(fm)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n')}\n---\nIsi.\n`;
const ringkasan = (tech: string, extra: Fm = {}): Fm => ({
  title: tech,
  description: `Ringkasan ${tech}.`,
  tech,
  chapter: 1,
  level: 'umum',
  status: 'terbit',
  techVersion: '3.x',
  lastVerified: '2026-11-14',
  factChecked: '2026-11-14',
  sources: ['https://example.com/', 'https://example.com/about/'],
  codeTested: true,
  ...extra,
});
const bab4 = (tech: string, extra: Fm = {}): Fm => ringkasan(tech, { title: 'Bab 4', chapter: 4, level: 'dasar', ...extra });

const PY = 'src/content/docs/bahasa/python/';
const RB = 'src/content/docs/bahasa/ruby/';

/** Proyek python + ruby yang sah, ditambah `files`. */
async function projectWithPages(files: Record<string, string> = {}): Promise<string> {
  const dir = await projectWith(goodYaml);
  const all: Record<string, string> = {
    'src/data/tech/ruby.yaml': rubyYaml,
    [PY + 'index.mdx']: page(ringkasan('python')),
    [RB + 'index.mdx']: page(ringkasan('ruby')),
    ...files,
  };
  for (const [file, content] of Object.entries(all)) {
    await mkdir(dirname(join(dir, file)), { recursive: true });
    await writeFile(join(dir, file), content);
  }
  return dir;
}

test('validateFile hanya melaporkan berkas itu', async () => {
  const dir = await projectWithPages({
    [PY + '27-bonus/rusak.mdx']: page(bab4('python', { chapter: 27 })),
    [RB + '27-bonus/rusak.mdx']: page(bab4('ruby', { chapter: 27 })),
    'src/data/tech/ruby.yaml': rubyYaml.replace('"3.x"', '3.10'),
  });
  expect(await validateFile(dir, join(dir, PY + 'index.mdx'), NOW)).toEqual([]);
  const errors = await validateFile(dir, join(dir, PY + '27-bonus/rusak.mdx'), NOW);
  expect(errors).toHaveLength(1);
  expect(errors[0]).toMatch(/^src\/content\/docs\/bahasa\/python\/27-bonus\/rusak\.mdx: .*27/);
});

test('validateFile tetap menolak prasyarat ke halaman draf', async () => {
  const dir = await projectWithPages({
    [RB + '04-sintaks-dasar/blok.mdx']: page(bab4('ruby', { title: 'Blok', status: 'draf' })),
    [PY + 'index.mdx']: page(ringkasan('python', { prerequisites: ['ruby/blok'] })),
  });
  // Path bergaya Windows (garis miring terbalik) juga diterima.
  const errors = await validateFile(dir, join(dir, PY + 'index.mdx').replaceAll('/', '\\'), NOW);
  expect(errors).toHaveLength(1);
  expect(errors[0]).toContain(`${PY}index.mdx: `);
  expect(errors[0]).toContain('masih draf');

  const project = (await loadProjectFor(dir, join(dir, PY + 'index.mdx')))!;
  const read = project.pages.filter((p) => !p.skipped).map((p) => p.docsPath);
  expect(read).toEqual(['bahasa/python/index.mdx', 'bahasa/ruby/04-sintaks-dasar/blok.mdx', 'bahasa/ruby/index.mdx']);
});

test('validateFile menemukan slug kembar di teknologi yang sama', async () => {
  const dir = await projectWithPages({
    [PY + '04-sintaks-dasar/variabel.mdx']: page(bab4('python')),
    [PY + '05-alur-kontrol/variabel.mdx']: page(bab4('python', { chapter: 5 })),
  });
  const errors = await validateFile(dir, join(dir, PY + '05-alur-kontrol/variabel.mdx'), NOW);
  expect(errors).toHaveLength(1);
  expect(errors[0]).toContain('sudah dipakai');
});

test('validateFile untuk YAML teknologi tidak membaca halaman', async () => {
  const dir = await projectWithPages({ 'src/data/tech/python.yaml': goodYaml.replace('requires: []', 'requires: [ruby]') });
  const project = (await loadProjectFor(dir, join(dir, 'src/data/tech/python.yaml')))!;
  expect(project.pages.length).toBeGreaterThan(0);
  expect(project.pages.every((p) => p.skipped)).toBe(true);
  expect(await validateFile(dir, join(dir, 'src/data/tech/python.yaml'), NOW)).toEqual([]);
});

test('loadProjectFor mengembalikan null untuk berkas di luar konten', async () => {
  const dir = await projectWith(goodYaml);
  expect(await loadProjectFor(dir, join(dir, 'README.md'))).toBeNull();
});
