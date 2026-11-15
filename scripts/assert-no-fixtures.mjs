// Memastikan build produksi tidak memuat konten uji (teknologi `uji-komponen`).
// Dijalankan di alur deploy sebelum mengunggah dist/.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const fixtureDir = fileURLToPath(new URL('../dist/fondasi/uji-komponen/', import.meta.url));

if (existsSync(fixtureDir)) {
  console.error('GAGAL: dist/ memuat konten uji (fondasi/uji-komponen). Build produksi harus dijalankan tanpa DEVMECUM_FIXTURES.');
  process.exit(1);
}

console.log('dist/ bersih dari konten uji.');
