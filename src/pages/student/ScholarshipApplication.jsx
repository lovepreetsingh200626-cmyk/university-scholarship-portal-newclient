import React, { useEffect, useState } from 'react';
import { ArrowLeft, BadgeCheck, CalendarDays, FileText, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';
import authService from '../../services/authService';

const formatDate = (value) => value
    ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Not specified';

const ScholarshipApplication = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [scholarship, setScholarship] = useState(null);
    const [eligibility, setEligibility] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
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
                const [scholarshipResponse, eligibilityResponse] = await Promise.all([
                    API.get(`/scholarships/${id}`),
                    API.get(`/eligibility/${id}`)
                ]);
                if (!active) return;
                setScholarship(scholarshipResponse.data.scholarship);
                setEligibility(eligibilityResponse.data);
            } catch (requestError) {
                if (!active) return;
                if (requestError.response?.status === 401) {
                    authService.logout();
                    navigate('/login', { replace: true });
                    return;
                }
                setError(requestError.response?.data?.message || 'Unable to load scholarship information.');
                setEligibility(requestError.response?.data);
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => { active = false; };
    }, [id, navigate]);

    const freeshipApproved = eligibility?.freeshipCardApproved === true;
    const missingApplicationInfo = eligibility?.needsApplicationDetails === true;
    const canStartDraft = freeshipApproved;

    const handleCreateApplication = async () => {
        try {
            setCreating(true);
            setError('');
            const response = await API.post('/applications', { scholarshipId: id });
            const application = response.data?.application;
            if (application?._id) {
                navigate(`/student/applications/${application._id}/documents`);
            } else {
                setError('The application draft was not returned. Please try again.');
            }
        } catch (requestError) {
            const existing = requestError.response?.data?.application;
            if (requestError.response?.status === 409 && existing?._id) {
                navigate(`/student/applications/${existing._id}/documents`);
                return;
            }
            if (requestError.response?.status === 401) {
                authService.logout();
                navigate('/login', { replace: true });
                return;
            }
            setError(requestError.response?.data?.message || 'Unable to create the application draft.');
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return <main className="portal-container" style={{ padding: '50px 20px' }}>Loading scholarship details...</main>;
    }

    return (
        <main style={{ minHeight: '100vh', background: '#f5f7fb', padding: '28px 0 60px' }}>
            <div className="portal-container">
                <button type="button" className="portal-button portal-button-secondary" onClick={() => navigate(`/student/scholarships/${id}`)}>
                    <ArrowLeft size={16} style={{ marginRight: 7 }} /> Back to Scholarship
                </button>

                <section className="portal-card" style={{ marginTop: 20, padding: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 12, background: '#eaf1fb', color: '#174a8b', display: 'grid', placeItems: 'center' }}>
                            <FileText size={23} />
                        </div>
                        <div>
                            <div style={{ color: '#64748b', fontSize: 13 }}>Scholarship application</div>
                            <h1 className="portal-heading" style={{ margin: '3px 0 0' }}>{scholarship?.name || 'Scholarship'}</h1>
                        </div>
                    </div>

                    {error && <div className="auth-error" role="alert" style={{ marginBottom: 18 }}>{error}</div>}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                        <div className="portal-card" style={{ padding: 16 }}>
                            <strong>Academic Year</strong>
                            <div style={{ marginTop: 7, color: '#64748b' }}>{scholarship?.academicYear || 'Not specified'}</div>
                        </div>
                        <div className="portal-card" style={{ padding: 16 }}>
                            <strong>Application Deadline</strong>
                            <div style={{ marginTop: 7, color: '#64748b' }}><CalendarDays size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />{formatDate(scholarship?.applicationEndDate)}</div>
                        </div>
                        <div className="portal-card" style={{ padding: 16 }}>
                            <strong>Freeship Card</strong>
                            <div style={{ marginTop: 7, color: freeshipApproved ? '#15803d' : '#b45309' }}>
                                {freeshipApproved ? 'Approved' : 'Approval required'}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 20, padding: 16, borderRadius: 10, background: freeshipApproved ? '#f0fdf4' : '#fff7ed', border: `1px solid ${freeshipApproved ? '#bbf7d0' : '#fed7aa'}` }}>
                        {freeshipApproved ? (
                            <>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#166534', fontWeight: 700 }}>
                                    <BadgeCheck size={19} /> Freeship Card approved
                                </div>
                                <p style={{ margin: '8px 0 0', color: '#475569', lineHeight: 1.6 }}>
                                    You can now start the scholarship form. It collects the personal, academic, contact, bank, and declaration details shown in the application form. You do not need to complete Student Profile; scholarship criteria are checked when you submit.
                                </p>
                            </>
                        ) : (
                            <>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#9a3412', fontWeight: 700 }}>
                                    <LockKeyhole size={18} /> Scholarship applications unlock after Freeship Card approval
                                </div>
                                <p style={{ margin: '8px 0 12px', color: '#475569', lineHeight: 1.6 }}>
                                    Complete and submit your Freeship Card application. Once an administrator approves it, you can start a scholarship application here.
                                </p>
                                <button type="button" className="portal-button portal-button-primary" onClick={() => navigate('/student/freeship-card')}>
                                    Open Freeship Card
                                </button>
                            </>
                        )}
                    </div>

                    {freeshipApproved && eligibility?.eligible === false && !missingApplicationInfo && (
                        <div className="auth-error" role="status" style={{ marginTop: 18 }}>
                            Some scholarship criteria need attention. You can still fill and save the form; eligibility will be checked again before submission.
                            {eligibility.failedCriteria?.length > 0 && (
                                <ul style={{ marginBottom: 0 }}>
                                    {eligibility.failedCriteria.map((item) => <li key={item}>{item}</li>)}
                                </ul>
                            )}
                        </div>
                    )}

                    {freeshipApproved && missingApplicationInfo && (
                        <div style={{ marginTop: 18, padding: 14, borderRadius: 8, background: '#eff6ff', color: '#1e40af' }}>
                            <ShieldCheck size={17} style={{ verticalAlign: 'middle', marginRight: 7 }} />
                            Add your academic result details in the application form. Eligibility will be checked when you submit it.
                        </div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 22 }}>
                        {freeshipApproved && (
                            <button type="button" className="portal-button portal-button-primary" onClick={handleCreateApplication} disabled={!canStartDraft || creating}>
                                {creating ? 'Creating Draft...' : 'Start Scholarship Application'}
                            </button>
                        )}
                        <button type="button" className="portal-button portal-button-secondary" onClick={() => navigate('/student/scholarships')}>
                            Browse Scholarships
                        </button>
                    </div>

                    <p style={{ margin: '16px 0 0', color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>
                        Your application is saved as a draft first. It is sent to the administrator only after you complete the form, upload required documents, and submit it.
                    </p>
                </section>
            </div>
        </main>
    );
};

export default ScholarshipApplication;
