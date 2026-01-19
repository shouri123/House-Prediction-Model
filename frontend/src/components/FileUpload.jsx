import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const FileUpload = ({ onUploadSuccess, onUploadStart }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFile = async (file) => {
        if (!file) return;

        onUploadStart();
        const formData = new FormData();
        formData.append('file', file);

        try {
            let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            if (API_URL && !API_URL.startsWith('http')) {
                API_URL = `https://${API_URL}`;
            }
            const response = await axios.post(`${API_URL}/predict`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            let data = response.data;
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    console.error('Error parsing response data:', e);
                }
            }
            onUploadSuccess(data);
        } catch (error) {
            console.error('Error uploading file:', error);
            const errorMessage = error.response?.data?.error || 'Error uploading file. Please try again.';
            alert(errorMessage);
            onUploadSuccess(null); // Stop loading state
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto mt-10">
            <motion.div
                className={cn(
                    "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors",
                    isDragging ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500 bg-gray-800/50"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".csv,.json"
                    onChange={handleFileSelect}
                />
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 bg-gray-700/50 rounded-full">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>
                    <div className="text-gray-300">
                        <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
                    </div>
                    <p className="text-sm text-gray-500">CSV or JSON (MAX. 10MB)</p>
                </div>
            </motion.div>
        </div>
    );
};

export default FileUpload;
