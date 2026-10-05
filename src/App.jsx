import React, {
    useState
} from 'react';

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    Link,
    Outlet,
    useNavigate
} from 'react-router-dom';

import {
    GraduationCap,
    FileText,
    ShieldCheck,
    ArrowRight,
    LogIn,
    UserPlus,
    Copy,
    CheckCircle
} from 'lucide-react';

import authService from './services/authService';
import ForgotPassword from './pages/ForgotPassword';
import SetInitialPassword from './pages/student/SetInitialPassword';


/* ============================================================
   STUDENT PAGES
============================================================ */

import StudentDashboard
    from './pages/student/StudentDashboard';

import Scholarships
    from './pages/student/Scholarships';

import ScholarshipDetails
    from './pages/student/ScholarshipDetails';

import Eligibility
    from './pages/student/Eligibility';

import ScholarshipApplication
    from './pages/student/ScholarshipApplication';

import MyApplications
    from './pages/student/MyApplications';

import ApplyOnline
    from './pages/student/ApplyOnline';

import StudentProfile
    from './pages/student/StudentProfile';

import ApplicationDocuments
    from './pages/student/ApplicationDocuments';

import ApplicationTracking
    from './pages/student/ApplicationTracking';

import FreeshipCard
    from './pages/student/FreeshipCard';


/* ============================================================
   ADMIN PAGES
============================================================ */

import AdminLogin
    from './pages/admin/AdminLogin';

import AdminLayout
    from './pages/admin/AdminLayout';

import AdminDashboard
    from './pages/admin/AdminDashboard';

import AdminApplications
    from './pages/admin/AdminApplications';

import AdminApplicationDetails
    from './pages/admin/AdminApplicationDetails';

import AdminScholarships
    from './pages/admin/AdminScholarships';

import AdminStudents
    from './pages/admin/AdminStudents';

import AdminStudentDetails
    from './pages/admin/AdminStudentDetails';

import AdminSettings
    from './pages/admin/AdminSettings';

import AdminFreeshipCards
    from './pages/admin/AdminFreeshipCards';

import PortalHome
    from './pages/PortalHome';


/* ============================================================
   GLOBAL STYLES
============================================================ */

import './App.css';


/* ============================================================
   HOME PAGE
============================================================ */

