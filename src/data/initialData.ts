import { Course, EducationLevelConfig, Group, Student, RegistrationRecord, SystemSettings } from '../types';
import { RAW_TEACHERS } from './allTeachers';
import { INITIAL_STUDENTS_FROM_PDF } from './allStudents';

export const EDUCATION_LEVELS: EducationLevelConfig[] = [
  {
    id: 'primary',
    name: 'ระดับประถมศึกษา',
    shortName: 'ประถมศึกษา',
    documentTitle: 'ใบลงทะเบียน ระดับประถมศึกษา',
  },
  {
    id: 'junior_high',
    name: 'ระดับมัธยมศึกษาตอนต้น',
    shortName: 'มัธยมศึกษาตอนต้น',
    documentTitle: 'ใบลงทะเบียน ระดับมัธยมศึกษาตอนต้น',
  },
  {
    id: 'senior_high',
    name: 'ระดับมัธยมศึกษาตอนปลาย',
    shortName: 'มัธยมศึกษาตอนปลาย',
    documentTitle: 'ใบลงทะเบียน ระดับมัธยมศึกษาตอนปลาย',
  },
];

export const INITIAL_SETTINGS: SystemSettings = {
  institutionName: 'ศูนย์ส่งเสริมการเรียนรู้ระดับอำเภอยี่งอ',
  term: '1',
  academicYear: '2567',
  registrationOpen: true,
  registrationDeadline: '2026-10-31',
  defaultRegistrarName: 'นางสาวนูรีฮัน มะแซ',
  maxCreditsPerTerm: 18,
};

// Generate groups from the official teachers table in PDF 1
export const INITIAL_GROUPS: Group[] = [];
RAW_TEACHERS.forEach((t) => {
  t.groupCodes.forEach((code) => {
    // Determine level by code prefix: 21=primary, 22=junior_high, 23=senior_high
    let levelName = 'ทุกระดับ';
    if (code.startsWith('21')) levelName = 'ประถมศึกษา';
    else if (code.startsWith('22')) levelName = 'มัธยมศึกษาตอนต้น';
    else if (code.startsWith('23')) levelName = 'มัธยมศึกษาตอนปลาย';

    INITIAL_GROUPS.push({
      code,
      name: `กลุ่ม ${code} (${levelName})`,
      advisorName: t.name,
      advisorPhone: '081-xxx-xxxx',
      location: `ศกร.ตำบลยี่งอ (${t.name})`,
    });
  });
});

