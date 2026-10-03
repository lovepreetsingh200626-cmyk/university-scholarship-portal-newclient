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
    UserCircle,
    GraduationCap,
    WalletCards,
    Landmark,
    FileText,
    CheckCircle2,
    Clock3,
    AlertCircle,
    RefreshCw
} from 'lucide-react';

import API from '../../services/api';

import authService
    from '../../services/authService';


/* ============================================================
   ADMIN STUDENT DETAILS
============================================================ */

const AdminStudentDetails = () => {

    const {
        id
    } = useParams();

    const navigate =
        useNavigate();


    /* ============================================================
       STATE
    ============================================================ */

    const [student, setStudent] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');


    /* ============================================================
       FETCH STUDENT
    ============================================================ */

    const fetchStudent = async () => {

        try {

            setLoading(true);

            setError('');


            const token =
                authService.getToken();


            if (!token) {

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
                    `/admin/students/${id}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            setStudent(
                response.data?.student ||
                null
            );


        } catch (error) {

            console.error(
                'Admin student details error:',
                error
            );


            if (
                error.response?.status ===
                401
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
                error.response?.status ===
                403
            ) {

                setError(
                    'You do not have permission to view this student.'
                );

                return;
            }


            if (
                error.response?.status ===
                404
            ) {

                setError(
                    'Student record was not found.'
                );

                return;
            }


            setError(
                error.response?.data?.message ||
                'Unable to load student details.'
            );


        } finally {

            setLoading(false);

        }

    };


    /* ============================================================
       INITIAL LOAD
    ============================================================ */

    useEffect(() => {

        fetchStudent();

    }, [id]);


    /* ============================================================
       HELPERS
    ============================================================ */

    const formatDate = (
        date
    ) => {

        if (!date) {
            return 'Not provided';
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


    const formatDateTime = (
        date
    ) => {

        if (!date) {
            return 'Not available';
        }


        return new Date(
            date
        ).toLocaleString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }
        );

    };


    const formatCurrency = (
        amount
    ) => {

        if (
            amount === null ||
            amount === undefined
        ) {
            return 'Not specified';
        }


        return new Intl.NumberFormat(
            'en-IN',
            {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }
        ).format(amount);

    };


    const getInitials = (
        name
    ) => {

        if (!name) {
            return 'ST';
        }


        return name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map(
                word =>
                    word
                        .charAt(0)
                        .toUpperCase()
            )
            .join('');

    };


    const getStatusClass = (
        status
    ) => {

        switch (status) {

            case 'VERIFIED':
                return 'portal-status-success';

            case 'DISBURSED':
                return 'portal-status-success';

            case 'SANCTIONED':
                return 'portal-status-success';

            case 'REJECTED':
                return 'portal-status-danger';

            case 'CORRECTION REQUIRED':
                return 'portal-status-warning';

            case 'UNDER VERIFICATION':
                return 'portal-status-info';

            case 'SUBMITTED':
                return 'portal-status-info';

            case 'RESUBMITTED':
                return 'portal-status-info';

            case 'DRAFT':
            default:
                return 'portal-status-neutral';

        }

    };


    /* ============================================================
       LOADING
    ============================================================ */

    if (loading) {

        return (

            <div
                className="portal-card"
                style={{
                    padding: '60px 20px',
                    textAlign: 'center'
                }}
            >

                <RefreshCw
                    size={28}
                    color="#174a8b"
                    style={{
                        margin:
                            '0 auto 12px',
                        animation:
                            'spin 1s linear infinite'
                    }}
                />

                <div
                    style={{
                        color: '#64748b',
                        fontSize: '14px'
                    }}
                >
                    Loading student details...
                </div>


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

    }


    /* ============================================================
       ERROR
    ============================================================ */

    if (error || !student) {

        return (

            <div>

                <button
                    type="button"
                    className="portal-button portal-button-secondary"
                    onClick={() =>
                        navigate(
                            '/admin/students'
                        )
                    }
                    style={{
                        display:
                            'inline-flex',
                        alignItems:
                            'center',
                        gap: '7px',
                        marginBottom:
                            '18px'
                    }}
                >

                    <ArrowLeft
                        size={16}
                    />

                    Back to Students

                </button>


                <div
                    className="portal-card"
                    style={{
                        padding: '45px 20px',
                        textAlign: 'center'
                    }}
                >

                    <AlertCircle
                        size={42}
                        color="#b42318"
                        style={{
                            margin:
                                '0 auto 12px'
                        }}
                    />

                    <h2
                        style={{
                            margin:
                                '0 0 7px',
                            color:
                                '#172033',
                            fontSize:
                                '20px'
                        }}
                    >
                        Unable to Load Student
                    </h2>


                    <p
                        className="portal-text"
                        style={{
                            margin: 0
                        }}
                    >
                        {error ||
                            'Student record could not be loaded.'}
                    </p>

                </div>

            </div>

        );

    }


    /* ============================================================
       DATA
    ============================================================ */

    const profile =
        student.profile || {};

    const applications =
        student.applications || [];


    /* ============================================================
       RENDER
    ============================================================ */

    return (

        <div
            style={{
                paddingBottom: '30px'
            }}
        >

            {/* ====================================================
               BACK BUTTON
            ==================================================== */}

            <button
                type="button"
                className="portal-button portal-button-secondary"
                onClick={() =>
                    navigate(
                        '/admin/students'
                    )
                }
                style={{
                    display:
                        'inline-flex',
                    alignItems:
                        'center',
                    gap: '7px',
                    padding:
                        '8px 12px',
                    fontSize:
                        '12px',
                    marginBottom:
                        '15px'
                }}
            >

                <ArrowLeft
                    size={15}
                />

                Back to Students

            </button>


            {/* ====================================================
               STUDENT HEADER
            ==================================================== */}

            <div
                className="portal-card"
                style={{
                    padding:
                        '18px',
                    marginBottom:
                        '15px'
                }}
            >

                <div
                    style={{
                        display:
                            'flex',
                        alignItems:
                            'center',
                        justifyContent:
                            'space-between',
                        gap:
                            '16px',
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
                                '12px'
                        }}
                    >

                        <div
                            style={{
                                width:
                                    '52px',
                                height:
                                    '52px',
                                borderRadius:
                                    '50%',
                                background:
                                    '#eaf1fb',
                                color:
                                    '#174a8b',
                                display:
                                    'flex',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'center',
                                fontWeight:
                                    700,
                                fontSize:
                                    '16px',
                                flexShrink:
                                    0
                            }}
                        >

                            {getInitials(
                                student.name
                            )}

                        </div>


                        <div>

                            <div
                                style={{
                                    display:
                                        'flex',
                                    alignItems:
                                        'center',
                                    gap:
                                        '7px',
                                    marginBottom:
                                        '4px'
                                }}
                            >

                                <UserCircle
                                    size={16}
                                    color="#174a8b"
                                />

                                <span
                                    style={{
                                        color:
                                            '#174a8b',
                                        fontSize:
                                            '11px',
                                        fontWeight:
                                            700,
                                        letterSpacing:
                                            '0.06em',
                                        textTransform:
                                            'uppercase'
                                    }}
                                >
                                    Student Record
                                </span>

                            </div>


                            <h1
                                className="portal-heading"
                                style={{
                                    fontSize:
                                        '24px',
                                    margin:
                                        '0 0 3px'
                                }}
                            >
                                {student.name}
                            </h1>


                            <div
                                style={{
                                    color:
                                        '#64748b',
                                    fontSize:
                                        '12px'
                                }}
                            >
                                {student.email}
                            </div>

                        </div>

                    </div>


                    <div>

                        {profile.profileCompleted ? (

                            <span
                                className="portal-status portal-status-success"
                                style={{
                                    display:
                                        'inline-flex',
                                    alignItems:
                                        'center',
                                    gap:
                                        '5px'
                                }}
                            >

                                <CheckCircle2
                                    size={13}
                                />

                                Profile Complete

                            </span>

                        ) : (

                            <span
                                className="portal-status portal-status-warning"
                            >
                                Profile Incomplete
                            </span>

                        )}

                    </div>

                </div>

            </div>


            {/* ====================================================
               ACCOUNT INFORMATION
            ==================================================== */}

            <section
                className="portal-card"
                style={{
                    padding:
                        '17px',
                    marginBottom:
                        '15px'
                }}
            >

                <SectionTitle
                    icon={
                        <UserCircle
                            size={17}
                        />
                    }
                    title="Account Information"
                />


                <InfoGrid>

                    <InfoItem
                        label="Full Name"
                        value={
                            student.name
                        }
                    />

                    <InfoItem
                        label="Email Address"
                        value={
                            student.email
                        }
                    />

                    <InfoItem
                        label="Mobile Number"
                        value={
                            student.mobile ||
                            'Not provided'
                        }
                    />

                    <InfoItem
                        label="Account Status"
                        value={
                            student.isActive
                                ? 'Active'
                                : 'Inactive'
                        }
                        valueClass={
                            student.isActive
                                ? 'portal-status-success'
                                : 'portal-status-danger'
                        }
                    />

                    <InfoItem
                        label="Account Created"
                        value={
                            formatDateTime(
                                student.createdAt
                            )
                        }
                    />

                    <InfoItem
                        label="Last Updated"
                        value={
                            formatDateTime(
                                student.updatedAt
                            )
                        }
                    />

                </InfoGrid>

            </section>


            {/* ====================================================
               PERSONAL INFORMATION
            ==================================================== */}

            <section
                className="portal-card"
                style={{
                    padding:
                        '17px',
                    marginBottom:
                        '15px'
                }}
            >

                <SectionTitle
                    icon={
                        <UserCircle
                            size={17}
                        />
                    }
                    title="Personal Information"
                />


                <InfoGrid>

                    <InfoItem
                        label="Full Name"
                        value={
                            profile.fullName ||
                            'Not provided'
                        }
                    />

                    <InfoItem
                        label="Gender"
                        value={
                            profile.gender ||
                            'Not provided'
                        }
                    />

                    <InfoItem
                        label="Date of Birth"
                        value={
                            formatDate(
                                profile.dateOfBirth
                            )
                        }
                    />

                    <InfoItem
                        label="Mobile Number"
                        value={
                            profile.mobile ||
                            student.mobile ||
                            'Not provided'
                        }
                    />

                    <InfoItem
                        label="State"
                        value={
                            profile.state ||
                            'Not provided'
                        }
                    />

                    <InfoItem
                        label="Address"
                        value={
                            profile.address ||
                            'Not provided'
                        }
                        fullWidth
                    />

                </InfoGrid>

            </section>


            {/* ====================================================
               ACADEMIC INFORMATION
            ==================================================== */}

            <section
                className="portal-card"
                style={{
                    padding:
                        '17px',
                    marginBottom:
                        '15px'
                }}
            >

                <SectionTitle
                    icon={
                        <GraduationCap
                            size={17}
                        />
                    }
                    title="Academic Information"
                />


                <InfoGrid>

                    <InfoItem
                        label="Registration Number"
                        value={
                            profile.registrationNumber ||
                            'Not provided'
                        }
                    />

                    <InfoItem
                        label="Course"
                        value={
                            profile.course ||
                            'Not provided'
                        }
                    />

                    <InfoItem
                        label="Department"
                        value={
                            profile.department ||
                            'Not provided'
                        }
                    />

                    <InfoItem
                        label="Academic Year"
                        value={
                            profile.academicYear ||
                            'Not provided'
                        }
                    />

                    <InfoItem
                        label="Current Semester"
                        value={
                            profile.currentSemester
                                ? `Semester ${profile.currentSemester}`
                                : 'Not provided'
                        }
                    />

                    <InfoItem
                        label="Category"
                        value={
                            profile.category ||
                            'Not provided'
                        }
                    />

                    <InfoItem
                        label="Previous Qualification"
                        value={
                            profile.previousQualification ||
                            'Not provided'
                        }
                    />

                    <InfoItem
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

                </InfoGrid>

            </section>


            {/* ====================================================
               FINANCIAL INFORMATION
            ==================================================== */}

            <section
                className="portal-card"
                style={{
                    padding:
                        '17px',
                    marginBottom:
                        '15px'
                }}
            >

                <SectionTitle
                    icon={
                        <WalletCards
                            size={17}
                        />
                    }
                    title="Financial Information"
                />


                <InfoGrid>

                    <InfoItem
                        label="Family Income"
                        value={
                            formatCurrency(
                                profile.familyIncome
                            )
                        }
                    />

                </InfoGrid>

            </section>


            {/* ====================================================
               BANK INFORMATION
            ==================================================== */}

            <section
                className="portal-card"
                style={{
                    padding:
                        '17px',
                    marginBottom:
                        '15px'
                }}
            >

                <SectionTitle
                    icon={
                        <Landmark
                            size={17}
                        />
                    }
                    title="Bank Information"
                />


                <InfoGrid>

                    <InfoItem
                        label="Bank Name"
                        value={
                            profile.bankName ||
                            'Not provided'
                        }
                    />

                    <InfoItem
                        label="Account Number"
                        value={
                            profile.bankAccountNumber ||
                            'Not provided'
                        }
                    />

                    <InfoItem
                        label="IFSC Code"
                        value={
                            profile.ifscCode ||
                            'Not provided'
                        }
                    />

                </InfoGrid>

            </section>


            {/* ====================================================
               SCHOLARSHIP APPLICATIONS
            ==================================================== */}

            <section
                className="portal-card"
                style={{
                    padding:
                        '17px'
                }}
            >

                <SectionTitle
                    icon={
                        <FileText
                            size={17}
                        />
                    }
                    title="Scholarship Applications"
                    count={
                        applications.length
                    }
                />


                {applications.length === 0 ? (

                    <div
                        style={{
                            padding:
                                '28px 10px',
                            textAlign:
                                'center',
                            color:
                                '#64748b',
                            fontSize:
                                '13px'
                        }}
                    >

                        <FileText
                            size={30}
                            color="#94a3b8"
                            style={{
                                margin:
                                    '0 auto 8px'
                            }}
                        />

                        No scholarship applications
                        found for this student.

                    </div>

                ) : (

                    <div
                        style={{
                            display:
                                'flex',
                            flexDirection:
                                'column',
                            gap:
                                '9px'
                        }}
                    >

                        {applications.map(
                            application => (

                                <div
                                    key={
                                        application._id
                                    }
                                    style={{
                                        border:
                                            '1px solid #e2e8f0',
                                        borderRadius:
                                            '9px',
                                        padding:
                                            '12px 13px',
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
                                                '220px',
                                            flex:
                                                1
                                        }}
                                    >

                                        <div
                                            style={{
                                                fontWeight:
                                                    700,
                                                color:
                                                    '#172033',
                                                fontSize:
                                                    '13px',
                                                marginBottom:
                                                    '4px'
                                            }}
                                        >

                                            {application.scholarship?.name ||
                                                'Scholarship'}

                                        </div>


                                        <div
                                            style={{
                                                display:
                                                    'flex',
                                                flexWrap:
                                                    'wrap',
                                                gap:
                                                    '7px',
                                                color:
                                                    '#64748b',
                                                fontSize:
                                                    '11px'
                                            }}
                                        >

                                            <span>

                                                Application:

                                                {' '}

                                                {application.applicationNumber ||
                                                    'Not generated'}

                                            </span>


                                            {application.scholarship?.academicYear && (

                                                <span>
                                                    •{' '}
                                                    {
                                                        application.scholarship.academicYear
                                                    }
                                                </span>

                                            )}

                                        </div>

                                    </div>


                                    <div
                                        style={{
                                            display:
                                                'flex',
                                            alignItems:
                                                'center',
                                            gap:
                                                '12px',
                                            flexWrap:
                                                'wrap'
                                        }}
                                    >

                                        <div
                                            style={{
                                                textAlign:
                                                    'right'
                                            }}
                                        >

                                            <div
                                                style={{
                                                    fontSize:
                                                        '11px',
                                                    color:
                                                        '#64748b',
                                                    marginBottom:
                                                        '3px'
                                                }}
                                            >
                                                Scholarship Amount
                                            </div>


                                            <div
                                                style={{
                                                    fontSize:
                                                        '13px',
                                                    fontWeight:
                                                        700,
                                                    color:
                                                        '#172033'
                                                }}
                                            >

                                                {formatCurrency(
                                                    application.scholarship?.scholarshipAmount
                                                )}

                                            </div>

                                        </div>


                                        <span
                                            className={`portal-status ${getStatusClass(
                                                application.status
                                            )}`}
                                            style={{
                                                fontSize:
                                                    '11px',
                                                padding:
                                                    '4px 8px',
                                                whiteSpace:
                                                    'nowrap'
                                            }}
                                        >
                                            {
                                                application.status ||
                                                'DRAFT'
                                            }
                                        </span>

                                    </div>


                                    <div
                                        style={{
                                            width:
                                                '100%',
                                            display:
                                                'flex',
                                            justifyContent:
                                                'space-between',
                                            alignItems:
                                                'center',
                                            paddingTop:
                                                '7px',
                                            borderTop:
                                                '1px solid #f1f5f9'
                                        }}
                                    >

                                        <div
                                            style={{
                                                display:
                                                    'flex',
                                                alignItems:
                                                    'center',
                                                gap:
                                                    '5px',
                                                color:
                                                    '#64748b',
                                                fontSize:
                                                    '11px'
                                            }}
                                        >

                                            <Clock3
                                                size={12}
                                            />

                                            Created:

                                            {' '}

                                            {
                                                formatDate(
                                                    application.createdAt
                                                )
                                            }

                                        </div>


                                        <button
                                            type="button"
                                            className="portal-button portal-button-secondary"
                                            onClick={() =>
                                                navigate(
                                                    `/admin/applications/${application._id}`
                                                )
                                            }
                                            style={{
                                                padding:
                                                    '6px 10px',
                                                fontSize:
                                                    '11px'
                                            }}
                                        >
                                            View Application
                                        </button>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </section>


            {/* ====================================================
               RESPONSIVE CSS
            ==================================================== */}

            <style>
                {`
                    .admin-student-info-grid {
                        display: grid;
                        grid-template-columns:
                            repeat(2, minmax(0, 1fr));
                        gap: 11px 24px;
                    }

                    @media (max-width: 700px) {

                        .admin-student-info-grid {
                            grid-template-columns:
                                1fr;
                        }
                    }

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


/* ============================================================
   SECTION TITLE
============================================================ */

const SectionTitle = ({
    icon,
    title,
    count
}) => {

    return (

        <div
            style={{
                display:
                    'flex',
                alignItems:
                    'center',
                justifyContent:
                    'space-between',
                gap:
                    '10px',
                paddingBottom:
                    '11px',
                marginBottom:
                    '13px',
                borderBottom:
                    '1px solid #e2e8f0'
            }}
        >

            <div
                style={{
                    display:
                        'flex',
                    alignItems:
                        'center',
                    gap:
                        '7px',
                    color:
                        '#174a8b',
                    fontWeight:
                        700,
                    fontSize:
                        '14px'
                }}
            >

                {icon}

                {title}

            </div>


            {count !== undefined && (

                <span
                    className="portal-status portal-status-info"
                    style={{
                        fontSize:
                            '11px'
                    }}
                >
                    {count}
                </span>

            )}

        </div>

    );

};


/* ============================================================
   INFORMATION GRID
============================================================ */

const InfoGrid = ({
    children
}) => {

    return (

        <div
            className="admin-student-info-grid"
        >

            {children}

        </div>

    );

};


/* ============================================================
   INFORMATION ITEM
============================================================ */

const InfoItem = ({
    label,
    value,
    valueClass,
    fullWidth
}) => {

    return (

        <div
            style={{
                gridColumn:
                    fullWidth
                        ? '1 / -1'
                        : undefined
            }}
        >

            <div
                style={{
                    color:
                        '#64748b',
                    fontSize:
                        '10px',
                    fontWeight:
                        700,
                    textTransform:
                        'uppercase',
                    letterSpacing:
                        '0.04em',
                    marginBottom:
                        '4px'
                }}
            >
                {label}
            </div>


            {valueClass ? (

                <span
                    className={`portal-status ${valueClass}`}
                    style={{
                        fontSize:
                            '11px'
                    }}
                >
                    {value}
                </span>

            ) : (

                <div
                    style={{
                        color:
                            '#172033',
                        fontSize:
                            '12px',
                        fontWeight:
                            600,
                        lineHeight:
                            1.5,
                        overflowWrap:
                            'anywhere'
                    }}
                >
                    {value}
                </div>

            )}

        </div>

    );

};


export default AdminStudentDetails;