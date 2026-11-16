import { expect, test } from 'vitest';
import { bootScript, DEFAULT_PREFS, parsePrefs, PREF_KEY, PREF_OPTIONS, prefsToAttrs } from '../../src/lib/prefs.ts';

test('kunci penyimpanan dan nilai bawaan', () => {
  expect(PREF_KEY).toBe('devmecum:tampilan');
  expect(DEFAULT_PREFS).toEqual({ tema: 'auto', aksen: 'biru', huruf: 'normal', lebar: 'normal', fontKode: 'bawaan' });
});

test('setiap nilai bawaan termasuk pilihan yang sah', () => {
  for (const [key, value] of Object.entries(DEFAULT_PREFS)) {
    expect(PREF_OPTIONS[key as keyof typeof PREF_OPTIONS]).toContain(value);
  }
});

test.each([null, '', 'bukan json', '[]', '42', 'null', '{"tema":"neon","huruf":7}', '{"tema":["sepia"]}'])(
  'masukan rusak %j → nilai bawaan',
  (raw) => {
    expect(parsePrefs(raw)).toEqual(DEFAULT_PREFS);
  },
);

test('kolom sah dipertahankan, yang rusak diganti', () => {
  expect(parsePrefs('{"tema":"sepia","aksen":"merah"}')).toEqual({ ...DEFAULT_PREFS, tema: 'sepia' });
  expect(parsePrefs('{"huruf":"besar","lebar":"lebar","fontKode":"klasik","lain":1}')).toEqual({
    ...DEFAULT_PREFS,
    huruf: 'besar',
    lebar: 'lebar',
    fontKode: 'klasik',
  });
});

test.each([
  ['auto', true, 'light', 'light'],
  ['auto', false, 'dark', 'dark'],
  ['light', false, 'light', 'light'],
  ['dark', true, 'dark', 'dark'],
  ['sepia', false, 'light', 'sepia'],
  ['contrast', true, 'dark', 'contrast'],
] as const)('tema %s, sistem terang=%s → data-theme %s, data-tema %s', (tema, systemLight, base, shown) => {
  const attrs = prefsToAttrs({ ...DEFAULT_PREFS, tema }, systemLight);
  expect([attrs['data-theme'], attrs['data-tema']]).toEqual([base, shown]);
});

test('semua preferensi menjadi atribut', () => {
  expect(prefsToAttrs({ tema: 'dark', aksen: 'hijau', huruf: 'besar', lebar: 'sempit', fontKode: 'lokal' }, true)).toEqual({
    'data-theme': 'dark',
    'data-tema': 'dark',
    'data-aksen': 'hijau',
    'data-huruf': 'besar',
    'data-lebar': 'sempit',
    'data-font-kode': 'lokal',
  });
});

/** Menjalankan skrip inline seperti browser, dengan document dan localStorage tiruan. */
function runBoot(storage: { getItem: (key: string) => string | null }, systemLight: boolean) {
  const attrs: Record<string, string> = {};
  const env = {
    document: { documentElement: { setAttribute: (k: string, v: string) => void (attrs[k] = v) } },
    localStorage: storage,
    matchMedia: () => ({ matches: systemLight }),
  };
  new Function('document', 'localStorage', 'matchMedia', bootScript())(env.document, env.localStorage, env.matchMedia);
  return attrs;
}

test('skrip inline memasang atribut dari preferensi tersimpan', () => {
  const attrs = runBoot({ getItem: (key) => (key === PREF_KEY ? '{"tema":"sepia","aksen":"ungu"}' : null) }, false);
  expect(attrs).toMatchObject({ 'data-theme': 'light', 'data-tema': 'sepia', 'data-aksen': 'ungu' });
});

test('skrip inline tetap jalan saat localStorage melempar galat', () => {
  const attrs = runBoot(
    {
      getItem: () => {
        throw new Error('diblokir');
      },
    },
    true,
  );
  expect(attrs).toMatchObject({ 'data-theme': 'light', 'data-tema': 'light', 'data-aksen': 'biru' });
});

test('skrip inline berdiri sendiri: tidak merujuk import atau modul', () => {
  expect(bootScript()).not.toMatch(/\bimport\b|\brequire\b|__vite/);
});
