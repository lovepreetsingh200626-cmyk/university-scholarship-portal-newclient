import React, {
    useEffect,
    useState
} from 'react';

import {
    useNavigate,
    useParams
} from 'react-router-dom';

import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    FileText,
    AlertCircle,
    ShieldCheck,
    Banknote,
    Send,
    Loader2
} from 'lucide-react';

import API from '../../services/api';

import authService from '../../services/authService';


const ApplicationTracking = () => {

    const {
        id
    } = useParams();

    const navigate =
        useNavigate();


    /* ============================================================
       STATE
    ============================================================ */

    const [
        application,
        setApplication
    ] = useState(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState('');


    /* ============================================================
       AUTH
    ============================================================ */

    const token =
        authService.getToken();


    /* ============================================================
       AUTH CONFIG
    ============================================================ */

    const getAuthConfig = () => ({
        headers: {
            Authorization:
                `Bearer ${token}`
        }
    });


    /* ============================================================
       FETCH APPLICATION
    ============================================================ */

    const fetchApplication =
        async () => {

            try {

                setLoading(true);
                setError('');

                const response =
                    await API.get(
                        `/applications/${id}`,
                        getAuthConfig()
                    );

                if (
                    response.data &&
                    response.data.success
                ) {

                    setApplication(
                        response.data.application
                    );

                } else {

                    setError(
                        response.data?.message ||
                        'Unable to load application.'
                    );
                }

            } catch (requestError) {

                console.error(
                    'Application tracking error:',
                    requestError
                );

                if (
                    requestError.response?.status === 401
                ) {

                    authService.logout();

                    navigate(
                        '/login',
                        {
                            replace: true
                        }
                    );

                    return;
                }

                setError(
                    requestError.response?.data?.message ||
                    'Unable to load application.'
                );

            } finally {

                setLoading(false);

            }
        };


    /* ============================================================
       INITIAL LOAD
    ============================================================ */

    useEffect(() => {

        if (!token) {

            navigate(
                '/login',
                {
                    replace: true
                }
            );

            return;
        }

        fetchApplication();

    }, [id]);


    /* ============================================================
       STATUS
    ============================================================ */

    const status =
        application
            ? String(
                application.status || ''
            )
                .trim()
                .toUpperCase()
            : '';


    /* ============================================================
       STATUS CLASS
    ============================================================ */

    const getStatusClass = () => {

        switch (status) {

            case 'VERIFIED':
            case 'SANCTIONED':
            case 'DISBURSED':

                return 'portal-status-success';


            case 'CORRECTION REQUIRED':
            case 'REJECTED':

                return 'portal-status-danger';


            case 'SUBMITTED':
            case 'UNDER VERIFICATION':
            case 'RESUBMITTED':

                return 'portal-status-warning';


            case 'DRAFT':
            default:

                return 'portal-status-neutral';
        }
    };


    /* ============================================================
       STATUS MESSAGE
    ============================================================ */

    const getStatusMessage = () => {

        switch (status) {

            case 'DRAFT':

                return 'Your application is saved as a draft and has not yet been submitted.';


            case 'SUBMITTED':

                return 'Your application has been submitted successfully and is waiting for university verification.';


            case 'UNDER VERIFICATION':

                return 'Your application is currently being verified by the university.';


            case 'CORRECTION REQUIRED':

                return 'The university has requested corrections. Please review the remarks and update your application.';


            case 'RESUBMITTED':

                return 'Your corrected application has been resubmitted and is waiting for verification.';


            case 'VERIFIED':

                return 'Your application has been verified successfully.';


            case 'SANCTIONED':

                return 'Your scholarship has been sanctioned and is awaiting disbursement.';


            case 'DISBURSED':

                return 'Your scholarship has been marked as disbursed.';


            case 'REJECTED':

                return 'Your application has been rejected. Please review the reason provided below.';


            default:

                return 'Application status is currently unavailable.';
        }
    };


    /* ============================================================
       DATE FORMATTER
    ============================================================ */

    const formatDate =
        (date) => {

            if (!date) {
                return '—';
            }

            try {

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

            } catch (error) {

                return '—';

            }
        };


    /* ============================================================
       TIMELINE STATUS
    ============================================================ */

    const getTimelineState =
        (timelineStatus) => {

            const order = [
                'DRAFT',
                'SUBMITTED',
                'UNDER VERIFICATION',
                'VERIFIED',
                'SANCTIONED',
                'DISBURSED'
            ];

            const currentIndex =
                order.indexOf(
                    status
                );

            const itemIndex =
                order.indexOf(
                    timelineStatus
                );


            if (
                status ===
                'CORRECTION REQUIRED'
            ) {

                if (
                    timelineStatus ===
                    'SUBMITTED'
                ) {
                    return 'completed';
                }

                if (
                    timelineStatus ===
                    'UNDER VERIFICATION'
                ) {
                    return 'completed';
                }

                return 'pending';
            }


            if (
                status ===
                'RESUBMITTED'
            ) {

                if (
                    timelineStatus ===
                    'SUBMITTED'
                ) {
                    return 'completed';
                }

                if (
                    timelineStatus ===
                    'UNDER VERIFICATION'
                ) {
                    return 'completed';
                }

                return 'pending';
            }


            if (
                currentIndex === -1 ||
                itemIndex === -1
            ) {
                return 'pending';
            }


            if (
                itemIndex <
                currentIndex
            ) {
                return 'completed';
            }


            if (
                itemIndex ===
                currentIndex
            ) {
                return 'current';
            }


            return 'pending';
        };


    /* ============================================================
       TIMELINE DATA
    ============================================================ */

    const timeline = [
        {
            status: 'DRAFT',
            title: 'Application Created',
            description:
                'Application has been created.'
        },

        {
            status: 'SUBMITTED',
            title: 'Application Submitted',
            description:
                'Application has been submitted to the university.'
        },

        {
            status: 'UNDER VERIFICATION',
            title: 'Under Verification',
            description:
                'University officials are verifying the application.'
        },

        {
            status: 'VERIFIED',
            title: 'Application Verified',
            description:
                'Application has successfully passed verification.'
        },

        {
            status: 'SANCTIONED',
            title: 'Scholarship Sanctioned',
            description:
                'Scholarship amount has been sanctioned.'
        },

        {
            status: 'DISBURSED',
            title: 'Scholarship Disbursed',
            description:
                'Scholarship has been marked as disbursed.'
        }
    ];


    /* ============================================================
       LOADING
    ============================================================ */

    if (loading) {

        return (
            <div
                style={{
                    minHeight:
                        '100vh',
                    display:
                        'flex',
                    alignItems:
                        'center',
                    justifyContent:
                        'center',
                    background:
                        '#f5f7fb'
                }}
            >

                <div
                    style={{
                        textAlign:
                            'center',
                        color:
                            '#64748b'
                    }}
                >

                    <Loader2
                        size={34}
                        style={{
                            animation:
                                'spin 1s linear infinite',
                            margin:
                                '0 auto 12px'
                        }}
                    />

                    Loading application...

                </div>

            </div>
        );
    }


    /* ============================================================
       ERROR
    ============================================================ */

    if (
        error &&
        !application
    ) {

        return (
            <div
                style={{
                    minHeight:
                        '100vh',
                    background:
                        '#f5f7fb',
                    padding:
                        '40px 20px'
                }}
            >

                <div
                    className="portal-container"
                >

                    <div
                        className="portal-card"
                        style={{
                            maxWidth:
                                '700px',
                            margin:
                                '0 auto',
                            padding:
                                '30px'
                        }}
                    >

                        <div
                            style={{
                                display:
                                    'flex',
                                gap:
                                    '12px',
                                alignItems:
                                    'flex-start',
                                marginBottom:
                                    '20px'
                            }}
                        >

                            <AlertCircle
                                size={24}
                                color="#b42318"
                            />

                            <div>

                                <h2
                                    className="portal-heading"
                                    style={{
                                        fontSize:
                                            '22px',
                                        marginBottom:
                                            '6px'
                                    }}
                                >
                                    Unable to Load Application
                                </h2>

                                <p
                                    className="portal-text"
                                    style={{
                                        margin:
                                            0
                                    }}
                                >
                                    {error}
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            className="portal-button portal-button-secondary"
                            onClick={() =>
                                navigate(
                                    '/student/applications'
                                )
                            }
                        >

                            <ArrowLeft
                                size={16}
                                style={{
                                    marginRight:
                                        '7px',
                                    verticalAlign:
                                        'middle'
                                }}
                            />

                            Back to Applications

                        </button>

                    </div>

                </div>

            </div>
        );
    }


    /* ============================================================
       MAIN UI
    ============================================================ */

    return (

        <div
            style={{
                minHeight:
                    '100vh',
                background:
                    '#f5f7fb',
                paddingBottom:
                    '60px'
            }}
        >

            {/* ====================================================
                HEADER
            ==================================================== */}

            <header
                style={{
                    background:
                        '#ffffff',
                    borderBottom:
                        '1px solid #e2e8f0',
                    position:
                        'sticky',
                    top:
                        0,
                    zIndex:
                        20
                }}
            >

                <div
                    className="portal-container"
                    style={{
                        minHeight:
                            '76px',
                        display:
                            'flex',
                        alignItems:
                            'center',
                        justifyContent:
                            'space-between',
                        gap:
                            '20px'
                    }}
                >

                    <div>

                        <div
                            style={{
                                fontSize:
                                    '12px',
                                fontWeight:
                                    700,
                                color:
                                    '#174a8b',
                                letterSpacing:
                                    '0.08em',
                                textTransform:
                                    'uppercase',
                                marginBottom:
                                    '3px'
                            }}
                        >
                            University Scholarship Portal
                        </div>

                        <h1
                            className="portal-heading"
                            style={{
                                fontSize:
                                    '24px'
                            }}
                        >
                            Application Tracking
                        </h1>

                    </div>


                    <button
                        type="button"
                        className="portal-button portal-button-secondary"
                        onClick={() =>
                            navigate(
                                '/student/applications'
                            )
                        }
                    >

                        <ArrowLeft
                            size={16}
                            style={{
                                marginRight:
                                    '7px',
                                verticalAlign:
                                    'middle'
                            }}
                        />

                        My Applications

                    </button>

                </div>

            </header>


            {/* ====================================================
                CONTENT
            ==================================================== */}

            <main
                className="portal-container"
                style={{
                    paddingTop:
                        '32px'
                }}
            >

                {/* =================================================
                    APPLICATION SUMMARY
                ================================================== */}

                <div
                    className="portal-card"
                    style={{
                        padding:
                            '26px',
                        marginBottom:
                            '22px'
                    }}
                >

                    <div
                        style={{
                            display:
                                'flex',
                            justifyContent:
                                'space-between',
                            alignItems:
                                'flex-start',
                            gap:
                                '20px',
                            flexWrap:
                                'wrap'
                        }}
                    >

                        <div>

                            <div
                                style={{
                                    color:
                                        '#64748b',
                                    fontSize:
                                        '13px',
                                    fontWeight:
                                        600,
                                    marginBottom:
                                        '6px'
                                }}
                            >
                                Scholarship Application
                            </div>

                            <h2
                                className="portal-heading"
                                style={{
                                    fontSize:
                                        '27px',
                                    marginBottom:
                                        '8px'
                                }}
                            >
                                {
                                    application
                                        ?.scholarship
                                        ?.name ||
                                    'Scholarship Application'
                                }
                            </h2>


                            {application?.applicationNumber && (

                                <div
                                    style={{
                                        color:
                                            '#64748b',
                                        fontSize:
                                            '14px'
                                    }}
                                >
                                    Application Number:{' '}

                                    <strong
                                        style={{
                                            color:
                                                '#172033'
                                        }}
                                    >
                                        {
                                            application
                                                .applicationNumber
                                        }
                                    </strong>
                                </div>

                            )}

                        </div>


                        <div
                            style={{
                                textAlign:
                                    'right'
                            }}
                        >

                            <div
                                style={{
                                    color:
                                        '#64748b',
                                    fontSize:
                                        '12px',
                                    marginBottom:
                                        '6px'
                                }}
                            >
                                Current Status
                            </div>

                            <span
                                className={`portal-status ${getStatusClass()}`}
                                style={{
                                    fontSize:
                                        '13px'
                                }}
                            >
                                {status}
                            </span>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    STATUS MESSAGE
                ================================================== */}

                <div
                    className="portal-card"
                    style={{
                        padding:
                            '22px',
                        marginBottom:
                            '22px'
                    }}
                >

                    <div
                        style={{
                            display:
                                'flex',
                            alignItems:
                                'flex-start',
                            gap:
                                '13px'
                        }}
                    >

                        <div
                            style={{
                                width:
                                    '42px',
                                height:
                                    '42px',
                                borderRadius:
                                    '10px',
                                background:
                                    '#eaf1fb',
                                display:
                                    'flex',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'center',
                                flexShrink:
                                    0
                            }}
                        >

                            <Clock3
                                size={20}
                                color="#174a8b"
                            />

                        </div>


                        <div>

                            <h3
                                className="portal-heading"
                                style={{
                                    fontSize:
                                        '19px',
                                    marginBottom:
                                        '6px'
                                }}
                            >
                                Application Status
                            </h3>

                            <p
                                className="portal-text"
                                style={{
                                    margin:
                                        0
                                }}
                            >
                                {getStatusMessage()}
                            </p>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    CORRECTION REMARKS
                ================================================== */}

                {application?.correctionRemarks && (

                    <div
                        className="portal-card"
                        style={{
                            padding:
                                '22px',
                            marginBottom:
                                '22px',
                            border:
                                '1px solid #fecaca',
                            background:
                                '#fffafa'
                        }}
                    >

                        <div
                            style={{
                                display:
                                    'flex',
                                gap:
                                    '12px',
                                alignItems:
                                    'flex-start'
                            }}
                        >

                            <AlertCircle
                                size={22}
                                color="#b42318"
                            />

                            <div>

                                <h3
                                    className="portal-heading"
                                    style={{
                                        fontSize:
                                            '19px',
                                        marginBottom:
                                            '7px'
                                    }}
                                >
                                    Correction Required
                                </h3>

                                <p
                                    className="portal-text"
                                    style={{
                                        margin:
                                            0,
                                        color:
                                            '#7f1d1d'
                                    }}
                                >
                                    {
                                        application
                                            .correctionRemarks
                                    }
                                </p>


                                <button
                                    type="button"
                                    className="portal-button portal-button-primary"
                                    style={{
                                        marginTop:
                                            '16px'
                                    }}
                                    onClick={() =>
                                        navigate(
                                            `/student/applications/${id}/documents`
                                        )
                                    }
                                >
                                    Review & Correct Application
                                </button>

                            </div>

                        </div>

                    </div>

                )}


                {/* =================================================
                    REJECTION REASON
                ================================================== */}

                {application?.rejectionReason && (

                    <div
                        className="portal-card"
                        style={{
                            padding:
                                '22px',
                            marginBottom:
                                '22px',
                            border:
                                '1px solid #fecaca',
                            background:
                                '#fffafa'
                        }}
                    >

                        <div
                            style={{
                                display:
                                    'flex',
                                gap:
                                    '12px',
                                alignItems:
                                    'flex-start'
                            }}
                        >

                            <AlertCircle
                                size={22}
                                color="#b42318"
                            />

                            <div>

                                <h3
                                    className="portal-heading"
                                    style={{
                                        fontSize:
                                            '19px',
                                        marginBottom:
                                            '7px'
                                    }}
                                >
                                    Rejection Reason
                                </h3>

                                <p
                                    className="portal-text"
                                    style={{
                                        margin:
                                            0,
                                        color:
                                            '#7f1d1d'
                                    }}
                                >
                                    {
                                        application
                                            .rejectionReason
                                    }
                                </p>

                            </div>

                        </div>

                    </div>

                )}


                {/* =================================================
                    APPLICATION TIMELINE
                ================================================== */}

                <div
                    className="portal-card"
                    style={{
                        padding:
                            '26px',
                        marginBottom:
                            '22px'
                    }}
                >

                    <div
                        style={{
                            display:
                                'flex',
                            alignItems:
                                'flex-start',
                            gap:
                                '13px',
                            marginBottom:
                                '25px'
                        }}
                    >

                        <div
                            style={{
                                width:
                                    '42px',
                                height:
                                    '42px',
                                borderRadius:
                                    '10px',
                                background:
                                    '#eaf1fb',
                                display:
                                    'flex',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'center'
                            }}
                        >

                            <ShieldCheck
                                size={21}
                                color="#174a8b"
                            />

                        </div>


                        <div>

                            <h2
                                className="portal-heading"
                                style={{
                                    fontSize:
                                        '21px',
                                    marginBottom:
                                        '5px'
                                }}
                            >
                                Application Timeline
                            </h2>

                            <p
                                className="portal-text"
                                style={{
                                    margin:
                                        0
                                }}
                            >
                                Track your scholarship
                                application through each
                                verification stage.
                            </p>

                        </div>

                    </div>


                    <div
                        style={{
                            display:
                                'grid',
                            gap:
                                '0'
                        }}
                    >

                        {timeline.map(
                            (
                                item,
                                index
                            ) => {

                                const state =
                                    getTimelineState(
                                        item.status
                                    );

                                const isLast =
                                    index ===
                                    timeline.length -
                                        1;


                                return (

                                    <div
                                        key={
                                            item.status
                                        }
                                        style={{
                                            display:
                                                'flex',
                                            gap:
                                                '16px',
                                            position:
                                                'relative',
                                            paddingBottom:
                                                isLast
                                                    ? '0'
                                                    : '25px'
                                        }}
                                    >

                                        {!isLast && (

                                            <div
                                                style={{
                                                    position:
                                                        'absolute',
                                                    left:
                                                        '17px',
                                                    top:
                                                        '36px',
                                                    bottom:
                                                        '0',
                                                    width:
                                                        '2px',
                                                    background:
                                                        state ===
                                                            'completed'
                                                            ? '#174a8b'
                                                            : '#e2e8f0'
                                                }}
                                            />

                                        )}


                                        <div
                                            style={{
                                                width:
                                                    '36px',
                                                height:
                                                    '36px',
                                                borderRadius:
                                                    '50%',
                                                display:
                                                    'flex',
                                                alignItems:
                                                    'center',
                                                justifyContent:
                                                    'center',
                                                flexShrink:
                                                    0,
                                                position:
                                                    'relative',
                                                zIndex:
                                                    1,
                                                background:
                                                    state ===
                                                        'completed'
                                                        ? '#174a8b'
                                                        : state ===
                                                            'current'
                                                            ? '#eaf1fb'
                                                            : '#f1f5f9',
                                                border:
                                                    state ===
                                                        'current'
                                                        ? '2px solid #174a8b'
                                                        : '2px solid transparent'
                                            }}
                                        >

                                            {state ===
                                                'completed' ? (

                                                <CheckCircle2
                                                    size={
                                                        18
                                                    }
                                                    color="#ffffff"
                                                />

                                            ) : state ===
                                                'current' ? (

                                                <Clock3
                                                    size={
                                                        17
                                                    }
                                                    color="#174a8b"
                                                />

                                            ) : (

                                                <div
                                                    style={{
                                                        width:
                                                            '8px',
                                                        height:
                                                            '8px',
                                                        borderRadius:
                                                            '50%',
                                                        background:
                                                            '#94a3b8'
                                                    }}
                                                />

                                            )}

                                        </div>


                                        <div
                                            style={{
                                                paddingTop:
                                                    '2px'
                                            }}
                                        >

                                            <div
                                                style={{
                                                    fontWeight:
                                                        700,
                                                    color:
                                                        state ===
                                                            'pending'
                                                            ? '#64748b'
                                                            : '#172033',
                                                    marginBottom:
                                                        '4px'
                                                }}
                                            >
                                                {
                                                    item.title
                                                }
                                            </div>

                                            <div
                                                style={{
                                                    color:
                                                        '#64748b',
                                                    fontSize:
                                                        '13px',
                                                    lineHeight:
                                                        '1.6'
                                                }}
                                            >
                                                {
                                                    item.description
                                                }
                                            </div>

                                        </div>

                                    </div>

                                );
                            }
                        )}


                        {/* =================================================
                            CORRECTION / RESUBMISSION SPECIAL STEP
                        ================================================== */}

                        {(
                            status ===
                                'CORRECTION REQUIRED' ||
                            status ===
                                'RESUBMITTED'
                        ) && (

                            <div
                                style={{
                                    display:
                                        'flex',
                                    gap:
                                        '16px',
                                    position:
                                        'relative',
                                    marginTop:
                                        '2px'
                                }}
                            >

                                <div
                                    style={{
                                        width:
                                            '36px',
                                        height:
                                            '36px',
                                        borderRadius:
                                            '50%',
                                        display:
                                            'flex',
                                        alignItems:
                                            'center',
                                        justifyContent:
                                            'center',
                                        background:
                                            status ===
                                                'RESUBMITTED'
                                                ? '#174a8b'
                                                : '#eaf1fb',
                                        border:
                                            '2px solid #174a8b',
                                        flexShrink:
                                            0
                                    }}
                                >

                                    {status ===
                                        'RESUBMITTED' ? (

                                        <Send
                                            size={
                                                17
                                            }
                                            color="#ffffff"
                                        />

                                    ) : (

                                        <AlertCircle
                                            size={
                                                17
                                            }
                                            color="#174a8b"
                                        />

                                    )}

                                </div>


                                <div
                                    style={{
                                        paddingTop:
                                            '2px'
                                    }}
                                >

                                    <div
                                        style={{
                                            fontWeight:
                                                700,
                                            color:
                                                '#172033',
                                            marginBottom:
                                                '4px'
                                        }}
                                    >
                                        {status ===
                                            'RESUBMITTED'
                                            ? 'Application Resubmitted'
                                            : 'Correction Required'}
                                    </div>

                                    <div
                                        style={{
                                            color:
                                                '#64748b',
                                            fontSize:
                                                '13px',
                                            lineHeight:
                                                '1.6'
                                        }}
                                    >
                                        {status ===
                                            'RESUBMITTED'
                                            ? 'Your corrected application has been sent back for verification.'
                                            : 'Corrections are required before the application can proceed.'}
                                    </div>

                                </div>

                            </div>

                        )}

                    </div>

                </div>


                {/* =================================================
                    APPLICATION DETAILS
                ================================================== */}

                <div
                    style={{
                        display:
                            'grid',
                        gridTemplateColumns:
                            'repeat(2, minmax(0, 1fr))',
                        gap:
                            '22px',
                        marginBottom:
                            '22px'
                    }}
                >

                    {/* =============================================
                        DATES
                    ============================================== */}

                    <div
                        className="portal-card"
                        style={{
                            padding:
                                '24px'
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
                                    '18px'
                            }}
                        >

                            <FileText
                                size={
                                    20
                                }
                                color="#174a8b"
                            />

                            <h3
                                className="portal-heading"
                                style={{
                                    fontSize:
                                        '19px'
                                }}
                            >
                                Application Details
                            </h3>

                        </div>


                        <div
                            style={{
                                display:
                                    'grid',
                                gap:
                                    '14px'
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
                                    Created On
                                </div>

                                <strong>
                                    {
                                        formatDate(
                                            application
                                                ?.createdAt
                                        )
                                    }
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

                                <strong>
                                    {
                                        formatDate(
                                            application
                                                ?.updatedAt
                                        )
                                    }
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
                                    Submitted On
                                </div>

                                <strong>
                                    {
                                        formatDate(
                                            application
                                                ?.submittedAt
                                        )
                                    }
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* =============================================
                        SCHOLARSHIP DETAILS
                    ============================================== */}

                    <div
                        className="portal-card"
                        style={{
                            padding:
                                '24px'
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
                                    '18px'
                            }}
                        >

                            <Banknote
                                size={
                                    20
                                }
                                color="#174a8b"
                            />

                            <h3
                                className="portal-heading"
                                style={{
                                    fontSize:
                                        '19px'
                                }}
                            >
                                Scholarship Details
                            </h3>

                        </div>


                        <div
                            style={{
                                display:
                                    'grid',
                                gap:
                                    '14px'
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
                                    Academic Year
                                </div>

                                <strong>
                                    {
                                        application
                                            ?.scholarship
                                            ?.academicYear ||
                                        '—'
                                    }
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
                                    Scholarship Amount
                                </div>

                                <strong
                                    style={{
                                        color:
                                            '#166534',
                                        fontSize:
                                            '18px'
                                    }}
                                >
                                    ₹
                                    {Number(
                                        application
                                            ?.scholarship
                                            ?.scholarshipAmount ||
                                        0
                                    ).toLocaleString(
                                        'en-IN'
                                    )}
                                </strong>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    VERIFICATION REMARKS
                ================================================== */}

                {application?.verificationRemarks && (

                    <div
                        className="portal-card"
                        style={{
                            padding:
                                '22px',
                            marginBottom:
                                '22px'
                        }}
                    >

                        <div
                            style={{
                                display:
                                    'flex',
                                gap:
                                    '12px',
                                alignItems:
                                    'flex-start'
                            }}
                        >

                            <ShieldCheck
                                size={
                                    22
                                }
                                color="#174a8b"
                            />

                            <div>

                                <h3
                                    className="portal-heading"
                                    style={{
                                        fontSize:
                                            '19px',
                                        marginBottom:
                                            '7px'
                                    }}
                                >
                                    Verification Remarks
                                </h3>

                                <p
                                    className="portal-text"
                                    style={{
                                        margin:
                                            0
                                    }}
                                >
                                    {
                                        application
                                            .verificationRemarks
                                    }
                                </p>

                            </div>

                        </div>

                    </div>

                )}


                {/* =================================================
                    ACTIONS
                ================================================== */}

                <div
                    className="portal-card"
                    style={{
                        padding:
                            '22px'
                    }}
                >

                    <div
                        style={{
                            display:
                                'flex',
                            gap:
                                '12px',
                            flexWrap:
                                'wrap'
                        }}
                    >

                        <button
                            type="button"
                            className="portal-button portal-button-secondary"
                            onClick={() =>
                                navigate(
                                    '/student/applications'
                                )
                            }
                        >

                            <ArrowLeft
                                size={
                                    16
                                }
                                style={{
                                    marginRight:
                                        '7px',
                                    verticalAlign:
                                        'middle'
                                }}
                            />

                            My Applications

                        </button>


                        {(
                            status ===
                                'DRAFT' ||
                            status ===
                                'CORRECTION REQUIRED' ||
                            status ===
                                'RESUBMITTED'
                        ) && (

                            <button
                                type="button"
                                className="portal-button portal-button-primary"
                                onClick={() =>
                                    navigate(
                                        `/student/applications/${id}/documents`
                                    )
                                }
                            >

                                <FileText
                                    size={
                                        16
                                    }
                                    style={{
                                        marginRight:
                                            '7px',
                                        verticalAlign:
                                            'middle'
                                    }}
                                />

                                Open Application

                            </button>

                        )}

                    </div>

                </div>

            </main>


            {/* ====================================================
                ANIMATION
            ==================================================== */}

            <style>
                {`
                    @keyframes spin {
                        from {
                            transform: rotate(0deg);
                        }

                        to {
                            transform: rotate(360deg);
                        }
                    }

                    @media (max-width: 768px) {
                        .portal-container {
                            padding-left: 16px !important;
                            padding-right: 16px !important;
                        }
                    }

                    @media (max-width: 600px) {
                        main > div {
                            grid-template-columns: 1fr !important;
                        }
                    }
                `}
            </style>

        </div>
    );
};


export default ApplicationTracking;