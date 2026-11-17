import time
# ---------- auto-trade page (run from build.py; uses head, header, footer)
at_body = '''
<main id="top" class="zapp">
<section class="app-hero at-hero">
  <div class="wrap">
    <div class="at-hero-row">
      <div>
        <p class="at-kicker">Beta</p>
        <h1>Trade on Solana</h1>
        <p class="lead">Buy and sell from a wallet Zyro makes for you. Set a take profit and a stop loss once, and Zyro sells for you 24/7. Solana tokens open here soon. Stock Tokens are live now.</p>
      </div>
      <div class="at-chips" aria-label="What is live"><span><i></i>Stocks live</span><span>Solana tokens soon</span><span>Perps soon</span></div>
    </div>
  </div>
</section>
<section class="at-main">
  <div class="wrap">
    <div id="at-root"><div class="at-card"><p class="at-empty">Loading auto-trade…</p></div></div>
    <p class="at-legal">Trading is risky and you can lose what you put in. Your trading wallet is created and secured by Privy, and only you can export its key. Zyro can only swap from it while auto-trade is on. <a href="/legal#terms">Terms</a></p>
  </div>
</section>
</main>
'''
at_page = head("Zyro Trade: trade on Solana with auto take profit and stop loss",
               "Trade Stock Tokens now and Solana tokens soon from your own Zyro wallet, with take profit and stop loss that run around the clock.",
               "/trade").replace('<link rel="stylesheet" href="/pro.css">', '<link rel="stylesheet" href="/pro.css">\n<link rel="stylesheet" href="/app.css">\n<link rel="stylesheet" href="/autotrade.css">\n<link rel="stylesheet" href="/trade-dark.css">') \
    + '\n<body data-page="trade">\n\n' + header(False) + '\n' + at_body + footer(False).replace('<script src="/nav.js"></script>', '<script src="/nav.js"></script>\n<script type="module" src="/at/autotrade.js?v='+str(int(time.time()))+'"></script>')
open("trade.html", "w").write(at_page)
