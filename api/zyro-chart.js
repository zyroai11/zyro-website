// $ZYRO chart data, read straight from the Pons bonding curve on Robinhood Chain.
export const config = { runtime: 'edge' };

const RPC = 'https://rpc.mainnet.chain.robinhood.com';
const TOKEN = '0x50e05d1ee5e545540190a1136667af06a496f6d2';
const CURVE = '0xd64a7a779883b2d955f0d925d859aff4914ff453';
const START = 0x6db6f46; // block the curve was created
const BUY = '0xec36bf571f136799e8dc0b0b8bea4b04d8bd3d43de838aab0d5fc21d4cbfc455';
const SELL = '0x8113d738abdcb6b38357e9d53a54a7157861a09031b453651f0fe7fe151f59df';
const SPAN = 9_000_000;

const hex = n => '0x' + n.toString(16);
const word = (d, i) => BigInt('0x' + d.slice(2 + i * 64, 2 + (i + 1) * 64));
const addr = t => '0x' + t.slice(26);

async function rpc(calls) {
  const body = calls.map((c, i) => ({ jsonrpc: '2.0', id: i, method: c[0], params: c[1] }));
  const r = await fetch(RPC, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const out = await r.json();
  const arr = Array.isArray(out) ? out : [out];
  const res = [];
  for (const x of arr) res[x.id] = x.error ? null : x.result;
  return res;
}

async function ethUsd() {
  try {
    const r = await fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot');
    const v = +(await r.json()).data.amount;
    if (v > 0) return v;
  } catch (_) {}
  try {
    const r = await fetch('https://api.dexscreener.com/tokens/v1/robinhood/0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73');
    const v = +((await r.json())[0] || {}).priceUsd;
    if (v > 0) return v;
  } catch (_) {}
  return null;
}

export default async function handler() {
  try {
    const [head, usd] = await Promise.all([
      rpc([['eth_blockNumber', []], ['eth_call', [{ to: TOKEN, data: '0x18160ddd' }, 'latest']], ['eth_getBlockByNumber', ['latest', false]]]),
      ethUsd(),
    ]);
    const latest = parseInt(head[0], 16);
    const supply = Number(BigInt(head[1] || '0x0')) / 1e18;
    const nowTs = parseInt(head[2]?.timestamp || '0x0', 16);

    // logs, in chunks the RPC accepts
    const ranges = [];
    for (let a = START; a <= latest; a += SPAN) ranges.push([a, Math.min(latest, a + SPAN - 1)]);
    const logRes = await rpc(ranges.map(([a, b]) => ['eth_getLogs', [{ address: CURVE, fromBlock: hex(a), toBlock: hex(b), topics: [[BUY, SELL]] }]]));
    const logs = logRes.flatMap(x => x || []);

    // block times: exact for up to 150 blocks, interpolated between them beyond that
    const blocks = [...new Set(logs.map(l => parseInt(l.blockNumber, 16)))].sort((a, b) => a - b);
    let sample = blocks;
    if (blocks.length > 150) {
      const step = (blocks.length - 1) / 149;
      sample = [...new Set(Array.from({ length: 150 }, (_, i) => blocks[Math.round(i * step)]))];
    }
    const ts = {};
    for (let i = 0; i < sample.length; i += 100) {
      const part = sample.slice(i, i + 100);
      const res = await rpc(part.map(b => ['eth_getBlockByNumber', [hex(b), false]]));
      part.forEach((b, j) => { if (res[j]) ts[b] = parseInt(res[j].timestamp, 16); });
    }
    const known = Object.keys(ts).map(Number).sort((a, b) => a - b);
    const timeOf = b => {
      if (ts[b]) return ts[b];
      let lo = known[0], hi = known[known.length - 1];
      for (const k of known) { if (k <= b) lo = k; if (k >= b) { hi = k; break; } }
      if (lo === hi || !ts[lo] || !ts[hi]) return ts[lo] || ts[hi] || nowTs;
      return Math.round(ts[lo] + (ts[hi] - ts[lo]) * (b - lo) / (hi - lo));
    };

    const trades = logs.map(l => {
      const buy = l.topics[0] === BUY;
      const tok = Number(word(l.data, buy ? 1 : 0)) / 1e18;
      const eth = Number(word(l.data, buy ? 0 : 1)) / 1e18;
      return {
        t: timeOf(parseInt(l.blockNumber, 16)), s: buy ? 'b' : 's', e: eth, q: tok,
        p: tok > 0 ? eth / tok : 0, w: addr(buy ? l.topics[2] : l.topics[1]), tx: l.transactionHash,
        i: parseInt(l.blockNumber, 16) * 1e4 + parseInt(l.logIndex, 16),
      };
    }).filter(x => x.p > 0).sort((a, b) => a.i - b.i).map(({ i, ...x }) => x);

    const last = trades[trades.length - 1];
    const dayAgo = nowTs - 86400;
    const day = trades.filter(x => x.t >= dayAgo);
    const before = [...trades].reverse().find(x => x.t < dayAgo) || trades[0];
    const priceEth = last ? last.p : 0;
    const stats = {
      priceEth, priceUsd: usd ? priceEth * usd : null,
      mcapUsd: usd ? priceEth * supply * usd : null,
      change24h: before && before.p ? (priceEth / before.p - 1) * 100 : null,
      volume24hEth: day.reduce((s, x) => s + x.e, 0),
      buys24h: day.filter(x => x.s === 'b').length, sells24h: day.filter(x => x.s === 's').length,
      trades: trades.length, supply,
    };
    return new Response(JSON.stringify({ token: TOKEN, curve: CURVE, ethUsd: usd, now: nowTs, stats, trades }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'public, s-maxage=15, stale-while-revalidate=30' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Chart data could not be loaded. Try again in a moment.' }), {
      status: 502, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  }
}
