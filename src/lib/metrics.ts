// Metrik popularitas (bintang GitHub, unduhan paket). Diambil saat deploy oleh
// scripts/update-metrics.mjs ke src/data/metrics/metrics.json, yang tidak masuk
// Git. Build tanpa berkas itu tetap berjalan; angkanya saja yang tidak tampil.
import { readFileSync } from 'node:fs';
import type { DownloadRegistry } from './schemas.ts';

export type TechMetrics = {
  github?: { stars: number; date: string };
  downloads?: { registry: DownloadRegistry; period: 'minggu' | '90-hari'; value: number; date: string };
};
export type MetricsFile = { generated: string; tech: Record<string, TechMetrics> };

/** Nilai lama dipertahankan per kolom (github, downloads); nilai baru menimpanya. */
export function mergeMetrics(
  previous: MetricsFile | undefined,
  fresh: Record<string, TechMetrics>,
  generated: string,
): MetricsFile {
  const tech: Record<string, TechMetrics> = structuredClone(previous?.tech ?? {});
  for (const [slug, metrics] of Object.entries(fresh)) {
    tech[slug] = { ...tech[slug], ...structuredClone(metrics) };
  }
  return { generated, tech };
}

const compact = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 });

/** `12345` → `12,3 rb`, `2500000` → `2,5 jt`. */
export function formatCompact(value: number): string {
  return compact.format(value);
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const isDate = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

/** Kolom yang bentuknya salah dibuang supaya tampilan tidak pernah memuat "NaN". */
function cleanMetrics(raw: unknown): TechMetrics {
  const result: TechMetrics = {};
  if (!isRecord(raw)) return result;
  const { github, downloads } = raw;
  if (isRecord(github) && isCount(github.stars) && isDate(github.date)) {
    result.github = { stars: github.stars, date: github.date };
  }
  if (
    isRecord(downloads) &&
    (downloads.registry === 'npm' || downloads.registry === 'pypi' || downloads.registry === 'crates') &&
    (downloads.period === 'minggu' || downloads.period === '90-hari') &&
    isCount(downloads.value) &&
    isDate(downloads.date)
  ) {
    result.downloads = {
      registry: downloads.registry,
      period: downloads.period,
      value: downloads.value,
      date: downloads.date,
    };
  }
  return result;
}

/** Membaca berkas metrik; tidak pernah melempar (tidak ada, rusak, atau bentuk salah → undefined). */
export function readMetricsFile(path: string): MetricsFile | undefined {
  try {
    const data: unknown = JSON.parse(readFileSync(path, 'utf8'));
    if (!isRecord(data) || !isRecord(data.tech)) return undefined;
    const tech: Record<string, TechMetrics> = {};
    for (const [slug, raw] of Object.entries(data.tech)) tech[slug] = cleanMetrics(raw);
    return { generated: typeof data.generated === 'string' ? data.generated : '', tech };
  } catch {
    return undefined;
  }
}
