// Preferensi tampilan pembaca: tema, warna aksen, ukuran huruf, lebar konten,
// dan font kode. Disimpan di localStorage browser (tanpa akun, tanpa server)
// dan diterapkan sebagai atribut di <html>.
//
// `parsePrefsWith` dan `prefsToAttrs` sengaja TIDAK merujuk apa pun di luar
// badannya: sumbernya disalin ke skrip inline di <head> (lihat `bootScript`),
// sehingga tema terpasang sebelum halaman digambar dan hanya ada satu
// implementasi.

export const PREF_KEY = 'devmecum:tampilan';

export const PREF_OPTIONS = {
  tema: ['auto', 'light', 'dark', 'sepia', 'contrast'],
  aksen: ['biru', 'hijau', 'ungu', 'jingga'],
  huruf: ['kecil', 'normal', 'besar', 'sangat-besar'],
  lebar: ['sempit', 'normal', 'lebar'],
  fontKode: ['bawaan', 'klasik', 'lokal'],
} as const;

export type Prefs = { [K in keyof typeof PREF_OPTIONS]: (typeof PREF_OPTIONS)[K][number] };

export const DEFAULT_PREFS: Prefs = {
  tema: 'auto',
  aksen: 'biru',
  huruf: 'normal',
  lebar: 'normal',
  fontKode: 'bawaan',
};

export type PrefAttrs = {
  'data-theme': 'light' | 'dark';
  'data-tema': 'light' | 'dark' | 'sepia' | 'contrast';
  'data-aksen': string;
  'data-huruf': string;
  'data-lebar': string;
  'data-font-kode': string;
};

/** Apa pun yang tidak sah diganti nilai bawaan, per kolom. Tidak pernah melempar. */
export function parsePrefsWith(
  options: Record<string, readonly string[]>,
  defaults: Record<string, string>,
  raw: string | null,
): Record<string, string> {
  const prefs: Record<string, string> = {};
  for (const key in defaults) prefs[key] = defaults[key] as string;
  try {
    const stored: unknown = JSON.parse(raw || 'null');
    if (stored && typeof stored === 'object') {
      for (const key in defaults) {
        const value = (stored as Record<string, unknown>)[key];
        if (typeof value === 'string' && (options[key] as readonly string[]).indexOf(value) !== -1) {
          prefs[key] = value;
        }
      }
    }
  } catch {
    // JSON rusak: pakai nilai bawaan.
  }
  return prefs;
}

/**
 * `data-theme` tetap `light` atau `dark` karena itu yang dibaca Starlight dan
 * blok kode; tema Devmecum yang sebenarnya ada di `data-tema`.
 */
export function prefsToAttrs(prefs: Record<string, string>, systemLight: boolean): PrefAttrs {
  const tema = prefs.tema === 'auto' ? (systemLight ? 'light' : 'dark') : prefs.tema;
  return {
    'data-theme': tema === 'light' || tema === 'sepia' ? 'light' : 'dark',
    'data-tema': tema as PrefAttrs['data-tema'],
    'data-aksen': prefs.aksen as string,
    'data-huruf': prefs.huruf as string,
    'data-lebar': prefs.lebar as string,
    'data-font-kode': prefs.fontKode as string,
  };
}

export function parsePrefs(raw: string | null): Prefs {
  return parsePrefsWith(PREF_OPTIONS, DEFAULT_PREFS, raw) as Prefs;
}

/** Sumber skrip inline untuk <head>: membaca preferensi dan memasang atribut sebelum halaman digambar. */
export function bootScript(): string {
  return `(() => {
  const parse = ${parsePrefsWith.toString()};
  const toAttrs = ${prefsToAttrs.toString()};
  let raw = null;
  try { raw = localStorage.getItem(${JSON.stringify(PREF_KEY)}); } catch {}
  const prefs = parse(${JSON.stringify(PREF_OPTIONS)}, ${JSON.stringify(DEFAULT_PREFS)}, raw);
  const attrs = toAttrs(prefs, matchMedia('(prefers-color-scheme: light)').matches);
  for (const name in attrs) document.documentElement.setAttribute(name, attrs[name]);
})();`;
}
