/* ---- Fill these in when they exist ---- */
const CONFIG = {
  telegram: "https://t.me/ZyroAiAgent_bot",
  x: "https://x.com/zyroxrh",
  contract: "",   // $ZYRO launches soon on Stonk.fun (Solana): add the mint here at launch
  pons: ""
};

const $ = id => document.getElementById(id);
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('[data-link]').forEach(a => {
  const url = CONFIG[a.dataset.link];
  if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
  else {
    a.setAttribute('aria-disabled', 'true');
    a.textContent = a.dataset.link === 'telegram' ? 'Bot opens soon' : 'X account coming soon';
    a.addEventListener('click', e => e.preventDefault());
  }
});

if (CONFIG.contract && $('caText')) {
  const t = $('caText'), b = $('copyBtn');
  $('caTitle').textContent = 'Official contract on Robinhood Chain';
  $('caNote').textContent = 'This is the only official $ZYRO contract. Check every character before you buy.';
  t.textContent = CONFIG.contract; t.hidden = false; b.hidden = false;
  b.onclick = async () => {
    try { await navigator.clipboard.writeText(CONFIG.contract); b.textContent = 'Copied'; }
    catch (_) { b.textContent = 'Select the address to copy'; }
    setTimeout(() => b.textContent = 'Copy address', 1800);
  };
  const links = [
    CONFIG.pons && ['Buy on Pons', CONFIG.pons],
    ['Chart', '/chart'],
    ['Explorer', 'https://robinhoodchain.blockscout.com/token/' + CONFIG.contract]
  ].filter(Boolean);
  if ($('caLinks')) $('caLinks').innerHTML = links.map(([t, u]) => `<a class="btn ${t.startsWith("Buy") ? "btn-volt" : "btn-line-ink"}" href="${u}"${u.startsWith("/") ? "" : ' target="_blank" rel="noopener"'}>${t}</a>`).join('');
}

