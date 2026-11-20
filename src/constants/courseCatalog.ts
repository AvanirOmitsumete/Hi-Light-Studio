/**
 * Built-in list of common Philippine degree programs (CHED) and Senior High School strands,
 * so admins can add a school's courses by searching instead of typing names and codes.
 * Codes follow common usage; schools that use a different code can edit it after adding.
 */
export interface CatalogCourse {
  code: string;
  name: string;
  group: string;
}

const college: Array<[group: string, entries: Array<[code: string, name: string]>]> = [
  ['Accountancy & Business', [
    ['BSA', 'Bachelor of Science in Accountancy'],
    ['BSAIS', 'Bachelor of Science in Accounting Information System'],
    ['BSMA', 'Bachelor of Science in Management Accounting'],
    ['BSIA', 'Bachelor of Science in Internal Auditing'],
    ['BSBA-FM', 'Bachelor of Science in Business Administration major in Financial Management'],
    ['BSBA-MM', 'Bachelor of Science in Business Administration major in Marketing Management'],
    ['BSBA-HRM', 'Bachelor of Science in Business Administration major in Human Resource Management'],
    ['BSBA-OM', 'Bachelor of Science in Business Administration major in Operations Management'],
    ['BSBA-BE', 'Bachelor of Science in Business Administration major in Business Economics'],
    ['BSENTREP', 'Bachelor of Science in Entrepreneurship'],
    ['BSREM', 'Bachelor of Science in Real Estate Management'],
    ['BSOA', 'Bachelor of Science in Office Administration'],
    ['BSCA', 'Bachelor of Science in Customs Administration'],
    ['BSLM', 'Bachelor of Science in Legal Management'],
    ['BSECON', 'Bachelor of Science in Economics'],
  ]],
  ['Hospitality & Tourism', [
    ['BSHM', 'Bachelor of Science in Hospitality Management'],
    ['BSTM', 'Bachelor of Science in Tourism Management'],
  ]],
  ['Computing & IT', [
    ['BSCS', 'Bachelor of Science in Computer Science'],
    ['BSIT', 'Bachelor of Science in Information Technology'],
    ['BSIS', 'Bachelor of Science in Information Systems'],
    ['BSEMC', 'Bachelor of Science in Entertainment and Multimedia Computing'],
    ['BSDS', 'Bachelor of Science in Data Science'],
    ['BLIS', 'Bachelor of Library and Information Science'],
  ]],
  ['Engineering', [
    ['BSCE', 'Bachelor of Science in Civil Engineering'],
    ['BSME', 'Bachelor of Science in Mechanical Engineering'],
    ['BSEE', 'Bachelor of Science in Electrical Engineering'],
    ['BSECE', 'Bachelor of Science in Electronics Engineering'],
    ['BSCPE', 'Bachelor of Science in Computer Engineering'],
    ['BSCHE', 'Bachelor of Science in Chemical Engineering'],
    ['BSIE', 'Bachelor of Science in Industrial Engineering'],
    ['BSGE', 'Bachelor of Science in Geodetic Engineering'],
    ['BSMINE', 'Bachelor of Science in Mining Engineering'],
    ['BSMETE', 'Bachelor of Science in Metallurgical Engineering'],
    ['BSENSE', 'Bachelor of Science in Environmental and Sanitary Engineering'],
    ['BSABE', 'Bachelor of Science in Agricultural and Biosystems Engineering'],
    ['BSAEE', 'Bachelor of Science in Aeronautical Engineering'],
  ]],
  ['Architecture & Design', [
    ['BSARCH', 'Bachelor of Science in Architecture'],
    ['BSID', 'Bachelor of Science in Interior Design'],
    ['BLA', 'Bachelor of Landscape Architecture'],
    ['BFA', 'Bachelor of Fine Arts'],
    ['BMA', 'Bachelor of Multimedia Arts'],
  ]],
  ['Health & Allied Sciences', [
    ['BSN', 'Bachelor of Science in Nursing'],
    ['BSPHARMA', 'Bachelor of Science in Pharmacy'],
    ['BSMLS', 'Bachelor of Science in Medical Laboratory Science (Medical Technology)'],
    ['BSPT', 'Bachelor of Science in Physical Therapy'],
    ['BSOT', 'Bachelor of Science in Occupational Therapy'],
    ['BSRT', 'Bachelor of Science in Radiologic Technology'],
    ['BSRESPT', 'Bachelor of Science in Respiratory Therapy'],
    ['BSM', 'Bachelor of Science in Midwifery'],
    ['BSND', 'Bachelor of Science in Nutrition and Dietetics'],
    ['BSPH', 'Bachelor of Science in Public Health'],
    ['DMD', 'Doctor of Dental Medicine'],
    ['OD', 'Doctor of Optometry'],
  ]],
  ['Sciences & Mathematics', [
    ['BSBIO', 'Bachelor of Science in Biology'],
    ['BSMARBIO', 'Bachelor of Science in Marine Biology'],
    ['BSCHEM', 'Bachelor of Science in Chemistry'],
    ['BSMATH', 'Bachelor of Science in Mathematics'],
    ['BSAM', 'Bachelor of Science in Applied Mathematics'],
    ['BSPHYS', 'Bachelor of Science in Physics'],
    ['BSSTAT', 'Bachelor of Science in Statistics'],
    ['BSES', 'Bachelor of Science in Environmental Science'],
    ['BSFT', 'Bachelor of Science in Food Technology'],
    ['BSPSYCH', 'Bachelor of Science in Psychology'],
  ]],
  ['Education', [
    ['BEED', 'Bachelor of Elementary Education'],
    ['BECED', 'Bachelor of Early Childhood Education'],
    ['BSNED', 'Bachelor of Special Needs Education'],
    ['BSED-ENG', 'Bachelor of Secondary Education major in English'],
    ['BSED-MATH', 'Bachelor of Secondary Education major in Mathematics'],
    ['BSED-SCI', 'Bachelor of Secondary Education major in Science'],
    ['BSED-FIL', 'Bachelor of Secondary Education major in Filipino'],
    ['BSED-SS', 'Bachelor of Secondary Education major in Social Studies'],
    ['BSED-VE', 'Bachelor of Secondary Education major in Values Education'],
    ['BPED', 'Bachelor of Physical Education'],
    ['BTLED', 'Bachelor of Technology and Livelihood Education'],
    ['BTVTED', 'Bachelor of Technical-Vocational Teacher Education'],
    ['BCAED', 'Bachelor of Culture and Arts Education'],
  ]],
  ['Arts, Communication & Social Sciences', [
    ['ABCOMM', 'Bachelor of Arts in Communication'],
    ['ABJOURN', 'Bachelor of Arts in Journalism'],
    ['ABBROAD', 'Bachelor of Arts in Broadcasting'],
    ['BSDEVCOM', 'Bachelor of Science in Development Communication'],
    ['ABELS', 'Bachelor of Arts in English Language Studies'],
    ['ABLIT', 'Bachelor of Arts in Literature'],
    ['ABPSYCH', 'Bachelor of Arts in Psychology'],
    ['ABPOLSCI', 'Bachelor of Arts in Political Science'],
    ['ABHIST', 'Bachelor of Arts in History'],
    ['ABSOCIO', 'Bachelor of Arts in Sociology'],
    ['ABPHILO', 'Bachelor of Arts in Philosophy'],
    ['ABECON', 'Bachelor of Arts in Economics'],
    ['ABIS', 'Bachelor of Arts in International Studies'],
    ['BSSW', 'Bachelor of Science in Social Work'],
    ['BPA', 'Bachelor of Public Administration'],
    ['BSCRIM', 'Bachelor of Science in Criminology'],
    ['BM', 'Bachelor of Music'],
  ]],
  ['Maritime', [
    ['BSMT', 'Bachelor of Science in Marine Transportation'],
    ['BSMARE', 'Bachelor of Science in Marine Engineering'],
  ]],
  ['Agriculture & Fisheries', [
    ['BSAGRI', 'Bachelor of Science in Agriculture'],
    ['BSAGRIBUS', 'Bachelor of Science in Agribusiness'],
    ['BSFI', 'Bachelor of Science in Fisheries'],
    ['BSFOR', 'Bachelor of Science in Forestry'],
  ]],
];

