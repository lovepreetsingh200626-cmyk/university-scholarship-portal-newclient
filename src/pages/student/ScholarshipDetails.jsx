import React, { useEffect, useState } from 'react';

import {
    ArrowLeft,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    GraduationCap,
    IndianRupee,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';

import {
    useNavigate,
    useParams
} from 'react-router-dom';

import API from '../../services/api';
import authService from '../../services/authService';

/* ============================================================
   SCHOLARSHIP DETAILS PAGE
============================================================ */

const ScholarshipDetails = () => {

    const navigate = useNavigate();

    const { id } = useParams();

    const [scholarship, setScholarship] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    /* ========================================================
       LOAD SCHOLARSHIP
    ======================================================== */

    useEffect(() => {

        loadScholarship();

    }, [id]);

    const loadScholarship = async () => {

        try {

            setLoading(true);
            setError('');

            const token =
                authService.getToken();

            if (!token) {
                navigate('/login');
                return;
            }

            if (!id) {

                setError(
                    'Scholarship information could not be found.'
                );

                return;
            }

            const response =
                await API.get(
                    `/scholarships/${id}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            if (
                response.data &&
                response.data.scholarship
            ) {

                setScholarship(
                    response.data.scholarship
                );

            } else {

                setError(
                    'Scholarship information could not be found.'
                );

            }

        } catch (error) {

            console.error(
                'Scholarship details error:',
                error
            );

            if (
                error.response &&
                error.response.status === 401
            ) {

                authService.logout();

                navigate('/login');

                return;
            }

            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {

                setError(
                    error.response.data.message
                );

            } else {

                setError(
                    'Unable to load scholarship details. Please try again.'
                );

            }

        } finally {

            setLoading(false);

        }
    };

    /* ========================================================
       DATE FORMATTER
    ======================================================== */

    const formatDate = (date) => {

        if (!date) {
            return 'Not specified';
        }

        const formattedDate =
            new Date(date);

        if (
            Number.isNaN(
                formattedDate.getTime()
            )
        ) {

            return 'Not specified';

        }

        return formattedDate.toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }
        );
    };

    /* ========================================================
       DEADLINE STATUS
    ======================================================== */

    const getDeadlineStatus = () => {

        if (
            !scholarship ||
            !scholarship.applicationEndDate
        ) {

            return {
                text: 'Deadline not specified',
                className:
                    'portal-status portal-status-neutral'
            };

        }

        const today =
            new Date();

        const deadline =
            new Date(
                scholarship.applicationEndDate
            );

        today.setHours(
            0,
            0,
            0,
            0
        );

        deadline.setHours(
            0,
            0,
            0,
            0
        );

        const difference =
            deadline.getTime() -
            today.getTime();

        const daysRemaining =
            Math.ceil(
                difference /
                (1000 * 60 * 60 * 24)
            );

        if (daysRemaining < 0) {

            return {
                text: 'Application closed',
                className:
                    'portal-status portal-status-danger'
            };

        }

        if (daysRemaining === 0) {

            return {
                text: 'Deadline is today',
                className:
                    'portal-status portal-status-danger'
            };

        }

        if (daysRemaining === 1) {

            return {
                text: '1 day remaining',
                className:
                    'portal-status portal-status-warning'
            };

        }

        return {
            text:
                `${daysRemaining} days remaining`,
            className:
                'portal-status portal-status-warning'
        };
    };

    /* ========================================================
       CHECK IF APPLICATION IS OPEN
    ======================================================== */

    const isApplicationOpen = () => {

        if (!scholarship) {
            return false;
        }

        if (
            scholarship.status !==
            'PUBLISHED'
        ) {
            return false;
        }

        const now =
            new Date();

        const startDate =
            scholarship.applicationStartDate
                ? new Date(
                    scholarship.applicationStartDate
                )
                : null;

        const endDate =
            scholarship.applicationEndDate
                ? new Date(
                    scholarship.applicationEndDate
                )
                : null;

        if (
            startDate &&
            now < startDate
        ) {
            return false;
        }

        if (
            endDate &&
            now > endDate
        ) {
            return false;
        }

        return true;
    };

    /* ========================================================
       ARRAY DISPLAY HELPER
    ======================================================== */

    const renderList = (items) => {

        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {

            return (
                <span
                    style={{
                        color: '#64748b'
                    }}
                >
                    Not specified
                </span>
            );

        }

        return (
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}
            >

                {items.map(
                    (item, index) => (

                        <span
                            key={`${item}-${index}`}
                            className="portal-status portal-status-neutral"
                        >
                            {item}
                        </span>

                    )
                )}

            </div>
        );
    };

    /* ========================================================
       LOADING
    ======================================================== */

    if (loading) {

        return (
            <div
                style={{
                    minHeight: '100vh',
                    background: '#f5f7fb'
                }}
            >

                <div
                    className="portal-container"
                    style={{
                        paddingTop: '50px',
                        paddingBottom: '50px'
                    }}
                >

                    <div
                        className="portal-card"
                        style={{
                            padding: '55px 25px',
                            textAlign: 'center'
                        }}
                    >

                        <Clock3
                            size={34}
                            style={{
                                color: '#174a8b',
                                margin:
                                    '0 auto 16px'
                            }}
                        />

                        <h2
                            className="portal-heading"
                            style={{
                                fontSize: '24px'
                            }}
                        >
                            Loading Scholarship
                        </h2>

                        <p
                            className="portal-text"
                            style={{
                                marginBottom: 0
                            }}
                        >
                            Please wait while we
                            retrieve the scholarship
                            information.
                        </p>

                    </div>

                </div>

            </div>
        );
    }

    /* ========================================================
       ERROR
    ======================================================== */

    if (error || !scholarship) {

        return (
            <div
                style={{
                    minHeight: '100vh',
                    background: '#f5f7fb'
                }}
            >

                <header
                    style={{
                        background: '#ffffff',
                        borderBottom:
                            '1px solid #e2e8f0'
                    }}
                >

                    <div
                        className="portal-container"
                        style={{
                            minHeight: '76px',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >

                        <button
                            type="button"
                            className="portal-button portal-button-secondary"
                            onClick={() =>
                                navigate(
                                    '/student/scholarships'
                                )
                            }
                        >
                            <ArrowLeft
                                size={16}
                                style={{
                                    marginRight: '7px',
                                    verticalAlign:
                                        'middle'
                                }}
                            />

                            Back to Scholarships
                        </button>

                    </div>

                </header>

                <main
                    className="portal-container"
                    style={{
                        paddingTop: '50px',
                        paddingBottom: '60px'
                    }}
                >

                    <div
                        className="portal-card"
                        style={{
                            padding: '55px 25px',
                            textAlign: 'center'
                        }}
                    >

                        <AlertCircle
                            size={42}
                            style={{
                                color: '#b42318',
                                margin:
                                    '0 auto 16px'
                            }}
                        />

                        <h2
                            className="portal-heading"
                            style={{
                                fontSize: '24px'
                            }}
                        >
                            Scholarship Not Found
                        </h2>

                        <p
                            className="portal-text"
                            style={{
                                maxWidth: '550px',
                                margin:
                                    '10px auto 24px'
                            }}
                        >
                            {error ||
                                'The requested scholarship could not be found.'}
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
                            View Scholarships
                        </button>

                    </div>

                </main>

            </div>
        );
    }

    const deadlineStatus =
        getDeadlineStatus();

    const applicationOpen =
        isApplicationOpen();

    /* ========================================================
       MAIN PAGE
    ======================================================== */

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#f5f7fb'
            }}
        >

            {/* =================================================
                HEADER
            ================================================== */}

            <header
                style={{
                    background: '#ffffff',
                    borderBottom:
                        '1px solid #e2e8f0',
                    boxShadow:
                        '0 2px 10px rgba(15, 23, 42, 0.04)'
                }}
            >

                <div
                    className="portal-container"
                    style={{
                        minHeight: '76px',
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
                            alignItems: 'center',
                            gap: '14px'
                        }}
                    >

                        <div
                            className="brand-emblem"
                        >
                            <BookOpen size={21} />
                        </div>

                        <div>

                            <h1
                                style={{
                                    margin: 0,
                                    color: '#172033',
                                    fontSize: '18px',
                                    fontWeight: 700
                                }}
                            >
                                University Scholarship Portal
                            </h1>

                            <p
                                style={{
                                    margin:
                                        '3px 0 0',
                                    color: '#64748b',
                                    fontSize: '12px'
                                }}
                            >
                                Scholarship Details
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        className="portal-button portal-button-secondary"
                        onClick={() =>
                            navigate(
                                '/student/scholarships'
                            )
                        }
                    >
                        <ArrowLeft
                            size={16}
                            style={{
                                marginRight: '7px',
                                verticalAlign:
                                    'middle'
                            }}
                        />

                        Back
                    </button>

                </div>

            </header>

            {/* =================================================
                MAIN CONTENT
            ================================================== */}

            <main>

                <section
                    className="portal-container"
                    style={{
                        paddingTop: '42px',
                        paddingBottom: '65px'
                    }}
                >

                    {/* =================================================
                        TITLE CARD
                    ================================================== */}

                    <div
                        className="portal-card"
                        style={{
                            padding:
                                '30px 32px',
                            marginBottom:
                                '20px'
                        }}
                    >

                        <div
                            style={{
                                display: 'flex',
                                alignItems:
                                    'flex-start',
                                justifyContent:
                                    'space-between',
                                gap: '20px'
                            }}
                        >

                            <div
                                style={{
                                    display: 'flex',
                                    gap: '16px'
                                }}
                            >

                                <div
                                    style={{
                                        width: '54px',
                                        height: '54px',
                                        flexShrink: 0,
                                        display:
                                            'flex',
                                        alignItems:
                                            'center',
                                        justifyContent:
                                            'center',
                                        borderRadius:
                                            '12px',
                                        background:
                                            '#eaf1fb',
                                        color:
                                            '#174a8b'
                                    }}
                                >
                                    <GraduationCap
                                        size={27}
                                    />
                                </div>

                                <div>

                                    <div
                                        style={{
                                            display:
                                                'flex',
                                            flexWrap:
                                                'wrap',
                                            alignItems:
                                                'center',
                                            gap: '8px',
                                            marginBottom:
                                                '8px'
                                        }}
                                    >

                                        <span
                                            className="portal-status portal-status-success"
                                        >
                                            {scholarship.status}
                                        </span>

                                        <span
                                            className="portal-status portal-status-info"
                                        >
                                            {scholarship.academicYear}
                                        </span>

                                    </div>

                                    <h2
                                        className="portal-heading"
                                        style={{
                                            fontSize:
                                                'clamp(28px, 4vw, 40px)',
                                            lineHeight:
                                                1.2
                                        }}
                                    >
                                        {
                                            scholarship.name
                                        }
                                    </h2>

                                </div>

                            </div>

                        </div>

                        {scholarship.description && (

                            <p
                                className="portal-text"
                                style={{
                                    margin:
                                        '22px 0 0',
                                    maxWidth:
                                        '900px'
                                }}
                            >
                                {
                                    scholarship.description
                                }
                            </p>

                        )}

                    </div>

                    {/* =================================================
                        IMPORTANT SUMMARY
                    ================================================== */}

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '16px',
                            marginBottom:
                                '20px'
                        }}
                    >

                        <div
                            className="portal-card"
                            style={{
                                padding: '22px'
                            }}
                        >

                            <div
                                style={{
                                    display:
                                        'flex',
                                    alignItems:
                                        'center',
                                    gap: '10px',
                                    marginBottom:
                                        '9px',
                                    color:
                                        '#64748b',
                                    fontSize:
                                        '13px'
                                }}
                            >

                                <IndianRupee
                                    size={18}
                                />

                                Scholarship Amount

                            </div>

                            <strong
                                style={{
                                    color:
                                        '#172033',
                                    fontSize:
                                        '25px'
                                }}
                            >
                                ₹
                                {Number(
                                    scholarship.scholarshipAmount ||
                                    0
                                ).toLocaleString(
                                    'en-IN'
                                )}
                            </strong>

                        </div>

                        <div
                            className="portal-card"
                            style={{
                                padding: '22px'
                            }}
                        >

                            <div
                                style={{
                                    display:
                                        'flex',
                                    alignItems:
                                        'center',
                                    gap: '10px',
                                    marginBottom:
                                        '9px',
                                    color:
                                        '#64748b',
                                    fontSize:
                                        '13px'
                                }}
                            >

                                <CalendarDays
                                    size={18}
                                />

                                Application Period

                            </div>

                            <strong
                                style={{
                                    display:
                                        'block',
                                    color:
                                        '#172033',
                                    fontSize:
                                        '14px',
                                    lineHeight:
                                        1.6
                                }}
                            >
                                {
                                    formatDate(
                                        scholarship.applicationStartDate
                                    )
                                }

                                {' '}–{' '}

                                {
                                    formatDate(
                                        scholarship.applicationEndDate
                                    )
                                }
                            </strong>

                        </div>

                        <div
                            className="portal-card"
                            style={{
                                padding: '22px'
                            }}
                        >

                            <div
                                style={{
                                    display:
                                        'flex',
                                    alignItems:
                                        'center',
                                    gap: '10px',
                                    marginBottom:
                                        '9px',
                                    color:
                                        '#64748b',
                                    fontSize:
                                        '13px'
                                }}
                            >

                                <Clock3
                                    size={18}
                                />

                                Deadline Status

                            </div>

                            <span
                                className={
                                    deadlineStatus.className
                                }
                            >
                                {
                                    deadlineStatus.text
                                }
                            </span>

                        </div>

                    </div>

                    {/* =================================================
                        DETAILS GRID
                    ================================================== */}

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'minmax(0, 2fr) minmax(280px, 1fr)',
                            gap: '20px',
                            alignItems:
                                'start'
                        }}
                    >

                        {/* =============================================
                            LEFT COLUMN
                        ============================================== */}

                        <div
                            style={{
                                display:
                                    'flex',
                                flexDirection:
                                    'column',
                                gap: '20px'
                            }}
                        >

                            {/* =========================================
                                ELIGIBILITY
                            ========================================== */}

                            <div
                                className="portal-card"
                                style={{
                                    padding: '26px'
                                }}
                            >

                                <div
                                    style={{
                                        display:
                                            'flex',
                                        alignItems:
                                            'center',
                                        gap: '10px',
                                        marginBottom:
                                            '22px'
                                    }}
                                >

                                    <ShieldCheck
                                        size={21}
                                        style={{
                                            color:
                                                '#174a8b'
                                        }}
                                    />

                                    <h3
                                        style={{
                                            margin: 0,
                                            color:
                                                '#172033',
                                            fontSize:
                                                '20px'
                                        }}
                                    >
                                        Eligibility Criteria
                                    </h3>

                                </div>

                                <div
                                    style={{
                                        display:
                                            'flex',
                                        flexDirection:
                                            'column',
                                        gap: '18px'
                                    }}
                                >

                                    <div>

                                        <div
                                            style={{
                                                marginBottom:
                                                    '7px',
                                                color:
                                                    '#64748b',
                                                fontSize:
                                                    '13px',
                                                fontWeight:
                                                    600
                                            }}
                                        >
                                            Eligible Courses
                                        </div>

                                        {renderList(
                                            scholarship.eligibleCourses
                                        )}

                                    </div>

                                    <div>

                                        <div
                                            style={{
                                                marginBottom:
                                                    '7px',
                                                color:
                                                    '#64748b',
                                                fontSize:
                                                    '13px',
                                                fontWeight:
                                                    600
                                            }}
                                        >
                                            Eligible Departments
                                        </div>

                                        {renderList(
                                            scholarship.eligibleDepartments
                                        )}

                                    </div>

                                    <div>

                                        <div
                                            style={{
                                                marginBottom:
                                                    '7px',
                                                color:
                                                    '#64748b',
                                                fontSize:
                                                    '13px',
                                                fontWeight:
                                                    600
                                            }}
                                        >
                                            Eligible Categories
                                        </div>

                                        {renderList(
                                            scholarship.eligibleCategories
                                        )}

                                    </div>

                                    <div
                                        style={{
                                            display:
                                                'grid',
                                            gridTemplateColumns:
                                                'repeat(auto-fit, minmax(200px, 1fr))',
                                            gap:
                                                '15px'
                                        }}
                                    >

                                        <div
                                            style={{
                                                padding:
                                                    '14px',
                                                borderRadius:
                                                    '9px',
                                                background:
                                                    '#f8fafc'
                                            }}
                                        >

                                            <div
                                                style={{
                                                    color:
                                                        '#64748b',
                                                    fontSize:
                                                        '12px',
                                                    marginBottom:
                                                        '5px'
                                                }}
                                            >
                                                Minimum Percentage
                                            </div>

                                            <strong
                                                style={{
                                                    color:
                                                        '#172033',
                                                    fontSize:
                                                        '17px'
                                                }}
                                            >
                                                {
                                                    scholarship.minimumPercentage ||
                                                    0
                                                }%
                                            </strong>

                                        </div>

                                        <div
                                            style={{
                                                padding:
                                                    '14px',
                                                borderRadius:
                                                    '9px',
                                                background:
                                                    '#f8fafc'
                                            }}
                                        >

                                            <div
                                                style={{
                                                    color:
                                                        '#64748b',
                                                    fontSize:
                                                        '12px',
                                                    marginBottom:
                                                        '5px'
                                                }}
                                            >
                                                Maximum Family Income
                                            </div>

                                            <strong
                                                style={{
                                                    color:
                                                        '#172033',
                                                    fontSize:
                                                        '17px'
                                                }}
                                            >
                                                {scholarship.maximumFamilyIncome !==
                                                    null &&
                                                scholarship.maximumFamilyIncome !==
                                                    undefined
                                                    ? `₹${Number(
                                                        scholarship.maximumFamilyIncome
                                                    ).toLocaleString(
                                                        'en-IN'
                                                    )}`
                                                    : 'No limit specified'}
                                            </strong>

                                        </div>

                                    </div>

                                </div>

                            </div>

                            {/* =========================================
                                REQUIRED DOCUMENTS
                            ========================================== */}

                            <div
                                className="portal-card"
                                style={{
                                    padding: '26px'
                                }}
                            >

                                <div
                                    style={{
                                        display:
                                            'flex',
                                        alignItems:
                                            'center',
                                        gap: '10px',
                                        marginBottom:
                                            '20px'
                                    }}
                                >

                                    <FileText
                                        size={21}
                                        style={{
                                            color:
                                                '#174a8b'
                                        }}
                                    />

                                    <h3
                                        style={{
                                            margin: 0,
                                            color:
                                                '#172033',
                                            fontSize:
                                                '20px'
                                        }}
                                    >
                                        Required Documents
                                    </h3>

                                </div>

                                {Array.isArray(
                                    scholarship.requiredDocuments
                                ) &&
                                scholarship
                                    .requiredDocuments
                                    .length > 0 ? (

                                    <div
                                        style={{
                                            display:
                                                'flex',
                                            flexDirection:
                                                'column',
                                            gap:
                                                '10px'
                                        }}
                                    >

                                        {
                                            scholarship
                                                .requiredDocuments
                                                .map(
                                                    (
                                                        document,
                                                        index
                                                    ) => (

                                                        <div
                                                            key={`${document}-${index}`}
                                                            style={{
                                                                display:
                                                                    'flex',
                                                                alignItems:
                                                                    'center',
                                                                gap:
                                                                    '10px',
                                                                padding:
                                                                    '12px 14px',
                                                                borderRadius:
                                                                    '8px',
                                                                background:
                                                                    '#f8fafc'
                                                            }}
                                                        >

                                                            <CheckCircle2
                                                                size={
                                                                    17
                                                                }
                                                                style={{
                                                                    color:
                                                                        '#15803d',
                                                                    flexShrink:
                                                                        0
                                                                }}
                                                            />

                                                            <span
                                                                style={{
                                                                    color:
                                                                        '#334155',
                                                                    fontSize:
                                                                        '14px'
                                                                }}
                                                            >
                                                                {
                                                                    document
                                                                }
                                                            </span>

                                                        </div>

                                                    )
                                                )
                                        }

                                    </div>

                                ) : (

                                    <p
                                        className="portal-text"
                                        style={{
                                            margin:
                                                '0'
                                        }}
                                    >
                                        No specific documents
                                        have been listed.
                                    </p>

                                )}

                            </div>

                            {/* =========================================
                                INSTRUCTIONS
                            ========================================== */}

                            {scholarship.instructions && (

                                <div
                                    className="portal-card"
                                    style={{
                                        padding: '26px'
                                    }}
                                >

                                    <div
                                        style={{
                                            display:
                                                'flex',
                                            alignItems:
                                                'center',
                                            gap: '10px',
                                            marginBottom:
                                                '15px'
                                        }}
                                    >

                                        <BookOpen
                                            size={21}
                                            style={{
                                                color:
                                                    '#174a8b'
                                            }}
                                        />

                                        <h3
                                            style={{
                                                margin: 0,
                                                color:
                                                    '#172033',
                                                fontSize:
                                                    '20px'
                                            }}
                                        >
                                            Important Instructions
                                        </h3>

                                    </div>

                                    <p
                                        className="portal-text"
                                        style={{
                                            margin: 0,
                                            whiteSpace:
                                                'pre-line'
                                        }}
                                    >
                                        {
                                            scholarship.instructions
                                        }
                                    </p>

                                </div>

                            )}

                        </div>

                        {/* =============================================
                            RIGHT COLUMN
                        ============================================== */}

                        <aside
                            className="portal-card"
                            style={{
                                padding: '25px',
                                position:
                                    'sticky',
                                top: '20px'
                            }}
                        >

                            <h3
                                style={{
                                    margin:
                                        '0 0 7px',
                                    color:
                                        '#172033',
                                    fontSize:
                                        '20px'
                                }}
                            >
                                Application
                            </h3>

                            <p
                                className="portal-text"
                                style={{
                                    margin:
                                        '0 0 20px',
                                    fontSize:
                                        '14px'
                                }}
                            >
                                Review the eligibility
                                requirements before
                                starting your application.
                            </p>

                            <div
                                style={{
                                    padding:
                                        '15px',
                                    marginBottom:
                                        '18px',
                                    borderRadius:
                                        '9px',
                                    background:
                                        applicationOpen
                                            ? '#f0fdf4'
                                            : '#fef2f2',
                                    border:
                                        applicationOpen
                                            ? '1px solid #bbf7d0'
                                            : '1px solid #fecaca'
                                }}
                            >

                                <div
                                    style={{
                                        display:
                                            'flex',
                                        alignItems:
                                            'center',
                                        gap: '8px',
                                        marginBottom:
                                            '6px',
                                        color:
                                            applicationOpen
                                                ? '#166534'
                                                : '#991b1b',
                                        fontSize:
                                            '13px',
                                        fontWeight:
                                            700
                                    }}
                                >

                                    {applicationOpen ? (
                                        <CheckCircle2
                                            size={16}
                                        />
                                    ) : (
                                        <AlertCircle
                                            size={16}
                                        />
                                    )}

                                    {applicationOpen
                                        ? 'Applications are open'
                                        : 'Applications are currently closed'}

                                </div>

                                <p
                                    style={{
                                        margin: 0,
                                        color:
                                            '#64748b',
                                        fontSize:
                                            '12px',
                                        lineHeight:
                                            1.5
                                    }}
                                >
                                    Application period:
                                    <br />

                                    {
                                        formatDate(
                                            scholarship.applicationStartDate
                                        )
                                    }

                                    {' '}to{' '}

                                    {
                                        formatDate(
                                            scholarship.applicationEndDate
                                        )
                                    }
                                </p>

                            </div>

                            <button
                                type="button"
                                className="portal-button portal-button-primary"
                                disabled={
                                    !applicationOpen
                                }
onClick={() => {
    if (applicationOpen) {
        navigate(
            `/student/scholarships/${id}/eligibility`
        );
    }
}}                                style={{
                                    width: '100%',
                                    opacity:
                                        applicationOpen
                                            ? 1
                                            : 0.55,
                                    cursor:
                                        applicationOpen
                                            ? 'pointer'
                                            : 'not-allowed'
                                }}
                            >
                                Check Eligibility
                            </button>

                            <div
                                style={{
                                    marginTop:
                                        '20px',
                                    paddingTop:
                                        '18px',
                                    borderTop:
                                        '1px solid #e2e8f0'
                                }}
                            >

                                <div
                                    style={{
                                        display:
                                            'flex',
                                        alignItems:
                                            'center',
                                        gap: '8px',
                                        marginBottom:
                                            '9px',
                                        color:
                                            '#334155',
                                        fontSize:
                                            '13px',
                                        fontWeight:
                                            700
                                    }}
                                >

                                    <CalendarDays
                                        size={16}
                                    />

                                    Application Deadline

                                </div>

                                <div
                                    style={{
                                        color:
                                            '#172033',
                                        fontSize:
                                            '15px',
                                        fontWeight:
                                            600
                                    }}
                                >
                                    {
                                        formatDate(
                                            scholarship.applicationEndDate
                                        )
                                    }
                                </div>

                            </div>

                        </aside>

                    </div>

                </section>

            </main>

        </div>
    );
};

export default ScholarshipDetails;