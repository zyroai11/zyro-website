import re
src=open("index.orig.html").read()
def sec(id_):
    m=re.search(r'(<section class="[^"]*"( id="'+id_+r'")?>.*?</section>)', src, re.S)
    return m.group(1)
def grab(pattern):
    return re.search(pattern, src, re.S).group(1)
hero=grab(r'(<section class="hero">.*?</section>)')
checks=grab(r'(<section class="band" id="checks">.*?</section>)')
how=grab(r'(<section class="band how" id="how">.*?</section>)')
agent=grab(r'(<section class="band suite" id="agent">.*?</section>)')
trade=grab(r'(<section class="band" id="trade">.*?</section>)')
tiers=grab(r'(<section class="band tiers" id="tiers">.*?</section>)')
road=grab(r'(<section class="band" id="roadmap">.*?</section>)')
token=grab(r'(<section class="band token" id="token">.*?</section>)')
close=grab(r'(<section class="band close">.*?</section>)')
demo=grab(r'(<div class="demo" aria-label="Sample scan report">.*?</p>\n    </div>)')
term=grab(r'(<div class="vis term".*?</pre>\n        </div>)')
pool=grab(r'(<div class="vis pool".*?<div class="fake">Add liquidity</div>\n        </div>)')
tools=grab(r'(<div class="tools">.*?</article>\n    </div>)')

LOGO='<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="4" y="4" width="92" height="92" rx="24" fill="#2F7BFF"/><polyline points="30,30 70,30 44,52 58,52 30,72 70,72" fill="none" stroke="#fff" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/></svg>'
XSVG='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-7.6 8.7L23 22h-6.8l-5.3-6.9L4.8 22H1.7l8.1-9.3L1 2h7l4.8 6.3L18.9 2Zm-1.2 18h1.9L6.4 3.9H4.4L17.7 20Z"/></svg>'
I='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
ICON={'app':'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>','home':'<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>','agent':'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3M13 15h4"/>','trade':'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>','holders':'<path d="M12 3 4 7v5c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V7l-8-4Z"/>','token':'<circle cx="12" cy="12" r="9"/><path d="M9 9h6l-6 6h6"/>'}
CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>'

def head(title,desc,path="/"):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#06102A">
<link rel="canonical" href="https://zyro-ai.xyz{path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Zyro">
<meta property="og:url" content="https://zyro-ai.xyz{path}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="https://zyro-ai.xyz/api/og">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@ZyroxRH">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="https://zyro-ai.xyz/api/og">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="apple-mobile-web-app-title" content="Zyro">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
<link rel="stylesheet" href="/nav.css">
<link rel="stylesheet" href="/pro.css">
<link rel="stylesheet" href="/v2.css">
</head>'''

def header(home):
    h = '' if home else '/'
    return f'''<header class="top">
  <div class="wrap nav">
    <a class="brand" href="/" aria-label="Zyro home">
      {LOGO}
      ZYRO
    </a>
    <ul id="menu">
      <li><a href="/app" data-nav="app">Web app</a></li>
      <li><a href="/autotrade" data-nav="autotrade">Auto-trade</a></li>
      <li><a href="/agent" data-nav="agent">Agent</a></li>
      <li><a href="/trade" data-nav="trade">Trade</a></li>
      <li><a href="{h}#install">Install</a></li>
      <li><a href="{h}#roadmap">Roadmap</a></li>
      <li><a href="/chart" data-nav="token">Chart</a></li>
      <li><a href="/docs" data-nav="docs">Docs</a></li>
      <li class="menu-cta"><a class="btn btn-volt" data-link="telegram" href="#">Open the bot</a></li>
    </ul>
    <div class="nav-r">
      <a class="xbtn" href="https://x.com/zyroxrh" target="_blank" rel="noopener" aria-label="Zyro on X">{XSVG}</a>
      <a class="btn btn-volt top-cta" data-link="telegram" href="#">Open the bot</a>
      <button class="xbtn menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path class="l1" d="M4 7h16"/><path class="l2" d="M4 12h16"/><path class="l3" d="M4 17h16"/></svg></button>
    </div>
  </div>