const shs: Array<[code: string, name: string]> = [
  ['STEM', 'Science, Technology, Engineering, and Mathematics'],
  ['ABM', 'Accountancy, Business and Management'],
  ['HUMSS', 'Humanities and Social Sciences'],
  ['GAS', 'General Academic Strand'],
  ['TVL-ICT', 'TVL - Information and Communications Technology'],
  ['TVL-HE', 'TVL - Home Economics'],
  ['TVL-IA', 'TVL - Industrial Arts'],
  ['TVL-AFA', 'TVL - Agri-Fishery Arts'],
  ['SPORTS', 'Sports Track'],
  ['ARTS', 'Arts and Design Track'],
];

const list = (group: string, entries: Array<[code: string, name: string]>): CatalogCourse[] =>
  entries.map(([code, name]) => ({ code, name, group }));

export const COLLEGE_COURSES: CatalogCourse[] = college.flatMap(([group, entries]) => list(group, entries));

export const SHS_STRANDS: CatalogCourse[] = list('Senior High School', shs);

const KINDER = list('Kindergarten / Preschool', [
  ['NURSERY', 'Nursery'],
  ['KINDER', 'Kindergarten'],
  ['PREP', 'Preparatory'],
]);

const ELEMENTARY = list('Elementary', [1, 2, 3, 4, 5, 6].map((n) => [`G${n}`, `Grade ${n}`]));

