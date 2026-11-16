import { expect, test } from 'vitest';
import {
  checkLink,
  classifyLink,
  extractLinks,
  normalizeCheckableUrl,
  renderLinkReport,
  type LinkResult,
} from '../../src/lib/links.ts';

// --- extractLinks ---

test('extractLinks: tautan Markdown, autolink, dan href; unik; urutan kemunculan', () => {
  const body = [
    'Lihat [Python](https://www.python.org) dan [Tutorial](https://docs.python.org/3/tutorial/ "Judul").',
    'Autolink: <https://peps.python.org/pep-0008/>.',
    '<a href="https://example.com/a">a</a> <a class="x" href=\'https://example.com/b\'>b</a>',
    'Ulang [lagi](https://www.python.org).',
  ].join('\n');
  expect(extractLinks(body)).toEqual([
    'https://www.python.org',
    'https://docs.python.org/3/tutorial/',
    'https://peps.python.org/pep-0008/',
    'https://example.com/a',
    'https://example.com/b',
  ]);
});

test('extractLinks: mengabaikan http://, path internal, jangkar, mailto, dan teks polos', () => {
  const body = [
    '[a](http://insecure.example.com) [b](/internal/page) [c](#anchor) [d](mailto:a@b.c)',
    '[e](python/variabel-tipe-data) <a href="http://x.example">x</a>',
    'URL polos https://plain.example.com tidak dihitung.',
  ].join('\n');
  expect(extractLinks(body)).toEqual([]);
});

test('extractLinks: mengabaikan URL di dalam blok kode berpagar', () => {
  const body = [
    '[ada](https://before.example.com)',
    '```bash',
    'curl https://in-code.example.com',
    '[x](https://in-fence.example.com)',
    '```',
    '~~~',
    '<https://tilde.example.com>',
    '~~~',
    '````',
    '```',
    '[y](https://nested.example.com)',
    '```',
    '````',
    '[sesudah](https://after.example.com)',
  ].join('\n');
  expect(extractLinks(body)).toEqual(['https://before.example.com', 'https://after.example.com']);
});

test('extractLinks: pagar yang tak pernah ditutup menelan sisa dokumen', () => {
  expect(extractLinks('[a](https://a.example.com)\n```\n[b](https://b.example.com)')).toEqual(['https://a.example.com']);
});

test('extractLinks: tanda baca penutup dibuang, kurung seimbang dipertahankan', () => {
  const body = [
    '[a](https://trail.example.com/path,)',
    '<https://auto.example.com/x.>',
    '(lihat [wiki](https://en.wikipedia.org/wiki/Python_(programming_language))).',
    '[b](<https://angle.example.com/q?a=1&b=2>)',
  ].join('\n');
  expect(extractLinks(body)).toEqual([
    'https://trail.example.com/path',
    'https://auto.example.com/x',
    'https://en.wikipedia.org/wiki/Python_(programming_language)',
    'https://angle.example.com/q?a=1&b=2',
  ]);
});

test('extractLinks: entitas &amp; di atribut href didekode', () => {
  expect(extractLinks('<a href="https://x.example.com/?a=1&amp;b=2">x</a>')).toEqual(['https://x.example.com/?a=1&b=2']);
});

test('extractLinks: baris CRLF', () => {
  expect(extractLinks('[a](https://a.example.com)\r\n```\r\n[b](https://b.example.com)\r\n```\r\n[c](https://c.example.com)')).toEqual([
    'https://a.example.com',
    'https://c.example.com',
  ]);
});

// --- normalizeCheckableUrl ---

test('normalizeCheckableUrl: buang jangkar, lewati domain sendiri, kredensial, host lokal, dan IP', () => {
  const own = 'devmecum.stellify.workers.dev';
  expect(normalizeCheckableUrl('https://www.python.org/x#bagian', own)).toBe('https://www.python.org/x');
  expect(normalizeCheckableUrl('https://devmecum.stellify.workers.dev/python/', own)).toBeUndefined();
  expect(normalizeCheckableUrl('https://user:pass@example.com/', own)).toBeUndefined();
  expect(normalizeCheckableUrl('https://localhost/x', own)).toBeUndefined();
  expect(normalizeCheckableUrl('https://printer.local/x', own)).toBeUndefined();
  expect(normalizeCheckableUrl('https://169.254.169.254/latest/meta-data', own)).toBeUndefined();
  expect(normalizeCheckableUrl('https://[::1]/x', own)).toBeUndefined();
  expect(normalizeCheckableUrl('http://www.python.org', own)).toBeUndefined();
  expect(normalizeCheckableUrl('bukan url', own)).toBeUndefined();
});

