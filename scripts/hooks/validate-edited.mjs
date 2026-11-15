// Hook PostToolUse (Edit|Write): memvalidasi file konten atau data yang baru
// saja diubah. Galat dikembalikan ke Claude supaya langsung diperbaiki.
import { fileURLToPath } from 'node:url';
import { today } from '../../src/lib/freshness.ts';
import { allContentErrors, editedFile, isContentPath, readHookInput } from '../../src/lib/hook-io.ts';

const root = fileURLToPath(new URL('../..', import.meta.url));
const rel = editedFile(await readHookInput(), root);

if (rel !== null && isContentPath(rel)) {
  const errors = (await allContentErrors(root, today())).filter((line) => line.startsWith(`${rel}: `));
  if (errors.length > 0) {
    console.error(`Validasi konten gagal:\n${errors.join('\n')}`);
    process.exit(2);
  }
}
