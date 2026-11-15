/* $ZYRO chart: candles built from on-chain curve trades */
(() => {
  const $ = id => document.getElementById(id);
  const box = $('zChart'), msg = $('zMsg');
  let data = null, tf = 300, mode = 'price', chart, candles, vols, lastTx = null;

  const fmtUsd = v => {
    if (v == null || isNaN(v)) return '—';
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
    if (v >= 1e3) return '$' + (v / 1e3).toFixed(2) + 'K';
    if (v >= 1) return '$' + v.toFixed(2);
    if (v <= 0) return '$0';
    const z = Math.max(0, -Math.floor(Math.log10(v)) - 1);
    return '$' + v.toFixed(Math.min(z + 4, 14));
  };
  const fmtNum = v => v >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(1) + 'K' : v.toFixed(0);
  const fmtEth = v => v >= 1 ? v.toFixed(2) : v >= 0.01 ? v.toFixed(3) : v.toFixed(4);
  const hhmm = t => new Date(t * 1000).toISOString().slice(11, 19);

  function build() {
    if (!window.LightweightCharts) { msg.textContent = 'The chart library did not load. Check your connection and refresh.'; return false; }
    chart = LightweightCharts.createChart(box, {
      autoSize: true,
      layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#9FB2D9', fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 11 },
      grid: { vertLines: { color: 'rgba(191,217,255,.06)' }, horzLines: { color: 'rgba(191,217,255,.06)' } },
      rightPriceScale: { borderColor: 'rgba(191,217,255,.14)', scaleMargins: { top: 0.08, bottom: 0.24 } },
      timeScale: { borderColor: 'rgba(191,217,255,.14)', timeVisible: true, secondsVisible: false },
      crosshair: { mode: 0 },
      localization: { priceFormatter: fmtUsd, timeFormatter: t => new Date(t * 1000).toISOString().slice(5, 16).replace('T', ' ') + ' UTC' },
    });
    candles = chart.addCandlestickSeries({
      upColor: '#3DDC97', downColor: '#FF6B70', borderUpColor: '#3DDC97', borderDownColor: '#FF6B70', wickUpColor: '#3DDC97', wickDownColor: '#FF6B70',
      priceFormat: { type: 'custom', formatter: fmtUsd, minMove: 1e-12 },
    });
    vols = chart.addHistogramSeries({ priceScaleId: 'vol', priceFormat: { type: 'volume' }, lastValueVisible: false, priceLineVisible: false });
    chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    return true;
  }

  function series() {
    const k = data.ethUsd || 0, mult = mode === 'mcap' ? data.stats.supply : 1;
    const out = [], vol = [];
    let cur = null, prevClose = null;
    for (const x of data.trades) {
      const v = x.p * k * mult, b = Math.floor(x.t / tf) * tf;
      if (!cur || cur.time !== b) {
        if (cur) { out.push(cur); vol.push(cur.v); prevClose = cur.close; }
        const o = prevClose ?? v;
        cur = { time: b, open: o, high: Math.max(o, v), low: Math.min(o, v), close: v, v: { time: b, value: 0, color: '' } };
      }
      cur.high = Math.max(cur.high, v); cur.low = Math.min(cur.low, v); cur.close = v;
      cur.v.value += x.e * k;
    }
    if (cur) { out.push(cur); vol.push(cur.v); }
    out.forEach(c => { c.v.color = c.close >= c.open ? 'rgba(61,220,151,.35)' : 'rgba(255,107,112,.35)'; delete c.v; });
    return { out, vol };
  }

  function draw(fit) {
    if (!data || !data.trades.length) return;
    if (!chart && !build()) return;
    msg.hidden = true;
    const { out, vol } = series();
    candles.setData(out); vols.setData(vol);
    if (fit) chart.timeScale().fitContent();
  }

  function stats() {
    const s = data.stats;
    $('zPrice').textContent = fmtUsd(s.priceUsd);
    const ch = $('zChange');
    ch.textContent = s.change24h == null ? '' : (s.change24h > 0 ? '+' : '') + s.change24h.toFixed(1) + '% 24h';
    ch.className = 'zc-ch ' + (s.change24h > 0 ? 'up' : s.change24h < 0 ? 'down' : '');
    $('zMcap').textContent = fmtUsd(s.mcapUsd);
    $('zVol').textContent = fmtEth(s.volume24hEth) + ' ETH' + (data.ethUsd ? ' (' + fmtUsd(s.volume24hEth * data.ethUsd) + ')' : '');
    $('zBs').textContent = s.buys24h + ' / ' + s.sells24h;
    $('zTrades').textContent = s.trades.toLocaleString('en-US');
    document.title = fmtUsd(s.priceUsd) + ' $ZYRO chart';
  }

  function tape() {
    const list = data.trades.slice(-60).reverse();
    const seen = lastTx;
    $('zTape').innerHTML = list.map(x => `<li class="${seen && x.tx !== seen && list.indexOf(x) < list.findIndex(y => y.tx === seen) ? 'new' : ''}">
      <span>${hhmm(x.t)}</span><span class="${x.s}">${x.s === 'b' ? 'Buy' : 'Sell'}</span>
      <span>${fmtEth(x.e)}</span><span><a href="https://robinhoodchain.blockscout.com/tx/${x.tx}" target="_blank" rel="noopener" title="View transaction">${fmtNum(x.q)}</a></span></li>`).join('') || '<li class="ph">No trades yet.</li>';
    lastTx = list[0] && list[0].tx;
  }

  async function load(first) {
    try {
      const r = await fetch('/api/zyro-chart', { cache: 'no-store' });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      data = d; stats(); tape(); draw(first);
    } catch (e) {
      if (first) msg.textContent = 'Chart data could not be loaded. It retries in a few seconds.';
    }
  }

  const seg = (id, key, set) => $(id).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $(id).querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    set(b.dataset[key]); draw(true);
  });
  seg('zTf', 'tf', v => tf = +v);
  seg('zMode', 'mode', v => mode = v);

  $('zCopy').addEventListener('click', e => {
    const b = e.currentTarget;
    navigator.clipboard?.writeText(b.dataset.ca).then(() => { b.textContent = 'Copied'; setTimeout(() => b.textContent = 'Copy contract', 1400); });
  });

  load(true);
  setInterval(() => { if (!document.hidden) load(false); }, 15000);
})();