</header>'''

def footer(home):
    h = '' if home else '/'
    items=[('home','/' if not home else '#top','Home'),('agent','/agent','Agent'),('trade','/trade','Trade'),('app','/app','Scan'),('token','/chart','Chart')]
    bnav='<nav class="bnav" aria-label="Pages">'+''.join(f'<a href="{href}" data-nav="{k}">{I}{ICON[k]}</svg><span>{t}</span></a>' for k,href,t in items)+'</nav>'
    return f'''<footer>
  <div class="wrap">
    <div class="foot-brand"><a class="brand" href="/" aria-label="Zyro home">{LOGO}ZYRO</a><span class="dot" aria-hidden="true">•</span><span>Built on Robinhood Chain</span></div>
    <nav aria-label="Footer"><a href="/app">Web app</a><a href="/agent">Agent</a><a href="/trade">Trade</a><a href="{h}#tiers">Holders</a><a href="{h}#roadmap">Roadmap</a><a href="{h}#token">Token</a><a href="/docs">Docs</a><a href="https://github.com/zyroai11/Zyro-Agent" target="_blank" rel="noopener">GitHub</a><a href="https://www.npmjs.com/package/zyro-agent" target="_blank" rel="noopener">npm</a><a href="/legal">Legal</a><a class="foot-x" href="https://x.com/zyroxrh" target="_blank" rel="noopener">{XSVG}@ZyroxRH</a></nav>
  </div>
</footer>
{bnav}
<script src="/app.js"></script>
<script src="/nav.js"></script>
</body>
</html>
'''

# ---------- home ----------
agent_home=agent.replace('</div>\n  </div>\n</section>','</div>\n    <div class="more"><a class="btn btn-line" href="/agent">Explore the agent</a></div>\n  </div>\n</section>',1)
trade_home=trade.replace('<ul class="facts">','<ul class="facts">',1)
trade_home=re.sub(r'(</ul>\n    </div>\n    <div class="tw">)', '</ul>\n      <div class="more"><a class="btn btn-ink" href="/trade">Open the trade page</a></div>\n    </div>\n    <div class="tw">', trade_home, count=1)
home=head("Zyro: the AI agent for Robinhood Chain","Zyro is the AI agent for Robinhood Chain. Scan any token from 0 to 100 on Telegram or the web, trade with your own rules from the terminal, and follow the live $ZYRO chart.")+'\n<body data-page="home">\n\n'+header(True)+'\n\n<main id="top">\n'+'\n\n'.join([hero,checks,how,agent_home,trade_home,tiers,road,token,close])+'\n</main>\n\n'+footer(True)
open("index.html","w").write(home)

# ---------- agent ----------
agent_page=head("Zyro Agent: scan, trade and provide liquidity on Robinhood Chain","One AI agent for Robinhood Chain: a token scanner on Telegram, a trading agent in your terminal, and LP management on the web.","/agent")+'\n<body data-page="agent">\n\n'+header(False)+f'''

<main id="top">
<section class="page-hero">
  <div class="wrap">
    <a class="crumb" href="/">← Back to home</a>
    <h1>One agent for Robinhood Chain</h1>
    <p class="lead">Zyro reads a token before you touch it. Then it can trade that token for you from the terminal, or provide liquidity for it on the web.</p>
    <div class="cta">
      <a class="btn btn-volt" data-link="telegram" href="#">Open the bot on Telegram</a>
      <a class="btn btn-line" href="/trade">See stocks and perps</a>
    </div>
  </div>
</section>

<section class="band suite" style="padding-top:24px">
  <div class="wrap">
    {tools}
  </div>
</section>

<section class="band">
  <div class="wrap pair">
    <div>
      <h2>Scan: the score before the buy</h2>
      <p class="lede">Send a contract address and Zyro reads eight signals: liquidity, buys and sells, pair age, FDV, volume, holders, contract and socials. Every warning is listed with the score.</p>
      <div class="cmds">
        <div><code>/scan</code><p>Safety score and full report for a Robinhood Chain token.</p></div>
        <div><code>/trending</code><p>Tokens getting attention on Robinhood Chain right now.</p></div>
        <div><code>/link</code><p>Link your wallet so holder access can switch on.</p></div>
        <div><code>/me</code><p>Your tier, balance and scans left today.</p></div>
      </div>
    </div>
    <div style="background:var(--ink);color:#fff;border-radius:30px;padding:6px">{demo}</div>
  </div>
</section>

<section class="band how">
  <div class="wrap pair flip">
    <div>
      <h2>Trade: an agent in your terminal</h2>
      <p class="lede">Tell it what to buy and the limits it must respect. It scans first, checks your rules, and only then places the trade.</p>
      <ul class="rules">
        <li>{CHECK}<div><b>Minimum score</b><span>Skip any token that scores below the number you set.</span></div></li>
        <li>{CHECK}<div><b>Size limits</b><span>A maximum per trade and a maximum loss per day.</span></div></li>
        <li>{CHECK}<div><b>Stop loss</b><span>Set on every position the moment it opens.</span></div></li>
        <li>{CHECK}<div><b>Runs on your machine</b><span>Your keys stay with you.</span></div></li>
      </ul>
      <p class="note note-dark" style="margin-top:22px">Live now. Install it with <code style="font:500 .9em var(--mono);color:var(--blue-deep);white-space:nowrap">npm install -g zyro-agent</code>, then run <code style="font:500 .9em var(--mono);color:var(--blue-deep);white-space:nowrap">zyro init</code>.</p>
    </div>
    <div class="dark-card">{term.replace('class="vis term"','class="term big"')}</div>
  </div>
