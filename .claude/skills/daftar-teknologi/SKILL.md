---
name: daftar-teknologi
description: Gunakan saat diminta mendaftarkan teknologi ke katalog Devmecum (tingkat 0) dari docs/katalog.md, misalnya "/daftar-teknologi bahasa" atau "/daftar-teknologi typescript go". Argumen berupa id domain atau daftar slug.
---

# Mendaftarkan teknologi ke katalog

Argumen: `$ARGUMENTS` = id domain (mis. `bahasa`, `web-frontend`) atau satu/lebih slug (mis. `typescript go`). Hasilnya satu berkas `src/data/tech/<slug>.yaml` per teknologi (tingkat 0, "Terdaftar"). Skill ini **tidak** menulis halaman atau prosa, dan tidak membuat folder MDX; itu pekerjaan `tulis-ringkasan`.

Bahannya:

- `docs/katalog.md`: daftar yang disetujui, satu tabel per domain. Id domain ada di tanda kurung judul tabel (`## Bahasa pemrograman (bahasa)`). Kolom baris: `slug | Nama | type | Templat | Catatan`. Domain berasal dari tabelnya, bukan dari kolom. Templat di tabel sudah menuruti `type`; kolom Catatan memuat pengecualian dan petunjuk (mis. "Sudah terdaftar di src/data/tech/python.yaml").
- `docs/rubrik-adopsi.md`: aturan nilai `adoption` dan `trend`.
- `docs/panduan-menulis.md` §5: aturan sumber.

Bentuk berkas yang benar bisa dilihat di `src/data/tech/python.yaml`. Skema lengkapnya ada di `src/lib/schemas.ts` (`techSchema`).

## Langkah

1. **Siapkan.**
   - Pastikan berada di cabang `konten/katalog-<n>-<kelompok>` (atau cabang konten yang sedang dipakai); buat dari `main` bila belum, jangan pernah commit ke `main`. Pekerjaan ini tidak boleh mengubah kode aplikasi, `src/data/domains.yaml`, atau `src/data/templates.yaml`.
   - Tentukan entri: untuk id domain, semua baris tabel domain itu; untuk daftar slug, baris dengan slug itu. Lewati baris yang `src/data/tech/<slug>.yaml`-nya sudah ada.
   - Jalankan `pnpm validate` sebagai garis dasar, supaya galat lama tidak tertukar dengan galat baru.
2. **Buat kerangka, per entri.** Jalankan dari root repo, lewat PowerShell:

   ```
   pnpm new-tech <slug> --name "<Nama>" --domain <id-domain> --type <type> [--template <A-E>]
   ```

   - `<slug>`, `--name`, dan `--type` diambil persis dari baris katalog. `--template` hanya dipakai bila Catatan menyebut pengecualian (mis. `webassembly` memakai `A`); bila tidak, biarkan templat bawaan menurut `type`.
   - **Slug tidak boleh berawalan `uji-`**: awalan itu dicadangkan untuk teknologi uji, yang disembunyikan dari build produksi. CLI belum menolaknya, jadi periksa sendiri sebelum menjalankan.
   - `--name` satu baris saja: tanpa newline atau karakter kontrol.
   - CLI menolak menimpa berkas yang sudah ada. Jangan hapus lalu buat ulang berkas orang lain; laporkan saja.
