import React, {
    useState
} from 'react';

import {
    Link,
    useNavigate
} from 'react-router-dom';

import {
    ShieldCheck,
    LockKeyhole,
    AlertCircle,
    Loader2,
    ArrowLeft
} from 'lucide-react';

import authService from '../../services/authService';


const AdminLogin = () => {

    const navigate =
        useNavigate();

    const [email, setEmail] =
        useState('');

    const [password, setPassword] =
        useState('');

    const [error, setError] =
        useState('');

    const [loading, setLoading] =
        useState(false);


    /* ========================================================
       LOGIN
    ======================================================== */

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        setError('');

        if (!email.trim()) {
            setError(
                'Please enter the administrator email address.'
            );

            return;
        }

        if (!password) {
            setError(
                'Please enter the administrator password.'
            );

            return;
        }

        try {

            setLoading(true);

            const data =
                await authService.loginStudent(
                    email.trim(),
                    password
                );

            /* =================================================
               SECURITY CHECK
            ================================================= */

            if (
                data.user?.role !==
                'admin'
            ) {
                authService.logout();

                setError(
                    'This login is restricted to authorized administrators.'
                );

                return;
            }

            authService.saveAuthData(
                data
            );

            navigate(
                '/admin/applications',
                {
                    replace: true
                }
            );

        } catch (error) {

            console.error(
                'Admin login error:',
                error
            );

            setError(
                error.response?.data?.message ||
                'Unable to login. Please check your administrator credentials.'
            );

        } finally {

            setLoading(false);

        }
    };


    /* ========================================================
       PAGE
    ======================================================== */

    return (
        <div
            style={{
                minHeight: '100vh',
                background:
                    'linear-gradient(135deg, #eef4fb 0%, #f8fafc 50%, #eef2f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px'
            }}
        >

            <div
                style={{
                    width: '100%',
                    maxWidth: '470px'
                }}
            >

                {/* =================================================
                    BACK TO HOME
                ================================================= */}

                <div
                    style={{
                        marginBottom: '18px'
                    }}
                >

                    <Link
                        to="/"
                        style={{
                            display:
                                'inline-flex',
                            alignItems:
                                'center',
                            gap: '7px',
                            color:
                                '#475569',
                            fontSize:
                                '14px',
                            fontWeight:
                                600
                        }}
                    >

                        <ArrowLeft
                            size={17}
                        />

                        Back to University Portal

                    </Link>

                </div>


                {/* =================================================
                    LOGIN CARD
                ================================================= */}

                <div
                    className="portal-card"
                    style={{
                        overflow:
                            'hidden'
                    }}
                >

                    {/* =============================================
                        CARD HEADER
                    ============================================= */}

                    <div
                        style={{
                            background:
                                '#173f73',
                            color:
                                '#ffffff',
                            padding:
                                '30px 30px 26px'
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
                                        '52px',
                                    height:
                                        '52px',
                                    borderRadius:
                                        '12px',
                                    background:
                                        'rgba(255,255,255,0.14)',
                                    border:
                                        '1px solid rgba(255,255,255,0.22)',
                                    display:
                                        'flex',
                                    alignItems:
                                        'center',
                                    justifyContent:
                                        'center'
                                }}
                            >

                                <ShieldCheck
                                    size={29}
                                />

                            </div>


                            <div>

                                <div
                                    style={{
                                        fontFamily:
                                            "'Playfair Display', Georgia, serif",
                                        fontSize:
                                            '23px',
                                        fontWeight:
                                            700,
                                        lineHeight:
                                            1.2
                                    }}
                                >
                                    Administration
                                </div>

                                <div
                                    style={{
                                        marginTop:
                                            '5px',
                                        fontSize:
                                            '13px',
                                        color:
                                            '#dbeafe'
                                    }}
                                >
                                    Secure Administrator Access
                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =============================================
                        FORM
                    ============================================= */}

                    <div
                        style={{
                            padding:
                                '30px'
                        }}
                    >

                        <div
                            style={{
                                marginBottom:
                                    '24px'
                            }}
                        >

                            <h1
                                className="portal-heading"
                                style={{
                                    fontSize:
                                        '27px',
                                    marginBottom:
                                        '8px'
                                }}
                            >
                                Administrator Login
                            </h1>

                            <p
                                className="portal-text"
                                style={{
                                    margin:
                                        0
                                }}
                            >
                                Sign in to manage scholarship
                                applications and verification.
                            </p>

                        </div>


                        {/* =========================================
                            ERROR
                        ========================================= */}

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
                                        '9px',
                                    padding:
                                        '12px 13px',
                                    marginBottom:
                                        '18px',
                                    display:
                                        'flex',
                                    alignItems:
                                        'flex-start',
                                    gap:
                                        '9px',
                                    fontSize:
                                        '14px',
                                    lineHeight:
                                        1.5
                                }}
                            >

                                <AlertCircle
                                    size={18}
                                    style={{
                                        flexShrink:
                                            0,
                                        marginTop:
                                            '1px'
                                    }}
                                />

                                <span>
                                    {error}
                                </span>

                            </div>
                        )}


                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {/* =====================================
                                EMAIL
                            ===================================== */}

                            <div
                                style={{
                                    marginBottom:
                                        '18px'
                                }}
                            >

                                <label
                                    className="portal-label"
                                >
                                    Administrator Email
                                </label>

                                <div
                                    style={{
                                        position:
                                            'relative'
                                    }}
                                >

                                    <LockKeyhole
                                        size={17}
                                        style={{
                                            position:
                                                'absolute',
                                            left:
                                                '13px',
                                            top:
                                                '50%',
                                            transform:
                                                'translateY(-50%)',
                                            color:
                                                '#64748b'
                                        }}
                                    />

                                    <input
                                        type="email"
                                        className="portal-input"
                                        value={
                                            email
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter administrator email"
                                        autoComplete="username"
                                        style={{
                                            paddingLeft:
                                                '40px'
                                        }}
                                    />

                                </div>

                            </div>


                            {/* =====================================
                                PASSWORD
                            ===================================== */}

                            <div
                                style={{
                                    marginBottom:
                                        '22px'
                                }}
                            >

                                <label
                                    className="portal-label"
                                >
                                    Password
                                </label>

                                <input
                                    type="password"
                                    className="portal-input"
                                    value={
                                        password
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter administrator password"
                                    autoComplete="current-password"
                                />

                            </div>


                            {/* =====================================
                                LOGIN BUTTON
                            ===================================== */}

                            <button
                                type="submit"
                                className="portal-button portal-button-primary"
                                disabled={
                                    loading
                                }
                                style={{
                                    width:
                                        '100%',
                                    minHeight:
                                        '46px',
                                    opacity:
                                        loading
                                            ? 0.7
                                            : 1
                                }}
                            >

                                {loading ? (
                                    <>
                                        <Loader2
                                            size={18}
                                            style={{
                                                marginRight:
                                                    '8px',
                                                verticalAlign:
                                                    'middle',
                                                animation:
                                                    'adminLoginSpin 1s linear infinite'
                                            }}
                                        />

                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck
                                            size={18}
                                            style={{
                                                marginRight:
                                                    '8px',
                                                verticalAlign:
                                                    'middle'
                                            }}
                                        />

                                        Sign In as Administrator
                                    </>
                                )}

                            </button>

                        </form>


                        {/* =========================================
                            SECURITY NOTICE
                        ========================================= */}

                        <div
                            style={{
                                marginTop:
                                    '22px',
                                padding:
                                    '13px 14px',
                                background:
                                    '#f8fafc',
                                border:
                                    '1px solid #e2e8f0',
                                borderRadius:
                                    '9px',
                                color:
                                    '#64748b',
                                fontSize:
                                    '12px',
                                lineHeight:
                                    1.6,
                                textAlign:
                                    'center'
                            }}
                        >
                            This area is restricted to authorized
                            university administrators.
                        </div>

                    </div>

                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                    style={{
                        textAlign:
                            'center',
                        marginTop:
                            '18px',
                        color:
                            '#64748b',
                        fontSize:
                            '12px'
                    }}
                >
                    University Scholarship Portal
                </div>

            </div>


            {/* =====================================================
                ANIMATION
            ===================================================== */}

            <style>
                {`
                    @keyframes adminLoginSpin {
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


export default AdminLogin;