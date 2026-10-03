import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    Save,
    UserCircle,
    GraduationCap,
    Building2,
    Landmark,
    ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import API from '../../services/api';
import authService from '../../services/authService';

const StudentProfile = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        registrationNumber: '',
        course: '',
        department: '',
        academicYear: '',
        currentSemester: '',
        category: '',
        gender: '',
        dateOfBirth: '',
        mobile: '',
        address: '',
        state: '',
        familyIncome: '',
        previousPercentage: '',
        previousQualification: '',
        bankAccountNumber: '',
        bankName: '',
        ifscCode: ''
    });

    /* ============================================================
       LOAD STUDENT PROFILE
    ============================================================ */

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const token =
                authService.getToken();

            if (!token) {
                navigate('/login');
                return;
            }

            const response =
                await API.get(
                    '/student-profile/me',
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const profile =
                response.data.profile;

            if (profile) {
                setFormData({
                    fullName:
                        profile.fullName || '',

                    registrationNumber:
                        profile.registrationNumber || '',

                    course:
                        profile.course || '',

                    department:
                        profile.department || '',

                    academicYear:
                        profile.academicYear || '',

                    currentSemester:
                        profile.currentSemester
                            ? String(
                                profile.currentSemester
                            )
                            : '',

                    category:
                        profile.category || '',

                    gender:
                        profile.gender || '',

                    dateOfBirth:
                        profile.dateOfBirth
                            ? profile.dateOfBirth.substring(
                                0,
                                10
                            )
                            : '',

                    mobile:
                        profile.mobile || '',

                    address:
                        profile.address || '',

                    state:
                        profile.state || '',

                    familyIncome:
                        profile.familyIncome !== null &&
                        profile.familyIncome !== undefined
                            ? String(
                                profile.familyIncome
                            )
                            : '',

                    previousPercentage:
                        profile.previousPercentage !== null &&
                        profile.previousPercentage !== undefined
                            ? String(
                                profile.previousPercentage
                            )
                            : '',

                    previousQualification:
                        profile.previousQualification || '',

                    bankAccountNumber:
                        profile.bankAccountNumber || '',

                    bankName:
                        profile.bankName || '',

                    ifscCode:
                        profile.ifscCode || ''
                });
            }

        } catch (error) {
            console.error(
                'Profile loading error:',
                error
            );

            if (
                error.response?.status === 401
            ) {
                authService.logout();
                navigate('/login');
                return;
            }

            /*
                404 means that the student has not created
                a profile yet.

                This is a normal first-time situation.
                Keep the form empty and allow the student
                to create the profile.
            */

            if (
                error.response?.status === 404
            ) {
                setError('');
                return;
            }

            if (
                error.response?.data?.message
            ) {
                setError(
                    error.response.data.message
                );
            } else {
                setError(
                    'Unable to load your profile. Please try again.'
                );
            }

        } finally {
            setLoading(false);
        }
    };

    /* ============================================================
       HANDLE INPUT CHANGE
    ============================================================ */

    const handleChange = (event) => {
        const {
            name,
            value
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError('');
        setSuccess('');
    };

    /* ============================================================
       VALIDATE PROFILE
    ============================================================ */

    const validateForm = () => {

        if (!formData.fullName.trim()) {
            return 'Please enter your full name.';
        }

        if (
            !formData.registrationNumber.trim()
        ) {
            return 'Please enter your registration number.';
        }

        if (!formData.course.trim()) {
            return 'Please enter your course.';
        }

        if (
            !formData.department.trim()
        ) {
            return 'Please enter your department.';
        }

        if (
            !formData.academicYear.trim()
        ) {
            return 'Please enter your academic year.';
        }

        if (!formData.currentSemester) {
            return 'Please select your current semester.';
        }

        if (!formData.category.trim()) {
            return 'Please select your category.';
        }

        if (!formData.mobile.trim()) {
            return 'Please enter your mobile number.';
        }

        if (!formData.familyIncome) {
            return 'Please enter your family income.';
        }

        if (
            Number(formData.familyIncome) < 0
        ) {
            return 'Family income cannot be negative.';
        }

        if (
            formData.previousPercentage &&
            (
                Number(
                    formData.previousPercentage
                ) < 0 ||
                Number(
                    formData.previousPercentage
                ) > 100
            )
        ) {
            return 'Previous percentage must be between 0 and 100.';
        }

        return '';
    };

    /* ============================================================
       SAVE PROFILE
    ============================================================ */

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError('');
        setSuccess('');

        const validationError =
            validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);

            const token =
                authService.getToken();

            if (!token) {
                navigate('/login');
                return;
            }

            const payload = {
                fullName:
                    formData.fullName.trim(),

                registrationNumber:
                    formData.registrationNumber.trim(),

                course:
                    formData.course.trim(),

                department:
                    formData.department.trim(),

                academicYear:
                    formData.academicYear.trim(),

                currentSemester:
                    Number(
                        formData.currentSemester
                    ),

                category:
                    formData.category.trim(),

                gender:
                    formData.gender.trim(),

                dateOfBirth:
                    formData.dateOfBirth || null,

                mobile:
                    formData.mobile.trim(),

                address:
                    formData.address.trim(),

                state:
                    formData.state.trim(),

                familyIncome:
                    Number(
                        formData.familyIncome
                    ),

                previousPercentage:
                    formData.previousPercentage
                        ? Number(
                            formData.previousPercentage
                        )
                        : null,

                previousQualification:
                    formData.previousQualification.trim(),

                bankAccountNumber:
                    formData.bankAccountNumber.trim(),

                bankName:
                    formData.bankName.trim(),

                ifscCode:
                    formData.ifscCode
                        .trim()
                        .toUpperCase()
            };

            const response =
                await API.post(
                    '/student-profile/me',
                    payload,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setSuccess(
                response.data.message ||
                'Student profile saved successfully.'
            );

        } catch (error) {
            console.error(
                'Profile saving error:',
                error
            );

            if (
                error.response?.status === 401
            ) {
                authService.logout();
                navigate('/login');
                return;
            }

            if (
                error.response?.data?.message
            ) {
                setError(
                    error.response.data.message
                );
            } else {
                setError(
                    'Unable to save your profile. Please try again.'
                );
            }

        } finally {
            setSaving(false);
        }
    };

    /* ============================================================
       LOADING
    ============================================================ */

    if (loading) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f5f7fb'
                }}
            >
                <div
                    style={{
                        textAlign: 'center'
                    }}
                >
                    <div
                        style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            border:
                                '4px solid #dbeafe',
                            borderTopColor:
                                '#174a8b',
                            animation:
                                'profileSpin 0.8s linear infinite',
                            margin:
                                '0 auto 14px'
                        }}
                    />

                    <p
                        style={{
                            margin: 0,
                            color: '#64748b',
                            fontSize: '14px'
                        }}
                    >
                        Loading your profile...
                    </p>
                </div>

                <style>
                    {`
                        @keyframes profileSpin {
                            to {
                                transform: rotate(360deg);
                            }
                        }
                    `}
                </style>
            </div>
        );
    }

    /* ============================================================
       PAGE
    ============================================================ */

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#f5f7fb'
            }}
        >

            {/* ====================================================
                HEADER
            ===================================================== */}

            <header
                style={{
                    background: '#ffffff',
                    borderBottom:
                        '1px solid #e2e8f0',
                    minHeight: '76px',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <div
                    className="portal-container"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                            'space-between',
                        gap: '20px'
                    }}
                >

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '13px'
                        }}
                    >

                        <div
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                background:
                                    '#174a8b',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent:
                                    'center'
                            }}
                        >
                            <GraduationCap
                                size={21}
                            />
                        </div>

                        <div>
                            <h1
                                style={{
                                    margin: 0,
                                    fontSize: '17px',
                                    fontWeight: 700,
                                    color: '#172033'
                                }}
                            >
                                Student Profile
                            </h1>

                            <p
                                style={{
                                    margin:
                                        '3px 0 0',
                                    fontSize: '12px',
                                    color: '#64748b'
                                }}
                            >
                                University Scholarship Portal
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/student')
                        }
                        className="portal-button portal-button-secondary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px'
                        }}
                    >
                        <ArrowLeft
                            size={16}
                        />
                        Dashboard
                    </button>

                </div>
            </header>

            {/* ====================================================
                MAIN
            ===================================================== */}

            <main
                className="portal-container"
                style={{
                    paddingTop: '34px',
                    paddingBottom: '50px'
                }}
            >

                {/* Page heading */}

                <div
                    style={{
                        marginBottom: '26px'
                    }}
                >
                    <h2
                        className="portal-heading"
                        style={{
                            fontSize: '30px'
                        }}
                    >
                        Complete Your Student Profile
                    </h2>

                    <p
                        className="portal-text"
                        style={{
                            margin:
                                '8px 0 0',
                            maxWidth: '760px'
                        }}
                    >
                        Enter accurate academic, personal
                        and banking information. Your profile
                        information will be used to determine
                        scholarship eligibility and prepare
                        your applications.
                    </p>
                </div>

                {/* =================================================
                    MESSAGES
                ================================================== */}

                {error && (
                    <div
                        style={{
                            marginBottom: '20px',
                            padding: '13px 16px',
                            borderRadius: '9px',
                            border:
                                '1px solid #fecaca',
                            background: '#fef2f2',
                            color: '#991b1b',
                            fontSize: '14px',
                            lineHeight: 1.5
                        }}
                    >
                        {error}
                    </div>
                )}

                {success && (
                    <div
                        style={{
                            marginBottom: '20px',
                            padding: '13px 16px',
                            borderRadius: '9px',
                            border:
                                '1px solid #bbf7d0',
                            background: '#f0fdf4',
                            color: '#166534',
                            fontSize: '14px',
                            lineHeight: 1.5
                        }}
                    >
                        {success}
                    </div>
                )}

                {/* =================================================
                    FORM
                ================================================== */}

                <form
                    onSubmit={handleSubmit}
                >

                    {/* =============================================
                        PERSONAL INFORMATION
                    ============================================== */}

                    <section
                        className="portal-card"
                        style={{
                            padding: '26px',
                            marginBottom: '20px'
                        }}
                    >

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '24px',
                                paddingBottom: '17px',
                                borderBottom:
                                    '1px solid #e2e8f0'
                            }}
                        >

                            <div
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background:
                                        '#eaf1fb',
                                    color: '#174a8b',
                                    display: 'flex',
                                    alignItems:
                                        'center',
                                    justifyContent:
                                        'center'
                                }}
                            >
                                <UserCircle
                                    size={21}
                                />
                            </div>

                            <div>
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: '17px',
                                        color: '#172033'
                                    }}
                                >
                                    Personal Information
                                </h3>

                                <p
                                    style={{
                                        margin:
                                            '3px 0 0',
                                        color: '#64748b',
                                        fontSize: '12px'
                                    }}
                                >
                                    Basic identity and contact details
                                </p>
                            </div>

                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(2, minmax(0, 1fr))',
                                gap: '20px'
                            }}
                        >

                            <div className="form-group">
                                <label className="portal-label">
                                    Full Name *
                                </label>

                                <input
                                    type="text"
                                    name="fullName"
                                    className="portal-input"
                                    value={
                                        formData.fullName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="form-group">
                                <label className="portal-label">
                                    Registration Number *
                                </label>

                                <input
                                    type="text"
                                    name="registrationNumber"
                                    className="portal-input"
                                    value={
                                        formData.registrationNumber
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter registration number"
                                />
                            </div>

                            <div className="form-group">
                                <label className="portal-label">
                                    Mobile Number *
                                </label>

                                <input
                                    type="tel"
                                    name="mobile"
                                    className="portal-input"
                                    value={
                                        formData.mobile
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter mobile number"
                                />
                            </div>

                            <div className="form-group">
                                <label className="portal-label">
                                    Date of Birth
                                </label>

                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    className="portal-input"
                                    value={
                                        formData.dateOfBirth
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </div>

                            <div className="form-group">
                                <label className="portal-label">
                                    Gender
                                </label>

                                <select
                                    name="gender"
                                    className="portal-select"
                                    value={
                                        formData.gender
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >
                                    <option value="">
                                        Select Gender
                                    </option>

                                    <option value="Male">
                                        Male
                                    </option>

                                    <option value="Female">
                                        Female
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="portal-label">
                                    Category *
                                </label>

                                <select
                                    name="category"
                                    className="portal-select"
                                    value={
                                        formData.category
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >
                                    <option value="">
                                        Select Category
                                    </option>

                                    <option value="SC">
                                        SC
                                    </option>

                                    <option value="ST">
                                        ST
                                    </option>

                                    <option value="OBC">
                                        OBC
                                    </option>

                                    <option value="EWS">
                                        EWS
                                    </option>

                                    <option value="General">
                                        General
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>
                                </select>
                            </div>

                            <div
                                className="form-group"
                                style={{
                                    gridColumn:
                                        '1 / -1'
                                }}
                            >
                                <label className="portal-label">
                                    Address
                                </label>

                                <textarea
                                    name="address"
                                    className="portal-textarea"
                                    value={
                                        formData.address
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter your complete address"
                                />
                            </div>

                            <div className="form-group">
                                <label className="portal-label">
                                    State
                                </label>

                                <input
                                    type="text"
                                    name="state"
                                    className="portal-input"
                                    value={
                                        formData.state
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter your state"
                                />
                            </div>

                        </div>

                    </section>

                    {/* =============================================
                        ACADEMIC INFORMATION
                    ============================================== */}

                    <section
                        className="portal-card"
                        style={{
                            padding: '26px',
                            marginBottom: '20px'
                        }}
                    >

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '24px',
                                paddingBottom: '17px',
                                borderBottom:
                                    '1px solid #e2e8f0'
                            }}
                        >

                            <div
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background:
                                        '#eaf1fb',
                                    color: '#174a8b',
                                    display: 'flex',
                                    alignItems:
                                        'center',
                                    justifyContent:
                                        'center'
                                }}
                            >
                                <Building2
                                    size={21}
                                />
                            </div>

                            <div>
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: '17px',
                                        color: '#172033'
                                    }}
                                >
                                    Academic Information
                                </h3>

                                <p
                                    style={{
                                        margin:
                                            '3px 0 0',
                                        color: '#64748b',
                                        fontSize: '12px'
                                    }}
                                >
                                    Your current university academic details
                                </p>
                            </div>

                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(2, minmax(0, 1fr))',
                                gap: '20px'
                            }}
                        >

                            <div className="form-group">
                                <label className="portal-label">
                                    Course *
                                </label>

                                <input
                                    type="text"
                                    name="course"
                                    className="portal-input"
                                    value={
                                        formData.course
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Example: B.Tech"
                                />
                            </div>

                            <div className="form-group">
                                <label className="portal-label">
                                    Department *
                                </label>

                                <input
                                    type="text"
                                    name="department"
                                    className="portal-input"
                                    value={
                                        formData.department
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Example: ECE"
                                />
                            </div>

                            <div className="form-group">
                                <label className="portal-label">
                                    Academic Year *
                                </label>

                                <input
                                    type="text"
                                    name="academicYear"
                                    className="portal-input"
                                    value={
                                        formData.academicYear
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Example: 2026-27"
                                />
                            </div>

                            <div className="form-group">
                                <label className="portal-label">
                                    Current Semester *
                                </label>

                                <select
                                    name="currentSemester"
                                    className="portal-select"
                                    value={
                                        formData.currentSemester
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >
                                    <option value="">
                                        Select Semester
                                    </option>

                                    <option value="1">
                                        Semester 1
                                    </option>

                                    <option value="2">
                                        Semester 2
                                    </option>

                                    <option value="3">
                                        Semester 3
                                    </option>

                                    <option value="4">
                                        Semester 4
                                    </option>

                                    <option value="5">
                                        Semester 5
                                    </option>

                                    <option value="6">
                                        Semester 6
                                    </option>

                                    <option value="7">
                                        Semester 7
                                    </option>

                                    <option value="8">
                                        Semester 8
                                    </option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="portal-label">
                                    Previous Percentage
                                </label>

                                <input
                                    type="number"
                                    name="previousPercentage"
                                    className="portal-input"
                                    value={
                                        formData.previousPercentage
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Example: 72"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                />
                            </div>

                            <div className="form-group">
                                <label className="portal-label">
                                    Previous Qualification
                                </label>

                                <input
                                    type="text"
                                    name="previousQualification"
                                    className="portal-input"
                                    value={
                                        formData.previousQualification
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Example: B.Tech Semester 2"
                                />
                            </div>

                        </div>

                    </section>

                    {/* =============================================
                        FAMILY / FINANCIAL INFORMATION
                    ============================================== */}

                    <section
                        className="portal-card"
                        style={{
                            padding: '26px',
                            marginBottom: '20px'
                        }}
                    >

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '24px',
                                paddingBottom: '17px',
                                borderBottom:
                                    '1px solid #e2e8f0'
                            }}
                        >

                            <div
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background:
                                        '#eaf1fb',
                                    color: '#174a8b',
                                    display: 'flex',
                                    alignItems:
                                        'center',
                                    justifyContent:
                                        'center'
                                }}
                            >
                                <ShieldCheck
                                    size={21}
                                />
                            </div>

                            <div>
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: '17px',
                                        color: '#172033'
                                    }}
                                >
                                    Financial Information
                                </h3>

                                <p
                                    style={{
                                        margin:
                                            '3px 0 0',
                                        color: '#64748b',
                                        fontSize: '12px'
                                    }}
                                >
                                    Information used for scholarship eligibility
                                </p>
                            </div>

                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(2, minmax(0, 1fr))',
                                gap: '20px'
                            }}
                        >

                            <div className="form-group">
                                <label className="portal-label">
                                    Annual Family Income *
                                </label>

                                <input
                                    type="number"
                                    name="familyIncome"
                                    className="portal-input"
                                    value={
                                        formData.familyIncome
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter annual family income"
                                    min="0"
                                />
                            </div>

                        </div>

                    </section>

                    {/* =============================================
                        BANK INFORMATION
                    ============================================== */}

                    <section
                        className="portal-card"
                        style={{
                            padding: '26px',
                            marginBottom: '20px'
                        }}
                    >

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '24px',
                                paddingBottom: '17px',
                                borderBottom:
                                    '1px solid #e2e8f0'
                            }}
                        >

                            <div
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background:
                                        '#eaf1fb',
                                    color: '#174a8b',
                                    display: 'flex',
                                    alignItems:
                                        'center',
                                    justifyContent:
                                        'center'
                                }}
                            >
                                <Landmark
                                    size={21}
                                />
                            </div>

                            <div>
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: '17px',
                                        color: '#172033'
                                    }}
                                >
                                    Bank Information
                                </h3>

                                <p
                                    style={{
                                        margin:
                                            '3px 0 0',
                                        color: '#64748b',
                                        fontSize: '12px'
                                    }}
                                >
                                    Bank details required for scholarship disbursement
                                </p>
                            </div>

                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(2, minmax(0, 1fr))',
                                gap: '20px'
                            }}
                        >

                            <div className="form-group">
                                <label className="portal-label">
                                    Bank Account Number
                                </label>

                                <input
                                    type="text"
                                    name="bankAccountNumber"
                                    className="portal-input"
                                    value={
                                        formData.bankAccountNumber
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter bank account number"
                                />
                            </div>

                            <div className="form-group">
                                <label className="portal-label">
                                    Bank Name
                                </label>

                                <input
                                    type="text"
                                    name="bankName"
                                    className="portal-input"
                                    value={
                                        formData.bankName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter bank name"
                                />
                            </div>

                            <div className="form-group">
                                <label className="portal-label">
                                    IFSC Code
                                </label>

                                <input
                                    type="text"
                                    name="ifscCode"
                                    className="portal-input"
                                    value={
                                        formData.ifscCode
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Example: SBIN0001234"
                                />
                            </div>

                        </div>

                    </section>

                    {/* =============================================
                        SAVE
                    ============================================== */}

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent:
                                'space-between',
                            gap: '15px',
                            padding:
                                '18px 20px',
                            background: '#ffffff',
                            border:
                                '1px solid #e2e8f0',
                            borderRadius: '12px'
                        }}
                    >

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <ShieldCheck
                                size={19}
                                color="#174a8b"
                            />

                            <span
                                style={{
                                    color: '#64748b',
                                    fontSize: '12px'
                                }}
                            >
                                Make sure the information
                                provided is accurate.
                            </span>
                        </div>

                        <button
                            type="submit"
                            className="portal-button portal-button-primary"
                            disabled={saving}
                            style={{
                                display: 'flex',
                                alignItems:
                                    'center',
                                gap: '8px',
                                minWidth: '150px',
                                justifyContent:
                                    'center',
                                opacity:
                                    saving ? 0.7 : 1
                            }}
                        >
                            <Save size={17} />

                            {saving
                                ? 'Saving...'
                                : 'Save Profile'}
                        </button>

                    </div>

                </form>

            </main>

            {/* ====================================================
                RESPONSIVE STYLES
            ===================================================== */}

            <style>
                {`
                    @media (max-width: 700px) {
                        form section > div[style*="repeat(2"] {
                            grid-template-columns: 1fr !important;
                        }

                        form section > div[style*="repeat(2"] > div[style*="1 / -1"] {
                            grid-column: auto !important;
                        }

                        main.portal-container {
                            padding-left: 16px !important;
                            padding-right: 16px !important;
                        }

                        header .portal-container {
                            padding-left: 16px !important;
                            padding-right: 16px !important;
                        }

                        header button {
                            padding: 9px 12px !important;
                        }
                    }

                    @media (max-width: 500px) {
                        main.portal-container > div:last-child {
                            flex-direction: column !important;
                            align-items: stretch !important;
                        }

                        main.portal-container > div:last-child button {
                            width: 100%;
                        }
                    }
                `}
            </style>

        </div>
    );
};

export default StudentProfile;