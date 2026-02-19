import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import API_BASE_URL from '../config';

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
        const response = await axios.post(`${API_BASE_URL}/predict`, formData);
        let data = response.data;
        console.log('Raw response type:', typeof data);
        console.log('Raw response:', data);
        
        // Handle cases where the response is a string (e.g. double-stringified JSON)
        let parseAttempts = 0;
        while (typeof data === 'string' && parseAttempts < 5) {
            try {
                data = JSON.parse(data);
                parseAttempts++;
            } catch (e) {
                console.error('Error parsing response data:', e);
                break;
            }
        }
        
        console.log('Parsed response type:', typeof data);
        console.log('Parsed response keys:', data ? Object.keys(data) : 'null');
        console.log('data.data type:', data?.data ? typeof data.data : 'missing');
        console.log('data.data length:', Array.isArray(data?.data) ? data.data.length : 'not array');
        
        onUploadSuccess(data);
    } catch (error) {
        console.error('Error uploading file:', error);
        console.error('Error response:', error.response?.data);
        const errorMessage = error.response?.data?.error || 'Error uploading file. Please try again.';
        alert(errorMessage);
        onUploadSuccess(null);
    }
};

    return (
        <div className="w-full max-w-md sm:max-w-xl mx-auto mt-6 sm:mt-10">
            <motion.div
                className={cn(
                    "border-2 border-dashed rounded-xl p-6 sm:p-10 text-center cursor-pointer transition-colors",
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
                <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
                    <div className="p-3 sm:p-4 bg-gray-700/50 rounded-full">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>
                    <div className="text-sm sm:text-base text-gray-300">
                        <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">CSV or JSON (MAX. 10MB)</p>
                </div>
            </motion.div>
        </div>
    );
};

export default FileUpload;
