import API from './api';

/* ============================================================
   STUDENT REGISTRATION
============================================================ */

const registerStudent = async (
    name,
    email,
    password,
    mobile
) => {
    const response = await API.post(
        '/auth/register',
        {
            name,
            email,
            password,
            mobile
        }
    );

    return response.data;
};


/* ============================================================
   STUDENT LOGIN
============================================================ */

const loginStudent = async (
    email,
    password
) => {
    const response = await API.post(
        '/auth/login',
        {
            email,
            password
        }
    );

    return response.data;
};


/* ============================================================
   SAVE AUTHENTICATION DATA
============================================================ */

const saveAuthData = (data) => {
    if (
        !data ||
        !data.token ||
        !data.user
    ) {
        throw new Error(
            'Invalid authentication response.'
        );
    }

    localStorage.setItem(
        'scholarship_token',
        data.token
    );

    localStorage.setItem(
        'scholarship_user',
        JSON.stringify(
            data.user
        )
    );
};


/* ============================================================
   GET SAVED TOKEN
============================================================ */

const getToken = () => {
    return localStorage.getItem(
        'scholarship_token'
    );
};


/* ============================================================
   GET SAVED USER
============================================================ */

const getCurrentUser = () => {
    const user =
        localStorage.getItem(
            'scholarship_user'
        );

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(
            user
        );
    } catch (error) {
        console.error(
            'Unable to read saved user:',
            error
        );

        return null;
    }
};


/* ============================================================
   LOGOUT
============================================================ */

const logout = () => {
    localStorage.removeItem(
        'scholarship_token'
    );

    localStorage.removeItem(
        'scholarship_user'
    );
};


/* ============================================================
   EXPORT
============================================================ */

const authService = {
    registerStudent,
    loginStudent,
    saveAuthData,
    getToken,
    getCurrentUser,
    logout
};

export default authService;