3. **Isi dari sumber resmi.** Buka situs, dokumentasi, registri paket, atau repo resmi teknologi itu (WebFetch/WebSearch; setujui izinnya bila diminta; untuk pustaka, Context7 membantu). Ganti semua `GANTI` di berkas dan buka komentar kolom yang diisi:
   - `website`, `docs`: URL https resmi. `docs` mengarah ke dokumentasi, bukan beranda yang sama bila ada yang terpisah.
   - `license`: pengenal SPDX bila ada (`MIT`, `Apache-2.0`, `PSF-2.0`). Bila tidak ada pengenal SPDX atau tidak jelas, kosongkan.
   - `versionSource`: untuk teknologi yang punya versi, pilih satu sumber di antara `npm`, `pypi`, `crates`, `maven` (butuh `name`; Maven berbentuk `grup:artefak`), atau `github` (butuh `repo: pemilik/nama`). Utamakan registri paket resminya; pakai `github` bila teknologinya tidak punya paket (bahasa, alat, platform).
     - `github` tanpa `tagPattern` membaca GitHub Release terbaru lewat API (bisa kena batas laju). Bila repo tidak punya Release, atau tag-nya yang resmi, tambahkan `tagPattern`.
     - `tagPattern` hanya untuk `github`, wajib punya minimal satu grup tangkapan, dicocokkan **penuh** terhadap nama tag, dan versinya adalah grup-grup itu digabung titik. Contoh: `^go(\d+)\.(\d+)(?:\.(\d+))?$` untuk tag `go1.25.3`. Tulis regex yang **sederhana**: tanpa kuantor bersarang atau alternasi yang tumpang tindih (risiko ReDoS), cukup lurus seperti contoh itu.
     - Konsep dan standar (templat E) umumnya tidak punya `versionSource`; jangan dipaksakan. Tanpa `versionSource`, tanpa `latestVersion`.
   - `metrics`: `github: { repo: pemilik/nama }` bila ada repo resmi; `downloads: { registry: npm|pypi|crates, name: <paket> }` bila ada di registri itu. Jangan menambah `surveys`; itu diisi terpisah (rancangan §6).
   - `tags`: beberapa kata kunci pendek huruf kecil.
   - `useCases`: 2–4 frasa Indonesia pendek tentang untuk apa teknologi itu dipakai (gaya `python.yaml`), bukan kalimat panjang.
   - `creator` dan `firstRelease`: **hanya bila sumber resmi menyebutnya**, dengan komentar di barisnya: `creator: Nama # sumber: <URL>`. Bila tidak ada sumber resmi, hapus barisnya.
   - `requires`: hanya slug yang **sudah terdaftar** (berkas `src/data/tech/<slug>.yaml` sudah ada), dan tidak boleh melingkar. Jangan menunjuk slug yang belum ada.
   - `alternatives`: slug dari `docs/katalog.md`. Selama masa pendaftaran, slug yang belum terdaftar hanya menghasilkan peringatan `pnpm validate` (nanti menjadi galat di Task 21), jadi isilah, tetapi hanya dengan entri katalog, bukan nama karangan dan bukan diri sendiri.
   - `adoption` dan `trend`: nilai menurut `docs/rubrik-adopsi.md`, dengan **komentar bukti di baris yang sama** (satu kalimat dan satu URL): `adoption: mapan # bukti; URL`. Bila tak ada bukti selain bawaan, tulis nilai bawaan (`mapan`, `stabil`) dengan alasannya: `trend: stabil # bawaan rubrik: baru satu titik data survei`. Kosong hanya menghasilkan peringatan sementara, tetapi tetap isi. Ini penilaian editorial, jadi bukti harus bisa dilacak pemilik di PR.
   - Aturan keras: **jangan menebak fakta**. Bila sumber resmi tidak jelas untuk sebuah kolom opsional, kosongkan (komentari atau hapus barisnya). Bila `website`, `docs`, atau identitas teknologinya sendiri tidak bisa dipastikan dari sumber resmi, **jangan daftarkan**: hapus berkas kerangkanya dan masukkan ke laporan.
