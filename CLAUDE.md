# Devmecum

Buku panduan teknologi IT berbahasa Indonesia: situs statis Astro + Starlight. Rancangan ada di `docs/superpowers/specs/`, rencana per tahap di `docs/superpowers/plans/`.

## Perintah

- `pnpm dev` — server pengembangan
- `pnpm build` — build produksi ke `dist/`
- `pnpm check` — pemeriksaan tipe (`astro check`)
- `pnpm test` — tes unit (Vitest)
- `pnpm test:e2e` — build dengan konten uji, lalu tes Playwright
- `pnpm validate` — validasi konten dan data

## Cabang dan commit

- Cabang `m<N>/<topik>` untuk aplikasi, `konten/<slug>` untuk konten.
- Jangan pernah commit langsung ke `main`. Merge hanya lewat pull request yang CI-nya hijau.
- Pesan commit: Conventional Commits berbahasa Indonesia (`feat: …`, `fix: …`, `docs: …`).

## Batas pekerjaan

- Pekerjaan konten (`src/content/`, `src/data/`) tidak boleh mengubah kode aplikasi (`src/lib/`, `src/components/`, `src/overrides/`, `scripts/`, berkas konfigurasi) dalam PR yang sama, dan sebaliknya.
- `pnpm-lock.yaml` dan `src/data/metrics/` hanya diubah oleh alat, tidak diedit tangan.
- Menambah teknologi tidak boleh menuntut perubahan kode: cukup satu file YAML dan satu folder MDX.

## Aturan teknis

- Skrip ditulis sebagai Node `.mjs` (`node scripts/…`). Tidak ada bash: pemilik memakai Windows, CI memakai Linux.
- File di `src/lib/` harus bisa diimpor langsung oleh Node: hanya sintaks TypeScript yang bisa dihapus, impor relatif berakhiran `.ts`.
- Zod diimpor dari `astro/zod`.
- Jalankan Claude Code dari root repo. Hook memakai `${CLAUDE_PROJECT_DIR}`, yang mengikuti folder tempat sesi dimulai; dari subfolder, hook tidak menemukan skripnya dan perlindungan file tidak berjalan.
- Rujukan antarhalaman memakai ID (`python`, `python/variabel-tipe-data`), bukan path atau URL.

## Menulis konten

Standar penulisan ada di `docs/panduan-menulis.md`. Antarmuka dan konten berbahasa Indonesia; istilah teknis tetap Inggris.

## Keamanan

Repo ini publik. Jangan pernah meng-commit rahasia (token, kunci API, isi `.env`).
