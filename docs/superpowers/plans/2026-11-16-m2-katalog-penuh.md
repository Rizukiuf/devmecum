# Devmecum M2 — Katalog Penuh: Rencana Pelaksanaan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mendaftarkan minimal 300 teknologi (tingkat 0) dan membuat peta itu bisa dijelajahi: katalog berfilter, halaman domain, lencana adopsi dan tren, angka popularitas, pemantau versi, dan pemeriksa tautan eksternal.

**Architecture:** Aturan baru tetap ditulis sebagai fungsi murni di `src/lib/*.ts` yang dipakai bersama oleh build Astro, skrip Node, dan tes. Katalog dan halaman domain adalah halaman Astro (`StarlightPage`) yang dibangkitkan dari data YAML, jadi menambah teknologi tetap cukup satu file YAML. Teknologi tingkat 0 tidak mendapat halaman sendiri. Pemantau berjalan terjadwal di GitHub Actions dan melapor lewat issue bergulir, tidak meng-commit ke `main`.

**Tech Stack:** Astro 7.4, Starlight 0.43, TypeScript 6.0, Node 26, pnpm 10, Zod (`astro/zod`), paket `yaml`, Vitest 5, Playwright 1.65, GitHub Actions, `gh` CLI. Tanpa dependensi baru.

**Spec:** `docs/superpowers/specs/2026-11-14-buku-panduan-teknologi-design.md` (terutama §5.3, §5.7, §6, §8.2, §9, §10, §12, §14, Lampiran A). Rencana sebelumnya: `docs/superpowers/plans/2026-11-15-m0-m1-kerangka-dan-jalur-konten.md`. Ledger M1: `.superpowers/sdd/2026-11-15-m0-m1-kerangka-dan-jalur-konten/progress.md`.

## Global Constraints

- **Versi tetap** (diperiksa di npm pada 16 November 2026; semuanya masih rilis terbaru kecuali yang sengaja dikunci): `astro@7.4.12`, `@astrojs/starlight@0.43.1`, `typescript@6.0.3` (7.0.2 sudah ada, tetapi `@astrojs/check@0.9.12` belum mendukungnya, K2 M1), `vitest@5.1.0`, `@playwright/test@1.65.1`, `yaml@2.9.1`, `wrangler@4.162.0`, `satteri@0.10.5` (mengikuti Starlight, ruling Task 16 M1). Node 26, pnpm 10.34.9. **Tidak ada dependensi baru**: HTTP lewat `fetch` bawaan Node, tag Git lewat `git ls-remote`.
- **Windows + CI Linux.** Skrip Node `.mjs`; tanpa bash. Perintah `pnpm` lokal dijalankan lewat PowerShell (Vitest gagal di Git Bash).
- **`src/lib/` bisa diimpor Node langsung**: hanya sintaks TypeScript yang bisa dihapus, impor relatif berakhiran `.ts`, Zod dari `astro/zod`. Kecuali `data.ts` (memakai `astro:content`).
- **Tanpa perubahan kode untuk konten.** Teknologi tingkat 0 = satu file `src/data/tech/<slug>.yaml`. Halaman domain dan katalog dibangkitkan dari data.
- **Batas PR.** Kode aplikasi dan konten (`src/content/`, `src/data/tech/`) tidak bercampur dalam satu PR. `domains.yaml` dan `templates.yaml` adalah data struktur yang berubah bersama tesnya di PR aplikasi (CLAUDE.md). Fixture `uji-komponen` adalah data uji dan boleh berubah di PR aplikasi.
- **Tidak ada commit ke `main` dari otomasi.** `main` wajib PR dengan cek `ci` hijau, dan PR yang dibuat `GITHUB_TOKEN` tidak memicu CI. Jadi pemantau melapor lewat issue.
- **Anggaran file:** peringatan 15.000, gagal 19.000 (§8.2). M2 hanya boleh menambah sekitar 20 halaman (katalog + 18 domain); tidak ada halaman atau gambar OG untuk teknologi tingkat 0.
- **Rujukan lewat ID**; URL `/{domain}/{teknologi}/…`; halaman domain di `/{domain}/`, katalog di `/katalog/`.
- **Bahasa Indonesia** untuk antarmuka, pesan galat, isi issue, dan pesan commit (Conventional Commits). Istilah teknis tetap Inggris.
- **Sopan ke registri.** Setiap permintaan HTTP memakai `User-Agent: devmecum-pemantau (+https://github.com/Rizukiuf/devmecum)`, batas waktu 15 detik, dan paling banyak 6 permintaan bersamaan.
- **Langkah bertanda 👤 dikerjakan pemilik.** Pelaksana berhenti dan menunggu di langkah itu.
- **Cabang:** satu cabang dan satu PR per fase (tabel di bawah); cabang bertumpuk bila PR fase sebelumnya belum di-merge. Pelaksanaan mencatat ruling di `.superpowers/sdd/2026-11-16-m2-katalog-penuh/progress.md`.

## Keputusan yang menyimpang dari atau melengkapi rancangan

| # | Keputusan | Alasan |
|---|---|---|
| K1 | Bab "Bekerja dengan AI" ditambahkan ke templat C (bab 12), D (14), E (11); Evaluasi di E diwakili bab 9 | Keputusan pemilik 16 November 2026; rancangan §5.4 dan Lampiran B sudah diperbarui |
| K2 | `latestVersion` dan `versionSource` opsional; bila `versionSource` ada, `latestVersion` wajib | Konsep, standar tanpa nomor versi, dan layanan SaaS tidak punya aliran rilis yang bisa dipantau |
| K3 | `versionSource` GitHub mendapat `tagPattern` (regex; grup tangkapan digabung titik). Tanpa `tagPattern` dipakai GitHub Release "latest". Tag dibaca lewat `git ls-remote`, tanpa kuota API | CPython, Go, dan PostgreSQL tidak memakai GitHub Release; tag memuat prarilis (`v3.16.0a1`) |
| K4 | Pemantau versi tidak mengubah YAML di CI. Ia memperbarui satu issue bergulir; pemilik menjalankan `pnpm versions --write` lalu membuka PR konten | PR otomatis dari `GITHUB_TOKEN` tidak memicu CI wajib (lihat Global Constraints) |
| K5 | Metrik (bintang GitHub, unduhan) diambil saat deploy, termasuk deploy terjadwal mingguan, ke `src/data/metrics/metrics.json` yang di-*gitignore* | Mingguan tanpa PR otomatis; build tanpa berkas metrik tetap jalan dan hanya menyembunyikan angka |
| K6 | Satu workflow `pemantau.yml` (job `versi` dan `tautan`) menggantikan `versions.yml` dan `metrics.yml` di §8.3 | Metrik pindah ke deploy (K5); dua pemantau sisanya berbagi pemasangan dan pola issue |
| K7 | Halaman domain dibangkitkan dari `domains.yaml` (kolom baru `description`) di `src/pages/[domain]/index.astro`; MDX di `<domain>/index.mdx` ditolak validasi | Menambah teknologi tidak boleh menuntut menulis halaman domain |
| K8 | Teknologi tingkat 0 hanya tampil sebagai kartu di katalog dan halaman domain; tidak ada halaman atau gambar OG sendiri | §5.3 ("muncul di katalog") dan anggaran file |
| K9 | Filter katalog berjalan di browser lewat custom element; keadaan filter di query URL (`?domain=…&adopsi=…`). Tanpa JavaScript semua kartu tampil dan formulir disembunyikan | §2 "tanpa JavaScript kecuali yang dibutuhkan fitur"; tautan dari halaman domain bisa membawa filter |
| K10 | Bukti `adoption` dan `trend` ditulis sebagai komentar YAML di baris yang sama (`adoption: mapan # bukti; URL`) | Bisa diperdebatkan di tempatnya tanpa kolom skema baru |
| K11 | Peringatan sementara selama pendaftaran (`alternatives` belum terdaftar, `adoption`/`trend` kosong) menjadi galat di Task 21 | Pendaftaran berjalan per kelompok domain; rujukan silang baru lengkap di akhir |

## Review Focus

1. **Registri membalas 429, 403, 5xx, atau tidak menjawab.** Diharapkan: entri itu berstatus `gagal`, data lama tetap dipakai, tidak dilaporkan "tertinggal", proses keseluruhan tidak gagal. → Task 13 (versi) dan Task 16 (metrik).
2. **Versi prarilis** (`v3.16.0a1`, `7.0.0-rc.1`, `6.0.0-M1`, `2.0.0-beta`, `canary`). Diharapkan: tidak pernah dipilih sebagai versi terbaru. → Task 13.
3. **Query katalog aneh** (`?domain=tidak-ada`, nilai berhuruf besar, kunci ganda) **dan JavaScript mati.** Diharapkan: nilai tak dikenal diabaikan, semua kartu tetap tampil, tanpa galat konsol. → Task 8 dan Task 10.
4. **`--write` pada YAML berkomentar atau berakhiran CRLF.** Diharapkan: hanya baris `latestVersion` yang berubah; komentar, gaya `{ … }`, dan akhir baris lain utuh. → Task 14.
5. **Situs yang memblokir bot** (403 atau 429 dari HEAD maupun GET). Diharapkan: berstatus `tak-pasti`, bukan `mati`, dan tidak menggagalkan pemeriksaan. → Task 17.

