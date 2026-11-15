# Rancangan: Devmecum — Buku Panduan Teknologi IT

- Tanggal: 14 November 2026
- Status: disetujui pemilik proyek pada 15 November 2026
- Nama "Devmecum" dipilih pemilik proyek (dari *vade mecum*, buku saku rujukan). Registri tidak mencatat pendaftaran `devmecum.com` maupun `devmecum.dev` per 15 November 2026

Tanda **[P]** berarti diputuskan pemilik proyek. Tanda **[R]** berarti keputusan perancang yang boleh dikoreksi.

---

## 1. Maksud

Membangun buku panduan teknologi IT berbentuk situs web publik berbahasa Indonesia. Situs ini memetakan seluas mungkin bahasa pemrograman, framework, tools, dan disiplin IT, lalu mendalaminya bertahap dari ringkasan sampai tingkat profesional.

Alasannya ada dua:

1. Teknologi bergerak sangat cepat di era AI. Pembelajar butuh satu tempat yang menunjukkan apa saja yang ada, mana yang penting, urutan belajarnya, dan apakah informasinya masih berlaku.
2. Pemilik proyek memakai proyek ini untuk belajar proses pengembangan perangkat lunak yang benar bersama Claude Code: perencanaan, desain, eksekusi, pengujian, deploy, dan pemeliharaan.

Aplikasinya bagian yang mudah. Yang menentukan berhasil tidaknya proyek adalah **jalur produksi konten**: cara menulis, memeriksa, dan memperbarui ribuan halaman tanpa kehilangan akurasi. Rancangan ini memperlakukan jalur itu sebagai produk utama.

## 2. Tujuan, bukan-tujuan, anti-tujuan

### Tujuan

| # | Tujuan | Ukuran berhasil |
|---|---|---|
| T1 | Peta lengkap | Katalog berisi minimal 300 teknologi dalam 18 domain; setiap entri punya kartu data |
| T2 | Arah belajar | Ada roadmap per peran, urutan prasyarat, pengelompokan, serta info popularitas dan status tiap teknologi |
| T3 | Kedalaman bertahap **[P]** | Setiap topik naik tingkat: Terdaftar → Ringkasan → Dasar → Menengah → Lanjut → Profesional |
| T4 | Mutakhir dan terlihat mutakhir | Setiap halaman menampilkan versi yang dibahas dan tanggal verifikasi; ketertinggalan terdeteksi otomatis |
| T5 | Akurat dan bersumber | Setiap halaman mencantumkan sumber resmi; contoh kode dijalankan; ada pemeriksaan fakta terpisah |
| T6 | Cepat, ringan, gratis | Hosting tanpa biaya; skor Lighthouse ≥ 95 di halaman baca; halaman baca tanpa JavaScript kecuali yang dibutuhkan fitur |
| T7 | Produksi konten yang bisa diulang | Menambah satu topik tidak menyentuh kode aplikasi dan mengikuti langkah yang sama setiap kali |
| T8 | Sarana belajar pemilik | Setiap tahap proyek dijalankan dengan alur kerja yang eksplisit dan terdokumentasi di repositori |

### Bukan-tujuan

- Akun pengguna, backend, atau database. Semua data pembaca (progres, bookmark, tema) tersimpan di browser.
- Forum, komentar, atau fitur sosial.
- Kursus video.
- Versi bahasa Inggris pada tahap awal. Struktur disiapkan agar bisa ditambah kelak.
- CMS. Konten dikelola sebagai file di Git.
- Playground untuk semua bahasa. Hanya JavaScript, Python, dan SQL, dan itu pun di tahap lanjutan.

### Anti-tujuan (gagal walaupun "jalan")

- Halaman yang tampak lengkap padahal belum diverifikasi.
- Tulisan yang menyalin dokumentasi resmi.
- Materi usang yang tidak ditandai.
- Katalog besar tanpa penunjuk arah.
- Situs yang berat karena JavaScript.
- Kode aplikasi yang harus diubah setiap kali menambah topik.

## 3. Batasan

- **Biaya hosting nol.** Paket gratis Cloudflare membatasi 20.000 file per versi dan 25 MiB per file.
- **Statis sepenuhnya.** Tidak ada server yang dijalankan.
- **Satu pemilik + Claude Code.** Laju produksi konten dibatasi kuota pemakaian Claude, bukan oleh aplikasi.
- **Publik.** **[P]** Standar akurasi dan sumber mengikuti itu.
- **Bahasa Indonesia**, istilah teknis tetap bahasa Inggris. **[R]**
- **Starlight belum versi 1.0.** Upgrade dilakukan terencana, bukan otomatis.

### Lingkungan pemilik [P]

- **Windows.** Semua skrip dan perintah hooks ditulis sebagai skrip Node (`node scripts/…`), tanpa bergantung pada bash, supaya berjalan sama di Windows dan di CI (Linux). **[R]**
- **Cukup terbiasa** dengan terminal, Git, dan npm. Rencana menjelaskan seperlunya; konsep Claude Code (skill, subagent, hook, MCP) dijelaskan saat pertama dipakai karena itu bagian dari tujuan belajar.
- **Alamat situs:** subdomain gratis `*.workers.dev`. URL situs disimpan di satu tempat konfigurasi agar mudah pindah ke domain sendiri.
- **Akun GitHub dan Cloudflare sudah ada.** Langkah yang menyangkut akun (membuat repositori, menghubungkan Cloudflare, menyimpan token sebagai secret) dikerjakan pemilik sendiri mengikuti panduan di rencana. Claude Code tidak memegang kredensial akun selain lewat `gh` yang sudah login di komputer pemilik.

## 4. Pendekatan

Tiga cara membangun situs yang dipertimbangkan:

