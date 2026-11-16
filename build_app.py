# ---------- web app: scanner + agent ---------- (run from build.py; uses head, header, footer)
app_body = '''
<main id="top" class="zapp">
<section class="app-hero">
  <div class="wrap">
    <h1>Scan a token before you buy it</h1>
    <p class="lead">Paste any contract on Robinhood Chain. Zyro reads the pool, the trades and the explorer, then scores it from 0 to 100 with every reason shown.</p>
    <form class="bigscan" id="appForm" autocomplete="off">
      <label class="sr" for="appIn">Contract address</label>
      <input id="appIn" name="token" placeholder="Paste a contract (0x…)" spellcheck="false" inputmode="text">
      <button type="submit" id="appBtn">Scan token</button>
    </form>
    <p class="try">Try it with <button type="button" class="tryz" data-addr="0x39dbed3a2bd333467115de45665cc57f813c4571">$PONS</button> or pick a token from the trending list.</p>
  </div>
</section>

<section class="app-main">
  <div class="wrap app-grid">
    <div class="app-left">
      <div id="report" class="rep empty" aria-live="polite">
        <div class="rep-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
          <h2>No token scanned yet</h2>
          <p>Paste a contract above, tap a trending token, or ask the agent below.</p>
        </div>
      </div>

      <div class="console" id="console">
        <div class="con-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><b>zyro agent</b><span class="con-st" id="conSt">online</span></div>
        <div class="con-log" id="conLog" aria-live="polite">
          <p class="sys">Zyro agent on Robinhood Chain. Scan a contract, see what is trending, check a live price or start a trade: try <code>buy NVDA</code> or <code>price ZYRO</code>.</p>
        </div>
        <div class="con-chips" id="conChips">
          <button type="button" data-q="What's trending on Robinhood Chain?">What's trending?</button>
          <button type="button" data-q="Scan 0x39dbed3a2bd333467115de45665cc57f813c4571">Scan $PONS</button>
          <button type="button" data-q="How is the safety score calculated?">How is the score made?</button>
          <button type="button" data-q="Buy $ZYRO">Buy $ZYRO</button>
          <button type="button" data-q="Price of NVDA">NVDA price</button>
          <button type="button" data-q="How do I trade with Zyro?">How do I trade?</button>
        </div>
        <form class="con-in" id="conForm" autocomplete="off">
          <span aria-hidden="true">›</span>
          <label class="sr" for="conIn">Message the agent</label>
          <input id="conIn" placeholder="Ask Zyro anything about a token" maxlength="500">
          <button type="submit">Send</button>
        </form>
      </div>
    </div>

    <aside class="trend" aria-labelledby="trendH">
      <div class="trend-h"><h2 id="trendH">Trending now</h2><button type="button" id="trendRe" aria-label="Refresh trending">Refresh</button></div>
      <ol id="trendList" class="trend-list"><li class="ph">Loading tokens…</li></ol>
      <div class="cli">
        <h3>Trade what you scan</h3>
        <p>Buy tokens, $ZYRO or Stock Tokens with a take profit and stop loss that Zyro runs 24/7. <a href="/trade">Open the trade page</a>. Prefer your own rules? Run the agent in your terminal.</p>
        <pre><code>npm install -g zyro-agent
zyro init
zyro buy 0x… 0.01</code></pre>
        <a href="/docs">Read the docs</a>
      </div>
    </aside>
  </div>
</section>
</main>
'''

app_page = head("Zyro web app: scan any token on Robinhood Chain",
                "Paste a contract and get a 0 to 100 safety score with every reason shown, see what is trending on Robinhood Chain, and ask the Zyro agent.",
                "/app").replace('<link rel="stylesheet" href="/pro.css">', '<link rel="stylesheet" href="/pro.css">\n<link rel="stylesheet" href="/app.css">') \
    + '\n<body data-page="app">\n\n' + header(False) + '\n' + app_body + footer(False).replace('<script src="/nav.js"></script>', '<script src="/nav.js"></script>\n<script src="/zapp.js"></script>')
open("app.html", "w").write(app_page)
