// University course catalogue supplied for this portal. Each faculty contains
// departments, and each department contains the displayed programme names.
const PROGRAMME_PREFIXES = {
    'Computer Science': 'CSC', 'Computer Engineering & Technology': 'CET', 'Electronics Technology': 'ELC', 'Civil Engineering': 'CIV', 'Mech. Engineering': 'MEC', 'Computational Statistics & Data Analytics': 'CSD', 'Surjit Patar Centre for Ethical AI': 'AI',
    'Biotechnology': 'BIO', 'Botanical and Environmental Sciences': 'BES', 'Human Genetics': 'HGN', 'Microbiology': 'MIC', 'Molecular Biology & Biochemistry': 'MBB', 'Pharmaceutical Sciences': 'PHM', 'Zoology': 'ZOO',
    'Agriculture': 'AGR', 'Visual and Performing Arts': 'VPA', 'History': 'HIS', 'Library & Information Science': 'LIS', 'Mass Communication': 'MSC', 'Political Science': 'POL', 'Psychology': 'PSY', 'School of Social Sciences': 'SSS', 'Sociology': 'SOC',
    'English': 'ENG', 'Foreign Languages': 'FLG', 'Hindi': 'HIN', 'Punjabi (School of Punjabi Studies)': 'PUN', 'Sanskrit, Pali & Prakrit': 'SAN', 'Urdu & Persian': 'URD', 'Guru Nanak Studies': 'GNS', 'Laws': 'LAW', 'Physical Education': 'PED',
    'Apparel & Textile Technology': 'APT', 'Chemistry': 'CHM', 'Food Science & Technology': 'FST', 'Mathematics': 'MTH', 'Physics': 'PHY',
    'Economics (Punjab School of Economics)': 'ECO', 'University Business School': 'UBS', 'University School of Financial Studies': 'USFS', 'Hotel Management & Tourism': 'HMT', 'Architecture': 'ARC', 'Planning (Guru Ramdas School of Planning)': 'PLN',
    'Physiotherapy': 'PTY', 'MYAS GNDU Sports Sciences and Medicine': 'SSM', 'Education': 'EDU'
};

const faculty = (id, name, departments) => ({
    id,
    name,
    departments: departments.map(([departmentName, programmeNames]) => ({
        name: departmentName,
        programmes: programmeNames.map((programName, index) => ({ id: `${PROGRAMME_PREFIXES[departmentName] || id}-${String(index + 1).padStart(2, '0')}`, name: programName }))
    }))
});

