// Tingkat kematangan topik (rancangan §5.3). Dihitung dari halaman yang sudah
// terbit, tidak pernah diisi tangan, supaya lencana tidak bisa mengklaim lebih
// dari yang ada.
import type { Level, Template } from './schemas.ts';

export type Stage = 0 | 1 | 2 | 3 | 4 | 5;

export const STAGE_LABELS = ['Terdaftar', 'Ringkasan', 'Dasar', 'Menengah', 'Lanjut', 'Profesional'] as const;

/** Satu bab di `outline.yaml`: daftar slug halamannya, atau tanda tidak berlaku. */
export type OutlineChapter =
  | { chapter: number; pages: string[] }
  | { chapter: number; tidakBerlaku: true };

export type StageInput = {
  template: Template;
  /** Halaman berstatus terbit. Ringkasan adalah halaman ber-`chapter: 1`. */
  published: { chapter: number; slug: string }[];
  /** Belum ada sampai pendalaman dimulai; tanpa outline tingkat tertinggi adalah 1. */
  outline?: OutlineChapter[];
};

const STAGE_OF_LEVEL: Record<Level, Stage> = {
  dasar: 2,
  menengah: 3,
  lanjut: 4,
  profesional: 5,
  umum: 5,
};

export function computeStage({ template, published, outline }: StageInput): Stage {
  if (!published.some((page) => page.chapter === 1)) return 0;
  if (outline === undefined) return 1;

  const publishedSlugs = new Set(published.map((page) => page.slug));
  const isComplete = (chapter: number): boolean => {
    const entry = outline.find((item) => item.chapter === chapter);
    if (entry === undefined) return false;
    if ('tidakBerlaku' in entry) return true;
    return entry.pages.length > 0 && entry.pages.every((slug) => publishedSlugs.has(slug));
  };

  let stage: Stage = 1;
  for (const target of [2, 3, 4, 5] as const) {
    const chapters = template.chapters.filter(
      (chapter) => chapter.number !== 1 && STAGE_OF_LEVEL[chapter.level] === target,
    );
    if (!chapters.every((chapter) => isComplete(chapter.number))) break;
    stage = target;
  }
  return stage;
}