// --- classifyLink ---

test('classifyLink: 200 dan 2xx lain → ok', () => {
  expect(classifyLink({ status: 200 })).toBe('ok');
  expect(classifyLink({ status: 204 })).toBe('ok');
});

test('classifyLink: 301/308 ke URL lain → pindah', () => {
  expect(classifyLink({ status: 301, location: 'https://baru.example.com/' })).toBe('pindah');
  expect(classifyLink({ status: 308, location: 'https://baru.example.com/' })).toBe('pindah');
});

test('classifyLink: 301/308 tanpa location → tak-pasti', () => {
  expect(classifyLink({ status: 301 })).toBe('tak-pasti');
  expect(classifyLink({ status: 308, location: '' })).toBe('tak-pasti');
});

test('classifyLink: 301 ke URL yang sama (mis. garis miring penutup, jangkar) → ok', () => {
  const url = 'https://example.com/a';
  expect(classifyLink({ status: 301, location: 'https://example.com/a/', url })).toBe('ok');
  expect(classifyLink({ status: 301, location: '/a#x', url })).toBe('ok');
  expect(classifyLink({ status: 301, location: '/b', url })).toBe('pindah');
});

test('classifyLink: 302/303/307 (sementara) → ok, berapa pun tujuannya', () => {
  for (const status of [302, 303, 307]) {
    expect(classifyLink({ status, location: 'https://lain.example.org/' })).toBe('ok');
  }
});

test('classifyLink: 404, 410, ENOTFOUND, ECONNREFUSED → mati', () => {
  expect(classifyLink({ status: 404 })).toBe('mati');
  expect(classifyLink({ status: 410 })).toBe('mati');
  expect(classifyLink({ errorCode: 'ENOTFOUND' })).toBe('mati');
  expect(classifyLink({ errorCode: 'ECONNREFUSED' })).toBe('mati');
});

test('classifyLink: situs pemblokir bot dan masalah sementara → tak-pasti, tidak pernah mati', () => {
  for (const status of [400, 401, 403, 405, 429, 451, 500, 502, 503, 504, 520]) {
    expect(classifyLink({ status })).toBe('tak-pasti');
  }
  for (const errorCode of ['ETIMEDOUT', 'AbortError', 'TimeoutError', 'ECONNRESET', 'UND_ERR_CONNECT_TIMEOUT', 'CERT_HAS_EXPIRED']) {
    expect(classifyLink({ errorCode })).toBe('tak-pasti');
  }
});

test('classifyLink: tanpa status maupun kode galat → tak-pasti', () => {
  expect(classifyLink({})).toBe('tak-pasti');
});

// --- checkLink ---

type Call = { url: string; init: RequestInit };

function fakeFetch(handler: (call: Call) => Response | Error): { fetch: typeof fetch; calls: Call[] } {
  const calls: Call[] = [];
  const impl = (async (input: string | URL | Request, init?: RequestInit) => {
    const call = { url: String(input), init: init ?? {} };
    calls.push(call);
    const result = handler(call);
    if (result instanceof Error) throw result;
    return result;
  }) as typeof fetch;
  return { fetch: impl, calls };
}

const response = (status: number, headers: Record<string, string> = {}): Response =>
  new Response(null, { status, headers });

test('checkLink: HEAD dengan redirect manual, User-Agent, tanpa kredensial', async () => {
  const { fetch, calls } = fakeFetch(() => response(200));
  const result = await checkLink('https://example.com/', fetch);
  expect(result).toMatchObject({ status: 'ok' });
  expect(calls).toHaveLength(1);
  expect(calls[0]!.init.method).toBe('HEAD');
  expect(calls[0]!.init.redirect).toBe('manual');
  expect(calls[0]!.init.credentials).toBe('omit');
  const headers = new Headers(calls[0]!.init.headers);
  expect(headers.get('user-agent')).toMatch(/devmecum/);
  expect(headers.has('authorization')).toBe(false);
  expect(headers.has('cookie')).toBe(false);
  expect(calls[0]!.init.signal).toBeInstanceOf(AbortSignal);
});

