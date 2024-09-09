export const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://tfdb.onrender.com/api'
    : 'http://localhost:3000/api';