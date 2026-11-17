# ---------- home v2 ---------- (run from build.py after the old home; overwrites index.html)
GH = 'https://github.com/zyroai11/Zyro-Agent'
NPM = 'https://www.npmjs.com/package/zyro-agent'
COPY_I = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>'
GH_I = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .8.1-.7.4-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.8-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"/></svg>'
NPM_I = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 7h20v9H12v2H7v-2H2V7Zm2 7h3v-5h2v5h1V9H4v5Zm7-5v7h3v-2h3V9h-6Zm3 2h1v1h-1v-1Zm4-2v5h1v-3h1v3h1v-3h1v3h1V9h-6Z"/></svg>'

def cp(cmd, label=None):
    return f'<div class="cmd"><code><span aria-hidden="true">$</span> {cmd}</code><button type="button" class="cpb" data-cp="{cmd}" aria-label="Copy {label or cmd}">{COPY_I}<span>Copy</span></button></div>'

hero2 = f'''<section class="hx" id="hero">
  <div class="hx-bg" aria-hidden="true"></div>
  <div class="wrap hx-grid">
    <div class="hx-copy">
      <h1>Scan the token <span>before you buy it.</span></h1>
      <p class="lead">Zyro is the AI agent for Solana. It scores any token from 0 to 100, shows every reason, from mint authority to top holders, and trades for you with rules you set.</p>
      <div class="hx-inst">{cp("npm install -g zyro-agent", "the install command")}</div>
      <div class="cta">
        <a class="btn btn-volt" href="/app">Scan a token now</a>
        <a class="btn btn-line" data-link="telegram" href="#">Open the Telegram bot</a>
      </div>
      <ul class="hx-trust">
        <li>Built for Solana</li>
        <li><a href="{GH}" target="_blank" rel="noopener">Open source on GitHub</a></li>
        <li>Never asks for your keys</li>
      </ul>
    </div>
    <div class="hx-demo">
      {demo}
    </div>
  </div>
  <div class="wrap">
    <dl class="strip" id="strip" aria-label="Zyro at a glance">
      <div><dt>$ZYRO</dt><dd>Soon on StonkFun</dd></div>
      <div><dt>Main chain</dt><dd>Solana</dd></div>
      <div><dt>Also on</dt><dd>Robinhood Chain</dd></div>
      <div><dt>Roadmap</dt><dd>4 of 5 phases live</dd></div>
    </dl>
  </div>
</section>'''

bento = f'''<section class="band bento-band" id="products">
  <div class="wrap">
    <h2>One agent, four ways in</h2>
    <p class="lede">The same scanner runs everywhere. Pick the place that fits how you trade.</p>
    <div class="bento">
      <a class="tile t-web" href="/app">
        <div class="t-head"><h3>Web app</h3><span class="tag live">Live</span></div>
        <p>Paste a contract and get the score, the market numbers and all eight checks. Ask the agent, see what is trending, share any report.</p>
        <div class="t-vis rep-mini" aria-hidden="true">
          <div class="rm-top"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" class="rt"/><circle cx="32" cy="32" r="26" class="rv"/></svg><b>90</b><div><strong>$BONK</strong><span>Low risk</span></div></div>
          <ul><li class="ok">Enough liquidity in the pool</li><li class="ok">Normal mix of buys and sells</li><li class="warn">FDV is far above liquidity <em>−10</em></li></ul>
        </div>
        <span class="t-go">Open the web app</span>
      </a>
      <a class="tile t-chart" href="/chart">
        <div class="t-head"><h3>$ZYRO</h3><span class="tag">Soon</span></div>
        <p>$ZYRO launches on StonkFun on Solana. The official address is posted on X @ZyroxRH and here first.</p>
        <div class="t-vis spark soon-vis" aria-hidden="true"><div class="sp-px"><b>Launching soon</b><em>StonkFun · Solana</em></div></div>
        <span class="t-go">Launch details</span>
      </a>
      <a class="tile t-bot" data-link="telegram" href="#">
        <div class="t-head"><h3>Telegram bot</h3><span class="tag live">Live</span></div>
        <p>Send <code>/scan</code> with a contract. Three free scans a day.</p>
        <div class="t-vis chat" aria-hidden="true"><span class="b me">/scan 0x39db…4571</span><span class="b bot"><b>90/100</b> Low risk. 1 warning: FDV is far above liquidity.</span></div>
        <span class="t-go">Open the bot</span>
      </a>
      <a class="tile t-term" href="#install">
        <div class="t-head"><h3>Terminal agent</h3><span class="tag live">Live</span></div>
        <p>Buys only what passes your rules, with a stop loss and take profit on every position.</p>
        <div class="t-vis term" aria-hidden="true"><div class="term-bar"><i></i><i></i><i></i><span>zyro-agent</span></div>
<pre><span class="p">$</span> zyro buy 0x39db…4571 0.02
<span class="m">scanning token…</span>
score 90, passed your rules <span class="g">✓</span>
stop loss −15%, take profit +50% <span class="g">✓</span>
<span class="m">simulation: add --live to trade for real</span></pre></div>
        <span class="t-go">Install it</span>
      </a>
    </div>
  </div>
</section>'''