</section>

<section class="band">
  <div class="wrap pair">
    <div>
      <h2>Provide liquidity with the risk in view</h2>
      <p class="lede">Add and manage LP positions from the Zyro website. Each pool shows its safety score before you deposit.</p>
      <ul class="rules">
        <li>{CHECK}<div><b>Score before deposit</b><span>Both tokens in the pool are scanned first.</span></div></li>
        <li>{CHECK}<div><b>Range alerts</b><span>A message when your position moves out of range.</span></div></li>
        <li>{CHECK}<div><b>Fees at a glance</b><span>What each position has earned so far.</span></div></li>
      </ul>
      <p class="note note-dark" style="margin-top:22px">Building next: phase 4.</p>
    </div>
    <div class="dark-card">{pool.replace('class="vis pool"','class="pool"')}</div>
  </div>
</section>

{close}
</main>

'''+footer(False)
open("agent.html","w").write(agent_page)

# ---------- trade ----------
rows=[('NVDA','Nvidia','Stock Token','Uniswap','188.40'),('AAPL','Apple','Stock Token','Uniswap','231.15'),('TSLA','Tesla','Stock Token','Uniswap','412.80'),('GOOG','Alphabet','Stock Token','Uniswap','198.62'),('NVDA-PERP','Nvidia','Perp','Lighter','188.40'),('BTC-PERP','Bitcoin','Perp','Lighter','96,250'),('GOLD-PERP','Gold','Perp','Lighter','2,712.50'),('OIL-PERP','WTI oil','Perp','Lighter','71.24')]
trs=''.join(f'<tr><td>{a}</td><td>{b}</td><td><span class="t{" p" if c=="Perp" else ""}">{c}</span></td><td>{d}</td><td>${e}</td></tr>' for a,b,c,d,e in rows)
PAIRS_DATA=[("NVDA","Nvidia","#76B900","Stock Token","Uniswap"),("AAPL","Apple","#8E8E93","Stock Token","Uniswap"),("TSLA","Tesla","#E31937","Stock Token","Uniswap"),("GOOGL","Alphabet","#4285F4","Stock Token","Uniswap"),("AMZN","Amazon","#FF9900","Stock Token","Uniswap"),("MSFT","Microsoft","#00A4EF","Stock Token","Uniswap"),("META","Meta","#0866FF","Stock Token","Uniswap"),("SPY","S&P 500 ETF","#3D5A80","Stock Token","Uniswap"),("TSLA-PERP","Tesla perp","#E31937","Perp","Lighter"),("NVDA-PERP","Nvidia perp","#76B900","Perp","Lighter"),("BTC-PERP","Bitcoin perp","#F7931A","Perp","Lighter"),("GOLD-PERP","Gold perp","#C9A227","Perp","Lighter")]
def badge(t,col,size=44):
    short=t.split("-")[0][:4]
    return f'<span class="tk{" l4" if len(short)>3 else ""}" style="--c:{col}" aria-hidden="true">{short}</span>'
PAIRS='''<section class="band how">
  <div class="wrap">
    <h2>Markets at launch</h2>
    <p class="lede">The first pairs planned for the Zyro trade page. Stock Tokens settle in USDG through Uniswap, perps run on Lighter.</p>
    <div class="pairs">'''+"".join(f'''<div class="pair-card">{badge(t,c)}<div><b>{t if typ=="Perp" else t+" / USDG"}</b><span>{n}</span></div><em class="{'p' if typ=='Perp' else ''}">{typ}</em><small>{v}</small></div>''' for t,n,c,typ,v in PAIRS_DATA)+'''</div>
  </div>
</section>'''
TICKERS='''<div class="tape" aria-label="Live market prices">
  <div class="tradingview-widget-container"><div class="tradingview-widget-container__widget"></div>
  <script src="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js" async>
  {"symbols":[{"proName":"NASDAQ:TSLA","title":"Tesla"},{"proName":"NASDAQ:NVDA","title":"Nvidia"},{"proName":"NASDAQ:AAPL","title":"Apple"},{"proName":"NASDAQ:GOOGL","title":"Alphabet"},{"proName":"NASDAQ:AMZN","title":"Amazon"},{"proName":"NASDAQ:MSFT","title":"Microsoft"},{"proName":"NASDAQ:META","title":"Meta"},{"proName":"AMEX:SPY","title":"S&P 500 ETF"},{"proName":"BITSTAMP:BTCUSD","title":"Bitcoin"},{"proName":"OANDA:XAUUSD","title":"Gold"}],"showSymbolLogo":true,"isTransparent":true,"displayMode":"adaptive","colorTheme":"dark","locale":"en"}
  </script></div>
