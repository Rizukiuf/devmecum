// Memeriksa versi terbaru tiap teknologi di registri terhadap `latestVersion`.
// Pemakaian:
//   node scripts/check-versions.mjs [slug…] [--write] [--report <berkas>]
//     slug…              periksa teknologi itu saja (bawaan: semua yang punya versionSource)
//     --write            perbarui `latestVersion` hanya untuk yang tertinggal
//     --report <berkas>  tulis laporan Markdown; bila GITHUB_OUTPUT disetel,
//                        tambahkan `findings=<true|false>` ke sana
// Keluar 1 hanya bila slug disebut eksplisit dan ada yang gagal diperiksa
// (atau slug tidak dikenal); selain itu 0, supaya pekerjaan terjadwal tidak
// gagal hanya karena satu registri sedang sakit.
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapLimit } from '../src/lib/concurrency.ts';
import { formatDate, today } from '../src/lib/freshness.ts';
import { defaultDeps, fetchLatestVersion } from '../src/lib/registries.ts';
import { isFixtureTech, techSchema } from '../src/lib/schemas.ts';
import { loadProject } from '../src/lib/validate.ts';
import {
  classifyVersion,
  describeSource,
  outdatedPages,
  renderVersionReport,
  setLatestVersion,
} from '../src/lib/version-report.ts';

const CONCURRENCY = 6;

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const slugs = [];
let write = false;
let reportFile;
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--write') write = true;
  else if (arg === '--report') {
    reportFile = args[++i];
    if (!reportFile) {
      console.error('--report butuh nama berkas.');
      process.exit(1);
    }
  } else if (arg.startsWith('--')) {
    console.error(`Opsi tidak dikenal: ${arg}`);
    process.exit(1);
  } else slugs.push(arg);
}

const now = today();
const deps = defaultDeps();
const project = await loadProject(root);

// Satu berkas data satu teknologi; berkas rusak dilaporkan validate, bukan di sini.
const techs = [];
for (const raw of project.techFiles) {
  const parsed = techSchema.safeParse(raw.data);
  if (parsed.success && !isFixtureTech(parsed.data.slug)) techs.push({ tech: parsed.data, file: raw.file });
}

const unknown = slugs.filter((slug) => !techs.some((entry) => entry.tech.slug === slug));
for (const slug of unknown) console.error(`Teknologi tidak dikenal (atau teknologi uji): ${slug}`);

const selected = slugs.length === 0 ? techs : techs.filter((entry) => slugs.includes(entry.tech.slug));

const pagesOf = (slug) =>
  project.pages
    .filter((page) => page.frontmatter?.tech === slug)
    .map((page) => ({ file: page.file, techVersion: stringOrUndefined(page.frontmatter.techVersion) }));

function stringOrUndefined(value) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;
}

const checks = await mapLimit(selected, CONCURRENCY, async ({ tech }) => {
  const source = tech.versionSource;
  const result = source === undefined ? undefined : await fetchLatestVersion(source, deps);
  const verdict = classifyVersion(tech.latestVersion, result);
  return {
    slug: tech.slug,
    name: tech.name,
    source: source === undefined ? '-' : describeSource(source),
    current: tech.latestVersion,
    ...verdict,
    pagesToReview: verdict.status === 'tertinggal' ? outdatedPages(pagesOf(tech.slug), verdict.latest) : [],
  };
});

const { markdown, findings } = renderVersionReport(checks, now);
process.stdout.write(markdown);

if (write) {
  const note = (check) => `dari ${check.source} per ${formatDate(now)}`;
  for (const check of checks.filter((entry) => entry.status === 'tertinggal')) {
    const { file } = selected.find((entry) => entry.tech.slug === check.slug);
    const path = join(root, file);
    await writeFile(path, setLatestVersion(await readFile(path, 'utf8'), check.latest, note(check)));
    console.log(`Diperbarui: ${file} → ${check.latest}`);
  }
}

if (reportFile) {
  await writeFile(reportFile, markdown);
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `findings=${findings}\n`);
}

const explicitFailure = slugs.length > 0 && (unknown.length > 0 || checks.some((check) => check.status === 'gagal'));
process.exit(explicitFailure ? 1 : 0);
