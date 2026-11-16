// Memastikan build produksi tidak memuat konten uji (teknologi `uji-*`).
// Dijalankan di alur deploy sebelum mengunggah dist/.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { htmlHasFixtureSlug, sitemapFixtureUrls } from '../src/lib/fixture-guard.ts';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const failures = [];

if (!existsSync(dist)) {
  console.error('GAGAL: folder dist/ tidak ada. Jalankan pnpm build lebih dulu.');
  process.exit(1);
}

if (existsSync(`${dist}fondasi/uji-komponen/`)) {
  failures.push('dist/ memuat konten uji (fondasi/uji-komponen).');
}

const ogDir = `${dist}og/`;
if (existsSync(ogDir)) {
  for (const name of readdirSync(ogDir)) {
    if (/^uji-.*\.png$/.test(name)) failures.push(`dist/og/${name} adalah gambar OG milik konten uji.`);
  }
}

// Halaman daftar dan peta situs tidak boleh menyebut teknologi uji.
const scanned = ['katalog/index.html', 'fondasi/index.html'];
for (const name of readdirSync(dist)) {
  if (/^sitemap.*\.xml$/.test(name)) scanned.push(name);
}
if (!scanned.some((name) => name.startsWith('sitemap'))) {
  failures.push('dist/ tidak memuat sitemap*.xml.');
}
for (const rel of scanned) {
  const file = `${dist}${rel}`;
  if (!existsSync(file)) {
    failures.push(`dist/${rel} tidak ada; build produksi belum dijalankan?`);
    continue;
  }
  const text = readFileSync(file, 'utf8');
  // Pencocokan sempit (lihat src/lib/fixture-guard.ts): slug halaman nyata
  // berawalan "uji-" tidak boleh menggagalkan build.
  if (rel.endsWith('.xml')) {
    for (const url of sitemapFixtureUrls(text)) failures.push(`dist/${rel} memuat URL teknologi uji ${url}.`);
  } else if (htmlHasFixtureSlug(text)) {
    failures.push(`dist/${rel} memuat kartu teknologi uji (data-slug="uji-").`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`GAGAL: ${failure}`);
  console.error('Build produksi harus dijalankan tanpa DEVMECUM_FIXTURES.');
  process.exit(1);
}

console.log('dist/ bersih dari konten uji.');
