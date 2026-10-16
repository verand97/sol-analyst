import numpy as np
import pandas as pd

FEATURE_COLUMNS = [
    "orderflow_imb_6",
    "cvd_zscore_24",
    "vwap_dist_atr",
    "vol_shock_ratio",
    "rsi_14",
    "ema_spread_atr",
    "natr_14",
]


def compute_microstructure_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Menerima DataFrame OHLCV (time, open, high, low, close, volume)
    dan menghasilkan fitur mikrostruktur pasar secara kuantitatif.
    """
    data = df.copy().sort_values("time").reset_index(drop=True)

    # 1. Estimasi Buy vs Sell Volume dari struktur bar (Close Location Value)
    hl_range = (data["high"] - data["low"]).replace(0, 1e-9)
    buy_ratio = ((data["close"] - data["low"]) / hl_range).clip(0.0, 1.0)
    data["buy_vol"] = data["volume"] * buy_ratio
    data["sell_vol"] = data["volume"] * (1.0 - buy_ratio)
    data["vol_delta"] = data["buy_vol"] - data["sell_vol"]

    # 2. Orderflow Imbalance (6 bar bergulir)
    vol_sum_6 = data["volume"].rolling(6).sum().replace(0, 1e-9)
    delta_sum_6 = data["vol_delta"].rolling(6).sum()
    data["orderflow_imb_6"] = (delta_sum_6 / vol_sum_6).clip(-1.0, 1.0)

    # 3. Cumulative Volume Delta (CVD) Z-Score (24 bar)
    cvd_mean = data["vol_delta"].rolling(24).mean()
    cvd_std = data["vol_delta"].rolling(24).std().replace(0, 1e-9)
    data["cvd_zscore_24"] = ((data["vol_delta"] - cvd_mean) / cvd_std).clip(-4.0, 4.0)

    # 4. Average True Range (ATR 14) & Normalized ATR
    prev_close = data["close"].shift(1)
    tr1 = data["high"] - data["low"]
    tr2 = (data["high"] - prev_close).abs()
    tr3 = (data["low"] - prev_close).abs()
    true_range = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    data["atr_14"] = true_range.rolling(14).mean().bfill()
    data["natr_14"] = (data["atr_14"] / data["close"].replace(0, 1e-9)) * 100.0

    # 5. Rolling VWAP (24 bar) & Jarak dalam satuan ATR
    typical_price = (data["high"] + data["low"] + data["close"]) / 3.0
    tp_vol_24 = (typical_price * data["volume"]).rolling(24).sum()
    vol_24 = data["volume"].rolling(24).sum().replace(0, 1e-9)
    data["vwap_24"] = tp_vol_24 / vol_24
    data["vwap_dist_atr"] = (data["close"] - data["vwap_24"]) / data["atr_14"].replace(0, 1e-9)

    # 6. Volume Shock Ratio (Volume saat ini dibanding MA 20)
    vol_ma_20 = data["volume"].rolling(20).mean().replace(0, 1e-9)
    data["vol_shock_ratio"] = (data["volume"] / vol_ma_20).clip(0.0, 10.0)

    # 7. Momentum RSI (14) & EMA Spread
    delta_p = data["close"].diff()
    gain = delta_p.clip(lower=0).rolling(14).mean()
    loss = (-delta_p.clip(upper=0)).rolling(14).mean().replace(0, 1e-9)
    rs = gain / loss
    data["rsi_14"] = 100.0 - (100.0 / (1.0 + rs))

    ema_20 = data["close"].ewm(span=20, adjust=False).mean()
    ema_50 = data["close"].ewm(span=50, adjust=False).mean()
    data["ema_spread_atr"] = (ema_20 - ema_50) / data["atr_14"].replace(0, 1e-9)

    return data.bfill().fillna(0.0)


def apply_volatility_barriers(
    df: pd.DataFrame, horizon: int = 12, tp_mult: float = 1.5, sl_mult: float = 1.0
) -> pd.Series:
    """
    Memberi label 1 jika harga menyentuh Upper Barrier (+1.5 ATR) sebelum Lower Barrier (-1.0 ATR)
    dalam `horizon` candle ke depan, dan 0 jika sebaliknya.
    """
    closes = df["close"].values
    highs = df["high"].values
    lows = df["low"].values
    atrs = df["atr_14"].values
    n = len(df)
    labels = np.zeros(n, dtype=int)

    for i in range(n - horizon):
        entry = closes[i]
        atr = max(atrs[i], entry * 0.002)
        upper_tp = entry + (tp_mult * atr)
        lower_sl = entry - (sl_mult * atr)

        outcome = 0
        for j in range(i + 1, i + 1 + horizon):
            hit_tp = highs[j] >= upper_tp
            hit_sl = lows[j] <= lower_sl
            if hit_tp and not hit_sl:
                outcome = 1
                break
            if hit_sl:
                outcome = 0
                break
            if j == i + horizon:
                outcome = 1 if closes[j] > entry else 0
        labels[i] = outcome

    return pd.Series(labels, index=df.index)
