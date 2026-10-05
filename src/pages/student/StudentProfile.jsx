import React, { useEffect, useState } from 'react';
import { ArrowLeft, BadgeCheck, FileCheck2, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import authService from '../../services/authService';

const show = (value) => value === null || value === undefined || value === '' ? '—' : value;

const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const courseText = (course) => {
    if (!course) return '—';
    return [course.course, course.branch, course.year].filter(Boolean).join(' / ') || '—';
};

const documentLabel = (type) => ({
    photo: 'Student photo',
    incomeCertificate: 'Income certificate',
    casteCertificate: 'Caste certificate',
    passingCertificate: 'Passing certificate'
}[type] || type);

const Detail = ({ label, value }) => (
    <div style={{ minWidth: 0, padding: '12px 14px', borderRadius: 9, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <span style={{ display: 'block', color: '#64748b', fontSize: 12, marginBottom: 5 }}>{label}</span>
        <strong style={{ display: 'block', color: '#172033', fontSize: 14, overflowWrap: 'anywhere' }}>{show(value)}</strong>
    </div>
);

const Section = ({ title, children }) => (
    <section className="portal-card" style={{ padding: 22, marginBottom: 18 }}>
        <h2 className="portal-heading" style={{ margin: '0 0 14px', fontSize: 19 }}>{title}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>{children}</div>
    </section>
);

const StudentProfile = () => {
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        const loadProfile = async () => {
            if (!authService.getToken()) {
                navigate('/login', { replace: true });
                return;
            }

            try {
                const response = await API.get('/freeship-cards/me');
                if (active) setApplication(response.data?.application || null);
            } catch (requestError) {
                if (!active) return;
                if (requestError.response?.status === 401) {
                    authService.logout();
                    navigate('/login', { replace: true });
                    return;
                }
                setError(requestError.response?.data?.message || 'Unable to load your student profile.');
            } finally {
                if (active) setLoading(false);
            }
        };
        loadProfile();
        return () => { active = false; };
    }, [navigate]);

    const personal = application?.personalDetails || {};
    const courses = application?.courseDetails || {};
    const documents = application?.documents || [];
    const aadhaar = personal.aadhaarNumber ? '•••• •••• ' + String(personal.aadhaarNumber).slice(-4) : '—';
    const statusLabel = application?.status === 'APPROVED'
        ? 'Freeship Card approved'
        : application?.status === 'PENDING APPROVAL'
            ? 'Freeship Card awaiting review'
            : application?.status === 'REJECTED'
                ? 'Corrections requested'
                : 'Freeship Card draft';

    return (
        <main style={{ minHeight: '100vh', background: '#f5f7fb', padding: '28px 0 60px' }}>
            <div className="portal-container">
                <button type="button" className="portal-button portal-button-secondary" onClick={() => navigate('/student')}>
                    <ArrowLeft size={16} style={{ marginRight: 7 }} /> Dashboard
                </button>

                <header style={{ display: 'flex', alignItems: 'center', gap: 13, margin: '22px 0 18px' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf1fb', color: '#174a8b', display: 'grid', placeItems: 'center' }}>
                        <UserCircle size={25} />
                    </div>
                    <div>
                        <div style={{ color: '#64748b', fontSize: 13 }}>Your account information</div>
                        <h1 className="portal-heading" style={{ margin: '3px 0 0' }}>Student Profile</h1>
                    </div>
                </header>

                {error && <div className="auth-error" role="alert" style={{ marginBottom: 18 }}>{error}</div>}
                {loading ? (
                    <section className="portal-card" style={{ padding: 24 }}>Loading your profile…</section>
                ) : application ? (
                    <>
                        <section className="portal-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', padding: 18, marginBottom: 18 }}>
                            <div>
                                <strong style={{ color: '#174a8b' }}>Details from your Freeship Card application</strong>
                                <p className="portal-text" style={{ margin: '5px 0 0' }}>Your registration name, Student ID, phone, and email are locked. Other details shown here come from the Freeship application.</p>
                            </div>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 11px', borderRadius: 999, background: application.status === 'APPROVED' ? '#dcfce7' : '#eaf1fb', color: application.status === 'APPROVED' ? '#166534' : '#174a8b', fontSize: 13, fontWeight: 700 }}>
                                {application.status === 'APPROVED' && <BadgeCheck size={15} />}{statusLabel}
                            </span>
                        </section>

                        {application.status === 'REJECTED' && application.reviewRemarks && (
                            <div className="auth-error" role="status" style={{ marginBottom: 18 }}>
                                <strong>Correction requested:</strong> {application.reviewRemarks}
                            </div>
                        )}

                        <Section title="Registration details">
                            <Detail label="Student name" value={personal.fullName} />
                            <Detail label="Student ID" value={personal.applicantId} />
                            <Detail label="Mobile number" value={personal.mobile} />
                            <Detail label="Email address" value={personal.email} />
                        </Section>

                        <Section title="Personal details">
                            <Detail label="Aadhaar number" value={aadhaar} />
                            <Detail label="Date of birth" value={formatDate(personal.dateOfBirth)} />
                            <Detail label="Father's name" value={personal.fatherName} />
                            <Detail label="Mother's name" value={personal.motherName} />
                            <Detail label="Annual family income" value={personal.annualFamilyIncome === null || personal.annualFamilyIncome === undefined || personal.annualFamilyIncome === '' ? '—' : '₹' + Number(personal.annualFamilyIncome).toLocaleString('en-IN')} />
                            <Detail label="Category" value={personal.category} />
                        </Section>

                        <Section title="Address">
                            <Detail label="Village / address" value={personal.village} />
                            <Detail label="Post office" value={personal.postOffice} />
                            <Detail label="Tehsil" value={personal.tehsil} />
                            <Detail label="District" value={personal.district} />
                            <Detail label="State" value={personal.state} />
                            <Detail label="PIN code" value={personal.pinCode} />
                        </Section>

                        <Section title="Course history">
                            <Detail label="Present course" value={courseText(courses.presentlyStudying)} />
                            <Detail label="Last class studied" value={courseText(courses.lastClassStudied)} />
                            <Detail label="Previous class studied" value={courseText(courses.previousClassStudied)} />
                        </Section>

                        <Section title="Freeship documents">
                            {documents.length > 0 ? documents.map((document) => (
                                <Detail key={document.documentType} label={documentLabel(document.documentType)} value={document.fileName} />
                            )) : <Detail label="Uploaded documents" value="No documents uploaded" />}
                        </Section>

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <button type="button" className="portal-button portal-button-primary" onClick={() => navigate('/student/freeship-card')}>
                                <FileCheck2 size={16} style={{ marginRight: 7 }} />
                                {application.status === 'APPROVED' ? 'View Freeship Card' : application.status === 'PENDING APPROVAL' ? 'View Freeship Status' : 'Complete Freeship Application'}
                            </button>
                            {application.status === 'APPROVED' && (
                                <button type="button" className="portal-button portal-button-secondary" onClick={() => navigate('/student/apply-online')}>
                                    Apply Online
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <section className="portal-card" style={{ padding: 24 }}>
                        <h2 className="portal-heading" style={{ fontSize: 20 }}>No Freeship details yet</h2>
                        <p className="portal-text">Complete the Freeship Card application to add your personal, address, and course details to your student profile.</p>
                        <button type="button" className="portal-button portal-button-primary" onClick={() => navigate('/student/freeship-card')}>Apply Freeship Card</button>
                    </section>
                )}
            </div>
        </main>
    );
};

export default StudentProfile;
