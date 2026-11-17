/* Zyro web app: scanner, trending and agent console */
(() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isEvm = a => /^0x[a-fA-F0-9]{40}$/.test(a || '');
  const isSol = a => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a || '');
  const isAddr = a => isEvm(a) || isSol(a);
  const usd = n => {
    if (n == null || isNaN(n)) return '—';
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
    if (n >= 1) return '$' + n.toFixed(2);
    if (n === 0) return '$0';
    return '$' + n.toPrecision(3);
  };
  const pct = n => n == null ? '—' : (n > 0 ? '+' : '') + n.toFixed(1) + '%';
  const age = t => {
    if (!t) return '—';
    const h = (Date.now() - t) / 36e5;
    return h < 1 ? Math.max(1, Math.round(h * 60)) + 'm' : h < 48 ? Math.round(h) + 'h' : Math.round(h / 24) + 'd';
  };
  const COLOR = { low: '#1FA971', medium: '#E0A100', high: '#F07A2A', 'very-high': '#E5484D' };
  const ICONS = { ok: '✓', warn: '!', bad: '✕', unknown: '?' };

  const rep = $('#report'), form = $('#appForm'), input = $('#appIn'), btn = $('#appBtn');
  const cache = {};

  async function getScan(addr) {
    const k = addr.toLowerCase();
    if (cache[k] && Date.now() - cache[k].t < 30000) return cache[k].d;
    const r = await fetch('/api/scan?address=' + encodeURIComponent(addr));
    const d = await r.json().catch(() => ({ error: 'Unexpected response from the scanner.' }));
    if (r.ok) cache[k] = { t: Date.now(), d };
    return d;
  }

  function loading(addr) {
    rep.className = 'rep loading';
    rep.innerHTML = `<div class="rep-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><h2>Scanning</h2><p>${esc(addr)}</p></div>`;
  }

  function error(msg, link) {
    rep.className = 'rep rep-err';
    rep.innerHTML = `<div class="rep-empty"><h2>Scan didn't finish</h2><p>${esc(msg)}</p>${link ? `<div class="rep-links" style="justify-content:center"><a class="buy" href="${esc(link)}" target="_blank" rel="noopener">Open on Pons</a></div>` : ''}</div>`;
  }

  function render(d) {
    const c = COLOR[d.level] || '#2F7BFF', m = d.market, C = 2 * Math.PI * 52;
    const cmd = `zyro buy ${d.token.address} 0.01`, sol = d.chain === 'solana';
    rep.className = 'rep';
    rep.innerHTML = `
      <div class="rep-top" style="--c:${c}">
        <div class="ring" role="img" aria-label="Safety score ${d.score} out of 100">
          <svg viewBox="0 0 120 120"><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg" cx="60" cy="60" r="52" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>
          <b>${d.score}</b><small>of 100</small>
        </div>
        <div class="rep-id">
          <h2>${esc(d.token.name)} <span>$${esc(d.token.symbol)}</span> <em class="chainb ${sol ? 'sol' : 'rh'}">${sol ? 'Solana' : 'Robinhood Chain'}</em></h2>
          <span class="verdict">${esc(d.verdict)}</span>
          <div class="addr"><span>${esc(d.token.address)}</span><button type="button" data-copy="${esc(d.token.address)}">Copy</button></div>
        </div>
      </div>
      ${d.capped ? `<p class="capnote">${sol ? 'RugCheck' : 'The explorer'} did not return every detail, so the score is capped at 90.</p>` : ''}
      <div class="mgrid">
        <div><span>Price</span><b>${usd(m.price)}</b></div>
        <div><span>24h change</span><b class="${m.change24h > 0 ? 'up' : m.change24h < 0 ? 'down' : ''}">${pct(m.change24h)}</b></div>
        <div><span>Liquidity</span><b>${usd(m.liquidity)}</b></div>
        <div><span>FDV</span><b>${usd(m.fdv)}</b></div>
        <div><span>Volume 24h</span><b>${usd(m.volume24h)}</b></div>
        <div><span>Buys / sells 24h</span><b>${m.buys24h} / ${m.sells24h}</b></div>
        <div><span>Holders</span><b>${m.holders == null ? '—' : m.holders.toLocaleString('en-US')}</b></div>
        <div><span>Pair age</span><b>${age(m.pairCreatedAt)}</b></div>
      </div>
      <div class="chk"><h3>What Zyro checked</h3><ul>
        ${d.checks.map(k => `<li class="${k.status}"><i aria-hidden="true">${ICONS[k.status]}</i><div><b>${esc(k.name)}</b><p>${esc(k.detail)}</p></div><em>${k.points ? '−' + k.points : ''}</em></li>`).join('')}
      </ul></div>
      <div class="rep-links">
        <button type="button" class="ai" data-ai="${esc(d.token.address)}">AI analysis</button>
        <button type="button" data-copy="https://zyro-ai.xyz/scan/${esc(d.token.address)}">Copy share link</button>
        <a href="${esc(d.links.chart)}" target="_blank" rel="noopener">Chart</a>
        <a href="${esc(d.links.explorer)}" target="_blank" rel="noopener">${sol ? 'Solscan' : 'Explorer'}</a>${d.links.rugcheck ? `<a href="${esc(d.links.rugcheck)}" target="_blank" rel="noopener">RugCheck</a>` : ''}
      </div>
      <div class="aibox" id="aiBox" hidden></div>
      ${sol ? '' : `<div class="rep-cmd"><code>${esc(cmd)}</code><button type="button" data-copy="${esc(cmd)}">Copy command</button></div>`}
      <p class="rep-foot">Scanned ${new Date(d.scannedAt).toISOString().slice(11, 16)} UTC. A high score is not a guarantee. Scan again before a large buy.</p>`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const fg = rep.querySelector('.fg'); if (fg) fg.style.strokeDashoffset = C * (1 - d.score / 100);
    }));
  }

  async function scan(addr, { push = true, scroll = true } = {}) {
    addr = (addr || '').trim();
    if (!isAddr(addr)) { error('That is not a token address. Paste a Solana mint address, or a Robinhood Chain contract that starts with 0x.'); return null; }
    input.value = addr; btn.disabled = true; btn.textContent = 'Scanning…';
    loading(addr);
    if (scroll && innerWidth < 940) rep.scrollIntoView({ behavior: 'smooth', block: 'start' });
    try {
      const d = await getScan(addr);
      if (d.error) error(d.error, d.pons); else render(d);
      if (push) history.replaceState(null, '', '/app?token=' + addr);
      return d;
    } catch (_) {
      error('The scanner could not be reached. Check your connection and try again.');
      return null;
    } finally { btn.disabled = false; btn.textContent = 'Scan token'; }
  }

  form.addEventListener('submit', e => { e.preventDefault(); scan(input.value); });
  input.addEventListener('paste', () => setTimeout(() => { if (isAddr(input.value.trim())) scan(input.value); }, 0));
  document.querySelector('.tryz').addEventListener('click', e => scan(e.currentTarget.dataset.addr));
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    navigator.clipboard?.writeText(b.dataset.copy).then(() => { const t = b.textContent; b.textContent = 'Copied'; setTimeout(() => b.textContent = t, 1400); });
  });

  /* AI analysis: free for everyone until $ZYRO launches on StonkFun */
  const cli = document.querySelector('.trend .cli');
  const hc = document.createElement('div');
  hc.className = 'holdc';
  hc.innerHTML = `<h3>$ZYRO is launching soon</h3><p>$ZYRO launches on StonkFun on Solana. Until then, AI analysis on every report is free for everyone. There is no contract address yet: only trust the launch post on X <a href="https://x.com/zyroxstonk" target="_blank" rel="noopener">@zyroxstonk</a>.</p>`;
  if (cli) cli.before(hc);

  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-ai]');
    if (!b) return;
    const box = $('#aiBox'); box.hidden = false;
    b.disabled = true; box.innerHTML = '<p>Writing the analysis…</p>';
    try {
      const r = await fetch('/api/holder', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ address: b.dataset.ai }) });
      const d = await r.json();
      box.innerHTML = d.error ? `<h3>AI analysis</h3><p>${esc(d.error)}</p>`
        : `<h3>AI analysis</h3><dl><div><dt>Overall read</dt><dd>${esc(d.read)}</dd></div><div><dt>Biggest risk</dt><dd>${esc(d.risk)}</dd></div><div><dt>What to watch</dt><dd>${esc(d.watch)}</dd></div></dl>`;
    } catch (_) { box.innerHTML = '<h3>AI analysis</h3><p>The analysis could not be loaded. Try again in a moment.</p>'; }
    b.disabled = false;
  });

  /* trending */
  const list = $('#trendList');
  let trendData = [], trendChain = 'solana';
  document.querySelector('.chain-t')?.addEventListener('click', e => {
    const b = e.target.closest('[data-chain]'); if (!b || b.dataset.chain === trendChain) return;
    trendChain = b.dataset.chain;
    document.querySelectorAll('.chain-t button').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
    loadTrending();
  });
  async function loadTrending() {
    list.innerHTML = '<li class="ph">Loading tokens…</li>';
    try {
      const r = await fetch('/api/trending?chain=' + trendChain);
      trendData = (await r.json()).tokens || [];
    } catch (_) { trendData = []; }
    list.innerHTML = trendData.length ? trendData.map(t => `<li><button type="button" data-scan="${esc(t.address)}">
      <b>$${esc(t.symbol)}</b><span class="ch ${t.change24h > 0 ? 'up' : t.change24h < 0 ? 'down' : ''}">${pct(t.change24h)}</span>
      <small>${esc(t.name)}</small><small class="ch">Liq ${usd(t.liquidity)}</small></button></li>`).join('')
      : '<li class="ph">No trending tokens right now. Paste a contract above instead.</li>';
    return trendData;
  }
  list.addEventListener('click', e => { const b = e.target.closest('[data-scan]'); if (b) scan(b.dataset.scan); });
  $('#trendRe').addEventListener('click', loadTrending);

  /* agent console */
  const log = $('#conLog'), cform = $('#conForm'), cin = $('#conIn'), st = $('#conSt');
  const say = (cls, html) => { const p = document.createElement(cls === 'rows' ? 'div' : 'p'); p.className = cls; p.innerHTML = html; log.appendChild(p); log.scrollTop = log.scrollHeight; return p; };
  const busy = on => { st.textContent = on ? 'thinking' : 'online'; st.classList.toggle('busy', on); };

  /* live markets for the agent: $ZYRO from its own chart, Stock Tokens from the trade API, anything else from DexScreener */
  const ZYRO_CA = '0x50e05d1ee5e545540190a1136667af06a496f6d2';
  let stockList = null;
  const stocks = async () => stockList || (stockList = await fetch('/api/trade?action=stocks').then(r => r.json()).then(d => d.stocks || []).catch(() => []));
  const fmtPx = v => {
    if (!(v > 0)) return '—';
    if (v >= 1) return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    if (v >= 0.001) return '$' + v.toPrecision(4);
    const z = -Math.floor(Math.log10(v)) - 1, sub = '₀₁₂₃₄₅₆₇₈₉';
    return '$0.0' + String(z).split('').map(d => sub[d]).join('') + String(Math.round(v * 10 ** (z + 4))).slice(0, 4).replace(/0+$/, '');
  };
  async function resolveMarket(token, symbol) {
    const sym = (symbol || '').toUpperCase();
    if ((token || '').toLowerCase() === ZYRO_CA || sym === 'ZYRO') return { kind: 'soon' };
    const list = await stocks();
    const st = list.find(x => token ? x.address === token.toLowerCase() : x.symbol === sym || (sym === 'GOOG' && x.symbol === 'GOOGL'));
    if (st) return { kind: 'stock', address: st.address, symbol: st.symbol, name: st.name + ' Stock Token', logo: '/api/logo?s=' + encodeURIComponent(st.symbol), usd: st.usd, ch: st.ch };
    if (!token) return null;
    const sol = isSol(token), ch = sol ? 'solana' : 'robinhood';
    const ps = await fetch(`https://api.dexscreener.com/tokens/v1/${ch}/${token}`).then(r => r.json()).catch(() => []);
    const same = a => sol ? a === token : a.toLowerCase() === token.toLowerCase();
    const best = (Array.isArray(ps) ? ps : []).filter(p => same(p.baseToken?.address || '')).sort((x, y) => (y.liquidity?.usd || 0) - (x.liquidity?.usd || 0))[0];
    return { kind: sol ? 'sol' : 'token', address: sol ? token : token.toLowerCase(), url: best?.url, symbol: best?.baseToken?.symbol || token.slice(0, 6), name: best?.baseToken?.name || (sol ? 'Solana token' : 'Robinhood Chain token'), logo: best?.info?.imageUrl || '', usd: best ? Number(best.priceUsd) : null, ch: best?.priceChange?.h24 };
  }
  const marketCard = m => {
    const href = `/trade?${m.kind === 'stock' ? 'market=stocks&' : ''}token=${m.address}`;
    const logo = m.logo ? `<img src="${esc(m.logo)}" alt="" width="36" height="36" onerror="this.replaceWith(Object.assign(document.createElement('i'),{textContent:'${esc(m.symbol[0])}'}))">` : `<i>${esc(m.symbol[0])}</i>`;
    return `<div class="mcard"><div class="mc-h">${logo}<div><b>$${esc(m.symbol)}</b><span>${esc(m.name)}</span></div><div class="mc-p"><b>${fmtPx(m.usd)}</b>${m.ch != null ? `<span class="${m.ch >= 0 ? 'sc-low' : 'sc-very-high'}">${pct(m.ch)} 24h</span>` : ''}</div></div>`
      + (m.kind === 'sol'
        ? `<div class="mc-a"><button type="button" data-scan="${esc(m.address)}">Scan</button>${m.url ? `<a href="${esc(m.url)}" target="_blank" rel="noopener">Chart</a>` : ''}</div><p class="mc-note">Solana trading on Zyro is coming next.</p></div>`
        : `<div class="mc-a"><a class="mc-buy" href="${href}">Buy</a><a class="mc-sell" href="${href}">Sell</a>${m.kind === 'token' ? `<button type="button" data-scan="${esc(m.address)}">Scan</button>` : ''}</div></div>`);
  };

  async function ask(msg) {
    msg = msg.trim(); if (!msg) return;
    say('you', esc(msg)); busy(true);
    let a;
    try {
      const r = await fetch('/api/agent', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: msg }) });
      a = await r.json();
    } catch (_) {
      const addr = (msg.match(/0x[a-fA-F0-9]{40}|\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/) || [])[0];
      a = addr ? { action: 'scan', token: addr, reply: 'Scanning that token now.' } : { action: 'none', reply: 'I could not reach the server. Paste a contract to scan it.' };
    }
    if (a.reply) say('bot', esc(a.reply));
    if (a.action === 'scan' && a.token) {
      const d = await scan(a.token, { scroll: false });
      if (d && !d.error) {
        say('bot', `<b class="sc-${d.level}">${d.score}/100 ${esc(d.verdict)}</b> for $${esc(d.token.symbol)}. Liquidity ${usd(d.market.liquidity)}, ${d.checks.filter(k => k.points).length} warnings. Full report is above.`);
        if (d.chain !== 'solana') say('sys', `<a class="con-go" href="/trade?token=${esc(a.token)}">Trade $${esc(d.token.symbol)} with take profit and stop loss</a>`);
      }
      else if (d && d.error) say('bot', esc(d.error));
    } else if (a.action === 'trending') {
      const t = trendData.length ? trendData : await loadTrending();
      if (!t.length) say('bot', 'Nothing is trending right now.');
      else {
        const box = say('rows', '');
        box.style.cssText = 'display:grid;gap:6px';
        box.innerHTML = t.slice(0, 6).map(x => `<button type="button" class="row" data-scan="${esc(x.address)}"><b>$${esc(x.symbol)}</b><s>Liq ${usd(x.liquidity)}</s><span class="${x.change24h > 0 ? 'sc-low' : 'sc-very-high'}">${pct(x.change24h)}</span></button>`).join('');
        say('sys', 'Tap a token to scan it.');
      }
    } else if (a.action === 'trade' || a.action === 'price') {
      const m = await resolveMarket(a.token, a.symbol);
      if (m && m.kind === 'soon') say('bot', '$ZYRO is launching soon on StonkFun on Solana. No contract address yet: follow @zyroxstonk for the official launch post.');
      else if (!m) say('bot', a.symbol ? `I could not find $${esc(a.symbol)} as a Stock Token. Paste its contract address and I will look it up.` : 'Paste the token contract address and I will look it up.');
      else say('rows', marketCard(m));
    } else if (a.action === 'help') {
      say('sys', 'Try: paste a Solana token address, <code>trending</code>, <code>price NVDA</code>, or ask how the score works.');
    }
    busy(false);
  }
  log.addEventListener('click', e => { const b = e.target.closest('[data-scan]'); if (b) ask('Scan ' + b.dataset.scan); });
  cform.addEventListener('submit', e => { e.preventDefault(); const v = cin.value; cin.value = ''; ask(v); });
  $('#conChips').addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (b) ask(b.dataset.q); });

  loadTrending();
  const q = new URLSearchParams(location.search).get('token');
  if (isAddr(q)) scan(q, { push: false, scroll: false });
})();