export const INITIAL_COURSES: Course[] = [
  // ================= ระดับประถมศึกษา =================
  // วิชาบังคับ (14 วิชา)
  { id: 'p-c-1', level: 'primary', category: 'compulsory', orderNumber: 1, code: 'ทร11001', name: 'ทักษะการเรียนรู้', credits: 5, isActive: true },
  { id: 'p-c-2', level: 'primary', category: 'compulsory', orderNumber: 2, code: 'พท11001', name: 'ภาษาไทย', credits: 3, isActive: true },
  { id: 'p-c-3', level: 'primary', category: 'compulsory', orderNumber: 3, code: 'พต11001', name: 'ภาษาอังกฤษพื้นฐาน', credits: 3, isActive: true },
  { id: 'p-c-4', level: 'primary', category: 'compulsory', orderNumber: 4, code: 'พค11001', name: 'คณิตศาสตร์', credits: 3, isActive: true },
  { id: 'p-c-5', level: 'primary', category: 'compulsory', orderNumber: 5, code: 'พว11001', name: 'วิทยาศาสตร์', credits: 3, isActive: true },
  { id: 'p-c-6', level: 'primary', category: 'compulsory', orderNumber: 6, code: 'อช11001', name: 'ช่องทางการเข้าสู่อาชีพ', credits: 2, isActive: true },
  { id: 'p-c-7', level: 'primary', category: 'compulsory', orderNumber: 7, code: 'อช11002', name: 'ทักษะการประกอบอาชีพ', credits: 4, isActive: true },
  { id: 'p-c-8', level: 'primary', category: 'compulsory', orderNumber: 8, code: 'อช11003', name: 'พัฒนาอาชีพให้มีอยู่มีกิน', credits: 2, isActive: true },
  { id: 'p-c-9', level: 'primary', category: 'compulsory', orderNumber: 9, code: 'ทช11001', name: 'เศรษฐกิจพอเพียง', credits: 1, isActive: true },
  { id: 'p-c-10', level: 'primary', category: 'compulsory', orderNumber: 10, code: 'ทช11002', name: 'สุขศึกษา พลศึกษา', credits: 2, isActive: true },
  { id: 'p-c-11', level: 'primary', category: 'compulsory', orderNumber: 11, code: 'ทช11003', name: 'ศิลปศึกษา', credits: 2, isActive: true },
  { id: 'p-c-12', level: 'primary', category: 'compulsory', orderNumber: 12, code: 'สค11001', name: 'สังคมศึกษา', credits: 3, isActive: true },
  { id: 'p-c-13', level: 'primary', category: 'compulsory', orderNumber: 13, code: 'สค11002', name: 'ศาสนาและหน้าที่พลเมือง', credits: 2, isActive: true },
  { id: 'p-c-14', level: 'primary', category: 'compulsory', orderNumber: 14, code: 'สค11003', name: 'การพัฒนาตนเอง ชุมชน สังคม', credits: 1, isActive: true },
  // วิชาเลือกเสรี
  { id: 'p-e-1', level: 'primary', category: 'elective', orderNumber: 1, code: 'สค12021', name: 'การเงินเพื่อชีวิต 1', credits: 3, isActive: true },
  { id: 'p-e-2', level: 'primary', category: 'elective', orderNumber: 2, code: 'พว12010', name: 'การใช้พลังงานไฟฟ้าในชีวิตประจำวัน 1', credits: 3, isActive: true },
  { id: 'p-e-3', level: 'primary', category: 'elective', orderNumber: 3, code: 'สค12026', name: 'การป้องกันการทุจริต', credits: 2, isActive: true },

  // ================= ระดับมัธยมศึกษาตอนต้น =================
  // วิชาบังคับ (14 วิชา)
  { id: 'j-c-1', level: 'junior_high', category: 'compulsory', orderNumber: 1, code: 'ทร21001', name: 'ทักษะการเรียนรู้', credits: 5, isActive: true },
  { id: 'j-c-2', level: 'junior_high', category: 'compulsory', orderNumber: 2, code: 'พท21001', name: 'ภาษาไทย', credits: 4, isActive: true },
  { id: 'j-c-3', level: 'junior_high', category: 'compulsory', orderNumber: 3, code: 'พต21001', name: 'ภาษาอังกฤษในชีวิตประจำวัน', credits: 4, isActive: true },
  { id: 'j-c-4', level: 'junior_high', category: 'compulsory', orderNumber: 4, code: 'พค21001', name: 'คณิตศาสตร์', credits: 4, isActive: true },
  { id: 'j-c-5', level: 'junior_high', category: 'compulsory', orderNumber: 5, code: 'พว21001', name: 'วิทยาศาสตร์', credits: 4, isActive: true },
  { id: 'j-c-6', level: 'junior_high', category: 'compulsory', orderNumber: 6, code: 'อช21001', name: 'ช่องทางการพัฒนาอาชีพ', credits: 2, isActive: true },
  { id: 'j-c-7', level: 'junior_high', category: 'compulsory', orderNumber: 7, code: 'อช21002', name: 'ทักษะการพัฒนาอาชีพ', credits: 4, isActive: true },
  { id: 'j-c-8', level: 'junior_high', category: 'compulsory', orderNumber: 8, code: 'อช21003', name: 'พัฒนาอาชีพให้มีความเข้มแข็ง', credits: 2, isActive: true },
  { id: 'j-c-9', level: 'junior_high', category: 'compulsory', orderNumber: 9, code: 'ทช21001', name: 'เศรษฐกิจพอเพียง', credits: 1, isActive: true },
  { id: 'j-c-10', level: 'junior_high', category: 'compulsory', orderNumber: 10, code: 'ทช21002', name: 'สุขศึกษา พลศึกษา', credits: 2, isActive: true },
  { id: 'j-c-11', level: 'junior_high', category: 'compulsory', orderNumber: 11, code: 'ทช21003', name: 'ศิลปศึกษา', credits: 2, isActive: true },
  { id: 'j-c-12', level: 'junior_high', category: 'compulsory', orderNumber: 12, code: 'สค21001', name: 'สังคมศึกษา', credits: 3, isActive: true },
  { id: 'j-c-13', level: 'junior_high', category: 'compulsory', orderNumber: 13, code: 'สค21002', name: 'ศาสนาและหน้าที่พลเมือง', credits: 2, isActive: true },
  { id: 'j-c-14', level: 'junior_high', category: 'compulsory', orderNumber: 14, code: 'สค21003', name: 'การพัฒนาตนเอง ชุมชน สังคม', credits: 1, isActive: true },
  // วิชาเลือกเสรี
  { id: 'j-e-1', level: 'junior_high', category: 'elective', orderNumber: 1, code: 'สค22016', name: 'การเงินเพื่อชีวิต 2', credits: 3, isActive: true },
  { id: 'j-e-2', level: 'junior_high', category: 'elective', orderNumber: 2, code: 'สค22020', name: 'ประวัติศาสตร์ชาติไทย', credits: 3, isActive: true },
  { id: 'j-e-3', level: 'junior_high', category: 'elective', orderNumber: 3, code: 'ทช23054', name: 'ส่งเสริมสุขภาวะชุมชน', credits: 2, isActive: true },
  { id: 'j-e-4', level: 'junior_high', category: 'elective', orderNumber: 4, code: 'พว22002', name: 'การใช้พลังงานไฟฟ้าในชีวิตประจำวัน 2', credits: 3, isActive: true },
  { id: 'j-e-5', level: 'junior_high', category: 'elective', orderNumber: 5, code: 'สค22021', name: 'ลูกเสือ กศน.', credits: 3, isActive: true },
  { id: 'j-e-6', level: 'junior_high', category: 'elective', orderNumber: 6, code: 'สค22022', name: 'การป้องกันการทุจริต', credits: 2, isActive: true },

  // ================= ระดับมัธยมศึกษาตอนปลาย =================
  // วิชาบังคับ (14 วิชา)
  { id: 's-c-1', level: 'senior_high', category: 'compulsory', orderNumber: 1, code: 'ทร31001', name: 'ทักษะการเรียนรู้', credits: 5, isActive: true },
  { id: 's-c-2', level: 'senior_high', category: 'compulsory', orderNumber: 2, code: 'พท31001', name: 'ภาษาไทย', credits: 5, isActive: true },
  { id: 's-c-3', level: 'senior_high', category: 'compulsory', orderNumber: 3, code: 'พต31001', name: 'ภาษาอังกฤษเพื่อชีวิตและสังคม', credits: 5, isActive: true },
  { id: 's-c-4', level: 'senior_high', category: 'compulsory', orderNumber: 4, code: 'พค31001', name: 'คณิตศาสตร์', credits: 5, isActive: true },
  { id: 's-c-5', level: 'senior_high', category: 'compulsory', orderNumber: 5, code: 'พว31001', name: 'วิทยาศาสตร์', credits: 5, isActive: true },
  { id: 's-c-6', level: 'senior_high', category: 'compulsory', orderNumber: 6, code: 'อช31001', name: 'ช่องทางการขยายอาชีพ', credits: 2, isActive: true },
  { id: 's-c-7', level: 'senior_high', category: 'compulsory', orderNumber: 7, code: 'อช31002', name: 'ทักษะการขยายอาชีพ', credits: 4, isActive: true },
  { id: 's-c-8', level: 'senior_high', category: 'compulsory', orderNumber: 8, code: 'อช31003', name: 'พัฒนาอาชีพให้มีความมั่นคง', credits: 2, isActive: true },
  { id: 's-c-9', level: 'senior_high', category: 'compulsory', orderNumber: 9, code: 'ทช31001', name: 'เศรษฐกิจพอเพียง', credits: 1, isActive: true },
  { id: 's-c-10', level: 'senior_high', category: 'compulsory', orderNumber: 10, code: 'ทช31002', name: 'สุขศึกษา พลศึกษา', credits: 2, isActive: true },
  { id: 's-c-11', level: 'senior_high', category: 'compulsory', orderNumber: 11, code: 'ทช31003', name: 'ศิลปศึกษา', credits: 2, isActive: true },
  { id: 's-c-12', level: 'senior_high', category: 'compulsory', orderNumber: 12, code: 'สค31001', name: 'สังคมศึกษา', credits: 3, isActive: true },
  { id: 's-c-13', level: 'senior_high', category: 'compulsory', orderNumber: 13, code: 'สค31002', name: 'ศาสนาและหน้าที่พลเมือง', credits: 2, isActive: true },
  { id: 's-c-14', level: 'senior_high', category: 'compulsory', orderNumber: 14, code: 'สค31003', name: 'การพัฒนาตนเอง ชุมชน สังคม', credits: 1, isActive: true },
  // วิชาเลือกเสรี
  { id: 's-e-1', level: 'senior_high', category: 'elective', orderNumber: 1, code: 'สค32029', name: 'การเงินเพื่อชีวิต 3', credits: 3, isActive: true },
  { id: 's-e-2', level: 'senior_high', category: 'elective', orderNumber: 2, code: 'สค32034', name: 'ประวัติศาสตร์ชาติไทย', credits: 3, isActive: true },
  { id: 's-e-3', level: 'senior_high', category: 'elective', orderNumber: 3, code: 'ทช33095', name: 'ส่งเสริมสุขภาวะชุมชน', credits: 2, isActive: true },
  { id: 's-e-4', level: 'senior_high', category: 'elective', orderNumber: 4, code: 'พว32023', name: 'การใช้พลังงานไฟฟ้าในชีวิตประจำวัน 3', credits: 3, isActive: true },
  { id: 's-e-5', level: 'senior_high', category: 'elective', orderNumber: 5, code: 'สค32035', name: 'ลูกเสือ กศน.', credits: 3, isActive: true },
  { id: 's-e-6', level: 'senior_high', category: 'elective', orderNumber: 6, code: 'ทช33098', name: 'กัญชาและกัญชงศึกษาเพื่อใช้เป็นยาอย่างชาญฉลาด', credits: 3, isActive: true },
  { id: 's-e-7', level: 'senior_high', category: 'elective', orderNumber: 7, code: 'สค32036', name: 'การป้องกันการทุจริต', credits: 3, isActive: true },
  { id: 's-e-8', level: 'senior_high', category: 'elective', orderNumber: 8, code: 'ทร02006', name: 'โครงงานเพื่อพัฒนาทักษะการเรียนรู้', credits: 3, isActive: true },
  { id: 's-e-9', level: 'senior_high', category: 'elective', orderNumber: 9, code: 'อช32001', name: 'การพัฒนาแผนและโครงการ', credits: 3, isActive: true },
  { id: 's-e-10', level: 'senior_high', category: 'elective', orderNumber: 10, code: 'ทช32005', name: 'สุขภาพและความปลอดภัยในชีวิต', credits: 3, isActive: true },
  { id: 's-e-11', level: 'senior_high', category: 'elective', orderNumber: 11, code: 'สค3300166', name: 'TO BE NUMBER ONE เป็นหนึ่งโดยไม่พึ่งยาเสพติด', credits: 3, isActive: true },
];

