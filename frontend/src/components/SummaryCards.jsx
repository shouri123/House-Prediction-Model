import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils';

const cards = [
    { key: 'total', label: 'Properties Analyzed', icon: '🏡', color: 'from-blue-500 to-cyan-500' },
    { key: 'avg', label: 'Average Price', icon: '📊', color: 'from-purple-500 to-pink-500' },
    { key: 'max', label: 'Highest Price', icon: '🔺', color: 'from-amber-500 to-orange-500' },
    { key: 'min', label: 'Lowest Price', icon: '🔻', color: 'from-emerald-500 to-teal-500' },
];

const SummaryCards = React.memo(({ stats }) => {
    if (!stats) return null;

    const values = {
        total: stats.total_properties,
        avg: formatCurrency(stats.avg_price),
        max: formatCurrency(stats.max_price),
        min: formatCurrency(stats.min_price),
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {cards.map((card, i) => (
                <motion.div
                    key={card.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-gray-700/50 bg-gray-800/90 p-3 sm:p-4 md:p-6"
                >
                    <div className={`absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-br ${card.color} opacity-10 rounded-full -translate-y-6 translate-x-6`} />
                    <div className="flex items-start justify-between">
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1 truncate">{card.label}</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
                                {card.key === 'total' ? values[card.key] : values[card.key]}
                            </p>
                        </div>
                        <span className="text-lg sm:text-2xl flex-shrink-0">{card.icon}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
});

export default SummaryCards;
