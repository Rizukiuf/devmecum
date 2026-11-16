// Kerangka berkas YAML teknologi baru (`pnpm new-tech`). Kolom wajib yang belum
// diketahui diisi GANTI supaya validasi gagal sampai penulis menggantinya;
// kolom opsional ditulis sebagai komentar yang tinggal dibuka.
import { stringify } from 'yaml';
import type { TechType, TemplateId } from './schemas.ts';

/** Templat bawaan per jenis teknologi (docs/katalog.md). */
export const DEFAULT_TEMPLATE: Record<TechType, TemplateId> = {
  language: 'A',
  framework: 'B',
  library: 'B',
  tool: 'C',
  platform: 'C',
  database: 'D',
  concept: 'E',
  standard: 'E',
};

export type SkeletonInput = {
  slug: string;
  name: string;
  domain: string;
  type: TechType;
  template?: TemplateId;
};

/** Menulis teks sebagai skalar YAML; kutip hanya bila perlu ("3.10", "null", "C#: x"). */
function scalar(value: string): string {
  return stringify(value, { lineWidth: 0 }).trimEnd();
}

export function techSkeleton({ slug, name, domain, type, template }: SkeletonInput): string {
  const lines = [
    `name: ${scalar(name)}`,
    `slug: ${scalar(slug)}`,
    `type: ${type}`,
    `domain: ${scalar(domain)}`,
    `template: ${template ?? DEFAULT_TEMPLATE[type]}`,
    '# creator: GANTI',
    '# firstRelease: 2000',
    '# license: MIT',
    'website: GANTI # URL https resmi',
    'docs: GANTI # URL https dokumentasi resmi',
    '# latestVersion: "1.0.0" # tulis dalam tanda kutip; catat sumber dan tanggalnya',
    '# versionSource: { kind: github, repo: pemilik/nama }',
    'requires: []',
    'alternatives: []',
    'tags: []',
    '# adoption: arus-utama # arus-utama | mapan | berkembang | khusus | warisan',
    '# trend: stabil # naik | stabil | turun',
    '# metrics:',
    '#   github: { repo: pemilik/nama }',
    '#   downloads: { registry: npm, name: nama-paket }',
    'useCases:',
    '  - GANTI',
  ];
  return `${lines.join('\n')}\n`;
}
