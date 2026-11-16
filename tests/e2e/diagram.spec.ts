import { expect, test } from '@playwright/test';

const URL = '/fondasi/uji-komponen/03-konsep-inti-dan-teori/halaman-diagram/';

test('diagram dirender saat build sebagai SVG berlabel', async ({ page }) => {
  await page.route('**/*.js', (route) => route.abort());
  await page.goto(URL);
  await expect(page.locator('figure.dm-diagram svg')).toHaveCount(2);
  await expect(page.getByRole('img', { name: 'Alur uji' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Urutan pesan' })).toBeVisible();
});

test('tidak ada pustaka Mermaid yang dikirim ke browser', async ({ page }) => {
  const scripts: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'script') scripts.push(request.url());
  });
  await page.goto(URL, { waitUntil: 'networkidle' });
  expect(scripts.filter((url) => /mermaid/i.test(url))).toEqual([]);
});

test('diagram memakai warna tema, bukan warna tetap', async ({ page }) => {
  await page.goto(URL);
  const markup = await page.locator('figure.dm-diagram svg').first().evaluate((svg) => svg.outerHTML);
  expect(markup).not.toMatch(/fill:\s*#ECECFF/i);
});

test('dua diagram di satu halaman punya id SVG yang berbeda', async ({ page }) => {
  await page.goto(URL);
  const ids = await page.locator('figure.dm-diagram svg').evaluateAll((svgs) => svgs.map((svg) => svg.id));
  expect(ids).toHaveLength(2);
  expect(new Set(ids).size).toBe(2);
  const allIds = await page.locator('[id]').evaluateAll((els) => els.map((el) => el.id));
  expect(allIds.length).toBe(new Set(allIds).size);
});
