import React, {
    useEffect,
    useState
} from 'react';

import {
    useNavigate,
    useParams
} from 'react-router-dom';

import {
    ArrowLeft,
    CheckCircle2,
    Upload,
    FileText,
    Download,
    Send,
    AlertCircle,
    Loader2,
    Eye
} from 'lucide-react';

import API from '../../services/api';

import authService from '../../services/authService';
import { INDIAN_STATES } from '../../data/statesData';
import IGOD_LOCATION_DATA from '../../data/igodLocationData.json';
// State/UT suggestions are adapted from the Ministry of Tribal Affairs' notified ST list (04 Aug 2023).
import SCHEDULED_TRIBES_BY_STATE from '../../data/scheduledTribesByState.json';

const CURRENT_YEAR = new Date().getFullYear();
const ACADEMIC_YEAR_OPTIONS = Array.from(
    { length: 101 },
    (_, index) => String(CURRENT_YEAR - index)
);
const PRESENT_YEAR_OPTIONS = [
    ...Array.from({ length: 10 }, (_, index) => `${index + 1}${['st', 'nd', 'rd'][index] || 'th'} Year`),
    ...Array.from({ length: 12 }, (_, index) => `Class ${index + 1}`)
];
const STUDENT_UNDERTAKING_TEXT = 'I declare that all details and documents submitted with this application are true, complete and genuine to the best of my knowledge. I accept responsibility for any information or document that is false or misleading, and understand that the application or benefits may be cancelled or recovered and that further action may be taken under applicable laws and rules in force in India.';

