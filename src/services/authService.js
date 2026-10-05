import API from './api';


/* ============================================================
   STUDENT REGISTRATION
============================================================ */

const registerStudent = async (
    name,
    email,
    mobile
) => {

    const response = await API.post(
        '/auth/register',
        {
            name,
            email,
            mobile
        }
    );

    return response.data;
};


/* ============================================================
   STUDENT LOGIN
============================================================ */

const loginStudent = async (
    studentId,
    password
) => {

    const response = await API.post(
        '/auth/login',
        {
            studentId,
            password
        }
    );

    return response.data;
};


/* ============================================================
   ADMIN LOGIN
============================================================ */

const loginAdmin = async (
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

const requestPasswordReset = async (email) => {
    const response = await API.post('/auth/forgot-password', { email });
    return response.data;
};

const resetPassword = async (email, otp, newPassword) => {
    const response = await API.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
};


/* ============================================================
   CHANGE PASSWORD
============================================================ */

const changePassword = async (
    currentPassword,
    newPassword
) => {

    const response = await API.post(
        '/auth/change-password',
        {
            currentPassword,
            newPassword
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
   UPDATE SAVED TOKEN
============================================================ */

const saveToken = (token) => {

    if (!token) {
        throw new Error(
            'A valid authentication token is required.'
        );
    }

    localStorage.setItem(
        'scholarship_token',
        token
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
   CHECK WHETHER USER IS LOGGED IN
============================================================ */

const isAuthenticated = () => {

    const token =
        getToken();

    const user =
        getCurrentUser();

    return Boolean(
        token &&
        user
    );
};


/* ============================================================
   EXPORT
============================================================ */

const authService = {

    registerStudent,

    loginStudent,

    loginAdmin,

    requestPasswordReset,

    resetPassword,

    changePassword,

    saveAuthData,

    getToken,

    saveToken,

    getCurrentUser,

    isAuthenticated,

    logout

};


export default authService;
