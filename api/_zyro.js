// Shared scanner logic for the web app. Same rules as the Telegram bot and the terminal agent.
export const CHAIN = 'robinhood';
export const CHAIN_ID = 4663;
export const ZYRO = '0x50e05d1ee5e545540190a1136667af06a496f6d2';
const DS = 'https://api.dexscreener.com';

export const json = (data, status = 200, cache = 'public, s-maxage=30, stale-while-revalidate=60') =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': cache } });

export const isAddr = a => typeof a === 'string' && /^0x[a-fA-F0-9]{40}$/.test(a);

async function getJSON(url, ms = 8000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { accept: 'application/json' } });
    return { status: r.status, data: r.ok ? await r.json() : null };
  } catch (_) {
    return { status: 0, data: null };
  } finally {
    clearTimeout(t);
  }
}

export function bestPairs(list) {
  const best = {};
  for (const p of list || []) {
    if (p.chainId !== CHAIN) continue;
    const a = (p.baseToken?.address || '').toLowerCase();
    if (a && (!best[a] || +(p.liquidity?.usd || 0) > +(best[a].liquidity?.usd || 0))) best[a] = p;
  }
  return best;
}

export async function pairsFor(addrs) {
  const r = await getJSON(`${DS}/tokens/v1/${CHAIN}/${addrs.join(',')}`);
  return bestPairs(Array.isArray(r.data) ? r.data : []);
}

function bs(path) {
  const key = (process.env.BLOCKSCOUT_API_KEY || '').trim();
  return key
    ? `https://api.blockscout.com/${CHAIN_ID}/api/v2/${path}${path.includes('?') ? '&' : '?'}apikey=${encodeURIComponent(key)}`
    : `https://robinhoodchain.blockscout.com/api/v2/${path}`;
}

export async function explorer(address) {
  const info = { verified: null, holders: null };
  const [c, t] = await Promise.all([getJSON(bs(`smart-contracts/${address}`)), getJSON(bs(`tokens/${address}`))]);
  if (c.status === 200 && c.data) info.verified = !!c.data.is_verified;
  else if (c.status === 404) info.verified = false;
  if (t.status === 200 && t.data) {
    const h = t.data.holders ?? t.data.holders_count;
    if (h != null && !isNaN(+h)) info.holders = +h;
  }
  return info;
}

