def evaluate_onchain_survival(onchain_metrics: dict) -> dict:
    """
    Menganalisa probabilitas Rug-Pull / Dump pada token SPL berdasarkan
    parameter kontrak & distribusi dompet.
    Engine B: On-Chain Survival & Anomaly Detector
    """
    mint_disabled = onchain_metrics.get("mintAuthorityDisabled", True)
    freeze_disabled = onchain_metrics.get("freezeAuthorityDisabled", True)
    lp_burned_pct = float(onchain_metrics.get("lpBurnedPercent", 95.0))
    top10_pct = float(onchain_metrics.get("top10HoldersPercent", 14.0))
    bundler_pct = float(onchain_metrics.get("firstBlockBundlerPercent", 4.0))

    rug_risk_score = 5.0
    if not mint_disabled:
        rug_risk_score += 45.0
    if not freeze_disabled:
        rug_risk_score += 25.0
    if lp_burned_pct < 80.0:
        rug_risk_score += (80.0 - lp_burned_pct) * 0.4
    if top10_pct > 25.0:
        rug_risk_score += (top10_pct - 25.0) * 0.8
    if bundler_pct > 15.0:
        rug_risk_score += (bundler_pct - 15.0) * 0.9

    rug_prob = min(99.0, max(1.5, round(rug_risk_score, 1)))
    survival_score = round(100.0 - rug_prob, 1)

    status = "SAFE_STRUCTURE"
    if rug_prob >= 60.0:
        status = "CRITICAL_RUG_RISK"
    elif rug_prob >= 30.0:
        status = "ELEVATED_CONCENTRATION_RISK"

    return {
        "rugPullProbability": rug_prob,
        "survivalScore": survival_score,
        "securityStatus": status,
        "metrics": {
            "mintAuthorityDisabled": mint_disabled,
            "freezeAuthorityDisabled": freeze_disabled,
            "lpBurnedPercent": lp_burned_pct,
            "top10HoldersPercent": top10_pct,
            "firstBlockBundlerPercent": bundler_pct,
        },
    }
