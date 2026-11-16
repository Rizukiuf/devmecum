import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { parse } from 'yaml';

const domains = parse(readFileSync('src/data/domains.yaml', 'utf8')) as { id: string; name: string }[];

test('setiap domain punya halaman', async ({ request, page }) => {
  for (const domain of domains) {
    const res = await request.get(`/${domain.id}/`);
    expect(res.status(), domain.id).toBe(200);
    await page.goto(`/${domain.id}/`);
    await expect(page.getByRole('heading', { level: 1 }), domain.id).toHaveText(domain.name);
  }
});

test('halaman domain memuat kartu teknologinya', async ({ page }) => {
  await page.goto('/fondasi/');
  const card = page.locator('[data-slug="uji-komponen"]');
  await expect(card.getByRole('link', { name: 'Uji Komponen', exact: true })).toHaveAttribute('href', '/fondasi/uji-komponen/');
  await expect(card.getByText('Khusus', { exact: true })).toBeVisible();
  await expect(card.getByText('Turun', { exact: true })).toBeVisible();

  await page.goto('/bahasa/');
  await expect(page.locator('[data-slug="python"]').getByRole('link', { name: 'Python', exact: true })).toHaveAttribute('href', '/bahasa/python/');
});

test('halaman materi tidak tertimpa halaman domain', async ({ page }) => {
  const res = await page.goto('/bahasa/python/');
  expect(res?.status()).toBe(200);
  await expect(page.getByRole('region', { name: 'Kartu data' })).toBeVisible();
});

test('teknologi tingkat 0 tampil tanpa tautan', async ({ page }) => {
  await page.goto('/fondasi/');
  const card = page.locator('[data-slug="uji-terdaftar"]');
  await expect(card.locator('.dm-badge-stage')).toHaveText('Terdaftar');
  await expect(card.getByRole('heading', { name: 'Uji Terdaftar' })).toBeVisible();
  await expect(card.getByRole('heading').getByRole('link')).toHaveCount(0);
});

test('kartu mengekspos atribut data untuk filter', async ({ page }) => {
  await page.goto('/fondasi/');
  const card = page.locator('[data-slug="uji-komponen"]');
  await expect(card).toHaveAttribute('data-domain', 'fondasi');
  await expect(card).toHaveAttribute('data-jenis', 'concept');
  await expect(card).toHaveAttribute('data-tingkat', '1');
  await expect(card).toHaveAttribute('data-adopsi', 'khusus');
  await expect(card).toHaveAttribute('data-tren', 'turun');
  await expect(page.locator('[data-slug="uji-terdaftar"]')).toHaveAttribute('data-tingkat', '0');
});

test('kartu dikelompokkan per jenis', async ({ page }) => {
  await page.goto('/fondasi/');
  await expect(page.getByRole('heading', { level: 2, name: 'Konsep' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Tool' })).toBeVisible();
});

test('halaman domain menautkan katalog berfilter', async ({ page }) => {
  await page.goto('/fondasi/');
  await expect(page.locator('main a[href="/katalog/?domain=fondasi"]')).toBeVisible();
  // Ada spasi antara titik tengah dan tautan.
  await expect(page.locator('.dm-domain-summary')).toContainText('terdaftar · Lihat di katalog berfilter');
});

// Tidak memakai domain tertentu sebagai "domain kosong": konten nyata akan mengisinya.
// Setiap halaman domain diperiksa; pesan kosong muncul tepat bila tidak ada kartu,
// dan jumlah di ringkasan sama dengan jumlah kartu.
test('domain tanpa teknologi menampilkan pesan kosong', async ({ page }) => {
  for (const domain of domains) {
    await page.goto(`/${domain.id}/`);
    const cards = await page.locator('article.dm-catalog-card').count();
    const empty = page.getByText('Belum ada teknologi terdaftar di domain ini.');
    await expect(page.locator('.dm-domain-summary'), domain.id).toContainText(`${cards} teknologi terdaftar`);
    if (cards === 0) await expect(empty, domain.id).toBeVisible();
    else await expect(empty, domain.id).toHaveCount(0);
  }
});
