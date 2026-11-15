import { expect, test } from 'vitest';
import site from '../../site.config.mjs';

test('URL situs https tanpa garis miring di akhir', () => {
  expect(site.url).toMatch(/^https:\/\/[^/]+$/);
  expect(site.repo.public).toBe(true);
});
