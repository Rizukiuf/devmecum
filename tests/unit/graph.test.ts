import { expect, test } from 'vitest';
import { findCycle } from '../../src/lib/graph.ts';

test('tanpa lingkaran', () => expect(findCycle(new Map([['a', ['b']], ['b', []]]))).toBeUndefined());
test('lingkaran dua simpul', () => expect(findCycle(new Map([['a', ['b']], ['b', ['a']]]))).toEqual(['a', 'b', 'a']));
test('rujukan ke simpul tak dikenal diabaikan', () => expect(findCycle(new Map([['a', ['zzz']]]))).toBeUndefined());
test('simpul yang merujuk dirinya sendiri', () => expect(findCycle(new Map([['a', ['a']]]))).toEqual(['a', 'a']));
test('lingkaran tiga simpul yang diawali jalur masuk', () =>
  expect(findCycle(new Map([['a', ['b']], ['b', ['c']], ['c', ['d']], ['d', ['b']]]))).toEqual(['b', 'c', 'd', 'b']));
test('hasil stabil terhadap urutan penyisipan', () => {
  const forward = new Map([['a', ['b']], ['b', ['a']], ['c', ['d']], ['d', ['c']]]);
  const backward = new Map([['d', ['c']], ['c', ['d']], ['b', ['a']], ['a', ['b']]]);
  expect(findCycle(backward)).toEqual(findCycle(forward));
  expect(findCycle(forward)).toEqual(['a', 'b', 'a']);
});
test('graf berlian tanpa lingkaran', () =>
  expect(findCycle(new Map([['a', ['b', 'c']], ['b', ['d']], ['c', ['d']], ['d', []]]))).toBeUndefined());
