import { expect, test } from '@playwright/test';

const URL = '/fondasi/uji-komponen/';

test('kartu data berasal dari file data', async ({ page }) => {
  await page.goto(URL);
  const card = page.getByRole('region', { name: 'Kartu data' });
  const row = (term: string) => card.locator('div', { has: page.locator('dt', { hasText: new RegExp(`^${term}$`) }) }).locator('dd');

  await expect(row('Jenis')).toHaveText('Konsep');
  await expect(row('Versi terbaru')).toHaveText('1.0');
  await expect(row('Kematangan')).toHaveText('Ringkasan');
  await expect(row('Situs resmi').getByRole('link')).toHaveAttribute('href', 'https://example.com');
  await expect(row('Kegunaan')).toContainText('menguji tampilan komponen');
  // Nama diambil dari data teknologi yang dirujuk, bukan slug-nya.
  await expect(row('Alternatif').getByRole('link', { name: 'Python' })).toHaveAttribute('href', '/bahasa/python/');
});

test('kartu data tidak menampilkan baris tanpa data', async ({ page }) => {
  await page.goto(URL);
  const card = page.getByRole('region', { name: 'Kartu data' });
  for (const term of ['Pembuat', 'Lisensi', 'Rilis pertama', 'Prasyarat']) {
    await expect(card.locator('dt', { hasText: new RegExp(`^${term}$`) })).toHaveCount(0);
  }
});

test('keunggulan dan kelemahan tampil sebagai dua daftar berjudul', async ({ page }) => {
  await page.goto(URL);
  const block = page.locator('.dm-proscons');
  await expect(block.getByRole('heading', { name: 'Keunggulan' })).toBeVisible();
  await expect(block.getByRole('heading', { name: 'Kelemahan' })).toBeVisible();
  await expect(block.locator('section').first().getByRole('listitem')).toHaveText(['Keunggulan pertama', 'Keunggulan kedua']);
  await expect(block.locator('section').last().getByRole('listitem')).toHaveText(['Kelemahan pertama']);
});

test('callout berjudul Indonesia', async ({ page }) => {
  await page.goto(URL);
  const titles = page.locator('.starlight-aside__title');
  await expect(titles).toHaveText(['Catatan', 'Tips', 'Peringatan', 'Praktik terbaik', 'Baru di versi 1.0']);
  await expect(page.locator('[data-version-note="1.0"]')).toContainText('Catatan versi uji.');
});

test('blok kode: nama file, tombol salin, sorotan baris, dan diff', async ({ page }) => {
  await page.goto(URL);
  const code = page.locator('.expressive-code');
  await expect(code.first().locator('figcaption')).toContainText('halo.py');
  await expect(code.first().locator('.copy button')).toHaveCount(1);
  await expect(code.first().locator('.ec-line.mark')).toHaveCount(1);
  await expect(code.nth(1).locator('.ec-line.ins')).toHaveCount(1);
  await expect(code.nth(1).locator('.ec-line.del')).toHaveCount(1);
});

test('tab multi-bahasa berganti isi', async ({ page }) => {
  await page.goto(URL);
  const tabs = page.locator('starlight-tabs');
  await expect(tabs.getByRole('tab')).toHaveText(['Python', 'JavaScript']);
  await expect(tabs.getByRole('tabpanel')).toContainText('print("Halo")');
  await tabs.getByRole('tab', { name: 'JavaScript' }).click();
  await expect(tabs.getByRole('tabpanel')).toContainText('console.log("Halo")');
});

test('kartu data menampilkan bintang GitHub dan unduhan paket beserta tanggalnya', async ({ page }) => {
  await page.goto(URL);
  const card = page.getByRole('region', { name: 'Kartu data' });
  const row = (term: string) => card.locator('div', { has: page.locator('dt', { hasText: new RegExp(`^${term}$`) }) }).locator('dd');

  await expect(row('Bintang GitHub')).toContainText('12,3 rb');
  await expect(row('Bintang GitHub')).toContainText('per 15 November 2026');
  await expect(row('Unduhan npm per minggu')).toContainText('2,5 jt');
  await expect(row('Unduhan npm per minggu')).toContainText('per 15 November 2026');
});

test('kartu data memuat baris survei dengan tautan', async ({ page }) => {
  await page.goto(URL);
  const card = page.getByRole('region', { name: 'Kartu data' });
  const survey = card.locator('div', { has: page.locator('dt', { hasText: /^Survei$/ }) }).locator('dd');
  await expect(survey.getByRole('link', { name: 'Survei Uji 2026' })).toHaveAttribute('href', 'https://example.com/survei');
  await expect(survey).toContainText('42% pengguna');
});
