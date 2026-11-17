import { json, chainOf, scan } from './_zyro.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const address = (new URL(req.url).searchParams.get('address') || '').trim();
  const chain = chainOf(address);
  if (!chain) return json({ error: 'That is not a token address. Paste a Solana mint address, or a Robinhood Chain contract that starts with 0x.' }, 400, 'no-store');
  try {
    const r = await scan(address);
    if (!r) return json({ error: chain === 'solana'
      ? 'No trading pair found for this token on Solana yet. If it is still on a launchpad bonding curve, try again after it graduates.'
      : 'No trading pair found for this token on Robinhood Chain. If it is still on a launchpad bonding curve, try again after it graduates.' }, 404, 'public, s-maxage=30');
    return json(r);
  } catch (e) {
    return json({ error: 'Market data could not be loaded. Try again in a moment.' }, 502, 'no-store');
  }
}
