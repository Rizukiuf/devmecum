import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { formatCompact, mergeMetrics, readMetricsFile, type MetricsFile } from '../../src/lib/metrics.ts';

// Intl memakai spasi tak terputus (U+00A0) sebelum akhiran, supaya angka dan satuannya tidak terpisah baris.
describe('formatCompact', () => {
  it.each([
    [999, '999'],
    [12345, '12,3\u00a0rb'],
    [2500000, '2,5\u00a0jt'],
    [1500000000, '1,5\u00a0M'],
  ])('%d menjadi %s', (value, expected) => {
    expect(formatCompact(value)).toBe(expected);
  });
});

describe('mergeMetrics', () => {
  const previous: MetricsFile = {
    generated: '2026-11-01T00:00:00.000Z',
    tech: {
      python: {
        github: { stars: 100, date: '2026-11-01' },
        downloads: { registry: 'pypi', period: 'minggu', value: 5000, date: '2026-11-01' },
      },
      go: { github: { stars: 7, date: '2026-11-01' } },
    },
  };

  it('mempertahankan nilai lama per kolom bila kolom itu tidak ada di data baru', () => {
    const merged = mergeMetrics(previous, { python: { github: { stars: 150, date: '2026-11-15' } } }, 'sekarang');
    expect(merged.tech.python).toEqual({
      github: { stars: 150, date: '2026-11-15' },
      downloads: { registry: 'pypi', period: 'minggu', value: 5000, date: '2026-11-01' },
    });
    expect(merged.tech.go).toEqual(previous.tech.go);
    expect(merged.generated).toBe('sekarang');
  });

  it('nilai baru menimpa yang lama', () => {
    const fresh = { downloads: { registry: 'pypi' as const, period: 'minggu' as const, value: 9, date: '2026-11-15' } };
    expect(mergeMetrics(previous, { python: fresh }, 'x').tech.python?.downloads?.value).toBe(9);
  });

  it('tanpa berkas lama, hasilnya data baru', () => {
    const fresh = { rust: { github: { stars: 1, date: '2026-11-15' } } };
    expect(mergeMetrics(undefined, fresh, 'x')).toEqual({ generated: 'x', tech: fresh });
  });

  it('tidak mengubah masukan', () => {
    const copy = structuredClone(previous);
    mergeMetrics(previous, { python: { github: { stars: 1, date: 'd' } } }, 'x');
    expect(previous).toEqual(copy);
  });
});

describe('readMetricsFile', () => {
  const dir = mkdtempSync(join(tmpdir(), 'devmecum-metrics-'));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));
  const write = (name: string, text: string) => {
    const path = join(dir, name);
    writeFileSync(path, text);
    return path;
  };

  it('berkas tidak ada menghasilkan undefined', () => {
    expect(readMetricsFile(join(dir, 'tidak-ada.json'))).toBeUndefined();
  });

  it('JSON rusak menghasilkan undefined', () => {
    expect(readMetricsFile(write('rusak.json', '{ tidak json'))).toBeUndefined();
  });

  it('bentuk salah menghasilkan undefined', () => {
    expect(readMetricsFile(write('salah.json', '{"generated":"x"}'))).toBeUndefined();
    expect(readMetricsFile(write('larik.json', '[]'))).toBeUndefined();
    expect(readMetricsFile(write('null.json', 'null'))).toBeUndefined();
    expect(readMetricsFile(write('tech-larik.json', '{"generated":"x","tech":[]}'))).toBeUndefined();
  });

  it('berkas sah dibaca apa adanya', () => {
    const file: MetricsFile = { generated: 'x', tech: { a: { github: { stars: 3, date: '2026-11-15' } } } };
    expect(readMetricsFile(write('sah.json', JSON.stringify(file)))).toEqual(file);
  });

  it('kolom yang bentuknya salah dibuang, kolom lain tetap', () => {
    const text = JSON.stringify({
      generated: 'x',
      tech: { a: { github: { stars: 'banyak', date: '2026-11-15' }, downloads: { registry: 'npm', period: 'minggu', value: 4, date: '2026-11-15' } } },
    });
    expect(readMetricsFile(write('sebagian.json', text))?.tech.a).toEqual({
      downloads: { registry: 'npm', period: 'minggu', value: 4, date: '2026-11-15' },
    });
  });
});
