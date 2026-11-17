import { ImageResponse } from '@vercel/og';
import { chainOf, scan } from './_zyro.js';

export const config = { runtime: 'edge' };

const h = (type, props = {}, ...children) => ({
  type,
  props: { ...props, children: children.length === 0 ? undefined : children.length === 1 ? children[0] : children },
});

const FONT_URL = 'https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Bold.ttf';

export default async function handler(req) {
  let fonts = [];
  try {
    const res = await fetch(FONT_URL);
    if (res.ok) fonts = [{ name: 'Poppins', data: await res.arrayBuffer(), weight: 700, style: 'normal' }];
  } catch (_) { /* fall back to the default font */ }
  const family = fonts.length ? 'Poppins' : 'sans-serif';

  const logo = h('svg', { width: 84, height: 84, viewBox: '0 0 100 100' },
    h('rect', { x: 4, y: 4, width: 92, height: 92, rx: 24, fill: '#2F7BFF' }),
    h('polyline', { points: '30,30 70,30 44,52 58,52 30,72 70,72', fill: 'none', stroke: '#fff', 'stroke-width': 8, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));

  const ring = h('svg', { width: 230, height: 230, viewBox: '0 0 230 230' },
    h('circle', { cx: 115, cy: 115, r: 92, fill: 'none', stroke: 'rgba(191,217,255,0.14)', 'stroke-width': 20 }),
    h('circle', { cx: 115, cy: 115, r: 92, fill: 'none', stroke: '#1FA971', 'stroke-width': 20, 'stroke-linecap': 'round',
      'stroke-dasharray': '520 578', transform: 'rotate(-90 115 115)' }));

  // Share card for one scanned token: /api/og?token=0x…
  const token = new URL(req.url).searchParams.get('token') || '';
  if (chainOf(token)) {
    let d = null;
    try { d = await scan(token); } catch (_) {}
    if (d) {
      const col = { low: '#1FA971', medium: '#E0A100', high: '#F07A2A', 'very-high': '#E5484D' }[d.level];
      const usd = v => v >= 1e6 ? '$' + (v / 1e6).toFixed(2) + 'M' : v >= 1e3 ? '$' + (v / 1e3).toFixed(1) + 'K' : '$' + v.toFixed(0);
      const warn = d.checks.filter(k => k.points).length;
      const sring = h('svg', { width: 300, height: 300, viewBox: '0 0 230 230' },
        h('circle', { cx: 115, cy: 115, r: 92, fill: 'none', stroke: 'rgba(191,217,255,0.14)', 'stroke-width': 20 }),
        h('circle', { cx: 115, cy: 115, r: 92, fill: 'none', stroke: col, 'stroke-width': 20, 'stroke-linecap': 'round',
          'stroke-dasharray': `${Math.max(1, Math.round(578 * d.score / 100))} 578`, transform: 'rotate(-90 115 115)' }));
      const stat = (k, v) => h('div', { style: { display: 'flex', flexDirection: 'column', marginRight: 56 } },
        h('div', { style: { fontSize: 24, color: '#9FB2D9' } }, k), h('div', { style: { fontSize: 38 } }, v));
      const card = h('div', { style: { width: '100%', height: '100%', display: 'flex', padding: '70px 80px',
          background: 'radial-gradient(circle at 80% 50%, #163a8a 0%, #0C1B42 40%, #06102A 75%)', fontFamily: family, color: '#fff' } },
        h('div', { style: { display: 'flex', flexDirection: 'column', flex: 1 } },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 20 } }, logo,
            h('div', { style: { fontSize: 40, letterSpacing: 5 } }, 'ZYRO'),
            h('div', { style: { fontSize: 28, color: '#9FB2D9', marginLeft: 10 } }, 'Token scan')),
          h('div', { style: { marginTop: 56, fontSize: 84, lineHeight: 1.05 } }, '$' + String(d.token.symbol).slice(0, 12)),
          h('div', { style: { display: 'flex', marginTop: 20 } },
            h('div', { style: { display: 'flex', background: col, color: '#06102A', fontSize: 34, padding: '10px 36px', borderRadius: 40 } }, d.verdict)),
          h('div', { style: { display: 'flex', marginTop: 44 } },
            stat('Liquidity', usd(d.market.liquidity)), stat('Volume 24h', usd(d.market.volume24h)), stat('Warnings', String(warn))),
          h('div', { style: { marginTop: 36, fontSize: 26, color: '#9FB2D9' } }, 'Scan any Solana token at zyro-ai.xyz/app')),
        h('div', { style: { position: 'relative', width: 300, height: 300, marginTop: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
          h('div', { style: { position: 'absolute', left: 0, top: 0, display: 'flex' } }, sring),
          h('div', { style: { fontSize: 100 } }, String(d.score))));
      return new ImageResponse(card, { width: 1200, height: 630, fonts, headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' } });
    }
  }

  const tree = h('div', {
    style: {
      width: '100%', height: '100%', display: 'flex', position: 'relative', padding: '78px 80px',
      background: 'radial-gradient(circle at 75% 45%, #163a8a 0%, #0C1B42 40%, #06102A 75%)', fontFamily: family, color: '#fff',
    },
  },
    h('div', { style: { display: 'flex', flexDirection: 'column', flex: 1 } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 22 } }, logo,
        h('div', { style: { fontSize: 46, letterSpacing: 6 } }, 'ZYRO')),
      h('div', { style: { display: 'flex', flexDirection: 'column', marginTop: 70, fontSize: 84, lineHeight: 1.08 } },
        h('div', {}, 'Scan the token'),
        h('div', { style: { color: '#BFD9FF' } }, 'before you buy it.')),
      h('div', { style: { marginTop: 26, fontSize: 32, color: '#9FB2D9' } }, 'The AI agent for Solana'),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 30, marginTop: 40 } },
        h('div', { style: { display: 'flex', background: '#FFD23F', color: '#06102A', fontSize: 30, padding: '12px 44px', borderRadius: 40 } }, 'zyro-ai.xyz'),
        h('div', { style: { fontSize: 30 } }, '@ZyroAiAgent_bot'))),
    h('div', { style: { position: 'absolute', right: 80, top: 135, width: 230, height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' } },
      h('div', { style: { position: 'relative', width: 230, height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        h('div', { style: { position: 'absolute', left: 0, top: 0, display: 'flex' } }, ring),
        h('div', { style: { fontSize: 68 } }, '90')),
      h('div', { style: { marginTop: 18, fontSize: 26, color: '#9FB2D9' } }, 'Safety score')));

  return new ImageResponse(tree, {
    width: 1200, height: 630, fonts,
    headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' },
  });
}
