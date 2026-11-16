# Panduan menulis Devmecum

Panduan ini adalah standar untuk setiap halaman. Penulis manusia maupun Claude Code mengikutinya. Aturannya berasal dari rancangan §5 dan §10; bila ada beda, rancangan yang berlaku.

## 1. Prinsip

Delapan standar. Halaman yang melanggar salah satunya belum boleh terbit.

1. **Bahasa Indonesia baku yang santai.**
   - Benar: "Fungsi ini mengembalikan daftar kosong kalau tidak ada hasil."
   - Salah: "Fungsi tersebut dikembalikan oleh sistem apabila hasil tidak diperoleh." (kaku) atau "Nah gaes, fungsinya bakal balikin list kosong." (terlalu gaul)
2. **Istilah teknis tetap Inggris**, dijelaskan saat pertama muncul dan di glosarium (M3).
3. **Satu gagasan per paragraf.** Paragraf yang membahas dua hal dipecah.
4. **Contoh kode utuh dan bisa dijalankan** apa adanya.
5. **Keunggulan dan kelemahan berimbang dan berkonteks.**
   - Benar: "Startup-nya lambat dibanding Go karena interpreter dimuat dulu."
   - Salah: "Python itu lambat." / "Python itu bahasa terbaik."
6. **Setiap angka dan klaim performa bersumber**, dengan tautan dan tanggal akses bila angkanya bisa berubah.
   - Benar: "Rilis stabil terbaru 3.15.2 (python.org, per 15 November 2026)."
   - Salah: "Python dipakai jutaan developer."
7. **Tulisan orisinal.** Jangan menyalin atau memparafrase kalimat per kalimat dari dokumentasi resmi. Pahami, lalu tulis ulang dengan struktur dan contoh sendiri.
8. **Materi keamanan bersifat defensif**: cara melindungi, bukan cara menyerang.

## 2. Bahasa

- Sapaan: "kamu". Hindari "Anda", "saya", dan "kita" yang tak jelas siapa.
- Kalimat aktif dan pendek. Satu kalimat, satu informasi.
- Istilah Inggris ditulis apa adanya, tanpa cetak miring dan tanpa "di-" yang dipaksakan (tulis "deploy", bukan "mendeploy" berulang-ulang; "men-deploy" boleh sesekali).
- Istilah baru: jelaskan dalam satu kalimat saat pertama muncul di halaman.
- Hindari superlatif tak bersumber ("terbaik", "tercepat", "paling populer").
- Tanggal: "14 November 2026". Angka desimal memakai koma di prosa ("3,5"), titik di kode.

## 3. Halaman Ringkasan

Halaman `index.mdx` setiap teknologi, 600–1.200 kata, dengan urutan tetap. Mulai dari `templates/ringkasan.mdx`.

| Bagian | Isi | Sasaran |
|---|---|---|
| Sekilas | Apa itu, dua kalimat | 40–60 kata |
| Kartu data | `<TechCard />`, tanpa teks tambahan | — |
| Untuk apa dan siapa pemakainya | Pekerjaan yang diselesaikan, pemakai nyata | 100–150 kata |
| Popularitas dan status | Angka bersumber dan bertanggal; masih aktif dikembangkan atau tidak | 60–100 kata |
| Keunggulan dan kelemahan | `<ProsCons>`, masing-masing 3–5 butir berkonteks | — |
| Kapan dipakai, kapan tidak | Dua daftar pendek | 80–120 kata |
| Contoh minimal | Kode atau perintah utuh beserta keluaran persis | 1 contoh |
| Konsep kunci | Sekitar sepuluh istilah, satu kalimat masing-masing | 10 butir |
| Prasyarat dan langkah berikutnya | Yang perlu dikuasai dulu, dan ke mana sesudahnya | 50–80 kata |
| Alternatif | 2–4 alternatif dan beda utamanya | 2–4 butir |
| Sumber resmi | Tautan sama dengan `sources` di frontmatter | — |

## 4. Frontmatter

Skema lengkapnya ada di `src/lib/schemas.ts`; `pnpm validate` menolak yang salah.

```yaml
title: Fungsi, Closure, dan Decorator
description: Satu kalimat yang dipakai mesin pencari.
tech: python               # slug di src/data/tech/
chapter: 7                 # nomor bab di templat; 1 = Ringkasan
level: menengah            # dasar | menengah | lanjut | profesional | umum
status: draf               # draf | terbit
prerequisites: [python/variabel-tipe-data]
techVersion: "3.x"         # SELALU dalam tanda kutip
lastVerified: 2026-11-15
factChecked: 2026-11-15    # hanya untuk status terbit
sources: [https://docs.python.org/3/tutorial/controlflow.html]
codeTested: true           # true | false | tidak-berlaku
tags: [fungsi, closure]
```

