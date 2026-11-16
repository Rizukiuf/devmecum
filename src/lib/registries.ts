// Membaca versi terbaru, bintang GitHub, dan jumlah unduhan dari registri.
// Semua I/O lewat `Deps` yang disuntikkan, supaya tes tidak menyentuh jaringan.
// Masalah jaringan dan HTTP tidak pernah dilempar: hasilnya `{ ok: false, error }`,
// dan pemanggil (yang membatasi konkurensi lewat `mapLimit`) memutuskan sisanya.
import { execFile } from 'node:child_process';
import type { DownloadRegistry, VersionSource } from './schemas.ts';
import { pickLatest } from './versions.ts';

export const USER_AGENT = 'devmecum-pemantau (+https://github.com/Rizukiuf/devmecum)';
export const TIMEOUT_MS = 15_000;

export type Deps = {
  fetch: typeof fetch;
  gitTags: (repoUrl: string) => Promise<string[]>;
  githubToken?: string;
};

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

type Downloads = { value: number; period: 'minggu' | '90-hari' };

const GITHUB_API = 'https://api.github.com';
const NO_RELEASE = 'tidak punya GitHub Release; tambahkan tagPattern';

const ok = <T>(value: T): Result<T> => ({ ok: true, value });
const fail = (error: string): { ok: false; error: string } => ({ ok: false, error });

function messageOf(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  // `fetch failed` dari Node menyimpan sebab sebenarnya (DNS, TLS) di `cause`.
  const cause = error.cause instanceof Error ? ` (${error.cause.message})` : '';
  return `${error.message}${cause}`;
}

/** Nama paket npm untuk path registri: `@scope/nama` → `@scope%2Fnama`. */
function npmRegistryName(name: string): string {
  return name.startsWith('@') ? `@${encodeURIComponent(name.slice(1))}` : encodeURIComponent(name);
}

/** Nama paket npm untuk API unduhan, yang meminta garis miring cakupan apa adanya. */
function npmDownloadsName(name: string): string {
  return npmRegistryName(name).replace('%2F', '/');
}

function repoPath(repo: string): string {
  return repo.split('/').map(encodeURIComponent).join('/');
}

async function request(
  url: string,
  deps: Deps,
  read: 'json' | 'text',
): Promise<Result<unknown>> {
  const headers: Record<string, string> = { 'User-Agent': USER_AGENT };
  if (read === 'json') headers.Accept = 'application/json';
  // Token hanya untuk API GitHub, tidak pernah ke host lain.
  if (new URL(url).host === 'api.github.com') {
    headers.Accept = 'application/vnd.github+json';
    if (deps.githubToken) headers.Authorization = `Bearer ${deps.githubToken}`;
  }
  try {
    const response = await deps.fetch(url, { headers });
    if (!response.ok) {
      // Badan jawaban gagal tidak dibaca; batalkan supaya koneksi dilepas.
      await response.body?.cancel().catch(() => {});
      return fail(`HTTP ${response.status}`);
    }
    const text = await response.text();
    if (read === 'text') return ok(text);
    try {
      return ok(JSON.parse(text) as unknown);
    } catch {
      return fail('jawaban bukan JSON yang sah');
    }
  } catch (error) {
    return fail(messageOf(error));
  }
}

/** Nilai di `path` (mis. `info.version`) dari JSON, bila jenisnya sesuai. */
function field(data: unknown, path: string): unknown {
  let current = data;
  for (const key of path.split('.')) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

async function jsonString(url: string, path: string, deps: Deps): Promise<Result<string>> {
  const result = await request(url, deps, 'json');
  if (!result.ok) return result;
  const value = field(result.value, path);
  return typeof value === 'string' && value !== '' ? ok(value) : fail(`jawaban tidak memuat \`${path}\``);
}

async function jsonNumber(url: string, path: string, deps: Deps): Promise<Result<number>> {
  const result = await request(url, deps, 'json');
  if (!result.ok) return result;
  const value = field(result.value, path);
  return typeof value === 'number' && Number.isFinite(value) ? ok(value) : fail(`jawaban tidak memuat \`${path}\``);
}

/** Satu versi dari registri harus stabil; hasilnya teks bernomor. */
function stable(result: Result<string>): Result<string> {
  if (!result.ok) return result;
  const version = pickLatest([result.value]);
  return version === undefined ? fail(`versi "${result.value}" adalah prarilis atau tidak bernomor`) : ok(version);
}

async function mavenVersion(name: string, deps: Deps): Promise<Result<string>> {
  const parts = name.split(':');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return fail(`nama Maven harus berbentuk grup:artefak (ditemukan "${name}")`);
  }
  const [group, artifact] = parts;
  const url = `https://repo1.maven.org/maven2/${group.split('.').map(encodeURIComponent).join('/')}/${encodeURIComponent(artifact)}/maven-metadata.xml`;
  const result = await request(url, deps, 'text');
  if (!result.ok) return result;
  const versions = [...String(result.value).matchAll(/<version>\s*([^<]*?)\s*<\/version>/g)].map((m) => m[1]!);
  if (versions.length === 0) return fail('maven-metadata.xml tidak memuat <version>');
  const latest = pickLatest(versions);
  return latest === undefined ? fail('maven-metadata.xml tidak memuat versi stabil') : ok(latest);
}