const APPLICANT_DETAIL_GROUPS = [
    {
        title: 'Basic Details',
        fields: [
            { name: 'studentId', label: 'Student ID', readOnly: true, required: true },
            { name: 'applicationNumber', label: 'Application ID', readOnly: true },
            { name: 'appliedScheme', label: 'Applied for Scheme', readOnly: true },
            { name: 'registrationDate', label: 'Registration Date', readOnly: true },
            { name: 'domicileState', label: 'State of Domicile', type: 'select', options: INDIAN_STATES, required: true },
            { name: 'scholarshipCategory', label: 'Scholarship Category', readOnly: true },
            { name: 'fullName', label: 'Name of Student', readOnly: true, required: true },
            { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', readOnly: true, required: true },
            { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
            { name: 'maritalStatus', label: 'Marital Status', type: 'select', options: ['Unmarried', 'Married', 'Widowed', 'Divorced'], required: true },
            { name: 'category', label: 'Community / Category', readOnly: true, required: true },
            { name: 'deNotifiedTribes', label: 'DNT', type: 'select', options: ['No', 'Yes'], required: true },
            { name: 'tribes', label: 'DNT / ST Community', required: true },
            { name: 'religion', label: 'Religion', type: 'select', options: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other religions and persuasions', 'Religion not stated'], required: true },
            { name: 'parentProfession', label: "Parent's Profession", required: true },
            { name: 'familyIncome', label: 'Annual Family Income', type: 'number', readOnly: true, required: true },
            { name: 'fatherName', label: "Father's Name", readOnly: true, required: true },
            { name: 'motherName', label: "Mother's Name", readOnly: true, required: true },
            { name: 'emailAddress', label: 'Email ID', type: 'email', readOnly: true, required: true },
            { name: 'mobile', label: 'Mobile Number', readOnly: true, required: true },
            { name: 'aadhaarNumber', label: 'Aadhaar Detail', readOnly: true, required: true },
            { name: 'divyangjan', label: 'Divyangjan', type: 'select', options: ['No', 'Yes'], required: true }
        ]
    },
    {
        title: 'Academic Details',
        fields: [
            { name: 'institute', label: 'Institute', required: true },
            { name: 'tehsil', label: 'Tehsil', required: true },
            { name: 'course', label: 'Present Class / Course', readOnly: true, required: true },
            { name: 'classStartDate', label: 'Class / Course Start Date', type: 'date' },
            { name: 'presentYear', label: 'Present Year / Class', type: 'presentYear' },
            { name: 'presentRollNumber', label: 'Roll No.' },
            { name: 'section', label: 'Section' },
            { name: 'modeOfStudy', label: 'Mode of Study', type: 'select', options: ['Regular / Full Time', 'Part Time', 'Distance Learning', 'Online', 'Other'] },
            { name: 'hosteller', label: 'Day Scholar / Hosteller', type: 'select', options: ['Day Scholar', 'Hosteller'], required: true },
            { name: 'enrollment', label: 'Registration / Enrollment / Admission No.' },
            { name: 'enrollmentYear', label: 'Registration / Enrollment / Admission Year', type: 'year' },
            { name: 'previousBoard', label: 'Previous Board / University' },
            { name: 'previousPassingYear', label: 'Previous Passing Year', type: 'year' },
            { name: 'previousPercentage', label: 'Previous Percentage', type: 'number' },
            { name: 'class10Board', label: '10th Board' },
            { name: 'class10Session', label: '10th Passing Year', type: 'year' },
            { name: 'class10RollNumber', label: '10th Roll Number' },
            { name: 'class10Percentage', label: '10th Class Percentage', type: 'number' },
            { name: 'class12Board', label: '12th Board' },
            { name: 'class12PassingYear', label: '12th Passing Year', type: 'year' },
            { name: 'class12RollNumber', label: '12th Roll Number' },
            { name: 'class12Percentage', label: '12th Class Percentage', type: 'number' },
            { name: 'competitiveExamQualified', label: 'Competitive Exam Qualified', type: 'select', options: ['No', 'Yes'], required: true },
            { name: 'competitiveExamConductedBy', label: 'Competitive Exam Conducted By' },
            { name: 'competitiveExamRollNumber', label: 'Competitive Exam Roll Number' },
            { name: 'competitiveExamYear', label: 'Competitive Exam Year' }
        ]
    },
    {
        title: 'Application Specific Details',
        fields: [
            { name: 'domicileStateIdentificationNumber', label: 'Domicile / Residence Certificate No.' },
            { name: 'memberNumber', label: 'Member No. (Aadhaar Number)', readOnly: true },
            { name: 'nameAsPerDomicileId', label: 'Name as per Domicile State ID Card', readOnly: true, required: true }
        ]
    },
    {
        title: 'Scheme Specific Details',
        fields: [
            { name: 'permanentAddressState', label: 'Permanent Address State', type: 'select', options: INDIAN_STATES, required: true },
            { name: 'homeDistrict', label: 'Home District', required: true },
            { name: 'subDistrict', label: 'Sub District', required: true },
            { name: 'village', label: 'Village / Town', required: true },
            { name: 'pinCode', label: 'PIN Code', required: true },
            { name: 'permanentAddress', label: 'Address', type: 'textarea', readOnly: true, required: true }
        ]
    }
];

const APPLICANT_DETAIL_FIELDS = APPLICANT_DETAIL_GROUPS.flatMap(
    (group) => group.fields
);

// Special-category suggestions follow GNDU's 2026-27 reservation categories.
const SPECIAL_CATEGORY_TYPES = [
    'Ex-Serviceman / dependent - SC',
    'Ex-Serviceman / dependent - BC',
    'Person with Disability (PWD)',
    'Sports - SC'
];

// Searchable examples based on India's National Classification of Occupations (NCO-2015).
// Free text remains enabled because NCO-2015 contains thousands of specific job titles.
const PARENT_PROFESSION_OPTIONS = [
    'Cultivator / Farmer',
    'Agricultural Labourer',
    'Horticulture / Plantation Worker',
    'Livestock / Dairy Farmer',
    'Fisheries Worker',
    'Forestry Worker',
    'Business Owner / Entrepreneur',
    'Self-Employed Professional',
    'Government Employee',
    'Private Sector Salaried Employee',
    'Teacher / Educator',
    'Doctor / Medical Practitioner',
    'Nurse / Midwife',
    'Pharmacist',
    'Allied Health Professional',
    'Engineer',
    'Information Technology / Software Professional',
    'Scientist / Researcher',
    'Lawyer / Legal Professional',
    'Accountant / Finance Professional',
    'Management / Administration Professional',
    'Clerical / Office Worker',
    'Government Administrative Official',
    'Police / Law Enforcement Personnel',
    'Armed Forces Personnel',
    'Security Guard / Security Worker',
    'Retail Shopkeeper / Sales Worker',
    'Street Vendor / Market Trader',
    'Wholesale / Trade Worker',
    'Driver / Transport Worker',
    'Delivery / Courier Worker',
    'Construction Worker',
    'Electrician',
    'Plumber / Pipe Fitter',
    'Carpenter',
    'Mason',
    'Welder / Metal Worker',
    'Mechanic / Vehicle Repair Worker',
    'Tailor / Garment Worker',
    'Handicraft / Artisan Worker',
    'Factory / Production Worker',
    'Plant / Machine Operator',
    'Domestic Worker / Housekeeper',
    'Cleaner / Sanitation Worker',
    'Cook / Food Service Worker',
    'Hotel / Hospitality Worker',
    'Personal Care / Beauty Worker',
    'Daily Wage Worker',
    'Other Occupation (please specify)',
    'Homemaker / Unpaid Household Work',
    'Unemployed',
    'Retired / Pensioner'
];

const SCHOOL_BOARD_OPTIONS = [
    'Central Board of Secondary Education (CBSE)',
    'Council for the Indian School Certificate Examinations (CISCE)',
    'National Institute of Open Schooling (NIOS)',
    'Board of Intermediate Education, Andhra Pradesh',
    'Board of Secondary Education, Andhra Pradesh',
    'Assam State School Education Board',
    'Assam Higher Secondary Education Council',
    'Bihar School Examination Board',
    'Bihar Board of Open Schooling and Examination',
    'Chhattisgarh Board of Secondary Education',
    'Goa Board of Secondary and Higher Secondary Education',
    'Gujarat Secondary and Higher Secondary Education Board',
    'Board of School Education Haryana',
    'Himachal Pradesh Board of School Education',
    'Jammu and Kashmir Board of School Education',
    'Jharkhand Academic Council',
    'Karnataka School Examination and Assessment Board',
    'Department of Pre-University Education, Karnataka',
    'Kerala Board of Public Examinations',
    'Directorate of Higher Secondary Education, Kerala',
    'Board of Secondary Education, Madhya Pradesh',
    'Maharashtra State Board of Secondary and Higher Secondary Education',
    'Board of Secondary Education, Manipur',
    'Council of Higher Secondary Education, Manipur',
    'Meghalaya Board of School Education',
    'Mizoram Board of School Education',
    'Nagaland Board of School Education',
    'Board of Secondary Education, Odisha',
    'Council of Higher Secondary Education, Odisha',
    'Punjab School Education Board',
    'Board of Secondary Education, Rajasthan',
    'Tamil Nadu State Board',
    'Telangana Board of Secondary Education',
    'Telangana State Board of Intermediate Education',
    'Tripura Board of Secondary Education',
    'Board of High School and Intermediate Education, Uttar Pradesh',
    'Uttarakhand Board of School Education',
    'West Bengal Board of Secondary Education',
    'West Bengal Council of Higher Secondary Education'
];

const getSchemeCategory = (scholarship) => {
    if (scholarship?.schemeCategory) return scholarship.schemeCategory;
    const name = String(scholarship?.name || '').toLowerCase();
    if (/pre[\s-]*matric/.test(name)) return 'Pre-Matric';
    if (/top[\s-]*class/.test(name)) return 'Top Class';
    if (/merit[\s-]*cum[\s-]*means|\bmcm\b/.test(name)) return 'Merit-cum-Means (MCM)';
    if (/post[\s-]*matric/.test(name)) return 'Post-Matric';
    return 'Other NSP Scheme';
};


const ApplicationDocuments = () => {

    const {
        id
    } = useParams();

    const navigate =
        useNavigate();


    /* ============================================================
       STATE
    ============================================================ */

    const [
        application,
        setApplication
    ] = useState(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState('');

    const [
        uploadingDocument,
        setUploadingDocument
    ] = useState('');

    const [
        submittingApplication,
        setSubmittingApplication
    ] = useState(false);

    const [
        viewingDocument,
        setViewingDocument
    ] = useState('');

    const [
        successMessage,
        setSuccessMessage
    ] = useState('');

    const [
        selectedFiles,
        setSelectedFiles
    ] = useState({});

    const [applicantDetails, setApplicantDetails] =
        useState({});
    const [previousUniversitySuggestions, setPreviousUniversitySuggestions] = useState([]);
    const [openBoardField, setOpenBoardField] = useState('');
    const [tribeSuggestionsOpen, setTribeSuggestionsOpen] = useState(false);
    const [tribeManual, setTribeManual] = useState(false);
    const [dntCommunitySuggestions, setDntCommunitySuggestions] = useState([]);
    const [dntCommunityLoading, setDntCommunityLoading] = useState(false);
    const [postOfficeQuery, setPostOfficeQuery] = useState('');
    const [postOfficeOptions, setPostOfficeOptions] = useState([]);
    const [postOfficeLoading, setPostOfficeLoading] = useState(false);

    const [institutionResults, setInstitutionResults] = useState([]);
    const [institutionSearchLoading, setInstitutionSearchLoading] = useState(false);
    const [institutionSearchMode, setInstitutionSearchMode] = useState('location');
    const [institutionQuery, setInstitutionQuery] = useState('');
    const [institutionState, setInstitutionState] = useState('');
    const [institutionDistrict, setInstitutionDistrict] = useState('');
    const [institutionSearchMessage, setInstitutionSearchMessage] = useState('');
    const [institutionPage, setInstitutionPage] = useState(1);
    const [institutionTotal, setInstitutionTotal] = useState(0);
    const [tehsilManual, setTehsilManual] = useState(false);
    const [homeDistrictManual, setHomeDistrictManual] = useState(false);
    const [subDistrictManual, setSubDistrictManual] = useState(false);
    const [eciHomeDistrictOptions, setEciHomeDistrictOptions] = useState([]);
    const [eciHomeDistrictLoading, setEciHomeDistrictLoading] = useState(false);
    const [villageAssemblies, setVillageAssemblies] = useState([]);
    const [selectedVillageAssembly, setSelectedVillageAssembly] = useState('');
    const [eciVillageOptions, setEciVillageOptions] = useState([]);
    const [eciAssemblyLoading, setEciAssemblyLoading] = useState(false);
    const [eciVillageLoading, setEciVillageLoading] = useState(false);
    const [villageManual, setVillageManual] = useState(false);

    const [savingApplicantDetails, setSavingApplicantDetails] =
        useState(false);

    const [applicationStep, setApplicationStep] =
        useState('details');
    const [detailsPageIndex, setDetailsPageIndex] = useState(0);
    const [undertakingAccepted, setUndertakingAccepted] = useState(false);

    const [downloadingApplicationPdf, setDownloadingApplicationPdf] =
        useState(false);


    /* ============================================================
       AUTH TOKEN
    ============================================================ */

    const token =
        authService.getToken();


    /* ============================================================
       AUTH HEADER
    ============================================================ */

    const getAuthConfig = () => ({
        headers: {
            Authorization:
                `Bearer ${token}`
        }
    });

    useEffect(() => {
        const query = String(applicantDetails.previousBoard || '').trim();
        if (query.length < 2) {
            setPreviousUniversitySuggestions([]);
            return undefined;
        }

        let cancelled = false;
        const timer = window.setTimeout(async () => {
            try {
                const response = await API.get('/institutions/search', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        q: query,
                        type: 'University,Institute of National Importance',
                        page: 1
                    }
                });
                if (!cancelled) {
                    setPreviousUniversitySuggestions(
                        (response.data?.institutions || []).map(({ name }) => name).filter(Boolean)
                    );
                }
            } catch {
                if (!cancelled) setPreviousUniversitySuggestions([]);
            }
        }, 250);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [applicantDetails.previousBoard, token]);

    useEffect(() => {
        const isDnt = applicantDetails.deNotifiedTribes === 'Yes'
            || String(applicantDetails.category || '').trim().toUpperCase() === 'DNT';
        const state = String(applicantDetails.domicileState || applicantDetails.state || applicantDetails.permanentAddressState || '').trim();
        if (!isDnt || !state) {
            setDntCommunitySuggestions([]);
            setDntCommunityLoading(false);
            return undefined;
        }

        let cancelled = false;
        setDntCommunityLoading(true);
        API.get('/dnt/communities', {
            headers: { Authorization: `Bearer ${token}` },
            params: { state }
        }).then((response) => {
            if (!cancelled) setDntCommunitySuggestions(response.data?.communities || []);
        }).catch(() => {
            if (!cancelled) setDntCommunitySuggestions([]);
        }).finally(() => {
            if (!cancelled) setDntCommunityLoading(false);
        });

        return () => { cancelled = true; };
    }, [applicantDetails.deNotifiedTribes, applicantDetails.category, applicantDetails.domicileState, applicantDetails.state, applicantDetails.permanentAddressState, token]);

    useEffect(() => {
        const address = [
            applicantDetails.village,
            applicantDetails.subDistrict,
            applicantDetails.homeDistrict,
            applicantDetails.permanentAddressState,
            applicantDetails.pinCode
        ].map((part) => String(part || '').trim()).filter(Boolean).join(', ');

        setApplicantDetails((previous) => previous.permanentAddress === address
            ? previous
            : { ...previous, permanentAddress: address });
    }, [
        applicantDetails.village,
        applicantDetails.subDistrict,
        applicantDetails.homeDistrict,
        applicantDetails.permanentAddressState,
        applicantDetails.pinCode
    ]);

    useEffect(() => {
        const state = String(applicantDetails.permanentAddressState || '').trim();
        const query = postOfficeQuery.trim();
        if (!state || query.length < 2) {
            setPostOfficeOptions([]);
            setPostOfficeLoading(false);
            return undefined;
        }

        let cancelled = false;
        const timer = window.setTimeout(() => {
            setPostOfficeLoading(true);
            API.get('/freeship-cards/post-offices', {
                headers: { Authorization: `Bearer ${token}` },
                params: { state, q: query }
            }).then((response) => {
                if (!cancelled) setPostOfficeOptions(response.data?.offices || []);
            }).catch(() => {
                if (!cancelled) setPostOfficeOptions([]);
            }).finally(() => {
                if (!cancelled) setPostOfficeLoading(false);
            });
        }, 250);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [applicantDetails.permanentAddressState, postOfficeQuery, token]);

    useEffect(() => {
        const state = applicantDetails.permanentAddressState;
        if (!state) {
            setEciHomeDistrictOptions([]);
            setEciHomeDistrictLoading(false);
            return undefined;
        }

        let cancelled = false;
        setEciHomeDistrictLoading(true);
        API.get('/villages/eci/districts', {
            headers: { Authorization: `Bearer ${token}` },
            params: { state }
        }).then((response) => {
            if (cancelled) return;
            const districts = response.data?.districts || [];
            setEciHomeDistrictOptions(districts);
            if (districts.some((district) => (
                String(district.name).trim().toLocaleLowerCase()
                === String(applicantDetails.homeDistrict || '').trim().toLocaleLowerCase()
            ))) {
                setHomeDistrictManual(false);
            }
        }).catch(() => {
            if (!cancelled) setEciHomeDistrictOptions([]);
        }).finally(() => {
            if (!cancelled) setEciHomeDistrictLoading(false);
        });

        return () => { cancelled = true; };
    }, [applicantDetails.permanentAddressState, applicantDetails.homeDistrict, token]);

    useEffect(() => {
        const state = applicantDetails.permanentAddressState;
        const district = applicantDetails.homeDistrict;
        if (!state || !district || homeDistrictManual) {
            setVillageAssemblies([]);
            setSelectedVillageAssembly('');
            setEciVillageOptions([]);
            return undefined;
        }

        let cancelled = false;
        setEciAssemblyLoading(true);
        setVillageAssemblies([]);
        setSelectedVillageAssembly('');
        setEciVillageOptions([]);
        setVillageManual(false);
        API.get('/villages/eci/assemblies', {
            headers: { Authorization: `Bearer ${token}` },
            params: { state, district }
        }).then((response) => {
            if (!cancelled) setVillageAssemblies(response.data?.assemblies || []);
        }).catch(() => {
            if (!cancelled) setVillageAssemblies([]);
        }).finally(() => {
            if (!cancelled) setEciAssemblyLoading(false);
        });

        return () => { cancelled = true; };
    }, [applicantDetails.permanentAddressState, applicantDetails.homeDistrict, homeDistrictManual, token]);

    useEffect(() => {
        const state = applicantDetails.permanentAddressState;
        if (!state || !selectedVillageAssembly) {
            setEciVillageOptions([]);
            return undefined;
        }

        let cancelled = false;
        setEciVillageLoading(true);
        setEciVillageOptions([]);
        API.get('/villages/eci/parts', {
            headers: { Authorization: `Bearer ${token}` },
            params: { state, assembly: selectedVillageAssembly }
        }).then((response) => {
            if (!cancelled) setEciVillageOptions(response.data?.parts || []);
        }).catch(() => {
            if (!cancelled) setEciVillageOptions([]);
        }).finally(() => {
            if (!cancelled) setEciVillageLoading(false);
        });

        return () => { cancelled = true; };
    }, [applicantDetails.permanentAddressState, selectedVillageAssembly, token]);

    const searchInstitutions = async (event, requestedPage = 1) => {
        event?.preventDefault();
        const query = institutionQuery.trim()
            || (institutionSearchMode === 'location' ? String(applicantDetails.institute || '').trim() : '');
        if (institutionSearchMode === 'code' && query.length < 2) {
            setInstitutionSearchMessage('Enter at least two characters of the institution code.');
            setInstitutionResults([]);
            setInstitutionTotal(0);
            return;
        }
        if (institutionSearchMode === 'location' && !institutionState) {
            setInstitutionSearchMessage('Select the state or UT where the institute is located first.');
            setInstitutionResults([]);
            setInstitutionTotal(0);
            return;
        }

        setInstitutionSearchLoading(true);
        setInstitutionSearchMessage('');
        try {
            const response = await API.get('/institutions/search', {
                params: {
                    q: query,
                    state: institutionSearchMode === 'location' ? institutionState : '',
                    district: institutionSearchMode === 'location' ? institutionDistrict : '',
                    page: requestedPage
                }
            });
            const results = response.data?.institutions || [];
            setInstitutionResults(results);
            const total = Number(response.data?.pagination?.total || 0);
            setInstitutionPage(Number(response.data?.pagination?.page || requestedPage));
            setInstitutionTotal(total);
            setInstitutionSearchMessage(total ? '' : 'No matching institutions found. Check your search or enter the institution name manually.');
        } catch (requestError) {
            setInstitutionResults([]);
            setInstitutionTotal(0);
            setInstitutionSearchMessage(requestError.response?.data?.message || 'Institution search is unavailable. You can enter the institution name manually.');
        } finally {
            setInstitutionSearchLoading(false);
        }
    };

    const selectInstitution = (institution) => {
        const locationChanged = institution.state !== institutionState
            || institution.district !== institutionDistrict;
        setApplicantDetails((previous) => ({
            ...previous,
            institute: institution.name,
            instituteState: institution.state || '',
            instituteDistrict: institution.district || '',
            ...(locationChanged ? { tehsil: '' } : {})
        }));
        setInstitutionState(institution.state || '');
        setInstitutionDistrict(institution.district || '');
        if (locationChanged) setTehsilManual(false);
        setInstitutionQuery(institution.name);
        setInstitutionSearchMessage(`Selected: ${institution.name}`);
        setInstitutionResults([]);
        setInstitutionTotal(0);
    };


    /* ============================================================
       FETCH APPLICATION
    ============================================================ */

    const fetchApplication =
        async ({ preserveCurrentStep = false } = {}) => {

            try {

                setLoading(true);
                setError('');

                const response =
                    await API.get(
                        `/applications/${id}`,
                        getAuthConfig()
                    );

                if (
                    response.data &&
                    response.data.success
                ) {

                    setApplication(
                        response.data.application
                    );

                    const loadedApplication = response.data.application;
                    const details = loadedApplication?.applicantDetails || {};
                    const loadedStatus = String(loadedApplication?.status || '')
                        .trim()
                        .toUpperCase();
                    const canUpdateDetails = [
                        'DRAFT',
                        'CORRECTION REQUIRED'
                    ].includes(loadedStatus);
                    if (!preserveCurrentStep) {
                        setApplicationStep(canUpdateDetails ? 'details' : 'documents');
                        if (canUpdateDetails) setDetailsPageIndex(0);
                    }

                    const loadedApplicantDetails = Object.fromEntries(
                            APPLICANT_DETAIL_FIELDS.map(({ name, type }) => {
                                const value = details[name];

                                return [
                                    name,
                                    value === null || value === undefined
                                        ? ''
                                        : type === 'checkbox'
                                            ? Boolean(value)
                                        : type === 'date'
                                            ? String(value).substring(0, 10)
                                            : String(value)
                                ];
                            })
                        );
                    loadedApplicantDetails.nameAsPerDomicileId = details.nameAsPerDomicileId || details.fullName || '';
                    loadedApplicantDetails.fullName = loadedApplicantDetails.nameAsPerDomicileId;
                    loadedApplicantDetails.applicationNumber = loadedApplication.applicationNumber || '';
                    loadedApplicantDetails.appliedScheme = loadedApplication.scholarship?.name || '';
                    loadedApplicantDetails.registrationDate = loadedApplication.createdAt ? String(loadedApplication.createdAt).substring(0, 10) : '';
                    loadedApplicantDetails.scholarshipCategory = getSchemeCategory(loadedApplication.scholarship);
                    if (loadedApplicantDetails.competitiveExamQualified === 'No') {
                        loadedApplicantDetails.competitiveExamConductedBy = '';
                        loadedApplicantDetails.competitiveExamRollNumber = '';
                        loadedApplicantDetails.competitiveExamYear = '';
                    }
                    loadedApplicantDetails.instituteState = details.instituteState || '';
                    loadedApplicantDetails.instituteDistrict = details.instituteDistrict || '';
                    setApplicantDetails(loadedApplicantDetails);
                    const savedHomeDistricts = IGOD_LOCATION_DATA.states?.[loadedApplicantDetails.permanentAddressState]?.districts || [];
                    const savedHomeDistrict = savedHomeDistricts.find((district) => district.name === loadedApplicantDetails.homeDistrict);
                    setHomeDistrictManual(Boolean(loadedApplicantDetails.homeDistrict && !savedHomeDistrict));
                    setSubDistrictManual(Boolean(
                        loadedApplicantDetails.subDistrict
                        && !savedHomeDistrict?.subdistricts?.includes(loadedApplicantDetails.subDistrict)
                    ));
                    setInstitutionState(details.instituteState || '');
                    setInstitutionDistrict(details.instituteDistrict || '');

                } else {

                    setError(
                        response.data?.message ||
                        'Unable to load application.'
                    );
                }

            } catch (requestError) {

                console.error(
                    'Fetch application error:',
                    requestError
                );

                if (
                    requestError.response?.status === 401
                ) {

                    authService.logout();

                    navigate(
                        '/login',
                        {
                            replace: true
                        }
                    );

                    return;
                }

                setError(
                    requestError.response?.data?.message ||
                    'Unable to load application.'
                );

            } finally {

                setLoading(false);

            }
        };


    /* ============================================================
       SAVE APPLICANT DETAILS
    ============================================================ */

    const handleApplicantDetailsChange = (event) => {
        const { name, value, checked, type } = event.target;

        if (name === 'permanentAddressState') {
            setHomeDistrictManual(false);
            setSubDistrictManual(false);
            setPostOfficeQuery('');
            setPostOfficeOptions([]);
            setApplicantDetails((previous) => ({
                ...previous,
                permanentAddressState: value,
                homeDistrict: '',
                subDistrict: '',
                village: ''
            }));
            return;
        }

        if (name === 'homeDistrict') {
            setSubDistrictManual(false);
            setApplicantDetails((previous) => ({
                ...previous,
                homeDistrict: value,
                subDistrict: '',
                village: ''
            }));
            return;
        }

        if (name === 'deNotifiedTribes') setTribeManual(false);

        setApplicantDetails((previous) => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value,
            ...(name === 'nameAsPerDomicileId' ? { fullName: value } : {}),
            ...(name === 'specialCategory' && value === 'No' ? { specialCategoryType: '' } : {}),
            ...(name === 'deNotifiedTribes' && value === 'No' && !['ST', 'SCHEDULED TRIBE', 'SCHEDULED TRIBES'].includes(String(applicantDetails.category || '').trim().toUpperCase()) ? { tribes: '' } : {}),
            ...(name === 'competitiveExamQualified' && value === 'No' ? {
                competitiveExamConductedBy: '',
                competitiveExamRollNumber: '',
                competitiveExamYear: ''
            } : {})
        }));
    };

    const isDntApplicant = applicantDetails.deNotifiedTribes === 'Yes'
        || String(applicantDetails.category || '').trim().toUpperCase() === 'DNT';
    const showTribesField = [
        'ST',
        'SCHEDULED TRIBE',
        'SCHEDULED TRIBES',
        'DNT'
    ].includes(String(applicantDetails.category || '').trim().toUpperCase())
        || applicantDetails.deNotifiedTribes === 'Yes';
    const showSpecialCategoryType = applicantDetails.specialCategory === 'Yes';
    const showCompetitiveExamDetails = applicantDetails.competitiveExamQualified === 'Yes';
    const missingRequiredApplicantFields = APPLICANT_DETAIL_FIELDS.filter(({ name, required }) => {
        const isConditionalExamField = ['competitiveExamConductedBy', 'competitiveExamRollNumber', 'competitiveExamYear'].includes(name)
            && showCompetitiveExamDetails;
        const isRequired = name === 'tribes'
            ? showTribesField
            : Boolean(required || isConditionalExamField);
        if (!isRequired) return false;
        const value = applicantDetails[name];
        if (value === undefined || value === null || String(value).trim() === '') return true;
        if (name === 'pinCode') return !/^\d{6}$/.test(String(value));
        return false;
    });
    const applicationDetailsComplete = missingRequiredApplicantFields.length === 0;
    const applicantState = String(
        applicantDetails.domicileState || applicantDetails.state || applicantDetails.permanentAddressState
            || application?.applicantDetails?.domicileState || application?.applicantDetails?.state || ''
    ).trim();
    const isScheduledTribeApplicant = ['ST', 'SCHEDULED TRIBE', 'SCHEDULED TRIBES'].includes(
        String(applicantDetails.category || '').trim().toUpperCase()
    );
    const scheduledTribeSuggestions = isScheduledTribeApplicant
        ? (SCHEDULED_TRIBES_BY_STATE[applicantState] || [])
        : [];
    const tribeSuggestions = isDntApplicant ? dntCommunitySuggestions : scheduledTribeSuggestions;
    const filteredTribeSuggestions = tribeSuggestions
        .filter((tribe) => String(tribe).toLocaleLowerCase().includes(
            String(applicantDetails.tribes || '').trim().toLocaleLowerCase()
        ))
        .slice(0, 30);
    const districtLocation = (IGOD_LOCATION_DATA.states?.[institutionState]?.districts || [])
        .find((district) => district.name.toLocaleLowerCase('en-IN') === institutionDistrict.toLocaleLowerCase('en-IN'));
    const tehsilSuggestions = districtLocation?.subdistricts || [];
    const administrativeDistrictOptions = IGOD_LOCATION_DATA.states?.[applicantDetails.permanentAddressState]?.districts || [];
    const homeDistrictOptions = [
        ...administrativeDistrictOptions,
        ...eciHomeDistrictOptions
            .filter((eciDistrict) => !administrativeDistrictOptions.some((district) => (
                String(district.name).trim().toLocaleLowerCase() === String(eciDistrict.name).trim().toLocaleLowerCase()
            )))
            .map((district) => ({ name: district.name, subdistricts: [] }))
    ];
    const selectedHomeDistrict = homeDistrictOptions.find((district) => (
        String(district.name).trim().toLocaleLowerCase() === String(applicantDetails.homeDistrict || '').trim().toLocaleLowerCase()
    ));
    const homeSubDistrictOptions = selectedHomeDistrict?.subdistricts || [];
    const isManualTehsil = tehsilManual || (
        Boolean(applicantDetails.tehsil)
        && tehsilSuggestions.length > 0
        && !tehsilSuggestions.includes(applicantDetails.tehsil)
    );
    const boardOptionsForField = (fieldName) => {
        const available = fieldName === 'previousBoard'
            ? [...SCHOOL_BOARD_OPTIONS, ...previousUniversitySuggestions]
            : SCHOOL_BOARD_OPTIONS;
        const query = String(applicantDetails[fieldName] || '').trim().toLocaleLowerCase();
        return [...new Set(available)]
            .filter((option) => !query || option.toLocaleLowerCase().includes(query))
            .slice(0, 60);
    };
    const currentDetailsGroup = APPLICANT_DETAIL_GROUPS[detailsPageIndex];
    const isApplicantFieldRequired = (field) => field.name === 'tribes'
        ? showTribesField
        : Boolean(field.required || (
            ['competitiveExamConductedBy', 'competitiveExamRollNumber', 'competitiveExamYear'].includes(field.name)
            && showCompetitiveExamDetails
        ));
    const visibleCurrentFields = (currentDetailsGroup?.fields || []).filter((field) => (
        (!['competitiveExamConductedBy', 'competitiveExamRollNumber', 'competitiveExamYear'].includes(field.name)
            || showCompetitiveExamDetails)
        && (field.name !== 'tribes' || showTribesField)
    ));
    const requiredCurrentFields = visibleCurrentFields.filter(isApplicantFieldRequired);
    const optionalCurrentFields = visibleCurrentFields.filter((field) => !isApplicantFieldRequired(field));
    const currentGroupFieldNames = new Set(currentDetailsGroup?.fields.map(({ name }) => name) || []);
    const missingCurrentPageFields = missingRequiredApplicantFields
        .filter(({ name }) => currentGroupFieldNames.has(name));
    const currentPageRequiredComplete = missingCurrentPageFields.length === 0;
    const orderedCurrentFields = [
        ...requiredCurrentFields,
        ...(currentPageRequiredComplete ? optionalCurrentFields : [])
    ];
    const isLastDetailsPage = detailsPageIndex === APPLICANT_DETAIL_GROUPS.length - 1;
    const canSaveAndAdvance = isLastDetailsPage
        ? applicationDetailsComplete
        : missingCurrentPageFields.length === 0;


    const saveApplicantDetails = async (continueToNext) => {
        setError('');
        setSuccessMessage('');

        const fieldsOnPage = currentDetailsGroup?.fields.map(({ name }) => name) || [];
        const income = fieldsOnPage.includes('familyIncome') ? applicantDetails.familyIncome : '';
        if (income && (!Number.isFinite(Number(income)) || Number(income) < 0)) {
            setError('Family income must be a valid non-negative number.');
            return;
        }

        const percentage = fieldsOnPage.includes('previousPercentage') ? applicantDetails.previousPercentage : '';
        if (
            percentage &&
            (!Number.isFinite(Number(percentage)) ||
                Number(percentage) < 0 ||
                Number(percentage) > 100)
        ) {
            setError('Previous percentage must be between 0 and 100.');
            return;
        }

        for (const field of ['class10Percentage', 'class12Percentage']) {
            if (!fieldsOnPage.includes(field)) continue;
            const value = applicantDetails[field];
            if (value !== '' && value !== null && value !== undefined
                && (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 100)) {
                setError(`${field === 'class10Percentage' ? '10th' : '12th'} class percentage must be between 0 and 100.`);
                return;
            }
        }

        const payload = { ...applicantDetails };
        ['familyIncome', 'previousPercentage', 'class10Percentage', 'class12Percentage'].forEach((field) => {
            if (payload[field] !== '' && payload[field] !== null && payload[field] !== undefined) {
                payload[field] = Number(payload[field]);
            }
        });

        try {
            setSavingApplicantDetails(true);

            const response = await API.put(
                `/applications/${id}`,
                payload,
                getAuthConfig()
            );

            if (response.data?.success) {
                setApplication((previous) => ({
                    ...previous,
                    applicantDetails:
                        response.data.application?.applicantDetails || payload
                }));
                if (!continueToNext) {
                    setSuccessMessage(`${currentDetailsGroup.title} saved as draft.`);
                } else if (isLastDetailsPage) {
                    setApplicationStep('documents');
                    setSuccessMessage('Scheme-specific details saved. Continue by uploading the required documents.');
                } else {
                    setDetailsPageIndex((index) => index + 1);
                    setSuccessMessage(`${currentDetailsGroup.title} saved. Continue with ${APPLICANT_DETAIL_GROUPS[detailsPageIndex + 1].title}.`);
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setError(
                    response.data?.message ||
                    'Unable to update application details.'
                );
            }
        } catch (requestError) {
            if (requestError.response?.status === 401) {
                authService.logout();
                navigate('/login', { replace: true });
                return;
            }

            setError(
                requestError.response?.data?.message ||
                'Unable to update application details.'
            );
        } finally {
            setSavingApplicantDetails(false);
        }
    };

    const handleSaveApplicantDetails = (event) => {
        event.preventDefault();
        const blockedFields = (isLastDetailsPage
            ? missingRequiredApplicantFields
            : missingCurrentPageFields)
            .map(({ name }) => APPLICANT_DETAIL_FIELDS.find((field) => field.name === name)?.label || name);
        if (blockedFields.length > 0) {
            setError(`Complete these required fields on ${currentDetailsGroup.title} to continue: ${blockedFields.join(', ')}.`);
            return;
        }
        if (!event.currentTarget.reportValidity()) {
            setError(`Check the highlighted values on ${currentDetailsGroup.title} before continuing.`);
            return;
        }
        return saveApplicantDetails(true);
    };

    const downloadApplicationPdf = async () => {
        const currentToken = authService.getToken();
        if (!currentToken) {
            authService.logout();
            navigate('/login', { replace: true });
            setError('Your session has expired. Sign in again to download the application PDF.');
            return false;
        }

        try {
            setDownloadingApplicationPdf(true);
            const response = await API.get(`/applications/${id}/pdf`, {
                headers: { Authorization: `Bearer ${currentToken}` },
                responseType: 'blob'
            });
            const objectUrl = URL.createObjectURL(response.data);
            const anchor = document.createElement('a');
            anchor.href = objectUrl;
            anchor.download = `${application?.applicationNumber || 'scholarship-application'}.pdf`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
            return true;
        } catch (requestError) {
            let responseMessage = '';
            const responseData = requestError.response?.data;
            if (responseData instanceof Blob) {
                try {
                    const errorBody = JSON.parse(await responseData.text());
                    responseMessage = [errorBody.message, errorBody.detail].filter(Boolean).join(' ');
                } catch {
                    responseMessage = '';
                }
            } else {
                responseMessage = responseData?.message || '';
            }

            if (requestError.response?.status === 401) {
                authService.logout();
                navigate('/login', { replace: true });
                setError(responseMessage || 'Your session has expired. Sign in again to download the application PDF.');
                return false;
            }

            setError(responseMessage || 'Unable to download the application PDF. Save the latest details and try again.');
            return false;
        } finally {
            setDownloadingApplicationPdf(false);
        }
    };


    /* ============================================================
       INITIAL LOAD
    ============================================================ */

    useEffect(() => {

        if (!token) {

            navigate(
                '/login',
                {
                    replace: true
                }
            );

            return;
        }

        fetchApplication();

    }, [id]);


    /* ============================================================
       NORMALIZED APPLICATION STATUS
    ============================================================ */

    const getNormalizedStatus =
        () => {

            if (!application) {
                return '';
            }

            return String(
                application.status || ''
            )
                .trim()
                .toUpperCase();
        };


    /* ============================================================
       STATUS
    ============================================================ */

    const applicationStatus =
        getNormalizedStatus();

    const canEditApplicantDetails = [
        'DRAFT',
        'CORRECTION REQUIRED'
    ].includes(applicationStatus);
    const isApplicationSubmitted = ![
        'DRAFT',
        'CORRECTION REQUIRED',
        'UNKNOWN'
    ].includes(applicationStatus);


    /* ============================================================
       STATUS HELPERS
    ============================================================ */

    const getStatusClass = () => {

        switch (
            applicationStatus
        ) {

            case 'VERIFIED':
            case 'SANCTIONED':
            case 'DISBURSED':

                return 'portal-status-success';


            case 'CORRECTION REQUIRED':

                return 'portal-status-danger';


            case 'REJECTED':

                return 'portal-status-danger';


            case 'UNDER VERIFICATION':
            case 'SUBMITTED':
            case 'RESUBMITTED':

                return 'portal-status-warning';


            case 'DRAFT':
            default:

                return 'portal-status-neutral';
        }
    };


    /* ============================================================
       UPLOAD ALLOWED
    ============================================================ */

    const isUploadAllowed =
        () => {

            return [
                'DRAFT',
                'CORRECTION REQUIRED'
            ].includes(
                applicationStatus
            );
        };


    /* ============================================================
       SUBMIT ALLOWED
    ============================================================ */

    const isSubmitAllowed =
        () => {

            return [
                'DRAFT',
                'CORRECTION REQUIRED'
            ].includes(
                applicationStatus
            );
        };


    /* ============================================================
       REQUIRED DOCUMENTS
    ============================================================ */

    const requiredDocuments =
        application &&
        application.scholarship &&
        Array.isArray(
            application.scholarship
                .requiredDocuments
        )
            ? application.scholarship
                .requiredDocuments
            : [];


    /* ============================================================
       GET UPLOADED DOCUMENT
    ============================================================ */

    const getUploadedDocument =
        (
            documentType
        ) => {

            if (
                !application ||
                !Array.isArray(
                    application.documents
                )
            ) {
                return null;
            }

            const normalizedRequiredType =
                String(
                    documentType || ''
                )
                    .trim()
                    .toLowerCase();

            return application.documents.find(
                (document) => {

                    const uploadedType =
                        String(
                            document.documentType ||
                            ''
                        )
                            .trim()
                            .toLowerCase();

                    return (
                        uploadedType ===
                        normalizedRequiredType
                    );
                }
            ) || null;
        };


    /* ============================================================
       ALL DOCUMENTS UPLOADED
    ============================================================ */

    const allDocumentsUploaded =
        requiredDocuments.length > 0 &&
        requiredDocuments.every(
            (documentType) =>
                Boolean(
                    getUploadedDocument(
                        documentType
                    )
                )
        );


    /* ============================================================
       HANDLE FILE SELECTION
    ============================================================ */

    const handleFileChange =
        (
            documentType,
            event
        ) => {

            const file =
                event.target.files?.[0];

            if (!file) {
                return;
            }

            setSelectedFiles(
                (previous) => ({
                    ...previous,
                    [documentType]:
                        file
                })
            );
        };


    /* ============================================================
       VIEW / OPEN DOCUMENT
    ============================================================ */

    const handleViewDocument =
        async (
            document
        ) => {

            if (!document?._id) {

                setError(
                    'Document information is unavailable.'
                );

                return;
            }


            /*
               Open the browser tab immediately.

               This prevents popup blockers from
               blocking the document viewer after
               the asynchronous API request.
            */

            const newWindow =
                window.open(
                    '',
                    '_blank'
                );


            try {

                setViewingDocument(
                    document._id
                );

                setError('');
                setSuccessMessage('');


                /*
                   IMPORTANT:

                   The backend no longer returns a
                   Cloudinary URL.

                   It now securely retrieves the
                   private Cloudinary document and
                   streams the actual PDF/image to us.

                   Therefore we request the endpoint
                   as a BLOB.
                */

                const response =
                    await API.get(
                        `/applications/${id}/documents/${document._id}`,
                        {
                            ...getAuthConfig(),

                            responseType:
                                'blob'
                        }
                    );


                /*
                   Axios gives us the document itself
                   as a Blob.

                   We still explicitly assign the
                   correct MIME type because this makes
                   browser rendering more reliable.
                */

                const contentType =
                    document.contentType ||
                    response.headers[
                        'content-type'
                    ] ||
                    'application/octet-stream';


                /*
                   Convert the received binary data
                   into a browser Blob with the correct
                   MIME type.
                */

                const documentBlob =
                    new Blob(
                        [
                            response.data
                        ],
                        {
                            type:
                                contentType
                        }
                    );


                /*
                   Create a temporary browser URL.

                   PDF:
                   Opens in browser PDF viewer.

                   JPG / PNG:
                   Opens as an image.
                */

                const documentUrl =
                    URL.createObjectURL(
                        documentBlob
                    );


                /*
                   Send the already-opened tab to
                   the temporary document URL.
                */

                if (
                    newWindow &&
                    !newWindow.closed
                ) {

                    newWindow.location.href =
                        documentUrl;

                } else {

                    /*
                       Fallback if the browser did
                       not allow the first tab.
                    */

                    const fallbackWindow =
                        window.open(
                            documentUrl,
                            '_blank'
                        );

                    if (
                        !fallbackWindow
                    ) {

                        setError(
                            'Your browser blocked the document window. Please allow pop-ups for this portal.'
                        );
                    }
                }


                /*
                   Release the temporary browser
                   object URL after enough time for
                   the document viewer to load.
                */

                setTimeout(
                    () => {

                        URL.revokeObjectURL(
                            documentUrl
                        );

                    },
                    5 * 60 * 1000
                );


            } catch (requestError) {

                console.error(
                    'View document error:',
                    requestError
                );


                if (
                    newWindow &&
                    !newWindow.closed
                ) {

                    newWindow.close();
                }


                /*
                   Axios errors are handled here.

                   Because the response is configured
                   as a Blob, error responses can also
                   arrive as Blob data.
                */

                if (
                    requestError.response?.status ===
                    401
                ) {

                    authService.logout();

                    navigate(
                        '/login',
                        {
                            replace: true
                        }
                    );

                    return;
                }


                if (
                    requestError.response?.status ===
                    403
                ) {

                    setError(
                        'You are not authorized to view this document.'
                    );

                    return;
                }


                if (
                    requestError.response?.status ===
                    404
                ) {

                    setError(
                        'The requested document could not be found.'
                    );

                    return;
                }


                if (
                    requestError.response?.status ===
                    410
                ) {

                    setError(
                        'This document belongs to an older storage system and is no longer available.'
                    );

                    return;
                }


                if (
                    requestError.response?.status ===
                    502
                ) {

                    setError(
                        'The secure document storage service could not retrieve this document.'
                    );

                    return;
                }


                /*
                   If the server returned a normal
                   JSON error instead of a document,
                   try to read its message.
                */

                let serverMessage = '';


                try {

                    const responseData =
                        requestError.response?.data;


                    if (
                        responseData instanceof Blob
                    ) {

                        const text =
                            await responseData.text();

                        if (text) {

                            const parsed =
                                JSON.parse(
                                    text
                                );

                            serverMessage =
                                parsed?.message ||
                                '';
                        }

                    } else if (
                        responseData?.message
                    ) {

                        serverMessage =
                            responseData.message;
                    }

                } catch (
                    parseError
                ) {

                    console.error(
                        'Document error response parsing error:',
                        parseError
                    );
                }


                setError(
                    serverMessage ||
                    requestError.message ||
                    'Unable to open document.'
                );

            } finally {

                setViewingDocument('');

            }
        };


    /* ============================================================
       UPLOAD DOCUMENT
    ============================================================ */

    const handleUpload =
        async (
            documentType
        ) => {

            const file =
                selectedFiles[
                    documentType
                ];

            if (!file) {

                setError(
                    `Please select ${documentType}.`
                );

                return;
            }


            /* ----------------------------------------------------
               FILE SIZE
            ---------------------------------------------------- */

            if (
                file.size >
                5 * 1024 * 1024
            ) {

                setError(
                    'File size must not exceed 5 MB.'
                );

                return;
            }


            /* ----------------------------------------------------
               FILE TYPE
            ---------------------------------------------------- */

            const allowedTypes = [
                'application/pdf',
                'image/jpeg',
                'image/png'
            ];

            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                setError(
                    'Only PDF, JPG and PNG files are allowed.'
                );

                return;
            }


            try {

                setUploadingDocument(
                    documentType
                );

                setError('');
                setSuccessMessage('');


                const formData =
                    new FormData();

                formData.append(
                    'document',
                    file
                );

                formData.append(
                    'documentType',
                    documentType
                );


                const response =
                    await API.post(
                        `/applications/${id}/documents`,
                        formData,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                if (
                    response.data &&
                    response.data.success
                ) {

                    setSuccessMessage(
                        `${documentType} uploaded successfully.`
                    );


                    setSelectedFiles(
                        (previous) => {

                            const updated = {
                                ...previous
                            };

                            delete updated[
                                documentType
                            ];

                            return updated;
                        }
                    );


                    await fetchApplication({ preserveCurrentStep: true });

                } else {

                    setError(
                        response.data?.message ||
                        'Unable to upload document.'
                    );
                }

            } catch (requestError) {

                console.error(
                    'Document upload failed:',
                    requestError.response?.data ||
                    requestError.message
                );


                if (
                    requestError.response?.status === 401
                ) {

                    authService.logout();

                    navigate(
                        '/login',
                        {
                            replace: true
                        }
                    );

                    return;
                }


                setError(
                    requestError.response?.data?.message ||
                    'Unable to upload document.'
                );

            } finally {

                setUploadingDocument('');

            }
        };


    /* ============================================================
       SUBMIT APPLICATION
    ============================================================ */

    const handleSubmitApplication =
        async () => {

            if (!application) {
                return;
            }


            if (!isSubmitAllowed()) {

                setError(
                    'This application cannot be submitted in its current status.'
                );

                return;
            }


            if (!allDocumentsUploaded) {

                setError(
                    'Please upload all required documents before submitting the application.'
                );

                return;
            }

            if (!undertakingAccepted) {
                setError('Please read and accept the student undertaking before submitting.');
                return;
            }


            try {

                setSubmittingApplication(
                    true
                );

                setError('');
                setSuccessMessage('');


                const response =
                    await API.post(
                        `/applications/${id}/submit`,
                        { undertakingAccepted: true },
                        getAuthConfig()
                    );


                if (
                    response.data &&
                    response.data.success
                ) {

                    setApplication(
                        response.data.application
                    );
                    setApplicationStep('submitted');
                    setSuccessMessage('Application submitted successfully. Preparing your application form download…');
                    const downloaded = await downloadApplicationPdf();
                    setSuccessMessage(downloaded
                        ? 'Application submitted successfully. Your application form has been downloaded.'
                        : 'Application submitted successfully. Use the Download Application PDF button to try again.');

                } else {

                    setError(
                        response.data?.message ||
                        'Unable to submit application.'
                    );
                }

            } catch (requestError) {

                console.error(
                    'Submit application error:',
                    requestError
                );


                if (
                    requestError.response?.status === 401
                ) {

                    authService.logout();

                    navigate(
                        '/login',
                        {
                            replace: true
                        }
                    );

                    return;
                }


                setError(
                    requestError.response?.data?.message ||
                    'Unable to submit application.'
                );

            } finally {

                setSubmittingApplication(
                    false
                );

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
                        textAlign: 'center',
                        color: '#64748b'
                    }}
                >

                    <Loader2
                        size={34}
                        style={{
                            animation:
                                'spin 1s linear infinite',
                            margin: '0 auto 12px'
                        }}
                    />

                    <div>
                        Loading application...
                    </div>

                </div>

            </div>
        );
    }


    /* ============================================================
       ERROR
    ============================================================ */

    if (error && !application) {

        return (
            <div
                style={{
                    minHeight: '100vh',
                    background: '#f5f7fb',
                    padding: '40px 20px'
                }}
            >

                <div
                    className="portal-container"
                >

                    <div
                        className="portal-card"
                        style={{
                            maxWidth: '700px',
                            margin: '0 auto',
                            padding: '30px'
                        }}
                    >

                        <div
                            style={{
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'flex-start',
                                marginBottom: '20px'
                            }}
                        >

                            <AlertCircle
                                color="#b42318"
                                size={24}
                            />

                            <div>

                                <h2
                                    className="portal-heading"
                                    style={{
                                        fontSize: '22px',
                                        marginBottom: '6px'
                                    }}
                                >
                                    Unable to Load Application
                                </h2>

                                <p
                                    className="portal-text"
                                    style={{
                                        margin: 0
                                    }}
                                >
                                    {error}
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            className="portal-button portal-button-secondary"
                            onClick={() =>
                                navigate(
                                    '/student/applications'
                                )
                            }
                        >
                            <ArrowLeft
                                size={16}
                                style={{
                                    marginRight: '7px',
                                    verticalAlign: 'middle'
                                }}
                            />

                            Back to Applications

                        </button>

                    </div>

                </div>

            </div>
        );
    }


    /* ============================================================
       MAIN UI
    ============================================================ */

    return (

        <div
            style={{
                minHeight: '100vh',
                background: '#f5f7fb',
                paddingBottom: '60px'
            }}
        >

            {/* ====================================================
                HEADER
            ==================================================== */}

            <header
                style={{
                    background: '#ffffff',
                    borderBottom:
                        '1px solid #e2e8f0',
                    position: 'sticky',
                    top: 0,
                    zIndex: 20
                }}
            >

                <div
                    className="portal-container"
                    style={{
                        minHeight: '76px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                            'space-between',
                        gap: '20px'
                    }}
                >

                    <div>

                        <div
                            style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#174a8b',
                                letterSpacing:
                                    '0.08em',
                                textTransform:
                                    'uppercase',
                                marginBottom: '3px'
                            }}
                        >
                            University Scholarship Portal
                        </div>

                        <h1
                            className="portal-heading"
                            style={{
                                fontSize: '24px'
                            }}
                        >
                            {canEditApplicantDetails && applicationStep === 'details'
                                ? 'Application Details'
                                : 'Application Documents'}
                        </h1>

                    </div>


                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {application && isApplicationSubmitted && (
                            <button
                                type="button"
                                className="portal-button portal-button-secondary"
                                onClick={downloadApplicationPdf}
                                disabled={downloadingApplicationPdf}
                            >
                                <Download size={16} style={{ marginRight: 7, verticalAlign: 'middle' }} />
                                {downloadingApplicationPdf ? 'Preparing PDF...' : 'Download Application PDF'}
                            </button>
                        )}
                        <button
                            type="button"
                            className="portal-button portal-button-secondary"
                            onClick={() => navigate('/student/applications')}
                        >
                            <ArrowLeft size={16} style={{ marginRight: '7px', verticalAlign: 'middle' }} />
                            Back
                        </button>
                    </div>

                </div>

            </header>


            {/* ====================================================
                CONTENT
            ==================================================== */}

            <main
                className="portal-container"
                style={{
                    paddingTop: '32px'
                }}
            >

                {/* =================================================
                    APPLICATION INFORMATION
                ================================================== */}

                <div
                    className="portal-card"
                    style={{
                        padding: '24px',
                        marginBottom: '22px'
                    }}
                >

                    <div
                        style={{
                            display: 'flex',
                            justifyContent:
                                'space-between',
                            alignItems:
                                'flex-start',
                            gap: '20px',
                            flexWrap: 'wrap'
                        }}
                    >

                        <div>

                            <div
                                style={{
                                    color: '#64748b',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    marginBottom:
                                        '5px'
                                }}
                            >
                                Scholarship
                            </div>

                            <h2
                                className="portal-heading"
                                style={{
                                    fontSize: '24px',
                                    marginBottom:
                                        '8px'
                                }}
                            >
                                {
                                    application
                                        ?.scholarship
                                        ?.name ||
                                    'Scholarship Application'
                                }
                            </h2>


                            {application?.applicationNumber && (
                                <div
                                    style={{
                                        color:
                                            '#64748b',
                                        fontSize:
                                            '14px'
                                    }}
                                >
                                    Application Number:{' '}
                                    <strong
                                        style={{
                                            color:
                                                '#172033'
                                        }}
                                    >
                                        {
                                            application
                                                .applicationNumber
                                        }
                                    </strong>
                                </div>
                            )}

                        </div>


                        <div
                            style={{
                                textAlign:
                                    'right'
                            }}
                        >

                            <div
                                style={{
                                    color:
                                        '#64748b',
                                    fontSize:
                                        '12px',
                                    marginBottom:
                                        '6px'
                                }}
                            >
                                Application Status
                            </div>

                            <span
                                className={`portal-status ${getStatusClass()}`}
                                style={{
                                    fontSize:
                                        '13px'
                                }}
                            >
                                {applicationStatus ||
                                    'UNKNOWN'}
                            </span>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    ERROR MESSAGE
                ================================================== */}

                {error && (
                    <div
                        style={{
                            marginBottom: '18px',
                            padding:
                                '14px 16px',
                            borderRadius:
                                '8px',
                            background:
                                '#fee2e2',
                            color:
                                '#991b1b',
                            border:
                                '1px solid #fecaca',
                            display: 'flex',
                            alignItems:
                                'flex-start',
                            gap: '10px',
                            fontSize:
                                '14px',
                            fontWeight:
                                600
                        }}
                    >

                        <AlertCircle
                            size={19}
                            style={{
                                flexShrink: 0
                            }}
                        />

                        <span>
                            {error}
                        </span>

                    </div>
                )}


                {/* =================================================
                    SUCCESS MESSAGE
                ================================================== */}

                {successMessage && (
                    <div
                        style={{
                            marginBottom: '18px',
                            padding:
                                '14px 16px',
                            borderRadius:
                                '8px',
                            background:
                                '#dcfce7',
                            color:
                                '#166534',
                            border:
                                '1px solid #bbf7d0',
                            display: 'flex',
                            alignItems:
                                'flex-start',
                            gap: '10px',
                            fontSize:
                                '14px',
                            fontWeight:
                                600
                        }}
                    >

                        <CheckCircle2
                            size={19}
                            style={{
                                flexShrink: 0
                            }}
                        />

                        <span>
                            {successMessage}
                        </span>

                    </div>
                )}


                {/* =================================================
                    APPLICATION STEPS
                ================================================== */}

                {application && (
                    <div
                        className="portal-card"
                        style={{
                            padding: '17px 20px',
                            marginBottom: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '14px',
                            flexWrap: 'wrap'
                        }}
                    >
                        <div>
                            <div style={{ color: '#174a8b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {isApplicationSubmitted
                                    ? 'Step 6 of 6'
                                    : applicationStep === 'details'
                                        ? `Step ${detailsPageIndex + 1} of 6`
                                        : applicationStep === 'documents'
                                            ? 'Step 5 of 6'
                                            : 'Step 6 of 6'}
                            </div>
                            <strong style={{ display: 'block', marginTop: '4px', color: '#172033' }}>
                                {isApplicationSubmitted
                                    ? 'Submitted · Application form ready'
                                    : applicationStep === 'details' ? currentDetailsGroup?.title
                                        : applicationStep === 'documents' ? 'Required Documents' : 'Submit Details'}
                            </strong>
                            <span style={{ display: 'block', marginTop: '3px', color: '#64748b', fontSize: '13px' }}>
                                {isApplicationSubmitted
                                    ? 'Your application has been submitted. Download the PDF copy for your records.'
                                    : applicationStep === 'details'
                                    ? 'Save this page as a draft or save and continue to the next page.'
                                    : applicationStep === 'documents'
                                        ? 'Application details are complete. Upload each required document, then continue to Step 6.'
                                        : 'Review the declaration and confirm your details and documents before submitting.'}
                            </span>
                        </div>
                        {canEditApplicantDetails && ['documents', 'review'].includes(applicationStep) && (
                            <button
                                type="button"
                                className="portal-button portal-button-secondary"
                                onClick={() => {
                                    setSuccessMessage('');
                                    setDetailsPageIndex(0);
                                    setApplicationStep('details');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            >
                                <ArrowLeft size={16} style={{ marginRight: '7px', verticalAlign: 'middle' }} />
                                Edit Application Details
                            </button>
                        )}
                    </div>
                )}

                {/* =================================================
                    EDIT APPLICATION DETAILS
                ================================================== */}

                {canEditApplicantDetails && applicationStep === 'details' && (
                    <form
                        className="portal-card"
                        onSubmit={handleSaveApplicantDetails}
                        noValidate
                        style={{
                            padding: '24px',
                            marginBottom: '22px'
                        }}
                    >
                        <h2
                            className="portal-heading"
                            style={{ fontSize: '21px', marginBottom: '6px' }}
                        >
                            {currentDetailsGroup?.title || 'Applicant Details'}
                        </h2>
                        <p
                            className="portal-text"
                            style={{ marginTop: 0, marginBottom: '20px' }}
                        >
                            Review the details carried over from your approved Freeship Card. Save this page as a draft to continue later, or save and continue to the next page.
                        </p>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                gap: '16px'
                            }}
                        >
                            {currentDetailsGroup && (
                                <React.Fragment>
                                    {orderedCurrentFields.map((field, index) => (
                                        <React.Fragment key={field.name}>
                                        {index === 0 && (
                                            <h3 className="portal-label" style={{ gridColumn: '1 / -1', margin: '0', paddingBottom: 8, borderBottom: '1px solid #dbe4ef' }}>
                                                {requiredCurrentFields.length ? 'Required fields' : 'Additional details (optional)'}
                                            </h3>
                                        )}
                                        {index === requiredCurrentFields.length && requiredCurrentFields.length > 0 && optionalCurrentFields.length > 0 && (
                                            <h3 className="portal-label" style={{ gridColumn: '1 / -1', margin: '10px 0 0', paddingBottom: 8, borderBottom: '1px solid #dbe4ef' }}>
                                                Additional details (optional)
                                            </h3>
                                        )}
                                        <div
                                            className="form-group"
                                            style={field.wide || field.type === 'textarea'
                                                ? { gridColumn: '1 / -1' }
                                                : undefined}
                                        >
                                            <label
                                                className="portal-label"
                                                htmlFor={`applicant-${field.name}`}
                                            >
                                                {field.name === 'tribes' && isDntApplicant ? 'DNT Community' : field.label}{isApplicantFieldRequired(field) && <span aria-hidden="true"> *</span>}
                                            </label>
                                            {field.name === 'domicileStateIdentificationNumber' ? (
                                                <>
                                                    <input
                                                        id={`applicant-${field.name}`}
                                                        name={field.name}
                                                        className="portal-input"
                                                        type="text"
                                                        value={applicantDetails[field.name] || ''}
                                                        onChange={handleApplicantDetailsChange}
                                                        placeholder={applicantState ? `Enter ${applicantState} certificate number` : 'Select domicile state first'}
                                                        disabled={!applicantState}
                                                        maxLength={100}
                                                        autoComplete="off"
                                                    />
                                                    <small style={{ display: 'block', marginTop: 6, color: '#64748b', lineHeight: 1.45 }}>
                                                        {applicantState
                                                            ? `Enter the number printed on the student's ${applicantState} domicile or residence certificate. Number formats vary by state; copy it exactly from the document.`
                                                            : 'Select the student’s domicile state first to see the relevant certificate guidance.'}
                                                    </small>
                                                </>
                                            ) : field.name === 'pinCode' ? (
                                                <>
                                                    <input
                                                        id="applicant-post-office-search"
                                                        className="portal-input"
                                                        value={postOfficeQuery}
                                                        onChange={(event) => setPostOfficeQuery(event.target.value)}
                                                        placeholder={applicantDetails.permanentAddressState ? 'Search post office by name or PIN' : 'Select permanent address state first'}
                                                        disabled={!applicantDetails.permanentAddressState}
                                                        autoComplete="off"
                                                    />
                                                    {postOfficeLoading && <small role="status" style={{ display: 'block', marginTop: 5, color: '#64748b' }}>Searching post offices…</small>}
                                                    {postOfficeOptions.length > 0 && (
                                                        <div role="listbox" aria-label="Post office suggestions" style={{ marginTop: 6, maxHeight: 220, overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: 7 }}>
                                                            {postOfficeOptions.map((office) => (
                                                                <button
                                                                    key={`${office.name}-${office.pinCode}-${office.officeType}`}
                                                                    type="button"
                                                                    role="option"
                                                                    aria-selected="false"
                                                                    onClick={() => {
                                                                        setApplicantDetails((previous) => ({ ...previous, pinCode: office.pinCode }));
                                                                        setPostOfficeQuery('');
                                                                        setPostOfficeOptions([]);
                                                                    }}
                                                                    style={{ display: 'flex', justifyContent: 'space-between', gap: 12, width: '100%', padding: '9px 11px', border: 0, borderBottom: '1px solid #e2e8f0', background: '#fff', textAlign: 'left', cursor: 'pointer' }}
                                                                >
                                                                    <span>{office.name}</span>
                                                                    <span style={{ whiteSpace: 'nowrap', color: '#475569' }}>{office.pinCode} · {office.officeType}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <small style={{ display: 'block', marginTop: 5, color: '#64748b', lineHeight: 1.4 }}>
                                                        Choose a post office to fill the PIN Code, or enter the PIN manually below.
                                                    </small>
                                                    <input
                                                        id={`applicant-${field.name}`}
                                                        name={field.name}
                                                        className="portal-input"
                                                        style={{ marginTop: 8 }}
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]{6}"
                                                        maxLength={6}
                                                        value={applicantDetails[field.name] || ''}
                                                        onChange={(event) => setApplicantDetails((previous) => ({ ...previous, pinCode: event.target.value.replace(/\D/g, '').slice(0, 6) }))}
                                                        required={field.required}
                                                        placeholder="6-digit PIN Code"
                                                    />
                                                </>
                                            ) : field.name === 'tribes' ? (
                                                <>
                                                    {isDntApplicant ? (
                                                        <>
                                                            <select
                                                                id={`applicant-${field.name}`}
                                                                name={field.name}
                                                                className="portal-input"
                                                                value={tribeManual ? '__other__' : applicantDetails[field.name] || ''}
                                                                onChange={(event) => {
                                                                    if (event.target.value === '__other__') {
                                                                        setTribeManual(true);
                                                                        setApplicantDetails((previous) => ({ ...previous, tribes: '' }));
                                                                    } else {
                                                                        setTribeManual(false);
                                                                        handleApplicantDetailsChange(event);
                                                                    }
                                                                }}
                                                                disabled={!applicantState || dntCommunityLoading}
                                                                required={showTribesField && !tribeManual}
                                                            >
                                                                <option value="">{dntCommunityLoading ? 'Loading DNT community list…' : applicantState ? 'Select a DNT community' : 'Select domicile state first'}</option>
                                                                {applicantDetails.tribes && !dntCommunitySuggestions.includes(applicantDetails.tribes) && !tribeManual && (
                                                                    <option value={applicantDetails.tribes}>Previously entered: {applicantDetails.tribes}</option>
                                                                )}
                                                                {dntCommunitySuggestions.map((community) => <option key={community} value={community}>{community}</option>)}
                                                                <option value="__other__">My community is not listed</option>
                                                            </select>
                                                            {dntCommunityLoading && <div role="status" style={{ marginTop: 6, color: '#64748b', fontSize: 13 }}>Loading the Government DNT community list…</div>}
                                                            {tribeManual && (
                                                                <input
                                                                    className="portal-input"
                                                                    style={{ marginTop: 8 }}
                                                                    name={field.name}
                                                                    value={applicantDetails.tribes || ''}
                                                                    onChange={handleApplicantDetailsChange}
                                                                    placeholder="Enter community name as shown on the certificate"
                                                                    required={showTribesField}
                                                                    maxLength={500}
                                                                />
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div style={{ position: 'relative' }}>
                                                            <input
                                                                id={`applicant-${field.name}`}
                                                                name={field.name}
                                                                className="portal-input"
                                                                type="text"
                                                                autoComplete="off"
                                                                value={applicantDetails[field.name] || ''}
                                                                onFocus={() => setTribeSuggestionsOpen(true)}
                                                                onBlur={() => window.setTimeout(() => setTribeSuggestionsOpen(false), 150)}
                                                                onChange={(event) => {
                                                                    handleApplicantDetailsChange(event);
                                                                    setTribeSuggestionsOpen(true);
                                                                }}
                                                                placeholder={tribeSuggestions.length ? `Search ${applicantState} ST communities or enter certificate wording` : 'Enter the community name as shown on the certificate'}
                                                                required={showTribesField}
                                                                maxLength={500}
                                                                aria-autocomplete="list"
                                                                aria-expanded={tribeSuggestionsOpen && tribeSuggestions.length > 0}
                                                            />
                                                            {tribeSuggestionsOpen && tribeSuggestions.length > 0 && (
                                                                <div role="listbox" aria-label={`${applicantState} Scheduled Tribe suggestions`} style={{ position: 'absolute', zIndex: 20, top: '100%', left: 0, right: 0, maxHeight: 240, overflowY: 'auto', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)' }}>
                                                                    {filteredTribeSuggestions.length ? filteredTribeSuggestions.map((tribe) => (
                                                                        <button
                                                                            key={tribe}
                                                                            type="button"
                                                                            role="option"
                                                                            aria-selected="false"
                                                                            onMouseDown={(event) => event.preventDefault()}
                                                                            onClick={() => {
                                                                                setApplicantDetails((previous) => ({ ...previous, tribes: tribe }));
                                                                                setTribeSuggestionsOpen(false);
                                                                            }}
                                                                            style={{ display: 'block', width: '100%', padding: '9px 12px', border: 0, borderBottom: '1px solid #f1f5f9', background: '#fff', textAlign: 'left', color: '#0f172a', cursor: 'pointer' }}
                                                                        >
                                                                            {tribe}
                                                                        </button>
                                                                    )) : (
                                                                        <div style={{ padding: '10px 12px', color: '#64748b', fontSize: 13 }}>No matches. You can still enter the wording from the certificate.</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {isDntApplicant && !applicantState && (
                                                        <div role="status" style={{ marginTop: 7, color: '#64748b', fontSize: 13 }}>Select the applicant’s domicile state to load its DNT community list.</div>
                                                    )}
                                                    {isDntApplicant && applicantState && !dntCommunityLoading && dntCommunitySuggestions.length === 0 && (
                                                        <div role="status" style={{ marginTop: 7, padding: '9px 11px', borderRadius: 7, background: '#f1f5f9', color: '#475569', fontSize: 13, lineHeight: 1.45 }}>
                                                            No DNT community options are available for {applicantState} in the Government list. Enter the community name as shown on the certificate.
                                                        </div>
                                                    )}
                                                    {!isDntApplicant && isScheduledTribeApplicant && applicantState && tribeSuggestions.length === 0 && (
                                                        <div role="status" style={{ marginTop: 7, padding: '9px 11px', borderRadius: 7, background: '#f1f5f9', color: '#475569', fontSize: 13, lineHeight: 1.45 }}>
                                                            No Scheduled Tribe communities are listed for {applicantState} in the Government of India state/UT list used here. If the student’s certificate identifies a community, enter its exact wording above.
                                                        </div>
                                                    )}
                                                    {!isDntApplicant && isScheduledTribeApplicant && !applicantState && (
                                                        <div role="status" style={{ marginTop: 7, color: '#64748b', fontSize: 13 }}>
                                                            Select or confirm the student’s state to check its Scheduled Tribe list.
                                                        </div>
                                                    )}
                                                    <small style={{ display: 'block', marginTop: 5, color: '#64748b', lineHeight: 1.4 }}>
                                                        {isDntApplicant
                                                            ? 'DNT suggestions use the state-wise community list on the Government of India DWBDNC portal. You can still enter the wording from the applicant’s certificate.'
                                                            : 'Suggestions use the official state/UT Scheduled Tribe list. You can still enter the wording from the applicant’s certificate.'}
                                                    </small>
                                                </>
                                            ) : field.name === 'homeDistrict' ? (
                                                <>
                                                    <select
                                                        id={`applicant-${field.name}`}
                                                        name={field.name}
                                                        className="portal-input"
                                                        value={homeDistrictManual ? '__other__' : applicantDetails.homeDistrict || ''}
                                                        onChange={(event) => {
                                                            if (event.target.value === '__other__') {
                                                                setHomeDistrictManual(true);
                                                                setSubDistrictManual(false);
                                                                setApplicantDetails((previous) => ({ ...previous, homeDistrict: '', subDistrict: '', village: '' }));
                                                            } else {
                                                                setHomeDistrictManual(false);
                                                                handleApplicantDetailsChange(event);
                                                            }
                                                        }}
                                                        disabled={!applicantDetails.permanentAddressState}
                                                        required={field.required}
                                                    >
                                                        <option value="">{!applicantDetails.permanentAddressState ? 'Select a state first' : eciHomeDistrictLoading ? 'Loading district lists…' : 'Select home district'}</option>
                                                        {homeDistrictOptions.map((district) => <option key={district.name} value={district.name}>{district.name}</option>)}
                                                        <option value="__other__">My district is not listed</option>
                                                    </select>
                                                    <small style={{ display: 'block', marginTop: 6, color: '#64748b', lineHeight: 1.45 }}>
                                                        District choices combine the administrative directory with districts returned by ECI for the selected state.
                                                    </small>
                                                    {homeDistrictManual && (
                                                        <input
                                                            className="portal-input"
                                                            style={{ marginTop: 8 }}
                                                            name={field.name}
                                                            value={applicantDetails.homeDistrict || ''}
                                                            onChange={handleApplicantDetailsChange}
                                                            placeholder="Enter home district"
                                                            required={field.required}
                                                            maxLength={120}
                                                        />
                                                    )}
                                                </>
                                            ) : field.name === 'subDistrict' ? (
                                                <>
                                                    <select
                                                        id={`applicant-${field.name}`}
                                                        name={field.name}
                                                        className="portal-input"
                                                        value={subDistrictManual ? '__other__' : applicantDetails.subDistrict || ''}
                                                        onChange={(event) => {
                                                            if (event.target.value === '__other__') {
                                                                setSubDistrictManual(true);
                                                                setApplicantDetails((previous) => ({ ...previous, subDistrict: '', village: '' }));
                                                            } else {
                                                                setSubDistrictManual(false);
                                                                setApplicantDetails((previous) => ({ ...previous, subDistrict: event.target.value, village: '' }));
                                                            }
                                                        }}
                                                        disabled={!applicantDetails.homeDistrict || homeDistrictManual}
                                                        required={field.required}
                                                    >
                                                        <option value="">{applicantDetails.homeDistrict ? 'Select sub district' : 'Select a home district first'}</option>
                                                        {homeSubDistrictOptions.map((subDistrict) => <option key={subDistrict} value={subDistrict}>{subDistrict}</option>)}
                                                        <option value="__other__">My sub district is not listed</option>
                                                    </select>
                                                    {applicantDetails.homeDistrict && homeSubDistrictOptions.length === 0 && !homeDistrictManual && (
                                                        <small role="status" style={{ display: 'block', marginTop: 6, color: '#64748b', lineHeight: 1.45 }}>
                                                            No sub-district entries are available for this district in the administrative directory. Choose “My sub district is not listed” to enter it.
                                                        </small>
                                                    )}
                                                    {subDistrictManual && (
                                                        <input
                                                            className="portal-input"
                                                            style={{ marginTop: 8 }}
                                                            name={field.name}
                                                            value={applicantDetails.subDistrict || ''}
                                                            onChange={handleApplicantDetailsChange}
                                                            placeholder="Enter sub district"
                                                            required={field.required}
                                                            maxLength={120}
                                                        />
                                                    )}
                                                </>
                                            ) : field.name === 'village' ? (
                                                <>
                                                    <select
                                                        id="applicant-village-assembly"
                                                        className="portal-input"
                                                        value={selectedVillageAssembly}
                                                        onChange={(event) => {
                                                            setSelectedVillageAssembly(event.target.value);
                                                            setEciVillageOptions([]);
                                                            setVillageManual(false);
                                                        }}
                                                        disabled={!applicantDetails.homeDistrict || homeDistrictManual || eciAssemblyLoading || villageAssemblies.length === 0}
                                                        aria-label="Assembly Constituency for ECI village and town list"
                                                    >
                                                        <option value="">
                                                            {eciAssemblyLoading ? 'Loading ECI constituencies…' : applicantDetails.homeDistrict ? 'Select assembly constituency for ECI list' : 'Select home district first'}
                                                        </option>
                                                        {villageAssemblies.map((assembly) => <option key={assembly.number} value={assembly.number}>{assembly.name}</option>)}
                                                    </select>
                                                    <select
                                                        id={`applicant-${field.name}`}
                                                        name={field.name}
                                                        className="portal-input"
                                                        style={{ marginTop: 8 }}
                                                        value={villageManual ? '__other__' : applicantDetails[field.name] || ''}
                                                        onChange={(event) => {
                                                            if (event.target.value === '__other__') {
                                                                setVillageManual(true);
                                                                setApplicantDetails((previous) => ({ ...previous, village: '' }));
                                                            } else {
                                                                setVillageManual(false);
                                                                handleApplicantDetailsChange(event);
                                                            }
                                                        }}
                                                        disabled={(!selectedVillageAssembly && villageAssemblies.length > 0) || eciVillageLoading}
                                                        required={field.required && !villageManual}
                                                    >
                                                        <option value="">{eciVillageLoading ? 'Loading ECI village/town list…' : selectedVillageAssembly ? 'Select village / town from ECI list' : 'Select an assembly constituency first'}</option>
                                                        {applicantDetails.village && !eciVillageOptions.some((part) => (
                                                            applicantDetails.village === `${part.number} - ${part.name}`
                                                            || applicantDetails.village === `AC ${selectedVillageAssembly} / Part ${part.number} - ${part.name}`
                                                        )) && !villageManual && (
                                                            <option value={applicantDetails.village}>Previously entered: {applicantDetails.village}</option>
                                                        )}
                                                        {eciVillageOptions.map((part) => {
                                                            const villageWithPartNumber = `AC ${selectedVillageAssembly} / Part ${part.number} - ${part.name}`;
                                                            return <option key={part.number} value={villageWithPartNumber}>{villageWithPartNumber}</option>;
                                                        })}
                                                        <option value="__other__">My village / town is not listed</option>
                                                    </select>
                                                    {villageManual && (
                                                        <input
                                                            className="portal-input"
                                                            style={{ marginTop: 8 }}
                                                            name={field.name}
                                                            value={applicantDetails.village || ''}
                                                            onChange={handleApplicantDetailsChange}
                                                            placeholder="Enter village or town"
                                                            required={field.required}
                                                            maxLength={120}
                                                        />
                                                    )}
                                                    <small style={{ display: 'block', marginTop: 5, color: '#64748b', lineHeight: 1.4 }}>
                                                        Choose the ECI Assembly Constituency to load its electoral polling-part names as village / town choices. You can enter a place manually if it is not listed.
                                                    </small>
                                                </>
                                            ) : field.name === 'tehsil' ? (
                                                <>
                                                    {tehsilSuggestions.length > 0 ? (
                                                        <>
                                                            <select
                                                                id={`applicant-${field.name}`}
                                                                name={field.name}
                                                                className="portal-input"
                                                                value={isManualTehsil ? '__other__' : applicantDetails[field.name] || ''}
                                                                onChange={(event) => {
                                                                    if (event.target.value === '__other__') {
                                                                        setTehsilManual(true);
                                                                        setApplicantDetails((previous) => ({ ...previous, tehsil: '' }));
                                                                    } else {
                                                                        setTehsilManual(false);
                                                                        handleApplicantDetailsChange(event);
                                                                    }
                                                                }}
                                                                required={!isManualTehsil}
                                                            >
                                                                <option value="">Select tehsil / sub-district</option>
                                                                {tehsilSuggestions.map((tehsil) => <option key={tehsil} value={tehsil}>{tehsil}</option>)}
                                                                <option value="__other__">My tehsil is not listed</option>
                                                            </select>
                                                            {isManualTehsil && (
                                                                <input
                                                                    className="portal-input"
                                                                    style={{ marginTop: 8 }}
                                                                    name={field.name}
                                                                    value={applicantDetails[field.name] || ''}
                                                                    onChange={handleApplicantDetailsChange}
                                                                    placeholder="Enter tehsil as shown on your records"
                                                                    required={field.required}
                                                                    maxLength={120}
                                                                />
                                                            )}
                                                        </>
                                                    ) : (
                                                        <input
                                                            id={`applicant-${field.name}`}
                                                            name={field.name}
                                                            className="portal-input"
                                                            type="text"
                                                            value={applicantDetails[field.name] || ''}
                                                            onChange={handleApplicantDetailsChange}
                                                            placeholder="Select the institute district to see tehsil options, or enter tehsil"
                                                            required={field.required}
                                                            maxLength={120}
                                                        />
                                                    )}
                                                    <small style={{ display: 'block', marginTop: 5, color: '#64748b', lineHeight: 1.4 }}>
                                                        {institutionDistrict
                                                            ? `Tehsil options are based on ${institutionDistrict} district.`
                                                            : 'Choose the institute state and district above to load tehsil options.'}
                                                    </small>
                                                </>
                                            ) : field.name === 'institute' ? (
                                                <div style={{ border: '1px solid #dbe3ee', borderRadius: 10, padding: 14, background: '#fff' }}>
                                                    <div role="tablist" aria-label="Institution search method" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                                                        {[
                                                            { id: 'location', label: 'Search by State / District' },
                                                            { id: 'code', label: 'Search by Institution Code' }
                                                        ].map((mode) => (
                                                            <button key={mode.id} type="button" role="tab" aria-selected={institutionSearchMode === mode.id} onClick={() => { setInstitutionSearchMode(mode.id); setInstitutionResults([]); setInstitutionTotal(0); setInstitutionPage(1); setInstitutionSearchMessage(''); }} style={{ padding: '9px 12px', border: `1px solid ${institutionSearchMode === mode.id ? '#2563eb' : '#cbd5e1'}`, borderRadius: 7, background: institutionSearchMode === mode.id ? '#eff6ff' : '#fff', color: institutionSearchMode === mode.id ? '#1d4ed8' : '#334155', fontWeight: 600, cursor: 'pointer' }}>
                                                                {mode.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div>
                                                        {institutionSearchMode === 'location' ? (
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, alignItems: 'end' }}>
                                                                <div>
                                                                    <label className="portal-label" htmlFor="institution-state">State / UT</label>
                                                                    <select id="institution-state" className="portal-input" value={institutionState} onChange={(event) => { const state = event.target.value; setInstitutionState(state); setInstitutionDistrict(''); setInstitutionResults([]); setInstitutionTotal(0); setInstitutionPage(1); setInstitutionQuery(''); setTehsilManual(false); setApplicantDetails((previous) => ({ ...previous, institute: '', instituteState: state, instituteDistrict: '', tehsil: '' })); }}>
                                                                        <option value="">All states / UTs</option>
                                                                        {INDIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="portal-label" htmlFor="institution-district">District</label>
                                                                    <select id="institution-district" className="portal-input" value={institutionDistrict} onChange={(event) => { const district = event.target.value; setInstitutionDistrict(district); setInstitutionResults([]); setInstitutionTotal(0); setInstitutionPage(1); setInstitutionQuery(''); setTehsilManual(false); setApplicantDetails((previous) => ({ ...previous, institute: '', instituteState: institutionState, instituteDistrict: district, tehsil: '' })); }} disabled={!institutionState}>
                                                                        <option value="">All districts</option>
                                                                        {(IGOD_LOCATION_DATA.states?.[institutionState]?.districts || []).map((district) => <option key={district.name} value={district.name}>{district.name}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="portal-label" htmlFor="institution-name-search">Institute Name</label>
                                                                    <input id="institution-name-search" name={field.name} className="portal-input" value={institutionQuery || applicantDetails.institute || ''} onChange={(event) => { setInstitutionQuery(event.target.value); setApplicantDetails((previous) => ({ ...previous, institute: event.target.value })); setInstitutionResults([]); setInstitutionTotal(0); setInstitutionPage(1); }} placeholder="Enter institute name" autoComplete="off" required={field.required} />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                    <label className="portal-label" htmlFor="institution-code-search">Institution directory code</label>
                                                                <input id="institution-code-search" className="portal-input" value={institutionQuery} onChange={(event) => { setInstitutionQuery(event.target.value); setInstitutionResults([]); setInstitutionTotal(0); setInstitutionPage(1); }} placeholder="Enter institution code" autoComplete="off" />
                                                            </div>
                                                        )}
                                                                <button type="button" className="portal-button portal-button-primary" onClick={() => searchInstitutions()} disabled={institutionSearchLoading} style={{ marginTop: 12, minWidth: 110 }}>
                                                            {institutionSearchLoading ? 'Searching…' : 'Search'}
                                                        </button>
                                                    </div>
                                                    {institutionSearchMessage && <div role="status" style={{ marginTop: 10, color: institutionSearchMessage.startsWith('Selected:') ? '#166534' : '#475569', fontSize: 13 }}>{institutionSearchMessage}</div>}
                                                    {(institutionSearchLoading || institutionResults.length > 0) && (
                                                        <div id="institution-search-results" style={{ marginTop: 16, maxWidth: '100%', overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 7 }}>
                                                            <table style={{ width: '100%', minWidth: 650, borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                                                                <thead><tr style={{ background: '#f8fafc', color: '#334155' }}>
                                                                    <th style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>Select</th>
                                                                    <th style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>Institution Code</th>
                                                                    <th style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>Institute Name</th>
                                                                    <th style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>Type</th>
                                                                    <th style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>District / State</th>
                                                                </tr></thead>
                                                                <tbody>
                                                                    {institutionSearchLoading && <tr><td colSpan="5" style={{ padding: 12, color: '#64748b' }}>Searching institution directory…</td></tr>}
                                                                    {!institutionSearchLoading && institutionResults.map((institution) => (
                                                                        <tr key={`${institution.id}-${institution.name}`}>
                                                                            <td style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}><input type="radio" name="selectedInstitution" aria-label={`Select ${institution.name}`} checked={applicantDetails.institute === institution.name} onChange={() => selectInstitution(institution)} /></td>
                                                                            <td style={{ padding: 10, borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{institution.id}</td>
                                                                            <td style={{ padding: 10, borderBottom: '1px solid #e2e8f0', minWidth: 220 }}>{institution.name}</td>
                                                                            <td style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>{institution.type}</td>
                                                                            <td style={{ padding: 10, borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{[institution.district, institution.state].filter(Boolean).join(', ')}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                    {institutionTotal > 10 && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                                                            <small style={{ color: '#64748b' }}>
                                                                Showing {(institutionPage - 1) * 10 + 1}–{Math.min(institutionPage * 10, institutionTotal)} of {institutionTotal} matching institutions
                                                            </small>
                                                            <div style={{ display: 'flex', gap: 8 }}>
                                                                <button type="button" className="portal-button portal-button-secondary" disabled={institutionSearchLoading || institutionPage <= 1} onClick={() => searchInstitutions(null, institutionPage - 1)}>Previous</button>
                                                                <button type="button" className="portal-button portal-button-secondary" disabled={institutionSearchLoading || institutionPage >= Math.ceil(institutionTotal / 10)} onClick={() => searchInstitutions(null, institutionPage + 1)}>Next</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <small style={{ display: 'block', marginTop: 8, color: '#64748b', lineHeight: 1.4 }}>
                                                        Select a result to fill the institute name. If the institute is not listed, enter its name manually in the Institute Name field.
                                                    </small>
                                                    {institutionSearchMode === 'code' && <small style={{ display: 'block', marginTop: 4, color: '#64748b', lineHeight: 1.4 }}>Search matches the code included in the supplied institution directory.</small>}
                                                    {institutionSearchMode === 'code' && <input aria-label="Institute name" className="portal-input" style={{ marginTop: 10 }} name={field.name} value={applicantDetails[field.name] || ''} onChange={handleApplicantDetailsChange} placeholder="Or enter institute name manually" required={field.required} />}
                                                </div>
                                            ) : ['previousBoard', 'class10Board', 'class12Board'].includes(field.name) ? (
                                                <>
                                                    <input
                                                        id={`applicant-${field.name}`}
                                                        name={field.name}
                                                        className="portal-input"
                                                        type="text"
                                                        value={applicantDetails[field.name] || ''}
                                                        onChange={(event) => {
                                                            handleApplicantDetailsChange(event);
                                                            setOpenBoardField(field.name);
                                                        }}
                                                        onFocus={() => setOpenBoardField(field.name)}
                                                        onBlur={() => window.setTimeout(() => setOpenBoardField((current) => current === field.name ? '' : current), 120)}
                                                        role="combobox"
                                                        aria-expanded={openBoardField === field.name}
                                                        aria-controls={`board-options-${field.name}`}
                                                        autoComplete="off"
                                                        placeholder={field.name === 'previousBoard'
                                                            ? 'Type to filter boards or universities'
                                                            : 'Type to filter school boards'}
                                                        maxLength={200}
                                                    />
                                                    {openBoardField === field.name && (
                                                        <div
                                                            id={`board-options-${field.name}`}
                                                            role="listbox"
                                                            aria-label={`${field.label} options`}
                                                            style={{ maxHeight: 240, overflowY: 'auto', marginTop: 4, border: '1px solid #cbd5e1', borderRadius: 7, background: '#fff', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)' }}
                                                        >
                                                            {boardOptionsForField(field.name).length > 0
                                                                ? boardOptionsForField(field.name).map((board) => (
                                                                    <button
                                                                        key={board}
                                                                        type="button"
                                                                        role="option"
                                                                        aria-selected={applicantDetails[field.name] === board}
                                                                        onMouseDown={(event) => event.preventDefault()}
                                                                        onClick={() => {
                                                                            setApplicantDetails((previous) => ({ ...previous, [field.name]: board }));
                                                                            setOpenBoardField('');
                                                                        }}
                                                                        style={{ display: 'block', width: '100%', padding: '9px 12px', border: 0, borderBottom: '1px solid #eef2f7', background: applicantDetails[field.name] === board ? '#eff6ff' : '#fff', color: '#172033', textAlign: 'left', cursor: 'pointer' }}
                                                                    >
                                                                        {board}
                                                                    </button>
                                                                ))
                                                                : <div style={{ padding: '10px 12px', color: '#64748b', fontSize: 13 }}>No matches in the list. Continue typing to enter another board or university name.</div>}
                                                        </div>
                                                    )}
                                                    <small style={{ display: 'block', marginTop: 5, color: '#64748b', lineHeight: 1.4 }}>
                                                        {field.name === 'previousBoard'
                                                            ? 'Filter the school-board list or select a university result. You can also enter a name that is not listed.'
                                                            : 'Filter the school-board list, or enter another board name if it is not listed.'}
                                                    </small>
                                                </>
                                            ) : field.name === 'parentProfession' ? (
                                                <>
                                                    <input
                                                        id={`applicant-${field.name}`}
                                                        name={field.name}
                                                        className="portal-input"
                                                        type="text"
                                                        list="parent-profession-options"
                                                        value={applicantDetails[field.name] || ''}
                                                        onChange={handleApplicantDetailsChange}
                                                        placeholder="Search or enter the parent's occupation"
                                                        required={field.required}
                                                        maxLength={120}
                                                    />
                                                    <datalist id="parent-profession-options">
                                                        {PARENT_PROFESSION_OPTIONS.map((profession) => (
                                                            <option key={profession} value={profession} />
                                                        ))}
                                                    </datalist>
                                                    <small style={{ display: 'block', marginTop: 5, color: '#64748b', lineHeight: 1.4 }}>
                                                        Choose a suggestion or type the occupation as commonly known.
                                                    </small>
                                                </>
                                            ) : field.name === 'specialCategoryType' ? (
                                                <>
                                                    <input
                                                        id={`applicant-${field.name}`}
                                                        name={field.name}
                                                        className="portal-input"
                                                        type="text"
                                                        list="special-category-types"
                                                        value={applicantDetails[field.name] || ''}
                                                        onChange={handleApplicantDetailsChange}
                                                        placeholder="Choose a category or enter the certificate wording"
                                                        required={showSpecialCategoryType}
                                                        maxLength={100}
                                                    />
                                                    <datalist id="special-category-types">
                                                        {SPECIAL_CATEGORY_TYPES.map((option) => <option key={option} value={option} />)}
                                                    </datalist>
                                                </>
                                            ) : field.type === 'textarea' ? (
                                                <>
                                                    <textarea
                                                        id={`applicant-${field.name}`}
                                                        name={field.name}
                                                        className="portal-input"
                                                        rows={3}
                                                        value={applicantDetails[field.name] || ''}
                                                        onChange={handleApplicantDetailsChange}
                                                        readOnly={field.readOnly}
                                                        required={field.required}
                                                    />
                                                    {field.name === 'permanentAddress' && (
                                                        <small style={{ display: 'block', marginTop: 5, color: '#64748b', lineHeight: 1.4 }}>
                                                            Generated from Village / Town, Sub District, Home District, Permanent Address State, and PIN Code.
                                                        </small>
                                                    )}
                                                </>
                                            ) : field.type === 'presentYear' ? (
                                                <select
                                                    id={`applicant-${field.name}`}
                                                    name={field.name}
                                                    className="portal-input"
                                                    value={applicantDetails[field.name] || ''}
                                                    onChange={handleApplicantDetailsChange}
                                                    disabled={field.readOnly}
                                                    required={field.required}
                                                >
                                                    <option value="">Select present year / class</option>
                                                    {applicantDetails[field.name]
                                                        && !PRESENT_YEAR_OPTIONS.includes(String(applicantDetails[field.name]))
                                                        && <option value={applicantDetails[field.name]}>Saved value: {applicantDetails[field.name]}</option>}
                                                    <optgroup label="Course year">
                                                        {PRESENT_YEAR_OPTIONS.slice(0, 10).map((option) => <option key={option} value={option}>{option}</option>)}
                                                    </optgroup>
                                                    <optgroup label="School class">
                                                        {PRESENT_YEAR_OPTIONS.slice(10).map((option) => <option key={option} value={option}>{option}</option>)}
                                                    </optgroup>
                                                </select>
                                            ) : field.type === 'year' ? (
                                                <select
                                                    id={`applicant-${field.name}`}
                                                    name={field.name}
                                                    className="portal-input"
                                                    value={applicantDetails[field.name] || ''}
                                                    onChange={handleApplicantDetailsChange}
                                                    disabled={field.readOnly}
                                                    required={field.required}
                                                >
                                                    <option value="">Select year</option>
                                                    {applicantDetails[field.name]
                                                        && !ACADEMIC_YEAR_OPTIONS.includes(String(applicantDetails[field.name]))
                                                        && <option value={applicantDetails[field.name]}>Saved year: {applicantDetails[field.name]}</option>}
                                                    {ACADEMIC_YEAR_OPTIONS.map((year) => <option key={year} value={year}>{year}</option>)}
                                                </select>
                                            ) : field.type === 'select' ? (
                                                <select
                                                    id={`applicant-${field.name}`}
                                                    name={field.name}
                                                    className="portal-input"
                                                    value={applicantDetails[field.name] || ''}
                                                    onChange={handleApplicantDetailsChange}
                                                    disabled={field.readOnly}
                                                    required={field.required}
                                                >
                                                    <option value="">Select {field.label.toLowerCase()}</option>
                                                    {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                                                </select>
                                            ) : field.type === 'checkbox' ? (
                                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.5 }}>
                                                    <input
                                                        id={`applicant-${field.name}`}
                                                        name={field.name}
                                                        type="checkbox"
                                                        checked={Boolean(applicantDetails[field.name])}
                                                        onChange={handleApplicantDetailsChange}
                                                        required={field.required}
                                                        disabled={field.readOnly}
                                                    />
                                                    <span>{field.helpText || field.label}</span>
                                                </label>
                                            ) : (
                                                <input
                                                    id={`applicant-${field.name}`}
                                                    name={field.name}
                                                    className="portal-input"
                                                    type={field.type || 'text'}
                                                    value={applicantDetails[field.name] || ''}
                                                    onChange={handleApplicantDetailsChange}
                                                    readOnly={field.readOnly}
                                                    required={isApplicantFieldRequired(field)}
                                                    min={field.name === 'currentSemester' ? 1 : ['familyIncome', 'previousPercentage', 'attendance'].includes(field.name) ? 0 : undefined}
                                                    max={field.name === 'currentSemester' ? 20 : ['previousPercentage', 'attendance'].includes(field.name) ? 100 : undefined}
                                                    step={field.type === 'number' ? 'any' : undefined}
                                                />
                                            )}
                                        </div>
                                        </React.Fragment>
                                    ))}
                                    {!currentPageRequiredComplete && optionalCurrentFields.length > 0 && (
                                        <p role="status" className="portal-text" style={{ gridColumn: '1 / -1', margin: '2px 0 0', fontSize: 13 }}>
                                            Complete the required fields above to unlock the additional optional fields.
                                        </p>
                                    )}
                                </React.Fragment>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
                            {detailsPageIndex > 0 && (
                                <button
                                    type="button"
                                    className="portal-button portal-button-secondary"
                                    disabled={savingApplicantDetails}
                                    onClick={() => {
                                        setError('');
                                        setSuccessMessage('');
                                        setDetailsPageIndex((index) => Math.max(0, index - 1));
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                >
                                    <ArrowLeft size={16} style={{ marginRight: 7 }} /> Previous
                                </button>
                            )}
                            <button
                                type="button"
                                className="portal-button portal-button-secondary"
                                disabled={savingApplicantDetails}
                                onClick={() => saveApplicantDetails(false)}
                            >
                                {savingApplicantDetails ? 'Saving…' : 'Save as Draft'}
                            </button>
                            <button
                                type="submit"
                                className="portal-button portal-button-primary"
                                disabled={savingApplicantDetails}
                            >
                                {savingApplicantDetails
                                    ? 'Saving…'
                                    : isLastDetailsPage ? 'Save & Continue to Documents' : 'Save & Next'}
                            </button>
                        </div>
                        <p className="portal-text" role="status" style={{ margin: '10px 0 0', fontSize: 13 }}>
                            {canSaveAndAdvance
                                ? 'Required fields on this page are complete.'
                                : `Save & Next will show which fields need attention. Complete those required fields to continue; Save as Draft remains available.`}
                        </p>
                    </form>
                )}


                {(!canEditApplicantDetails || ['documents', 'review'].includes(applicationStep)) && (
                    <React.Fragment>
                {['documents', 'submitted'].includes(applicationStep) && (
                    <React.Fragment>
                {/* =================================================
                    REQUIRED DOCUMENTS
                ================================================== */}

                <div
                    className="portal-card"
                    style={{
                        padding: '24px',
                        marginBottom: '22px'
                    }}
                >

                    <div
                        style={{
                            display: 'flex',
                            alignItems:
                                'flex-start',
                            gap: '14px',
                            marginBottom:
                                '22px'
                        }}
                    >

                        <div
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius:
                                    '10px',
                                background:
                                    '#eaf1fb',
                                display:
                                    'flex',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'center',
                                flexShrink: 0
                            }}
                        >

                            <FileText
                                size={20}
                                color="#174a8b"
                            />

                        </div>


                        <div>

                            <h2
                                className="portal-heading"
                                style={{
                                    fontSize:
                                        '21px',
                                    marginBottom:
                                        '6px'
                                }}
                            >
                                Required Documents
                            </h2>

                            <p
                                className="portal-text"
                                style={{
                                    margin: 0
                                }}
                            >
                                Upload each required
                                document in PDF, JPG
                                or PNG format. Maximum
                                file size is 5 MB.
                            </p>

                        </div>

                    </div>


                    {requiredDocuments.length ===
                        0 && (

                        <div
                            style={{
                                padding:
                                    '18px',
                                background:
                                    '#f8fafc',
                                border:
                                    '1px solid #e2e8f0',
                                borderRadius:
                                    '8px',
                                color:
                                    '#64748b'
                            }}
                        >
                            No required documents
                            were specified for this
                            scholarship.
                        </div>

                    )}


                    <div
                        style={{
                            display:
                                'grid',
                            gap:
                                '14px'
                        }}
                    >

                        {requiredDocuments.map(
                            (
                                documentType
                            ) => {

                                const uploadedDocument =
                                    getUploadedDocument(
                                        documentType
                                    );

                                const selectedFile =
                                    selectedFiles[
                                        documentType
                                    ];

                                const isUploading =
                                    uploadingDocument ===
                                    documentType;

                                const isViewing =
                                    viewingDocument ===
                                    uploadedDocument?._id;


                                return (

                                    <div
                                        key={
                                            documentType
                                        }
                                        style={{
                                            border:
                                                '1px solid #e2e8f0',
                                            borderRadius:
                                                '10px',
                                            padding:
                                                '17px',
                                            background:
                                                uploadedDocument
                                                    ? '#f8fffa'
                                                    : '#ffffff'
                                        }}
                                    >

                                        <div
                                            style={{
                                                display:
                                                    'flex',
                                                alignItems:
                                                    'flex-start',
                                                justifyContent:
                                                    'space-between',
                                                gap:
                                                    '15px',
                                                flexWrap:
                                                    'wrap'
                                            }}
                                        >

                                            <div
                                                style={{
                                                    display:
                                                        'flex',
                                                    gap:
                                                        '12px',
                                                    alignItems:
                                                        'flex-start'
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        width:
                                                            '36px',
                                                        height:
                                                            '36px',
                                                        borderRadius:
                                                            '8px',
                                                        background:
                                                            uploadedDocument
                                                                ? '#dcfce7'
                                                                : '#f1f5f9',
                                                        display:
                                                            'flex',
                                                        alignItems:
                                                            'center',
                                                        justifyContent:
                                                            'center',
                                                        flexShrink:
                                                            0
                                                    }}
                                                >

                                                    {uploadedDocument ? (

                                                        <CheckCircle2
                                                            size={
                                                                19
                                                            }
                                                            color="#166534"
                                                        />

                                                    ) : (

                                                        <FileText
                                                            size={
                                                                19
                                                            }
                                                            color="#64748b"
                                                        />

                                                    )}

                                                </div>


                                                <div>

                                                    <div
                                                        style={{
                                                            fontWeight:
                                                                700,
                                                            color:
                                                                '#172033',
                                                            marginBottom:
                                                                '5px'
                                                        }}
                                                    >
                                                        {
                                                            documentType
                                                        }
                                                    </div>


                                                    {uploadedDocument ? (

                                                        <div
                                                            style={{
                                                                color:
                                                                    '#166534',
                                                                fontSize:
                                                                    '13px',
                                                                fontWeight:
                                                                    600
                                                            }}
                                                        >
                                                            Uploaded
                                                        </div>

                                                    ) : (

                                                        <div
                                                            style={{
                                                                color:
                                                                    '#64748b',
                                                                fontSize:
                                                                    '13px'
                                                            }}
                                                        >
                                                            Not uploaded
                                                        </div>

                                                    )}

                                                </div>

                                            </div>


                                            {uploadedDocument && (
                                                <span
                                                    className="portal-status portal-status-success"
                                                >
                                                    Uploaded
                                                </span>
                                            )}

                                        </div>


                                        {uploadedDocument && (
                                            <div
                                                style={{
                                                    marginTop:
                                                        '13px',
                                                    padding:
                                                        '10px 12px',
                                                    borderRadius:
                                                        '7px',
                                                    background:
                                                        '#f1f5f9',
                                                    color:
                                                        '#475569',
                                                    fontSize:
                                                        '13px',
                                                    display:
                                                        'flex',
                                                    alignItems:
                                                        'center',
                                                    justifyContent:
                                                        'space-between',
                                                    gap:
                                                        '12px',
                                                    flexWrap:
                                                        'wrap'
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        minWidth:
                                                            0,
                                                        overflow:
                                                            'hidden',
                                                        textOverflow:
                                                            'ellipsis'
                                                    }}
                                                >
                                                    File:{' '}
                                                    <strong>
                                                        {
                                                            uploadedDocument
                                                                .fileName
                                                        }
                                                    </strong>
                                                </div>


                                                <button
                                                    type="button"
                                                    className="portal-button portal-button-secondary"
                                                    disabled={
                                                        isViewing
                                                    }
                                                    onClick={() =>
                                                        handleViewDocument(
                                                            uploadedDocument
                                                        )
                                                    }
                                                    style={{
                                                        flexShrink:
                                                            0,
                                                        opacity:
                                                            isViewing
                                                                ? 0.65
                                                                : 1
                                                    }}
                                                >

                                                    {isViewing ? (

                                                        <>
                                                            <Loader2
                                                                size={
                                                                    15
                                                                }
                                                                style={{
                                                                    marginRight:
                                                                        '7px',
                                                                    verticalAlign:
                                                                        'middle',
                                                                    animation:
                                                                        'spin 1s linear infinite'
                                                                }}
                                                            />

                                                            Opening...

                                                        </>

                                                    ) : (

                                                        <>
                                                            <Eye
                                                                size={
                                                                    15
                                                                }
                                                                style={{
                                                                    marginRight:
                                                                        '7px',
                                                                    verticalAlign:
                                                                        'middle'
                                                                }}
                                                            />

                                                            View Document

                                                        </>

                                                    )}

                                                </button>

                                            </div>
                                        )}


                                        {isUploadAllowed() && (
                                            <div
                                                style={{
                                                    marginTop:
                                                        '15px',
                                                    display:
                                                        'flex',
                                                    gap:
                                                        '10px',
                                                    alignItems:
                                                        'center',
                                                    flexWrap:
                                                        'wrap'
                                                }}
                                            >

                                                <label
                                                    style={{
                                                        display:
                                                            'inline-flex',
                                                        alignItems:
                                                            'center',
                                                        gap:
                                                            '8px',
                                                        border:
                                                            '1px solid #cbd5e1',
                                                        borderRadius:
                                                            '8px',
                                                        padding:
                                                            '10px 13px',
                                                        background:
                                                            '#ffffff',
                                                        color:
                                                            '#334155',
                                                        fontSize:
                                                            '13px',
                                                        fontWeight:
                                                            600,
                                                        cursor:
                                                            'pointer'
                                                    }}
                                                >

                                                    <Upload
                                                        size={
                                                            16
                                                        }
                                                    />

                                                    Choose File

                                                    <input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleFileChange(
                                                                documentType,
                                                                event
                                                            )
                                                        }
                                                        style={{
                                                            display:
                                                                'none'
                                                        }}
                                                    />

                                                </label>


                                                {selectedFile && (
                                                    <span
                                                        style={{
                                                            color:
                                                                '#475569',
                                                            fontSize:
                                                                '13px'
                                                        }}
                                                    >
                                                        {
                                                            selectedFile
                                                                .name
                                                        }
                                                    </span>
                                                )}


                                                <button
                                                    type="button"
                                                    className="portal-button portal-button-primary"
                                                    disabled={
                                                        !selectedFile ||
                                                        isUploading
                                                    }
                                                    onClick={() =>
                                                        handleUpload(
                                                            documentType
                                                        )
                                                    }
                                                    style={{
                                                        opacity:
                                                            !selectedFile ||
                                                            isUploading
                                                                ? 0.6
                                                                : 1
                                                    }}
                                                >

                                                    {isUploading ? (

                                                        <>
                                                            <Loader2
                                                                size={
                                                                    15
                                                                }
                                                                style={{
                                                                    marginRight:
                                                                        '7px',
                                                                    verticalAlign:
                                                                        'middle',
                                                                    animation:
                                                                        'spin 1s linear infinite'
                                                                }}
                                                            />

                                                            Uploading...

                                                        </>

                                                    ) : (

                                                        <>
                                                            <Upload
                                                                size={
                                                                    15
                                                                }
                                                                style={{
                                                                    marginRight:
                                                                        '7px',
                                                                    verticalAlign:
                                                                        'middle'
                                                                }}
                                                            />

                                                            {uploadedDocument
                                                                ? 'Replace Document'
                                                                : 'Upload Document'}

                                                        </>

                                                    )}

                                                </button>

                                            </div>
                                        )}

                                    </div>

                                );
                            }
                        )}

                    </div>

                </div>


                {/* =================================================
                    DOCUMENT SUMMARY
                ================================================== */}

                <div
                    className="portal-card"
                    style={{
                        padding: '20px',
                        marginBottom: '22px'
                    }}
                >

                    <div
                        style={{
                            display:
                                'flex',
                            justifyContent:
                                'space-between',
                            alignItems:
                                'center',
                            gap:
                                '15px',
                            flexWrap:
                                'wrap'
                        }}
                    >

                        <div>

                            <div
                                style={{
                                    fontWeight:
                                        700,
                                    color:
                                        '#172033',
                                    marginBottom:
                                        '4px'
                                }}
                            >
                                Document Completion
                            </div>

                            <div
                                style={{
                                    color:
                                        '#64748b',
                                    fontSize:
                                        '13px'
                                }}
                            >
                                {
                                    requiredDocuments.filter(
                                        (
                                            documentType
                                        ) =>
                                            Boolean(
                                                getUploadedDocument(
                                                    documentType
                                                )
                                            )
                                    ).length
                                }{' '}
                                of{' '}
                                {
                                    requiredDocuments.length
                                }{' '}
                                required documents uploaded
                            </div>

                        </div>


                        <div>

                            {allDocumentsUploaded ? (

                                <span className="portal-status portal-status-success">
                                    <CheckCircle2
                                        size={14}
                                        style={{
                                            marginRight:
                                                '5px'
                                        }}
                                    />
                                    Complete
                                </span>

                            ) : (

                                <span className="portal-status portal-status-warning">
                                    Incomplete
                                </span>

                            )}

                        </div>

                    </div>

                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 22 }}>
                    <button
                        type="button"
                        className="portal-button portal-button-primary"
                        disabled={submittingApplication || uploadingDocument !== ''}
                        onClick={() => {
                            setError('');
                            setSuccessMessage('');
                            setApplicationStep('review');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    >
                        Continue to Step 6: Submit Details
                    </button>
                </div>


                {/* =================================================
                    SUBMIT APPLICATION
                ================================================== */}

                </React.Fragment>
                )}

                {applicationStep === 'review' && (
                <React.Fragment>

                <div
                    className="portal-card"
                    style={{
                        padding: '24px',
                        marginBottom: '22px'
                    }}
                >

                    <div
                        style={{
                            display:
                                'flex',
                            alignItems:
                                'flex-start',
                            gap:
                                '14px',
                            marginBottom:
                                '20px'
                        }}
                    >

                        <div
                            style={{
                                width:
                                    '42px',
                                height:
                                    '42px',
                                borderRadius:
                                    '10px',
                                background:
                                    '#eaf1fb',
                                display:
                                    'flex',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'center',
                                flexShrink:
                                    0
                            }}
                        >

                            <Send
                                size={
                                    20
                                }
                                color="#174a8b"
                            />

                        </div>


                        <div>

                            <h2
                                className="portal-heading"
                                style={{
                                    fontSize:
                                        '21px',
                                    marginBottom:
                                        '6px'
                                }}
                            >
                                Submit Application
                            </h2>

                            <p
                                className="portal-text"
                                style={{
                                    margin: 0
                                }}
                            >
                                Review your information
                                and documents carefully
                                before submitting. Once
                                submitted, the application
                                will move to the university
                                verification process.
                            </p>

                        </div>

                    </div>


                    {/* =============================================
                        STATUS INFORMATION
                    ============================================== */}

                    {!isSubmitAllowed() && (
                        <div
                            style={{
                                marginBottom:
                                    '16px',
                                padding:
                                    '13px 15px',
                                borderRadius:
                                    '8px',
                                background:
                                    '#f1f5f9',
                                color:
                                    '#475569',
                                fontSize:
                                    '14px',
                                fontWeight:
                                    600
                            }}
                        >
                            This application cannot
                            be submitted because its
                            current status is{' '}
                            <strong>
                                {applicationStatus ||
                                    'UNKNOWN'}
                            </strong>.
                        </div>
                    )}


                    {/* =============================================
                        DOCUMENT WARNING
                    ============================================== */}

                    {isSubmitAllowed() &&
                        !allDocumentsUploaded && (

                        <div
                            style={{
                                marginBottom:
                                    '16px',
                                padding:
                                    '13px 15px',
                                borderRadius:
                                    '8px',
                                background:
                                    '#fef3c7',
                                color:
                                    '#92400e',
                                fontSize:
                                    '14px',
                                fontWeight:
                                    600
                            }}
                        >
                            Please upload all required
                            documents before submitting
                            the application.
                        </div>

                    )}


                    {/* =============================================
                        READY MESSAGE
                    ============================================== */}

                    {isSubmitAllowed() &&
                        allDocumentsUploaded && (

                        <div
                            style={{
                                marginBottom:
                                    '16px',
                                padding:
                                    '13px 15px',
                                borderRadius:
                                    '8px',
                                background:
                                    '#dcfce7',
                                color:
                                    '#166534',
                                fontSize:
                                    '14px',
                                fontWeight:
                                    600
                            }}
                        >
                            ✓ All required documents
                            are uploaded. Your
                            application is ready
                            for submission.
                        </div>

                    )}

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 11, margin: '18px 0', padding: '15px', border: '1px solid #cbd5e1', borderRadius: 9, background: '#f8fafc', lineHeight: 1.55 }}>
                        <input
                            type="checkbox"
                            checked={undertakingAccepted}
                            onChange={(event) => setUndertakingAccepted(event.target.checked)}
                            disabled={!isSubmitAllowed() || !allDocumentsUploaded || submittingApplication}
                            style={{ marginTop: 4, flexShrink: 0 }}
                        />
                        <span><strong>Student Undertaking:</strong> {STUDENT_UNDERTAKING_TEXT}</span>
                    </label>


                    {/* =============================================
                        SUBMIT BUTTON
                    ============================================== */}

                    <button
                        type="button"
                        className="portal-button portal-button-primary"
                        disabled={
                            !isSubmitAllowed() ||
                            !allDocumentsUploaded ||
                            !undertakingAccepted ||
                            submittingApplication ||
                            uploadingDocument !== ''
                        }
                        onClick={
                            handleSubmitApplication
                        }
                        style={{
                            minWidth:
                                '210px',
                            opacity:
                                !isSubmitAllowed() ||
                                !allDocumentsUploaded ||
                                !undertakingAccepted ||
                                submittingApplication ||
                                uploadingDocument !== ''
                                    ? 0.6
                                    : 1
                        }}
                    >

                        {submittingApplication ? (

                            <>
                                <Loader2
                                    size={
                                        16
                                    }
                                    style={{
                                        marginRight:
                                            '7px',
                                        verticalAlign:
                                            'middle',
                                        animation:
                                            'spin 1s linear infinite'
                                    }}
                                />

                                Submitting...

                            </>

                        ) : (

                            <>
                                <Send
                                    size={
                                        16
                                    }
                                    style={{
                                        marginRight:
                                            '7px',
                                        verticalAlign:
                                            'middle'
                                    }}
                                />

                                Submit Application

                            </>

                        )}

                    </button>

                    <button
                        type="button"
                        className="portal-button portal-button-secondary"
                        disabled={submittingApplication}
                        onClick={() => {
                            setError('');
                            setApplicationStep('documents');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        style={{ marginLeft: 10 }}
                    >
                        <ArrowLeft size={16} style={{ marginRight: 7, verticalAlign: 'middle' }} /> Back to Documents
                    </button>

                </div>

                </React.Fragment>
                )}


                {/* =================================================
                    BACK BUTTON
                ================================================== */}

                <div
                    style={{
                        display:
                            'flex',
                        justifyContent:
                            'flex-start'
                    }}
                >

                    <button
                        type="button"
                        className="portal-button portal-button-secondary"
                        onClick={() =>
                            navigate(
                                '/student/applications'
                            )
                        }
                    >

                        <ArrowLeft
                            size={
                                16
                            }
                            style={{
                                marginRight:
                                    '7px',
                                verticalAlign:
                                    'middle'
                            }}
                        />

                        Back to My Applications

                    </button>

                </div>

                    </React.Fragment>
                )}

            </main>


            {/* ====================================================
                ANIMATION
            ==================================================== */}

            <style>
                {`
                    @keyframes spin {
                        from {
                            transform: rotate(0deg);
                        }

                        to {
                            transform: rotate(360deg);
                        }
                    }
                `}
            </style>

        </div>
    );
};


export default ApplicationDocuments;
