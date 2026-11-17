/* Home page: copy buttons and install tabs */
(() => {
  const $ = id => document.getElementById(id);

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-cp]');
    if (!b) return;
    const done = () => { const s = b.querySelector('span'); const t = s && s.textContent; b.classList.add('done'); if (s) s.textContent = 'Copied'; setTimeout(() => { b.classList.remove('done'); if (s) s.textContent = t; }, 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.cp).then(done, () => {});
  });

  const tabs = document.querySelectorAll('[data-it]');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.setAttribute('aria-selected', x === t));
    document.querySelectorAll('[data-ip]').forEach(p => { p.hidden = p.dataset.ip !== t.dataset.it; });
  }));

  const usd = v => {
    if (v == null || isNaN(v)) return '—';
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
    if (v >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'K';
    if (v >= 1) return '$' + v.toFixed(2);
    const z = Math.max(0, -Math.floor(Math.log10(v)) - 1);
    return '$' + v.toFixed(Math.min(z + 4, 14));
  };

  function spark(trades, k) {
    const c = $('spark'); if (!c || !trades.length) return;
    const pts = trades.slice(-120).map(x => x.p * k);
    const dpr = window.devicePixelRatio || 1, w = c.clientWidth, h = c.clientHeight;
    c.width = w * dpr; c.height = h * dpr;
    const g = c.getContext('2d'); g.scale(dpr, dpr);
    const lo = Math.min(...pts), hi = Math.max(...pts), pad = 36;
    const X = i => (i / Math.max(1, pts.length - 1)) * (w - 8) + 4;
    const Y = v => pad + (h - pad - 8) * (1 - (v - lo) / ((hi - lo) || 1));
    const up = pts[pts.length - 1] >= pts[0], col = up ? '61,220,151' : '255,107,112';
    g.beginPath(); pts.forEach((v, i) => i ? g.lineTo(X(i), Y(v)) : g.moveTo(X(i), Y(v)));
    g.strokeStyle = `rgb(${col})`; g.lineWidth = 2; g.lineJoin = 'round'; g.stroke();
    g.lineTo(X(pts.length - 1), h); g.lineTo(X(0), h); g.closePath();
    const gr = g.createLinearGradient(0, pad, 0, h); gr.addColorStop(0, `rgba(${col},.28)`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.fill();
  }


})();
