import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const KEY = 'devmecum:tampilan';
/** Halaman yang diperiksa kontrasnya. Task berikutnya menambah halaman ke daftar ini. */
const PAGES = [
  '/fondasi/uji-komponen/',
  '/fondasi/uji-komponen/02-prasyarat/halaman-usang/',
  '/fondasi/uji-komponen/03-konsep-inti-dan-teori/halaman-diagram/',
  '/fondasi/',
  '/bahasa/python/',
];

const AKSEN = ['biru', 'hijau', 'ungu', 'jingga'];
const COMBOS: [string, string][] = [
  ...['light', 'dark', 'sepia'].flatMap((tema) => AKSEN.map((aksen): [string, string] => [tema, aksen])),
  ['contrast', 'biru'],
];

/** Katalog memuat ratusan kartu (sekitar 7.400 node DOM pada 441 teknologi), jadi axe di sana
 *  butuh 3-4 dtk per kunjungan, sekitar sepuluh kali halaman lain. Karena itu katalog hanya
 *  diperiksa pada kombinasi di bawah, bukan pada ke-13 kombinasi.
 *
 *  Aksen di kartu hanya muncul pada lencana tingkat (aksen-high di atas aksen-low) dan
 *  tautan (aksen di tema terang dan sepia, aksen-high di tema gelap). Lencana adopsi dan
 *  tren memakai warna semantik Starlight yang tidak berubah menurut aksen. Kombinasi dipilih
 *  dari rasio kontras token-token itu terhadap latar kartu:
 *  - light + biru: tema dan aksen bawaan; tautan paling tipis di tema terang (6,2:1).
 *  - dark + biru: tema gelap bawaan; di tema gelap semua aksen berkontras di atas 10:1.
 *  - sepia + jingga: kombinasi paling tipis (tautan 5,7:1, lencana 6,5:1).
 *  - contrast + biru: satu-satunya tema dengan skala abu-abu dan tautan kuning sendiri;
 *    aksen diabaikan di tema ini.
 *  Semua halaman lain tetap diperiksa pada seluruh kombinasi. */
const CATALOG = '/katalog/';
const CONTRAST_COMBOS_CATALOG = new Set(['light/biru', 'dark/biru', 'sepia/jingga', 'contrast/biru']);

/** Tes yang mengunjungi banyak halaman dengan axe butuh 6-16 dtk di laptop cepat dan lebih
 *  lama di runner CI, jadi batas bawaan 30 dtk terlalu tipis. */
const LONG_TEST_TIMEOUT = 90_000;

async function open(page: Page, url: string, tema: string, aksen: string) {
  await page.addInitScript(([key, value]) => localStorage.setItem(key!, value!), [KEY, JSON.stringify({ tema, aksen })]);
  await page.goto(url);
  await expect(page.locator('html')).toHaveAttribute('data-tema', tema);
}

const summarize = (violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) =>
  violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')} — ${n.failureSummary?.split('\n')[1]?.trim()}`));

for (const [tema, aksen] of COMBOS) {
  test(`kontras AA: ${tema} + ${aksen}`, async ({ page }) => {
    test.setTimeout(LONG_TEST_TIMEOUT);
    const pages = CONTRAST_COMBOS_CATALOG.has(`${tema}/${aksen}`) ? [...PAGES, CATALOG] : PAGES;
    for (const url of pages) {
      await open(page, url, tema, aksen);
      const result = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
      expect(summarize(result.violations), url).toEqual([]);
    }
  });
}

for (const tema of ['light', 'dark']) {
  test(`tidak ada pelanggaran WCAG 2 A/AA di tema ${tema}`, async ({ page }) => {
    test.setTimeout(LONG_TEST_TIMEOUT);
    // Light dan dark dengan aksen biru termasuk kombinasi katalog, jadi katalog ikut diperiksa penuh.
    for (const url of ['/', ...PAGES, CATALOG]) {
      await open(page, url, tema, 'biru');
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      expect(summarize(result.violations), url).toEqual([]);
    }
  });
}

test('dialog pengaturan tampilan lolos pemeriksaan aksesibilitas', async ({ page }) => {
  await open(page, PAGES[0]!, 'light', 'biru');
  await page.getByRole('button', { name: 'Tampilan' }).click();
  const result = await new AxeBuilder({ page }).include('dm-display-settings dialog').withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(summarize(result.violations)).toEqual([]);
});
