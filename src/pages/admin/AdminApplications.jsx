import React, {
    useEffect,
    useState
} from 'react';

import {
    FileText,
    Search,
    RefreshCw,
    Eye,
    ShieldCheck,
    Clock3,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Loader2
} from 'lucide-react';

import {
    useNavigate
} from 'react-router-dom';

import API from '../../services/api';

import authService from '../../services/authService';


/* ============================================================
   STATUS HELPERS
============================================================ */

const getStatusClass = (status) => {

    switch (status) {

        case 'SUBMITTED':
            return 'portal-status portal-status-info';

        case 'UNDER VERIFICATION':
            return 'portal-status portal-status-warning';

        case 'CORRECTION REQUIRED':
            return 'portal-status portal-status-danger';

        case 'RESUBMITTED':
            return 'portal-status portal-status-info';

        case 'VERIFIED':
            return 'portal-status portal-status-success';

        case 'SANCTIONED':
            return 'portal-status portal-status-success';

        case 'DISBURSED':
            return 'portal-status portal-status-success';

        case 'REJECTED':
            return 'portal-status portal-status-danger';

        case 'DRAFT':
        default:
            return 'portal-status portal-status-neutral';
    }
};


/* ============================================================
   STATUS ICON
============================================================ */

const getStatusIcon = (status) => {

    switch (status) {

        case 'SUBMITTED':
            return <FileText size={14} />;

        case 'UNDER VERIFICATION':
            return <Clock3 size={14} />;

        case 'CORRECTION REQUIRED':
            return <AlertCircle size={14} />;

        case 'RESUBMITTED':
            return <RefreshCw size={14} />;

        case 'VERIFIED':
            return <CheckCircle2 size={14} />;

        case 'SANCTIONED':
            return <ShieldCheck size={14} />;

        case 'DISBURSED':
            return <CheckCircle2 size={14} />;

        case 'REJECTED':
            return <XCircle size={14} />;

        default:
            return <FileText size={14} />;
    }
};


/* ============================================================
   DATE FORMATTER
============================================================ */

const formatDate = (date) => {

    if (!date) {
        return '—';
    }

    const parsedDate =
        new Date(date);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return '—';
    }

    return parsedDate.toLocaleDateString(
        'en-IN',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }
    );
};


/* ============================================================
   ADMIN APPLICATIONS
============================================================ */

