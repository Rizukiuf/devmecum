---
name: verifikasi-halaman
description: Gunakan saat sebuah halaman draf Devmecum sudah selesai ditulis dan perlu diverifikasi sebelum terbit, atau saat halaman terbit perlu dicocokkan ulang dengan versi terkini, misalnya "/verifikasi-halaman python". Argumen berupa slug teknologi (Ringkasan) atau path file halaman.
---

# Memverifikasi halaman

Argumen: `$ARGUMENTS` = slug teknologi (halaman `index.mdx`-nya) atau path file halaman. Skill ini satu-satunya yang boleh menyetel `status: terbit`, `factChecked`, dan `codeTested`.

**Aturan tetap:** `factChecked` hanya diisi sesudah subagent `pemeriksa-fakta` mengembalikan baris `HASIL: LOLOS`. Jangan pernah mengisinya dari penilaian sendiri, dan jangan memanggil pemeriksa dengan catatan peneliti atau penjelasan penulisan.

## Langkah

1. **Jalankan contoh kode.**
   - Salin setiap contoh kode halaman ke folder sementara di luar repo, jalankan, dan bandingkan keluarannya dengan yang tertulis. Catat versi runtime yang kamu pakai.
   - Bila berbeda, perbaiki halaman agar sama dengan hasil nyata.
   - Semua contoh cocok dan bisa dijalankan di komputer ini → `codeTested: true`. Bahasanya tidak bisa dijalankan di sini, atau fiturnya butuh versi lebih baru dari yang terpasang → `codeTested: false` dan sebut alasannya di laporan akhir.
2. **Periksa fakta.** Jalankan subagent `pemeriksa-fakta` dengan **hanya path file** halaman itu. Ia butuh izin WebFetch dan WebSearch; setujui bila diminta.
3. **Bila `HASIL: GAGAL`:**
   - Untuk setiap klaim `tidak didukung` atau `salinan`: tambahkan sumber resmi yang memuatnya ke `sources`, tulis ulang dengan kata sendiri, atau hapus klaimnya.
   - Bila ada URL di `sources` yang tidak terbuka, ganti dengan sumber resmi yang terbuka.
   - Ulangi langkah 2. **Paling banyak tiga putaran**; sesudah itu berhenti dan laporkan klaim yang tersisa ke pemilik.
4. **Bila `HASIL: LOLOS`:**
   - Periksa tabelnya sendiri: bila ada klaim faktual (selain contoh kode yang kamu jalankan sendiri) berstatus `tidak bisa diperiksa`, **berhenti** dan tampilkan klaim itu ke pemilik; terbitkan hanya sesudah pemilik menyetujui secara eksplisit.
   - Setel `factChecked` dan `lastVerified` ke tanggal hari ini (YYYY-MM-DD), dan `status: terbit`.
   - Jalankan `pnpm validate`; harus tanpa galat.
   - Commit: `git add <file> && git commit -m "docs: terbitkan <judul halaman>"` (tambahkan file data bila `latestVersion` berubah).
5. **Laporkan** ke pemilik: jumlah putaran pemeriksaan, klaim yang dibuang atau diganti sumbernya, status `codeTested` beserta alasannya, dan versi runtime yang dipakai.

## Pemeriksaan ulang halaman terbit

Untuk halaman yang sudah terbit: lakukan langkah 1–4 tanpa mengubah `status`. Bila versi teknologi berubah, perbarui `techVersion` dan semua yang terikat versi (cari `<VersionNote`) sebelum memanggil pemeriksa.
