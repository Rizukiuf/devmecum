# Devmecum M0 + M1 — Rencana Pelaksanaan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyiapkan lingkungan kerja (M0), lalu menayangkan situs Devmecum dengan kerangka aplikasi lengkap dan satu topik (Python) yang ditulis sampai tingkat Ringkasan lewat jalur produksi konten (M1).

**Architecture:** Situs statis Astro + Starlight. Semua aturan (skema, ID, tingkat kematangan, kemutakhiran, sidebar, validasi) ditulis sebagai fungsi murni di `src/lib/*.ts` yang dipakai bersama oleh build Astro dan skrip Node, sehingga satu aturan hanya punya satu implementasi. Tampilan diubah lewat route middleware dan empat override komponen Starlight; konten hanya berupa YAML + MDX. CI di GitHub Actions membangun, menguji, lalu mengunggah hasil build ke Cloudflare Workers Static Assets.

**Tech Stack:** Astro 7.4, Starlight 0.43, TypeScript 6.0, Node 26 LTS, pnpm 10, Zod (lewat `astro/zod`), Vitest 5, Playwright 1.65, axe-core, Lighthouse CI, Wrangler 4, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-14-buku-panduan-teknologi-design.md` — pelaksana membaca keduanya. Nomor bagian di rencana ini (mis. §5.3) merujuk ke rancangan itu.

## Global Constraints

- **Windows + CI Linux.** Semua skrip dan perintah hooks adalah skrip Node (`node scripts/…`), tanpa bash. `git config core.autocrlf` di komputer pemilik bernilai `true`, jadi akhir baris dikunci lewat `.gitattributes`.
- **Versi dikunci** (stabil terbaru per 15 November 2026, pasang dengan versi persis): `astro@7.4.12`, `@astrojs/starlight@0.43.1`, `@astrojs/check@0.9.12`, `typescript@6.0.3`, `vitest@5.1.0`, `@playwright/test@1.65.1`, `playwright@1.65.1`, `@axe-core/playwright@4.14.0`, `@lhci/cli@0.16.1`, `wrangler@4.162.0`, `yaml@2.9.1`, `sharp@0.35.5`, `mermaid-isomorphic@3.1.0`, `starlight-links-validator@0.27.0`. Node `26` (LTS aktif), pnpm `10.34.9`.
- **Biaya hosting nol; statis sepenuhnya.** Batas Cloudflare gratis: 20.000 file per versi, 25 MiB per file. Anggaran file: peringatan di 15.000, gagal di 19.000.
- **Tanpa Tailwind, tanpa framework UI.** CSS biasa dengan custom properties; interaktivitas lewat custom element TypeScript.
- **TypeScript ketat.** File di `src/lib/` hanya memakai sintaks yang bisa dihapus (`erasableSyntaxOnly`) dan impor relatif berakhiran `.ts`, karena skrip `.mjs` mengimpornya langsung lewat Node. Zod selalu diimpor dari `astro/zod`, tidak pernah dipasang sendiri.
- **Tanpa perubahan kode untuk konten.** Menambah teknologi = satu file YAML + folder MDX.
- **Rujukan lewat ID** (`slug-teknologi` atau `slug-teknologi/slug-halaman`), bukan path atau URL. URL berbentuk `/{domain}/{teknologi}/…`.
- **Bahasa Indonesia** untuk antarmuka, konten, pesan galat skrip, dan pesan commit; istilah teknis tetap Inggris. Locale bawaan `id`.
- **Kualitas:** Lighthouse ≥ 95 di halaman baca; keempat tema lolos kontras WCAG AA; tidak ada kedipan tema; halaman baca tidak memuat apa pun dari origin lain.
- **Repo publik** (dibuka pemilik pada 15 November 2026, sesudah rencana ini pertama ditulis). Akibatnya: `repo.public` bernilai `true`, tautan "Sunting halaman" dan "Lapor kesalahan" aktif; perlindungan cabang `main` dipasang di Task 6; tidak ada rahasia (token, kunci API, `.env`) yang boleh masuk commit; langkah CI yang butuh secret dilewati bila secret tidak tersedia (PR dari fork tidak menerimanya). Laporan Lighthouse tetap disimpan lokal.
- **Cabang bertumpuk.** Bila PR fase sebelumnya belum di-merge pemilik, cabang fase berikutnya dibuat dari cabang fase sebelumnya dan PR-nya tetap menuju `main`.
- **Commit:** Conventional Commits berbahasa Indonesia (`feat: …`, `docs: …`). Tidak pernah commit langsung ke `main`; satu cabang dan satu pull request per fase (lihat "Fase dan cabang").
- **Langkah bertanda 👤 dikerjakan pemilik sendiri** (menyangkut akun atau persetujuan). Pelaksana berhenti dan menunggu di langkah itu.

## Keputusan yang menyimpang dari atau melengkapi rancangan

Semuanya boleh dikoreksi pemilik sebelum pelaksanaan.

| # | Keputusan | Alasan |
|---|---|---|
| K1 | Astro 7.4, bukan 6.x | Starlight 0.43.1 mensyaratkan `astro ^7.2.10`. Rancangan meminta rilis stabil terbaru saat scaffold |
| K2 | TypeScript 6.0.3, bukan 7 | `@astrojs/check` baru mendukung `^5 \|\| ^6` |
| K3 | Sidebar per teknologi lewat route middleware, bukan plugin atau override `Sidebar` | Diizinkan §14. Plugin `starlight-sidebar-topics` meminta daftar topik di konfigurasi, yang berarti mengubah kode tiap menambah teknologi |
| K4 | Diagram ditulis sebagai komponen `<Diagram>`, bukan blok kode ```` ```mermaid ```` | Astro 7 memakai pemroses Markdown baru (Sätteri); plugin rehype untuk Mermaid hanya jalan di pipeline lama. Komponen tidak bergantung pada pemroses |
| K5 | Lencana "perlu ditinjau" dihitung saat build, dan situs dibangun ulang terjadwal tiap minggu | Situs statis tidak tahu tanggal hari ini tanpa JavaScript |
| K6 | Teknologi uji `uji-komponen` tinggal di pohon konten, hanya ikut dibangun bila `DEVMECUM_FIXTURES=1` | Tes dan pratinjau butuh halaman yang memakai semua komponen sebelum ada konten nyata. Build produksi tidak memuatnya |
| K7 | Ditunda ke M2: tautan sidebar ke halaman domain dan katalog (§8.2), kolom `adoption` dan `trend` (menunggu rubrik), `alternatives` yang belum terdaftar hanya jadi peringatan | Halaman dan data tujuannya baru ada di M2 |
| K8 | Contoh kode Python di M1 dijalankan oleh skill `verifikasi-halaman`, bukan oleh `run-code-samples.mjs` | Skrip itu masuk M4 (§12) |
| K9 | Tidak dibuat di M1: `new-tech.mjs`, `check-freshness.mjs`, `check-versions.mjs`, `update-metrics.mjs`, pemuat `outline.yaml` | Masuk M2/M4. `computeStage` sudah menerima outline supaya M4 tinggal menyambungkan |

## Review Focus

1. **Versi tanpa tanda kutip di YAML** (`techVersion: 3.10` terbaca sebagai angka `3.1`). Diharapkan: validasi menolak dengan pesan yang menyuruh memberi tanda kutip. → Task 7.
2. **Path Windows di hooks** (`c:\D\…\src\data\tech\python.yaml`, huruf drive beda kapital dengan root). Diharapkan: dikenali sebagai file konten dan divalidasi. → Task 11.
3. **File berakhiran baris CRLF atau berawalan BOM** (ditulis editor Windows). Diharapkan: frontmatter tetap terbaca. → Task 10.
4. **Preferensi tampilan rusak di browser** (JSON cacat, nilai tak dikenal, `localStorage` diblokir). Diharapkan: halaman tampil dengan tema bawaan, tanpa galat. → Task 14.
5. **Tanggal bergeser** (zona waktu saat menampilkan `lastVerified`; 31 Agustus + 6 bulan). Diharapkan: tanggal tampil persis seperti di frontmatter; akhir bulan dijepit ke hari terakhir. → Task 9.

## Struktur file

```
.gitattributes .gitignore .editorconfig .node-version LICENSE LICENSE-CONTENT README.md
CLAUDE.md  .mcp.json  .claude/settings.json
.claude/skills/{tulis-ringkasan,verifikasi-halaman}/SKILL.md
.claude/agents/{peneliti,pemeriksa-fakta}.md
site.config.mjs            # satu-satunya tempat URL situs, info repo, flag repo.public
astro.config.mjs  wrangler.jsonc  lighthouserc.json  tsconfig.json  vitest.config.ts  playwright.config.ts
src/content.config.ts      # koleksi docs, tech, domains, templates
src/routeData.ts           # route middleware: sidebar, pagination, filter Pagefind, og:image
src/lib/                   # fungsi murni; bisa diimpor Node kecuali data.ts
  schemas.ts  ids.ts  maturity.ts  freshness.ts  sidebar.ts  prefs.ts
  frontmatter.ts  validate.ts  budget.ts  hook-io.ts
  data.ts                  # pembaca astro:content — hanya untuk kode Astro
src/data/domains.yaml  src/data/templates.yaml  src/data/tech/{python,uji-komponen}.yaml
src/content/docs/index.mdx                       # beranda
src/content/docs/fondasi/uji-komponen/…          # konten uji (K6)
src/content/docs/bahasa/python/index.mdx         # Task 22
src/components/  TechCard LevelBadge StageBadge FreshnessStamp Breadcrumb ProsCons BestPractice VersionNote Diagram DisplaySettings (.astro)
src/overrides/   ThemeProvider ThemeSelect PageTitle EditLink (.astro)
src/styles/      base.css settings.css themes/{light,dark,sepia,contrast}.css
src/pages/og/[tech].png.ts
templates/ringkasan.mdx
scripts/  validate-content.mjs count-files.mjs build-uji.mjs assert-no-fixtures.mjs
scripts/hooks/  validate-edited.mjs protect-files.mjs validate-on-stop.mjs
tests/unit/*.test.ts   tests/e2e/*.spec.ts
docs/panduan-menulis.md
.github/workflows/ci.yml  .github/workflows/deploy.yml
```

## Fase dan cabang

| Fase | Task | Cabang | Hasil saat di-merge |
|---|---|---|---|
| M0 | 1–2 | `m0/persiapan` | Lingkungan kerja siap |
| M1-A | 3–6 | `m1/kerangka` | Situs kosong sudah tayang; CI dan pratinjau PR jalan |
| M1-B | 7–12 | `m1/data-validasi` | Skema, validasi, hooks |
| M1-C | 13–18 | `m1/tampilan` | Navigasi, tema, komponen, SEO |
| M1-D | 19–21 | `m1/jalur-konten` | Panduan menulis, subagent, skill |
| M1-E | 22 | `konten/python` | Python tingkat Ringkasan tayang |

Di akhir tiap fase: buka PR dengan `gh pr create`, tunggu CI hijau, 👤 pemilik meninjau pratinjau dan me-merge.

---

## M0 — Persiapan

### Task 1: Alat kerja dan kebersihan repositori

**Files:**
- Create: `.gitattributes`, `.gitignore`, `.editorconfig`, `.node-version`, `LICENSE`, `LICENSE-CONTENT`, `README.md`

