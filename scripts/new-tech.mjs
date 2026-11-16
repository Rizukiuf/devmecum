// Membuat kerangka berkas teknologi baru.
// Pemakaian:
//   pnpm new-tech <slug> --name "<Nama>" --domain <id> --type <jenis> [--template <A-E>]
// Hanya menulis src/data/tech/<slug>.yaml (folder MDX dibuat di M3). Akar proyek
// adalah folder kerja saat ini (jalankan dari root repo, seperti perintah pnpm lain).
// Keluar 1 bila masukan tidak sah atau berkas sudah ada; berkas lama tidak disentuh.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { parse } from 'yaml';
import { techSkeleton } from '../src/lib/new-tech.ts';
import { SLUG_RE, TECH_TYPES, TEMPLATE_IDS } from '../src/lib/schemas.ts';

const USAGE =
  'Pemakaian: pnpm new-tech <slug> --name "<Nama>" --domain <id> --type <jenis> [--template <A-E>]';

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

let parsed;
try {
  parsed = parseArgs({
    allowPositionals: true,
    options: {
      name: { type: 'string' },
      domain: { type: 'string' },
      type: { type: 'string' },
      template: { type: 'string' },
    },
  });
} catch (error) {
  fail(`${error.message}\n${USAGE}`);
}

const { values, positionals } = parsed;
const [slug, ...extra] = positionals;

if (slug === undefined || extra.length > 0) fail(`butuh tepat satu slug.\n${USAGE}`);
if (!SLUG_RE.test(slug)) fail(`slug "${slug}" tidak sah: hanya huruf kecil, angka, dan tanda hubung.`);
if (!values.name?.trim()) fail(`--name wajib diisi.\n${USAGE}`);
if (!values.domain) fail(`--domain wajib diisi.\n${USAGE}`);
if (!TECH_TYPES.includes(values.type)) fail(`--type harus salah satu dari: ${TECH_TYPES.join(', ')}.`);
if (values.template !== undefined && !TEMPLATE_IDS.includes(values.template)) {
  fail(`--template harus salah satu dari: ${TEMPLATE_IDS.join(', ')}.`);
}

const root = process.cwd();
let domains;
try {
  domains = parse(readFileSync(join(root, 'src', 'data', 'domains.yaml'), 'utf8'));
} catch {
  fail('src/data/domains.yaml tidak terbaca; jalankan dari root repo.');
}
const domainIds = domains.map((domain) => domain.id);
if (!domainIds.includes(values.domain)) {
  fail(`domain "${values.domain}" tidak dikenal. Pilihan: ${domainIds.join(', ')}.`);
}

const dir = join(root, 'src', 'data', 'tech');
const file = join(dir, `${slug}.yaml`);
mkdirSync(dir, { recursive: true });
try {
  // Flag `wx` gagal bila berkas sudah ada, jadi tidak ada risiko menimpa.
  writeFileSync(
    file,
    techSkeleton({
      slug,
      name: values.name.trim(),
      domain: values.domain,
      type: values.type,
      template: values.template,
    }),
    { flag: 'wx' },
  );
} catch (error) {
  if (error.code === 'EEXIST') fail(`src/data/tech/${slug}.yaml sudah ada; tidak ditimpa.`);
  throw error;
}

console.log(`Dibuat: src/data/tech/${slug}.yaml`);
console.log('Ganti semua GANTI, lalu jalankan `pnpm validate`.');