const Home = () => {

    const navigate =
        useNavigate();

    return (

        <div className="landing-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="landing-header">

                <div className="portal-container landing-header-inner">

                    <div className="brand-section">

                        <div className="brand-emblem">

                            <GraduationCap
                                size={28}
                            />

                        </div>

                        <div className="brand-text">

                            <div className="brand-title">
                                University Scholarship Portal
                            </div>

                            <div className="brand-subtitle">
                                Digital Scholarship Management System
                            </div>

                        </div>

                    </div>


                    <div className="header-actions">

                        <button
                            type="button"
                            className="portal-button portal-button-secondary"
                            onClick={() =>
                                navigate('/login')
                            }
                        >

                            <LogIn
                                size={17}
                            />

                            Student Login

                        </button>


                        <button
                            type="button"
                            className="portal-button portal-button-primary"
                            onClick={() =>
                                navigate('/register')
                            }
                        >

                            <UserPlus
                                size={17}
                            />

                            Register

                        </button>

                    </div>

                </div>

            </header>


            {/* =================================================
                HERO
            ================================================= */}

            <section className="hero-section">

                <div className="portal-container">

                    <div className="hero-content">

                        <div className="hero-badge">

                            <ShieldCheck
                                size={16}
                            />

                            Official University Scholarship Services

                        </div>


                        <h1 className="hero-title">

                            University Scholarship
                            <br />

                            <span>
                                Management Portal
                            </span>

                        </h1>


                        <p className="hero-description">

                            A secure digital platform for students
                            to discover eligible scholarships,
                            submit applications, upload documents,
                            and track their scholarship status
                            throughout the complete verification
                            process.

                        </p>


                        <div className="hero-actions">

                            <button
                                type="button"
                                className="portal-button portal-button-primary"
                                onClick={() =>
                                    navigate('/login')
                                }
                            >

                                Access Student Portal

                                <ArrowRight
                                    size={18}
                                />

                            </button>


                            <button
                                type="button"
                                className="portal-button portal-button-secondary"
                                onClick={() =>
                                    navigate('/register')
                                }
                            >

                                Create Student Account

                            </button>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                INFORMATION SECTION
            ================================================= */}

            <section className="info-section">

                <div className="portal-container">

                    <div className="section-heading">

                        <div className="hero-badge">

                            <FileText
                                size={15}
                            />

                            DIGITAL SERVICES

                        </div>


                        <h2 className="portal-heading">

                            Scholarship Services

                        </h2>


                        <p className="portal-text">

                            Everything students need to manage
                            their scholarship applications in one
                            secure location.

                        </p>

                    </div>


                    <div className="info-grid">

                        <div className="info-card">

                            <div className="info-card-icon">

                                <GraduationCap
                                    size={23}
                                />

                            </div>


                            <h3>
                                Find Scholarships
                            </h3>


                            <p>

                                Browse available university
                                scholarship programmes and review
                                their eligibility requirements.

                            </p>

                        </div>


                        <div className="info-card">

                            <div className="info-card-icon">

                                <FileText
                                    size={23}
                                />

                            </div>


                            <h3>
                                Online Applications
                            </h3>


                            <p>

                                Complete your scholarship
                                application and securely submit the
                                required information and documents.

                            </p>

                        </div>


                        <div className="info-card">

                            <div className="info-card-icon">

                                <ShieldCheck
                                    size={23}
                                />

                            </div>


                            <h3>
                                Track Application
                            </h3>


                            <p>

                                Monitor verification, correction,
                                sanction and disbursement progress
                                from your student dashboard.

                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="landing-footer">

                <div className="portal-container footer-inner">

                    <div className="footer-text">

                        © {new Date().getFullYear()}
                        {' '}
                        University Scholarship Portal

                    </div>


                    <div className="footer-links">

                        <Link to="/login">
                            Student Login
                        </Link>

                        <Link to="/register">
                            Student Registration
                        </Link>

                        <Link to="/admin/login">
                            Administration
                        </Link>

                    </div>

                </div>

            </footer>

        </div>
    );
};


/* ============================================================
   STUDENT LOGIN PAGE
============================================================ */

