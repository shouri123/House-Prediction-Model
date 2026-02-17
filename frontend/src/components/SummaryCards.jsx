import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils';

const cards = [
    { key: 'total', label: 'Properties Analyzed', icon: '🏡', color: 'from-blue-500 to-cyan-500' },
    { key: 'avg', label: 'Average Price', icon: '📊', color: 'from-purple-500 to-pink-500' },
    { key: 'max', label: 'Highest Price', icon: '🔺', color: 'from-amber-500 to-orange-500' },
    { key: 'min', label: 'Lowest Price', icon: '🔻', color: 'from-emerald-500 to-teal-500' },
];

const SummaryCards = ({ stats }) => {
    if (!stats) return null;

    const values = {
        total: stats.total_properties,
        avg: formatCurrency(stats.avg_price),
        max: formatCurrency(stats.max_price),
        min: formatCurrency(stats.min_price),
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card, i) => (
                <motion.div
                    key={card.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-800/60 backdrop-blur-sm p-6"
                >
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 rounded-full -translate-y-6 translate-x-6`} />
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">{card.label}</p>
                            <p className="text-2xl font-bold text-white">
                                {card.key === 'total' ? values[card.key] : values[card.key]}
                            </p>
                        </div>
                        <span className="text-2xl">{card.icon}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default SummaryCards;
