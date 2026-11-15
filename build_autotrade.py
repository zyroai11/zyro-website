# ---------- auto-trade page (run from build.py; uses head, header, footer)
at_body = '''
<main id="top" class="zapp">
<section class="app-hero">
  <div class="wrap">
    <p class="at-kicker">Beta for $ZYRO holders</p>
    <h1>Auto-trade with take profit and stop loss</h1>
    <p class="lead">Buy any Robinhood Chain token from a wallet Zyro makes for you. Set a take profit and a stop loss, and Zyro sells for you when either is hit, even while you sleep.</p>
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
at_page = head("Zyro auto-trade: take profit and stop loss on Robinhood Chain",
               "Buy Robinhood Chain tokens from your own Zyro wallet and let Zyro sell at your take profit or stop loss, around the clock.",
               "/autotrade").replace('<link rel="stylesheet" href="/pro.css">', '<link rel="stylesheet" href="/pro.css">\n<link rel="stylesheet" href="/app.css">\n<link rel="stylesheet" href="/autotrade.css">') \
    + '\n<body data-page="autotrade">\n\n' + header(False) + '\n' + at_body + footer(False).replace('<script src="/nav.js"></script>', '<script src="/nav.js"></script>\n<script type="module" src="/at/autotrade.js"></script>')
open("autotrade.html", "w").write(at_page)
