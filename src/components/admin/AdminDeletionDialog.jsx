import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import API from '../../services/api';
import authService from '../../services/authService';

const AdminDeletionDialog = ({ open, targetType, targetIds, itemLabel, onClose, onComplete }) => {
    const [step, setStep] = useState('prepare');
    const [confirmation, setConfirmation] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendAt, setResendAt] = useState(null);
    const [resendSeconds, setResendSeconds] = useState(0);

    useEffect(() => {
        if (open) {
            setStep('prepare');
            setConfirmation('');
            setOtp('');
            setError('');
            setNotice('');
            setResendAt(null);
            setResendSeconds(0);
        }
    }, [open, targetType, targetIds.join(',')]);

    useEffect(() => {
        if (!resendAt) return undefined;
        const updateCountdown = () => setResendSeconds(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
        updateCountdown();
        const timer = window.setInterval(updateCountdown, 1000);
        return () => window.clearInterval(timer);
    }, [resendAt]);

    if (!open) return null;

    const close = () => {
        if (!loading) onClose();
    };

    const requestCode = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await API.post('/admin/deletion/request', { targetType, targetIds }, {
                headers: { Authorization: `Bearer ${authService.getToken()}` }
            });
            setNotice(response.data?.message || 'Check the administrator email inbox and Spam folder for the confirmation code.');
            setStep('confirm');
            setOtp('');
            setResendAt(Date.now() + 60 * 1000);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to send the confirmation code.');
        } finally {
            setLoading(false);
        }
    };

    const confirmDeletion = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await API.post('/admin/deletion/confirm', { confirmation, otp }, {
                headers: { Authorization: `Bearer ${authService.getToken()}` }
            });
            setNotice(response.data?.message || 'The selected records were deleted.');
            setStep('done');
            onComplete?.(response.data);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to verify the code or delete the selected records.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.62)', display: 'grid', placeItems: 'center', padding: 18 }}>
            <section role="dialog" aria-modal="true" aria-labelledby="admin-delete-title" className="portal-card" style={{ width: '100%', maxWidth: 520, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <AlertTriangle color="#b91c1c" size={24} />
                        <div>
                            <h2 id="admin-delete-title" style={{ margin: 0, color: '#991b1b', fontSize: 20 }}>Confirm permanent deletion</h2>
                            <p style={{ color: '#475569', lineHeight: 1.55 }}>This will permanently delete {targetIds.length} {itemLabel}. Linked student profiles and scholarship data are also removed when deleting student accounts.</p>
                        </div>
                    </div>
                    {step !== 'done' && <button type="button" onClick={close} aria-label="Close" style={{ border: 0, background: 'transparent', cursor: 'pointer' }}><X size={20} /></button>}
                </div>

                {error && <div role="alert" style={{ margin: '12px 0', padding: 12, color: '#991b1b', background: '#fff1f2', borderRadius: 8 }}>{error}</div>}
                {notice && <div role="status" style={{ margin: '12px 0', padding: 12, color: step === 'done' ? '#166534' : '#1e3a8a', background: step === 'done' ? '#f0fdf4' : '#eff6ff', borderRadius: 8 }}>{notice}</div>}

                {step === 'prepare' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                        <button type="button" className="portal-button portal-button-secondary" onClick={close} disabled={loading}>Cancel</button>
                        <button type="button" className="portal-button" onClick={requestCode} disabled={loading || !targetIds.length} style={{ background: '#b91c1c', color: 'white' }}>{loading ? 'Sending code…' : 'Send admin email code'}</button>
                    </div>
                )}

                {step === 'confirm' && (
                    <form onSubmit={confirmDeletion}>
                        <div className="form-group">
                            <label className="portal-label" htmlFor="delete-confirm-text">Type CONFIRM DELETE to continue</label>
                            <input id="delete-confirm-text" className="portal-input" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" required />
                        </div>
                        <div className="form-group">
                            <label className="portal-label" htmlFor="delete-confirm-otp">6-digit code sent to the admin email</label>
                            <input id="delete-confirm-otp" className="portal-input" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" required pattern="[0-9]{6}" maxLength={6} />
                        </div>
                        <button type="button" className="auth-link-button" onClick={requestCode} disabled={loading || resendSeconds > 0}>
                            {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : 'Resend confirmation code'}
                        </button>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                            <button type="button" className="portal-button portal-button-secondary" onClick={close} disabled={loading}>Cancel</button>
                            <button type="submit" className="portal-button" disabled={loading || confirmation !== 'CONFIRM DELETE' || otp.length !== 6} style={{ background: '#b91c1c', color: 'white' }}>{loading ? 'Deleting…' : 'Permanently delete'}</button>
                        </div>
                    </form>
                )}

                {step === 'done' && <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}><button type="button" className="portal-button portal-button-primary" onClick={onClose}>Close</button></div>}
            </section>
        </div>
    );
};

export default AdminDeletionDialog;