install = f'''<section class="band inst-band" id="install">
  <div class="wrap inst-grid">
    <div>
      <h2>Install the agent in a minute</h2>
      <p class="lede">It runs on your own computer, so your keys never leave it. Everything is simulated until you add <code>--live</code> and type yes.</p>
      <ol class="isteps">
        <li><h3>Install</h3><p>Needs Node 18+ and Python 3.10+. Works on macOS, Linux and Windows with WSL.</p>{cp("npm install -g zyro-agent")}</li>
        <li><h3>Create your settings</h3><p>Makes <code>~/.zyro/.env</code> for your keys and rules.</p>{cp("zyro init")}</li>
        <li><h3>Scan, then try a buy</h3><p>The first buy runs in simulation, so nothing is spent.</p>{cp("zyro scan 0x39dbed3a2bd333467115de45665cc57f813c4571", "the scan command")}</li>
      </ol>
      <div class="ilinks">
        <a class="pill" href="{NPM}" target="_blank" rel="noopener">{NPM_I}<span>zyro-agent on npm</span></a>
        <a class="pill" href="{GH}" target="_blank" rel="noopener">{GH_I}<span>Source on GitHub</span></a>
        <a class="pill" href="/docs#terminal">Read the docs</a>
      </div>
    </div>
    <div class="iterm">
      <div class="tabs" role="tablist" aria-label="Install method">
        <button role="tab" aria-selected="true" data-it="npm">npm</button>
        <button role="tab" aria-selected="false" data-it="git">From GitHub</button>
      </div>
      <div class="term big"><div class="term-bar"><i></i><i></i><i></i><span>terminal</span></div>
<pre data-ip="npm"><span class="p">$</span> npm install -g zyro-agent
<span class="m">added 1 package in 3s</span>
<span class="p">$</span> zyro init
<span class="m">Settings saved to ~/.zyro/.env</span>
<span class="p">$</span> zyro rules
min score 60   max trade 0.05 ETH
stop loss 15%   take profit 50%
<span class="p">$</span> zyro scan 0x39db…4571
<span class="g">90/100 Low risk</span>  1 warning
<span class="p">$</span> <span class="cur"></span></pre>
<pre data-ip="git" hidden><span class="p">$</span> git clone {GH}.git
<span class="p">$</span> cd Zyro-Agent
<span class="p">$</span> ./install.sh
<span class="m">Installed. Add your keys to .env</span>
<span class="p">$</span> nano .env
<span class="p">$</span> ./zyro scan 0x39db…4571
<span class="g">90/100 Low risk</span>  1 warning
<span class="p">$</span> <span class="cur"></span></pre>
      </div>
      <p class="inote">Live trading needs a private key in your settings file. Use a new wallet with a small balance, never your main one.</p>
    </div>
  </div>
</section>'''

home2 = head("Zyro: the AI agent for Solana", "Zyro is the AI agent for Solana. Scan any token from 0 to 100 with every reason shown, trade with take profit and stop loss, and follow the $ZYRO launch on StonkFun.") \
    + '\n<body data-page="home">\n\n' + header(True) + '\n\n<main id="top">\n' \
    + '\n\n'.join([hero2, bento, install, checks, trade_home, road, token, close]) \
    + '\n</main>\n\n' + footer(True).replace('<script src="/nav.js"></script>', '<script src="/nav.js"></script>\n<script src="/home.js"></script>')
open("index.html", "w").write(home2)