## Struktur file

```
docs/rubrik-adopsi.md  docs/katalog.md                                   # Task 1–2
src/data/templates.yaml  src/data/domains.yaml                           # Task 3–4 (struktur)
src/lib/
  schemas.ts validate.ts hook-io.ts labels.ts sidebar.ts data.ts budget.ts   # diubah
  graph.ts         # findCycle — dipakai lagi oleh graf prasyarat M3
  concurrency.ts   # mapLimit
  new-tech.ts      # techSkeleton, DEFAULT_TEMPLATE
  catalog.ts       # buildCatalog, parseFilters, filtersToSearch, matchesFilters
  versions.ts      # parseVersion, isPrerelease, compareVersions, pickLatest, seriesMatches
  registries.ts    # fetchLatestVersion, fetchStars, fetchDownloads (fetch disuntikkan)
  version-report.ts  # classifyVersion, renderVersionReport, setLatestVersion
  metrics.ts       # MetricsFile, mergeMetrics, formatCompact, readMetricsFile
  links.ts         # extractLinks, classifyLink, renderLinkReport
  rolling-issue.ts # planIssueAction
src/pages/katalog.astro  src/pages/[domain]/index.astro
src/components/  CatalogCard CatalogFilter AdoptionBadge TrendBadge Popularity (.astro)
src/routeData.ts  src/overrides/PageTitle.astro  src/components/TechCard.astro  src/pages/og/[tech].png.ts   # diubah
scripts/  new-tech.mjs check-versions.mjs update-metrics.mjs check-links.mjs rolling-issue.mjs
.github/workflows/pemantau.yml   (deploy.yml diubah)
.claude/skills/daftar-teknologi/SKILL.md
tests/unit/*.test.ts  tests/e2e/{katalog,domain}.spec.ts  tests/fixtures/metrics.json
src/data/tech/*.yaml                                                     # Task 19–20 (konten)
```

## Fase dan cabang

| Fase | Task | Cabang | Hasil saat di-merge |
|---|---|---|---|
| M2-A | — | `m2/rencana` | Rencana ini, keputusan bab AI di rancangan, panduan/skill/agent dirapikan |
| M2-B | 1–2 | `m2/rubrik-katalog` | Rubrik adopsi dan daftar katalog, **disetujui pemilik** |
| M2-C | 3–7 | `m2/data-skala` | Templat dan skema M2, validasi tambahan, validasi hook terfokus, `new-tech` |
| M2-D | 8–12 | `m2/katalog` | Katalog berfilter, halaman domain, sidebar ke domain dan katalog |
| M2-E | 13–17 | `m2/pemantau` | Pemantau versi, metrik saat deploy, pemeriksa tautan |
| M2-F | 18 | `m2/jalur-katalog` | Skill `daftar-teknologi` |
| M2-G | 19–20 | `konten/katalog-<n>-<kelompok>` | ≥ 300 teknologi terdaftar |
| M2-H | 21 | `m2/penutup` | Validasi diperketat, ukuran build tercatat |

M2-B hanya berisi dokumen dan bisa ditinjau pemilik sambil M2-C sampai M2-E dikerjakan. **Gerbang:** Task 18 dan seterusnya tidak dimulai sebelum Task 1 Step 3 dan Task 2 Step 3 (persetujuan pemilik) selesai.

Di akhir tiap fase: `gh pr create`, tunggu CI hijau, 👤 pemilik meninjau pratinjau lalu me-merge.

---

## M2-B — Rubrik dan daftar katalog

### Task 1: Rubrik adopsi

**Files:**
- Create: `docs/rubrik-adopsi.md`

**Interfaces:**
- Produces: nilai dan aturan bukti untuk `adoption` (`arus-utama | mapan | berkembang | khusus | warisan`) dan `trend` (`naik | stabil | turun`), dipakai Task 18–20.

- [ ] **Step 1: Tulis rubrik** dari draf di bawah. Bahasa mengikuti panduan menulis. Isinya: tujuan (penilaian editorial yang bisa diperdebatkan, §6), cara menilai, tabel adopsi, tabel tren, format bukti, penilaian ulang, cara mengoreksi.

  Penilaian dibandingkan **dengan teknologi sekategori** (database dengan database, bukan dengan bahasa). Periksa berurutan: warisan → arus utama → berkembang → khusus → mapan. Nilai pertama yang terpenuhi dipakai.

  | Adopsi | Terpenuhi bila (cukup satu bukti) |
  |---|---|
  | `warisan` | Pembuatnya menyatakan *deprecated*, mode pemeliharaan, atau menunjuk penerus resmi; atau tidak ada rilis selama 24 bulan dan pemakaiannya menurun di survei |
  | `arus-utama` | Dipakai ≥ 20% responden kategori yang sesuai di survei pengembang publik terbaru; atau termasuk lima besar kategorinya menurut survei atau statistik registri; atau (database dan platform) tersedia sebagai layanan terkelola di minimal dua dari AWS, Google Cloud, dan Azure |
  | `berkembang` | Rilis stabil pertama kurang dari 5 tahun lalu atau belum 1.0, dan ada bukti pertumbuhan (lihat tren `naik`) |
  | `khusus` | Menjadi pilihan utama di ceruk tertentu (bidang, platform, industri) tetapi jarang di luar itu, misalnya < 5% di survei umum |
  | `mapan` | Bawaan: masih dirilis dalam 12 bulan terakhir dan dipakai luas, tetapi tidak memenuhi kategori di atas |

  | Tren | Terpenuhi bila |
  |---|---|
  | `naik` | Dua titik data berjarak ≥ 1 tahun: survei naik ≥ 2 poin persentase, atau unduhan registri naik ≥ 25% |
  | `turun` | Survei turun ≥ 2 poin, unduhan turun ≥ 15%, atau berstatus `warisan` |
  | `stabil` | Bawaan: perubahan di antara keduanya, atau belum ada dua titik data |

  Konsep dan disiplin (templat E) dinilai dari seberapa luas dipraktikkan atau diajarkan; tanpa bukti kuantitatif, nilainya `mapan` / `stabil` dengan alasan tertulis.

  **Format bukti:** komentar di baris yang sama (K10), satu kalimat pendek + URL, misalnya `adoption: arus-utama # SO Survey 2026: 58,0% responden; https://survey.stackoverflow.co/2026/technology`. Nilai bawaan ditulis `# bawaan rubrik: <alasan>`.

  **Penilaian ulang:** setahun sekali bersama pengisian `surveys` (§6), atau saat ada bukti baru. **Koreksi:** siapa pun boleh membuka issue dengan bukti; nilai berubah bila bukti memenuhi tabel.
- [ ] **Step 2: Commit.** `git commit -m "docs: tambah rubrik adopsi dan tren"`
- [ ] **Step 3 (👤): Pemilik menyetujui rubrik** lewat tinjauan PR `m2/rubrik-katalog`. Koreksi dikerjakan sebelum merge. Catat persetujuan di ledger.

### Task 2: Daftar katalog

**Files:**
- Create: `docs/katalog.md`

**Interfaces:**
- Produces: daftar rencana entri per domain (`slug`, nama, `type`, templat, catatan), dibaca skill `daftar-teknologi` (Task 18) untuk memilih entri.

- [ ] **Step 1: Susun daftar** per domain (urutan `domains.yaml`), satu tabel per domain: `| slug | Nama | type | Templat | Catatan |`. Aturannya:
  - **Total ≥ 300.** Semua butir Lampiran A masuk, kecuali baris "Lintas topik: karier" (itu bagian lintas topik M3, bukan teknologi).
  - **Dipisah** bila tiap bagian punya dokumentasi dan rilis sendiri: Svelte/SvelteKit, Redis/Valkey, MySQL/MariaDB, Elasticsearch/OpenSearch, Terraform/OpenTofu, React Native/Expo, Ionic/Capacitor, TensorFlow/Keras, LangChain/LangGraph, "API model" → `claude-api`, `openai-api`, `gemini-api` + konsep `model-open-weight`, dan sejenisnya.
  - **Disatukan** bila konsep selalu dibahas bersama: TDD dan BDD, OAuth 2.0 dan OIDC, clean dan hexagonal architecture, dan sejenisnya.
  - **Tambahan** di luar benih memenuhi §14: masih dipakai industri atau penting untuk belajar, dan punya dokumentasi resmi. Teknologi lama yang penting secara historis boleh masuk (nanti ber-adopsi `warisan`).
  - **Slug** huruf kecil dan tanda hubung, unik di seluruh katalog, tidak berawalan `uji-`. Nama konsep berbahasa Indonesia boleh (`kompleksitas-big-o`).
  - **Templat bawaan menurut `type`:** `language` → A; `framework`, `library` → B; `tool`, `platform` → C; `database` → D; `concept`, `standard` → E. Pengecualian ditulis di kolom Catatan.
  - Tutup dengan tabel jumlah per domain dan total.
