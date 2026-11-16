// Memeriksa tautan eksternal (https) di data teknologi dan halaman.
// Pemakaian:
//   node scripts/check-links.mjs [berkas…] [--report <berkas>] [--no-fail]
//     berkas…            periksa berkas itu saja (YAML teknologi atau halaman .md/.mdx);
//                        bawaan: semua data teknologi dan semua halaman
//     --report <berkas>  tulis laporan Markdown; bila GITHUB_OUTPUT disetel,
//                        tambahkan `findings=<true|false>` ke sana
//     --no-fail          keluar 0 walau ada tautan mati (untuk pekerjaan terjadwal)
// Keluar 1 bila ada tautan `mati`, kecuali dengan --no-fail. `pindah` dan
// `tak-pasti` tidak pernah menggagalkan. Tiap URL diperiksa sekali walau dipakai
// di banyak berkas. Redirect tidak pernah diikuti dan tidak ada kredensial dikirim.
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { mapLimit } from '../src/lib/concurrency.ts';
import { today } from '../src/lib/freshness.ts';
import { parseFrontmatter } from '../src/lib/frontmatter.ts';
import { checkLink, extractLinks, normalizeCheckableUrl, renderLinkReport } from '../src/lib/links.ts';
import { isFixtureTech, techSchema } from '../src/lib/schemas.ts';
import { loadProject } from '../src/lib/validate.ts';
import siteConfig from '../site.config.mjs';

const CONCURRENCY = 6;

const root = fileURLToPath(new URL('..', import.meta.url));

function fail(message) {
  console.error(message);
  process.exit(1);
}

const args = process.argv.slice(2);
const requested = [];
let noFail = false;
let reportFile;
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--no-fail') noFail = true;
  else if (arg === '--report') {
    reportFile = args[++i];
    if (!reportFile || reportFile.startsWith('--')) fail('--report butuh nama berkas.');
  } else if (arg.startsWith('--')) fail(`Opsi tidak dikenal: ${arg}`);
  else requested.push(arg);
}

const ownHost = new URL(siteConfig.url).hostname;
const asString = (value) => (typeof value === 'string' ? value : undefined);

/** URL mentah dari satu berkas, menurut jenisnya. */
async function rawLinksOf(file) {
  const text = await readFile(resolve(root, file), 'utf8');
  if (/\.ya?ml$/.test(file)) {
    const data = parse(text);
    const surveys = Array.isArray(data?.surveys) ? data.surveys.map((survey) => survey?.url) : [];
    return [data?.website, data?.docs, ...surveys].map(asString).filter((url) => url !== undefined);
  }
  const parsed = parseFrontmatter(text);
  const sources = Array.isArray(parsed?.data.sources) ? parsed.data.sources.map(asString).filter((url) => url !== undefined) : [];
  return [...sources, ...extractLinks(parsed?.body ?? text)];
}

let files;
if (requested.length > 0) {
  files = requested.map((arg) => relative(root, resolve(arg)).replaceAll('\\', '/'));
  for (const file of files) {
    if (!/\.(ya?ml|mdx?)$/.test(file)) fail(`Jenis berkas tidak didukung (YAML teknologi atau .md/.mdx): ${file}`);
  }
} else {
  const project = await loadProject(root);
  const techs = project.techFiles.filter((raw) => {
    const parsed = techSchema.safeParse(raw.data);
    return !parsed.success || !isFixtureTech(parsed.data.slug);
  });
  // Halaman teknologi uji (konten tiruan dengan example.com) tidak ikut diperiksa.
  const pages = project.pages.filter((page) => {
    const tech = page.frontmatter?.tech;
    return !(typeof tech === 'string' && isFixtureTech(tech));
  });
  files = [...techs.map((raw) => raw.file), ...pages.map((page) => page.file)];
}

// URL → berkas yang memuatnya; tiap URL diperiksa sekali.
const filesByUrl = new Map();
let skipped = 0;
for (const file of files) {
  let raws;
  try {
    raws = await rawLinksOf(file);
  } catch (error) {
    fail(`${file}: tidak bisa dibaca (${error.message.split('\n')[0]})`);
  }
  for (const raw of raws) {
    const url = normalizeCheckableUrl(raw, ownHost);
    if (url === undefined) {
      skipped++;
      continue;
    }
    if (!filesByUrl.has(url)) filesByUrl.set(url, new Set());
    filesByUrl.get(url).add(file);
  }
}

console.error(
  `Memeriksa ${filesByUrl.size} URL unik dari ${files.length} berkas (${skipped} dilewati: situs sendiri, bukan https, atau host lokal).`,
);

const results = await mapLimit([...filesByUrl], CONCURRENCY, async ([url, owners]) => {
  const { status, detail } = await checkLink(url);
  return { url, status, detail, files: [...owners].sort() };
});

const { markdown, findings } = renderLinkReport(results, today());
process.stdout.write(markdown);

if (reportFile) {
  await writeFile(reportFile, markdown);
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `findings=${findings}\n`);
}

process.exit(!noFail && results.some((result) => result.status === 'mati') ? 1 : 0);
