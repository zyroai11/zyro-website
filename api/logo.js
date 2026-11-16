// Same-origin logo proxy for Robinhood Stock Token logos: /api/logo?a=0x...
// Cached at the edge for a week so phones don't hit Robinhood's CDN directly.
export const config = { runtime: 'edge' };
export default async function handler(req) {
  const url = new URL(req.url);
  const a = (url.searchParams.get('a') || '').toLowerCase();
  if (!/^0x[0-9a-f]{40}$/.test(a)) return new Response('bad address', { status: 400 });
  const r = await fetch('https://cdn.robinhood.com/ncw_assets/logos/' + a + '.png', { headers: { 'user-agent': 'Mozilla/5.0 Zyro' } });
  if (!r.ok) return new Response('not found', { status: 404, headers: { 'cache-control': 'public, s-maxage=3600' } });
  const buf = await r.arrayBuffer();
  if (url.searchParams.get('info') === '1') {
    const b = new Uint8Array(buf);
    let s = ''; for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return new Response(JSON.stringify({ type: r.headers.get('content-type'), size: b.length, b64: btoa(s) }), { headers: { 'content-type': 'application/json' } });
  }
  return new Response(buf, { headers: { 'content-type': r.headers.get('content-type') || 'image/png', 'cache-control': 'public, max-age=86400, s-maxage=604800' } });
}
