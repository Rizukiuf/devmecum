// Anggaran file hasil build. Paket gratis Cloudflare membatasi 20.000 file per
// versi dan 25 MiB per file; kita berhenti sebelum menyentuh batas itu.
import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

export const WARN_AT = 15_000;
export const FAIL_AT = 19_000;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

export type OversizedFile = { path: string; bytes: number };
export type Scan = {
  count: number;
  oversized: OversizedFile[];
  /** Jumlah file per folder tingkat pertama; file di akar dihitung sebagai '.'. */
  byTopDir: Record<string, number>;
};
export type BudgetResult = { level: 'ok' | 'warn' | 'fail'; messages: string[] };

/** Menghitung semua file di bawah `dir` dan mencatat yang lebih besar dari `maxBytes`. */
export async function scanDir(dir: string, maxBytes: number = MAX_FILE_BYTES): Promise<Scan> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  const scan: Scan = { count: 0, oversized: [], byTopDir: {} };
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    scan.count += 1;
    const full = join(entry.parentPath, entry.name);
    const rel = relative(dir, full).replaceAll('\\', '/');
    const segments = rel.split('/');
    const key = segments.length === 1 ? '.' : segments[0]!;
    scan.byTopDir[key] = (scan.byTopDir[key] ?? 0) + 1;
    const { size } = await stat(full);
    if (size > maxBytes) {
      scan.oversized.push({ path: rel, bytes: size });
    }
  }
  return scan;
}

export function evaluateBudget(scan: Scan): BudgetResult {
  const messages: string[] = [];
  let level: BudgetResult['level'] = 'ok';

  if (scan.count >= FAIL_AT) {
    level = 'fail';
    messages.push(`Jumlah file ${scan.count} mencapai batas gagal ${FAIL_AT} (batas Cloudflare 20.000).`);
  } else if (scan.count >= WARN_AT) {
    level = 'warn';
    messages.push(`Jumlah file ${scan.count} melewati batas peringatan ${WARN_AT}. Saatnya merencanakan pemecahan situs.`);
  }

  for (const file of scan.oversized) {
    level = 'fail';
    const mib = (file.bytes / 1024 / 1024).toFixed(1);
    messages.push(`File ${file.path} berukuran ${mib} MiB, melebihi batas 25 MiB per file.`);
  }

  return { level, messages };
}
