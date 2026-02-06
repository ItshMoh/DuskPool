import React, { useRef, useEffect } from 'react';
import {
  BarChart2, Activity, Settings,
  Minus, ArrowRight, Type, Trash2,
  MousePointer, MoveHorizontal, GitBranch,
  Circle, Square, TrendingUp
} from 'lucide-react';
import { createChart } from 'lightweight-charts';
import type { IChartApi, CandlestickData, Time } from 'lightweight-charts';
import type { ChartType, ChartView, Drawing, DrawingTool, DrawingToolOption } from './types';

const drawingTools: DrawingToolOption[] = [
  { tool: 'cursor', icon: MousePointer, label: 'Cursor' },
  { tool: 'line', icon: Minus, label: 'Line' },
  { tool: 'hline', icon: MoveHorizontal, label: 'Horizontal Line' },
  { tool: 'trendline', icon: TrendingUp, label: 'Trend Line' },
  { tool: 'fib', icon: GitBranch, label: 'Fibonacci' },
  { tool: 'arrow', icon: ArrowRight, label: 'Arrow' },
  { tool: 'rect', icon: Square, label: 'Rectangle' },
  { tool: 'circle', icon: Circle, label: 'Circle' },
  { tool: 'text', icon: Type, label: 'Text' },
];

interface TradeChartProps {
  chartType: ChartType;
  chartView: ChartView;
  setChartView: (view: ChartView) => void;
  candleData: CandlestickData<Time>[];
  onPriceUpdate: (price: string) => void;
  onOpenSettings: () => void;
  drawings: Drawing[];
  setDrawings: React.Dispatch<React.SetStateAction<Drawing[]>>;
}

