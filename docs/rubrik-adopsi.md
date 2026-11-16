# Rubrik adopsi dan tren

Rubrik ini menentukan nilai `adoption` dan `trend` di `src/data/tech/<slug>.yaml`. Gaya penulisan mengikuti `docs/panduan-menulis.md`; di sini cukup ditulis apa yang dinilai, dengan bukti apa, dan kapan dinilai ulang.

## Tujuan

`adoption` dan `trend` adalah **penilaian editorial**, bukan fakta mutlak. Dua orang bisa berbeda pendapat, dan itu wajar. Rubrik ini ada supaya perbedaan itu bisa dibahas lewat bukti yang sama, bukan lewat selera.

Dua aturan dasarnya:

- Setiap nilai punya bukti tertulis di baris yang sama.
- Nilai berubah kalau bukti baru memenuhi tabel, bukan karena ada yang merasa teknologinya "sudah beda".

## Cara menilai

Bandingkan teknologi **dengan teknologi sekategori**: database dengan database, bukan dengan bahasa pemrograman. Angka 20% di survei untuk database berarti lain dari 20% untuk bahasa.

Untuk `adoption`, periksa berurutan: `warisan`, `arus-utama`, `berkembang`, `khusus`, lalu `mapan`. **Nilai pertama yang terpenuhi dipakai**, dan yang berikutnya tidak perlu diperiksa lagi.

Satu bukti dari kolom "Terpenuhi bila" sudah cukup. Sumber angka (survei, statistik registri) mengikuti aturan sumber di `docs/panduan-menulis.md` §5.

## Tabel adopsi

| Adopsi | Terpenuhi bila (cukup satu bukti) |
|---|---|
| `warisan` | Pembuatnya menyatakan *deprecated*, mode pemeliharaan, atau menunjuk penerus resmi; atau tidak ada rilis selama 24 bulan dan pemakaiannya menurun di survei |
| `arus-utama` | Dipakai ≥ 20% responden kategori yang sesuai di survei pengembang publik terbaru; atau termasuk lima besar kategorinya menurut survei atau statistik registri; atau (database dan platform) tersedia sebagai layanan terkelola di minimal dua dari AWS, Google Cloud, dan Azure |
| `berkembang` | Rilis stabil pertama kurang dari 5 tahun lalu atau belum 1.0, dan ada bukti pertumbuhan (lihat tren `naik`) |
| `khusus` | Menjadi pilihan utama di ceruk tertentu (bidang, platform, industri) tetapi jarang di luar itu, misalnya < 5% di survei umum |
| `mapan` | Bawaan: masih dirilis dalam 12 bulan terakhir dan dipakai luas, tetapi tidak memenuhi kategori di atas |

## Tabel tren

| Tren | Terpenuhi bila |
|---|---|
| `naik` | Dua titik data berjarak ≥ 1 tahun: survei naik ≥ 2 poin persentase, atau (tanpa data survei) unduhan registri naik ≥ 25% |
| `turun` | Survei turun ≥ 2 poin, (tanpa data survei) unduhan turun ≥ 15%, atau berstatus `warisan` |
| `stabil` | Bawaan: perubahan di antara keduanya, atau belum ada dua titik data |

**Bila bukti berbeda arah, survei yang dipakai.** Survei yang dimaksud adalah Stack Overflow Developer Survey dua tahun berurutan; unduhan registri (npm, PyPI, crates) dua titik data berjarak ≥ 1 tahun. Jika keduanya menunjuk arah tren berbeda, nilai `trend` mengikuti survei dan unduhan dicatat di komentar bukti sebagai konteks. Unduhan registri jadi dasar tren hanya bila teknologi itu tidak punya data survei. Alasannya, unduhan mentah bisa membengkak karena CI, mirror, dan dependensi transitif.

Konsep dan disiplin (templat E) dinilai dari seberapa luas dipraktikkan atau diajarkan. Tanpa bukti kuantitatif, nilainya `mapan` dan `stabil`, dengan alasan tertulis.

## Format bukti

Bukti ditulis sebagai komentar di baris yang sama dengan nilainya. Bukti `adoption` berupa satu kalimat pendek dan satu URL. Bukti `trend` berbasis dua titik data boleh menyebut kedua titik data dan memakai dua URL (satu per titik atau tahun).

```yaml
adoption: arus-utama # SO Survey 2026: 58,0% responden; https://survey.stackoverflow.co/2026/technology
```

Contoh `trend` saat survei dan unduhan berbeda arah (TypeScript: unduhan npm ×3,09 dalam setahun, tetapi survei 43,6% lalu 43,8%, jadi `stabil`):

```yaml
trend: stabil # survei SO 43,6% (2025; https://survey.stackoverflow.co/2025/technology) ke 43,8% (2026; https://survey.stackoverflow.co/2026/technology/data/languages); unduhan npm ×3,09 dalam setahun hanya konteks
```

Nilai bawaan (`mapan` atau `stabil` karena tidak ada bukti lain) ditulis dengan alasannya:

```yaml
trend: stabil # bawaan rubrik: baru satu titik data survei
```

## Penilaian ulang

Nilai dinilai ulang setahun sekali, bersamaan dengan pengisian `surveys` (rancangan §6), atau kapan saja ada bukti baru.

## Cara mengoreksi

Siapa pun boleh membuka issue dengan bukti. Nilai berubah kalau bukti itu memenuhi tabel di atas.