test('checkLink: HEAD 403/405/501 diulang dengan GET dan hasil GET yang dipakai', async () => {
  for (const headStatus of [403, 405, 501]) {
    const { fetch, calls } = fakeFetch(({ init }) => (init.method === 'HEAD' ? response(headStatus) : response(200)));
    const result = await checkLink('https://example.com/', fetch);
    expect(result.status).toBe('ok');
    expect(calls.map((call) => call.init.method)).toEqual(['HEAD', 'GET']);
    expect(calls[1]!.init.redirect).toBe('manual');
  }
});

test('checkLink: HEAD 404 tidak diulang; HEAD 403 lalu GET 403 → tak-pasti', async () => {
  const notFound = fakeFetch(() => response(404));
  expect(await checkLink('https://example.com/x', notFound.fetch)).toMatchObject({ status: 'mati', detail: 'HTTP 404' });
  expect(notFound.calls).toHaveLength(1);

  const blocked = fakeFetch(() => response(403));
  expect(await checkLink('https://example.com/x', blocked.fetch)).toMatchObject({ status: 'tak-pasti', detail: 'HTTP 403' });
  expect(blocked.calls).toHaveLength(2);
});

test('checkLink: redirect 301 tidak diikuti; lokasi relatif diselesaikan dan dicatat', async () => {
  const { fetch, calls } = fakeFetch(() => response(301, { location: '/baru' }));
  const result = await checkLink('https://example.com/lama', fetch);
  expect(result).toEqual({ status: 'pindah', detail: 'HTTP 301 → https://example.com/baru' });
  expect(calls).toHaveLength(1);
});

test('checkLink: galat jaringan memakai kode dari cause', async () => {
  const dns = Object.assign(new TypeError('fetch failed'), { cause: Object.assign(new Error('getaddrinfo'), { code: 'ENOTFOUND' }) });
  expect(await checkLink('https://tidak-ada.example/', fakeFetch(() => dns).fetch)).toMatchObject({
    status: 'mati',
    detail: 'ENOTFOUND',
  });

  const timeout = Object.assign(new Error('The operation was aborted'), { name: 'TimeoutError' });
  expect(await checkLink('https://lambat.example/', fakeFetch(() => timeout).fetch)).toMatchObject({
    status: 'tak-pasti',
    detail: 'TimeoutError',
  });
});

// --- renderLinkReport ---

const result = (partial: Partial<LinkResult> & Pick<LinkResult, 'url' | 'status'>): LinkResult => ({
  detail: '',
  files: ['src/data/tech/python.yaml'],
  ...partial,
});

const DATE = new Date('2026-11-16T01:00:00Z');

test('renderLinkReport: findings benar bila ada mati atau pindah', () => {
  expect(renderLinkReport([result({ url: 'https://a.example', status: 'mati', detail: 'HTTP 404' })], DATE).findings).toBe(true);
  expect(renderLinkReport([result({ url: 'https://a.example', status: 'pindah', detail: 'HTTP 301 → https://b.example' })], DATE).findings).toBe(true);
});

test('renderLinkReport: ok dan tak-pasti saja bukan temuan; tak-pasti tetap dicantumkan terpisah', () => {
  const { markdown, findings } = renderLinkReport(
    [
      result({ url: 'https://ok.example', status: 'ok', detail: 'HTTP 200' }),
      result({ url: 'https://bot.example', status: 'tak-pasti', detail: 'HTTP 403', files: ['src/content/docs/a.mdx', 'src/content/docs/b.mdx'] }),
    ],
    DATE,
  );
  expect(findings).toBe(false);
  expect(markdown).toContain('## Tak pasti');
  expect(markdown).toContain('`https://bot.example`');
  expect(markdown).toContain('`src/content/docs/a.mdx`');
  expect(markdown).toContain('`src/content/docs/b.mdx`');
  expect(markdown).not.toContain('## Mati');
  expect(markdown).not.toContain('## Pindah');
  expect(markdown).toContain('2 tautan');
  expect(markdown).toContain('16 November 2026');
});

test('renderLinkReport: bagian mati dan pindah terpisah dan menyebut berkasnya', () => {
  const { markdown } = renderLinkReport(
    [
      result({ url: 'https://dead.example', status: 'mati', detail: 'HTTP 404', files: ['src/content/docs/x.mdx'] }),
      result({ url: 'https://old.example', status: 'pindah', detail: 'HTTP 301 → https://new.example/' }),
    ],
    DATE,
  );
  const dead = markdown.indexOf('## Mati');
  const moved = markdown.indexOf('## Pindah');
  expect(dead).toBeGreaterThan(-1);
  expect(moved).toBeGreaterThan(dead);
  expect(markdown.slice(dead, moved)).toContain('`https://dead.example`');
  expect(markdown.slice(dead, moved)).toContain('`src/content/docs/x.mdx`');
  expect(markdown.slice(moved)).toContain('`HTTP 301 → https://new.example/`');
});

