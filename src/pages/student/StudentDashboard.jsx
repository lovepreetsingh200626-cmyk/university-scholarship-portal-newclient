import React, {
    useEffect,
    useState
} from 'react';

import {
    GraduationCap,
    LayoutDashboard,
    UserCircle,
    FileText,
    ClipboardList,
    Bell,
    LogOut,
    ChevronRight,
    ShieldCheck,
    Clock3
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import API from '../../services/api';
import authService from '../../services/authService';

const StudentDashboard = () => {

    const navigate = useNavigate();

    const user =
        authService.getCurrentUser();

    const [profileCompleted, setProfileCompleted] =
        useState(false);

    const [applications, setApplications] =
        useState([]);

    const [loadingDashboard, setLoadingDashboard] =
        useState(true);

    /* ============================================================
       NAVIGATION
    ============================================================ */

    const goToDashboard = () => {
        navigate('/student');
    };

    const goToProfile = () => {
        navigate('/student/profile');
    };

    const goToScholarships = () => {
        navigate('/student/scholarships');
    };

    const goToApplications = () => {
        navigate('/student/applications');
    };

    /* ============================================================
       LOGOUT
    ============================================================ */

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/login';
    };

    /* ============================================================
       LOAD DASHBOARD DATA
    ============================================================ */

    useEffect(() => {

        const loadDashboardData = async () => {

            try {

                const token =
                    authService.getToken();

                if (!token) {
                    navigate('/login');
                    return;
                }

                const headers = {
                    Authorization:
                        `Bearer ${token}`
                };

                /* ================================================
                   LOAD STUDENT PROFILE
                ================================================ */

                try {

                    const profileResponse =
                        await API.get(
                            '/student-profile/me',
                            {
                                headers
                            }
                        );

                    setProfileCompleted(
                        profileResponse.data
                            ?.profileCompleted === true
                    );

                } catch (profileError) {

                    if (
                        profileError.response?.status ===
                        401
                    ) {
                        authService.logout();
                        navigate('/login');
                        return;
                    }

                    console.error(
                        'Unable to load student profile:',
                        profileError
                    );

                }

                /* ================================================
                   LOAD STUDENT APPLICATIONS
                ================================================ */

                try {

                    const applicationResponse =
                        await API.get(
                            '/applications/my',
                            {
                                headers
                            }
                        );

                    setApplications(
                        applicationResponse.data
                            ?.applications || []
                    );

                } catch (applicationError) {

                    if (
                        applicationError.response?.status ===
                        401
                    ) {
                        authService.logout();
                        navigate('/login');
                        return;
                    }

                    console.error(
                        'Unable to load applications:',
                        applicationError
                    );

                }

            } catch (error) {

                console.error(
                    'Dashboard loading error:',
                    error
                );

            } finally {

                setLoadingDashboard(false);

            }
        };

        loadDashboardData();

    }, [navigate]);

    /* ============================================================
       APPLICATION STATUS HELPERS
    ============================================================ */

    const getLatestApplication = () => {

        if (
            !applications ||
            applications.length === 0
        ) {
            return null;
        }

        return [...applications].sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.updatedAt ||
                        a.createdAt ||
                        0
                    );

                const dateB =
                    new Date(
                        b.updatedAt ||
                        b.createdAt ||
                        0
                    );

                return dateB - dateA;
            }
        )[0];

    };

    const latestApplication =
        getLatestApplication();

    const getStatusClass = (status) => {

        switch (status) {

            case 'VERIFIED':
            case 'SANCTIONED':
            case 'DISBURSED':
                return 'portal-status-success';

            case 'SUBMITTED':
            case 'UNDER VERIFICATION':
            case 'RESUBMITTED':
                return 'portal-status-info';

            case 'CORRECTION REQUIRED':
                return 'portal-status-warning';

            case 'REJECTED':
                return 'portal-status-danger';

            case 'DRAFT':
            default:
                return 'portal-status-neutral';
        }
    };

    const getStatusText = (status) => {

        if (!status) {
            return '';
        }

        return status
            .toLowerCase()
            .replace(
                /\b\w/g,
                (letter) =>
                    letter.toUpperCase()
            );
    };

    const getApplicationMessage = (status) => {

        switch (status) {

            case 'DRAFT':
                return 'Your scholarship application is saved as a draft.';

            case 'SUBMITTED':
                return 'Your application has been submitted and is awaiting verification.';

            case 'UNDER VERIFICATION':
                return 'Your application is currently being verified by the scholarship authority.';

            case 'CORRECTION REQUIRED':
                return 'Your application requires correction. Please review the remarks and update it.';

            case 'RESUBMITTED':
                return 'Your corrected application has been resubmitted for verification.';

            case 'VERIFIED':
                return 'Your application has been verified successfully.';

            case 'SANCTIONED':
                return 'Your scholarship application has been sanctioned.';

            case 'DISBURSED':
                return 'Your scholarship amount has been marked as disbursed.';

            case 'REJECTED':
                return 'Your scholarship application has been rejected.';

            default:
                return 'Your application status will appear here.';
        }
    };

    const formatDate = (date) => {

        if (!date) {
            return '—';
        }

        return new Date(date).toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        );
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#f5f7fb',
                display: 'flex'
            }}
        >

            {/* =====================================================
                SIDEBAR
            ====================================================== */}

            <aside
                style={{
                    width: '250px',
                    minHeight: '100vh',
                    background: '#172033',
                    color: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0
                }}
            >

                {/* BRAND */}

                <div
                    style={{
                        padding: '24px 20px',
                        borderBottom:
                            '1px solid rgba(255,255,255,0.10)'
                    }}
                >

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                    >

                        <div
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                background: '#174a8b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <GraduationCap size={22} />
                        </div>

                        <div>

                            <div
                                style={{
                                    fontSize: '15px',
                                    fontWeight: '700'
                                }}
                            >
                                Scholarship Portal
                            </div>

                            <div
                                style={{
                                    fontSize: '11px',
                                    color: '#94a3b8',
                                    marginTop: '3px'
                                }}
                            >
                                Student Services
                            </div>

                        </div>

                    </div>

                </div>

                {/* NAVIGATION */}

                <nav
                    style={{
                        padding: '22px 14px',
                        flex: 1
                    }}
                >

                    <div
                        style={{
                            color: '#64748b',
                            fontSize: '10px',
                            fontWeight: '700',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            padding: '0 12px',
                            marginBottom: '10px'
                        }}
                    >
                        Main Menu
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px'
                        }}
                    >

                        {/* Dashboard */}

                        <button
                            type="button"
                            onClick={goToDashboard}
                            style={{
                                width: '100%',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px',
                                background: '#174a8b',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                textAlign: 'left',
                                fontWeight: '600'
                            }}
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
                        </button>

                        {/* My Profile */}

                        <button
                            type="button"
                            onClick={goToProfile}
                            style={{
                                width: '100%',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px',
                                background: 'transparent',
                                color: '#cbd5e1',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                textAlign: 'left'
                            }}
                        >
                            <UserCircle size={18} />
                            My Profile
                        </button>

                        {/* Scholarships */}

                        <button
                            type="button"
                            onClick={goToScholarships}
                            style={{
                                width: '100%',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px',
                                background: 'transparent',
                                color: '#cbd5e1',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                textAlign: 'left'
                            }}
                        >
                            <FileText size={18} />
                            Scholarships
                        </button>

                        {/* My Applications */}

                        <button
                            type="button"
                            onClick={goToApplications}
                            style={{
                                width: '100%',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px',
                                background: 'transparent',
                                color: '#cbd5e1',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                textAlign: 'left'
                            }}
                        >
                            <ClipboardList size={18} />
                            My Applications
                        </button>

                        {/* Notifications */}

                        <button
                            type="button"
                            style={{
                                width: '100%',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px',
                                background: 'transparent',
                                color: '#cbd5e1',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                textAlign: 'left'
                            }}
                        >
                            <Bell size={18} />
                            Notifications
                        </button>

                    </div>

                </nav>

                {/* LOGOUT */}

                <div
                    style={{
                        padding: '16px 14px',
                        borderTop:
                            '1px solid rgba(255,255,255,0.10)'
                    }}
                >

                    <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px',
                            background:
                                'rgba(255,255,255,0.06)',
                            color: '#cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            textAlign: 'left'
                        }}
                    >
                        <LogOut size={18} />
                        Logout
                    </button>

                </div>

            </aside>

            {/* =====================================================
                MAIN CONTENT
            ====================================================== */}

            <main
                style={{
                    marginLeft: '250px',
                    width: 'calc(100% - 250px)',
                    minHeight: '100vh'
                }}
            >

                {/* TOP HEADER */}

                <header
                    style={{
                        height: '76px',
                        background: '#ffffff',
                        borderBottom:
                            '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 34px'
                    }}
                >

                    <div>

                        <h1
                            style={{
                                margin: 0,
                                fontFamily:
                                    "'Playfair Display', Georgia, serif",
                                fontSize: '24px',
                                color: '#172033'
                            }}
                        >
                            Student Dashboard
                        </h1>

                        <p
                            style={{
                                margin: '3px 0 0',
                                color: '#64748b',
                                fontSize: '13px'
                            }}
                        >
                            University Scholarship Management Portal
                        </p>

                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                    >

                        <div
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                background: '#eaf1fb',
                                color: '#174a8b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700'
                            }}
                        >
                            {user?.name
                                ? user.name
                                    .charAt(0)
                                    .toUpperCase()
                                : 'S'}
                        </div>

                        <div>

                            <div
                                style={{
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    color: '#172033'
                                }}
                            >
                                {user?.name || 'Student'}
                            </div>

                            <div
                                style={{
                                    fontSize: '11px',
                                    color: '#64748b'
                                }}
                            >
                                Student Account
                            </div>

                        </div>

                    </div>

                </header>

                {/* PAGE CONTENT */}

                <div
                    style={{
                        padding: '34px'
                    }}
                >

                    {/* WELCOME SECTION */}

                    <section
                        style={{
                            background:
                                'linear-gradient(135deg, #174a8b 0%, #2364ad 100%)',
                            borderRadius: '14px',
                            padding: '30px',
                            color: '#ffffff',
                            marginBottom: '26px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >

                        <div
                            style={{
                                position: 'relative',
                                zIndex: 1
                            }}
                        >

                            <div
                                style={{
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    opacity: 0.85,
                                    marginBottom: '8px'
                                }}
                            >
                                Welcome back
                            </div>

                            <h2
                                style={{
                                    margin: 0,
                                    fontFamily:
                                        "'Playfair Display', Georgia, serif",
                                    fontSize: '32px'
                                }}
                            >
                                {user?.name || 'Student'}
                            </h2>

                            <p
                                style={{
                                    margin: '10px 0 0',
                                    maxWidth: '650px',
                                    lineHeight: 1.6,
                                    color: '#dbeafe',
                                    fontSize: '14px'
                                }}
                            >
                                Manage your scholarship profile,
                                discover available scholarships,
                                submit applications and track
                                their progress from one place.
                            </p>

                        </div>

                        <GraduationCap
                            size={150}
                            strokeWidth={1}
                            style={{
                                position: 'absolute',
                                right: '35px',
                                bottom: '-35px',
                                opacity: 0.10
                            }}
                        />

                    </section>

                    {/* SUMMARY CARDS */}

                    <section
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(3, minmax(0, 1fr))',
                            gap: '18px',
                            marginBottom: '26px'
                        }}
                    >

                        {/* Profile */}

                        <div
                            className="portal-card"
                            style={{
                                padding: '22px',
                                cursor: 'pointer'
                            }}
                            onClick={goToProfile}
                        >

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent:
                                        'space-between',
                                    marginBottom: '16px'
                                }}
                            >

                                <div
                                    style={{
                                        width: '42px',
                                        height: '42px',
                                        borderRadius: '10px',
                                        background:
                                            '#eaf1fb',
                                        color: '#174a8b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent:
                                            'center'
                                    }}
                                >
                                    <UserCircle size={21} />
                                </div>

                                {loadingDashboard ? (

                                    <span className="portal-status portal-status-neutral">
                                        Checking...
                                    </span>

                                ) : profileCompleted ? (

                                    <span className="portal-status portal-status-success">
                                        Profile Complete
                                    </span>

                                ) : (

                                    <span className="portal-status portal-status-warning">
                                        Complete Profile
                                    </span>

                                )}

                            </div>

                            <h3
                                style={{
                                    margin: '0 0 7px',
                                    fontSize: '16px',
                                    color: '#172033'
                                }}
                            >
                                Student Profile
                            </h3>

                            <p
                                style={{
                                    margin: 0,
                                    color: '#64748b',
                                    fontSize: '13px',
                                    lineHeight: 1.6
                                }}
                            >
                                {profileCompleted
                                    ? 'Your academic, personal and bank details are complete.'
                                    : 'Complete your academic, personal and bank details.'}
                            </p>

                        </div>

                        {/* Scholarships */}

                        <div
                            className="portal-card"
                            onClick={goToScholarships}
                            style={{
                                padding: '22px',
                                cursor: 'pointer'
                            }}
                        >

                            <div
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '10px',
                                    background:
                                        '#eaf1fb',
                                    color: '#174a8b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent:
                                        'center',
                                    marginBottom: '16px'
                                }}
                            >
                                <FileText size={21} />
                            </div>

                            <h3
                                style={{
                                    margin: '0 0 7px',
                                    fontSize: '16px',
                                    color: '#172033'
                                }}
                            >
                                Available Scholarships
                            </h3>

                            <p
                                style={{
                                    margin: 0,
                                    color: '#64748b',
                                    fontSize: '13px',
                                    lineHeight: 1.6
                                }}
                            >
                                View published scholarships,
                                eligibility criteria and
                                application deadlines.
                            </p>

                        </div>

                        {/* Applications */}

                        <div
                            className="portal-card"
                            onClick={goToApplications}
                            style={{
                                padding: '22px',
                                cursor: 'pointer'
                            }}
                        >

                            <div
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '10px',
                                    background:
                                        '#eaf1fb',
                                    color: '#174a8b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent:
                                        'center',
                                    marginBottom: '16px'
                                }}
                            >
                                <ClipboardList size={21} />
                            </div>

                            <h3
                                style={{
                                    margin: '0 0 7px',
                                    fontSize: '16px',
                                    color: '#172033'
                                }}
                            >
                                My Applications
                            </h3>

                            <p
                                style={{
                                    margin: 0,
                                    color: '#64748b',
                                    fontSize: '13px',
                                    lineHeight: 1.6
                                }}
                            >
                                {loadingDashboard
                                    ? 'Checking your applications...'
                                    : applications.length === 0
                                        ? 'No scholarship applications submitted yet.'
                                        : `${applications.length} scholarship application${applications.length > 1 ? 's' : ''} in your account.`}
                            </p>

                        </div>

                    </section>

                    {/* MAIN DASHBOARD GRID */}

                    <section
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'minmax(0, 1.5fr) minmax(280px, 1fr)',
                            gap: '20px'
                        }}
                    >

                        {/* Application Status */}

                        <div
                            className="portal-card"
                            style={{
                                padding: '26px'
                            }}
                        >

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent:
                                        'space-between',
                                    marginBottom: '22px'
                                }}
                            >

                                <div>

                                    <h2
                                        style={{
                                            margin: 0,
                                            fontFamily:
                                                "'Playfair Display', Georgia, serif",
                                            fontSize: '21px',
                                            color: '#172033'
                                        }}
                                    >
                                        Application Status
                                    </h2>

                                    <p
                                        style={{
                                            margin:
                                                '5px 0 0',
                                            color: '#64748b',
                                            fontSize: '13px'
                                        }}
                                    >
                                        Your latest scholarship
                                        application activity.
                                    </p>

                                </div>

                                <Clock3
                                    size={22}
                                    color="#174a8b"
                                />

                            </div>

                            {loadingDashboard ? (

                                <div
                                    style={{
                                        border:
                                            '1px dashed #cbd5e1',
                                        borderRadius: '10px',
                                        padding: '32px',
                                        textAlign: 'center',
                                        background:
                                            '#f8fafc'
                                    }}
                                >

                                    <Clock3
                                        size={34}
                                        color="#94a3b8"
                                        style={{
                                            margin:
                                                '0 auto 10px'
                                        }}
                                    />

                                    <h3
                                        style={{
                                            margin:
                                                '0 0 6px',
                                            color: '#334155',
                                            fontSize: '15px'
                                        }}
                                    >
                                        Loading application status
                                    </h3>

                                    <p
                                        style={{
                                            margin: 0,
                                            color: '#64748b',
                                            fontSize: '13px'
                                        }}
                                    >
                                        Checking your latest
                                        scholarship application.
                                    </p>

                                </div>

                            ) : !latestApplication ? (

                                <div
                                    style={{
                                        border:
                                            '1px dashed #cbd5e1',
                                        borderRadius: '10px',
                                        padding: '28px',
                                        textAlign: 'center',
                                        background:
                                            '#f8fafc'
                                    }}
                                >

                                    <ClipboardList
                                        size={34}
                                        color="#94a3b8"
                                        style={{
                                            margin:
                                                '0 auto 10px'
                                        }}
                                    />

                                    <h3
                                        style={{
                                            margin:
                                                '0 0 6px',
                                            color: '#334155',
                                            fontSize: '15px'
                                        }}
                                    >
                                        No application activity yet
                                    </h3>

                                    <p
                                        style={{
                                            margin: 0,
                                            color: '#64748b',
                                            fontSize: '13px'
                                        }}
                                    >
                                        Your application status will
                                        appear here after you apply
                                        for a scholarship.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={goToScholarships}
                                        className="portal-button portal-button-secondary"
                                        style={{
                                            marginTop: '16px'
                                        }}
                                    >
                                        Browse Scholarships
                                    </button>

                                </div>

                            ) : (

                                <div
                                    style={{
                                        border:
                                            '1px solid #e2e8f0',
                                        borderRadius: '10px',
                                        padding: '22px',
                                        background:
                                            '#ffffff'
                                    }}
                                >

                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems:
                                                'flex-start',
                                            justifyContent:
                                                'space-between',
                                            gap: '20px',
                                            marginBottom:
                                                '18px'
                                        }}
                                    >

                                        <div>

                                            <h3
                                                style={{
                                                    margin:
                                                        '0 0 6px',
                                                    color: '#172033',
                                                    fontSize: '17px'
                                                }}
                                            >
                                                {latestApplication
                                                    .scholarship
                                                    ?.name ||
                                                    'Scholarship Application'}
                                            </h3>

                                            <p
                                                style={{
                                                    margin: 0,
                                                    color: '#64748b',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                Application No:{' '}
                                                {latestApplication
                                                    .applicationNumber ||
                                                    'Not assigned yet'}
                                            </p>

                                        </div>

                                        <span
                                            className={`portal-status ${getStatusClass(
                                                latestApplication.status
                                            )}`}
                                        >
                                            {getStatusText(
                                                latestApplication.status
                                            )}
                                        </span>

                                    </div>

                                    <p
                                        style={{
                                            margin:
                                                '0 0 18px',
                                            color: '#64748b',
                                            fontSize: '13px',
                                            lineHeight: 1.7
                                        }}
                                    >
                                        {getApplicationMessage(
                                            latestApplication.status
                                        )}
                                    </p>

                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems:
                                                'center',
                                            justifyContent:
                                                'space-between',
                                            gap: '15px',
                                            paddingTop:
                                                '15px',
                                            borderTop:
                                                '1px solid #e8edf3'
                                        }}
                                    >

                                        <span
                                            style={{
                                                color: '#64748b',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Last updated:{' '}
                                            {formatDate(
                                                latestApplication.updatedAt ||
                                                latestApplication.createdAt
                                            )}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={
                                                goToApplications
                                            }
                                            className="portal-button portal-button-secondary"
                                        >
                                            View Applications
                                        </button>

                                    </div>

                                </div>

                            )}

                        </div>

                        {/* QUICK ACTIONS */}

                        <div
                            className="portal-card"
                            style={{
                                padding: '26px'
                            }}
                        >

                            <h2
                                style={{
                                    margin: 0,
                                    fontFamily:
                                        "'Playfair Display', Georgia, serif",
                                    fontSize: '21px',
                                    color: '#172033'
                                }}
                            >
                                Quick Actions
                            </h2>

                            <p
                                style={{
                                    margin:
                                        '5px 0 20px',
                                    color: '#64748b',
                                    fontSize: '13px'
                                }}
                            >
                                Common student portal actions.
                            </p>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection:
                                        'column',
                                    gap: '10px'
                                }}
                            >

                                {/* Complete Profile */}

                                <button
                                    type="button"
                                    onClick={goToProfile}
                                    className="portal-button portal-button-secondary"
                                    style={{
                                        display: 'flex',
                                        alignItems:
                                            'center',
                                        justifyContent:
                                            'space-between',
                                        width: '100%'
                                    }}
                                >

                                    <span
                                        style={{
                                            display: 'flex',
                                            alignItems:
                                                'center',
                                            gap: '10px'
                                        }}
                                    >
                                        <UserCircle size={18} />

                                        {profileCompleted
                                            ? 'View Profile'
                                            : 'Complete Profile'}
                                    </span>

                                    <ChevronRight size={17} />

                                </button>

                                {/* Browse Scholarships */}

                                <button
                                    type="button"
                                    onClick={goToScholarships}
                                    className="portal-button portal-button-secondary"
                                    style={{
                                        display: 'flex',
                                        alignItems:
                                            'center',
                                        justifyContent:
                                            'space-between',
                                        width: '100%'
                                    }}
                                >

                                    <span
                                        style={{
                                            display: 'flex',
                                            alignItems:
                                                'center',
                                            gap: '10px'
                                        }}
                                    >
                                        <FileText size={18} />
                                        Browse Scholarships
                                    </span>

                                    <ChevronRight size={17} />

                                </button>

                                {/* View Applications */}

                                <button
                                    type="button"
                                    onClick={goToApplications}
                                    className="portal-button portal-button-secondary"
                                    style={{
                                        display: 'flex',
                                        alignItems:
                                            'center',
                                        justifyContent:
                                            'space-between',
                                        width: '100%'
                                    }}
                                >

                                    <span
                                        style={{
                                            display: 'flex',
                                            alignItems:
                                                'center',
                                            gap: '10px'
                                        }}
                                    >
                                        <ClipboardList
                                            size={18}
                                        />

                                        {applications.length > 0
                                            ? `View Applications (${applications.length})`
                                            : 'View Applications'}
                                    </span>

                                    <ChevronRight size={17} />

                                </button>

                            </div>

                        </div>

                    </section>

                    {/* PORTAL NOTICE */}

                    <section
                        className="portal-card"
                        style={{
                            marginTop: '20px',
                            padding: '20px 22px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px'
                        }}
                    >

                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                flexShrink: 0,
                                borderRadius: '10px',
                                background: '#eaf1fb',
                                color: '#174a8b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent:
                                    'center'
                            }}
                        >
                            <ShieldCheck size={21} />
                        </div>

                        <div>

                            <h3
                                style={{
                                    margin:
                                        '0 0 4px',
                                    fontSize: '14px',
                                    color: '#172033'
                                }}
                            >
                                Official Scholarship Portal
                            </h3>

                            <p
                                style={{
                                    margin: 0,
                                    color: '#64748b',
                                    fontSize: '12px',
                                    lineHeight: 1.6
                                }}
                            >
                                Keep your profile and documents
                                accurate. Information submitted
                                through this portal may be used
                                for scholarship verification.
                            </p>

                        </div>

                    </section>

                </div>

            </main>

            {/* =====================================================
                RESPONSIVE OVERRIDE
            ====================================================== */}

            <style>
                {`
                    @media (max-width: 900px) {

                        aside {
                            width: 210px !important;
                        }

                        main {
                            margin-left: 210px !important;
                            width: calc(100% - 210px) !important;
                        }

                        main section[style*="repeat(3"] {
                            grid-template-columns: 1fr !important;
                        }
                    }

                    @media (max-width: 700px) {

                        aside {
                            position: relative !important;
                            width: 100% !important;
                            min-height: auto !important;
                        }

                        main {
                            margin-left: 0 !important;
                            width: 100% !important;
                        }

                        body {
                            overflow-x: hidden;
                        }

                        main > header {
                            padding: 0 18px !important;
                        }

                        main > div {
                            padding: 20px !important;
                        }

                        main section[style*="minmax(0, 1.5fr"] {
                            grid-template-columns: 1fr !important;
                        }
                    }
                `}
            </style>

        </div>
    );
};

export default StudentDashboard;