// Holder access on the web: read a wallet's $ZYRO balance (GET) and write the AI analysis for holders (POST).
import { json, isAddr, scan, ZYRO } from './_zyro.js';

export const config = { runtime: 'edge' };

const RPC = 'https://rpc.mainnet.chain.robinhood.com';
const MIN = +(process.env.HOLDER_MIN_BALANCE || 100000);

async function balanceOf(wallet) {
  const data = '0x70a08231' + wallet.slice(2).toLowerCase().padStart(64, '0');
  const r = await fetch(RPC, { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to: ZYRO, data }, 'latest'] }) });
  const out = await r.json();
  if (!out.result || out.result === '0x') throw new Error('rpc');
  return Number(BigInt(out.result) / 10n ** 12n) / 1e6;
}

export default async function handler(req) {
  try {
    if (req.method === 'GET') {
      const wallet = new URL(req.url).searchParams.get('wallet') || '';
      if (!isAddr(wallet)) return json({ error: 'That is not a wallet address. It starts with 0x and has 42 characters.' }, 400, 'no-store');
      const balance = await balanceOf(wallet);
      return json({ wallet, balance, holder: balance >= MIN, min: MIN }, 200, 'no-store');
    }
    if (req.method !== 'POST') return json({ error: 'Use GET or POST' }, 405, 'no-store');
    let b = {};
    try { b = await req.json(); } catch (_) {}
    if (!isAddr(b.address) || !isAddr(b.wallet)) return json({ error: 'A token contract and a linked wallet are both needed.' }, 400, 'no-store');
    const balance = await balanceOf(b.wallet);
    if (balance < MIN) return json({ error: `AI analysis is for holders. This wallet has ${Math.floor(balance).toLocaleString('en-US')} $ZYRO and needs ${MIN.toLocaleString('en-US')}.` }, 403, 'no-store');
    const key = (process.env.GEMINI_API_KEY || '').trim();
    if (!key) return json({ error: 'AI analysis is not switched on for the web app yet. It is available in the Telegram bot.' }, 503, 'no-store');
    const d = await scan(b.address);
    if (!d) return json({ error: 'No trading pair found for this token, so there is nothing to analyse yet.' }, 404, 'no-store');
    const facts = { token: d.token, score: d.score, verdict: d.verdict, market: d.market, checks: d.checks.map(k => ({ name: k.name, status: k.status, detail: k.detail, points: k.points })) };
    const model = (process.env.GEMINI_MODEL || 'gemini-3.8-flash').trim();
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: 'You are Zyro, a token risk analyst for Robinhood Chain. Using only the facts in the JSON you are given, return JSON with three keys: read (the overall read), risk (the biggest risk), watch (what to watch next). One or two plain English sentences each. Never invent numbers, never promise profits, never tell the reader to buy or sell.' }] },
        contents: [{ role: 'user', parts: [{ text: JSON.stringify(facts) }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
      }),
    });
    const out = JSON.parse((await r.json()).candidates[0].content.parts[0].text);
    const cut = s => String(s || '').slice(0, 400);
    return json({ read: cut(out.read), risk: cut(out.risk), watch: cut(out.watch) }, 200, 'no-store');
  } catch (e) {
    return json({ error: 'That could not be loaded right now. Try again in a moment.' }, 502, 'no-store');
  }
}
