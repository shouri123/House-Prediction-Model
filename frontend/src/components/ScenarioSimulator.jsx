import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import API_BASE_URL from '../config';
import { formatCurrency } from '../utils';

const DEFAULTS = {
    longitude: -122.23,
    latitude: 37.88,
    housing_median_age: 30,
    total_rooms: 2000,
    total_bedrooms: 400,
    population: 800,
    households: 350,
    median_income: 5.0,
    ocean_proximity: 'NEAR BAY',
};

const FIELDS = [
    { key: 'longitude', label: 'Longitude', min: -124.5, max: -114, step: 0.01 },
    { key: 'latitude', label: 'Latitude', min: 32, max: 42, step: 0.01 },
    { key: 'housing_median_age', label: 'House Age (years)', min: 1, max: 52, step: 1 },
    { key: 'total_rooms', label: 'Total Rooms', min: 100, max: 40000, step: 100 },
    { key: 'total_bedrooms', label: 'Total Bedrooms', min: 10, max: 7000, step: 10 },
    { key: 'population', label: 'Population', min: 50, max: 35000, step: 50 },
    { key: 'households', label: 'Households', min: 10, max: 6000, step: 10 },
    { key: 'median_income', label: 'Median Income (x$10K)', min: 0.5, max: 15, step: 0.1 },
];

const OCEAN_OPTIONS = ['<1H OCEAN', 'INLAND', 'ISLAND', 'NEAR BAY', 'NEAR OCEAN'];

const ScenarioSimulator = () => {
    const [inputs, setInputs] = useState(DEFAULTS);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (key, value) => {
        setInputs((prev) => ({ ...prev, [key]: Number(value) || value }));
    };

    const handlePredict = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await axios.post(`${API_BASE_URL}/predict-single`, inputs, {
                headers: { 'Content-Type': 'application/json' },
                responseType: 'json',
            });
            let data = resp.data;
            while (typeof data === 'string') {
                try { data = JSON.parse(data); } catch { break; }
            }
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Prediction failed');
        }
        setLoading(false);
    }, [inputs]);

    return (
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-700/50 p-3 sm:p-4 md:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1">🎮 Scenario Simulator</h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">Adjust features and see how the predicted price changes in real-time</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {FIELDS.map((field) => (
                    <div key={field.key}>
                        <div className="flex justify-between text-sm mb-1">
                            <label className="text-gray-300">{field.label}</label>
                            <span className="text-blue-400 font-mono">{inputs[field.key]}</span>
                        </div>
                        <input
                            type="range"
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            value={inputs[field.key]}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                            <span>{field.min}</span>
                            <span>{field.max}</span>
                        </div>
                    </div>
                ))}

                {/* Ocean Proximity Dropdown */}
                <div className="sm:col-span-2">
                    <label className="text-xs sm:text-sm text-gray-300 mb-1 block">Ocean Proximity</label>
                    <div className="flex flex-wrap gap-2">
                        {OCEAN_OPTIONS.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => setInputs((prev) => ({ ...prev, ocean_proximity: opt }))}
                                className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                                    inputs.ocean_proximity === opt
                                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                        : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-gray-500'
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={handlePredict}
                disabled={loading}
                className="w-full py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
                {loading ? 'Predicting...' : '🔮 Predict Price'}
            </button>

            {error && (
                <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
            )}

            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 sm:mt-6 p-4 sm:p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 text-center"
                >
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">Predicted Price</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                        {formatCurrency(result.predicted_price)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Confidence Range: {formatCurrency(result.confidence_low)} — {formatCurrency(result.confidence_high)}
                    </p>
                    <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                            style={{ width: '90%' }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">90% confidence</p>
                </motion.div>
            )}
        </div>
    );
};

export default ScenarioSimulator;
