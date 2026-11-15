import { expect, test } from '@playwright/test';

const URL = '/fondasi/uji-komponen/03-konsep-inti-dan-teori/halaman-diagram/';

test('diagram dirender saat build sebagai SVG berlabel', async ({ page }) => {
  await page.route('**/*.js', (route) => route.abort());
  await page.goto(URL);
  await expect(page.locator('figure.dm-diagram svg')).toBeVisible();
  await expect(page.getByRole('img', { name: 'Alur uji' })).toBeVisible();
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
  const style = await page.locator('figure.dm-diagram svg').evaluate((svg) => svg.outerHTML);
  expect(style).not.toMatch(/fill:\s*#ECECFF/i);
});
