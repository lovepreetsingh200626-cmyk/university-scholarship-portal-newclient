import React, {
    useEffect,
    useState
} from 'react';

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
    UserCircle,
    AlertCircle
} from 'lucide-react';

import {
    useNavigate,
    useParams
} from 'react-router-dom';

import API from '../../services/api';

import authService from '../../services/authService';

/* ============================================================
   SCHOLARSHIP APPLICATION
============================================================ */

const ScholarshipApplication = () => {
    const navigate = useNavigate();

    const {
        id
    } = useParams();

    const [scholarship, setScholarship] =
        useState(null);

    const [profile, setProfile] =
        useState(null);

    const [eligibility, setEligibility] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [creating, setCreating] =
        useState(false);

    const [error, setError] =
        useState('');

    const [success, setSuccess] =
        useState('');

    /* ========================================================
       LOAD APPLICATION INFORMATION
    ======================================================== */

    useEffect(() => {
        const loadApplicationInformation =
            async () => {
                try {
                    setLoading(true);
                    setError('');

                    const token =
                        authService.getToken();

                    if (!token) {
                        navigate(
                            '/login',
                            {
                                replace: true
                            }
                        );

                        return;
                    }

                    const config = {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    };

                    const [
                        scholarshipResponse,
                        profileResponse,
                        eligibilityResponse
                    ] = await Promise.all([
                        API.get(
                            `/scholarships/${id}`,
                            config
                        ),

                        API.get(
                            '/student-profile/me',
                            config
                        ),

                        API.get(
                            `/eligibility/${id}`,
                            config
                        )
                    ]);

                    setScholarship(
                        scholarshipResponse.data.scholarship
                    );

                    setProfile(
                        profileResponse.data.profile
                    );

                    setEligibility(
                        eligibilityResponse.data
                    );

                    if (
                        !profileResponse.data.profile
                    ) {
                        setError(
                            'Please complete your student profile before applying.'
                        );

                        return;
                    }

                    if (
                        !eligibilityResponse.data.eligible
                    ) {
                        setError(
                            eligibilityResponse.data.reason ||
                            'You are not eligible for this scholarship.'
                        );
                    }

                } catch (requestError) {
                    console.error(
                        'Load application information error:',
                        requestError
                    );

                    if (
                        requestError.response?.status ===
                        401
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
                        'Unable to load scholarship application information.'
                    );

                } finally {
                    setLoading(false);
                }
            };

        loadApplicationInformation();

    }, [id, navigate]);

    /* ========================================================
       CREATE APPLICATION
    ======================================================== */

    const handleCreateApplication =
        async () => {
            try {
                setCreating(true);
                setError('');
                setSuccess('');

                const token =
                    authService.getToken();

                if (!token) {
                    navigate(
                        '/login',
                        {
                            replace: true
                        }
                    );

                    return;
                }

                const response =
                    await API.post(
                        '/applications',
                        {
                            scholarshipId: id
                        },
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                const application =
                    response.data.application;

                setSuccess(
                    response.data.message ||
                    'Scholarship application draft created successfully.'
                );

                if (
                    application?._id
                ) {
                    setTimeout(() => {
                        navigate(
                            `/student/applications/${application._id}/documents`
                        );
                    }, 700);
                }

            } catch (requestError) {
                console.error(
                    'Create application error:',
                    requestError
                );

                if (
                    requestError.response?.status ===
                    401
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

                const responseData =
                    requestError.response?.data;

                if (
                    requestError.response?.status ===
                    409 &&
                    responseData?.application?._id
                ) {
                    setError(
                        responseData.message ||
                        'You already have an application for this scholarship.'
                    );

                    return;
                }

                setError(
                    responseData?.message ||
                    'Unable to create scholarship application.'
                );

            } finally {
                setCreating(false);
            }
        };

    /* ========================================================
       BACK TO ELIGIBILITY
    ======================================================== */

    const handleBack =
        () => {
            navigate(
                `/student/scholarships/${id}/eligibility`
            );
        };

    /* ========================================================
       LOADING SCREEN
    ======================================================== */

    if (loading) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f5f7fb'
                }}
            >
                <div
                    style={{
                        textAlign: 'center'
                    }}
                >
                    <div
                        style={{
                            width: 42,
                            height: 42,
                            border:
                                '4px solid #dbe5f1',
                            borderTopColor:
                                '#174a8b',
                            borderRadius:
                                '50%',
                            animation:
                                'scholarshipApplicationSpin 0.8s linear infinite',
                            margin:
                                '0 auto 16px'
                        }}
                    />

                    <p
                        style={{
                            margin: 0,
                            color: '#64748b'
                        }}
                    >
                        Preparing your scholarship application...
                    </p>
                </div>

                <style>
                    {`
                        @keyframes scholarshipApplicationSpin {
                            to {
                                transform: rotate(360deg);
                            }
                        }
                    `}
                </style>
            </div>
        );
    }

    /* ========================================================
       MAIN PAGE
    ======================================================== */

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#f5f7fb',
                padding:
                    '32px 0 60px'
            }}
        >
            <div
                className="portal-container"
            >

                {/* ====================================================
                    BACK BUTTON
                ==================================================== */}

                <button
                    type="button"
                    onClick={handleBack}
                    className="portal-button portal-button-secondary"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 24
                    }}
                >
                    <ArrowLeft
                        size={18}
                    />

                    Back to Eligibility
                </button>

                {/* ====================================================
                    PAGE HEADER
                ==================================================== */}

                <div
                    style={{
                        marginBottom: 28
                    }}
                >
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding:
                                '7px 12px',
                            borderRadius:
                                999,
                            background:
                                '#eaf1fb',
                            color:
                                '#174a8b',
                            fontSize: 12,
                            fontWeight: 700,
                            marginBottom:
                                12
                        }}
                    >
                        <FileText
                            size={15}
                        />

                        SCHOLARSHIP APPLICATION
                    </div>

                    <h1
                        className="portal-heading"
                        style={{
                            fontSize:
                                'clamp(28px, 4vw, 42px)',
                            marginBottom:
                                10
                        }}
                    >
                        Start Your Application
                    </h1>

                    <p
                        className="portal-text"
                        style={{
                            maxWidth: 760,
                            margin: 0
                        }}
                    >
                        Review your scholarship and
                        student information carefully
                        before creating your application.
                    </p>
                </div>

                {/* ====================================================
                    ERROR
                ==================================================== */}

                {error && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems:
                                'flex-start',
                            gap: 12,
                            padding: 16,
                            marginBottom: 24,
                            borderRadius: 10,
                            border:
                                '1px solid #fecaca',
                            background:
                                '#fef2f2',
                            color:
                                '#991b1b'
                        }}
                    >
                        <AlertCircle
                            size={20}
                            style={{
                                flexShrink: 0,
                                marginTop: 2
                            }}
                        />

                        <div>
                            <strong>
                                Unable to continue
                            </strong>

                            <div
                                style={{
                                    marginTop: 4,
                                    lineHeight: 1.6
                                }}
                            >
                                {error}
                            </div>
                        </div>
                    </div>
                )}

                {/* ====================================================
                    SUCCESS
                ==================================================== */}

                {success && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems:
                                'flex-start',
                            gap: 12,
                            padding: 16,
                            marginBottom: 24,
                            borderRadius: 10,
                            border:
                                '1px solid #bbf7d0',
                            background:
                                '#f0fdf4',
                            color:
                                '#166534'
                        }}
                    >
                        <CheckCircle2
                            size={20}
                            style={{
                                flexShrink: 0,
                                marginTop: 2
                            }}
                        />

                        <div>
                            <strong>
                                Application created
                            </strong>

                            <div
                                style={{
                                    marginTop: 4,
                                    lineHeight: 1.6
                                }}
                            >
                                {success}
                            </div>
                        </div>
                    </div>
                )}

                {/* ====================================================
                    TWO COLUMN LAYOUT
                ==================================================== */}

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'minmax(0, 1.35fr) minmax(300px, 0.65fr)',
                        gap: 24,
                        alignItems: 'start'
                    }}
                >

                    {/* ==================================================
                        LEFT COLUMN
                    ================================================== */}

                    <div
                        style={{
                            display: 'grid',
                            gap: 24
                        }}
                    >

                        {/* ==================================================
                            SCHOLARSHIP INFORMATION
                        ================================================== */}

                        <section
                            className="portal-card"
                            style={{
                                padding: 24
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems:
                                        'center',
                                    gap: 12,
                                    marginBottom: 20
                                }}
                            >
                                <div
                                    style={{
                                        width: 42,
                                        height: 42,
                                        borderRadius:
                                            10,
                                        background:
                                            '#eaf1fb',
                                        color:
                                            '#174a8b',
                                        display:
                                            'flex',
                                        alignItems:
                                            'center',
                                        justifyContent:
                                            'center'
                                    }}
                                >
                                    <GraduationCap
                                        size={22}
                                    />
                                </div>

                                <div>
                                    <h2
                                        style={{
                                            margin: 0,
                                            fontSize: 20,
                                            color:
                                                '#172033'
                                        }}
                                    >
                                        Scholarship Information
                                    </h2>

                                    <p
                                        style={{
                                            margin:
                                                '4px 0 0',
                                            color:
                                                '#64748b',
                                            fontSize:
                                                13
                                        }}
                                    >
                                        Scholarship you are applying for
                                    </p>
                                </div>
                            </div>

                            {scholarship && (
                                <>
                                    <h3
                                        style={{
                                            margin:
                                                '0 0 10px',
                                            color:
                                                '#172033',
                                            fontSize:
                                                24
                                        }}
                                    >
                                        {scholarship.name}
                                    </h3>

                                    <p
                                        style={{
                                            margin:
                                                '0 0 22px',
                                            color:
                                                '#64748b',
                                            lineHeight:
                                                1.7
                                        }}
                                    >
                                        {scholarship.description}
                                    </p>

                                    <div
                                        style={{
                                            display:
                                                'grid',
                                            gridTemplateColumns:
                                                'repeat(2, minmax(0, 1fr))',
                                            gap: 14
                                        }}
                                    >
                                        <InfoBox
                                            icon={
                                                <IndianRupee
                                                    size={18}
                                                />
                                            }
                                            label="Scholarship Amount"
                                            value={
                                                `₹${Number(
                                                    scholarship.scholarshipAmount || 0
                                                ).toLocaleString('en-IN')}`
                                            }
                                        />

                                        <InfoBox
                                            icon={
                                                <CalendarDays
                                                    size={18}
                                                />
                                            }
                                            label="Academic Year"
                                            value={
                                                scholarship.academicYear ||
                                                'Not specified'
                                            }
                                        />

                                        <InfoBox
                                            icon={
                                                <Clock3
                                                    size={18}
                                                />
                                            }
                                            label="Application Deadline"
                                            value={
                                                scholarship.applicationEndDate
                                                    ? new Date(
                                                        scholarship.applicationEndDate
                                                    ).toLocaleDateString(
                                                        'en-IN',
                                                        {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        }
                                                    )
                                                    : 'Not specified'
                                            }
                                        />

                                        <InfoBox
                                            icon={
                                                <ShieldCheck
                                                    size={18}
                                                />
                                            }
                                            label="Eligibility"
                                            value={
                                                eligibility?.eligible
                                                    ? 'Eligible'
                                                    : 'Not eligible'
                                            }
                                        />
                                    </div>
                                </>
                            )}
                        </section>

                        {/* ==================================================
                            STUDENT INFORMATION
                        ================================================== */}

                        <section
                            className="portal-card"
                            style={{
                                padding: 24
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems:
                                        'center',
                                    gap: 12,
                                    marginBottom: 20
                                }}
                            >
                                <div
                                    style={{
                                        width: 42,
                                        height: 42,
                                        borderRadius:
                                            10,
                                        background:
                                            '#f1f5f9',
                                        color:
                                            '#475569',
                                        display:
                                            'flex',
                                        alignItems:
                                            'center',
                                        justifyContent:
                                            'center'
                                    }}
                                >
                                    <UserCircle
                                        size={22}
                                    />
                                </div>

                                <div>
                                    <h2
                                        style={{
                                            margin: 0,
                                            fontSize: 20,
                                            color:
                                                '#172033'
                                        }}
                                    >
                                        Applicant Information
                                    </h2>

                                    <p
                                        style={{
                                            margin:
                                                '4px 0 0',
                                            color:
                                                '#64748b',
                                            fontSize:
                                                13
                                        }}
                                    >
                                        Information from your student profile
                                    </p>
                                </div>
                            </div>

                            {profile && (
                                <div
                                    style={{
                                        display:
                                            'grid',
                                        gridTemplateColumns:
                                            'repeat(2, minmax(0, 1fr))',
                                        gap: 18
                                    }}
                                >
                                    <ReadOnlyField
                                        label="Full Name"
                                        value={
                                            profile.fullName
                                        }
                                    />

                                    <ReadOnlyField
                                        label="Registration Number"
                                        value={
                                            profile.registrationNumber
                                        }
                                    />

                                    <ReadOnlyField
                                        label="Course"
                                        value={
                                            profile.course
                                        }
                                    />

                                    <ReadOnlyField
                                        label="Department"
                                        value={
                                            profile.department
                                        }
                                    />

                                    <ReadOnlyField
                                        label="Academic Year"
                                        value={
                                            profile.academicYear
                                        }
                                    />

                                    <ReadOnlyField
                                        label="Current Semester"
                                        value={
                                            profile.currentSemester
                                        }
                                    />

                                    <ReadOnlyField
                                        label="Category"
                                        value={
                                            profile.category
                                        }
                                    />

                                    <ReadOnlyField
                                        label="Gender"
                                        value={
                                            profile.gender ||
                                            'Not provided'
                                        }
                                    />

                                    <ReadOnlyField
                                        label="Mobile"
                                        value={
                                            profile.mobile ||
                                            'Not provided'
                                        }
                                    />

                                    <ReadOnlyField
                                        label="State"
                                        value={
                                            profile.state ||
                                            'Not provided'
                                        }
                                    />

                                    <ReadOnlyField
                                        label="Family Income"
                                        value={
                                            profile.familyIncome !==
                                            null &&
                                            profile.familyIncome !==
                                            undefined
                                                ? `₹${Number(
                                                    profile.familyIncome
                                                ).toLocaleString(
                                                    'en-IN'
                                                )}`
                                                : 'Not provided'
                                        }
                                    />

                                    <ReadOnlyField
                                        label="Previous Percentage"
                                        value={
                                            profile.previousPercentage !==
                                            null &&
                                            profile.previousPercentage !==
                                            undefined
                                                ? `${profile.previousPercentage}%`
                                                : 'Not provided'
                                        }
                                    />

                                    <div
                                        style={{
                                            gridColumn:
                                                '1 / -1'
                                        }}
                                    >
                                        <ReadOnlyField
                                            label="Address"
                                            value={
                                                profile.address ||
                                                'Not provided'
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            <div
                                style={{
                                    marginTop: 20,
                                    padding: 14,
                                    borderRadius: 8,
                                    background:
                                        '#f8fafc',
                                    border:
                                        '1px solid #e2e8f0',
                                    color:
                                        '#64748b',
                                    fontSize: 13,
                                    lineHeight: 1.6
                                }}
                            >
                                <strong
                                    style={{
                                        color:
                                            '#334155'
                                    }}
                                >
                                    Note:
                                </strong>{' '}
                                These details are taken from
                                your student profile. If any
                                information is incorrect, go
                                back and update your profile
                                before creating the application.
                            </div>
                        </section>

                    </div>

                    {/* ==================================================
                        RIGHT COLUMN
                    ================================================== */}

                    <aside
                        className="portal-card"
                        style={{
                            padding: 24,
                            position:
                                'sticky',
                            top: 24
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems:
                                    'center',
                                gap: 10,
                                marginBottom: 18
                            }}
                        >
                            <ShieldCheck
                                size={21}
                                color="#174a8b"
                            />

                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: 19,
                                    color:
                                        '#172033'
                                }}
                            >
                                Before You Continue
                            </h2>
                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gap: 13
                            }}
                        >
                            <ChecklistItem
                                text="Your student profile is complete."
                                completed={
                                    Boolean(profile)
                                }
                            />

                            <ChecklistItem
                                text="You meet the scholarship eligibility criteria."
                                completed={
                                    Boolean(
                                        eligibility?.eligible
                                    )
                                }
                            />

                            <ChecklistItem
                                text="Your application will initially be saved as a draft."
                                completed={
                                    true
                                }
                            />

                            <ChecklistItem
                                text="Required documents will be uploaded after creating the application."
                                completed={
                                    true
                                }
                            />
                        </div>

                        <div
                            style={{
                                height: 1,
                                background:
                                    '#e2e8f0',
                                margin:
                                    '22px 0'
                            }}
                        />

                        <button
                            type="button"
                            onClick={
                                handleCreateApplication
                            }
                            disabled={
                                creating ||
                                !profile ||
                                !eligibility?.eligible
                            }
                            className="portal-button portal-button-primary"
                            style={{
                                width: '100%',
                                display:
                                    'flex',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'center',
                                gap: 8,
                                padding:
                                    '13px 18px',
                                opacity:
                                    creating ||
                                    !profile ||
                                    !eligibility?.eligible
                                        ? 0.6
                                        : 1
                            }}
                        >
                            {creating ? (
                                <>
                                    Creating Application...
                                </>
                            ) : (
                                <>
                                    <FileText
                                        size={18}
                                    />

                                    Create Application
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    '/student/profile'
                                )
                            }
                            className="portal-button portal-button-secondary"
                            style={{
                                width: '100%',
                                marginTop: 10
                            }}
                        >
                            Review Student Profile
                        </button>

                        <p
                            style={{
                                margin:
                                    '14px 0 0',
                                color:
                                    '#94a3b8',
                                fontSize: 12,
                                lineHeight:
                                    1.6,
                                textAlign:
                                    'center'
                            }}
                        >
                            Creating the application does
                            not submit it. You will review
                            and upload documents before final
                            submission.
                        </p>
                    </aside>

                </div>

            </div>

            {/* ========================================================
                RESPONSIVE STYLE
            ======================================================== */}

            <style>
                {`
                    @media (max-width: 900px) {
                        .portal-container > div[style*="grid-template-columns"] {
                            grid-template-columns: 1fr !important;
                        }

                        aside {
                            position: static !important;
                        }
                    }

                    @media (max-width: 600px) {
                        section[style*="padding: 24px"],
                        aside[style*="padding: 24px"] {
                            padding: 18px !important;
                        }

                        section div[style*="repeat(2"] {
                            grid-template-columns: 1fr !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

/* ============================================================
   READ ONLY FIELD
============================================================ */

const ReadOnlyField = ({
    label,
    value
}) => {
    return (
        <div>
            <div
                style={{
                    marginBottom: 6,
                    color: '#64748b',
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform:
                        'uppercase',
                    letterSpacing:
                        '0.04em'
                }}
            >
                {label}
            </div>

            <div
                style={{
                    minHeight: 42,
                    display: 'flex',
                    alignItems:
                        'center',
                    padding:
                        '10px 12px',
                    borderRadius: 8,
                    border:
                        '1px solid #e2e8f0',
                    background:
                        '#f8fafc',
                    color:
                        '#172033',
                    fontSize: 14
                }}
            >
                {value ||
                    'Not provided'}
            </div>
        </div>
    );
};

/* ============================================================
   INFO BOX
============================================================ */

const InfoBox = ({
    icon,
    label,
    value
}) => {
    return (
        <div
            style={{
                padding: 14,
                borderRadius: 9,
                border:
                    '1px solid #e2e8f0',
                background:
                    '#f8fafc'
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems:
                        'center',
                    gap: 7,
                    color:
                        '#64748b',
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 7
                }}
            >
                {icon}

                {label}
            </div>

            <div
                style={{
                    color:
                        '#172033',
                    fontSize: 15,
                    fontWeight: 700
                }}
            >
                {value}
            </div>
        </div>
    );
};

/* ============================================================
   CHECKLIST ITEM
============================================================ */

const ChecklistItem = ({
    text,
    completed
}) => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems:
                    'flex-start',
                gap: 9,
                color:
                    completed
                        ? '#334155'
                        : '#94a3b8',
                fontSize: 13,
                lineHeight: 1.5
            }}
        >
            <CheckCircle2
                size={17}
                color={
                    completed
                        ? '#15803d'
                        : '#cbd5e1'
                }
                style={{
                    flexShrink: 0,
                    marginTop: 1
                }}
            />

            <span>
                {text}
            </span>
        </div>
    );
};

/* ============================================================
   EXPORT
============================================================ */

export default ScholarshipApplication;