import { json, isAddr, scan, ZYRO } from './_zyro.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const address = new URL(req.url).searchParams.get('address') || '';
  if (!isAddr(address)) return json({ error: 'That is not a contract address. It starts with 0x and has 42 characters.' }, 400, 'no-store');
  try {
    const r = await scan(address);
    if (!r && address.toLowerCase() === ZYRO) return json({ error: '$ZYRO is still on the Pons bonding curve, so there is no DEX pool to score yet. It gets a full score once it graduates to Uniswap.', pons: `https://ponsfamily.com/launchpad/${ZYRO}` }, 404, 'public, s-maxage=30');
    if (!r) return json({ error: 'No trading pair found for this token on Robinhood Chain. If it is still on a launchpad bonding curve, try again after it graduates.' }, 404, 'public, s-maxage=30');
    return json(r);
  } catch (e) {
    return json({ error: 'Market data could not be loaded. Try again in a moment.' }, 502, 'no-store');
  }
}
