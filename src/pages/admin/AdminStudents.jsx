import React, {
    useEffect,
    useMemo,
    useState
} from 'react';

import {
    Search,
    Users,
    UserCircle,
    GraduationCap,
    FileText,
    Eye,
    RefreshCw,
    CheckCircle2,
    XCircle,
    ChevronRight
} from 'lucide-react';

import {
    useNavigate
} from 'react-router-dom';

import API from '../../services/api';

import authService
    from '../../services/authService';


const AdminStudents = () => {

    const navigate =
        useNavigate();


    /* ============================================================
       STATE
    ============================================================ */

    const [students, setStudents] =
        useState([]);

    const [search, setSearch] =
        useState('');

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState('');


    /* ============================================================
       FETCH STUDENTS
    ============================================================ */

    const fetchStudents = async (
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
                    '/admin/students',
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        },

                        params: {
                            search:
                                search.trim()
                        }
                    }
                );


            setStudents(
                response.data?.students || []
            );


        } catch (error) {

            console.error(
                'Admin students error:',
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
                    'You do not have permission to view student records.'
                );

                return;
            }


            setError(
                error.response?.data?.message ||
                'Unable to load student records.'
            );


        } finally {

            setLoading(false);
            setRefreshing(false);

        }

    };


    /* ============================================================
       INITIAL LOAD
    ============================================================ */

    useEffect(() => {

        fetchStudents();

    }, []);


    /* ============================================================
       CLIENT-SIDE SEARCH
    ============================================================ */

    const filteredStudents =
        useMemo(() => {

            const searchText =
                search
                    .trim()
                    .toLowerCase();


            if (!searchText) {
                return students;
            }


            return students.filter(
                (student) => {

                    const profile =
                        student.profile;


                    const values = [

                        student.name,

                        student.email,

                        student.mobile,

                        profile?.fullName,

                        profile?.registrationNumber,

                        profile?.course,

                        profile?.department,

                        profile?.category

                    ];


                    return values.some(
                        (value) =>
                            String(
                                value || ''
                            )
                                .toLowerCase()
                                .includes(
                                    searchText
                                )
                    );

                }
            );

        },
        [
            students,
            search
        ]
        );


    /* ============================================================
       HELPERS
    ============================================================ */

    const formatDate = (
        date
    ) => {

        if (!date) {
            return '—';
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
                    word.charAt(0)
                        .toUpperCase()
            )
            .join('');

    };


    /* ============================================================
       SUMMARY
    ============================================================ */

    const totalStudents =
        students.length;


    const completedProfiles =
        students.filter(
            student =>
                student.profile
                    ?.profileCompleted
        ).length;


    const totalApplications =
        students.reduce(
            (
                total,
                student
            ) =>
                total +
                (
                    student.applicationCount ||
                    0
                ),
            0
        );


    /* ============================================================
       VIEW STUDENT
    ============================================================ */

    const handleViewStudent = (
        studentId
    ) => {

        navigate(
            `/admin/students/${studentId}`
        );

    };


    /* ============================================================
       RENDER
    ============================================================ */

    return (

        <div
            style={{
                paddingBottom: '28px'
            }}
        >

            {/* ====================================================
               PAGE HEADER
            ==================================================== */}

            <div
                style={{
                    display: 'flex',
                    justifyContent:
                        'space-between',
                    alignItems:
                        'center',
                    gap: '16px',
                    marginBottom:
                        '20px',
                    flexWrap: 'wrap'
                }}
            >

                <div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems:
                                'center',
                            gap: '8px',
                            marginBottom:
                                '5px'
                        }}
                    >

                        <Users
                            size={20}
                            color="#174a8b"
                        />

                        <span
                            style={{
                                color:
                                    '#174a8b',
                                fontSize:
                                    '12px',
                                fontWeight:
                                    700,
                                letterSpacing:
                                    '0.08em',
                                textTransform:
                                    'uppercase'
                            }}
                        >
                            Student Registry
                        </span>

                    </div>


                    <h1
                        className="portal-heading"
                        style={{
                            fontSize:
                                '26px',
                            margin:
                                '0 0 5px'
                        }}
                    >
                        Student Management
                    </h1>


                    <p
                        className="portal-text"
                        style={{
                            margin: 0,
                            fontSize:
                                '13px'
                        }}
                    >
                        View registered students,
                        academic profiles and
                        scholarship activity.
                    </p>

                </div>


                <button
                    type="button"
                    className="portal-button portal-button-secondary"
                    onClick={() =>
                        fetchStudents(true)
                    }
                    disabled={
                        refreshing
                    }
                    style={{
                        display:
                            'inline-flex',
                        alignItems:
                            'center',
                        gap: '7px',
                        padding:
                            '9px 14px',
                        fontSize:
                            '13px'
                    }}
                >

                    <RefreshCw
                        size={15}
                        style={{
                            animation:
                                refreshing
                                    ? 'spin 1s linear infinite'
                                    : 'none'
                        }}
                    />

                    {refreshing
                        ? 'Refreshing...'
                        : 'Refresh'
                    }

                </button>

            </div>


            {/* ====================================================
               SUMMARY CARDS
            ==================================================== */}

            <div
                className="admin-student-summary-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns:
                        'repeat(3, minmax(0, 1fr))',
                    gap: '12px',
                    marginBottom:
                        '16px'
                }}
            >

                {/* REGISTERED */}

                <div
                    className="portal-card"
                    style={{
                        padding:
                            '15px 17px'
                    }}
                >

                    <div
                        style={{
                            display:
                                'flex',
                            alignItems:
                                'center',
                            justifyContent:
                                'space-between'
                        }}
                    >

                        <div>

                            <div
                                style={{
                                    color:
                                        '#64748b',
                                    fontSize:
                                        '12px',
                                    fontWeight:
                                        600,
                                    marginBottom:
                                        '6px'
                                }}
                            >
                                Registered Students
                            </div>


                            <div
                                style={{
                                    fontSize:
                                        '24px',
                                    lineHeight:
                                        1,
                                    fontWeight:
                                        700,
                                    color:
                                        '#172033'
                                }}
                            >
                                {totalStudents}
                            </div>

                        </div>


                        <div
                            style={{
                                width:
                                    '36px',
                                height:
                                    '36px',
                                borderRadius:
                                    '9px',
                                background:
                                    '#eaf1fb',
                                display:
                                    'flex',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'center'
                            }}
                        >

                            <Users
                                size={18}
                                color="#174a8b"
                            />

                        </div>

                    </div>

                </div>


                {/* PROFILES */}

                <div
                    className="portal-card"
                    style={{
                        padding:
                            '15px 17px'
                    }}
                >

                    <div
                        style={{
                            display:
                                'flex',
                            alignItems:
                                'center',
                            justifyContent:
                                'space-between'
                        }}
                    >

                        <div>

                            <div
                                style={{
                                    color:
                                        '#64748b',
                                    fontSize:
                                        '12px',
                                    fontWeight:
                                        600,
                                    marginBottom:
                                        '6px'
                                }}
                            >
                                Completed Profiles
                            </div>


                            <div
                                style={{
                                    fontSize:
                                        '24px',
                                    lineHeight:
                                        1,
                                    fontWeight:
                                        700,
                                    color:
                                        '#172033'
                                }}
                            >
                                {completedProfiles}
                            </div>

                        </div>


                        <div
                            style={{
                                width:
                                    '36px',
                                height:
                                    '36px',
                                borderRadius:
                                    '9px',
                                background:
                                    '#ecfdf3',
                                display:
                                    'flex',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'center'
                            }}
                        >

                            <CheckCircle2
                                size={18}
                                color="#15803d"
                            />

                        </div>

                    </div>

                </div>


                {/* APPLICATIONS */}

                <div
                    className="portal-card"
                    style={{
                        padding:
                            '15px 17px'
                    }}
                >

                    <div
                        style={{
                            display:
                                'flex',
                            alignItems:
                                'center',
                            justifyContent:
                                'space-between'
                        }}
                    >

                        <div>

                            <div
                                style={{
                                    color:
                                        '#64748b',
                                    fontSize:
                                        '12px',
                                    fontWeight:
                                        600,
                                    marginBottom:
                                        '6px'
                                }}
                            >
                                Scholarship Applications
                            </div>


                            <div
                                style={{
                                    fontSize:
                                        '24px',
                                    lineHeight:
                                        1,
                                    fontWeight:
                                        700,
                                    color:
                                        '#172033'
                                }}
                            >
                                {totalApplications}
                            </div>

                        </div>


                        <div
                            style={{
                                width:
                                    '36px',
                                height:
                                    '36px',
                                borderRadius:
                                    '9px',
                                background:
                                    '#fff7ed',
                                display:
                                    'flex',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'center'
                            }}
                        >

                            <FileText
                                size={18}
                                color="#c2410c"
                            />

                        </div>

                    </div>

                </div>

            </div>


            {/* ====================================================
               SEARCH
            ==================================================== */}

            <div
                className="portal-card"
                style={{
                    padding:
                        '14px 16px',
                    marginBottom:
                        '14px'
                }}
            >

                <div
                    style={{
                        position:
                            'relative'
                    }}
                >

                    <Search
                        size={17}
                        color="#64748b"
                        style={{
                            position:
                                'absolute',
                            left: '13px',
                            top: '50%',
                            transform:
                                'translateY(-50%)'
                        }}
                    />


                    <input
                        type="text"
                        className="portal-input"
                        value={search}
                        onChange={
                            event =>
                                setSearch(
                                    event.target.value
                                )
                        }
                        placeholder="Search by name, email, mobile, registration number, course or department..."
                        style={{
                            padding:
                                '10px 12px 10px 39px',
                            fontSize:
                                '13px'
                        }}
                    />

                </div>


                <div
                    style={{
                        marginTop:
                            '7px',
                        color:
                            '#64748b',
                        fontSize:
                            '12px'
                    }}
                >
                    Showing{' '}

                    <strong
                        style={{
                            color:
                                '#172033'
                        }}
                    >
                        {filteredStudents.length}
                    </strong>

                    {' '}of{' '}

                    <strong
                        style={{
                            color:
                                '#172033'
                        }}
                    >
                        {students.length}
                    </strong>

                    {' '}students
                </div>

            </div>


            {/* ====================================================
               ERROR
            ==================================================== */}

            {error && (

                <div
                    className="portal-card"
                    style={{
                        padding:
                            '14px',
                        marginBottom:
                            '14px',
                        borderColor:
                            '#fecaca',
                        background:
                            '#fff7f7',
                        color:
                            '#991b1b',
                        display:
                            'flex',
                        alignItems:
                            'center',
                        gap: '9px',
                        fontSize:
                            '13px'
                    }}
                >

                    <XCircle
                        size={17}
                    />

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* ====================================================
               LOADING
            ==================================================== */}

            {loading ? (

                <div
                    className="portal-card"
                    style={{
                        padding:
                            '45px 20px',
                        textAlign:
                            'center'
                    }}
                >

                    <RefreshCw
                        size={25}
                        color="#174a8b"
                        style={{
                            animation:
                                'spin 1s linear infinite',
                            margin:
                                '0 auto 10px'
                        }}
                    />

                    <div
                        style={{
                            color:
                                '#64748b',
                            fontSize:
                                '13px'
                        }}
                    >
                        Loading student records...
                    </div>

                </div>

            ) : filteredStudents.length === 0 ? (

                <div
                    className="portal-card"
                    style={{
                        padding:
                            '45px 20px',
                        textAlign:
                            'center'
                    }}
                >

                    <UserCircle
                        size={40}
                        color="#94a3b8"
                        style={{
                            margin:
                                '0 auto 12px'
                        }}
                    />

                    <h3
                        style={{
                            margin:
                                '0 0 6px',
                            color:
                                '#172033',
                            fontSize:
                                '18px'
                        }}
                    >
                        No Students Found
                    </h3>

                    <p
                        className="portal-text"
                        style={{
                            margin: 0,
                            fontSize:
                                '13px'
                        }}
                    >
                        No student records match
                        your current search.
                    </p>

                </div>

            ) : (

                /* =================================================
                   STUDENT TABLE
                ================================================= */

                <div
                    className="portal-card"
                    style={{
                        overflow:
                            'hidden'
                    }}
                >

                    <div
                        style={{
                            overflowX:
                                'auto',
                            width:
                                '100%'
                        }}
                    >

                        <table
                            style={{
                                width:
                                    '100%',
                                borderCollapse:
                                    'collapse',
                                minWidth:
                                    '820px'
                            }}
                        >

                            <thead>

                                <tr
                                    style={{
                                        background:
                                            '#f8fafc',
                                        borderBottom:
                                            '1px solid #e2e8f0'
                                    }}
                                >

                                    <th
                                        style={{
                                            textAlign:
                                                'left',
                                            padding:
                                                '11px 14px',
                                            fontSize:
                                                '11px',
                                            color:
                                                '#64748b',
                                            textTransform:
                                                'uppercase',
                                            letterSpacing:
                                                '0.05em',
                                            whiteSpace:
                                                'nowrap'
                                        }}
                                    >
                                        Student
                                    </th>


                                    <th
                                        style={{
                                            textAlign:
                                                'left',
                                            padding:
                                                '11px 14px',
                                            fontSize:
                                                '11px',
                                            color:
                                                '#64748b',
                                            textTransform:
                                                'uppercase',
                                            letterSpacing:
                                                '0.05em',
                                            whiteSpace:
                                                'nowrap'
                                        }}
                                    >
                                        Registration
                                    </th>


                                    <th
                                        style={{
                                            textAlign:
                                                'left',
                                            padding:
                                                '11px 14px',
                                            fontSize:
                                                '11px',
                                            color:
                                                '#64748b',
                                            textTransform:
                                                'uppercase',
                                            letterSpacing:
                                                '0.05em',
                                            whiteSpace:
                                                'nowrap'
                                        }}
                                    >
                                        Academic
                                    </th>


                                    <th
                                        style={{
                                            textAlign:
                                                'left',
                                            padding:
                                                '11px 14px',
                                            fontSize:
                                                '11px',
                                            color:
                                                '#64748b',
                                            textTransform:
                                                'uppercase',
                                            letterSpacing:
                                                '0.05em',
                                            whiteSpace:
                                                'nowrap'
                                        }}
                                    >
                                        Category
                                    </th>


                                    <th
                                        style={{
                                            textAlign:
                                                'left',
                                            padding:
                                                '11px 14px',
                                            fontSize:
                                                '11px',
                                            color:
                                                '#64748b',
                                            textTransform:
                                                'uppercase',
                                            letterSpacing:
                                                '0.05em',
                                            whiteSpace:
                                                'nowrap'
                                        }}
                                    >
                                        Profile
                                    </th>


                                    <th
                                        style={{
                                            textAlign:
                                                'center',
                                            padding:
                                                '11px 14px',
                                            fontSize:
                                                '11px',
                                            color:
                                                '#64748b',
                                            textTransform:
                                                'uppercase',
                                            letterSpacing:
                                                '0.05em',
                                            whiteSpace:
                                                'nowrap'
                                        }}
                                    >
                                        Applications
                                    </th>


                                    <th
                                        style={{
                                            textAlign:
                                                'right',
                                            padding:
                                                '11px 14px',
                                            fontSize:
                                                '11px',
                                            color:
                                                '#64748b',
                                            textTransform:
                                                'uppercase',
                                            letterSpacing:
                                                '0.05em',
                                            whiteSpace:
                                                'nowrap'
                                        }}
                                    >
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredStudents.map(
                                    (
                                        student
                                    ) => {

                                        const profile =
                                            student.profile;


                                        return (

                                            <tr
                                                key={
                                                    student._id
                                                }
                                                style={{
                                                    borderBottom:
                                                        '1px solid #eef2f7'
                                                }}
                                            >

                                                {/* STUDENT */}

                                                <td
                                                    style={{
                                                        padding:
                                                            '12px 14px'
                                                    }}
                                                >

                                                    <div
                                                        style={{
                                                            display:
                                                                'flex',
                                                            alignItems:
                                                                'center',
                                                            gap:
                                                                '9px'
                                                        }}
                                                    >

                                                        <div
                                                            style={{
                                                                width:
                                                                    '34px',
                                                                height:
                                                                    '34px',
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
                                                                    '11px',
                                                                flexShrink:
                                                                    0
                                                            }}
                                                        >
                                                            {getInitials(
                                                                student.name
                                                            )}
                                                        </div>


                                                        <div
                                                            style={{
                                                                minWidth:
                                                                    '155px'
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
                                                                        '2px',
                                                                    whiteSpace:
                                                                        'nowrap'
                                                                }}
                                                            >
                                                                {
                                                                    student.name
                                                                }
                                                            </div>


                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        '11px',
                                                                    color:
                                                                        '#64748b',
                                                                    whiteSpace:
                                                                        'nowrap'
                                                                }}
                                                            >
                                                                {
                                                                    student.email
                                                                }
                                                            </div>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* REGISTRATION */}

                                                <td
                                                    style={{
                                                        padding:
                                                            '12px 14px',
                                                        fontSize:
                                                            '12px',
                                                        color:
                                                            '#334155',
                                                        fontWeight:
                                                            600,
                                                        whiteSpace:
                                                            'nowrap'
                                                    }}
                                                >

                                                    {profile?.registrationNumber ||
                                                        'Not completed'}

                                                </td>


                                                {/* ACADEMIC */}

                                                <td
                                                    style={{
                                                        padding:
                                                            '12px 14px'
                                                    }}
                                                >

                                                    {profile ? (

                                                        <div>

                                                            <div
                                                                style={{
                                                                    display:
                                                                        'flex',
                                                                    alignItems:
                                                                        'center',
                                                                    gap:
                                                                        '5px',
                                                                    fontWeight:
                                                                        600,
                                                                    color:
                                                                        '#334155',
                                                                    fontSize:
                                                                        '12px',
                                                                    marginBottom:
                                                                        '3px',
                                                                    whiteSpace:
                                                                        'nowrap'
                                                                }}
                                                            >

                                                                <GraduationCap
                                                                    size={14}
                                                                    color="#174a8b"
                                                                />

                                                                {
                                                                    profile.course ||
                                                                    '—'
                                                                }

                                                            </div>


                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        '11px',
                                                                    color:
                                                                        '#64748b',
                                                                    whiteSpace:
                                                                        'nowrap'
                                                                }}
                                                            >

                                                                {
                                                                    profile.department ||
                                                                    '—'
                                                                }

                                                                {profile.currentSemester && (

                                                                    <>
                                                                        {' • '}
                                                                        Sem{' '}
                                                                        {
                                                                            profile.currentSemester
                                                                        }
                                                                    </>

                                                                )}

                                                            </div>

                                                        </div>

                                                    ) : (

                                                        <span
                                                            style={{
                                                                color:
                                                                    '#94a3b8',
                                                                fontSize:
                                                                    '12px',
                                                                whiteSpace:
                                                                    'nowrap'
                                                            }}
                                                        >
                                                            Profile not completed
                                                        </span>

                                                    )}

                                                </td>


                                                {/* CATEGORY */}

                                                <td
                                                    style={{
                                                        padding:
                                                            '12px 14px'
                                                    }}
                                                >

                                                    {profile?.category ? (

                                                        <span
                                                            className="portal-status portal-status-info"
                                                            style={{
                                                                fontSize:
                                                                    '11px',
                                                                padding:
                                                                    '4px 8px'
                                                            }}
                                                        >
                                                            {
                                                                profile.category
                                                            }
                                                        </span>

                                                    ) : (

                                                        <span
                                                            style={{
                                                                color:
                                                                    '#94a3b8'
                                                            }}
                                                        >
                                                            —
                                                        </span>

                                                    )}

                                                </td>


                                                {/* PROFILE */}

                                                <td
                                                    style={{
                                                        padding:
                                                            '12px 14px'
                                                    }}
                                                >

                                                    {profile?.profileCompleted ? (

                                                        <span
                                                            className="portal-status portal-status-success"
                                                            style={{
                                                                display:
                                                                    'inline-flex',
                                                                alignItems:
                                                                    'center',
                                                                gap:
                                                                    '4px',
                                                                fontSize:
                                                                    '11px',
                                                                padding:
                                                                    '4px 8px',
                                                                whiteSpace:
                                                                    'nowrap'
                                                            }}
                                                        >

                                                            <CheckCircle2
                                                                size={12}
                                                            />

                                                            Complete

                                                        </span>

                                                    ) : (

                                                        <span
                                                            className="portal-status portal-status-warning"
                                                            style={{
                                                                fontSize:
                                                                    '11px',
                                                                padding:
                                                                    '4px 8px',
                                                                whiteSpace:
                                                                    'nowrap'
                                                            }}
                                                        >
                                                            Incomplete
                                                        </span>

                                                    )}

                                                </td>


                                                {/* APPLICATIONS */}

                                                <td
                                                    style={{
                                                        padding:
                                                            '12px 14px',
                                                        textAlign:
                                                            'center',
                                                        fontSize:
                                                            '13px',
                                                        fontWeight:
                                                            700,
                                                        color:
                                                            '#174a8b'
                                                    }}
                                                >

                                                    {
                                                        student.applicationCount ||
                                                        0
                                                    }

                                                </td>


                                                {/* ACTION */}

                                                <td
                                                    style={{
                                                        padding:
                                                            '12px 14px',
                                                        textAlign:
                                                            'right'
                                                    }}
                                                >

                                                    <button
                                                        type="button"
                                                        className="portal-button portal-button-secondary"
                                                        onClick={() =>
                                                            handleViewStudent(
                                                                student._id
                                                            )
                                                        }
                                                        style={{
                                                            display:
                                                                'inline-flex',
                                                            alignItems:
                                                                'center',
                                                            gap:
                                                                '5px',
                                                            padding:
                                                                '7px 10px',
                                                            fontSize:
                                                                '11px',
                                                            whiteSpace:
                                                                'nowrap'
                                                        }}
                                                    >

                                                        <Eye
                                                            size={13}
                                                        />

                                                        View

                                                        <ChevronRight
                                                            size={13}
                                                        />

                                                    </button>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}


            {/* ====================================================
               RESPONSIVE / ANIMATION CSS
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

                    @media (max-width: 900px) {

                        .admin-student-summary-grid {
                            grid-template-columns:
                                1fr !important;
                        }

                    }
                `}
            </style>

        </div>

    );

};


export default AdminStudents;