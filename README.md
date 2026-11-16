# Devmecum

Buku panduan teknologi IT berbahasa Indonesia, berbentuk situs web statis. Devmecum memetakan bahasa pemrograman, framework, tools, dan disiplin IT, lalu mendalaminya bertahap dari ringkasan sampai tingkat profesional. Setiap halaman mencantumkan sumber resmi, versi yang dibahas, dan tanggal verifikasinya.

Proyek ini masih di tahap awal. Rancangan dan rencana pelaksanaannya ada di:

- [Rancangan](docs/superpowers/specs/2026-11-14-buku-panduan-teknologi-design.md)
- [Rencana pelaksanaan M0 dan M1](docs/superpowers/plans/2026-11-15-m0-m1-kerangka-dan-jalur-konten.md)
- [Rencana pelaksanaan M2](docs/superpowers/plans/2026-11-16-m2-katalog-penuh.md)
- [Panduan menulis](docs/panduan-menulis.md)

## Menjalankan di komputer sendiri

Butuh Node 26 dan pnpm 10.

```
pnpm install
pnpm dev       # server pengembangan di http://localhost:4321
pnpm build     # build produksi ke dist/
pnpm check     # pemeriksaan tipe
```

## Lisensi

- Kode aplikasi: [MIT](LICENSE).
- Konten di `src/content/` dan `src/data/`: [CC BY-SA 4.0](LICENSE-CONTENT).
