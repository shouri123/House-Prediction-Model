import React from 'react';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { formatCurrency } from '../utils';

const PredictedVsActual = ({ predictedVsActual, metrics }) => {
    if (!predictedVsActual) return null;

    const data = predictedVsActual.predicted.map((pred, i) => ({
        predicted: pred,
        actual: predictedVsActual.actual[i],
    }));

    const allValues = [...predictedVsActual.predicted, ...predictedVsActual.actual];
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);

    return (
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-700/50 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-base sm:text-lg font-semibold text-white">🎯 Predicted vs Actual</h3>
                {metrics && (
                    <span className="text-xs sm:text-sm font-mono px-2 sm:px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                        R² = {metrics.r2.toFixed(3)}
                    </span>
                )}
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">Closer to the diagonal line = better accuracy</p>

            {metrics && (
                <div className="flex flex-wrap gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex-1 bg-gray-900/50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-400">MAE</p>
                        <p className="text-lg font-bold text-blue-400">{formatCurrency(metrics.mae)}</p>
                    </div>
                    <div className="flex-1 bg-gray-900/50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-400">RMSE</p>
                        <p className="text-lg font-bold text-purple-400">{formatCurrency(metrics.rmse)}</p>
                    </div>
                    <div className="flex-1 bg-gray-900/50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-400">R² Score</p>
                        <p className="text-lg font-bold text-green-400">{metrics.r2.toFixed(4)}</p>
                    </div>
                </div>
            )}

            <div className="chart-container">
                <ResponsiveContainer>
                    <ScatterChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                            type="number"
                            dataKey="actual"
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                            label={{ value: 'Actual Price', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
                        />
                        <YAxis
                            type="number"
                            dataKey="predicted"
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                            label={{ value: 'Predicted Price', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '12px',
                                color: '#fff',
                            }}
                            formatter={(value, name) => [formatCurrency(value), name === 'predicted' ? 'Predicted' : 'Actual']}
                        />
                        <ReferenceLine
                            segment={[{ x: min, y: min }, { x: max, y: max }]}
                            stroke="#F59E0B"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                        />
                        <Scatter data={data} fill="#10B981" fillOpacity={0.6} r={3} />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PredictedVsActual;
