import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import {
  classifyVersion,
  describeSource,
  outdatedPages,
  renderVersionReport,
  setLatestVersion,
  type VersionCheck,
} from '../../src/lib/version-report.ts';

const ok = (value: string) => ({ ok: true as const, value });
const fail = (error: string) => ({ ok: false as const, error });

test('classifyVersion: sama → mutakhir', () => {
  expect(classifyVersion('3.15.2', ok('3.15.2'))).toEqual({ status: 'mutakhir', latest: '3.15.2' });
});

test('classifyVersion: komponen yang hilang dihitung 0 sehingga tetap sama', () => {
  expect(classifyVersion('3.15.0', ok('3.15'))).toMatchObject({ status: 'mutakhir' });
});

test('classifyVersion: lebih lama → tertinggal', () => {
  expect(classifyVersion('3.15.2', ok('3.15.3'))).toEqual({ status: 'tertinggal', latest: '3.15.3' });
  expect(classifyVersion('3.9.0', ok('3.10.0'))).toMatchObject({ status: 'tertinggal' });
});

test('classifyVersion: data lebih baru dari registri → mutakhir', () => {
  expect(classifyVersion('3.16.0', ok('3.15.3'))).toMatchObject({ status: 'mutakhir', latest: '3.15.3' });
});

test('classifyVersion: belum ada latestVersion → tertinggal', () => {
  expect(classifyVersion(undefined, ok('1.2.3'))).toEqual({ status: 'tertinggal', latest: '1.2.3' });
});

test('classifyVersion: galat registri → gagal, tidak pernah tertinggal', () => {
  const result = classifyVersion('3.15.2', fail('HTTP 503'));
  expect(result).toEqual({ status: 'gagal', error: 'HTTP 503' });
  expect(result.latest).toBeUndefined();
  expect(classifyVersion(undefined, fail('x')).status).toBe('gagal');
});

test('classifyVersion: tanpa sumber → tanpa-sumber', () => {
  expect(classifyVersion('3.15.2', undefined)).toEqual({ status: 'tanpa-sumber' });
});

test('describeSource: satu kalimat per jenis sumber', () => {
  expect(describeSource({ kind: 'github', repo: 'python/cpython', tagPattern: '^v(\\d+)$' })).toBe(
    'GitHub python/cpython (tag)',
  );
  expect(describeSource({ kind: 'github', repo: 'astral-sh/uv' })).toBe('GitHub astral-sh/uv (rilis)');
  expect(describeSource({ kind: 'npm', name: '@astrojs/starlight' })).toBe('npm @astrojs/starlight');
  expect(describeSource({ kind: 'pypi', name: 'requests' })).toBe('PyPI requests');
  expect(describeSource({ kind: 'crates', name: 'serde' })).toBe('crates.io serde');
  expect(describeSource({ kind: 'maven', name: 'org.springframework.boot:spring-boot' })).toBe(
    'Maven Central org.springframework.boot:spring-boot',
  );
});

test('outdatedPages: halaman dengan techVersion di luar seri terbaru', () => {
  const pages = [
    { file: 'src/content/docs/python/a.mdx', techVersion: '3.15' },
    { file: 'src/content/docs/python/b.mdx', techVersion: '3.14' },
    { file: 'src/content/docs/python/c.mdx', techVersion: '3.x' },
    { file: 'src/content/docs/python/d.mdx' },
  ];
  expect(outdatedPages(pages, '3.15.3')).toEqual(['src/content/docs/python/b.mdx']);
});

const PYTHON_YAML = readFileSync(new URL('../../src/data/tech/python.yaml', import.meta.url), 'utf8').replace(
  /\r\n/g,
  '\n',
);
const NOTE = 'dari GitHub python/cpython (tag) per 23 November 2026';

test('setLatestVersion: hanya baris latestVersion yang berubah pada python.yaml', () => {
  const next = setLatestVersion(PYTHON_YAML, '3.15.3', NOTE);
  const before = PYTHON_YAML.split('\n');
  const after = next.split('\n');
  expect(after).toHaveLength(before.length);
  const changed = before.flatMap((line, i) => (line === after[i] ? [] : [i]));
  expect(changed).toHaveLength(1);
  expect(after[changed[0]!]).toBe(`latestVersion: "3.15.3" # ${NOTE}`);
  expect(next).toContain('versionSource: { kind: github, repo: python/cpython }');
});

test('setLatestVersion: komentar kepala dan baris lain utuh', () => {
  const yaml = '# kepala\n# kedua\nname: X\nlatestVersion: "1.0.0"\nversionSource: { kind: npm, name: x }\n';
  expect(setLatestVersion(yaml, '1.1.0', 'dari npm x per 1 Januari 2027')).toBe(
    '# kepala\n# kedua\nname: X\nlatestVersion: "1.1.0" # dari npm x per 1 Januari 2027\nversionSource: { kind: npm, name: x }\n',
  );
});