- **Versi selalu dalam tanda kutip.** `3.10` tanpa kutip dibaca YAML sebagai angka `3.1`.
- `index.mdx` wajib `chapter: 1` dan `level: umum`. Halaman bab berada di folder `NN-nama-bab/` dengan `NN` sama dengan `chapter`, dan `level` harus sama dengan level bab itu di `src/data/templates.yaml`.
- Status `terbit` mensyaratkan `factChecked` dan minimal satu sumber (Ringkasan: dua).
- **`factChecked` hanya diisi oleh skill `verifikasi-halaman`**, sesudah subagent `pemeriksa-fakta` menjawab `HASIL: LOLOS`. Tidak pernah diisi dari penilaian sendiri, dan tidak pernah diisi tangan.
- `codeTested: false` boleh terbit; halaman menampilkan label "Belum diuji otomatis".
- `lastVerified` diperbarui setiap kali halaman dicocokkan ulang dengan versi terkini.

## 5. Sumber

Urutan keutamaan: (1) dokumentasi resmi, (2) catatan rilis dan changelog, (3) dokumen standar (RFC, spesifikasi), (4) kode sumber resmi. Blog, tutorial, dan forum bukan sumber untuk klaim faktual.

- Ringkasan: minimal dua sumber resmi.
- Setiap versi, tanggal, angka, dan klaim performa ditelusuri ke sumbernya; tidak ditulis dari ingatan.
- Klaim yang tidak ditemukan sumber resminya **dihapus**, bukan dilunakkan.
- Hanya tautan `https`.

## 6. Contoh kode

- Utuh: bisa disalin, dijalankan, dan hasilnya sama dengan yang tertulis.
- Keluaran ditulis persis seperti hasil menjalankannya, bukan dikarang.
- Utamakan yang jalan di Windows, macOS, dan Linux; tanpa perintah khusus satu OS kecuali topiknya memang itu.
- Beri nama file dan sorot baris penting: ` ```python title="halo.py" {2} `.
- Tampilkan perubahan dengan blok `diff`, dan beberapa bahasa dengan `<Tabs>`.
- Jalankan sebelum menulis klaim tentang perilakunya (skill `verifikasi-halaman`).

## 7. Keunggulan dan kelemahan

- Selalu berpasangan: setiap keunggulan punya lawannya.
- Setiap butir menyebut pembanding atau kondisinya.
- Benar: "Ekosistem pustaka sangat luas, terutama untuk data dan AI."
- Benar: "Konkurensi berbasis thread terbatas oleh GIL pada pekerjaan yang berat CPU."
- Salah: "Mudah dipelajari." (bagi siapa? dibanding apa?)

## 8. Komponen

Impor di MDX dengan `import X from '@components/X.astro';`.

```mdx
<TechCard />

<ProsCons>
<Fragment slot="keunggulan">

- Butir keunggulan.

</Fragment>
<Fragment slot="kelemahan">

- Butir kelemahan.

</Fragment>
</ProsCons>

<BestPractice>Praktik yang disarankan, satu atau dua kalimat.</BestPractice>

<VersionNote version="3.12">Perilaku yang baru ada sejak versi ini.</VersionNote>

<Diagram title="Alur permintaan" code={`flowchart LR
  A[Klien] --> B[Server]`} />

:::note
Catatan netral.
:::

:::tip
Saran yang mempermudah.
:::

:::caution
Peringatan tentang hal yang bisa salah.
:::
```

- `TechCard`: sekali per Ringkasan; isinya dari file data, jangan diulang di teks.
- `VersionNote`: bungkus semua detail yang terikat versi supaya mudah dicari saat versi baru rilis. Konsep ditulis netral terhadap versi.
- `Diagram`: wajib `title` (dibaca pembaca layar). Hanya bila gambar menjelaskan mekanisme yang sulit dengan kata.
- Jangan menulis blok kode ` ```mermaid `; itu tidak dirender.

## 9. Rujukan antarhalaman

Rujukan selalu **ID**, bukan path atau URL: `python` (Ringkasan), `python/variabel-tipe-data` (halaman). Berlaku di `prerequisites`, `requires`, dan `alternatives`. ID diterjemahkan menjadi URL di satu tempat (`src/lib/ids.ts`), sehingga struktur folder bisa berubah tanpa memutus rujukan.

Tautan di dalam teks memakai path situs (`/bahasa/python/`); penjaga tautan saat build menolak yang mati.

## 10. Keamanan

Materi keamanan menjelaskan ancaman agar pembaca bisa bertahan: cara kerja, tanda-tandanya, dan pencegahannya. Tidak memuat contoh serangan yang siap dipakai terhadap sistem nyata, kode eksploitasi, atau cara menghindari deteksi.
