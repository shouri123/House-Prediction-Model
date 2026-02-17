import React from 'react';
import { motion } from 'framer-motion';

const typeStyles = {
    info: 'border-blue-500/30 bg-blue-500/5',
    success: 'border-green-500/30 bg-green-500/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    error: 'border-red-500/30 bg-red-500/5',
};

const SmartInsights = ({ insights }) => {
    if (!insights || insights.length === 0) return null;

    return (
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-700/50 p-3 sm:p-4 md:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1">🧠 Smart Insights</h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">AI-generated analysis of your prediction data</p>
            <div className="space-y-2 sm:space-y-3">
                {insights.map((insight, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border ${typeStyles[insight.type] || typeStyles.info}`}
                    >
                        <span className="text-xl flex-shrink-0 mt-0.5">{insight.icon}</span>
                        <div>
                            <p className="text-sm font-semibold text-white">{insight.title}</p>
                            <p className="text-sm text-gray-300 mt-0.5">{insight.text}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default SmartInsights;
