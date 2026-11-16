// Label tampilan untuk nilai-nilai enum di data dan frontmatter.
import type { Adoption, Level, Tech, Trend } from './schemas.ts';

export const LEVEL_LABELS: Record<Level, string> = {
  dasar: 'Dasar',
  menengah: 'Menengah',
  lanjut: 'Lanjut',
  profesional: 'Profesional',
  umum: 'Umum',
};

export const TYPE_LABELS: Record<Tech['type'], string> = {
  language: 'Bahasa pemrograman',
  framework: 'Framework',
  library: 'Library',
  tool: 'Tool',
  platform: 'Platform',
  database: 'Database',
  concept: 'Konsep',
  standard: 'Standar',
};

export const ADOPTION_LABELS: Record<Adoption, string> = {
  'arus-utama': 'Arus utama',
  mapan: 'Mapan',
  berkembang: 'Berkembang',
  khusus: 'Khusus',
  warisan: 'Warisan',
};

export const TREND_LABELS: Record<Trend, string> = {
  naik: 'Naik',
  stabil: 'Stabil',
  turun: 'Turun',
};
