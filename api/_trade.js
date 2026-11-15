// Shared helpers for Zyro auto-trade: Privy auth + server signing, Uniswap Trading API, Upstash Redis.
import crypto from 'node:crypto';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export const CHAIN_ID = 4663;
export const CAIP2 = `eip155:${CHAIN_ID}`;
export const RPC = 'https://rpc.mainnet.chain.robinhood.com';
export const NATIVE = '0x0000000000000000000000000000000000000000';
export const WETH = '0x0bd7d308f8e1639fab988df18a8011f41eacad73';
export const ZYRO = '0x50e05d1ee5e545540190a1136667af06a496f6d2';
export const HOLDER_MIN = Number(process.env.HOLDER_MIN_BALANCE || 100000);
export const MAX_ETH = Number(process.env.TRADE_MAX_ETH || 0.05);
export const GAS_RESERVE = 0.0003; // ETH kept back for the sell later
export const SLIPPAGE = Number(process.env.TRADE_SLIPPAGE_PCT || 5);

const APP_ID = (process.env.PRIVY_APP_ID || '').trim();
const APP_SECRET = (process.env.PRIVY_APP_SECRET || '').trim();
const AUTH_KEY = (process.env.PRIVY_AUTH_KEY || '').trim();
export const SIGNER_ID = (process.env.PRIVY_SIGNER_ID || '').trim();
const UNI_KEY = (process.env.UNISWAP_API_KEY || '').trim();
const REDIS_URL = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').trim().replace(/\/$/, '');
const REDIS_TOKEN = (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '').trim();

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function missingConfig() {
  const need = { PRIVY_APP_ID: APP_ID, PRIVY_APP_SECRET: APP_SECRET, PRIVY_AUTH_KEY: AUTH_KEY, PRIVY_SIGNER_ID: SIGNER_ID,
    UNISWAP_API_KEY: UNI_KEY, UPSTASH_REDIS_REST_URL: REDIS_URL, UPSTASH_REDIS_REST_TOKEN: REDIS_TOKEN };
  return Object.entries(need).filter(([, v]) => !v).map(([k]) => k);
}
export const publicConfig = () => ({ appId: APP_ID, signerId: SIGNER_ID, chainId: CHAIN_ID, maxEth: MAX_ETH, holderMin: HOLDER_MIN });

// ---------------------------------------------------------------- small utils
export const hex = n => '0x' + BigInt(n).toString(16);
export const toWei = eth => BigInt(Math.round(eth * 1e9)) * 10n ** 9n;
export const fromWei = (w, dec = 18) => Number(BigInt(w)) / 10 ** dec;
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const isAddr = a => /^0x[a-fA-F0-9]{40}$/.test(a || '');

async function fetchJson(url, opts = {}, timeoutMs = 15000) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { ...opts, signal: ctl.signal });
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 300) }; }
    return { status: r.status, ok: r.ok, data };
  } finally { clearTimeout(t); }
}

// ---------------------------------------------------------------- chain RPC
export async function rpc(method, params) {
  const { data } = await fetchJson(RPC, { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
  if (data.error) throw new Error(`rpc ${method}: ${data.error.message}`);
  return data.result;
}
export const ethBalance = async a => BigInt(await rpc('eth_getBalance', [a, 'latest']));
export async function tokenBalance(token, owner) {
  const r = await rpc('eth_call', [{ to: token, data: '0x70a08231' + owner.toLowerCase().replace('0x', '').padStart(64, '0') }, 'latest']);
  return BigInt(r && r !== '0x' ? r : '0x0');
}
export async function tokenDecimals(token) {
  try { const r = await rpc('eth_call', [{ to: token, data: '0x313ce567' }, 'latest']); return r && r !== '0x' ? Number(BigInt(r)) : 18; }
  catch { return 18; }
}
export async function waitReceipt(hash, ms = 40000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const r = await rpc('eth_getTransactionReceipt', [hash]).catch(() => null);
    if (r) return r;
    await sleep(700);
  }
  return null;
}

// ---------------------------------------------------------------- Privy
const JWKS = APP_ID ? createRemoteJWKSet(new URL(`https://auth.privy.io/api/v1/apps/${APP_ID}/jwks.json`)) : null;

export async function verifyUser(req) {
  const h = req.headers.authorization || req.headers.Authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) throw new HttpError(401, 'Log in first.');
  try {
    const { payload } = await jwtVerify(token, JWKS, { issuer: 'privy.io', audience: APP_ID });
    return payload.sub;
  } catch {
    throw new HttpError(401, 'Your session expired. Log in again.');
  }
}

const basic = () => 'Basic ' + Buffer.from(`${APP_ID}:${APP_SECRET}`).toString('base64');

