// Pemeriksa tautan eksternal: mengambil URL https dari konten, menilai hasil
// pemeriksaannya, dan menyusun laporan Markdown. `scripts/check-links.mjs`
// yang membaca berkas dan menjalankan pemeriksaan dengan `mapLimit`.
//
// Laporan menjadi isi issue GitHub di repo publik, sedangkan URL, header
// `Location`, dan pesan galat berasal dari luar. Semuanya karena itu hanya
// muncul di dalam span kode (tanpa @mention, rujukan #123, atau tabel).
import { formatDate } from './freshness.ts';
import { TIMEOUT_MS, USER_AGENT } from './registries.ts';
import { code } from './report-text.ts';

export type LinkStatus = 'ok' | 'pindah' | 'mati' | 'tak-pasti';

export type LinkResult = { url: string; status: LinkStatus; detail: string; files: string[] };

// --- Mengambil tautan ---

/** Baris-baris di luar blok kode berpagar; pagar yang tak ditutup menelan sisa dokumen. */
function outsideFences(body: string): string {
  const kept: string[] = [];
  let fence: { char: string; length: number } | undefined;
  for (const line of body.split(/\r?\n/)) {
    if (fence === undefined) {
      const open = /^ {0,3}(`{3,}|~{3,})/.exec(line);
      if (open) fence = { char: open[1]![0]!, length: open[1]!.length };
      else kept.push(line);
    } else {
      const close = /^ {0,3}(`{3,}|~{3,})\s*$/.exec(line);
      if (close && close[1]![0] === fence.char && close[1]!.length >= fence.length) fence = undefined;
    }
  }
  return kept.join('\n');
}

const TRAILING_PUNCTUATION = /[.,;:!?'"]+$/;

/**
 * URL `https` unik (urutan kemunculan) dari tautan Markdown `[teks](url)`,
 * autolink `<https://…>`, dan atribut `href="https://…"`. URL di dalam blok
 * kode berpagar, tautan `http://`, path internal, dan URL polos diabaikan.
 */
export function extractLinks(body: string): string[] {
  const text = outsideFences(body);
  const found: { index: number; url: string }[] = [];
  const collect = (pattern: RegExp, pick: (m: RegExpExecArray) => string | undefined): void => {
    for (const match of text.matchAll(pattern)) {
      const raw = pick(match as RegExpExecArray);
      if (raw !== undefined) found.push({ index: match.index!, url: raw.replace(TRAILING_PUNCTUATION, '') });
    }
  };

  // Satu tingkat kurung seimbang diizinkan: `…/Python_(programming_language)`.
  collect(/\]\(\s*<?(https:\/\/(?:[^\s()<>]|\([^\s()<>]*\))+)/g, (m) => m[1]);
  collect(/<(https:\/\/[^\s<>]+)>/g, (m) => m[1]);
  collect(/\bhref\s*=\s*(?:"(https:\/\/[^"\s]+)"|'(https:\/\/[^'\s]+)')/gi, (m) =>
    (m[1] ?? m[2])?.replaceAll('&amp;', '&'),
  );

  found.sort((a, b) => a.index - b.index);
  return [...new Set(found.map((entry) => entry.url).filter((url) => url !== 'https://'))];
}

/**
 * URL siap diperiksa (tanpa jangkar), atau `undefined` bila harus dilewati:
 * bukan https, tidak sah, domain situs sendiri, memuat kredensial, atau
 * menunjuk host lokal/IP (konten repo publik tidak boleh membuat pemantau
 * menyentuh jaringan dalam).
 */
export function normalizeCheckableUrl(raw: string, ownHost: string): string | undefined {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return undefined;
  }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || url.username !== '' || url.password !== '') return undefined;
  if (host === ownHost.toLowerCase()) return undefined;
  if (host.startsWith('[') || /^\d+(\.\d+){3}$/.test(host)) return undefined; // IP literal
  if (!host.includes('.') || /\.(local|localhost|internal|localdomain)$/.test(host)) return undefined;
  url.hash = '';
  return url.href;
}

// --- Menilai hasil ---

function resolveLocation(location: string, base: string | undefined): string {
  try {
    return base === undefined ? new URL(location).href : new URL(location, base).href;
  } catch {
    return location;
  }
}

function sameUrl(a: string, b: string): boolean {
  const strip = (value: string): string => {
    try {
      const url = new URL(value);
      url.hash = '';
      return url.href.replace(/\/$/, '');
    } catch {
      return value;
    }
  };
  return strip(a) === strip(b);
}

/**
 * Menilai satu hasil pemeriksaan.
 * - 2xx → `ok`; 3xx selain 301/308 (302, 303, 307: sementara) → `ok`.
 * - 301/308 dengan `location` ke URL lain → `pindah`. Bila `url` diberikan dan
 *   `location` menunjuk URL yang sama (garis miring penutup, jangkar) → `ok`.
 *   Tanpa `location` → `tak-pasti`.
 * - 404, 410, `ENOTFOUND`, `ECONNREFUSED` → `mati`.
 * - Sisanya (401, 403, 429, 5xx, kehabisan waktu, galat TLS, …) → `tak-pasti`:
 *   situs yang memblokir bot tidak boleh dilaporkan mati.
 */
