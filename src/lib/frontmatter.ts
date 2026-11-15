// Pembaca frontmatter untuk skrip di luar Astro. Tahan terhadap BOM dan akhir
// baris CRLF, yang biasa muncul pada file yang ditulis editor di Windows.
import { parse } from 'yaml';

export type Frontmatter = { data: Record<string, unknown>; body: string };

/** Mengembalikan `null` bila file tidak diawali blok frontmatter. Melempar bila YAML-nya rusak. */
export function parseFrontmatter(text: string): Frontmatter | null {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  if (lines[0]?.trimEnd() !== '---') return null;

  const end = lines.findIndex((line, i) => i > 0 && line.trimEnd() === '---');
  if (end === -1) return null;

  const data: unknown = parse(lines.slice(1, end).join('\n')) ?? {};
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Frontmatter harus berupa pemetaan `kunci: nilai`');
  }
  return { data: data as Record<string, unknown>, body: lines.slice(end + 1).join('\n') };
}
