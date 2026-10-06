import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    BadgeCheck,
    BookOpen,
    CheckCircle2,
    Clock3,
    Download,
    FileCheck2,
    Save,
    Send,
    ShieldCheck,
    UploadCloud
} from 'lucide-react';
import API from '../../services/api';
import authService from '../../services/authService';
import { INDIAN_STATES } from '../../data/statesData';
import { ACADEMIC_SESSIONS } from '../../data/sessionsData';
import { UNIVERSITY_FACULTIES_HIERARCHY } from '../../data/coursesData';
import './FreeshipCard.css';

const DOCUMENTS = [
    { key: 'photo', label: 'Student photo', description: 'Photo or scanned photo PDF' },
    { key: 'incomeCertificate', label: 'Income certificate', description: 'Current family income certificate' },
    { key: 'casteCertificate', label: 'Caste certificate', description: 'Valid caste/category certificate' },
    { key: 'passingCertificate', label: 'Passing certificate', description: 'Certificate for the last passed class' }
];

const EMPTY_APPLICATION = {
    _id: '',
    applicationNumber: '',
    status: 'DRAFT',
    personalDetails: {
        fullName: '', aadhaarNumber: '', dateOfBirth: '', fatherName: '', motherName: '',
        annualFamilyIncome: '', category: '', applicantId: '', mobile: '', email: '',
        village: '', postOffice: '', tehsil: '', district: '', state: '', domicileState: '', pinCode: ''
    },
    courseDetails: {
        presentlyStudying: { course: '', branch: '', year: '', faculty: '', facultyId: '', academicSession: '' },
        lastClassStudied: { course: '', branch: '', year: '' },
        previousClassStudied: { course: '', branch: '', year: '' }
    },
    declarations: { hasReadGuidelines: null, informationAccurate: null, undertakeReimbursement: null },
    documents: [],
    reviewRemarks: ''
};

const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-IN') : '—';

const answerToSelect = (value) => value === true ? 'yes' : value === false ? 'no' : '';

const dateInputValue = (value) => value ? String(value).slice(0, 10) : '';

const statusClass = (status) => {
    if (status === 'APPROVED') return 'fsc-status-approved';
    if (status === 'PENDING APPROVAL') return 'fsc-status-pending';
    if (status === 'REJECTED') return 'fsc-status-rejected';
    return 'fsc-status-draft';
};

const Field = ({ label, required, children, wide = false }) => (
    <div className={`fsc-field${wide ? ' fsc-field-wide' : ''}`}>
        <label className="fsc-label">
            {label}{required && <span aria-hidden="true"> *</span>}
        </label>
        {children}
    </div>
);

const CourseSection = ({ title, value, disabled, onChange }) => (
    <div className="fsc-course-block">
        <h3>{title}</h3>
        <div className="fsc-grid fsc-grid-three">
            {[
                ['course', 'Course / class'],
                ['branch', 'Branch / stream'],
                ['year', 'Year / duration']
            ].map(([key, label]) => (
                <Field key={key} label={label} required>
                    <input
                        className="fsc-input"
                        value={value?.[key] || ''}
                        onChange={(event) => onChange(key, event.target.value)}
                        disabled={disabled}
                        required
                    />
                </Field>
            ))}
        </div>
    </div>
);