- [ ] **Step 1 (👤): Pasang Node 26 LTS.** Di PowerShell: `winget install OpenJS.NodeJS.LTS`, buka terminal baru. Saat ini terpasang v24.22.1.
- [ ] **Step 2: Periksa alat.** Jalankan `node --version; pnpm --version; gh auth status; claude --version; python --version`. Expected: Node `v26.x`, pnpm `10.x`, gh login sebagai pemilik repo, Python `3.x`.
- [ ] **Step 3: Periksa perangkat Claude Code.** `claude plugin list` (atau `/plugin` di dalam sesi) memuat `superpowers`; `claude mcp list` menunjukkan `context7` berstatus Connected. Keduanya sudah terpasang di tingkat pengguna, jadi tidak ditambahkan ke repo.
- [ ] **Step 4: Tulis file kebersihan.**
  - `.gitattributes`: `* text=auto eol=lf`, plus `*.png binary`.
  - `.gitignore`: `node_modules/`, `dist/`, `.astro/`, `.wrangler/`, `.lighthouseci/`, `test-results/`, `playwright-report/`, `.env`, `.env.*`, `.dev.vars`, `.claude/settings.local.json`.
  - `.editorconfig`: UTF-8, LF, indentasi 2 spasi, baris akhir kosong.
  - `.node-version`: `26`.
  - `LICENSE`: teks MIT, pemegang hak "Para kontributor Devmecum", tahun 2026. `LICENSE-CONTENT`: pernyataan bahwa isi `src/content/` dan `src/data/` berlisensi CC BY-SA 4.0 dengan tautan ke teks resminya.
  - `README.md`: satu paragraf maksud proyek, perintah proyek (diisi di Task 3), tautan ke rancangan dan rencana, catatan lisensi.
- [ ] **Step 5: Normalkan akhir baris.** `git add --renormalize .` lalu `git status`. Expected: tidak ada perubahan isi pada dokumen rancangan selain akhir baris.
- [ ] **Step 6: Commit.** `git commit -m "chore: tambah file kebersihan repositori dan lisensi"`

### Task 2: Aturan proyek untuk Claude Code

**Files:**
- Create: `CLAUDE.md`, `.claude/settings.json`, `.mcp.json`

Konsep yang pertama dipakai di sini: **CLAUDE.md** adalah catatan yang dibaca Claude Code di awal setiap sesi; **settings.json** mengatur izin perintah; **MCP** adalah cara menyambungkan alat luar (di sini browser) ke Claude Code.

- [ ] **Step 1: Tulis `CLAUDE.md`** (paling banyak 40 baris), berisi persis hal berikut:
  - Perintah proyek: `pnpm dev`, `pnpm build`, `pnpm check`, `pnpm test`, `pnpm test:e2e`, `pnpm validate`.
  - Cabang: `m<N>/<topik>` untuk aplikasi, `konten/<slug>` untuk konten. Tidak pernah commit ke `main`. Merge hanya bila CI hijau.
  - Commit: Conventional Commits berbahasa Indonesia.
  - Pekerjaan konten (`src/content/`, `src/data/`) tidak boleh mengubah kode aplikasi (`src/lib/`, `src/components/`, `src/overrides/`, `scripts/`, konfigurasi), dan sebaliknya, dalam satu PR.
  - `pnpm-lock.yaml` dan `src/data/metrics/` hanya diubah oleh alat, tidak diedit tangan.
  - Skrip ditulis sebagai Node `.mjs`; tidak ada bash.
  - Standar penulisan ada di `docs/panduan-menulis.md`; rancangan di `docs/superpowers/specs/`.
  - Repo publik: jangan pernah meng-commit rahasia (token, kunci API, isi `.env`).
- [ ] **Step 2: Tulis `.claude/settings.json`** dengan `permissions.allow` untuk `pnpm`, `node scripts/*`, perintah baca `git` dan `gh`; `permissions.deny` untuk membaca `.env`, `.env.*`, `.dev.vars`. Hooks ditambahkan di Task 11. Sintaks aturan izin diambil dari dokumentasi Claude Code terkini (Context7: `/anthropics/claude-code`).
- [ ] **Step 3: Tulis `.mcp.json`** dengan satu server `playwright` (`@playwright/mcp@0.0.85` lewat `npx`; di Windows perintahnya `cmd /c npx …`).
- [ ] **Step 4: Verifikasi.** Mulai sesi baru, jalankan `claude mcp list`. Expected: `playwright` Connected. Tanyakan "apa aturan cabang proyek ini?" dan pastikan jawabannya sesuai `CLAUDE.md`.
- [ ] **Step 5: Commit, PR, merge (👤).** `git commit -m "chore: tambah CLAUDE.md, izin, dan server MCP proyek"`; `gh pr create`; pemilik me-merge `m0/persiapan`.

---

## M1-A — Kerangka dan deploy

### Task 3: Scaffold Astro + Starlight

**Files:**
- Create: `package.json`, `pnpm-lock.yaml`, `astro.config.mjs`, `site.config.mjs`, `tsconfig.json`, `src/content.config.ts`, `src/content/docs/index.mdx`, `src/styles/base.css`

**Interfaces:**
- Produces: `site.config.mjs` dengan ekspor bawaan `{ url: string, title: 'Devmecum', tagline: string, repo: { owner: string, name: 'devmecum', branch: 'main', public: true } }`. Skrip paket: `dev`, `build`, `preview`, `check` (`astro check`). Skrip `test`, `test:e2e`, `budget`, `lhci`, dan `validate` ditambahkan oleh task yang membuat alatnya (Task 4, 5, 6, 10).

- [ ] **Step 1: Pasang dependensi** dengan versi di Global Constraints (`pnpm add -E …`, alat uji dengan `-D`). Set `"packageManager": "pnpm@10.34.9"`, `"engines": { "node": ">=26" }`, `"type": "module"`, `"private": true`. Scaffold manual mengikuti panduan "manual setup" Starlight (Context7: `/withastro/starlight`), bukan `create-astro`, supaya tidak ada file contoh.
- [ ] **Step 2: Tulis `site.config.mjs`.** `url` sementara `https://devmecum.workers.dev`; diganti nilai asli di Task 6.
- [ ] **Step 3: Tulis `astro.config.mjs`.** `site` dari `site.config.mjs`; Starlight dengan `title`, `locales: { root: { label: 'Bahasa Indonesia', lang: 'id' } }`, `customCss: ['./src/styles/base.css']`. Belum ada `sidebar`, `editLink`, atau override.
- [ ] **Step 4: Tulis `tsconfig.json`.** `extends: "astro/tsconfigs/strict"`, `allowImportingTsExtensions: true`, `erasableSyntaxOnly: true`, alias `@components/*` → `src/components/*` dan `@lib/*` → `src/lib/*`.
- [ ] **Step 5: Tulis `src/content.config.ts`** dengan koleksi `docs` (`docsLoader()` + `docsSchema()`), dan beranda `src/content/docs/index.mdx` (`template: splash`, judul "Devmecum", `description` terisi, hero dengan tagline, tanpa tombol).
- [ ] **Step 6: Verifikasi.** `pnpm check` → 0 error. `pnpm build` → selesai, `dist/index.html` memuat `<html lang="id"`. 
- [ ] **Step 7: Commit.** `git commit -m "feat: scaffold Astro dan Starlight berbahasa Indonesia"`

### Task 4: Kerangka pengujian

**Files:**
- Create: `vitest.config.ts`, `playwright.config.ts`, `scripts/build-uji.mjs`, `tests/unit/site-config.test.ts`, `tests/e2e/beranda.spec.ts`

**Interfaces:**
- Produces: `pnpm test` menjalankan `tests/unit/**/*.test.ts`. `pnpm test:e2e` = `node scripts/build-uji.mjs && playwright test`. `scripts/build-uji.mjs` menyetel `DEVMECUM_FIXTURES=1` dan `DEVMECUM_TODAY=2026-11-15`, lalu memanggil `build()` dari paket `astro`. Playwright: `testDir: tests/e2e`, hanya Chromium, `webServer` menjalankan `pnpm preview --port 4321`, `baseURL: http://localhost:4321`.

- [ ] **Step 1: Tulis tes yang gagal.**

```ts
// tests/unit/site-config.test.ts
import site from '../../site.config.mjs';
test('URL situs https tanpa garis miring di akhir', () => {
  expect(site.url).toMatch(/^https:\/\/[^/]+$/);
  expect(site.repo.public).toBe(true);
});
```

```ts
// tests/e2e/beranda.spec.ts
test('beranda tampil dalam bahasa Indonesia', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'id');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Devmecum');
});
test('halaman tak dikenal memberi 404', async ({ page }) => {
  const res = await page.goto('/tidak-ada/');
  expect(res?.status()).toBe(404);
});
```

- [ ] **Step 2: Jalankan, pastikan gagal.** `pnpm test` dan `pnpm test:e2e` → gagal karena konfigurasi belum ada.
- [ ] **Step 3: Tulis kedua konfigurasi dan `scripts/build-uji.mjs`.** Pasang browser: `pnpm exec playwright install chromium`.
- [ ] **Step 4: Jalankan, pastikan lolos.** `pnpm test` → 1 lolos. `pnpm test:e2e` → 2 lolos.
- [ ] **Step 5: Commit.** `git commit -m "test: tambah kerangka Vitest dan Playwright"`

### Task 5: Anggaran file

**Files:**
- Create: `src/lib/budget.ts`, `scripts/count-files.mjs`, `tests/unit/budget.test.ts`

**Interfaces:**
- Produces:
  - `WARN_AT = 15_000`, `FAIL_AT = 19_000`, `MAX_FILE_BYTES = 25 * 1024 * 1024`
  - `scanDir(dir: string): Promise<{ count: number; oversized: { path: string; bytes: number }[] }>`
  - `evaluateBudget(scan): { level: 'ok' | 'warn' | 'fail'; messages: string[] }`
  - CLI `node scripts/count-files.mjs <dir>`: mencetak jumlah file dan pesan; keluar 1 hanya bila `fail`; keluar 1 dengan pesan jelas bila `<dir>` tidak ada.

- [ ] **Step 1: Tulis tes yang gagal.**

```ts
const scan = (count: number, oversized = []) => ({ count, oversized });
test.each([[14_999, 'ok'], [15_000, 'warn'], [18_999, 'warn'], [19_000, 'fail']])(
  '%i file → %s', (n, level) => expect(evaluateBudget(scan(n)).level).toBe(level));
test('file di atas 25 MiB menggagalkan', () => {
  const r = evaluateBudget(scan(10, [{ path: 'a.bin', bytes: MAX_FILE_BYTES + 1 }]));
  expect(r.level).toBe('fail');
  expect(r.messages.join()).toContain('a.bin');
});
test('scanDir menghitung file di subfolder', async () => {
  // buat folder sementara berisi a.txt dan sub/b.txt
  expect((await scanDir(tmp)).count).toBe(2);
});
```

- [ ] **Step 2: Jalankan, pastikan gagal.** `pnpm vitest run tests/unit/budget.test.ts` → gagal, modul belum ada.
- [ ] **Step 3: Implementasikan `budget.ts` dan `count-files.mjs`.**
- [ ] **Step 4: Jalankan, pastikan lolos**, lalu `pnpm build; pnpm budget` → mencetak jumlah file, keluar 0.
- [ ] **Step 5: Commit.** `git commit -m "feat: tambah pemeriksa anggaran file"`

