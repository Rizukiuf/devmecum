// Memperbarui satu issue bergulir di GitHub sesuai hasil pemeriksaan.
// Pemakaian:
//   node scripts/rolling-issue.mjs --label <label> --title "<judul>" \
//     --body-file <berkas> --findings <true|false> [--dry-run]
// Ada temuan: buat issue berlabel (bila belum ada yang terbuka) atau perbarui
// isinya. Tanpa temuan: perbarui isinya lalu tutup dengan komentar. Memakai
// `gh` (butuh GH_TOKEN) lewat execFileSync dengan argumen berupa larik, tanpa
// shell, jadi judul dan label tidak bisa menyuntikkan perintah.
// --dry-run hanya mencetak perintah; tidak memanggil `gh` sama sekali, jadi
// tidak butuh jaringan atau login. Issue terbuka dianggap belum ada.
import { execFileSync } from 'node:child_process';
import { formatDate, today } from '../src/lib/freshness.ts';
import { planIssueAction } from '../src/lib/rolling-issue.ts';

const VALUE_OPTIONS = ['--label', '--title', '--body-file', '--findings'];

function fail(message) {
  console.error(message);
  process.exit(1);
}

const args = process.argv.slice(2);
const values = {};
let dryRun = false;
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--dry-run') dryRun = true;
  else if (VALUE_OPTIONS.includes(arg)) {
    const value = args[++i];
    if (value === undefined || value.startsWith('--')) fail(`${arg} butuh nilai.`);
    values[arg] = value;
  } else fail(`Opsi tidak dikenal: ${arg}`);
}
for (const option of VALUE_OPTIONS) {
  if (option !== '--findings' && !values[option]) fail(`${option} wajib diisi.`);
}
if (values['--findings'] !== 'true' && values['--findings'] !== 'false') {
  fail(`--findings harus persis "true" atau "false", bukan "${values['--findings'] ?? ''}".`);
}

const label = values['--label'];
const title = values['--title'];
const bodyFile = values['--body-file'];
const findings = values['--findings'] === 'true';
const closingComment = `Semua beres per ${formatDate(today())}.`;

const quote = (arg) => (/^[\w./:=<>@-]+$/.test(arg) ? arg : JSON.stringify(arg));
const show = (argv) => console.log(['gh', ...argv].map(quote).join(' '));

const labelArgs = ['label', 'create', label, '--force'];
const listArgs = ['issue', 'list', '--label', label, '--state', 'open', '--json', 'number', '--limit', '1'];
const createArgs = ['issue', 'create', '--title', title, '--body-file', bodyFile, '--label', label];
const editArgs = (number) => ['issue', 'edit', String(number), '--body-file', bodyFile];
const closeArgs = (number) => ['issue', 'close', String(number), '--comment', closingComment];

const gh = (argv) => execFileSync('gh', argv, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });

if (dryRun) {
  // Tidak ada panggilan ke gh: anggap belum ada issue terbuka, lalu catat
  // jalur lain supaya terlihat apa yang akan terjadi di tiap keadaan.
  show(labelArgs);
  console.log('# (dry-run) `gh issue list` dilewati; dianggap belum ada issue terbuka:');
  show(listArgs);
  const plan = planIssueAction(undefined, findings);
  if (plan.kind === 'create') show(createArgs);
  else console.log('# Tanpa temuan dan tanpa issue terbuka: tidak ada yang dilakukan.');
  console.log('# Bila sudah ada issue terbuka #<n> dan ada temuan:');
  show(editArgs('<n>'));
  console.log('# Bila sudah ada issue terbuka #<n> dan tanpa temuan:');
  show(editArgs('<n>'));
  show(closeArgs('<n>'));
  process.exit(0);
}

gh(labelArgs);
const found = JSON.parse(gh(listArgs));
const plan = planIssueAction(found[0], findings);
switch (plan.kind) {
  case 'create':
    gh(createArgs);
    console.log(`Issue baru dibuat dengan label ${label}.`);
    break;
  case 'edit':
    gh(editArgs(plan.number));
    console.log(`Issue #${plan.number} diperbarui.`);
    break;
  case 'close':
    gh(editArgs(plan.number));
    gh(closeArgs(plan.number));
    console.log(`Issue #${plan.number} ditutup.`);
    break;
  case 'none':
    console.log('Tanpa temuan dan tanpa issue terbuka: tidak ada yang dilakukan.');
    break;
}
