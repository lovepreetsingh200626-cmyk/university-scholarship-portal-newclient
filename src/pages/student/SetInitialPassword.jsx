import React, { useEffect, useState } from 'react';
import { ArrowRight, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const SetInitialPassword = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const user = authService.getCurrentUser();

        if (!authService.isAuthenticated() || user?.role !== 'student') {
            navigate('/login', { replace: true });
        } else if (!user.mustChangePassword) {
            navigate('/student', { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (newPassword.length < 8 || newPassword.length > 128) {
            setError('Your new password must contain between 8 and 128 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('The new passwords do not match.');
            return;
        }

        try {
            setLoading(true);
            const response = await authService.changePassword(currentPassword, newPassword);
            const user = response.user || {
                ...authService.getCurrentUser(),
                mustChangePassword: false
            };

            authService.saveAuthData({
                token: response.token || authService.getToken(),
                user
            });
            navigate('/student', { replace: true });
        } catch (requestError) {
            if (requestError.response?.status === 401) {
                setError(requestError.response?.data?.message || 'The initial password is incorrect.');
            } else {
                setError(
                    requestError.response?.data?.message ||
                    'Unable to update your password. Please try again.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const user = authService.getCurrentUser();
    if (!authService.isAuthenticated() || user?.mustChangePassword !== true) {
        return null;
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <header className="auth-header">
                    <div className="brand-emblem">
                        <KeyRound size={27} />
                    </div>
                    <h1 className="portal-heading">Set Your Password</h1>
                    <p className="portal-text">
                        Use the initial password provided with your Student ID, then create your personal password to continue.
                    </p>
                </header>

                {error && <div className="auth-error" role="alert">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="portal-label" htmlFor="initialPassword">Original Password (Initial Password)</label>
                        <input
                            id="initialPassword"
                            className="portal-input"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="portal-label" htmlFor="newPassword">New Password</label>
                        <input
                            id="newPassword"
                            className="portal-input"
                            type="password"
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={128}
                            required
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="portal-label" htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            id="confirmPassword"
                            className="portal-input"
                            type="password"
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={128}
                            required
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="portal-button portal-button-primary auth-submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Saving Password...' : 'Set Password and Continue'}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>
            </section>
        </main>
    );
};

export default SetInitialPassword;
