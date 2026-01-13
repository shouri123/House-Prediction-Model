import React from 'react';
import { motion } from 'framer-motion';

const PredictionResults = ({ results }) => {
    if (!results) return null;

    const data = results?.data;
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div className="w-full max-w-6xl mx-auto mt-10 p-6 bg-gray-800 rounded-xl border border-gray-700 text-center">
                <h3 className="text-xl font-semibold text-gray-300">No Prediction Data Available</h3>
                <p className="text-gray-400 mt-2">The backend returned a response, but it didn't contain the expected data.</p>
                <div className="mt-4 p-4 bg-black/30 rounded text-left overflow-auto max-h-60 text-xs font-mono text-gray-400">
                    <p className="font-bold text-gray-500 mb-1">Debug Info:</p>
                    <p>Type: {typeof results}</p>
                    <p>Keys: {Object.keys(results || {}).join(', ')}</p>
                    <pre className="mt-2 text-green-400/80">{JSON.stringify(results, null, 2)}</pre>
                </div>
            </div>
        );
    }

    const predictionCol = 'predicted_price';

    // Get headers from the first object, putting predicted value first
    const headers = Object.keys(data[0]).filter(key => key !== predictionCol);
    headers.unshift(predictionCol);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-6xl mx-auto mt-10 overflow-hidden rounded-xl border border-gray-700 bg-gray-800/50 shadow-xl"
        >
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-gray-700/50 text-xs uppercase text-gray-300">
                        <tr>
                            {headers.map((header) => (
                                <th key={header} className="px-6 py-4 font-medium">
                                    {header.replace(/_/g, ' ')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {data.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                                {headers.map((header) => (
                                    <td key={`${index}-${header}`} className={`px-6 py-4 whitespace-nowrap ${header === predictionCol ? 'text-green-400 font-bold' : ''}`}>
                                        {header === predictionCol
                                            ? `$${row[header]?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                            : row[header]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default PredictionResults;
