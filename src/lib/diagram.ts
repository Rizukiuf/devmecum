// Merender diagram Mermaid menjadi SVG saat build, memakai Chromium lewat
// Playwright (mermaid-isomorphic). Browser tidak menerima pustaka Mermaid sama
// sekali. Berkas ini hanya dipakai kode Astro saat build.
import { createHash } from 'node:crypto';
import { createMermaidRenderer, type MermaidRenderer } from 'mermaid-isomorphic';

let renderer: MermaidRenderer | undefined;
const cache = new Map<string, Promise<string>>();

/**
 * Warna dibuat netral karena CSS di base.css menimpanya dengan variabel tema
 * Starlight; di sini hanya mencegah warna bawaan Mermaid ikut tertanam.
 */
const MERMAID_CONFIG = {
  theme: 'base',
  themeVariables: {
    primaryColor: '#ffffff',
    primaryTextColor: '#000000',
    primaryBorderColor: '#666666',
    lineColor: '#666666',
    fontFamily: 'inherit',
  },
} as const;

/**
 * Setiap pemanggilan membuka halaman browser baru, sehingga penomoran id
 * Mermaid mulai dari nol lagi. Tanpa prefiks unik, dua diagram di satu halaman
 * sama-sama ber-id "dm-0" dan blok gayanya saling menimpa.
 */
function idPrefix(code: string): string {
  return 'dm-' + createHash('sha1').update(code).digest('hex').slice(0, 8);
}

/** Mengembalikan SVG untuk `code`. Melempar galat yang menyebut `title` bila sintaksnya salah. */
export function renderDiagram(title: string, code: string): Promise<string> {
  const existing = cache.get(code);
  if (existing !== undefined) return existing;

  renderer ??= createMermaidRenderer();
  const pending = renderer([code], { mermaidConfig: MERMAID_CONFIG, prefix: idPrefix(code) }).then(([result]) => {
    if (result === undefined || result.status === 'rejected') {
      const reason = result?.status === 'rejected' ? String(result.reason) : 'tidak ada hasil';
      throw new Error(`Diagram "${title}" gagal dirender: ${reason}`);
    }
    return result.value.svg;
  });
  cache.set(code, pending);
  return pending;
}
