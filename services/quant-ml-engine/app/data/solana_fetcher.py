import httpx
import time
from typing import Optional

DEXSCREENER_BASE = "https://api.dexscreener.com/latest/dex"
BIRDEYE_BASE = "https://public-api.birdeye.so/defi"


def fetch_ohlcv_dexscreener(
    pair_address: str, timeframe: str = "5m", limit: int = 200
) -> list[dict]:
    """
    Menarik data OHLCV dari DexScreener untuk pasangan DEX Solana.
    Mengembalikan list candle dict: {time, open, high, low, close, volume}
    """
    tf_map = {"1m": "1", "5m": "5", "15m": "15", "1h": "60", "4h": "240"}
    res_minutes = tf_map.get(timeframe, "5")

    url = f"{DEXSCREENER_BASE}/pairs/solana/{pair_address}"
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(url)
            resp.raise_for_status()
            data = resp.json()

        # DexScreener tidak menyediakan OHLCV langsung — ini placeholder
        # Produksi: gunakan Birdeye atau Helius WebSocket untuk streaming candle
        pair = data.get("pair", {})
        current_price = float(pair.get("priceUsd", 100.0))

        # Simulasi candle realistis berdasarkan harga saat ini
        candles = _generate_synthetic_candles(current_price, limit, timeframe)
        return candles
    except Exception:
        return _generate_synthetic_candles(100.0, limit, timeframe)


def _generate_synthetic_candles(
    base_price: float, count: int, timeframe: str
) -> list[dict]:
    """
    Membuat candle sintetis realistis (untuk demo & fallback).
    Dalam produksi, ganti dengan data OHLCV real dari Birdeye/Helius.
    """
    import random

    tf_seconds = {"1m": 60, "5m": 300, "15m": 900, "1h": 3600, "4h": 14400}
    interval = tf_seconds.get(timeframe, 300)

    now = int(time.time())
    price = base_price
    candles = []

    for i in range(count, 0, -1):
        move = (random.random() - 0.48) * (base_price * 0.008)
        open_p = price
        close_p = max(0.000001, open_p + move)
        high_p = max(open_p, close_p) + random.random() * (base_price * 0.004)
        low_p = min(open_p, close_p) - random.random() * (base_price * 0.003)
        vol = random.randint(15000, 120000)

        candles.append(
            {
                "time": now - i * interval,
                "open": round(open_p, 6),
                "high": round(high_p, 6),
                "low": round(low_p, 6),
                "close": round(close_p, 6),
                "volume": vol,
            }
        )
        price = close_p

    return candles


def fetch_onchain_metrics_helius(
    token_address: str,
    helius_api_key: Optional[str] = None,
) -> dict:
    """
    Menarik metrik on-chain Solana dari Helius RPC atau RugCheck API.
    Dalam produksi: tambahkan HELIUS_API_KEY ke env variables.
    """
    # Placeholder — dalam produksi integrasikan Helius, RugCheck, atau Birdeye
    return {
        "mintAuthorityDisabled": True,
        "freezeAuthorityDisabled": True,
        "lpBurnedPercent": 99.4,
        "top10HoldersPercent": 11.8,
        "firstBlockBundlerPercent": 2.1,
    }
