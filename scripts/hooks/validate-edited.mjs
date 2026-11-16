// Hook PostToolUse (Edit|Write): memvalidasi file konten atau data yang baru
// saja diubah. Galat dikembalikan ke Claude supaya langsung diperbaiki.
// Hanya berkas itu (dan halaman yang dibutuhkannya) yang dibaca; validasi
// menyeluruh dijalankan hook Stop.
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { today } from '../../src/lib/freshness.ts';
import { editedFile, isContentPath, readHookInput, validateFile } from '../../src/lib/hook-io.ts';

const root = fileURLToPath(new URL('../..', import.meta.url));
const rel = editedFile(await readHookInput(), root);

if (rel !== null && isContentPath(rel)) {
  const errors = await validateFile(root, join(root, rel), today());
  if (errors.length > 0) {
    console.error(`Validasi konten gagal:\n${errors.join('\n')}`);
    process.exit(2);
  }
}