export function classifyLink(r: { status?: number; location?: string; errorCode?: string; url?: string }): LinkStatus {
  if (r.status === undefined) return r.errorCode === 'ENOTFOUND' || r.errorCode === 'ECONNREFUSED' ? 'mati' : 'tak-pasti';
  const { status } = r;
  if (status >= 200 && status < 300) return 'ok';
  if (status === 301 || status === 308) {
    if (!r.location) return 'tak-pasti';
    if (r.url !== undefined && sameUrl(resolveLocation(r.location, r.url), r.url)) return 'ok';
    return 'pindah';
  }
  if (status >= 300 && status < 400) return 'ok';
  if (status === 404 || status === 410) return 'mati';
  return 'tak-pasti';
}

type Probe = { status?: number; location?: string; errorCode?: string };

function errorCodeOf(error: unknown): string {
  const code = (value: unknown): string | undefined =>
    typeof value === 'object' && value !== null && typeof (value as { code?: unknown }).code === 'string'
      ? (value as { code: string }).code
      : undefined;
  if (error instanceof Error) return code((error as { cause?: unknown }).cause) ?? code(error) ?? error.name;
  return 'galat tak dikenal';
}

async function probe(url: string, method: 'HEAD' | 'GET', fetchFn: typeof fetch): Promise<Probe> {
  try {
    const response = await fetchFn(url, {
      method,
      // Jangan pernah mengikuti redirect: tujuannya hanya dicatat.
      redirect: 'manual',
      credentials: 'omit',
      headers: { 'User-Agent': USER_AGENT, Accept: '*/*' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    // Badan tidak dibaca; batalkan supaya koneksi dilepas.
    await response.body?.cancel().catch(() => {});
    return { status: response.status, location: response.headers.get('location') ?? undefined };
  } catch (error) {
    return { errorCode: errorCodeOf(error) };
  }
}

/** Memeriksa satu URL: `HEAD`, diulang dengan `GET` bila 403/405/501. Tidak pernah melempar. */
export async function checkLink(url: string, fetchFn: typeof fetch = fetch): Promise<{ status: LinkStatus; detail: string }> {
  let result = await probe(url, 'HEAD', fetchFn);
  if (result.status === 403 || result.status === 405 || result.status === 501) result = await probe(url, 'GET', fetchFn);

  const status = classifyLink({ ...result, url });
  if (result.status === undefined) return { status, detail: result.errorCode ?? 'galat tak dikenal' };
  const target = result.location ? ` → ${resolveLocation(result.location, url)}` : '';
  return { status, detail: `HTTP ${result.status}${status === 'pindah' ? target : ''}` };
}

// --- Laporan ---

const MAX_REPORT_LENGTH = 60_000; // batas isi issue GitHub 65.536 karakter
const MAX_FILES_LISTED = 5;

function entry(result: LinkResult): string[] {
  const shown = result.files.slice(0, MAX_FILES_LISTED).map(code).join(', ');
  const more = result.files.length > MAX_FILES_LISTED ? ` dan ${result.files.length - MAX_FILES_LISTED} berkas lain` : '';
  const detail = result.detail === '' ? '' : ` — ${code(result.detail)}`;
  return [`- ${code(result.url)}${detail}`, `  - di: ${shown}${more}`];
}

/** Laporan Markdown berbahasa Indonesia; `findings` benar bila ada tautan mati atau pindah. `tak-pasti` tidak dihitung. */
export function renderLinkReport(
  results: readonly LinkResult[],
  date: Date,
): { markdown: string; findings: boolean } {
  const by = (status: LinkStatus): LinkResult[] => results.filter((result) => result.status === status);
  const dead = by('mati');
  const moved = by('pindah');
  const unsure = by('tak-pasti');
  const findings = dead.length > 0 || moved.length > 0;

  const lines = [
    `# Pemeriksaan tautan eksternal — ${formatDate(date)}`,
    '',
    `${results.length} tautan unik diperiksa: ${by('ok').length} baik, ${moved.length} pindah, ` +
      `${dead.length} mati, ${unsure.length} tak pasti.`,
  ];

  if (dead.length > 0) {
    lines.push('', '## Mati', '', ...dead.flatMap(entry), '', 'Perbaiki atau ganti tautan ini.');
  }
  if (moved.length > 0) {
    lines.push('', '## Pindah', '', ...moved.flatMap(entry), '', 'Perbarui ke alamat baru.');
  }
  if (unsure.length > 0) {
    lines.push(
      '',
      '## Tak pasti',
      '',
      ...unsure.flatMap(entry),
      '',
      'Situs ini menolak atau tidak menjawab pemeriksaan otomatis (pemblokir bot, batas laju, galat sementara). ' +
        'Bukan temuan; periksa dengan peramban bila perlu.',
    );
  }
  if (!findings) lines.push('', 'Tidak ada tautan mati atau pindah.');

  let markdown = `${lines.join('\n')}\n`;
  if (markdown.length > MAX_REPORT_LENGTH) {
    const note = '\n\n(Laporan dipotong karena terlalu panjang; perbaiki yang di atas lalu jalankan ulang `pnpm links`.)\n';
    const cut = markdown.lastIndexOf('\n', MAX_REPORT_LENGTH - note.length);
    markdown = `${markdown.slice(0, cut)}${note}`;
  }
  return { markdown, findings };
}
