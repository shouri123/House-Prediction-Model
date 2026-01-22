# Deployment Guide

This application is configured for deployment on [Render](https://render.com).

## Prerequisites
- A Render account.
- This repository connected to your Render account.

## Deployment Steps

1.  **Create a New Blueprint Instance:**
    - Go to your Render Dashboard.
    - Click **New +** -> **Blueprint**.
    - Connect this repository.
    - Render will automatically detect the `render.yaml` file.

2.  **Configuration:**
    - The `render.yaml` defines two services:
        - `housing-price-backend`: A Python web service running the Flask API.
        - `housing-price-frontend`: A Node.js static site hosting the React frontend.
    - **Environment Variables:**
        - `VITE_API_URL`: Automatically set for the frontend to point to the backend service URL.
        - `FLASK_DEBUG`: Set to `false` for production.

3.  **Apply:**
    - Click **Apply** to deploy the services.

## Manual Configuration (If not using Blueprint)

### Backend (Web Service)
- **Runtime:** Python 3
- **Build Command:** `pip install -r backend/requirements.txt`
- **Start Command:** `cd backend && gunicorn app:app`
- **Environment Variables:**
    - `FLASK_DEBUG`: `false`

### Frontend (Static Site)
- **Runtime:** Node
- **Build Command:** `cd frontend && npm install && npm run build`
- **Publish Directory:** `frontend/dist`
- **Rewrite Rules:** Source `/*`, Destination `/index.html`
- **Environment Variables:**
    - `VITE_API_URL`: The URL of your deployed backend (e.g., `https://housing-price-backend.onrender.com`)

## Vercel Deployment

This project is also configured for deployment on [Vercel](https://vercel.com).

### One-Click Deployment

1.  **Import Project:**
    - Go to your Vercel Dashboard.
    - Click **Add New...** -> **Project**.
    - Import this repository.

2.  **Configuration:**
    - Vercel will automatically detect the `vercel.json` configuration.
    - **Framework Preset:** Select "Other" or let it auto-detect.
    - **Root Directory:** `./` (default).

3.  **Environment Variables:**
    - Add any necessary environment variables in the Vercel project settings.
    - `VITE_API_URL`: Optional. If not set, the frontend will use the relative path `/api` which works for same-domain deployments (like this monorepo setup).

4.  **Deploy:**
    - Click **Deploy**.

### Notes
- **Serverless Function Size:** The `maxLambdaSize` is set to **50mb** in `vercel.json` to accommodate the Machine Learning dependencies (pandas, scikit-learn, etc.).
- **Monorepo Structure:** The frontend (static site) and backend (serverless functions) are deployed together. The `api` directory is handled as serverless functions, and the `frontend` directory is built as a static site.