- [ ] **Step 2: Periksa.** `node -e` yang menghitung baris tabel berslug: total ≥ 300, slug unik, semua `type` ada di `TECH_TYPES`. Expected: angka total dan `slug unik`.
- [ ] **Step 3 (👤): Pemilik menyetujui daftar** lewat tinjauan PR yang sama. Entri yang dicoret atau ditambah pemilik dikerjakan sebelum merge.
- [ ] **Step 4: Commit, PR.** `git commit -m "docs: tambah daftar rencana katalog"`; `gh pr create` untuk `m2/rubrik-katalog`.

---

## M2-C — Data, validasi, dan skala

### Task 3: Bab "Bekerja dengan AI" di templat C, D, E

**Files:**
- Modify: `src/data/templates.yaml`, `tests/unit/data.test.ts`

- [ ] **Step 1: Ubah tes.** Jumlah bab: `['C', 16]`, `['D', 16]`, `['E', 13]`. Tambah kasus level: `['C', 12, 'umum']`, `['C', 16, 'umum']`, `['D', 13, 'profesional']`, `['D', 14, 'umum']`, `['D', 16, 'umum']`, `['E', 11, 'umum']`, `['E', 13, 'umum']`. Tambah:

```ts
test.each([['A', 23], ['B', 18], ['C', 12], ['D', 14], ['E', 11]] as const)(
  'templat %s memuat bab Bekerja dengan AI di bab %i',
  (id, chapter) => expect(template(id).chapters[chapter - 1]!.title).toBe('Bekerja dengan AI'),
);
```

- [ ] **Step 2: Jalankan, pastikan gagal.** `pnpm test tests/unit/data.test.ts` → gagal di jumlah bab C, D, E.
- [ ] **Step 3: Ubah `templates.yaml`** persis seperti Lampiran B yang baru: sisipkan `Bekerja dengan AI` (`level: umum`) lalu geser nomor bab sesudahnya. Komentar kepala berkas menyebut keputusan 16 November 2026.
- [ ] **Step 4: Jalankan.** `pnpm test` dan `pnpm validate` → lolos (halaman uji `uji-komponen` hanya memakai bab E 2 dan 3, yang tidak bergeser).
- [ ] **Step 5: Commit.** `git commit -m "feat: tambah bab Bekerja dengan AI di templat C, D, E"`

### Task 4: Skema data M2

**Files:**
- Modify: `src/lib/schemas.ts`, `src/data/domains.yaml`, `src/components/TechCard.astro`, `tests/unit/schemas.test.ts`, `tests/unit/data.test.ts`

**Interfaces:**
- Produces (dari `schemas.ts`): `DOWNLOAD_REGISTRIES = ['npm', 'pypi', 'crates'] as const`; tipe `TechType`, `TemplateId`, `Adoption`, `Trend`, `DownloadRegistry`, `VersionSource` (`z.infer` dari skema sumber versi); `techSchema` dengan `latestVersion?`, `versionSource?: { kind, name?, repo?, tagPattern? }`, `metrics?: { github?: { repo }, downloads?: { registry: DownloadRegistry, name } }`; `domainSchema` dengan `description: string` wajib.

- [ ] **Step 1: Tulis tes yang gagal** di `schemas.test.ts` (pakai objek teknologi sah yang sudah ada di berkas tes sebagai dasar):
  - `teknologi tanpa versionSource dan latestVersion sah` → `success: true`.
  - `versionSource tanpa latestVersion ditolak` → pesan memuat `latestVersion wajib bila versionSource ada`.
  - `tagPattern hanya untuk github` → `{ kind: 'npm', name: 'x', tagPattern: '^(\\d+)$' }` ditolak.
  - `tagPattern harus regex sah dengan grup tangkapan` → `'^v\\d+$'` dan `'^(v'` ditolak; `'^v(\\d+)\\.(\\d+)\\.(\\d+)$'` diterima.
  - `registry unduhan dibatasi` → `{ registry: 'nuget', name: 'x' }` ditolak.
  - `metrics.github.repo berbentuk pemilik/nama` → `'react'` ditolak.
  - `domain wajib punya description` (di `data.test.ts`: setiap domain punya `description` 1–200 karakter).
- [ ] **Step 2: Jalankan, pastikan gagal.**
- [ ] **Step 3: Ubah skema.** `techSchema` menjadi `z.strictObject({...}).superRefine(...)` untuk aturan K2; validasi `tagPattern` di `versionSourceSchema` (bisa dikompilasi `new RegExp`, minimal satu grup tangkapan bukan `(?:`). Ekspor tipe di atas. Periksa pemakai `techSchema` (`content.config.ts`, `validate.ts`, tes) tetap jalan dengan skema ber-refine.
- [ ] **Step 4: Isi `description` di `domains.yaml`**: satu kalimat ≤ 25 kata per domain, merangkum cakupannya dari Lampiran A, nada panduan menulis. Contoh: `fondasi` → "Konsep dasar yang dipakai di semua bidang: cara kerja komputer, algoritma, struktur data, jaringan, dan terminal."
- [ ] **Step 5: `TechCard`.** Baris "Versi terbaru" hanya tampil bila `latestVersion` ada.
- [ ] **Step 6: Jalankan.** `pnpm check; pnpm test; pnpm validate` → lolos.
- [ ] **Step 7: Commit.** `git commit -m "feat: skema data M2 — versi opsional, tagPattern, deskripsi domain"`

### Task 5: Validasi tambahan

**Files:**
- Create: `src/lib/graph.ts`, `tests/unit/graph.test.ts`
- Modify: `src/lib/validate.ts`, `tests/unit/validate.test.ts`

**Interfaces:**
- Produces: `findCycle(graph: Map<string, string[]>): string[] | undefined` — satu lingkaran sebagai jalur tertutup (`['a', 'b', 'a']`), atau `undefined`. Simpul yang tidak ada di peta diabaikan.

- [ ] **Step 1: Tulis tes yang gagal.**

```ts
// graph.test.ts
test('tanpa lingkaran', () => expect(findCycle(new Map([['a', ['b']], ['b', []]]))).toBeUndefined());
test('lingkaran dua simpul', () => expect(findCycle(new Map([['a', ['b']], ['b', ['a']]]))).toEqual(['a', 'b', 'a']));
test('rujukan ke simpul tak dikenal diabaikan', () => expect(findCycle(new Map([['a', ['zzz']]]))).toBeUndefined());
```

  Di `validate.test.ts` (pola proyek sementara yang sudah ada), satu tes per aturan baru:
  - `requires yang melingkar ditolak` → galat `requires membentuk lingkaran: a → b → a`, dilaporkan sekali, pada berkas pertama menurut urutan nama.
  - `requires dan alternatives tidak boleh menunjuk dirinya sendiri` → galat.
  - `nama teknologi kembar ditolak` (tak peka huruf besar) → galat di berkas kedua, menyebut berkas pertama.
  - `halaman di <domain>/index.mdx ditolak` → galat `Halaman domain dibangkitkan otomatis dari src/data/domains.yaml`.
  - `adoption atau trend kosong menjadi peringatan` → `severity: 'warning'`, pesan `belum dinilai menurut docs/rubrik-adopsi.md` (K11).
- [ ] **Step 2: Jalankan, pastikan gagal.**
- [ ] **Step 3: Implementasikan** di `validateProject`. Graf `requires` dibangun dari teknologi yang terdaftar, hanya rujukan berupa ID teknologi.
- [ ] **Step 4: Jalankan.** `pnpm test; pnpm validate` → lolos; `python.yaml` dan `uji-komponen.yaml` kini memberi dua peringatan adopsi/tren masing-masing (diisi di Task 10 dan Task 19).
- [ ] **Step 5: Commit.** `git commit -m "feat: validasi lingkaran prasyarat, nama kembar, dan halaman domain"`

### Task 6: Validasi berskala (I/O terbatas dan hook terfokus)

**Files:**
- Create: `src/lib/concurrency.ts`, `tests/unit/concurrency.test.ts`
- Modify: `src/lib/validate.ts`, `src/lib/hook-io.ts`, `scripts/hooks/validate-edited.mjs`, `scripts/validate-content.mjs`, `tests/unit/hook-io.test.ts`, `tests/unit/validate.test.ts`

