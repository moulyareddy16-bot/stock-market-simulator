import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode, CandlestickSeries, LineSeries } from 'lightweight-charts';
import axios from 'axios';

const AdvancedChart = ({ chartData, range, mainSymbol }) => {
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const candlestickSeriesRef = useRef();
    const lineSeriesRef = useRef();
    const comparisonSeriesRef = useRef();

    const [seriesType, setSeriesType] = useState('candlestick');
    const [comparisonSymbol, setComparisonSymbol] = useState('');
    const [showComparisonInput, setShowComparisonInput] = useState(false);
    const [comparisonData, setComparisonData] = useState(null);
    const [loadingComparison, setLoadingComparison] = useState(false);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            // ... options
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: 'rgba(51, 65, 85, 0.5)' },
                horzLines: { color: 'rgba(51, 65, 85, 0.5)' },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    width: 1,
                    color: '#64748b',
                    style: 2, 
                    labelBackgroundColor: '#0f172a',
                },
                horzLine: {
                    width: 1,
                    color: '#64748b',
                    style: 2, 
                    labelBackgroundColor: '#0f172a',
                },
            },
            rightPriceScale: {
                borderColor: 'rgba(51, 65, 85, 0.5)',
                autoScale: true,
            },
            timeScale: {
                borderColor: 'rgba(51, 65, 85, 0.5)',
                timeVisible: true,
                secondsVisible: false,
            },
            handleScroll: true,
            handleScale: true,
        });

        chartRef.current = chart;

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
            chartRef.current = null;
            candlestickSeriesRef.current = null;
            lineSeriesRef.current = null;
            comparisonSeriesRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!chartRef.current || !chartData || chartData.length === 0) return;

        try {
            if (candlestickSeriesRef.current) {
                chartRef.current.removeSeries(candlestickSeriesRef.current);
                candlestickSeriesRef.current = null;
            }
            if (lineSeriesRef.current) {
                chartRef.current.removeSeries(lineSeriesRef.current);
                lineSeriesRef.current = null;
            }

            if (seriesType === 'candlestick') {
                candlestickSeriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
                    upColor: '#10b981',
                    downColor: '#ef4444',
                    borderVisible: false,
                    wickUpColor: '#10b981',
                    wickDownColor: '#ef4444',
                });
                candlestickSeriesRef.current.setData(chartData);
            } else {
                lineSeriesRef.current = chartRef.current.addSeries(LineSeries, {
                    color: '#10b981',
                    lineWidth: 2,
                });
                const lineData = chartData.map(d => ({ time: d.time, value: d.close }));
                lineSeriesRef.current.setData(lineData);
            }

            chartRef.current.timeScale().fitContent();
        } catch (err) {
            console.warn("Chart series update failed (likely chart was recreated):", err);
        }
    }, [chartData, seriesType]);

    const handleAddComparison = async () => {
        if (!comparisonSymbol) return;
        setLoadingComparison(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/historical/history/${comparisonSymbol.toUpperCase()}?range=${range}`);
            if (response.data.success) {
                const data = response.data.data;
                setComparisonData(data);
                setShowComparisonInput(false);
                
                if (comparisonSeriesRef.current) {
                    chartRef.current.removeSeries(comparisonSeriesRef.current);
                }

                comparisonSeriesRef.current = chartRef.current.addSeries(LineSeries, {
                    color: '#6366f1', 
                    lineWidth: 2,
                    title: comparisonSymbol.toUpperCase(),
                });
                
                const compLineData = data.map(d => ({ time: d.time, value: d.close }));
                comparisonSeriesRef.current.setData(compLineData);
            }
        } catch (error) {
            console.error("Failed to fetch comparison data:", error);
        } finally {
            setLoadingComparison(false);
        }
    };

    const removeComparison = () => {
        if (comparisonSeriesRef.current) {
            chartRef.current.removeSeries(comparisonSeriesRef.current);
            comparisonSeriesRef.current = null;
        }
        setComparisonData(null);
        setComparisonSymbol('');
    };

    if (!chartData || chartData.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    Initializing Terminal...
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 bg-slate-950/50 p-2 rounded-2xl border border-slate-800/50">
                <div className="flex items-center gap-2">
                    <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
                        <button
                            onClick={() => setSeriesType('candlestick')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${seriesType === 'candlestick' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}
                        >
                            CANDLES
                        </button>
                        <button
                            onClick={() => setSeriesType('line')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${seriesType === 'line' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}
                        >
                            LINE
                        </button>
                    </div>

                    {comparisonData && (
                        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3 py-1.5 animate-fade-in">
                            <span className="text-[10px] font-black text-indigo-400">VS {comparisonSymbol.toUpperCase()}</span>
                            <button onClick={removeComparison} className="text-indigo-400 hover:text-white transition">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {showComparisonInput ? (
                        <div className="flex items-center gap-2 animate-slide-left">
                            <input
                                type="text"
                                placeholder="Ticker..."
                                value={comparisonSymbol}
                                onChange={(e) => setComparisonSymbol(e.target.value)}
                                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-[10px] font-black text-white outline-none focus:border-emerald-500 w-24"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComparison()}
                            />
                            <button
                                onClick={handleAddComparison}
                                disabled={loadingComparison}
                                className="bg-emerald-500 text-black rounded-xl px-3 py-1.5 text-[10px] font-black hover:bg-emerald-400 disabled:opacity-50"
                            >
                                {loadingComparison ? '...' : 'ADD'}
                            </button>
                            <button
                                onClick={() => setShowComparisonInput(false)}
                                className="text-slate-500 hover:text-white px-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowComparisonInput(true)}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl px-3 py-1.5 text-[10px] font-black text-slate-400 hover:text-white transition group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 group-hover:rotate-90 transition-transform"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                            COMPARE
                        </button>
                    )}
                </div>
            </div>

            <div ref={chartContainerRef} className="flex-1 w-full min-h-0" />
        </div>
    );
};

export default AdvancedChart;
