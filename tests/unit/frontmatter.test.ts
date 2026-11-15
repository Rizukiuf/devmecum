import { expect, test } from 'vitest';
import { parseFrontmatter } from '../../src/lib/frontmatter.ts';

test('frontmatter biasa terbaca', () => {
  const r = parseFrontmatter('---\ntitle: A\nchapter: 2\n---\nIsi halaman\n');
  expect(r?.data).toEqual({ title: 'A', chapter: 2 });
  expect(r?.body).toBe('Isi halaman\n');
});

test('frontmatter terbaca dari file CRLF berawalan BOM', () => {
  const r = parseFrontmatter('﻿---\r\ntitle: A\r\ntech: python\r\n---\r\nIsi\r\n');
  expect(r?.data).toEqual({ title: 'A', tech: 'python' });
});

test('file tanpa frontmatter → null', () => {
  expect(parseFrontmatter('# Judul')).toBeNull();
});

test('frontmatter kosong → data kosong', () => {
  expect(parseFrontmatter('---\n---\nIsi')?.data).toEqual({});
});

test('frontmatter yang bukan pemetaan ditolak', () => {
  expect(() => parseFrontmatter('---\n- a\n- b\n---\n')).toThrow(/pemetaan/);
});

test('YAML rusak melempar galat', () => {
  expect(() => parseFrontmatter('---\ntitle: "A\n---\n')).toThrow();
});

test('garis --- di badan halaman tidak dianggap penutup frontmatter', () => {
  const r = parseFrontmatter('---\ntitle: A\n---\nSatu\n\n---\n\nDua\n');
  expect(r?.data).toEqual({ title: 'A' });
  expect(r?.body).toContain('Dua');
});