### Task 6: CI, deploy, dan pratinjau PR

**Files:**
- Create: `wrangler.jsonc`, `lighthouserc.json`, `scripts/assert-no-fixtures.mjs`, `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`
- Modify: `site.config.mjs` (URL asli)

**Interfaces:**
- Produces: secret repositori `CLOUDFLARE_API_TOKEN` dan `CLOUDFLARE_ACCOUNT_ID`; nama cek CI `ci`; Worker bernama `devmecum`.

- [ ] **Step 1 (👤): Siapkan Cloudflare.** Di dashboard Cloudflare: catat Account ID dan subdomain `workers.dev` (Workers & Pages → Overview). Buat API token dari templat "Edit Cloudflare Workers". Lalu di terminal: `gh secret set CLOUDFLARE_API_TOKEN` dan `gh secret set CLOUDFLARE_ACCOUNT_ID` (nilai ditempel saat diminta, tidak ditulis ke file mana pun). Beri tahu pelaksana subdomainnya.
- [ ] **Step 2: Isi URL asli** `https://devmecum.<subdomain>.workers.dev` di `site.config.mjs`.
- [ ] **Step 3: Tulis `wrangler.jsonc`:** `name: "devmecum"`, `compatibility_date: "2026-11-15"`, `assets: { directory: "./dist", not_found_handling: "404-page" }`. Tanpa `main`.
- [ ] **Step 4: Tulis `lighthouserc.json`:** `collect.staticDistDir: "./dist"`, `collect.url` menunjuk beranda (diganti halaman baca di Task 18; bentuk URL mengikuti dokumentasi LHCI untuk `staticDistDir`), `numberOfRuns: 3`; `assert` kategori `performance`, `accessibility`, `best-practices`, `seo` masing-masing `minScore: 0.95` bertingkat `error`; `upload.target: "filesystem"` ke `.lighthouseci/` (tidak ke penyimpanan publik).
- [ ] **Step 5: Tulis `scripts/assert-no-fixtures.mjs`:** keluar 1 bila `dist/fondasi/uji-komponen/` ada.
- [ ] **Step 6: Tulis `ci.yml`.** Pemicu `pull_request`. `concurrency` per cabang dengan `cancel-in-progress: true`. Satu job bernama `ci` di `ubuntu-latest`: checkout → pnpm → Node dari `.node-version` dengan cache pnpm → `pnpm install --frozen-lockfile` → `pnpm exec playwright install --with-deps chromium` → `pnpm check` → `pnpm test` → `pnpm test:e2e` (membangun dengan konten uji) → `pnpm budget` → `pnpm lhci` → `pnpm exec wrangler preview --name pr-<nomor> --json`, ambil URL-nya, tulis sebagai komentar PR lewat `gh pr comment`. Langkah pratinjau hanya jalan bila secret Cloudflare tersedia. Izin job: `contents: read`, `pull-requests: write`. Versi action memakai major terbaru masing-masing. Bila `wrangler preview --help` tidak ada di versi terpasang, pakai `wrangler versions upload --preview-alias pr-<nomor>`.
- [ ] **Step 7: Tulis `deploy.yml`.** Pemicu: `push` ke `main`, `schedule` mingguan (`cron: "0 2 * * 1"`, K5), `workflow_dispatch`. Langkah: pasang seperti CI → `pnpm check` → `pnpm test` → `pnpm build` (tanpa konten uji) → `node scripts/assert-no-fixtures.mjs` → `pnpm budget` → `pnpm exec wrangler deploy`.
- [ ] **Step 8: Verifikasi di PR.** Push cabang, `gh pr create`, `gh pr checks --watch`. Expected: cek `ci` hijau; PR mendapat komentar berisi URL pratinjau yang menampilkan beranda.
- [ ] **Step 9: Pasang perlindungan cabang.** `gh api -X PUT repos/{owner}/{repo}/branches/main/protection` dengan cek wajib `ci`. Expected: 200, dan `gh api repos/{owner}/{repo}/branches/main/protection` menampilkan cek `ci`.
- [ ] **Step 10: Commit, merge (👤), verifikasi tayang.** `git commit -m "ci: tambah CI, deploy ke Cloudflare, dan pratinjau PR"`. Setelah merge: `gh run watch` untuk `deploy.yml`, lalu buka URL situs. Expected: beranda tampil; `/tidak-ada/` memberi 404.

---

## M1-B — Data, skema, validasi

### Task 7: Skema dan data awal

**Files:**
- Create: `src/lib/schemas.ts`, `src/data/domains.yaml`, `src/data/templates.yaml`, `src/data/tech/python.yaml`, `src/data/tech/uji-komponen.yaml`, `tests/unit/schemas.test.ts`
- Modify: `src/content.config.ts`

**Interfaces:**
- Produces (semua dari `src/lib/schemas.ts`):
  - Konstanta `LEVELS = ['dasar','menengah','lanjut','profesional','umum']`, `STATUSES = ['draf','terbit']`, `TECH_TYPES` (8 nilai §5.7), `ADOPTIONS`, `TRENDS`, `TEMPLATE_IDS = ['A','B','C','D','E']`, `FIXTURE_TECH = 'uji-komponen'`, `SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/`.
  - `techSchema` (objek ketat: kunci tak dikenal ditolak) sesuai §5.7. Wajib: `name, slug, type, domain, template, website, docs, latestVersion, versionSource, requires, alternatives, tags, useCases`. Opsional: `creator, firstRelease, license, adoption, trend, metrics, surveys`. `versionSource.kind` ∈ `npm | pypi | crates | maven | github`.
  - `domainSchema`: `{ id, name, order, freshnessMonths: 3 | 6 }`.
  - `templateSchema`: `{ id, name, chapters: { number, title, level }[] }`.
  - `pageExtension`: objek Zod berisi kolom §5.8 selain `title`; `description` wajib; kolom lain opsional di tingkat objek.
  - `refinePage(data, ctx): void`: bila `tech` ada → `chapter, level, status, techVersion, lastVerified, codeTested` wajib; `status: terbit` → `factChecked` ada dan `sources` ≥ 1; `chapter: 1` yang terbit → `sources` ≥ 2; `sources` berupa URL `https`.
  - `deriveDraft(data): boolean` = `data.draft === true || data.status === 'draf' || (data.tech === FIXTURE_TECH && process.env.DEVMECUM_FIXTURES !== '1')`.
  - `materiSchema`: `title` + `pageExtension` + `refinePage`, untuk dipakai validator di luar Astro.
  - Tipe `Tech`, `Domain`, `Template`, `PageMeta`, `Level`.

- [ ] **Step 1: Tulis tes yang gagal.**

```ts
const page = { title: 'T', description: 'D', tech: 'python', chapter: 7, level: 'menengah',
  status: 'terbit', techVersion: '3.x', lastVerified: new Date('2026-11-14'),
  factChecked: new Date('2026-11-14'), sources: ['https://docs.python.org/3/'], codeTested: true };
test('halaman materi lengkap lolos', () => expect(materiSchema.safeParse(page).success).toBe(true));
test('terbit tanpa factChecked ditolak', () =>
  expect(materiSchema.safeParse({ ...page, factChecked: undefined }).success).toBe(false));
test('terbit tanpa sumber ditolak', () =>
  expect(materiSchema.safeParse({ ...page, sources: [] }).success).toBe(false));
test('Ringkasan terbit butuh dua sumber', () =>
  expect(materiSchema.safeParse({ ...page, chapter: 1, level: 'umum' }).success).toBe(false));
test('draf boleh tanpa factChecked dan sumber', () =>
  expect(materiSchema.safeParse({ ...page, status: 'draf', factChecked: undefined, sources: [] }).success).toBe(true));
test('codeTested false tetap boleh terbit', () =>
  expect(materiSchema.safeParse({ ...page, codeTested: false }).success).toBe(true));
test('versi berupa angka ditolak dengan petunjuk tanda kutip', () => {   // Review Focus 1
  const r = materiSchema.safeParse({ ...page, techVersion: 3.1 });
  expect(r.success).toBe(false);
  expect(JSON.stringify(r.error?.issues)).toContain('tanda kutip');
});
test('halaman lepas cukup title dan description', () =>
  expect(materiSchema.safeParse({ title: 'Beranda', description: 'D' }).success).toBe(true));
test('kunci tak dikenal di data teknologi ditolak', () =>
  expect(techSchema.safeParse({ ...validTech, lisense: 'MIT' }).success).toBe(false));
test('latestVersion berupa angka ditolak', () =>
  expect(techSchema.safeParse({ ...validTech, latestVersion: 3.1 }).success).toBe(false));
test('deriveDraft', () => {
  expect(deriveDraft({ status: 'draf' })).toBe(true);
  expect(deriveDraft({ status: 'terbit', tech: 'python' })).toBe(false);
  expect(deriveDraft({ status: 'terbit', tech: 'uji-komponen' })).toBe(true); // tanpa DEVMECUM_FIXTURES
});
```

- [ ] **Step 2: Jalankan, pastikan gagal.** `pnpm vitest run tests/unit/schemas.test.ts`
- [ ] **Step 3: Implementasikan `schemas.ts`.**
- [ ] **Step 4: Tulis data.**
  - `domains.yaml`, 18 entri berurutan sesuai §5.2 dengan `id`: `fondasi, bahasa, web-frontend, web-backend, mobile, desktop, database, data, ai-ml, genai, cloud, devops, keamanan, arsitektur, testing, tools, game, embedded`. `name` disalin dari §5.2. `freshnessMonths: 3` untuk `web-frontend`, `genai`, `cloud`; lainnya `6`.
  - `templates.yaml`, lima templat. Judul bab disalin persis dari Lampiran B. Bab 1 selalu `umum`. Level: **A** 2–6 dasar, 7–15 menengah, 16–21 lanjut, 22 profesional, 23–26 umum · **B** 2–5, 6–11, 12–16, 17, 18–21 umum · **C** 2–5, 6–7, 8–10, 11, 12–15 umum · **D** 2–4, 5–7, 8–12, 13, 14–15 umum · **E** 2–3, 4–6, 7, 8, 9–12 umum.
  - `python.yaml`: `type: language`, `domain: bahasa`, `template: A`, `creator: Guido van Rossum`, `firstRelease: 1991`, `license: PSF-2.0`, `website: https://www.python.org`, `docs: https://docs.python.org/3/`, `versionSource: { kind: github, repo: python/cpython }`, `requires: []`, `alternatives: [javascript, ruby, go]`. `latestVersion` (dalam tanda kutip) dibaca dari https://www.python.org/downloads/ saat task dikerjakan. `tags` dan `useCases` 3–5 butir.
  - `uji-komponen.yaml`: `name: Uji Komponen`, `type: concept`, `domain: fondasi`, `template: E`, `latestVersion: "1.0"`, `versionSource: { kind: github, repo: Rizukiuf/devmecum }`, `requires: []`, `alternatives: [python]`.