const JUNIOR_HIGH = list('Junior High School', [7, 8, 9, 10].map((n) => [`G${n}`, `Grade ${n}`]));

const GRADUATE = [
  ...list('Master\'s Degrees', [
    ['MBA', 'Master in Business Administration'],
    ['MPA', 'Master in Public Administration'],
    ['MAED', 'Master of Arts in Education'],
    ['MAT', 'Master of Arts in Teaching'],
    ['MAEM', 'Master of Arts in Educational Management'],
    ['MAN', 'Master of Arts in Nursing'],
    ['MSN', 'Master of Science in Nursing'],
    ['MIT', 'Master in Information Technology'],
    ['MSCS', 'Master of Science in Computer Science'],
    ['MENG', 'Master of Engineering'],
    ['MSCRIM', 'Master of Science in Criminal Justice'],
    ['MAPSYCH', 'Master of Arts in Psychology'],
    ['MSW', 'Master of Social Work'],
    ['MPH', 'Master of Public Health'],
    ['MM', 'Master in Management'],
    ['MSA', 'Master of Science in Accountancy'],
  ]),
  ...list('Doctorate Degrees', [
    ['PHD', 'Doctor of Philosophy'],
    ['EDD', 'Doctor of Education'],
    ['DBA', 'Doctor of Business Administration'],
    ['DPA', 'Doctor of Public Administration'],
  ]),
];

const LAW = list('Law', [
  ['JD', 'Juris Doctor'],
  ['LLB', 'Bachelor of Laws'],
  ['LLM', 'Master of Laws'],
]);

const MEDICINE = list('Medicine', [
  ['MD', 'Doctor of Medicine'],
  ['DMD', 'Doctor of Dental Medicine'],
  ['DVM', 'Doctor of Veterinary Medicine'],
]);

