# ---------- terms and privacy ---------- (run from build.py)
legal_body = '''
<main id="top">
<section class="page-hero">
  <div class="wrap">
    <a class="crumb" href="/">← Back to home</a>
    <h1>Terms and privacy</h1>
    <p class="lead">The short version: Zyro shows public data to help you decide. It does not hold your money and it is not financial advice.</p>
  </div>
</section>
<section class="band" style="padding-top:64px">
  <div class="wrap docs">
    <nav class="toc" id="toc" aria-label="On this page"><a href="#terms">Terms of use</a><a href="#privacy">Privacy</a></nav>
    <div class="doc">
      <section id="terms">
        <h2>Terms of use</h2>
        <p>Last updated 15 November 2026.</p>
        <ul>
          <li><strong>Information only.</strong> Scores, reports, charts and AI answers are built from public data. They are not financial, investment or legal advice.</li>
          <li><strong>No guarantee.</strong> A high score means no obvious warning signs at the moment of the scan. Tokens can still fail, liquidity can be pulled and data sources can be wrong or late.</li>
          <li><strong>Your decisions are yours.</strong> You are responsible for every trade you make, including trades placed by the terminal agent under rules you set.</li>
          <li><strong>You hold your keys.</strong> Zyro never takes custody of funds. The terminal agent runs on your machine with a key you provide. Keep it safe and use a separate wallet.</li>
          <li><strong>$ZYRO.</strong> The token unlocks features in Zyro products. It is not a share, a security or a promise of profit.</li>
          <li><strong>Availability.</strong> Some features, including Stock Tokens and perps, are not offered in every country. Follow the laws where you live.</li>
          <li><strong>No warranty.</strong> The service is provided as is. It may change, pause or stop at any time.</li>
        </ul>
        <p style="margin-top:16px">Questions: message <a href="https://x.com/zyroxrh" target="_blank" rel="noopener">@ZyroxRH</a> on X.</p>
      </section>
      <section id="privacy">
        <h2>Privacy</h2>
        <p>Zyro is built to need as little about you as possible.</p>
        <ul>
          <li><strong>Website.</strong> Scanning needs no account. If you log in on the trade page, Privy creates your trading wallet and Zyro stores your open positions to run take profit and stop loss.</li>
          <li><strong>Telegram bot.</strong> The bot stores your Telegram user ID, the public wallet address you link and your daily scan count, so it can apply the free limit and holder access.</li>
          <li><strong>Agent messages.</strong> Questions you send to the web agent or AI analysis may be passed to an AI model provider to write the answer. Do not include personal information.</li>
          <li><strong>Analytics and logs.</strong> We count page views without cookies. Our host keeps standard server logs, such as IP address and browser type, for security.</li>
          <li><strong>Never collected.</strong> Seed phrases and private keys. Zyro will never ask for them.</li>
          <li><strong>Other services.</strong> Market and chain data comes from DexScreener, RugCheck, Blockscout and the Robinhood Chain RPC. Links to Stonk.fun, Telegram and X follow their own policies.</li>
        </ul>
        <p style="margin-top:16px">To have your bot data removed, message <a href="https://x.com/zyroxrh" target="_blank" rel="noopener">@ZyroxRH</a> on X.</p>
      </section>
    </div>
  </div>
</section>
</main>

'''
legal_page = head("Zyro terms and privacy", "Terms of use and privacy for Zyro, the AI agent for Solana. Information only, not financial advice.", "/legal") \
    + '\n<body data-page="docs">\n\n' + header(False) + '\n' + legal_body + footer(False)
open("legal.html", "w").write(legal_page)
