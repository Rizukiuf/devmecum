// Membangun situs beserta konten uji (teknologi `uji-komponen`) dengan tanggal
// "hari ini" yang dikunci, supaya tes e2e memberi hasil yang sama kapan pun.
// Build produksi (`pnpm build`) tidak memuat konten uji.
import { fileURLToPath } from 'node:url';

process.env.DEVMECUM_FIXTURES = '1';
process.env.DEVMECUM_TODAY = '2026-11-15';
// Metrik dikunci ke berkas tetap, bukan data deploy yang berubah tiap minggu.
process.env.DEVMECUM_METRICS_FILE = fileURLToPath(new URL('../tests/fixtures/metrics.json', import.meta.url));

const { build } = await import('astro');
await build({ root: fileURLToPath(new URL('..', import.meta.url)) });
