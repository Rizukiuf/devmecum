// Pembantu untuk hooks Claude Code (scripts/hooks/*.mjs).
// Hook menerima JSON lewat stdin. Keluar dengan kode 2 berarti menolak, dan isi
// stderr dikembalikan ke Claude; kode lain tidak menolak apa pun.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseFrontmatter } from './frontmatter.ts';
import { loadProject, validateProject, type Problem, type Project } from './validate.ts';

const DRIVE_RE = /^[a-zA-Z]:\//;

/**
 * Path file relatif terhadap root repo, bergaya POSIX; `null` bila di luar repo.
 * Menerima `\` maupun `/`. Path Windows (berhuruf drive) dibandingkan tanpa
 * peduli kapital, karena Claude Code dan Node bisa berbeda menulis huruf drive.
 */
export function toRepoRelative(filePath: string, repoRoot: string): string | null {
  const file = filePath.replaceAll('\\', '/');
  const root = repoRoot.replaceAll('\\', '/').replace(/\/+$/, '') + '/';
  const windows = DRIVE_RE.test(file) && DRIVE_RE.test(root);
  const inside = windows ? file.toLowerCase().startsWith(root.toLowerCase()) : file.startsWith(root);
  return inside ? file.slice(root.length) : null;
}

export function isContentPath(rel: string): boolean {
  return rel.startsWith('src/content/') || rel.startsWith('src/data/');
}

/** File yang hanya boleh diubah oleh alat, tidak oleh suntingan tangan. */
export function isProtectedPath(rel: string): boolean {
  return rel === 'pnpm-lock.yaml' || rel.startsWith('src/data/metrics/');
}

/** Membaca seluruh stdin sebagai JSON; `null` bila kosong atau bukan objek JSON. */
export async function readHookInput(): Promise<Record<string, unknown> | null> {
  let text = '';
  for await (const chunk of process.stdin) text += chunk;
  try {
    const value: unknown = JSON.parse(text);
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** `tool_input.file_path` dari masukan hook Edit/Write, relatif terhadap root repo. */
export function editedFile(input: Record<string, unknown> | null, repoRoot: string): string | null {
  const toolInput = input?.tool_input;
  if (typeof toolInput !== 'object' || toolInput === null) return null;
  const filePath = (toolInput as Record<string, unknown>).file_path;
  return typeof filePath === 'string' ? toRepoRelative(filePath, repoRoot) : null;
}

const DOCS_PREFIX = 'src/content/docs/';
const PAGE_RE = /\.mdx?$/;

/**
 * Seperti `toRepoRelative`, tetapi juga menerima path relatif terhadap root.
 * Tidak memakai `node:path`, supaya hasilnya sama di Windows dan Linux: `\`
 * dinormalkan dulu menjadi `/`, lalu path dianggap absolut bila berawalan `/`
 * atau huruf drive.
 */
export function resolveRepoPath(filePath: string, repoRoot: string): string | null {
  const file = filePath.replaceAll('\\', '/');
  if (file.startsWith('/') || DRIVE_RE.test(file)) return toRepoRelative(file, repoRoot);
  const root = repoRoot.replaceAll('\\', '/').replace(/\/+$/, '');
  return toRepoRelative(`${root}/${file.replace(/^(\.\/)+/, '')}`, repoRoot);
}

/** Slug teknologi dari path halaman `<domain>/<tech>/…`; `undefined` bila bukan halaman teknologi. */
const techFolder = (docsPath: string): string | undefined => {
  const segments = docsPath.split('/');
  return segments.length >= 3 ? segments[1] : undefined;
};

/**
 * Memuat proyek secukupnya untuk memvalidasi satu berkas; `null` bila berkas
 * bukan konten. Halaman: berkas itu sendiri ditambah semua halaman teknologinya
 * (slug kembar) dan teknologi yang dirujuk `prerequisites` (status draf).
 * Berkas lain (`src/data/**`): tanpa halaman, cukup indeks ID dari path.
 */
export async function loadProjectFor(root: string, filePath: string): Promise<Project | null> {
  const rel = resolveRepoPath(filePath, root);
  if (rel === null || !isContentPath(rel)) return null;
  if (!rel.startsWith(DOCS_PREFIX) || !PAGE_RE.test(rel)) return loadProject(root, { pages: () => false });

  const docsPath = rel.slice(DOCS_PREFIX.length);
  const techs = new Set<string>();
  const own = techFolder(docsPath);
  if (own !== undefined) techs.add(own);
  try {
    const data = parseFrontmatter(await readFile(join(root, rel), 'utf8'))?.data;
    if (typeof data?.tech === 'string') techs.add(data.tech);
    for (const id of Array.isArray(data?.prerequisites) ? data.prerequisites : []) {
      if (typeof id === 'string') techs.add(id.split('/')[0]!);
    }
  } catch {
    // Frontmatter rusak atau berkas hilang: dilaporkan oleh validasi, cukup halaman itu.
  }
  return loadProject(root, {
    pages: (path) => path === docsPath || techs.has(techFolder(path) ?? ''),
  });
}

/**
 * Masalah validasi (galat dan peringatan) untuk satu berkas konten, dengan I/O
 * terbatas pada yang dibutuhkan berkas itu. Kosong bila berkas bukan konten.
 */
export async function fileProblems(root: string, filePath: string, now: Date): Promise<Problem[]> {
  const project = await loadProjectFor(root, filePath);
  if (project === null) return [];
  const rel = resolveRepoPath(filePath, root);
  return validateProject(project, now).filter((problem) => problem.file === rel);
}

/** Galat validasi untuk satu berkas konten, `<file>: <pesan>`. Kosong bila bukan konten atau tidak bermasalah. */
export async function validateFile(root: string, filePath: string, now: Date): Promise<string[]> {
  return (await fileProblems(root, filePath, now))
    .filter((problem) => problem.severity === 'error')
    .map((problem) => `${problem.file}: ${problem.message}`);
}

/** Semua galat validasi proyek, satu baris per galat: `<file>: <pesan>`. */
export async function allContentErrors(root: string, now: Date): Promise<string[]> {
  return validateProject(await loadProject(root), now)
    .filter((problem) => problem.severity === 'error')
    .map((problem) => `${problem.file}: ${problem.message}`);
}
