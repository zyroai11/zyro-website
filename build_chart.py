# ---------- $ZYRO launch page ---------- (run from build.py; uses head, header, footer, LOGO)
# The old Robinhood Chain $ZYRO is retired. $ZYRO launches on Stonk.fun on Solana; this page holds the launch details.
chart_body = f'''
<main id="top" class="zch">
<section class="zl-top">
  <div class="wrap zl-wrap">
    <span class="zc-logo zl-logo">{LOGO}</span>
    <p class="zl-kick">Launching soon</p>
    <h1>$ZYRO launches on Stonk.fun</h1>
    <p class="zl-lead">Zyro is moving to Solana. The $ZYRO token launches on Stonk.fun, the Solana launchpad where coins can be paired with tokenized stocks.</p>
    <dl class="zl-facts">
      <div><dt>Chain</dt><dd>Solana</dd></div>
      <div><dt>Launchpad</dt><dd>Stonk.fun</dd></div>
      <div><dt>Contract address</dt><dd>Not live yet</dd></div>
    </dl>
    <div class="zl-warn"><b>No contract address yet.</b> The official address is posted on X <a href="https://x.com/ZyroxRH" target="_blank" rel="noopener">@ZyroxRH</a> and on this page first. Anyone sharing a $ZYRO address before that is not us.</div>
    <div class="zl-actions">
      <a class="btn btn-volt" href="https://x.com/ZyroxRH" target="_blank" rel="noopener">Follow @ZyroxRH for the launch</a>
      <a class="btn btn-line" href="/app">Scan a Solana token</a>
    </div>
    <p class="zl-note">The earlier Robinhood Chain $ZYRO is no longer supported by Zyro.</p>
  </div>
</section>
</main>
'''

chart_page = head("$ZYRO: launching soon on Stonk.fun",
                  "$ZYRO, the token of the Zyro AI agent, launches soon on Stonk.fun on Solana. The official address is posted on X @ZyroxRH first.",
                  "/chart").replace('<link rel="stylesheet" href="/pro.css">', '<link rel="stylesheet" href="/pro.css">\n<link rel="stylesheet" href="/chart.css">') \
    + '\n<body data-page="token">\n\n' + header(False) + '\n' + chart_body + footer(False)
open("chart.html", "w").write(chart_page)
