// Memeriksa anggaran file hasil build.
// Pemakaian: node scripts/count-files.mjs <folder>
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { evaluateBudget, FAIL_AT, scanDir, WARN_AT } from '../src/lib/budget.ts';

const target = process.argv[2];
if (!target) {
  console.error('Pemakaian: node scripts/count-files.mjs <folder>');
  process.exit(1);
}

const dir = resolve(target);
if (!existsSync(dir)) {
  console.error(`Folder ${target} tidak ada. Jalankan build lebih dulu.`);
  process.exit(1);
}

const scan = await scanDir(dir);
const result = evaluateBudget(scan);

console.log(`${scan.count} file di ${target} (peringatan di ${WARN_AT}, gagal di ${FAIL_AT}).`);
for (const message of result.messages) {
  console.log(`${result.level === 'fail' ? 'GAGAL' : 'PERINGATAN'}: ${message}`);
}

process.exit(result.level === 'fail' ? 1 : 0);
