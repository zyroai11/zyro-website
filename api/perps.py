"""Lighter signer for Zyro perps (Robinhood Chain instance).

Internal endpoint: only /api/trade (Node) calls it, with the x-zyro-internal header.
It never sees an Ethereum key. The Privy wallet signs the L1 message in Node.

POST /api/perps  {"op": ..., ...}
  keygen                                   -> {private_key, public_key}
  change_key_prepare  account_index, api_key_index, private_key, public_key
                                           -> {tx_type, tx_info, message}
  send               account_index, api_key_index, private_key, tx_type, tx_info, l1_sig?
  market_order       account_index, api_key_index, private_key, market_index, base_amount, avg_price, is_ask, reduce_only
  tpsl               ... market_index, base_amount, trigger_price, price, is_ask, kind ("tp"|"sl")
  leverage           ... market_index, leverage, margin_mode (0 cross, 1 isolated)
  cancel_all         ... (cancels every open order of the account)
  withdraw           ... amount (USDG, float)
"""
import asyncio, json, os, time
from http.server import BaseHTTPRequestHandler

import lighter
from lighter.signer_client import decode_and_free

URL = "https://api.rh.lighter.xyz"
CHAIN_ID = 466324
USDG_ASSET = 3


def _client(b):
    return lighter.SignerClient(url=URL, account_index=int(b["account_index"]),
                                api_private_keys={int(b["api_key_index"]): b["private_key"]}, chain_id=CHAIN_ID)


def _resp(api_response):
    try:
        return api_response.to_dict()
    except Exception:
        return str(api_response)


async def run(b):
    op = b.get("op")
    if op == "keygen":
        pk, pub, err = lighter.create_api_key()
        if err:
            raise ValueError(err)
        return {"private_key": pk, "public_key": pub}

    c = _client(b)
    try:
        aki = int(b["api_key_index"]); acc = int(b["account_index"])
        if op == "change_key_prepare":
            n = await c.tx_api.next_nonce(account_index=acc, api_key_index=aki)
            r = c.signer.SignChangePubKey(b["public_key"].encode(), 0, int(n.nonce), aki, acc)
            err = decode_and_free(r.err)
            if err:
                raise ValueError(err)
            return {"tx_type": r.txType, "tx_info": decode_and_free(r.txInfo), "message": decode_and_free(r.messageToSign)}

        if op == "send":
            info = json.loads(b["tx_info"])
            if b.get("l1_sig"):
                info["L1Sig"] = b["l1_sig"]
            res = await c.send_tx(tx_type=int(b["tx_type"]), tx_info=json.dumps(info))
            return {"ok": True, "response": _resp(res)}

        err = c.check_client()
        if err:
            raise ValueError("API key not active yet: " + str(err))

        if op == "market_order":
            tx, res, err = await c.create_market_order(
                market_index=int(b["market_index"]), client_order_index=int(time.time() * 1000) % 2**31,
                base_amount=int(b["base_amount"]), avg_execution_price=int(b["avg_price"]),
                is_ask=bool(b["is_ask"]), reduce_only=bool(b.get("reduce_only", False)), api_key_index=aki)
        elif op == "tpsl":
            fn = c.create_tp_order if b["kind"] == "tp" else c.create_sl_order
            tx, res, err = await fn(
                market_index=int(b["market_index"]), client_order_index=int(time.time() * 1000) % 2**31 + (1 if b["kind"] == "sl" else 0),
                base_amount=int(b["base_amount"]), trigger_price=int(b["trigger_price"]), price=int(b["price"]),
                is_ask=bool(b["is_ask"]), reduce_only=True, api_key_index=aki)
        elif op == "leverage":
            tx, res, err = await c.update_leverage(int(b["market_index"]), int(b.get("margin_mode", 0)), int(b["leverage"]), api_key_index=aki)
        elif op == "cancel_all":
            tx, res, err = await c.cancel_all_orders(time_in_force=c.CANCEL_ALL_TIF_IMMEDIATE, timestamp_ms=0, api_key_index=aki)
        elif op == "withdraw":
            tx, res, err = await c.withdraw(asset_id=USDG_ASSET, route_type=c.ROUTE_PERP, amount=float(b["amount"]), api_key_index=aki)
        else:
            raise ValueError("unknown op")
        if err:
            raise ValueError(str(err))
        return {"ok": True, "response": _resp(res)}
    finally:
        await c.close()


class handler(BaseHTTPRequestHandler):
    def _send(self, status, body):
        data = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("content-type", "application/json")
        self.send_header("cache-control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        key = (os.environ.get("TICK_SECRET") or "").strip()
        if not key or self.headers.get("x-zyro-internal") != key:
            return self._send(401, {"error": "internal only"})
        try:
            n = int(self.headers.get("content-length") or 0)
            body = json.loads(self.rfile.read(n) or b"{}")
            return self._send(200, asyncio.run(run(body)))
        except Exception as e:  # noqa: BLE001
            msg = str(e)
            for k in ("private_key", "l1_sig"):
                msg = msg.replace(str(locals().get("body", {}).get(k, "")), "***") if isinstance(locals().get("body"), dict) and locals()["body"].get(k) else msg
            return self._send(400, {"error": msg[:400]})

    def do_GET(self):
        # health check: proves the native signer loads on this runtime
        pk, pub, err = lighter.create_api_key()
        return self._send(200, {"signer": "ok" if not err else err, "chain_id": CHAIN_ID, "url": URL})
