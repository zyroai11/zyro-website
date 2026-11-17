# ---------- docs ---------- (run from build.py; uses head, header, footer)
def row(label, pts, cls="warn"):
    return f'<tr><td>{label}</td><td class="pts {cls}">{pts}</td></tr>'

DOCS_SECTIONS = [("start", "Getting started"), ("commands", "Bot commands"), ("webapp", "Web app"), ("chart", "$ZYRO launch"),
                 ("terminal", "Terminal agent"), ("score", "How the score works"),
                 ("access", "Access"), ("safety", "Staying safe"),
                 ("data", "Where the data comes from"), ("links", "Official links")]
toc = '<nav class="toc" id="toc" aria-label="On this page">' + ''.join(f'<a href="#{i}">{t}</a>' for i, t in DOCS_SECTIONS) + '</nav>'

rows = "\n            ".join([
    row("Liquidity under $5K", "−30", "bad"),
    row("Liquidity between $5K and $25K", "−15"),
    row("More than 20 buys and zero sells in 24 hours (possible honeypot)", "−30", "bad"),
    row("Sells more than three times buys in 24 hours", "−10"),
    row("Pair is younger than 24 hours", "−15"),
    row("Robinhood Chain: contract source is not verified on the explorer", "−15"),
    row("FDV is more than 50 times the liquidity", "−10"),
    row("24-hour volume is more than 20 times the liquidity", "−10"),
    row("Fewer than 50 holders", "−10"),
    row("No website or social links listed", "−10"),
    row("Solana: mint authority still enabled", "−25", "bad"),
    row("Solana: freeze authority still enabled", "−25", "bad"),
    row("Solana: top 10 wallets hold over 50% (over 30%: −10)", "−20", "bad"),
    row("Solana: less than half of the pool locked or burned", "−10"),
    row("Solana: flagged as rugged by RugCheck", "−60", "bad"),
])

