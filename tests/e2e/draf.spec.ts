import { expect, test } from '@playwright/test';

const TECH = '/fondasi/uji-komponen/';

test('halaman terbit ada di build', async ({ page }) => {
  expect((await page.goto(TECH))?.status()).toBe(200);
  expect((await page.goto(TECH + '02-prasyarat/halaman-usang/'))?.status()).toBe(200);
});

test('halaman draf tidak ikut dibangun', async ({ page }) => {
  const res = await page.goto(TECH + '03-konsep-inti-dan-teori/halaman-draf/');
  expect(res?.status()).toBe(404);
});
