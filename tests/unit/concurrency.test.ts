import { expect, test } from 'vitest';
import { mapLimit } from '../../src/lib/concurrency.ts';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

test('mapLimit tidak pernah menjalankan lebih dari limit sekaligus', async () => {
  let active = 0;
  let peak = 0;
  const items = Array.from({ length: 10 }, (_, i) => i);
  const results = await mapLimit(items, 3, async (item) => {
    active++;
    peak = Math.max(peak, active);
    await wait(5);
    active--;
    return item * 2;
  });
  expect(peak).toBe(3);
  expect(results).toEqual(items.map((item) => item * 2));
});

test('mapLimit menjaga urutan hasil', async () => {
  // Butir awal selesai paling akhir.
  const results = await mapLimit(['a', 'b', 'c', 'd', 'e'], 2, async (item, index) => {
    await wait((5 - index) * 4);
    return `${index}:${item}`;
  });
  expect(results).toEqual(['0:a', '1:b', '2:c', '3:d', '4:e']);
});

test('mapLimit menolak dengan galat pertama dan berhenti mengambil butir baru', async () => {
  const started: number[] = [];
  const run = mapLimit([0, 1, 2, 3, 4, 5], 2, async (item) => {
    started.push(item);
    await wait(2);
    if (item === 1) throw new Error('gagal di 1');
    return item;
  });
  await expect(run).rejects.toThrow('gagal di 1');
  await wait(20);
  expect(started.length).toBeLessThan(6);
});

test('mapLimit dengan daftar kosong dan limit lebih besar dari jumlah butir', async () => {
  expect(await mapLimit([], 4, async (item: number) => item)).toEqual([]);
  expect(await mapLimit([1, 2], 32, async (item) => item + 1)).toEqual([2, 3]);
});

test('mapLimit menolak limit yang bukan bilangan bulat positif', async () => {
  await expect(mapLimit([1], 0, async (item) => item)).rejects.toThrow(RangeError);
});