test('setLatestVersion: CRLF tetap CRLF tanpa \\n tunggal', () => {
  const crlf = PYTHON_YAML.replace(/\n/g, '\r\n');
  const next = setLatestVersion(crlf, '3.15.3', NOTE);
  expect(next).toContain(`latestVersion: "3.15.3" # ${NOTE}\r\n`);
  expect(next.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/);
  expect(next.replace(/latestVersion: .*\r\n/, '')).toBe(crlf.replace(/latestVersion: .*\r\n/, ''));
});

test('setLatestVersion: hanya baris tingkat atas yang diganti', () => {
  const yaml = 'name: X\ndocs: https://x.dev\nnotes:\n  latestVersion: "0.0.1"\nlatestVersion: "1.0.0"\n';
  const next = setLatestVersion(yaml, '2.0.0', 'n');
  expect(next).toContain('  latestVersion: "0.0.1"\n');
  expect(next).toContain('\nlatestVersion: "2.0.0" # n\n');
});

test('setLatestVersion: menyisipkan sesudah docs bila belum ada', () => {
  const yaml = 'name: X\ndocs: https://x.dev\nversionSource: { kind: npm, name: x }\n';
  expect(setLatestVersion(yaml, '1.2.3', 'dari npm x per 1 Januari 2027')).toBe(
    'name: X\ndocs: https://x.dev\nlatestVersion: "1.2.3" # dari npm x per 1 Januari 2027\nversionSource: { kind: npm, name: x }\n',
  );
});

test('setLatestVersion: penyisipan memakai gaya baris CRLF milik berkas', () => {
  const yaml = 'name: X\r\ndocs: https://x.dev\r\nversionSource: { kind: npm, name: x }\r\n';
  expect(setLatestVersion(yaml, '1.2.3', 'n')).toBe(
    'name: X\r\ndocs: https://x.dev\r\nlatestVersion: "1.2.3" # n\r\nversionSource: { kind: npm, name: x }\r\n',
  );
});

test('setLatestVersion: tanpa latestVersion dan tanpa docs → galat', () => {
  expect(() => setLatestVersion('name: X\n', '1.0.0', 'n')).toThrow(/docs/);
});

const check = (over: Partial<VersionCheck>): VersionCheck => ({
  slug: 'python',
  name: 'Python',
  source: 'GitHub python/cpython (tag)',
  status: 'mutakhir',
  pagesToReview: [],
  ...over,
});
const DATE = new Date('2026-11-23T00:00:00Z');

test('renderVersionReport: tabel tertinggal, gagal, halaman, dan petunjuk --write', () => {
  const { markdown, findings } = renderVersionReport(
    [
      check({ slug: 'python', status: 'tertinggal', current: '3.15.2', latest: '3.15.3', pagesToReview: ['src/content/docs/python/a.mdx'] }),
      check({ slug: 'go', name: 'Go', source: 'GitHub golang/go (tag)', status: 'gagal', current: '1.25.0', error: 'HTTP 503' }),
      check({ slug: 'rust', name: 'Rust', status: 'mutakhir', current: '1.90.0', latest: '1.90.0' }),
    ],
    DATE,
  );
  expect(findings).toBe(true);
  expect(markdown).toContain('23 November 2026');
  expect(markdown).toContain('## Tertinggal');
  expect(markdown).toMatch(/\| python \| 3\.15\.2 → 3\.15\.3 \| GitHub python\/cpython \(tag\) \|/);
  expect(markdown).toContain('## Gagal diperiksa');
  expect(markdown).toMatch(/\| go \| HTTP 503 \|/);
  expect(markdown).toContain('## Halaman yang perlu ditinjau');
  expect(markdown).toContain('src/content/docs/python/a.mdx');
  expect(markdown).toContain('pnpm versions --write');
});

test('renderVersionReport: galat dengan tanda | tidak merusak tabel', () => {
  const { markdown } = renderVersionReport([check({ status: 'gagal', error: 'a | b\nc' })], DATE);
  expect(markdown).toContain('a \\| b c');
});

test('renderVersionReport: tanpa temuan → findings false', () => {
  const { markdown, findings } = renderVersionReport(
    [check({ status: 'mutakhir', current: '1', latest: '1' }), check({ slug: 'x', status: 'tanpa-sumber' })],
    DATE,
  );
  expect(findings).toBe(false);
  expect(markdown).not.toContain('## Tertinggal');
  expect(markdown).not.toContain('## Gagal diperiksa');
  expect(markdown).not.toContain('pnpm versions --write');
});

test('renderVersionReport: tertinggal saja tetap temuan; gagal saja tetap temuan', () => {
  expect(renderVersionReport([check({ status: 'tertinggal', current: '1', latest: '2' })], DATE).findings).toBe(true);
  expect(renderVersionReport([check({ status: 'gagal', error: 'x' })], DATE).findings).toBe(true);
});
