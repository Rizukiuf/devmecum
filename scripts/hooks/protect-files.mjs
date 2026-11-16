// Hook PreToolUse (Edit|Write): menolak suntingan pada file yang hanya boleh
// diubah oleh alat (lockfile dan data metrik).
//
// Fail-closed: bagi Claude Code, hook yang keluar dengan kode 1 (misalnya
// modul gagal dimuat) hanyalah "galat tak memblokir" dan suntingan tetap jalan.
// Karena itu setiap galat internal di sini diubah menjadi penolakan (kode 2).
import { fileURLToPath } from 'node:url';

try {
  const { editedFile, isProtectedPath, readHookInput } = await import('../../src/lib/hook-io.ts');
  const root = fileURLToPath(new URL('../..', import.meta.url));
  const rel = editedFile(await readHookInput(), root);

  if (rel !== null && isProtectedPath(rel)) {
    console.error(
      `Ditolak: ${rel} hanya diubah oleh alat. ` +
        'Lockfile diubah lewat `pnpm add/remove`, data metrik lewat skrip pemantau.',
    );
    process.exit(2);
  }
} catch (error) {
  console.error(`protect-files gagal berjalan, suntingan ditolak demi keamanan: ${error.message}`);
  process.exit(2);
}