export const TradeChart: React.FC<TradeChartProps> = ({
  chartType,
  chartView,
  setChartView,
  candleData,
  onPriceUpdate,
  onOpenSettings,
  drawings,
  setDrawings,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
  const drawingCanvasRef = useRef<SVGSVGElement>(null);
  const candleDataRef = useRef<CandlestickData<Time>[]>(candleData);

  const [selectedTool, setSelectedTool] = React.useState<DrawingTool>('cursor');
  const [currentDrawing, setCurrentDrawing] = React.useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);

  // Update candleDataRef when candleData prop changes
  useEffect(() => {
    candleDataRef.current = candleData;

    // Update existing chart with new data
    if (seriesRef.current && candleData.length > 0) {
      try {
        if (chartType === 'candle' || chartType === 'bar') {
          seriesRef.current.setData(candleData);
        } else {
          seriesRef.current.setData(candleData.map((d: CandlestickData<Time>) => ({ time: d.time, value: d.close })));
        }
        chartRef.current?.timeScale().fitContent();
      } catch (e) {
        // Chart may be recreating, ignore
      }
    }
  }, [candleData, chartType]);

  // Initialize and update chart when type changes
  useEffect(() => {
    if (chartView !== 'price' || !chartContainerRef.current) return;

    // Clean up previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.03)' },
        horzLines: { color: 'rgba(255,255,255,0.03)' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: 'rgba(99, 102, 241, 0.4)', width: 1, style: 2 },
        horzLine: { color: 'rgba(99, 102, 241, 0.4)', width: 1, style: 2 },
      },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.1)', timeVisible: true, secondsVisible: false },
    });

    chartRef.current = chart;
    const data = candleDataRef.current;

    // Create series based on chart type
    if (chartType === 'candle') {
      const series = chart.addCandlestickSeries({
        upColor: 'rgba(52, 211, 153, 0.8)',
        downColor: 'rgba(251, 113, 133, 0.8)',
        borderUpColor: 'rgba(52, 211, 153, 0.9)',
        borderDownColor: 'rgba(251, 113, 133, 0.9)',
        wickUpColor: 'rgba(52, 211, 153, 0.6)',
        wickDownColor: 'rgba(251, 113, 133, 0.6)',
      });
      series.setData(data);
      seriesRef.current = series;
    } else if (chartType === 'bar') {
      const series = chart.addBarSeries({
        upColor: 'rgba(52, 211, 153, 0.8)',
        downColor: 'rgba(251, 113, 133, 0.8)',
      });
      series.setData(data);
      seriesRef.current = series;
    } else if (chartType === 'line') {
      const series = chart.addLineSeries({ color: '#6366f1', lineWidth: 2 });
      series.setData(data.map(d => ({ time: d.time, value: d.close })));
      seriesRef.current = series;
    } else if (chartType === 'area') {
      const series = chart.addAreaSeries({
        topColor: 'rgba(99, 102, 241, 0.4)',
        bottomColor: 'rgba(99, 102, 241, 0.0)',
        lineColor: '#6366f1',
        lineWidth: 2,
      });
      series.setData(data.map(d => ({ time: d.time, value: d.close })));
      seriesRef.current = series;
    }

    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartRef.current && container) {
        chartRef.current.applyOptions({ width: container.clientWidth, height: container.clientHeight });
      }
    };

    window.addEventListener('resize', handleResize);

    // Update price display
    if (data.length > 0) {
      onPriceUpdate(data[data.length - 1].close.toFixed(2));
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [chartType, chartView, onPriceUpdate]);

  // Note: Removed mock real-time price simulation
  // Real price updates come from on-chain settlement data

  const clearAllDrawings = () => setDrawings([]);

  // Drawing handlers
  const handleDrawingMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (selectedTool === 'cursor' || !drawingCanvasRef.current) return;
    const rect = drawingCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentDrawing({ x1: x, y1: y, x2: x, y2: y });
    setIsDrawing(true);
  };

  const handleDrawingMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !currentDrawing || !drawingCanvasRef.current) return;
    const rect = drawingCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentDrawing({
      ...currentDrawing,
      x2: selectedTool === 'hline' ? rect.width : x,
      y2: selectedTool === 'hline' ? currentDrawing.y1 : y,
    });
  };

  const handleDrawingMouseUp = () => {
    if (currentDrawing && isDrawing) {
      setDrawings(prev => [...prev, { id: Date.now().toString(), type: selectedTool, ...currentDrawing }]);
      setCurrentDrawing(null);
      setIsDrawing(false);
    }
  };

  const renderDrawingShape = (d: { type: DrawingTool; x1: number; y1: number; x2: number; y2: number }, key: string) => {
    const strokeColor = '#6366f1';
    switch (d.type) {
      case 'line':
      case 'hline':
        return <line key={key} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} stroke={strokeColor} strokeWidth={2} strokeDasharray={d.type === 'hline' ? '5,5' : undefined} />;
      case 'trendline':
        return <line key={key} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} stroke={strokeColor} strokeWidth={2} />;
      case 'arrow':
        const angle = Math.atan2(d.y2 - d.y1, d.x2 - d.x1);
        const arrowSize = 10;
        return (
          <g key={key}>
            <line x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} stroke={strokeColor} strokeWidth={2} />
            <polygon
              points={`${d.x2},${d.y2} ${d.x2 - arrowSize * Math.cos(angle - Math.PI / 6)},${d.y2 - arrowSize * Math.sin(angle - Math.PI / 6)} ${d.x2 - arrowSize * Math.cos(angle + Math.PI / 6)},${d.y2 - arrowSize * Math.sin(angle + Math.PI / 6)}`}
              fill={strokeColor}
            />
          </g>
        );
      case 'rect':
        return <rect key={key} x={Math.min(d.x1, d.x2)} y={Math.min(d.y1, d.y2)} width={Math.abs(d.x2 - d.x1)} height={Math.abs(d.y2 - d.y1)} stroke={strokeColor} strokeWidth={2} fill="transparent" />;
      case 'circle':
        const radius = Math.sqrt(Math.pow(d.x2 - d.x1, 2) + Math.pow(d.y2 - d.y1, 2));
        return <circle key={key} cx={d.x1} cy={d.y1} r={radius} stroke={strokeColor} strokeWidth={2} fill="transparent" />;
      case 'fib':
        const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
        const height = d.y2 - d.y1;
        return (
          <g key={key}>
            {fibLevels.map((level, i) => (
              <g key={i}>
                <line x1={d.x1} y1={d.y1 + height * level} x2={d.x2} y2={d.y1 + height * level} stroke={strokeColor} strokeWidth={1} strokeDasharray="3,3" opacity={0.5 + level * 0.3} />
                <text x={d.x1 + 5} y={d.y1 + height * level - 3} fill={strokeColor} fontSize={10}>{(level * 100).toFixed(1)}%</text>
              </g>
            ))}
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-zinc-900/50 backdrop-blur-sm border border-white/5 relative overflow-hidden flex flex-col min-h-0">
      {/* Chart Header */}
      <div className="p-3 border-b border-white/5 flex justify-between items-center shrink-0">
        <div className="flex gap-4">
          <button
            onClick={() => setChartView('price')}
            className={`flex items-center gap-1 text-xs transition-colors ${chartView === 'price' ? 'text-brand-stellar' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <BarChart2 className="w-3 h-3" /> Price Action
          </button>
          <button
            onClick={() => setChartView('depth')}
            className={`flex items-center gap-1 text-xs transition-colors ${chartView === 'depth' ? 'text-brand-stellar' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Activity className="w-3 h-3" /> Depth
          </button>
        </div>
        <div className="flex gap-2 items-center">
          {drawings.length > 0 && (
            <span className="text-[10px] text-gray-500 mr-2">{drawings.length} drawing{drawings.length > 1 ? 's' : ''}</span>
          )}
          <button onClick={onOpenSettings} className="p-1 hover:bg-white/5">
            <Settings className="w-3 h-3 text-gray-500 hover:text-white transition-colors" />
          </button>
        </div>
      </div>

      {/* Chart Area with Drawing Tools */}
      <div className="flex-1 flex flex-row" style={{ minHeight: 0 }}>
        {/* Drawing Tools Sidebar */}
        <div className="w-10 bg-black/40 border-r border-white/5 flex flex-col py-2 shrink-0 overflow-y-auto">
          {drawingTools.map(({ tool, icon: Icon, label }) => (
            <button
              key={tool}
              onClick={() => setSelectedTool(tool)}
              className={`p-2 hover:bg-white/10 transition-all relative group shrink-0 ${selectedTool === tool ? 'bg-white/10 text-brand-stellar' : 'text-gray-500 hover:text-gray-300'}`}
              title={label}
            >
              <Icon className="w-4 h-4 mx-auto" />
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-black border border-white/10 px-2 py-1 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                {label}
              </div>
            </button>
          ))}
          <div className="h-px bg-white/10 my-2 mx-2 shrink-0"></div>
          <button
            onClick={clearAllDrawings}
            className={`p-2 hover:bg-red-500/20 transition-all text-gray-500 hover:text-red-400 relative group shrink-0 ${drawings.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Clear All Drawings"
            disabled={drawings.length === 0}
          >
            <Trash2 className="w-4 h-4 mx-auto" />
          </button>
        </div>

        {/* Main Chart Area */}
        {chartView === 'price' ? (
          <div className="flex-1 relative" style={{ minHeight: '300px' }}>
            <div ref={chartContainerRef} className="absolute inset-0" />
            {/* Drawing Canvas Overlay */}
            <svg
              ref={drawingCanvasRef}
              className="absolute inset-0 z-10"
              width="100%"
              height="100%"
              style={{ cursor: selectedTool !== 'cursor' ? 'crosshair' : 'default', pointerEvents: selectedTool === 'cursor' ? 'none' : 'auto' }}
              onMouseDown={handleDrawingMouseDown}
              onMouseMove={handleDrawingMouseMove}
              onMouseUp={handleDrawingMouseUp}
              onMouseLeave={handleDrawingMouseUp}
            >
              {drawings.map((d) => renderDrawingShape(d, d.id))}
              {currentDrawing && renderDrawingShape({ type: selectedTool, ...currentDrawing }, 'current')}
            </svg>
          </div>
        ) : (
          <div className="flex-1 flex items-end justify-center p-4 gap-0.5" style={{ minHeight: '300px' }}>
            {(() => {
              const basePrice = candleData.length > 0 ? candleData[candleData.length - 1].close : 0;
              return (
                <>
                  <div className="flex items-end gap-0.5 flex-row-reverse h-full">
                    {Array.from({ length: 20 }).map((_, i) => {
                      const height = 30 + Math.random() * 50 + (20 - i) * 3;
                      return (
                        <div
                          key={`bid-${i}`}
                          className="w-3 bg-emerald-600/30 hover:bg-emerald-500/50 transition-colors cursor-pointer"
                          style={{ height: `${height}%` }}
                          title={basePrice > 0 ? `Bid: $${(basePrice - i * 0.02).toFixed(2)}` : 'No data'}
                        />
                      );
                    })}
                  </div>
                  <div className="w-px h-full bg-white/20 mx-2" />
                  <div className="flex items-end gap-0.5 h-full">
                    {Array.from({ length: 20 }).map((_, i) => {
                      const height = 30 + Math.random() * 50 + (20 - i) * 3;
                      return (
                        <div
                          key={`ask-${i}`}
                          className="w-3 bg-rose-600/30 hover:bg-rose-500/50 transition-colors cursor-pointer"
                          style={{ height: `${height}%` }}
                          title={basePrice > 0 ? `Ask: $${(basePrice + i * 0.02).toFixed(2)}` : 'No data'}
                        />
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Drawing mode indicator */}
      {selectedTool !== 'cursor' && (
        <div className="absolute bottom-4 left-14 bg-brand-stellar/20 border border-brand-stellar/40 px-2 py-1 text-[10px] text-brand-stellar z-10">
          Drawing: {drawingTools.find(t => t.tool === selectedTool)?.label}
        </div>
      )}
    </div>
  );
};
