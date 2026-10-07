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
    KeyRound,
    FileSignature,
    Trash2,
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

    const [adminSignature, setAdminSignature] = useState(null);
    const [signatureMessage, setSignatureMessage] = useState('');
    const [savingSignature, setSavingSignature] = useState(false);
    const [pendingSignature, setPendingSignature] = useState(null);

    const [error, setError] =
        useState('');

    const [newAdminForm, setNewAdminForm] = useState({ name: '', email: '', mobile: '', password: '' });
    const [creatingAdmin, setCreatingAdmin] = useState(false);
    const [createdAdmin, setCreatedAdmin] = useState(null);


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


    const fetchAdminSignature = async () => {
        try {
            const response = await API.get('/admin/settings/signature');
            setAdminSignature(response.data?.signature || null);
        } catch (signatureError) {
            console.error('Admin signature load error:', signatureError);
        }
    };

    /* ========================================================
       INITIAL LOAD
    ======================================================== */

    useEffect(() => {

        fetchProfile();
        fetchAdminSignature();

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


    const handleSignatureUpload = (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (!['image/png', 'image/jpeg'].includes(file.type)) { setSignatureMessage('Choose a PNG or JPEG image file.'); return; }
        if (file.size > 500 * 1024) { setSignatureMessage('The signature image must be 500 KB or smaller.'); return; }
        const reader = new FileReader();
        reader.onerror = () => setSignatureMessage('Unable to read this image file.');
        reader.onload = () => {
            const source = new Image();
            source.onerror = () => setSignatureMessage('This image could not be decoded. Try exporting it again as a standard PNG.');
            source.onload = () => {
                try {
                    const scale = Math.max(Math.min(1, 2400 / source.naturalWidth, 800 / source.naturalHeight), Math.max(100 / source.naturalWidth, 20 / source.naturalHeight));
                    const width = Math.max(100, Math.min(2400, Math.round(source.naturalWidth * scale)));
                    const height = Math.max(20, Math.min(800, Math.round(source.naturalHeight * scale)));
                    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
                    const context = canvas.getContext('2d'); if (!context) throw new Error('Unable to prepare the signature image.');
                    if (file.type === 'image/jpeg') { context.fillStyle = '#ffffff'; context.fillRect(0, 0, width, height); }
                    context.drawImage(source, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL(file.type, file.type === 'image/jpeg' ? 0.92 : undefined); const encoded = dataUrl.split(',')[1] || '';
                    if (Math.floor(encoded.length * 3 / 4) > 500 * 1024) throw new Error('The prepared image is over 500 KB. Crop it closer to the signature and try again.');
                    setPendingSignature({ dataUrl }); setSignatureMessage('Signature ready. Select Save signature to apply it.');
                } catch (imageError) { setSignatureMessage(imageError.message || 'Unable to prepare the signature image.'); }
            };
            source.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

    const handleSignatureSubmit = async () => {
        if (!pendingSignature?.dataUrl) return;
        setSavingSignature(true); setSignatureMessage('');
        try {
            const response = await API.put('/admin/settings/signature', { dataUrl: pendingSignature.dataUrl });
            setAdminSignature(response.data?.signature || null); setPendingSignature(null);
            setSignatureMessage(response.data?.message || 'Admin signature saved.');
        } catch (uploadError) { setSignatureMessage(uploadError.response?.data?.message || uploadError.message || 'Unable to save the signature image.'); }
        finally { setSavingSignature(false); }
    };
    const handleSignatureRemove = async () => {
        setSavingSignature(true);
        setSignatureMessage('');
        try {
            const response = await API.delete('/admin/settings/signature');
            setAdminSignature(null);
            setSignatureMessage(response.data?.message || 'Admin signature removed.');
        } catch (removeError) {
            setSignatureMessage(removeError.response?.data?.message || 'Unable to remove the signature image.');
        } finally {
            setSavingSignature(false);
        }
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

    const handleCreateAdmin = async (event) => {
        event.preventDefault();
        setError('');
        setCreatedAdmin(null);
        setCreatingAdmin(true);
        try {
            const response = await API.post('/admin/settings/admins', newAdminForm, {
                headers: { Authorization: `Bearer ${authService.getToken()}` }
            });
            setCreatedAdmin(response.data.admin);
            setNewAdminForm({ name: '', email: '', mobile: '', password: '' });
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to create the administrator account.');
        } finally {
            setCreatingAdmin(false);
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
                        {profile?.adminId && <p style={{ marginTop: 8, fontWeight: 700, color: '#174a8b' }}>Your Admin ID: {profile.adminId}</p>}

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


                    <section className="admin-settings-card admin-settings-signature-card">
                        <div className="admin-settings-card-header">
                            <div className="admin-settings-card-icon"><FileSignature size={22} /></div>
                            <div><h2>PDF Administrator Signature</h2><p>Signature used on scholarship and Freeship PDFs.</p></div>
                        </div>
                        <div className="admin-settings-signature-content">
                            <p>Choose a PNG or JPEG (500 KB maximum). Saving applies it to future approvals; existing approved Freeship Cards keep their original reviewer. This is a visual signature, not a certificate-backed PDF signature.</p>
                            {(pendingSignature || adminSignature) && <div className="admin-settings-signature-preview"><img src={pendingSignature?.dataUrl || adminSignature.dataUrl} alt="Administrator signature preview" /><span>{pendingSignature ? 'Ready to save' : <>Configured for <strong>{adminSignature.name}</strong></>}</span></div>}
                            <div className="admin-settings-signature-actions">
                                <label className="admin-settings-signature-file">{pendingSignature ? 'Choose a different image' : adminSignature ? 'Replace signature image' : 'Choose signature image'}<input type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" onChange={handleSignatureUpload} disabled={savingSignature} /></label>
                                {pendingSignature && <button type="button" className="admin-settings-primary-btn" onClick={handleSignatureSubmit} disabled={savingSignature}>{savingSignature ? 'Saving...' : 'Save signature'}</button>}
                                {adminSignature && !pendingSignature && <button type="button" className="portal-button portal-button-secondary" onClick={handleSignatureRemove} disabled={savingSignature}><Trash2 size={16} /> Remove</button>}
                            </div>
                            {signatureMessage && <p className="admin-settings-signature-message" role="status">{signatureMessage}</p>}
                        </div>
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

                <section className="admin-settings-card" style={{ marginTop: 20 }}>
                    <div className="admin-settings-card-header">
                        <div className="admin-settings-card-icon"><ShieldCheck size={22} /></div>
                        <div><h2>Create administrator account</h2><p>Only a signed-in administrator can create another admin. The Admin ID is generated by the server.</p></div>
                    </div>
                    {createdAdmin && <div className="admin-settings-alert success">Created Admin ID: <strong>{createdAdmin.adminId}</strong> — share it and the initial password with the new admin securely.</div>}
                    <form onSubmit={handleCreateAdmin}>
                        <div className="admin-settings-form-grid">
                            <div className="admin-settings-field"><label>Full name</label><div className="admin-settings-input-wrap"><input value={newAdminForm.name} onChange={(event) => setNewAdminForm({ ...newAdminForm, name: event.target.value })} required minLength={2} maxLength={100} /></div></div>
                            <div className="admin-settings-field"><label>Email address</label><div className="admin-settings-input-wrap"><input type="email" value={newAdminForm.email} onChange={(event) => setNewAdminForm({ ...newAdminForm, email: event.target.value })} required maxLength={254} /></div></div>
                            <div className="admin-settings-field"><label>Mobile number</label><div className="admin-settings-input-wrap"><input type="tel" inputMode="numeric" value={newAdminForm.mobile} onChange={(event) => setNewAdminForm({ ...newAdminForm, mobile: event.target.value.replace(/\D/g, '').slice(0, 10) })} required pattern="[0-9]{10}" /></div></div>
                            <div className="admin-settings-field"><label>Initial password (12+ characters)</label><div className="admin-settings-input-wrap"><input type="password" value={newAdminForm.password} onChange={(event) => setNewAdminForm({ ...newAdminForm, password: event.target.value })} required minLength={12} maxLength={128} autoComplete="new-password" /></div></div>
                        </div>
                        <div className="admin-settings-form-footer"><button type="submit" className="admin-settings-primary-btn" disabled={creatingAdmin}>{creatingAdmin ? 'Creating account…' : 'Create administrator'}</button></div>
                    </form>
                </section>

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

.admin-settings-signature-content { padding: 14px 20px 18px; }
.admin-settings-signature-content > p { margin: 0 0 12px; color: #64748b; font-size: 12px; line-height: 1.5; }
.admin-settings-signature-preview { display: flex; align-items: center; gap: 10px; margin: 0 0 12px; padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; color: #475569; font-size: 12px; }
.admin-settings-signature-preview img { display: block; width: 120px; height: 36px; max-width: 40%; object-fit: contain; background: #fff; border: 1px solid #e2e8f0; border-radius: 5px; }
.admin-settings-signature-actions { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.admin-settings-signature-file { display: inline-flex; align-items: center; min-height: 38px; padding: 0 12px; border: 1px solid #cbd5e1; border-radius: 8px; color: #334155; font-size: 12px; font-weight: 700; cursor: pointer; }
.admin-settings-signature-file input { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); clip-path: inset(50%); white-space: nowrap; }
.admin-settings-signature-message { margin: 10px 0 0 !important; font-size: 12px !important; }
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
