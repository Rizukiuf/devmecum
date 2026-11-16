// Algoritma graf kecil untuk validasi data. Murni dan deterministik.

/**
 * Mencari satu lingkaran di graf berarah dan mengembalikannya sebagai jalur
 * tertutup, misalnya `['a', 'b', 'a']`. Simpul diperiksa menurut urutan abjad
 * supaya hasilnya stabil. Rujukan ke simpul yang tidak ada di peta diabaikan.
 */
export function findCycle(graph: Map<string, string[]>): string[] | undefined {
  const done = new Set<string>();
  const path: string[] = [];
  const onPath = new Set<string>();

  const visit = (node: string): string[] | undefined => {
    path.push(node);
    onPath.add(node);
    for (const next of [...(graph.get(node) ?? [])].sort()) {
      if (!graph.has(next)) continue;
      if (onPath.has(next)) return [...path.slice(path.indexOf(next)), next];
      if (done.has(next)) continue;
      const cycle = visit(next);
      if (cycle !== undefined) return cycle;
    }
    path.pop();
    onPath.delete(node);
    done.add(node);
    return undefined;
  };

  for (const node of [...graph.keys()].sort()) {
    if (done.has(node)) continue;
    const cycle = visit(node);
    if (cycle !== undefined) return cycle;
  }
  return undefined;
}