**Interfaces:**
- Produces: `mapLimit<T, R>(items: readonly T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]>` (urutan hasil = urutan masukan; galat pertama menolak promise). `loadProject(root: string, options?: { pages?: (docsPath: string) => boolean }): Promise<Project>`: halaman yang tidak terpilih tidak dibaca dan tercatat `{ file, docsPath, skipped: true }`. `validateFile(root: string, filePath: string, now: Date): Promise<string[]>` di `hook-io.ts` menggantikan `contentErrorsFor`.
- Consumes: Task 13, 14, 16, 17 memakai `mapLimit`.

- [ ] **Step 1: Tulis tes yang gagal.**
  - `mapLimit tidak pernah menjalankan lebih dari limit sekaligus` (hitung tugas aktif maksimum dengan promise tertunda; limit 3, 10 butir → maksimum 3) dan `mapLimit menjaga urutan hasil`.
  - `loadProject hanya membaca halaman terpilih`: proyek sementara 500 halaman → dengan `pages: (p) => p === target`, tepat satu halaman tanpa `skipped`.
  - `halaman yang dilewati tetap masuk indeks ID`: prasyarat ke halaman yang tidak dibaca tidak menghasilkan `ID … tidak terdaftar`.
  - `validateFile hanya melaporkan berkas itu`: halaman lain yang rusak tidak muncul.
  - `validateFile tetap menolak prasyarat ke halaman draf`: halaman terbit dengan prasyarat ke halaman draf teknologi lain → galat `masih draf` (halaman teknologi yang dirujuk ikut dibaca).
  - `validateFile untuk YAML teknologi tidak membaca halaman` (semua halaman `skipped`).
- [ ] **Step 2: Jalankan, pastikan gagal.**
- [ ] **Step 3: Implementasikan.** `loadProject` membaca berkas lewat `mapLimit(…, 32, …)`. Untuk halaman yang dilewati, `validateProject` menurunkan `tech` dari segmen kedua path (`<domain>/<tech>/…`) hanya untuk indeks ID, tanpa pemeriksaan halaman. `validateFile`: berkas halaman → baca frontmatter-nya, kumpulkan slug teknologi dari `prerequisites`, lalu muat proyek dengan halaman itu + semua halaman teknologi yang dirujuk; berkas `src/data/**` → `pages: () => false`. Hasil disaring ke berkas itu.
- [ ] **Step 4: Sambungkan.** `validate-edited.mjs` memakai `validateFile`. `validate-content.mjs <file…>` memakai `validateFile` per berkas; tanpa argumen tetap validasi penuh. Hook Stop tetap validasi penuh (sekali per giliran, jaring pengaman suntingan lewat shell).
- [ ] **Step 5: Jalankan.** `pnpm test`, lalu `pnpm validate src/content/docs/bahasa/python/index.mdx` → `0 galat`.
- [ ] **Step 6: Commit.** `git commit -m "perf: batasi I/O validasi dan fokuskan hook pada berkas yang diubah"`

### Task 7: Kerangka YAML teknologi (`new-tech`)

**Files:**
- Create: `src/lib/new-tech.ts`, `scripts/new-tech.mjs`, `tests/unit/new-tech.test.ts`
- Modify: `package.json` (skrip `new-tech`), `.claude/settings.json`

**Interfaces:**
- Produces: `DEFAULT_TEMPLATE: Record<TechType, TemplateId>` (aturan Task 2); `techSkeleton(input: { slug: string; name: string; domain: string; type: TechType; template?: TemplateId }): string`. CLI: `pnpm new-tech <slug> --name "<Nama>" --domain <id> --type <type> [--template <A–E>]` menulis `src/data/tech/<slug>.yaml`.

- [ ] **Step 1: Tulis tes yang gagal.**
  - `templat bawaan mengikuti jenis` (`language` → A, `database` → D, `standard` → E).
  - `kerangka berisi kolom berurutan`: urutan kunci hasil `parse` = `name, slug, type, domain, template, creator, firstRelease, license, website, docs, latestVersion, versionSource, requires, alternatives, tags, adoption, trend, metrics, useCases` (kolom opsional ditulis sebagai komentar `# creator: …`, bukan kunci).
  - `kerangka belum lolos skema sebelum GANTI diisi` (`website: GANTI` gagal `techSchema`).
  - CLI (lewat `execFileSync` di proyek sementara): menolak slug tak sah, domain tak dikenal, dan berkas yang sudah ada (keluar 1, berkas lama utuh).
- [ ] **Step 2–4: Gagal → implementasi → lolos.** Skrip membaca `domains.yaml` untuk memeriksa domain; tidak membuat folder MDX (itu urusan M3).
- [ ] **Step 5: Izin.** Tambahkan `Bash(pnpm new-tech *)` dan `PowerShell(pnpm new-tech *)` ke `permissions.allow`.
- [ ] **Step 6: Commit, PR.** `git commit -m "feat: tambah pembuat kerangka YAML teknologi"`; PR `m2/data-skala`.

---

## M2-D — Katalog, halaman domain, navigasi

### Task 8: Logika katalog

**Files:**
- Create: `src/lib/catalog.ts`, `tests/unit/catalog.test.ts`
- Modify: `src/lib/labels.ts`

**Interfaces:**
- Produces:

```ts
export type CatalogEntry = {
  slug: string; name: string; domain: string; domainName: string; domainOrder: number;
  type: TechType; stage: Stage; adoption?: Adoption; trend?: Trend; latestVersion?: string;
  useCases: string[]; tags: string[]; website: string; docs: string; href?: string;
};
export type CatalogFilters = { domain?: string; jenis?: TechType; tingkat?: Stage; adopsi?: Adoption; tren?: Trend; q?: string };
export function buildCatalog(input: { techs: Tech[]; domains: Domain[]; stages: Map<string, Stage>; hrefs: Map<string, string> }): CatalogEntry[];
export function parseFilters(search: string, domainIds: readonly string[]): CatalogFilters;
export function filtersToSearch(filters: CatalogFilters): string;
export function matchesFilters(entry: CatalogEntry, filters: CatalogFilters): boolean;
```

  `labels.ts`: `ADOPTION_LABELS` (`Arus utama`, `Mapan`, `Berkembang`, `Khusus`, `Warisan`), `TREND_LABELS` (`Naik`, `Stabil`, `Turun`).

- [ ] **Step 1: Tulis tes yang gagal.**
  - `katalog urut domain lalu nama` (`localeCompare` locale `id`); `href` hanya ada bila diberikan di `hrefs`.
  - `parseFilters mengabaikan nilai tak dikenal`: `?domain=tidak-ada&jenis=xx&tingkat=9` → `{}`.
  - `parseFilters menormalkan huruf dan memakai nilai pertama`: `?ADOPSI=x&adopsi=Mapan&adopsi=khusus` → `{ adopsi: 'mapan' }` (kunci peka huruf, nilai tidak).
  - `filtersToSearch berurutan tetap dan kosong tanpa filter`: `{ tren: 'naik', domain: 'bahasa' }` → `'?domain=bahasa&tren=naik'`; `{}` → `''`.
  - `pulang-pergi`: `parseFilters(filtersToSearch(f), ids)` sama dengan `f`.
  - `q mencocokkan nama, slug, dan tag tanpa peka huruf`: `q: 'PYT'` cocok dengan Python.
  - `entri tanpa adoption tidak lolos filter adopsi`.
- [ ] **Step 2–4: Gagal → implementasi → lolos.** Urutan kunci query: `domain, jenis, tingkat, adopsi, tren, q`.
- [ ] **Step 5: Commit.** `git commit -m "feat: tambah logika katalog dan filter"`

### Task 9: Kartu katalog dan halaman domain

**Files:**
- Create: `src/components/CatalogCard.astro`, `src/components/AdoptionBadge.astro`, `src/components/TrendBadge.astro`, `src/pages/[domain]/index.astro`, `src/data/tech/uji-terdaftar.yaml`, `tests/e2e/domain.spec.ts`
- Modify: `src/lib/schemas.ts`, `src/lib/data.ts`, `src/components/TechCard.astro`, `src/styles/base.css`, `src/data/tech/uji-komponen.yaml`, `tests/unit/schemas.test.ts`, `tests/unit/data.test.ts`

**Interfaces:**
- Consumes: `buildCatalog`, label Task 8.
- Produces: `isFixtureTech(slug: string): boolean` (= berawalan `uji-`) menggantikan konstanta `FIXTURE_TECH` di `schemas.ts`, `data.ts`, dan tes; semua penyaring teknologi uji (build, katalog, OG, pemantau) memakainya. `getAllDomains(): Promise<Domain[]>` (urut `order`), `getCatalog(): Promise<CatalogEntry[]>` (di-cache; `stages` dari `getStage`, `hrefs` dari `getIdIndex` hanya untuk tahap ≥ 1; tanpa teknologi uji kecuali `DEVMECUM_FIXTURES=1`). `<CatalogCard entry={CatalogEntry} />` merender `<article class="dm-catalog-card" data-slug data-domain data-jenis data-tingkat data-adopsi data-tren>` berisi `<h3>` nama (tautan bila `href`), `StageBadge`, `AdoptionBadge`, `TrendBadge`, baris `jenis · domain · versi`, sampai tiga `useCases`, tautan "Situs resmi" dan "Dokumentasi". Atribut data inilah yang dibaca filter Task 10.

