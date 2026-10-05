import React, { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, Download, FileCheck2, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import API from '../../services/api';
import '../student/FreeshipCard.css';

const FILTERS = ['ALL', 'PENDING APPROVAL', 'APPROVED', 'REJECTED'];

const AdminFreeshipCards = () => {
    const [applications, setApplications] = useState([]);
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('PENDING APPROVAL');
    const [query, setQuery] = useState('');
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [downloadingType, setDownloadingType] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const loadApplications = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = filter === 'ALL' ? {} : { status: filter };
            const response = await API.get('/freeship-cards/admin', { params });
            const list = response.data?.applications || [];
            setApplications(list);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to load Freeship Card requests.');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { loadApplications(); }, [loadApplications]);

    const openApplication = async (application) => {
        setError('');
        try {
            const response = await API.get(`/freeship-cards/admin/${application._id}`);
            setSelected(response.data.application);
            setRemarks(response.data.application.reviewRemarks || '');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to open this application.');
        }
    };

    const review = async (action) => {
        if (!selected) return;
        setSaving(true);
        setError('');
        setNotice('');
        try {
            const response = await API.put(`/freeship-cards/admin/${selected._id}/${action}`, { remarks });
            setSelected(response.data.application);
            setNotice(response.data.message || 'Application updated.');
            await loadApplications();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to update this application.');
        } finally {
            setSaving(false);
        }
    };

    const downloadDocument = async (fileRecord) => {
        if (!selected) return;
        setDownloadingType(fileRecord.documentType);
        setError('');
        try {
            const response = await API.get(
                `/freeship-cards/${selected._id}/documents/${fileRecord.documentType}`,
                { responseType: 'blob' }
            );
            const objectUrl = URL.createObjectURL(response.data);
            const anchor = document.createElement('a');
            anchor.href = objectUrl;
            anchor.download = fileRecord.fileName || `${fileRecord.documentType}`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to download this document.');
        } finally {
            setDownloadingType('');
        }
    };

    const visibleApplications = applications.filter((application) => {
        const text = `${application.personalDetails?.fullName || ''} ${application.applicationNumber || ''} ${application.student?.studentId || ''}`.toLowerCase();
        return text.includes(query.trim().toLowerCase());
    });

    const statusClass = (status) => status === 'APPROVED' ? 'fsc-status-approved' : status === 'PENDING APPROVAL' ? 'fsc-status-pending' : status === 'REJECTED' ? 'fsc-status-rejected' : 'fsc-status-draft';

    return (
        <main className="fsc-page fsc-admin-page">
            <div className="fsc-shell">
                <header className="fsc-admin-heading">
                    <div><div className="fsc-eyebrow">Student services administration</div><h1>Freeship Card applications</h1><p>Review student details and uploaded certificates, then approve or return an application for correction.</p></div>
                    <button type="button" className="fsc-button fsc-button-outline" onClick={loadApplications} disabled={loading}><RefreshCw size={15} /> Refresh</button>
                </header>

                {error && <div className="fsc-alert fsc-alert-error" role="alert">{error}</div>}
                {notice && <div className="fsc-alert fsc-alert-success" role="status">{notice}</div>}

                <div className="fsc-admin-toolbar">
                    <div className="fsc-admin-filters" role="tablist" aria-label="Filter freeship card applications">
                        {FILTERS.map((item) => <button key={item} type="button" className={filter === item ? 'active' : ''} onClick={() => { setFilter(item); setSelected(null); }}>{item === 'ALL' ? 'All' : item.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())}</button>)}
                    </div>
                    <label className="fsc-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by student or application ID" /></label>
                </div>

                <div className="fsc-admin-layout">
                    <section className="fsc-admin-list fsc-panel">
                        <div className="fsc-admin-list-heading"><strong>Applications</strong><span>{visibleApplications.length} shown</span></div>
                        {loading ? <div className="fsc-empty">Loading applications…</div> : visibleApplications.length === 0 ? <div className="fsc-empty">No applications in this view.</div> : visibleApplications.map((application) => (
                            <button type="button" key={application._id} className={`fsc-admin-row${selected?._id === application._id ? ' selected' : ''}`} onClick={() => openApplication(application)}>
                                <span className="fsc-admin-row-icon"><FileCheck2 size={17} /></span>
                                <span className="fsc-admin-row-copy"><strong>{application.personalDetails?.fullName || application.student?.name || 'Student'}</strong><small>{application.applicationNumber} · {application.student?.studentId || 'Student ID unavailable'}</small></span>
                                <span className={`fsc-status ${statusClass(application.status)}`}>{application.status.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())}</span>
                            </button>
                        ))}
                    </section>

                    <section className="fsc-admin-detail fsc-panel">
                        {!selected ? <div className="fsc-admin-select-empty"><span><ShieldCheck size={24} /></span><h2>Select an application</h2><p>Choose a student request to view the details and certificates.</p></div> : <>
                            <div className="fsc-admin-detail-header"><div><span className="fsc-eyebrow">{selected.applicationNumber}</span><h2>{selected.personalDetails?.fullName || selected.student?.name || 'Student'}</h2></div><span className={`fsc-status ${statusClass(selected.status)}`}>{selected.status.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())}</span></div>
                            <div className="fsc-admin-facts">
                                {[
                                    ['Applicant ID', selected.personalDetails?.applicantId || selected.student?.studentId || '—'],
                                    ['Aadhaar', selected.personalDetails?.aadhaarNumber || '—'],
                                    ['Date of birth', selected.personalDetails?.dateOfBirth ? new Date(selected.personalDetails.dateOfBirth).toLocaleDateString('en-IN') : '—'],
                                    ['Father’s name', selected.personalDetails?.fatherName || '—'],
                                    ['Mother’s name', selected.personalDetails?.motherName || '—'],
                                    ['Annual income', selected.personalDetails?.annualFamilyIncome != null ? `₹${Number(selected.personalDetails.annualFamilyIncome).toLocaleString('en-IN')}` : '—'],
                                    ['Category', selected.personalDetails?.category || '—'],
                                    ['Present course', [selected.courseDetails?.presentlyStudying?.course, selected.courseDetails?.presentlyStudying?.branch, selected.courseDetails?.presentlyStudying?.year].filter(Boolean).join(' / ') || '—'],
                                    ['Last class studied', [selected.courseDetails?.lastClassStudied?.course, selected.courseDetails?.lastClassStudied?.branch, selected.courseDetails?.lastClassStudied?.year].filter(Boolean).join(' / ') || '—'],
                                    ['Previous class studied', [selected.courseDetails?.previousClassStudied?.course, selected.courseDetails?.previousClassStudied?.branch, selected.courseDetails?.previousClassStudied?.year].filter(Boolean).join(' / ') || '—'],
                                    ['Scheme provisions acknowledged', selected.declarations?.hasReadGuidelines === true ? 'Yes' : 'No'],
                                    ['Information declared accurate', selected.declarations?.informationAccurate === true ? 'Yes' : 'No'],
                                    ['Reimbursement undertaking', selected.declarations?.undertakeReimbursement === true ? 'Yes' : 'No'],
                                    ['Address', [selected.personalDetails?.village, selected.personalDetails?.postOffice, selected.personalDetails?.tehsil, selected.personalDetails?.district, selected.personalDetails?.state, selected.personalDetails?.pinCode].filter(Boolean).join(', ') || '—']
                                ].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
                            </div>
                            <div className="fsc-admin-files"><h3>Submitted certificates</h3>{(selected.documents || []).length === 0 ? <p>No documents uploaded.</p> : selected.documents.map((document) => <div className="fsc-admin-file" key={document.documentType}><span><FileCheck2 size={16} />{document.documentType.replace(/([A-Z])/g, ' $1')}</span><button type="button" onClick={() => downloadDocument(document)} disabled={Boolean(downloadingType)}><Download size={15} />{downloadingType === document.documentType ? 'Loading…' : 'Download'}</button></div>)}</div>
                            {selected.status === 'PENDING APPROVAL' && <div className="fsc-admin-review"><label className="fsc-label" htmlFor="reviewRemarks">Correction remarks (required only when returning for correction)</label><textarea id="reviewRemarks" className="fsc-input fsc-review-textarea" value={remarks} onChange={(event) => setRemarks(event.target.value)} maxLength={2000} placeholder="Explain what the student should correct" /><div className="fsc-admin-review-actions"><button type="button" className="fsc-button fsc-button-danger" onClick={() => review('reject')} disabled={saving || !remarks.trim()}>{saving ? 'Saving…' : 'Return for correction'}</button><button type="button" className="fsc-button fsc-button-primary" onClick={() => review('approve')} disabled={saving}><BadgeCheck size={16} />{saving ? 'Saving…' : 'Approve card'}</button></div><small>Approval changes the application status. A valid digital signing certificate is not configured by this portal.</small></div>}
                            {selected.status === 'REJECTED' && selected.reviewRemarks && <div className="fsc-alert fsc-alert-warning"><strong>Previous remarks:</strong> {selected.reviewRemarks}</div>}
                            {selected.status === 'APPROVED' && <div className="fsc-alert fsc-alert-success">Approved on {selected.reviewedAt ? new Date(selected.reviewedAt).toLocaleDateString('en-IN') : '—'}.</div>}
                        </>}
                    </section>
                </div>
            </div>
        </main>
    );
};

export default AdminFreeshipCards;
