// Pembantu teks untuk laporan Markdown yang menjadi isi issue GitHub di repo
// publik. Teks dari luar (URL, pesan galat, nama tag rilis, nama paket) tidak
// boleh memicu @mention, rujukan #123, HTML, atau memecah tabel.

const MAX_TEXT_LENGTH = 300;

/** Teks mentah sebagai span kode satu baris; tak ada yang bisa memicu @mention, #rujukan, atau tabel. */
export function code(text: string): string {
  let flat = text.replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ').trim();
  if (flat.length > MAX_TEXT_LENGTH) flat = `${flat.slice(0, MAX_TEXT_LENGTH)}…`;
  const longestRun = Math.max(0, ...[...flat.matchAll(/`+/g)].map((m) => m[0].length));
  const fence = '`'.repeat(longestRun + 1);
  const pad = flat.startsWith('`') || flat.endsWith('`') ? ' ' : '';
  return `${fence}${pad}${flat}${pad}${fence}`;
}