- [ ] **Step 1: Fixture.** `uji-komponen.yaml`: `adoption: khusus` dan `trend: turun` dengan komentar `# data uji`. Fixture kedua `uji-terdaftar.yaml` (nama "Uji Terdaftar", domain `fondasi`, `type: tool`, templat C, `adoption: mapan`, `trend: naik`, tanpa halaman) mewakili teknologi tingkat 0. Ubah `FIXTURE_TECH` menjadi `isFixtureTech` beserta tesnya (`deriveDraft` dan `getAllTech` menyaring keduanya bila `DEVMECUM_FIXTURES` bukan `1`).
- [ ] **Step 2: Tulis tes e2e yang gagal** (`domain.spec.ts`):
  - `setiap domain punya halaman`: baca `src/data/domains.yaml`; tiap `/<id>/` → status 200 dan `h1` = `name`.
  - `halaman domain memuat kartu teknologinya`: `/fondasi/` memuat kartu "Uji Komponen" bertautan `/fondasi/uji-komponen/` dan lencana `Khusus` serta `Turun`; `/bahasa/` memuat Python bertautan `/bahasa/python/`.
  - `teknologi tingkat 0 tampil tanpa tautan`: kartu `[data-slug="uji-terdaftar"]` memuat lencana `Terdaftar` dan judulnya bukan tautan.
  - `kartu dikelompokkan per jenis`: di `/fondasi/` ada `h2` "Konsep".
  - `halaman domain menautkan katalog berfilter`: tautan ke `/katalog/?domain=fondasi`.
- [ ] **Step 3: Jalankan, pastikan gagal.** `pnpm test:e2e` → 404.
- [ ] **Step 4: Implementasikan.** Halaman domain: `getStaticPaths` dari koleksi `domains`; `StarlightPage` dengan `frontmatter: { title: domain.name, description: domain.description }` dan `headings` per grup jenis; isi: deskripsi, jumlah teknologi, tautan katalog berfilter, grup per jenis (`TYPE_LABELS`) berisi `CatalogCard`. Domain tanpa teknologi menampilkan "Belum ada teknologi terdaftar di domain ini." Lencana adopsi dan tren memakai gaya lencana yang ada, dan lolos kontras di keempat tema. `TechCard` mendapat baris "Adopsi" dan "Tren" (lencana, hanya bila terisi).
- [ ] **Step 5: Jalankan.** `pnpm check; pnpm test; pnpm test:e2e` → lolos.
- [ ] **Step 6: Commit.** `git commit -m "feat: tambah halaman domain dan kartu katalog"`

### Task 10: Halaman katalog berfilter

**Files:**
- Create: `src/pages/katalog.astro`, `src/components/CatalogFilter.astro`, `tests/e2e/katalog.spec.ts`
- Modify: `src/styles/base.css`

**Interfaces:**
- Consumes: `getCatalog`, `getAllDomains`, `CatalogCard`, `parseFilters`, `filtersToSearch`, `matchesFilters`.
- Produces: `/katalog/`. `<dm-catalog-filter>` membungkus `<form hidden>` berisi `<select>` berlabel **Domain**, **Jenis**, **Kematangan**, **Adopsi**, **Tren** (opsi pertama "Semua"), `<input type="search">` berlabel **Cari nama**, tombol **Atur ulang**, dan wilayah `aria-live="polite"` berteks `Menampilkan N dari M teknologi`.

- [ ] **Step 1: Tulis tes e2e yang gagal** (`katalog.spec.ts`), dengan `CARD = 'article.dm-catalog-card'`:
  - `tanpa JavaScript semua kartu tampil` (konteks `javaScriptEnabled: false`): jumlah kartu terlihat = jumlah kartu; formulir tidak terlihat.
  - `filter kematangan`: Kematangan "Terdaftar" → hanya `uji-terdaftar` (dan entri nyata tingkat 0) terlihat; Python tersembunyi.
  - `filter domain menyaring kartu dan URL`: pilih Domain "Fondasi" → kartu `[data-slug="uji-komponen"]` terlihat, `[data-slug="python"]` tersembunyi, URL berakhiran `?domain=fondasi`, teks penghitung berubah.
  - `filter dari URL diterapkan saat dimuat`: `/katalog/?adopsi=khusus` → select Adopsi bernilai `khusus`, Python tersembunyi.
  - `nilai tak dikenal diabaikan`: `/katalog/?domain=tidak-ada` → semua kartu terlihat, select Domain bernilai `''`, tidak ada `pageerror`.
  - `cari nama`: ketik "pyt" → hanya Python terlihat; **Atur ulang** → semua terlihat, URL `/katalog/`.
  - `tanpa hasil`: kombinasi tanpa cocokan menampilkan "Tidak ada teknologi yang cocok dengan filter ini."
- [ ] **Step 2: Jalankan, pastikan gagal.**
- [ ] **Step 3: Implementasikan.** Kartu dirender di server dalam satu daftar. Custom element: saat terhubung, buka `hidden` pada formulir, terapkan `parseFilters(location.search, domainIds)` ke kontrol dan kartu; pada `input`/`change` menyembunyikan kartu yang tidak cocok (dibaca dari atribut data kartu), memperbarui penghitung, dan `history.replaceState` dengan `filtersToSearch`. Pilihan Jenis hanya jenis yang ada di katalog. Halaman tanpa daftar isi (`tableOfContents: false`).
- [ ] **Step 4: Jalankan.** `pnpm check; pnpm test:e2e` → lolos.
- [ ] **Step 5: Commit.** `git commit -m "feat: tambah halaman katalog berfilter"`

### Task 11: Sidebar dan remah roti ke domain dan katalog (K7 M1)

**Files:**
- Modify: `src/lib/sidebar.ts`, `src/routeData.ts`, `src/overrides/PageTitle.astro`, `src/components/Breadcrumb.astro`, `tests/unit/sidebar.test.ts`, `tests/e2e/navigasi.spec.ts`

**Interfaces:**
- Produces: `siteSidebar(currentHref: string, domains: { id: string; name: string }[]): SidebarEntry[]` = `[Beranda '/', Katalog '/katalog/', grup "Domain" (terbuka) berisi tautan tiap domain]`, menggantikan `homeSidebar`. `buildTechSidebar({ techName, template, pages, currentHref, domain: { id, name } })` = `[Beranda, Katalog, tautan <nama domain> '/<id>/', grup teknologi]`.
- Middleware tetap satu-satunya tempat sidebar diatur; `StarlightPage` juga menjalankannya (diperiksa di `dist/components/StarlightPage.astro` Starlight 0.43.1: `attachRouteDataAndRunMiddleware`).

- [ ] **Step 1: Ubah tes.** `sidebar.test.ts`: bentuk dua fungsi di atas, `isCurrent` pada Katalog saat `currentHref = '/katalog/'`. `navigasi.spec.ts`: href sidebar di halaman uji menjadi `['/', '/katalog/', '/fondasi/', TECH, USANG, DIAGRAM]`; tes baru `sidebar katalog memuat semua domain` (18 tautan domain + Katalog `aria-current="page"`); `remah roti menautkan domain` (`/fondasi/`).
- [ ] **Step 2: Jalankan, pastikan gagal.**
- [ ] **Step 3: Implementasikan.** Remah roti: domain kini bertautan; perbarui komentar "Domain belum berupa tautan".
- [ ] **Step 4: Jalankan.** `pnpm test; pnpm test:e2e` → lolos.
- [ ] **Step 5: Commit.** `git commit -m "feat: sidebar dan remah roti menautkan domain dan katalog"`

### Task 12: Anggaran file dan penjaga build

**Files:**
- Modify: `src/pages/og/[tech].png.ts`, `scripts/assert-no-fixtures.mjs`, `src/lib/budget.ts`, `scripts/count-files.mjs`, `tests/unit/budget.test.ts`, `tests/e2e/a11y.spec.ts`, `tests/e2e/seo.spec.ts`, `lighthouserc.json`

**Interfaces:**
- Produces: `Scan` mendapat `byTopDir: Record<string, number>` (folder tingkat pertama; berkas di akar dihitung sebagai `.`).

- [ ] **Step 1: Tulis tes yang gagal.**
  - `budget.test.ts`: `scanDir menghitung per folder teratas` → `{ '.': 1, pagefind: 2, og: 1 }` untuk pohon contoh.
  - `seo.spec.ts`: `gambar OG hanya untuk teknologi berhalaman` → `/og/uji-komponen.png` 200; `/og/uji-terdaftar.png` 404 (fixture tingkat 0 dari Task 9).
  - `a11y.spec.ts`: tambah `/katalog/`, `/fondasi/`, `/bahasa/python/` ke daftar halaman axe (ditunda dari M1).
