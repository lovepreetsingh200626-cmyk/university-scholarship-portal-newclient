import React, {
    useEffect,
    useState
} from 'react';

import {
    LayoutDashboard,
    FileText,
    Clock3,
    AlertCircle,
    CheckCircle2,
    ShieldCheck,
    BadgeCheck,
    WalletCards,
    XCircle,
    RefreshCw
} from 'lucide-react';

import API from '../../services/api';
import authService from '../../services/authService';


/* ============================================================
   ADMIN DASHBOARD
============================================================ */

const AdminDashboard = () => {

    const [statistics, setStatistics] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');


    /* ========================================================
       FETCH DASHBOARD STATISTICS
    ======================================================== */

    const fetchDashboardStatistics =
        async () => {

            try {

                setLoading(true);
                setError('');

                const token =
                    authService.getToken();

                if (!token) {

                    setError(
                        'Administrator authentication is required.'
                    );

                    return;
                }


                const response =
                    await API.get(
                        '/admin/dashboard',
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                if (
                    response.data?.success
                ) {

                    setStatistics(
                        response.data.statistics
                    );

                } else {

                    setError(
                        response.data?.message ||
                        'Unable to load dashboard statistics.'
                    );

                }

            } catch (error) {

                console.error(
                    'Admin dashboard error:',
                    error
                );


                if (
                    error.response?.status ===
                    401
                ) {

                    authService.logout();

                    window.location.href =
                        '/admin/login';

                    return;

                }


                if (
                    error.response?.status ===
                    403
                ) {

                    setError(
                        'You do not have permission to access the admin dashboard.'
                    );

                    return;

                }


                setError(
                    error.response?.data?.message ||
                    'Unable to load dashboard statistics.'
                );

            } finally {

                setLoading(false);

            }
        };


    /* ========================================================
       INITIAL LOAD
    ======================================================== */

    useEffect(() => {

        fetchDashboardStatistics();

    }, []);


    /* ========================================================
       STATISTIC CARD
    ======================================================== */

    const StatisticCard = ({
        title,
        value,
        icon: Icon,
        description,
        type
    }) => {

        return (

            <div className="portal-card admin-stat-card">

                <div className="admin-stat-top">

                    <div
                        className={`admin-stat-icon admin-stat-icon-${type}`}
                    >
                        <Icon
                            size={22}
                        />
                    </div>

                </div>


                <div className="admin-stat-value">

                    {loading
                        ? '—'
                        : value ?? 0}

                </div>


                <div className="admin-stat-title">

                    {title}

                </div>


                <div className="admin-stat-description">

                    {description}

                </div>

            </div>

        );
    };


    /* ========================================================
       DASHBOARD
    ======================================================== */

    return (

        <div className="admin-dashboard-page">

            <div className="portal-container">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="admin-dashboard-header">

                    <div>

                        <div className="admin-dashboard-kicker">

                            <LayoutDashboard
                                size={16}
                            />

                            ADMINISTRATIVE DASHBOARD

                        </div>


                        <h1 className="portal-heading admin-dashboard-title">

                            Scholarship Administration

                        </h1>


                        <p className="portal-text">

                            Monitor scholarship applications,
                            verification and financial processing
                            from one centralized dashboard.

                        </p>

                    </div>


                    <button
                        type="button"
                        className="portal-button portal-button-secondary admin-refresh-button"
                        onClick={
                            fetchDashboardStatistics
                        }
                        disabled={
                            loading
                        }
                    >

                        <RefreshCw
                            size={17}
                            className={
                                loading
                                    ? 'admin-refresh-spinning'
                                    : ''
                            }
                        />

                        {loading
                            ? 'Refreshing...'
                            : 'Refresh'}

                    </button>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="admin-dashboard-error">

                        <AlertCircle
                            size={20}
                        />

                        <div>

                            <strong>
                                Unable to load dashboard
                            </strong>

                            <p>
                                {error}
                            </p>

                        </div>

                    </div>

                )}


                {/* =================================================
                    OVERVIEW
                ================================================= */}

                <div className="admin-dashboard-section-title">

                    <div>

                        <h2>
                            Application Overview
                        </h2>

                        <p>
                            Current scholarship application
                            processing statistics.
                        </p>

                    </div>

                </div>


                <div className="admin-stat-grid">

                    <StatisticCard
                        title="Total Applications"
                        value={
                            statistics?.totalApplications
                        }
                        icon={FileText}
                        description="All applications in the system"
                        type="primary"
                    />


                    <StatisticCard
                        title="Submitted"
                        value={
                            statistics?.submittedApplications
                        }
                        icon={Clock3}
                        description="Waiting to enter verification"
                        type="info"
                    />


                    <StatisticCard
                        title="Under Verification"
                        value={
                            statistics?.underVerificationApplications
                        }
                        icon={ShieldCheck}
                        description="Currently being verified"
                        type="warning"
                    />


                    <StatisticCard
                        title="Correction Required"
                        value={
                            statistics?.correctionRequiredApplications
                        }
                        icon={AlertCircle}
                        description="Waiting for student correction"
                        type="danger"
                    />


                    <StatisticCard
                        title="Resubmitted"
                        value={
                            statistics?.resubmittedApplications
                        }
                        icon={RefreshCw}
                        description="Corrected applications resubmitted"
                        type="info"
                    />


                    <StatisticCard
                        title="Verified"
                        value={
                            statistics?.verifiedApplications
                        }
                        icon={CheckCircle2}
                        description="Successfully verified"
                        type="success"
                    />


                    <StatisticCard
                        title="Sanctioned"
                        value={
                            statistics?.sanctionedApplications
                        }
                        icon={BadgeCheck}
                        description="Scholarships approved for sanction"
                        type="success"
                    />


                    <StatisticCard
                        title="Disbursed"
                        value={
                            statistics?.disbursedApplications
                        }
                        icon={WalletCards}
                        description="Scholarship amount disbursed"
                        type="success"
                    />


                    <StatisticCard
                        title="Rejected"
                        value={
                            statistics?.rejectedApplications
                        }
                        icon={XCircle}
                        description="Applications rejected"
                        type="danger"
                    />

                </div>


                {/* =================================================
                    PROCESS INFORMATION
                ================================================= */}

                <div className="admin-process-card portal-card">

                    <div className="admin-process-header">

                        <div>

                            <h2>
                                Application Processing Flow
                            </h2>

                            <p>
                                Standard workflow used by the
                                scholarship administration system.
                            </p>

                        </div>

                    </div>


                    <div className="admin-process-flow">

                        <div className="admin-process-step">

                            <span>
                                01
                            </span>

                            <strong>
                                Submitted
                            </strong>

                            <small>
                                Student submits application
                            </small>

                        </div>


                        <div className="admin-process-arrow">
                            →
                        </div>


                        <div className="admin-process-step">

                            <span>
                                02
                            </span>

                            <strong>
                                Verification
                            </strong>

                            <small>
                                Admin checks application
                            </small>

                        </div>


                        <div className="admin-process-arrow">
                            →
                        </div>


                        <div className="admin-process-step">

                            <span>
                                03
                            </span>

                            <strong>
                                Verified
                            </strong>

                            <small>
                                Application approved after verification
                            </small>

                        </div>


                        <div className="admin-process-arrow">
                            →
                        </div>


                        <div className="admin-process-step">

                            <span>
                                04
                            </span>

                            <strong>
                                Sanctioned
                            </strong>

                            <small>
                                Scholarship sanction recorded
                            </small>

                        </div>


                        <div className="admin-process-arrow">
                            →
                        </div>


                        <div className="admin-process-step">

                            <span>
                                05
                            </span>

                            <strong>
                                Disbursed
                            </strong>

                            <small>
                                Scholarship amount processed
                            </small>

                        </div>

                    </div>

                </div>

            </div>


            {/* =====================================================
                PAGE STYLES
            ===================================================== */}

            <style>
                {`

                .admin-dashboard-page {
                    min-height: 100vh;
                    padding: 34px 0 60px;
                    background:
                        linear-gradient(
                            180deg,
                            #f8fafc 0%,
                            #f5f7fb 100%
                        );
                }


                .admin-dashboard-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 24px;
                    margin-bottom: 30px;
                }


                .admin-dashboard-kicker {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    margin-bottom: 10px;
                    color: #174a8b;
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                }


                .admin-dashboard-title {
                    margin-bottom: 8px;
                    font-size: 32px;
                }


                .admin-refresh-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    white-space: nowrap;
                }


                .admin-refresh-spinning {
                    animation:
                        admin-dashboard-spin
                        1s linear infinite;
                }


                @keyframes admin-dashboard-spin {

                    from {
                        transform: rotate(0deg);
                    }

                    to {
                        transform: rotate(360deg);
                    }

                }


                .admin-dashboard-error {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    margin-bottom: 24px;
                    padding: 16px 18px;
                    border: 1px solid #fecaca;
                    border-radius: 10px;
                    background: #fff1f2;
                    color: #991b1b;
                }


                .admin-dashboard-error strong {
                    display: block;
                    margin-bottom: 4px;
                }


                .admin-dashboard-error p {
                    margin: 0;
                    line-height: 1.5;
                    font-size: 14px;
                }


                .admin-dashboard-section-title {
                    margin-bottom: 16px;
                }


                .admin-dashboard-section-title h2 {
                    margin: 0 0 4px;
                    color: #172033;
                    font-size: 20px;
                }


                .admin-dashboard-section-title p {
                    margin: 0;
                    color: #64748b;
                    font-size: 14px;
                }


                .admin-stat-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(3, minmax(0, 1fr));
                    gap: 18px;
                }


                .admin-stat-card {
                    padding: 20px;
                    min-height: 172px;
                }


                .admin-stat-top {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }


                .admin-stat-icon {
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                }


                .admin-stat-icon-primary {
                    color: #174a8b;
                    background: #eaf1fb;
                }


                .admin-stat-icon-info {
                    color: #1d4ed8;
                    background: #dbeafe;
                }


                .admin-stat-icon-warning {
                    color: #92400e;
                    background: #fef3c7;
                }


                .admin-stat-icon-danger {
                    color: #b42318;
                    background: #fee2e2;
                }


                .admin-stat-icon-success {
                    color: #166534;
                    background: #dcfce7;
                }


                .admin-stat-value {
                    margin-bottom: 3px;
                    color: #172033;
                    font-size: 30px;
                    line-height: 1;
                    font-weight: 800;
                }


                .admin-stat-title {
                    margin-bottom: 7px;
                    color: #334155;
                    font-size: 15px;
                    font-weight: 700;
                }


                .admin-stat-description {
                    color: #64748b;
                    font-size: 13px;
                    line-height: 1.5;
                }


                .admin-process-card {
                    margin-top: 28px;
                    padding: 24px;
                }


                .admin-process-header h2 {
                    margin: 0 0 5px;
                    color: #172033;
                    font-size: 20px;
                }


                .admin-process-header p {
                    margin: 0;
                    color: #64748b;
                    font-size: 14px;
                }


                .admin-process-flow {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-top: 25px;
                    overflow-x: auto;
                    padding-bottom: 5px;
                }


                .admin-process-step {
                    flex:
                        1 0 150px;
                    min-width: 150px;
                    padding: 15px;
                    border:
                        1px solid #e2e8f0;
                    border-radius: 10px;
                    background: #f8fafc;
                }


                .admin-process-step span {
                    display: block;
                    margin-bottom: 8px;
                    color: #174a8b;
                    font-size: 11px;
                    font-weight: 800;
                }


                .admin-process-step strong {
                    display: block;
                    margin-bottom: 5px;
                    color: #172033;
                    font-size: 14px;
                }


                .admin-process-step small {
                    display: block;
                    color: #64748b;
                    line-height: 1.45;
                    font-size: 12px;
                }


                .admin-process-arrow {
                    flex-shrink: 0;
                    color: #94a3b8;
                    font-size: 22px;
                    font-weight: 700;
                }


                @media (max-width: 1000px) {

                    .admin-stat-grid {
                        grid-template-columns:
                            repeat(2, minmax(0, 1fr));
                    }

                }


                @media (max-width: 700px) {

                    .admin-dashboard-header {
                        flex-direction: column;
                    }


                    .admin-dashboard-title {
                        font-size: 27px;
                    }


                    .admin-stat-grid {
                        grid-template-columns: 1fr;
                    }


                    .admin-refresh-button {
                        width: 100%;
                        justify-content: center;
                    }

                }


                @media (max-width: 480px) {

                    .admin-dashboard-page {
                        padding-top: 22px;
                    }


                    .admin-dashboard-title {
                        font-size: 24px;
                    }


                    .admin-stat-card {
                        min-height: auto;
                    }

                }

                `}
            </style>

        </div>
    );
};


export default AdminDashboard;