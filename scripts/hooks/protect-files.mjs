// Hook PreToolUse (Edit|Write): menolak suntingan pada file yang hanya boleh
// diubah oleh alat (lockfile dan data metrik).
import { fileURLToPath } from 'node:url';
import { editedFile, isProtectedPath, readHookInput } from '../../src/lib/hook-io.ts';

const root = fileURLToPath(new URL('../..', import.meta.url));
const rel = editedFile(await readHookInput(), root);

if (rel !== null && isProtectedPath(rel)) {
  console.error(
    `Ditolak: ${rel} hanya diubah oleh alat. ` +
      'Lockfile diubah lewat `pnpm add/remove`, data metrik lewat skrip pemantau.',
  );
  process.exit(2);
}
