from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any
from .ml.directional_model import run_quant_directional_pipeline
from .ml.onchain_rug_model import evaluate_onchain_survival

app = FastAPI(
    title="VORTEX SOL Quant ML Engine",
    version="3.0.0",
    description="Full-Ecosystem Solana Quantitative ML & On-Chain Terminal Backend",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    tokenAddress: str
    timeframe: str = "5m"
    candles: list[dict[str, Any]]
    onchainMetrics: dict[str, Any] = {}


@app.get("/health")
def health_check():
    return {"status": "online", "engine": "VORTEX SOL Quant ML v3.0.0"}


@app.post("/api/v1/quant-analyze")
def analyze_solana_token(req: AnalyzeRequest):
    if len(req.candles) < 60:
        raise HTTPException(
            status_code=422,
            detail=f"Insufficient candles: {len(req.candles)} provided, minimum 60 required.",
        )

    directional_output = run_quant_directional_pipeline(req.candles)
    onchain_output = evaluate_onchain_survival(req.onchainMetrics)

    return {
        "tokenAddress": req.tokenAddress,
        "timeframe": req.timeframe,
        "modelVersion": "LightGBM-Microstructure-v3.0",
        "directional": directional_output,
        "onchainSurvival": onchain_output,
    }
