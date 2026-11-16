import { expect, test } from '@playwright/test';

test('beranda tampil dalam bahasa Indonesia', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'id');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Devmecum');
});

test('halaman tak dikenal memberi 404', async ({ page }) => {
  const res = await page.goto('/tidak-ada/');
  expect(res?.status()).toBe(404);
});

test('beranda mengarahkan ke Ringkasan Python', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Mulai dari Python' }).click();
  await expect(page).toHaveURL(/\/bahasa\/python\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Python');
});

test('Ringkasan Python memuat kartu data, lencana, dan stempel verifikasi', async ({ page }) => {
  const res = await page.goto('/bahasa/python/');
  expect(res?.status()).toBe(200);
  const card = page.getByRole('region', { name: 'Kartu data' });
  await expect(card.getByText('Bahasa pemrograman')).toBeVisible();
  await expect(card.locator('.dm-badge-stage')).toHaveText('Ringkasan');
  await expect(page.locator('.dm-page-meta')).toContainText('Membahas versi 3.15 · Diverifikasi');
  await expect(page.getByText('Perlu ditinjau')).toHaveCount(0);
});

test('sidebar Python tidak memuat teknologi lain', async ({ page }) => {
  await page.goto('/bahasa/python/');
  const hrefs = await page
    .locator('nav[aria-label="Utama"]')
    .first()
    .locator('a')
    .evaluateAll((links) => links.map((a) => a.getAttribute('href') ?? ''));
  expect(hrefs).toEqual(['/', '/katalog/', '/bahasa/', '/bahasa/python/']);
  expect(await page.content()).not.toContain('/fondasi/uji-komponen/');
});
