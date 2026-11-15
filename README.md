# zyro-ai.xyz

Website for Zyro, the AI agent for Robinhood Chain: home page, web app scanner, $ZYRO chart, docs and the edge API behind them.

## Layout

- `*.html` are generated. Edit `index.orig.html` and the `build*.py` files, then run `python3 build.py`.
- `api/` holds Vercel edge functions: `scan`, `trending`, `agent`, `holder`, `share`, `zyro-chart`, `og`, `icon`.
- `api/_zyro.js` is the shared scanner. The score rules match the Telegram bot and the terminal agent.

## Environment variables (Vercel)

| Key | Used for |
|---|---|
| `BLOCKSCOUT_API_KEY` | Holder count and contract verification in scans |
| `GEMINI_API_KEY` | Web agent answers and holder AI analysis |
| `GEMINI_MODEL` | Optional, defaults to `gemini-3.8-flash` |
| `HOLDER_MIN_BALANCE` | Optional, defaults to 100000 |

The terminal agent lives in [zyroai11/Zyro-Agent](https://github.com/zyroai11/Zyro-Agent).
