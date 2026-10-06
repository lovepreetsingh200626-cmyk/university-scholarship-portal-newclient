import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const ForgotPassword = ({ accountType = 'student' }) => {
    const navigate = useNavigate();
    const isAdmin = accountType === 'admin';
    const accountRole = isAdmin ? 'admin' : 'student';
    const accountLabel = isAdmin ? 'Admin ID' : 'Student ID';
    const [accountId, setAccountId] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [codeRequested, setCodeRequested] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const requestCode = async (event) => {
        event.preventDefault();
        setError('');
        setNotice('');
        setLoading(true);
        try {
            const response = await authService.requestPasswordReset(accountRole, accountId.trim(), mobile.trim(), email.trim());
            setCodeRequested(true);
            setNotice(response.message || 'Your details are verified. Check your registered email inbox for the recovery code.');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to request a recovery code. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (event) => {
        event.preventDefault();
        setError('');
        setNotice('');
        if (password !== confirmPassword) {
            setError('The new passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            const response = await authService.resetPassword(accountRole, accountId.trim(), mobile.trim(), email.trim(), otp, password);
            setNotice(response.message || 'Password reset successfully. You can now sign in.');
            window.setTimeout(() => navigate(isAdmin ? '/admin/login' : '/login', { replace: true }), 1200);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'The code is invalid or expired. Request a new code and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <header className="auth-header">
                    <div className="brand-emblem"><GraduationCap size={27} /></div>
                    <h1 className="portal-heading">Reset your password</h1>
                    <p className="portal-text">Verify your {isAdmin ? 'admin' : 'student'} ID, mobile number, and registered email to receive a one-time code.</p>
                </header>

                {error && <div className="auth-error" role="alert">{error}</div>}
                {notice && <div className="auth-success" role="status">{notice}</div>}

                {!codeRequested ? (
                    <form className="auth-form" onSubmit={requestCode}>
                        <div className="form-group">
                            <label className="portal-label" htmlFor="recovery-account-id">{accountLabel}</label>
                            <input id="recovery-account-id" className="portal-input" value={accountId} onChange={(event) => setAccountId(event.target.value.toUpperCase())} autoComplete="username" required maxLength={30} />
                        </div>
                        <div className="form-group">
                            <label className="portal-label" htmlFor="recovery-mobile">Mobile number</label>
                            <input id="recovery-mobile" className="portal-input" type="tel" value={mobile} onChange={(event) => setMobile(event.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" autoComplete="tel-national" required maxLength={10} pattern="[0-9]{10}" />
                        </div>
                        <div className="form-group">
                            <label className="portal-label" htmlFor="recovery-email">Registered email</label>
                            <input id="recovery-email" className="portal-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required maxLength={254} />
                        </div>
                        <button className="portal-button portal-button-primary auth-submit-button" type="submit" disabled={loading}>
                            {loading ? 'Sending code…' : 'Email me a recovery code'}
                        </button>
                    </form>
                ) : (
                    <form className="auth-form" onSubmit={resetPassword}>
                        <div className="form-group">
                            <label className="portal-label" htmlFor="recovery-account-id-confirm">{accountLabel}</label>
                            <input id="recovery-account-id-confirm" className="portal-input" value={accountId} readOnly />
                        </div>
                        <div className="form-group">
                            <label className="portal-label" htmlFor="recovery-mobile-confirm">Mobile number</label>
                            <input id="recovery-mobile-confirm" className="portal-input" value={mobile} readOnly />
                        </div>
                        <div className="form-group">
                            <label className="portal-label" htmlFor="recovery-email-confirm">Registered email</label>
                            <input id="recovery-email-confirm" className="portal-input" type="email" value={email} readOnly />
                        </div>
                        <div className="form-group">
                            <label className="portal-label" htmlFor="recovery-otp">6-digit email code</label>
                            <input id="recovery-otp" className="portal-input" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" required />
                        </div>
                        <div className="form-group">
                            <label className="portal-label" htmlFor="new-password">New password</label>
                            <input id="new-password" className="portal-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={8} maxLength={128} required />
                        </div>
                        <div className="form-group">
                            <label className="portal-label" htmlFor="confirm-password">Confirm new password</label>
                            <input id="confirm-password" className="portal-input" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} maxLength={128} required />
                        </div>
                        <button className="portal-button portal-button-primary auth-submit-button" type="submit" disabled={loading || otp.length !== 6}>
                            {loading ? 'Updating password…' : 'Reset password'}
                        </button>
                        <button className="auth-link-button" type="button" onClick={() => { setCodeRequested(false); setOtp(''); setPassword(''); setConfirmPassword(''); setNotice(''); setError(''); }}>
                            Use different account details
                        </button>
                    </form>
                )}

                <div className="auth-footer"><Link to={isAdmin ? '/admin/login' : '/login'}>Back to {isAdmin ? 'Admin' : 'Student'} Login</Link></div>
            </section>
        </main>
    );
};

export default ForgotPassword;
