// Validasi konten dan data di luar Astro. Dipakai `scripts/validate-content.mjs`,
// hooks Claude Code, dan CI. Aturan V1–V12 dijelaskan di rencana M0–M1 Task 10.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'yaml';
import { mapLimit } from './concurrency.ts';
import { formatDate } from './freshness.ts';
import { findCycle } from './graph.ts';
import { parseFrontmatter } from './frontmatter.ts';
import { buildIdIndex, pageSlug, parseId, type IdIndex } from './ids.ts';
import {
  domainSchema,
  materiSchema,
  techSchema,
  templateSchema,
  type Domain,
  type PageMeta,
  type Template,
} from './schemas.ts';

export type Problem = { file: string; message: string; severity: 'error' | 'warning' };

type RawFile = { file: string; data?: unknown; readError?: string };
type PageFile = {
  file: string;
  docsPath: string;
  frontmatter?: Record<string, unknown> | null;
  readError?: string;
  /** Tidak dibaca (validasi terfokus); hanya dipakai untuk indeks ID. */
  skipped?: true;
};

export type Project = {
  domainsFile: RawFile;
  templatesFile: RawFile;
  techFiles: RawFile[];
  pages: PageFile[];
};

const DATA_DIR = 'src/data';
const DOCS_DIR = 'src/content/docs';

type Issue = { path: PropertyKey[]; message: string };
const describeIssue = (issue: Issue): string =>
  issue.path.length > 0 ? `${issue.path.map(String).join('.')}: ${issue.message}` : issue.message;