const PresentCourseSection = ({ value = {}, disabled, onChange }) => {
    const selectedFaculty = UNIVERSITY_FACULTIES_HIERARCHY.find((item) => item.id === value.facultyId);
    const selectedDepartment = selectedFaculty?.departments.find((item) => item.name === value.branch);
    const isOther = value.facultyId === 'OTHER' || (!value.facultyId && Boolean(value.course));

    return (
        <div className="fsc-course-block">
            <h3>Course presently studying</h3>
            <div className="fsc-grid fsc-grid-three">
                <Field label="Faculty" required>
                    <select className="fsc-input" value={isOther ? 'OTHER' : value.facultyId || ''} disabled={disabled} required onChange={(event) => {
                        const next = UNIVERSITY_FACULTIES_HIERARCHY.find((item) => item.id === event.target.value);
                        onChange('facultyId', event.target.value);
                        onChange('faculty', next?.name || (event.target.value === 'OTHER' ? 'Other / not listed' : ''));
                        onChange('branch', ''); onChange('course', '');
                    }}>
                        <option value="">Select faculty</option>
                        {UNIVERSITY_FACULTIES_HIERARCHY.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        <option value="OTHER">Other / not listed</option>
                    </select>
                </Field>
                {isOther ? (
                    <Field label="Department / school" required><input className="fsc-input" value={value.branch || ''} onChange={(event) => onChange('branch', event.target.value)} disabled={disabled} required /></Field>
                ) : (
                    <Field label="Department" required>
                        <select className="fsc-input" value={value.branch || ''} disabled={disabled || !selectedFaculty} required onChange={(event) => { onChange('branch', event.target.value); onChange('course', ''); }}>
                            <option value="">Select department</option>
                            {selectedFaculty?.departments.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
                        </select>
                    </Field>
                )}
                {isOther ? (
                    <Field label="Programme / course" required><input className="fsc-input" value={value.course || ''} onChange={(event) => onChange('course', event.target.value)} disabled={disabled} required /></Field>
                ) : (
                    <Field label="Programme / course" required>
                        <select className="fsc-input" value={value.course || ''} disabled={disabled || !selectedDepartment} required onChange={(event) => onChange('course', event.target.value)}>
                            <option value="">Select programme</option>
                            {selectedDepartment?.programmes.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                        </select>
                    </Field>
                )}
                <Field label="Year of study" required><input className="fsc-input" value={value.year || ''} onChange={(event) => onChange('year', event.target.value)} disabled={disabled} required placeholder="e.g. 1st year" /></Field>
                <Field label="Programme cohort / batch" required>
                    <select className="fsc-input" value={value.academicSession || ''} disabled={disabled} required onChange={(event) => onChange('academicSession', event.target.value)}>
                        <option value="">Select cohort</option>
                        {ACADEMIC_SESSIONS.map((session) => <option key={session.id} value={session.id}>{session.name}</option>)}
                    </select>
                </Field>
            </div>
        </div>
    );
};

const FreeshipCard = () => {
    const navigate = useNavigate();
    const [application, setApplication] = useState(EMPTY_APPLICATION);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState('');
    const [uploadingType, setUploadingType] = useState('');
    const [photoPreview, setPhotoPreview] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!authService.getToken()) {
            navigate('/login', { replace: true });
            return;
        }
        if (user?.role === 'admin') {
            navigate('/admin/freeship-cards', { replace: true });
            return;
        }

        let active = true;
        API.get('/freeship-cards/me')
            .then((response) => {
                if (!active) return;
                const data = response.data?.application || EMPTY_APPLICATION;
                setApplication({
                    ...EMPTY_APPLICATION,
                    ...data,
                    personalDetails: { ...EMPTY_APPLICATION.personalDetails, ...data.personalDetails, dateOfBirth: dateInputValue(data.personalDetails?.dateOfBirth) },
                    courseDetails: { ...EMPTY_APPLICATION.courseDetails, ...data.courseDetails },
                    declarations: { ...EMPTY_APPLICATION.declarations, ...data.declarations }
                });
            })
            .catch((requestError) => {
                if (active) setError(requestError.response?.data?.message || 'Unable to load your freeship card application.');
            })
            .finally(() => active && setLoading(false));

        return () => { active = false; };
    }, [navigate]);

    const editable = ['DRAFT', 'REJECTED'].includes(application.status);

    const updatePersonal = (key, value) => {
        setApplication((current) => ({
            ...current,
            personalDetails: { ...current.personalDetails, [key]: value }
        }));
    };

    const updateCourse = (section, key, value) => {
        setApplication((current) => ({
            ...current,
            courseDetails: {
                ...current.courseDetails,
                [section]: { ...current.courseDetails[section], [key]: value }
            }
        }));
    };

    const updateDeclaration = (key, value) => {
        setApplication((current) => ({
            ...current,
            declarations: { ...current.declarations, [key]: value === 'yes' ? true : value === 'no' ? false : null }
        }));
    };

    const saveApplication = async (showNotice = true) => {
        setSaving(true);
        setError('');
        if (showNotice) setNotice('');
        try {
            const response = await API.post('/freeship-cards/me', {
                personalDetails: application.personalDetails,
                courseDetails: application.courseDetails,
                declarations: application.declarations
            });
            const data = response.data.application;
            setApplication((current) => ({
                ...current,
                ...data,
                personalDetails: { ...current.personalDetails, ...data.personalDetails, dateOfBirth: dateInputValue(data.personalDetails?.dateOfBirth) },
                courseDetails: { ...current.courseDetails, ...data.courseDetails },
                declarations: { ...current.declarations, ...data.declarations }
            }));
            if (showNotice) setNotice('Your application draft has been saved.');
            return data;
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to save your application.');
            return null;
        } finally {
            setSaving(false);
        }
    };

    const uploadDocument = async (documentType, file) => {
        if (!file) return;
        if (file.size > 125 * 1024) {
            setError('Each photo or certificate file must be 125 KB or smaller.');
            return;
        }
        const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowed.includes(file.type)) {
            setError('Upload a PDF, JPG, or PNG file.');
            return;
        }
        if (!application._id) {
            setError('Save the application draft before uploading documents.');
            return;
        }

        const formData = new FormData();
        formData.append('documentType', documentType);
        formData.append('document', file);
        setUploadingType(documentType);
        setError('');
        setNotice('');
        try {
            const response = await API.post(`/freeship-cards/${application._id}/documents`, formData);
            setApplication((current) => ({
                ...current,
                _id: response.data.application?._id || current._id,
                applicationNumber: response.data.application?.applicationNumber || current.applicationNumber,
                documents: response.data.application?.documents || current.documents
            }));
            setNotice(`${DOCUMENTS.find((item) => item.key === documentType)?.label || 'Document'} uploaded.`);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to upload this document.');
        } finally {
            setUploadingType('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setNotice('');
        const saved = await saveApplication(false);
        if (!saved?._id) {
            setSubmitting(false);
            return;
        }
        try {
            const response = await API.post(`/freeship-cards/${saved._id}/submit`);
            setApplication((current) => ({
                ...current,
                status: response.data.application?.status || 'PENDING APPROVAL',
                submittedAt: response.data.application?.submittedAt,
                updatedAt: response.data.application?.updatedAt
            }));
            setNotice(response.data.message || 'Your application has been sent for approval.');
            setError('');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to submit your application.');
        } finally {
            setSubmitting(false);
        }
    };

    const downloadPdf = async (kind) => {
        setDownloadingPdf(kind);
        setError('');
        try {
            const endpoint = kind === 'card' ? '/freeship-cards/me/card.pdf' : '/freeship-cards/me/performa.pdf';
            const response = await API.get(endpoint, { responseType: 'blob' });
            const objectUrl = URL.createObjectURL(response.data);
            const anchor = document.createElement('a');
            anchor.href = objectUrl;
            anchor.download = `${application.applicationNumber || 'freeship-card'}-${kind === 'card' ? 'approved-card' : 'application-form'}.pdf`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        } catch (requestError) {
            setError(requestError.response?.data?.message || `Unable to download the ${kind === 'card' ? 'approved card' : 'application form'} PDF.`);
        } finally {
            setDownloadingPdf('');
        }
    };

    const uploadedDocument = (type) => application.documents?.find((document) => document.documentType === type);
    const photoDocument = uploadedDocument('photo');

    useEffect(() => {
        if (
            application.status !== 'APPROVED' ||
            !application._id ||
            !photoDocument ||
            !photoDocument.contentType?.startsWith('image/')
        ) {
            setPhotoPreview('');
            return undefined;
        }

        let active = true;
        let objectUrl = '';
        API.get(`/freeship-cards/${application._id}/documents/photo`, { responseType: 'blob' })
            .then((response) => {
                if (!active) return;
                objectUrl = URL.createObjectURL(response.data);
                setPhotoPreview(objectUrl);
            })
            .catch(() => {
                if (active) setPhotoPreview('');
            });

        return () => {
            active = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [application._id, application.status, photoDocument?.uploadedAt, photoDocument?.contentType]);

    if (loading) {
        return <main className="fsc-page"><div className="fsc-loading">Loading your Freeship Card application…</div></main>;
    }

    return (
        <main className="fsc-page">
            <div className="fsc-shell">
                <header className="fsc-topbar no-print">
                    <button className="fsc-back" type="button" onClick={() => navigate('/student')}>
                        <ArrowLeft size={17} /> Student dashboard
                    </button>
                    <div className="fsc-brand"><ShieldCheck size={22} /><span>Scholarship Portal</span></div>
                </header>

                <section className="fsc-page-heading no-print">
                    <div>
                        <div className="fsc-eyebrow">Student services</div>
                        <h1>Freeship Card Application</h1>
                        <p>Save your application, upload the required certificates, and follow its approval status here.</p>
                    </div>
                    <div className="fsc-heading-actions">
                        <div className={`fsc-status ${statusClass(application.status)}`}>
                            {application.status === 'APPROVED' ? <BadgeCheck size={16} /> : <Clock3 size={16} />}
                            {application.status === 'PENDING APPROVAL' ? 'Pending approval' : application.status === 'APPROVED' ? 'Approved' : application.status === 'REJECTED' ? 'Correction required' : 'Draft'}
                        </div>
                        {application.status === 'APPROVED' && <button type="button" className="fsc-button fsc-button-primary" onClick={() => downloadPdf('card')} disabled={Boolean(downloadingPdf)}>
                            <Download size={15} />{downloadingPdf === 'card' ? 'Preparing…' : 'Download approved card'}
                        </button>}
                    </div>
                </section>

                {error && <div className="fsc-alert fsc-alert-error no-print" role="alert">{error}</div>}
                {notice && <div className="fsc-alert fsc-alert-success no-print" role="status">{notice}</div>}
                {application.status === 'REJECTED' && application.reviewRemarks && (
                    <div className="fsc-alert fsc-alert-warning no-print"><strong>Correction requested:</strong> {application.reviewRemarks}</div>
                )}
                {application.status === 'PENDING APPROVAL' && (
                    <div className="fsc-alert fsc-alert-success no-print">
                        Your Freeship Card application is with the administrator for review. You can view the submitted details in Student Profile.
                    </div>
                )}

                <section className="fsc-summary no-print">
                    <div><span>Application number</span><strong>{application.applicationNumber || '—'}</strong></div>
                    <div><span>Submitted</span><strong>{formatDate(application.submittedAt)}</strong></div>
                    <div><span>Required files</span><strong>{application.documents?.length || 0} / {DOCUMENTS.length}</strong></div>
                    <div><span>Last updated</span><strong>{formatDate(application.updatedAt)}</strong></div>
                </section>

                {application.status === 'APPROVED' && (
                    <section className="fsc-card-preview-wrap">
                        <div className="fsc-card-preview-title no-print">
                            <div><BadgeCheck size={19} /><strong>Approved Freeship Card</strong></div>
                        </div>
                        <article className="fsc-card-preview">
                            <div className="fsc-card-header">
                                <div className="fsc-card-seal"><ShieldCheck size={25} /></div>
                                <div><span>Student Scholarship Portal</span><h2>Freeship Card</h2><small>Application {application.applicationNumber}</small></div>
                                <div className="fsc-card-approved">APPROVED</div>
                            </div>
                            <div className="fsc-card-body">
                                <div className="fsc-card-photo">{photoPreview ? <img src={photoPreview} alt="Student" /> : <>Student<br />photo</>}</div>
                                <div className="fsc-card-fields">
                                    <div><span>Name of student</span><strong>{application.personalDetails?.fullName || '—'}</strong></div>
                                    <div><span>Aadhaar number</span><strong>{application.personalDetails?.aadhaarNumber ? `XXXXXXXX${String(application.personalDetails.aadhaarNumber).slice(-4)}` : '—'}</strong></div>
                                    <div><span>Date of birth</span><strong>{formatDate(application.personalDetails?.dateOfBirth)}</strong></div>
                                    <div><span>Father’s name</span><strong>{application.personalDetails?.fatherName || '—'}</strong></div>
                                    <div><span>Mother’s name</span><strong>{application.personalDetails?.motherName || '—'}</strong></div>
                                    <div><span>Annual family income</span><strong>{application.personalDetails?.annualFamilyIncome ? `₹${Number(application.personalDetails.annualFamilyIncome).toLocaleString('en-IN')}` : '—'}</strong></div>
                                    <div><span>Category</span><strong>{application.personalDetails?.category || '—'}</strong></div>
                                    <div><span>Present course</span><strong>{[application.courseDetails?.presentlyStudying?.faculty, application.courseDetails?.presentlyStudying?.course, application.courseDetails?.presentlyStudying?.branch, application.courseDetails?.presentlyStudying?.year, application.courseDetails?.presentlyStudying?.academicSession].filter(Boolean).join(' / ') || '—'}</strong></div>
                                    <div><span>Last class studied</span><strong>{[application.courseDetails?.lastClassStudied?.course, application.courseDetails?.lastClassStudied?.branch, application.courseDetails?.lastClassStudied?.year].filter(Boolean).join(' / ') || '—'}</strong></div>
                                    <div><span>Previous class studied</span><strong>{[application.courseDetails?.previousClassStudied?.course, application.courseDetails?.previousClassStudied?.branch, application.courseDetails?.previousClassStudied?.year].filter(Boolean).join(' / ') || '—'}</strong></div>
                                    <div><span>Uploaded certificates</span><strong>{(application.documents || []).map((document) => DOCUMENTS.find((item) => item.key === document.documentType)?.label).filter(Boolean).join(', ') || '—'}</strong></div>
                                    <div className="fsc-card-address"><span>Address</span><strong>{[application.personalDetails?.village, application.personalDetails?.postOffice, application.personalDetails?.tehsil, application.personalDetails?.district, application.personalDetails?.state, application.personalDetails?.pinCode].filter(Boolean).join(', ') || '—'}</strong></div>
                                </div>
                            </div>
                            <div className="fsc-card-footer"><span>Approved {formatDate(application.reviewedAt)}</span><span>Application ID: {application.applicationNumber}</span></div>
                        </article>
                        <p className="fsc-card-note no-print">This downloadable card confirms portal approval. It is not digitally signed by a government certificate.</p>
                    </section>
                )}

                {editable && <form className="fsc-form no-print" onSubmit={handleSubmit}>
                    <section className="fsc-panel">
                        <div className="fsc-section-heading"><span>01</span><div><h2>Personal details</h2><p>Your name, Student ID, mobile number, and email come from registration and are locked. Complete the remaining application details below.</p></div></div>
                        <div className="fsc-grid fsc-grid-three">
                            <Field label="Student name" required><input className="fsc-input fsc-input-locked" value={application.personalDetails.fullName || ''} readOnly /></Field>
                            <Field label="Aadhaar number" required><input className="fsc-input" value={application.personalDetails.aadhaarNumber || ''} onChange={(e) => updatePersonal('aadhaarNumber', e.target.value.replace(/\D/g, '').slice(0, 12))} disabled={!editable} inputMode="numeric" autoComplete="off" maxLength={12} pattern="[0-9]{12}" required /></Field>
                            <Field label="Date of birth" required><input className="fsc-input" type="date" value={application.personalDetails.dateOfBirth || ''} onChange={(e) => updatePersonal('dateOfBirth', e.target.value)} disabled={!editable} required /></Field>
                            <Field label="Father’s name" required><input className="fsc-input" value={application.personalDetails.fatherName || ''} onChange={(e) => updatePersonal('fatherName', e.target.value)} disabled={!editable} required /></Field>
                            <Field label="Mother’s name" required><input className="fsc-input" value={application.personalDetails.motherName || ''} onChange={(e) => updatePersonal('motherName', e.target.value)} disabled={!editable} required /></Field>
                            <Field label="Annual family income" required><input className="fsc-input" type="number" min="0" value={application.personalDetails.annualFamilyIncome ?? ''} onChange={(e) => updatePersonal('annualFamilyIncome', e.target.value)} disabled={!editable} required /></Field>
                            <Field label="Category" required><select className="fsc-input" value={application.personalDetails.category || ''} onChange={(e) => updatePersonal('category', e.target.value)} disabled={!editable} required><option value="">Select category</option>{['SC', 'ST', 'OBC', 'EBC', 'DNT', 'Other'].map((category) => <option key={category} value={category}>{category}</option>)}</select></Field>
                            <Field label="Permanent domicile State / UT" required>
                                <select className="fsc-input" value={application.personalDetails.domicileState || ''} onChange={(e) => updatePersonal('domicileState', e.target.value)} disabled={!editable} required>
                                    <option value="">Select domicile State / UT</option>
                                    {INDIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                                </select>
                            </Field>
                            <Field label="Student ID"><input className="fsc-input fsc-input-locked" value={application.personalDetails.applicantId || ''} readOnly /></Field>
                            <Field label="Mobile number"><input className="fsc-input fsc-input-locked" value={application.personalDetails.mobile || ''} readOnly /></Field>
                            <Field label="Email address"><input className="fsc-input fsc-input-locked" type="email" value={application.personalDetails.email || ''} readOnly /></Field>
                        </div>
                    </section>

                    <section className="fsc-panel">
                        <div className="fsc-section-heading"><span>02</span><div><h2>Address details</h2><p>Enter the address to be printed on the card.</p></div></div>
                        <div className="fsc-grid fsc-grid-three">
                            {[
                                ['village', 'Village / address', true], ['postOffice', 'Post office', false],
                                ['tehsil', 'Tehsil', true], ['district', 'District', true],
                                ['state', 'State', true], ['pinCode', 'PIN code', true]
                            ].map(([key, label, required]) => (
                                <Field key={key} label={label} required={required}>
                            {key === 'state' ? (
                                <select className="fsc-input" value={application.personalDetails[key] || ''} onChange={(e) => updatePersonal(key, e.target.value)} disabled={!editable} required={required}>
                                    <option value="">Select address State / UT</option>
                                    {INDIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                                </select>
                            ) : (
                                <input className="fsc-input" value={application.personalDetails[key] || ''} onChange={(e) => updatePersonal(key, key === 'pinCode' ? e.target.value.replace(/\D/g, '').slice(0, 6) : e.target.value)} disabled={!editable} required={required} inputMode={key === 'pinCode' ? 'numeric' : undefined} maxLength={key === 'pinCode' ? 6 : 120} pattern={key === 'pinCode' ? '[0-9]{6}' : undefined} />
                            )}
                                </Field>
                            ))}
                        </div>
                    </section>

                    <section className="fsc-panel">
                        <div className="fsc-section-heading"><span>03</span><div><h2>Course history</h2><p>Enter course, branch or stream, and year for each education stage.</p></div></div>
                        <PresentCourseSection value={application.courseDetails.presentlyStudying} disabled={!editable} onChange={(key, value) => updateCourse('presentlyStudying', key, value)} />
                        <CourseSection title="Course / class last studied" value={application.courseDetails.lastClassStudied} disabled={!editable} onChange={(key, value) => updateCourse('lastClassStudied', key, value)} />
                        <CourseSection title="Course / class previously studied" value={application.courseDetails.previousClassStudied} disabled={!editable} onChange={(key, value) => updateCourse('previousClassStudied', key, value)} />
                    </section>

                    <section className="fsc-panel">
                        <div className="fsc-section-heading"><span>04</span><div><h2>Upload certificates</h2><p>PDF, JPG, or PNG. Each file must be 125 KB or smaller.</p></div></div>
                        <div className="fsc-doc-grid">
                            {DOCUMENTS.map((document) => {
                                const savedDocument = uploadedDocument(document.key);
                                return (
                                    <div className="fsc-doc-card" key={document.key}>
                                        <div className="fsc-doc-icon"><FileCheck2 size={20} /></div>
                                        <div className="fsc-doc-copy"><strong>{document.label}</strong><span>{document.description}</span>{savedDocument && <small><CheckCircle2 size={13} /> {savedDocument.fileName}</small>}</div>
                                        {editable && <label className="fsc-upload-button">
                                            <UploadCloud size={15} />{uploadingType === document.key ? 'Uploading…' : savedDocument ? 'Replace' : 'Upload'}
                                            <input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" disabled={Boolean(uploadingType)} onChange={(e) => { uploadDocument(document.key, e.target.files?.[0]); e.target.value = ''; }} />
                                        </label>}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="fsc-panel">
                        <div className="fsc-section-heading"><span>05</span><div><h2>Scheme provisions and declaration</h2><p>Review each statement and select Yes or No.</p></div></div>
                        <div className="fsc-guideline-note"><BookOpen size={18} /><span>Read the applicable scheme guidelines before submitting. The card is subject to review by the scholarship authority.</span></div>
                        <div className="fsc-declaration-list">
                            {[
                                ['hasReadGuidelines', 'I have read and understood the major provisions of the applicable scheme.'],
                                ['informationAccurate', 'The information and certificates supplied in this application are true and correct.'],
                                ['undertakeReimbursement', 'I undertake to reimburse the institute within seven days after receipt of scholarship, as stated in the application guide.']
                            ].map(([key, label]) => (
                                <div className="fsc-declaration" key={key}>
                                    <span>{label}</span>
                                    <select className="fsc-input fsc-answer" value={answerToSelect(application.declarations[key])} onChange={(e) => updateDeclaration(key, e.target.value)} disabled={!editable} required>
                                        <option value="">Select</option><option value="yes">Yes</option><option value="no">No</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="fsc-form-actions">
                        <button className="fsc-button fsc-button-light" type="button" onClick={() => navigate('/student')}><ArrowLeft size={16} /> Dashboard</button>
                        {editable && <>
                            <button className="fsc-button fsc-button-outline" type="button" onClick={() => saveApplication()} disabled={saving || submitting}><Save size={16} />{saving ? 'Saving…' : 'Save draft'}</button>
                            <button className="fsc-button fsc-button-primary" type="submit" disabled={saving || submitting || Boolean(uploadingType)}><Send size={16} />{submitting ? 'Sending…' : application.status === 'REJECTED' ? 'Resubmit for approval' : 'Send for approval'}</button>
                        </>}
                    </div>
                </form>}
            </div>
        </main>
    );
};

export default FreeshipCard;
