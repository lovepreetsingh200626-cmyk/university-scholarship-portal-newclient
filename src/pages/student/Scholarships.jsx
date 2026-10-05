import React, {
    useEffect,
    useMemo,
    useState
} from 'react';

import {
    ArrowLeft,
    BookOpen,
    CalendarDays,
    ChevronRight,
    Clock3,
    FileText,
    GraduationCap,
    IndianRupee,
    Search,
    ShieldCheck
} from 'lucide-react';

import {
    useNavigate
} from 'react-router-dom';

import API from '../../services/api';
import authService from '../../services/authService';


/* ============================================================
   SCHOLARSHIPS PAGE
============================================================ */

const Scholarships = () => {

    const navigate = useNavigate();

    const [
        scholarships,
        setScholarships
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState('');

    const [
        searchTerm,
        setSearchTerm
    ] = useState('');


    /* ========================================================
       LOAD SCHOLARSHIPS
    ======================================================== */

    useEffect(() => {

        let mounted = true;

        const loadScholarships = async () => {

            try {

                setLoading(true);
                setError('');

                if (
                    !authService.isAuthenticated()
                ) {
                    navigate('/login', {
                        replace: true
                    });

                    return;
                }

                /*
                 * api.js automatically attaches:
                 *
                 * Authorization:
                 * Bearer <token>
                 *
                 * Therefore we do not manually
                 * attach the token here.
                 */

                const response =
                    await API.get(
                        '/scholarships'
                    );

                if (!mounted) {
                    return;
                }

                const data =
                    response.data;

                if (
                    data &&
                    Array.isArray(
                        data.scholarships
                    )
                ) {
                    setScholarships(
                        data.scholarships
                    );
                } else {
                    setScholarships([]);
                }

            } catch (requestError) {

                if (!mounted) {
                    return;
                }

                console.error(
                    'Scholarship loading error:',
                    requestError
                );

                if (
                    requestError.response &&
                    requestError.response.status === 401
                ) {
                    authService.logout();

                    navigate('/login', {
                        replace: true
                    });

                    return;
                }

                setError(
                    requestError
                        ?.response
                        ?.data
                        ?.message ||
                    'Unable to load scholarships. Please try again.'
                );

            } finally {

                if (mounted) {
                    setLoading(false);
                }

            }
        };

        loadScholarships();

        return () => {
            mounted = false;
        };

    }, [navigate]);


    /* ========================================================
       DATE FORMATTER
    ======================================================== */

    const formatDate = (
        date
    ) => {

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
                month: 'short',
                year: 'numeric'
            }
        );
    };


    /* ========================================================
       DEADLINE INFORMATION
    ======================================================== */

    const getDeadlineStatus = (
        endDate
    ) => {

        if (!endDate) {
            return 'Deadline not specified';
        }

        const deadline =
            new Date(endDate);

        if (
            Number.isNaN(
                deadline.getTime()
            )
        ) {
            return 'Deadline not specified';
        }

        const today =
            new Date();

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
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );

        if (
            daysRemaining < 0
        ) {
            return 'Application closed';
        }

        if (
            daysRemaining === 0
        ) {
            return 'Deadline is today';
        }

        if (
            daysRemaining === 1
        ) {
            return '1 day remaining';
        }

        return `${daysRemaining} days remaining`;
    };


    /* ========================================================
       CHECK WHETHER DEADLINE HAS PASSED
    ======================================================== */

    const isDeadlinePassed = (
        endDate
    ) => {

        if (!endDate) {
            return false;
        }

        const deadline =
            new Date(endDate);

        if (
            Number.isNaN(
                deadline.getTime()
            )
        ) {
            return false;
        }

        const today =
            new Date();

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

        return (
            deadline.getTime() <
            today.getTime()
        );
    };


    /* ========================================================
       FILTER SCHOLARSHIPS
    ======================================================== */

    const filteredScholarships =
        useMemo(() => {

            const search =
                searchTerm
                    .trim()
                    .toLowerCase();

            if (!search) {
                return scholarships;
            }

            return scholarships.filter(
                (
                    scholarship
                ) => {

                    const name =
                        scholarship.name ||
                        '';

                    const description =
                        scholarship.description ||
                        '';

                    const academicYear =
                        scholarship.academicYear ||
                        '';

                    const courses =
                        Array.isArray(
                            scholarship.eligibleCourses
                        )
                            ? scholarship
                                .eligibleCourses
                                .join(' ')
                            : '';

                    const departments =
                        Array.isArray(
                            scholarship.eligibleDepartments
                        )
                            ? scholarship
                                .eligibleDepartments
                                .join(' ')
                            : '';

                    const categories =
                        Array.isArray(
                            scholarship.eligibleCategories
                        )
                            ? scholarship
                                .eligibleCategories
                                .join(' ')
                            : '';

                    return (
                        name
                            .toLowerCase()
                            .includes(search) ||

                        description
                            .toLowerCase()
                            .includes(search) ||

                        academicYear
                            .toLowerCase()
                            .includes(search) ||

                        courses
                            .toLowerCase()
                            .includes(search) ||

                        departments
                            .toLowerCase()
                            .includes(search) ||

                        categories
                            .toLowerCase()
                            .includes(search)
                    );
                }
            );

        }, [
            scholarships,
            searchTerm
        ]);


    /* ========================================================
       OPEN SCHOLARSHIP
    ======================================================== */

    const openScholarship = (
        id
    ) => {

        if (!id) {
            return;
        }

        navigate(
            `/student/scholarships/${id}`
        );
    };


    /* ========================================================
       LOADING STATE
    ======================================================== */

    if (loading) {

        return (
            <div
                style={{
                    minHeight:
                        '100vh',
                    background:
                        '#f5f7fb'
                }}
            >

                <div
                    className="portal-container"
                    style={{
                        paddingTop:
                            '50px',
                        paddingBottom:
                            '50px'
                    }}
                >

                    <div
                        className="portal-card"
                        style={{
                            padding:
                                '50px',
                            textAlign:
                                'center'
                        }}
                    >

                        <Clock3
                            size={32}
                            style={{
                                color:
                                    '#174a8b',
                                margin:
                                    '0 auto 16px'
                            }}
                        />

                        <h2
                            className="portal-heading"
                            style={{
                                fontSize:
                                    '24px'
                            }}
                        >
                            Loading Scholarships
                        </h2>

                        <p
                            className="portal-text"
                            style={{
                                marginBottom:
                                    0
                            }}
                        >
                            Please wait while we load
                            available scholarships.
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    /* ========================================================
       MAIN PAGE
    ======================================================== */

    return (
        <div
            style={{
                minHeight:
                    '100vh',
                background:
                    '#f5f7fb'
            }}
        >

            {/* =================================================
                HEADER
            ================================================== */}

            <header
                style={{
                    background:
                        '#ffffff',
                    borderBottom:
                        '1px solid #e2e8f0',
                    boxShadow:
                        '0 2px 10px rgba(15, 23, 42, 0.04)'
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
                            className="brand-emblem"
                        >
                            <BookOpen
                                size={21}
                            />
                        </div>

                        <div>

                            <h1
                                style={{
                                    margin:
                                        0,
                                    color:
                                        '#172033',
                                    fontSize:
                                        '18px',
                                    fontWeight:
                                        700
                                }}
                            >
                                University Scholarship Portal
                            </h1>

                            <p
                                style={{
                                    margin:
                                        '3px 0 0',
                                    color:
                                        '#64748b',
                                    fontSize:
                                        '12px'
                                }}
                            >
                                Available Scholarships
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        className="portal-button portal-button-secondary"
                        onClick={() =>
                            navigate('/student')
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

                        Dashboard

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
                        paddingTop:
                            '42px',
                        paddingBottom:
                            '60px'
                    }}
                >

                    {/* =================================================
                        PAGE INTRO
                    ================================================== */}

                    <div
                        style={{
                            marginBottom:
                                '28px'
                        }}
                    >

                        <div
                            style={{
                                display:
                                    'inline-flex',
                                alignItems:
                                    'center',
                                gap:
                                    '7px',
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

                            <ShieldCheck
                                size={14}
                            />

                            Official Scholarship Services

                        </div>

                        <h2
                            className="portal-heading"
                            style={{
                                fontSize:
                                    'clamp(30px, 4vw, 42px)'
                            }}
                        >
                            Available Scholarships
                        </h2>

                        <p
                            className="portal-text"
                            style={{
                                maxWidth:
                                    '720px',
                                margin:
                                    '10px 0 0'
                            }}
                        >
                            Explore scholarships published
                            by the university, review their
                            eligibility requirements and
                            application deadlines.
                        </p>

                    </div>


                    {/* =================================================
                        ERROR
                    ================================================== */}

                    {error && (

                        <div
                            style={{
                                marginBottom:
                                    '24px',
                                padding:
                                    '14px 16px',
                                borderRadius:
                                    '9px',
                                background:
                                    '#fee2e2',
                                border:
                                    '1px solid #fecaca',
                                color:
                                    '#991b1b',
                                fontSize:
                                    '14px',
                                lineHeight:
                                    1.5
                            }}
                        >
                            {error}
                        </div>

                    )}


                    {/* =================================================
                        SEARCH
                    ================================================== */}

                    <div
                        className="portal-card"
                        style={{
                            marginBottom:
                                '28px',
                            padding:
                                '16px'
                        }}
                    >

                        <div
                            style={{
                                position:
                                    'relative'
                            }}
                        >

                            <Search
                                size={19}
                                style={{
                                    position:
                                        'absolute',
                                    left:
                                        '14px',
                                    top:
                                        '50%',
                                    transform:
                                        'translateY(-50%)',
                                    color:
                                        '#64748b'
                                }}
                            />

                            <input
                                type="text"
                                className="portal-input"
                                value={
                                    searchTerm
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                                placeholder="Search scholarships by name, course, department or academic year..."
                                style={{
                                    paddingLeft:
                                        '44px'
                                }}
                            />

                        </div>

                    </div>


                    {/* =================================================
                        RESULT COUNT
                    ================================================== */}

                    <div
                        style={{
                            display:
                                'flex',
                            alignItems:
                                'center',
                            justifyContent:
                                'space-between',
                            gap:
                                '15px',
                            marginBottom:
                                '18px'
                        }}
                    >

                        <h3
                            style={{
                                margin:
                                    0,
                                color:
                                    '#172033',
                                fontSize:
                                    '18px'
                            }}
                        >
                            Scholarships
                        </h3>

                        <span
                            className="portal-status portal-status-neutral"
                        >
                            {filteredScholarships.length}{' '}
                            {
                                filteredScholarships.length ===
                                1
                                    ? 'scholarship'
                                    : 'scholarships'
                            }
                        </span>

                    </div>


                    {/* =================================================
                        EMPTY STATE
                    ================================================== */}

                    {filteredScholarships.length === 0 && (

                        <div
                            className="portal-card"
                            style={{
                                padding:
                                    '55px 25px',
                                textAlign:
                                    'center'
                            }}
                        >

                            <FileText
                                size={40}
                                style={{
                                    color:
                                        '#94a3b8',
                                    margin:
                                        '0 auto 16px'
                                }}
                            />

                            <h3
                                style={{
                                    margin:
                                        '0 0 8px',
                                    color:
                                        '#172033',
                                    fontSize:
                                        '20px'
                                }}
                            >
                                No Scholarships Found
                            </h3>

                            <p
                                className="portal-text"
                                style={{
                                    maxWidth:
                                        '500px',
                                    margin:
                                        '0 auto'
                                }}
                            >
                                {searchTerm
                                    ? 'No scholarships match your search. Try a different search term.'
                                    : 'There are currently no published scholarships available.'}
                            </p>

                        </div>

                    )}


                    {/* =================================================
                        SCHOLARSHIP CARDS
                    ================================================== */}

                    {filteredScholarships.length > 0 && (

                        <div
                            style={{
                                display:
                                    'grid',
                                gridTemplateColumns:
                                    'repeat(auto-fit, minmax(320px, 1fr))',
                                gap:
                                    '20px'
                            }}
                        >

                            {filteredScholarships.map(
                                (
                                    scholarship
                                ) => {

                                    const deadlinePassed =
                                        isDeadlinePassed(
                                            scholarship.applicationEndDate
                                        );

                                    return (

                                        <div
                                            key={
                                                scholarship._id
                                            }
                                            className="portal-card"
                                            style={{
                                                padding:
                                                    '24px',
                                                display:
                                                    'flex',
                                                flexDirection:
                                                    'column',
                                                transition:
                                                    'transform 0.2s ease, box-shadow 0.2s ease'
                                            }}
                                        >

                                            {/* ============================
                                                CARD HEADER
                                            ============================= */}

                                            <div
                                                style={{
                                                    display:
                                                        'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems:
                                                        'flex-start',
                                                    gap:
                                                        '15px',
                                                    marginBottom:
                                                        '16px'
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        width:
                                                            '46px',
                                                        height:
                                                            '46px',
                                                        flexShrink:
                                                            0,
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
                                                        size={22}
                                                    />
                                                </div>

                                                <span
                                                    className={
                                                        deadlinePassed
                                                            ? 'portal-status portal-status-danger'
                                                            : 'portal-status portal-status-success'
                                                    }
                                                >
                                                    {
                                                        deadlinePassed
                                                            ? 'Closed'
                                                            : 'Published'
                                                    }
                                                </span>

                                            </div>


                                            {/* ============================
                                                NAME
                                            ============================= */}

                                            <h3
                                                style={{
                                                    margin:
                                                        '0 0 9px',
                                                    color:
                                                        '#172033',
                                                    fontSize:
                                                        '20px',
                                                    lineHeight:
                                                        1.35
                                                }}
                                            >
                                                {
                                                    scholarship.name
                                                }
                                            </h3>


                                            {/* ============================
                                                DESCRIPTION
                                            ============================= */}

                                            <p
                                                style={{
                                                    margin:
                                                        '0 0 20px',
                                                    color:
                                                        '#64748b',
                                                    fontSize:
                                                        '14px',
                                                    lineHeight:
                                                        1.7
                                                }}
                                            >
                                                {
                                                    scholarship.description ||
                                                    'No description provided.'
                                                }
                                            </p>


                                            {/* ============================
                                                DETAILS
                                            ============================= */}

                                            <div
                                                style={{
                                                    display:
                                                        'grid',
                                                    gridTemplateColumns:
                                                        '1fr 1fr',
                                                    gap:
                                                        '12px',
                                                    marginBottom:
                                                        '20px'
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        padding:
                                                            '12px',
                                                        borderRadius:
                                                            '8px',
                                                        background:
                                                            '#f8fafc'
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
                                                            marginBottom:
                                                                '5px',
                                                            color:
                                                                '#64748b',
                                                            fontSize:
                                                                '12px'
                                                        }}
                                                    >

                                                        <IndianRupee
                                                            size={14}
                                                        />

                                                        Scholarship Amount

                                                    </div>

                                                    <strong
                                                        style={{
                                                            color:
                                                                '#172033',
                                                            fontSize:
                                                                '16px'
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
                                                    style={{
                                                        padding:
                                                            '12px',
                                                        borderRadius:
                                                            '8px',
                                                        background:
                                                            '#f8fafc'
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
                                                            marginBottom:
                                                                '5px',
                                                            color:
                                                                '#64748b',
                                                            fontSize:
                                                                '12px'
                                                        }}
                                                    >

                                                        <CalendarDays
                                                            size={14}
                                                        />

                                                        Academic Year

                                                    </div>

                                                    <strong
                                                        style={{
                                                            color:
                                                                '#172033',
                                                            fontSize:
                                                                '15px'
                                                        }}
                                                    >
                                                        {
                                                            scholarship.academicYear ||
                                                            'Not specified'
                                                        }
                                                    </strong>

                                                </div>

                                            </div>


                                            {/* ============================
                                                ELIGIBILITY SUMMARY
                                            ============================= */}

                                            <div
                                                style={{
                                                    marginBottom:
                                                        '20px'
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        marginBottom:
                                                            '8px',
                                                        color:
                                                            '#334155',
                                                        fontSize:
                                                            '13px',
                                                        fontWeight:
                                                            700
                                                    }}
                                                >
                                                    Eligibility
                                                </div>

                                                <div
                                                    style={{
                                                        display:
                                                            'flex',
                                                        flexWrap:
                                                            'wrap',
                                                        gap:
                                                            '6px'
                                                    }}
                                                >

                                                    {Number(
                                                        scholarship.minimumPercentage
                                                    ) > 0 && (

                                                        <span
                                                            className="portal-status portal-status-info"
                                                        >
                                                            Min.{' '}
                                                            {
                                                                scholarship.minimumPercentage
                                                            }
                                                            %
                                                        </span>

                                                    )}


                                                    {Array.isArray(
                                                        scholarship.eligibleCategories
                                                    ) &&
                                                    scholarship
                                                        .eligibleCategories
                                                        .length > 0 && (

                                                        <span
                                                            className="portal-status portal-status-neutral"
                                                        >
                                                            {
                                                                scholarship
                                                                    .eligibleCategories
                                                                    .join(
                                                                        ', '
                                                                    )
                                                            }
                                                        </span>

                                                    )}


                                                    {Array.isArray(
                                                        scholarship.eligibleCourses
                                                    ) &&
                                                    scholarship
                                                        .eligibleCourses
                                                        .length > 0 && (

                                                        <span
                                                            className="portal-status portal-status-neutral"
                                                        >
                                                            {
                                                                scholarship
                                                                    .eligibleCourses
                                                                    .join(
                                                                        ', '
                                                                    )
                                                            }
                                                        </span>

                                                    )}


                                                    {Array.isArray(
                                                        scholarship.eligibleDepartments
                                                    ) &&
                                                    scholarship
                                                        .eligibleDepartments
                                                        .length > 0 && (

                                                        <span
                                                            className="portal-status portal-status-neutral"
                                                        >
                                                            {
                                                                scholarship
                                                                    .eligibleDepartments
                                                                    .join(
                                                                        ', '
                                                                    )
                                                            }
                                                        </span>

                                                    )}

                                                </div>

                                            </div>


                                            {/* ============================
                                                DEADLINE
                                            ============================= */}

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
                                                    marginTop:
                                                        'auto',
                                                    marginBottom:
                                                        '18px',
                                                    paddingTop:
                                                        '15px',
                                                    borderTop:
                                                        '1px solid #e2e8f0'
                                                }}
                                            >

                                                <div>

                                                    <div
                                                        style={{
                                                            display:
                                                                'flex',
                                                            alignItems:
                                                                'center',
                                                            gap:
                                                                '6px',
                                                            color:
                                                                '#64748b',
                                                            fontSize:
                                                                '12px',
                                                            marginBottom:
                                                                '4px'
                                                        }}
                                                    >

                                                        <CalendarDays
                                                            size={14}
                                                        />

                                                        Application Deadline

                                                    </div>

                                                    <strong
                                                        style={{
                                                            color:
                                                                '#172033',
                                                            fontSize:
                                                                '14px'
                                                        }}
                                                    >
                                                        {formatDate(
                                                            scholarship.applicationEndDate
                                                        )}
                                                    </strong>

                                                </div>


                                                <span
                                                    className={
                                                        deadlinePassed
                                                            ? 'portal-status portal-status-danger'
                                                            : 'portal-status portal-status-warning'
                                                    }
                                                >
                                                    {
                                                        getDeadlineStatus(
                                                            scholarship.applicationEndDate
                                                        )
                                                    }
                                                </span>

                                            </div>


                                            {/* ============================
                                                VIEW BUTTON
                                            ============================= */}

                                            <button
                                                type="button"
                                                className="portal-button portal-button-primary"
                                                onClick={() =>
                                                    openScholarship(
                                                        scholarship._id
                                                    )
                                                }
                                                style={{
                                                    width:
                                                        '100%',
                                                    display:
                                                        'flex',
                                                    alignItems:
                                                        'center',
                                                    justifyContent:
                                                        'center'
                                                }}
                                            >

                                                View Scholarship

                                                <ChevronRight
                                                    size={17}
                                                    style={{
                                                        marginLeft:
                                                            '7px'
                                                    }}
                                                />

                                            </button>

                                        </div>

                                    );
                                }
                            )}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
};


export default Scholarships;