body = f'''
<main id="top">
<section class="page-hero">
  <div class="wrap">
    <a class="crumb" href="/">← Back to home</a>
    <h1>Zyro docs</h1>
    <p class="lead">How to use the bot, the web app and the terminal agent, and exactly how the safety score is calculated.</p>
  </div>
</section>

<section class="band" style="padding-top:64px">
  <div class="wrap docs">
    {toc}
    <div class="doc">
      <section id="start">
        <h2>Getting started</h2>
        <ol>
          <li>Open <a href="https://t.me/ZyroAiAgent_bot" target="_blank" rel="noopener"><strong>@ZyroAiAgent_bot</strong></a> on Telegram and press <strong>Start</strong>.</li>
          <li>Copy the contract address of a token on Robinhood Chain. It starts with <code>0x</code> and has 42 characters. Solana support in the bot is coming; for Solana tokens use the <a href="/app">web app</a>.</li>
          <li>Send <code>/scan</code> followed by the address, for example <code>/scan 0x7a3f…c21e</code>.</li>
          <li>Read the report: the safety score, the market numbers and every warning that lowered the score.</li>
        </ol>
        <p style="margin-top:16px">There is nothing to install, and you do not need a wallet for a free scan. Prefer a browser? The <a href="/app">web app</a> runs the same scan.</p>
      </section>

      <section id="commands">
        <h2>Bot commands</h2>
        <div class="cmds">
          <div><code>/scan</code><p>Safety score and full report for a token. Add the contract address after the command.</p></div>
          <div><code>/trending</code><p>Tokens getting attention on Robinhood Chain right now.</p></div>
          <div><code>/me</code><p>Your scans left today.</p></div>
          <div><code>/start</code><p>The welcome message and the list of commands.</p></div>
        </div>
      </section>

      <section id="webapp">
        <h2>Web app</h2>
        <p>The web app at <a href="/app">zyro-ai.xyz/app</a> runs the full scan in your browser. There is no account and nothing to install.</p>
        <ul>
          <li><strong>Scan</strong>: paste a Solana token address, or a Robinhood Chain contract. You get the score, the market numbers and every check with the points it took off.</li>
          <li><strong>Trending</strong>: switch between Solana and Robinhood Chain, then tap any token to scan it.</li>
          <li><strong>Agent</strong>: ask in plain words, for example "what's trending" or "how is the score made", or paste a contract.</li>
          <li><strong>Share</strong>: every report has a share link, such as <code>zyro-ai.xyz/scan/0x…</code>, that shows the score as a preview card.</li>
          <li><strong>AI analysis</strong>: free on every report until $ZYRO launches.</li>
        </ul>
        <p style="margin-top:16px">A token that is still on a launchpad bonding curve has no DEX pool yet, so it cannot be scored until it graduates.</p>
      </section>

      <section id="chart">
        <h2>$ZYRO launch</h2>
        <p>$ZYRO launches soon on StonkFun on Solana. There is no contract address yet: the official address is posted on X @ZyroxRH and on <a href="/chart">zyro-ai.xyz/chart</a> first. The earlier Robinhood Chain $ZYRO is no longer supported.</p>
      </section>

      <section id="terminal">
        <h2>Terminal agent</h2>
        <p>The terminal agent trades on Robinhood Chain with rules you set. It runs on your own machine, so your keys stay with you.</p>
        <ol>
          <li>Install it: <code>npm install -g zyro-agent</code></li>
          <li>Create your settings: <code>zyro init</code></li>
          <li>Check a token: <code>zyro scan 0x…</code></li>
          <li>Try a buy in simulation: <code>zyro buy 0x… 0.01</code></li>
        </ol>
        <div class="cmds" style="margin-top:20px">
          <div><code>zyro buy</code><p>Scans the token, checks it against your rules, then buys. Simulated unless you add <code>--live</code>.</p></div>
          <div><code>zyro sell</code><p>Sells a position you hold.</p></div>
          <div><code>zyro positions</code><p>Open positions with cost, value and profit or loss.</p></div>
          <div><code>zyro watch</code><p>Watches positions and sells when the stop loss or take profit is hit.</p></div>
          <div><code>zyro chat</code><p>Give instructions in plain words.</p></div>
          <div><code>zyro rules</code><p>Shows your current limits.</p></div>
        </div>
        <p style="margin-top:16px">The default rules are a minimum score of 60, at most 0.05 ETH per trade, a 15% stop loss and a 50% take profit. Change them in <code>~/.zyro/.env</code>.</p>
        <div class="callout"><p><strong>Use a new wallet with a small balance.</strong> Live trading needs a private key in your settings file. Never share that file, and never use your main wallet.</p></div>
      </section>

      <section id="score">
        <h2>How the score works</h2>
        <p>Every token starts at <strong>100</strong>. Each check below that fails takes points off. The report lists every check that failed, so you always see why the score is what it is.</p>
        <table class="dtable">
          <thead><tr><th>Check that failed</th><th>Points</th></tr></thead>
          <tbody>
            {rows}
          </tbody>
        </table>
        <p style="margin-top:16px">If RugCheck (Solana) or the explorer (Robinhood Chain) cannot return every detail, the score is capped at <strong>90</strong> and the report says so.</p>
        <h3>What the score means</h3>
        <div class="bands">
          <div style="--c:#1FA971"><b>75 to 100</b><span>Low risk</span></div>
          <div style="--c:#E0A100"><b>50 to 74</b><span>Medium risk</span></div>
          <div style="--c:#F07A2A"><b>25 to 49</b><span>High risk</span></div>
          <div style="--c:#E5484D"><b>0 to 24</b><span>Very high risk</span></div>
        </div>
        <div class="callout"><p><strong>A high score is not a guarantee.</strong> It means the public data shows no obvious warning signs at the moment of the scan. Liquidity can be pulled and contracts can change later, so scan again before a large buy.</p></div>
      </section>

      <section id="access">
        <h2>Access</h2>
        <p>The web app is free: unlimited scans and AI analysis on every report. The Telegram bot gives 3 free scans a day, reset at 00:00 UTC.</p>
        <p style="margin-top:16px">Holder perks for $ZYRO will be announced with the launch on StonkFun.</p>
      </section>

      <section id="safety">
        <h2>Staying safe</h2>
        <ul>
          <li>Zyro will <strong>never</strong> ask for your seed phrase or private key. Linking a wallet only needs the public address.</li>
          <li>Zyro never messages you first. Anyone who does in Zyro's name is a scammer.</li>
          <li>Only trust the links on this page. $ZYRO has no contract address yet: the official address is posted on X @ZyroxRH and on <a href="/chart">zyro-ai.xyz/chart</a> first.</li>
          <li>Treat the score as one input. Read the warnings, check the chart, and decide for yourself.</li>
        </ul>
      </section>

      <section id="data">
        <h2>Where the data comes from</h2>
        <ul>
          <li><strong>DexScreener</strong>: price, liquidity, FDV, volume, buys and sells, pair age, website and socials.</li>
          <li><strong>RugCheck</strong>, for Solana tokens: mint and freeze authority, top holders, holder count and liquidity lock.</li>
          <li><strong>Blockscout</strong>, the Robinhood Chain explorer: holder count and contract verification.</li>
          <li><strong>AI model</strong>: writes the analysis using only the facts in the report.</li>
        </ul>
      </section>

      <section id="links">
        <h2>Official links</h2>
        <div class="links">
          <a href="https://t.me/ZyroAiAgent_bot" target="_blank" rel="noopener">Telegram bot <span>@ZyroAiAgent_bot</span></a>
          <a href="https://x.com/zyroxrh" target="_blank" rel="noopener">X <span>@ZyroxRH</span></a>
          <a href="/">Website <span>zyro-ai.xyz</span></a>
          <a href="/app">Web app <span>zyro-ai.xyz/app</span></a>
          <a href="/chart">$ZYRO launch <span>zyro-ai.xyz/chart</span></a>
          <a href="https://github.com/zyroai11/Zyro-Agent" target="_blank" rel="noopener">GitHub <span>zyroai11/Zyro-Agent</span></a>
          <a href="https://www.npmjs.com/package/zyro-agent" target="_blank" rel="noopener">npm <span>zyro-agent</span></a>
        </div>
      </section>
    </div>
  </div>
</section>
</main>

'''

docs_page = head("Zyro Docs: web app, bot and terminal agent",
                 "How to use the Zyro web app, bot and terminal agent, how the 0 to 100 safety score is calculated for Solana and Robinhood Chain tokens, and the $ZYRO launch.",
                 "/docs") + '\n<body data-page="docs">\n\n' + header(False) + '\n' + body + footer(False)
open("docs.html", "w").write(docs_page)
