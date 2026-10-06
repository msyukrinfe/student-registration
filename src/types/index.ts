export type EducationLevel = 'primary' | 'junior_high' | 'senior_high';

export interface EducationLevelConfig {
  id: EducationLevel;
  name: string;
  shortName: string;
  documentTitle: string;
}

export type CourseCategory = 'compulsory' | 'elective';

export interface Course {
  id: string;
  level: EducationLevel;
  category: CourseCategory;
  orderNumber: number;
  code: string;
  name: string;
  credits: number;
  isActive: boolean;
  description?: string;
}

export interface Student {
  id: string; // รหัสนักศึกษา 10-13 หลัก e.g. "6612000018"
  nationalId: string;
  fullName: string;
  level: EducationLevel;
  groupCode: string; // e.g. "YN-01"
  groupName: string; // e.g. "กลุ่ม ศกร.ตำบลยี่งอ"
  advisorName: string; // ชื่อครูที่ปรึกษา
  phone?: string;
  avatarUrl?: string;
}

export interface Group {
  code: string;
  name: string;
  advisorName: string;
  advisorPhone?: string;
  location?: string;
}

export type RegistrationStatus = 'not_registered' | 'draft' | 'pending_teacher' | 'approved' | 'recorded';

export interface RegistrationItem {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  category: CourseCategory;
  orderNumber: number;
  isRegistered: boolean; // ติ๊กช่อง ลงทะเบียน
  isTransferred: boolean; // ติ๊กช่อง เทียบโอน
  remarks: string; // ช่อง หมายเหตุ
}

export interface RegistrationRecord {
  id: string;
  studentId: string;
  studentName: string;
  level: EducationLevel;
  groupCode: string;
  groupName: string;
  term: string; // ภาคเรียนที่ e.g. "1"
  academicYear: string; // ปีการศึกษา e.g. "2567"
  status: RegistrationStatus;
  items: RegistrationItem[];
  totalCredits: number;
  submittedAt?: string;
  approvedAt?: string;
  recordedAt?: string;
  teacherRemarks?: string;
  registrarRemarks?: string;
  studentSignatureName?: string;
  teacherSignatureName?: string;
  registrarSignatureName?: string;
  recordDate?: {
    day: string;
    month: string;
    year: string;
  };
}

export interface SystemSettings {
  institutionName: string;
  term: string;
  academicYear: string;
  registrationOpen: boolean;
  registrationDeadline: string;
  defaultRegistrarName: string;
  maxCreditsPerTerm: number;
}

export type UserRole = 'student' | 'teacher' | 'admin';

export interface CurrentUser {
  role: UserRole;
  student?: Student;
  group?: Group;
  name: string;
}
