// Skema data dan frontmatter. Dipakai oleh build Astro (src/content.config.ts)
// dan oleh validator di luar Astro (src/lib/validate.ts), supaya satu aturan
// hanya punya satu implementasi.
import { z } from 'astro/zod';

// Pesan galat bawaan Zod dalam bahasa Indonesia, untuk build maupun validator.
z.config(z.locales.id());

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
export const DOWNLOAD_REGISTRIES = ['npm', 'pypi', 'crates'] as const;

/** Teknologi uji (slug berawalan `uji-`): hanya ikut dibangun bila DEVMECUM_FIXTURES=1. */
export const isFixtureTech = (slug: string): boolean => slug.startsWith('uji-');

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const OWNER_REPO_RE = /^[^/\s]+\/[^/\s]+$/;

const slug = z.string().regex(SLUG_RE, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung');

// YAML membaca 3.10 tanpa kutip sebagai angka 3.1, jadi versi wajib berupa teks.
const versionString = z
  .string({ error: 'Versi harus ditulis dalam tanda kutip, misalnya "3.10"' })
  .min(1, 'Versi tidak boleh kosong');

const httpsUrl = z.url({ protocol: /^https$/, error: 'Harus berupa URL https' });

// Tanggal boleh berupa Date (hasil parser YAML Astro) atau teks YYYY-MM-DD.
// Teks yang tidak ada di kalender (2026-02-31) ditolak: `new Date` akan
// menggesernya diam-diam ke 3 Maret, dan stempel verifikasi jadi salah.
const dateField = z.preprocess(
  (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? value : date;
  },
  z.date({ error: 'Tanggal harus berbentuk YYYY-MM-DD dan ada di kalender' }),
);

/** Jumlah grup tangkapan (termasuk grup bernama); null bila pola tidak bisa dikompilasi. */
function captureGroups(pattern: string): number | null {
  try {
    // Menambah `|` membuat pola selalu cocok dengan teks kosong, sehingga
    // panjang hasil exec = jumlah grup + 1, tanpa menebak sintaks pola.
    return (new RegExp(`${pattern}|`).exec('')?.length ?? 1) - 1;
  } catch {
    return null;
  }
}

const versionSourceSchema = z
  .strictObject({
    kind: z.enum(VERSION_SOURCE_KINDS),
    name: z.string().min(1).optional(),
    repo: z.string().regex(OWNER_REPO_RE, 'repo harus berbentuk pemilik/nama').optional(),
    tagPattern: z.string().min(1).optional(),
  })
  .superRefine((source, ctx) => {
    if (source.kind === 'github' && !source.repo) {
      ctx.addIssue({ code: 'custom', message: 'versionSource github butuh `repo`', path: ['repo'] });
    }
    if (source.kind !== 'github' && !source.name) {
      ctx.addIssue({ code: 'custom', message: `versionSource ${source.kind} butuh \`name\``, path: ['name'] });
    }
    if (source.tagPattern === undefined) return;
    if (source.kind !== 'github') {
      ctx.addIssue({ code: 'custom', message: '`tagPattern` hanya untuk versionSource github', path: ['tagPattern'] });
      return;
    }
    const groups = captureGroups(source.tagPattern);
    if (groups === null) {
      ctx.addIssue({ code: 'custom', message: '`tagPattern` bukan regex yang sah', path: ['tagPattern'] });
    } else if (groups < 1) {
      ctx.addIssue({
        code: 'custom',
        message: '`tagPattern` butuh minimal satu grup tangkapan, misalnya ^v(\\d+)\\.(\\d+)$',
        path: ['tagPattern'],
      });
    }
  });

export const techSchema = z
  .strictObject({
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
    latestVersion: versionString.optional(),
    versionSource: versionSourceSchema.optional(),
    requires: z.array(z.string()),
    alternatives: z.array(z.string()),
    tags: z.array(z.string().min(1)),
    adoption: z.enum(ADOPTIONS).optional(),
    trend: z.enum(TRENDS).optional(),
    metrics: z
      .strictObject({
        github: z
          .strictObject({ repo: z.string().regex(OWNER_REPO_RE, 'repo harus berbentuk pemilik/nama') })
          .optional(),
        downloads: z
          .strictObject({ registry: z.enum(DOWNLOAD_REGISTRIES), name: z.string().min(1) })
          .optional(),
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
  })
  .superRefine((tech, ctx) => {
    if (tech.versionSource !== undefined && tech.latestVersion === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'latestVersion wajib bila versionSource ada',
        path: ['latestVersion'],
      });
    }
  });

export const domainSchema = z.strictObject({
  id: slug,
  name: z.string().min(1),
  description: z.string().min(1).max(200),
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
  return data.tech !== undefined && isFixtureTech(data.tech) && process.env.DEVMECUM_FIXTURES !== '1';
}

/** Skema frontmatter untuk validator di luar Astro. Kolom bawaan Starlight dibiarkan lewat. */
export const materiSchema = z
  .looseObject({ title: z.string({ error: 'title wajib diisi' }).min(1, 'title wajib diisi') })
  .extend(pageExtension.shape)
  .superRefine(refinePage);

export type Level = (typeof LEVELS)[number];
export type TechType = (typeof TECH_TYPES)[number];
export type TemplateId = (typeof TEMPLATE_IDS)[number];
export type Adoption = (typeof ADOPTIONS)[number];
export type Trend = (typeof TRENDS)[number];
export type DownloadRegistry = (typeof DOWNLOAD_REGISTRIES)[number];
export type VersionSource = z.infer<typeof versionSourceSchema>;
export type Tech = z.infer<typeof techSchema>;
export type Domain = z.infer<typeof domainSchema>;
export type Template = z.infer<typeof templateSchema>;
export type PageMeta = z.infer<typeof materiSchema>;
