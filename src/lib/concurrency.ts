// Pembatas konkurensi kecil untuk I/O berskala (membaca ribuan berkas,
// memanggil API eksternal) tanpa membuka terlalu banyak handle sekaligus.

/**
 * Menjalankan `fn` untuk setiap butir dengan paling banyak `limit` tugas aktif
 * sekaligus. Urutan hasil sama dengan urutan masukan. Galat pertama menolak
 * promise dan menghentikan pengambilan butir baru; tugas yang sedang berjalan
 * dibiarkan selesai.
 */
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError(`limit harus bilangan bulat positif (ditemukan ${limit})`);
  }
  const results = new Array<R>(items.length);
  let next = 0;
  let failed = false;

  const worker = async (): Promise<void> => {
    while (!failed && next < items.length) {
      const index = next++;
      try {
        results[index] = await fn(items[index]!, index);
      } catch (error) {
        failed = true;
        throw error;
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
