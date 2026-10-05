import React, {
    useEffect,
    useState
} from 'react';

import {
    Plus,
    Search,
    Edit3,
    Trash2,
    Eye,
    CalendarDays,
    IndianRupee,
    BookOpen,
    RefreshCw,
    X,
    Save,
    GraduationCap
} from 'lucide-react';

import API from '../../services/api';
import authService from '../../services/authService';


/* ============================================================
   ADMIN SCHOLARSHIPS
============================================================ */

const AdminScholarships = () => {

    const [scholarships, setScholarships] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    const [success, setSuccess] =
        useState('');

    const [searchTerm, setSearchTerm] =
        useState('');

    const [statusFilter, setStatusFilter] =
        useState('ALL');

    const [showModal, setShowModal] =
        useState(false);

    const [editingId, setEditingId] =
        useState(null);

    const [saving, setSaving] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);


    /* ========================================================
       FORM
    ======================================================== */

    const initialForm = {
        name: '',
        description: '',
        academicYear: '',
        eligibleCourses: '',
        eligibleDepartments: '',
        eligibleCategories: '',
        minimumPercentage: '',
        maximumFamilyIncome: '',
        scholarshipAmount: '',
        requiredDocuments: '',
        applicationStartDate: '',
        applicationEndDate: '',
        instructions: '',
        status: 'DRAFT'
    };


    const [form, setForm] =
        useState(initialForm);


    /* ========================================================
       API HEADERS
    ======================================================== */

    const getHeaders = () => {

        const token =
            authService.getToken();

        return {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        };
    };


    /* ========================================================
       FETCH SCHOLARSHIPS
    ======================================================== */

    const fetchScholarships =
        async () => {

            try {

                setLoading(true);
                setError('');

                const response =
                    await API.get(
                        '/scholarships',
                        getHeaders()
                    );

                if (
                    response.data?.success
                ) {

                    setScholarships(
                        response.data.scholarships ||
                        []
                    );

                } else {

                    setError(
                        response.data?.message ||
                        'Unable to load scholarships.'
                    );

                }

            } catch (error) {

                console.error(
                    'Admin scholarships error:',
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
                    'Unable to load scholarships.'
                );

            } finally {

                setLoading(false);

            }
        };


    /* ========================================================
       INITIAL LOAD
    ======================================================== */

    useEffect(() => {

        fetchScholarships();

    }, []);


    /* ========================================================
       HANDLE FORM CHANGE
    ======================================================== */

    const handleChange = (
        event
    ) => {

        const {
            name,
            value
        } = event.target;

        setForm(
            previous => ({
                ...previous,
                [name]: value
            })
        );
    };


    /* ========================================================
       OPEN CREATE MODAL
    ======================================================== */

    const openCreateModal = () => {

        setEditingId(null);

        setForm(
            initialForm
        );

        setError('');
        setSuccess('');

        setShowModal(true);
    };


    /* ========================================================
       OPEN EDIT MODAL
    ======================================================== */

    const openEditModal = (
        scholarship
    ) => {

        setEditingId(
            scholarship._id
        );

        setForm({
            name:
                scholarship.name ||
                '',

            description:
                scholarship.description ||
                '',

            academicYear:
                scholarship.academicYear ||
                '',

            eligibleCourses:
                Array.isArray(
                    scholarship.eligibleCourses
                )
                    ? scholarship.eligibleCourses.join(
                        ', '
                    )
                    : '',

            eligibleDepartments:
                Array.isArray(
                    scholarship.eligibleDepartments
                )
                    ? scholarship.eligibleDepartments.join(
                        ', '
                    )
                    : '',

            eligibleCategories:
                Array.isArray(
                    scholarship.eligibleCategories
                )
                    ? scholarship.eligibleCategories.join(
                        ', '
                    )
                    : '',

            minimumPercentage:
                scholarship.minimumPercentage ??
                '',

            maximumFamilyIncome:
                scholarship.maximumFamilyIncome ??
                '',

            scholarshipAmount:
                scholarship.scholarshipAmount ??
                '',

            requiredDocuments:
                Array.isArray(
                    scholarship.requiredDocuments
                )
                    ? scholarship.requiredDocuments.join(
                        ', '
                    )
                    : '',

            applicationStartDate:
                scholarship.applicationStartDate
                    ? scholarship.applicationStartDate.substring(
                        0,
                        10
                    )
                    : '',

            applicationEndDate:
                scholarship.applicationEndDate
                    ? scholarship.applicationEndDate.substring(
                        0,
                        10
                    )
                    : '',

            instructions:
                scholarship.instructions ||
                '',

            status:
                scholarship.status ||
                'DRAFT'
        });

        setError('');
        setSuccess('');

        setShowModal(true);
    };


    /* ========================================================
       CONVERT COMMA LIST
    ======================================================== */

    const convertToArray = (
        value
    ) => {

        return value
            .split(',')
            .map(
                item =>
                    item.trim()
            )
            .filter(
                item =>
                    item.length > 0
            );
    };


    /* ========================================================
       VALIDATE FORM
    ======================================================== */

    const validateForm = () => {

        if (
            !form.name.trim()
        ) {
            return 'Scholarship name is required.';
        }

        if (
            !form.description.trim()
        ) {
            return 'Scholarship description is required.';
        }

        if (
            !form.academicYear.trim()
        ) {
            return 'Academic year is required.';
        }

        if (
            !form.scholarshipAmount
        ) {
            return 'Scholarship amount is required.';
        }

        if (
            Number(
                form.scholarshipAmount
            ) < 0
        ) {
            return 'Scholarship amount cannot be negative.';
        }

        if (
            !form.applicationStartDate
        ) {
            return 'Application start date is required.';
        }

        if (
            !form.applicationEndDate
        ) {
            return 'Application end date is required.';
        }

        if (
            new Date(
                form.applicationEndDate
            ) <
            new Date(
                form.applicationStartDate
            )
        ) {
            return 'Application end date cannot be before the start date.';
        }

        return null;
    };


    /* ========================================================
       SAVE SCHOLARSHIP
    ======================================================== */

    const handleSave = async (
        event
    ) => {

        event.preventDefault();

        setError('');
        setSuccess('');


        const validationError =
            validateForm();

        if (validationError) {

            setError(
                validationError
            );

            return;
        }


        try {

            setSaving(true);


            const payload = {

                name:
                    form.name.trim(),

                description:
                    form.description.trim(),

                academicYear:
                    form.academicYear.trim(),

                eligibleCourses:
                    convertToArray(
                        form.eligibleCourses
                    ),

                eligibleDepartments:
                    convertToArray(
                        form.eligibleDepartments
                    ),

                eligibleCategories:
                    convertToArray(
                        form.eligibleCategories
                    ),

                minimumPercentage:
                    form.minimumPercentage ===
                    ''
                        ? 0
                        : Number(
                            form.minimumPercentage
                        ),

                maximumFamilyIncome:
                    form.maximumFamilyIncome ===
                    ''
                        ? null
                        : Number(
                            form.maximumFamilyIncome
                        ),

                scholarshipAmount:
                    Number(
                        form.scholarshipAmount
                    ),

                requiredDocuments:
                    convertToArray(
                        form.requiredDocuments
                    ),

                applicationStartDate:
                    form.applicationStartDate,

                applicationEndDate:
                    form.applicationEndDate,

                instructions:
                    form.instructions.trim(),

                status:
                    form.status
            };


            let response;


            if (editingId) {

                response =
                    await API.put(
                        `/scholarships/${editingId}`,
                        payload,
                        getHeaders()
                    );

            } else {

                response =
                    await API.post(
                        '/scholarships',
                        payload,
                        getHeaders()
                    );

            }


            if (
                response.data?.success
            ) {

                setShowModal(false);

                setSuccess(
                    editingId
                        ? 'Scholarship updated successfully.'
                        : 'Scholarship created successfully.'
                );

                await fetchScholarships();

            } else {

                setError(
                    response.data?.message ||
                    'Unable to save scholarship.'
                );

            }

        } catch (error) {

            console.error(
                'Save scholarship error:',
                error
            );

            setError(
                error.response?.data?.message ||
                'Unable to save scholarship.'
            );

        } finally {

            setSaving(false);

        }
    };


    /* ========================================================
       DELETE SCHOLARSHIP
    ======================================================== */

    const handleDelete = async (
        id
    ) => {

        const confirmed =
            window.confirm(
                'Are you sure you want to delete this scholarship? This action cannot be undone.'
            );

        if (!confirmed) {
            return;
        }


        try {

            setDeletingId(id);
            setError('');
            setSuccess('');

            const response =
                await API.delete(
                    `/scholarships/${id}`,
                    getHeaders()
                );


            if (
                response.data?.success
            ) {

                setSuccess(
                    'Scholarship deleted successfully.'
                );

                await fetchScholarships();

            } else {

                setError(
                    response.data?.message ||
                    'Unable to delete scholarship.'
                );

            }

        } catch (error) {

            console.error(
                'Delete scholarship error:',
                error
            );

            setError(
                error.response?.data?.message ||
                'Unable to delete scholarship.'
            );

        } finally {

            setDeletingId(null);

        }
    };


    /* ========================================================
       FILTER SCHOLARSHIPS
    ======================================================== */

    const filteredScholarships =
        scholarships.filter(
            scholarship => {

                const search =
                    searchTerm
                        .trim()
                        .toLowerCase();

                const matchesSearch =
                    !search ||
                    scholarship.name
                        ?.toLowerCase()
                        .includes(search) ||
                    scholarship.academicYear
                        ?.toLowerCase()
                        .includes(search);


                const matchesStatus =
                    statusFilter ===
                        'ALL' ||
                    scholarship.status ===
                        statusFilter;


                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );


    /* ========================================================
       STATUS CLASS
    ======================================================== */

    const getStatusClass = (
        status
    ) => {

        switch (
            status
        ) {

            case 'PUBLISHED':
                return 'portal-status-success';

            case 'CLOSED':
                return 'portal-status-danger';

            case 'DRAFT':
            default:
                return 'portal-status-neutral';

        }
    };


    /* ========================================================
       DATE FORMAT
    ======================================================== */

    const formatDate = (
        value
    ) => {

        if (!value) {
            return '—';
        }

        return new Date(
            value
        ).toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        );
    };


    /* ========================================================
       RENDER
    ======================================================== */

    return (

        <div className="admin-scholarships-page">

            <div className="portal-container">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="admin-scholarships-header">

                    <div>

                        <div className="admin-page-kicker">

                            <BookOpen
                                size={16}
                            />

                            SCHOLARSHIP MANAGEMENT

                        </div>


                        <h1 className="portal-heading">

                            Scholarships

                        </h1>


                        <p className="portal-text">

                            Create, update and manage university
                            scholarship programmes.

                        </p>

                    </div>


                    <button
                        type="button"
                        className="portal-button portal-button-primary admin-create-button"
                        onClick={
                            openCreateModal
                        }
                    >

                        <Plus
                            size={18}
                        />

                        Create Scholarship

                    </button>

                </div>


                {/* =================================================
                    ALERTS
                ================================================= */}

                {error && (

                    <div className="admin-alert admin-alert-error">

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setError('')
                            }
                        >
                            <X
                                size={17}
                            />
                        </button>

                    </div>

                )}


                {success && (

                    <div className="admin-alert admin-alert-success">

                        <span>
                            {success}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setSuccess('')
                            }
                        >
                            <X
                                size={17}
                            />
                        </button>

                    </div>

                )}


                {/* =================================================
                    FILTER BAR
                ================================================= */}

                <div className="portal-card admin-filter-card">

                    <div className="admin-search-box">

                        <Search
                            size={18}
                        />

                        <input
                            type="text"
                            value={
                                searchTerm
                            }
                            onChange={(
                                event
                            ) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                            placeholder="Search by scholarship name or academic year..."
                        />

                    </div>


                    <select
                        className="portal-select admin-status-filter"
                        value={
                            statusFilter
                        }
                        onChange={(
                            event
                        ) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="ALL">
                            All Statuses
                        </option>

                        <option value="DRAFT">
                            Draft
                        </option>

                        <option value="PUBLISHED">
                            Published
                        </option>

                        <option value="CLOSED">
                            Closed
                        </option>

                    </select>


                    <button
                        type="button"
                        className="portal-button portal-button-secondary admin-refresh-button"
                        onClick={
                            fetchScholarships
                        }
                        disabled={
                            loading
                        }
                    >

                        <RefreshCw
                            size={17}
                            className={
                                loading
                                    ? 'admin-spin'
                                    : ''
                            }
                        />

                        Refresh

                    </button>

                </div>


                {/* =================================================
                    SUMMARY
                ================================================= */}

                <div className="admin-scholarship-summary">

                    <div className="admin-summary-item">

                        <span>
                            Total Scholarships
                        </span>

                        <strong>
                            {scholarships.length}
                        </strong>

                    </div>


                    <div className="admin-summary-item">

                        <span>
                            Published
                        </span>

                        <strong>
                            {
                                scholarships.filter(
                                    item =>
                                        item.status ===
                                        'PUBLISHED'
                                ).length
                            }
                        </strong>

                    </div>


                    <div className="admin-summary-item">

                        <span>
                            Draft
                        </span>

                        <strong>
                            {
                                scholarships.filter(
                                    item =>
                                        item.status ===
                                        'DRAFT'
                                ).length
                            }
                        </strong>

                    </div>


                    <div className="admin-summary-item">

                        <span>
                            Closed
                        </span>

                        <strong>
                            {
                                scholarships.filter(
                                    item =>
                                        item.status ===
                                        'CLOSED'
                                ).length
                            }
                        </strong>

                    </div>

                </div>


                {/* =================================================
                    SCHOLARSHIP LIST
                ================================================= */}

                {loading ? (

                    <div className="portal-card admin-empty-card">

                        <RefreshCw
                            size={24}
                            className="admin-spin"
                        />

                        <h3>
                            Loading scholarships...
                        </h3>

                        <p>
                            Please wait while scholarship
                            records are being retrieved.
                        </p>

                    </div>

                ) : filteredScholarships.length === 0 ? (

                    <div className="portal-card admin-empty-card">

                        <BookOpen
                            size={28}
                        />

                        <h3>
                            No scholarships found
                        </h3>

                        <p>
                            {searchTerm ||
                            statusFilter !==
                                'ALL'
                                ? 'Try changing your search or filter.'
                                : 'Create your first scholarship programme to get started.'}
                        </p>


                        {!searchTerm &&
                            statusFilter ===
                                'ALL' && (

                                <button
                                    type="button"
                                    className="portal-button portal-button-primary"
                                    onClick={
                                        openCreateModal
                                    }
                                >

                                    <Plus
                                        size={17}
                                    />

                                    Create Scholarship

                                </button>

                            )}

                    </div>

                ) : (

                    <div className="admin-scholarship-list">

                        {filteredScholarships.map(
                            scholarship => (

                                <div
                                    className="portal-card admin-scholarship-card"
                                    key={
                                        scholarship._id
                                    }
                                >

                                    {/* =================================
                                        CARD HEADER
                                    ================================= */}

                                    <div className="admin-scholarship-card-header">

                                        <div className="admin-scholarship-icon">

                                            <GraduationCap
                                                size={23}
                                            />

                                        </div>


                                        <div className="admin-scholarship-main">

                                            <h2>
                                                {
                                                    scholarship.name
                                                }
                                            </h2>

                                            <p>
                                                Academic Year:{' '}
                                                {
                                                    scholarship.academicYear
                                                }
                                            </p>

                                        </div>


                                        <span
                                            className={`portal-status ${getStatusClass(
                                                scholarship.status
                                            )}`}
                                        >
                                            {
                                                scholarship.status
                                            }
                                        </span>

                                    </div>


                                    {/* =================================
                                        DESCRIPTION
                                    ================================= */}

                                    <p className="admin-scholarship-description">

                                        {
                                            scholarship.description
                                        }

                                    </p>


                                    {/* =================================
                                        DETAILS
                                    ================================= */}

                                    <div className="admin-scholarship-details">

                                        <div className="admin-scholarship-detail">

                                            <IndianRupee
                                                size={17}
                                            />

                                            <div>

                                                <span>
                                                    Scholarship Amount
                                                </span>

                                                <strong>
                                                    ₹
                                                    {Number(
                                                        scholarship.scholarshipAmount ||
                                                        0
                                                    ).toLocaleString(
                                                        'en-IN'
                                                    )}
                                                </strong>

                                            </div>

                                        </div>


                                        <div className="admin-scholarship-detail">

                                            <CalendarDays
                                                size={17}
                                            />

                                            <div>

                                                <span>
                                                    Application Period
                                                </span>

                                                <strong>
                                                    {
                                                        formatDate(
                                                            scholarship.applicationStartDate
                                                        )
                                                    }

                                                    {' — '}

                                                    {
                                                        formatDate(
                                                            scholarship.applicationEndDate
                                                        )
                                                    }
                                                </strong>

                                            </div>

                                        </div>


                                        <div className="admin-scholarship-detail">

                                            <BookOpen
                                                size={17}
                                            />

                                            <div>

                                                <span>
                                                    Required Documents
                                                </span>

                                                <strong>
                                                    {
                                                        Array.isArray(
                                                            scholarship.requiredDocuments
                                                        )
                                                            ? scholarship.requiredDocuments.length
                                                            : 0
                                                    }
                                                </strong>

                                            </div>

                                        </div>

                                    </div>


                                    {/* =================================
                                        ELIGIBILITY
                                    ================================= */}

                                    <div className="admin-scholarship-eligibility">

                                        <div>

                                            <span>
                                                Categories
                                            </span>

                                            <strong>
                                                {
                                                    Array.isArray(
                                                        scholarship.eligibleCategories
                                                    ) &&
                                                    scholarship.eligibleCategories.length
                                                        ? scholarship.eligibleCategories.join(
                                                            ', '
                                                        )
                                                        : 'All'
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Minimum Percentage
                                            </span>

                                            <strong>
                                                {
                                                    scholarship.minimumPercentage ??
                                                    0
                                                }%
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Maximum Family Income
                                            </span>

                                            <strong>
                                                {scholarship.maximumFamilyIncome
                                                    ? `₹${Number(
                                                        scholarship.maximumFamilyIncome
                                                    ).toLocaleString(
                                                        'en-IN'
                                                    )}`
                                                    : 'No limit'}
                                            </strong>

                                        </div>

                                    </div>


                                    {/* =================================
                                        ACTIONS
                                    ================================= */}

                                    <div className="admin-scholarship-actions">

                                        <button
                                            type="button"
                                            className="portal-button portal-button-secondary"
                                            onClick={() =>
                                                openEditModal(
                                                    scholarship
                                                )
                                            }
                                        >

                                            <Edit3
                                                size={16}
                                            />

                                            Edit

                                        </button>


                                        <button
                                            type="button"
                                            className="portal-button portal-button-danger"
                                            onClick={() =>
                                                handleDelete(
                                                    scholarship._id
                                                )
                                            }
                                            disabled={
                                                deletingId ===
                                                scholarship._id
                                            }
                                        >

                                            <Trash2
                                                size={16}
                                            />

                                            {deletingId ===
                                            scholarship._id
                                                ? 'Deleting...'
                                                : 'Delete'}

                                        </button>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>


            {/* =====================================================
                CREATE / EDIT MODAL
            ===================================================== */}

            {showModal && (

                <div className="admin-modal-overlay">

                    <div className="admin-modal">

                        <div className="admin-modal-header">

                            <div>

                                <h2>

                                    {editingId
                                        ? 'Edit Scholarship'
                                        : 'Create Scholarship'}

                                </h2>

                                <p>
                                    Enter the scholarship programme
                                    details below.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={() =>
                                    setShowModal(
                                        false
                                    )
                                }
                            >

                                <X
                                    size={21}
                                />

                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleSave
                            }
                        >

                            <div className="admin-modal-body">

                                {error && (

                                    <div className="admin-alert admin-alert-error">

                                        <span>
                                            {error}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setError('')
                                            }
                                        >
                                            <X
                                                size={16}
                                            />
                                        </button>

                                    </div>

                                )}


                                {/* =================================
                                    BASIC INFORMATION
                                ================================= */}

                                <div className="admin-form-section">

                                    <h3>
                                        Basic Information
                                    </h3>

                                    <div className="admin-form-grid">

                                        <div className="admin-form-full">

                                            <label className="portal-label">
                                                Scholarship Name *
                                            </label>

                                            <input
                                                type="text"
                                                name="name"
                                                className="portal-input"
                                                value={
                                                    form.name
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Example: Post-Matric Scholarship"
                                            />

                                        </div>


                                        <div className="admin-form-full">

                                            <label className="portal-label">
                                                Description *
                                            </label>

                                            <textarea
                                                name="description"
                                                className="portal-textarea"
                                                value={
                                                    form.description
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Describe the scholarship programme..."
                                            />

                                        </div>


                                        <div>

                                            <label className="portal-label">
                                                Academic Year *
                                            </label>

                                            <input
                                                type="text"
                                                name="academicYear"
                                                className="portal-input"
                                                value={
                                                    form.academicYear
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="2026-27"
                                            />

                                        </div>


                                        <div>

                                            <label className="portal-label">
                                                Status
                                            </label>

                                            <select
                                                name="status"
                                                className="portal-select"
                                                value={
                                                    form.status
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            >

                                                <option value="DRAFT">
                                                    Draft
                                                </option>

                                                <option value="PUBLISHED">
                                                    Published
                                                </option>

                                                <option value="CLOSED">
                                                    Closed
                                                </option>

                                            </select>

                                        </div>

                                    </div>

                                </div>


                                {/* =================================
                                    ELIGIBILITY
                                ================================= */}

                                <div className="admin-form-section">

                                    <h3>
                                        Eligibility Criteria
                                    </h3>

                                    <div className="admin-form-grid">

                                        <div>

                                            <label className="portal-label">
                                                Eligible Courses
                                            </label>

                                            <input
                                                type="text"
                                                name="eligibleCourses"
                                                className="portal-input"
                                                value={
                                                    form.eligibleCourses
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="B.Tech, B.Sc, B.Com"
                                            />

                                            <small className="admin-field-help">
                                                Separate multiple values with commas.
                                            </small>

                                        </div>


                                        <div>

                                            <label className="portal-label">
                                                Eligible Departments
                                            </label>

                                            <input
                                                type="text"
                                                name="eligibleDepartments"
                                                className="portal-input"
                                                value={
                                                    form.eligibleDepartments
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="ECE, CSE, EEE"
                                            />

                                        </div>


                                        <div>

                                            <label className="portal-label">
                                                Eligible Categories
                                            </label>

                                            <input
                                                type="text"
                                                name="eligibleCategories"
                                                className="portal-input"
                                                value={
                                                    form.eligibleCategories
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="SC, ST, OBC"
                                            />

                                        </div>


                                        <div>

                                            <label className="portal-label">
                                                Minimum Percentage
                                            </label>

                                            <input
                                                type="number"
                                                name="minimumPercentage"
                                                className="portal-input"
                                                value={
                                                    form.minimumPercentage
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                placeholder="50"
                                            />

                                        </div>


                                        <div>

                                            <label className="portal-label">
                                                Maximum Family Income
                                            </label>

                                            <input
                                                type="number"
                                                name="maximumFamilyIncome"
                                                className="portal-input"
                                                value={
                                                    form.maximumFamilyIncome
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                min="0"
                                                step="1"
                                                placeholder="250000"
                                            />

                                        </div>

                                    </div>

                                </div>


                                {/* =================================
                                    FINANCIAL INFORMATION
                                ================================= */}

                                <div className="admin-form-section">

                                    <h3>
                                        Scholarship Financial Details
                                    </h3>

                                    <div className="admin-form-grid">

                                        <div>

                                            <label className="portal-label">
                                                Scholarship Amount *
                                            </label>

                                            <input
                                                type="number"
                                                name="scholarshipAmount"
                                                className="portal-input"
                                                value={
                                                    form.scholarshipAmount
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                min="0"
                                                step="1"
                                                placeholder="25000"
                                            />

                                        </div>

                                    </div>

                                </div>


                                {/* =================================
                                    DOCUMENTS
                                ================================= */}

                                <div className="admin-form-section">

                                    <h3>
                                        Required Documents
                                    </h3>

                                    <div>

                                        <label className="portal-label">
                                            Required Documents
                                        </label>

                                        <input
                                            type="text"
                                            name="requiredDocuments"
                                            className="portal-input"
                                            value={
                                                form.requiredDocuments
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Aadhaar Card, Income Certificate, Caste Certificate"
                                        />

                                        <small className="admin-field-help">
                                            Separate document names with commas.
                                        </small>

                                    </div>

                                </div>


                                {/* =================================
                                    APPLICATION PERIOD
                                ================================= */}

                                <div className="admin-form-section">

                                    <h3>
                                        Application Period
                                    </h3>

                                    <div className="admin-form-grid">

                                        <div>

                                            <label className="portal-label">
                                                Application Start Date *
                                            </label>

                                            <input
                                                type="date"
                                                name="applicationStartDate"
                                                className="portal-input"
                                                value={
                                                    form.applicationStartDate
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>


                                        <div>

                                            <label className="portal-label">
                                                Application End Date *
                                            </label>

                                            <input
                                                type="date"
                                                name="applicationEndDate"
                                                className="portal-input"
                                                value={
                                                    form.applicationEndDate
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>

                                    </div>

                                </div>


                                {/* =================================
                                    INSTRUCTIONS
                                ================================= */}

                                <div className="admin-form-section">

                                    <h3>
                                        Student Instructions
                                    </h3>

                                    <textarea
                                        name="instructions"
                                        className="portal-textarea"
                                        value={
                                            form.instructions
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter instructions students should follow while applying..."
                                    />

                                </div>

                            </div>


                            {/* =====================================
                                MODAL FOOTER
                            ===================================== */}

                            <div className="admin-modal-footer">

                                <button
                                    type="button"
                                    className="portal-button portal-button-secondary"
                                    onClick={() =>
                                        setShowModal(
                                            false
                                        )
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="portal-button portal-button-primary"
                                    disabled={
                                        saving
                                    }
                                >

                                    {saving ? (

                                        <>

                                            <RefreshCw
                                                size={16}
                                                className="admin-spin"
                                            />

                                            Saving...

                                        </>

                                    ) : (

                                        <>

                                            <Save
                                                size={16}
                                            />

                                            {editingId
                                                ? 'Update Scholarship'
                                                : 'Create Scholarship'}

                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =====================================================
                STYLES
            ===================================================== */}

            <style>
                {`

                .admin-scholarships-page {
                    min-height: 100vh;
                    padding: 34px 0 60px;
                    background:
                        linear-gradient(
                            180deg,
                            #f8fafc 0%,
                            #f5f7fb 100%
                        );
                }


                .admin-scholarships-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 24px;
                    margin-bottom: 28px;
                }


                .admin-page-kicker {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    margin-bottom: 9px;
                    color: #174a8b;
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                }


                .admin-scholarships-header h1 {
                    margin-bottom: 7px;
                    font-size: 32px;
                }


                .admin-create-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    white-space: nowrap;
                }


                .admin-alert {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    margin-bottom: 18px;
                    padding: 13px 15px;
                    border-radius: 9px;
                    font-size: 14px;
                }


                .admin-alert button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    padding: 2px;
                    background: transparent;
                    color: inherit;
                }


                .admin-alert-error {
                    border: 1px solid #fecaca;
                    color: #991b1b;
                    background: #fff1f2;
                }


                .admin-alert-success {
                    border: 1px solid #bbf7d0;
                    color: #166534;
                    background: #f0fdf4;
                }


                .admin-filter-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 15px;
                    margin-bottom: 18px;
                }


                .admin-search-box {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    min-width: 200px;
                    padding: 0 12px;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    background: #ffffff;
                    color: #64748b;
                }


                .admin-search-box input {
                    width: 100%;
                    height: 42px;
                    border: none;
                    outline: none;
                    color: #172033;
                    background: transparent;
                    font-size: 14px;
                }


                .admin-status-filter {
                    width: 170px;
                    height: 44px;
                }


                .admin-refresh-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    white-space: nowrap;
                }


                .admin-spin {
                    animation:
                        admin-scholarship-spin
                        1s linear infinite;
                }


                @keyframes admin-scholarship-spin {

                    from {
                        transform: rotate(0deg);
                    }

                    to {
                        transform: rotate(360deg);
                    }

                }


                .admin-scholarship-summary {
                    display: grid;
                    grid-template-columns:
                        repeat(4, minmax(0, 1fr));
                    gap: 14px;
                    margin-bottom: 20px;
                }


                .admin-summary-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    padding: 15px 17px;
                    border: 1px solid #e2e8f0;
                    border-radius: 9px;
                    background: #ffffff;
                }


                .admin-summary-item span {
                    color: #64748b;
                    font-size: 13px;
                }


                .admin-summary-item strong {
                    color: #172033;
                    font-size: 20px;
                }


                .admin-scholarship-list {
                    display: grid;
                    grid-template-columns:
                        repeat(2, minmax(0, 1fr));
                    gap: 18px;
                }


                .admin-scholarship-card {
                    padding: 20px;
                }


                .admin-scholarship-card-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }


                .admin-scholarship-icon {
                    width: 45px;
                    height: 45px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    border-radius: 10px;
                    color: #174a8b;
                    background: #eaf1fb;
                }


                .admin-scholarship-main {
                    flex: 1;
                    min-width: 0;
                }


                .admin-scholarship-main h2 {
                    margin: 0 0 4px;
                    color: #172033;
                    font-size: 17px;
                    line-height: 1.35;
                }


                .admin-scholarship-main p {
                    margin: 0;
                    color: #64748b;
                    font-size: 12px;
                }


                .admin-scholarship-description {
                    margin: 17px 0;
                    color: #475569;
                    line-height: 1.6;
                    font-size: 13px;
                }


                .admin-scholarship-details {
                    display: grid;
                    grid-template-columns:
                        repeat(3, minmax(0, 1fr));
                    gap: 10px;
                    padding: 14px 0;
                    border-top: 1px solid #e2e8f0;
                    border-bottom: 1px solid #e2e8f0;
                }


                .admin-scholarship-detail {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    color: #174a8b;
                }


                .admin-scholarship-detail > div {
                    min-width: 0;
                }


                .admin-scholarship-detail span {
                    display: block;
                    margin-bottom: 3px;
                    color: #64748b;
                    font-size: 10px;
                    font-weight: 600;
                }


                .admin-scholarship-detail strong {
                    display: block;
                    color: #172033;
                    font-size: 12px;
                    line-height: 1.4;
                }


                .admin-scholarship-eligibility {
                    display: grid;
                    grid-template-columns:
                        repeat(3, minmax(0, 1fr));
                    gap: 10px;
                    padding: 14px 0;
                }


                .admin-scholarship-eligibility span {
                    display: block;
                    margin-bottom: 3px;
                    color: #64748b;
                    font-size: 10px;
                    font-weight: 600;
                }


                .admin-scholarship-eligibility strong {
                    color: #334155;
                    font-size: 12px;
                    line-height: 1.4;
                }


                .admin-scholarship-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 9px;
                    padding-top: 14px;
                    border-top: 1px solid #e2e8f0;
                }


                .admin-scholarship-actions button {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                }


                .admin-empty-card {
                    min-height: 280px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 30px;
                    color: #64748b;
                }


                .admin-empty-card h3 {
                    margin: 14px 0 5px;
                    color: #172033;
                    font-size: 18px;
                }


                .admin-empty-card p {
                    max-width: 480px;
                    margin: 0 0 18px;
                    line-height: 1.6;
                    font-size: 13px;
                }


                /* ==================================================
                   MODAL
                ================================================== */

                .admin-modal-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background:
                        rgba(
                            15,
                            23,
                            42,
                            0.55
                        );
                }


                .admin-modal {
                    width: 100%;
                    max-width: 850px;
                    max-height: 92vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    border-radius: 13px;
                    background: #ffffff;
                    box-shadow:
                        0 24px 70px
                        rgba(
                            15,
                            23,
                            42,
                            0.22
                        );
                }


                .admin-modal > form {
                    display: flex;
                    flex: 1;
                    flex-direction: column;
                    min-height: 0;
                    overflow: hidden;
                }


                .admin-modal-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 15px;
                    padding: 20px 22px;
                    border-bottom:
                        1px solid #e2e8f0;
                }


                .admin-modal-header h2 {
                    margin: 0 0 4px;
                    color: #172033;
                    font-size: 20px;
                }


                .admin-modal-header p {
                    margin: 0;
                    color: #64748b;
                    font-size: 12px;
                }


                .admin-modal-close {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    border-radius: 7px;
                    padding: 7px;
                    color: #475569;
                    background: #f1f5f9;
                }


                .admin-modal-body {
                    flex: 1;
                    min-height: 0;
                    overflow-y: auto;
                    padding: 22px;
                }


                .admin-form-section {
                    margin-bottom: 25px;
                    padding-bottom: 22px;
                    border-bottom:
                        1px solid #e2e8f0;
                }


                .admin-form-section:last-child {
                    margin-bottom: 0;
                    padding-bottom: 0;
                    border-bottom: none;
                }


                .admin-form-section h3 {
                    margin: 0 0 15px;
                    color: #334155;
                    font-size: 15px;
                }


                .admin-form-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(2, minmax(0, 1fr));
                    gap: 16px;
                }


                .admin-form-full {
                    grid-column: 1 / -1;
                }


                .admin-field-help {
                    display: block;
                    margin-top: 5px;
                    color: #64748b;
                    font-size: 11px;
                }


                .admin-modal-footer {
                    display: flex;
                    flex: 0 0 auto;
                    justify-content: flex-end;
                    gap: 10px;
                    padding: 15px 22px;
                    border-top:
                        1px solid #e2e8f0;
                    background: #f8fafc;
                }


                .admin-modal-footer button {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                }


                @media (max-width: 1000px) {

                    .admin-scholarship-list {
                        grid-template-columns: 1fr;
                    }

                }


                @media (max-width: 750px) {

                    .admin-scholarships-header {
                        flex-direction: column;
                    }


                    .admin-create-button {
                        width: 100%;
                        justify-content: center;
                    }


                    .admin-filter-card {
                        flex-direction: column;
                        align-items: stretch;
                    }


                    .admin-search-box {
                        width: 100%;
                    }


                    .admin-status-filter {
                        width: 100%;
                    }


                    .admin-refresh-button {
                        justify-content: center;
                    }


                    .admin-scholarship-summary {
                        grid-template-columns:
                            repeat(2, minmax(0, 1fr));
                    }


                    .admin-scholarship-details {
                        grid-template-columns: 1fr;
                    }


                    .admin-scholarship-eligibility {
                        grid-template-columns: 1fr;
                    }

                }


                @media (max-width: 600px) {

                    .admin-scholarships-page {
                        padding-top: 22px;
                    }


                    .admin-scholarships-header h1 {
                        font-size: 27px;
                    }


                    .admin-scholarship-card-header {
                        flex-wrap: wrap;
                    }


                    .admin-scholarship-card-header
                    .portal-status {
                        margin-left: 57px;
                    }


                    .admin-scholarship-actions {
                        flex-direction: column;
                    }


                    .admin-scholarship-actions button {
                        width: 100%;
                        justify-content: center;
                    }


                    .admin-modal-overlay {
                        padding: 10px;
                    }


                    .admin-modal {
                        max-height: 96vh;
                    }


                    .admin-modal-body {
                        padding: 17px;
                    }


                    .admin-form-grid {
                        grid-template-columns: 1fr;
                    }


                    .admin-form-full {
                        grid-column: auto;
                    }


                    .admin-modal-footer {
                        padding: 13px 17px;
                    }

                }

                `}
            </style>

        </div>
    );
};


export default AdminScholarships;