- [ ] **Step 5: Tambah tes data** yang membaca `templates.yaml` dan `domains.yaml` lewat paket `yaml`: jumlah bab `A=26, B=21, C=15, D=15, E=12`; nomor bab berurutan dari 1; `A` bab 6 `dasar`, bab 7 `menengah`, bab 22 `profesional`, bab 23 `umum`; ada 18 domain dengan `id` unik; kedua file teknologi lolos `techSchema`.
- [ ] **Step 6: Sambungkan ke `content.config.ts`.** `docs`: `docsLoader()` dengan skema `docsSchema({ extend: pageExtension })` yang hasilnya diberi `.superRefine(refinePage)` lalu `.transform(d => ({ ...d, draft: deriveDraft(d) }))`. `tech`: `glob` atas `src/data/tech/*.yaml` + `techSchema`. `domains` dan `templates`: `file()` + skemanya. Bila Astro menolak skema yang ditransformasi, hapus `.transform` dan tambahkan aturan validasi "`draft` harus sama dengan `deriveDraft`" di Task 10; tes penentunya ada di Task 12.
- [ ] **Step 7: Jalankan, pastikan lolos.** `pnpm test; pnpm check; pnpm build` → semua lolos.
- [ ] **Step 8: Commit.** `git commit -m "feat: tambah skema konten dan data domain, templat, Python"`

### Task 8: Peta ID ke URL

**Files:**
- Create: `src/lib/ids.ts`, `tests/unit/ids.test.ts`

**Interfaces:**
- Produces:
  - `parseId(id: string): { tech: string; page?: string } | null`
  - `pageSlug(relPath: string): string` — nama file tanpa folder dan ekstensi (`02-pengenalan/apa-itu.mdx` → `apa-itu`); `index.mdx` → `''`.
  - `buildIdIndex(techs: { slug: string; domain: string }[], pages: { tech: string; relPath: string }[]): { index: Map<string, string>; duplicates: string[] }` — `relPath` relatif terhadap folder teknologi.
  - `resolveId(id: string, index: Map<string, string>): string | undefined`

- [ ] **Step 1: Tulis tes yang gagal.**

```ts
test('parseId', () => {
  expect(parseId('python')).toEqual({ tech: 'python' });
  expect(parseId('python/variabel-tipe-data')).toEqual({ tech: 'python', page: 'variabel-tipe-data' });
  for (const bad of ['', 'Python', '/python', 'python/', 'a/b/c', 'bahasa/python/index.mdx', 'https://x.dev'])
    expect(parseId(bad)).toBeNull();
});
const { index, duplicates } = buildIdIndex(
  [{ slug: 'python', domain: 'bahasa' }, { slug: 'react', domain: 'web-frontend' }],
  [{ tech: 'python', relPath: 'index.mdx' },
   { tech: 'python', relPath: '04-sintaks-dasar/variabel-tipe-data.mdx' },
   { tech: 'python', relPath: '05-alur-kontrol/variabel-tipe-data.mdx' }]);
test('URL mengikuti /{domain}/{teknologi}/…', () => {
  expect(resolveId('python', index)).toBe('/bahasa/python/');
  expect(resolveId('python/variabel-tipe-data', index)).toBe('/bahasa/python/04-sintaks-dasar/variabel-tipe-data/');
  expect(resolveId('react', index)).toBe('/web-frontend/react/');   // terdaftar walau belum punya halaman
  expect(resolveId('vue', index)).toBeUndefined();
});
test('slug halaman ganda dilaporkan', () => expect(duplicates).toEqual(['python/variabel-tipe-data']));
```

- [ ] **Step 2: Jalankan, pastikan gagal.**
- [ ] **Step 3: Implementasikan `ids.ts`.**
- [ ] **Step 4: Jalankan, pastikan lolos.**
- [ ] **Step 5: Commit.** `git commit -m "feat: tambah peta ID ke URL"`

### Task 9: Tingkat kematangan dan kemutakhiran

**Files:**
- Create: `src/lib/maturity.ts`, `src/lib/freshness.ts`, `tests/unit/maturity.test.ts`, `tests/unit/freshness.test.ts`

**Interfaces:**
- Consumes: `Template` dari Task 7.
- Produces:
  - `type Stage = 0 | 1 | 2 | 3 | 4 | 5`; `STAGE_LABELS = ['Terdaftar','Ringkasan','Dasar','Menengah','Lanjut','Profesional']`
  - `type OutlineChapter = { chapter: number; pages: string[] } | { chapter: number; tidakBerlaku: true }`
  - `computeStage(input: { template: Template; published: { chapter: number; slug: string }[]; outline?: OutlineChapter[] }): Stage`
  - `today(): Date` — tengah malam UTC hari ini, atau `process.env.DEVMECUM_TODAY` bila disetel.
  - `addMonths(date: Date, months: number): Date` — UTC, hari dijepit ke akhir bulan.
  - `isStale(lastVerified: Date, months: number, now: Date): boolean` — benar bila `now` sesudah `addMonths(lastVerified, months)`.
  - `formatDate(date: Date): string` — `'14 November 2026'`, selalu UTC.

Aturan `computeStage` (§5.3): tingkat 1 tercapai bila ada halaman terbit ber-`chapter: 1`. Tanpa `outline`, hasil paling tinggi 1. Bab lengkap bila bertanda `tidakBerlaku`, atau `pages` tidak kosong dan semuanya terbit; bab yang tidak ada di outline dianggap belum lengkap. Level bab → tingkat: dasar 2, menengah 3, lanjut 4, profesional 5, umum (selain bab 1) 5. Tingkat N tercapai bila tingkat N−1 tercapai dan semua bab bertingkat N lengkap.

- [ ] **Step 1: Tulis tes yang gagal.** `tplA` dimuat dari `templates.yaml`; `full(chapters)` membuat outline satu halaman per bab beserta daftar `published`-nya.

```ts
test('belum ada halaman terbit → 0', () => expect(computeStage({ template: tplA, published: [] })).toBe(0));
test('Ringkasan terbit → 1', () => expect(computeStage({ template: tplA, published: [r1] })).toBe(1));
test('tanpa outline tidak pernah lebih dari 1', () =>
  expect(computeStage({ template: tplA, published: [r1, ...manyPages] })).toBe(1));
test('bab Dasar 2–6 lengkap → 2', () => expect(computeStage(full([1,2,3,4,5,6]))).toBe(2));
test('bab Dasar lengkap tanpa Ringkasan → 0', () => expect(computeStage(full([2,3,4,5,6]))).toBe(0));
test('Menengah lengkap tapi satu bab Dasar kurang → 1', () =>
  expect(computeStage(full([1,2,3,4,5,7,8,9,10,11,12,13,14,15]))).toBe(1));
test('bab tidak-berlaku dihitung lengkap', () =>
  expect(computeStage(withNA(full([1,2,3,4,5]), 6))).toBe(2));
test('bab dengan daftar halaman kosong belum lengkap', () =>
  expect(computeStage(withEmpty(full([1,2,3,4,5]), 6))).toBe(1));
test('semua kecuali bab umum 23 → 4', () => expect(computeStage(full(range(1, 26).filter(n => n !== 23)))).toBe(4));
test('seluruh templat → 5', () => expect(computeStage(full(range(1, 26)))).toBe(5));
```

```ts
const d = (s: string) => new Date(s + 'T00:00:00Z');
test('addMonths menjepit akhir bulan', () => {            // Review Focus 5
  expect(addMonths(d('2026-08-31'), 6)).toEqual(d('2027-02-28'));
  expect(addMonths(d('2026-05-14'), 6)).toEqual(d('2026-11-14'));
});
test('tepat di batas belum usang, sehari sesudahnya usang', () => {
  expect(isStale(d('2026-05-14'), 6, d('2026-11-14'))).toBe(false);
  expect(isStale(d('2026-05-14'), 6, d('2026-11-15'))).toBe(true);
  expect(isStale(d('2026-08-14'), 3, d('2026-11-15'))).toBe(true);
});
test('tanggal tampil sama dengan frontmatter di zona waktu mana pun', () => {   // Review Focus 5
  expect(formatDate(d('2026-11-14'))).toBe('14 November 2026');
  expect(formatDate(new Date('2026-11-14T23:30:00Z'))).toBe('14 November 2026');
});
test('today membaca DEVMECUM_TODAY', () => {
  vi.stubEnv('DEVMECUM_TODAY', '2026-11-15');
  expect(today()).toEqual(d('2026-11-15'));
});
```

Tambahkan `TZ: 'Asia/Jakarta'` ke `test.env` di `vitest.config.ts` supaya tes zona waktu bermakna.

- [ ] **Step 2: Jalankan, pastikan gagal.**
- [ ] **Step 3: Implementasikan kedua modul.**
- [ ] **Step 4: Jalankan, pastikan lolos.**
- [ ] **Step 5: Commit.** `git commit -m "feat: tambah penghitung tingkat kematangan dan kemutakhiran"`

### Task 10: Validasi konten

**Files:**
- Create: `src/lib/frontmatter.ts`, `src/lib/validate.ts`, `scripts/validate-content.mjs`, `tests/unit/frontmatter.test.ts`, `tests/unit/validate.test.ts`
- Modify: `package.json` (skrip `validate`), `.github/workflows/ci.yml` dan `deploy.yml` (langkah `pnpm validate` sesudah `pnpm test`)

**Interfaces:**
- Consumes: `techSchema`, `materiSchema`, `domainSchema`, `templateSchema`, `SLUG_RE` (Task 7); `buildIdIndex`, `parseId`, `pageSlug` (Task 8).
- Produces:
  - `parseFrontmatter(text: string): { data: Record<string, unknown>; body: string } | null` — memakai paket `yaml`; `null` bila tidak ada blok frontmatter.
  - `type Problem = { file: string; message: string; severity: 'error' | 'warning' }` — `file` relatif terhadap root repo, gaya POSIX.
  - `loadProject(root: string): Promise<Project>` — membaca `src/data/domains.yaml`, `templates.yaml`, `tech/*.yaml`, dan frontmatter semua `src/content/docs/**/*.{md,mdx}`.
  - `validateProject(project: Project, now: Date): Problem[]`
  - CLI `node scripts/validate-content.mjs [file…]`: tanpa argumen melaporkan semua masalah; dengan argumen hanya masalah pada file itu. Format baris `error|peringatan  <file>: <pesan>`. Keluar 1 bila ada `error`; peringatan tidak menggagalkan.

Aturan (pesan dalam bahasa Indonesia, menyebut nilai yang salah):

| # | Aturan | Tingkat |
|---|---|---|
| V1 | File teknologi lolos `techSchema`; `slug` sama dengan nama file | error |
| V2 | `domain` ada di `domains.yaml` | error |
| V3 | Setiap ID di `requires` terdaftar | error |
| V4 | ID di `alternatives` yang belum terdaftar | peringatan (K7) |
| V5 | File di `src/content/docs/<id-domain>/…` wajib punya `tech`, dan foldernya `<domain teknologi>/<slug teknologi>/` | error |
| V6 | Frontmatter lolos `materiSchema` | error |
| V7 | `index.mdx` ⇔ `chapter: 1` dan `level: umum` | error |
| V8 | Halaman lain berada di folder `NN-…` dengan `NN` = `chapter`; `2 ≤ chapter ≤` jumlah bab templat; `level` = level bab itu di templat | error |
| V9 | Slug halaman unik dalam satu teknologi | error |
| V10 | Setiap ID di `prerequisites` menunjuk halaman yang ada; halaman terbit tidak boleh mensyaratkan halaman draf | error |
| V11 | `lastVerified` dan `factChecked` tidak di masa depan | error |
| V12 | File di luar folder domain (mis. beranda) cukup `title` dan `description` | — |

