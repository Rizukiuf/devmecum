---
name: tulis-ringkasan
description: Gunakan saat diminta menulis atau memperbarui halaman Ringkasan (tingkat 1) untuk satu teknologi yang sudah terdaftar di src/data/tech/, misalnya "/tulis-ringkasan python". Argumen berupa slug teknologi.
---

# Menulis halaman Ringkasan

Argumen: `$ARGUMENTS` = slug teknologi (mis. `python`). Hasilnya `src/content/docs/<domain>/<slug>/index.mdx` berstatus `draf`. Skill ini **tidak pernah** menyetel `status: terbit` atau `factChecked`; itu tugas skill `verifikasi-halaman`.

Standar penulisan: `docs/panduan-menulis.md` §1–6. Nadanya santai dan natural (§2), bukan terjemahan dokumentasi. Urutan bagian tetap, tetapi panjang tiap bagian mengikuti topiknya.

## Langkah

1. **Siapkan.**
   - Pastikan `src/data/tech/<slug>.yaml` ada, lalu jalankan `pnpm validate`; harus tanpa galat.
   - Pastikan berada di cabang `konten/<slug>` (buat dari `main` bila belum: `git switch -c konten/<slug>`). Pekerjaan konten tidak boleh mengubah kode aplikasi.
2. **Teliti.** Jalankan subagent `peneliti` dengan masukan slug itu. Ia butuh izin WebFetch dan WebSearch; setujui bila diminta. Tunggu catatan lengkapnya.
3. **Tulis.**
   - Salin `templates/ringkasan.mdx` ke `src/content/docs/<domain>/<slug>/index.mdx` (`<domain>` dari kolom `domain` di file data).
   - Ganti semua penanda `GANTI-…`: `title` = nama teknologi, `tech`, `techVersion` = seri yang dibahas dalam tanda kutip (`"3.15"`, bukan `"3.15.2"`), `lastVerified` = tanggal hari ini, `sources` = minimal dua URL resmi dari catatan peneliti (survei atau statistik publik boleh ditambahkan untuk angka popularitas), `codeTested` tetap `false` sampai kodenya dijalankan.
   - Isi bagian-bagiannya dari catatan peneliti dengan kata-kata sendiri, lalu hapus semua komentar kerangka.
   - **Setiap klaim faktual** (fitur, perilaku, angka, versi, tanggal, pemakai, perbandingan) harus bisa kamu tunjuk ke satu butir catatan peneliti yang ber-URL. Jangan menambah generalisasi sendiri seperti "sering dipakai" atau "mudah dipelajari" tanpa butirnya. Kalimat penjelas, analogi, pertanyaan pemancing, dan transisi bukan klaim; tulis bebas dan natural selama tidak menyelipkan fakta baru.
   - Hal yang ada di daftar "Tidak ditemukan sumber resmi" **tidak ditulis**.
   - Biarkan `status: draf` dan jangan menambah `factChecked`.
4. **Perbarui data.** Bila catatan peneliti menunjukkan versi terbaru yang berbeda dari `latestVersion` di file data, perbarui nilai itu (dalam tanda kutip) dan samakan `techVersion` halaman bila seri-nya berganti.
5. **Validasi.** Jalankan `pnpm validate src/content/docs/<domain>/<slug>/index.mdx` sampai tanpa galat.
6. **Lanjut** ke skill `verifikasi-halaman` dengan slug yang sama.

Bila peneliti melaporkan terlalu banyak hal tak terpastikan sehingga sebuah bagian tidak bisa diisi jujur, tulis bagian itu sependek yang bisa dibuktikan. Bila bagian inti (Sekilas, Contoh minimal, Sumber resmi) tetap tidak bisa diisi, berhenti dan laporkan ke pemilik, jangan mengarang.

## Mode pembaruan

Bila `index.mdx` teknologi itu sudah ada (misalnya untuk memperbarui versi atau gaya bahasa), jangan menyalin templat di atasnya. Pakai halaman yang ada sebagai bahan: tulis ulang prosanya, kembalikan `status: draf`, hapus `factChecked` selagi menulis, lalu lanjut ke `verifikasi-halaman`. Fakta lama yang tidak ada di catatan peneliti yang baru tetap harus diperiksa ulang, jadi jangan dianggap aman.

## Bila izin ditolak

Bila sebuah perintah ditolak izinnya (shell, git, atau tulis berkas), jangan mencari jalan lain. Berhenti, lalu laporkan perintah persisnya supaya pemilik bisa menjalankannya atau memberi izin.

## Mode tanpa antarmuka (`claude -p`)

Izin tambahan diberikan lewat flag, satu argumen per alat, dan prompt dikirim lewat stdin supaya tidak tertelan daftar alat. Di Windows sesi biasanya memakai alat PowerShell, jadi sertakan izin PowerShell dan Bash:

```
--allowedTools "WebFetch" "WebSearch" "Agent" \
  "PowerShell(python *)" "PowerShell(git add *)" "PowerShell(git commit *)" "PowerShell(pnpm validate *)" \
  "Bash(python *)" "Bash(git add *)" "Bash(git commit *)" "Bash(pnpm validate *)" \
  --disallowedTools "Bash(git push *)" "PowerShell(git push *)"
```
