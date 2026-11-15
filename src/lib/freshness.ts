// Kemutakhiran halaman (rancangan §9). Semua tanggal diperlakukan sebagai
// tanggal kalender yang disimpan di tengah malam UTC, supaya tidak bergeser
// oleh zona waktu mesin yang menjalankan build.

/** Zona waktu proyek: tanggal "hari ini" mengikuti kalender penulisnya. */
const PROJECT_TIME_ZONE = 'Asia/Jakarta';

/**
 * Tanggal hari ini. Bisa dikunci lewat DEVMECUM_TODAY=YYYY-MM-DD agar build
 * untuk tes memberi hasil yang sama kapan pun dijalankan.
 */
export function today(): Date {
  const fixed = process.env.DEVMECUM_TODAY;
  if (fixed !== undefined && fixed !== '') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fixed)) {
      throw new Error(`DEVMECUM_TODAY harus berbentuk YYYY-MM-DD, bukan "${fixed}"`);
    }
    return new Date(`${fixed}T00:00:00Z`);
  }
  // Locale en-CA menghasilkan bentuk YYYY-MM-DD.
  const calendarDay = new Intl.DateTimeFormat('en-CA', { timeZone: PROJECT_TIME_ZONE }).format(new Date());
  return new Date(`${calendarDay}T00:00:00Z`);
}

/** Menambah bulan; hari dijepit ke hari terakhir bulan tujuan (31 Agu + 6 bulan = 28 Feb). */
export function addMonths(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const lastDayOfTarget = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDayOfTarget)));
}

/** Halaman usang bila `now` sudah melewati `lastVerified` + `months`. */
export function isStale(lastVerified: Date, months: number, now: Date): boolean {
  return now.getTime() > addMonths(lastVerified, months).getTime();
}

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** `14 November 2026`, selalu dibaca sebagai UTC. */
export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}
