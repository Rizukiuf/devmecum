import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { planIssueAction } from '../../src/lib/rolling-issue.ts';

describe('planIssueAction', () => {
  test('ada temuan, belum ada issue terbuka: buat baru', () => {
    expect(planIssueAction(undefined, true)).toEqual({ kind: 'create' });
  });

  test('ada temuan, issue sudah terbuka: perbarui isinya', () => {
    expect(planIssueAction({ number: 7 }, true)).toEqual({ kind: 'edit', number: 7 });
  });

  test('tanpa temuan, issue masih terbuka: perbarui lalu tutup', () => {
    expect(planIssueAction({ number: 7 }, false)).toEqual({ kind: 'close', number: 7 });
  });

  test('tanpa temuan dan tanpa issue: tidak melakukan apa pun', () => {
    expect(planIssueAction(undefined, false)).toEqual({ kind: 'none' });
  });
});

// Hanya jalur yang tidak pernah memanggil `gh`: argumen tidak sah (keluar
// sebelum apa pun berjalan) dan --dry-run (hanya mencetak).
describe('scripts/rolling-issue.mjs', () => {
  const script = fileURLToPath(new URL('../../scripts/rolling-issue.mjs', import.meta.url));
  const run = (...args: string[]) =>
    spawnSync(process.execPath, [script, ...args], {
      encoding: 'utf8',
      env: { ...process.env, DEVMECUM_TODAY: '2026-11-16' },
    });
  const valid = ['--label', 'pemantau-versi', '--title', 'Pemantau versi', '--body-file', 'laporan.md', '--findings', 'true'];

  test.each([
    ['tanpa --label', ['--title', 'T', '--body-file', 'b.md', '--findings', 'true'], '--label'],
    ['tanpa --title', ['--label', 'l', '--body-file', 'b.md', '--findings', 'true'], '--title'],
    ['tanpa --body-file', ['--label', 'l', '--title', 'T', '--findings', 'true'], '--body-file'],
    ['tanpa --findings', ['--label', 'l', '--title', 'T', '--body-file', 'b.md'], '--findings'],
    ['--findings bukan true/false', ['--label', 'l', '--title', 'T', '--body-file', 'b.md', '--findings', 'yes'], '--findings'],
    ['--findings kosong (keluaran langkah yang gagal)', ['--label', 'l', '--title', 'T', '--body-file', 'b.md', '--findings', ''], '--findings'],
    ['opsi tidak dikenal', [...valid, '--paksa'], '--paksa'],
    ['opsi tanpa nilai', ['--label'], '--label'],
  ])('menolak %s dengan pesan Indonesia dan kode 1', (_name, args, mention) => {
    const result = run(...args, '--dry-run');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(mention);
    expect(result.stdout).toBe('');
  });

  test('--dry-run dengan temuan mencetak perintah jalur buat tanpa menjalankan gh', () => {
    const result = run(...valid, '--dry-run');
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('gh label create pemantau-versi --force');
    expect(result.stdout).toContain('gh issue create --title "Pemantau versi" --body-file laporan.md --label pemantau-versi');
    expect(result.stdout).toContain('gh issue edit <n> --body-file laporan.md');
    expect(result.stdout).toContain('Semua beres per 16 November 2026.');
  });

  test('--dry-run tanpa temuan tidak mencetak perintah buat', () => {
    const args = valid.slice(0, -1).concat('false');
    const result = run(...args, '--dry-run');
    expect(result.status).toBe(0);
    expect(result.stdout).not.toContain('gh issue create');
    expect(result.stdout).toContain('gh issue close <n>');
  });
});
