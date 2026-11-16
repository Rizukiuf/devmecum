import { expect, test } from 'vitest';
import {
  compareVersions,
  isPrerelease,
  parseVersion,
  pickLatest,
  seriesMatches,
} from '../../src/lib/versions.ts';

test('parseVersion mengambil deret angka pertama', () => {
  expect(parseVersion('v3.15.2')).toEqual([3, 15, 2]);
  expect(parseVersion('go1.25.3')).toEqual([1, 25, 3]);
  expect(parseVersion('3.x')).toEqual([3]);
  expect(parseVersion('1.0.0.dev1')).toEqual([1, 0, 0]);
  expect(parseVersion('tanpa-angka')).toBeUndefined();
});

test.each(['3.16.0a1', 'v3.15.0rc3', '7.0.0-rc.1', '6.0.0-M1', '2.0.0-beta.2', '19.3.0-canary-abc', '1.0.0.dev1', '5.0.0-preview.3', 'REL_18_BETA1', '3.5.0-SNAPSHOT', '6.4.0.CR1', '3.14.0b2'])(
  'isPrerelease: %s adalah prarilis',
  (raw) => {
    expect(isPrerelease(raw)).toBe(true);
  },
);

test.each(['3.15.2', 'v19.2.0', 'go1.25.3', 'REL_17_2', '2.7.18.RELEASE', '6.4.0.Final', '33.0.0-android'])(
  'isPrerelease: %s bukan prarilis',
  (raw) => {
    expect(isPrerelease(raw)).toBe(false);
  },
);

test('compareVersions membandingkan angka, bukan teks', () => {
  expect(compareVersions('3.10', '3.9')).toBeGreaterThan(0);
  expect(compareVersions('3.9', '3.10')).toBeLessThan(0);
  expect(compareVersions('v3.15.10', '3.15.2')).toBeGreaterThan(0);
  expect(compareVersions('1.25', '1.25.0')).toBe(0);
  expect(compareVersions('1.25', '1.25.3')).toBeLessThan(0);
  // Angka sama: rilis stabil lebih baru dari prarilisnya.
  expect(compareVersions('7.0.0', '7.0.0-rc.1')).toBeGreaterThan(0);
});

test('pickLatest tanpa pola membuang prarilis', () => {
  expect(pickLatest(['v3.15.2', 'v3.16.0a1', 'v3.15.10'])).toBe('3.15.10');
  expect(pickLatest(['7.0.0-rc.1', '6.0.0-M1', '2.0.0-beta.2', '19.3.0-canary-abc', '5.0.0-preview.3'])).toBeUndefined();
  expect(pickLatest(['3.4.0', '3.5.0-M1', '3.5.0-RC1', '2.7.18.RELEASE'])).toBe('3.4.0');
  expect(pickLatest([])).toBeUndefined();
});

test('pickLatest dengan pola', () => {
  expect(pickLatest(['REL_17_2', 'REL_16_6', 'REL_18_BETA1'], '^REL_(\\d+)_(\\d+)$')).toBe('17.2');
});

test('pickLatest dengan pola menuntut kecocokan penuh', () => {
  // Pola tanpa jangkar tetap dicocokkan ke seluruh tag.
  expect(pickLatest(['xREL_19_0', 'REL_17_2', 'REL_18_0-rc'], 'REL_(\\d+)_(\\d+)')).toBe('17.2');
});

test('pickLatest dengan pola melewati grup yang tidak ikut cocok', () => {
  const go = '^go(\\d+)\\.(\\d+)(?:\\.(\\d+))?$';
  expect(pickLatest(['go1.25'], go)).toBe('1.25');
  expect(pickLatest(['go1.25.3'], go)).toBe('1.25.3');
  expect(pickLatest(['go1.25', 'go1.25.3', 'go1.26rc1', 'go1.9.7', 'weekly.2012-03-27'], go)).toBe('1.25.3');
});

test('pickLatest dengan pola tidak memilih tag yang tidak cocok', () => {
  expect(pickLatest(['v3.16.0a1', 'v3.15.0rc3'], '^v(\\d+)\\.(\\d+)\\.(\\d+)$')).toBeUndefined();
});

test('seriesMatches', () => {
  expect(seriesMatches('3.15', '3.15.3')).toBe(true);
  expect(seriesMatches('3.15', '3.16.0')).toBe(false);
  expect(seriesMatches('3.x', '3.16.0')).toBe(true);
  expect(seriesMatches('3.x', '4.0.0')).toBe(false);
  expect(seriesMatches('3.1', '3.15.0')).toBe(false);
  expect(seriesMatches('tanpa-angka', '3.15.0')).toBe(false);
});
