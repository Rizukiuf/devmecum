// Validasi konten dan data.
// Pemakaian:
//   node scripts/validate-content.mjs            → periksa semuanya
//   node scripts/validate-content.mjs <file…>    → periksa file itu saja; hanya
//                                                  halaman yang dibutuhkannya dibaca
// Keluar 1 bila ada galat. Peringatan tidak menggagalkan.
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { today } from '../src/lib/freshness.ts';
import { fileProblems } from '../src/lib/hook-io.ts';
import { loadProject, validateProject } from '../src/lib/validate.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const files = [...new Set(process.argv.slice(2).map((file) => resolve(file)))];
const now = today();

const problems = [];
if (files.length === 0) {
  problems.push(...validateProject(await loadProject(root), now));
} else {
  for (const file of files) problems.push(...(await fileProblems(root, file, now)));
}

for (const problem of problems) {
  const label = problem.severity === 'error' ? 'error     ' : 'peringatan';
  console.log(`${label}  ${problem.file}: ${problem.message}`);
}

const errors = problems.filter((problem) => problem.severity === 'error').length;
const warnings = problems.length - errors;
console.log(`\n${errors} galat, ${warnings} peringatan.`);

process.exit(errors > 0 ? 1 : 0);
