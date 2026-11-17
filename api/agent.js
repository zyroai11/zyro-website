// Web agent: turns a message into an action (scan, trending) or a short answer about Zyro.
import { json, chainOf } from './_zyro.js';
const ADDR = /0x[a-fA-F0-9]{40}|\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/;

export const config = { runtime: 'edge' };

const FACTS = `Zyro is the AI agent for Solana, with Robinhood Chain support too. It scans any Solana token (mint address) or Robinhood Chain token (0x contract). $ZYRO is launching soon on Stonk.fun on Solana; there is no contract address yet, so anyone sharing one before the official launch post on X @ZyroxRH is not us.
On Solana the score also checks: mint authority still enabled (-25), freeze authority still enabled (-25), top 10 wallets over 50% (-20) or over 30% (-10), less than half the pool locked or burned (-10).
The safety score starts at 100 and loses points for: liquidity under $5K (-30) or under $25K (-15); more than 20 buys and zero sells (-30, possible honeypot);
sells more than 3x buys (-10); pair younger than 24h (-15); contract not verified (-15); FDV over 50x liquidity (-10); 24h volume over 20x liquidity (-10);
fewer than 50 holders (-10); no website or socials (-10). If holder or contract data is missing the score is capped at 90.
75-100 low risk, 50-74 medium, 25-49 high, 0-24 very high. AI analysis on the website is free for everyone until $ZYRO launches. Telegram bot: @ZyroAiAgent_bot.
Trade on the web at zyro-ai.xyz/trade (Robinhood Chain for now, Solana trading is coming next): buy any Robinhood Chain token or Robinhood Stock Tokens (NVDA, TSLA, AAPL and 200+ more, not offered in the US, UK, Canada and some other regions) from a wallet Zyro makes with Privy, with automatic take profit and stop loss checked every minute, and sell 25/50/75% or max. Perps through Lighter are being built next. Terminal agent for trading with your own rules: npm install -g zyro-agent. Website zyro-ai.xyz, X @ZyroxRH. Zyro never asks for seed phrases or private keys.`;

const SYSTEM = `You are Zyro, the agent on the Zyro website. Reply in English only, in one or two short sentences.
Turn the user's message into JSON with keys: action ("scan", "trending", "trade", "price", "help" or "none"), token (a Solana mint address or 0x address from the message, else null), symbol (a ticker the user named such as NVDA or TSLA, uppercase, without $, else null), reply (your short answer).
Use "scan" when they want a token checked and gave an address. Use "trending" for what is hot or trending.
Use "trade" when they want to buy, sell or trade a token or stock; set token or symbol. Use "price" when they ask the price of a token or stock; set token or symbol. Use "none" to answer questions from these facts:
${FACTS}
Never invent addresses, prices or scores. Never promise profits or tell people to buy. If they want to trade, point them to zyro-ai.xyz/trade, or the terminal agent for their own rules. Output only the JSON.`;

