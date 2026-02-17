const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://housing-price-backend-production.up.railway.app");

export default API_BASE_URL;