const VOCATIONAL = [
  ...list('Associate & Diploma Programs', [
    ['ACT', 'Associate in Computer Technology'],
    ['AHRM', 'Associate in Hotel and Restaurant Management'],
    ['AAT', 'Associate in Accounting Technology'],
    ['DICT', 'Diploma in Information and Communications Technology'],
    ['DET', 'Diploma in Engineering Technology'],
  ]),
  ...list('TESDA Courses', [
    ['COOK-NC2', 'Cookery NC II'],
    ['BPP-NC2', 'Bread and Pastry Production NC II'],
    ['FBS-NC2', 'Food and Beverage Services NC II'],
    ['HSK-NC2', 'Housekeeping NC II'],
    ['BAR-NC2', 'Barista NC II'],
    ['BART-NC2', 'Bartending NC II'],
    ['CSS-NC2', 'Computer Systems Servicing NC II'],
    ['EPAS-NC2', 'Electronic Products Assembly and Servicing NC II'],
    ['EIM-NC2', 'Electrical Installation and Maintenance NC II'],
    ['SMAW-NC2', 'Shielded Metal Arc Welding NC II'],
    ['AUTO-NC2', 'Automotive Servicing NC II'],
    ['DRV-NC2', 'Driving NC II'],
    ['CARP-NC2', 'Carpentry NC II'],
    ['PLUMB-NC2', 'Plumbing NC II'],
    ['CARE-NC2', 'Caregiving NC II'],
    ['HAIR-NC2', 'Hairdressing NC II'],
    ['BEAUTY-NC2', 'Beauty Care NC II'],
    ['DRESS-NC2', 'Dressmaking NC II'],
    ['MASS-NC2', 'Massage Therapy NC II'],
    ['BOOK-NC3', 'Bookkeeping NC III'],
    ['CCS-NC2', 'Contact Center Services NC II'],
    ['VGD-NC3', 'Visual Graphic Design NC III'],
    ['TOUR-NC2', 'Tour Guiding Services NC II'],
  ]),
];

/** Levels the admin can add to a school with one pick; any other name can be typed in. */
export const STANDARD_LEVELS = [
  'Kindergarten', 'Elementary', 'Junior High School', 'Senior High School', 'College',
  'Graduate School', 'Law School', 'Medical School', 'Vocational / TESDA',
];

const byLevel: Array<[pattern: RegExp, courses: CatalogCourse[]]> = [
  [/kinder|pre-?school|nursery|\bprep\b|preparatory|daycare|day care/, KINDER],
  [/senior high|\bshs\b|grade\s*1[12]\b/, SHS_STRANDS],
  [/junior high|\bjhs\b|high school|secondary|grade\s*(?:7|8|9|10)\b/, JUNIOR_HIGH],
  [/elementary|grade school|primary|\bgrade\s*[1-6]\b/, ELEMENTARY],
  [/\blaw\b/, LAW],
  [/medic|\bmed\b|dentist|veterinar/, MEDICINE],
  [/graduate|post-?grad|master|doctor|\bphd\b/, GRADUATE],
  [/vocational|tesda|tech-?voc|technical|skills|associate|diploma/, VOCATIONAL],
  [/college|tertiary|undergrad|university|bachelor/, COLLEGE_COURSES],
];

/** Every list, for levels with a name the catalog does not recognize. */
export const ALL_COURSES: CatalogCourse[] = [
  ...KINDER, ...ELEMENTARY, ...JUNIOR_HIGH, ...SHS_STRANDS, ...COLLEGE_COURSES, ...GRADUATE, ...LAW, ...MEDICINE, ...VOCATIONAL,
];

/** Suggestions for an academic level, chosen by its name. Unknown names get every list. */
export function catalogForLevel(levelName: string): CatalogCourse[] {
  const key = levelName.trim().toLowerCase();
  if (!key) return ALL_COURSES;
  return byLevel.find(([pattern]) => pattern.test(key))?.[1] ?? ALL_COURSES;
}