- [ ] **Step 1: Tulis tes yang gagal.** Tes validasi membangun proyek kecil di folder sementara lewat pembantu `makeProject(files: Record<string, string>)` yang sudah berisi domain, templat, dan satu teknologi `python` yang sah.

```ts
test('frontmatter terbaca dari file CRLF berawalan BOM', () => {            // Review Focus 3
  const r = parseFrontmatter('\uFEFF---\r\ntitle: A\r\ntech: python\r\n---\r\nIsi\r\n');
  expect(r?.data).toEqual({ title: 'A', tech: 'python' });
});
test('file tanpa frontmatter → null', () => expect(parseFrontmatter('# Judul')).toBeNull());
```

```ts
const errors = async (files) => (validateProject(await loadProject(await makeProject(files)), d('2026-11-15')))
  .filter(p => p.severity === 'error').map(p => p.message);
test('proyek sah tanpa masalah', async () => expect(await errors({})).toEqual([]));
test('V1 slug beda dengan nama file', ...);        // 'src/data/tech/py.yaml' ber-slug python
test('V3 requires menunjuk teknologi tak terdaftar', ...);   // pesan memuat ID-nya
test('V4 alternatives tak terdaftar hanya peringatan', ...); // errors kosong, ada 1 warning
test('V5 halaman materi tanpa tech', ...);
test('V5 halaman di folder domain yang salah', ...);         // web-frontend/python/index.mdx
test('V7 index.mdx ber-chapter 2', ...);
test('V8 folder 03-… berisi halaman chapter 4', ...);
test('V8 chapter 27 pada templat A', ...);
test('V8 level tidak cocok dengan templat', ...);            // bab 7 templat A ditulis dasar
test('V9 dua halaman berslug sama', ...);
test('V10 prerequisites menunjuk halaman tak ada', ...);
test('V10 halaman terbit mensyaratkan halaman draf', ...);
test('V11 lastVerified besok', ...);
test('V12 beranda tanpa tech lolos', ...);
test('versi tanpa kutip di file YAML ditolak', async () =>   // Review Focus 1, lewat file sungguhan
  expect((await errors({ 'src/data/tech/python.yaml': pythonYaml.replace('"3.x"', '3.10') })).join())
    .toContain('tanda kutip'));
```

Setiap tes menegaskan tepat satu galat dan bahwa pesannya memuat nilai yang salah.

- [ ] **Step 2: Jalankan, pastikan gagal.**
- [ ] **Step 3: Implementasikan `frontmatter.ts`, `validate.ts`, dan CLI**; tambahkan skrip `validate` dan langkah `pnpm validate` di kedua workflow.
- [ ] **Step 4: Jalankan, pastikan lolos**, lalu `pnpm validate` di repo. Expected: keluar 0, tiga peringatan V4 untuk `alternatives` Python.
- [ ] **Step 5: Commit.** `git commit -m "feat: tambah validasi konten"`

### Task 11: Hooks

**Files:**
- Create: `src/lib/hook-io.ts`, `scripts/hooks/validate-edited.mjs`, `scripts/hooks/protect-files.mjs`, `scripts/hooks/validate-on-stop.mjs`, `tests/unit/hook-io.test.ts`, `tests/unit/hooks.test.ts`
- Modify: `.claude/settings.json`

Konsep: **hook** adalah perintah yang dijalankan Claude Code sendiri pada peristiwa tertentu. Hook menerima JSON lewat stdin; keluar dengan kode 2 berarti menolak, dan isi stderr dikembalikan ke Claude. Kode selain 0 dan 2 tidak menolak apa pun.

**Interfaces:**
- Consumes: `loadProject`, `validateProject` (Task 10); `today` (Task 9).
- Produces:
  - `toRepoRelative(filePath: string, repoRoot: string): string | null` — hasil gaya POSIX; `null` bila di luar repo. Menerima `\` maupun `/`; huruf drive tidak peka kapital.
  - `isContentPath(rel: string): boolean` — di bawah `src/content/` atau `src/data/`.
  - `isProtectedPath(rel: string): boolean` — `pnpm-lock.yaml` atau di bawah `src/data/metrics/`.
  - Tiga skrip hook yang membaca stdin dan menentukan root repo dari lokasi file skrip, bukan dari direktori kerja.

| Peristiwa | Matcher | Skrip | Perilaku |
|---|---|---|---|
| `PreToolUse` | `Edit\|Write` | `protect-files.mjs` | `tool_input.file_path` terlindungi → stderr "File ini hanya diubah oleh alat", keluar 2 |
| `PostToolUse` | `Edit\|Write` | `validate-edited.mjs` | Path konten → validasi file itu; ada error → cetak ke stderr, keluar 2. Path lain → keluar 0 |
| `Stop` | — | `validate-on-stop.mjs` | Bila `git status --porcelain -- src/content src/data` tidak kosong → validasi menyeluruh; ada error → keluar 2. Bila `stop_hook_active` benar → keluar 0 supaya tidak berputar |

- [ ] **Step 1: Tulis tes yang gagal.**

```ts
test('path Windows dengan huruf drive beda kapital', () =>                    // Review Focus 2
  expect(toRepoRelative('c:\\D\\vibapps\\devmecum\\src\\data\\tech\\python.yaml', 'C:\\D\\vibapps\\devmecum'))
    .toBe('src/data/tech/python.yaml'));
test('path POSIX', () =>
  expect(toRepoRelative('/home/r/devmecum/src/content/docs/index.mdx', '/home/r/devmecum')).toBe('src/content/docs/index.mdx'));
test('di luar repo → null', () => {
  expect(toRepoRelative('C:\\D\\lain\\a.md', 'C:\\D\\vibapps\\devmecum')).toBeNull();
  expect(toRepoRelative('C:\\D\\vibapps\\devmecum-lama\\a.md', 'C:\\D\\vibapps\\devmecum')).toBeNull();
});
test('klasifikasi path', () => {
  expect(isContentPath('src/data/tech/python.yaml')).toBe(true);
  expect(isContentPath('src/lib/ids.ts')).toBe(false);
  expect(isProtectedPath('pnpm-lock.yaml')).toBe(true);
  expect(isProtectedPath('src/data/metrics/github.json')).toBe(true);
  expect(isProtectedPath('src/data/tech/python.yaml')).toBe(false);
});
```

`tests/unit/hooks.test.ts` menjalankan skrip sebagai proses anak dengan JSON di stdin:

```ts
test('protect-files menolak lockfile', () => expect(run('protect-files', { tool_input: { file_path: abs('pnpm-lock.yaml') } }).status).toBe(2));
test('protect-files meloloskan file biasa', () => expect(run('protect-files', { tool_input: { file_path: abs('README.md') } }).status).toBe(0));
test('validate-edited meloloskan file di luar konten', () => expect(run('validate-edited', { tool_input: { file_path: abs('src/lib/ids.ts') } }).status).toBe(0));
test('validate-edited meloloskan python.yaml yang sah', () => expect(run('validate-edited', { tool_input: { file_path: abs('src/data/tech/python.yaml') } }).status).toBe(0));
test('stdin kosong atau bukan JSON tidak menolak', () => expect(run('protect-files', '').status).toBe(0));
```

- [ ] **Step 2: Jalankan, pastikan gagal.**
- [ ] **Step 3: Implementasikan `hook-io.ts` dan ketiga skrip.** Nama kolom masukan hook (`tool_input.file_path`, `stop_hook_active`) dicocokkan dulu dengan dokumentasi hooks terkini.
- [ ] **Step 4: Daftarkan di `.claude/settings.json`** sesuai tabel; perintahnya `node scripts/hooks/<nama>.mjs`.
- [ ] **Step 5: Jalankan, pastikan lolos**, lalu uji nyata di sesi baru: minta Claude mengubah `latestVersion` Python menjadi angka tanpa kutip. Expected: hook `PostToolUse` mengembalikan galat "tanda kutip" dan Claude memperbaikinya. Minta Claude mengedit `pnpm-lock.yaml`. Expected: ditolak.
- [ ] **Step 6: Commit.** `git commit -m "feat: tambah hooks validasi dan pelindung file"`

### Task 12: Konten uji, pembaca data, dan penyaringan draf

**Files:**
- Create: `src/lib/data.ts`, `src/content/docs/fondasi/uji-komponen/index.mdx`, `…/02-prasyarat/halaman-usang.mdx`, `…/03-konsep-inti-dan-teori/halaman-draf.mdx`, `…/03-konsep-inti-dan-teori/halaman-diagram.mdx`, `tests/e2e/draf.spec.ts`

**Interfaces:**
- Consumes: koleksi dari Task 7; `computeStage` (Task 9); `buildIdIndex` (Task 8).
- Produces (dari `src/lib/data.ts`, hanya untuk kode Astro):
  - `getAllTech(): Promise<Tech[]>` — tanpa `uji-komponen` kecuali `DEVMECUM_FIXTURES=1`.
  - `getTech(slug: string): Promise<Tech | undefined>`, `getDomain(id: string): Promise<Domain | undefined>`, `getTemplate(id: string): Promise<Template | undefined>`
  - `getTechPages(slug: string): Promise<TechPage[]>` dengan `TechPage = { id: string; href: string; title: string; chapter: number; relPath: string; slug: string }` — hanya halaman yang tidak berstatus draf, urut `chapter` lalu `relPath`.
  - `getIdIndex(): Promise<Map<string, string>>`, `getStage(slug: string): Promise<Stage>`
  - Halaman uji: `index.mdx` (bab 1, terbit, `lastVerified: 2026-11-01`, dua sumber, `codeTested: true`); `halaman-usang` (bab 2, `dasar`, terbit, `lastVerified: 2020-01-01`, `codeTested: false`, memuat kata unik `kuartadesimal`); `halaman-draf` (bab 3, `dasar`, `status: draf`); `halaman-diagram` (bab 3, `dasar`, terbit, `prerequisites: [uji-komponen/halaman-usang]`). Semua ber-`techVersion: "1.0"`; `sources` memakai `https://example.com/…`.

- [ ] **Step 1: Tulis tes e2e yang gagal.**

```ts
test('halaman terbit ada di build', async ({ page }) =>
  expect((await page.goto('/fondasi/uji-komponen/'))?.status()).toBe(200));
test('halaman draf tidak ikut dibangun', async ({ page }) =>
  expect((await page.goto('/fondasi/uji-komponen/03-konsep-inti-dan-teori/halaman-draf/'))?.status()).toBe(404));
```

- [ ] **Step 2: Jalankan, pastikan gagal.** `pnpm test:e2e`
- [ ] **Step 3: Tulis keempat halaman uji dan `data.ts`.** Isi halaman cukup teks pendek; komponen ditambahkan di task-task M1-C.
- [ ] **Step 4: Jalankan, pastikan lolos.** `pnpm test:e2e`; `pnpm validate` keluar 0; `pnpm build; node scripts/assert-no-fixtures.mjs` keluar 0 (build biasa tidak memuat konten uji).
- [ ] **Step 5: Commit, PR, merge (👤).** `git commit -m "feat: tambah konten uji dan pembaca data"`

---

## M1-C — Tampilan

Tes e2e di fase ini berjalan pada build dengan konten uji. Setiap task diakhiri `pnpm check; pnpm test; pnpm test:e2e` yang lolos sebelum commit.

### Task 13: Sidebar per teknologi, navigasi, dan filter pencarian

