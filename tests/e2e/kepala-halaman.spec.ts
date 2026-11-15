import { expect, test } from '@playwright/test';

const TECH = '/fondasi/uji-komponen/';
const USANG = TECH + '02-prasyarat/halaman-usang/';

test('halaman segar: stempel tanpa lencana tinjau', async ({ page }) => {
  await page.goto(TECH);
  await expect(page.getByText('Membahas versi 1.0 · Diverifikasi 1 November 2026')).toBeVisible();
  await expect(page.getByText('Perlu ditinjau')).toHaveCount(0);
  await expect(page.getByText('Belum diuji otomatis')).toHaveCount(0);
});

test('halaman usang: lencana tinjau, level, dan label belum diuji', async ({ page }) => {
  await page.goto(USANG);
  const meta = page.locator('.dm-page-meta');
  await expect(meta.getByText('Membahas versi 1.0 · Diverifikasi 1 Januari 2020')).toBeVisible();
  for (const text of ['Perlu ditinjau', 'Belum diuji otomatis', 'Dasar']) {
    await expect(meta.getByText(text, { exact: true })).toBeVisible();
  }
});

test('halaman Ringkasan tidak menampilkan lencana level', async ({ page }) => {
  await page.goto(TECH);
  await expect(page.locator('.dm-page-meta').getByText('Umum')).toHaveCount(0);
});

test('remah roti halaman bab', async ({ page }) => {
  await page.goto(USANG);
  const crumbs = page.getByRole('navigation', { name: 'Remah roti' });
  await expect(crumbs.getByRole('listitem')).toHaveText(['Beranda', 'Fondasi', 'Uji Komponen', 'Prasyarat']);
  await expect(crumbs.getByRole('link', { name: 'Beranda' })).toHaveAttribute('href', '/');
  await expect(crumbs.getByRole('link', { name: 'Uji Komponen' })).toHaveAttribute('href', TECH);
});

test('remah roti halaman Ringkasan berakhir di nama teknologi', async ({ page }) => {
  await page.goto(TECH);
  const crumbs = page.getByRole('navigation', { name: 'Remah roti' });
  await expect(crumbs.getByRole('listitem')).toHaveText(['Beranda', 'Fondasi', 'Uji Komponen']);
  await expect(crumbs.getByRole('link', { name: 'Uji Komponen' })).toHaveCount(0);
});

test('judul halaman tetap satu h1', async ({ page }) => {
  await page.goto(USANG);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Halaman usang');
  await expect(page.locator('h1')).toHaveCount(1);
});

test('tautan sunting dan lapor menuju repo GitHub', async ({ page }) => {
  await page.goto(TECH);
  await expect(page.getByRole('link', { name: 'Sunting halaman' })).toHaveAttribute(
    'href',
    /github\.com\/.+\/devmecum\/edit\/main\/src\/content\/docs\/fondasi\/uji-komponen\/index\.mdx$/,
  );
  const report = page.getByRole('link', { name: 'Lapor kesalahan' });
  await expect(report).toHaveAttribute('href', /github\.com\/.+\/devmecum\/issues\/new\?/);
  expect(decodeURIComponent((await report.getAttribute('href'))!)).toContain('/fondasi/uji-komponen/');
});

test('beranda tidak menampilkan stempel atau remah roti', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Diverifikasi')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Remah roti' })).toHaveCount(0);
});
