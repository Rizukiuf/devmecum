// Skema data dan frontmatter. Dipakai oleh build Astro (src/content.config.ts)
// dan oleh validator di luar Astro (src/lib/validate.ts), supaya satu aturan
// hanya punya satu implementasi.
import { z } from 'astro/zod';

export const LEVELS = ['dasar', 'menengah', 'lanjut', 'profesional', 'umum'] as const;
export const STATUSES = ['draf', 'terbit'] as const;
export const TECH_TYPES = [
  'language',
  'framework',
  'library',
  'tool',
  'platform',
  'database',
  'concept',
  'standard',
] as const;
export const ADOPTIONS = ['arus-utama', 'mapan', 'berkembang', 'khusus', 'warisan'] as const;
export const TRENDS = ['naik', 'stabil', 'turun'] as const;
export const TEMPLATE_IDS = ['A', 'B', 'C', 'D', 'E'] as const;
export const VERSION_SOURCE_KINDS = ['npm', 'pypi', 'crates', 'maven', 'github'] as const;

/** Teknologi uji: hanya ikut dibangun bila DEVMECUM_FIXTURES=1. */
export const FIXTURE_TECH = 'uji-komponen';

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const slug = z.string().regex(SLUG_RE, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung');

// YAML membaca 3.10 tanpa kutip sebagai angka 3.1, jadi versi wajib berupa teks.
const versionString = z
  .string({ error: 'Versi harus ditulis dalam tanda kutip, misalnya "3.10"' })
  .min(1, 'Versi tidak boleh kosong');

const httpsUrl = z.url({ protocol: /^https$/, error: 'Harus berupa URL https' });

// Tanggal boleh berupa Date (hasil parser YAML Astro) atau teks YYYY-MM-DD.
const dateField = z.preprocess(
  (value) =>
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00Z`)
      : value,
  z.date({ error: 'Tanggal harus berbentuk YYYY-MM-DD' }),
);

const versionSourceSchema = z
  .strictObject({
    kind: z.enum(VERSION_SOURCE_KINDS),
    name: z.string().min(1).optional(),
    repo: z.string().regex(/^[^/\s]+\/[^/\s]+$/, 'repo harus berbentuk pemilik/nama').optional(),
  })
  .superRefine((source, ctx) => {
    if (source.kind === 'github' && !source.repo) {
      ctx.addIssue({ code: 'custom', message: 'versionSource github butuh `repo`', path: ['repo'] });
    }
    if (source.kind !== 'github' && !source.name) {
      ctx.addIssue({ code: 'custom', message: `versionSource ${source.kind} butuh \`name\``, path: ['name'] });
    }
  });

export const techSchema = z.strictObject({
  name: z.string().min(1),
  slug,
  type: z.enum(TECH_TYPES),
  domain: slug,
  template: z.enum(TEMPLATE_IDS),
  creator: z.string().min(1).optional(),
  firstRelease: z.number().int().min(1940).max(2100).optional(),
  license: z.string().min(1).optional(),
  website: httpsUrl,
  docs: httpsUrl,
  latestVersion: versionString,
  versionSource: versionSourceSchema,
  requires: z.array(z.string()),
  alternatives: z.array(z.string()),
  tags: z.array(z.string().min(1)),
  adoption: z.enum(ADOPTIONS).optional(),
  trend: z.enum(TRENDS).optional(),
  metrics: z
    .strictObject({
      github: z.strictObject({ repo: z.string().min(1) }).optional(),
      downloads: z.strictObject({ registry: z.string().min(1), name: z.string().min(1) }).optional(),
    })
    .optional(),
  surveys: z
    .array(
      z.strictObject({
        name: z.string().min(1),
        year: z.number().int(),
        value: z.string().min(1),
        url: httpsUrl,
      }),
    )
    .optional(),
  useCases: z.array(z.string().min(1)),
});

export const domainSchema = z.strictObject({
  id: slug,
  name: z.string().min(1),
  order: z.number().int().min(1),
  freshnessMonths: z.union([z.literal(3), z.literal(6)]),
});

export const templateSchema = z.strictObject({
  id: z.enum(TEMPLATE_IDS),
  name: z.string().min(1),
  chapters: z.array(
    z.strictObject({
      number: z.number().int().min(1),
      title: z.string().min(1),
      level: z.enum(LEVELS),
    }),
  ),
});

/** Kolom frontmatter Devmecum di atas kolom bawaan Starlight (rancangan §5.8). */
export const pageExtension = z.object({
  description: z.string({ error: 'description wajib diisi' }).min(1, 'description wajib diisi'),
  tech: slug.optional(),
  chapter: z.number().int().min(1).optional(),
  level: z.enum(LEVELS).optional(),
  status: z.enum(STATUSES).optional(),
  prerequisites: z.array(z.string()).default([]),
  techVersion: versionString.optional(),
  lastVerified: dateField.optional(),
  factChecked: dateField.optional(),
  sources: z.array(httpsUrl).default([]),
  codeTested: z.union([z.boolean(), z.literal('tidak-berlaku')]).optional(),
  tags: z.array(z.string().min(1)).default([]),
});

type PageFields = z.infer<typeof pageExtension>;
type IssueSink = {
  addIssue: (issue: { code: 'custom'; message: string; path: string[] }) => void;
};

const REQUIRED_FOR_MATERI = [
  'chapter',
  'level',
  'status',
  'techVersion',
  'lastVerified',
  'codeTested',
] as const;

/** Aturan lintas kolom untuk halaman materi (halaman yang punya `tech`). */
export function refinePage(data: PageFields, ctx: IssueSink): void {
  if (data.tech === undefined) return;

  for (const key of REQUIRED_FOR_MATERI) {
    if (data[key] === undefined) {
      ctx.addIssue({ code: 'custom', message: `Halaman materi wajib punya \`${key}\``, path: [key] });
    }
  }

  if (data.status !== 'terbit') return;

  if (data.factChecked === undefined) {
    ctx.addIssue({
      code: 'custom',
      message: 'Halaman berstatus terbit wajib punya `factChecked` (tanggal lolos pemeriksaan fakta)',
      path: ['factChecked'],
    });
  }
  const minSources = data.chapter === 1 ? 2 : 1;
  if (data.sources.length < minSources) {
    ctx.addIssue({
      code: 'custom',
      message:
        minSources === 2
          ? 'Halaman Ringkasan yang terbit butuh minimal dua sumber resmi di `sources`'
          : 'Halaman berstatus terbit butuh minimal satu sumber di `sources`',
      path: ['sources'],
    });
  }
}

/**
 * Halaman disembunyikan dari build produksi bila berstatus draf, atau bila
 * milik teknologi uji dan build tidak dijalankan dengan DEVMECUM_FIXTURES=1.
 */
export function deriveDraft(data: { draft?: boolean; status?: string; tech?: string }): boolean {
  if (data.draft === true || data.status === 'draf') return true;
  return data.tech === FIXTURE_TECH && process.env.DEVMECUM_FIXTURES !== '1';
}

/** Skema frontmatter untuk validator di luar Astro. Kolom bawaan Starlight dibiarkan lewat. */
export const materiSchema = z
  .looseObject({ title: z.string({ error: 'title wajib diisi' }).min(1, 'title wajib diisi') })
  .extend(pageExtension.shape)
  .superRefine(refinePage);

export type Level = (typeof LEVELS)[number];
export type Tech = z.infer<typeof techSchema>;
export type Domain = z.infer<typeof domainSchema>;
export type Template = z.infer<typeof templateSchema>;
export type PageMeta = z.infer<typeof materiSchema>;