const NOT_TICKER = new Set(['I','A','AN','THE','TO','OF','ON','IN','IS','IT','MY','ME','FOR','AND','OR','WITH','SOME','HOW','WHAT','CAN','DO','BUY','SELL','TRADE','PRICE','ETH','USD','USDG','NOW','PLEASE','WANT','LIVE','STOCK','STOCKS','TOKEN','TOKENS','CHART']);
function ticker(msg) {
  const d = msg.match(/\$([A-Za-z][A-Za-z0-9.]{0,9})/);
  if (d) return d[1].toUpperCase();
  const words = msg.match(/\b[A-Za-z][A-Za-z0-9.]{0,9}\b/g) || [];
  for (const w of words) { const u = w.toUpperCase(); if (w === u && u.length >= 2 && !NOT_TICKER.has(u)) return u; }
  for (const w of words) { const u = w.toUpperCase(); if (u === 'ZYRO' || u === 'NVDA' || u === 'TSLA' || u === 'AAPL') return u; }
  return null;
}
function local(msg) {
  const low = msg.trim().toLowerCase();
  const addr = (msg.match(ADDR) || [])[0] || null;
  const sym = ticker(msg);
  const howTo = /\bhow (do|can|to)\b|\bwhere\b/.test(low);
  if (/zyro/.test(low) && !addr) return { action: 'none', token: null, reply: '$ZYRO is launching soon on Stonk.fun on Solana. No contract address yet: follow @ZyroxRH for the official launch post and ignore anyone sharing a CA before it.' };
  if (!howTo && /\b(buy|sell|trade|long|ape)\b/.test(low) && (addr || sym)) return { action: 'trade', token: addr, symbol: addr ? null : sym, reply: 'Here it is. Open it on the trade page to buy or sell, with a take profit and stop loss Zyro runs for you.' };
  if (/\bprice\b|how much is|worth/.test(low) && (addr || sym)) return { action: 'price', token: addr, symbol: addr ? null : sym, reply: 'Here is the live price.' };
  if (addr) return { action: 'scan', token: addr, reply: 'Scanning that token now.' };
  if (/trend|hot|popular/.test(low)) return { action: 'trending', token: null, reply: 'Here is what is getting attention on Solana.' };
  if (/score|calculat|rating/.test(low)) return { action: 'none', token: null, reply: 'Every token starts at 100. Points come off for low liquidity, zero sells, a pair under 24 hours old, an unverified contract, few holders, FDV or volume far above liquidity, and no socials. 75 and up is low risk, under 25 is very high risk.' };
  if (/trade|buy|sell|swap|stop.?loss|take.?profit|stock|nvda|tsla|aapl|perp/.test(low)) return { action: 'none', token: null, reply: 'Trade on the web at zyro-ai.xyz/trade: buy tokens or Stock Tokens and set a take profit and stop loss that Zyro runs for you 24/7. Prefer your own rules? npm install -g zyro-agent works from your terminal.' };
  if (/holder|tier|unlimited|100k|100,000/.test(low)) return { action: 'none', token: null, reply: 'Holder perks return when $ZYRO launches on Stonk.fun. Until then AI analysis on the website is free for everyone.' };
  if (/token|contract|\bca\b|stonk/.test(low)) return { action: 'none', token: null, reply: '$ZYRO is launching soon on Stonk.fun on Solana. Paste any Solana or Robinhood Chain token address here and I will scan it.' };
  if (/help|what can|how/.test(low) || low === '?') return { action: 'help', token: null, reply: 'Paste a Solana token address to scan it, or type "trending".' };
  return null;
}

export default async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405, 'no-store');
  let msg = '';
  try { msg = String((await req.json()).message || '').slice(0, 500); } catch (_) {}
  if (!msg.trim()) return json({ action: 'help', token: null, reply: 'Paste a Solana token address to scan it, or type "trending".' }, 200, 'no-store');

  const quick = local(msg);
  const key = (process.env.GEMINI_API_KEY || '').trim();
  if (quick && (!key || ['scan', 'trending', 'trade', 'price'].includes(quick.action))) return json(quick, 200, 'no-store');
  if (!key) return json({ action: 'help', token: null, reply: 'I can scan tokens and show what is trending. Paste a Solana token address to start.' }, 200, 'no-store');

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
    let action = ['scan', 'trending', 'trade', 'price', 'help', 'none'].includes(out.action) ? out.action : 'none';
    const token = chainOf(out.token) && msg.toLowerCase().includes(out.token.toLowerCase()) ? out.token : null;
    const symbol = !token && typeof out.symbol === 'string' && /^[A-Z][A-Z0-9.]{0,9}$/.test(out.symbol.replace('$', '').toUpperCase()) ? out.symbol.replace('$', '').toUpperCase() : null;
    if (action === 'scan' && !token) action = 'none';
    if ((action === 'trade' || action === 'price') && !token && !symbol) action = 'none';
    return json({ action, token, symbol, reply: String(out.reply || '').slice(0, 400) }, 200, 'no-store');
  } catch (e) {
    return json(quick || { action: 'help', token: null, reply: 'I could not reach the AI just now. Paste a contract address to scan it, or type "trending".' }, 200, 'no-store');
  }
}