export async function getPrivyUser(did) {
  const { ok, status, data } = await fetchJson(`https://auth.privy.io/api/v1/users/${encodeURIComponent(did)}`,
    { headers: { authorization: basic(), 'privy-app-id': APP_ID } });
  if (!ok) throw new HttpError(502, `Privy user lookup failed (${status}).`);
  return data;
}

export function walletsOf(user) {
  const acc = user.linked_accounts || [];
  const embedded = acc.find(a => a.type === 'wallet' && a.wallet_client_type === 'privy' && (a.chain_type || 'ethereum') === 'ethereum');
  const external = acc.filter(a => a.type === 'wallet' && a.wallet_client_type !== 'privy' && (a.chain_type || 'ethereum') === 'ethereum').map(a => a.address);
  return { embedded, external };
}

function canonical(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  return '{' + Object.keys(v).filter(k => v[k] !== undefined).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
}

let _key;
function authKey() {
  if (!_key) {
    const b64 = AUTH_KEY.replace(/^wallet-auth:/, '').replace(/\s+/g, '');
    _key = crypto.createPrivateKey({ key: Buffer.from(b64, 'base64'), format: 'der', type: 'pkcs8' });
  }
  return _key;
}

export async function walletRpc(walletId, body) {
  const url = `https://api.privy.io/v1/wallets/${walletId}/rpc`;
  const payload = { version: 1, method: 'POST', url, body, headers: { 'privy-app-id': APP_ID } };
  const sig = crypto.sign('sha256', Buffer.from(canonical(payload)), authKey()).toString('base64');
  const { ok, status, data } = await fetchJson(url, {
    method: 'POST',
    headers: { authorization: basic(), 'privy-app-id': APP_ID, 'privy-authorization-signature': sig, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }, 30000);
  if (!ok) {
    const msg = data?.error || data?.message || JSON.stringify(data).slice(0, 200);
    throw new HttpError(status === 401 || status === 403 ? 403 : 502, `Privy refused the request: ${msg}`);
  }
  return data.data;
}

export async function sendTx(walletId, tx) {
  const transaction = { to: tx.to, data: tx.data || '0x', value: hex(tx.value || 0), chain_id: CHAIN_ID };
  if (tx.gasLimit) transaction.gas_limit = hex(tx.gasLimit);
  const d = await walletRpc(walletId, { method: 'eth_sendTransaction', caip2: CAIP2, chain_type: 'ethereum', params: { transaction } });
  return d.hash;
}

export async function signTyped(walletId, permit) {
  const types = Object.fromEntries(Object.entries(permit.types).filter(([k]) => k !== 'EIP712Domain'));
  const used = new Set(Object.values(types).flat().map(f => f.type));
  const primary = Object.keys(types).find(k => !used.has(k));
  const d = await walletRpc(walletId, { method: 'eth_signTypedData_v4', chain_type: 'ethereum',
    params: { typed_data: { domain: permit.domain, types, message: permit.values, primary_type: primary } } });
  return d.signature;
}

// ---------------------------------------------------------------- Uniswap Trading API
const UNI = 'https://trade-api.gateway.uniswap.org/v1';
export class NoRoute extends Error {}
async function uni(path, body) {
  const { ok, status, data } = await fetchJson(UNI + path, { method: 'POST',
    headers: { 'x-api-key': UNI_KEY, 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(body) }, 20000);
  if (!ok) {
    const detail = String(data?.detail || data?.errorCode || JSON.stringify(data));
    if (status === 404 || /no quote|noroute|no quotes/i.test(detail)) throw new NoRoute(detail);
    throw new HttpError(502, `Uniswap ${status}: ${detail.slice(0, 160)}`);
  }
  return data;
}
export const quote = (tokenIn, tokenOut, amount, swapper) => uni('/quote', {
  type: 'EXACT_INPUT', amount: String(amount), tokenInChainId: CHAIN_ID, tokenOutChainId: CHAIN_ID,
  tokenIn, tokenOut, swapper, slippageTolerance: SLIPPAGE, routingPreference: 'BEST_PRICE', protocols: ['V2', 'V3', 'V4'],
});
export const approvalTx = async (token, amount, wallet) =>
  (await uni('/check_approval', { walletAddress: wallet, token, amount: String(amount), chainId: CHAIN_ID })).approval || null;
export async function swapTx(q, signature) {
  const body = { quote: q.quote };
  if (q.permitData) { body.permitData = q.permitData; body.signature = signature; }
  return (await uni('/swap', body)).swap;
}

// ---------------------------------------------------------------- market price (ETH per token)
export async function pricesEth(tokens) {
  const out = {};
  let list = [...new Set(tokens.map(t => t.toLowerCase()))];
  // tokens still on the Pons curve: price from a simulated 0.001 ETH buy (same basis as the entry price)
  for (const t of list.filter(x => PONS_CURVES[x])) {
    const curve = await ponsActive(t);
    if (!curve) continue;
    try {
      const probe = 10n ** 15n;
      const got = await simulateUint(WETH, curve, ponsBuyData(probe, 0n, WETH), probe);
      if (got > 0n) out[t] = { eth: 0.001 / (Number(got) / 1e18), usd: 0, liq: 0, symbol: t === ZYRO ? 'ZYRO' : '' };
    } catch {}
  }
  list = list.filter(x => !out[x]);
  for (let i = 0; i < list.length; i += 30) {
    const { ok, data } = await fetchJson(`https://api.dexscreener.com/tokens/v1/robinhood/${list.slice(i, i + 30).join(',')}`);
    if (!ok || !Array.isArray(data)) continue;
    for (const p of data) {
      const base = (p.baseToken?.address || '').toLowerCase();
      const qa = (p.quoteToken?.address || '').toLowerCase();
      if (!list.includes(base) || qa !== WETH) continue;
      const liq = Number(p.liquidity?.usd || 0);
      if (!out[base] || liq > out[base].liq) out[base] = { eth: Number(p.priceNative), usd: Number(p.priceUsd || 0), liq, symbol: p.baseToken?.symbol };
    }
  }
  return out;
}

// ---------------------------------------------------------------- Redis (Upstash REST)
export async function redis(...cmd) {
  const { ok, data } = await fetchJson(REDIS_URL, { method: 'POST', headers: { authorization: `Bearer ${REDIS_TOKEN}` }, body: JSON.stringify(cmd) });
  if (!ok || data.error) throw new HttpError(502, `Storage error: ${data.error || 'unavailable'}`);
  return data.result;
}
export async function getPos(id) { const v = await redis('GET', `pos:${id}`); return v ? JSON.parse(v) : null; }
export async function savePos(p) {
  await redis('SET', `pos:${p.id}`, JSON.stringify(p));
  await redis('SADD', `user:${p.user}:pos`, p.id);
  if (p.status === 'open') await redis('SADD', 'open', p.id); else await redis('SREM', 'open', p.id);
}
export async function userPositions(did) {
  const ids = await redis('SMEMBERS', `user:${did}:pos`) || [];
  if (!ids.length) return [];
  const vals = await redis('MGET', ...ids.map(i => `pos:${i}`));
  return vals.filter(Boolean).map(v => JSON.parse(v)).sort((a, b) => b.createdAt - a.createdAt);
}
export const lock = async (key, sec = 90) => (await redis('SET', `lock:${key}`, '1', 'NX', 'EX', String(sec))) === 'OK';
export const unlock = key => redis('DEL', `lock:${key}`);

// ---------------------------------------------------------------- Pons bonding curve (read from the curve bytecode)
//   buy(uint256 amountIn, uint256 minTokensOut, address to)  payable, msg.value must equal amountIn   0x59a87bc1
//   sell(uint256 tokensIn, uint256 minEthOut, address to)    needs token approval to the curve        0xd04c6983
//   graduated() -> bool                                                                                0xe7c2b772
export const PONS_CURVES = { [ZYRO]: '0xd64a7a779883b2d955f0d925d859aff4914ff453' };
const MAX_UINT = (1n << 256n) - 1n;
const w = v => BigInt(v).toString(16).padStart(64, '0');
const wa = a => a.toLowerCase().replace('0x', '').padStart(64, '0');
export const ponsBuyData = (amountIn, minOut, to) => '0x59a87bc1' + w(amountIn) + w(minOut) + wa(to);
export const ponsSellData = (tokensIn, minOut, to) => '0xd04c6983' + w(tokensIn) + w(minOut) + wa(to);
export const approveData = (spender, amount = MAX_UINT) => '0x095ea7b3' + wa(spender) + w(amount);

export function ponsCurve(token) { return PONS_CURVES[(token || '').toLowerCase()] || null; }
export async function ponsActive(token) {
  const curve = ponsCurve(token);
  if (!curve) return null;
  try {
    const g = await rpc('eth_call', [{ to: curve, data: '0xe7c2b772' }, 'latest']);
    return BigInt(g || '0x0') === 0n ? curve : null;   // still on the curve
  } catch { return curve; }
}
export async function allowance(token, owner, spender) {
  const r = await rpc('eth_call', [{ to: token, data: '0xdd62ed3e' + wa(owner) + wa(spender) }, 'latest']);
  return BigInt(r && r !== '0x' ? r : '0x0');
}
// simulate a call from the user's wallet and read the uint it returns
export async function simulateUint(from, to, data, value = 0n) {
  const r = await rpc('eth_call', [{ from, to, data, value: hex(value) }, 'latest']);
  return BigInt(r && r !== '0x' ? r.slice(0, 66) : '0x0');
}