/* ---- Scan demo: live Robinhood Chain tokens from DexScreener, samples as fallback ---- */
if ($('arc')) {
  const SAMPLES = [
    { cmd: '/scan 0x7a3f…c21e', name: 'HoodFrog ($HOODFROG)', score: 90, verdict: 'Low risk', color: '#1FA971',
      rows: [['Liquidity', '$140K'], ['FDV', '$8.0M'], ['Volume 24h', '$310K'], ['Txns 24h', '412 buy / 371 sell'], ['Pair age', '12d'], ['Holders', '1,240']],
      flags: [['#E0A100', 'FDV is far above liquidity'], ['#1FA971', 'Contract verified on the explorer']] },
    { cmd: '/scan 0x19be…07d4', name: 'MoonCat ($MOONCAT)', score: 55, verdict: 'Medium risk', color: '#E0A100',
      rows: [['Liquidity', '$18K'], ['FDV', '$420K'], ['Volume 24h', '$96K'], ['Txns 24h', '188 buy / 143 sell'], ['Pair age', '9h'], ['Holders', '214']],
      flags: [['#E0A100', 'Low liquidity, under $25K'], ['#E0A100', 'New pair, under 24 hours old'], ['#E0A100', 'Contract is not verified']] },
    { cmd: '/scan 0xd02c…9f1a', name: 'RugPup ($RUGPUP)', score: 0, verdict: 'Very high risk', color: '#E5484D',
      rows: [['Liquidity', '$3.1K'], ['FDV', '$260K'], ['Volume 24h', '$41K'], ['Txns 24h', '64 buy / 0 sell'], ['Pair age', '2h'], ['Holders', '31']],
      flags: [['#E5484D', 'Buys but zero sells: possible honeypot'], ['#E5484D', 'Very low liquidity, under $5K'], ['#E0A100', 'New pair, unverified contract, no website or socials']] }
  ];
  const WARN = '#E0A100', BAD = '#E5484D', OK = '#1FA971';
  const DS = 'https://api.dexscreener.com';
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const usd = v => { v = +v || 0; return v >= 1e9 ? '$' + (v / 1e9).toFixed(1) + 'B' : v >= 1e6 ? '$' + (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? '$' + (v / 1e3).toFixed(1) + 'K' : '$' + v.toFixed(0); };
  const age = ms => { if (!ms) return 'n/a'; const h = (Date.now() - ms) / 36e5; return h < 1 ? Math.max(1, Math.round(h * 60)) + 'm' : h < 48 ? Math.round(h) + 'h' : Math.round(h / 24) + 'd'; };
  const short = a => a.slice(0, 6) + '…' + a.slice(-4);
  const getJSON = async url => {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 8000);
    try { const r = await fetch(url, { signal: ctl.signal }); if (!r.ok) throw 0; return await r.json(); }
    finally { clearTimeout(t); }
  };

  /* Same rules as the Telegram bot. Holder and contract checks need the explorer, so web scores stop at 90. */
  const report = p => {
    let score = 100; const flags = [];
    const liq = +(p.liquidity?.usd || 0), fdv = +(p.fdv || 0), vol = +(p.volume?.h24 || 0);
    const buys = p.txns?.h24?.buys || 0, sells = p.txns?.h24?.sells || 0;
    const ageH = p.pairCreatedAt ? (Date.now() - p.pairCreatedAt) / 36e5 : null;
    const info = p.info || {};
    if (liq < 5000) { score -= 30; flags.push([BAD, 'Very low liquidity, under $5K']); }
    else if (liq < 25000) { score -= 15; flags.push([WARN, 'Low liquidity, under $25K']); }
    if (ageH !== null && ageH < 24) { score -= 15; flags.push([WARN, 'New pair, under 24 hours old']); }
    if (fdv && liq && fdv / liq > 50) { score -= 10; flags.push([WARN, 'FDV is far above liquidity']); }
    if (liq && vol / liq > 20) { score -= 10; flags.push([WARN, 'Volume is unusually high for the liquidity']); }
    if (buys > 20 && sells === 0) { score -= 30; flags.push([BAD, 'Buys but zero sells: possible honeypot']); }
    else if (buys + sells > 20 && sells / Math.max(buys, 1) > 3) { score -= 10; flags.push([WARN, 'Heavy selling pressure']); }
    if (!(info.socials || []).length && !(info.websites || []).length) { score -= 10; flags.push([WARN, 'No website or socials listed']); }
    score = Math.max(0, Math.min(90, score));
    if (!flags.length) flags.push([OK, 'No red flags in the market data']);
    const [verdict, color] = score >= 75 ? ['Low risk', OK] : score >= 50 ? ['Medium risk', WARN] : score >= 25 ? ['High risk', '#F07A2A'] : ['Very high risk', BAD];
    const bt = p.baseToken || {};
    return { cmd: '/scan ' + short(bt.address || ''), name: `${bt.name || 'Unknown'} ($${bt.symbol || '?'})`, sym: bt.symbol || '?', score, verdict, color,
      rows: [['Liquidity', usd(liq)], ['FDV', fdv ? usd(fdv) : 'n/a'], ['Volume 24h', usd(vol)], ['Txns 24h', `${buys} buy / ${sells} sell`], ['Pair age', age(p.pairCreatedAt)],
        ['Price 24h', p.priceChange?.h24 != null ? (p.priceChange.h24 > 0 ? '+' : '') + (+p.priceChange.h24).toFixed(1) + '%' : 'n/a']],
      flags };
  };
  const bestPairs = list => {
    const best = {};
    (list || []).filter(p => p.chainId === 'robinhood').forEach(p => {
      const a = (p.baseToken?.address || '').toLowerCase();
      if (a && (!best[a] || (+(p.liquidity?.usd || 0)) > (+(best[a].liquidity?.usd || 0)))) best[a] = p;
    });
    return best;
  };

  let timer, set = SAMPLES, chipSet = SAMPLES;
  const show = (i, chip = true) => {
    const s = set[i];
    $('cmd').textContent = s.cmd;
    $('tname').textContent = s.name;
    $('verdict').textContent = s.verdict;
    $('verdict').style.color = s.color;
    $('rows').innerHTML = s.rows.map(r => `<div><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`).join('');
    $('flags').innerHTML = s.flags.map(f => `<li><i style="background:${f[0]}"></i>${esc(f[1])}</li>`).join('');
    $('arc').style.stroke = s.color;
    $('arc').style.strokeDashoffset = 264 - 264 * s.score / 100;
    document.querySelectorAll('#chips .chip').forEach(c => c.setAttribute('aria-pressed', chip && c.dataset.i == i));
    clearInterval(timer);
    if (still) { $('num').textContent = s.score; return; }
    let n = 0; $('num').textContent = 0;
    timer = setInterval(() => { n = Math.min(s.score, n + Math.ceil(s.score / 25) || 1); $('num').textContent = n; if (n >= s.score) clearInterval(timer); }, 30);
  };
  const bindChips = () => document.querySelectorAll('#chips .chip').forEach(c => c.onclick = () => { set = chipSet; show(+c.dataset.i); });
  bindChips();
  requestAnimationFrame(() => setTimeout(() => show(0), 250));

  const note = $('demoNote');
  const LIVE_NOTE = 'Live market data from DexScreener. The bot also checks holders and contract verification, so scores on the web stop at 90.';
  (async () => {
    try {
      const boosts = await getJSON(DS + '/token-boosts/top/v1');
      let addrs = (Array.isArray(boosts) ? boosts : []).filter(b => b.chainId === 'robinhood').map(b => b.tokenAddress);
      if (addrs.length < 3) {
        const prof = await getJSON(DS + '/token-profiles/latest/v1').catch(() => []);
        addrs = addrs.concat((Array.isArray(prof) ? prof : []).filter(b => b.chainId === 'robinhood').map(b => b.tokenAddress));
      }
      addrs = [...new Set(addrs.filter(Boolean))].slice(0, 8);
      if (!addrs.length) throw 0;
      const best = bestPairs(await getJSON(`${DS}/tokens/v1/robinhood/${addrs.join(',')}`));
      const live = addrs.map(a => best[a.toLowerCase()]).filter(Boolean).slice(0, 3).map(report);
      if (!live.length) throw 0;
      set = chipSet = live;
      const chips = $('chips');
      chips.querySelectorAll('.chip').forEach(c => c.remove());
      $('chipLabel').textContent = 'Live on Robinhood Chain:';
      live.forEach((r, i) => {
        const b = document.createElement('button');
        b.className = 'chip'; b.dataset.i = i; b.textContent = '$' + r.sym.slice(0, 12);
        chips.appendChild(b);
      });
      bindChips(); show(0);
      if (note) note.textContent = LIVE_NOTE;
    } catch (_) { /* keep the samples */ }
    const form = $('scanForm');
    if (!form) return;
    form.hidden = false;
    form.onsubmit = async e => {
      e.preventDefault();
      const a = $('scanIn').value.trim();
      if (!/^0x[a-fA-F0-9]{40}$/.test(a)) { if (note) note.textContent = 'That is not a contract address. It should start with 0x and have 42 characters.'; return; }
      if (note) note.textContent = 'Scanning…';
      try {
        const p = bestPairs(await getJSON(`${DS}/tokens/v1/robinhood/${a}`))[a.toLowerCase()];
        if (!p) { if (note) note.textContent = 'No trading pair found for this address on Robinhood Chain. Check the address, or try again once the token has liquidity.'; return; }
        set = [report(p)];
        show(0, false);
        if (note) note.textContent = LIVE_NOTE;
      } catch (_) { if (note) note.textContent = 'Market data could not be loaded. Try again, or scan in the Telegram bot.'; }
    };
  })();
}