const LoginPage = () => {

    const navigate =
        useNavigate();

    const [studentId, setStudentId] =
        useState('');

    const [password, setPassword] =
        useState('');

    const [error, setError] =
        useState('');

    const [loading, setLoading] =
        useState(false);


    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError('');


        if (
            !studentId.trim() ||
            !password
        ) {

            setError(
                'Please enter your Student ID and password.'
            );

            return;
        }


        try {

            setLoading(true);


            const data =
                await authService.loginStudent(
                    studentId.trim(),
                    password
                );


            authService.saveAuthData(
                data
            );


            if (
                data.user?.role ===
                'admin'
            ) {

                navigate(
                    '/admin',
                    {
                        replace: true
                    }
                );

            } else {

                navigate(
                    data.user?.mustChangePassword
                        ? '/student/set-password'
                        : '/student',
                    {
                        replace: true
                    }
                );

            }

        } catch (error) {

            console.error(
                'Login error:',
                error
            );

            setError(
                error.response?.data?.message ||
                'Unable to login. Please check your Student ID and password.'
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-header">

                    <div className="brand-emblem">

                        <GraduationCap
                            size={27}
                        />

                    </div>


                    <h1 className="portal-heading">

                        Student Login

                    </h1>


                    <p className="portal-text">

                        Access your University Scholarship Portal.

                    </p>

                </div>


                {error && (

                    <div className="auth-error">

                        {error}

                    </div>

                )}


                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">

                        <label className="portal-label">
                            Student ID
                        </label>

                        <input
                            type="text"
                            className="portal-input"
                            value={studentId}
                            onChange={event =>
                                setStudentId(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your Student ID"
                            autoComplete="username"
                        />

                    </div>


                    <div className="form-group">

                        <label className="portal-label">
                            Password
                        </label>

                        <input
                            type="password"
                            className="portal-input"
                            value={password}
                            onChange={event =>
                                setPassword(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />

                    </div>


                    <button
                        type="submit"
                        className="portal-button portal-button-primary auth-submit-button"
                        disabled={loading}
                    >

                        {loading
                            ? 'Signing In...'
                            : 'Sign In'}

                    </button>

                </form>


                <div className="auth-footer">
                    <button
                        type="button"
                        className="auth-link-button"
                        onClick={() => navigate('/forgot-password')}
                    >
                        Forgot password? Get an email code
                    </button>
                </div>


                <div className="auth-footer">

                    <span>
                        Don't have a student account?
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/register')
                        }
                    >
                        Create Account
                    </button>

                </div>


                <div className="auth-footer">

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/admin/login')
                        }
                    >
                        Administration Login
                    </button>

                </div>


                <div className="auth-footer">

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/')
                        }
                    >
                        Back to Portal
                    </button>

                </div>

            </div>

        </div>
    );
};


/* ============================================================
   STUDENT REGISTER PAGE
============================================================ */

const RegisterPage = () => {

    const navigate =
        useNavigate();


    /* --------------------------------------------------------
       FORM STATE
    -------------------------------------------------------- */

    const [name, setName] =
        useState('');

    const [email, setEmail] =
        useState('');

    const [mobile, setMobile] =
        useState('');


    /* --------------------------------------------------------
       RESPONSE STATE
    -------------------------------------------------------- */

    const [credentials, setCredentials] =
        useState(null);

    const [registrationAuth, setRegistrationAuth] =
        useState(null);

    const [error, setError] =
        useState('');

    const [loading, setLoading] =
        useState(false);

    const [copiedField, setCopiedField] =
        useState('');


    /* --------------------------------------------------------
       REGISTRATION
    -------------------------------------------------------- */

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError('');
        setCredentials(null);
        setRegistrationAuth(null);
        setCopiedField('');


        /* ----------------------------------------------------
           BASIC VALIDATION
        ---------------------------------------------------- */

        if (
            !name.trim() ||
            !email.trim() ||
            !mobile.trim()
        ) {

            setError(
                'Please fill in all required fields.'
            );

            return;
        }


        if (!/^\d{10}$/.test(mobile.trim())) {

            setError(
                'Mobile number must contain exactly 10 digits.'
            );

            return;
        }


        try {

            setLoading(true);


            const data =
                await authService.registerStudent(
                    name.trim(),
                    email.trim(),
                    mobile.trim()
                );


            /* ------------------------------------------------
               GENERATED CREDENTIALS
            ------------------------------------------------ */

            if (
                !data ||
                !data.credentials ||
                !data.credentials.studentId ||
                !data.credentials.initialPassword
            ) {

                throw new Error(
                    'Registration succeeded, but the generated login credentials were not received.'
                );
            }


            setCredentials({
                studentId:
                    data.credentials.studentId,

                initialPassword:
                    data.credentials.initialPassword
            });

            setRegistrationAuth({
                token: data.token,
                user: data.user
            });


            setName('');
            setEmail('');
            setMobile('');


        } catch (error) {

            console.error(
                'Registration error:',
                error
            );


            setError(
                error.response?.data?.message ||
                error.message ||
                'Unable to create student account.'
            );

        } finally {

            setLoading(false);

        }
    };


    /* --------------------------------------------------------
       COPY GENERATED CREDENTIAL
    -------------------------------------------------------- */

    const copyCredential = async (
        field,
        value
    ) => {

        try {

            await navigator.clipboard.writeText(
                value
            );

            setCopiedField(
                field
            );


            setTimeout(
                () => {
                    setCopiedField('');
                },
                2000
            );

        } catch (error) {

            console.error(
                'Copy failed:',
                error
            );

            setError(
                'Unable to copy the credential. Please copy it manually.'
            );
        }
    };


    /* --------------------------------------------------------
       SUCCESS / CREDENTIAL SCREEN
    -------------------------------------------------------- */

    if (credentials) {

        return (

            <div className="auth-page">

                <div className="auth-card">

                    <div className="auth-header">

                        <div className="brand-emblem">

                            <CheckCircle
                                size={27}
                            />

                        </div>


                        <h1 className="portal-heading">

                            Registration Successful

                        </h1>


                        <p className="portal-text">

                            Your student account has been created
                            successfully.

                        </p>

                    </div>


                    <div className="auth-success">

                        Save these credentials carefully.
                        You will need them to sign in.

                    </div>


                    <div className="form-group">

                        <label className="portal-label">
                            Student ID
                        </label>


                        <div
                            style={{
                                display: 'flex',
                                gap: '8px'
                            }}
                        >

                            <input
                                type="text"
                                className="portal-input"
                                value={
                                    credentials.studentId
                                }
                                readOnly
                            />


                            <button
                                type="button"
                                className="portal-button portal-button-secondary"
                                onClick={() =>
                                    copyCredential(
                                        'studentId',
                                        credentials.studentId
                                    )
                                }
                                title="Copy Student ID"
                            >

                                {copiedField ===
                                'studentId'
                                    ? (
                                        <CheckCircle
                                            size={17}
                                        />
                                    )
                                    : (
                                        <Copy
                                            size={17}
                                        />
                                    )}

                            </button>

                        </div>

                    </div>


                    <div className="form-group">

                        <label className="portal-label">
                            Initial Password
                        </label>


                        <div
                            style={{
                                display: 'flex',
                                gap: '8px'
                            }}
                        >

                            <input
                                type="text"
                                className="portal-input"
                                value={
                                    credentials.initialPassword
                                }
                                readOnly
                            />


                            <button
                                type="button"
                                className="portal-button portal-button-secondary"
                                onClick={() =>
                                    copyCredential(
                                        'password',
                                        credentials.initialPassword
                                    )
                                }
                                title="Copy Initial Password"
                            >

                                {copiedField ===
                                'password'
                                    ? (
                                        <CheckCircle
                                            size={17}
                                        />
                                    )
                                    : (
                                        <Copy
                                            size={17}
                                        />
                                    )}

                            </button>

                        </div>

                    </div>


                    <div className="auth-error">

                        <strong>
                            Important:
                        </strong>
                        {' '}
                        This initial password should be saved
                        securely. Continue to set a new password
                        before you enter the student portal.

                    </div>

                    {error && (
                        <div className="auth-error" role="alert">
                            {error}
                        </div>
                    )}


                    <button
                        type="button"
                        className="portal-button portal-button-primary auth-submit-button"
                        onClick={() => {
                            try {
                                authService.saveAuthData(registrationAuth);
                                navigate('/student/set-password', { replace: true });
                            } catch {
                                setError(
                                    'Unable to start password setup. Please sign in with the Student ID and initial password.'
                                );
                            }
                        }}
                    >

                        Continue to Student

                        <ArrowRight
                            size={18}
                        />

                    </button>


                    <div className="auth-footer">

                        <button
                            type="button"
                            onClick={() =>
                                navigate('/')
                            }
                        >
                            Back to Portal
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    /* --------------------------------------------------------
       REGISTRATION FORM
    -------------------------------------------------------- */

    return (

        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-header">

                    <div className="brand-emblem">

                        <GraduationCap
                            size={27}
                        />

                    </div>


                    <h1 className="portal-heading">

                        Student Registration

                    </h1>


                    <p className="portal-text">

                        Create your account to access scholarship
                        services.

                    </p>

                </div>


                {error && (

                    <div className="auth-error">

                        {error}

                    </div>

                )}


                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">

                        <label className="portal-label">
                            Full Name *
                        </label>

                        <input
                            type="text"
                            className="portal-input"
                            value={name}
                            onChange={event =>
                                setName(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your full name"
                            autoComplete="name"
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label className="portal-label">
                            Email Address *
                        </label>

                        <input
                            type="email"
                            className="portal-input"
                            value={email}
                            onChange={event =>
                                setEmail(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your email"
                            autoComplete="email"
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label className="portal-label">
                            Mobile Number *
                        </label>

                        <input
                            type="text"
                            className="portal-input"
                            value={mobile}
                            onChange={event =>
                                setMobile(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your 10-digit mobile number"
                            autoComplete="tel"
                            maxLength={10}
                            inputMode="numeric"
                            required
                        />

                    </div>


                    <button
                        type="submit"
                        className="portal-button portal-button-primary auth-submit-button"
                        disabled={loading}
                    >

                        {loading
                            ? 'Creating Account...'
                            : 'Create Student Account'}

                    </button>

                </form>


                <div className="auth-footer">

                    <span>
                        Already have an account?
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/login')
                        }
                    >
                        Student Login
                    </button>

                </div>


                <div className="auth-footer">

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/')
                        }
                    >
                        Back to Portal
                    </button>

                </div>

            </div>

        </div>
    );
};


/* ============================================================
   APP ROUTER
============================================================ */

const App = () => {

    return (

        <BrowserRouter>

            <Routes>

                {/* =================================================
                    PUBLIC ROUTES
                ================================================= */}

                <Route
                    path="/"
                    element={
                        <PortalHome />
                    }
                />


                <Route
                    path="/login"
                    element={
                        <LoginPage />
                    }
                />


                <Route
                    path="/forgot-password"
                    element={
                        <ForgotPassword />
                    }
                />


                <Route
                    path="/register"
                    element={
                        <RegisterPage />
                    }
                />


                <Route
                    path="/student/set-password"
                    element={
                        <SetInitialPassword />
                    }
                />


                {/* =================================================
                    ADMIN LOGIN
                ================================================= */}

                <Route
                    path="/admin/login"
                    element={
                        <AdminLogin />
                    }
                />


                {/* =================================================
                    ADMIN PORTAL
                ================================================= */}

                <Route
                    path="/admin"
                    element={
                        <AdminLayout />
                    }
                >

                    <Route
                        index
                        element={
                            <AdminDashboard />
                        }
                    />


                    <Route
                        path="applications"
                        element={
                            <AdminApplications />
                        }
                    />


                    <Route
                        path="applications/:id"
                        element={
                            <AdminApplicationDetails />
                        }
                    />


                    <Route
                        path="freeship-cards"
                        element={
                            <AdminFreeshipCards />
                        }
                    />


                    <Route
                        path="scholarships"
                        element={
                            <AdminScholarships />
                        }
                    />


                    <Route
                        path="students"
                        element={
                            <AdminStudents />
                        }
                    />


                    <Route
                        path="students/:id"
                        element={
                            <AdminStudentDetails />
                        }
                    />


                    <Route
                        path="settings"
                        element={
                            <AdminSettings />
                        }
                    />

                </Route>


                {/* =================================================
                    STUDENT PORTAL
                ================================================= */}

                <Route
                    path="/student"
                    element={<StudentPasswordGate />}
                >
                    <Route
                        index
                        element={<StudentDashboard />}
                    />

                    <Route
                        path="freeship-card"
                        element={<FreeshipCard />}
                    />

                    <Route
                        path="profile"
                        element={<StudentProfile />}
                    />

                    <Route
                        path="apply-online"
                        element={<ApplyOnline />}
                    />

                    <Route
                        path="scholarships"
                        element={<Scholarships />}
                    />

                    <Route
                        path="scholarships/:id"
                        element={<ScholarshipDetails />}
                    />

                    <Route
                        path="scholarships/:id/eligibility"
                        element={<Eligibility />}
                    />

                    <Route
                        path="scholarships/:id/application"
                        element={<ScholarshipApplication />}
                    />

                    <Route
                        path="applications"
                        element={<MyApplications />}
                    />

                    <Route
                        path="applications/:id"
                        element={<ApplicationTracking />}
                    />

                    <Route
                        path="applications/:id/documents"
                        element={<ApplicationDocuments />}
                    />
                </Route>


                {/* =================================================
                    FALLBACK
                ================================================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
};

const StudentPasswordGate = () => {
    const user = authService.getCurrentUser();

    if (
        authService.isAuthenticated() &&
        user?.role === 'student' &&
        user.mustChangePassword
    ) {
        return <Navigate to="/student/set-password" replace />;
    }

    return <Outlet />;
};


export default App;