| | Pendekatan | Kelebihan | Kekurangan |
|---|---|---|---|
| **A** | **Astro + Starlight, ditambah halaman Astro biasa** | Sidebar, pencarian, blok kode, dan multibahasa sudah bawaan; sangat ringan; halaman non-baca tetap bebas dirancang | Belum 1.0; kustomisasi di luar konfigurasi berarti menulis komponen Astro |
| B | Astro murni tanpa Starlight | Tampilan bebas sepenuhnya | Sidebar, daftar isi, antarmuka pencarian, dan aksesibilitas dibangun sendiri; berminggu-minggu sebelum materi pertama terbit |
| C | VitePress | Paling sederhana, build cepat | Tema terikat Vue; rilis stabil terakhir sudah lama |

Docusaurus dan Next.js dicoret karena mengirim lebih banyak JavaScript ke browser dan lebih berat untuk ribuan halaman statis.

**Dipilih: A [P].** Waktu pemilik sebaiknya habis untuk konten, bukan untuk membangun ulang fitur dokumentasi. Format materi (MDX + data YAML) sama dengan pendekatan B, jadi pindah kelak tetap mungkin tanpa menulis ulang isi.

## 5. Arsitektur konten

### 5.1 Hierarki

**Domain → Teknologi → Bab → Halaman.** Satu halaman = satu subbab, sekitar 800–2.000 kata ditambah contoh kode.

### 5.2 Delapan belas domain

Fondasi · Bahasa pemrograman · Web frontend · Web backend dan API · Mobile · Desktop · Database · Data dan analitik · AI dan machine learning · Generative AI dan LLM · Cloud · DevOps dan infrastruktur · Keamanan · Arsitektur dan rekayasa perangkat lunak · Testing dan kualitas · Tools dan produktivitas · Game · Embedded, IoT, dan bidang khusus.

Di luar domain ada bagian lintas topik: roadmap, perbandingan, glosarium, cheat sheet, dan karier. Daftar benih katalog ada di Lampiran A.

### 5.3 Tingkat kematangan topik [P]

Setiap teknologi berada di salah satu tingkat berikut, dan tingkat itu tampil sebagai lencana di katalog.

| Tingkat | Isi | Syarat selesai |
|---|---|---|
| 0 Terdaftar | Hanya kartu data | File data valid; muncul di katalog |
| 1 Ringkasan | Satu halaman ringkasan | Semua bagian 5.5 terisi; minimal dua sumber resmi; contoh kode dijalankan; lolos pemeriksaan fakta |
| 2 Dasar | Bab level Dasar | Semua bab Dasar di template terbit dan lolos verifikasi |
| 3 Menengah | Bab level Menengah | Sama, untuk bab Menengah |
| 4 Lanjut | Bab level Lanjut | Sama, untuk bab Lanjut |
| 5 Profesional | Bab level Profesional, latihan, referensi | Seluruh template terisi |

Tingkat **dihitung otomatis** saat build dari halaman yang sudah terbit, bukan diisi tangan. **[R]** Dengan begitu lencana tidak bisa mengklaim lebih dari yang ada.

Aturan perhitungan **[R]**:

- **Halaman terbit** = `status: terbit`. Validasi menolak status ini bila `factChecked` kosong atau `sources` kosong. `codeTested: false` tetap boleh terbit, tetapi halaman menampilkan label "belum diuji otomatis".
- **Bab lengkap** = semua halaman yang didaftarkan untuk bab itu di `outline.yaml` milik teknologi tersebut sudah terbit. File `outline.yaml` dibuat saat pendalaman suatu teknologi dimulai dan berisi daftar halaman per bab. Bab bertanda `tidak-berlaku` di outline dihitung lengkap.
- **Tingkat N tercapai** = semua bab yang dipetakan ke tingkat N dan di bawahnya lengkap. Pemetaan bab ke tingkat ada di template (Lampiran B).
- **Bab tanpa level** (Bekerja dengan AI, Evaluasi, Latihan, Referensi, dan sejenisnya) dihitung ke tingkat 5. Halamannya, dan halaman Ringkasan, memakai `level: umum`.

Urutan pengerjaan **[P]**: seluruh katalog didaftarkan dulu (tingkat 0), lalu semua topik diberi ringkasan (tingkat 1), lalu pendalaman satu per satu atau per kelompok.

### 5.4 Lima template bab

Setiap teknologi memakai salah satu template sesuai jenisnya, sehingga letak bab selalu sama di teknologi sejenis. Daftar bab lengkap ada di Lampiran B.

| Template | Untuk | Jumlah bab |
|---|---|---|
| A | Bahasa pemrograman | 26 |
| B | Framework dan library | 21 |
| C | Tools dan platform | 15 |
| D | Database | 15 |
| E | Konsep dan disiplin | 12 |

Bab yang tidak relevan ditandai "tidak berlaku" supaya penomoran tetap seragam. Setiap template wajib memuat bab **Evaluasi** (keunggulan, kelemahan, kasus penggunaan, kapan tidak dipakai, perbandingan) dan bab **Bekerja dengan AI**.

### 5.5 Anatomi halaman Ringkasan (tingkat 1)

Sekitar 600–1.200 kata, urutan tetap:

1. Apa itu, dalam dua kalimat
2. Kartu data (dari file data)
3. Untuk apa dipakai dan siapa pemakainya
4. Popularitas dan status
5. Keunggulan
6. Kelemahan
7. Kapan dipakai, kapan tidak
8. Contoh kode atau perintah minimal, lengkap dengan output
9. Konsep kunci (sekitar 10 istilah, masing-masing satu kalimat)
10. Prasyarat dan langkah belajar berikutnya
11. Alternatif dan perbandingan singkat
12. Sumber resmi

### 5.6 Anatomi halaman subbab (tingkat 2 ke atas)

Header (level, waktu baca, versi, tanggal verifikasi, prasyarat) → tujuan belajar → konsep → sintaks atau bentuk umum → contoh kode bertahap dengan output → kesalahan umum → praktik terbaik → catatan versi → ringkasan dan latihan singkat → bacaan lanjutan.