export const INITIAL_STUDENTS: Student[] = INITIAL_STUDENTS_FROM_PDF;

export const INITIAL_REGISTRATIONS: RegistrationRecord[] = [
  // 1. นาย อาพันดี ลาเต๊ะ (ม.ปลาย) รหัส 6113000153 - ลงทะเบียนแล้ว ได้รับการอนุมัติและบันทึกข้อมูล
  {
    id: 'reg-6113000153-2567-1',
    studentId: '6113000153',
    studentName: 'นาย อาพันดี ลาเต๊ะ',
    level: 'senior_high',
    groupCode: '230032',
    groupName: 'กลุ่ม 230032 (กาตีนี สาเด็ง)',
    term: '1',
    academicYear: '2567',
    status: 'recorded',
    submittedAt: '2567-10-01 09:30',
    approvedAt: '2567-10-02 11:15',
    recordedAt: '2567-10-03 14:00',
    studentSignatureName: 'นาย อาพันดี ลาเต๊ะ',
    teacherSignatureName: 'กาตีนี สาเด็ง',
    registrarSignatureName: 'นางสาวนูรีฮัน มะแซ',
    recordDate: {
      day: '3',
      month: 'ตุลาคม',
      year: '2567',
    },
    totalCredits: 16,
    items: [
      { courseId: 's-c-1', courseCode: 'ทร31001', courseName: 'ทักษะการเรียนรู้', credits: 5, category: 'compulsory', orderNumber: 1, isRegistered: true, isTransferred: false, remarks: '' },
      { courseId: 's-c-2', courseCode: 'พท31001', courseName: 'ภาษาไทย', credits: 5, category: 'compulsory', orderNumber: 2, isRegistered: true, isTransferred: false, remarks: '' },
      { courseId: 's-e-1', courseCode: 'สค32029', courseName: 'การเงินเพื่อชีวิต 3', credits: 3, category: 'elective', orderNumber: 1, isRegistered: true, isTransferred: false, remarks: '' },
      { courseId: 's-e-5', courseCode: 'สค32035', courseName: 'ลูกเสือ กศน.', credits: 3, category: 'elective', orderNumber: 5, isRegistered: true, isTransferred: false, remarks: '' },
    ],
  },
  // 2. นาย กูอามิง ประกอบการคดี (ประถมศึกษา) รหัส 6311000041 - รอครูอนุมัติ
  {
    id: 'reg-6311000041-2567-1',
    studentId: '6311000041',
    studentName: 'นาย กูอามิง ประกอบการคดี',
    level: 'primary',
    groupCode: '210008',
    groupName: 'กลุ่ม 210008 (สุนีย์ บินแวนาแว)',
    term: '1',
    academicYear: '2567',
    status: 'pending_teacher',
    submittedAt: '2567-10-04 14:20',
    studentSignatureName: 'นาย กูอามิง ประกอบการคดี',
    teacherSignatureName: 'สุนีย์ บินแวนาแว',
    totalCredits: 14,
    items: [
      { courseId: 'p-c-1', courseCode: 'ทร11001', courseName: 'ทักษะการเรียนรู้', credits: 5, category: 'compulsory', orderNumber: 1, isRegistered: true, isTransferred: false, remarks: '' },
      { courseId: 'p-c-2', courseCode: 'พท11001', courseName: 'ภาษาไทย', credits: 3, category: 'compulsory', orderNumber: 2, isRegistered: true, isTransferred: false, remarks: '' },
      { courseId: 'p-c-4', courseCode: 'พค11001', courseName: 'คณิตศาสตร์', credits: 3, category: 'compulsory', orderNumber: 4, isRegistered: true, isTransferred: false, remarks: '' },
      { courseId: 'p-e-1', courseCode: 'สค12021', courseName: 'การเงินเพื่อชีวิต 1', credits: 3, category: 'elective', orderNumber: 1, isRegistered: true, isTransferred: false, remarks: '' },
    ],
  },
  // 3. นาย มุสลิม จาวะมะลา (ม.ต้น) รหัส 5712000522 - อนุมัติแล้ว
  {
    id: 'reg-5712000522-2567-1',
    studentId: '5712000522',
    studentName: 'นาย มุสลิม จาวะมะลา',
    level: 'junior_high',
    groupCode: '220009',
    groupName: 'กลุ่ม 220009 (มะนาวี สาบูดิง)',
    term: '1',
    academicYear: '2567',
    status: 'approved',
    submittedAt: '2567-10-02 10:00',
    approvedAt: '2567-10-03 16:30',
    studentSignatureName: 'นาย มุสลิม จาวะมะลา',
    teacherSignatureName: 'มะนาวี สาบูดิง',
    registrarSignatureName: 'นางสาวนูรีฮัน มะแซ',
    totalCredits: 15,
    items: [
      { courseId: 'j-c-1', courseCode: 'ทร21001', courseName: 'ทักษะการเรียนรู้', credits: 5, category: 'compulsory', orderNumber: 1, isRegistered: true, isTransferred: false, remarks: '' },
      { courseId: 'j-c-2', courseCode: 'พท21001', courseName: 'ภาษาไทย', credits: 4, category: 'compulsory', orderNumber: 2, isRegistered: true, isTransferred: false, remarks: '' },
      { courseId: 'j-c-3', courseCode: 'พต21001', courseName: 'ภาษาอังกฤษในชีวิตประจำวัน', credits: 4, category: 'compulsory', orderNumber: 3, isRegistered: true, isTransferred: false, remarks: '' },
      { courseId: 'j-e-3', courseCode: 'ทช23054', courseName: 'ส่งเสริมสุขภาวะชุมชน', credits: 2, category: 'elective', orderNumber: 3, isRegistered: true, isTransferred: false, remarks: '' },
    ],
  },
];
