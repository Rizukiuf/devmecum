import { expect, test } from 'vitest';
import { htmlHasFixtureSlug, sitemapFixtureUrls } from '../../src/lib/fixture-guard.ts';

const sitemap = (...paths: string[]) =>
  `<?xml version="1.0"?><urlset>${paths.map((path) => `<url><loc>https://devmecum.example${path}</loc></url>`).join('')}</urlset>`;

test('sitemapFixtureUrls: teknologi uji (segmen kedua) terdeteksi', () => {
  const xml = sitemap('/', '/fondasi/', '/fondasi/uji-komponen/', '/fondasi/uji-komponen/02-prasyarat/halaman-usang/');
  expect(sitemapFixtureUrls(xml)).toEqual([
    'https://devmecum.example/fondasi/uji-komponen/',
    'https://devmecum.example/fondasi/uji-komponen/02-prasyarat/halaman-usang/',
  ]);
});

test('sitemapFixtureUrls: slug halaman nyata berawalan uji- (segmen ketiga) tidak dianggap fixture', () => {
  const xml = sitemap('/testing/jest/uji-unit/', '/testing/jest/uji-unit-testing/', '/bahasa/python/uji-coba/');
  expect(sitemapFixtureUrls(xml)).toEqual([]);
});

test('sitemapFixtureUrls: domain atau teknologi yang hanya memuat uji- di tengah nama lolos', () => {
  const xml = sitemap('/testing/', '/testing/pengujian/', '/testing/contoh-uji-x/', '/uji/', '/katalog/');
  expect(sitemapFixtureUrls(xml)).toEqual([]);
});

test('sitemapFixtureUrls: tanpa <loc> → kosong', () => {
  expect(sitemapFixtureUrls('')).toEqual([]);
});

test('htmlHasFixtureSlug: hanya atribut data-slug kartu uji', () => {
  expect(htmlHasFixtureSlug('<article data-slug="uji-komponen">')).toBe(true);
  expect(htmlHasFixtureSlug('<article data-slug="jest"><a href="/testing/jest/uji-unit/">Uji unit</a>')).toBe(false);
});
