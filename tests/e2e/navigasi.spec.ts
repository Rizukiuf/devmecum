import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { parse } from 'yaml';

const domains = parse(readFileSync('src/data/domains.yaml', 'utf8')) as { id: string; name: string }[];

const TECH = '/fondasi/uji-komponen/';
const USANG = TECH + '02-prasyarat/halaman-usang/';
const DIAGRAM = TECH + '03-konsep-inti-dan-teori/halaman-diagram/';

test('sidebar hanya memuat teknologi yang dibuka', async ({ page }) => {
  await page.goto(USANG);
  const sidebar = page.locator('nav[aria-label="Utama"]').first();
  const hrefs = await sidebar.locator('a').evaluateAll((links) => links.map((a) => a.getAttribute('href') ?? ''));

  expect(hrefs).toEqual(['/', '/katalog/', '/fondasi/', TECH, USANG, DIAGRAM]);
  expect(await page.content()).not.toContain('/bahasa/python/');
});

test('sidebar memberi label bab dan menandai halaman aktif', async ({ page }) => {
  await page.goto(USANG);
  const sidebar = page.locator('nav[aria-label="Utama"]').first();
  await expect(sidebar.getByText('Uji Komponen', { exact: true })).toBeVisible();
  await expect(sidebar.getByText('2 · Prasyarat', { exact: true })).toBeVisible();
  await expect(sidebar.locator('a[aria-current="page"]')).toHaveAttribute('href', USANG);
});

test('sebelumnya dan selanjutnya tetap di dalam teknologi', async ({ page }) => {
  await page.goto(USANG);
  await expect(page.locator('a[rel="prev"]')).toHaveAttribute('href', TECH);
  await expect(page.locator('a[rel="next"]')).toHaveAttribute('href', DIAGRAM);

  await page.goto(DIAGRAM);
  await expect(page.locator('a[rel="next"]')).toHaveCount(0);
});

test('daftar isi memuat judul bagian halaman', async ({ page }) => {
  await page.goto(USANG);
  const toc = page.locator('starlight-toc').first();
  await expect(toc.getByRole('link', { name: 'Bagian pertama' })).toBeVisible();
  await expect(toc.getByRole('link', { name: 'Bagian kedua' })).toBeVisible();
});

test('beranda tidak membocorkan daftar halaman teknologi', async ({ page }) => {
  await page.goto('/');
  expect(await page.content()).not.toContain(USANG);
});

test('sidebar katalog memuat semua domain', async ({ page }) => {
  await page.goto('/katalog/');
  const sidebar = page.locator('nav[aria-label="Utama"]').first();
  const hrefs = await sidebar.locator('a').evaluateAll((links) => links.map((a) => a.getAttribute('href') ?? ''));
  expect(hrefs).toEqual(['/', '/katalog/', ...domains.map((d) => `/${d.id}/`)]);
  expect(domains).toHaveLength(18);
  await expect(sidebar.locator('a[aria-current="page"]')).toHaveAttribute('href', '/katalog/');
});

test('sidebar halaman domain menandai domainnya', async ({ page }) => {
  await page.goto('/fondasi/');
  const sidebar = page.locator('nav[aria-label="Utama"]').first();
  await expect(sidebar.locator('a[aria-current="page"]')).toHaveAttribute('href', '/fondasi/');
});

test('remah roti menautkan domain', async ({ page }) => {
  await page.goto(USANG);
  const crumbs = page.getByRole('navigation', { name: 'Remah roti' });
  await expect(crumbs.getByRole('link', { name: 'Fondasi' })).toHaveAttribute('href', '/fondasi/');
});
