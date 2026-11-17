// AI analysis on the web. Free for everyone until $ZYRO launches on Solana; holder access returns then.
import { json, chainOf, scan } from './_zyro.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    if (req.method === 'GET') return json({ error: 'Holder access returns when $ZYRO launches on StonkFun. AI analysis is free for everyone until then.' }, 200, 'no-store');
    if (req.method !== 'POST') return json({ error: 'Use POST' }, 405, 'no-store');
    let b = {};
    try { b = await req.json(); } catch (_) {}
    if (!chainOf(b.address)) return json({ error: 'A token address is needed.' }, 400, 'no-store');
    const key = (process.env.GEMINI_API_KEY || '').trim();
    if (!key) return json({ error: 'AI analysis is not switched on for the web app yet. It is available in the Telegram bot.' }, 503, 'no-store');
    const d = await scan(b.address);
    if (!d) return json({ error: 'No trading pair found for this token, so there is nothing to analyse yet.' }, 404, 'no-store');
    const facts = { token: d.token, score: d.score, verdict: d.verdict, market: d.market, checks: d.checks.map(k => ({ name: k.name, status: k.status, detail: k.detail, points: k.points })) };
    const model = (process.env.GEMINI_MODEL || 'gemini-3.8-flash').trim();
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: 'You are Zyro, a token risk analyst for Solana and Robinhood Chain. Using only the facts in the JSON you are given, return JSON with three keys: read (the overall read), risk (the biggest risk), watch (what to watch next). One or two plain English sentences each. Never invent numbers, never promise profits, never tell the reader to buy or sell.' }] },
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
