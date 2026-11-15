import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

// App icons drawn on demand: /api/icon?s=180 (full-bleed square, for iOS and Android)
// and /api/icon?s=32&r=1 (rounded, for the browser tab).
export default function handler(req) {
  const url = new URL(req.url);
  const s = Math.min(1024, Math.max(16, parseInt(url.searchParams.get('s') || '180', 10) || 180));
  const rounded = url.searchParams.get('r') === '1';
  const mark = rounded ? 1 : 0.86;
  const box = {
    width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: rounded ? 'transparent' : '#2F7BFF',
  };
  const svg = {
    type: 'svg',
    props: {
      width: s * mark, height: s * mark, viewBox: '0 0 100 100',
      children: [
        rounded ? { type: 'rect', props: { x: 4, y: 4, width: 92, height: 92, rx: 24, fill: '#2F7BFF' } } : null,
        { type: 'polyline', props: { points: '30,30 70,30 44,52 58,52 30,72 70,72', fill: 'none', stroke: '#fff', 'stroke-width': 8, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' } },
      ].filter(Boolean),
    },
  };
  return new ImageResponse({ type: 'div', props: { style: box, children: svg } }, {
    width: s, height: s,
    headers: { 'Cache-Control': 'public, max-age=604800, s-maxage=604800' },
  });
}
