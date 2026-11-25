'use client';
import React, { useState } from 'react';
import { BarChart3, LineChart, TrendingUp } from 'lucide-react';

export default function SalesChart({ monthlyRevenue = {} }) {
  const [chartType, setChartType] = useState('bar');
  const [hoveredMonth, setHoveredMonth] = useState(null);

  // Month labels
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const values = months.map((m) => monthlyRevenue[m] || 0);

  const maxValue = Math.max(...values, 10000);
  const totalVolume = values.reduce((sum, v) => sum + v, 0);

  // SVG dimensions
  const svgWidth = 700;
  const svgHeight = 220;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const getX = (index) => paddingLeft + (index / (months.length - 1)) * chartWidth;
  const getY = (val) => paddingTop + chartHeight - (val / maxValue) * chartHeight;

  // Generate line points
  const points = months.map((m, i) => `${getX(i)},${getY(values[i])}`).join(' ');

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sage-soft/40 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sage-soft/30 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-serif text-lg text-sage-dark font-medium">Revenue Trends & Sales Analytics</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>Real Volume</span>
            </span>
          </div>
          <p className="text-xs text-sage-muted mt-0.5">
            Annual gross sales: <strong className="text-sage-dark font-serif font-bold">Rs. {totalVolume.toLocaleString()}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-sage-ivory/80 p-1 rounded-xl border border-sage-soft/40 self-start sm:self-auto">
          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              chartType === 'bar' ? 'bg-sage-dark text-white shadow-soft-sm' : 'text-sage-dark/70 hover:text-sage-dark'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bars</span>
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              chartType === 'line' ? 'bg-sage-dark text-white shadow-soft-sm' : 'text-sage-dark/70 hover:text-sage-dark'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Trend</span>
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="mt-6 relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[500px]"
          style={{ overflow: 'visible' }}
        >
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingTop + chartHeight * (1 - pct);
            const val = Math.round(maxValue * pct);
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#E5E8CE"
                  strokeWidth="1"
                  strokeDasharray={pct === 0 ? '0' : '4 4'}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#AAB99F"
                  fontSize="9"
                  fontFamily="sans-serif"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Bar mode */}
          {chartType === 'bar' &&
            months.map((m, i) => {
              const barWidth = 24;
              const barX = getX(i) - barWidth / 2;
              const barY = getY(values[i]);
              const barHeight = Math.max(2, paddingTop + chartHeight - barY);
              const isHovered = hoveredMonth === m;

              return (
                <g
                  key={m}
                  className="cursor-pointer transition-opacity"
                  onMouseEnter={() => setHoveredMonth(m)}
                  onMouseLeave={() => setHoveredMonth(null)}
                >
                  {/* Subtle bar background slot */}
                  <rect
                    x={barX}
                    y={paddingTop}
                    width={barWidth}
                    height={chartHeight}
                    fill="#F7F8F0"
                    rx="4"
                  />
                  {/* Actual filled bar */}
                  <rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={isHovered ? '#263323' : '#789575'}
                    rx="4"
                    className="transition-colors duration-200"
                  />
                  {/* Month Label */}
                  <text
                    x={getX(i)}
                    y={paddingTop + chartHeight + 18}
                    textAnchor="middle"
                    fill={isHovered ? '#263323' : '#AAB99F'}
                    fontWeight={isHovered ? 'bold' : 'normal'}
                    fontSize="10"
                    fontFamily="sans-serif"
                  >
                    {m}
                  </text>
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <g>
                      <rect
                        x={getX(i) - 40}
                        y={Math.max(5, barY - 26)}
                        width="80"
                        height="20"
                        fill="#263323"
                        rx="6"
                      />
                      <text
                        x={getX(i)}
                        y={Math.max(19, barY - 12)}
                        textAnchor="middle"
                        fill="#FEFEF8"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        Rs. {values[i].toLocaleString()}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

          {/* Line mode */}
          {chartType === 'line' && (
            <g>
              {/* Gradient fill area */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#789575" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#789575" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon
                points={`${paddingLeft},${paddingTop + chartHeight} ${points} ${
                  paddingLeft + chartWidth
                },${paddingTop + chartHeight}`}
                fill="url(#chartGradient)"
              />
              <polyline
                fill="none"
                stroke="#789575"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
              {months.map((m, i) => {
                const cx = getX(i);
                const cy = getY(values[i]);
                const isHovered = hoveredMonth === m;
                return (
                  <g
                    key={m}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredMonth(m)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 6 : 4}
                      fill={isHovered ? '#263323' : '#789575'}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="transition-all duration-200"
                    />
                    <text
                      x={cx}
                      y={paddingTop + chartHeight + 18}
                      textAnchor="middle"
                      fill={isHovered ? '#263323' : '#AAB99F'}
                      fontWeight={isHovered ? 'bold' : 'normal'}
                      fontSize="10"
                      fontFamily="sans-serif"
                    >
                      {m}
                    </text>
                    {isHovered && (
                      <g>
                        <rect
                          x={cx - 40}
                          y={Math.max(5, cy - 26)}
                          width="80"
                          height="20"
                          fill="#263323"
                          rx="6"
                        />
                        <text
                          x={cx}
                          y={Math.max(19, cy - 12)}
                          textAnchor="middle"
                          fill="#FEFEF8"
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          Rs. {values[i].toLocaleString()}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
