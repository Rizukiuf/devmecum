// Hook Stop: bila ada file konten atau data yang berubah, jalankan validasi
// menyeluruh sebelum sesi berakhir. Suntingan lewat shell tidak melewati hook
// PostToolUse, jadi ini jaring pengamannya.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { today } from '../../src/lib/freshness.ts';
import { allContentErrors, readHookInput } from '../../src/lib/hook-io.ts';

const root = fileURLToPath(new URL('../..', import.meta.url));
const input = await readHookInput();

// Sudah berjalan karena hook ini sebelumnya: biarkan berhenti agar tidak berputar.
if (input === null || input.stop_hook_active === true) process.exit(0);

let changed = '';
try {
  changed = execFileSync('git', ['status', '--porcelain', '--', 'src/content', 'src/data'], {
    cwd: root,
    encoding: 'utf8',
  });
} catch {
  process.exit(0);
}

if (changed.trim() !== '') {
  const errors = await allContentErrors(root, today());
  if (errors.length > 0) {
    console.error(`Ada file konten yang berubah dan validasi gagal:\n${errors.join('\n')}`);
    process.exit(2);
  }
}
