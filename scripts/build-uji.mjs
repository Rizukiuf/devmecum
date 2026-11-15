// Membangun situs beserta konten uji (teknologi `uji-komponen`) dengan tanggal
// "hari ini" yang dikunci, supaya tes e2e memberi hasil yang sama kapan pun.
// Build produksi (`pnpm build`) tidak memuat konten uji.
import { fileURLToPath } from 'node:url';

process.env.DEVMECUM_FIXTURES = '1';
process.env.DEVMECUM_TODAY = '2026-11-15';

const { build } = await import('astro');
await build({ root: fileURLToPath(new URL('..', import.meta.url)) });
