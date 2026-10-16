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

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#101216' },
        textColor: '#7D8590',
        fontFamily: "'JetBrains Mono', 'Geist Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#13171E' },
        horzLines: { color: '#13171E' },
      },
      crosshair: {
        vertLine: { color: '#38BDF840', width: 1, style: LineStyle.Dashed },
        horzLine: { color: '#38BDF840', width: 1, style: LineStyle.Dashed },
      },
      rightPriceScale: {
        borderColor: '#1E222B',
        scaleMargins: { top: 0.08, bottom: 0.26 },
      },
      timeScale: {
        borderColor: '#1E222B',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true },
    });

    // Candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00C853',
      downColor: '#FF3B30',
      borderVisible: false,
      wickUpColor: '#00C853',
      wickDownColor: '#FF3B30',
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

    // ML Target Barrier (TP) — garis putus-putus hijau
    if (targetBarrier) {
      candleSeries.createPriceLine({
        price: targetBarrier,
        color: '#00C853',
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
        color: '#FF3B30',
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
        color: c.close >= c.open ? 'rgba(0, 200, 83, 0.22)' : 'rgba(255, 59, 48, 0.22)',
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

  return <div ref={containerRef} className="w-full h-full" />;
}