### 5.7 Data per teknologi

Satu file YAML per teknologi menjadi satu-satunya sumber untuk kartu data, katalog, popularitas, dan pemantau versi.

```yaml
# src/data/tech/react.yaml
name: React
slug: react
type: library            # language | framework | library | tool | platform | database | concept | standard
domain: web-frontend
template: B
creator: Meta
firstRelease: 2013
license: MIT
website: https://react.dev
docs: https://react.dev/learn
latestVersion: "x.y"      # diperbarui oleh pemantau versi
versionSource: { kind: npm, name: react }
requires: [javascript, html, css]     # prasyarat, membentuk graf belajar
alternatives: [vue, svelte, angular, solidjs]
tags: [ui, spa, komponen]
adoption: arus-utama      # arus-utama | mapan | berkembang | khusus | warisan
trend: stabil             # naik | stabil | turun
metrics:                  # diisi otomatis, masing-masing bertanggal
  github: { repo: facebook/react }
  downloads: { registry: npm, name: react }
surveys:                  # diisi manual setahun sekali, wajib bersumber
  - { name: "Stack Overflow Developer Survey", year: 2026, value: "…", url: "…" }
useCases: [aplikasi web interaktif, dashboard, aplikasi mobile lewat React Native]
```

### 5.8 Frontmatter halaman

Skema Starlight diperluas dan divalidasi saat build. Kolom wajib yang kosong menggagalkan build.

```yaml
title: Fungsi, Closure, dan Decorator
description: …
tech: python
chapter: 7
level: menengah            # dasar | menengah | lanjut | profesional | umum
status: terbit             # draf | terbit
prerequisites: [python/variabel-tipe-data]
techVersion: "3.x"
lastVerified: 2026-11-14   # terakhir dicocokkan dengan versi terkini
factChecked: 2026-11-14    # tanggal lolos pemeriksaan fakta; wajib untuk status terbit
sources: [https://docs.python.org/3/tutorial/controlflow.html]
codeTested: true           # true | false | tidak-berlaku
tags: [fungsi, closure]
```

Rujukan antarhalaman (`prerequisites`, `requires`, `alternatives`) selalu memakai ID berbentuk `slug-teknologi` atau `slug-teknologi/slug-halaman`, bukan path file atau URL. ID diterjemahkan ke URL lewat satu peta pusat di `src/lib/`.

## 6. Penunjuk arah

Ini jawaban atas masalah "terlalu banyak materi".

| Alat | Fungsi |
|---|---|
| **Katalog** | Semua teknologi dalam satu halaman, bisa difilter menurut domain, jenis, tingkat kematangan, adopsi, dan tren |
| **Mulai dari sini** | Pembaca memilih tujuan (misalnya "ingin jadi backend developer"), lalu diarahkan ke roadmap yang sesuai |
| **Roadmap per peran** | Urutan belajar bertahap; tiap butir bertanda wajib, opsional, atau pilih salah satu. Peran awal: pemula mutlak, frontend, backend, fullstack, mobile, desktop, data analyst, data engineer, ML engineer, AI/LLM engineer, DevOps/SRE, cloud, keamanan, QA, game, embedded/IoT |
| **Graf prasyarat** | Dari kolom `requires`: tiap topik menampilkan "pelajari dulu" dan "lanjut ke" |
| **Popularitas dan status** | Lencana adopsi dan tren, plus angka bersumber dan bertanggal |
| **Perbandingan** | Halaman "X vs Y" dengan kriteria seragam |
| **Glosarium dan cheat sheet** | Istilah global; cheat sheet per teknologi yang ramah cetak |
| **Apa yang baru** | Per teknologi, plus catatan perubahan situs |

**Popularitas** memisahkan angka dari penilaian:

- *Angka otomatis*: bintang GitHub dan unduhan paket (npm, PyPI, crates.io, dan sejenisnya), diperbarui mingguan oleh skrip.
- *Angka survei*: diisi manual setahun sekali dari survei publik, selalu dengan tautan sumber.
- *Lencana adopsi dan tren*: penilaian editorial berdasarkan rubrik tertulis di `docs/rubrik-adopsi.md`, sehingga bisa diperdebatkan dan dikoreksi.

## 7. Fitur aplikasi

| Fitur | Keterangan | Tahap |
|---|---|---|
| Navigasi | Sidebar per teknologi, breadcrumb, daftar isi, sebelumnya/berikutnya | M1 |
| Pencarian teks penuh | Pagefind, bisa difilter per domain, level, dan jenis | M1 |
| Tema | Terang, Gelap, Sepia, Kontras tinggi, Ikuti sistem; pilihan warna aksen | M1 |
| Pengaturan baca | Ukuran huruf, lebar konten, font kode | M1 |
| Kartu data, lencana level, lencana kematangan | Dari data, bukan ditulis tangan | M1 |
| Stempel kemutakhiran | Versi + tanggal verifikasi; lencana "perlu ditinjau" bila lewat batas | M1 |
| Blok kode | Salin, nama file, sorotan baris, diff, tab multi-bahasa | M1 |
| Callout | Catatan, Tips, Peringatan, Praktik terbaik, "Baru di versi X" | M1 |
| Diagram | Mermaid, dirender saat build | M1 |
| Lapor kesalahan dan edit halaman | Tautan ke GitHub di setiap halaman | M1 |
| SEO | Sitemap, metadata, gambar pratinjau per teknologi (bukan per halaman, demi anggaran file) | M1 |
| Katalog berfilter | Lihat bagian 6 | M2 |
| Popularitas dan status | Lihat bagian 6 | M2 |
| Roadmap, "Mulai dari sini", graf prasyarat | Lihat bagian 6 | M3 |
| Glosarium | Istilah global dengan tautan otomatis | M3 |
| Ramah AI | `llms.txt` dan tombol "salin sebagai Markdown" | M3 |
| Halaman perbandingan | Kriteria seragam | M5 |
| Cheat sheet ramah cetak | Per teknologi | M5 |
| Progres dan bookmark | Disimpan di browser, tanpa akun; tampil di roadmap | M6 |
| Kuis dan proyek latihan | Per bab | M6 |
| Mode offline (PWA) | Bisa dipasang dan dibaca tanpa internet | M6 |
| Playground | JavaScript, Python (Pyodide), SQL (SQLite WASM), dimuat hanya saat dipakai | M6 |
| Umpan RSS | Untuk catatan perubahan | M6 |

