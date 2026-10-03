import React, {
    useState
} from 'react';

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    Link,
    useNavigate
} from 'react-router-dom';

import {
    GraduationCap,
    FileText,
    ShieldCheck,
    ArrowRight,
    LogIn,
    UserPlus
} from 'lucide-react';

import authService from './services/authService';


/* ============================================================
   PUBLIC / AUTH PAGES
============================================================ */

import StudentDashboard
    from './pages/student/StudentDashboard';

import StudentProfile
    from './pages/student/StudentProfile';

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

import ApplicationDocuments
    from './pages/student/ApplicationDocuments';

import ApplicationTracking
    from './pages/student/ApplicationTracking';


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
                                navigate(
                                    '/login'
                                )
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
                                navigate(
                                    '/register'
                                )
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
                                    navigate(
                                        '/login'
                                    )
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
                                    navigate(
                                        '/register'
                                    )
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
   LOGIN PAGE
============================================================ */

const LoginPage = () => {

    const navigate =
        useNavigate();

    const [email, setEmail] =
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
            !email.trim() ||
            !password
        ) {

            setError(
                'Please enter your email and password.'
            );

            return;
        }


        try {

            setLoading(true);

            const data =
                await authService.loginStudent(
                    email.trim(),
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
                    '/student',
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
                'Unable to login. Please check your credentials.'
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
                    onSubmit={
                        handleSubmit
                    }
                >

                    <div className="form-group">

                        <label className="portal-label">
                            Email Address
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
                        disabled={
                            loading
                        }
                    >

                        {loading
                            ? 'Signing In...'
                            : 'Sign In'}

                    </button>

                </form>


                <div className="auth-footer">

                    <span>
                        Don't have a student account?
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                '/register'
                            )
                        }
                    >
                        Create Account
                    </button>

                </div>


                <div className="auth-footer">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                '/admin/login'
                            )
                        }
                    >
                        Administration Login
                    </button>

                </div>


                <div className="auth-footer">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                '/'
                            )
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
   REGISTER PAGE
============================================================ */

const RegisterPage = () => {

    const navigate =
        useNavigate();

    const [name, setName] =
        useState('');

    const [email, setEmail] =
        useState('');

    const [mobile, setMobile] =
        useState('');

    const [password, setPassword] =
        useState('');

    const [confirmPassword, setConfirmPassword] =
        useState('');

    const [error, setError] =
        useState('');

    const [success, setSuccess] =
        useState('');

    const [loading, setLoading] =
        useState(false);


    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError('');
        setSuccess('');


        if (
            !name.trim() ||
            !email.trim() ||
            !password ||
            !confirmPassword
        ) {

            setError(
                'Please fill in all required fields.'
            );

            return;
        }


        if (
            password !==
            confirmPassword
        ) {

            setError(
                'Passwords do not match.'
            );

            return;
        }


        try {

            setLoading(true);

            await authService.registerStudent(
                name.trim(),
                email.trim(),
                password,
                mobile.trim()
            );


            setSuccess(
                'Student account created successfully. You can now login.'
            );


            setName('');
            setEmail('');
            setMobile('');
            setPassword('');
            setConfirmPassword('');


        } catch (error) {

            console.error(
                'Registration error:',
                error
            );

            setError(
                error.response?.data?.message ||
                'Unable to create student account.'
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


                {success && (

                    <div className="auth-success">

                        {success}

                    </div>

                )}


                <form
                    className="auth-form"
                    onSubmit={
                        handleSubmit
                    }
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
                        />

                    </div>


                    <div className="form-group">

                        <label className="portal-label">
                            Mobile Number
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
                            placeholder="Enter your mobile number"
                        />

                    </div>


                    <div className="form-group">

                        <label className="portal-label">
                            Password *
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
                            placeholder="Create a password"
                        />

                    </div>


                    <div className="form-group">

                        <label className="portal-label">
                            Confirm Password *
                        </label>

                        <input
                            type="password"
                            className="portal-input"
                            value={confirmPassword}
                            onChange={event =>
                                setConfirmPassword(
                                    event.target.value
                                )
                            }
                            placeholder="Confirm your password"
                        />

                    </div>


                    <button
                        type="submit"
                        className="portal-button portal-button-primary auth-submit-button"
                        disabled={
                            loading
                        }
                    >

                        {loading
                            ? 'Creating Account...'
                            : 'Create Account'}

                    </button>

                </form>


                <div className="auth-footer">

                    <span>
                        Already have an account?
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                '/login'
                            )
                        }
                    >
                        Student Login
                    </button>

                </div>


                <div className="auth-footer">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                '/'
                            )
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
                        <Home />
                    }
                />


                <Route
                    path="/login"
                    element={
                        <LoginPage />
                    }
                />


                <Route
                    path="/register"
                    element={
                        <RegisterPage />
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
                    element={
                        <StudentDashboard />
                    }
                />


                <Route
                    path="/student/profile"
                    element={
                        <StudentProfile />
                    }
                />


                <Route
                    path="/student/scholarships"
                    element={
                        <Scholarships />
                    }
                />


                <Route
                    path="/student/scholarships/:id"
                    element={
                        <ScholarshipDetails />
                    }
                />


                <Route
                    path="/student/scholarships/:id/eligibility"
                    element={
                        <Eligibility />
                    }
                />


                <Route
                    path="/student/scholarships/:id/application"
                    element={
                        <ScholarshipApplication />
                    }
                />


                <Route
                    path="/student/applications"
                    element={
                        <MyApplications />
                    }
                />


                <Route
                    path="/student/applications/:id"
                    element={
                        <ApplicationTracking />
                    }
                />


                <Route
                    path="/student/applications/:id/documents"
                    element={
                        <ApplicationDocuments />
                    }
                />


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


export default App;