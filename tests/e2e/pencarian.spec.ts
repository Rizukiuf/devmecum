import { expect, test } from '@playwright/test';

test('pencarian menemukan kata unik dan menawarkan filter', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Pencarian' }).click();

  const input = page.locator('.pagefind-ui__search-input');
  await input.fill('kuartadesimal');

  // Pagefind dimuat malas; beri waktu lebih saat suite lain berjalan paralel.
  const result = page.locator('.pagefind-ui__result-link').first();
  await expect(result).toContainText('Halaman usang', { timeout: 20_000 });
  await expect(result).toHaveAttribute('href', /\/fondasi\/uji-komponen\/02-prasyarat\/halaman-usang\//, {
    timeout: 20_000,
  });

  const filters = page.locator('.pagefind-ui__filter-name');
  // Filter dirender bertahap oleh Pagefind; beri waktu lebih saat tes berjalan paralel.
  await expect(filters).toHaveText(['domain', 'jenis', 'level'], { ignoreCase: true, timeout: 20_000 });
});

test('halaman materi membawa nilai filter domain, level, dan jenis', async ({ page }) => {
  await page.goto('/fondasi/uji-komponen/02-prasyarat/halaman-usang/');
  const filter = (name: string) => page.locator(`meta[data-pagefind-filter="${name}[content]"]`);
  await expect(filter('domain')).toHaveAttribute('content', 'Fondasi');
  await expect(filter('level')).toHaveAttribute('content', 'Dasar');
  await expect(filter('jenis')).toHaveAttribute('content', 'Konsep');
});
