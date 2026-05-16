import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, AreaSeries, LineSeries } from 'lightweight-charts';
import axios from 'axios';

/**
 * AdvancedChart Component
 * Uses lightweight-charts for high-performance financial visualization.
 * Supports Zoom, Pan, and Compare modes.
 */
export default function AdvancedChart({ chartData, range, mainSymbol }) {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const areaSeriesRef = useRef(null);
  const compareSeriesRef = useRef(null);
  
  const [compareSymbol, setCompareSymbol] = useState('');
  const [compareData, setCompareData] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [loadingCompare, setLoadingCompare] = useState(false);

  // 1. Initialize Chart (Only once)
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
        fontSize: 10,
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.5)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.5)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 500,
      timeScale: {
        borderColor: 'rgba(30, 41, 59, 0.8)',
        timeVisible: true,
        secondsVisible: range === 'LIVE',
      },
      // Enable both scales to handle different price ranges
      leftPriceScale: {
        visible: true,
        borderColor: 'rgba(30, 41, 59, 0.8)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      rightPriceScale: {
        visible: true,
        borderColor: 'rgba(30, 41, 59, 0.8)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: '#10b981', width: 1, style: 3, labelBackgroundColor: '#10b981' },
        horzLine: { color: '#10b981', width: 1, style: 3, labelBackgroundColor: '#10b981' },
      },
    });

    // Main series on the RIGHT
    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#10b981',
      topColor: 'rgba(16, 185, 129, 0.4)',
      bottomColor: 'rgba(16, 185, 129, 0.0)',
      lineWidth: 3,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
      priceScaleId: 'right',
    });

    chartRef.current = chart;
    areaSeriesRef.current = areaSeries;

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        areaSeriesRef.current = null;
        compareSeriesRef.current = null;
      }
    };
  }, []); // Only run once

  // 2. Update Range Options
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.applyOptions({
        timeScale: {
          secondsVisible: range === 'LIVE',
        },
      });
    }
  }, [range]);

  // 3. Update Main Data
  useEffect(() => {
    if (!areaSeriesRef.current || !chartData) return;

    const formattedData = chartData
      .map(item => ({
        time: item.time,
        value: item.price || item.close,
      }))
      .sort((a, b) => a.time - b.time);

    // Filter out duplicates
    const uniqueData = [];
    const seenTimes = new Set();
    for (const item of formattedData) {
      if (!seenTimes.has(item.time)) {
        uniqueData.push(item);
        seenTimes.add(item.time);
      }
    }

    if (uniqueData.length > 0) {
      areaSeriesRef.current.setData(uniqueData);
      chartRef.current.timeScale().fitContent();
    }
  }, [chartData]);

  // 4. Handle Comparison
  useEffect(() => {
    if (!chartRef.current) return;

    if (!compareData) {
      if (compareSeriesRef.current) {
        chartRef.current.removeSeries(compareSeriesRef.current);
        compareSeriesRef.current = null;
      }
      return;
    }

    if (compareSeriesRef.current) {
      chartRef.current.removeSeries(compareSeriesRef.current);
    }

    // Put comparison on the LEFT scale so it's always visible regardless of price level
    const compareSeries = chartRef.current.addSeries(LineSeries, {
      color: '#6366f1',
      lineWidth: 2,
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
      title: compareSymbol.toUpperCase(),
      priceScaleId: 'left',
    });

    const formattedCompare = compareData
      .map(item => ({
        time: item.time,
        value: item.price || item.close,
      }))
      .sort((a, b) => a.time - b.time);

    const uniqueCompare = [];
    const seenTimes = new Set();
    for (const item of formattedCompare) {
      if (!seenTimes.has(item.time)) {
        uniqueCompare.push(item);
        seenTimes.add(item.time);
      }
    }

    compareSeries.setData(uniqueCompare);
    compareSeriesRef.current = compareSeries;

  }, [compareData, compareSymbol]);


  const handleCompareSubmit = async (e) => {
    e.preventDefault();
    if (!compareSymbol) return;

    setLoadingCompare(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/historical/history/${compareSymbol.toUpperCase()}?range=${range}`
      );
      if (response.data && response.data.success) {
        setCompareData(response.data.data);
        setIsComparing(true);
      } else {
        alert("No data found for " + compareSymbol);
      }
    } catch (err) {
      console.error("Comparison fetch error:", err);
      alert("Error fetching comparison stock");
    } finally {
      setLoadingCompare(false);
    }
  };

  const clearCompare = () => {
    setCompareData(null);
    setCompareSymbol('');
    setIsComparing(false);
  };

  return (
    <div className="relative w-full h-full flex flex-col min-h-[400px]">
      {/* Overlay UI */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <form onSubmit={handleCompareSubmit} className="flex items-center">
          <input 
            type="text"
            placeholder="Compare symbol..."
            value={compareSymbol}
            onChange={(e) => setCompareSymbol(e.target.value)}
            className="bg-slate-900/90 border border-slate-800 rounded-l-xl px-4 py-2 text-[10px] font-black tracking-widest text-white outline-none focus:border-emerald-500/50 w-36 transition-all placeholder:text-slate-600 uppercase"
          />
          <button 
            type="submit"
            disabled={loadingCompare}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black px-4 py-2 rounded-r-xl text-[10px] font-black tracking-widest uppercase transition-all"
          >
            {loadingCompare ? '...' : 'Add'}
          </button>
        </form>

        {isComparing && (
          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-xl">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{compareSymbol.toUpperCase()}</span>
            <button onClick={clearCompare} className="text-indigo-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        )}
      </div>

      <div className="absolute top-4 right-4 z-20 pointer-events-none text-right">
        <div className="text-[10px] font-black text-emerald-500 tracking-[0.2em] uppercase">{mainSymbol} DATA</div>
        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Live Financial Engine</div>
      </div>

      {/* Container */}
      <div ref={chartContainerRef} className="flex-1 w-full h-full" />
      
      {/* Legend / Info */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-800/50">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{mainSymbol}</span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-20 pointer-events-none bg-slate-900/40 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-800/50">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Zoom: Scroll • Pan: Drag</span>
      </div>
    </div>
  );
}
