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
    Trash2
} from 'lucide-react';

import {
    useNavigate,
    useParams
} from 'react-router-dom';

import API from '../../services/api';
import authService from '../../services/authService';
import AdminDeletionDialog from '../../components/admin/AdminDeletionDialog';

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

    const [viewingDocumentId, setViewingDocumentId] =
        useState(null);

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

    const [deletionOpen, setDeletionOpen] = useState(false);

    /* ========================================================
       FETCH APPLICATION
    ======================================================== */

    const fetchApplication = async () => {
        try {
            setLoading(true);
            setError('');

            const currentToken =
                authService.getToken();

            if (!currentToken) {
                authService.logout();

                navigate(
                    '/admin/login',
                    {
                        replace: true
                    }
                );

                return;
            }

            const response =
                await API.get(
                    `/admin/applications/${id}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${currentToken}`
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
                    '/admin/login',
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
       VIEW DOCUMENT
       PRODUCTION-SAFE AUTHENTICATED DOCUMENT VIEWER
    ======================================================== */

    const handleViewDocument = async (
        document
    ) => {
        if (
            !document ||
            !document._id
        ) {
            setError(
                'Unable to open this document.'
            );

            return;
        }

        /*
         * Prevent multiple document windows
         * from being opened for the same click.
         */
        if (
            viewingDocumentId
        ) {
            return;
        }

        const currentToken =
            authService.getToken();

        if (!currentToken) {
            authService.logout();

            navigate(
                '/admin/login',
                {
                    replace: true
                }
            );

            return;
        }

        /*
         * Open exactly one temporary window.
         *
         * We do this immediately inside the click
         * event so browsers do not block it.
         */
        const documentWindow =
            window.open(
                '',
                '_blank'
            );

        if (!documentWindow) {
            setError(
                'Your browser blocked the document window. Please allow pop-ups for this portal and try again.'
            );

            return;
        }

        /*
         * Show a loading page in the new window.
         */
        try {
            documentWindow.document.title =
                'Scholarship Document';

            documentWindow.document.body.innerHTML = `
                <div style="
                    margin: 0;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f8fafc;
                    font-family: Arial, sans-serif;
                    color: #334155;
                    text-align: center;
                    padding: 24px;
                    box-sizing: border-box;
                ">
                    <div>
                        <div style="
                            font-size: 20px;
                            font-weight: 700;
                            margin-bottom: 8px;
                        ">
                            Opening document...
                        </div>

                        <div style="
                            font-size: 14px;
                            color: #64748b;
                        ">
                            Please wait while the secure document is loaded.
                        </div>
                    </div>
                </div>
            `;
        } catch (windowError) {
            console.error(
                'Unable to prepare document window:',
                windowError
            );
        }

        try {
            setViewingDocumentId(
                document._id
            );

            setError('');

            /*
             * IMPORTANT:
             *
             * Do NOT build a localhost URL.
             *
             * API already knows whether the application
             * is running locally or on Vercel through
             * VITE_API_URL.
             */
            const response =
                await API.get(
                    `/applications/${encodeURIComponent(
                        id
                    )}/documents/${encodeURIComponent(
                        document._id
                    )}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${currentToken}`
                        },
                        responseType:
                            'blob'
                    }
                );

            /*
             * Axios may still return a Blob even when
             * the backend sends an error response.
             *
             * Check the content type before displaying it.
             */
            const responseContentType =
                response.headers[
                    'content-type'
                ] || '';

            if (
                responseContentType.includes(
                    'application/json'
                )
            ) {
                let serverMessage =
                    'Unable to open the document.';

                try {
                    const text =
                        await response.data.text();

                    const parsed =
                        JSON.parse(text);

                    serverMessage =
                        parsed.message ||
                        serverMessage;

                } catch (
                    parseError
                ) {
                    console.error(
                        'Unable to parse document error response:',
                        parseError
                    );
                }

                throw new Error(
                    serverMessage
                );
            }

            if (
                !response.data ||
                response.data.size === 0
            ) {
                throw new Error(
                    'The server returned an empty document.'
                );
            }

            /*
             * Only allow the document types that
             * the backend supports.
             */
            const allowedContentTypes = [
                'application/pdf',
                'image/jpeg',
                'image/png'
            ];

            let contentType =
                responseContentType
                    .split(';')[0]
                    .trim()
                    .toLowerCase();

            if (
                !allowedContentTypes.includes(
                    contentType
                )
            ) {
                /*
                 * Some environments may omit the
                 * response content type.
                 *
                 * In that case use the type stored
                 * with the document.
                 */
                contentType =
                    document.contentType ||
                    'application/octet-stream';
            }

            const blob =
                new Blob(
                    [
                        response.data
                    ],
                    {
                        type:
                            contentType
                    }
                );

            const documentUrl =
                window.URL.createObjectURL(
                    blob
                );

            /*
             * Navigate the SAME temporary window.
             *
             * No second window is created.
             */
            documentWindow.location.replace(
                documentUrl
            );

            /*
             * Keep the URL alive for the document
             * viewer. Revoke it later.
             */
            window.setTimeout(
                () => {
                    window.URL.revokeObjectURL(
                        documentUrl
                    );
                },
                5 * 60 * 1000
            );

        } catch (error) {
            console.error(
                'Admin document viewing error:',
                error
            );

            /*
             * Close only the temporary window
             * created by this click.
             */
            try {
                if (
                    documentWindow &&
                    !documentWindow.closed
                ) {
                    documentWindow.close();
                }
            } catch (
                closeError
            ) {
                console.error(
                    'Unable to close document window:',
                    closeError
                );
            }

            if (
                error.response?.status === 401
            ) {
                authService.logout();

                navigate(
                    '/admin/login',
                    {
                        replace: true
                    }
                );

                return;
            }

            if (
                error.response?.status === 403
            ) {
                setError(
                    'You are not authorized to view this document.'
                );

                return;
            }

            if (
                error.response?.status === 404
            ) {
                setError(
                    'The requested document could not be found.'
                );

                return;
            }

            if (
                error.response?.status === 410
            ) {
                setError(
                    'This document belongs to an older storage system and is no longer available.'
                );

                return;
            }

            if (
                error.response?.status === 502
            ) {
                setError(
                    'The secure document storage service could not be reached. Please try again.'
                );

                return;
            }

            setError(
                error.message ||
                error.response?.data?.message ||
                'Unable to open the document. Please try again.'
            );

        } finally {
            setViewingDocumentId(
                null
            );
        }
    };

    /* ========================================================
       STATUS HELPERS
    ======================================================== */

    const getStatusClass = (
        status
    ) => {
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
            case 'SANCTIONED':
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

    const getStatusIcon = (
        status
    ) => {
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

            const currentToken =
                authService.getToken();

            if (!currentToken) {
                authService.logout();

                navigate(
                    '/admin/login',
                    {
                        replace: true
                    }
                );

                return;
            }

            const response =
                await API.put(
                    `/admin/applications/${id}/${action}`,
                    data,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${currentToken}`
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
                    '/admin/login',
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

    const handleStartVerification =
        () => {
            performAction(
                'start-verification'
            );
        };

    /* ========================================================
       REQUEST CORRECTION
    ======================================================== */

    const handleRequestCorrection =
        () => {
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
                                'adminApplicationSpin 1s linear infinite',
                            margin:
                                '0 auto 12px'
                        }}
                    />

                    <div
                        style={{
                            fontWeight:
                                600
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
                    style={{
                        maxWidth:
                            '900px'
                    }}
                >
                    <div
                        className="portal-card"
                        style={{
                            padding:
                                '32px',
                            textAlign:
                                'center'
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
                                fontSize:
                                    '26px',
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
                minHeight:
                    '100vh',
                background:
                    '#f5f7fb',
                paddingBottom:
                    '50px'
            }}
        >
            {/* HEADER */}

            <header
                style={{
                    background:
                        '#ffffff',
                    borderBottom:
                        '1px solid #e2e8f0',
                    position:
                        'sticky',
                    top: 0,
                    zIndex: 20
                }}
            >
                <div
                    className="portal-container"
                    style={{
                        maxWidth:
                            '1280px',
                        minHeight:
                            '76px',
                        display:
                            'flex',
                        alignItems:
                            'center',
                        justifyContent:
                            'space-between',
                        gap:
                            '18px'
                    }}
                >
                    <div
                        style={{
                            display:
                                'flex',
                            alignItems:
                                'center',
                            gap:
                                '14px'
                        }}
                    >
                        <div
                            style={{
                                width:
                                    '44px',
                                height:
                                    '44px',
                                borderRadius:
                                    '10px',
                                background:
                                    '#174a8b',
                                display:
                                    'flex',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'center',
                                color:
                                    '#ffffff'
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
                                    fontSize:
                                        '20px',
                                    fontWeight:
                                        700,
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

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {application && <button type="button" className="portal-button" onClick={() => setDeletionOpen(true)} style={{ background: '#b91c1c', color: '#fff' }}>
                        <Trash2 size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Delete application
                    </button>}
                    <button
                        className="portal-button portal-button-secondary"
                        onClick={() => navigate('/admin/applications')}
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
                </div>
            </header>

            <main
                className="portal-container"
                style={{
                    maxWidth:
                        '1280px',
                    paddingTop:
                        '28px'
                }}
            >
                {/* PAGE TITLE */}

                <div
                    style={{
                        marginBottom:
                            '24px'
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
                                    margin:
                                        0
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

                {/* MESSAGES */}

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
                            display:
                                'flex',
                            alignItems:
                                'center',
                            gap:
                                '9px',
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
                            display:
                                'flex',
                            alignItems:
                                'center',
                            gap:
                                '9px',
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

                {/* APPLICATION IDENTIFICATION */}

                <div
                    className="portal-card"
                    style={{
                        padding:
                            '22px',
                        marginBottom:
                            '18px'
                    }}
                >
                    <div
                        style={{
                            display:
                                'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(220px, 1fr))',
                            gap:
                                '20px'
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

                {/* TWO COLUMN CONTENT */}

                <div
                    style={{
                        display:
                            'grid',
                        gridTemplateColumns:
                            'minmax(0, 1.35fr) minmax(320px, 0.65fr)',
                        gap:
                            '18px',
                        alignItems:
                            'start'
                    }}
                >
                    <div>
                        {/* APPLICANT */}

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

                                {[
                                    ['Student ID', applicant.studentId || student.studentId],
                                    ['Application Type', applicant.applicationType],
                                    ["Father's Name", applicant.fatherName],
                                    ["Mother's Name", applicant.motherName],
                                    ['Religion', applicant.religion],
                                    ['Special Category', applicant.specialCategory],
                                    ['Aadhaar (masked)', applicant.aadhaarNumber],
                                    ['De-Notified Tribes', applicant.deNotifiedTribes],
                                    ['Tribes', applicant.tribes]
                                ].map(([label, value]) => (
                                    <InfoItem key={label} label={label} value={value || 'Not provided'} />
                                ))}

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

                        {/* ACADEMIC */}

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

                                {[
                                    ['Institute', applicant.institute],
                                    ['Tehsil', applicant.tehsil],
                                    ['Hosteller', applicant.hosteller],
                                    ['10th Class Board', applicant.class10Board],
                                    ['10th Class Session', applicant.class10Session],
                                    ['10th Class Roll Number', applicant.class10RollNumber],
                                    ['Enrollment', applicant.enrollment],
                                    ['Admission Date', applicant.admissionDate ? new Date(applicant.admissionDate).toLocaleDateString() : ''],
                                    ['Attendance', applicant.attendance !== null && applicant.attendance !== undefined ? `${applicant.attendance}%` : ''],
                                    ['Admit Card', applicant.admitCard],
                                    ['Examination Year', applicant.examinationYear],
                                    ['Promoted', applicant.promoted]
                                ].map(([label, value]) => (
                                    <InfoItem key={label} label={label} value={value || 'Not provided'} />
                                ))}
                            </DetailGrid>
                        </SectionCard>

                        <SectionCard
                            icon={<FileText size={20} />}
                            title="Contact Information"
                        >
                            <DetailGrid>
                                <InfoItem label="Correspondence Address" value={applicant.correspondenceAddress || 'Not provided'} fullWidth />
                                <InfoItem label="Permanent Address" value={applicant.permanentAddress || 'Not provided'} fullWidth />
                                <InfoItem label="Contact Numbers" value={applicant.contactNumbers || applicant.mobile || 'Not provided'} />
                                <InfoItem label="Email Address" value={applicant.emailAddress || student.email || 'Not provided'} />
                            </DetailGrid>
                        </SectionCard>

                        {/* FINANCIAL */}

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

                        {/* BANK */}

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

                                <InfoItem label="Bank Address" value={applicant.bankAddress || 'Not provided'} fullWidth />
                                <InfoItem label="Bank Branch Name" value={applicant.bankBranchName || 'Not provided'} />
                            </DetailGrid>
                        </SectionCard>

                        <SectionCard
                            icon={<ShieldCheck size={20} />}
                            title="Declaration"
                        >
                            <InfoItem
                                label="Student Declaration"
                                value={applicant.declarationAccepted ? 'Accepted' : 'Not accepted'}
                                fullWidth
                            />
                        </SectionCard>

                        {/* DOCUMENTS */}

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
                                        ) => {
                                            const documentId =
                                                document._id ||
                                                `${document.documentType}-${index}`;

                                            const isViewing =
                                                viewingDocumentId ===
                                                documentId;

                                            return (
                                                <div
                                                    key={
                                                        documentId
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

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleViewDocument(
                                                                document
                                                            )
                                                        }
                                                        disabled={
                                                            viewingDocumentId !==
                                                                null
                                                        }
                                                        className="portal-button portal-button-secondary"
                                                        style={{
                                                            display:
                                                                'inline-flex',
                                                            alignItems:
                                                                'center',
                                                            justifyContent:
                                                                'center',
                                                            gap:
                                                                '7px',
                                                            cursor:
                                                                viewingDocumentId !==
                                                                null
                                                                    ? 'wait'
                                                                    : 'pointer',
                                                            opacity:
                                                                viewingDocumentId !==
                                                                null
                                                                    ? 0.65
                                                                    : 1
                                                        }}
                                                    >
                                                        {isViewing ? (
                                                            <>
                                                                <Loader2
                                                                    size={
                                                                        16
                                                                    }
                                                                    style={{
                                                                        animation:
                                                                            'adminApplicationSpin 1s linear infinite'
                                                                    }}
                                                                />

                                                                Opening...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FileText
                                                                    size={
                                                                        16
                                                                    }
                                                                />

                                                                View Document
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            );
                                        }
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

                    {/* RIGHT SIDEBAR */}

                    <aside>
                        {/* SCHOLARSHIP */}

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

                        {/* CORRECTION */}

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

                        {/* VERIFICATION */}

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

                        {/* REJECTION */}

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

                        {/* ADMIN ACTIONS */}

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

                        {/* TIMELINE */}

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

            <AdminDeletionDialog
                open={deletionOpen}
                targetType="scholarshipApplications"
                targetIds={application?._id ? [application._id] : []}
                itemLabel="scholarship application"
                onClose={() => setDeletionOpen(false)}
                onComplete={() => navigate('/admin/applications', { replace: true })}
            />

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
                padding:
                    '20px',
                marginBottom:
                    '18px'
            }}
        >
            <div
                style={{
                    display:
                        'flex',
                    alignItems:
                        'center',
                    gap:
                        '9px',
                    marginBottom:
                        '18px',
                    paddingBottom:
                        '13px',
                    borderBottom:
                        '1px solid #e2e8f0',
                    color:
                        '#174a8b'
                }}
            >
                {icon}

                <h2
                    style={{
                        margin:
                            0,
                        fontSize:
                            '17px',
                        fontWeight:
                            700,
                        color:
                            '#172033'
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
                display:
                    'grid',
                gridTemplateColumns:
                    'repeat(auto-fit, minmax(190px, 1fr))',
                gap:
                    '18px'
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
                    fontSize:
                        '12px',
                    color:
                        '#64748b',
                    fontWeight:
                        600,
                    marginBottom:
                        '5px',
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
                    color:
                        '#172033',
                    fontWeight:
                        600,
                    lineHeight:
                        1.5,
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
                display:
                    'flex',
                justifyContent:
                    'space-between',
                gap:
                    '12px',
                padding:
                    '10px 0',
                borderBottom:
                    '1px solid #f1f5f9'
            }}
        >
            <span
                style={{
                    color:
                        '#475569',
                    fontWeight:
                        600,
                    fontSize:
                        '14px'
                }}
            >
                {label}
            </span>

            <span
                style={{
                    color:
                        '#64748b',
                    fontSize:
                        '13px',
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
