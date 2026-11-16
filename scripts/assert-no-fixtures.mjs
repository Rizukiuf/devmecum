// Memastikan build produksi tidak memuat konten uji (teknologi `uji-*`).
// Dijalankan di alur deploy sebelum mengunggah dist/.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const failures = [];

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
for (const rel of scanned) {
  const file = `${dist}${rel}`;
  if (!existsSync(file)) {
    failures.push(`dist/${rel} tidak ada; build produksi belum dijalankan?`);
    continue;
  }
  const text = readFileSync(file, 'utf8');
  for (const needle of ['data-slug="uji-', '/uji-']) {
    if (text.includes(needle)) failures.push(`dist/${rel} memuat "${needle}".`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`GAGAL: ${failure}`);
  console.error('Build produksi harus dijalankan tanpa DEVMECUM_FIXTURES.');
  process.exit(1);
}

console.log('dist/ bersih dari konten uji.');
