import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PriceHistogram = ({ histogram }) => {
    if (!histogram || !histogram.labels || !histogram.values) return null;

    const data = histogram.labels.map((label, i) => ({
        range: label,
        count: histogram.values[i],
    }));

    return (
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-700/50 p-3 sm:p-4 md:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1">📉 Price Distribution</h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">Distribution of predicted house prices across ranges</p>
            <div className="chart-container">
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                            dataKey="range"
                            tick={{ fill: '#9CA3AF', fontSize: 10 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '12px',
                                color: '#fff',
                            }}
                            formatter={(value) => [`${value} properties`, 'Count']}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {data.map((_, index) => (
                                <Cell
                                    key={index}
                                    fill={`hsl(${220 + index * 5}, 70%, ${55 + index}%)`}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PriceHistogram;
