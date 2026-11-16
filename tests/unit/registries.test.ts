import { expect, test } from 'vitest';
import {
  USER_AGENT,
  fetchDownloads,
  fetchLatestVersion,
  fetchStars,
  type Deps,
} from '../../src/lib/registries.ts';

type Reply = { status?: number; json?: unknown; text?: string } | Error;
type Call = { url: string; headers: Headers };

/** fetch palsu: jawaban per URL, mencatat setiap panggilan. URL tak dikenal → 404. */
function fakeDeps(replies: Record<string, Reply>, extra: Partial<Deps> = {}) {
  const calls: Call[] = [];
  const fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, headers: new Headers(init?.headers) });
    const reply = replies[url];
    if (reply === undefined) return new Response('tidak ada', { status: 404 });
    if (reply instanceof Error) throw reply;
    const body = reply.text ?? JSON.stringify(reply.json);
    return new Response(body, { status: reply.status ?? 200 });
  }) as typeof globalThis.fetch;
  const gitTags = async (): Promise<string[]> => {
    throw new Error('gitTags tidak diharapkan');
  };
  const deps: Deps = { fetch, gitTags, ...extra };
  return { deps, calls };
}

test('npm: version dari dist-tag latest', async () => {
  const { deps, calls } = fakeDeps({ 'https://registry.npmjs.org/astro/latest': { json: { version: '7.4.12' } } });
  expect(await fetchLatestVersion({ kind: 'npm', name: 'astro' }, deps)).toEqual({ ok: true, value: '7.4.12' });
  expect(calls[0]!.headers.get('user-agent')).toBe(USER_AGENT);
});

test('npm bercakupan membentuk URL yang benar', async () => {
  const { deps, calls } = fakeDeps({
    'https://registry.npmjs.org/@astrojs%2Fstarlight/latest': { json: { version: '0.43.1' } },
  });
  expect(await fetchLatestVersion({ kind: 'npm', name: '@astrojs/starlight' }, deps)).toEqual({
    ok: true,
    value: '0.43.1',
  });
  expect(calls.map((c) => c.url)).toEqual(['https://registry.npmjs.org/@astrojs%2Fstarlight/latest']);
});

test('npm: dist-tag latest berisi prarilis tidak diterima', async () => {
  const { deps } = fakeDeps({ 'https://registry.npmjs.org/aneh/latest': { json: { version: '2.0.0-beta.2' } } });
  const result = await fetchLatestVersion({ kind: 'npm', name: 'aneh' }, deps);
  expect(result.ok).toBe(false);
});

test('PyPI: info.version', async () => {
  const { deps } = fakeDeps({ 'https://pypi.org/pypi/requests/json': { json: { info: { version: '2.33.1' } } } });
  expect(await fetchLatestVersion({ kind: 'pypi', name: 'requests' }, deps)).toEqual({ ok: true, value: '2.33.1' });
});

test('crates: crate.max_stable_version', async () => {
  const { deps } = fakeDeps({
    'https://crates.io/api/v1/crates/serde': {
      json: { crate: { max_version: '2.0.0-alpha.1', max_stable_version: '1.0.228' } },
    },
  });
  expect(await fetchLatestVersion({ kind: 'crates', name: 'serde' }, deps)).toEqual({ ok: true, value: '1.0.228' });
});

