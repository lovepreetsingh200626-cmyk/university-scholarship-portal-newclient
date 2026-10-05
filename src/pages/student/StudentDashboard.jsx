import React, {
    useEffect,
    useState
} from 'react';

import {
    GraduationCap,
    LayoutDashboard,
    FileText,
    FileCheck2,
    Bell,
    LogOut,
    ChevronRight,
    Menu,
    ShieldCheck,
    Clock3,
    UserCircle,
    X
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import API from '../../services/api';
import authService from '../../services/authService';


const StudentDashboard = () => {

    const navigate = useNavigate();

    const user =
        authService.getCurrentUser();

    const [freeshipStatus, setFreeshipStatus] =
        useState('DRAFT');

    const [applications, setApplications] =
        useState([]);

    const [loadingDashboard, setLoadingDashboard] =
        useState(true);

    const [notificationsOpen, setNotificationsOpen] =
        useState(false);

    const [mobileNavOpen, setMobileNavOpen] =
        useState(false);


    /* ============================================================
       NAVIGATION
    ============================================================ */

    const goToDashboard = () => {
        setMobileNavOpen(false);
        navigate('/student');
    };

    const goToScholarships = () => {
        setMobileNavOpen(false);
        navigate('/student/scholarships');
    };

    const goToApplications = () => {
        setMobileNavOpen(false);
        navigate('/student/apply-online');
    };

    const goToFreeshipCard = () => {
        setMobileNavOpen(false);
        navigate('/student/freeship-card');
    };

    const openNotification = (notification) => {
        setNotificationsOpen(false);

        const application = notification.application;
        const applicationPath =
            application.status === 'DRAFT' ||
            application.status === 'CORRECTION REQUIRED'
                ? `/student/applications/${application._id}/documents`
                : `/student/applications/${application._id}`;

        navigate(applicationPath);
    };


    /* ============================================================
       LOGOUT
    ============================================================ */

    const handleLogout = () => {

        setMobileNavOpen(false);

        authService.logout();

        navigate('/login', {
            replace: true
        });

    };


    /* ============================================================
       LOAD DASHBOARD DATA
    ============================================================ */

    useEffect(() => {

        let isMounted = true;

        const loadDashboardData = async () => {

            try {

                const token =
                    authService.getToken();

                if (!token) {

                    navigate('/login', {
                        replace: true
                    });

                    return;
                }


                try {
                    const freeshipResponse = await API.get('/freeship-cards/me');
                    if (isMounted) {
                        setFreeshipStatus(freeshipResponse.data?.application?.status || 'DRAFT');
                    }
                } catch (freeshipError) {
                    if (freeshipError.response?.status === 401) {
                        authService.logout();
                        navigate('/login', { replace: true });
                        return;
                    }
                    console.error('Unable to load Freeship Card status:', freeshipError);
                }


                /* ================================================
                   LOAD STUDENT APPLICATIONS
                ================================================ */

                try {

                    const applicationResponse =
                        await API.get(
                            '/applications/my'
                        );

                    if (isMounted) {

                        setApplications(
                            applicationResponse.data
                                ?.applications || []
                        );

                    }

                } catch (applicationError) {

                    if (
                        applicationError.response?.status ===
                        401
                    ) {

                        authService.logout();

                        navigate('/login', {
                            replace: true
                        });

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

                if (isMounted) {
                    setLoadingDashboard(false);
                }

            }

        };

        loadDashboardData();

        return () => {
            isMounted = false;
        };

    }, [navigate]);


    /* ============================================================
       GET LATEST APPLICATION
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


    /* ============================================================
       APPLICATION STATUS CLASS
    ============================================================ */

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


    /* ============================================================
       APPLICATION STATUS TEXT
    ============================================================ */

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


    /* ============================================================
       APPLICATION MESSAGE
    ============================================================ */

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


    /* ============================================================
       FORMAT DATE
    ============================================================ */

    const formatDate = (date) => {

        if (!date) {
            return '—';
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return '—';
        }

        return parsedDate.toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        );

    };


    const notifications = applications.map((application) => ({
            id: application._id,
            type: 'application',
            application,
            title: application.scholarship?.name || 'Scholarship application',
            message: getApplicationMessage(application.status),
            action:
                application.status === 'DRAFT'
                    ? 'Continue Application'
                    : application.status === 'CORRECTION REQUIRED'
                        ? 'Review Corrections'
                        : 'View Application',
            date: application.updatedAt || application.createdAt
        })).sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date) - new Date(a.date);
    });


    return (

        <div
            className="student-dashboard-layout"
            style={{
                minHeight: '100vh',
                background: '#f5f7fb',
                display: 'flex'
            }}
        >

            {/* =====================================================
                SIDEBAR
            ====================================================== */}

            {mobileNavOpen && (
                <button
                    type="button"
                    className="student-sidebar-backdrop"
                    aria-label="Close navigation menu"
                    onClick={() => setMobileNavOpen(false)}
                />
            )}

            <aside
                className={`student-dashboard-sidebar${mobileNavOpen ? ' is-open' : ''}`}
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
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
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
                                textAlign: 'left',
                                cursor: 'pointer'
                            }}
                        >
                            <FileText size={18} />
                            Scholarships
                        </button>


                        {freeshipStatus === 'APPROVED' && (
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
                                    textAlign: 'left',
                                    cursor: 'pointer'
                                }}
                            >
                                <FileText size={18} />
                                Apply Online
                            </button>
                        )}


                        {/* Freeship Card */}

                        <button
                            type="button"
                            onClick={goToFreeshipCard}
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
                                textAlign: 'left',
                                cursor: 'pointer'
                            }}
                        >
                            <FileCheck2 size={18} />
                            {['DRAFT', 'REJECTED'].includes(freeshipStatus) ? 'Apply Freeship Card' : 'Freeship Card'}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setMobileNavOpen(false);
                                navigate('/student/profile');
                            }}
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
                                textAlign: 'left',
                                cursor: 'pointer'
                            }}
                        >
                            <UserCircle size={18} />
                            Student Profile
                        </button>


                        {/* Notifications */}

                        <button
                            type="button"
                            onClick={() =>
                                {
                                    setMobileNavOpen(false);
                                    setNotificationsOpen(true);
                                }
                            }
                            aria-haspopup="dialog"
                            aria-expanded={notificationsOpen}
                            aria-controls="student-notifications-dialog"
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
                                textAlign: 'left',
                                cursor: 'pointer'
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
                            textAlign: 'left',
                            cursor: 'pointer'
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
                className="student-dashboard-main"
                style={{
                    marginLeft: '250px',
                    width: 'calc(100% - 250px)',
                    minHeight: '100vh'
                }}
            >

                {notificationsOpen && (
                    <div
                        role="presentation"
                        onClick={() => setNotificationsOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 1000,
                            background: 'rgba(15, 23, 42, 0.42)',
                            display: 'flex',
                            justifyContent: 'flex-end'
                        }}
                    >
                        <section
                            id="student-notifications-dialog"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="student-notifications-title"
                            onClick={(event) => event.stopPropagation()}
                            style={{
                                width: 'min(440px, 100%)',
                                height: '100%',
                                overflowY: 'auto',
                                background: '#ffffff',
                                boxShadow: '-12px 0 32px rgba(15, 23, 42, 0.18)',
                                padding: '26px 22px'
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    gap: '16px',
                                    marginBottom: '20px'
                                }}
                            >
                                <div>
                                    <h2
                                        id="student-notifications-title"
                                        style={{
                                            margin: 0,
                                            color: '#172033',
                                            fontSize: '22px'
                                        }}
                                    >
                                        Notifications
                                    </h2>
                                    <p
                                        style={{
                                            color: '#64748b',
                                            fontSize: '13px',
                                            margin: '6px 0 0'
                                        }}
                                    >
                                        Freeship approval and scholarship application updates.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setNotificationsOpen(false)}
                                    aria-label="Close notifications"
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        background: '#ffffff',
                                        color: '#334155',
                                        padding: '7px 11px',
                                        cursor: 'pointer',
                                        fontSize: '18px'
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            {notifications.length === 0 ? (
                                <div
                                    style={{
                                        padding: '24px 18px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        background: '#f8fafc',
                                        color: '#64748b',
                                        textAlign: 'center',
                                        fontSize: '14px',
                                        lineHeight: 1.6
                                    }}
                                >
                                    You’re all caught up. Application updates will appear here.
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: 'grid',
                                        gap: '12px'
                                    }}
                                >
                                    {notifications.map((notification) => (
                                        <button
                                            type="button"
                                            key={notification.id}
                                            onClick={() => openNotification(notification)}
                                            style={{
                                                width: '100%',
                                                padding: '16px',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                background: '#ffffff',
                                                color: '#172033',
                                                textAlign: 'left',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '11px'
                                                }}
                                            >
                                                <Bell
                                                    size={18}
                                                    color="#174a8b"
                                                    style={{ flexShrink: 0, marginTop: '2px' }}
                                                />
                                                <div>
                                                    <div
                                                        style={{
                                                            fontWeight: 700,
                                                            fontSize: '14px',
                                                            marginBottom: '6px'
                                                        }}
                                                    >
                                                        {notification.title}
                                                    </div>
                                                    <div
                                                        style={{
                                                            color: '#64748b',
                                                            fontSize: '13px',
                                                            lineHeight: 1.55
                                                        }}
                                                    >
                                                        {notification.message}
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            gap: '12px',
                                                            marginTop: '12px',
                                                            color: '#174a8b',
                                                            fontWeight: 700,
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        <span>{notification.action}</span>
                                                        {notification.date && (
                                                            <span style={{ color: '#94a3b8', fontWeight: 500 }}>
                                                                {formatDate(notification.date)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {/* TOP HEADER */}

                <header
                    className="student-dashboard-topbar"
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

                    <div className="student-dashboard-title-group">

                        <button
                            type="button"
                            className="student-dashboard-menu-button"
                            aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
                            aria-expanded={mobileNavOpen}
                            onClick={() => setMobileNavOpen((open) => !open)}
                        >
                            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        <h1
                            className="student-dashboard-title"
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
                            className="student-dashboard-subtitle"
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
                        className="student-dashboard-profile"
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
                    className="student-dashboard-content"
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
                                Complete your Freeship Card, unlock scholarship applications after approval, and track your applications here.
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
                                'repeat(4, minmax(0, 1fr))',
                            gap: '18px',
                            marginBottom: '26px'
                        }}
                    >

                        {/* FREESHIP CARD STATUS */}

                        <div
                            className="portal-card"
                            style={{
                                padding: '22px',
                                cursor: 'pointer'
                            }}
                            onClick={goToFreeshipCard}
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
                                    <ShieldCheck size={21} />
                                </div>

                                {loadingDashboard ? (

                                    <span className="portal-status portal-status-neutral">
                                        Checking...
                                    </span>

                                ) : freeshipStatus === 'APPROVED' ? (

                                    <span className="portal-status portal-status-success">
                                        Approved
                                    </span>

                                ) : freeshipStatus === 'PENDING APPROVAL' ? (

                                    <span className="portal-status portal-status-neutral">
                                        Pending Approval
                                    </span>

                                ) : (

                                    <span className="portal-status portal-status-warning">
                                        {freeshipStatus === 'REJECTED' ? 'Corrections Needed' : 'Not Approved'}
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
                                Freeship Card
                            </h3>

                            <p
                                style={{
                                    margin: 0,
                                    color: '#64748b',
                                    fontSize: '13px',
                                    lineHeight: 1.6
                                }}
                            >
                                {freeshipStatus === 'APPROVED'
                                    ? 'Scholarship applications are unlocked.'
                                    : freeshipStatus === 'PENDING APPROVAL'
                                        ? 'Your card is waiting for administrator approval.'
                                        : 'Complete and submit the card form to unlock scholarship applications.'}
                            </p>

                        </div>


                        {/* SCHOLARSHIPS */}

                        <div
                            className="portal-card"
                            onClick={freeshipStatus === 'APPROVED' ? goToApplications : goToScholarships}
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
                                {freeshipStatus === 'APPROVED' ? 'Apply Online' : 'Available Scholarships'}
                            </h3>

                            <p
                                style={{
                                    margin: 0,
                                    color: '#64748b',
                                    fontSize: '13px',
                                    lineHeight: 1.6
                                }}
                            >
                                {freeshipStatus === 'APPROVED'
                                    ? 'Your Freeship Card is approved. Choose a scheme to complete and submit its scholarship application.'
                                    : 'View published scholarships, eligibility criteria and application deadlines.'}
                            </p>

                        </div>


                        {/* STUDENT PROFILE */}

                        <div
                            className="portal-card"
                            onClick={() => navigate('/student/profile')}
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
                                <UserCircle size={21} />
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
                                View the personal, contact, address, and course details saved with your Freeship Card.
                            </p>

                        </div>


                        {/* APPLICATION STATUS */}

                        <div
                            className="portal-card"
                            onClick={latestApplication ? goToApplications : goToScholarships}
                            style={{
                                padding: '22px',
                                cursor: 'pointer'
                            }}
                        >

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '8px',
                                    marginBottom: '16px'
                                }}
                            >
                                <div
                                    style={{
                                        width: '42px',
                                        height: '42px',
                                        borderRadius: '10px',
                                        background: '#eaf1fb',
                                        color: '#174a8b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flex: '0 0 auto'
                                    }}
                                >
                                    <Clock3 size={21} />
                                </div>

                                {loadingDashboard ? (
                                    <span className="portal-status portal-status-neutral">Checking...</span>
                                ) : latestApplication ? (
                                    <span className={`portal-status ${getStatusClass(latestApplication.status)}`}>
                                        {getStatusText(latestApplication.status)}
                                    </span>
                                ) : (
                                    <span className="portal-status portal-status-neutral">No activity</span>
                                )}
                            </div>

                            <h3
                                style={{
                                    margin: '0 0 7px',
                                    fontSize: '16px',
                                    color: '#172033'
                                }}
                            >
                                Application Status
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
                                    ? 'Checking your latest application.'
                                    : latestApplication
                                        ? latestApplication.scholarship?.name || 'View your latest scholarship application.'
                                        : 'Your application activity will appear here after you apply.'}
                            </p>

                        </div>

                    </section>


                    {/* QUICK ACTIONS */}

                    <section
                        className="student-dashboard-quick-actions"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(0, 1fr)',
                            gap: '12px'
                        }}
                    >

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
                                className="student-dashboard-quick-links"
                                style={{
                                    display: 'flex',
                                    flexDirection:
                                        'column',
                                    gap: '10px'
                                }}
                            >

                                {/* BROWSE SCHOLARSHIPS */}

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


                                {/* APPLY ONLINE */}

                                {freeshipStatus === 'APPROVED' && <button
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
                                        <FileText size={18} />
                                        {applications.length > 0 ? `Apply Online (${applications.length})` : 'Apply Online'}
                                    </span>

                                    <ChevronRight size={17} />

                                </button>}


                                {/* FREESHIP CARD */}

                                <button
                                    type="button"
                                    onClick={goToFreeshipCard}
                                    className="portal-button portal-button-secondary"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%'
                                    }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FileCheck2 size={18} />
                                        Freeship Card Application
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
                                Keep your Freeship Card application and scholarship documents accurate. Information submitted through this portal may be used for scholarship verification.
                            </p>

                        </div>

                    </section>

                </div>

            </main>


        </div>

    );

};


export default StudentDashboard;
