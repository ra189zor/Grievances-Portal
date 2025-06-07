export const API_BASE_URL = import.meta.env.PROD 
  ? '/api'  // Production: relative path for Vercel
  : 'http://localhost:5000/api'; // Development
