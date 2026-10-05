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
    Download,
    Send,
    AlertCircle,
    Loader2,
    Eye
} from 'lucide-react';

import API from '../../services/api';

import authService from '../../services/authService';


const APPLICANT_DETAIL_GROUPS = [
    {
        title: 'Application and Personal Details',
        fields: [
            { name: 'applicationType', label: 'Application Type', type: 'select', options: ['Fresh Application', 'Renewal Application'], required: true },
            { name: 'studentId', label: 'Student ID', readOnly: true, required: true },
            { name: 'fullName', label: 'Student Name', readOnly: true, required: true },
            { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
            { name: 'fatherName', label: "Father's Name", readOnly: true, required: true },
            { name: 'motherName', label: "Mother's Name", readOnly: true, required: true },
            { name: 'familyIncome', label: 'Annual Income', type: 'number', readOnly: true, required: true },
            { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', readOnly: true, required: true },
            { name: 'category', label: 'Category', readOnly: true, required: true },
            { name: 'religion', label: 'Religion', required: true },
            { name: 'specialCategory', label: 'Special Category', required: true },
            { name: 'aadhaarNumber', label: 'Aadhaar (UID) Number', readOnly: true, required: true },
            { name: 'deNotifiedTribes', label: 'De-Notified Tribes', type: 'select', options: ['No', 'Yes'], required: true },
            { name: 'tribes', label: 'Tribes', required: true }
        ]
    },
    {
        title: 'Academic Details',
        fields: [
            { name: 'institute', label: 'Institute', required: true },
            { name: 'tehsil', label: 'Tehsil', required: true },
            { name: 'course', label: 'Course', readOnly: true, required: true },
            { name: 'department', label: 'Branch / Department', readOnly: true, required: true },
            { name: 'academicYear', label: 'Academic Year', required: true },
            { name: 'hosteller', label: 'Hosteller', type: 'select', options: ['No', 'Yes'], required: true },
            { name: 'class10Board', label: '10th Class Board', required: true },
            { name: 'class10Session', label: '10th Class Session', required: true },
            { name: 'class10RollNumber', label: '10th Class Roll Number', required: true },
            { name: 'enrollment', label: 'Enrollment Number', required: true },
            { name: 'admissionDate', label: 'Admission Date', type: 'date', required: true },
            { name: 'attendance', label: 'Attendance (%)', type: 'number', required: true },
            { name: 'admitCard', label: 'Admit Card Number', required: true },
            { name: 'examinationYear', label: 'Examination Year', required: true },
            { name: 'promoted', label: 'Promoted', type: 'select', options: ['Yes', 'No'], required: true },
            { name: 'previousPercentage', label: 'Previous Percentage', type: 'number' }
        ]
    },
    {
        title: 'Contact Details',
        fields: [
            { name: 'correspondenceAddress', label: 'Correspondence Address', type: 'textarea', required: true },
            { name: 'permanentAddress', label: 'Permanent Address', type: 'textarea', required: true },
            { name: 'contactNumbers', label: 'Contact Numbers', required: true },
            { name: 'emailAddress', label: 'Email Address', type: 'email', readOnly: true, required: true }
        ]
    },
    {
        title: 'Bank Details',
        fields: [
            { name: 'bankAccountNumber', label: 'Account Number', required: true },
            { name: 'bankName', label: 'Bank Name', required: true },
            { name: 'ifscCode', label: 'IFSC Code', required: true },
            { name: 'bankAddress', label: 'Bank Address', type: 'textarea', required: true },
            { name: 'bankBranchName', label: 'Bank Branch Name', required: true }
        ]
    },
    {
        title: 'Declaration',
        fields: [
            { name: 'declarationAccepted', label: 'Declaration', helpText: 'I declare that the information is true and understand that incorrect details may lead to recovery of the scholarship and further action.', type: 'checkbox', required: true, wide: true }
        ]
    }
];

const APPLICANT_DETAIL_FIELDS = APPLICANT_DETAIL_GROUPS.flatMap(
    (group) => group.fields
);


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
        viewingDocument,
        setViewingDocument
    ] = useState('');

    const [
        successMessage,
        setSuccessMessage
    ] = useState('');

    const [
        selectedFiles,
        setSelectedFiles
    ] = useState({});

    const [applicantDetails, setApplicantDetails] =
        useState({});

    const [savingApplicantDetails, setSavingApplicantDetails] =
        useState(false);

    const [applicationStep, setApplicationStep] =
        useState('details');

    const [downloadingApplicationPdf, setDownloadingApplicationPdf] =
        useState(false);


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

                    const loadedApplication = response.data.application;
                    const details = loadedApplication?.applicantDetails || {};
                    const loadedStatus = String(loadedApplication?.status || '')
                        .trim()
                        .toUpperCase();
                    const canUpdateDetails = [
                        'DRAFT',
                        'CORRECTION REQUIRED'
                    ].includes(loadedStatus);

                    setApplicationStep(
                        !canUpdateDetails || Boolean(details.declarationAccepted)
                            ? 'documents'
                            : 'details'
                    );

                    setApplicantDetails(
                        Object.fromEntries(
                            APPLICANT_DETAIL_FIELDS.map(({ name, type }) => {
                                const value = details[name];

                                return [
                                    name,
                                    value === null || value === undefined
                                        ? ''
                                        : type === 'checkbox'
                                            ? Boolean(value)
                                        : type === 'date'
                                            ? String(value).substring(0, 10)
                                            : String(value)
                                ];
                            })
                        )
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
       SAVE APPLICANT DETAILS
    ============================================================ */

    const handleApplicantDetailsChange = (event) => {
        const { name, value, checked, type } = event.target;

        setApplicantDetails((previous) => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value
        }));
    };


    const handleSaveApplicantDetails = async (event) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');

        const semester = applicantDetails.currentSemester;
        if (
            semester &&
            (!Number.isInteger(Number(semester)) ||
                Number(semester) < 1 ||
                Number(semester) > 20)
        ) {
            setError('Current semester must be a whole number between 1 and 20.');
            return;
        }

        const income = applicantDetails.familyIncome;
        if (income && (!Number.isFinite(Number(income)) || Number(income) < 0)) {
            setError('Family income must be a valid non-negative number.');
            return;
        }

        const percentage = applicantDetails.previousPercentage;
        if (
            percentage &&
            (!Number.isFinite(Number(percentage)) ||
                Number(percentage) < 0 ||
                Number(percentage) > 100)
        ) {
            setError('Previous percentage must be between 0 and 100.');
            return;
        }

        const attendance = applicantDetails.attendance;
        if (
            attendance !== '' &&
            attendance !== null &&
            attendance !== undefined &&
            (!Number.isFinite(Number(attendance)) || Number(attendance) < 0 || Number(attendance) > 100)
        ) {
            setError('Attendance must be a number between 0 and 100.');
            return;
        }

        const payload = { ...applicantDetails };
        ['currentSemester', 'familyIncome', 'previousPercentage', 'attendance'].forEach((field) => {
            if (payload[field] !== '' && payload[field] !== null && payload[field] !== undefined) {
                payload[field] = Number(payload[field]);
            }
        });

        try {
            setSavingApplicantDetails(true);

            const response = await API.put(
                `/applications/${id}`,
                payload,
                getAuthConfig()
            );

            if (response.data?.success) {
                setApplication((previous) => ({
                    ...previous,
                    applicantDetails:
                        response.data.application?.applicantDetails || payload
                }));
                setApplicationStep('documents');
                setSuccessMessage('Application details saved. Continue by uploading the required documents.');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setError(
                    response.data?.message ||
                    'Unable to update application details.'
                );
            }
        } catch (requestError) {
            if (requestError.response?.status === 401) {
                authService.logout();
                navigate('/login', { replace: true });
                return;
            }

            setError(
                requestError.response?.data?.message ||
                'Unable to update application details.'
            );
        } finally {
            setSavingApplicantDetails(false);
        }
    };

    const downloadApplicationPdf = async () => {
        try {
            setDownloadingApplicationPdf(true);
            const response = await API.get(`/applications/${id}/pdf`, {
                ...getAuthConfig(),
                responseType: 'blob'
            });
            const objectUrl = URL.createObjectURL(response.data);
            const anchor = document.createElement('a');
            anchor.href = objectUrl;
            anchor.download = `${application?.applicationNumber || 'scholarship-application'}.pdf`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to download the application PDF. Save the latest details and try again.');
        } finally {
            setDownloadingApplicationPdf(false);
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

    const canEditApplicantDetails = [
        'DRAFT',
        'CORRECTION REQUIRED'
    ].includes(applicationStatus);


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
                'CORRECTION REQUIRED'
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
                'CORRECTION REQUIRED'
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
       VIEW / OPEN DOCUMENT
    ============================================================ */

    const handleViewDocument =
        async (
            document
        ) => {

            if (!document?._id) {

                setError(
                    'Document information is unavailable.'
                );

                return;
            }


            /*
               Open the browser tab immediately.

               This prevents popup blockers from
               blocking the document viewer after
               the asynchronous API request.
            */

            const newWindow =
                window.open(
                    '',
                    '_blank'
                );


            try {

                setViewingDocument(
                    document._id
                );

                setError('');
                setSuccessMessage('');


                /*
                   IMPORTANT:

                   The backend no longer returns a
                   Cloudinary URL.

                   It now securely retrieves the
                   private Cloudinary document and
                   streams the actual PDF/image to us.

                   Therefore we request the endpoint
                   as a BLOB.
                */

                const response =
                    await API.get(
                        `/applications/${id}/documents/${document._id}`,
                        {
                            ...getAuthConfig(),

                            responseType:
                                'blob'
                        }
                    );


                /*
                   Axios gives us the document itself
                   as a Blob.

                   We still explicitly assign the
                   correct MIME type because this makes
                   browser rendering more reliable.
                */

                const contentType =
                    document.contentType ||
                    response.headers[
                        'content-type'
                    ] ||
                    'application/octet-stream';


                /*
                   Convert the received binary data
                   into a browser Blob with the correct
                   MIME type.
                */

                const documentBlob =
                    new Blob(
                        [
                            response.data
                        ],
                        {
                            type:
                                contentType
                        }
                    );


                /*
                   Create a temporary browser URL.

                   PDF:
                   Opens in browser PDF viewer.

                   JPG / PNG:
                   Opens as an image.
                */

                const documentUrl =
                    URL.createObjectURL(
                        documentBlob
                    );


                /*
                   Send the already-opened tab to
                   the temporary document URL.
                */

                if (
                    newWindow &&
                    !newWindow.closed
                ) {

                    newWindow.location.href =
                        documentUrl;

                } else {

                    /*
                       Fallback if the browser did
                       not allow the first tab.
                    */

                    const fallbackWindow =
                        window.open(
                            documentUrl,
                            '_blank'
                        );

                    if (
                        !fallbackWindow
                    ) {

                        setError(
                            'Your browser blocked the document window. Please allow pop-ups for this portal.'
                        );
                    }
                }


                /*
                   Release the temporary browser
                   object URL after enough time for
                   the document viewer to load.
                */

                setTimeout(
                    () => {

                        URL.revokeObjectURL(
                            documentUrl
                        );

                    },
                    5 * 60 * 1000
                );


            } catch (requestError) {

                console.error(
                    'View document error:',
                    requestError
                );


                if (
                    newWindow &&
                    !newWindow.closed
                ) {

                    newWindow.close();
                }


                /*
                   Axios errors are handled here.

                   Because the response is configured
                   as a Blob, error responses can also
                   arrive as Blob data.
                */

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


                if (
                    requestError.response?.status ===
                    403
                ) {

                    setError(
                        'You are not authorized to view this document.'
                    );

                    return;
                }


                if (
                    requestError.response?.status ===
                    404
                ) {

                    setError(
                        'The requested document could not be found.'
                    );

                    return;
                }


                if (
                    requestError.response?.status ===
                    410
                ) {

                    setError(
                        'This document belongs to an older storage system and is no longer available.'
                    );

                    return;
                }


                if (
                    requestError.response?.status ===
                    502
                ) {

                    setError(
                        'The secure document storage service could not retrieve this document.'
                    );

                    return;
                }


                /*
                   If the server returned a normal
                   JSON error instead of a document,
                   try to read its message.
                */

                let serverMessage = '';


                try {

                    const responseData =
                        requestError.response?.data;


                    if (
                        responseData instanceof Blob
                    ) {

                        const text =
                            await responseData.text();

                        if (text) {

                            const parsed =
                                JSON.parse(
                                    text
                                );

                            serverMessage =
                                parsed?.message ||
                                '';
                        }

                    } else if (
                        responseData?.message
                    ) {

                        serverMessage =
                            responseData.message;
                    }

                } catch (
                    parseError
                ) {

                    console.error(
                        'Document error response parsing error:',
                        parseError
                    );
                }


                setError(
                    serverMessage ||
                    requestError.message ||
                    'Unable to open document.'
                );

            } finally {

                setViewingDocument('');

            }
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
                    'Document upload failed:',
                    requestError.response?.data ||
                    requestError.message
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
                            {canEditApplicantDetails && applicationStep === 'details'
                                ? 'Application Details'
                                : 'Application Documents'}
                        </h1>

                    </div>


                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {application && (
                            <button
                                type="button"
                                className="portal-button portal-button-secondary"
                                onClick={downloadApplicationPdf}
                                disabled={downloadingApplicationPdf}
                            >
                                <Download size={16} style={{ marginRight: 7, verticalAlign: 'middle' }} />
                                {downloadingApplicationPdf ? 'Preparing PDF...' : 'Download Application PDF'}
                            </button>
                        )}
                        <button
                            type="button"
                            className="portal-button portal-button-secondary"
                            onClick={() => navigate('/student/applications')}
                        >
                            <ArrowLeft size={16} style={{ marginRight: '7px', verticalAlign: 'middle' }} />
                            Back
                        </button>
                    </div>

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
                    APPLICATION STEPS
                ================================================== */}

                {canEditApplicantDetails && (
                    <div
                        className="portal-card"
                        style={{
                            padding: '17px 20px',
                            marginBottom: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '14px',
                            flexWrap: 'wrap'
                        }}
                    >
                        <div>
                            <div style={{ color: '#174a8b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Step {applicationStep === 'details' ? '1' : '2'} of 2
                            </div>
                            <strong style={{ display: 'block', marginTop: '4px', color: '#172033' }}>
                                {applicationStep === 'details' ? 'Application details' : 'Required documents'}
                            </strong>
                            <span style={{ display: 'block', marginTop: '3px', color: '#64748b', fontSize: '13px' }}>
                                {applicationStep === 'details'
                                    ? 'Save your details to continue to document uploads.'
                                    : 'Your details are saved. Upload each required document to continue.'}
                            </span>
                        </div>
                        {applicationStep === 'documents' && (
                            <button
                                type="button"
                                className="portal-button portal-button-secondary"
                                onClick={() => {
                                    setSuccessMessage('');
                                    setApplicationStep('details');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            >
                                <ArrowLeft size={16} style={{ marginRight: '7px', verticalAlign: 'middle' }} />
                                Edit Application Details
                            </button>
                        )}
                    </div>
                )}

                {/* =================================================
                    EDIT APPLICATION DETAILS
                ================================================== */}

                {canEditApplicantDetails && applicationStep === 'details' && (
                    <form
                        className="portal-card"
                        onSubmit={handleSaveApplicantDetails}
                        style={{
                            padding: '24px',
                            marginBottom: '22px'
                        }}
                    >
                        <h2
                            className="portal-heading"
                            style={{ fontSize: '21px', marginBottom: '6px' }}
                        >
                            Applicant Details
                        </h2>
                        <p
                            className="portal-text"
                            style={{ marginTop: 0, marginBottom: '20px' }}
                        >
                            Review and update the information saved with this application.
                            These fields can be changed while the application is a draft
                            or requires correction.
                        </p>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                gap: '16px'
                            }}
                        >
                            {APPLICANT_DETAIL_GROUPS.map((group) => (
                                <React.Fragment key={group.title}>
                                    <h3
                                        style={{
                                            gridColumn: '1 / -1',
                                            margin: '18px 0 0',
                                            paddingBottom: '8px',
                                            borderBottom: '1px solid #e2e8f0',
                                            color: '#174a8b',
                                            fontSize: '16px'
                                        }}
                                    >
                                        {group.title}
                                    </h3>
                                    {group.fields.map((field) => (
                                        <div
                                            className="form-group"
                                            key={field.name}
                                            style={field.wide || field.type === 'textarea'
                                                ? { gridColumn: '1 / -1' }
                                                : undefined}
                                        >
                                            <label
                                                className="portal-label"
                                                htmlFor={`applicant-${field.name}`}
                                            >
                                                {field.label}{field.required && <span aria-hidden="true"> *</span>}
                                            </label>
                                            {field.type === 'textarea' ? (
                                                <textarea
                                                    id={`applicant-${field.name}`}
                                                    name={field.name}
                                                    className="portal-input"
                                                    rows={3}
                                                    value={applicantDetails[field.name] || ''}
                                                    onChange={handleApplicantDetailsChange}
                                                    readOnly={field.readOnly}
                                                />
                                            ) : field.type === 'select' ? (
                                                <select
                                                    id={`applicant-${field.name}`}
                                                    name={field.name}
                                                    className="portal-input"
                                                    value={applicantDetails[field.name] || ''}
                                                    onChange={handleApplicantDetailsChange}
                                                    disabled={field.readOnly}
                                                >
                                                    <option value="">Select {field.label.toLowerCase()}</option>
                                                    {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                                                </select>
                                            ) : field.type === 'checkbox' ? (
                                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.5 }}>
                                                    <input
                                                        id={`applicant-${field.name}`}
                                                        name={field.name}
                                                        type="checkbox"
                                                        checked={Boolean(applicantDetails[field.name])}
                                                        onChange={handleApplicantDetailsChange}
                                                        required={field.required}
                                                        disabled={field.readOnly}
                                                    />
                                                    <span>{field.helpText || field.label}</span>
                                                </label>
                                            ) : (
                                                <input
                                                    id={`applicant-${field.name}`}
                                                    name={field.name}
                                                    className="portal-input"
                                                    type={field.type || 'text'}
                                                    value={applicantDetails[field.name] || ''}
                                                    onChange={handleApplicantDetailsChange}
                                                    readOnly={field.readOnly}
                                                    min={field.name === 'currentSemester' ? 1 : ['familyIncome', 'previousPercentage', 'attendance'].includes(field.name) ? 0 : undefined}
                                                    max={field.name === 'currentSemester' ? 20 : ['previousPercentage', 'attendance'].includes(field.name) ? 100 : undefined}
                                                    step={field.type === 'number' ? 'any' : undefined}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>

                        <button
                            type="submit"
                            className="portal-button portal-button-primary"
                            disabled={savingApplicantDetails}
                            style={{ marginTop: '8px' }}
                        >
                            {savingApplicantDetails
                                ? 'Saving Details...'
                                : 'Save Details & Continue to Documents'}
                        </button>
                    </form>
                )}


                {(!canEditApplicantDetails || applicationStep === 'documents') && (
                    <React.Fragment>
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

                                const isViewing =
                                    viewingDocument ===
                                    uploadedDocument?._id;


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
                                                        '13px',
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
                                                        minWidth:
                                                            0,
                                                        overflow:
                                                            'hidden',
                                                        textOverflow:
                                                            'ellipsis'
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


                                                <button
                                                    type="button"
                                                    className="portal-button portal-button-secondary"
                                                    disabled={
                                                        isViewing
                                                    }
                                                    onClick={() =>
                                                        handleViewDocument(
                                                            uploadedDocument
                                                        )
                                                    }
                                                    style={{
                                                        flexShrink:
                                                            0,
                                                        opacity:
                                                            isViewing
                                                                ? 0.65
                                                                : 1
                                                    }}
                                                >

                                                    {isViewing ? (

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

                                                            Opening...

                                                        </>

                                                    ) : (

                                                        <>
                                                            <Eye
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

                                                            View Document

                                                        </>

                                                    )}

                                                </button>

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

                    </React.Fragment>
                )}

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
