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
    Upload,
    FileText,
    Send,
    AlertCircle,
    Loader2
} from 'lucide-react';

import API from '../../services/api';

import authService from '../../services/authService';


const ApplicationDocuments = () => {

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

    const [
        uploadingDocument,
        setUploadingDocument
    ] = useState('');

    const [
        submittingApplication,
        setSubmittingApplication
    ] = useState(false);

    const [
        successMessage,
        setSuccessMessage
    ] = useState('');

    const [
        selectedFiles,
        setSelectedFiles
    ] = useState({});


    /* ============================================================
       AUTH TOKEN
    ============================================================ */

    const token =
        authService.getToken();


    /* ============================================================
       AUTH HEADER
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
                    'Fetch application error:',
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
       NORMALIZED APPLICATION STATUS
    ============================================================ */

    const getNormalizedStatus =
        () => {

            if (!application) {
                return '';
            }

            return String(
                application.status || ''
            )
                .trim()
                .toUpperCase();
        };


    /* ============================================================
       STATUS
    ============================================================ */

    const applicationStatus =
        getNormalizedStatus();


    /* ============================================================
       STATUS HELPERS
    ============================================================ */

    const getStatusClass = () => {

        switch (
            applicationStatus
        ) {

            case 'VERIFIED':
            case 'SANCTIONED':
            case 'DISBURSED':

                return 'portal-status-success';


            case 'CORRECTION REQUIRED':

                return 'portal-status-danger';


            case 'REJECTED':

                return 'portal-status-danger';


            case 'UNDER VERIFICATION':
            case 'SUBMITTED':
            case 'RESUBMITTED':

                return 'portal-status-warning';


            case 'DRAFT':
            default:

                return 'portal-status-neutral';
        }
    };


    /* ============================================================
       UPLOAD ALLOWED
    ============================================================ */

    const isUploadAllowed =
        () => {

            return [
                'DRAFT',
                'CORRECTION REQUIRED',
                'RESUBMITTED'
            ].includes(
                applicationStatus
            );
        };


    /* ============================================================
       SUBMIT ALLOWED
    ============================================================ */

    const isSubmitAllowed =
        () => {

            return [
                'DRAFT',
                'CORRECTION REQUIRED',
                'RESUBMITTED'
            ].includes(
                applicationStatus
            );
        };


    /* ============================================================
       REQUIRED DOCUMENTS
    ============================================================ */

    const requiredDocuments =
        application &&
        application.scholarship &&
        Array.isArray(
            application.scholarship
                .requiredDocuments
        )
            ? application.scholarship
                .requiredDocuments
            : [];


    /* ============================================================
       GET UPLOADED DOCUMENT
    ============================================================ */

    const getUploadedDocument =
        (
            documentType
        ) => {

            if (
                !application ||
                !Array.isArray(
                    application.documents
                )
            ) {
                return null;
            }

            const normalizedRequiredType =
                String(
                    documentType || ''
                )
                    .trim()
                    .toLowerCase();

            return application.documents.find(
                (document) => {

                    const uploadedType =
                        String(
                            document.documentType ||
                            ''
                        )
                            .trim()
                            .toLowerCase();

                    return (
                        uploadedType ===
                        normalizedRequiredType
                    );
                }
            ) || null;
        };


    /* ============================================================
       ALL DOCUMENTS UPLOADED
    ============================================================ */

    const allDocumentsUploaded =
        requiredDocuments.length > 0 &&
        requiredDocuments.every(
            (documentType) =>
                Boolean(
                    getUploadedDocument(
                        documentType
                    )
                )
        );


    /* ============================================================
       HANDLE FILE SELECTION
    ============================================================ */

    const handleFileChange =
        (
            documentType,
            event
        ) => {

            const file =
                event.target.files?.[0];

            if (!file) {
                return;
            }

            setSelectedFiles(
                (previous) => ({
                    ...previous,
                    [documentType]:
                        file
                })
            );
        };


    /* ============================================================
       UPLOAD DOCUMENT
    ============================================================ */

    const handleUpload =
        async (
            documentType
        ) => {

            const file =
                selectedFiles[
                    documentType
                ];

            if (!file) {

                setError(
                    `Please select ${documentType}.`
                );

                return;
            }


            /* ----------------------------------------------------
               FILE SIZE
            ---------------------------------------------------- */

            if (
                file.size >
                5 * 1024 * 1024
            ) {

                setError(
                    'File size must not exceed 5 MB.'
                );

                return;
            }


            /* ----------------------------------------------------
               FILE TYPE
            ---------------------------------------------------- */

            const allowedTypes = [
                'application/pdf',
                'image/jpeg',
                'image/png'
            ];

            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                setError(
                    'Only PDF, JPG and PNG files are allowed.'
                );

                return;
            }


            try {

                setUploadingDocument(
                    documentType
                );

                setError('');
                setSuccessMessage('');


                const formData =
                    new FormData();

                formData.append(
                    'document',
                    file
                );

                formData.append(
                    'documentType',
                    documentType
                );


                const response =
                    await API.post(
                        `/applications/${id}/documents`,
                        formData,
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

                    setSuccessMessage(
                        `${documentType} uploaded successfully.`
                    );


                    setSelectedFiles(
                        (previous) => {

                            const updated = {
                                ...previous
                            };

                            delete updated[
                                documentType
                            ];

                            return updated;
                        }
                    );


                    await fetchApplication();

                } else {

                    setError(
                        response.data?.message ||
                        'Unable to upload document.'
                    );
                }

            } catch (requestError) {

                console.error(
                    'Document upload error:',
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
                    'Unable to upload document.'
                );

            } finally {

                setUploadingDocument('');

            }
        };


    /* ============================================================
       SUBMIT APPLICATION
    ============================================================ */

    const handleSubmitApplication =
        async () => {

            if (!application) {
                return;
            }


            if (!isSubmitAllowed()) {

                setError(
                    'This application cannot be submitted in its current status.'
                );

                return;
            }


            if (!allDocumentsUploaded) {

                setError(
                    'Please upload all required documents before submitting the application.'
                );

                return;
            }


            try {

                setSubmittingApplication(
                    true
                );

                setError('');
                setSuccessMessage('');


                const response =
                    await API.post(
                        `/applications/${id}/submit`,
                        {},
                        getAuthConfig()
                    );


                if (
                    response.data &&
                    response.data.success
                ) {

                    setSuccessMessage(
                        'Application submitted successfully.'
                    );


                    setApplication(
                        response.data.application
                    );


                    setTimeout(
                        () => {

                            navigate(
                                '/student/applications'
                            );

                        },
                        1200
                    );

                } else {

                    setError(
                        response.data?.message ||
                        'Unable to submit application.'
                    );
                }

            } catch (requestError) {

                console.error(
                    'Submit application error:',
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
                    'Unable to submit application.'
                );

            } finally {

                setSubmittingApplication(
                    false
                );

            }
        };


    /* ============================================================
       LOADING
    ============================================================ */

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
                                'spin 1s linear infinite',
                            margin: '0 auto 12px'
                        }}
                    />

                    <div>
                        Loading application...
                    </div>

                </div>

            </div>
        );
    }


    /* ============================================================
       ERROR
    ============================================================ */

    if (error && !application) {

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
                >

                    <div
                        className="portal-card"
                        style={{
                            maxWidth: '700px',
                            margin: '0 auto',
                            padding: '30px'
                        }}
                    >

                        <div
                            style={{
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'flex-start',
                                marginBottom: '20px'
                            }}
                        >

                            <AlertCircle
                                color="#b42318"
                                size={24}
                            />

                            <div>

                                <h2
                                    className="portal-heading"
                                    style={{
                                        fontSize: '22px',
                                        marginBottom: '6px'
                                    }}
                                >
                                    Unable to Load Application
                                </h2>

                                <p
                                    className="portal-text"
                                    style={{
                                        margin: 0
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
                                    marginRight: '7px',
                                    verticalAlign: 'middle'
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
                    position: 'sticky',
                    top: 0,
                    zIndex: 20
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

                    <div>

                        <div
                            style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#174a8b',
                                letterSpacing:
                                    '0.08em',
                                textTransform:
                                    'uppercase',
                                marginBottom: '3px'
                            }}
                        >
                            University Scholarship Portal
                        </div>

                        <h1
                            className="portal-heading"
                            style={{
                                fontSize: '24px'
                            }}
                        >
                            Application Documents
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
                                marginRight: '7px',
                                verticalAlign:
                                    'middle'
                            }}
                        />

                        Back

                    </button>

                </div>

            </header>


            {/* ====================================================
                CONTENT
            ==================================================== */}

            <main
                className="portal-container"
                style={{
                    paddingTop: '32px'
                }}
            >

                {/* =================================================
                    APPLICATION INFORMATION
                ================================================== */}

                <div
                    className="portal-card"
                    style={{
                        padding: '24px',
                        marginBottom: '22px'
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
                            flexWrap: 'wrap'
                        }}
                    >

                        <div>

                            <div
                                style={{
                                    color: '#64748b',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    marginBottom:
                                        '5px'
                                }}
                            >
                                Scholarship
                            </div>

                            <h2
                                className="portal-heading"
                                style={{
                                    fontSize: '24px',
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
                                Application Status
                            </div>

                            <span
                                className={`portal-status ${getStatusClass()}`}
                                style={{
                                    fontSize:
                                        '13px'
                                }}
                            >
                                {applicationStatus ||
                                    'UNKNOWN'}
                            </span>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    ERROR MESSAGE
                ================================================== */}

                {error && (
                    <div
                        style={{
                            marginBottom: '18px',
                            padding:
                                '14px 16px',
                            borderRadius:
                                '8px',
                            background:
                                '#fee2e2',
                            color:
                                '#991b1b',
                            border:
                                '1px solid #fecaca',
                            display: 'flex',
                            alignItems:
                                'flex-start',
                            gap: '10px',
                            fontSize:
                                '14px',
                            fontWeight:
                                600
                        }}
                    >

                        <AlertCircle
                            size={19}
                            style={{
                                flexShrink: 0
                            }}
                        />

                        <span>
                            {error}
                        </span>

                    </div>
                )}


                {/* =================================================
                    SUCCESS MESSAGE
                ================================================== */}

                {successMessage && (
                    <div
                        style={{
                            marginBottom: '18px',
                            padding:
                                '14px 16px',
                            borderRadius:
                                '8px',
                            background:
                                '#dcfce7',
                            color:
                                '#166534',
                            border:
                                '1px solid #bbf7d0',
                            display: 'flex',
                            alignItems:
                                'flex-start',
                            gap: '10px',
                            fontSize:
                                '14px',
                            fontWeight:
                                600
                        }}
                    >

                        <CheckCircle2
                            size={19}
                            style={{
                                flexShrink: 0
                            }}
                        />

                        <span>
                            {successMessage}
                        </span>

                    </div>
                )}


                {/* =================================================
                    REQUIRED DOCUMENTS
                ================================================== */}

                <div
                    className="portal-card"
                    style={{
                        padding: '24px',
                        marginBottom: '22px'
                    }}
                >

                    <div
                        style={{
                            display: 'flex',
                            alignItems:
                                'flex-start',
                            gap: '14px',
                            marginBottom:
                                '22px'
                        }}
                    >

                        <div
                            style={{
                                width: '42px',
                                height: '42px',
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
                                flexShrink: 0
                            }}
                        >

                            <FileText
                                size={20}
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
                                        '6px'
                                }}
                            >
                                Required Documents
                            </h2>

                            <p
                                className="portal-text"
                                style={{
                                    margin: 0
                                }}
                            >
                                Upload each required
                                document in PDF, JPG
                                or PNG format. Maximum
                                file size is 5 MB.
                            </p>

                        </div>

                    </div>


                    {requiredDocuments.length ===
                        0 && (

                        <div
                            style={{
                                padding:
                                    '18px',
                                background:
                                    '#f8fafc',
                                border:
                                    '1px solid #e2e8f0',
                                borderRadius:
                                    '8px',
                                color:
                                    '#64748b'
                            }}
                        >
                            No required documents
                            were specified for this
                            scholarship.
                        </div>

                    )}


                    <div
                        style={{
                            display:
                                'grid',
                            gap:
                                '14px'
                        }}
                    >

                        {requiredDocuments.map(
                            (
                                documentType
                            ) => {

                                const uploadedDocument =
                                    getUploadedDocument(
                                        documentType
                                    );

                                const selectedFile =
                                    selectedFiles[
                                        documentType
                                    ];

                                const isUploading =
                                    uploadingDocument ===
                                    documentType;


                                return (

                                    <div
                                        key={
                                            documentType
                                        }
                                        style={{
                                            border:
                                                '1px solid #e2e8f0',
                                            borderRadius:
                                                '10px',
                                            padding:
                                                '17px',
                                            background:
                                                uploadedDocument
                                                    ? '#f8fffa'
                                                    : '#ffffff'
                                        }}
                                    >

                                        <div
                                            style={{
                                                display:
                                                    'flex',
                                                alignItems:
                                                    'flex-start',
                                                justifyContent:
                                                    'space-between',
                                                gap:
                                                    '15px',
                                                flexWrap:
                                                    'wrap'
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

                                                <div
                                                    style={{
                                                        width:
                                                            '36px',
                                                        height:
                                                            '36px',
                                                        borderRadius:
                                                            '8px',
                                                        background:
                                                            uploadedDocument
                                                                ? '#dcfce7'
                                                                : '#f1f5f9',
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

                                                    {uploadedDocument ? (

                                                        <CheckCircle2
                                                            size={
                                                                19
                                                            }
                                                            color="#166534"
                                                        />

                                                    ) : (

                                                        <FileText
                                                            size={
                                                                19
                                                            }
                                                            color="#64748b"
                                                        />

                                                    )}

                                                </div>


                                                <div>

                                                    <div
                                                        style={{
                                                            fontWeight:
                                                                700,
                                                            color:
                                                                '#172033',
                                                            marginBottom:
                                                                '5px'
                                                        }}
                                                    >
                                                        {
                                                            documentType
                                                        }
                                                    </div>


                                                    {uploadedDocument ? (

                                                        <div
                                                            style={{
                                                                color:
                                                                    '#166534',
                                                                fontSize:
                                                                    '13px',
                                                                fontWeight:
                                                                    600
                                                            }}
                                                        >
                                                            Uploaded
                                                        </div>

                                                    ) : (

                                                        <div
                                                            style={{
                                                                color:
                                                                    '#64748b',
                                                                fontSize:
                                                                    '13px'
                                                            }}
                                                        >
                                                            Not uploaded
                                                        </div>

                                                    )}

                                                </div>

                                            </div>


                                            {uploadedDocument && (
                                                <span
                                                    className="portal-status portal-status-success"
                                                >
                                                    Uploaded
                                                </span>
                                            )}

                                        </div>


                                        {uploadedDocument && (
                                            <div
                                                style={{
                                                    marginTop:
                                                        '13px',
                                                    padding:
                                                        '10px 12px',
                                                    borderRadius:
                                                        '7px',
                                                    background:
                                                        '#f1f5f9',
                                                    color:
                                                        '#475569',
                                                    fontSize:
                                                        '13px'
                                                }}
                                            >
                                                File:{' '}
                                                <strong>
                                                    {
                                                        uploadedDocument
                                                            .fileName
                                                    }
                                                </strong>
                                            </div>
                                        )}


                                        {isUploadAllowed() && (
                                            <div
                                                style={{
                                                    marginTop:
                                                        '15px',
                                                    display:
                                                        'flex',
                                                    gap:
                                                        '10px',
                                                    alignItems:
                                                        'center',
                                                    flexWrap:
                                                        'wrap'
                                                }}
                                            >

                                                <label
                                                    style={{
                                                        display:
                                                            'inline-flex',
                                                        alignItems:
                                                            'center',
                                                        gap:
                                                            '8px',
                                                        border:
                                                            '1px solid #cbd5e1',
                                                        borderRadius:
                                                            '8px',
                                                        padding:
                                                            '10px 13px',
                                                        background:
                                                            '#ffffff',
                                                        color:
                                                            '#334155',
                                                        fontSize:
                                                            '13px',
                                                        fontWeight:
                                                            600,
                                                        cursor:
                                                            'pointer'
                                                    }}
                                                >

                                                    <Upload
                                                        size={
                                                            16
                                                        }
                                                    />

                                                    Choose File

                                                    <input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleFileChange(
                                                                documentType,
                                                                event
                                                            )
                                                        }
                                                        style={{
                                                            display:
                                                                'none'
                                                        }}
                                                    />

                                                </label>


                                                {selectedFile && (
                                                    <span
                                                        style={{
                                                            color:
                                                                '#475569',
                                                            fontSize:
                                                                '13px'
                                                        }}
                                                    >
                                                        {
                                                            selectedFile
                                                                .name
                                                        }
                                                    </span>
                                                )}


                                                <button
                                                    type="button"
                                                    className="portal-button portal-button-primary"
                                                    disabled={
                                                        !selectedFile ||
                                                        isUploading
                                                    }
                                                    onClick={() =>
                                                        handleUpload(
                                                            documentType
                                                        )
                                                    }
                                                    style={{
                                                        opacity:
                                                            !selectedFile ||
                                                            isUploading
                                                                ? 0.6
                                                                : 1
                                                    }}
                                                >

                                                    {isUploading ? (

                                                        <>
                                                            <Loader2
                                                                size={
                                                                    15
                                                                }
                                                                style={{
                                                                    marginRight:
                                                                        '7px',
                                                                    verticalAlign:
                                                                        'middle',
                                                                    animation:
                                                                        'spin 1s linear infinite'
                                                                }}
                                                            />

                                                            Uploading...

                                                        </>

                                                    ) : (

                                                        <>
                                                            <Upload
                                                                size={
                                                                    15
                                                                }
                                                                style={{
                                                                    marginRight:
                                                                        '7px',
                                                                    verticalAlign:
                                                                        'middle'
                                                                }}
                                                            />

                                                            {uploadedDocument
                                                                ? 'Replace Document'
                                                                : 'Upload Document'}

                                                        </>

                                                    )}

                                                </button>

                                            </div>
                                        )}

                                    </div>

                                );
                            }
                        )}

                    </div>

                </div>


                {/* =================================================
                    DOCUMENT SUMMARY
                ================================================== */}

                <div
                    className="portal-card"
                    style={{
                        padding: '20px',
                        marginBottom: '22px'
                    }}
                >

                    <div
                        style={{
                            display:
                                'flex',
                            justifyContent:
                                'space-between',
                            alignItems:
                                'center',
                            gap:
                                '15px',
                            flexWrap:
                                'wrap'
                        }}
                    >

                        <div>

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
                                Document Completion
                            </div>

                            <div
                                style={{
                                    color:
                                        '#64748b',
                                    fontSize:
                                        '13px'
                                }}
                            >
                                {
                                    requiredDocuments.filter(
                                        (
                                            documentType
                                        ) =>
                                            Boolean(
                                                getUploadedDocument(
                                                    documentType
                                                )
                                            )
                                    ).length
                                }{' '}
                                of{' '}
                                {
                                    requiredDocuments.length
                                }{' '}
                                required documents uploaded
                            </div>

                        </div>


                        <div>

                            {allDocumentsUploaded ? (

                                <span className="portal-status portal-status-success">
                                    <CheckCircle2
                                        size={14}
                                        style={{
                                            marginRight:
                                                '5px'
                                        }}
                                    />
                                    Complete
                                </span>

                            ) : (

                                <span className="portal-status portal-status-warning">
                                    Incomplete
                                </span>

                            )}

                        </div>

                    </div>

                </div>


                {/* =================================================
                    SUBMIT APPLICATION

                    IMPORTANT:
                    THIS SECTION IS ALWAYS VISIBLE.
                ================================================== */}

                <div
                    className="portal-card"
                    style={{
                        padding: '24px',
                        marginBottom: '22px'
                    }}
                >

                    <div
                        style={{
                            display:
                                'flex',
                            alignItems:
                                'flex-start',
                            gap:
                                '14px',
                            marginBottom:
                                '20px'
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

                            <Send
                                size={
                                    20
                                }
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
                                        '6px'
                                }}
                            >
                                Submit Application
                            </h2>

                            <p
                                className="portal-text"
                                style={{
                                    margin: 0
                                }}
                            >
                                Review your information
                                and documents carefully
                                before submitting. Once
                                submitted, the application
                                will move to the university
                                verification process.
                            </p>

                        </div>

                    </div>


                    {/* =============================================
                        STATUS INFORMATION
                    ============================================== */}

                    {!isSubmitAllowed() && (
                        <div
                            style={{
                                marginBottom:
                                    '16px',
                                padding:
                                    '13px 15px',
                                borderRadius:
                                    '8px',
                                background:
                                    '#f1f5f9',
                                color:
                                    '#475569',
                                fontSize:
                                    '14px',
                                fontWeight:
                                    600
                            }}
                        >
                            This application cannot
                            be submitted because its
                            current status is{' '}
                            <strong>
                                {applicationStatus ||
                                    'UNKNOWN'}
                            </strong>.
                        </div>
                    )}


                    {/* =============================================
                        DOCUMENT WARNING
                    ============================================== */}

                    {isSubmitAllowed() &&
                        !allDocumentsUploaded && (

                        <div
                            style={{
                                marginBottom:
                                    '16px',
                                padding:
                                    '13px 15px',
                                borderRadius:
                                    '8px',
                                background:
                                    '#fef3c7',
                                color:
                                    '#92400e',
                                fontSize:
                                    '14px',
                                fontWeight:
                                    600
                            }}
                        >
                            Please upload all required
                            documents before submitting
                            the application.
                        </div>

                    )}


                    {/* =============================================
                        READY MESSAGE
                    ============================================== */}

                    {isSubmitAllowed() &&
                        allDocumentsUploaded && (

                        <div
                            style={{
                                marginBottom:
                                    '16px',
                                padding:
                                    '13px 15px',
                                borderRadius:
                                    '8px',
                                background:
                                    '#dcfce7',
                                color:
                                    '#166534',
                                fontSize:
                                    '14px',
                                fontWeight:
                                    600
                            }}
                        >
                            ✓ All required documents
                            are uploaded. Your
                            application is ready
                            for submission.
                        </div>

                    )}


                    {/* =============================================
                        SUBMIT BUTTON
                    ============================================== */}

                    <button
                        type="button"
                        className="portal-button portal-button-primary"
                        disabled={
                            !isSubmitAllowed() ||
                            !allDocumentsUploaded ||
                            submittingApplication ||
                            uploadingDocument !== ''
                        }
                        onClick={
                            handleSubmitApplication
                        }
                        style={{
                            minWidth:
                                '210px',
                            opacity:
                                !isSubmitAllowed() ||
                                !allDocumentsUploaded ||
                                submittingApplication ||
                                uploadingDocument !== ''
                                    ? 0.6
                                    : 1
                        }}
                    >

                        {submittingApplication ? (

                            <>
                                <Loader2
                                    size={
                                        16
                                    }
                                    style={{
                                        marginRight:
                                            '7px',
                                        verticalAlign:
                                            'middle',
                                        animation:
                                            'spin 1s linear infinite'
                                    }}
                                />

                                Submitting...

                            </>

                        ) : (

                            <>
                                <Send
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

                                Submit Application

                            </>

                        )}

                    </button>

                </div>


                {/* =================================================
                    BACK BUTTON
                ================================================== */}

                <div
                    style={{
                        display:
                            'flex',
                        justifyContent:
                            'flex-start'
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

                        Back to My Applications

                    </button>

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
                `}
            </style>

        </div>
    );
};


export default ApplicationDocuments;