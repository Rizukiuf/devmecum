import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const KEY = 'devmecum:tampilan';
/** Halaman yang diperiksa kontrasnya. Task berikutnya menambah halaman ke daftar ini. */
const PAGES = ['/fondasi/uji-komponen/', '/fondasi/uji-komponen/02-prasyarat/halaman-usang/'];

const AKSEN = ['biru', 'hijau', 'ungu', 'jingga'];
const COMBOS: [string, string][] = [
  ...['light', 'dark', 'sepia'].flatMap((tema) => AKSEN.map((aksen): [string, string] => [tema, aksen])),
  ['contrast', 'biru'],
];

async function open(page: Page, url: string, tema: string, aksen: string) {
  await page.addInitScript(([key, value]) => localStorage.setItem(key!, value!), [KEY, JSON.stringify({ tema, aksen })]);
  await page.goto(url);
  await expect(page.locator('html')).toHaveAttribute('data-tema', tema);
}

const summarize = (violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) =>
  violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')} — ${n.failureSummary?.split('\n')[1]?.trim()}`));

for (const [tema, aksen] of COMBOS) {
  test(`kontras AA: ${tema} + ${aksen}`, async ({ page }) => {
    for (const url of PAGES) {
      await open(page, url, tema, aksen);
      const result = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
      expect(summarize(result.violations), url).toEqual([]);
    }
  });
}

for (const tema of ['light', 'dark']) {
  test(`tidak ada pelanggaran WCAG 2 A/AA di tema ${tema}`, async ({ page }) => {
    for (const url of ['/', ...PAGES]) {
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