test('renderLinkReport: tanpa masalah menyatakan semuanya baik', () => {
  const { markdown, findings } = renderLinkReport([result({ url: 'https://ok.example', status: 'ok' })], DATE);
  expect(findings).toBe(false);
  expect(markdown).toContain('Tidak ada tautan mati atau pindah.');
});

test('renderLinkReport: banyak berkas dipotong dengan penanda', () => {
  const files = Array.from({ length: 9 }, (_, i) => `src/content/docs/p${i}.mdx`);
  const { markdown } = renderLinkReport([result({ url: 'https://dead.example', status: 'mati', files })], DATE);
  expect(markdown).toContain('`src/content/docs/p0.mdx`');
  expect(markdown).not.toContain('p8.mdx');
  expect(markdown).toContain('dan 4 berkas lain');
});

// Teks dari jaringan (Location, pesan galat) dan URL dari konten bisa berisi apa saja,
// dan laporan menjadi isi issue GitHub di repo publik.
const ALLOWED_HEADINGS = /^(# Pemeriksaan tautan eksternal — .+|## (Mati|Pindah|Tak pasti))$/;

function expectInert(markdown: string): void {
  for (const line of markdown.split('\n')) {
    if (line.startsWith('#')) expect(line).toMatch(ALLOWED_HEADINGS);
    expect(line.startsWith('|')).toBe(false);
    expect(line.startsWith('>')).toBe(false);
  }
}

test('renderLinkReport: @everyone, #123, | dan baris baru di detail tidak lolos dari span kode', () => {
  const detail = 'HTTP 301 → https://x.example/a|b\n## Judul palsu @everyone #123\n- butir';
  const { markdown } = renderLinkReport([result({ url: 'https://old.example', status: 'pindah', detail })], DATE);
  expect(markdown).toContain('`HTTP 301 → https://x.example/a|b ## Judul palsu @everyone #123 - butir`');
  expectInert(markdown);
});

test('renderLinkReport: @everyone, #123, | dan baris baru di URL dan nama berkas dinetralkan', () => {
  const url = 'https://evil.example/@everyone#123?a=1|2\n@octocat #1';
  const { markdown } = renderLinkReport(
    [result({ url, status: 'mati', detail: 'HTTP 404', files: ['src/content/docs/@everyone #9|x.mdx'] })],
    DATE,
  );
  expect(markdown).toContain('`https://evil.example/@everyone#123?a=1|2 @octocat #1`');
  expect(markdown).toContain('`src/content/docs/@everyone #9|x.mdx`');
  expectInert(markdown);
  // Setiap kemunculan @ dan # berada di dalam span kode.
  for (const line of markdown.split('\n').filter((l) => /[@#]/.test(l) && !l.startsWith('#'))) {
    expect(line.replace(/`[^`]*`/g, '')).not.toMatch(/[@#]/);
  }
});

test('renderLinkReport: backtick di dalam teks tidak menutup span kode lebih awal', () => {
  const { markdown } = renderLinkReport(
    [result({ url: 'https://dead.example', status: 'mati', detail: 'a`b```c @everyone' })],
    DATE,
  );
  expect(markdown).toContain('````a`b```c @everyone````');
});

test('renderLinkReport: teks yang diawali atau diakhiri backtick diberi spasi pengaman', () => {
  const { markdown } = renderLinkReport([result({ url: 'https://dead.example', status: 'mati', detail: '`x`' })], DATE);
  expect(markdown).toContain('`` `x` ``');
});

test('renderLinkReport: detail panjang dipotong', () => {
  const { markdown } = renderLinkReport([result({ url: 'https://dead.example', status: 'mati', detail: 'z'.repeat(5000) })], DATE);
  expect(markdown.length).toBeLessThan(2000);
});

test('renderLinkReport: isi laporan tidak melampaui batas issue GitHub', () => {
  const many = Array.from({ length: 3000 }, (_, i) =>
    result({ url: `https://dead${i}.example.com/${'p'.repeat(40)}`, status: 'mati', detail: 'HTTP 404' }),
  );
  const { markdown, findings } = renderLinkReport(many, DATE);
  expect(findings).toBe(true);
  expect(markdown.length).toBeLessThanOrEqual(60_000);
  expect(markdown).toContain('dipotong');
});