## 8. Arsitektur teknis

### 8.1 Susunan teknologi

| Lapisan | Pilihan | Catatan |
|---|---|---|
| Kerangka | Astro 6.x + Starlight | Pakai rilis stabil terbaru saat scaffold, kunci di lockfile. Starlight 0.41.x terlihat per Juli 2026 |
| Konten | MDX + frontmatter tervalidasi (Zod) | |
| Data | YAML di `src/data/`, dibaca lewat content collections | |
| Pencarian | Pagefind (bawaan) | |
| Blok kode | Expressive Code (bawaan) | Tema kode mengikuti tema situs |
| Diagram | Mermaid, dirender saat build | Tanpa beban JavaScript di browser |
| Gaya | CSS biasa dengan custom properties; **tanpa Tailwind** **[R]** | Empat tema lebih mudah dikelola lewat satu set variabel; komponen kustom sedikit |
| Interaktivitas | Custom element TypeScript tanpa framework UI **[R]** | Sejalan dengan cara Starlight sendiri; framework baru ditambah hanya bila playground membutuhkannya |
| Halaman non-baca | Halaman Astro di `src/pages/` dengan `StarlightPage` | Beranda, katalog, roadmap, perbandingan |
| Bahasa dan alat | TypeScript ketat, Node LTS aktif, pnpm | |
| Pengujian | Vitest (skrip dan utilitas), Playwright (alur utama), Lighthouse CI, pemeriksa aksesibilitas | |
| CI/CD | GitHub Actions | Gratis untuk repo publik |
| Hosting | Cloudflare Workers Static Assets **[R]** | Cloudflare kini mengarahkan proyek baru ke sini; Cloudflare Pages jadi cadangan |

### 8.2 Persyaratan yang mengikat

- **Sidebar per teknologi.** HTML satu halaman tidak boleh memuat sidebar seluruh situs. Sidebar hanya berisi bab teknologi yang sedang dibuka, ditambah jalan kembali ke domain dan katalog.
- **Tema.** Empat tema diwujudkan lewat atribut di elemen akar dan satu berkas variabel per tema yang menimpa variabel Starlight. Semua tema lolos kontras WCAG AA. Tidak ada kedipan tema saat halaman dimuat.
- **Anggaran file.** CI menghitung file hasil build, memberi peringatan di 15.000, dan gagal di 19.000. Pagefind menulis satu file per halaman, jadi batas ini tercapai di sekitar 9.000 halaman, bukan 19.000.
- **Siap dipecah.** **[R]** Situs dibangun sebagai satu situs, tetapi tidak boleh ada yang menghalangi pemecahan per domain kelak: URL berbentuk `/{domain}/{teknologi}/…`, rujukan lewat ID (5.8), dan data katalog bisa dibaca tanpa membangun seluruh konten. Pagefind mendukung pencarian lintas situs, jadi pencarian tetap satu. Pemecahan baru dikerjakan saat peringatan 15.000 muncul; pilihan lainnya saat itu adalah paket Workers berbayar yang menaikkan batas ke 100.000 file.
- **Tanpa perubahan kode untuk konten.** Menambah teknologi = satu file YAML + folder MDX.
- **Bahasa antarmuka.** Locale bawaan Indonesia; struktur siap ditambah locale lain.

### 8.3 Struktur proyek

```
devmecum/
├── CLAUDE.md                     # aturan proyek untuk Claude Code, singkat
├── .claude/
│   ├── settings.json             # izin dan hooks
│   ├── skills/                   # skill khusus proyek (bagian 11.4)
│   └── agents/                   # subagent khusus proyek (bagian 11.5)
├── .mcp.json                     # server MCP proyek
├── astro.config.mjs
├── src/
│   ├── content.config.ts         # skema frontmatter dan data
│   ├── content/docs/             # SEMUA materi, satu folder per domain
│   │   └── bahasa/python/
│   │       ├── index.mdx         # halaman Ringkasan
│   │       ├── 02-pengenalan/…
│   │       └── …
│   ├── data/
│   │   ├── tech/*.yaml           # satu file per teknologi
│   │   ├── domains.yaml
│   │   ├── roadmaps/*.yaml
│   │   ├── glossary.yaml
│   │   └── metrics/              # hasil pemantau, ditulis skrip
│   ├── components/               # TechCard, ProsCons, LevelBadge, StageBadge, VersionNote, Prereq, Popularity, …
│   ├── overrides/                # pengganti komponen Starlight: ThemeSelect, PageTitle, Sidebar
│   ├── pages/                    # beranda, katalog, roadmap, perbandingan
│   ├── styles/themes/            # light.css dark.css sepia.css contrast.css
│   └── lib/                      # pembaca data, penghitung tingkat kematangan, graf prasyarat
├── templates/                    # kerangka bab per template A–E
├── scripts/
│   ├── new-tech.mjs              # scaffold YAML + folder dari template
│   ├── validate-content.mjs      # frontmatter, prasyarat, urutan bab
│   ├── run-code-samples.mjs      # jalankan blok kode bertanda dan bandingkan output
│   ├── check-freshness.mjs       # halaman yang lama tidak diverifikasi
│   ├── check-versions.mjs        # bandingkan versi dengan registry
│   ├── update-metrics.mjs        # bintang GitHub dan unduhan paket
│   └── count-files.mjs           # anggaran file
├── tests/                        # Vitest dan Playwright
├── docs/
│   ├── superpowers/specs/        # rancangan (dokumen ini)
│   ├── superpowers/plans/        # rencana pelaksanaan per tahap
│   ├── panduan-menulis.md        # standar penulisan
│   └── rubrik-adopsi.md
└── .github/workflows/            # ci.yml, deploy.yml, versions.yml, metrics.yml
```

