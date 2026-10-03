import React, {
    useEffect,
    useState
} from 'react';

import {
    ArrowLeft,
    ClipboardList,
    Clock3,
    FileText,
    GraduationCap,
    ShieldCheck,
    ChevronRight,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

import {
    useNavigate
} from 'react-router-dom';

import API from '../../services/api';
import authService from '../../services/authService';

const MyApplications = () => {

    const navigate = useNavigate();

    const [applications, setApplications] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    /* ============================================================
       LOAD APPLICATIONS
    ============================================================ */

    useEffect(() => {

        const loadApplications = async () => {

            try {

                setLoading(true);
                setError('');

                const token =
                    authService.getToken();

                if (!token) {
                    navigate('/login');
                    return;
                }

                const response =
                    await API.get(
                        '/applications/my',
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                if (
                    response.data &&
                    response.data.success
                ) {

                    setApplications(
                        response.data.applications || []
                    );

                } else {

                    setError(
                        'Unable to load your applications.'
                    );

                }

            } catch (error) {

                console.error(
                    'Load applications error:',
                    error
                );

                if (
                    error.response?.status ===
                    401
                ) {

                    authService.logout();
                    navigate('/login');
                    return;

                }

                setError(
                    error.response?.data?.message ||
                    'Unable to load your applications.'
                );

            } finally {

                setLoading(false);

            }
        };

        loadApplications();

    }, [navigate]);

    /* ============================================================
       STATUS HELPERS
    ============================================================ */

    const getStatusClass = (
        status
    ) => {

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

    const getStatusText = (
        status
    ) => {

        if (!status) {
            return 'Unknown';
        }

        return status
            .toLowerCase()
            .replace(
                /\b\w/g,
                (letter) =>
                    letter.toUpperCase()
            );
    };

    const getStatusMessage = (
        status
    ) => {

        switch (status) {

            case 'DRAFT':
                return 'Complete your application and upload all required documents.';

            case 'SUBMITTED':
                return 'Your application has been submitted and is awaiting verification.';

            case 'UNDER VERIFICATION':
                return 'Your application is currently under verification.';

            case 'CORRECTION REQUIRED':
                return 'Corrections are required. Open the application to review and update it.';

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
                return 'Application status information is available here.';

        }
    };

    const formatDate = (
        date
    ) => {

        if (!date) {
            return '—';
        }

        return new Date(
            date
        ).toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        );
    };

    /* ============================================================
       OPEN APPLICATION
    ============================================================ */

    const openApplication = (
        application
    ) => {

        if (!application?._id) {
            return;
        }

        /*
           Draft applications still need documents.
           Other applications can be opened through the
           same application-document page for now.
        */

        navigate(
            `/student/applications/${application._id}/documents`
        );

    };

    /* ============================================================
       LOADING
    ============================================================ */

    if (loading) {

        return (
            <div
                style={{
                    minHeight: '100vh',
                    background: '#f5f7fb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                }}
            >

                <div
                    className="portal-card"
                    style={{
                        width: '100%',
                        maxWidth: '500px',
                        padding: '40px',
                        textAlign: 'center'
                    }}
                >

                    <Clock3
                        size={42}
                        color="#174a8b"
                        style={{
                            margin:
                                '0 auto 18px'
                        }}
                    />

                    <h2
                        className="portal-heading"
                        style={{
                            fontSize: '25px',
                            marginBottom: '10px'
                        }}
                    >
                        Loading Applications
                    </h2>

                    <p
                        className="portal-text"
                        style={{
                            margin: 0
                        }}
                    >
                        Please wait while we
                        retrieve your scholarship
                        applications.
                    </p>

                </div>

            </div>
        );
    }

    /* ============================================================
       MAIN PAGE
    ============================================================ */

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#f5f7fb',
                paddingBottom: '60px'
            }}
        >

            {/* ====================================================
                HEADER
            ==================================================== */}

            <header
                style={{
                    background: '#ffffff',
                    borderBottom:
                        '1px solid #e2e8f0',
                    padding: '18px 0'
                }}
            >

                <div
                    className="portal-container"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                            'space-between',
                        gap: '20px'
                    }}
                >

                    <div
                        style={{
                            display: 'flex',
                            alignItems:
                                'center',
                            gap: '12px'
                        }}
                    >

                        <div
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '10px',
                                background:
                                    '#eaf1fb',
                                display: 'flex',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'center'
                            }}
                        >

                            <GraduationCap
                                size={23}
                                color="#174a8b"
                            />

                        </div>

                        <div>

                            <div
                                style={{
                                    fontWeight: 700,
                                    color:
                                        '#172033'
                                }}
                            >
                                University
                                Scholarship Portal
                            </div>

                            <div
                                style={{
                                    fontSize: '12px',
                                    color:
                                        '#64748b',
                                    marginTop: '2px'
                                }}
                            >
                                Student Applications
                            </div>

                        </div>

                    </div>

                    <ShieldCheck
                        size={25}
                        color="#174a8b"
                    />

                </div>

            </header>

            {/* ====================================================
                CONTENT
            ==================================================== */}

            <main
                className="portal-container"
                style={{
                    paddingTop: '35px'
                }}
            >

                {/* BACK */}

                <button
                    type="button"
                    className="portal-button portal-button-secondary"
                    onClick={() =>
                        navigate('/student')
                    }
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '25px'
                    }}
                >

                    <ArrowLeft
                        size={17}
                    />

                    Back to Dashboard

                </button>

                {/* TITLE */}

                <section
                    style={{
                        marginBottom: '28px'
                    }}
                >

                    <div
                        style={{
                            display: 'flex',
                            alignItems:
                                'center',
                            gap: '10px',
                            marginBottom:
                                '10px'
                        }}
                    >

                        <span
                            className="portal-status portal-status-info"
                        >
                            Student Portal
                        </span>

                        <span
                            className="portal-status portal-status-neutral"
                        >
                            {applications.length}{' '}
                            Application
                            {applications.length === 1
                                ? ''
                                : 's'}
                        </span>

                    </div>

                    <h1
                        className="portal-heading"
                        style={{
                            fontSize:
                                'clamp(30px, 5vw, 42px)',
                            marginBottom:
                                '10px'
                        }}
                    >
                        My Applications
                    </h1>

                    <p
                        className="portal-text"
                        style={{
                            maxWidth: '760px',
                            margin: 0
                        }}
                    >
                        View and manage your
                        scholarship applications
                        and track their current
                        status.
                    </p>

                </section>

                {/* ERROR */}

                {error && (

                    <div
                        style={{
                            background:
                                '#fee2e2',
                            border:
                                '1px solid #fecaca',
                            color:
                                '#991b1b',
                            borderRadius:
                                '10px',
                            padding:
                                '13px 15px',
                            marginBottom:
                                '20px',
                            display: 'flex',
                            alignItems:
                                'center',
                            gap: '10px',
                            fontWeight: 600
                        }}
                    >

                        <AlertCircle
                            size={19}
                        />

                        {error}

                    </div>

                )}

                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {applications.length === 0 ? (

                    <div
                        className="portal-card"
                        style={{
                            padding: '50px 30px',
                            textAlign: 'center'
                        }}
                    >

                        <ClipboardList
                            size={55}
                            color="#94a3b8"
                            style={{
                                margin:
                                    '0 auto 18px'
                            }}
                        />

                        <h2
                            className="portal-heading"
                            style={{
                                fontSize: '26px',
                                marginBottom:
                                    '10px'
                            }}
                        >
                            No Applications Yet
                        </h2>

                        <p
                            className="portal-text"
                            style={{
                                maxWidth:
                                    '520px',
                                margin:
                                    '0 auto 22px'
                            }}
                        >
                            You have not created
                            any scholarship
                            applications yet.
                            Browse available
                            scholarships to get
                            started.
                        </p>

                        <button
                            type="button"
                            className="portal-button portal-button-primary"
                            onClick={() =>
                                navigate(
                                    '/student/scholarships'
                                )
                            }
                        >
                            Browse Scholarships
                        </button>

                    </div>

                ) : (

                    /* =================================================
                       APPLICATION LIST
                    ================================================= */

                    <div
                        style={{
                            display: 'grid',
                            gap: '18px'
                        }}
                    >

                        {applications.map(
                            (application) => {

                                const scholarship =
                                    application.scholarship;

                                return (
                                    <div
                                        key={
                                            application._id
                                        }
                                        className="portal-card"
                                        style={{
                                            padding:
                                                '24px'
                                        }}
                                    >

                                        {/* TOP */}

                                        <div
                                            style={{
                                                display:
                                                    'flex',
                                                alignItems:
                                                    'flex-start',
                                                justifyContent:
                                                    'space-between',
                                                gap:
                                                    '20px',
                                                flexWrap:
                                                    'wrap',
                                                marginBottom:
                                                    '18px'
                                            }}
                                        >

                                            <div
                                                style={{
                                                    flex:
                                                        '1 1 400px'
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        display:
                                                            'flex',
                                                        alignItems:
                                                            'center',
                                                        gap:
                                                            '10px',
                                                        marginBottom:
                                                            '8px'
                                                    }}
                                                >

                                                    <FileText
                                                        size={
                                                            21
                                                        }
                                                        color="#174a8b"
                                                    />

                                                    <h2
                                                        style={{
                                                            margin: 0,
                                                            fontSize:
                                                                '19px',
                                                            color:
                                                                '#172033'
                                                        }}
                                                    >
                                                        {scholarship?.name ||
                                                            'Scholarship Application'}
                                                    </h2>

                                                </div>

                                                <p
                                                    style={{
                                                        margin:
                                                            '0 0 5px',
                                                        color:
                                                            '#64748b',
                                                        fontSize:
                                                            '13px'
                                                    }}
                                                >
                                                    Application
                                                    Number:{' '}

                                                    <strong
                                                        style={{
                                                            color:
                                                                '#334155'
                                                        }}
                                                    >
                                                        {application.applicationNumber ||
                                                            'Not assigned'}
                                                    </strong>
                                                </p>

                                                <p
                                                    style={{
                                                        margin: 0,
                                                        color:
                                                            '#64748b',
                                                        fontSize:
                                                            '13px'
                                                    }}
                                                >
                                                    Academic
                                                    Year:{' '}

                                                    <strong
                                                        style={{
                                                            color:
                                                                '#334155'
                                                        }}
                                                    >
                                                        {scholarship?.academicYear ||
                                                            '—'}
                                                    </strong>
                                                </p>

                                            </div>

                                            <span
                                                className={`portal-status ${getStatusClass(
                                                    application.status
                                                )}`}
                                            >
                                                {application.status ===
                                                    'VERIFIED' && (
                                                    <CheckCircle2
                                                        size={
                                                            14
                                                        }
                                                        style={{
                                                            marginRight:
                                                                '5px'
                                                        }}
                                                    />
                                                )}

                                                {getStatusText(
                                                    application.status
                                                )}
                                            </span>

                                        </div>

                                        {/* MESSAGE */}

                                        <div
                                            style={{
                                                background:
                                                    '#f8fafc',
                                                border:
                                                    '1px solid #e2e8f0',
                                                borderRadius:
                                                    '9px',
                                                padding:
                                                    '14px 16px',
                                                marginBottom:
                                                    '18px'
                                            }}
                                        >

                                            <p
                                                style={{
                                                    margin: 0,
                                                    color:
                                                        '#475569',
                                                    fontSize:
                                                        '13px',
                                                    lineHeight:
                                                        1.6
                                                }}
                                            >
                                                {getStatusMessage(
                                                    application.status
                                                )}
                                            </p>

                                        </div>

                                        {/* DETAILS */}

                                        <div
                                            style={{
                                                display:
                                                    'grid',
                                                gridTemplateColumns:
                                                    'repeat(auto-fit, minmax(180px, 1fr))',
                                                gap:
                                                    '15px',
                                                marginBottom:
                                                    '20px'
                                            }}
                                        >

                                            <div>

                                                <div
                                                    style={{
                                                        color:
                                                            '#64748b',
                                                        fontSize:
                                                            '12px',
                                                        marginBottom:
                                                            '4px'
                                                    }}
                                                >
                                                    Scholarship
                                                    Amount
                                                </div>

                                                <strong
                                                    style={{
                                                        color:
                                                            '#172033'
                                                    }}
                                                >
                                                    ₹
                                                    {Number(
                                                        scholarship?.scholarshipAmount ||
                                                        0
                                                    ).toLocaleString(
                                                        'en-IN'
                                                    )}
                                                </strong>

                                            </div>

                                            <div>

                                                <div
                                                    style={{
                                                        color:
                                                            '#64748b',
                                                        fontSize:
                                                            '12px',
                                                        marginBottom:
                                                            '4px'
                                                    }}
                                                >
                                                    Application
                                                    Created
                                                </div>

                                                <strong
                                                    style={{
                                                        color:
                                                            '#172033'
                                                    }}
                                                >
                                                    {formatDate(
                                                        application.createdAt
                                                    )}
                                                </strong>

                                            </div>

                                            <div>

                                                <div
                                                    style={{
                                                        color:
                                                            '#64748b',
                                                        fontSize:
                                                            '12px',
                                                        marginBottom:
                                                            '4px'
                                                    }}
                                                >
                                                    Last Updated
                                                </div>

                                                <strong
                                                    style={{
                                                        color:
                                                            '#172033'
                                                    }}
                                                >
                                                    {formatDate(
                                                        application.updatedAt
                                                    )}
                                                </strong>

                                            </div>

                                        </div>

                                        {/* FOOTER */}

                                        <div
                                            style={{
                                                borderTop:
                                                    '1px solid #e8edf3',
                                                paddingTop:
                                                    '16px',
                                                display:
                                                    'flex',
                                                alignItems:
                                                    'center',
                                                justifyContent:
                                                    'space-between',
                                                gap:
                                                    '15px',
                                                flexWrap:
                                                    'wrap'
                                            }}
                                        >

                                            <span
                                                style={{
                                                    color:
                                                        '#64748b',
                                                    fontSize:
                                                        '12px'
                                                }}
                                            >
                                                Status:{' '}
                                                {getStatusText(
                                                    application.status
                                                )}
                                            </span>

                                            <button
                                                type="button"
                                                className="portal-button portal-button-primary"
                                                onClick={() =>
                                                    openApplication(
                                                        application
                                                    )
                                                }
                                                style={{
                                                    display:
                                                        'inline-flex',
                                                    alignItems:
                                                        'center',
                                                    gap:
                                                        '8px'
                                                }}
                                            >

                                                {application.status ===
                                                'DRAFT'
                                                    ? 'Continue Application'
                                                    : application.status ===
                                                        'CORRECTION REQUIRED'
                                                      ? 'Correct Application'
                                                      : 'View Application'}

                                                <ChevronRight
                                                    size={
                                                        17
                                                    }
                                                />

                                            </button>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                )}

                {/* =================================================
                    NOTICE
                ================================================= */}

                <section
                    className="portal-card"
                    style={{
                        marginTop: '22px',
                        padding: '20px 22px',
                        display: 'flex',
                        alignItems:
                            'center',
                        gap: '14px'
                    }}
                >

                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            flexShrink: 0,
                            borderRadius: '10px',
                            background:
                                '#eaf1fb',
                            color: '#174a8b',
                            display: 'flex',
                            alignItems:
                                'center',
                            justifyContent:
                                'center'
                        }}
                    >

                        <ShieldCheck
                            size={21}
                        />

                    </div>

                    <div>

                        <h3
                            style={{
                                margin:
                                    '0 0 4px',
                                fontSize: '14px',
                                color:
                                    '#172033'
                            }}
                        >
                            Keep Your Application Information Accurate
                        </h3>

                        <p
                            style={{
                                margin: 0,
                                color:
                                    '#64748b',
                                fontSize: '12px',
                                lineHeight: 1.6
                            }}
                        >
                            Check your application
                            status regularly and
                            respond promptly if the
                            university requests
                            corrections.
                        </p>

                    </div>

                </section>

            </main>

        </div>
    );
};

export default MyApplications;