**Files:**
- Create: `src/lib/sidebar.ts`, `src/routeData.ts`, `tests/unit/sidebar.test.ts`, `tests/e2e/navigasi.spec.ts`, `tests/e2e/pencarian.spec.ts`
- Modify: `astro.config.mjs` (`routeMiddleware: './src/routeData.ts'`)

**Interfaces:**
- Consumes: `getTech`, `getDomain`, `getTemplate`, `getTechPages` (Task 12).
- Produces:
  - `buildTechSidebar(input: { techName: string; template: Template; pages: TechPage[]; currentHref: string }): SidebarEntry[]` — `SidebarEntry` adalah tipe entri sidebar milik Starlight (`StarlightRouteData['sidebar'][number]`).
  - `paginate(pages: TechPage[], currentHref: string): { prev?: { href: string; label: string }; next?: { href: string; label: string } }`
  - Middleware mengisi `starlightRoute.sidebar`, `starlightRoute.pagination`, dan menambah tiga meta ke `starlightRoute.head`: `data-pagefind-filter="domain[content]"`, `"level[content]"`, `"jenis[content]"` berisi nama domain, level, dan jenis teknologi.

Bentuk sidebar: tautan `Beranda` → `/`, lalu satu grup bernama teknologi berisi tautan `Ringkasan` (bab 1) dan satu subgrup per bab yang punya halaman, berlabel `<nomor> · <judul bab>`. Subgrup tertutup kecuali yang memuat halaman aktif. Halaman tanpa `tech` hanya mendapat tautan `Beranda`.

- [ ] **Step 1: Tulis tes unit yang gagal.**

```ts
const sb = buildTechSidebar({ techName: 'Python', template: tplA, currentHref: '/bahasa/python/04-sintaks-dasar/variabel/', pages });
test('hanya Beranda dan grup teknologi', () => expect(sb.map(e => e.label)).toEqual(['Beranda', 'Python']));
test('Ringkasan lalu subgrup per bab berurutan', () =>
  expect(sb[1].entries.map(e => e.label)).toEqual(['Ringkasan', '2 · Pengenalan', '4 · Sintaks dasar']));
test('bab tanpa halaman tidak muncul', () => expect(labels(sb)).not.toContain('3 · Lingkungan kerja'));
test('halaman aktif ditandai dan grupnya terbuka', () => {
  expect(find(sb, 'Variabel').isCurrent).toBe(true);
  expect(group(sb, '4 · Sintaks dasar').collapsed).toBe(false);
  expect(group(sb, '2 · Pengenalan').collapsed).toBe(true);
});
test('pagination tetap di dalam teknologi', () => {
  expect(paginate(pages, pages[0].href)).toEqual({ next: { href: pages[1].href, label: pages[1].title } });
  expect(paginate(pages, pages.at(-1).href).next).toBeUndefined();
});
```

- [ ] **Step 2: Tulis tes e2e yang gagal.**

```ts
test('sidebar hanya memuat teknologi yang dibuka', async ({ page }) => {
  await page.goto('/fondasi/uji-komponen/02-prasyarat/halaman-usang/');
  const hrefs = await page.locator('nav[aria-label="Utama"] a').evaluateAll(a => a.map(x => x.getAttribute('href')));
  expect(hrefs.every(h => h === '/' || h.startsWith('/fondasi/uji-komponen/'))).toBe(true);
  expect(await page.content()).not.toContain('/bahasa/python/');
});
test('sebelumnya/berikutnya dan daftar isi ada', ...);
test('pencarian menemukan kata unik dan menawarkan filter', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Cari' }).click();
  await page.getByRole('searchbox').fill('kuartadesimal');
  await expect(page.getByRole('link', { name: /Halaman usang/ })).toBeVisible();
  for (const f of ['domain', 'level', 'jenis']) await expect(page.getByText(f, { exact: false }).first()).toBeVisible();
});
```

Nama aksesibel (`Utama`, `Cari`) dicocokkan dengan terjemahan `id` Starlight saat menulis tes.

- [ ] **Step 3: Jalankan, pastikan gagal.**
- [ ] **Step 4: Implementasikan `sidebar.ts` dan `routeData.ts`.**
- [ ] **Step 5: Jalankan, pastikan lolos.**
- [ ] **Step 6: Commit.** `git commit -m "feat: tambah sidebar per teknologi dan filter pencarian"`

### Task 14: Tema dan pengaturan baca

**Files:**
- Create: `src/lib/prefs.ts`, `src/overrides/ThemeProvider.astro`, `src/overrides/ThemeSelect.astro`, `src/components/DisplaySettings.astro`, `src/styles/settings.css`, `src/styles/themes/{light,dark,sepia,contrast}.css`, `tests/unit/prefs.test.ts`, `tests/e2e/tema.spec.ts`, `tests/e2e/a11y.spec.ts`
- Modify: `astro.config.mjs` (`components`, `customCss`)

**Interfaces:**
- Produces:
  - Kunci `localStorage`: `devmecum:tampilan`, berisi JSON `Prefs`.
  - `type Prefs = { tema: 'auto'|'light'|'dark'|'sepia'|'contrast'; aksen: 'biru'|'hijau'|'ungu'|'jingga'; huruf: 'kecil'|'normal'|'besar'|'sangat-besar'; lebar: 'sempit'|'normal'|'lebar'; fontKode: 'bawaan'|'klasik'|'lokal' }`
  - `DEFAULT_PREFS = { tema: 'auto', aksen: 'biru', huruf: 'normal', lebar: 'normal', fontKode: 'bawaan' }`
  - `parsePrefs(raw: string | null): Prefs` — apa pun yang tidak sah diganti nilai bawaan, per kolom.
  - `prefsToAttrs(prefs: Prefs, systemLight: boolean): { 'data-theme': 'light'|'dark'; 'data-tema': 'light'|'dark'|'sepia'|'contrast'; 'data-aksen': string; 'data-huruf': string; 'data-lebar': string; 'data-font-kode': string }`
  - Atribut dipasang di `<html>`. `data-theme` tetap `light` atau `dark` (kontrak Starlight dan Expressive Code): `sepia` → `light`, `contrast` → `dark`.

Keputusan tampilan: label pilihan tema "Ikuti sistem, Terang, Gelap, Sepia, Kontras tinggi". Ukuran huruf mengalikan ukuran dasar 0,9 / 1 / 1,125 / 1,25. Lebar konten 40 / 45 / 55 rem. Font kode: bawaan Starlight; `'Courier New', Courier, monospace`; `'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace` (hanya font yang sudah terpasang di perangkat pembaca, tidak ada unduhan). Tema `contrast` mengabaikan pilihan aksen. Palet tiap tema bebas selama tes kontras lolos (§14). Tiap berkas tema menimpa variabel `--sl-color-*` di bawah selektor `:root[data-tema='…']`.

`ThemeProvider.astro` menulis satu skrip inline di `<head>` yang dibangkitkan dari sumber `parsePrefs` dan `prefsToAttrs` (`Function.prototype.toString`), sehingga hanya ada satu implementasi; karena itu kedua fungsi tidak boleh merujuk apa pun di luar badannya selain argumen. `ThemeSelect.astro` menampilkan tombol "Tampilan" yang membuka `<dialog>` berisi `DisplaySettings` (custom element `dm-display-settings`).

- [ ] **Step 1: Tulis tes unit yang gagal.**

```ts
test.each([null, '', 'bukan json', '[]', '42', '{"tema":"neon","huruf":7}'])(   // Review Focus 4
  'masukan rusak %j → nilai bawaan', raw => expect(parsePrefs(raw)).toEqual(DEFAULT_PREFS));
test('kolom sah dipertahankan, yang rusak diganti', () =>
  expect(parsePrefs('{"tema":"sepia","aksen":"merah"}')).toEqual({ ...DEFAULT_PREFS, tema: 'sepia' }));
test.each([
  ['auto', true, 'light', 'light'], ['auto', false, 'dark', 'dark'],
  ['sepia', false, 'light', 'sepia'], ['contrast', true, 'dark', 'contrast'],
])('tema %s, sistem terang=%s', (tema, sys, base, shown) => {
  const a = prefsToAttrs({ ...DEFAULT_PREFS, tema }, sys);
  expect([a['data-theme'], a['data-tema']]).toEqual([base, shown]);
});
```

- [ ] **Step 2: Tulis tes e2e yang gagal.**

```ts
const url = '/fondasi/uji-komponen/';
test('memilih Sepia mengubah atribut dan bertahan setelah muat ulang', ...);   // lewat dialog Tampilan
test('tema terpasang tanpa skrip eksternal (tidak berkedip)', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('devmecum:tampilan', '{"tema":"sepia"}'));
  await page.route('**/*.js', r => r.abort());
  await page.goto(url);
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'sepia');
});
test('preferensi rusak tidak merusak halaman', async ({ page }) => {             // Review Focus 4
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => localStorage.setItem('devmecum:tampilan', '{rusak'));
  await page.goto(url);
  await expect(page.locator('html')).toHaveAttribute('data-aksen', 'biru');
  expect(errors).toEqual([]);
});
test('localStorage diblokir tidak merusak halaman', ...);   // addInitScript membuat getItem melempar
test('ukuran huruf, lebar, dan font kode mengubah gaya terhitung', ...);
```

```ts
// a11y.spec.ts — 13 kombinasi: light/dark/sepia × 4 aksen, plus contrast
for (const [tema, aksen] of combos) test(`kontras AA: ${tema} + ${aksen}`, async ({ page }) => {
  // setel preferensi lewat addInitScript, buka url
  const r = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
  expect(r.violations).toEqual([]);
});
test('tidak ada pelanggaran WCAG 2 A/AA di tema bawaan', async ({ page }) => {
  await page.goto(url);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
});
```

- [ ] **Step 3: Jalankan, pastikan gagal.**
- [ ] **Step 4: Implementasikan.**
- [ ] **Step 5: Jalankan, pastikan lolos.**
- [ ] **Step 6 (👤): Tinjau tampilan.** `pnpm dev`, pemilik mencoba keempat tema, aksen, dan pengaturan baca di halaman uji. Koreksi palet dikerjakan sebelum commit.
- [ ] **Step 7: Commit.** `git commit -m "feat: tambah empat tema dan pengaturan baca"`

### Task 15: Kepala halaman dan tautan lapor

**Files:**
- Create: `src/overrides/PageTitle.astro`, `src/overrides/EditLink.astro`, `src/components/{Breadcrumb,LevelBadge,StageBadge,FreshnessStamp}.astro`, `tests/e2e/kepala-halaman.spec.ts`
- Modify: `astro.config.mjs` (`components`, `editLink`)

**Interfaces:**
- Consumes: `getTech`, `getDomain`, `getTemplate`, `getStage` (Task 12); `isStale`, `formatDate`, `today` (Task 9); `STAGE_LABELS`; `site.config.mjs`.
- Produces: komponen `LevelBadge` (prop `level: Level`; `umum` tidak menampilkan apa pun), `StageBadge` (prop `stage: Stage`), `FreshnessStamp` (tanpa prop; membaca entri halaman aktif).

Teks tetap: remah roti `Beranda › <nama domain> › <nama teknologi>` ditambah `› <judul bab>` di halaman bab (hanya `Beranda` dan nama teknologi yang berupa tautan, K7). Stempel: `Membahas versi <techVersion> · Diverifikasi <tanggal>`. Lencana `Perlu ditinjau` bila `isStale(lastVerified, domain.freshnessMonths, today())`. Label `Belum diuji otomatis` bila `codeTested: false`. Bila `site.repo.public` salah, `editLink` tidak disetel dan `EditLink.astro` tidak merender apa pun; bila benar, ia merender `Sunting halaman` dan `Lapor kesalahan` (tautan ke formulir issue baru GitHub dengan judul berisi path halaman).

