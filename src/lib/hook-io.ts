// Pembantu untuk hooks Claude Code (scripts/hooks/*.mjs).
// Hook menerima JSON lewat stdin. Keluar dengan kode 2 berarti menolak, dan isi
// stderr dikembalikan ke Claude; kode lain tidak menolak apa pun.
import { loadProject, validateProject } from './validate.ts';

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

/** Galat validasi untuk satu file konten. Kosong bila file bukan konten atau tidak bermasalah. */
export async function contentErrorsFor(root: string, filePath: string, now: Date): Promise<string[]> {
  const rel = toRepoRelative(filePath, root);
  if (rel === null || !isContentPath(rel)) return [];
  return (await allContentErrors(root, now)).filter((line) => line.startsWith(`${rel}: `));
}

/** Semua galat validasi proyek, satu baris per galat: `<file>: <pesan>`. */
export async function allContentErrors(root: string, now: Date): Promise<string[]> {
  return validateProject(await loadProject(root), now)
    .filter((problem) => problem.severity === 'error')
    .map((problem) => `${problem.file}: ${problem.message}`);
}
