// Zyro auto-trade API. One endpoint, several actions (keeps us inside the Vercel function limit).
//   GET  /api/trade?action=config
//   GET  /api/trade?action=me                     (auth)
//   POST /api/trade?action=buy     {token, eth, tp, sl}   (auth)
//   POST /api/trade?action=sell    {id, percent}           (auth)
//   POST /api/trade?action=update  {id, tp, sl}            (auth)
//   GET  /api/trade?action=tick&key=TICK_SECRET            (TP/SL checker, called every minute)
import crypto from 'node:crypto';
import * as T from './_trade.js';

export const config = { maxDuration: 60 };

const json = (res, status, body) => { res.statusCode = status; res.setHeader('content-type', 'application/json'); res.setHeader('cache-control', 'no-store'); res.end(JSON.stringify(body)); };
const num = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : d; };

async function loadAccount(did) {
  const user = await T.getPrivyUser(did);
  const { embedded, external } = T.walletsOf(user);
  if (!embedded) throw new T.HttpError(409, 'Your Zyro wallet is still being created. Refresh the page in a moment.');
  return { user, embedded, external };
}

async function holderBalance(addresses) {
  let best = 0;
  for (const a of addresses) {
    try { best = Math.max(best, T.fromWei(await T.tokenBalance(T.ZYRO, a))); } catch {}
  }
  return best;
}

function needTrading(acc) {
  if (!acc.embedded.delegated) throw new T.HttpError(409, 'Turn on auto-trade first, so Zyro can trade from your wallet.');
}

// ------------------------------------------------------------------ actions
async function me(did) {
  const acc = await loadAccount(did);
  const addr = acc.embedded.address;
  const [eth, zyro, positions] = await Promise.all([
    T.ethBalance(addr).then(T.fromWei).catch(() => null),
    holderBalance([addr, ...acc.external]),
    T.userPositions(did),
  ]);
  const open = positions.filter(p => p.status === 'open');
  const prices = open.length ? await T.pricesEth(open.map(p => p.token)).catch(() => ({})) : {};
  for (const p of positions) {
    const pr = prices[p.token.toLowerCase()];
    if (pr) { p.priceEth = pr.eth; p.priceUsd = pr.usd; p.pnlPct = p.entry ? (pr.eth / p.entry - 1) * 100 : null; }
  }
  return { wallet: addr, delegated: !!acc.embedded.delegated, external: acc.external, eth, zyro,
    holder: zyro >= T.HOLDER_MIN, holderMin: T.HOLDER_MIN, maxEth: T.MAX_ETH, positions };
}

