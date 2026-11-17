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
document.querySelectorAll('#menu a').forEach(a => { if (a.textContent.trim() === 'Token') { a.href = '/chart'; a.textContent = '$ZYRO'; a.dataset.nav = 'token'; if (document.body.dataset.page === 'token') a.setAttribute('aria-current', 'page'); } });
const tb = document.querySelector('.bnav a[data-nav="token"]');
if (tb) { tb.href = '/chart'; tb.querySelector('span').textContent = '$ZYRO'; }
document.querySelectorAll('footer .foot2').forEach(n => n.remove());
document.querySelectorAll('p.note-dark').forEach(p => { if (p.textContent.trim() === 'Planned for phase 4.') p.textContent = 'Building next: phase 4.'; });



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
