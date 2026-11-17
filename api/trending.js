import { json, trending } from './_zyro.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const chain = new URL(req.url).searchParams.get('chain') === 'robinhood' ? 'robinhood' : 'solana';
  try {
    return json({ tokens: await trending(8, chain) }, 200, 'public, s-maxage=60, stale-while-revalidate=120');
  } catch (e) {
    return json({ tokens: [], error: 'Trending tokens could not be loaded.' }, 502, 'no-store');
  }
}
