import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import PredictionResults from './components/PredictionResults';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from './config';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking', 'connected', 'disconnected'

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
    const interval = setInterval(checkHealth, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleUploadStart = () => {
    setLoading(true);
    setResults(null);
  };

  const handleUploadSuccess = (data) => {
    setLoading(false);
    setResults(data);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      {/* Connection Status Badge */}
      <div className="absolute top-4 right-4 z-50">
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border ${backendStatus === 'connected'
          ? 'bg-green-500/10 border-green-500/50 text-green-400'
          : backendStatus === 'disconnected'
            ? 'bg-red-500/10 border-red-500/50 text-red-400'
            : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400'
          }`}>
          <div className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-green-500 animate-pulse' :
            backendStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
            }`}></div>
          <span>
            {backendStatus === 'connected' ? 'Backend Connected' :
              backendStatus === 'disconnected' ? 'Backend Disconnected' : 'Checking Connection...'}
          </span>
        </div>
      </div>

      <main className="relative container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            House Price Predictor
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Upload your housing data (CSV or JSON) and get instant price predictions powered by our advanced machine learning model.
          </p>
        </motion.div>

        <FileUpload onUploadSuccess={handleUploadSuccess} onUploadStart={handleUploadStart} />

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-10 flex justify-center"
          >
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </motion.div>
        )}

        <PredictionResults results={results} />
      </main>
    </div>
  );
}

export default App;
