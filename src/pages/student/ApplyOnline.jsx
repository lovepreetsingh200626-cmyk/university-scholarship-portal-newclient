import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, Clock3, FileText, LockKeyhole } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import authService from '../../services/authService';

const DRAFT_STATUSES = ['DRAFT', 'CORRECTION REQUIRED'];
const SUBMITTED_STATUSES = ['SUBMITTED', 'UNDER VERIFICATION', 'RESUBMITTED'];
const normalizeStatus = (status) => String(status || 'DRAFT').trim().toUpperCase();

const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? '—'
        : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const applicationAction = (application) => {
    const status = normalizeStatus(application.status);
    if (status === 'DRAFT') {
        return { label: 'Continue and submit', path: `/student/applications/${application._id}/documents`, primary: true };
    }
    if (status === 'CORRECTION REQUIRED') {
        return { label: 'Complete corrections', path: `/student/applications/${application._id}/documents`, primary: true };
    }
    return {
        label: 'View submitted application',
        path: `/student/applications/${application._id}`,
        primary: false
    };
};

const applicationMessage = (status) => {
    const normalizedStatus = normalizeStatus(status);
    if (normalizedStatus === 'DRAFT') return 'Saved as a draft. It has not been sent for review; continue the form, upload documents, then submit it.';
    if (normalizedStatus === 'CORRECTION REQUIRED') return 'Corrections are requested. Update the details or documents, then submit the application again.';
    if (SUBMITTED_STATUSES.includes(normalizedStatus)) return 'Already submitted. Open the application to view its details, download the application PDF, and track its status.';
    if (normalizedStatus === 'REJECTED') return 'This application has been reviewed. Open it to read the status and view the saved application PDF.';
    return 'This application has already been submitted and can be opened to view its details and status.';
};

const statusStyle = (status) => {
    const normalizedStatus = normalizeStatus(status);
    if (['VERIFIED', 'SANCTIONED', 'DISBURSED'].includes(normalizedStatus)) return { color: '#166534', background: '#dcfce7' };
    if (['CORRECTION REQUIRED', 'REJECTED'].includes(normalizedStatus)) return { color: '#9a3412', background: '#ffedd5' };
    if (SUBMITTED_STATUSES.includes(normalizedStatus)) return { color: '#1d4ed8', background: '#dbeafe' };
    return { color: '#475569', background: '#e2e8f0' };
};

const titleCase = (value) => String(value || 'DRAFT').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