/* ---- Trade preview ---- */
if ($('mhead')) {
  const MKT = {
    stocks: [
      { t: 'NVDA', a: '0xd0601ce157db5bdc3162bbac2a2c8af5320d9eec', n: 'Nvidia', c: '#76B900', tv: 'NASDAQ:NVDA' },
      { t: 'AAPL', a: '0xaf3d76f1834a1d425780943c99ea8a608f8a93f9', n: 'Apple', c: '#8E8E93', tv: 'NASDAQ:AAPL' },
      { t: 'TSLA', a: '0x322f0929c4625ed5bad873c95208d54e1c003b2d', n: 'Tesla', c: '#E31937', tv: 'NASDAQ:TSLA' },
      { t: 'GOOGL', a: '0x2e0847e8910a9732eb3fb1bb4b70a580adad4fe3', n: 'Alphabet', c: '#4285F4', tv: 'NASDAQ:GOOGL' },
      { t: 'AMZN', a: '0x12f190a9f9d7d37a250758b26824b97ce941bf54', n: 'Amazon', c: '#FF9900', tv: 'NASDAQ:AMZN' },
      { t: 'MSFT', a: '0xe93237c50d904957cf27e7b1133b510c669c2e74', n: 'Microsoft', c: '#00A4EF', tv: 'NASDAQ:MSFT' },
      { t: 'META', a: '0xc0d6457c16cc70d6790dd43521c899c87ce02f35', n: 'Meta', c: '#0866FF', tv: 'NASDAQ:META' },
      { t: 'SPY', a: '0x117cc2133c37b721f49de2a7a74833232b3b4c0c', n: 'S&P 500 ETF', c: '#3D5A80', tv: 'AMEX:SPY' }
    ],
    perps: [
      { t: 'TSLA-PERP', n: 'Tesla perp', c: '#E31937', tv: 'NASDAQ:TSLA' },
      { t: 'NVDA-PERP', n: 'Nvidia perp', c: '#76B900', tv: 'NASDAQ:NVDA' },
      { t: 'BTC-PERP', n: 'Bitcoin perp', c: '#F7931A', tv: 'BITSTAMP:BTCUSD' },
      { t: 'GOLD-PERP', n: 'Gold perp', c: '#C9A227', tv: 'OANDA:XAUUSD' },
      { t: 'OIL-PERP', n: 'WTI oil perp', c: '#4B5563', tv: 'TVC:USOIL' }
    ]
  };
  const list = $('mkList'), chips = $('mk'), chart = $('tvChart');
  let tab = 'stocks', mi = chart ? 2 : 0, sideS = 'long', lastSym = '';
  const badge = m => { const s = m.t.split('-')[0].slice(0, 4); return `<span class="tk${s.length > 3 ? ' l4' : ''}" style="--c:${m.c}" aria-hidden="true">${s}</span>`; };
  const pairName = m => tab === 'perps' ? m.t : `${m.t} / USDG`;
  const loadChart = m => {
    if (!chart || m.tv === lastSym) return;
    lastSym = m.tv;
    chart.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'tradingview-widget-container'; box.style.height = '100%';
    const inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget'; inner.style.height = '100%';
    box.appendChild(inner);
    const s = document.createElement('script');
    s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    s.async = true;
    s.textContent = JSON.stringify({
      autosize: true, symbol: m.tv, interval: '60', timezone: 'Etc/UTC', theme: 'dark', style: '1', locale: 'en',
      backgroundColor: 'rgba(12,27,66,1)', gridColor: 'rgba(191,217,255,0.06)',
      allow_symbol_change: false, hide_side_toolbar: true, calendar: false, support_host: 'https://www.tradingview.com'
    });
    box.appendChild(s);
    chart.appendChild(box);
  };
  const renderTrade = () => {
    const items = MKT[tab], m = items[mi];
    if (list) {
      list.innerHTML = items.map((x, i) => `<button class="mrow" data-i="${i}" aria-pressed="${i === mi}">${badge(x)}<div><b>${tab === 'perps' ? x.t : x.t + ' / USDG'}</b><span>${x.n}</span></div></button>`).join('');
      list.querySelectorAll('.mrow').forEach(b => b.onclick = () => { mi = +b.dataset.i; renderTrade(); });
    }
    if (chips) {
      chips.innerHTML = items.slice(0, 4).map((x, i) => `<button data-i="${i}" aria-pressed="${i === mi}">${badge(x)}${x.t}</button>`).join('');
      chips.querySelectorAll('button').forEach(b => b.onclick = () => { mi = +b.dataset.i; renderTrade(); });
    }
    if ($('chartTop')) $('chartTop').innerHTML = `${badge(m)}<b>${pairName(m)}</b><span>${m.n} · underlying market</span>`;
    loadChart(m);
    const venue = tab === 'perps' ? 'Lighter' : 'Uniswap';
    $('mhead').innerHTML = `${badge(m)}<div><b>${pairName(m)}</b><span>${m.n}</span></div><em class="venue">${venue}</em>`;
    const amt = Math.max(0, parseFloat($('amt').value) || 0);
    const perps = tab === 'perps';
    const pill = $('tsoon'); if (pill) { pill.textContent = perps ? 'Coming soon' : 'Live now'; pill.classList.toggle('live', !perps); }
    $('side').hidden = !perps; $('levRow').hidden = !perps; $('recvRow').hidden = perps;
    if (!perps) {
      $('recvUnit').textContent = m.t;
      $('zc').textContent = `Zyro check: the ${m.t} Stock Token follows the price of ${m.n}. It does not give you shares or voting rights.`;
      $('go').disabled = false; $('go').textContent = `Trade ${m.t} on Zyro`; delete $('go').dataset.side;
      $('go').onclick = () => { location.href = '/trade?market=stocks&token=' + m.a; };
    } else {
      $('go').disabled = true; $('go').textContent = `${sideS === 'long' ? 'Long' : 'Short'} ${m.t} · opens soon`; $('go').onclick = null; $('go').dataset.side = sideS;
      const lev = +$('lev').value;
      $('levv').textContent = lev + 'x';
      $('pos').textContent = '$' + (amt * lev).toLocaleString('en-US', { maximumFractionDigits: 2 });
      const dist = Math.max(0, 100 / lev - 0.5);
      $('zc').textContent = `Zyro check: at ${lev}x, a ${dist.toFixed(1)}% move ${sideS === 'long' ? 'down' : 'up'} in ${m.n.replace(' perp', '')} liquidates this position.` + (lev >= 10 ? ' That is a small move. Consider lower leverage.' : '');
    }
  };
  document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => {
    tab = b.dataset.tab; mi = 0;
    document.querySelectorAll('.tabs button').forEach(x => x.setAttribute('aria-selected', x === b));
    renderTrade();
  });
  document.querySelectorAll('.side button').forEach(b => b.onclick = () => {
    sideS = b.dataset.s;
    document.querySelectorAll('.side button').forEach(x => x.setAttribute('aria-pressed', x === b));
    renderTrade();
  });
  $('amt').oninput = renderTrade; $('lev').oninput = renderTrade;
  renderTrade();
}

