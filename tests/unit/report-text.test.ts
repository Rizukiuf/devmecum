import { expect, test } from 'vitest';
import { code } from '../../src/lib/report-text.ts';

test('code: teks biasa menjadi span kode', () => {
  expect(code('npm @angular/core')).toBe('`npm @angular/core`');
});

test('code: backtick di dalam teks tidak menutup span lebih awal', () => {
  expect(code('a`b```c')).toBe('````a`b```c````');
});

test('code: teks yang diawali atau diakhiri backtick diberi spasi pengaman', () => {
  expect(code('`x`')).toBe('`` `x` ``');
});

test('code: baris baru dan karakter kontrol menjadi satu spasi', () => {
  expect(code('a\r\nb\u0000c\u2028d')).toBe('`a b c d`');
});

test('code: teks panjang dipotong', () => {
  expect(code('z'.repeat(5000)).length).toBeLessThan(400);
});
