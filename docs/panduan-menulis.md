# Panduan menulis Devmecum

Panduan ini adalah standar untuk setiap halaman. Penulis manusia maupun Claude Code mengikutinya. Aturannya berasal dari rancangan §5 dan §10; bila ada beda, rancangan yang berlaku.

## 1. Prinsip

Delapan standar. Halaman yang melanggar salah satunya belum boleh terbit.

1. **Bahasa Indonesia yang santai dan natural**, seperti menjelaskan ke teman sesama pembelajar: rapi, tapi tidak kaku.
   - Benar: "Kalau tidak ada hasil, fungsi ini mengembalikan daftar kosong."
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

**Nada.** Tulis seperti menjelaskan langsung ke teman yang sedang belajar: hangat, jelas, dan to the point. Mulai dari apa yang berguna buat pembaca, bukan dari definisi.

- Sapaan: "kamu". Hindari "Anda" dan "saya". "Kita" boleh bila menggambarkan langkah bersama ("sekarang kita coba jalankan"), bukan menggantikan subjek yang tak jelas.
- Pakai kata sehari-hari yang dipahami semua orang: "kalau", "biar", "cuma", "bisa", "lewat", "dipakai untuk". Hindari kata yang kaku di tulisan teknis: "apabila", "terdapat", "merupakan", "dapat", "hendaknya", "sehingga dapat dikatakan", "dalam rangka". Gaul seperti "gaes", "bro", atau "banget" berulang-ulang juga dihindari.
- Variasikan kalimat. Pertanyaan pendek yang memancing rasa ingin tahu ("Kenapa begitu?") dan kalimat yang sangat pendek boleh dipakai sesekali; tiga kalimat berturut-turut dengan pola yang sama terasa seperti dibaca robot.
- Kalimat aktif dan pendek. Satu kalimat, satu informasi.
- Jangan membuka halaman dengan "Python adalah bahasa pemrograman yang…" dan jangan meniru urutan kalimat sumber. Mulai dari situasi yang dikenal pembaca, lalu hubungkan ke faktanya.
- Analogi atau perumpamaan boleh, asal tidak membuat klaim faktual baru yang tak bersumber.
- Istilah Inggris ditulis apa adanya, tanpa cetak miring dan tanpa "di-" yang dipaksakan (tulis "deploy", bukan "mendeploy" berulang-ulang; "men-deploy" boleh sesekali).
- Istilah baru: jelaskan dalam satu kalimat saat pertama muncul di halaman, **dengan kata dan contohmu sendiri**. Jangan membawa definisi sumber dengan susunan kalimat yang sama; kalau kata aslinya penting, kutip pendek dengan tanda kutip dan sebutkan sumbernya.
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
- **`techVersion` halaman adalah seri yang dibahas** (`"3.15"`, atau `"3.x"` bila halaman netral terhadap versi), bukan nomor rilis persis. Nomor rilis persis (`3.15.2`) hanya ada di `latestVersion` pada `src/data/tech/<slug>.yaml`; kalau berubah, sesuaikan `techVersion` hanya bila seri-nya ikut berganti.
- `index.mdx` wajib `chapter: 1` dan `level: umum`. Halaman bab berada di folder `NN-nama-bab/` dengan `NN` sama dengan `chapter`, dan `level` harus sama dengan level bab itu di `src/data/templates.yaml`.
- Status `terbit` mensyaratkan `factChecked` dan minimal satu sumber (Ringkasan: dua).
- **`factChecked` hanya diisi oleh skill `verifikasi-halaman`**, sesudah subagent `pemeriksa-fakta` menjawab `HASIL: LOLOS`. Tidak pernah diisi dari penilaian sendiri, dan tidak pernah diisi tangan.
- `codeTested: false` boleh terbit; halaman menampilkan label "Belum diuji otomatis".
- `lastVerified` diperbarui setiap kali halaman dicocokkan ulang dengan versi terkini.

## 5. Sumber

Urutan keutamaan: (1) dokumentasi resmi, (2) catatan rilis dan changelog, (3) dokumen standar (RFC, spesifikasi), (4) kode sumber resmi. Blog, tutorial, dan forum bukan sumber untuk klaim faktual.

- Ringkasan: minimal dua sumber resmi (dokumentasi, situs resmi, catatan rilis, atau spesifikasi).
- **Angka popularitas dan penggunaan** boleh bersumber dari survei atau statistik publik yang bisa diperiksa (misalnya Stack Overflow Developer Survey, TIOBE, statistik registri paket). Tulis nama sumber dan tahun atau tanggalnya. Sumber seperti ini hanya untuk angka, bukan untuk klaim tentang cara kerja teknologinya.
- Perbandingan dengan alternatif memakai dokumentasi resmi kedua pihak. Kalau tidak ada sumber yang membandingkan, tulis perbedaan yang bisa dibuktikan masing-masing, atau lewati.
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
- **Contoh yang kamu jalankan sendiri bukan klaim untuk pemeriksa fakta.** Kodenya dan keluarannya dibuktikan dengan menjalankannya (`codeTested`), jadi pemeriksa fakta menandainya `contoh kode` dan tidak menghitungnya. Penjelasan di sekitar contoh yang berisi fakta (misalnya "perintah ini ada sejak versi 3.12") tetap harus bersumber.

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