/* ---- Real logos on ticker badges (falls back to the monogram if a logo cannot load) ---- */
const LOGO = { NVDA:'nvidia', AAPL:'apple', TSLA:'tesla', GOOG:'alphabet', AMZN:'amazon', MSFT:'microsoft',
  META:'meta-platforms', SPY:'spdr-sandp500-etf-tr', BTC:'crypto/XTVCBTC', GOLD:'metal/gold', OIL:'crude-oil' };
const logoize = (root = document) => root.querySelectorAll('.tk:not([data-l])').forEach(el => {
  el.dataset.l = 1;
  const slug = LOGO[el.textContent.trim()];
  if (!slug) return;
  const img = new Image();
  img.alt = ''; img.decoding = 'async';
  img.onload = () => el.classList.add('has-logo');
  img.onerror = () => img.remove();
  img.src = `https://s3-symbol-logo.tradingview.com/${slug}.svg`;
  el.appendChild(img);
});
logoize();
new MutationObserver(() => logoize()).observe(document.body, { childList: true, subtree: true });

/* ---- Docs: highlight the section on screen ---- */
if ($('toc')) {
  const links = [...$('toc').querySelectorAll('a')];
  const secs = links.map(a => document.querySelector(a.getAttribute('href')));
  const markToc = () => {
    let cur = 0;
    secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= innerHeight * 0.35) cur = i; });
    links.forEach((a, i) => a.classList.toggle('on', i === cur));
  };
  addEventListener('scroll', markToc, { passive: true }); markToc();
}

/* ---- Navigation: mark the current page, or the section on screen ---- */
const page = document.body.dataset.page;
const navLinks = [...document.querySelectorAll('.bnav a')];
if (page !== 'home') {
  navLinks.forEach(a => a.classList.toggle('on', a.dataset.nav === page));
  document.querySelectorAll('.nav ul a').forEach(a => { if (a.dataset.nav === page) a.setAttribute('aria-current', 'page'); });
} else {
  const secLinks = navLinks.filter(a => a.getAttribute('href').startsWith('#'));
  const secs = secLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const mark = () => {
    let cur = secs[0];
    for (const s of secs) if (s.getBoundingClientRect().top <= innerHeight * 0.5) cur = s;
    navLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + cur.id));
  };
  addEventListener('scroll', mark, { passive: true }); mark();
}
