// Shared scanner logic for the web app. Same rules as the Telegram bot and the terminal agent.
export const CHAIN = 'robinhood';
export const CHAIN_ID = 4663;
export const ZYRO = '0x50e05d1ee5e545540190a1136667af06a496f6d2';
const DS = 'https://api.dexscreener.com';

export const json = (data, status = 200, cache = 'public, s-maxage=30, stale-while-revalidate=60') =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': cache } });

export const isAddr = a => typeof a === 'string' && /^0x[a-fA-F0-9]{40}$/.test(a);
export const isSol = a => typeof a === 'string' && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a);
export const chainOf = a => isSol(a) ? 'solana' : isAddr(a) ? 'robinhood' : null;
const keyOf = (a, chain) => chain === 'solana' ? a : a.toLowerCase();

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

export function bestPairs(list, chain = CHAIN) {
  const best = {};
  for (const p of list || []) {
    if (p.chainId !== chain) continue;
    const a = keyOf(p.baseToken?.address || '', chain);
    if (a && (!best[a] || +(p.liquidity?.usd || 0) > +(best[a].liquidity?.usd || 0))) best[a] = p;
  }
  return best;
}

export async function pairsFor(addrs, chain = CHAIN) {
  const r = await getJSON(`${DS}/tokens/v1/${chain}/${addrs.join(',')}`);
  return bestPairs(Array.isArray(r.data) ? r.data : [], chain);
}

// Solana on-chain facts from RugCheck: authorities, holder spread, LP lock.
export async function solFacts(mint) {
  const f = { holders: null, mintAuthority: null, freezeAuthority: null, top10: null, lpLocked: null, rugged: false };
  const r = await getJSON(`https://api.rugcheck.xyz/v1/tokens/${mint}/report`, 9000);
  const d = r.data;
  if (!d) return f;
  f.holders = d.totalHolders ?? null;
  f.mintAuthority = d.token ? !!d.token.mintAuthority : (d.mintAuthority !== undefined ? !!d.mintAuthority : null);
  f.freezeAuthority = d.token ? !!d.token.freezeAuthority : (d.freezeAuthority !== undefined ? !!d.freezeAuthority : null);
  if (Array.isArray(d.topHolders)) f.top10 = d.topHolders.filter(h => !h.insider || true).slice(0, 10).reduce((a, h) => a + (+h.pct || 0), 0);
  // Only classic AMM pools have LP tokens that can be locked or burned. Concentrated pools (Orca, CLMM, DLMM) do not, so skip them.
  const amm = (d.markets || []).filter(m => m?.lp && m.lp.lpLockedPct != null && !/clmm|whirlpool|dlmm|concentrated/i.test(m.marketType || ''));
  const m = amm.sort((a, b) => (+b.lp.lpLockedUSD || 0) + (+b.lp.lpUnlocked || 0) - ((+a.lp.lpLockedUSD || 0) + (+a.lp.lpUnlocked || 0)))[0];
  if (m && ((+m.lp.lpLockedUSD || 0) + (+m.lp.lpUnlocked || 0)) > 0) f.lpLocked = +m.lp.lpLockedPct;
  f.rugged = !!d.rugged;
  return f;
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

  if (chain.sol) {
    const f = chain.sol;
    if (f.rugged) add('Rug check', 'bad', 60, 'RugCheck flags this token as rugged');
    if (f.mintAuthority === true) add('Mint authority', 'bad', 25, 'The creator can still mint more tokens');
    else add('Mint authority', f.mintAuthority === false ? 'ok' : 'unknown', 0, f.mintAuthority === false ? 'Mint authority is revoked' : 'Mint authority unknown');
    if (f.freezeAuthority === true) add('Freeze authority', 'bad', 25, 'The creator can freeze wallets');
    else add('Freeze authority', f.freezeAuthority === false ? 'ok' : 'unknown', 0, f.freezeAuthority === false ? 'Freeze authority is revoked' : 'Freeze authority unknown');
    if (f.top10 == null) add('Top holders', 'unknown', 0, 'Holder spread unavailable');
    else if (f.top10 > 50) add('Top holders', 'bad', 20, `Top 10 wallets hold ${f.top10.toFixed(0)}% of supply`);
    else if (f.top10 > 30) add('Top holders', 'warn', 10, `Top 10 wallets hold ${f.top10.toFixed(0)}% of supply`);
    else add('Top holders', 'ok', 0, `Top 10 wallets hold ${f.top10.toFixed(0)}% of supply`);
    if (f.lpLocked != null) {
      if (f.lpLocked < 50) add('Liquidity lock', 'warn', 10, `Only ${f.lpLocked.toFixed(0)}% of the pool is locked or burned`);
      else add('Liquidity lock', 'ok', 0, `${f.lpLocked.toFixed(0)}% of the pool is locked or burned`);
    }
    if (f.holders != null) {
      if (f.holders < 50) add('Holders', 'warn', 10, `Few holders (${f.holders})`);
      else add('Holders', 'ok', 0, `${f.holders.toLocaleString('en-US')} holders`);
    }
  } else if (chain.holders == null) add('Holders', 'unknown', 0, 'Holder count unavailable');
  else if (chain.holders < 50) add('Holders', 'warn', 10, `Few holders (${chain.holders})`);
  else add('Holders', 'ok', 0, `${chain.holders.toLocaleString('en-US')} holders`);

  if (!chain.sol) {
    if (chain.verified === false) add('Contract', 'warn', 15, 'Contract not verified on the explorer');
    else add('Contract', chain.verified ? 'ok' : 'unknown', 0, chain.verified ? 'Verified on Blockscout' : 'Verification status unavailable');
  }

  if (!(info.socials || []).length && !(info.websites || []).length) add('Website and socials', 'warn', 10, 'No website or socials listed');
  else add('Website and socials', 'ok', 0, 'Website or socials listed');

  let capped = false;
  if (chain.sol ? (chain.sol.mintAuthority === null || chain.sol.freezeAuthority === null) : (chain.verified === null || chain.holders === null)) { if (s > 90) { s = 90; } capped = true; }
  s = Math.max(0, Math.min(100, s));
  const verdict = s >= 75 ? 'Low risk' : s >= 50 ? 'Medium risk' : s >= 25 ? 'High risk' : 'Very high risk';
  const level = s >= 75 ? 'low' : s >= 50 ? 'medium' : s >= 25 ? 'high' : 'very-high';
  return { score: s, verdict, level, capped, checks };
}