## 9. Menjaga materi tetap mutakhir

1. **Stempel di setiap halaman**: versi yang dibahas dan tanggal verifikasi.
2. **Pisahkan yang stabil dari yang cepat berubah**: konsep ditulis netral terhadap versi; detail versi dibungkus komponen `VersionNote` agar mudah dicari.
3. **Satu sumber versi**: `latestVersion` di file data.
4. **Pemantau versi mingguan**: membaca npm, PyPI, crates.io, Maven Central, dan GitHub Releases, lalu membuka issue bila data tertinggal.
5. **Batas kedaluwarsa**: 6 bulan secara umum; 3 bulan untuk Generative AI, cloud, dan framework frontend. Lewat batas, halaman mendapat lencana "perlu ditinjau".
6. **Sumber resmi didahulukan**: dokumentasi resmi, catatan rilis, dan dokumen standar.
7. **Sesi pembaruan**: pemilik meminta Claude Code mengerjakan issue versi yang terbuka; bisa dijadwalkan bulanan.

## 10. Standar kualitas

**Gerbang otomatis** (wajib lolos sebelum merge):

- Build dan validasi skema
- Prasyarat dan tautan internal menunjuk halaman yang ada
- Tautan eksternal hidup (dicek terjadwal, bukan di setiap push)
- Blok kode bertanda `run` dijalankan dan outputnya cocok. Bahasa yang tidak bisa dijalankan di CI diberi `codeTested: false` dan tampil sebagai "belum diuji otomatis"
- Anggaran file dan anggaran performa Lighthouse
- Tes Playwright untuk ganti tema, pencarian, dan navigasi

**Gerbang penilaian**:

- Pemeriksaan fakta oleh subagent berkonteks bersih yang hanya melihat halaman dan sumbernya, dengan tugas mencari klaim yang tidak didukung sumber
- Tinjauan pemilik pada topik pilot dan secara acak sesudahnya

**Standar penulisan** (dirinci di `docs/panduan-menulis.md`): bahasa Indonesia baku yang santai; istilah teknis tetap Inggris dan dijelaskan di glosarium; satu gagasan per paragraf; contoh kode utuh dan bisa dijalankan; keunggulan dan kelemahan berimbang dan berkonteks; setiap angka dan klaim performa bersumber; tulisan orisinal; materi keamanan bersifat defensif.

**Lisensi** **[R]**: konten CC BY-SA 4.0, kode MIT, repositori publik.

## 11. Proses pengembangan bersama Claude Code

### 11.1 Alat kerja

| Alat | Peran |
|---|---|
| Ekstensi VS Code | Kerja harian: membaca dan meninjau perubahan langsung di editor |
| CLI (dipasang terpisah, dijalankan di terminal VS Code) | Perintah yang tidak ada di ekstensi, dan mode tanpa antarmuka (`claude -p`) untuk produksi massal dan CI |
| Aplikasi desktop | Opsional, saat produksi konten: beberapa sesi paralel, masing-masing di worktree sendiri |

Ketiganya membaca konfigurasi proyek yang sama, jadi semua konfigurasi disimpan di repositori.

### 11.2 Siklus kerja

| Tahap | Kegiatan | Alat |
|---|---|---|
| Gagasan | Menggali kebutuhan, memilih pendekatan | Superpowers: brainstorming |
| Rancangan | Dokumen rancangan, disetujui pemilik | `docs/superpowers/specs/` |
| Rencana | Tugas kecil berurutan, tiap tugas punya cara verifikasi | Superpowers: writing-plans |
| Pelaksanaan | Cabang terpisah; tes ditulis lebih dulu untuk skrip dan utilitas | Superpowers: using-git-worktrees, test-driven-development, executing-plans atau subagent-driven-development |
| Tinjauan | Diff ditinjau dalam konteks bersih | Superpowers: requesting-code-review |
| Verifikasi | Bukti berupa output perintah, bukan klaim | Superpowers: verification-before-completion; CI |
| Rilis | Pull request, pratinjau, merge, deploy otomatis | `gh`, GitHub Actions, Cloudflare |
| Pemeliharaan | Issue versi, tinjauan kedaluwarsa, perbaikan bug | Superpowers: systematic-debugging; tugas terjadwal |

Setiap tahap proyek (bagian 12) melewati siklus ini dan mendapat dokumen rencananya sendiri.

### 11.3 Perangkat yang dipasang

| Perangkat | Fungsi | Catatan |
|---|---|---|
| Plugin Superpowers | Alur kerja di 11.2 | `/plugin install superpowers@claude-plugins-official` |
| Context7 (MCP) | Dokumentasi library terkini saat menulis kode dan materi | Pakai API key gratis milik sendiri; kuota tanpa key cepat habis |
| Playwright (MCP) atau panel pratinjau desktop | Memeriksa tampilan situs secara visual | Pilih salah satu |
| `gh` CLI | Issue, pull request, status CI | Lebih hemat konteks daripada server MCP GitHub |

Prinsipnya: pasang sesedikit mungkin. Setiap server MCP dan plugin memakan ruang konteks di setiap sesi.

### 11.4 Skill khusus proyek

Disimpan di `.claude/skills/`, dimuat hanya saat dibutuhkan.