- [ ] **Step 1: Tulis tes e2e yang gagal.**

```ts
test('halaman segar: stempel tanpa lencana tinjau', async ({ page }) => {
  await page.goto('/fondasi/uji-komponen/');
  await expect(page.getByText('Membahas versi 1.0 · Diverifikasi 1 November 2026')).toBeVisible();
  await expect(page.getByText('Perlu ditinjau')).toHaveCount(0);
});
test('halaman usang: lencana tinjau, level, dan label belum diuji', async ({ page }) => {
  await page.goto('/fondasi/uji-komponen/02-prasyarat/halaman-usang/');
  for (const t of ['Diverifikasi 1 Januari 2020', 'Perlu ditinjau', 'Belum diuji otomatis', 'Dasar'])
    await expect(page.getByText(t, { exact: true }).first()).toBeVisible();
});
test('remah roti', ...);   // 'Beranda', 'Fondasi', 'Uji Komponen', 'Prasyarat' berurutan
test('tautan sunting dan lapor menuju repo GitHub', async ({ page }) => {
  await page.goto('/fondasi/uji-komponen/');
  await expect(page.getByRole('link', { name: 'Sunting halaman' })).toHaveAttribute('href',
    /github\.com\/.+\/devmecum\/edit\/main\/src\/content\/docs\/fondasi\/uji-komponen\/index\.mdx$/);
  await expect(page.getByRole('link', { name: 'Lapor kesalahan' })).toHaveAttribute('href', /github\.com\/.+\/devmecum\/issues\/new\?/);
});
test('beranda tidak menampilkan stempel', ...);
```

- [ ] **Step 2: Jalankan, pastikan gagal.**
- [ ] **Step 3: Implementasikan.**
- [ ] **Step 4: Jalankan, pastikan lolos**; tes kontras Task 14 tetap lolos.
- [ ] **Step 5: Commit.** `git commit -m "feat: tambah kepala halaman dengan stempel kemutakhiran"`

### Task 16: Komponen konten dan kerangka Ringkasan

**Files:**
- Create: `src/components/{TechCard,ProsCons,BestPractice,VersionNote}.astro`, `templates/ringkasan.mdx`, `tests/e2e/komponen.spec.ts`
- Modify: `src/content/docs/fondasi/uji-komponen/index.mdx` (memakai semua komponen dan fitur blok kode)

**Interfaces:**
- Consumes: `getTech`, `getStage`, `getIdIndex` (Task 12); `resolveId` (Task 8); `StageBadge` (Task 15).
- Produces (dipakai penulis konten lewat `import X from '@components/X.astro'`):
  - `<TechCard />` — tanpa prop; membaca `tech` halaman aktif. Dibungkus `<section aria-label="Kartu data">`. Daftar definisi berisi: Jenis, Pembuat, Rilis pertama, Lisensi, Situs resmi, Dokumentasi, Versi terbaru, Kematangan (`StageBadge`), Prasyarat, Alternatif, Kegunaan. Baris tanpa data tidak ditampilkan. Prasyarat dan alternatif yang terdaftar menjadi tautan; yang belum, teks biasa.
  - `<ProsCons>` dengan slot bernama `keunggulan` dan `kelemahan`.
  - `<BestPractice>` — callout berjudul `Praktik terbaik`.
  - `<VersionNote version="3.12">` — callout berjudul `Baru di versi 3.12`, dengan atribut `data-version-note="3.12"` supaya bisa dicari (§9).
  - Callout Catatan, Tips, Peringatan memakai sintaks bawaan Starlight `:::note`, `:::tip`, `:::caution`.
  - `templates/ringkasan.mdx`: frontmatter §5.8 berisi penanda `GANTI`, `status: draf`, impor komponen, dan dua belas judul bagian §5.5 berurutan, masing-masing dengan komentar satu baris tentang isinya.

Label jenis: `language` Bahasa pemrograman · `framework` Framework · `library` Library · `tool` Tool · `platform` Platform · `database` Database · `concept` Konsep · `standard` Standar.

- [ ] **Step 1: Tulis tes e2e yang gagal.**

```ts
test('kartu data berasal dari file data', async ({ page }) => {
  await page.goto('/fondasi/uji-komponen/');
  const card = page.getByRole('region', { name: 'Kartu data' });
  await expect(card.getByText('Konsep')).toBeVisible();
  await expect(card.getByText('Ringkasan')).toBeVisible();                       // tingkat kematangan
  await expect(card.getByRole('link', { name: 'Python' })).toHaveAttribute('href', '/bahasa/python/');
});
test('keunggulan dan kelemahan tampil sebagai dua daftar berjudul', ...);
test('callout Praktik terbaik dan Baru di versi 1.0', async ({ page }) => {
  await page.goto('/fondasi/uji-komponen/');
  await expect(page.getByText('Praktik terbaik')).toBeVisible();
  await expect(page.locator('[data-version-note="1.0"]')).toContainText('Baru di versi 1.0');
});
test('blok kode: tombol salin, nama file, sorotan baris, diff, tab', ...);       // fitur bawaan, dipastikan aktif
```

Tambah satu tes unit: `templates/ringkasan.mdx` memuat tepat dua belas judul `## ` dengan urutan §5.5, dan frontmatter-nya lolos `materiSchema` setelah penanda `GANTI` diisi nilai contoh.

- [ ] **Step 2: Jalankan, pastikan gagal.**
- [ ] **Step 3: Implementasikan komponen, lengkapi halaman uji, tulis kerangka.**
- [ ] **Step 4: Jalankan, pastikan lolos**; tes kontras Task 14 tetap lolos.
- [ ] **Step 5: Commit.** `git commit -m "feat: tambah komponen konten dan kerangka Ringkasan"`

### Task 17: Diagram

**Files:**
- Create: `src/components/Diagram.astro`, `tests/e2e/diagram.spec.ts`
- Modify: `src/styles/base.css`, `src/content/docs/fondasi/uji-komponen/03-konsep-inti-dan-teori/halaman-diagram.mdx`

**Interfaces:**
- Produces: `<Diagram title="…" code={`…`} />` — `title` wajib dan menjadi `aria-label`; `code` berisi sintaks Mermaid. Dirender saat build menjadi SVG inline di dalam `<figure class="dm-diagram">` lewat `mermaid-isomorphic`. Warna simpul, garis, dan teks ditimpa di `base.css` memakai variabel `--sl-color-*` agar mengikuti keempat tema. Sintaks Mermaid yang salah menggagalkan build dengan pesan yang menyebut `title` diagramnya.

- [ ] **Step 1: Tulis tes e2e yang gagal.**

```ts
const url = '/fondasi/uji-komponen/03-konsep-inti-dan-teori/halaman-diagram/';
test('diagram dirender saat build sebagai SVG berlabel', async ({ page }) => {
  await page.route('**/*.js', r => r.abort());
  await page.goto(url);
  await expect(page.locator('figure.dm-diagram svg')).toBeVisible();
  await expect(page.getByRole('img', { name: 'Alur uji' })).toBeVisible();
});
test('tidak ada pustaka Mermaid yang dikirim ke browser', async ({ page }) => {
  const scripts: string[] = []; page.on('request', r => r.resourceType() === 'script' && scripts.push(r.url()));
  await page.goto(url);
  expect(scripts.filter(s => /mermaid/i.test(s))).toEqual([]);
});
```

Tambahkan halaman diagram ke daftar halaman yang diperiksa tes kontras Task 14 untuk tema `dark` dan `contrast`.

- [ ] **Step 2: Jalankan, pastikan gagal.**
- [ ] **Step 3: Implementasikan.**
- [ ] **Step 4: Jalankan, pastikan lolos.** Uji tangan satu kali: rusak sintaks diagram, `pnpm build` harus gagal dan menyebut "Alur uji"; kembalikan.
- [ ] **Step 5: Commit.** `git commit -m "feat: tambah komponen diagram yang dirender saat build"`

### Task 18: SEO, tautan internal, dan anggaran performa

**Files:**
- Create: `src/pages/og/[tech].png.ts`, `tests/e2e/seo.spec.ts`
- Modify: `src/routeData.ts` (meta `og:image`), `astro.config.mjs` (plugin `starlightLinksValidator()`), `lighthouserc.json`

**Interfaces:**
- Consumes: `getAllTech`, `getDomain` (Task 12); `site.config.mjs`.
- Produces: `/og/<slug>.png` berukuran 1200×630 untuk setiap teknologi, dibuat dengan `sharp` dari SVG berisi nama teknologi, nama domain, dan "Devmecum" (font `sans-serif` generik, tanpa file font). Halaman ber-`tech` mendapat `og:image` dan `twitter:image` bernilai `<site.url>/og/<tech>.png`. Satu gambar per teknologi, bukan per halaman (§7).

- [ ] **Step 1: Tulis tes e2e yang gagal.**

```ts
test('peta situs memuat halaman terbit dan tidak memuat draf', async ({ request }) => {
  const xml = await (await request.get('/sitemap-0.xml')).text();
  expect(xml).toContain('/fondasi/uji-komponen/');
  expect(xml).not.toContain('halaman-draf');
});
test('gambar pratinjau per teknologi', async ({ page, request }) => {
  await page.goto('/fondasi/uji-komponen/02-prasyarat/halaman-usang/');
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(og).toMatch(/^https:\/\/.+\/og\/uji-komponen\.png$/);
  const buf = await (await request.get('/og/uji-komponen.png')).body();
  expect(buf.subarray(1, 4).toString()).toBe('PNG');
  expect([buf.readUInt32BE(16), buf.readUInt32BE(20)]).toEqual([1200, 630]);
});
test('setiap halaman punya deskripsi dan URL kanonik', ...);
test('halaman baca tidak memuat apa pun dari origin lain', async ({ page }) => {
  const foreign: string[] = [];
  page.on('request', r => { if (!r.url().startsWith('http://localhost:4321') && !r.url().startsWith('data:')) foreign.push(r.url()); });
  await page.goto('/fondasi/uji-komponen/', { waitUntil: 'networkidle' });
  expect(foreign).toEqual([]);
});
```

- [ ] **Step 2: Jalankan, pastikan gagal.**
- [ ] **Step 3: Implementasikan.** Ganti `collect.url` di `lighthouserc.json` menjadi `["/fondasi/uji-komponen/"]`.
- [ ] **Step 4: Jalankan, pastikan lolos.** `pnpm test:e2e; pnpm lhci` → keempat kategori ≥ 0,95. Uji tangan penjaga tautan: tambahkan tautan Markdown ke `/tidak/ada/` di halaman uji, `pnpm build` harus gagal menyebut tautan itu; kembalikan.
- [ ] **Step 5: Commit, PR, merge (👤).** `git commit -m "feat: tambah gambar pratinjau, pemeriksa tautan, dan anggaran Lighthouse"`. Pemilik meninjau pratinjau PR (halaman uji tampil di sana) sebelum merge.

---

## M1-D — Jalur konten minimal

### Task 19: Panduan menulis

**Files:**
- Create: `docs/panduan-menulis.md`

