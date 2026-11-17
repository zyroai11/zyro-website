// Share page for one scan: gives X and Telegram a preview card, then sends people to the web app.
import { chainOf, scan } from './_zyro.js';

export const config = { runtime: 'edge' };

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default async function handler(req) {
  const address = new URL(req.url).searchParams.get('address') || '';
  if (!chainOf(address)) return Response.redirect('https://zyro-ai.xyz/app', 302);
  let title = 'Token scan on Zyro', desc = 'Safety score from 0 to 100 with every reason shown, for any token on Solana or Robinhood Chain.';
  try {
    const d = await scan(address);
    if (d) {
      title = `$${d.token.symbol} scored ${d.score}/100 on Zyro: ${d.verdict.toLowerCase()}`;
      const w = d.checks.filter(k => k.points).map(k => k.detail);
      desc = w.length ? `Warnings: ${w.slice(0, 3).join('. ')}.` : 'No warnings in the eight checks. A high score is not a guarantee.';
    }
  } catch (_) {}
  const to = `/app?token=${address}`, img = `https://zyro-ai.xyz/api/og?token=${address}`;
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Zyro"><meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${img}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:site" content="@zyroxstonk"><meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${img}">
<meta http-equiv="refresh" content="0;url=${to}"><link rel="canonical" href="https://zyro-ai.xyz${to}"></head>
<body><p><a href="${to}">Open the scan on Zyro</a></p><script>location.replace(${JSON.stringify(to)})</script></body></html>`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600' } });
}