async function listFiles(dir: string, pattern: RegExp): Promise<string[]> {
  try {
    const entries = await readdir(dir, { recursive: true, withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && pattern.test(entry.name))
      .map((entry) => join(entry.parentPath, entry.name).slice(dir.length + 1).replaceAll('\\', '/'))
      .sort();
  } catch {
    return [];
  }
}

async function readYaml(root: string, file: string): Promise<RawFile> {
  try {
    return { file, data: parse(await readFile(join(root, file), 'utf8')) as unknown };
  } catch (error) {
    return { file, readError: `YAML tidak bisa dibaca: ${(error as Error).message.split('\n')[0]}` };
  }
}

/** Batas berkas yang dibaca bersamaan, supaya ribuan halaman tidak membuka ribuan handle. */
const READ_LIMIT = 32;

export type LoadOptions = {
  /** Halaman (relatif terhadap src/content/docs) yang dibaca; sisanya hanya dicatat. Bawaan: semua. */
  pages?: (docsPath: string) => boolean;
};

/**
 * Membaca data dan frontmatter tanpa menilai isinya. Halaman yang tidak
 * terpilih tidak dibaca dan tercatat `{ file, docsPath, skipped: true }`.
 */
export async function loadProject(root: string, options: LoadOptions = {}): Promise<Project> {
  const selected = options.pages ?? (() => true);
  const techNames = await listFiles(join(root, DATA_DIR, 'tech'), /\.ya?ml$/);
  const pageNames = await listFiles(join(root, DOCS_DIR), /\.mdx?$/);

  const pages = await mapLimit(pageNames, READ_LIMIT, async (docsPath): Promise<PageFile> => {
    const file = `${DOCS_DIR}/${docsPath}`;
    if (!selected(docsPath)) return { file, docsPath, skipped: true };
    try {
      const parsed = parseFrontmatter(await readFile(join(root, file), 'utf8'));
      return { file, docsPath, frontmatter: parsed?.data ?? null };
    } catch (error) {
      return { file, docsPath, readError: `Frontmatter tidak bisa dibaca: ${(error as Error).message.split('\n')[0]}` };
    }
  });

  return {
    domainsFile: await readYaml(root, `${DATA_DIR}/domains.yaml`),
    templatesFile: await readYaml(root, `${DATA_DIR}/templates.yaml`),
    techFiles: await mapLimit(techNames, READ_LIMIT, (name) => readYaml(root, `${DATA_DIR}/tech/${name}`)),
    pages,
  };
}

type KnownTech = { slug: string; domain: string; template?: Template };
type KnownPage = { file: string; tech: string; relPath: string; slug: string; meta: PageMeta };

function parseList<T>(
  raw: RawFile,
  schema: { safeParse: (value: unknown) => { success: boolean; data?: T; error?: { issues: Issue[] } } },
  problems: Problem[],
): T[] {
  if (raw.readError) {
    problems.push({ file: raw.file, message: raw.readError, severity: 'error' });
    return [];
  }
  if (!Array.isArray(raw.data)) {
    problems.push({ file: raw.file, message: 'Isi file harus berupa daftar', severity: 'error' });
    return [];
  }
  const items: T[] = [];
  for (const entry of raw.data) {
    const result = schema.safeParse(entry);
    if (result.success) items.push(result.data as T);
    else for (const issue of result.error!.issues) problems.push({ file: raw.file, message: describeIssue(issue), severity: 'error' });
  }
  return items;
}

export function validateProject(project: Project, now: Date): Problem[] {
  const problems: Problem[] = [];
  const error = (file: string, message: string) => problems.push({ file, message, severity: 'error' });
  const warning = (file: string, message: string) => problems.push({ file, message, severity: 'warning' });

  const domains = parseList<Domain>(project.domainsFile, domainSchema, problems);
  const templates = parseList<Template>(project.templatesFile, templateSchema, problems);
  const domainIds = new Set(domains.map((domain) => domain.id));

  // --- Data teknologi (V1, V2) ---
  const techs = new Map<string, KnownTech>();
  const references: { file: string; slug: string; requires: unknown; alternatives: unknown }[] = [];
  const fileByName = new Map<string, string>();

  for (const raw of project.techFiles) {
    if (raw.readError) {
      error(raw.file, raw.readError);
      continue;
    }
    const fields = (typeof raw.data === 'object' && raw.data !== null ? raw.data : {}) as Record<string, unknown>;
    const result = techSchema.safeParse(raw.data);
    if (!result.success) {
      for (const issue of result.error.issues) error(raw.file, describeIssue(issue));
    }

    // Nama teknologi unik, tanpa membedakan huruf besar-kecil.
    if (typeof fields.name === 'string') {
      const key = fields.name.trim().toLowerCase();
      const firstFile = fileByName.get(key);
      if (firstFile === undefined) fileByName.set(key, raw.file);
      else error(raw.file, `Nama teknologi "${fields.name}" sudah dipakai ${firstFile}`);
    }

    // Tetap didaftarkan walau skemanya gagal, supaya satu salah ketik tidak
    // memicu galat beruntun di semua halaman teknologi itu.
    const slug = typeof fields.slug === 'string' ? fields.slug : undefined;
    const domain = typeof fields.domain === 'string' ? fields.domain : undefined;
    if (slug === undefined || domain === undefined) continue;

    const fileName = raw.file.split('/').pop()!.replace(/\.ya?ml$/, '');
    if (slug !== fileName) {
      error(raw.file, `slug "${slug}" harus sama dengan nama file ("${fileName}")`);
    }
    if (!domainIds.has(domain)) {
      error(raw.file, `domain "${domain}" tidak ada di src/data/domains.yaml`);
    }
    techs.set(slug, { slug, domain, template: templates.find((template) => template.id === fields.template) });
    references.push({ file: raw.file, slug, requires: fields.requires, alternatives: fields.alternatives });
  }

  // --- Halaman (V5–V9, V11, V12) ---
  const known: KnownPage[] = [];
  // Halaman yang tidak dibaca: tech diturunkan dari path (`<domain>/<tech>/…`)
  // hanya untuk indeks ID, tanpa pemeriksaan apa pun.
  const unread: { tech: string; relPath: string }[] = [];

  for (const page of project.pages) {
    if (page.skipped) {
      const [domain, techSlug, ...rest] = page.docsPath.split('/');
      if (rest.length > 0 && techs.get(techSlug!)?.domain === domain) {
        unread.push({ tech: techSlug!, relPath: rest.join('/') });
      }
      continue;
    }
    const domainIndex = /^([^/]+)[/]index[.]mdx?$/.exec(page.docsPath);
    if (domainIndex !== null && domainIds.has(domainIndex[1]!)) {
      error(page.file, 'Halaman domain dibangkitkan otomatis dari src/data/domains.yaml');
      continue;
    }
    if (page.readError) {
      error(page.file, page.readError);
      continue;
    }
    if (page.frontmatter === null || page.frontmatter === undefined) {
      error(page.file, 'File tidak punya frontmatter');
      continue;
    }

    const result = materiSchema.safeParse(page.frontmatter);
    if (!result.success) {
      for (const issue of result.error.issues) error(page.file, describeIssue(issue));
      continue;
    }
    const meta = result.data;
    const segments = page.docsPath.split('/');
    const insideDomain = domainIds.has(segments[0]!) && segments.length >= 3;

    if (meta.tech === undefined) {
      if (insideDomain) error(page.file, 'Halaman di dalam folder domain wajib punya `tech`');
      continue;
    }

    const tech = techs.get(meta.tech);
    if (tech === undefined) {
      error(page.file, `tech "${meta.tech}" tidak terdaftar di src/data/tech/`);
      continue;
    }
    const folder = `${tech.domain}/${tech.slug}/`;
    if (!page.docsPath.startsWith(folder)) {
      error(page.file, `Halaman teknologi "${tech.slug}" harus berada di ${DOCS_DIR}/${folder}`);
      continue;
    }

    for (const key of ['lastVerified', 'factChecked'] as const) {
      const value = meta[key];
      if (value !== undefined && value.getTime() > now.getTime()) {
        error(page.file, `${key} (${formatDate(value)}) ada di masa depan; hari ini ${formatDate(now)}`);
      }
    }

    const relPath = page.docsPath.slice(folder.length);
    const slug = pageSlug(relPath);
    known.push({ file: page.file, tech: tech.slug, relPath, slug, meta });

    const isIndex = /^index\.mdx?$/.test(relPath);
    if (isIndex) {
      if (meta.chapter !== 1 || meta.level !== 'umum') {
        error(
          page.file,
          `index adalah halaman Ringkasan: wajib chapter: 1 dan level: umum (ditemukan chapter: ${meta.chapter}, level: ${meta.level})`,
        );
      }
      continue;
    }
    if (meta.chapter === 1) {
      error(page.file, 'chapter: 1 hanya untuk halaman Ringkasan (index.mdx)');
      continue;
    }

    const parts = relPath.split('/');
    const folderNumber = /^(\d{2})-/.exec(parts[0]!)?.[1];
    if (parts.length !== 2 || folderNumber === undefined) {
      error(page.file, 'Halaman bab harus berada tepat di dalam folder bab bernomor, misalnya 04-sintaks-dasar/');
      continue;
    }
    const chapters = tech.template?.chapters ?? [];
    const chapter = chapters.find((item) => item.number === meta.chapter);
    if (chapter === undefined) {
      error(page.file, `chapter: ${meta.chapter} di luar templat ${tech.template?.id ?? '?'} (bab 2–${chapters.length})`);
      continue;
    }
    if (Number(folderNumber) !== meta.chapter) {
      error(page.file, `Folder bab bernomor ${folderNumber}, tetapi frontmatter menulis chapter: ${meta.chapter}`);
      continue;
    }
    if (chapter.level !== meta.level) {
      error(
        page.file,
        `Bab ${chapter.number} (${chapter.title}) berlevel ${chapter.level} di templat, tetapi frontmatter menulis level: ${meta.level}`,
      );
    }
  }

  // V9: slug halaman unik dalam satu teknologi.
  const firstBySlug = new Map<string, KnownPage>();
  for (const page of known) {
    if (page.slug === '') continue;
    const id = `${page.tech}/${page.slug}`;
    const first = firstBySlug.get(id);
    if (first === undefined) firstBySlug.set(id, page);
    else error(page.file, `Slug halaman "${page.slug}" sudah dipakai ${first.file}; ID ${id} harus unik`);
  }

  // --- Rujukan ID (V3, V4, V10) ---
  const { index } = buildIdIndex([...techs.values()], [...known, ...unread]);
  const pageById = new Map<string, KnownPage>();
  for (const page of known) {
    const id = page.slug === '' ? page.tech : `${page.tech}/${page.slug}`;
    if (!pageById.has(id)) pageById.set(id, page);
  }
  // Halaman yang ada tetapi tidak dibaca: keberadaannya diketahui, statusnya tidak.
  const unreadIds = new Set(
    unread.map((page) => {
      const slug = pageSlug(page.relPath);
      return slug === '' ? page.tech : `${page.tech}/${slug}`;
    }),
  );

  const checkId = (id: unknown, idIndex: IdIndex): string | undefined => {
    if (typeof id !== 'string' || parseId(id) === null) {
      return `"${String(id)}" bukan ID yang sah (pakai slug-teknologi atau slug-teknologi/slug-halaman)`;
    }
    return idIndex.has(id) ? undefined : `ID "${id}" tidak terdaftar`;
  };

  const requiresGraph = new Map<string, string[]>();
  for (const ref of references) {
    const edges: string[] = [];
    for (const id of Array.isArray(ref.requires) ? ref.requires : []) {
      if (id === ref.slug) {
        error(ref.file, 'requires: teknologi tidak boleh mensyaratkan dirinya sendiri');
        continue;
      }
      const problem = checkId(id, index);
      if (problem) error(ref.file, `requires: ${problem}`);
      else if (typeof id === 'string' && techs.has(id)) edges.push(id);
    }
    requiresGraph.set(ref.slug, edges);
    for (const id of Array.isArray(ref.alternatives) ? ref.alternatives : []) {
      if (id === ref.slug) {
        error(ref.file, 'alternatives: teknologi tidak boleh menjadi alternatif dirinya sendiri');
        continue;
      }
      const problem = checkId(id, index);
      if (problem) warning(ref.file, `alternatives: ${problem}`);
    }
  }

  // Lingkaran prasyarat: dilaporkan sekali, pada berkas pertama menurut urutan nama.
  const cycle = findCycle(requiresGraph);
  if (cycle !== undefined) {
    const fileBySlug = new Map(references.map((ref) => [ref.slug, ref.file]));
    const first = cycle
      .slice(0, -1)
      .map((slug) => fileBySlug.get(slug)!)
      .sort()[0]!;
    error(first, `requires membentuk lingkaran: ${cycle.join(' → ')}`);
  }

  // Adopsi dan tren belum dinilai (K11): peringatan, bukan galat.
  for (const ref of references) {
    const raw = project.techFiles.find((file) => file.file === ref.file)?.data as Record<string, unknown> | undefined;
    for (const key of ['adoption', 'trend'] as const) {
      if (raw?.[key] === undefined) warning(ref.file, `${key} belum dinilai menurut docs/rubrik-adopsi.md`);
    }
  }

  for (const page of known) {
    for (const id of page.meta.prerequisites) {
      const problem = checkId(id, index);
      if (problem) {
        error(page.file, `prerequisites: ${problem}`);
        continue;
      }
      const target = pageById.get(id);
      if (target === undefined) {
        if (!unreadIds.has(id)) error(page.file, `prerequisites: "${id}" belum punya halaman`);
      } else if (page.meta.status === 'terbit' && target.meta.status !== 'terbit') {
        error(page.file, `prerequisites: halaman terbit tidak boleh mensyaratkan "${id}" yang masih draf`);
      }
    }
  }

  return problems.sort((a, b) => a.file.localeCompare(b.file));
}
