# ---------- $ZYRO chart ---------- (run from build.py; uses head, header, footer, LOGO)
CA = '0x50e05d1ee5e545540190a1136667af06a496f6d2'
chart_body = f'''
<main id="top" class="zch">
<section class="zc-top">
  <div class="wrap">
    <div class="zc-id">
      <span class="zc-logo">{LOGO}</span>
      <div>
        <h1>$ZYRO <span>Zyro</span></h1>
        <p class="zc-sub">On the Pons bonding curve, Robinhood Chain</p>
      </div>
    </div>
    <div class="zc-price">
      <b id="zPrice">—</b>
      <span id="zChange" class="zc-ch"></span>
    </div>
    <dl class="zc-stats">
      <div><dt>Market cap</dt><dd id="zMcap">—</dd></div>
      <div><dt>Volume 24h</dt><dd id="zVol">—</dd></div>
      <div><dt>Buys / sells 24h</dt><dd id="zBs">—</dd></div>
      <div><dt>Trades</dt><dd id="zTrades">—</dd></div>
    </dl>
    <div class="zc-actions">
      <a class="btn btn-volt" href="/trade?token={CA}">Buy / sell $ZYRO</a>
      <a class="btn btn-line" href="https://ponsfamily.com/launchpad/{CA}" target="_blank" rel="noopener">Pons</a>
      <button class="btn btn-line" type="button" id="zCopy" data-ca="{CA}">Copy contract</button>
      <a class="btn btn-line" href="https://robinhoodchain.blockscout.com/token/{CA}" target="_blank" rel="noopener">Explorer</a>
    </div>
  </div>
</section>

<section class="zc-main">
  <div class="wrap zc-grid">
    <div class="zc-card">
      <div class="zc-bar">
        <div class="seg" role="group" aria-label="Candle size" id="zTf">
          <button type="button" data-tf="60" aria-pressed="false">1m</button>
          <button type="button" data-tf="300" aria-pressed="true">5m</button>
          <button type="button" data-tf="900" aria-pressed="false">15m</button>
          <button type="button" data-tf="3600" aria-pressed="false">1h</button>
        </div>
        <div class="seg" role="group" aria-label="Chart value" id="zMode">
          <button type="button" data-mode="price" aria-pressed="true">Price</button>
          <button type="button" data-mode="mcap" aria-pressed="false">Market cap</button>
        </div>
      </div>
      <div class="zc-chart" id="zChart"><p class="zc-msg" id="zMsg">Loading trades from the chain…</p></div>
      <p class="zc-note">Every candle is built from buys and sells on the $ZYRO curve contract, read straight from Robinhood Chain. Updates every 15 seconds. Times are UTC.</p>
    </div>

    <aside class="zc-card zc-tape" aria-labelledby="tapeH">
      <h2 id="tapeH">Latest trades</h2>
      <div class="tape-head" aria-hidden="true"><span>Time</span><span>Side</span><span>ETH</span><span>$ZYRO</span></div>
      <ol id="zTape"><li class="ph">Loading…</li></ol>
    </aside>
  </div>
</section>
</main>
'''

chart_page = head("$ZYRO chart: live price on Robinhood Chain",
                  "Live $ZYRO price, market cap and every trade, read straight from the Pons bonding curve on Robinhood Chain.",
                  "/chart").replace('<link rel="stylesheet" href="/pro.css">', '<link rel="stylesheet" href="/pro.css">\n<link rel="stylesheet" href="/chart.css">') \
    + '\n<body data-page="token">\n\n' + header(False) + '\n' + chart_body + footer(False).replace(
        '<script src="/nav.js"></script>',
        '<script src="/nav.js"></script>\n<script src="https://unpkg.com/lightweight-charts@4.2.3/dist/lightweight-charts.standalone.production.js"></script>\n<script src="/zchart.js"></script>')
open("chart.html", "w").write(chart_page)