async function githubVersion(repo: string, tagPattern: string | undefined, deps: Deps): Promise<Result<string>> {
  if (tagPattern === undefined) {
    const result = await request(`${GITHUB_API}/repos/${repoPath(repo)}/releases/latest`, deps, 'json');
    if (!result.ok) return result.error === 'HTTP 404' ? fail(NO_RELEASE) : result;
    const tag = field(result.value, 'tag_name');
    if (typeof tag !== 'string' || tag === '') return fail('jawaban tidak memuat `tag_name`');
    return stable(ok(tag));
  }
  let tags: string[];
  try {
    tags = await deps.gitTags(`https://github.com/${repo}.git`);
  } catch (error) {
    return fail(messageOf(error));
  }
  const latest = pickLatest(tags, tagPattern);
  return latest === undefined ? fail(`tidak ada tag stabil yang cocok dengan tagPattern ${tagPattern}`) : ok(latest);
}

/** Versi stabil terbaru dari `versionSource`, sebagai teks bernomor (`'3.15.2'`). */
export async function fetchLatestVersion(source: VersionSource, deps: Deps): Promise<Result<string>> {
  try {
    if (source.kind === 'github') {
      return source.repo ? await githubVersion(source.repo, source.tagPattern, deps) : fail('versionSource github butuh `repo`');
    }
    const name = source.name;
    if (!name) return fail(`versionSource ${source.kind} butuh \`name\``);
    switch (source.kind) {
      case 'npm':
        return stable(await jsonString(`https://registry.npmjs.org/${npmRegistryName(name)}/latest`, 'version', deps));
      case 'pypi':
        return stable(await jsonString(`https://pypi.org/pypi/${encodeURIComponent(name)}/json`, 'info.version', deps));
      case 'crates':
        return stable(
          await jsonString(`https://crates.io/api/v1/crates/${encodeURIComponent(name)}`, 'crate.max_stable_version', deps),
        );
      case 'maven':
        return await mavenVersion(name, deps);
    }
  } catch (error) {
    // Jaring terakhir, mis. tagPattern yang bukan regex sah.
    return fail(messageOf(error));
  }
}

/** Jumlah bintang repo GitHub (`pemilik/nama`). */
export async function fetchStars(repo: string, deps: Deps): Promise<Result<number>> {
  return jsonNumber(`${GITHUB_API}/repos/${repoPath(repo)}`, 'stargazers_count', deps);
}

/** Jumlah unduhan: seminggu terakhir (npm, PyPI) atau 90 hari terakhir (crates). */
export async function fetchDownloads(
  d: { registry: DownloadRegistry; name: string },
  deps: Deps,
): Promise<Result<Downloads>> {
  const withPeriod = (result: Result<number>, period: Downloads['period']): Result<Downloads> =>
    result.ok ? ok({ value: result.value, period }) : result;
  switch (d.registry) {
    case 'npm':
      return withPeriod(
        await jsonNumber(`https://api.npmjs.org/downloads/point/last-week/${npmDownloadsName(d.name)}`, 'downloads', deps),
        'minggu',
      );
    case 'pypi':
      return withPeriod(
        await jsonNumber(`https://pypistats.org/api/packages/${encodeURIComponent(d.name)}/recent`, 'data.last_week', deps),
        'minggu',
      );
    case 'crates':
      return withPeriod(
        await jsonNumber(`https://crates.io/api/v1/crates/${encodeURIComponent(d.name)}`, 'crate.recent_downloads', deps),
        '90-hari',
      );
  }
}

/** Nama tag dari keluaran `git ls-remote --tags --refs`. */
export function parseLsRemote(output: string): string[] {
  const tags: string[] = [];
  for (const line of output.split(/\r?\n/)) {
    const ref = line.split('\t')[1];
    if (ref?.startsWith('refs/tags/')) tags.push(ref.slice('refs/tags/'.length));
  }
  return tags;
}

/** Dependensi sungguhan: fetch bawaan dengan User-Agent dan batas waktu, `git ls-remote`. */
export function defaultDeps(): Deps {
  const politeFetch: typeof fetch = (input, init) => {
    const headers = new Headers(init?.headers);
    if (!headers.has('user-agent')) headers.set('User-Agent', USER_AGENT);
    return fetch(input, { ...init, headers, signal: init?.signal ?? AbortSignal.timeout(TIMEOUT_MS) });
  };
  const gitTags = (repoUrl: string): Promise<string[]> =>
    new Promise((resolve, reject) => {
      execFile(
        'git',
        ['ls-remote', '--tags', '--refs', repoUrl],
        {
          timeout: TIMEOUT_MS,
          maxBuffer: 32 * 1024 * 1024,
          windowsHide: true,
          // Repo yang tidak ada membuat git meminta kredensial; jangan pernah menunggu.
          env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' },
        },
        (error, stdout, stderr) => {
          if (error) {
            const detail = String(stderr).trim().split(/\r?\n/).at(-1);
            reject(new Error(`git ls-remote ${repoUrl} gagal: ${detail || error.message}`));
          } else {
            resolve(parseLsRemote(String(stdout)));
          }
        },
      );
    });
  const token = process.env.GITHUB_TOKEN;
  return token ? { fetch: politeFetch, gitTags, githubToken: token } : { fetch: politeFetch, gitTags };
}
