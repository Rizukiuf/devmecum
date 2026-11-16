// Mengambil bintang GitHub dan unduhan paket tiap teknologi yang punya `metrics`
// dan menulisnya ke src/data/metrics/metrics.json (tidak masuk Git; dibuat saat
// deploy). Pemakaian: node scripts/update-metrics.mjs
// Berkas keluaran bisa diganti lewat DEVMECUM_METRICS_FILE (sama seperti pembaca di build).
// Bila berkas lama ada (mis. di mesin lokal), nilai lamanya dipertahankan per kolom
// saat pengambilan kali ini gagal; di CI berkas lama tidak ada, jadi angka yang gagal
// diambil tidak tampil pada deploy itu. Keluar 0 walau ada yang gagal, supaya deploy
// tidak berhenti karena satu registri sakit; keluar 1 hanya bila berkas tidak bisa ditulis.
// Skrip ini membuat sekitar satu permintaan API GitHub per teknologi yang punya entri
// `metrics.github` (sekitar 400 pada ukuran penuh), sedangkan batas GITHUB_TOKEN adalah
// 1.000 permintaan per jam dan setiap push ke main men-deploy. Deploy beruntun bisa
// kehilangan angka bintang pada deploy itu (degradasi bertahap, memang disengaja).
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapLimit } from '../src/lib/concurrency.ts';
import { today } from '../src/lib/freshness.ts';
import { mergeMetrics, readMetricsFile } from '../src/lib/metrics.ts';
import { defaultDeps, fetchDownloads, fetchStars } from '../src/lib/registries.ts';
import { isFixtureTech, techSchema } from '../src/lib/schemas.ts';
import { loadProject } from '../src/lib/validate.ts';

const CONCURRENCY = 6;

const root = fileURLToPath(new URL('..', import.meta.url));
const output = resolve(root, process.env.DEVMECUM_METRICS_FILE || 'src/data/metrics/metrics.json');
const date = today().toISOString().slice(0, 10);
const deps = defaultDeps();
const project = await loadProject(root);

const techs = [];
for (const raw of project.techFiles) {
  const parsed = techSchema.safeParse(raw.data);
  if (parsed.success && parsed.data.metrics !== undefined && !isFixtureTech(parsed.data.slug)) techs.push(parsed.data);
}

let succeeded = 0;
let failed = 0;
const note = (slug, what, result) => {
  if (result.ok) {
    succeeded++;
  } else {
    failed++;
    console.warn(`Gagal: ${slug} ${what}: ${result.error}`);
  }
  return result;
};

const fetched = await mapLimit(techs, CONCURRENCY, async (tech) => {
  const { github, downloads } = tech.metrics;
  const metrics = {};
  if (github) {
    const stars = note(tech.slug, 'bintang GitHub', await fetchStars(github.repo, deps));
    if (stars.ok) metrics.github = { stars: stars.value, date };
  }
  if (downloads) {
    const result = note(tech.slug, `unduhan ${downloads.registry}`, await fetchDownloads(downloads, deps));
    if (result.ok) {
      metrics.downloads = { registry: downloads.registry, period: result.value.period, value: result.value.value, date };
    }
  }
  return [tech.slug, metrics];
});

const merged = mergeMetrics(readMetricsFile(output), Object.fromEntries(fetched), new Date().toISOString());

try {
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(merged, null, 2)}\n`);
} catch (error) {
  console.error(`Tidak bisa menulis ${output}: ${error.message}`);
  process.exit(1);
}
console.log(`Metrik: ${succeeded} berhasil, ${failed} gagal; ${Object.keys(merged.tech).length} teknologi di ${output}`);