</div>'''
ZL2='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4 7v5c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V7l-8-4Z"/></svg>'
TERMINAL=f'''<section class="band term-sec" id="preview">
  <div class="wrap wide">
    <div class="term-title"><h2>Trade terminal</h2><span class="soon">Preview</span></div>
    <div class="tgrid">
      <aside class="mlist">
        <div class="tabs" role="tablist" aria-label="Market type">
          <button role="tab" aria-selected="true" data-tab="stocks">Stocks</button>
          <button role="tab" aria-selected="false" data-tab="perps">Perps</button>
        </div>
        <div class="mrows" id="mkList" aria-label="Markets"></div>
      </aside>
      <div class="chartbox">
        <div class="chart-top" id="chartTop"></div>
        <div class="tv" id="tvChart"></div>
      </div>
      <div class="tw">
        <div class="panel">
          <div class="mhead" id="mhead"></div>
          <div class="side" id="side" hidden>
            <button data-s="long" aria-pressed="true">Long</button>
            <button data-s="short" aria-pressed="false">Short</button>
          </div>
          <div class="field"><div style="flex:1"><label for="amt">You pay</label><input id="amt" inputmode="decimal" value="100"></div><span class="unit">USDG</span></div>
          <div class="field" id="recvRow"><div><label>You get</label><div id="recv" class="recv">Filled at market price</div></div><span class="unit" id="recvUnit">TSLA</span></div>
          <div class="lev" id="levRow" hidden>
            <div><span>Leverage</span><b id="levv">5x</b></div>
            <input type="range" id="lev" min="1" max="20" value="5" aria-label="Leverage">
            <div><span>Position size</span><b id="pos">$500</b></div>
          </div>
          <div class="zc">{ZL2}<span id="zc"></span></div>
          <button class="go" disabled id="go">Trading opens soon</button>
        </div>
      </div>
    </div>
    <p class="note tnote">Charts show the underlying market, powered by TradingView. Orders are not live yet.</p>
  </div>
</section>'''

trade_page=head("Zyro Trade: stocks and perps on Robinhood Chain","Trade Stock Tokens and perps on Robinhood Chain from the Zyro website, with a Zyro check before every order.","/trade")+'\n<body data-page="trade">\n\n'+header(False)+f'''

<main id="top">
<section class="page-hero">
  <div class="wrap">
    <a class="crumb" href="/">← Back to home</a>
    <h1>Trade stocks and perps on Robinhood Chain</h1>
    <p class="lead">Tokenized US stocks through Uniswap and leveraged perps through Lighter, from one screen. Every order gets a Zyro check first.</p>
    <span class="soon">Coming soon</span>
  </div>
</section>

{TICKERS}

{TERMINAL}

{PAIRS}

<section class="band">
  <div class="wrap">
    <h2>How an order works</h2>
    <ol class="steps steps4">
      <li><h3>Connect your wallet</h3><p>Any wallet that supports Robinhood Chain. Zyro never holds your funds.</p></li>
      <li><h3>Pick a market</h3><p>A Stock Token to buy, or a perp to go long or short with USDG margin.</p></li>
      <li><h3>Read the Zyro check</h3><p>What the token is, and for perps, how far the price can move before liquidation.</p></li>
      <li><h3>Confirm in your wallet</h3><p>The order goes to Uniswap or Lighter on Robinhood Chain.</p></li>
    </ol>
  </div>
</section>

<section class="band how">
  <div class="wrap token-grid">
    <div>
      <h2>Good to know</h2>
      <p class="lede">Stock Tokens and perps are not offered in some countries, including the US, UK and Canada. The trade page will check your region before you can place an order.</p>
    </div>
    <div>
      <details open><summary>What is a Stock Token?</summary><p>A token issued by Robinhood Assets (Jersey) Limited that tracks the price of a US stock. It is a debt security, not the share itself, so it carries no voting rights.</p></details>
      <details><summary>What do I use as margin for perps?</summary><p>USDG, the dollar stablecoin used by Lighter on Robinhood Chain.</p></details>
      <details><summary>What is liquidation?</summary><p>If the price moves against a leveraged position far enough, the position is closed and the margin is lost. Higher leverage means a smaller move does it.</p></details>
      <details><summary>When does trading open?</summary><p>It is planned for phase 5 on the roadmap, after the scanner bot and holder access.</p></details>
    </div>
  </div>
</section>

{close}
</main>

'''+footer(False)
open("trade.html","w").write(trade_page)
print("ok")

exec(open('build_docs.py').read())
exec(open('build_app.py').read())
exec(open('build_chart.py').read())
exec(open('build_legal.py').read())
exec(open('build_home.py').read())
exec(open('build_autotrade.py').read())
