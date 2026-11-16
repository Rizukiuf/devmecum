import { expect, test, type Page } from '@playwright/test';

const CARD = 'article.dm-catalog-card';
const URL = '/katalog/';

const filter = (page: Page) => page.locator('dm-catalog-filter');
const card = (page: Page, slug: string) => page.locator(`${CARD}[data-slug="${slug}"]`);
const counter = (page: Page) => filter(page).locator('[aria-live="polite"]');

/**
 * Atribut tiap kartu yang terlihat. Tes membandingkan atribut ini dengan filter,
 * bukan menghitung kartu, supaya tidak bergantung pada jumlah teknologi nyata.
 */
const visibleCards = (page: Page) =>
  page.locator(`${CARD}:visible`).evaluateAll((cards) =>
    cards.map((el) => ({
      slug: el.getAttribute('data-slug') ?? '',
      name: el.querySelector('h3')?.textContent?.trim() ?? '',
      tags: JSON.parse(el.getAttribute('data-tags') ?? '[]') as string[],
      domain: el.getAttribute('data-domain'),
      tingkat: el.getAttribute('data-tingkat'),
      adopsi: el.getAttribute('data-adopsi'),
    })),
  );

/** Setiap kartu yang terlihat memuat `term` di nama, slug, atau tagnya. */
async function expectVisibleMatchSearch(page: Page, term: string) {
  const cards = await visibleCards(page);
  expect(cards.length).toBeGreaterThan(0);
  for (const item of cards) {
    const haystack = [item.name, item.slug, ...item.tags].map((text) => text.toLowerCase());
    expect(haystack.some((text) => text.includes(term)), item.slug).toBe(true);
  }
}

/** String yang tidak cocok dengan teknologi apa pun, nyata maupun uji. */
const NO_MATCH = 'zzq-tidak-ada-teknologi-ini';

/** Mencatat galat halaman dan galat konsol supaya tes bisa memastikan tidak ada. */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test.describe('tanpa JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('tanpa JavaScript semua kartu tampil', async ({ page }) => {
    const res = await page.goto(`${URL}?domain=fondasi`);
    expect(res?.status()).toBe(200);
    const total = await page.locator(CARD).count();
    expect(total).toBeGreaterThan(0);
    await expect(page.locator(`${CARD}:visible`)).toHaveCount(total);
    await expect(filter(page).locator('form')).toBeHidden();
  });
});

test('filter kematangan', async ({ page }) => {
  await page.goto(URL);
  await filter(page).getByLabel('Kematangan').selectOption({ label: 'Terdaftar' });

  await expect(card(page, 'uji-terdaftar')).toBeVisible();
  await expect(card(page, 'python')).toBeHidden();
  await expect(card(page, 'uji-komponen')).toBeHidden();
  // Hanya kartu tingkat 0 yang tersisa, termasuk entri nyata yang baru terdaftar.
  const stages = (await visibleCards(page)).map((item) => item.tingkat);
  expect(stages.length).toBeGreaterThan(0);
  expect(new Set(stages)).toEqual(new Set(['0']));
  await expect(page).toHaveURL(/\/katalog\/\?tingkat=0$/);
});

test('filter domain menyaring kartu dan URL', async ({ page }) => {
  await page.goto(URL);
  const total = await page.locator(CARD).count();
  await expect(counter(page)).toHaveText(`Menampilkan ${total} dari ${total} teknologi`);

  await filter(page).getByLabel('Domain').selectOption({ label: 'Fondasi' });

  await expect(card(page, 'uji-komponen')).toBeVisible();
  await expect(card(page, 'python')).toBeHidden();
  await expect(page).toHaveURL(/\/katalog\/\?domain=fondasi$/);
  expect(new Set((await visibleCards(page)).map((item) => item.domain))).toEqual(new Set(['fondasi']));
  const shown = await page.locator(`${CARD}[data-domain="fondasi"]`).count();
  await expect(counter(page)).toHaveText(`Menampilkan ${shown} dari ${total} teknologi`);
});

test('filter dari URL diterapkan saat dimuat', async ({ page }) => {
  await page.goto(`${URL}?adopsi=khusus`);
  await expect(filter(page).getByLabel('Adopsi')).toHaveValue('khusus');
  await expect(card(page, 'uji-komponen')).toBeVisible();
  await expect(card(page, 'python')).toBeHidden();
  // Teknologi dengan adopsi lain tidak lolos filter adopsi.
  await expect(card(page, 'uji-terdaftar')).toBeHidden();
  // Kartu tanpa data adopsi (atribut tidak ada) juga tidak lolos.
  expect(new Set((await visibleCards(page)).map((item) => item.adopsi))).toEqual(new Set(['khusus']));
});

