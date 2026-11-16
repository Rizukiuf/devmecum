import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { parse } from 'yaml';
import { DEFAULT_TEMPLATE, techSkeleton } from '../../src/lib/new-tech.ts';
import { TECH_TYPES, techSchema } from '../../src/lib/schemas.ts';

const input = { slug: 'rust', name: 'Rust', domain: 'bahasa', type: 'language' } as const;

describe('templat bawaan mengikuti jenis', () => {
  test.each([
    ['language', 'A'],
    ['framework', 'B'],
    ['library', 'B'],
    ['tool', 'C'],
    ['platform', 'C'],
    ['database', 'D'],
    ['concept', 'E'],
    ['standard', 'E'],
  ] as const)('%s -> %s', (type, id) => {
    expect(DEFAULT_TEMPLATE[type]).toBe(id);
  });

  test('mencakup semua jenis teknologi', () => {
    expect(Object.keys(DEFAULT_TEMPLATE).sort()).toEqual([...TECH_TYPES].sort());
  });

  test('techSkeleton memakai templat bawaan, atau templat yang diminta', () => {
    expect(parse(techSkeleton({ ...input, type: 'database' })).template).toBe('D');
    expect(parse(techSkeleton({ ...input, template: 'C' })).template).toBe('C');
  });
});

describe('techSkeleton', () => {
  const ORDER = [
    'name', 'slug', 'type', 'domain', 'template', 'creator', 'firstRelease', 'license', 'website', 'docs',
    'latestVersion', 'versionSource', 'requires', 'alternatives', 'tags', 'adoption', 'trend', 'metrics', 'useCases',
  ];

  test('kerangka berisi kolom berurutan', () => {
    const text = techSkeleton(input);
    // Kolom opsional ditulis sebagai komentar `# creator: …`, bukan kunci.
    const seen = [...text.matchAll(/^(?:# )?([A-Za-z]+):/gm)].map((m) => m[1]);
    expect(seen).toEqual(ORDER);
    expect(text).toMatch(/^# creator: /m);
    expect(Object.keys(parse(text))).toEqual([
      'name', 'slug', 'type', 'domain', 'template', 'website', 'docs', 'requires', 'alternatives', 'tags', 'useCases',
    ]);
  });

  test('kolom yang diketahui terisi dari masukan', () => {
    expect(parse(techSkeleton(input))).toMatchObject({
      name: 'Rust', slug: 'rust', type: 'language', domain: 'bahasa', template: 'A',
    });
  });

  test('nama yang berbahaya bagi YAML tetap terbaca sebagai teks', () => {
    for (const name of ['3.10', 'null', 'Node.js: edisi "baru"', 'C#', 'yes']) {
      expect(parse(techSkeleton({ ...input, name })).name).toBe(name);
    }
  });

  test('kerangka belum lolos skema sebelum GANTI diisi', () => {
    const data = parse(techSkeleton(input));
    expect(data.website).toBe('GANTI');
    expect(techSchema.safeParse(data).success).toBe(false);
    const filled = { ...data, website: 'https://rust-lang.org', docs: 'https://doc.rust-lang.org', useCases: ['sistem'] };
    expect(techSchema.safeParse(filled).success).toBe(true);
  });

  test('tidak memakai CRLF', () => {
    expect(techSkeleton(input)).not.toContain('\r');
  });
});

describe('CLI new-tech', () => {
  const script = fileURLToPath(new URL('../../scripts/new-tech.mjs', import.meta.url));
  const realDomains = fileURLToPath(new URL('../../src/data/domains.yaml', import.meta.url));
  let project: string;

  const run = (...args: string[]) => {
    try {
      const stdout = execFileSync(process.execPath, [script, ...args], { cwd: project, encoding: 'utf8', stdio: 'pipe' });
      return { code: 0, stdout, stderr: '' };
    } catch (error) {
      const e = error as { status: number; stdout: string; stderr: string };
      return { code: e.status, stdout: e.stdout, stderr: e.stderr };
    }
  };
  const target = (slug: string) => join(project, 'src', 'data', 'tech', `${slug}.yaml`);

  beforeAll(() => {
    project = mkdtempSync(join(tmpdir(), 'new-tech-'));
    mkdirSync(join(project, 'src', 'data', 'tech'), { recursive: true });
    // CRLF di domains.yaml tidak boleh mengganggu pembacaan.
    writeFileSync(join(project, 'src', 'data', 'domains.yaml'), readFileSync(realDomains, 'utf8').replaceAll('\n', '\r\n'));
  });
  afterAll(() => rmSync(project, { recursive: true, force: true }));

  test('membuat berkas kerangka', () => {
    const result = run('rust', '--name', 'Rust', '--domain', 'bahasa', '--type', 'language');
    expect(result.code).toBe(0);
    expect(readFileSync(target('rust'), 'utf8')).toBe(techSkeleton(input));
  });

  test('--template menimpa templat bawaan', () => {
    expect(run('zig', '--name', 'Zig', '--domain', 'bahasa', '--type', 'language', '--template', 'C').code).toBe(0);
    expect(parse(readFileSync(target('zig'), 'utf8')).template).toBe('C');
  });

  test('menolak berkas yang sudah ada dan membiarkannya utuh', () => {
    writeFileSync(target('ada'), 'isi lama\n');
    const result = run('ada', '--name', 'Ada', '--domain', 'bahasa', '--type', 'language');
    expect(result.code).toBe(1);
    expect(result.stderr).toMatch(/sudah ada/);
    expect(readFileSync(target('ada'), 'utf8')).toBe('isi lama\n');
  });

  test.each(['Rust', 'a_b', 'x-', '../x', 'a b'])('menolak slug tak sah %j', (slug) => {
    const result = run(slug, '--name', 'X', '--domain', 'bahasa', '--type', 'language');
    expect(result.code).toBe(1);
    expect(result.stderr).toMatch(/slug/i);
  });

  test('menolak domain tak dikenal', () => {
    const result = run('baru', '--name', 'Baru', '--domain', 'tidak-ada', '--type', 'language');
    expect(result.code).toBe(1);
    expect(result.stderr).toMatch(/domain/i);
    expect(existsSync(target('baru'))).toBe(false);
  });

  test('menolak jenis, templat, dan kolom wajib yang tak sah', () => {
    expect(run('t1', '--name', 'T', '--domain', 'bahasa', '--type', 'aneh').code).toBe(1);
    expect(run('t2', '--name', 'T', '--domain', 'bahasa', '--type', 'tool', '--template', 'Z').code).toBe(1);
    expect(run('t3', '--domain', 'bahasa', '--type', 'tool').code).toBe(1);
    expect(run('--name', 'T', '--domain', 'bahasa', '--type', 'tool').code).toBe(1);
    for (const slug of ['t1', 't2', 't3']) expect(existsSync(target(slug))).toBe(false);
  });
});