| Skill | Isi |
|---|---|
| `daftar-teknologi` | Menambah entri katalog: riset data kartu, isi YAML, jalankan validasi |
| `tulis-ringkasan` | Menulis halaman Ringkasan mengikuti anatomi 5.5 |
| `tulis-bab` | Menulis satu bab mengikuti template dan anatomi 5.6 |
| `verifikasi-halaman` | Menjalankan contoh kode, mencocokkan klaim dengan sumber, memperbarui `lastVerified` |
| `perbarui-versi` | Mengerjakan satu issue versi: baca catatan rilis, perbarui data dan halaman terkait |

### 11.5 Subagent khusus proyek

Disimpan di `.claude/agents/`. Masing-masing bekerja di konteks terpisah.

| Subagent | Tugas | Akses |
|---|---|---|
| `peneliti` | Mengumpulkan fakta dari sumber resmi, mengembalikan catatan bersumber | Baca dan web saja |
| `penulis` | Menulis halaman dari catatan peneliti dan template | Baca dan tulis di `src/content/` |
| `pemeriksa-fakta` | Mencari klaim yang tidak didukung sumber; tidak melihat proses penulisan | Baca dan web saja |
| `penguji-kode` | Menjalankan contoh kode dan melaporkan selisih output | Baca dan shell |

### 11.6 Hooks

Di `.claude/settings.json`. Hooks dipakai untuk aturan yang tidak boleh punya pengecualian.

| Peristiwa | Aksi |
|---|---|
| Sesudah mengedit file di `src/content/` atau `src/data/` | Validasi file itu saja; kegagalan dikembalikan ke Claude untuk diperbaiki |
| Sebelum mengedit lockfile atau `src/data/metrics/` | Ditolak; file ini hanya diubah skrip |
| Sebelum sesi berakhir, bila ada file konten berubah | Jalankan validasi konten menyeluruh |

CI tetap menjadi gerbang akhir; hooks hanya mempercepat umpan balik.

### 11.7 CLAUDE.md

Singkat. Isinya hanya yang tidak bisa disimpulkan dari kode: perintah proyek, aturan cabang dan commit, larangan mengubah kode aplikasi saat mengerjakan konten, dan rujukan ke `docs/panduan-menulis.md`. Detail penulisan tinggal di skill, bukan di sini.

### 11.8 Jalur produksi satu topik

```
daftar-teknologi → peneliti → penulis → penguji-kode → pemeriksa-fakta
      → validasi otomatis → pull request → pratinjau → tinjauan pemilik → merge
```

Aturan pelaksanaan:

- Satu topik per sesi, dan satu cabang per topik atau per kelompok kecil.
- Produksi massal dimulai dari dua atau tiga topik. Instruksi diperbaiki dari hasilnya, baru kemudian dijalankan untuk banyak topik.
- Biaya per topik (waktu dan kuota) diukur pada kelompok pertama di M3, dan angka itu dipakai untuk merencanakan gelombang berikutnya.

## 12. Tahapan

Setiap tahap menghasilkan situs yang sudah tayang dan berguna. Setiap tahap mendapat rencana pelaksanaannya sendiri.

| Tahap | Isi | Hasil |
|---|---|---|
| **M0 Persiapan** | Repositori, alat kerja, plugin, CLAUDE.md, konfigurasi awal | Lingkungan kerja siap |
| **M1 Kerangka aplikasi + jalur konten minimal** | Starlight, tema, komponen inti, skema, skrip validasi, CI/CD, deploy. Jalur konten minimal: `docs/panduan-menulis.md`, skill `tulis-ringkasan` dan `verifikasi-halaman`, subagent `peneliti` dan `pemeriksa-fakta`, hooks validasi. Satu topik contoh (usulan: Python) ditulis sampai tingkat Ringkasan **lewat jalur itu**, sebagai gladi resik | Situs tayang dengan satu topik yang benar-benar terverifikasi |
| **M2 Katalog penuh** | Semua teknologi terdaftar (tingkat 0), skill `daftar-teknologi`, halaman katalog berfilter, pemantau versi dan metrik, pemeriksa tautan eksternal, rubrik adopsi, halaman domain | Peta lengkap bisa dijelajahi |
| **M3 Ringkasan semua topik** | Halaman Ringkasan per domain; roadmap, "Mulai dari sini", glosarium awal | Setiap topik punya penjelasan dan arah |
| **M4 Pilot mendalam** | Skill `tulis-bab`, subagent `penulis` dan `penguji-kode`, skrip penjalan contoh kode. Satu teknologi (usulan: Python) ditulis tuntas sampai tingkat 5 | Standar format untuk pendalaman, disetujui pemilik |
| **M5 Pendalaman bergelombang** | Per kelompok teknologi, urutan ditentukan pemilik di awal tiap gelombang; halaman perbandingan dan cheat sheet | Kedalaman bertambah bertahap |
| **M6 Fitur lanjutan** | Progres, bookmark, kuis, PWA, playground, RSS | Pengalaman belajar lengkap |
| **Berkelanjutan** | Skill `perbarui-versi`; pembaruan versi, tinjauan kedaluwarsa, penambahan topik | Materi tetap mutakhir |

Rencana pelaksanaan pertama mencakup **M0 dan M1**.

## 13. Risiko

| Risiko | Mitigasi |
|---|---|
| Volume konten sangat besar | Tingkat kematangan membuat situs berguna sejak M2; biaya per topik diukur sebelum produksi massal |
| Akurasi tulisan AI | Sumber wajib, kode dijalankan, pemeriksa fakta terpisah, stempel verifikasi, tautan lapor kesalahan |
| Materi cepat usang | Mekanisme bagian 9 |
| Batas 20.000 file | Anggaran file di CI; gambar pratinjau hanya per teknologi; opsi lanjut: memecah situs per domain |
| Sidebar membengkak | Persyaratan sidebar per teknologi (8.2) |
| Starlight belum 1.0 | Versi dikunci; upgrade sebagai tugas terencana dengan membaca catatan rilis |
| Kuota Claude habis di tengah produksi | Pelaksanaan langsung untuk pekerjaan rutin; subagent hanya untuk riset dan pemeriksaan fakta |
| Bahasa yang tidak bisa diuji di CI | Ditandai "belum diuji otomatis"; diutamakan contoh lintas platform |

