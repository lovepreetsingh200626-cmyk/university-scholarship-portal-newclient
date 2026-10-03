import React, {
    useEffect,
    useState
} from 'react';

import {
    UserCircle,
    ShieldCheck,
    LockKeyhole,
    Save,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Mail,
    Phone,
    CalendarDays,
    KeyRound
} from 'lucide-react';

import API from '../../services/api';

import authService from '../../services/authService';


/* ============================================================
   ADMIN SETTINGS
============================================================ */

const AdminSettings = () => {

    const [profile, setProfile] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [savingProfile, setSavingProfile] =
        useState(false);

    const [changingPassword, setChangingPassword] =
        useState(false);

    const [profileMessage, setProfileMessage] =
        useState('');

    const [passwordMessage, setPasswordMessage] =
        useState('');

    const [error, setError] =
        useState('');


    /* ========================================================
       PROFILE FORM
    ======================================================== */

    const [profileForm, setProfileForm] =
        useState({
            name: '',
            email: '',
            mobile: ''
        });


    /* ========================================================
       PASSWORD FORM
    ======================================================== */

    const [passwordForm, setPasswordForm] =
        useState({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });


    /* ========================================================
       FETCH ADMIN PROFILE
    ======================================================== */

    const fetchProfile = async () => {

        try {

            setLoading(true);

            setError('');

            setProfileMessage('');


            const token =
                authService.getToken();


            if (!token) {

                window.location.href =
                    '/admin/login';

                return;

            }


            const response =
                await API.get(
                    '/admin/settings/profile',
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

                const admin =
                    response.data.admin;


                setProfile(admin);


                setProfileForm({

                    name:
                        admin.name || '',

                    email:
                        admin.email || '',

                    mobile:
                        admin.mobile || ''

                });

            }


        } catch (error) {

            console.error(
                'Admin profile error:',
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
                    'You do not have permission to access admin settings.'
                );

                return;

            }


            setError(
                error.response?.data?.message ||
                'Unable to load admin settings.'
            );


        } finally {

            setLoading(false);

        }

    };


    /* ========================================================
       INITIAL LOAD
    ======================================================== */

    useEffect(() => {

        fetchProfile();

    }, []);


    /* ========================================================
       PROFILE INPUT
    ======================================================== */

    const handleProfileChange = (
        event
    ) => {

        const {
            name,
            value
        } = event.target;


        setProfileForm(
            previous => ({
                ...previous,
                [name]: value
            })
        );


        setProfileMessage('');

        setError('');

    };


    /* ========================================================
       PASSWORD INPUT
    ======================================================== */

    const handlePasswordChange = (
        event
    ) => {

        const {
            name,
            value
        } = event.target;


        setPasswordForm(
            previous => ({
                ...previous,
                [name]: value
            })
        );


        setPasswordMessage('');

        setError('');

    };


    /* ========================================================
       UPDATE PROFILE
    ======================================================== */

    const handleProfileSubmit = async (
        event
    ) => {

        event.preventDefault();


        try {

            setSavingProfile(true);

            setProfileMessage('');

            setError('');


            const token =
                authService.getToken();


            if (!token) {

                window.location.href =
                    '/admin/login';

                return;

            }


            const response =
                await API.put(
                    '/admin/settings/profile',
                    {
                        name:
                            profileForm.name,

                        email:
                            profileForm.email,

                        mobile:
                            profileForm.mobile
                    },
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

                const updatedAdmin =
                    response.data.admin;


                setProfile(
                    updatedAdmin
                );


                setProfileForm({

                    name:
                        updatedAdmin.name ||
                        '',

                    email:
                        updatedAdmin.email ||
                        '',

                    mobile:
                        updatedAdmin.mobile ||
                        ''

                });


                /*
                   Keep the locally stored
                   user information synchronized.
                */

                const currentUser =
                    authService.getCurrentUser();


                if (currentUser) {

                    authService.saveAuthData({

                        token,

                        user: {

                            ...currentUser,

                            name:
                                updatedAdmin.name,

                            email:
                                updatedAdmin.email,

                            mobile:
                                updatedAdmin.mobile

                        }

                    });

                }


                setProfileMessage(
                    'Admin profile updated successfully.'
                );

            }


        } catch (error) {

            console.error(
                'Update admin profile error:',
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


            setError(
                error.response?.data?.message ||
                'Unable to update admin profile.'
            );


        } finally {

            setSavingProfile(false);

        }

    };


    /* ========================================================
       CHANGE PASSWORD
    ======================================================== */

    const handlePasswordSubmit = async (
        event
    ) => {

        event.preventDefault();


        setPasswordMessage('');

        setError('');


        if (
            !passwordForm.currentPassword ||
            !passwordForm.newPassword ||
            !passwordForm.confirmPassword
        ) {

            setError(
                'Please fill in all password fields.'
            );

            return;

        }


        if (
            passwordForm.newPassword.length <
            8
        ) {

            setError(
                'New password must contain at least 8 characters.'
            );

            return;

        }


        if (
            passwordForm.newPassword !==
            passwordForm.confirmPassword
        ) {

            setError(
                'New passwords do not match.'
            );

            return;

        }


        try {

            setChangingPassword(true);


            const token =
                authService.getToken();


            if (!token) {

                window.location.href =
                    '/admin/login';

                return;

            }


            const response =
                await API.put(
                    '/admin/settings/password',
                    {
                        currentPassword:
                            passwordForm.currentPassword,

                        newPassword:
                            passwordForm.newPassword,

                        confirmPassword:
                            passwordForm.confirmPassword
                    },
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

                setPasswordForm({

                    currentPassword: '',

                    newPassword: '',

                    confirmPassword: ''

                });


                setPasswordMessage(
                    'Admin password changed successfully.'
                );

            }


        } catch (error) {

            console.error(
                'Change admin password error:',
                error
            );


            if (
                error.response?.status ===
                401
            ) {

                /*
                   Do not immediately logout here
                   because HTTP 401 can also mean
                   that the current password entered
                   by the admin is incorrect.
                */

                const message =
                    error.response?.data?.message;


                setError(
                    message ||
                    'Current password is incorrect.'
                );

                return;

            }


            setError(
                error.response?.data?.message ||
                'Unable to change admin password.'
            );


        } finally {

            setChangingPassword(false);

        }

    };


    /* ========================================================
       FORMAT DATE
    ======================================================== */

    const formatDate = (
        date
    ) => {

        if (!date) {
            return 'Not available';
        }


        const formatted =
            new Date(date);


        if (
            Number.isNaN(
                formatted.getTime()
            )
        ) {

            return 'Not available';

        }


        return formatted.toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        );

    };


    /* ========================================================
       LOADING
    ======================================================== */

    if (loading) {

        return (
            <>
                <style>
                    {pageStyles}
                </style>

                <div className="admin-settings-loading">

                    <RefreshCw
                        size={22}
                        className="admin-settings-spin"
                    />

                    <span>
                        Loading admin settings...
                    </span>

                </div>
            </>
        );

    }


    /* ========================================================
       PAGE
    ======================================================== */

    return (
        <>
            <style>
                {pageStyles}
            </style>


            <div className="admin-settings-page">

                {/* ==================================================
                    PAGE HEADER
                ================================================== */}

                <div className="admin-settings-header">

                    <div>

                        <div className="admin-settings-eyebrow">

                            <ShieldCheck
                                size={16}
                            />

                            <span>
                                Administrative Control
                            </span>

                        </div>


                        <h1>
                            Admin Settings
                        </h1>


                        <p>
                            Manage your administrative
                            account information and
                            security settings.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="admin-settings-refresh"
                        onClick={
                            fetchProfile
                        }
                    >

                        <RefreshCw
                            size={17}
                        />

                        Refresh

                    </button>

                </div>


                {/* ==================================================
                    ERROR MESSAGE
                ================================================== */}

                {error && (

                    <div className="admin-settings-alert error">

                        <AlertCircle
                            size={18}
                        />

                        <span>
                            {error}
                        </span>

                    </div>

                )}


                {/* ==================================================
                    PROFILE SUCCESS MESSAGE
                ================================================== */}

                {profileMessage && (

                    <div className="admin-settings-alert success">

                        <CheckCircle2
                            size={18}
                        />

                        <span>
                            {profileMessage}
                        </span>

                    </div>

                )}


                {/* ==================================================
                    PASSWORD SUCCESS MESSAGE
                ================================================== */}

                {passwordMessage && (

                    <div className="admin-settings-alert success">

                        <CheckCircle2
                            size={18}
                        />

                        <span>
                            {passwordMessage}
                        </span>

                    </div>

                )}


                <div className="admin-settings-grid">

                    {/* ==================================================
                        ADMIN PROFILE
                    ================================================== */}

                    <section className="admin-settings-card">

                        <div className="admin-settings-card-header">

                            <div className="admin-settings-card-icon">

                                <UserCircle
                                    size={22}
                                />

                            </div>


                            <div>

                                <h2>
                                    Administrator Profile
                                </h2>

                                <p>
                                    Update your basic
                                    administrative account
                                    information.
                                </p>

                            </div>

                        </div>


                        <form
                            onSubmit={
                                handleProfileSubmit
                            }
                        >

                            <div className="admin-settings-form-grid">

                                <div className="admin-settings-field">

                                    <label>
                                        Full Name
                                    </label>

                                    <div className="admin-settings-input-wrap">

                                        <UserCircle
                                            size={17}
                                        />

                                        <input
                                            type="text"
                                            name="name"
                                            value={
                                                profileForm.name
                                            }
                                            onChange={
                                                handleProfileChange
                                            }
                                            placeholder="Enter admin name"
                                            required
                                        />

                                    </div>

                                </div>


                                <div className="admin-settings-field">

                                    <label>
                                        Email Address
                                    </label>

                                    <div className="admin-settings-input-wrap">

                                        <Mail
                                            size={17}
                                        />

                                        <input
                                            type="email"
                                            name="email"
                                            value={
                                                profileForm.email
                                            }
                                            onChange={
                                                handleProfileChange
                                            }
                                            placeholder="Enter admin email"
                                            required
                                        />

                                    </div>

                                </div>


                                <div className="admin-settings-field">

                                    <label>
                                        Mobile Number
                                    </label>

                                    <div className="admin-settings-input-wrap">

                                        <Phone
                                            size={17}
                                        />

                                        <input
                                            type="text"
                                            name="mobile"
                                            value={
                                                profileForm.mobile
                                            }
                                            onChange={
                                                handleProfileChange
                                            }
                                            placeholder="Enter mobile number"
                                        />

                                    </div>

                                </div>

                            </div>


                            <div className="admin-settings-form-footer">

                                <button
                                    type="submit"
                                    className="admin-settings-primary-btn"
                                    disabled={
                                        savingProfile
                                    }
                                >

                                    {savingProfile ? (

                                        <>
                                            <RefreshCw
                                                size={17}
                                                className="admin-settings-spin"
                                            />

                                            Saving...

                                        </>

                                    ) : (

                                        <>
                                            <Save
                                                size={17}
                                            />

                                            Save Profile

                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </section>


                    {/* ==================================================
                        ACCOUNT INFORMATION
                    ================================================== */}

                    <section className="admin-settings-card">

                        <div className="admin-settings-card-header">

                            <div className="admin-settings-card-icon">

                                <ShieldCheck
                                    size={22}
                                />

                            </div>


                            <div>

                                <h2>
                                    Account Information
                                </h2>

                                <p>
                                    Current administrative
                                    account status.
                                </p>

                            </div>

                        </div>


                        <div className="admin-settings-info-list">

                            <div className="admin-settings-info-row">

                                <div className="admin-settings-info-left">

                                    <ShieldCheck
                                        size={18}
                                    />

                                    <span>
                                        Account Role
                                    </span>

                                </div>


                                <strong>
                                    Administrator
                                </strong>

                            </div>


                            <div className="admin-settings-info-row">

                                <div className="admin-settings-info-left">

                                    <CheckCircle2
                                        size={18}
                                    />

                                    <span>
                                        Account Status
                                    </span>

                                </div>


                                <span
                                    className={
                                        profile?.isActive
                                            ? 'admin-settings-status active'
                                            : 'admin-settings-status inactive'
                                    }
                                >
                                    {profile?.isActive
                                        ? 'Active'
                                        : 'Inactive'}
                                </span>

                            </div>


                            <div className="admin-settings-info-row">

                                <div className="admin-settings-info-left">

                                    <CalendarDays
                                        size={18}
                                    />

                                    <span>
                                        Account Created
                                    </span>

                                </div>


                                <strong>
                                    {formatDate(
                                        profile?.createdAt
                                    )}
                                </strong>

                            </div>


                            <div className="admin-settings-info-row">

                                <div className="admin-settings-info-left">

                                    <RefreshCw
                                        size={18}
                                    />

                                    <span>
                                        Last Profile Update
                                    </span>

                                </div>


                                <strong>
                                    {formatDate(
                                        profile?.updatedAt
                                    )}
                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* ==================================================
                        PASSWORD SECURITY
                    ================================================== */}

                    <section className="admin-settings-card admin-settings-password-card">

                        <div className="admin-settings-card-header">

                            <div className="admin-settings-card-icon">

                                <LockKeyhole
                                    size={22}
                                />

                            </div>


                            <div>

                                <h2>
                                    Password & Security
                                </h2>

                                <p>
                                    Change the password used
                                    to access the admin portal.
                                </p>

                            </div>

                        </div>


                        <form
                            onSubmit={
                                handlePasswordSubmit
                            }
                        >

                            <div className="admin-settings-form-grid">

                                <div className="admin-settings-field admin-settings-field-full">

                                    <label>
                                        Current Password
                                    </label>

                                    <div className="admin-settings-input-wrap">

                                        <KeyRound
                                            size={17}
                                        />

                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={
                                                passwordForm.currentPassword
                                            }
                                            onChange={
                                                handlePasswordChange
                                            }
                                            placeholder="Enter current password"
                                            autoComplete="current-password"
                                            required
                                        />

                                    </div>

                                </div>


                                <div className="admin-settings-field">

                                    <label>
                                        New Password
                                    </label>

                                    <div className="admin-settings-input-wrap">

                                        <LockKeyhole
                                            size={17}
                                        />

                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={
                                                passwordForm.newPassword
                                            }
                                            onChange={
                                                handlePasswordChange
                                            }
                                            placeholder="Minimum 8 characters"
                                            autoComplete="new-password"
                                            required
                                        />

                                    </div>

                                </div>


                                <div className="admin-settings-field">

                                    <label>
                                        Confirm New Password
                                    </label>

                                    <div className="admin-settings-input-wrap">

                                        <LockKeyhole
                                            size={17}
                                        />

                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={
                                                passwordForm.confirmPassword
                                            }
                                            onChange={
                                                handlePasswordChange
                                            }
                                            placeholder="Re-enter new password"
                                            autoComplete="new-password"
                                            required
                                        />

                                    </div>

                                </div>

                            </div>


                            <div className="admin-settings-security-note">

                                <ShieldCheck
                                    size={18}
                                />

                                <div>

                                    <strong>
                                        Security requirement
                                    </strong>

                                    <p>
                                        Your new password must
                                        contain at least 8
                                        characters and must be
                                        different from your
                                        current password.
                                    </p>

                                </div>

                            </div>


                            <div className="admin-settings-form-footer">

                                <button
                                    type="submit"
                                    className="admin-settings-primary-btn"
                                    disabled={
                                        changingPassword
                                    }
                                >

                                    {changingPassword ? (

                                        <>
                                            <RefreshCw
                                                size={17}
                                                className="admin-settings-spin"
                                            />

                                            Changing Password...

                                        </>

                                    ) : (

                                        <>
                                            <LockKeyhole
                                                size={17}
                                            />

                                            Change Password

                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </section>

                </div>

            </div>
        </>
    );

};


/* ============================================================
   PAGE STYLES
============================================================ */

const pageStyles = `

.admin-settings-page {
    width: 100%;
    max-width: 1240px;
    margin: 0 auto;
    padding: 28px 28px 48px;
}

.admin-settings-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 26px;
}

.admin-settings-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: #174a8b;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 8px;
}

.admin-settings-header h1 {
    margin: 0;
    color: #172033;
    font-family:
        'Playfair Display',
        Georgia,
        serif;
    font-size: 32px;
    line-height: 1.2;
}

.admin-settings-header p {
    margin: 8px 0 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.7;
}

.admin-settings-refresh {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 42px;
    padding: 0 16px;
    border: 1px solid #dbe3ee;
    border-radius: 8px;
    background: #ffffff;
    color: #334155;
    font-size: 13px;
    font-weight: 700;
    box-shadow:
        0 2px 8px rgba(15, 23, 42, 0.04);
}

.admin-settings-refresh:hover {
    border-color: #174a8b;
    color: #174a8b;
}

.admin-settings-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 13px 15px;
    margin-bottom: 18px;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.5;
}

.admin-settings-alert.success {
    border: 1px solid #bbf7d0;
    background: #f0fdf4;
    color: #166534;
}

.admin-settings-alert.error {
    border: 1px solid #fecaca;
    background: #fef2f2;
    color: #991b1b;
}

.admin-settings-grid {
    display: grid;
    grid-template-columns:
        minmax(0, 1.35fr)
        minmax(320px, 0.65fr);
    gap: 20px;
}

.admin-settings-card {
    min-width: 0;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #ffffff;
    box-shadow:
        0 4px 18px rgba(15, 23, 42, 0.05);
}

.admin-settings-password-card {
    grid-column: 1 / -1;
}

.admin-settings-card-header {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    padding: 22px 22px 18px;
    border-bottom: 1px solid #edf1f6;
}

.admin-settings-card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: #eaf1fb;
    color: #174a8b;
}

.admin-settings-card-header h2 {
    margin: 1px 0 4px;
    color: #172033;
    font-size: 17px;
    font-weight: 750;
}

.admin-settings-card-header p {
    margin: 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.6;
}

.admin-settings-card form {
    padding: 22px;
}

.admin-settings-form-grid {
    display: grid;
    grid-template-columns:
        repeat(2, minmax(0, 1fr));
    gap: 18px;
}

.admin-settings-field {
    min-width: 0;
}

.admin-settings-field-full {
    grid-column: 1 / -1;
}

.admin-settings-field label {
    display: block;
    margin-bottom: 7px;
    color: #334155;
    font-size: 13px;
    font-weight: 700;
}

.admin-settings-input-wrap {
    display: flex;
    align-items: center;
    gap: 9px;
    min-height: 44px;
    padding: 0 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #ffffff;
    color: #64748b;
    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;
}

.admin-settings-input-wrap:focus-within {
    border-color: #174a8b;
    box-shadow:
        0 0 0 3px rgba(23, 74, 139, 0.10);
}

.admin-settings-input-wrap input {
    width: 100%;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    color: #172033;
    font-size: 13px;
}

.admin-settings-input-wrap input::placeholder {
    color: #94a3b8;
}

.admin-settings-form-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid #edf1f6;
}

.admin-settings-primary-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 42px;
    padding: 0 18px;
    border: none;
    border-radius: 8px;
    background: #174a8b;
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
    box-shadow:
        0 4px 12px rgba(23, 74, 139, 0.18);
    transition:
        background 0.2s ease,
        transform 0.2s ease,
        opacity 0.2s ease;
}

.admin-settings-primary-btn:hover:not(:disabled) {
    background: #123c72;
    transform: translateY(-1px);
}

.admin-settings-primary-btn:disabled {
    cursor: not-allowed;
    opacity: 0.65;
}

.admin-settings-info-list {
    padding: 8px 22px 18px;
}

.admin-settings-info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 58px;
    border-bottom: 1px solid #edf1f6;
}

.admin-settings-info-row:last-child {
    border-bottom: none;
}

.admin-settings-info-left {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #64748b;
    font-size: 13px;
    font-weight: 600;
}

.admin-settings-info-left svg {
    color: #174a8b;
}

.admin-settings-info-row strong {
    color: #172033;
    font-size: 13px;
    text-align: right;
}

.admin-settings-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 5px 10px;
    font-size: 11px;
    font-weight: 800;
}

.admin-settings-status.active {
    background: #dcfce7;
    color: #166534;
}

.admin-settings-status.inactive {
    background: #fee2e2;
    color: #991b1b;
}

.admin-settings-security-note {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    margin-top: 20px;
    padding: 14px 15px;
    border: 1px solid #dbeafe;
    border-radius: 9px;
    background: #f8fbff;
    color: #1e40af;
}

.admin-settings-security-note svg {
    flex-shrink: 0;
    margin-top: 1px;
}

.admin-settings-security-note strong {
    display: block;
    margin-bottom: 3px;
    font-size: 12px;
}

.admin-settings-security-note p {
    margin: 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.6;
}

.admin-settings-loading {
    min-height: 420px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #64748b;
    font-size: 14px;
    font-weight: 600;
}

.admin-settings-spin {
    animation:
        adminSettingsSpin 0.9s linear infinite;
}

@keyframes adminSettingsSpin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 900px) {

    .admin-settings-grid {
        grid-template-columns: 1fr;
    }

    .admin-settings-password-card {
        grid-column: auto;
    }

}

@media (max-width: 640px) {

    .admin-settings-page {
        padding: 20px 16px 36px;
    }

    .admin-settings-header {
        flex-direction: column;
    }

    .admin-settings-header h1 {
        font-size: 27px;
    }

    .admin-settings-refresh {
        width: 100%;
    }

    .admin-settings-form-grid {
        grid-template-columns: 1fr;
    }

    .admin-settings-field-full {
        grid-column: auto;
    }

    .admin-settings-card-header {
        padding: 18px 16px 16px;
    }

    .admin-settings-card form {
        padding: 18px 16px;
    }

    .admin-settings-info-list {
        padding-left: 16px;
        padding-right: 16px;
    }

    .admin-settings-info-row {
        align-items: flex-start;
        flex-direction: column;
        justify-content: center;
        gap: 5px;
        padding: 12px 0;
    }

    .admin-settings-info-row strong {
        text-align: left;
    }

    .admin-settings-form-footer {
        justify-content: stretch;
    }

    .admin-settings-primary-btn {
        width: 100%;
    }

}

`;


export default AdminSettings;