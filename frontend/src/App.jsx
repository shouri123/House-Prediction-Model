import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import PredictionResults from './components/PredictionResults';
import SummaryCards from './components/SummaryCards';
import PriceHistogram from './components/PriceHistogram';
import IncomeScatter from './components/IncomeScatter';
import FeatureImportance from './components/FeatureImportance';
import PredictedVsActual from './components/PredictedVsActual';
import MapView from './components/MapView';
import SmartInsights from './components/SmartInsights';
import ScenarioSimulator from './components/ScenarioSimulator';
import ExportTools from './components/ExportTools';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from './config';

const TABS = [
    { key: 'overview', label: '📊 Overview', icon: '📊' },
    { key: 'table', label: '📋 Data Table', icon: '📋' },
    { key: 'charts', label: '📈 Charts', icon: '📈' },
    { key: 'map', label: '📍 Map', icon: '📍' },
    { key: 'insights', label: '🧠 Insights', icon: '🧠' },
    { key: 'simulator', label: '🎮 Simulator', icon: '🎮' },
];

function App() {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [backendStatus, setBackendStatus] = useState('checking');
    const [activeTab, setActiveTab] = useState('overview');
    const [featureImportance, setFeatureImportance] = useState(null);

    useEffect(() => {
        const checkHealth = async () => {
            try {
                await axios.get(`${API_BASE_URL}/health`);
                setBackendStatus('connected');
            } catch (error) {
                console.error('Backend health check failed:', error);
                setBackendStatus('disconnected');
            }
        };
        checkHealth();
        const interval = setInterval(checkHealth, 10000);
        return () => clearInterval(interval);
    }, []);

    // Fetch feature importance on load
    useEffect(() => {
        const fetchModelInfo = async () => {
            try {
                const resp = await axios.get(`${API_BASE_URL}/model-info`, { responseType: 'json' });
                let data = resp.data;
                while (typeof data === 'string') { try { data = JSON.parse(data); } catch { break; } }
                setFeatureImportance(data?.feature_importance);
            } catch (err) {
                console.error('Failed to fetch model info:', err);
            }
        };
        fetchModelInfo();
    }, []);

    const handleUploadStart = () => {
        setLoading(true);
        setResults(null);
    };

    const handleUploadSuccess = (data) => {
        setLoading(false);
        if (data) {
            setResults(data);
            setActiveTab('overview');
            // Use feature importance from predict response if available
            if (data.feature_importance) {
                setFeatureImportance(data.feature_importance);
            }
        }
    };

    const stats = results?.graphs?.summary_stats;
    const hasResults = results && results.data && Array.isArray(results.data) && results.data.length > 0;

    return (
        <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-500/30">
            {/* Background noise texture */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

            {/* Connection Status Badge */}
            <div className="fixed top-4 right-4 z-50">
                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm ${
                    backendStatus === 'connected'
                        ? 'bg-green-500/10 border-green-500/50 text-green-400'
                        : backendStatus === 'disconnected'
                            ? 'bg-red-500/10 border-red-500/50 text-red-400'
                            : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400'
                }`}>
                    <div className={`w-2 h-2 rounded-full ${
                        backendStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                        backendStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                    }`} />
                    <span>
                        {backendStatus === 'connected' ? 'Backend Connected' :
                         backendStatus === 'disconnected' ? 'Backend Disconnected' : 'Checking...'}
                    </span>
                </div>
            </div>

            <main className="relative container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-3 mb-8"
                >
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                        House Price Predictor
                    </h1>
                    <p className="text-base text-gray-400 max-w-xl mx-auto">
                        Upload housing data and get instant ML-powered predictions with interactive analytics
                    </p>
                </motion.div>

                {/* Upload Area */}
                <FileUpload onUploadSuccess={handleUploadSuccess} onUploadStart={handleUploadStart} />

                {/* Loading Spinner */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-8 flex flex-col items-center gap-3"
                    >
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-400">Processing your data...</p>
                    </motion.div>
                )}

                {/* Dashboard */}
                {hasResults && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-10"
                    >
                        {/* Tab Navigation */}
                        <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-800/40 rounded-2xl border border-gray-700/30">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        activeTab === tab.key
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Export Tools */}
                        <div className="mb-6">
                            <ExportTools data={results.data} results={results} />
                        </div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        <SummaryCards stats={stats} />
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <PriceHistogram histogram={results.graphs?.histogram} />
                                            <IncomeScatter scatterData={results.graphs?.scatter} />
                                        </div>
                                        {featureImportance && (
                                            <FeatureImportance importance={featureImportance} />
                                        )}
                                    </div>
                                )}

                                {activeTab === 'table' && (
                                    <PredictionResults
                                        results={results}
                                        confidenceMargins={results.confidence_margins || []}
                                        outlierIndices={results.outlier_indices || []}
                                    />
                                )}

                                {activeTab === 'charts' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <PriceHistogram histogram={results.graphs?.histogram} />
                                            <IncomeScatter scatterData={results.graphs?.scatter} />
                                        </div>
                                        {featureImportance && (
                                            <FeatureImportance importance={featureImportance} />
                                        )}
                                        {results.predicted_vs_actual && (
                                            <PredictedVsActual
                                                predictedVsActual={results.predicted_vs_actual}
                                                metrics={results.metrics}
                                            />
                                        )}
                                    </div>
                                )}

                                {activeTab === 'map' && (
                                    <MapView
                                        data={results.data}
                                        outlierIndices={results.outlier_indices || []}
                                    />
                                )}

                                {activeTab === 'insights' && (
                                    <SmartInsights insights={results.insights} />
                                )}

                                {activeTab === 'simulator' && (
                                    <ScenarioSimulator />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Footer */}
                <footer className="mt-16 text-center text-xs text-gray-600 pb-8">
                    <p>Powered by Machine Learning • Ridge Regression Model</p>
                </footer>
            </main>
        </div>
    );
}

export default App;
