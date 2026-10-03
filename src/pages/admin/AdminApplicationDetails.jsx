import React, {
    useEffect,
    useState
} from 'react';

import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ShieldCheck,
    Clock3,
    FileText,
    User,
    GraduationCap,
    WalletCards,
    Building2,
    Loader2,
    ExternalLink
} from 'lucide-react';

import {
    useNavigate,
    useParams
} from 'react-router-dom';

import API from '../../services/api';
import authService from '../../services/authService';

const AdminApplicationDetails = () => {
    const {
        id
    } = useParams();

    const navigate =
        useNavigate();

    const [application, setApplication] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [actionLoading, setActionLoading] =
        useState(false);

    const [error, setError] =
        useState('');

    const [successMessage, setSuccessMessage] =
        useState('');

    const [correctionRemarks, setCorrectionRemarks] =
        useState('');

    const [verificationRemarks, setVerificationRemarks] =
        useState('');

    const [rejectionReason, setRejectionReason] =
        useState('');

    const token =
        authService.getToken();

    /* ========================================================
       FETCH APPLICATION
    ======================================================== */

    const fetchApplication = async () => {
        try {
            setLoading(true);
            setError('');

            const response =
                await API.get(
                    `/admin/applications/${id}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setApplication(
                response.data.application
            );

        } catch (error) {
            console.error(
                'Admin application details error:',
                error
            );

            if (
                error.response?.status === 401
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
                error.response?.data?.message ||
                'Unable to load application details.'
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplication();
    }, [id]);

    /* ========================================================
       STATUS HELPERS
    ======================================================== */

    const getStatusClass = (status) => {
        switch (status) {
            case 'SUBMITTED':
                return 'portal-status-info';

            case 'UNDER VERIFICATION':
                return 'portal-status-warning';

            case 'CORRECTION REQUIRED':
                return 'portal-status-danger';

            case 'RESUBMITTED':
                return 'portal-status-info';

            case 'VERIFIED':
                return 'portal-status-success';

            case 'SANCTIONED':
                return 'portal-status-success';

            case 'DISBURSED':
                return 'portal-status-success';

            case 'REJECTED':
                return 'portal-status-danger';

            case 'DRAFT':
                return 'portal-status-neutral';

            default:
                return 'portal-status-neutral';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'VERIFIED':
            case 'SANCTIONED':
            case 'DISBURSED':
                return (
                    <CheckCircle2
                        size={16}
                    />
                );

            case 'REJECTED':
            case 'CORRECTION REQUIRED':
                return (
                    <XCircle
                        size={16}
                    />
                );

            case 'UNDER VERIFICATION':
                return (
                    <ShieldCheck
                        size={16}
                    />
                );

            default:
                return (
                    <Clock3
                        size={16}
                    />
                );
        }
    };

    /* ========================================================
       ACTION HANDLER
    ======================================================== */

    const performAction = async (
        action,
        data = {}
    ) => {
        try {
            setActionLoading(true);
            setError('');
            setSuccessMessage('');

            const response =
                await API.put(
                    `/admin/applications/${id}/${action}`,
                    data,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setSuccessMessage(
                response.data.message ||
                'Application updated successfully.'
            );

            await fetchApplication();

            setCorrectionRemarks('');
            setVerificationRemarks('');
            setRejectionReason('');

        } catch (error) {
            console.error(
                'Admin application action error:',
                error
            );

            if (
                error.response?.status === 401
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
                error.response?.data?.message ||
                'Unable to update application.'
            );

        } finally {
            setActionLoading(false);
        }
    };

    /* ========================================================
       START VERIFICATION
    ======================================================== */

    const handleStartVerification = () => {
        performAction(
            'start-verification'
        );
    };

    /* ========================================================
       REQUEST CORRECTION
    ======================================================== */

    const handleRequestCorrection = () => {
        if (
            !correctionRemarks.trim()
        ) {
            setError(
                'Please enter correction remarks before requesting correction.'
            );

            return;
        }

        performAction(
            'request-correction',
            {
                correctionRemarks:
                    correctionRemarks.trim()
            }
        );
    };

    /* ========================================================
       VERIFY APPLICATION
    ======================================================== */

    const handleVerify = () => {
        performAction(
            'verify',
            {
                verificationRemarks:
                    verificationRemarks.trim()
            }
        );
    };

    /* ========================================================
       REJECT APPLICATION
    ======================================================== */

    const handleReject = () => {
        if (
            !rejectionReason.trim()
        ) {
            setError(
                'Please enter a rejection reason before rejecting the application.'
            );

            return;
        }

        const confirmed =
            window.confirm(
                'Are you sure you want to reject this scholarship application?'
            );

        if (!confirmed) {
            return;
        }

        performAction(
            'reject',
            {
                rejectionReason:
                    rejectionReason.trim()
            }
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f5f7fb'
                }}
            >
                <div
                    style={{
                        textAlign: 'center',
                        color: '#64748b'
                    }}
                >
                    <Loader2
                        size={34}
                        style={{
                            animation:
                                'adminApplicationSpin 1s linear infinite',
                            margin:
                                '0 auto 12px'
                        }}
                    />

                    <div
                        style={{
                            fontWeight: 600
                        }}
                    >
                        Loading application...
                    </div>
                </div>

                <style>
                    {`
                        @keyframes adminApplicationSpin {
                            from {
                                transform: rotate(0deg);
                            }

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
       ERROR / NO APPLICATION
    ======================================================== */

    if (
        error &&
        !application
    ) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    background: '#f5f7fb',
                    padding: '40px 20px'
                }}
            >
                <div
                    className="portal-container"
                    style={{
                        maxWidth: '900px'
                    }}
                >
                    <div
                        className="portal-card"
                        style={{
                            padding: '32px',
                            textAlign: 'center'
                        }}
                    >
                        <AlertCircle
                            size={42}
                            color="#b42318"
                            style={{
                                margin:
                                    '0 auto 14px'
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
                            Unable to Load Application
                        </h2>

                        <p
                            className="portal-text"
                            style={{
                                marginBottom:
                                    '24px'
                            }}
                        >
                            {error}
                        </p>

                        <button
                            className="portal-button portal-button-secondary"
                            onClick={() =>
                                navigate(
                                    '/admin/applications'
                                )
                            }
                        >
                            <ArrowLeft
                                size={17}
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

    if (!application) {
        return null;
    }

    const applicant =
        application.applicantDetails ||
        {};

    const scholarship =
        application.scholarship ||
        {};

    const student =
        application.student ||
        {};

    const documents =
        Array.isArray(
            application.documents
        )
            ? application.documents
            : [];

    const requiredDocuments =
        Array.isArray(
            scholarship.requiredDocuments
        )
            ? scholarship.requiredDocuments
            : [];

    const status =
        application.status;

    const canStartVerification =
        status === 'SUBMITTED' ||
        status === 'RESUBMITTED';

    const canReview =
        status === 'UNDER VERIFICATION';

    const canSanction =
        status === 'VERIFIED';

    const canDisburse =
        status === 'SANCTIONED';

    /* ========================================================
       MAIN PAGE
    ======================================================== */

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#f5f7fb',
                paddingBottom: '50px'
            }}
        >
            {/* =================================================
                HEADER
            ================================================= */}

            <header
                style={{
                    background: '#ffffff',
                    borderBottom:
                        '1px solid #e2e8f0',
                    position: 'sticky',
                    top: 0,
                    zIndex: 20
                }}
            >
                <div
                    className="portal-container"
                    style={{
                        maxWidth: '1280px',
                        minHeight: '76px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                            'space-between',
                        gap: '18px'
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
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '10px',
                                background:
                                    '#174a8b',
                                display: 'flex',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'center',
                                color: '#ffffff'
                            }}
                        >
                            <ShieldCheck
                                size={24}
                            />
                        </div>

                        <div>
                            <div
                                style={{
                                    fontFamily:
                                        "'Playfair Display', Georgia, serif",
                                    fontSize: '20px',
                                    fontWeight: 700,
                                    color:
                                        '#172033'
                                }}
                            >
                                Scholarship Administration
                            </div>

                            <div
                                style={{
                                    color:
                                        '#64748b',
                                    fontSize:
                                        '13px'
                                }}
                            >
                                Application Verification
                            </div>
                        </div>
                    </div>

                    <button
                        className="portal-button portal-button-secondary"
                        onClick={() =>
                            navigate(
                                '/admin/applications'
                            )
                        }
                    >
                        <ArrowLeft
                            size={17}
                            style={{
                                marginRight:
                                    '7px',
                                verticalAlign:
                                    'middle'
                            }}
                        />
                        Back
                    </button>
                </div>
            </header>

            <main
                className="portal-container"
                style={{
                    maxWidth: '1280px',
                    paddingTop: '28px'
                }}
            >
                {/* =================================================
                    PAGE TITLE
                ================================================= */}

                <div
                    style={{
                        marginBottom: '24px'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent:
                                'space-between',
                            alignItems:
                                'flex-start',
                            gap: '20px',
                            flexWrap:
                                'wrap'
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    color:
                                        '#174a8b',
                                    fontSize:
                                        '13px',
                                    fontWeight:
                                        700,
                                    textTransform:
                                        'uppercase',
                                    letterSpacing:
                                        '0.06em',
                                    marginBottom:
                                        '7px'
                                }}
                            >
                                Application Review
                            </div>

                            <h1
                                className="portal-heading"
                                style={{
                                    fontSize:
                                        '32px',
                                    marginBottom:
                                        '8px'
                                }}
                            >
                                Scholarship Application
                            </h1>

                            <p
                                className="portal-text"
                                style={{
                                    margin: 0
                                }}
                            >
                                Review the student's submitted
                                information and supporting documents.
                            </p>
                        </div>

                        <div
                            className={`portal-status ${getStatusClass(
                                status
                            )}`}
                            style={{
                                padding:
                                    '8px 13px',
                                fontSize:
                                    '13px'
                            }}
                        >
                            {getStatusIcon(
                                status
                            )}

                            <span
                                style={{
                                    marginLeft:
                                        '6px'
                                }}
                            >
                                {status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    MESSAGES
                ================================================= */}

                {successMessage && (
                    <div
                        style={{
                            background:
                                '#ecfdf3',
                            border:
                                '1px solid #bbf7d0',
                            color:
                                '#166534',
                            borderRadius:
                                '10px',
                            padding:
                                '13px 16px',
                            marginBottom:
                                '18px',
                            display: 'flex',
                            alignItems:
                                'center',
                            gap: '9px',
                            fontWeight:
                                600
                        }}
                    >
                        <CheckCircle2
                            size={19}
                        />

                        {successMessage}
                    </div>
                )}

                {error && (
                    <div
                        style={{
                            background:
                                '#fff1f2',
                            border:
                                '1px solid #fecdd3',
                            color:
                                '#991b1b',
                            borderRadius:
                                '10px',
                            padding:
                                '13px 16px',
                            marginBottom:
                                '18px',
                            display: 'flex',
                            alignItems:
                                'center',
                            gap: '9px',
                            fontWeight:
                                600
                        }}
                    >
                        <AlertCircle
                            size={19}
                        />

                        {error}
                    </div>
                )}

                {/* =================================================
                    APPLICATION IDENTIFICATION
                ================================================= */}

                <div
                    className="portal-card"
                    style={{
                        padding: '22px',
                        marginBottom:
                            '18px'
                    }}
                >
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '20px'
                        }}
                    >
                        <InfoItem
                            label="Application Number"
                            value={
                                application.applicationNumber ||
                                'Not generated'
                            }
                        />

                        <InfoItem
                            label="Application Status"
                            value={
                                status
                            }
                        />

                        <InfoItem
                            label="Submitted On"
                            value={
                                application.submittedAt
                                    ? new Date(
                                          application.submittedAt
                                      ).toLocaleString()
                                    : 'Not available'
                            }
                        />

                        <InfoItem
                            label="Last Updated"
                            value={
                                application.updatedAt
                                    ? new Date(
                                          application.updatedAt
                                      ).toLocaleString()
                                    : 'Not available'
                            }
                        />
                    </div>
                </div>

                {/* =================================================
                    TWO COLUMN CONTENT
                ================================================= */}

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'minmax(0, 1.35fr) minmax(320px, 0.65fr)',
                        gap: '18px',
                        alignItems:
                            'start'
                    }}
                >
                    <div>
                        {/* =========================================
                            APPLICANT DETAILS
                        ========================================= */}

                        <SectionCard
                            icon={
                                <User
                                    size={20}
                                />
                            }
                            title="Applicant Information"
                        >
                            <DetailGrid>
                                <InfoItem
                                    label="Full Name"
                                    value={
                                        applicant.fullName ||
                                        student.name ||
                                        'Not provided'
                                    }
                                />

                                <InfoItem
                                    label="Registration Number"
                                    value={
                                        applicant.registrationNumber ||
                                        'Not provided'
                                    }
                                />

                                <InfoItem
                                    label="Email"
                                    value={
                                        student.email ||
                                        'Not provided'
                                    }
                                />

                                <InfoItem
                                    label="Mobile"
                                    value={
                                        applicant.mobile ||
                                        student.mobile ||
                                        'Not provided'
                                    }
                                />

                                <InfoItem
                                    label="Gender"
                                    value={
                                        applicant.gender ||
                                        'Not provided'
                                    }
                                />

                                <InfoItem
                                    label="Date of Birth"
                                    value={
                                        applicant.dateOfBirth
                                            ? new Date(
                                                  applicant.dateOfBirth
                                              ).toLocaleDateString()
                                            : 'Not provided'
                                    }
                                />

                                <InfoItem
                                    label="Category"
                                    value={
                                        applicant.category ||
                                        'Not provided'
                                    }
                                />

                                <InfoItem
                                    label="State"
                                    value={
                                        applicant.state ||
                                        'Not provided'
                                    }
                                />

                                <InfoItem
                                    label="Address"
                                    value={
                                        applicant.address ||
                                        'Not provided'
                                    }
                                    fullWidth
                                />
                            </DetailGrid>
                        </SectionCard>

                        {/* =========================================
                            ACADEMIC DETAILS
                        ========================================= */}

                        <SectionCard
                            icon={
                                <GraduationCap
                                    size={20}
                                />
                            }
                            title="Academic Information"
                        >
                            <DetailGrid>
                                <InfoItem
                                    label="Course"
                                    value={
                                        applicant.course ||
                                        'Not provided'
                                    }
                                />

                                <InfoItem
                                    label="Department"
                                    value={
                                        applicant.department ||
                                        'Not provided'
                                    }
                                />

                                <InfoItem
                                    label="Academic Year"
                                    value={
                                        applicant.academicYear ||
                                        'Not provided'
                                    }
                                />

                                <InfoItem
                                    label="Current Semester"
                                    value={
                                        applicant.currentSemester ??
                                        'Not provided'
                                    }
                                />

                                <InfoItem
                                    label="Previous Qualification"
                                    value={
                                        applicant.previousQualification ||
                                        'Not provided'
                                    }
                                />

                                <InfoItem
                                    label="Previous Percentage"
                                    value={
                                        applicant.previousPercentage !==
                                        null &&
                                        applicant.previousPercentage !==
                                        undefined
                                            ? `${applicant.previousPercentage}%`
                                            : 'Not provided'
                                    }
                                />
                            </DetailGrid>
                        </SectionCard>

                        {/* =========================================
                            FINANCIAL DETAILS
                        ========================================= */}

                        <SectionCard
                            icon={
                                <WalletCards
                                    size={20}
                                />
                            }
                            title="Financial Information"
                        >
                            <DetailGrid>
                                <InfoItem
                                    label="Family Income"
                                    value={
                                        applicant.familyIncome !==
                                            null &&
                                        applicant.familyIncome !==
                                            undefined
                                            ? `₹${Number(
                                                  applicant.familyIncome
                                              ).toLocaleString(
                                                  'en-IN'
                                              )}`
                                            : 'Not provided'
                                    }
                                />
                            </DetailGrid>
                        </SectionCard>

                        {/* =========================================
                            BANK DETAILS
                        ========================================= */}

                        <SectionCard
                            icon={
                                <Building2
                                    size={20}
                                />
                            }
                            title="Bank Information"
                        >
                            <DetailGrid>
                                <InfoItem
                                    label="Bank Name"
                                    value={
                                        applicant.bankName ||
                                        'Not provided'
                                    }
                                />

                                <InfoItem
                                    label="Account Number"
                                    value={
                                        applicant.bankAccountNumber ||
                                        'Not provided'
                                    }
                                />

                                <InfoItem
                                    label="IFSC Code"
                                    value={
                                        applicant.ifscCode ||
                                        'Not provided'
                                    }
                                />
                            </DetailGrid>
                        </SectionCard>

                        {/* =========================================
                            DOCUMENTS
                        ========================================= */}

                        <SectionCard
                            icon={
                                <FileText
                                    size={20}
                                />
                            }
                            title="Supporting Documents"
                        >
                            {requiredDocuments.length >
                            0 && (
                                <div
                                    style={{
                                        marginBottom:
                                            '16px',
                                        color:
                                            '#64748b',
                                        fontSize:
                                            '14px'
                                    }}
                                >
                                    Required documents:{' '}
                                    {
                                        requiredDocuments.length
                                    }
                                </div>
                            )}

                            <div
                                style={{
                                    display:
                                        'grid',
                                    gap:
                                        '10px'
                                }}
                            >
                                {documents.length >
                                0 ? (
                                    documents.map(
                                        (
                                            document,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    `${document.documentType}-${index}`
                                                }
                                                style={{
                                                    border:
                                                        '1px solid #e2e8f0',
                                                    borderRadius:
                                                        '10px',
                                                    padding:
                                                        '14px',
                                                    display:
                                                        'flex',
                                                    alignItems:
                                                        'center',
                                                    justifyContent:
                                                        'space-between',
                                                    gap:
                                                        '12px',
                                                    flexWrap:
                                                        'wrap'
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display:
                                                            'flex',
                                                        alignItems:
                                                            'center',
                                                        gap:
                                                            '11px'
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width:
                                                                '38px',
                                                            height:
                                                                '38px',
                                                            borderRadius:
                                                                '8px',
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
                                                        <FileText
                                                            size={
                                                                19
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <div
                                                            style={{
                                                                fontWeight:
                                                                    700,
                                                                color:
                                                                    '#172033'
                                                            }}
                                                        >
                                                            {
                                                                document.documentType
                                                            }
                                                        </div>

                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    '13px',
                                                                color:
                                                                    '#64748b',
                                                                marginTop:
                                                                    '3px'
                                                            }}
                                                        >
                                                            {
                                                                document.fileName
                                                            }
                                                        </div>
                                                    </div>
                                                </div>

                                                <a
                                                    href={
                                                        document.fileUrl
                                                            ? `http://localhost:5000${document.fileUrl}`
                                                            : '#'
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="portal-button portal-button-secondary"
                                                    style={{
                                                        display:
                                                            'inline-flex',
                                                        alignItems:
                                                            'center',
                                                        gap:
                                                            '7px'
                                                    }}
                                                >
                                                    <ExternalLink
                                                        size={
                                                            16
                                                        }
                                                    />
                                                    View Document
                                                </a>
                                            </div>
                                        )
                                    )
                                ) : (
                                    <div
                                        style={{
                                            padding:
                                                '24px',
                                            textAlign:
                                                'center',
                                            border:
                                                '1px dashed #cbd5e1',
                                            borderRadius:
                                                '10px',
                                            color:
                                                '#64748b'
                                        }}
                                    >
                                        No documents have been uploaded.
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    </div>

                    {/* =================================================
                        RIGHT SIDEBAR
                    ================================================= */}

                    <aside>
                        {/* =========================================
                            SCHOLARSHIP DETAILS
                        ========================================= */}

                        <SectionCard
                            icon={
                                <GraduationCap
                                    size={20}
                                />
                            }
                            title="Scholarship"
                        >
                            <div
                                style={{
                                    marginBottom:
                                        '16px'
                                }}
                            >
                                <div
                                    style={{
                                        fontSize:
                                            '18px',
                                        fontWeight:
                                            700,
                                        color:
                                            '#172033',
                                        marginBottom:
                                            '6px'
                                    }}
                                >
                                    {
                                        scholarship.name
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
                                        scholarship.description ||
                                        'No description available.'
                                    }
                                </div>
                            </div>

                            <div
                                style={{
                                    display:
                                        'grid',
                                    gap:
                                        '12px'
                                }}
                            >
                                <InfoItem
                                    label="Academic Year"
                                    value={
                                        scholarship.academicYear ||
                                        'Not provided'
                                    }
                                />

                                <InfoItem
                                    label="Scholarship Amount"
                                    value={
                                        scholarship.scholarshipAmount !==
                                        undefined
                                            ? `₹${Number(
                                                  scholarship.scholarshipAmount
                                              ).toLocaleString(
                                                  'en-IN'
                                              )}`
                                            : 'Not provided'
                                    }
                                />

                                <InfoItem
                                    label="Minimum Percentage"
                                    value={
                                        scholarship.minimumPercentage !==
                                        undefined
                                            ? `${scholarship.minimumPercentage}%`
                                            : 'Not specified'
                                    }
                                />

                                <InfoItem
                                    label="Maximum Family Income"
                                    value={
                                        scholarship.maximumFamilyIncome !==
                                            null &&
                                        scholarship.maximumFamilyIncome !==
                                            undefined
                                            ? `₹${Number(
                                                  scholarship.maximumFamilyIncome
                                              ).toLocaleString(
                                                  'en-IN'
                                              )}`
                                            : 'No limit'
                                    }
                                />
                            </div>
                        </SectionCard>

                        {/* =========================================
                            CORRECTION REMARKS
                        ========================================= */}

                        {application.correctionRemarks && (
                            <SectionCard
                                icon={
                                    <AlertCircle
                                        size={20}
                                    />
                                }
                                title="Correction Remarks"
                            >
                                <div
                                    style={{
                                        background:
                                            '#fff7ed',
                                        border:
                                            '1px solid #fed7aa',
                                        borderRadius:
                                            '9px',
                                        padding:
                                            '13px',
                                        color:
                                            '#9a3412',
                                        lineHeight:
                                            1.6,
                                        fontSize:
                                            '14px'
                                    }}
                                >
                                    {
                                        application.correctionRemarks
                                    }
                                </div>
                            </SectionCard>
                        )}

                        {/* =========================================
                            VERIFICATION REMARKS
                        ========================================= */}

                        {application.verificationRemarks && (
                            <SectionCard
                                icon={
                                    <CheckCircle2
                                        size={20}
                                    />
                                }
                                title="Verification Remarks"
                            >
                                <div
                                    style={{
                                        background:
                                            '#ecfdf3',
                                        border:
                                            '1px solid #bbf7d0',
                                        borderRadius:
                                            '9px',
                                        padding:
                                            '13px',
                                        color:
                                            '#166534',
                                        lineHeight:
                                            1.6,
                                        fontSize:
                                            '14px'
                                    }}
                                >
                                    {
                                        application.verificationRemarks
                                    }
                                </div>
                            </SectionCard>
                        )}

                        {/* =========================================
                            REJECTION REASON
                        ========================================= */}

                        {application.rejectionReason && (
                            <SectionCard
                                icon={
                                    <XCircle
                                        size={20}
                                    />
                                }
                                title="Rejection Reason"
                            >
                                <div
                                    style={{
                                        background:
                                            '#fff1f2',
                                        border:
                                            '1px solid #fecdd3',
                                        borderRadius:
                                            '9px',
                                        padding:
                                            '13px',
                                        color:
                                            '#991b1b',
                                        lineHeight:
                                            1.6,
                                        fontSize:
                                            '14px'
                                    }}
                                >
                                    {
                                        application.rejectionReason
                                    }
                                </div>
                            </SectionCard>
                        )}

                        {/* =========================================
                            ADMIN ACTIONS
                        ========================================= */}

                        {(canStartVerification ||
                            canReview ||
                            canSanction ||
                            canDisburse) && (
                            <SectionCard
                                icon={
                                    <ShieldCheck
                                        size={20}
                                    />
                                }
                                title="Administrative Actions"
                            >
                                {canStartVerification && (
                                    <button
                                        className="portal-button portal-button-primary"
                                        onClick={
                                            handleStartVerification
                                        }
                                        disabled={
                                            actionLoading
                                        }
                                        style={{
                                            width:
                                                '100%',
                                            marginBottom:
                                                '12px',
                                            opacity:
                                                actionLoading
                                                    ? 0.65
                                                    : 1
                                        }}
                                    >
                                        {actionLoading ? (
                                            <Loader2
                                                size={
                                                    17
                                                }
                                                style={{
                                                    marginRight:
                                                        '7px',
                                                    verticalAlign:
                                                        'middle',
                                                    animation:
                                                        'adminApplicationSpin 1s linear infinite'
                                                }}
                                            />
                                        ) : (
                                            <ShieldCheck
                                                size={
                                                    17
                                                }
                                                style={{
                                                    marginRight:
                                                        '7px',
                                                    verticalAlign:
                                                        'middle'
                                                }}
                                            />
                                        )}

                                        Start Verification
                                    </button>
                                )}

                                {canReview && (
                                    <>
                                        <div
                                            style={{
                                                marginBottom:
                                                    '14px'
                                            }}
                                        >
                                            <label
                                                className="portal-label"
                                            >
                                                Correction Remarks
                                            </label>

                                            <textarea
                                                className="portal-textarea"
                                                value={
                                                    correctionRemarks
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setCorrectionRemarks(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Enter what the student needs to correct..."
                                            />
                                        </div>

                                        <button
                                            className="portal-button portal-button-secondary"
                                            onClick={
                                                handleRequestCorrection
                                            }
                                            disabled={
                                                actionLoading
                                            }
                                            style={{
                                                width:
                                                    '100%',
                                                marginBottom:
                                                    '18px',
                                                color:
                                                    '#92400e',
                                                background:
                                                    '#fef3c7',
                                                opacity:
                                                    actionLoading
                                                        ? 0.65
                                                        : 1
                                            }}
                                        >
                                            <AlertCircle
                                                size={
                                                    17
                                                }
                                                style={{
                                                    marginRight:
                                                        '7px',
                                                    verticalAlign:
                                                        'middle'
                                                }}
                                            />
                                            Request Correction
                                        </button>

                                        <div
                                            style={{
                                                marginBottom:
                                                    '14px'
                                            }}
                                        >
                                            <label
                                                className="portal-label"
                                            >
                                                Verification Remarks
                                            </label>

                                            <textarea
                                                className="portal-textarea"
                                                value={
                                                    verificationRemarks
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setVerificationRemarks(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Optional verification remarks..."
                                            />
                                        </div>

                                        <button
                                            className="portal-button portal-button-primary"
                                            onClick={
                                                handleVerify
                                            }
                                            disabled={
                                                actionLoading
                                            }
                                            style={{
                                                width:
                                                    '100%',
                                                marginBottom:
                                                    '12px',
                                                opacity:
                                                    actionLoading
                                                        ? 0.65
                                                        : 1
                                            }}
                                        >
                                            <CheckCircle2
                                                size={
                                                    17
                                                }
                                                style={{
                                                    marginRight:
                                                        '7px',
                                                    verticalAlign:
                                                        'middle'
                                                }}
                                            />
                                            Verify Application
                                        </button>

                                        <div
                                            style={{
                                                marginBottom:
                                                    '14px'
                                            }}
                                        >
                                            <label
                                                className="portal-label"
                                            >
                                                Rejection Reason
                                            </label>

                                            <textarea
                                                className="portal-textarea"
                                                value={
                                                    rejectionReason
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setRejectionReason(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Enter the reason for rejection..."
                                            />
                                        </div>

                                        <button
                                            className="portal-button portal-button-danger"
                                            onClick={
                                                handleReject
                                            }
                                            disabled={
                                                actionLoading
                                            }
                                            style={{
                                                width:
                                                    '100%',
                                                opacity:
                                                    actionLoading
                                                        ? 0.65
                                                        : 1
                                            }}
                                        >
                                            <XCircle
                                                size={
                                                    17
                                                }
                                                style={{
                                                    marginRight:
                                                        '7px',
                                                    verticalAlign:
                                                        'middle'
                                                }}
                                            />
                                            Reject Application
                                        </button>
                                    </>
                                )}

                                {canSanction && (
                                    <button
                                        className="portal-button portal-button-primary"
                                        onClick={() =>
                                            performAction(
                                                'sanction'
                                            )
                                        }
                                        disabled={
                                            actionLoading
                                        }
                                        style={{
                                            width:
                                                '100%',
                                            opacity:
                                                actionLoading
                                                    ? 0.65
                                                    : 1
                                        }}
                                    >
                                        <CheckCircle2
                                            size={
                                                17
                                            }
                                            style={{
                                                marginRight:
                                                    '7px',
                                                verticalAlign:
                                                    'middle'
                                            }}
                                        />
                                        Sanction Application
                                    </button>
                                )}

                                {canDisburse && (
                                    <button
                                        className="portal-button portal-button-primary"
                                        onClick={() =>
                                            performAction(
                                                'disburse'
                                            )
                                        }
                                        disabled={
                                            actionLoading
                                        }
                                        style={{
                                            width:
                                                '100%',
                                            opacity:
                                                actionLoading
                                                    ? 0.65
                                                    : 1
                                        }}
                                    >
                                        <WalletCards
                                            size={
                                                17
                                            }
                                            style={{
                                                marginRight:
                                                    '7px',
                                                verticalAlign:
                                                    'middle'
                                            }}
                                        />
                                        Mark as Disbursed
                                    </button>
                                )}
                            </SectionCard>
                        )}

                        {/* =========================================
                            SYSTEM INFORMATION
                        ========================================= */}

                        <SectionCard
                            icon={
                                <Clock3
                                    size={20}
                                />
                            }
                            title="Application Timeline"
                        >
                            <TimelineItem
                                label="Created"
                                date={
                                    application.createdAt
                                }
                            />

                            <TimelineItem
                                label="Submitted"
                                date={
                                    application.submittedAt
                                }
                            />

                            <TimelineItem
                                label="Verified"
                                date={
                                    application.verifiedAt
                                }
                            />

                            <TimelineItem
                                label="Sanctioned"
                                date={
                                    application.sanctionedAt
                                }
                            />

                            <TimelineItem
                                label="Disbursed"
                                date={
                                    application.disbursedAt
                                }
                            />
                        </SectionCard>
                    </aside>
                </div>
            </main>

            <style>
                {`
                    @media (max-width: 900px) {
                        .portal-container > div[style*="grid-template-columns"] {
                            grid-template-columns: 1fr !important;
                        }
                    }

                    @media (max-width: 600px) {
                        h1 {
                            font-size: 26px !important;
                        }
                    }

                    @keyframes adminApplicationSpin {
                        from {
                            transform: rotate(0deg);
                        }

                        to {
                            transform: rotate(360deg);
                        }
                    }
                `}
            </style>
        </div>
    );
};

/* ============================================================
   REUSABLE SECTION CARD
============================================================ */

const SectionCard = ({
    icon,
    title,
    children
}) => {
    return (
        <div
            className="portal-card"
            style={{
                padding: '20px',
                marginBottom: '18px'
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    marginBottom: '18px',
                    paddingBottom: '13px',
                    borderBottom:
                        '1px solid #e2e8f0',
                    color: '#174a8b'
                }}
            >
                {icon}

                <h2
                    style={{
                        margin: 0,
                        fontSize: '17px',
                        fontWeight: 700,
                        color: '#172033'
                    }}
                >
                    {title}
                </h2>
            </div>

            {children}
        </div>
    );
};

/* ============================================================
   DETAIL GRID
============================================================ */

const DetailGrid = ({
    children
}) => {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns:
                    'repeat(auto-fit, minmax(190px, 1fr))',
                gap: '18px'
            }}
        >
            {children}
        </div>
    );
};

/* ============================================================
   INFO ITEM
============================================================ */

const InfoItem = ({
    label,
    value,
    fullWidth = false
}) => {
    return (
        <div
            style={{
                gridColumn:
                    fullWidth
                        ? '1 / -1'
                        : 'auto'
            }}
        >
            <div
                style={{
                    fontSize: '12px',
                    color: '#64748b',
                    fontWeight: 600,
                    marginBottom: '5px',
                    textTransform:
                        'uppercase',
                    letterSpacing:
                        '0.03em'
                }}
            >
                {label}
            </div>

            <div
                style={{
                    color: '#172033',
                    fontWeight: 600,
                    lineHeight: 1.5,
                    wordBreak:
                        'break-word'
                }}
            >
                {value}
            </div>
        </div>
    );
};

/* ============================================================
   TIMELINE ITEM
============================================================ */

const TimelineItem = ({
    label,
    date
}) => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent:
                    'space-between',
                gap: '12px',
                padding:
                    '10px 0',
                borderBottom:
                    '1px solid #f1f5f9'
            }}
        >
            <span
                style={{
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '14px'
                }}
            >
                {label}
            </span>

            <span
                style={{
                    color: '#64748b',
                    fontSize: '13px',
                    textAlign:
                        'right'
                }}
            >
                {date
                    ? new Date(
                          date
                      ).toLocaleString()
                    : '—'}
            </span>
        </div>
    );
};

export default AdminApplicationDetails;