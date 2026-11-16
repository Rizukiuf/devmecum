---
name: verifikasi-halaman
description: Gunakan saat sebuah halaman draf Devmecum sudah selesai ditulis dan perlu diverifikasi sebelum terbit, atau saat halaman terbit perlu dicocokkan ulang dengan versi terkini, misalnya "/verifikasi-halaman python". Argumen berupa slug teknologi (Ringkasan) atau path file halaman.
---

# Memverifikasi halaman

Argumen: `$ARGUMENTS` = slug teknologi (halaman `index.mdx`-nya) atau path file halaman. Skill ini satu-satunya yang menyetel `status: terbit`, `factChecked`, dan `codeTested`.

**Aturan tetap:** `factChecked` hanya diisi sesudah subagent `pemeriksa-fakta` mengembalikan baris `HASIL: LOLOS`. Jangan pernah mengisinya dari penilaian sendiri, dan jangan memanggil pemeriksa dengan catatan peneliti atau penjelasan penulisan.

## Langkah

1. **Jalankan contoh kode.**
   - Tulis setiap contoh ke folder sementara di luar repo (pakai alat Write), jalankan dengan path literal, dan bandingkan keluarannya dengan yang tertulis. Catat versi runtime yang dipakai.
   - Bila berbeda, perbaiki halaman agar sama dengan hasil nyata.
   - Semua contoh cocok → `codeTested: true`. Bahasanya tidak bisa dijalankan di sini, atau contohnya butuh versi lebih baru dari yang terpasang → `codeTested: false`, dan sebut alasannya di laporan.
   - Runtime lokal boleh lebih lama dari `techVersion` **selama contohnya tidak memakai fitur khusus versi baru**. Tulis kedua versi di laporan ("dijalankan di 3.11.9; halaman membahas 3.15").
   - Perintah PowerShell berinterpolasi string (`"$d\..."`) bisa ditolak pemeriksa sintaks alat. Itu bukan penolakan izin: tulis ulang dengan path literal dan lanjutkan.
2. **Periksa fakta.** Jalankan subagent `pemeriksa-fakta` dengan **hanya path file** halaman itu. Ia butuh izin WebFetch dan WebSearch; setujui bila diminta.
3. **Bila `HASIL: GAGAL`:**
   - Untuk setiap klaim `tidak didukung` atau `salinan`: tambahkan sumber resmi yang memuatnya ke `sources`, tulis ulang dengan kata sendiri, atau hapus klaimnya.
   - Ganti URL di `sources` yang tidak terbuka dengan sumber resmi yang terbuka.
   - Ulangi langkah 2. **Paling banyak tiga putaran**; sesudah itu berhenti dan laporkan klaim yang tersisa ke pemilik.
4. **Bila `HASIL: LOLOS`:**
   - Periksa tabelnya sendiri: bila ada klaim faktual (di luar status `contoh kode`) berstatus `tidak bisa diperiksa`, **berhenti** dan tampilkan klaim itu ke pemilik; terbitkan hanya sesudah pemilik menyetujui secara eksplisit.
   - Setel `factChecked` dan `lastVerified` ke tanggal hari ini (YYYY-MM-DD), dan `status: terbit`.
   - Jalankan `pnpm validate`; harus tanpa galat.
   - Commit: `git add <file> && git commit -m "docs: terbitkan <judul halaman>"` (sertakan file data bila `latestVersion` berubah). Pakai pesan lain bila pemilik memintanya, dan biarkan `draf` bila pemilik bilang begitu secara eksplisit.
5. **Laporkan** ke pemilik: jumlah putaran pemeriksaan, klaim yang dibuang atau diganti sumbernya, status `codeTested` beserta alasannya, dan versi runtime yang dipakai.

## Pemeriksaan ulang halaman terbit

Lakukan langkah 1–4 tanpa mengubah `status`. Bila versi teknologi berubah, perbarui `techVersion` dan semua yang terikat versi (cari `<VersionNote`) sebelum memanggil pemeriksa.

## Bila izin ditolak

Bila sebuah perintah ditolak izinnya (misalnya `git add`), jangan mencari jalan lain. Berhenti, biarkan halaman di working tree, dan laporkan perintah persisnya untuk dijalankan pemilik.