const AdminApplications = () => {

    const navigate =
        useNavigate();


    /* ========================================================
       STATE
    ======================================================== */

    const [
        applications,
        setApplications
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        refreshing,
        setRefreshing
    ] = useState(false);

    const [
        error,
        setError
    ] = useState('');

    const [
        search,
        setSearch
    ] = useState('');

    const [
        statusFilter,
        setStatusFilter
    ] = useState('');


    /* ========================================================
       FETCH APPLICATIONS
    ======================================================== */

    const fetchApplications = async (
        showRefreshLoader = false
    ) => {

        try {

            if (showRefreshLoader) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError('');

            const token =
                authService.getToken();

            if (!token) {

                navigate('/login');

                return;
            }

            const params = {};

            if (statusFilter) {
                params.status =
                    statusFilter;
            }

            const response =
                await API.get(
                    '/admin/applications',
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        },
                        params
                    }
                );

            setApplications(
                Array.isArray(
                    response.data.applications
                )
                    ? response.data.applications
                    : []
            );

        } catch (requestError) {

            console.error(
                'Admin applications error:',
                requestError
            );

            if (
                requestError.response &&
                requestError.response.status === 401
            ) {

                authService.logout();

                navigate('/login');

                return;
            }

            if (
                requestError.response &&
                requestError.response.status === 403
            ) {

                setError(
                    'You do not have permission to access admin applications.'
                );

                return;
            }

            if (
                requestError.response &&
                requestError.response.data &&
                requestError.response.data.message
            ) {

                setError(
                    requestError.response.data.message
                );

            } else {

                setError(
                    'Unable to load scholarship applications.'
                );
            }

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };


    /* ========================================================
       INITIAL LOAD + FILTER CHANGE
    ======================================================== */

    useEffect(() => {

        fetchApplications();

    }, [statusFilter]);


    /* ========================================================
       SEARCH
    ======================================================== */

    const filteredApplications =
        applications.filter(
            (application) => {

                const searchText =
                    search
                        .trim()
                        .toLowerCase();

                if (!searchText) {
                    return true;
                }

                const student =
                    application.student || {};

                const scholarship =
                    application.scholarship || {};

                const applicant =
                    application.applicantDetails || {};

                return (
                    String(
                        application.applicationNumber ||
                        ''
                    )
                        .toLowerCase()
                        .includes(searchText)
                    ||
                    String(
                        student.name ||
                        ''
                    )
                        .toLowerCase()
                        .includes(searchText)
                    ||
                    String(
                        student.email ||
                        ''
                    )
                        .toLowerCase()
                        .includes(searchText)
                    ||
                    String(
                        applicant.fullName ||
                        ''
                    )
                        .toLowerCase()
                        .includes(searchText)
                    ||
                    String(
                        applicant.registrationNumber ||
                        ''
                    )
                        .toLowerCase()
                        .includes(searchText)
                    ||
                    String(
                        scholarship.name ||
                        ''
                    )
                        .toLowerCase()
                        .includes(searchText)
                );
            }
        );


    /* ========================================================
       RENDER
    ======================================================== */

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#f5f7fb',
                padding: '30px 0 50px'
            }}
        >

            <div className="portal-container">

                {/* =================================================
                    HEADER
                ================================================== */}

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '20px',
                        marginBottom: '26px',
                        flexWrap: 'wrap'
                    }}
                >

                    <div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '8px'
                            }}
                        >

                            <div
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '10px',
                                    background: '#174a8b',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <FileText size={22} />
                            </div>

                            <div>

                                <h1
                                    className="portal-heading"
                                    style={{
                                        fontSize: '28px'
                                    }}
                                >
                                    Scholarship Applications
                                </h1>

                                <p
                                    className="portal-text"
                                    style={{
                                        margin: '4px 0 0'
                                    }}
                                >
                                    Review and verify student scholarship applications.
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        REFRESH
                    ================================================== */}

                    <button
                        type="button"
                        className="portal-button portal-button-secondary"
                        onClick={() =>
                            fetchApplications(true)
                        }
                        disabled={refreshing}
                    >

                        {refreshing ? (
                            <Loader2
                                size={16}
                                style={{
                                    marginRight: '7px',
                                    verticalAlign: 'middle',
                                    animation:
                                        'adminApplicationsSpin 1s linear infinite'
                                }}
                            />
                        ) : (
                            <RefreshCw
                                size={16}
                                style={{
                                    marginRight: '7px',
                                    verticalAlign: 'middle'
                                }}
                            />
                        )}

                        Refresh

                    </button>

                </div>


                {/* =================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div
                        style={{
                            marginBottom: '20px',
                            padding: '13px 15px',
                            borderRadius: '9px',
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            color: '#991b1b',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            lineHeight: 1.5
                        }}
                    >

                        <AlertCircle
                            size={18}
                            style={{
                                flexShrink: 0,
                                marginTop: '2px'
                            }}
                        />

                        <span>
                            {error}
                        </span>

                    </div>

                )}


                {/* =================================================
                    FILTERS
                ================================================== */}

                <div
                    className="portal-card"
                    style={{
                        padding: '18px',
                        marginBottom: '20px'
                    }}
                >

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'minmax(240px, 1fr) 220px',
                            gap: '14px'
                        }}
                    >

                        {/* SEARCH */}

                        <div
                            style={{
                                position: 'relative'
                            }}
                        >

                            <Search
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: '13px',
                                    top: '50%',
                                    transform:
                                        'translateY(-50%)',
                                    color: '#64748b'
                                }}
                            />

                            <input
                                type="text"
                                className="portal-input"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search by application number, student, registration number..."
                                style={{
                                    paddingLeft: '40px'
                                }}
                            />

                        </div>


                        {/* STATUS FILTER */}

                        <select
                            className="portal-select"
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                        >

                            <option value="">
                                All Statuses
                            </option>

                            <option value="SUBMITTED">
                                Submitted
                            </option>

                            <option value="UNDER VERIFICATION">
                                Under Verification
                            </option>

                            <option value="CORRECTION REQUIRED">
                                Correction Required
                            </option>

                            <option value="RESUBMITTED">
                                Resubmitted
                            </option>

                            <option value="VERIFIED">
                                Verified
                            </option>

                            <option value="SANCTIONED">
                                Sanctioned
                            </option>

                            <option value="DISBURSED">
                                Disbursed
                            </option>

                            <option value="REJECTED">
                                Rejected
                            </option>

                        </select>

                    </div>

                </div>


                {/* =================================================
                    SUMMARY
                ================================================== */}

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(4, minmax(0, 1fr))',
                        gap: '14px',
                        marginBottom: '22px'
                    }}
                >

                    <div
                        className="portal-card"
                        style={{
                            padding: '17px'
                        }}
                    >

                        <p
                            style={{
                                margin: 0,
                                color: '#64748b',
                                fontSize: '13px',
                                fontWeight: 600
                            }}
                        >
                            Applications
                        </p>

                        <h2
                            style={{
                                margin: '6px 0 0',
                                fontSize: '25px',
                                color: '#172033'
                            }}
                        >
                            {applications.length}
                        </h2>

                    </div>


                    <div
                        className="portal-card"
                        style={{
                            padding: '17px'
                        }}
                    >

                        <p
                            style={{
                                margin: 0,
                                color: '#64748b',
                                fontSize: '13px',
                                fontWeight: 600
                            }}
                        >
                            Submitted
                        </p>

                        <h2
                            style={{
                                margin: '6px 0 0',
                                fontSize: '25px',
                                color: '#1d4ed8'
                            }}
                        >
                            {
                                applications.filter(
                                    (application) =>
                                        application.status ===
                                        'SUBMITTED'
                                ).length
                            }
                        </h2>

                    </div>


                    <div
                        className="portal-card"
                        style={{
                            padding: '17px'
                        }}
                    >

                        <p
                            style={{
                                margin: 0,
                                color: '#64748b',
                                fontSize: '13px',
                                fontWeight: 600
                            }}
                        >
                            Under Verification
                        </p>

                        <h2
                            style={{
                                margin: '6px 0 0',
                                fontSize: '25px',
                                color: '#b45309'
                            }}
                        >
                            {
                                applications.filter(
                                    (application) =>
                                        application.status ===
                                        'UNDER VERIFICATION'
                                ).length
                            }
                        </h2>

                    </div>


                    <div
                        className="portal-card"
                        style={{
                            padding: '17px'
                        }}
                    >

                        <p
                            style={{
                                margin: 0,
                                color: '#64748b',
                                fontSize: '13px',
                                fontWeight: 600
                            }}
                        >
                            Verified
                        </p>

                        <h2
                            style={{
                                margin: '6px 0 0',
                                fontSize: '25px',
                                color: '#15803d'
                            }}
                        >
                            {
                                applications.filter(
                                    (application) =>
                                        application.status ===
                                        'VERIFIED'
                                ).length
                            }
                        </h2>

                    </div>

                </div>


                {/* =================================================
                    APPLICATION LIST
                ================================================== */}

                {loading ? (

                    <div
                        className="portal-card"
                        style={{
                            padding: '50px 20px',
                            textAlign: 'center'
                        }}
                    >

                        <Loader2
                            size={30}
                            style={{
                                color: '#174a8b',
                                animation:
                                    'adminApplicationsSpin 1s linear infinite'
                            }}
                        />

                        <p
                            className="portal-text"
                            style={{
                                margin:
                                    '14px 0 0'
                            }}
                        >
                            Loading scholarship applications...
                        </p>

                    </div>

                ) : filteredApplications.length === 0 ? (

                    <div
                        className="portal-card"
                        style={{
                            padding: '55px 20px',
                            textAlign: 'center'
                        }}
                    >

                        <FileText
                            size={40}
                            style={{
                                color: '#94a3b8'
                            }}
                        />

                        <h3
                            style={{
                                margin:
                                    '14px 0 7px',
                                color: '#172033'
                            }}
                        >
                            No Applications Found
                        </h3>

                        <p
                            className="portal-text"
                            style={{
                                margin: 0
                            }}
                        >
                            No scholarship applications match the current search or filter.
                        </p>

                    </div>

                ) : (

                    <div
                        style={{
                            display: 'grid',
                            gap: '14px'
                        }}
                    >

                        {filteredApplications.map(
                            (application) => {

                                const student =
                                    application.student ||
                                    {};

                                const scholarship =
                                    application.scholarship ||
                                    {};

                                const applicant =
                                    application.applicantDetails ||
                                    {};

                                return (

                                    <div
                                        key={
                                            application._id
                                        }
                                        className="portal-card"
                                        style={{
                                            padding: '20px'
                                        }}
                                    >

                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent:
                                                    'space-between',
                                                alignItems:
                                                    'flex-start',
                                                gap: '18px',
                                                flexWrap:
                                                    'wrap'
                                            }}
                                        >

                                            {/* =================================
                                                APPLICATION INFORMATION
                                            ================================== */}

                                            <div
                                                style={{
                                                    flex: 1,
                                                    minWidth:
                                                        '260px'
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        display:
                                                            'flex',
                                                        alignItems:
                                                            'center',
                                                        gap: '9px',
                                                        marginBottom:
                                                            '8px'
                                                    }}
                                                >

                                                    <h3
                                                        style={{
                                                            margin: 0,
                                                            color:
                                                                '#172033',
                                                            fontSize:
                                                                '17px'
                                                        }}
                                                    >
                                                        {
                                                            scholarship.name ||
                                                            'Scholarship Application'
                                                        }
                                                    </h3>

                                                </div>


                                                <p
                                                    style={{
                                                        margin:
                                                            '0 0 12px',
                                                        color:
                                                            '#64748b',
                                                        fontSize:
                                                            '13px'
                                                    }}
                                                >
                                                    Application No:
                                                    {' '}
                                                    <strong
                                                        style={{
                                                            color:
                                                                '#334155'
                                                        }}
                                                    >
                                                        {
                                                            application.applicationNumber ||
                                                            'Not assigned'
                                                        }
                                                    </strong>
                                                </p>


                                                <div
                                                    style={{
                                                        display:
                                                            'grid',
                                                        gridTemplateColumns:
                                                            'repeat(3, minmax(0, 1fr))',
                                                        gap:
                                                            '14px'
                                                    }}
                                                >

                                                    <div>

                                                        <p
                                                            style={{
                                                                margin:
                                                                    0,
                                                                color:
                                                                    '#94a3b8',
                                                                fontSize:
                                                                    '11px',
                                                                fontWeight:
                                                                    700,
                                                                textTransform:
                                                                    'uppercase',
                                                                letterSpacing:
                                                                    '0.04em'
                                                            }}
                                                        >
                                                            Student
                                                        </p>

                                                        <p
                                                            style={{
                                                                margin:
                                                                    '4px 0 0',
                                                                color:
                                                                    '#334155',
                                                                fontSize:
                                                                    '14px',
                                                                fontWeight:
                                                                    600
                                                            }}
                                                        >
                                                            {
                                                                applicant.fullName ||
                                                                student.name ||
                                                                '—'
                                                            }
                                                        </p>

                                                    </div>


                                                    <div>

                                                        <p
                                                            style={{
                                                                margin:
                                                                    0,
                                                                color:
                                                                    '#94a3b8',
                                                                fontSize:
                                                                    '11px',
                                                                fontWeight:
                                                                    700,
                                                                textTransform:
                                                                    'uppercase',
                                                                letterSpacing:
                                                                    '0.04em'
                                                            }}
                                                        >
                                                            Registration
                                                        </p>

                                                        <p
                                                            style={{
                                                                margin:
                                                                    '4px 0 0',
                                                                color:
                                                                    '#334155',
                                                                fontSize:
                                                                    '14px',
                                                                fontWeight:
                                                                    600
                                                            }}
                                                        >
                                                            {
                                                                applicant.registrationNumber ||
                                                                '—'
                                                            }
                                                        </p>

                                                    </div>


                                                    <div>

                                                        <p
                                                            style={{
                                                                margin:
                                                                    0,
                                                                color:
                                                                    '#94a3b8',
                                                                fontSize:
                                                                    '11px',
                                                                fontWeight:
                                                                    700,
                                                                textTransform:
                                                                    'uppercase',
                                                                letterSpacing:
                                                                    '0.04em'
                                                            }}
                                                        >
                                                            Submitted
                                                        </p>

                                                        <p
                                                            style={{
                                                                margin:
                                                                    '4px 0 0',
                                                                color:
                                                                    '#334155',
                                                                fontSize:
                                                                    '14px',
                                                                fontWeight:
                                                                    600
                                                            }}
                                                        >
                                                            {
                                                                formatDate(
                                                                    application.submittedAt
                                                                )
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>


                                            {/* =================================
                                                STATUS + ACTION
                                            ================================== */}

                                            <div
                                                style={{
                                                    display:
                                                        'flex',
                                                    flexDirection:
                                                        'column',
                                                    alignItems:
                                                        'flex-end',
                                                    gap:
                                                        '12px'
                                                }}
                                            >

                                                <span
                                                    className={
                                                        getStatusClass(
                                                            application.status
                                                        )
                                                    }
                                                    style={{
                                                        display:
                                                            'inline-flex',
                                                        alignItems:
                                                            'center',
                                                        gap:
                                                            '5px'
                                                    }}
                                                >

                                                    {
                                                        getStatusIcon(
                                                            application.status
                                                        )
                                                    }

                                                    {
                                                        application.status ||
                                                        'DRAFT'
                                                    }

                                                </span>


                                                <button
                                                    type="button"
                                                    className="portal-button portal-button-primary"
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/applications/${application._id}`
                                                        )
                                                    }
                                                >

                                                    <Eye
                                                        size={16}
                                                        style={{
                                                            marginRight:
                                                                '7px',
                                                            verticalAlign:
                                                                'middle'
                                                        }}
                                                    />

                                                    Review Application

                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                );
                            }
                        )}

                    </div>

                )}

            </div>


            {/* =====================================================
                LOCAL ANIMATION
            ====================================================== */}

            <style>
                {`
                    @keyframes adminApplicationsSpin {
                        from {
                            transform: rotate(0deg);
                        }

                        to {
                            transform: rotate(360deg);
                        }
                    }

                    @media (max-width: 900px) {

                        .portal-container > div {
                            max-width: 100%;
                        }

                    }

                    @media (max-width: 760px) {

                        .portal-card {
                            overflow: hidden;
                        }

                        .portal-card > div {
                            grid-template-columns:
                                1fr !important;
                        }

                    }
                `}
            </style>

        </div>
    );
};

export default AdminApplications;