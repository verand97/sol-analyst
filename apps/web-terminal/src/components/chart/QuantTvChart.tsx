'use client';

import React, { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  LineStyle,
} from 'lightweight-charts';
import { OHLCVCandle } from '@/types/quant';

interface Props {
  data: OHLCVCandle[];
  targetBarrier?: number;
  stopBarrier?: number;
  vwapData?: Array<{ time: number; value: number }>;
}

export default function QuantTvChart({ data, targetBarrier, stopBarrier, vwapData }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const latestPrice = data[data.length - 1]?.close || 100;
    const precision = latestPrice < 0.001 ? 8 : latestPrice < 1 ? 4 : 2;
    const minMove = latestPrice < 0.001 ? 0.00000001 : latestPrice < 1 ? 0.0001 : 0.01;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0B0D12' },
        textColor: '#8B949E',
        fontFamily: "'JetBrains Mono', 'Geist Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#131722' },
        horzLines: { color: '#131722' },
      },
      crosshair: {
        vertLine: { color: '#38BDF860', width: 1, style: LineStyle.Dashed },
        horzLine: { color: '#38BDF860', width: 1, style: LineStyle.Dashed },
      },
      rightPriceScale: {
        borderColor: '#1E2430',
        scaleMargins: { top: 0.1, bottom: 0.25 },
        autoScale: true,
      },
      timeScale: {
        borderColor: '#1E2430',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true },
    });

    // Candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00E676',
      downColor: '#FF453A',
      borderVisible: false,
      wickUpColor: '#00E676',
      wickDownColor: '#FF453A',
      priceFormat: {
        type: 'price',
        precision,
        minMove,
      },
    });

    candleSeries.setData(
      data.map((c) => ({
        time: c.time as unknown as import('lightweight-charts').Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    // ML Target Barrier (TP) — garis putus-putus emerald
    if (targetBarrier) {
      candleSeries.createPriceLine({
        price: targetBarrier,
        color: '#00E676',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: '▲ ML TARGET +1.5×ATR',
      });
    }

    // ML Stop Barrier (SL) — garis putus-putus merah
    if (stopBarrier) {
      candleSeries.createPriceLine({
        price: stopBarrier,
        color: '#FF453A',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: '▼ ML STOP −1.0×ATR',
      });
    }

    // VWAP Line (opsional)
    if (vwapData && vwapData.length > 0) {
      const vwapSeries = chart.addSeries(LineSeries, {
        color: '#38BDF8',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        title: 'VWAP',
        priceLineVisible: false,
        lastValueVisible: false,
      });
      vwapSeries.setData(
        vwapData.map((v) => ({
          time: v.time as unknown as import('lightweight-charts').Time,
          value: v.value,
        }))
      );
    }

    // Volume histogram
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    volumeSeries.setData(
      data.map((c) => ({
        time: c.time as unknown as import('lightweight-charts').Time,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(0, 230, 118, 0.35)' : 'rgba(255, 69, 58, 0.35)',
      }))
    );

    chart.timeScale().fitContent();

    const onResize = () => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    const observer = new ResizeObserver(onResize);
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, [data, targetBarrier, stopBarrier, vwapData]);

  return <div ref={containerRef} className="w-full h-full min-h-95" />;
}