export const UNIVERSITY_FACULTIES_HIERARCHY = [
    faculty('FAC-01', 'Faculty of Engineering & Technology', [
        ['Computer Science', ['Master of Computer Applications (2 Years)', 'Master of Computer Applications (FYIP)', 'Post Graduate Diploma in Computer Applications (1 Year)', 'Post Graduate Diploma in Artificial Intelligence (1 Year)']],
        ['Computer Engineering & Technology', ['Bachelor of Technology in Computer Science & Engineering (4 Years)', 'Bachelor of Technology in Computer Science & Engineering - Lateral Entry', 'Master of Technology in Computer Science & Engineering (2 Years)', 'Master of Technology in Computer Science & Engineering (FYIP)', 'Bachelor of Technology in Computer Engineering (4 Years)']],
        ['Electronics Technology', ['Bachelor of Technology in Electronics & Communication Engg. (4 Years)', 'Bachelor of Technology in Electronics & Communication Engg. - Lateral Entry', 'Bachelor of Technology (Electronics & Computer Engg.) (4 Years)', 'Bachelor of Technology in Electronics & Computer Engg. - Lateral Entry', 'Master of Technology (Electronics & Communication Engg.) Specialization (Wireless Communication) (FYIP)', 'Master of Technology in Electronics & Communication Engg. Specialization (Wireless Communication) (FYIP) Lateral Entry', 'Master of Technology in Electronics & Communication Engineering Specialization (AI & IoT) (FYIP)', 'Master of Technology in Electronics & Communication Engineering Specialization (Communication Systems) (2 Yrs)']],
        ['Civil Engineering', ['Bachelor of Technology in Civil Engineering (4 Years)', 'Bachelor of Technology in Civil Engineering - Lateral Entry']],
        ['Mech. Engineering', ['Bachelor of Technology in Mechanical Engineering (4 Years)', 'Bachelor of Technology in Mechanical Engineering - Lateral Entry', 'Bachelor of Technology in Robotics and Artificial Intelligence Engineering (4 Years)', 'Master of Technology in Artificial Intelligence and Robotics Engineering (FYIP)']],
        ['Computational Statistics & Data Analytics', ['Master of Science in Computational Statistics & Data Analytics (FYIP)', 'Master of Science in Computational Statistics & Data Analytics (2 Years)']],
        ['Surjit Patar Centre for Ethical AI', ['Master of Technology in Artificial Intelligence and Data Science (2 Years)', 'Bachelor of Technology in Artificial Intelligence and Machine Learning (4 Years)']]
    ]),
    faculty('FAC-02', 'Life Sciences', [
        ['Biotechnology', ['Master of Science in Biotechnology (2 Years)']],
        ['Botanical and Environmental Sciences', ['Master of Science in Botany (FYIP)', 'Master of Science in Environmental Sciences (FYIP)', 'Master of Science in Botany (2 Years)', 'Master of Science in Environmental Sciences (2 Years)']],
        ['Human Genetics', ['Master of Science Human Genetics (2 Years)', 'Master of Science Human Genetics (FYIP)']],
        ['Microbiology', ['Master of Science in Microbiology (2 Years)', 'Master of Science in Microbiology (FYIP)']],
        ['Molecular Biology & Biochemistry', ['Master of Science in Molecular Bio. & Biochemistry (2 Years)', 'Bachelor of Medical Laboratory Science (BMLS) (4 Years)']],
        ['Pharmaceutical Sciences', ['Bachelor of Pharmacy (4 Years)', 'Master of Pharmacy (2 Years)']],
        ['Zoology', ['Master of Science in Zoology (2 Years)', 'Master of Science in Zoology (FYIP)']]
    ]),
    faculty('FAC-03', 'Agriculture & Forestry', [
        ['Agriculture', ['Bachelor of Science (Honours) in Agriculture (4 Years)', 'Bachelor of Nutrition and Dietetics (4 Years)', 'Bachelor of Business Administration in (Agri Storage and Supply Chain) (3 Years)', 'Master of Science in Sports Nutrition (2 Years)', 'Post Graduate Diploma in Artificial Intelligence in Agriculture (1 Year)', 'Post Graduate Diploma in Entrepreneurship Developments (1 Year)']]
    ]),
    faculty('FAC-04', 'Visual & Performing Arts', [
        ['Visual and Performing Arts', ['Master of Arts in Hindustani Music (Vocal) (2 Years)', 'Master of Arts in Hindustani Music (Instrumental) (2 Years)', 'Master of Performing Arts (MPA) in Music (Instrumental)', 'Certificate in Gurmat Sangeet Tradition']]
    ]),
    faculty('FAC-05', 'Arts & Social Sciences', [
        ['History', ['Master of Arts History (2 Years)']],
        ['Library & Information Science', ['Bachelor of Library & Information Science (Honours) (B.Lib.I.Sc.) (1 Year)', 'Master of Library & Information Science (M.Lib.I.Sc.) (1 Year)']],
        ['Mass Communication', ['Master of Arts Journalism & Mass Communication (FYIP)', 'Master of Arts Journalism & Mass Communication (2 years)']],
        ['Political Science', ['Master of Arts in Political Science (2 Years)', 'Master of Arts in Public Policy and Governance (2 Years)']],
        ['Psychology', ['Bachelor in Psychology (B.Psy)', 'Master of Arts Psychology (2 Years)', 'Advanced Diploma in Guidance and Counselling (1 Year + 3 Months Internship)']],
        ['School of Social Sciences', ['Bachelor of Arts in Social Sciences Four Year Programme (FYP)', 'Master of Arts in International Relations (2 Years)']],
        ['Sociology', ['Master of Arts Sociology (2 Years)', 'Master of Social Work (MSW) (2 Years)']]
    ]),
    faculty('FAC-06', 'Languages', [
        ['English', ['Master of Arts English (2 Years)']],
        ['Foreign Languages', ['Foundational Programme (Part-Time)', 'Intermediate Programme (Part-Time)', 'Advanced Programme in French (1 Year)', 'Short-Term Programmes: Communicative French (Module -I), German (Module-I), Chinese (Module-I)']],
        ['Hindi', ['Master of Arts Hindi (2 Years)', 'Post Graduate Diploma in Translation (Hindi) (PGDT) (1 Year)', 'Post Graduate Diploma in Hindi Patrakarita (1 Year)', 'Certificate in Hindi Translation (1 Year)', 'Certificate in Creative Writing in Hindi (1 Year)']],
        ['Punjabi (School of Punjabi Studies)', ['Master of Arts in Punjabi (FYIP)', 'Master of Arts in Punjabi (2 Years)']],
        ['Sanskrit, Pali & Prakrit', ['Master of Arts in Sanskrit (2 Years)']],
        ['Urdu & Persian', ['Master of Arts in Persian (2 Years)', 'Foundational Programme in Urdu (1 Year)', 'Foundational Programme in Persian (1 Year)', 'Foundational Programme in Arabic (1 Year)', 'Intermediate Programme in Urdu (1 Year)', 'Intermediate Programme in Persian (1 Year)', 'Advanced Programme in Urdu Language (1 Year)']]
    ]),
    faculty('FAC-07', 'Humanities & Religious Studies', [
        ['Guru Nanak Studies', ['Master of Arts (Religious Studies) (2 Years)', 'Master of Arts in Philosophy (2years)']]
    ]),
    faculty('FAC-08', 'Laws', [['Laws', ['LL.B. (3 Years)', 'B.A. LL.B (FYIP)', 'LL.M. (1 Year)', 'Post Graduate Diploma in Sports Law (1 Year)']]]),
    faculty('FAC-09', 'Physical Education', [['Physical Education', ['Bachelor of Physical Education & Sports (BPES) (3 Years)', 'Post Graduate Diploma in Yoga (1 Year)', 'Bachelor of Physical Education (B.P. Ed.) (2 Years)', 'Master of Physical Education (M.P. Ed.) (2 Years)']]]),
    faculty('FAC-10', 'Sciences', [
        ['Apparel & Textile Technology', ['Bachelor of Technology in Textile Processing Technology (4 Years)', 'Bachelor of Technology in Textile Processing Technology - Lateral Entry', 'Master of Science in Fashion Designing (FYIP)', 'Master of Science in Fashion Designing (2 Years)']],
        ['Chemistry', ['Master of Science in Chemistry (FYIP)', 'Master of Science in Chemistry (2 Years)', 'Master of Science in Applied Chemistry (Pharmaceuticals) (2 Years)']],
        ['Food Science & Technology', ['Bachelor of Technology in Food Technology (4 Years)', 'Bachelor of Technology in Food Technology - Lateral Entry', 'Master of Science Food Technology (2 Years)', 'Master of Science Food Technology (FYIP)', 'Certificate Programme (Full-Time)']],
        ['Mathematics', ['Master of Science in Mathematics (2 Years)', 'Master of Science in Mathematics (FYIP)']],
        ['Physics', ['Master of Science in Physics (2 Years)', 'Master of Science in Physics (FYIP)']]
    ]),
    faculty('FAC-11', 'Economics & Business', [
        ['Economics (Punjab School of Economics)', ['Master of Science in Economics (FYIP)', 'Master of Science in Economics (2 Years)', 'Master of Arts in Business Economics (2 years)']],
        ['University Business School', ['Master of Business Administration (2 Years) (with dual specialization)', 'Master of Business Administration in Financial Management (2 Years)', 'Master of Business Administration in Marketing Management (2 Years)', 'Master of Business Administration in Human Resource Management (2 Years)', 'Master of Business Administration (FYIP) (with dual specialization)']],
        ['University School of Financial Studies', ['Master of Commerce (2 Years)', 'Master of Business Administration in Finance (2 Years)', 'Master of Business Administration in Financial Analytics (in collaboration with NSE Academy) (2 Years)', 'Master of Business Administration in Finance (FYIP)', 'Master of Commerce (FYIP)', 'Master of Commerce in Data Analytics (FYIP)']],
        ['Hotel Management & Tourism', ['Master of Tourism & Travel Management (MTTM) (FYIP)', 'Master of Hotel Management and Catering Technology (MHMCT) (FYIP)', 'Certificate in Food Production (CFP) (1 Year Programme)', 'Short-Term Programme in Bakery and Confectionary (STP B & C) (6 Months)']]
    ]),
    faculty('FAC-12', 'Physical Planning & Architecture', [
        ['Architecture', ['Bachelor of Architecture (5 Years)', 'Bachelor of Design in Interior Design/ Product Design/Animation & Graphic Design']],
        ['Planning (Guru Ramdas School of Planning)', ['Master of Technology in Urban & Regional Planning (FYIP)', 'Master of Technology in Urban Planning (2 Years)', 'Master of Technology in Infrastructure Planning (2 Years)', 'Master of Technology in Transport Planning (2 Years)']]
    ]),
    faculty('FAC-13', 'Sports Medicine and Physiotherapy', [
        ['Physiotherapy', ['Bachelor of Physiotherapy (BPT) (5 Years)', 'Master of Physiotherapy in Musculoskeletal Science (2 Years)']],
        ['MYAS GNDU Sports Sciences and Medicine', ['Master of Physiotherapy in Sports Science (2 Years)', 'Master of Science in Exercise & Sports Physiology (2 Years)', 'Master of Science in Sports Biomechanics (2 Years)', 'Master of Arts in Sports Psychology (2 Years)', 'Masters in Hospital Administration (MHA) (2 Years)']]
    ]),
    faculty('FAC-14', 'Education', [
        ['Education', ['M.Ed. (2 Years)', 'B.Ed. Special (MD) (2 Years)', 'B.A. B.Ed. (Integrated Teacher Education Programme - ITEP) (4 Years)', 'B.Sc. B.Ed. (Integrated Teacher Education Programme - ITEP) (4 Years)', 'B.Com. B.Ed. (Integrated Teacher Education Programme - ITEP) (4 Years)', 'B.Sc. (Early Childhood Care and Education) (4 Years)', 'M.A. Education (2 Years)', 'Advance Diploma in Early Childhood Care and Education (ECCE) (1 Year)', 'B.A. B.Ed. (Special and Inclusive Education-Multiple Disabilities) (ISITEP) (Secondary Stage) (4 Years)']]
    ])
];