- [ ] **Step 2: Jalankan, pastikan gagal.**
- [ ] **Step 3: Implementasikan.** OG: `getStaticPaths` hanya untuk teknologi dengan tahap ≥ 1. `assert-no-fixtures.mjs` juga memastikan tidak ada `dist/og/uji-*.png`, dan `dist/katalog/index.html`, `dist/fondasi/index.html`, serta semua `dist/sitemap*.xml` tidak memuat `data-slug="uji-` maupun `/uji-` (ditunda dari M1). `count-files.mjs` mencetak lima folder teratas. `lighthouserc.json`: tambah `http://localhost/katalog/`.
- [ ] **Step 4: Jalankan rantai lengkap** (PowerShell): `pnpm check; if ($?) { pnpm test }; if ($?) { pnpm validate }; if ($?) { pnpm build }; if ($?) { node scripts/assert-no-fixtures.mjs }; if ($?) { pnpm budget }; if ($?) { pnpm test:e2e }; if ($?) { pnpm lhci }` → semua lolos; catat jumlah file dan waktu build di ledger sebagai garis dasar.
- [ ] **Step 5: Commit, PR.** `git commit -m "feat: batasi gambar OG dan perketat penjaga build"`; PR `m2/katalog`. 👤 Pemilik meninjau tampilan katalog dan halaman domain di pratinjau (§14: rancangan visual katalog dilihat pemilik).

---

## M2-E — Pemantau

### Task 13: Versi dan registri

**Files:**
- Create: `src/lib/versions.ts`, `src/lib/registries.ts`, `tests/unit/versions.test.ts`, `tests/unit/registries.test.ts`

**Interfaces:**
- Produces (`versions.ts`): `parseVersion(raw: string): number[] | undefined` (deret angka pertama, `'v3.15.2'` → `[3, 15, 2]`); `isPrerelease(raw: string): boolean`; `compareVersions(a: string, b: string): number`; `pickLatest(candidates: readonly string[], tagPattern?: string): string | undefined` (dengan pola: hanya yang cocok penuh, versi = grup tangkapan digabung titik; tanpa pola: buang prarilis; hasil teks bernomor, mis. `'3.15.2'`); `seriesMatches(techVersion: string, latest: string): boolean` (`'3.15'` vs `'3.15.3'` → true; vs `'3.16.0'` → false; `'3.x'` hanya membandingkan mayor).
- Produces (`registries.ts`): `type Deps = { fetch: typeof fetch; gitTags: (repoUrl: string) => Promise<string[]>; githubToken?: string }`; `type Result<T> = { ok: true; value: T } | { ok: false; error: string }`; `fetchLatestVersion(source: VersionSource, deps: Deps): Promise<Result<string>>`; `fetchStars(repo: string, deps: Deps): Promise<Result<number>>`; `fetchDownloads(d: { registry: DownloadRegistry; name: string }, deps: Deps): Promise<Result<{ value: number; period: 'minggu' | '90-hari' }>>`; `defaultDeps(): Deps` (fetch asli dengan `User-Agent` dan `AbortSignal.timeout(15_000)`, `gitTags` = `git ls-remote --tags --refs <url>`, token dari `GITHUB_TOKEN`).

  Titik akhir: npm `https://registry.npmjs.org/<nama>/latest` → `version`; PyPI `https://pypi.org/pypi/<nama>/json` → `info.version`; crates `https://crates.io/api/v1/crates/<nama>` → `crate.max_stable_version` (unduhan: `crate.recent_downloads`, `90-hari`); Maven `https://repo1.maven.org/maven2/<grup/sebagai/path>/<artefak>/maven-metadata.xml` → semua `<version>` lewat `pickLatest`; GitHub tanpa pola `https://api.github.com/repos/<repo>/releases/latest` → `tag_name` (404 → galat `tidak punya GitHub Release; tambahkan tagPattern`); GitHub dengan pola → `gitTags('https://github.com/<repo>.git')`; bintang `https://api.github.com/repos/<repo>` → `stargazers_count`; unduhan npm `https://api.npmjs.org/downloads/point/last-week/<nama>` → `downloads`; PyPI `https://pypistats.org/api/packages/<nama>/recent` → `data.last_week`.

- [ ] **Step 1: Tulis tes yang gagal** (fetch dan `gitTags` palsu; tanpa jaringan):
  - `isPrerelease`: true untuk `3.16.0a1`, `v3.15.0rc3`, `7.0.0-rc.1`, `6.0.0-M1`, `2.0.0-beta.2`, `19.3.0-canary-abc`, `1.0.0.dev1`, `5.0.0-preview.3`; false untuk `3.15.2`, `v19.2.0`, `go1.25.3`, `REL_17_2`.
  - `pickLatest tanpa pola membuang prarilis`: `['v3.15.2', 'v3.16.0a1', 'v3.15.10']` → `'3.15.10'`.
  - `pickLatest dengan pola`: `['REL_17_2', 'REL_16_6', 'REL_18_BETA1']`, pola `'^REL_(\\d+)_(\\d+)$'` → `'17.2'`.
  - `compareVersions` numerik (`'3.10' > '3.9'`); `seriesMatches` kasus di atas.
  - Per jenis sumber: jawaban contoh → nilai yang benar; npm bercakupan (`@astrojs/starlight`) membentuk URL yang benar.
  - `galat HTTP tidak dilempar`: status 429 → `{ ok: false, error: 'HTTP 429' }`; fetch yang menolak (timeout) → `ok: false` berisi pesannya.
  - `token GitHub dikirim bila ada` (header `Authorization: Bearer …`).
- [ ] **Step 2–4: Gagal → implementasi → lolos.**
- [ ] **Step 5: Coba sungguhan sekali** (`node -e` memakai `defaultDeps()`): `python` (tag, pola `^v(\d+)\.(\d+)\.(\d+)$`), `@astrojs/starlight` (npm), `requests` (PyPI), `serde` (crates), `org.springframework.boot:spring-boot` (Maven), `facebook/react` (Release). Expected: enam versi stabil; catat di ledger.
- [ ] **Step 6: Commit.** `git commit -m "feat: tambah pembaca versi dari registri dan tag Git"`

### Task 14: `pnpm versions`

**Files:**
- Create: `src/lib/version-report.ts`, `scripts/check-versions.mjs`, `tests/unit/version-report.test.ts`
- Modify: `package.json` (skrip `versions`), `.claude/settings.json`

**Interfaces:**
- Consumes: `fetchLatestVersion`, `pickLatest`, `seriesMatches`, `mapLimit`, `loadProject`.
- Produces: `type VersionCheck = { slug: string; name: string; source: string; current?: string; latest?: string; status: 'mutakhir' | 'tertinggal' | 'gagal' | 'tanpa-sumber'; error?: string; pagesToReview: string[] }`; `classifyVersion(current: string | undefined, result: Result<string> | undefined): Pick<VersionCheck, 'status' | 'latest' | 'error'>`; `renderVersionReport(checks: VersionCheck[], date: Date): { markdown: string; findings: boolean }`; `setLatestVersion(yamlText: string, version: string, note: string): string`. CLI: `pnpm versions [slug…] [--write] [--report <berkas>]`.

- [ ] **Step 1: Tulis tes yang gagal.**
  - `classifyVersion`: sama → `mutakhir`; lebih lama → `tertinggal`; galat → `gagal` (tidak pernah `tertinggal`); tanpa sumber → `tanpa-sumber`.
  - `setLatestVersion` pada isi `python.yaml` saat ini: hanya baris `latestVersion` yang berbeda, menjadi `latestVersion: "3.15.3" # dari GitHub python/cpython (tag) per 23 November 2026`; kolom `{ kind: github, … }` dan komentar kepala utuh.
  - `setLatestVersion` mempertahankan CRLF: masukan ber-`\r\n` → keluaran ber-`\r\n` dan tidak ada `\n` tunggal.
  - `setLatestVersion` menyisipkan baris sesudah `docs:` bila `latestVersion` belum ada.
  - `renderVersionReport`: memuat tabel `Tertinggal` (slug, sekarang → terbaru, sumber), `Gagal diperiksa` (slug, galat), `Halaman yang perlu ditinjau` (path), dan petunjuk `pnpm versions --write`; `findings` false bila tidak ada `tertinggal` dan `gagal`.
