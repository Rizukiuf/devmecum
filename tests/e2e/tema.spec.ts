import { expect, test, type Page } from '@playwright/test';

const URL = '/fondasi/uji-komponen/';
const KEY = 'devmecum:tampilan';
const html = (page: Page) => page.locator('html');

async function openSettings(page: Page) {
  await page.getByRole('button', { name: 'Tampilan' }).click();
  return page.getByRole('dialog', { name: 'Pengaturan tampilan' });
}

test('memilih Sepia mengubah atribut dan bertahan setelah muat ulang', async ({ page }) => {
  await page.goto(URL);
  const dialog = await openSettings(page);
  await dialog.getByLabel('Tema').selectOption({ label: 'Sepia' });

  await expect(html(page)).toHaveAttribute('data-tema', 'sepia');
  await expect(html(page)).toHaveAttribute('data-theme', 'light');

  await page.reload();
  await expect(html(page)).toHaveAttribute('data-tema', 'sepia');
  const dialogAgain = await openSettings(page);
  await expect(dialogAgain.getByLabel('Tema')).toHaveValue('sepia');
});

test('pilihan tema berlabel Indonesia', async ({ page }) => {
  await page.goto(URL);
  const dialog = await openSettings(page);
  await expect(dialog.getByLabel('Tema').locator('option')).toHaveText([
    'Ikuti sistem',
    'Terang',
    'Gelap',
    'Sepia',
    'Kontras tinggi',
  ]);
});

test('dialog bisa ditutup dan fokus kembali ke tombol', async ({ page }) => {
  await page.goto(URL);
  const dialog = await openSettings(page);
  await dialog.getByRole('button', { name: 'Tutup' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: 'Tampilan' })).toBeFocused();
});

test('tema terpasang tanpa skrip eksternal (tidak berkedip)', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '{"tema":"sepia"}'), KEY);
  await page.route('**/*.js', (route) => route.abort());
  await page.goto(URL);
  await expect(html(page)).toHaveAttribute('data-tema', 'sepia');
});

test('Ikuti sistem mengikuti skema warna perangkat', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(URL);
  await expect(html(page)).toHaveAttribute('data-tema', 'light');

  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(html(page)).toHaveAttribute('data-tema', 'dark');
});

test('preferensi rusak tidak merusak halaman', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript((key) => localStorage.setItem(key, '{rusak'), KEY);
  await page.goto(URL);
  await expect(html(page)).toHaveAttribute('data-aksen', 'biru');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});

test('localStorage diblokir tidak merusak halaman', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const blocked = () => {
      throw new DOMException('diblokir', 'SecurityError');
    };
    Storage.prototype.getItem = blocked;
    Storage.prototype.setItem = blocked;
  });
  await page.goto(URL);
  await expect(html(page)).toHaveAttribute('data-tema', /^(light|dark)$/);

  const dialog = await openSettings(page);
  await dialog.getByLabel('Tema').selectOption({ label: 'Gelap' });
  await expect(html(page)).toHaveAttribute('data-tema', 'dark');
  expect(errors).toEqual([]);
});

test('ukuran huruf, lebar, dan font kode mengubah gaya terhitung', async ({ page }) => {
  await page.goto(URL);
  const rootStyle = (prop: string) =>
    page.evaluate((p) => getComputedStyle(document.documentElement).getPropertyValue(p).trim(), prop);
  expect(await rootStyle('font-size')).toBe('16px');

  const dialog = await openSettings(page);
  await dialog.getByLabel('Ukuran huruf').selectOption({ label: 'Sangat besar' });
  await dialog.getByLabel('Lebar konten').selectOption({ label: 'Lebar' });
  await dialog.getByLabel('Font kode').selectOption({ label: 'Klasik' });

  expect(await rootStyle('font-size')).toBe('20px');
  expect(await rootStyle('--sl-content-width')).toBe('55rem');
  const codeFont = await page.locator('main code').first().evaluate((el) => getComputedStyle(el).fontFamily);
  expect(codeFont).toContain('Courier New');
});
