import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, expect, test } from 'vitest';
import { contentErrorsFor, isContentPath, isProtectedPath, toRepoRelative } from '../../src/lib/hook-io.ts';

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
  expect(await contentErrorsFor(dir, join(dir, 'src/data/tech/python.yaml'), NOW)).toEqual([]);
});

test('file konten yang salah menghasilkan galat untuk file itu', async () => {
  const dir = await projectWith(goodYaml.replace('"3.x"', '3.10'));
  const errors = await contentErrorsFor(dir, join(dir, 'src/data/tech/python.yaml'), NOW);
  expect(errors).toHaveLength(1);
  expect(errors[0]).toContain('src/data/tech/python.yaml');
  expect(errors[0]).toContain('tanda kutip');
});

test('file di luar konten tidak divalidasi walau proyeknya bermasalah', async () => {
  const dir = await projectWith(goodYaml.replace('"3.x"', '3.10'));
  expect(await contentErrorsFor(dir, join(dir, 'README.md'), NOW)).toEqual([]);
});
