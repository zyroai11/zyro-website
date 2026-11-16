// Web agent: turns a message into an action (scan, trending) or a short answer about Zyro.
import { json, isAddr } from './_zyro.js';

export const config = { runtime: 'edge' };

const FACTS = `Zyro is the AI agent for Robinhood Chain (chain ID 4663). $ZYRO is live on Pons, contract 0x50e05d1ee5e545540190a1136667af06a496f6d2.
The safety score starts at 100 and loses points for: liquidity under $5K (-30) or under $25K (-15); more than 20 buys and zero sells (-30, possible honeypot);
sells more than 3x buys (-10); pair younger than 24h (-15); contract not verified (-15); FDV over 50x liquidity (-10); 24h volume over 20x liquidity (-10);
fewer than 50 holders (-10); no website or socials (-10). If holder or contract data is missing the score is capped at 90.
75-100 low risk, 50-74 medium, 25-49 high, 0-24 very high. Telegram bot: @ZyroAiAgent_bot, 3 free scans a day; holders of 100,000 $ZYRO get unlimited scans and AI analysis.
Trade on the web at zyro-ai.xyz/trade: buy $ZYRO, any Robinhood Chain token or Robinhood Stock Tokens (NVDA, TSLA, AAPL and 200+ more, not offered in the US, UK, Canada and some other regions) from a wallet Zyro makes with Privy, with automatic take profit and stop loss checked every minute, and sell 25/50/75% or max. Perps through Lighter are being built next. Terminal agent for trading with your own rules: npm install -g zyro-agent. Website zyro-ai.xyz, X @ZyroxRH. Zyro never asks for seed phrases or private keys.`;

const SYSTEM = `You are Zyro, the agent on the Zyro website. Reply in English only, in one or two short sentences.
Turn the user's message into JSON with keys: action ("scan", "trending", "help" or "none"), token (a 0x address from the message, else null), reply (your short answer).
Use "scan" when they want a token checked and gave an address. Use "trending" for what is hot or trending. Use "none" to answer questions from these facts:
${FACTS}
Never invent addresses, prices or scores. Never promise profits or tell people to buy. If they want to trade, point them to zyro-ai.xyz/trade, or the terminal agent for their own rules. Output only the JSON.`;

function local(msg) {
  const low = msg.trim().toLowerCase();
  const addr = (msg.match(/0x[a-fA-F0-9]{40}/) || [])[0] || null;
  if (addr) return { action: 'scan', token: addr, reply: 'Scanning that token now.' };
  if (/trend|hot|popular/.test(low)) return { action: 'trending', token: null, reply: 'Here is what is getting attention on Robinhood Chain.' };
  if (/score|calculat|rating/.test(low)) return { action: 'none', token: null, reply: 'Every token starts at 100. Points come off for low liquidity, zero sells, a pair under 24 hours old, an unverified contract, few holders, FDV or volume far above liquidity, and no socials. 75 and up is low risk, under 25 is very high risk.' };
  if (/trade|buy|sell|swap|stop.?loss|take.?profit|stock|nvda|tsla|aapl|perp/.test(low)) return { action: 'none', token: null, reply: 'Trade on the web at zyro-ai.xyz/trade: buy tokens or Stock Tokens and set a take profit and stop loss that Zyro runs for you 24/7. Prefer your own rules? npm install -g zyro-agent works from your terminal.' };
  if (/holder|tier|unlimited|100k|100,000/.test(low)) return { action: 'none', token: null, reply: 'Hold 100,000 $ZYRO and link your wallet in @ZyroAiAgent_bot with /link to get unlimited scans and AI analysis. Free users get 3 scans a day.' };
  if (/zyro|token|contract|\bca\b|pons/.test(low)) return { action: 'none', token: null, reply: '$ZYRO is live on Pons. Contract: 0x50e05d1ee5e545540190a1136667af06a496f6d2. Paste it here to scan it.' };
  if (/help|what can|how/.test(low) || low === '?') return { action: 'help', token: null, reply: 'Paste a contract address to scan it, or type "trending".' };
  return null;
}

export default async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405, 'no-store');
  let msg = '';
  try { msg = String((await req.json()).message || '').slice(0, 500); } catch (_) {}
  if (!msg.trim()) return json({ action: 'help', token: null, reply: 'Paste a contract address to scan it, or type "trending".' }, 200, 'no-store');

  const quick = local(msg);
  const key = (process.env.GEMINI_API_KEY || '').trim();
  if (quick && (!key || quick.action === 'scan' || quick.action === 'trending')) return json(quick, 200, 'no-store');
  if (!key) return json({ action: 'help', token: null, reply: 'I can scan tokens and show what is trending. Paste a 0x contract address to start.' }, 200, 'no-store');

  const model = (process.env.GEMINI_MODEL || 'gemini-3.8-flash').trim();
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: 'user', parts: [{ text: msg }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      }),
    });
    const data = await r.json();
    const out = JSON.parse(data.candidates[0].content.parts[0].text);
    const action = ['scan', 'trending', 'help', 'none'].includes(out.action) ? out.action : 'none';
    const token = isAddr(out.token) && msg.toLowerCase().includes(out.token.toLowerCase()) ? out.token : null;
    return json({ action: action === 'scan' && !token ? 'none' : action, token, reply: String(out.reply || '').slice(0, 400) }, 200, 'no-store');
  } catch (e) {
    return json(quick || { action: 'help', token: null, reply: 'I could not reach the AI just now. Paste a contract address to scan it, or type "trending".' }, 200, 'no-store');
  }
}