test('Maven: semua <version> lewat pickLatest', async () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<metadata>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot</artifactId>
  <versioning>
    <latest>4.1.0-M1</latest>
    <release>4.1.0-M1</release>
    <versions>
      <version>2.7.18</version>
      <version>3.10.0</version>
      <version>3.9.5</version>
      <version>4.0.0-RC1</version>
      <version>4.1.0-M1</version>
      <version>4.0.0-SNAPSHOT</version>
    </versions>
  </versioning>
</metadata>`;
  const { deps, calls } = fakeDeps({
    'https://repo1.maven.org/maven2/org/springframework/boot/spring-boot/maven-metadata.xml': { text: xml },
  });
  expect(await fetchLatestVersion({ kind: 'maven', name: 'org.springframework.boot:spring-boot' }, deps)).toEqual({
    ok: true,
    value: '3.10.0',
  });
  expect(calls).toHaveLength(1);
});

test('Maven: nama tanpa grup:artefak ditolak tanpa permintaan', async () => {
  const { deps, calls } = fakeDeps({});
  const result = await fetchLatestVersion({ kind: 'maven', name: 'spring-boot' }, deps);
  expect(result.ok).toBe(false);
  expect(calls).toHaveLength(0);
});

test('GitHub tanpa pola: tag_name dari Release latest', async () => {
  const { deps, calls } = fakeDeps({
    'https://api.github.com/repos/facebook/react/releases/latest': { json: { tag_name: 'v19.2.0' } },
  });
  expect(await fetchLatestVersion({ kind: 'github', repo: 'facebook/react' }, deps)).toEqual({
    ok: true,
    value: '19.2.0',
  });
  expect(calls[0]!.headers.get('authorization')).toBeNull();
});

test('GitHub tanpa pola: 404 menyarankan tagPattern', async () => {
  const { deps } = fakeDeps({});
  expect(await fetchLatestVersion({ kind: 'github', repo: 'python/cpython' }, deps)).toEqual({
    ok: false,
    error: 'tidak punya GitHub Release; tambahkan tagPattern',
  });
});

test('GitHub dengan pola: tag Git lewat gitTags, tanpa HTTP', async () => {
  const asked: string[] = [];
  const { deps, calls } = fakeDeps(
    {},
    {
      gitTags: async (url) => {
        asked.push(url);
        return ['v3.15.2', 'v3.16.0a1', 'v3.15.10', 'v3.14.9', 'legacy-trunk'];
      },
    },
  );
  const source = { kind: 'github', repo: 'python/cpython', tagPattern: '^v(\\d+)\\.(\\d+)\\.(\\d+)$' } as const;
  expect(await fetchLatestVersion(source, deps)).toEqual({ ok: true, value: '3.15.10' });
  expect(asked).toEqual(['https://github.com/python/cpython.git']);
  expect(calls).toHaveLength(0);
});

test('GitHub dengan pola: tidak ada tag cocok → ok false', async () => {
  const { deps } = fakeDeps({}, { gitTags: async () => ['REL_18_BETA1'] });
  const result = await fetchLatestVersion({ kind: 'github', repo: 'postgres/postgres', tagPattern: '^REL_(\\d+)_(\\d+)$' }, deps);
  expect(result.ok).toBe(false);
});

test('GitHub dengan pola: gitTags gagal → ok false berisi pesannya', async () => {
  const { deps } = fakeDeps({}, { gitTags: async () => Promise.reject(new Error('git ls-remote keluar dengan kode 128')) });
  const result = await fetchLatestVersion({ kind: 'github', repo: 'a/b', tagPattern: '^v(\\d+)$' }, deps);
  expect(result).toEqual({ ok: false, error: expect.stringContaining('kode 128') });
});

test('galat HTTP tidak dilempar', async () => {
  for (const status of [429, 403, 500, 503]) {
    const { deps } = fakeDeps({ 'https://pypi.org/pypi/requests/json': { status, json: {} } });
    expect(await fetchLatestVersion({ kind: 'pypi', name: 'requests' }, deps)).toEqual({
      ok: false,
      error: `HTTP ${status}`,
    });
  }
});

test('fetch yang menolak (timeout) menjadi ok false berisi pesannya', async () => {
  const timeout = new DOMException('The operation was aborted due to timeout', 'TimeoutError');
  const { deps } = fakeDeps({ 'https://registry.npmjs.org/astro/latest': timeout });
  const result = await fetchLatestVersion({ kind: 'npm', name: 'astro' }, deps);
  expect(result).toEqual({ ok: false, error: expect.stringContaining('aborted due to timeout') });
});

test('JSON tidak sah dan kolom hilang menjadi ok false', async () => {
  const { deps } = fakeDeps({
    'https://registry.npmjs.org/rusak/latest': { text: '<html>bukan json</html>' },
    'https://pypi.org/pypi/kosong/json': { json: { info: {} } },
    'https://crates.io/api/v1/crates/tanpa-stabil': { json: { crate: { max_stable_version: null } } },
    'https://api.github.com/repos/a/b': { json: { stargazers_count: 'banyak' } },
    'https://api.npmjs.org/downloads/point/last-week/kosong': { json: {} },
  });
  const results = [
    await fetchLatestVersion({ kind: 'npm', name: 'rusak' }, deps),
    await fetchLatestVersion({ kind: 'pypi', name: 'kosong' }, deps),
    await fetchLatestVersion({ kind: 'crates', name: 'tanpa-stabil' }, deps),
    await fetchStars('a/b', deps),
    await fetchDownloads({ registry: 'npm', name: 'kosong' }, deps),
  ];
  for (const result of results) {
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.error.length > 0).toBe(true);
  }
});

test('token GitHub dikirim bila ada', async () => {
  const { deps, calls } = fakeDeps(
    {
      'https://api.github.com/repos/facebook/react': { json: { stargazers_count: 245000 } },
      'https://api.github.com/repos/facebook/react/releases/latest': { json: { tag_name: 'v19.2.0' } },
      'https://registry.npmjs.org/react/latest': { json: { version: '19.2.0' } },
    },
    { githubToken: 'rahasia' },
  );
  expect(await fetchStars('facebook/react', deps)).toEqual({ ok: true, value: 245000 });
  await fetchLatestVersion({ kind: 'github', repo: 'facebook/react' }, deps);
  await fetchLatestVersion({ kind: 'npm', name: 'react' }, deps);
  expect(calls[0]!.headers.get('authorization')).toBe('Bearer rahasia');
  expect(calls[1]!.headers.get('authorization')).toBe('Bearer rahasia');
  // Token tidak pernah dikirim ke host selain api.github.com.
  expect(calls[2]!.headers.get('authorization')).toBeNull();
});

test('bintang tanpa token tidak mengirim Authorization', async () => {
  const { deps, calls } = fakeDeps({ 'https://api.github.com/repos/facebook/react': { json: { stargazers_count: 1 } } });
  expect(await fetchStars('facebook/react', deps)).toEqual({ ok: true, value: 1 });
  expect(calls[0]!.headers.get('authorization')).toBeNull();
  expect(calls[0]!.headers.get('user-agent')).toBe(USER_AGENT);
});

test('unduhan npm, PyPI, dan crates', async () => {
  const { deps, calls } = fakeDeps({
    'https://api.npmjs.org/downloads/point/last-week/@astrojs/starlight': { json: { downloads: 120000 } },
    'https://pypistats.org/api/packages/requests/recent': {
      json: { data: { last_day: 1, last_month: 3, last_week: 2 } },
    },
    'https://crates.io/api/v1/crates/serde': { json: { crate: { recent_downloads: 90000000 } } },
  });
  expect(await fetchDownloads({ registry: 'npm', name: '@astrojs/starlight' }, deps)).toEqual({
    ok: true,
    value: { value: 120000, period: 'minggu' },
  });
  expect(await fetchDownloads({ registry: 'pypi', name: 'requests' }, deps)).toEqual({
    ok: true,
    value: { value: 2, period: 'minggu' },
  });
  expect(await fetchDownloads({ registry: 'crates', name: 'serde' }, deps)).toEqual({
    ok: true,
    value: { value: 90000000, period: '90-hari' },
  });
  expect(calls.every((c) => c.headers.get('authorization') === null)).toBe(true);
});

test('unduhan: 429 tidak dilempar', async () => {
  const { deps } = fakeDeps({ 'https://pypistats.org/api/packages/requests/recent': { status: 429, json: {} } });
  expect(await fetchDownloads({ registry: 'pypi', name: 'requests' }, deps)).toEqual({ ok: false, error: 'HTTP 429' });
});