test('nilai tak dikenal diabaikan', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(`${URL}?domain=tidak-ada`);
  await expect(filter(page).locator('form')).toBeVisible();

  const total = await page.locator(CARD).count();
  await expect(page.locator(`${CARD}:visible`)).toHaveCount(total);
  await expect(filter(page).getByLabel('Domain')).toHaveValue('');
  expect(errors).toEqual([]);
});

test('cari nama', async ({ page }) => {
  await page.goto(URL);
  const total = await page.locator(CARD).count();
  await filter(page).getByLabel('Cari nama').fill('pyt');

  await expect(card(page, 'python')).toBeVisible();
  await expect(card(page, 'uji-komponen')).toBeHidden();
  await expect(card(page, 'uji-terdaftar')).toBeHidden();
  await expect(page).toHaveURL(/\/katalog\/\?q=pyt$/);
  await expectVisibleMatchSearch(page, 'pyt');

  await filter(page).getByRole('button', { name: 'Atur ulang' }).click();
  await expect(page.locator(`${CARD}:visible`)).toHaveCount(total);
  await expect(filter(page).getByLabel('Cari nama')).toHaveValue('');
  await expect(page).toHaveURL(/\/katalog\/$/);
});

test('tanpa hasil', async ({ page }) => {
  await page.goto(URL);
  const empty = page.getByText('Tidak ada teknologi yang cocok dengan filter ini.');
  await expect(empty).toBeHidden();

  await filter(page).getByLabel('Domain').selectOption({ label: 'Fondasi' });
  await filter(page).getByLabel('Cari nama').fill(NO_MATCH);

  await expect(page.locator(`${CARD}:visible`)).toHaveCount(0);
  await expect(empty).toBeVisible();
  await expect(counter(page)).toHaveText(/^Menampilkan 0 dari \d+ teknologi$/);
});

test('kontrol berlabel dan opsi pertama "Semua"', async ({ page }) => {
  await page.goto(URL);
  for (const label of ['Domain', 'Jenis', 'Kematangan', 'Adopsi', 'Tren']) {
    const select = filter(page).getByRole('combobox', { name: label, exact: true });
    await expect(select, label).toHaveValue('');
    await expect(select.locator('option').first(), label).toHaveText('Semua');
  }
  await expect(filter(page).getByRole('searchbox', { name: 'Cari nama' })).toBeVisible();
  await expect(filter(page).getByLabel('Kematangan').locator('option')).toHaveText([
    'Semua',
    'Terdaftar',
    'Ringkasan',
    'Dasar',
    'Menengah',
    'Lanjut',
    'Profesional',
  ]);
});

test('pilihan Jenis hanya jenis yang ada di katalog', async ({ page }) => {
  await page.goto(URL);
  const present = await page
    .locator(CARD)
    .evaluateAll((cards) => [...new Set(cards.map((el) => el.getAttribute('data-jenis')))]);
  expect(present.length).toBeGreaterThan(0);
  const options = await filter(page)
    .getByLabel('Jenis')
    .locator('option')
    .evaluateAll((items) => items.map((el) => (el as HTMLOptionElement).value).filter((value) => value !== ''));
  expect(new Set(options)).toEqual(new Set(present));
});

test('formulir bisa dipakai dengan papan ketik', async ({ page }) => {
  await page.goto(URL);
  const total = await page.locator(CARD).count();
  const domain = filter(page).getByLabel('Domain');
  await domain.focus();
  for (const label of ['Jenis', 'Kematangan', 'Adopsi', 'Tren', 'Cari nama']) {
    await page.keyboard.press('Tab');
    await expect(filter(page).getByLabel(label, { exact: true }), label).toBeFocused();
  }
  await page.keyboard.type('pyt');
  await expect(card(page, 'uji-komponen')).toBeHidden();
  await expect(card(page, 'python')).toBeVisible();
  await expectVisibleMatchSearch(page, 'pyt');
  // Enter di kotak pencarian tidak memuat ulang halaman.
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/katalog\/\?q=pyt$/);

  await page.keyboard.press('Tab');
  const reset = filter(page).getByRole('button', { name: 'Atur ulang' });
  await expect(reset).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator(`${CARD}:visible`)).toHaveCount(total);
  await expect(page).toHaveURL(/\/katalog\/$/);
});
