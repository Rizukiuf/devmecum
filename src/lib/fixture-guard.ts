// Penjaga build produksi: mendeteksi jejak konten uji (teknologi `uji-*`) di
// keluaran. `scripts/assert-no-fixtures.mjs` yang membaca dist/ dan memanggil ini.
//
// Pencocokan sengaja sempit: slug HALAMAN nyata boleh berawalan `uji-`
// (mis. `/testing/jest/uji-unit/`); yang dilarang hanya teknologi uji, yaitu
// segmen KEDUA URL (`/<domain>/uji-…`).

/** URL `<loc>` di peta situs yang segmen teknologinya (kedua) berawalan `uji-`. */
export function sitemapFixtureUrls(xml: string): string[] {
  const found: string[] = [];
  for (const match of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
    const raw = match[1]!;
    let pathname: string;
    try {
      pathname = new URL(raw).pathname;
    } catch {
      continue;
    }
    const tech = pathname.split('/').filter(Boolean)[1];
    if (tech?.startsWith('uji-')) found.push(raw);
  }
  return found;
}

/** Benar bila HTML katalog atau domain memuat kartu teknologi uji. */
export function htmlHasFixtureSlug(html: string): boolean {
  return html.includes('data-slug="uji-');
}
