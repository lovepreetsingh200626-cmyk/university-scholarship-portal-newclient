import axios from 'axios';

const API = axios.create({
    baseURL: 'https://scholarship-backend-seven.vercel.app/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

export default API;