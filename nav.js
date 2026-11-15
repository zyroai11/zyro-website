/* ---- Mobile menu ---- */
const menuBtn = $('menuBtn'), menu = $('menu');
if (menuBtn && menu) {
  const setMenu = open => { menu.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open); menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); };
  menuBtn.onclick = () => setMenu(!menu.classList.contains('open'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  addEventListener('resize', () => { if (innerWidth > 1080) setMenu(false); });
}

/* ---- Web app link (keeps older page builds in step) ---- */
document.querySelectorAll('#menu a, footer nav a').forEach(a => {
  if (/#checks$/.test(a.getAttribute('href') || '') && a.textContent.trim() === 'Scanner') { a.href = '/app'; a.textContent = 'Web app'; a.dataset.nav = 'app'; }
});
const hb = document.querySelector('.bnav a[data-nav="holders"]');
if (hb) { hb.href = '/app'; hb.dataset.nav = 'app'; hb.querySelector('svg').innerHTML = '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>'; hb.querySelector('span').textContent = 'Scan'; }
document.querySelectorAll('.hero a.btn-line[href="#checks"]').forEach(a => { a.href = '/app'; a.textContent = 'Scan on the web'; });
document.querySelectorAll('a[href^="https://dexscreener.com/robinhood/0x50e05d1ee5e545540190a1136667af06a496f6d2"]').forEach(a => { a.href = '/chart'; a.removeAttribute('target'); a.removeAttribute('rel'); });

/* ---- Chart in the menu, footer links and disclaimer (older page builds) ---- */
document.querySelectorAll('#menu a').forEach(a => { if (a.textContent.trim() === 'Token') { a.href = '/chart'; a.textContent = 'Chart'; a.dataset.nav = 'token'; if (document.body.dataset.page === 'token') a.setAttribute('aria-current', 'page'); } });
const tb = document.querySelector('.bnav a[data-nav="token"]');
if (tb) { tb.href = '/chart'; tb.querySelector('span').textContent = 'Chart'; }
const ft = document.querySelector('footer');
if (ft && !ft.querySelector('.foot2')) ft.insertAdjacentHTML('beforeend', '<div class="wrap foot2"><p>Zyro gives information, not financial advice. A score is not a guarantee. Trade at your own risk.</p><nav aria-label="Legal and code"><a href="https://github.com/zyroai11/Zyro-Agent" target="_blank" rel="noopener">GitHub</a><a href="https://www.npmjs.com/package/zyro-agent" target="_blank" rel="noopener">npm</a><a href="/legal#terms">Terms</a><a href="/legal#privacy">Privacy</a></nav></div>');
document.querySelectorAll('p.note-dark').forEach(p => { if (p.textContent.trim() === 'Planned for phase 4.') p.textContent = 'Building next: phase 4.'; });

/* ---- Live $ZYRO price on the home page ---- */
if ($('zLive')) fetch('/api/zyro-chart').then(r => r.json()).then(d => {
  const s = d && d.stats; if (!s || !s.priceUsd) return;
  const z = Math.max(0, -Math.floor(Math.log10(s.priceUsd)) - 1);
  $('zlP').textContent = '$' + s.priceUsd.toFixed(Math.min(z + 4, 14));
  if (s.change24h != null) { $('zlC').textContent = (s.change24h > 0 ? '+' : '') + s.change24h.toFixed(1) + '%'; $('zlC').className = s.change24h < 0 ? 'down' : ''; }
  if (s.mcapUsd) $('zlM').textContent = 'MC $' + (s.mcapUsd >= 1e6 ? (s.mcapUsd / 1e6).toFixed(2) + 'M' : (s.mcapUsd / 1e3).toFixed(1) + 'K');
  $('zLive').hidden = false;
}).catch(() => {});

/* ---- Chart library: second source if the first one fails ---- */
if ($('zChart')) addEventListener('load', () => {
  if (window.LightweightCharts) return;
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/lightweight-charts@4.2.3/dist/lightweight-charts.standalone.production.js';
  document.head.appendChild(s);
});

/* ---- Page views, counted without cookies ---- */
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
{ const s = document.createElement('script'); s.defer = true; s.src = '/_vercel/insights/script.js'; document.head.appendChild(s); }