async function buy(did, body) {
  const token = String(body.token || '').trim();
  const eth = num(body.eth, 0), tp = Math.max(0, num(body.tp, 0)), sl = Math.min(95, Math.max(0, num(body.sl, 0)));
  if (!T.isAddr(token)) throw new T.HttpError(400, 'Paste a token contract address (0x…).');
  if (token.toLowerCase() === T.WETH) throw new T.HttpError(400, 'That is WETH. Pick a token to buy.');
  if (!(eth > 0)) throw new T.HttpError(400, 'Enter how much ETH to spend.');
  if (eth > T.MAX_ETH) throw new T.HttpError(400, `The limit during the beta is ${T.MAX_ETH} ETH per trade.`);

  const acc = await loadAccount(did);
  needTrading(acc);
  const addr = acc.embedded.address, wid = acc.embedded.id;
  const zyro = await holderBalance([addr, ...acc.external]);
  if (zyro < T.HOLDER_MIN) throw new T.HttpError(403, `Auto-trade is for holders of ${T.HOLDER_MIN.toLocaleString('en-US')}+ $ZYRO during the beta.`);

  const bal = T.fromWei(await T.ethBalance(addr));
  if (bal < eth + T.GAS_RESERVE) throw new T.HttpError(400, `Not enough ETH. Your Zyro wallet has ${bal.toFixed(5)} ETH and needs ${(eth + T.GAS_RESERVE).toFixed(5)} (the trade plus gas).`);

  if (!(await T.lock(`user:${did}`, 90))) throw new T.HttpError(429, 'Another trade is still running. Wait a few seconds.');
  try {
    const wei = T.toWei(eth);
    let q;
    try { q = await T.quote(T.NATIVE, token, wei, addr); }
    catch (e) {
      if (e instanceof T.NoRoute) throw new T.HttpError(400, 'Uniswap has no route for this token. If it is still on the Pons bonding curve, it can be traded here after it graduates.');
      throw e;
    }
    const [decimals, before] = await Promise.all([T.tokenDecimals(token), T.tokenBalance(token, addr)]);
    const tx = await T.swapTx(q);
    const hash = await T.sendTx(wid, tx);
    const rc = await T.waitReceipt(hash);
    if (!rc) throw new T.HttpError(504, `The buy was sent but is not confirmed yet. Check it on the explorer: ${hash}`);
    if (rc.status !== '0x1') throw new T.HttpError(400, `The buy failed on-chain (price moved or not enough gas). Tx: ${hash}`);
    const after = await T.tokenBalance(token, addr);
    let got = after - before;
    if (got <= 0n) got = BigInt(q.quote?.output?.amount || 0);
    const tokens = Number(got) / 10 ** decimals;
    const prices = await T.pricesEth([token]).catch(() => ({}));
    const pos = {
      id: crypto.randomBytes(6).toString('hex'), user: did, wallet: addr, walletId: wid, token, decimals,
      symbol: prices[token.toLowerCase()]?.symbol || q.quote?.output?.token?.symbol || '',
      ethIn: eth, tokens: got.toString(), tokensHuman: tokens, entry: tokens > 0 ? eth / tokens : 0,
      tp, sl, status: 'open', buyTx: hash, createdAt: Date.now(), sells: [], ethOut: 0,
    };
    await T.savePos(pos);
    return { ok: true, position: pos };
  } finally { await T.unlock(`user:${did}`); }
}

export async function sellPosition(pos, percent, reason) {
  const pct = Math.min(100, Math.max(1, percent));
  const addr = pos.wallet, wid = pos.walletId;
  const held = await T.tokenBalance(pos.token, addr);
  let amount = BigInt(pos.tokens) * BigInt(Math.round(pct * 100)) / 10000n;
  if (pct >= 100 || amount > held) amount = held < BigInt(pos.tokens) ? held : BigInt(pos.tokens);
  if (amount <= 0n) {
    pos.status = 'closed'; pos.closeReason = 'No tokens left in the wallet'; pos.closedAt = Date.now();
    await T.savePos(pos); return pos;
  }
  const appr = await T.approvalTx(pos.token, amount, addr);
  if (appr) {
    const h = await T.sendTx(wid, appr);
    const rc = await T.waitReceipt(h);
    if (!rc || rc.status !== '0x1') throw new T.HttpError(400, `Token approval did not go through. Tx: ${h}`);
  }
  let q;
  try { q = await T.quote(pos.token, T.NATIVE, amount, addr); }
  catch (e) { if (e instanceof T.NoRoute) throw new T.HttpError(400, 'Uniswap has no route to sell this token right now.'); throw e; }
  const sig = q.permitData ? await T.signTyped(wid, q.permitData) : undefined;
  const tx = await T.swapTx(q, sig);
  const hash = await T.sendTx(wid, tx);
  const rc = await T.waitReceipt(hash);
  if (!rc) throw new T.HttpError(504, `The sell was sent but is not confirmed yet: ${hash}`);
  if (rc.status !== '0x1') throw new T.HttpError(400, `The sell failed on-chain. Tx: ${hash}`);
  const ethOut = T.fromWei(q.quote?.output?.amount || 0);
  const left = BigInt(pos.tokens) - amount;
  pos.tokens = (left > 0n ? left : 0n).toString();
  pos.tokensHuman = Number(pos.tokens) / 10 ** pos.decimals;
  pos.ethOut = (pos.ethOut || 0) + ethOut;
  pos.sells.push({ t: Date.now(), pct, ethOut, tx: hash, reason });
  if (pct >= 100 || left <= 0n) { pos.status = 'closed'; pos.closeReason = reason; pos.closedAt = Date.now(); }
  await T.savePos(pos);
  return pos;
}

