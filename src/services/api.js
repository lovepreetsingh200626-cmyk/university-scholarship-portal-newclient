import axios from 'axios';


/* ============================================================
   API INSTANCE
============================================================ */

const API = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        'http://localhost:5000/api'
});



/* ============================================================
   REQUEST INTERCEPTOR
   Automatically sends JWT token for protected APIs
============================================================ */

API.interceptors.request.use(

    (config) => {

        const token =
            localStorage.getItem(
                'scholarship_token'
            );

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }

        return config;

    },

    (error) => {

        return Promise.reject(
            error
        );

    }

);


/* ============================================================
   RESPONSE INTERCEPTOR
   Handle expired/invalid authentication
============================================================ */

API.interceptors.response.use(

    (response) => {

        return response;

    },

    (error) => {

        if (
            error.response &&
            error.response.status === 401
        ) {

            const message =
                error.response.data?.message || '';

            if (
                message.includes('expired') ||
                message.includes('Invalid authentication') ||
                message.includes('Authentication failed')
            ) {

                localStorage.removeItem(
                    'scholarship_token'
                );

                localStorage.removeItem(
                    'scholarship_user'
                );

            }

        }

        return Promise.reject(
            error
        );

    }

);


/* ============================================================
   EXPORT
============================================================ */

export default API;