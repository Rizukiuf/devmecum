import { afterEach, expect, test, vi } from 'vitest';
import { addMonths, formatDate, isStale, today } from '../../src/lib/freshness.ts';

const d = (s: string) => new Date(s + 'T00:00:00Z');

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

test('tes berjalan di zona waktu Jakarta', () => {
  expect(new Date('2026-11-14T23:30:00Z').getDate()).toBe(15);
});

test('addMonths menjepit akhir bulan', () => {
  expect(addMonths(d('2026-08-31'), 6)).toEqual(d('2027-02-28'));
  expect(addMonths(d('2027-08-31'), 6)).toEqual(d('2028-02-29'));
  expect(addMonths(d('2026-05-14'), 6)).toEqual(d('2026-11-14'));
  expect(addMonths(d('2026-11-30'), 3)).toEqual(d('2027-02-28'));
});

test('tepat di batas belum usang, sehari sesudahnya usang', () => {
  expect(isStale(d('2026-05-14'), 6, d('2026-11-14'))).toBe(false);
  expect(isStale(d('2026-05-14'), 6, d('2026-11-15'))).toBe(true);
  expect(isStale(d('2026-08-14'), 3, d('2026-11-15'))).toBe(true);
  expect(isStale(d('2026-08-15'), 3, d('2026-11-15'))).toBe(false);
});

test('tanggal tampil sama dengan frontmatter di zona waktu mana pun', () => {
  expect(formatDate(d('2026-11-14'))).toBe('14 November 2026');
  expect(formatDate(d('2026-01-01'))).toBe('1 Januari 2026');
});

test('today membaca DEVMECUM_TODAY', () => {
  vi.stubEnv('DEVMECUM_TODAY', '2026-11-15');
  expect(today()).toEqual(d('2026-11-15'));
});

test('today menolak DEVMECUM_TODAY yang tidak berbentuk YYYY-MM-DD', () => {
  vi.stubEnv('DEVMECUM_TODAY', '15/11/2026');
  expect(() => today()).toThrow(/DEVMECUM_TODAY/);
});

test('today memakai tanggal kalender Jakarta, bukan UTC', () => {
  // 01.30 WIB tanggal 15 masih tanggal 14 di UTC.
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-14T18:30:00Z'));
  expect(today()).toEqual(d('2026-11-15'));
});
