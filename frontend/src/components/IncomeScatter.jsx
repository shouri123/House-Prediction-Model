import React, { useMemo } from 'react';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Line, ComposedChart,
} from 'recharts';
import { calculateCorrelation, calculateTrendLine, formatCurrency } from '../utils';

const IncomeScatter = React.memo(({ scatterData }) => {
    const { chartData, trendPoints, correlation } = useMemo(() => {
        if (!scatterData || !scatterData.x || !scatterData.y) {
            return { chartData: [], trendPoints: [], correlation: 0 };
        }
        const x = scatterData.x;
        const y = scatterData.y;
        const chartData = x.map((xi, i) => ({ income: xi, price: y[i] }));
        const corr = calculateCorrelation(x, y);
        const { slope, intercept } = calculateTrendLine(x, y);

        const minX = Math.min(...x);
        const maxX = Math.max(...x);
        const trendPoints = [
            { income: minX, trend: slope * minX + intercept },
            { income: maxX, trend: slope * maxX + intercept },
        ];

        return { chartData, trendPoints, correlation: corr };
    }, [scatterData]);

    if (!scatterData || !scatterData.x || !scatterData.y) return null;

    const combinedData = chartData.map((d) => {
        const trendMatch = trendPoints.find((t) => t.income === d.income);
        return { ...d, trend: trendMatch?.trend };
    });
    // Add trend endpoints if not already in data
    const fullData = [...combinedData];
    trendPoints.forEach((tp) => {
        if (!fullData.find((d) => d.income === tp.income)) {
            fullData.push({ income: tp.income, trend: tp.trend });
        }
    });
    fullData.sort((a, b) => a.income - b.income);

    return (
        <div className="bg-gray-800/90 rounded-xl sm:rounded-2xl border border-gray-700/50 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-1">
            <h3 className="text-base sm:text-lg font-semibold text-white">📈 Income vs Price</h3>
                <span className={`text-xs sm:text-sm font-mono px-2 sm:px-3 py-1 rounded-full ${
                    Math.abs(correlation) > 0.7 ? 'bg-green-500/20 text-green-400' :
                    Math.abs(correlation) > 0.4 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                }`}>
                    r = {correlation.toFixed(3)}
                </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">Median income is the strongest price predictor</p>
            <div className="chart-container">
                <ResponsiveContainer>
                    <ComposedChart data={fullData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                            dataKey="income"
                            type="number"
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            label={{ value: 'Median Income', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
                        />
                        <YAxis
                            type="number"
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '12px',
                                color: '#fff',
                            }}
                            formatter={(value, name) => {
                                if (name === 'price') return [formatCurrency(value), 'Predicted Price'];
                                if (name === 'trend') return [formatCurrency(value), 'Trend'];
                                return [value, name];
                            }}
                        />
                        <Scatter dataKey="price" fill="#8B5CF6" fillOpacity={0.6} r={3} animationDuration={1000} />
                        <Line dataKey="trend" stroke="#F59E0B" strokeWidth={2} dot={false} strokeDasharray="5 5" animationDuration={1000} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});

export default IncomeScatter;