4. **Isi `latestVersion` dengan alat, bukan ingatan.** Setelah `versionSource` terisi untuk satu kelompok entri, jalankan:

   ```
   pnpm versions <slug…> --write
   ```

   - `--write` menulis `latestVersion: "<versi>" # dari <sumber> per <tanggal>` (disisipkan di bawah `docs:`). Hapus baris kerangka `# latestVersion: …` yang masih berkomentar agar tidak dobel.
   - Status `mutakhir` atau `tertinggal` berarti beres. Status `gagal` (laporan memuat sebabnya) berarti **sumbernya yang diperbaiki**: nama paket atau `repo` salah, repo tanpa Release (tambahkan `tagPattern`), atau `tagPattern` tidak cocok dengan tag mana pun. Jangan menulis versi dari ingatan untuk menambalnya. Bila tetap gagal sesudah sumber diperbaiki, laporkan entrinya.
   - `tanpa-sumber` hanya wajar untuk entri tanpa `versionSource`.
   - Bila `versionSource` ada tetapi `latestVersion` belum, `pnpm validate` melaporkan galat; itu hilang sesudah `--write` berhasil.
   - Dengan `tagPattern`, tag dibaca lewat `git ls-remote` (tanpa kuota API). Tanpa `tagPattern`, GitHub dan registri lain dibaca lewat HTTP dan bisa kena batas laju; bila kena, tunggu atau kerjakan per kelompok kecil, jangan ulangi tanpa henti.
5. **Validasi.**
   - `pnpm validate` harus tanpa **galat**. Peringatan tentang `alternatives` ke slug yang belum terdaftar dan tentang `adoption`/`trend` yang belum dinilai boleh ada selama masa pendaftaran; peringatan lain ditelusuri dulu.
   - `pnpm links src/data/tech/<slug>.yaml …` (semua berkas yang baru dibuat): tanpa tautan `mati`. `mati` berarti URL salah: ganti dengan URL resmi yang benar. `pindah` perbarui ke tujuan barunya. `tak-pasti` (situs memblokir bot, batas laju) bukan kegagalan, tetapi buka tautannya sekali untuk memastikan benar.
6. **Commit per domain:** `git add src/data/tech/<slug>.yaml …` lalu `git commit -m "docs: daftarkan teknologi <domain>"`. Hanya berkas YAML teknologi yang masuk commit.
7. **Laporkan** ke pemilik, dan untuk PR: sebuah tabel `slug | adoption | trend | bukti` untuk ditinjau, daftar entri yang **tidak didaftarkan** beserta alasannya (sumber resmi tidak jelas), entri yang `versions`-nya `gagal`, dan kolom opsional yang sengaja dikosongkan.

## Aturan tetap

- Jangan menulis prosa halaman, membuat folder MDX, atau mengubah `src/lib/`, `src/components/`, `src/overrides/`, `src/pages/`, `scripts/`, atau konfigurasi dalam PR yang sama. `pnpm-lock.yaml` dan `src/data/metrics/` tidak diedit tangan.
- Jangan mengedit `src/data/tech/python.yaml` atau berkas milik teknologi yang sudah terdaftar kecuali diminta; jangan menyentuh berkas `uji-*`.
- Jangan mengarang fakta. Kosongkan kolom opsional bila sumber resminya tidak jelas, dan laporkan.
- Jalankan `pnpm` lewat PowerShell di Windows: Vitest gagal di Git Bash karena modul termuat ganda (`C:/` vs `c:/`).

## Bila izin ditolak

Bila sebuah perintah ditolak izinnya (shell, git, atau tulis berkas), jangan mencari jalan lain. Berhenti, lalu laporkan perintah persisnya supaya pemilik bisa menjalankannya atau memberi izin.

## Mode tanpa antarmuka (`claude -p`)

Izin tambahan diberikan lewat flag, satu argumen per alat, dan prompt dikirim lewat stdin supaya tidak tertelan daftar alat. Di Windows sesi biasanya memakai alat PowerShell, jadi sertakan izin PowerShell dan Bash:

```
--allowedTools "WebFetch" "WebSearch" \
  "PowerShell(pnpm new-tech *)" "PowerShell(pnpm versions *)" "PowerShell(pnpm links *)" "PowerShell(pnpm validate *)" \
  "PowerShell(git add *)" "PowerShell(git commit *)" \
  "Bash(pnpm new-tech *)" "Bash(pnpm versions *)" "Bash(pnpm links *)" "Bash(pnpm validate *)" \
  "Bash(git add *)" "Bash(git commit *)" \
  --disallowedTools "Bash(git push *)" "PowerShell(git push *)"
```
