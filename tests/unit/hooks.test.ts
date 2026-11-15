// Menjalankan skrip hook sungguhan sebagai proses anak, seperti yang dilakukan
// Claude Code: JSON masuk lewat stdin, keputusan keluar lewat kode keluar.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const abs = (rel: string) => join(repoRoot, rel);

function run(name: string, input: unknown) {
  const stdin = typeof input === 'string' ? input : JSON.stringify(input);
  return spawnSync(process.execPath, [abs(`scripts/hooks/${name}.mjs`)], { input: stdin, encoding: 'utf8' });
}

test('protect-files menolak lockfile dengan pesan di stderr', () => {
  const r = run('protect-files', { tool_input: { file_path: abs('pnpm-lock.yaml') } });
  expect(r.status).toBe(2);
  expect(r.stderr).toContain('pnpm-lock.yaml');
});

test('protect-files menolak file metrik', () => {
  expect(run('protect-files', { tool_input: { file_path: abs('src/data/metrics/github.json') } }).status).toBe(2);
});

test('protect-files meloloskan file biasa', () => {
  expect(run('protect-files', { tool_input: { file_path: abs('README.md') } }).status).toBe(0);
});

test('validate-edited meloloskan file di luar konten', () => {
  expect(run('validate-edited', { tool_input: { file_path: abs('src/lib/ids.ts') } }).status).toBe(0);
});

test('validate-edited meloloskan python.yaml yang sah', () => {
  const r = run('validate-edited', { tool_input: { file_path: abs('src/data/tech/python.yaml') } });
  expect(r.stderr).toBe('');
  expect(r.status).toBe(0);
});

test.each(['protect-files', 'validate-edited', 'validate-on-stop'])(
  '%s: stdin kosong atau bukan JSON tidak menolak',
  (name) => {
    expect(run(name, '').status).toBe(0);
    expect(run(name, 'bukan json').status).toBe(0);
  },
);

test('validate-on-stop tidak memblokir saat sudah berjalan karena hook', () => {
  expect(run('validate-on-stop', { stop_hook_active: true }).status).toBe(0);
});