- [ ] **Step 2: Jalankan, pastikan gagal.**
- [ ] **Step 3: Implementasikan.** `setLatestVersion` mengganti baris secara tekstual (regex baris `^latestVersion:` di tingkat atas), bukan serialisasi ulang dokumen: paket `yaml` menulis ulang gaya `{ … }` (dicoba 16 November 2026). Skrip melewati teknologi uji, memakai `mapLimit(…, 6, …)`, mengisi `pagesToReview` dari halaman teknologi itu yang `techVersion`-nya tidak `seriesMatches`. `--write` hanya mengubah entri `tertinggal`, dengan catatan `dari <sumber> per <formatDate(today())>`. `--report` menulis Markdown dan, bila `GITHUB_OUTPUT` disetel, menambahkan `findings=<true|false>`. Kode keluar: 1 hanya bila slug disebut eksplisit dan ada yang `gagal`; selain itu 0.
- [ ] **Step 4: Jalankan.** `pnpm test`; `pnpm versions python` → tabel satu baris berstatus `mutakhir` atau `tertinggal` (bukan `gagal`).
- [ ] **Step 5: Izin.** `Bash(pnpm versions *)`, `PowerShell(pnpm versions *)`.
- [ ] **Step 6: Commit.** `git commit -m "feat: tambah pemeriksa versi dan penulis latestVersion"`

### Task 15: Issue bergulir dan workflow pemantau

**Files:**
- Create: `src/lib/rolling-issue.ts`, `scripts/rolling-issue.mjs`, `tests/unit/rolling-issue.test.ts`, `.github/workflows/pemantau.yml`

**Interfaces:**
- Produces: `planIssueAction(open: { number: number } | undefined, findings: boolean): { kind: 'create' } | { kind: 'edit'; number: number } | { kind: 'close'; number: number } | { kind: 'none' }`. CLI: `node scripts/rolling-issue.mjs --label <label> --title "<judul>" --body-file <berkas> --findings <true|false> [--dry-run]`.

- [ ] **Step 1: Tulis tes yang gagal**: empat kombinasi `planIssueAction` (temuan tanpa issue → `create`; temuan dengan issue → `edit`; tanpa temuan dengan issue → `close`; tanpa keduanya → `none`).
- [ ] **Step 2–4: Gagal → implementasi → lolos.** Skrip memanggil `gh` lewat `execFileSync`: `gh label create <label> --force`, `gh issue list --label <label> --state open --json number --limit 1`, lalu `create` / `edit --body-file` / `edit` + `close --comment "Semua beres per <tanggal>."`. `--dry-run` hanya mencetak perintah.
- [ ] **Step 5: Tulis `pemantau.yml`.** Pemicu `schedule` `cron: "0 1 * * 1"` dan `workflow_dispatch`; `permissions: { contents: read, issues: write }`; job `versi`: pasang seperti `deploy.yml` (tanpa Chromium) → `pnpm versions --report laporan-versi.md` (id `versi`, env `GITHUB_TOKEN`) → `node scripts/rolling-issue.mjs --label pemantau-versi --title "Pemantau versi" --body-file laporan-versi.md --findings ${{ steps.versi.outputs.findings }}` (env `GH_TOKEN`).
- [ ] **Step 6: Verifikasi lokal.** `pnpm versions --report laporan.md` lalu `node scripts/rolling-issue.mjs … --dry-run` → mencetak perintah `gh` yang masuk akal. Workflow baru bisa dijalankan manual sesudah ada di `main` (Task 21).
- [ ] **Step 7: Commit.** `git commit -m "feat: tambah workflow pemantau dengan issue bergulir"`

### Task 16: Metrik popularitas

**Files:**
- Create: `src/lib/metrics.ts`, `scripts/update-metrics.mjs`, `src/components/Popularity.astro`, `tests/unit/metrics.test.ts`, `tests/fixtures/metrics.json`
- Modify: `src/lib/data.ts`, `src/components/TechCard.astro`, `src/components/CatalogCard.astro`, `scripts/build-uji.mjs`, `.github/workflows/deploy.yml`, `.gitignore`, `package.json` (skrip `metrics`), `.claude/settings.json`, `tests/e2e/komponen.spec.ts`, `tests/e2e/katalog.spec.ts`

**Interfaces:**
- Produces:

```ts
export type TechMetrics = {
  github?: { stars: number; date: string };
  downloads?: { registry: DownloadRegistry; period: 'minggu' | '90-hari'; value: number; date: string };
};
export type MetricsFile = { generated: string; tech: Record<string, TechMetrics> };
export function mergeMetrics(previous: MetricsFile | undefined, fresh: Record<string, TechMetrics>, generated: string): MetricsFile;
export function formatCompact(value: number): string;   // Intl id-ID, notation compact, maksimum 1 desimal
export function readMetricsFile(path: string): MetricsFile | undefined;  // tidak pernah melempar
```

  `data.ts`: `getMetrics(slug: string): Promise<TechMetrics | undefined>` membaca `process.env.DEVMECUM_METRICS_FILE ?? 'src/data/metrics/metrics.json'` sekali. `<Popularity slug compact? />`.

- [ ] **Step 1: Tulis tes yang gagal.**
  - `formatCompact`: `999` → `'999'`, `12345` → `'12,3 rb'`, `2500000` → `'2,5 jt'`, `1500000000` → `'1,5 M'` (keluaran Node 26 diperiksa 16 November 2026).
  - `mergeMetrics mempertahankan nilai lama per kolom` bila kolom itu tidak ada di `fresh`; nilai baru menimpa yang lama.
  - `readMetricsFile`: berkas tak ada → `undefined`; JSON rusak → `undefined`; bentuk salah (tanpa `tech`) → `undefined`.
  - e2e `komponen.spec.ts`: halaman Ringkasan uji menampilkan `12,3 rb` bintang GitHub dan `2,5 jt` unduhan npm per minggu, beserta tanggal datanya; `katalog.spec.ts`: kartu uji memuat `12,3 rb`.
- [ ] **Step 2: Jalankan, pastikan gagal.**
- [ ] **Step 3: Implementasikan.** `tests/fixtures/metrics.json` berisi data `uji-komponen` (`stars: 12345`, unduhan npm `2500000`, tanggal `2026-11-15`); `build-uji.mjs` menyetel `DEVMECUM_METRICS_FILE` ke berkas itu. `update-metrics.mjs` membaca entri ber-`metrics` (tanpa teknologi uji), memakai `mapLimit(…, 6, …)`, menggabungkan dengan berkas lama bila ada, menulis `src/data/metrics/metrics.json`, mencetak jumlah berhasil/gagal, dan keluar 0 walau ada yang gagal (1 hanya bila berkas tidak bisa ditulis). `Popularity` menampilkan angka + label + `per <tanggal>`, dan baris survei dari `surveys` (nama, tahun, nilai, tautan) di `TechCard`; tidak merender apa pun tanpa data. `.gitignore`: `src/data/metrics/`. `deploy.yml`: langkah **Ambil metrik** (`pnpm metrics`, env `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`) sebelum **Build produksi**.
- [ ] **Step 4: Jalankan.** `pnpm test; pnpm test:e2e`; lalu `pnpm build` tanpa berkas metrik → sukses dan tanpa angka popularitas (Review Focus 1).
- [ ] **Step 5: Izin.** `Bash(pnpm metrics)`, `PowerShell(pnpm metrics)`.
- [ ] **Step 6: Commit.** `git commit -m "feat: tampilkan bintang GitHub dan unduhan paket dari data deploy"`

### Task 17: Pemeriksa tautan eksternal

**Files:**
- Create: `src/lib/links.ts`, `scripts/check-links.mjs`, `tests/unit/links.test.ts`
- Modify: `.github/workflows/pemantau.yml`, `package.json` (skrip `links`), `.claude/settings.json`

**Interfaces:**
- Produces: `extractLinks(body: string): string[]` (URL `https` dari tautan Markdown, `<https://…>`, dan atribut `href="https://…"`; unik; tanda baca penutup dibuang); `type LinkStatus = 'ok' | 'pindah' | 'mati' | 'tak-pasti'`; `classifyLink(r: { status?: number; location?: string; errorCode?: string }): LinkStatus`; `renderLinkReport(results: { url: string; status: LinkStatus; detail: string; files: string[] }[], date: Date): { markdown: string; findings: boolean }`. CLI: `pnpm links [berkas…] [--report <berkas>] [--no-fail]`.

- [ ] **Step 1: Tulis tes yang gagal.**
  - `extractLinks` dari contoh MDX: tautan Markdown, autolink, `href`; abaikan `http://`, path internal, dan URL di dalam blok kode berpagar.
  - `classifyLink`: 200 → `ok`; 301/308 dengan `location` ke URL lain → `pindah`; 404, 410, `ENOTFOUND`, `ECONNREFUSED` → `mati`; 401, 403, 429, 5xx, `ETIMEDOUT`, `AbortError` → `tak-pasti`.
  - `renderLinkReport`: `findings` true bila ada `mati` atau `pindah`; `tak-pasti` dicantumkan terpisah dan tidak dihitung.