const ApplyOnline = () => {
    const navigate = useNavigate();
    const [freeshipStatus, setFreeshipStatus] = useState('DRAFT');
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        const load = async () => {
            if (!authService.getToken()) {
                navigate('/login', { replace: true });
                return;
            }
            try {
                setLoading(true);
                setError('');
                const [freeshipResponse, applicationsResponse] = await Promise.all([
                    API.get('/freeship-cards/me'),
                    API.get('/applications/my')
                ]);
                if (!active) return;
                setFreeshipStatus(freeshipResponse.data?.application?.status || 'DRAFT');
                setApplications(Array.isArray(applicationsResponse.data?.applications)
                    ? applicationsResponse.data.applications
                    : []);
            } catch (requestError) {
                if (!active) return;
                if (requestError.response?.status === 401) {
                    authService.logout();
                    navigate('/login', { replace: true });
                    return;
                }
                setError(requestError.response?.data?.message || 'Unable to load your scholarship applications.');
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => { active = false; };
    }, [navigate]);

    const approved = freeshipStatus === 'APPROVED';
    const draftCount = applications.filter((application) => DRAFT_STATUSES.includes(normalizeStatus(application.status))).length;
    const submittedCount = applications.length - draftCount;

    return (
        <main style={{ minHeight: '100vh', background: '#f5f7fb', padding: '28px 0 60px' }}>
            <div className="portal-container">
                <button type="button" className="portal-button portal-button-secondary" onClick={() => navigate('/student')}>
                    <ArrowLeft size={16} style={{ marginRight: 7 }} /> Dashboard
                </button>

                <section className="portal-card" style={{ marginTop: 20, padding: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 20 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 12, background: '#eaf1fb', color: '#174a8b', display: 'grid', placeItems: 'center' }}>
                            {approved ? <FileText size={23} /> : <LockKeyhole size={22} />}
                        </div>
                        <div>
                            <div style={{ color: '#64748b', fontSize: 13 }}>Student services</div>
                            <h1 className="portal-heading" style={{ margin: '3px 0 0' }}>Apply Online</h1>
                        </div>
                    </div>

                    {error && <div className="auth-error" role="alert" style={{ marginBottom: 18 }}>{error}</div>}

                    {loading ? (
                        <p className="portal-text">Loading your application access…</p>
                    ) : !approved ? (
                        <div style={{ padding: 18, borderRadius: 10, background: '#fff7ed', border: '1px solid #fed7aa' }}>
                            <strong style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9a3412' }}><LockKeyhole size={18} /> Apply Online is locked</strong>
                            <p className="portal-text" style={{ margin: '8px 0 14px' }}>Submit your Freeship Card application and wait for administrator approval. Scholarship applications unlock after approval.</p>
                            <button type="button" className="portal-button portal-button-primary" onClick={() => navigate('/student/freeship-card')}>
                                Apply Freeship Card <ArrowRight size={16} style={{ marginLeft: 7 }} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: 16, marginBottom: 20, borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                                <div style={{ flex: 1, minWidth: 230 }}>
                                    <strong style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#166534' }}><BadgeCheck size={18} /> Freeship Card approved</strong>
                                    <p className="portal-text" style={{ margin: '6px 0 0' }}>
                                        {applications.length
                                            ? 'Your existing applications are listed below. Continue saved drafts or open applications that have already been submitted.'
                                            : 'Choose a scholarship scheme to complete its application form and upload the required documents.'}
                                    </p>
                                </div>
                                <button type="button" className="portal-button portal-button-primary" onClick={() => navigate('/student/scholarships')}>
                                    {applications.length ? 'Browse other schemes' : 'Choose a scheme'}
                                    <ArrowRight size={16} style={{ marginLeft: 7 }} />
                                </button>
                            </div>

                            {applications.length > 0 && (
                                <div role="status" style={{ padding: '15px 17px', marginBottom: 22, borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                                    <strong style={{ color: '#1e3a8a' }}>
                                        {draftCount > 0 && submittedCount > 0
                                            ? 'You have saved drafts and submitted applications'
                                            : draftCount > 0
                                                ? 'You have an application to complete'
                                                : 'You have already applied'}
                                    </strong>
                                    <p className="portal-text" style={{ margin: '5px 0 0' }}>
                                        {draftCount > 0 && submittedCount > 0
                                            ? 'Continue a draft to finish and submit it, or open a submitted application to view its PDF and status.'
                                            : draftCount > 0
                                                ? 'Continue your draft, upload the required documents, and submit it before it is sent for review.'
                                                : 'Open a submitted application below to view its details, download the application PDF, and follow its review status.'}
                                    </p>
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                                <div>
                                    <h2 className="portal-heading" style={{ fontSize: 20, margin: 0 }}>Your scholarship applications</h2>
                                    <p className="portal-text" style={{ margin: '5px 0 0' }}>
                                        {applications.length
                                            ? `${draftCount} draft${draftCount === 1 ? '' : 's'} · ${submittedCount} submitted or reviewed`
                                            : 'Your saved drafts and submitted applications will appear here.'}
                                    </p>
                                </div>
                                <button type="button" className="portal-button portal-button-secondary" onClick={() => navigate('/student/freeship-card')}>
                                    <BadgeCheck size={16} style={{ marginRight: 7 }} /> View Freeship Card
                                </button>
                            </div>

                            {applications.length === 0 ? (
                                <div style={{ padding: 24, border: '1px dashed #cbd5e1', borderRadius: 10, textAlign: 'center' }}>
                                    <FileText size={25} color="#64748b" />
                                    <p className="portal-text" style={{ margin: '10px 0 0' }}>You have not started a scholarship application yet. Choose a scheme to begin.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: 12 }}>
                                    {applications.map((application) => {
                                        const status = normalizeStatus(application.status);
                                        const action = applicationAction(application);
                                        return (
                                            <article key={application._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: 16, border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff' }}>
                                                <div style={{ minWidth: 230, flex: 1 }}>
                                                    <strong style={{ display: 'block', color: '#172033' }}>{application.scholarship?.name || 'Scholarship application'}</strong>
                                                    <span style={{ display: 'block', marginTop: 5, color: '#64748b', fontSize: 13 }}>
                                                        Application {application.applicationNumber || '—'} · Updated {formatDate(application.updatedAt || application.createdAt)}
                                                    </span>
                                                    <span style={{ display: 'block', marginTop: 7, color: '#475569', fontSize: 13, lineHeight: 1.5 }}>
                                                        {applicationMessage(status)}
                                                    </span>
                                                </div>
                                                <span style={{ ...statusStyle(status), padding: '6px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                    <Clock3 size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />{titleCase(status)}
                                                </span>
                                                <button
                                                    type="button"
                                                    className={`portal-button ${action.primary ? 'portal-button-primary' : 'portal-button-secondary'}`}
                                                    onClick={() => navigate(action.path)}
                                                >
                                                    {action.label}
                                                </button>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}

                            <p className="portal-text" style={{ margin: '18px 0 0', fontSize: 13 }}>Drafts remain private until you submit them. Submitted applications can be opened above to view the saved form PDF and application status.</p>
                        </>
                    )}
                </section>
            </div>
        </main>
    );
};

export default ApplyOnline;
