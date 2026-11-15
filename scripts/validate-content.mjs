// Validasi konten dan data.
// Pemakaian:
//   node scripts/validate-content.mjs            → periksa semuanya
//   node scripts/validate-content.mjs <file…>    → laporkan masalah di file itu saja
// Keluar 1 bila ada galat. Peringatan tidak menggagalkan.
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { today } from '../src/lib/freshness.ts';
import { loadProject, validateProject } from '../src/lib/validate.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const only = process.argv.slice(2).map((file) => relative(root, resolve(file)).replaceAll('\\', '/'));

let problems = validateProject(await loadProject(root), today());
if (only.length > 0) problems = problems.filter((problem) => only.includes(problem.file));

for (const problem of problems) {
  const label = problem.severity === 'error' ? 'error     ' : 'peringatan';
  console.log(`${label}  ${problem.file}: ${problem.message}`);
}

const errors = problems.filter((problem) => problem.severity === 'error').length;
const warnings = problems.length - errors;
console.log(`\n${errors} galat, ${warnings} peringatan.`);

process.exit(errors > 0 ? 1 : 0);