- [ ] **Step 2–4: Gagal → implementasi → lolos.** Skrip mengumpulkan URL dari YAML teknologi (`website`, `docs`, `surveys[].url`) dan halaman (`sources` + isi), tanpa domain situs sendiri; `HEAD` dengan `redirect: 'manual'`, ulang dengan `GET` bila 403/405/501; `mapLimit(…, 6, …)`. Tanpa argumen memeriksa semuanya; dengan argumen hanya berkas itu. Kode keluar 1 bila ada `mati`, kecuali `--no-fail`. `--report` menulis Markdown + `findings` ke `GITHUB_OUTPUT`.
- [ ] **Step 5: Job `tautan`** di `pemantau.yml`: `pnpm links --no-fail --report laporan-tautan.md` → rolling issue label `tautan-eksternal`, judul "Tautan eksternal bermasalah".
- [ ] **Step 6: Jalankan sungguhan.** `pnpm links` → semua tautan Python dan data `ok` atau `tak-pasti`; catat hasil di ledger.
- [ ] **Step 7: Izin, commit, PR.** `Bash(pnpm links *)`, `PowerShell(pnpm links *)`; `git commit -m "feat: tambah pemeriksa tautan eksternal terjadwal"`; PR `m2/pemantau`.

---

## M2-F — Jalur pendaftaran

### Task 18: Skill `daftar-teknologi`

> **Gerbang:** rubrik (Task 1) dan daftar katalog (Task 2) sudah disetujui pemilik, dan M2-C sampai M2-E sudah di-merge.

**Files:**
- Create: `.claude/skills/daftar-teknologi/SKILL.md`

**Interfaces:**
- Consumes: `docs/katalog.md`, `docs/rubrik-adopsi.md`, `pnpm new-tech`, `pnpm versions <slug…> --write`, `pnpm links <berkas…>`, `pnpm validate`.

- [ ] **Step 1: Tulis skill.** Frontmatter: `name: daftar-teknologi`, `description: Gunakan saat diminta mendaftarkan teknologi ke katalog Devmecum (tingkat 0) dari docs/katalog.md, misalnya "/daftar-teknologi bahasa" atau "/daftar-teknologi typescript go". Argumen berupa id domain atau daftar slug.` Gaya dan susunan mengikuti dua skill yang ada (Langkah, Bila izin ditolak, Mode tanpa antarmuka). Isi langkahnya:
  1. Cabang `konten/katalog-<n>-<kelompok>` (atau yang sedang dipakai); pilih entri dari `docs/katalog.md` yang belum punya YAML.
  2. Per entri: `pnpm new-tech …` sesuai baris daftar, lalu isi dari **sumber resmi** (situs, dokumentasi, registri, repo): `website`, `docs`, `license` (SPDX bila ada), `versionSource` (+ `tagPattern` bila tag), `metrics`, `tags`, `useCases` (2–4 frasa Indonesia pendek); `creator` dan `firstRelease` hanya bila sumber resmi menyebutnya, dengan komentar `# sumber: <URL>`; `requires` hanya slug yang sudah terdaftar; `alternatives` dari daftar katalog; `adoption` dan `trend` menurut rubrik dengan komentar bukti (K10).
  3. Isi `latestVersion` dengan `pnpm versions <slug…> --write`, bukan dari ingatan.
  4. `pnpm validate` (tanpa galat), `pnpm links src/data/tech/<slug>.yaml …` (tanpa `mati`).
  5. Commit per domain: `docs: daftarkan teknologi <domain>`. PR berisi tabel entri + nilai adopsi/tren untuk ditinjau.
  - Aturan: jangan menulis prosa halaman; jangan menebak fakta (kosongkan kolom opsional); entri yang sumber resminya tidak jelas dilaporkan, bukan didaftarkan.
- [ ] **Step 2: Verifikasi pemuatan.** Sesi `claude` baru mengenali `daftar-teknologi`.
- [ ] **Step 3: Commit, PR.** `git commit -m "docs: tambah skill daftar-teknologi"`; PR `m2/jalur-katalog`.

---

## M2-G — Pendaftaran katalog

### Task 19: Gladi resik pendaftaran

**Files:**
- Create: `src/data/tech/{typescript,go,kompleksitas-big-o}.yaml`
- Modify: `src/data/tech/python.yaml`, `src/content/docs/index.mdx`

- [ ] **Step 1: Jalankan `/daftar-teknologi typescript go kompleksitas-big-o`** di cabang `konten/katalog-1-fondasi-bahasa`. Tiga bentuk berbeda: npm, tag Git berpola (`^go(\d+)\.(\d+)(?:\.(\d+))?$`), dan konsep tanpa versi.
- [ ] **Step 2: Lengkapi Python**: `adoption`, `trend` dengan bukti, dan `tagPattern: '^v(\d+)\.(\d+)\.(\d+)$'`.
- [ ] **Step 3: Beranda**: tambah tombol hero kedua "Jelajahi katalog" → `/katalog/`, dan ubah kalimat status beranda.
- [ ] **Step 4: Ukur.** Catat waktu dan perkiraan kuota per entri di ledger (§11.8: biaya diukur sebelum produksi massal).
- [ ] **Step 5 (👤): Pemilik meninjau** ketiga entri dan nilai adopsinya. Temuan untuk skill diperbaiki di PR terpisah `m2/perbaikan-jalur-katalog` sebelum Task 20.

### Task 20: Pendaftaran per kelompok

Setiap baris = satu PR `konten/katalog-<n>-<kelompok>`, dikerjakan dengan `/daftar-teknologi <domain>` per domain (satu sesi bisa satu atau beberapa domain). Urutan dipilih supaya `requires` selalu menunjuk teknologi yang sudah terdaftar.

| n | Kelompok | Domain |
|---|---|---|
| 1 | fondasi-bahasa | `fondasi`, `bahasa` (lanjutan Task 19) |
| 2 | web | `web-frontend`, `web-backend` |
| 3 | aplikasi-data | `mobile`, `desktop`, `database` |
| 4 | data-ai | `data`, `ai-ml`, `genai` |
| 5 | infrastruktur | `cloud`, `devops`, `keamanan` |
| 6 | praktik | `arsitektur`, `testing`, `tools`, `game`, `embedded` |

- [ ] **Step 1 per kelompok: daftarkan** semua entri kelompok itu di `docs/katalog.md`.
- [ ] **Step 2 per kelompok: periksa.** `pnpm validate` → 0 galat; `pnpm versions <slug kelompok>` → tidak ada `gagal`; `pnpm links <berkas kelompok>` → tidak ada `mati`.
- [ ] **Step 3 per kelompok: PR**, CI hijau, 👤 tinjauan acak pemilik (§10), merge.
- [ ] **Step 4 (sesudah kelompok 6):** jumlah `src/data/tech/*.yaml` di luar `uji-*` ≥ 300 (`node -e` penghitung), dan sama dengan daftar katalog.

---

## M2-H — Penutup

### Task 21: Perketat validasi dan catat ukuran

**Files:**
- Modify: `src/lib/validate.ts`, `tests/unit/validate.test.ts`, `README.md`, `CLAUDE.md`, `docs/superpowers/specs/2026-11-14-buku-panduan-teknologi-design.md` (§8.3 struktur proyek)

- [ ] **Step 1: Ubah tes.** `alternatives yang tidak terdaftar` dan `adoption atau trend kosong` kini `severity: 'error'` (K11).
- [ ] **Step 2: Jalankan, pastikan gagal; implementasikan; jalankan.** `pnpm test; pnpm validate` → 0 galat, 0 peringatan pada data nyata.
- [ ] **Step 3: Ukur.** `pnpm build` (catat waktu), `pnpm budget` (catat jumlah file dan lima folder teratas), bandingkan dengan garis dasar Task 12 di ledger. Bila waktu build naik lebih dari dua kali lipat, catat sebagai temuan untuk M3 (catatan skala Task 13 M1: sidebar bawaan Starlight).
- [ ] **Step 4: Dokumen.** README: perintah `pnpm validate`, `pnpm versions`, `pnpm links`, `pnpm metrics`, `pnpm new-tech`, dan tautan rencana M2. CLAUDE.md: tambah empat perintah itu di bagian Perintah. Rancangan §8.3: `pemantau.yml` menggantikan `versions.yml`/`metrics.yml` (K6), skrip baru.
- [ ] **Step 5: Commit, PR, merge (👤).** `git commit -m "feat: perketat validasi katalog lengkap"`; PR `m2/penutup`.
- [ ] **Step 6: Verifikasi tayang.** Situs: `/katalog/` memuat ≥ 300 kartu; `/<domain>/` untuk 18 domain → 200; filter berjalan. Jalankan `gh workflow run pemantau.yml` dan `gh run watch`; Expected: dua job hijau dan issue `pemantau-versi`/`tautan-eksternal` dibuat atau tidak sesuai temuan. Catat semuanya di ledger.
