import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils';

const PredictionResults = ({ results, confidenceMargins = [], outlierIndices = [] }) => {
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');
    const [page, setPage] = useState(0);
    const ROWS_PER_PAGE = 20;

    if (!results) return null;

    const data = results?.data;
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div className="w-full p-6 bg-gray-800/60 rounded-2xl border border-gray-700/50 text-center">
                <h3 className="text-xl font-semibold text-gray-300">No prediction data available</h3>
                <p className="text-gray-400 mt-2">Upload a valid CSV or JSON file to see results.</p>
            </div>
        );
    }

    const predictionCol = 'predicted_price';

    // Determine visible columns (hide engineered feature columns for cleanliness)
    const hiddenCols = ['rooms_per_household', 'bedrooms_per_room', 'population_per_household'];

    const headers = useMemo(() => {
        const allHeaders = Object.keys(data[0]).filter((k) => !hiddenCols.includes(k));
        // Put predicted_price first
        const rest = allHeaders.filter((h) => h !== predictionCol);
        return [predictionCol, ...rest];
    }, [data]);

    // Sort
    const sortedData = useMemo(() => {
        if (!sortKey) return data;
        return [...data].sort((a, b) => {
            const va = a[sortKey], vb = b[sortKey];
            if (typeof va === 'number' && typeof vb === 'number') {
                return sortDir === 'asc' ? va - vb : vb - va;
            }
            return sortDir === 'asc'
                ? String(va).localeCompare(String(vb))
                : String(vb).localeCompare(String(va));
        });
    }, [data, sortKey, sortDir]);

    // Paginate
    const totalPages = Math.ceil(sortedData.length / ROWS_PER_PAGE);
    const pageData = sortedData.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const formatCell = (header, value, rowIndex) => {
        if (header === predictionCol) {
            const margin = confidenceMargins[rowIndex];
            return (
                <div>
                    <span className="text-green-400 font-bold">{formatCurrency(value)}</span>
                    {margin != null && (
                        <span className="text-gray-500 text-xs ml-1">± {formatCurrency(margin)}</span>
                    )}
                </div>
            );
        }
        if (header === 'median_house_value') {
            return <span className="text-blue-400">{formatCurrency(value)}</span>;
        }
        if (typeof value === 'number') {
            return value % 1 === 0 ? value.toLocaleString() : value.toFixed(2);
        }
        return value;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full overflow-hidden rounded-xl sm:rounded-2xl border border-gray-700/50 bg-gray-800/60 backdrop-blur-sm shadow-xl"
        >
            <div className="table-scroll-container">
                <table className="w-full text-left text-xs sm:text-sm text-gray-400">
                    <thead className="bg-gray-700/50 text-xs uppercase text-gray-300">
                        <tr>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-gray-500">#</th>
                            {headers.map((header) => (
                                <th
                                    key={header}
                                    className="px-2 sm:px-4 py-2 sm:py-3 font-medium cursor-pointer hover:text-white transition select-none whitespace-nowrap"
                                    onClick={() => handleSort(header)}
                                >
                                    <span className="flex items-center gap-1">
                                        {header.replace(/_/g, ' ')}
                                        {sortKey === header && (
                                            <span className="text-blue-400">
                                                {sortDir === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                        {pageData.map((row, displayIndex) => {
                            // Find original index for outlier checking
                            const originalIndex = page * ROWS_PER_PAGE + displayIndex;
                            const isOutlier = outlierIndices.includes(originalIndex);
                            return (
                                <tr
                                    key={displayIndex}
                                    className={`hover:bg-gray-700/30 transition-colors ${
                                        isOutlier ? 'bg-amber-500/5 border-l-2 border-l-amber-500' : ''
                                    }`}
                                >
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 text-xs">
                                        {originalIndex + 1}
                                        {isOutlier && <span className="ml-1" title="Outlier">⚠️</span>}
                                    </td>
                                    {headers.map((header) => (
                                        <td key={`${displayIndex}-${header}`} className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                            {formatCell(header, row[header], originalIndex)}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-3 sm:px-6 py-2 sm:py-3 border-t border-gray-700/50">
                    <p className="text-xs sm:text-sm text-gray-500">
                        Showing {page * ROWS_PER_PAGE + 1}–{Math.min((page + 1) * ROWS_PER_PAGE, data.length)} of {data.length}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-3 py-1.5 rounded-lg bg-gray-700/50 text-gray-300 text-xs sm:text-sm disabled:opacity-30 hover:bg-gray-600/50"
                        >
                            ← Prev
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}
                            className="px-3 py-1.5 rounded-lg bg-gray-700/50 text-gray-300 text-xs sm:text-sm disabled:opacity-30 hover:bg-gray-600/50"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default PredictionResults;
