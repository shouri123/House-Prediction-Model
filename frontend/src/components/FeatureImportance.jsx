import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = [
    '#8B5CF6', '#6366F1', '#3B82F6', '#06B6D4', '#10B981',
    '#22C55E', '#84CC16', '#EAB308', '#F59E0B', '#F97316',
    '#EF4444', '#EC4899', '#D946EF', '#A855F7', '#7C3AED', '#4F46E5'
];

const FeatureImportance = React.memo(({ importance }) => {
    if (!importance || !importance.features || importance.features.length === 0) return null;

    const data = importance.features.map((name, i) => ({
        name: name.replace(/_/g, ' ').replace('ocean proximity ', ''),
        value: importance.importance[i],
    }));

    return (
        <div className="bg-gray-800/90 rounded-xl sm:rounded-2xl border border-gray-700/50 p-3 sm:p-4 md:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1">🎯 Feature Importance</h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">What drives the model's predictions</p>
            <div style={{ width: '100%', height: Math.max(280, data.length * 28) }}>
                <ResponsiveContainer>
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                        <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 12 }} domain={[0, 1]} />
                        <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fill: '#D1D5DB', fontSize: 11 }}
                            width={100}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '12px',
                                color: '#fff',
                            }}
                            formatter={(value) => [(value).toFixed(4), 'Importance']}
                        />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                            {data.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});

export default FeatureImportance;
