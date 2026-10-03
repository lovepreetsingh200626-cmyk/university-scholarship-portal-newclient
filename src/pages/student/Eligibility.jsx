import React, { useEffect, useState } from 'react';

import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    GraduationCap,
    ShieldCheck,
    AlertCircle,
    FileText,
    ArrowRight
} from 'lucide-react';

import {
    useNavigate,
    useParams
} from 'react-router-dom';

import API from '../../services/api';
import authService from '../../services/authService';

/* ============================================================
   STUDENT ELIGIBILITY PAGE
============================================================ */

const Eligibility = () => {

    const navigate = useNavigate();

    const { id } = useParams();

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    const [eligibility, setEligibility] =
        useState(null);

    /* ========================================================
       LOAD ELIGIBILITY
    ======================================================== */

    useEffect(() => {

        checkEligibility();

    }, [id]);

    const checkEligibility = async () => {

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
                    `/eligibility/${id}`,
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

                setEligibility(
                    response.data
                );

            } else {

                setError(
                    response.data &&
                    response.data.message
                        ? response.data.message
                        : 'Unable to check eligibility.'
                );

            }

        } catch (error) {

            console.error(
                'Eligibility check error:',
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
                    'Unable to check scholarship eligibility. Please try again.'
                );

            }

        } finally {

            setLoading(false);

        }
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
                            size={36}
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
                            Checking Eligibility
                        </h2>

                        <p
                            className="portal-text"
                            style={{
                                marginBottom: 0
                            }}
                        >
                            Please wait while we
                            check your scholarship
                            eligibility.
                        </p>

                    </div>

                </div>

            </div>
        );
    }

    /* ========================================================
       ERROR
    ======================================================== */

    if (error || !eligibility) {

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
                            alignItems: 'center'
                        }}
                    >

                        <button
                            type="button"
                            className="portal-button portal-button-secondary"
                            onClick={() =>
                                navigate(
                                    `/student/scholarships/${id}`
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

                            Back to Scholarship
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
                            size={44}
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
                            Eligibility Check Failed
                        </h2>

                        <p
                            className="portal-text"
                            style={{
                                maxWidth: '560px',
                                margin:
                                    '10px auto 24px'
                            }}
                        >
                            {error ||
                                'Unable to check your eligibility at this time.'}
                        </p>

                        <button
                            type="button"
                            className="portal-button portal-button-primary"
                            onClick={() =>
                                navigate(
                                    `/student/scholarships/${id}`
                                )
                            }
                        >
                            Back to Scholarship
                        </button>

                    </div>

                </main>

            </div>
        );
    }

    const scholarship =
        eligibility.scholarship || {};

    const isEligible =
        eligibility.eligible === true;

    const failedCriteria =
        eligibility.failedCriteria || {};

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
                            <ShieldCheck size={21} />
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
                                Eligibility Verification
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        className="portal-button portal-button-secondary"
                        onClick={() =>
                            navigate(
                                `/student/scholarships/${id}`
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
                        PAGE INTRO
                    ================================================== */}

                    <div
                        style={{
                            marginBottom: '25px'
                        }}
                    >

                        <div
                            style={{
                                display:
                                    'inline-flex',
                                alignItems:
                                    'center',
                                gap: '7px',
                                marginBottom:
                                    '12px',
                                padding:
                                    '6px 11px',
                                borderRadius:
                                    '999px',
                                background:
                                    '#eaf1fb',
                                color:
                                    '#174a8b',
                                fontSize:
                                    '12px',
                                fontWeight:
                                    700
                            }}
                        >

                            <ShieldCheck size={14} />

                            Eligibility Verification

                        </div>

                        <h2
                            className="portal-heading"
                            style={{
                                fontSize:
                                    'clamp(30px, 4vw, 42px)'
                            }}
                        >
                            Scholarship Eligibility
                        </h2>

                        <p
                            className="portal-text"
                            style={{
                                maxWidth: '720px',
                                margin:
                                    '10px 0 0'
                            }}
                        >
                            Your profile has been checked
                            against the eligibility criteria
                            defined for this scholarship.
                        </p>

                    </div>

                    {/* =================================================
                        SCHOLARSHIP SUMMARY
                    ================================================== */}

                    <div
                        className="portal-card"
                        style={{
                            padding: '22px 25px',
                            marginBottom: '20px'
                        }}
                    >

                        <div
                            style={{
                                display: 'flex',
                                alignItems:
                                    'center',
                                gap: '14px'
                            }}
                        >

                            <div
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    flexShrink: 0,
                                    display:
                                        'flex',
                                    alignItems:
                                        'center',
                                    justifyContent:
                                        'center',
                                    borderRadius:
                                        '10px',
                                    background:
                                        '#eaf1fb',
                                    color:
                                        '#174a8b'
                                }}
                            >

                                <GraduationCap
                                    size={24}
                                />

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
                                    Scholarship
                                </div>

                                <h3
                                    style={{
                                        margin: 0,
                                        color:
                                            '#172033',
                                        fontSize:
                                            '19px'
                                    }}
                                >
                                    {
                                        scholarship.name ||
                                        'Selected Scholarship'
                                    }
                                </h3>

                                {scholarship.academicYear && (

                                    <div
                                        style={{
                                            marginTop:
                                                '4px',
                                            color:
                                                '#64748b',
                                            fontSize:
                                                '13px'
                                        }}
                                    >
                                        Academic Year:{' '}
                                        {
                                            scholarship.academicYear
                                        }
                                    </div>

                                )}

                            </div>

                        </div>

                    </div>

                    {/* =================================================
                        RESULT
                    ================================================== */}

                    <div
                        className="portal-card"
                        style={{
                            padding:
                                '38px 30px',
                            marginBottom:
                                '20px',
                            textAlign:
                                'center',
                            border:
                                isEligible
                                    ? '1px solid #bbf7d0'
                                    : '1px solid #fecaca',
                            background:
                                isEligible
                                    ? '#f0fdf4'
                                    : '#fffafa'
                        }}
                    >

                        <div
                            style={{
                                width: '66px',
                                height: '66px',
                                display:
                                    'flex',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'center',
                                margin:
                                    '0 auto 17px',
                                borderRadius:
                                    '50%',
                                background:
                                    isEligible
                                        ? '#dcfce7'
                                        : '#fee2e2',
                                color:
                                    isEligible
                                        ? '#15803d'
                                        : '#b42318'
                            }}
                        >

                            {isEligible ? (
                                <CheckCircle2
                                    size={38}
                                />
                            ) : (
                                <AlertCircle
                                    size={38}
                                />
                            )}

                        </div>

                        <h2
                            style={{
                                margin:
                                    '0 0 10px',
                                color:
                                    isEligible
                                        ? '#166534'
                                        : '#991b1b',
                                fontFamily:
                                    "'Playfair Display', Georgia, serif",
                                fontSize:
                                    '30px'
                            }}
                        >
                            {isEligible
                                ? 'You Are Eligible'
                                : 'You Are Not Eligible'}
                        </h2>

                        <p
                            style={{
                                maxWidth:
                                    '680px',
                                margin:
                                    '0 auto',
                                color:
                                    '#64748b',
                                fontSize:
                                    '15px',
                                lineHeight:
                                    1.7
                            }}
                        >
                            {eligibility.reason ||
                                (isEligible
                                    ? 'You meet all eligibility criteria for this scholarship.'
                                    : 'Your profile does not currently meet all eligibility criteria for this scholarship.')}
                        </p>

                    </div>

                    {/* =================================================
                        FAILED CRITERIA
                    ================================================== */}

                    {!isEligible &&
                        Object.keys(
                            failedCriteria
                        ).length > 0 && (

                            <div
                                className="portal-card"
                                style={{
                                    padding: '26px',
                                    marginBottom:
                                        '20px'
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

                                    <AlertCircle
                                        size={21}
                                        style={{
                                            color:
                                                '#b42318'
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
                                        Eligibility Criteria Not Met
                                    </h3>

                                </div>

                                <div
                                    style={{
                                        display:
                                            'flex',
                                        flexDirection:
                                            'column',
                                        gap: '12px'
                                    }}
                                >

                                    {Object.entries(
                                        failedCriteria
                                    ).map(
                                        (
                                            [
                                                criterion,
                                                message
                                            ]
                                        ) => (

                                            <div
                                                key={
                                                    criterion
                                                }
                                                style={{
                                                    display:
                                                        'flex',
                                                    alignItems:
                                                        'flex-start',
                                                    gap:
                                                        '12px',
                                                    padding:
                                                        '14px',
                                                    borderRadius:
                                                        '9px',
                                                    background:
                                                        '#fef2f2',
                                                    border:
                                                        '1px solid #fecaca'
                                                }}
                                            >

                                                <AlertCircle
                                                    size={
                                                        17
                                                    }
                                                    style={{
                                                        color:
                                                            '#b42318',
                                                        flexShrink:
                                                            0,
                                                        marginTop:
                                                            '2px'
                                                    }}
                                                />

                                                <div>

                                                    <div
                                                        style={{
                                                            color:
                                                                '#991b1b',
                                                            fontSize:
                                                                '13px',
                                                            fontWeight:
                                                                700,
                                                            marginBottom:
                                                                '3px'
                                                        }}
                                                    >
                                                        {
                                                            criterion
                                                        }
                                                    </div>

                                                    <div
                                                        style={{
                                                            color:
                                                                '#64748b',
                                                            fontSize:
                                                                '14px',
                                                            lineHeight:
                                                                1.6
                                                        }}
                                                    >
                                                        {
                                                            message
                                                        }
                                                    </div>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                        )}

                    {/* =================================================
                        ELIGIBLE ACTION
                    ================================================== */}

                    {isEligible && (

                        <div
                            className="portal-card"
                            style={{
                                padding: '28px',
                                marginBottom:
                                    '20px'
                            }}
                        >

                            <div
                                style={{
                                    display:
                                        'flex',
                                    alignItems:
                                        'flex-start',
                                    gap: '14px'
                                }}
                            >

                                <div
                                    style={{
                                        width: '42px',
                                        height: '42px',
                                        flexShrink: 0,
                                        display:
                                            'flex',
                                        alignItems:
                                            'center',
                                        justifyContent:
                                            'center',
                                        borderRadius:
                                            '9px',
                                        background:
                                            '#eaf1fb',
                                        color:
                                            '#174a8b'
                                    }}
                                >

                                    <FileText
                                        size={21}
                                    />

                                </div>

                                <div
                                    style={{
                                        flex: 1
                                    }}
                                >

                                    <h3
                                        style={{
                                            margin:
                                                '0 0 7px',
                                            color:
                                                '#172033',
                                            fontSize:
                                                '19px'
                                        }}
                                    >
                                        Ready to Apply
                                    </h3>

                                    <p
                                        className="portal-text"
                                        style={{
                                            margin:
                                                '0 0 18px',
                                            fontSize:
                                                '14px'
                                        }}
                                    >
                                        You meet the current
                                        eligibility requirements.
                                        You can now proceed to
                                        create your scholarship
                                        application.
                                    </p>

                                    <button
                                        type="button"
                                        className="portal-button portal-button-primary"
                                        onClick={() =>
                                            navigate(
                                                `/student/scholarships/${id}/application`
                                            )
                                        }
                                    >
                                        Start Application

                                        <ArrowRight
                                            size={17}
                                            style={{
                                                marginLeft:
                                                    '7px',
                                                verticalAlign:
                                                    'middle'
                                            }}
                                        />

                                    </button>

                                </div>

                            </div>

                        </div>

                    )}

                    {/* =================================================
                        BOTTOM ACTIONS
                    ================================================== */}

                    <div
                        style={{
                            display: 'flex',
                            justifyContent:
                                'space-between',
                            alignItems:
                                'center',
                            gap: '12px',
                            flexWrap:
                                'wrap'
                        }}
                    >

                        <button
                            type="button"
                            className="portal-button portal-button-secondary"
                            onClick={() =>
                                navigate(
                                    `/student/scholarships/${id}`
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

                            Scholarship Details
                        </button>

                        <button
                            type="button"
                            className="portal-button portal-button-secondary"
                            onClick={() =>
                                navigate(
                                    '/student/scholarships'
                                )
                            }
                        >
                            View All Scholarships
                        </button>

                    </div>

                </section>

            </main>

        </div>
    );
};

export default Eligibility;