export async function scan(address) {
  const ch = chainOf(address);
  if (ch === 'solana') return scanSol(address);
  const a = address.toLowerCase();
  const [pairs, chain] = await Promise.all([pairsFor([a]), explorer(a)]);
  const p = pairs[a];
  if (!p) return null;
  return report(p, chain, 'robinhood', address, {
    chart: p.url || `https://dexscreener.com/${CHAIN}/${a}`,
    explorer: `https://robinhoodchain.blockscout.com/token/${a}`,
  });
}

async function scanSol(mint) {
  const [pairs, sol] = await Promise.all([pairsFor([mint], 'solana'), solFacts(mint)]);
  const p = pairs[mint];
  if (!p) return null;
  // LP lock only means something when the main pool is a classic AMM with LP tokens.
  const amm = ['raydium', 'pumpswap'].includes(p.dexId) && !(p.labels || []).some(l => /clmm/i.test(l));
  if (!amm) sol.lpLocked = null;
  return report(p, { sol, holders: sol.holders, verified: null }, 'solana', mint, {
    chart: p.url || `https://dexscreener.com/solana/${mint}`,
    explorer: `https://solscan.io/token/${mint}`,
    rugcheck: `https://rugcheck.xyz/tokens/${mint}`,
  });
}

function report(p, chain, chainId, address, links) {
  const sc = score(p, chain);
  const bt = p.baseToken || {};
  return {
    chain: chainId,
    token: { address: bt.address || address, name: bt.name || 'Unknown', symbol: bt.symbol || '?' },
    ...sc,
    market: {
      price: +(p.priceUsd || 0), liquidity: +(p.liquidity?.usd || 0), fdv: +(p.fdv || 0),
      volume24h: +(p.volume?.h24 || 0), buys24h: p.txns?.h24?.buys || 0, sells24h: p.txns?.h24?.sells || 0,
      change24h: p.priceChange?.h24 ?? null, pairCreatedAt: p.pairCreatedAt || null, dex: p.dexId || null,
      holders: chain.holders ?? null, verified: chain.verified ?? null,
    },
    links,
    scannedAt: new Date().toISOString(),
  };
}

export async function trending(limit = 8, chain = 'solana') {
  const [boosts, profiles] = await Promise.all([
    getJSON(`${DS}/token-boosts/top/v1`), getJSON(`${DS}/token-profiles/latest/v1`),
  ]);
  const list = [...(Array.isArray(boosts.data) ? boosts.data : []), ...(Array.isArray(profiles.data) ? profiles.data : [])]
    .filter(x => x.chainId === chain).map(x => x.tokenAddress).filter(Boolean);
  const addrs = [...new Set(list.map(x => keyOf(x, chain)))].slice(0, 20);
  if (!addrs.length) return [];
  const best = await pairsFor(addrs, chain);
  return addrs.map(a => best[a]).filter(Boolean).slice(0, limit).map(p => ({
    chain, address: p.baseToken.address, name: p.baseToken.name, symbol: p.baseToken.symbol,
    price: +(p.priceUsd || 0), liquidity: +(p.liquidity?.usd || 0), volume24h: +(p.volume?.h24 || 0),
    change24h: p.priceChange?.h24 ?? null,
  }));
}
