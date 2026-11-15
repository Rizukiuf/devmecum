// Gambar pratinjau media sosial (1200×630), satu per teknologi — bukan per
// halaman — supaya jumlah file tetap kecil (rancangan §7, anggaran file §8.2).
import type { APIRoute, GetStaticPaths } from 'astro';
import sharp from 'sharp';
import site from '../../../site.config.mjs';
import { getAllTech, getDomain } from '../../lib/data.ts';

const escapeXml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const getStaticPaths = (async () => {
  const techs = await getAllTech();
  return techs.map((tech) => ({ params: { tech: tech.slug } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const tech = (await getAllTech()).find((item) => item.slug === params.tech);
  if (tech === undefined) return new Response('Tidak ditemukan', { status: 404 });
  const domain = await getDomain(tech.domain);

  // Ukuran huruf mengecil untuk nama panjang supaya tidak terpotong.
  const nameSize = tech.name.length > 18 ? 84 : 120;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0f172a"/>
  <rect x="0" y="0" width="16" height="630" fill="#3b82f6"/>
  <text x="80" y="140" font-family="sans-serif" font-size="40" fill="#93c5fd">${escapeXml(domain?.name ?? '')}</text>
  <text x="80" y="340" font-family="sans-serif" font-size="${nameSize}" font-weight="700" fill="#ffffff">${escapeXml(tech.name)}</text>
  <text x="80" y="540" font-family="sans-serif" font-size="44" fill="#e2e8f0">${escapeXml(site.title)}</text>
  <text x="80" y="590" font-family="sans-serif" font-size="30" fill="#94a3b8">${escapeXml(site.tagline)}</text>
</svg>`;

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