- [ ] **Step 1: Tulis panduan**, paling banyak 250 baris, dengan bagian berikut:
  1. **Prinsip** — delapan standar §10 disalin sebagai daftar, masing-masing dengan satu contoh benar dan satu contoh salah.
  2. **Bahasa** — baku tetapi santai; kata ganti "kamu"; istilah teknis tetap Inggris tanpa cetak miring; istilah baru dijelaskan saat pertama muncul.
  3. **Anatomi halaman Ringkasan** — dua belas bagian §5.5, 600–1.200 kata, dengan panjang sasaran tiap bagian.
  4. **Frontmatter** — arti setiap kolom §5.8; versi selalu dalam tanda kutip; siapa yang boleh mengisi `factChecked` (hanya skill `verifikasi-halaman` setelah pemeriksa fakta menyatakan lolos).
  5. **Sumber** — urutan: dokumentasi resmi, catatan rilis, dokumen standar. Minimal dua sumber resmi untuk Ringkasan. Setiap angka dan klaim performa bersumber. Dilarang menyalin kalimat dokumentasi.
  6. **Contoh kode** — utuh, bisa dijalankan apa adanya, keluaran ditulis persis seperti hasil menjalankannya, diutamakan lintas platform.
  7. **Keunggulan dan kelemahan** — berimbang, berkonteks ("lambat untuk X dibanding Y karena Z"), tanpa superlatif tak bersumber.
  8. **Komponen** — kapan memakai `TechCard`, `ProsCons`, `BestPractice`, `VersionNote`, `Diagram`, dan callout bawaan, masing-masing dengan cuplikan.
  9. **Rujukan** — selalu ID (§5.8), tidak pernah path atau URL internal.
  10. **Keamanan** — materi bersifat defensif.
- [ ] **Step 2 (👤): Persetujuan pemilik.** Pemilik membaca dan menyetujui atau mengoreksi. Koreksi dikerjakan sebelum commit.
- [ ] **Step 3: Commit.** `git commit -m "docs: tambah panduan menulis"`

### Task 20: Subagent peneliti dan pemeriksa fakta

**Files:**
- Create: `.claude/agents/peneliti.md`, `.claude/agents/pemeriksa-fakta.md`

Konsep: **subagent** adalah Claude lain yang bekerja di konteks terpisah dengan alat terbatas dan hanya mengembalikan laporan akhirnya. Pemeriksa fakta sengaja tidak tahu apa pun tentang proses penulisan, supaya tidak ikut percaya pada asumsi penulis.

**Interfaces:**
- Produces:
  - `peneliti` — `tools: Read, Grep, Glob, WebSearch, WebFetch` ditambah dua alat Context7. Masukan: slug teknologi. Keluaran: catatan Markdown dengan dua belas judul bagian §5.5; setiap fakta diikuti URL sumbernya; di akhir ada daftar "Tidak ditemukan sumber resmi" untuk hal yang tidak bisa dipastikan.
  - `pemeriksa-fakta` — `tools: Read, WebFetch, WebSearch`. Masukan: path satu file halaman. Keluaran: tabel `Klaim | Status | Sumber | Kutipan pendukung` dengan status `didukung`, `tidak didukung`, atau `tidak bisa diperiksa`, lalu satu baris terakhir persis `HASIL: LOLOS` atau `HASIL: GAGAL`. Lolos hanya bila tidak ada klaim `tidak didukung`.

- [ ] **Step 1: Tulis `peneliti.md`.** Isi wajib: hanya sumber resmi sesuai urutan di panduan menulis; mengambil versi terbaru dan tanggal rilisnya dari sumber, bukan dari ingatan; tidak menulis prosa halaman; tidak mengubah file apa pun; menandai setiap hal yang tidak pasti.
- [ ] **Step 2: Tulis `pemeriksa-fakta.md`.** Isi wajib: tugasnya mencari klaim yang tidak didukung, bukan mengonfirmasi halaman; memeriksa setiap kalimat faktual, angka, nama versi, dan tanggal terhadap URL di `sources` halaman itu, membuka sumber satu per satu; klaim yang benar menurut pengetahuan umum tetapi tidak ada di sumber tetap berstatus `tidak didukung`; memeriksa juga apakah ada kalimat yang disalin mentah dari sumber; tidak mengubah file.
- [ ] **Step 3: Verifikasi.** Mulai sesi baru (subagent dimuat di awal sesi). Jalankan `pemeriksa-fakta` pada `src/content/docs/fondasi/uji-komponen/index.mdx`. Expected: tabel sesuai format dan baris `HASIL: GAGAL`, karena sumber halaman uji adalah `example.com`. Jalankan `peneliti` untuk `python`. Expected: dua belas bagian, setiap fakta ber-URL.
- [ ] **Step 4: Commit.** `git commit -m "feat: tambah subagent peneliti dan pemeriksa fakta"`

### Task 21: Skill tulis-ringkasan dan verifikasi-halaman

**Files:**
- Create: `.claude/skills/tulis-ringkasan/SKILL.md`, `.claude/skills/verifikasi-halaman/SKILL.md`

Konsep: **skill** adalah petunjuk langkah demi langkah yang baru dimuat ke konteks saat dibutuhkan. Pakai skill `superpowers:writing-skills` saat menulis keduanya.

**Interfaces:**
- Consumes: subagent Task 20; `templates/ringkasan.mdx` (Task 16); `pnpm validate` (Task 10); `docs/panduan-menulis.md` (Task 19).
- Produces: dua skill yang bisa dipanggil dengan slug teknologi sebagai argumen.

- [ ] **Step 1: Tulis `tulis-ringkasan/SKILL.md`** dengan langkah berurutan:
  1. Pastikan `src/data/tech/<slug>.yaml` ada dan `pnpm validate` lolos; pastikan berada di cabang `konten/<slug>`.
  2. Jalankan subagent `peneliti` dengan slug itu.
  3. Salin `templates/ringkasan.mdx` ke `src/content/docs/<domain>/<slug>/index.mdx`; isi kedua belas bagian dari catatan peneliti mengikuti `docs/panduan-menulis.md`; `status: draf`. Hal di daftar "Tidak ditemukan sumber resmi" tidak ditulis.
  4. Perbarui `latestVersion` di file data bila catatan peneliti menunjukkan versi lebih baru.
  5. Jalankan `pnpm validate <file>` sampai lolos.
  6. Lanjut ke skill `verifikasi-halaman`. Skill ini tidak pernah menyetel `status: terbit` atau `factChecked`.
- [ ] **Step 2: Tulis `verifikasi-halaman/SKILL.md`** dengan langkah berurutan:
  1. Salin setiap contoh kode ke folder sementara, jalankan, bandingkan keluarannya dengan yang tertulis; perbaiki halaman bila berbeda. Setel `codeTested: true`; bila bahasanya tidak bisa dijalankan di komputer ini, `false`.
  2. Jalankan subagent `pemeriksa-fakta` dengan path file itu saja, tanpa catatan peneliti atau penjelasan lain.
  3. Bila `HASIL: GAGAL`: untuk tiap klaim `tidak didukung`, tambahkan sumber resmi yang memuatnya atau hapus klaimnya; ulangi langkah 2. Paling banyak tiga putaran; sesudah itu berhenti dan lapor ke pemilik.
  4. Bila `HASIL: LOLOS`: setel `factChecked` dan `lastVerified` ke tanggal hari ini, `status: terbit`; jalankan `pnpm validate`; commit.
  5. Aturan tetap: `factChecked` hanya diisi setelah baris `HASIL: LOLOS` dari subagent, tidak pernah dari penilaian sendiri.
- [ ] **Step 3: Verifikasi pemuatan.** Di sesi baru, ketik `/tulis-ringkasan` dan `/verifikasi-halaman`. Expected: keduanya muncul di daftar skill.
- [ ] **Step 4: Commit, PR, merge (👤).** `git commit -m "feat: tambah skill tulis-ringkasan dan verifikasi-halaman"`

---

## M1-E — Gladi resik

### Task 22: Python sampai tingkat Ringkasan lewat jalur konten

**Files:**
- Create: `src/content/docs/bahasa/python/index.mdx`
- Modify: `src/data/tech/python.yaml` (bila versi berubah), `src/content/docs/index.mdx` (tombol "Mulai dari Python" bertaut ke `/bahasa/python/`), `tests/e2e/beranda.spec.ts`, skill dan subagent (perbaikan dari hasil gladi)

Jalur yang diuji (§11.8, bagian yang ada di M1): `peneliti → menulis → menjalankan kode → pemeriksa-fakta → validasi otomatis → pull request → pratinjau → tinjauan pemilik → merge`.

- [ ] **Step 1: Catat waktu mulai** dan buat cabang `konten/python`.
- [ ] **Step 2: Jalankan `/tulis-ringkasan python`**, lalu `/verifikasi-halaman python`, dalam satu sesi tanpa menulis halaman di luar skill. Catat setiap titik di mana petunjuk skill kurang jelas atau harus dilanggar.
- [ ] **Step 3: Tambah tes e2e** bahwa beranda memuat tautan ke `/bahasa/python/` dan halaman itu berstatus 200 dengan lencana kematangan "Ringkasan"; perbarui beranda.
- [ ] **Step 4: Verifikasi lokal.** `pnpm validate` → keluar 0. `pnpm test; pnpm test:e2e` → lolos. Frontmatter Python memuat `status: terbit`, `factChecked`, minimal dua `sources`, `codeTested: true`.
- [ ] **Step 5: PR dan pratinjau.** `gh pr create`; isi deskripsi dengan lama pengerjaan, jumlah putaran pemeriksaan fakta, dan klaim yang dibuang.
- [ ] **Step 6 (👤): Tinjauan pemilik** di URL pratinjau: akurasi, gaya bahasa, kelengkapan dua belas bagian. Koreksi dikerjakan lewat skill yang sama, bukan dengan menyunting tangan lalu melewati verifikasi.
- [ ] **Step 7: Perbaiki jalur.** Ubah skill, subagent, atau `docs/panduan-menulis.md` berdasarkan catatan Step 2 dan koreksi Step 6. Perubahan ini masuk PR terpisah `m1/perbaikan-jalur` karena menyentuh berkas di luar konten.
- [ ] **Step 8: Merge (👤) dan verifikasi tayang.** Setelah `deploy.yml` selesai, buka `<URL situs>/bahasa/python/`. Expected: halaman tampil dengan kartu data, lencana "Ringkasan", stempel verifikasi bertanggal hari itu; pencarian "Python" menemukannya; `<URL situs>/fondasi/uji-komponen/` memberi 404.

---

## Selesai bila

- Situs tayang di `https://devmecum.<subdomain>.workers.dev` dengan beranda dan halaman Ringkasan Python yang lolos pemeriksaan fakta.
- `pnpm check`, `pnpm test`, `pnpm validate`, `pnpm test:e2e`, `pnpm budget`, dan `pnpm lhci` lolos di CI.
- Menambah teknologi kedua hanya memerlukan satu file YAML dan satu folder MDX.
- Hooks menolak suntingan lockfile dan mengembalikan galat validasi ke Claude.

## Catatan

Repo dibuka untuk publik pada 15 November 2026, saat riwayatnya baru berisi dokumen rancangan. Flag `repo.public` dipertahankan di `site.config.mjs` supaya tautan ke GitHub bisa dimatikan dari satu tempat bila repo ditutup lagi.
