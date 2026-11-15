import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, test } from 'vitest';
import { evaluateBudget, MAX_FILE_BYTES, scanDir } from '../../src/lib/budget.ts';

type Oversized = { path: string; bytes: number };
const scan = (count: number, oversized: Oversized[] = []) => ({ count, oversized });

test.each([
  [14_999, 'ok'],
  [15_000, 'warn'],
  [18_999, 'warn'],
  [19_000, 'fail'],
] as const)('%i file → %s', (n, level) => {
  expect(evaluateBudget(scan(n)).level).toBe(level);
});

test('file di atas 25 MiB menggagalkan', () => {
  const r = evaluateBudget(scan(10, [{ path: 'a.bin', bytes: MAX_FILE_BYTES + 1 }]));
  expect(r.level).toBe('fail');
  expect(r.messages.join()).toContain('a.bin');
});

let tmp: string | undefined;
afterEach(async () => {
  if (tmp) await rm(tmp, { recursive: true, force: true });
  tmp = undefined;
});

test('scanDir menghitung file di subfolder', async () => {
  tmp = await mkdtemp(join(tmpdir(), 'devmecum-budget-'));
  await mkdir(join(tmp, 'sub'));
  await writeFile(join(tmp, 'a.txt'), 'a');
  await writeFile(join(tmp, 'sub', 'b.txt'), 'b');
  const result = await scanDir(tmp);
  expect(result.count).toBe(2);
  expect(result.oversized).toEqual([]);
});

test('scanDir melaporkan file yang melebihi batas ukuran', async () => {
  tmp = await mkdtemp(join(tmpdir(), 'devmecum-budget-'));
  await writeFile(join(tmp, 'besar.bin'), 'x'.repeat(11));
  const result = await scanDir(tmp, 10);
  expect(result.oversized).toEqual([{ path: 'besar.bin', bytes: 11 }]);
});
