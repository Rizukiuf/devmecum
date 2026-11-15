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
