// Laporan pemeriksaan versi teknologi dan penulis baris `latestVersion`.
// Murni (tanpa I/O): `scripts/check-versions.mjs` yang membaca registri dan berkas.
import { formatDate } from './freshness.ts';
import type { Result } from './registries.ts';
import type { VersionSource } from './schemas.ts';
import { compareVersions, seriesMatches } from './versions.ts';

export type VersionStatus = 'mutakhir' | 'tertinggal' | 'gagal' | 'tanpa-sumber';

export type VersionCheck = {
  slug: string;
  name: string;
  /** Sumber dalam kata-kata, dari `describeSource`. */
  source: string;
  current?: string;
  latest?: string;
  status: VersionStatus;
  error?: string;
  /** Berkas halaman teknologi ini yang `techVersion`-nya di luar seri terbaru. */
  pagesToReview: string[];
};

/**
 * Menilai versi di data terhadap hasil registri. Galat registri selalu
 * `gagal` (data lama dibiarkan, tidak pernah dianggap tertinggal); data yang
 * lebih baru dari registri dianggap `mutakhir`.
 */
export function classifyVersion(
  current: string | undefined,
  result: Result<string> | undefined,
): Pick<VersionCheck, 'status' | 'latest' | 'error'> {
  if (result === undefined) return { status: 'tanpa-sumber' };
  if (!result.ok) return { status: 'gagal', error: result.error };
  const latest = result.value;
  if (current === undefined || compareVersions(current, latest) < 0) return { status: 'tertinggal', latest };
  return { status: 'mutakhir', latest };
}

/** Sumber versi dalam kata-kata: `GitHub python/cpython (tag)`, `npm @astrojs/starlight`. */
export function describeSource(source: VersionSource): string {
  switch (source.kind) {
    case 'github':
      return `GitHub ${source.repo} (${source.tagPattern === undefined ? 'rilis' : 'tag'})`;
    case 'npm':
      return `npm ${source.name}`;
    case 'pypi':
      return `PyPI ${source.name}`;
    case 'crates':
      return `crates.io ${source.name}`;
    case 'maven':
      return `Maven Central ${source.name}`;
  }
}

/** Berkas halaman yang punya `techVersion` tetapi tidak lagi satu seri dengan `latest`. */
export function outdatedPages(
  pages: readonly { file: string; techVersion?: string }[],
  latest: string,
): string[] {
  return pages
    .filter((page) => page.techVersion !== undefined && !seriesMatches(page.techVersion, latest))
    .map((page) => page.file);
}

const cell = (text: string): string => text.replace(/\s+/g, ' ').replaceAll('|', '\\|').trim();

function table(header: string[], rows: string[][]): string[] {
  return [
    `| ${header.join(' | ')} |`,
    `|${header.map(() => ' --- ').join('|')}|`,
    ...rows.map((row) => `| ${row.map(cell).join(' | ')} |`),
  ];
}

/** Laporan Markdown berbahasa Indonesia; `findings` benar bila ada yang tertinggal atau gagal. */
export function renderVersionReport(
  checks: readonly VersionCheck[],
  date: Date,
): { markdown: string; findings: boolean } {
  const behind = checks.filter((check) => check.status === 'tertinggal');
  const failed = checks.filter((check) => check.status === 'gagal');
  const count = (status: VersionStatus): number => checks.filter((check) => check.status === status).length;
  const findings = behind.length > 0 || failed.length > 0;

  const lines = [
    `# Pemeriksaan versi — ${formatDate(date)}`,
    '',
    `${checks.length} teknologi diperiksa: ${count('mutakhir')} mutakhir, ${behind.length} tertinggal, ` +
      `${failed.length} gagal diperiksa, ${count('tanpa-sumber')} tanpa sumber.`,
  ];

  if (behind.length > 0) {
    lines.push(
      '',
      '## Tertinggal',
      '',
      ...table(
        ['Teknologi', 'Versi (sekarang → terbaru)', 'Sumber'],
        behind.map((check) => [check.slug, `${check.current ?? '(belum ada)'} → ${check.latest}`, check.source]),
      ),
      '',
      'Perbarui `latestVersion` dengan `pnpm versions --write`, lalu tinjau halaman di bawah.',
    );
  }

  if (failed.length > 0) {
    lines.push(
      '',
      '## Gagal diperiksa',
      '',
      ...table(
        ['Teknologi', 'Galat'],
        failed.map((check) => [check.slug, check.error ?? 'tidak diketahui']),
      ),
      '',
      'Data lama dibiarkan apa adanya.',
    );
  }

  const pages = behind.flatMap((check) => check.pagesToReview.map((file) => [file, check.slug]));
  if (pages.length > 0) {
    lines.push(
      '',
      '## Halaman yang perlu ditinjau',
      '',
      ...table(['Halaman', 'Teknologi'], pages),
      '',
      '`techVersion` halaman-halaman ini tidak lagi satu seri dengan versi terbaru.',
    );
  }

  if (!findings) lines.push('', 'Semua versi mutakhir.');
  return { markdown: `${lines.join('\n')}\n`, findings };
}

/**
 * Mengganti baris `latestVersion` tingkat atas secara tekstual, tidak
 * menyerialisasi ulang dokumen: paket `yaml` menulis ulang gaya `{ … }`.
 * Bila baris belum ada, disisipkan sesudah baris `docs:`. Gaya baris baru
 * (LF atau CRLF) mengikuti berkas.
 */
export function setLatestVersion(yamlText: string, version: string, note: string): string {
  const line = `latestVersion: "${version}" # ${note}`;
  // Hanya sampai akhir baris; `\r` tidak disentuh sehingga CRLF tetap.
  const existing = /^latestVersion:[^\r\n]*/m;
  if (existing.test(yamlText)) return yamlText.replace(existing, () => line);

  const docs = /^docs:[^\r\n]*(\r?\n|$)/m.exec(yamlText);
  if (!docs) throw new Error('tidak ada baris `latestVersion` maupun `docs:` untuk dijadikan tempat sisipan');
  const newline = yamlText.includes('\r\n') ? '\r\n' : '\n';
  const end = docs.index + docs[0].length;
  const needsBreak = docs[1] === '';
  return `${yamlText.slice(0, end)}${needsBreak ? newline : ''}${line}${newline}${yamlText.slice(end)}`;
}