## 14. Diserahkan kepada pembangun

- Versi persis setiap dependensi (stabil terbaru saat scaffold).
- Mekanisme sidebar per teknologi: plugin `starlight-sidebar-topics`, middleware data rute Starlight, atau override komponen, selama persyaratan 8.2 terpenuhi.
- Palet warna tiap tema, selama lolos kontras AA.
- Rancangan visual beranda, katalog, dan roadmap. Pemilik melihat pratinjaunya sebelum dianggap selesai.
- Penanda blok kode yang dijalankan dan cara membandingkan output.
- Detail workflow CI dan cara pratinjau per pull request.
- Daftar bahasa yang toolchain-nya dipasang di CI pada tahap awal (minimal Python dan Node.js).
- Isi rubrik adopsi, untuk disetujui pemilik sebelum M2.
- Pelengkapan katalog dari benih di Lampiran A menjadi minimal 300 entri, dengan kriteria: masih dipakai industri atau penting untuk belajar, dan punya dokumentasi resmi. Teknologi lama yang penting secara historis masuk dengan adopsi "warisan".

---

## Lampiran A — Benih katalog

| Domain | Topik |
|---|---|
| Fondasi | Cara kerja komputer dan sistem bilangan, logika dan algoritma, struktur data, kompleksitas (Big-O), paradigma pemrograman, sistem operasi dan proses, jaringan komputer, HTTP, terminal dan shell, regular expression, encoding dan Unicode, OOP dan SOLID, clean code |
| Bahasa pemrograman | Python, JavaScript, TypeScript, SQL, Java, Kotlin, C, C++, C#, Go, Rust, PHP, Swift, Dart, Ruby, Bash, PowerShell, R, Julia, Scala, Elixir, Haskell, Lua, Zig, Assembly, WebAssembly |
| Web frontend | HTML, CSS, Tailwind CSS, Web API dan DOM, aksesibilitas, performa web dan Core Web Vitals, React, Next.js, Vue, Nuxt, Angular, Svelte dan SvelteKit, Astro, SolidJS, htmx, Vite, TanStack Query, Zustand, Redux Toolkit, PWA |
| Web backend dan API | Node.js, Deno, Bun, Express, Fastify, Hono, NestJS, Django, FastAPI, Flask, Laravel, Spring Boot, ASP.NET Core, Gin, Echo, Fiber, Ruby on Rails, Phoenix, desain REST API, GraphQL, gRPC, WebSocket, tRPC, OAuth 2.0 dan OIDC, JWT, passkey, caching, message queue |
| Mobile | Flutter, React Native dan Expo, Android (Kotlin + Jetpack Compose), iOS (Swift + SwiftUI), Kotlin Multiplatform, Ionic dan Capacitor, publikasi ke Play Store dan App Store |
| Desktop | Electron, Tauri, WPF, WinUI, .NET MAUI, Qt, JavaFX, GTK, Flutter Desktop, Compose Multiplatform |
| Database | Dasar basis data dan pemodelan, PostgreSQL, MySQL dan MariaDB, SQLite, SQL Server, MongoDB, Redis dan Valkey, Elasticsearch dan OpenSearch, Cassandra, DynamoDB, Firestore, Neo4j, DuckDB, ClickHouse, Supabase, Firebase, Prisma, Drizzle, SQLAlchemy, Hibernate, Eloquent, EF Core, pgvector, Qdrant, Pinecone, Weaviate, Chroma |
| Data dan analitik | NumPy, Pandas, Polars, Matplotlib, Seaborn, Plotly, Jupyter, statistika untuk data, Apache Spark, Kafka, Airflow, dbt, BigQuery, Snowflake, Databricks, Iceberg, Delta Lake, Power BI, Tableau, Looker Studio, Metabase |
| AI dan machine learning | Matematika untuk ML, scikit-learn, XGBoost, LightGBM, CatBoost, feature engineering, dasar deep learning, PyTorch, TensorFlow dan Keras, JAX, computer vision (OpenCV, CNN, YOLO, ViT), NLP dan Transformers, Hugging Face, time series, sistem rekomendasi, reinforcement learning, MLflow, DVC, Kubeflow, ONNX, kuantisasi dan model serving |
| Generative AI dan LLM | Cara kerja LLM, prompt dan context engineering, API model (Claude, OpenAI, Gemini, model open-weight), embeddings dan vector search, RAG, fine-tuning (LoRA, QLoRA), agen AI dan tool use, Model Context Protocol, LangChain dan LangGraph, LlamaIndex, Vercel AI SDK, Pydantic AI, Claude Agent SDK, OpenAI Agents SDK, evaluasi LLM, keamanan LLM, Ollama, llama.cpp, vLLM, model multimodal |
| Cloud | Konsep cloud, AWS, Google Cloud, Microsoft Azure, Cloudflare, Vercel, Netlify, serverless, edge computing, FinOps |
| DevOps dan infrastruktur | Git dan GitHub, administrasi Linux, Docker, Kubernetes, Helm, Terraform dan OpenTofu, Ansible, GitHub Actions, GitLab CI, Jenkins, Nginx, Caddy, Prometheus, Grafana, OpenTelemetry, ELK, Argo CD, Flux, service mesh, platform engineering dan SRE |
| Keamanan | Dasar keamanan informasi, OWASP Top 10, kriptografi terapan, identitas dan akses, secure coding, keamanan jaringan, keamanan cloud, DevSecOps dan supply chain, manajemen secret, dasar pengujian penetrasi yang etis, keamanan aplikasi AI |
| Arsitektur dan rekayasa perangkat lunak | SDLC, Agile dan Scrum, rekayasa kebutuhan dan UML, design patterns, clean dan hexagonal architecture, Domain-Driven Design, monolith dan microservices, event-driven, RabbitMQ, system design, sistem terdistribusi, desain API, dokumentasi teknis, code review |
| Testing dan kualitas | Piramida testing, TDD dan BDD, Jest, Vitest, Pytest, JUnit, Playwright, Cypress, Selenium, load testing (k6, JMeter), mutation testing, analisis statis |
| Tools dan produktivitas | VS Code, JetBrains IDE, Vim dan Neovim, terminal modern, package manager, Postman dan Bruno, Markdown, Figma dasar, Claude Code, GitHub Copilot, Cursor, Codex, cara bekerja efektif dengan asisten AI |
| Game | Matematika dan fisika game, Unity, Unreal Engine, Godot |
| Embedded, IoT, dan bidang khusus | Arduino, ESP32, MicroPython, Raspberry Pi, MQTT dan protokol IoT, Solidity dan smart contract, dasar komputasi kuantum (Qiskit), WebXR |
| Lintas topik: karier | Roadmap per peran, portofolio dan GitHub, persiapan wawancara teknis, kontribusi open source, cara belajar efektif di era AI |

