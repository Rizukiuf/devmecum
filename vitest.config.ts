import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    // Zona waktu dikunci supaya tes tanggal bermakna dan sama di semua mesin.
    env: { TZ: 'Asia/Jakarta' },
  },
});
