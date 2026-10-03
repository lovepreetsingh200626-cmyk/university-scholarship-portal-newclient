import React, {
    useState
} from 'react';

import {
    NavLink,
    Outlet,
    useNavigate
} from 'react-router-dom';

import {
    LayoutDashboard,
    FileText,
    GraduationCap,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    ShieldCheck,
    ChevronRight
} from 'lucide-react';

import authService from '../../services/authService';


/* ============================================================
   ADMIN LAYOUT
============================================================ */

const AdminLayout = () => {

    const navigate =
        useNavigate();

    const [sidebarOpen, setSidebarOpen] =
        useState(false);


    const user =
        authService.getCurrentUser();


    /* ========================================================
       LOGOUT
    ======================================================== */

    const handleLogout = () => {

        authService.logout();

        navigate(
            '/admin/login',
            {
                replace: true
            }
        );
    };


    /* ========================================================
       NAVIGATION ITEMS
    ======================================================== */

    const navigationItems = [
        {
            label: 'Dashboard',
            path: '/admin',
            icon: LayoutDashboard,
            end: true
        },
        {
            label: 'Applications',
            path: '/admin/applications',
            icon: FileText
        },
        {
            label: 'Scholarships',
            path: '/admin/scholarships',
            icon: GraduationCap
        },
        {
            label: 'Students',
            path: '/admin/students',
            icon: Users
        },
        {
            label: 'Settings',
            path: '/admin/settings',
            icon: Settings
        }
    ];


    /* ========================================================
       SIDEBAR
    ======================================================== */

    const Sidebar = () => {

        return (

            <aside
                className={`admin-sidebar ${
                    sidebarOpen
                        ? 'admin-sidebar-open'
                        : ''
                }`}
            >

                {/* =================================================
                    SIDEBAR HEADER
                ================================================= */}

                <div className="admin-sidebar-header">

                    <div className="admin-sidebar-brand">

                        <div className="admin-sidebar-emblem">

                            <ShieldCheck
                                size={24}
                            />

                        </div>


                        <div>

                            <div className="admin-brand-title">
                                Scholarship Portal
                            </div>

                            <div className="admin-brand-subtitle">
                                Administration
                            </div>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="admin-mobile-close"
                        onClick={() =>
                            setSidebarOpen(
                                false
                            )
                        }
                    >

                        <X
                            size={21}
                        />

                    </button>

                </div>


                {/* =================================================
                    NAVIGATION
                ================================================= */}

                <nav className="admin-navigation">

                    <div className="admin-navigation-label">

                        MAIN MENU

                    </div>


                    {navigationItems.map(
                        (
                            item
                        ) => {

                            const Icon =
                                item.icon;

                            return (

                                <NavLink
                                    key={
                                        item.path
                                    }
                                    to={
                                        item.path
                                    }
                                    end={
                                        item.end
                                    }
                                    className={({
                                        isActive
                                    }) =>
                                        `admin-nav-link ${
                                            isActive
                                                ? 'admin-nav-link-active'
                                                : ''
                                        }`
                                    }
                                    onClick={() =>
                                        setSidebarOpen(
                                            false
                                        )
                                    }
                                >

                                    <Icon
                                        size={19}
                                    />

                                    <span>
                                        {
                                            item.label
                                        }
                                    </span>

                                    <ChevronRight
                                        size={15}
                                        className="admin-nav-arrow"
                                    />

                                </NavLink>

                            );

                        }
                    )}

                </nav>


                {/* =================================================
                    SIDEBAR FOOTER
                ================================================= */}

                <div className="admin-sidebar-footer">

                    <div className="admin-user-card">

                        <div className="admin-user-avatar">

                            {user?.name
                                ? user.name
                                      .charAt(
                                          0
                                      )
                                      .toUpperCase()
                                : 'A'}

                        </div>


                        <div className="admin-user-details">

                            <strong>

                                {user?.name ||
                                    'Administrator'}

                            </strong>

                            <span>

                                Administrator

                            </span>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="admin-logout-button"
                        onClick={
                            handleLogout
                        }
                    >

                        <LogOut
                            size={18}
                        />

                        Sign Out

                    </button>

                </div>

            </aside>
        );
    };


    /* ========================================================
       MAIN LAYOUT
    ======================================================== */

    return (

        <div className="admin-layout">

            <Sidebar />


            {/* =================================================
                MOBILE OVERLAY
            ================================================= */}

            {sidebarOpen && (

                <div
                    className="admin-sidebar-overlay"
                    onClick={() =>
                        setSidebarOpen(
                            false
                        )
                    }
                />

            )}


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="admin-main">

                {/* =================================================
                    TOP HEADER
                ================================================= */}

                <header className="admin-topbar">

                    <div className="admin-topbar-left">

                        <button
                            type="button"
                            className="admin-menu-button"
                            onClick={() =>
                                setSidebarOpen(
                                    true
                                )
                            }
                        >

                            <Menu
                                size={22}
                            />

                        </button>


                        <div>

                            <div className="admin-topbar-title">

                                University Scholarship Portal

                            </div>

                            <div className="admin-topbar-subtitle">

                                Administrative Management System

                            </div>

                        </div>

                    </div>


                    <div className="admin-topbar-right">

                        <div className="admin-security-status">

                            <span className="admin-security-dot" />

                            <span>
                                Secure Session
                            </span>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    CONTENT
                ================================================= */}

                <main className="admin-content">

                    <Outlet />

                </main>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <footer className="admin-footer">

                    <span>
                        University Scholarship Portal
                    </span>

                    <span>
                        Administrative Services
                    </span>

                </footer>

            </div>


            {/* =====================================================
                STYLES
            ===================================================== */}

            <style>
                {`

                .admin-layout {
                    min-height: 100vh;
                    display: flex;
                    background: #f5f7fb;
                }


                /* ==================================================
                   SIDEBAR
                ================================================== */

                .admin-sidebar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    z-index: 1000;
                    width: 270px;
                    display: flex;
                    flex-direction: column;
                    background: #102a43;
                    color: #ffffff;
                    box-shadow:
                        4px 0 20px rgba(
                            15,
                            23,
                            42,
                            0.10
                        );
                }


                .admin-sidebar-header {
                    min-height: 82px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 18px 18px;
                    border-bottom:
                        1px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.10
                        );
                }


                .admin-sidebar-brand {
                    display: flex;
                    align-items: center;
                    gap: 11px;
                }


                .admin-sidebar-emblem {
                    width: 42px;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    border-radius: 9px;
                    color: #102a43;
                    background: #ffffff;
                }


                .admin-brand-title {
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 800;
                    line-height: 1.25;
                }


                .admin-brand-subtitle {
                    margin-top: 3px;
                    color: #b8c7d9;
                    font-size: 11px;
                    font-weight: 500;
                }


                .admin-mobile-close {
                    display: none;
                    border: none;
                    background: transparent;
                    color: #ffffff;
                    padding: 5px;
                }


                /* ==================================================
                   NAVIGATION
                ================================================== */

                .admin-navigation {
                    flex: 1;
                    padding: 25px 13px;
                    overflow-y: auto;
                }


                .admin-navigation-label {
                    margin:
                        0 11px
                        10px;
                    color: #8fa7c0;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 0.12em;
                }


                .admin-nav-link {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-height: 46px;
                    margin-bottom: 5px;
                    padding: 0 12px;
                    border-radius: 8px;
                    color: #c7d5e5;
                    font-size: 14px;
                    font-weight: 600;
                    transition:
                        background 0.2s ease,
                        color 0.2s ease;
                }


                .admin-nav-link:hover {
                    color: #ffffff;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.08
                        );
                }


                .admin-nav-link-active {
                    color: #ffffff;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.13
                        );
                    box-shadow:
                        inset 3px 0 0
                        #ffffff;
                }


                .admin-nav-arrow {
                    margin-left: auto;
                    opacity: 0;
                    transition:
                        opacity 0.2s ease;
                }


                .admin-nav-link:hover
                .admin-nav-arrow,
                .admin-nav-link-active
                .admin-nav-arrow {
                    opacity: 0.75;
                }


                /* ==================================================
                   SIDEBAR FOOTER
                ================================================== */

                .admin-sidebar-footer {
                    padding: 15px;
                    border-top:
                        1px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.10
                        );
                }


                .admin-user-card {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px;
                    margin-bottom: 10px;
                    border-radius: 8px;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.06
                        );
                }


                .admin-user-avatar {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    border-radius: 50%;
                    color: #102a43;
                    background: #ffffff;
                    font-size: 14px;
                    font-weight: 800;
                }


                .admin-user-details {
                    min-width: 0;
                }


                .admin-user-details strong {
                    display: block;
                    overflow: hidden;
                    color: #ffffff;
                    font-size: 12px;
                    font-weight: 700;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }


                .admin-user-details span {
                    display: block;
                    margin-top: 3px;
                    color: #9fb2c7;
                    font-size: 11px;
                }


                .admin-logout-button {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    min-height: 42px;
                    border: 1px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.14
                        );
                    border-radius: 7px;
                    color: #d7e2ee;
                    background: transparent;
                    font-size: 13px;
                    font-weight: 600;
                    transition:
                        background 0.2s ease,
                        color 0.2s ease;
                }


                .admin-logout-button:hover {
                    color: #ffffff;
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.09
                        );
                }


                /* ==================================================
                   MAIN AREA
                ================================================== */

                .admin-main {
                    width: calc(
                        100% - 270px
                    );
                    min-height: 100vh;
                    margin-left: 270px;
                    display: flex;
                    flex-direction: column;
                }


                /* ==================================================
                   TOPBAR
                ================================================== */

                .admin-topbar {
                    min-height: 78px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    padding: 0 30px;
                    border-bottom:
                        1px solid
                        #e2e8f0;
                    background: #ffffff;
                }


                .admin-topbar-left {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }


                .admin-menu-button {
                    display: none;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    border-radius: 7px;
                    padding: 8px;
                    color: #334155;
                    background: #f1f5f9;
                }


                .admin-topbar-title {
                    color: #172033;
                    font-size: 15px;
                    font-weight: 800;
                }


                .admin-topbar-subtitle {
                    margin-top: 3px;
                    color: #64748b;
                    font-size: 12px;
                }


                .admin-topbar-right {
                    display: flex;
                    align-items: center;
                }


                .admin-security-status {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    color: #166534;
                    font-size: 12px;
                    font-weight: 700;
                }


                .admin-security-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #22c55e;
                    box-shadow:
                        0 0 0 3px
                        #dcfce7;
                }


                /* ==================================================
                   CONTENT
                ================================================== */

                .admin-content {
                    flex: 1;
                    min-width: 0;
                }


                .admin-footer {
                    min-height: 52px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    padding: 0 30px;
                    border-top:
                        1px solid
                        #e2e8f0;
                    color: #64748b;
                    background: #ffffff;
                    font-size: 11px;
                }


                /* ==================================================
                   MOBILE OVERLAY
                ================================================== */

                .admin-sidebar-overlay {
                    display: none;
                }


                /* ==================================================
                   TABLET
                ================================================== */

                @media (max-width: 900px) {

                    .admin-sidebar {
                        transform:
                            translateX(
                                -100%
                            );
                        transition:
                            transform
                            0.25s ease;
                    }


                    .admin-sidebar-open {
                        transform:
                            translateX(0);
                    }


                    .admin-mobile-close {
                        display: flex;
                    }


                    .admin-main {
                        width: 100%;
                        margin-left: 0;
                    }


                    .admin-menu-button {
                        display: flex;
                    }


                    .admin-sidebar-overlay {
                        position: fixed;
                        inset: 0;
                        z-index: 999;
                        display: block;
                        background:
                            rgba(
                                15,
                                23,
                                42,
                                0.45
                            );
                    }

                }


                /* ==================================================
                   MOBILE
                ================================================== */

                @media (max-width: 600px) {

                    .admin-topbar {
                        min-height: 68px;
                        padding: 0 16px;
                    }


                    .admin-topbar-subtitle {
                        display: none;
                    }


                    .admin-topbar-title {
                        font-size: 13px;
                    }


                    .admin-security-status span:last-child {
                        display: none;
                    }


                    .admin-footer {
                        padding:
                            12px 16px;
                        flex-direction:
                            column;
                        align-items:
                            flex-start;
                    }

                }

                `}
            </style>

        </div>
    );
};


export default AdminLayout;