## Lampiran B — Daftar bab per template

**A. Bahasa pemrograman (26):** 1 Ringkasan · 2 Pengenalan · 3 Lingkungan kerja · 4 Sintaks dasar · 5 Alur kontrol · 6 Struktur data bawaan · 7 Fungsi · 8 Modul dan paket · 9 Berorientasi objek dan sistem tipe lanjut · 10 Gaya fungsional · 11 Error handling dan debugging · 12 File, I/O, dan serialisasi · 13 Pustaka standar · 14 Testing · 15 Tooling dan kualitas kode · 16 Konkurensi dan paralelisme · 17 Memori dan performa · 18 Metaprogramming dan internals · 19 Pola desain dan idiom · 20 Keamanan · 21 Ekosistem dan framework · 22 Di dunia profesional · 23 Bekerja dengan AI · 24 Evaluasi · 25 Latihan dan proyek · 26 Referensi.
Level: bab 2–6 Dasar, 7–15 Menengah, 16–21 Lanjut, 22 Profesional, 23–26 semua level.

**B. Framework dan library (21):** 1 Ringkasan · 2 Pengenalan · 3 Instalasi dan struktur proyek · 4 Konsep inti · 5 Routing dan navigasi · 6 Data · 7 Form, validasi, dan input · 8 Tampilan dan styling · 9 Autentikasi dan otorisasi · 10 API dan integrasi layanan · 11 Testing · 12 Performa dan optimisasi · 13 Keamanan · 14 Build dan deployment · 15 Ekosistem dan plugin · 16 Topik lanjut dan internals · 17 Di dunia profesional · 18 Bekerja dengan AI · 19 Evaluasi · 20 Proyek latihan · 21 Referensi dan cheat sheet.
Level: 2–5 Dasar, 6–11 Menengah, 12–16 Lanjut, 17 Profesional.

**C. Tools dan platform (15):** 1 Ringkasan · 2 Konsep dan arsitektur · 3 Instalasi dan konfigurasi awal · 4 Perintah dan antarmuka inti · 5 Alur kerja harian · 6 Konfigurasi lanjut · 7 Jaringan, penyimpanan, dan integrasi · 8 Keamanan dan manajemen akses · 9 Observability dan troubleshooting · 10 Otomasi dan CI/CD · 11 Produksi dan skala · 12 Alternatif dan perbandingan · 13 Evaluasi · 14 Lab praktik · 15 Sertifikasi dan referensi.
Level: 2–5 Dasar, 6–7 Menengah, 8–10 Lanjut, 11 Profesional.

**D. Database (15):** 1 Ringkasan · 2 Model data dan arsitektur · 3 Instalasi dan tools klien · 4 Bahasa kueri dasar · 5 Desain skema dan pemodelan data · 6 Kueri lanjut · 7 Indeks dan optimisasi kueri · 8 Transaksi dan konsistensi · 9 Replikasi, sharding, ketersediaan tinggi · 10 Backup, restore, dan migrasi · 11 Keamanan · 12 Integrasi dengan aplikasi · 13 Operasional di produksi dan cloud · 14 Evaluasi dan perbandingan · 15 Latihan.
Level: 2–4 Dasar, 5–7 Menengah, 8–12 Lanjut, 13 Profesional.

**E. Konsep dan disiplin (12):** 1 Ringkasan dan peta konsep · 2 Prasyarat · 3 Konsep inti dan teori · 4 Algoritma dan teknik utama · 5 Implementasi langkah demi langkah · 6 Evaluasi dan metrik · 7 Studi kasus · 8 Praktik produksi · 9 Etika, risiko, dan keterbatasan · 10 Perkembangan terkini · 11 Latihan dan proyek · 12 Referensi.
Level: 2–3 Dasar, 4–6 Menengah, 7 Lanjut, 8 Profesional.

## Lampiran C — Sumber yang diperiksa (14 November 2026)

- Starlight: halaman kustom — https://starlight.astro.build/guides/pages/
- Starlight: CSS dan tema — https://starlight.astro.build/guides/css-and-tailwind/
- Plugin starlight-sidebar-topics — https://starlight-sidebar-topics.netlify.app/docs/getting-started
- Cloudflare Workers: batas platform — https://developers.cloudflare.com/workers/platform/limits
- Cloudflare Pages: batas — https://developers.cloudflare.com/pages/platform/limits
- Claude Code di VS Code — https://code.claude.com/docs/en/vs-code
- Claude Code Desktop — https://code.claude.com/docs/en/desktop
- Claude Code: praktik terbaik — https://code.claude.com/docs/en/best-practices
- Claude Code: hooks — https://code.claude.com/docs/en/hooks-guide
- Superpowers — https://claude.com/plugins/superpowers
