// Company logo for a Stock Token, served from our own domain: /api/logo?s=NVDA
// Robinhood's token CDN uses one generic logo for every stock, so we look the
// company up by ticker instead. Edge-cached for a week; 404 lets the UI fall
// back to the ticker's first letter.
export const config = { runtime: 'edge' };
const SOURCES = [
  s => 'https://financialmodelingprep.com/image-stock/' + s + '.png',
  s => 'https://assets.parqet.com/logos/symbol/' + s + '?format=png',
];
export default async function handler(req) {
  const url = new URL(req.url);
  const s = (url.searchParams.get('s') || '').toUpperCase().replace(/[^A-Z0-9.]/g, '').replace('.', '-');
  if (!s || s.length > 8) return new Response('bad symbol', { status: 400 });
  for (const src of SOURCES) {
    try {
      const r = await fetch(src(s), { headers: { 'user-agent': 'Mozilla/5.0 Zyro' } });
      const type = r.headers.get('content-type') || '';
      if (!r.ok || !type.startsWith('image/')) continue;
      const buf = await r.arrayBuffer();
      if (buf.byteLength < 300) continue;
      return new Response(buf, { headers: { 'content-type': type, 'cache-control': 'public, max-age=86400, s-maxage=604800' } });
    } catch (_) {}
  }
  return new Response('not found', { status: 404, headers: { 'cache-control': 'public, s-maxage=86400' } });
}
