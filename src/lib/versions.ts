// Membaca dan membandingkan nomor versi dari registri dan tag Git, tanpa
// dependensi semver: tag dunia nyata (`go1.25.3`, `REL_17_2`, `3.16.0a1`,
// `2.7.18.RELEASE`) tidak mengikuti satu tata bahasa.

const NUMBERS_RE = /\d+(?:\.\d+)*/;

// Penanda prarilis di ekor versi: PEP 440 (a1, b2, rc3, .dev1), semver
// (-rc.1, -beta.2, -canary-…, -preview.3), Maven (-M1, -SNAPSHOT, .CR1).
// Penanda harus berdiri sendiri: diawali bukan huruf, diikuti angka, bukan
// huruf, atau akhir teks, supaya `-android` atau `.RELEASE` tidak ikut.
const PRERELEASE_RE =
  /(?:^|[^a-z])(?:alpha|a|beta|b|rc|cr|c|pre|preview|dev|canary|nightly|snapshot|milestone|m|ea|next|experimental|insiders)(?=\d|[^a-z]|$)/i;

/** Deret angka pertama: `'v3.15.2'` → `[3, 15, 2]`; tanpa angka → undefined. */
export function parseVersion(raw: string): number[] | undefined {
  const match = NUMBERS_RE.exec(raw);
  return match ? match[0].split('.').map(Number) : undefined;
}

/** Benar bila ekor sesudah deret angka pertama memuat penanda prarilis. */
export function isPrerelease(raw: string): boolean {
  const match = NUMBERS_RE.exec(raw);
  const tail = match ? raw.slice(match.index + match[0].length) : raw;
  return PRERELEASE_RE.test(tail);
}

/**
 * Perbandingan numerik per komponen (`3.10` > `3.9`); komponen yang hilang
 * dianggap 0. Bila angkanya sama, rilis stabil lebih baru dari prarilisnya.
 * Teks tanpa angka selalu paling lama.
 */
export function compareVersions(a: string, b: string): number {
  const left = parseVersion(a);
  const right = parseVersion(b);
  if (!left || !right) return (left ? 1 : 0) - (right ? 1 : 0);
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return Number(isPrerelease(b)) - Number(isPrerelease(a));
}

/** Versi bernomor dari satu kandidat, atau undefined bila kandidat dibuang. */
function normalize(candidate: string, pattern: RegExp | undefined): string | undefined {
  let text = candidate;
  if (pattern) {
    const match = pattern.exec(candidate);
    if (!match) return undefined;
    // Grup yang tidak ikut cocok (`(?:\.(\d+))?` pada `go1.25`) dilewati.
    text = match
      .slice(1)
      .filter((group) => group !== undefined && group !== '')
      .join('.');
  }
  if (isPrerelease(text)) return undefined;
  return parseVersion(text)?.join('.');
}

/**
 * Versi stabil terbaru dari daftar kandidat, sebagai teks bernomor (`'3.15.2'`).
 * Dengan `tagPattern`, hanya kandidat yang cocok penuh yang dipakai, dan
 * versinya adalah grup tangkapan yang digabung titik. Prarilis selalu dibuang.
 */
export function pickLatest(candidates: readonly string[], tagPattern?: string): string | undefined {
  const pattern = tagPattern === undefined ? undefined : new RegExp(`^(?:${tagPattern})$`);
  let latest: string | undefined;
  for (const candidate of candidates) {
    const version = normalize(candidate, pattern);
    if (version !== undefined && (latest === undefined || compareVersions(version, latest) > 0)) {
      latest = version;
    }
  }
  return latest;
}

/**
 * Benar bila `latest` masih satu seri dengan `techVersion`: angka-angka
 * `techVersion` adalah awalan angka `latest` (komponen yang hilang dianggap 0).
 * `'3.15'` cocok dengan `'3.15.3'`; `'3.x'` hanya membandingkan mayor.
 */
export function seriesMatches(techVersion: string, latest: string): boolean {
  const series = parseVersion(techVersion);
  const current = parseVersion(latest);
  if (!series || !current) return false;
  return series.every((part, i) => part === (current[i] ?? 0));
}
