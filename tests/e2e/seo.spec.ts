import { expect, test } from '@playwright/test';

const USANG = '/fondasi/uji-komponen/02-prasyarat/halaman-usang/';

test('peta situs memuat halaman terbit dan tidak memuat draf', async ({ request }) => {
  const xml = await (await request.get('/sitemap-0.xml')).text();
  expect(xml).toContain('/fondasi/uji-komponen/');
  expect(xml).not.toContain('halaman-draf');
});

test('gambar pratinjau per teknologi', async ({ page, request }) => {
  await page.goto(USANG);
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(og).toMatch(/^https:\/\/.+\/og\/uji-komponen\.png$/);
  expect(await page.locator('meta[name="twitter:image"]').getAttribute('content')).toBe(og);

  const response = await request.get('/og/uji-komponen.png');
  expect(response.status()).toBe(200);
  const buf = await response.body();
  expect(buf.subarray(1, 4).toString()).toBe('PNG');
  expect([buf.readUInt32BE(16), buf.readUInt32BE(20)]).toEqual([1200, 630]);
});

test('halaman tanpa teknologi memakai gambar pratinjau bawaan Starlight, bukan milik teknologi', async ({ page }) => {
  await page.goto('/');
  const og = await page.locator('meta[property="og:image"]').count();
  if (og > 0) expect(await page.locator('meta[property="og:image"]').getAttribute('content')).not.toContain('/og/');
});

test('setiap halaman punya deskripsi dan URL kanonik', async ({ page }) => {
  for (const url of ['/', '/fondasi/uji-komponen/', USANG]) {
    await page.goto(url);
    expect(await page.locator('meta[name="description"]').getAttribute('content'), url).toBeTruthy();
    expect(await page.locator('link[rel="canonical"]').getAttribute('href'), url).toMatch(
      /^https:\/\/devmecum\.stellify\.workers\.dev\//,
    );
  }
});

test('halaman baca tidak memuat apa pun dari origin lain', async ({ page }) => {
  const foreign: string[] = [];
  page.on('request', (request) => {
    const url = request.url();
    if (!url.startsWith('http://localhost:4321') && !url.startsWith('data:')) foreign.push(url);
  });
  await page.goto('/fondasi/uji-komponen/', { waitUntil: 'networkidle' });
  expect(foreign).toEqual([]);
});