async function sell(did, body) {
  const pos = await T.getPos(String(body.id || ''));
  if (!pos || pos.user !== did) throw new T.HttpError(404, 'Position not found.');
  if (pos.status !== 'open') throw new T.HttpError(400, 'This position is already closed.');
  const acc = await loadAccount(did);
  needTrading(acc);
  if (!(await T.lock(`pos:${pos.id}`, 90))) throw new T.HttpError(429, 'This position is already being sold.');
  try { return { ok: true, position: await sellPosition(pos, num(body.percent, 100), 'manual') }; }
  finally { await T.unlock(`pos:${pos.id}`); }
}

async function update(did, body) {
  const pos = await T.getPos(String(body.id || ''));
  if (!pos || pos.user !== did) throw new T.HttpError(404, 'Position not found.');
  if (body.tp !== undefined) pos.tp = Math.max(0, num(body.tp, pos.tp));
  if (body.sl !== undefined) pos.sl = Math.min(95, Math.max(0, num(body.sl, pos.sl)));
  await T.savePos(pos);
  return { ok: true, position: pos };
}

async function tick(req) {
  const key = (process.env.TICK_SECRET || '').trim();
  const given = String(req.query.key || req.headers['x-tick-key'] || (req.headers.authorization || '').replace(/^Bearer /, ''));
  if (!key || given !== key) throw new T.HttpError(401, 'Bad key.');
  const started = Date.now();
  const ids = await T.redis('SMEMBERS', 'open') || [];
  if (!ids.length) return { checked: 0, sold: [] };
  const vals = await T.redis('MGET', ...ids.map(i => `pos:${i}`));
  const open = vals.filter(Boolean).map(v => JSON.parse(v)).filter(p => p.status === 'open');
  const prices = await T.pricesEth(open.map(p => p.token));
  const sold = [], errors = [];
  for (const p of open) {
    if (Date.now() - started > 45000) break;
    const pr = prices[p.token.toLowerCase()];
    if (!pr || !p.entry) continue;
    const ratio = pr.eth / p.entry;
    let reason = null;
    if (p.tp > 0 && ratio >= 1 + p.tp / 100) reason = 'take profit';
    else if (p.sl > 0 && ratio <= 1 - p.sl / 100) reason = 'stop loss';
    if (!reason) continue;
    if (!(await T.lock(`pos:${p.id}`, 90))) continue;
    try { await sellPosition(p, 100, reason); sold.push({ id: p.id, reason }); }
    catch (e) {
      errors.push({ id: p.id, error: e.message });
      p.lastError = `${reason} sell failed: ${e.message}`.slice(0, 200); p.lastErrorAt = Date.now();
      await T.savePos(p).catch(() => {});
    } finally { await T.unlock(`pos:${p.id}`); }
  }
  return { checked: open.length, sold, errors };
}

export default async function handler(req, res) {
  const action = String(req.query.action || '');
  try {
    if (action === 'config') return json(res, 200, { ...T.publicConfig(), ready: T.missingConfig().length === 0 });
    const missing = T.missingConfig();
    if (missing.length) return json(res, 503, { error: 'Auto-trade is not set up yet.', missing });
    if (action === 'tick') return json(res, 200, await tick(req));
    const did = await T.verifyUser(req);
    if (action === 'me' && req.method === 'GET') return json(res, 200, await me(did));
    if (req.method !== 'POST') return json(res, 405, { error: 'Use POST.' });
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (action === 'buy') return json(res, 200, await buy(did, body));
    if (action === 'sell') return json(res, 200, await sell(did, body));
    if (action === 'update') return json(res, 200, await update(did, body));
    return json(res, 404, { error: 'Unknown action.' });
  } catch (e) {
    const status = e.status || 500;
    if (status >= 500) console.error('trade error', action, e);
    return json(res, status, { error: status >= 500 && !e.status ? 'Something went wrong. Try again.' : e.message });
  }
}