export function score(pair, chain) {
  let s = 100;
  const checks = [];
  const add = (name, status, points, detail) => { checks.push({ name, status, points, detail }); if (points) s -= points; };
  const liq = +(pair.liquidity?.usd || 0), fdv = +(pair.fdv || 0), vol = +(pair.volume?.h24 || 0);
  const buys = pair.txns?.h24?.buys || 0, sells = pair.txns?.h24?.sells || 0;
  const ageH = pair.pairCreatedAt ? (Date.now() - pair.pairCreatedAt) / 36e5 : null;
  const info = pair.info || {};

  if (liq < 5000) add('Liquidity', 'bad', 30, 'Very low liquidity, under $5K');
  else if (liq < 25000) add('Liquidity', 'warn', 15, 'Low liquidity, under $25K');
  else add('Liquidity', 'ok', 0, 'Enough liquidity in the pool');

  if (buys > 20 && sells === 0) add('Buys and sells', 'bad', 30, 'Buys but zero sells: possible honeypot');
  else if (buys + sells > 20 && sells / Math.max(buys, 1) > 3) add('Buys and sells', 'warn', 10, 'Heavy selling pressure');
  else add('Buys and sells', 'ok', 0, 'Normal mix of buys and sells');

  if (ageH !== null && ageH < 24) add('Pair age', 'warn', 15, 'New pair, under 24 hours old');
  else add('Pair age', ageH === null ? 'unknown' : 'ok', 0, ageH === null ? 'Pair age unknown' : 'Older than 24 hours');

  if (fdv && liq && fdv / liq > 50) add('FDV against liquidity', 'warn', 10, 'FDV is far above liquidity');
  else add('FDV against liquidity', 'ok', 0, 'FDV is reasonable for the liquidity');

  if (liq && vol / liq > 20) add('Volume', 'warn', 10, 'Volume is unusually high for the liquidity');
  else add('Volume', 'ok', 0, 'Volume looks normal for the liquidity');

  if (chain.holders == null) add('Holders', 'unknown', 0, 'Holder count unavailable');
  else if (chain.holders < 50) add('Holders', 'warn', 10, `Few holders (${chain.holders})`);
  else add('Holders', 'ok', 0, `${chain.holders.toLocaleString('en-US')} holders`);

  if (chain.verified === false) add('Contract', 'warn', 15, 'Contract not verified on the explorer');
  else add('Contract', chain.verified ? 'ok' : 'unknown', 0, chain.verified ? 'Verified on Blockscout' : 'Verification status unavailable');

  if (!(info.socials || []).length && !(info.websites || []).length) add('Website and socials', 'warn', 10, 'No website or socials listed');
  else add('Website and socials', 'ok', 0, 'Website or socials listed');

  let capped = false;
  if (chain.verified === null || chain.holders === null) { if (s > 90) { s = 90; } capped = true; }
  s = Math.max(0, Math.min(100, s));
  const verdict = s >= 75 ? 'Low risk' : s >= 50 ? 'Medium risk' : s >= 25 ? 'High risk' : 'Very high risk';
  const level = s >= 75 ? 'low' : s >= 50 ? 'medium' : s >= 25 ? 'high' : 'very-high';
  return { score: s, verdict, level, capped, checks };
}

export async function scan(address) {
  const a = address.toLowerCase();
  const [pairs, chain] = await Promise.all([pairsFor([a]), explorer(a)]);
  const p = pairs[a];
  if (!p) return null;
  const sc = score(p, chain);
  const bt = p.baseToken || {};
  return {
    token: { address: bt.address || address, name: bt.name || 'Unknown', symbol: bt.symbol || '?' },
    ...sc,
    market: {
      price: +(p.priceUsd || 0), liquidity: +(p.liquidity?.usd || 0), fdv: +(p.fdv || 0),
      volume24h: +(p.volume?.h24 || 0), buys24h: p.txns?.h24?.buys || 0, sells24h: p.txns?.h24?.sells || 0,
      change24h: p.priceChange?.h24 ?? null, pairCreatedAt: p.pairCreatedAt || null, dex: p.dexId || null,
      holders: chain.holders, verified: chain.verified,
    },
    links: {
      chart: p.url || `https://dexscreener.com/${CHAIN}/${a}`,
      explorer: `https://robinhoodchain.blockscout.com/token/${a}`,
      pons: a === ZYRO ? `https://ponsfamily.com/launchpad/${ZYRO}` : null,
    },
    scannedAt: new Date().toISOString(),
  };
}

export async function trending(limit = 8) {
  const [boosts, profiles] = await Promise.all([
    getJSON(`${DS}/token-boosts/top/v1`), getJSON(`${DS}/token-profiles/latest/v1`),
  ]);
  const list = [...(Array.isArray(boosts.data) ? boosts.data : []), ...(Array.isArray(profiles.data) ? profiles.data : [])]
    .filter(x => x.chainId === CHAIN).map(x => x.tokenAddress).filter(Boolean);
  const addrs = [...new Set(list.map(x => x.toLowerCase()))].slice(0, 20);
  if (!addrs.length) return [];
  const best = await pairsFor(addrs);
  return addrs.map(a => best[a]).filter(Boolean).slice(0, limit).map(p => ({
    address: p.baseToken.address, name: p.baseToken.name, symbol: p.baseToken.symbol,
    price: +(p.priceUsd || 0), liquidity: +(p.liquidity?.usd || 0), volume24h: +(p.volume?.h24 || 0),
    change24h: p.priceChange?.h24 ?? null,
  }));
}
