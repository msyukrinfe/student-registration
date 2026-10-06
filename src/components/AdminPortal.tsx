import React, { useState } from 'react';
import {
  Course,
  Student,
  Group,
  RegistrationRecord,
  SystemSettings,
  EducationLevel,
  CourseCategory,
} from '../types';
import { EDUCATION_LEVELS, INITIAL_COURSES } from '../data/initialData';
import { RegistrationDocument } from './RegistrationDocument';
import {
  Shield,
  BarChart3,
  BookOpen,
  Users,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  FileCheck,
  RotateCcw,
  Building,
  Check,
  X,
  Layers,
} from 'lucide-react';

interface AdminPortalProps {
  courses: Course[];
  students: Student[];
  groups: Group[];
  registrations: RegistrationRecord[];
  settings: SystemSettings;
  onUpdateCourses: (courses: Course[]) => void;
  onUpdateStudents: (students: Student[]) => void;
  onUpdateGroups: (groups: Group[]) => void;
  onUpdateRegistrations: (registrations: RegistrationRecord[]) => void;
  onUpdateSettings: (settings: SystemSettings) => void;
  onResetAllData?: () => Promise<boolean> | void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  courses,
  students,
  groups,
  registrations,
  settings,
  onUpdateCourses,
  onUpdateStudents,
  onUpdateGroups,
  onUpdateRegistrations,
  onUpdateSettings,
  onResetAllData,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'overview' | 'courses' | 'students' | 'settings'>('overview');
  const [resetToast, setResetToast] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Course Management states
  const [courseLevelTab, setCourseLevelTab] = useState<EducationLevel>('senior_high');
  const [courseCategoryFilter, setCourseCategoryFilter] = useState<'all' | CourseCategory>('all');
  const [courseSearch, setCourseSearch] = useState('');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);

  // Form states for new/edit course
  const [courseFormData, setCourseFormData] = useState<{
    code: string;
    name: string;
    credits: number;
    category: CourseCategory;
    orderNumber: number;
    level: EducationLevel;
  }>({
    code: '',
    name: '',
    credits: 3,
    category: 'compulsory',
    orderNumber: 1,
    level: 'senior_high',
  });

  // Settings form states
  const [tempSettings, setTempSettings] = useState<SystemSettings>({ ...settings });
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Document preview state
  const [previewDoc, setPreviewDoc] = useState<{
    record: RegistrationRecord;
    student: Student;
  } | null>(null);

  // Group filter for overview
  const [overviewGroupFilter, setOverviewGroupFilter] = useState<string>('all');

  // Student list filters & pagination
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentLevelFilter, setStudentLevelFilter] = useState<'all' | EducationLevel>('all');
  const [studentPage, setStudentPage] = useState(1);
  const pageSize = 50;

  // Course handlers
  const handleOpenAddCourse = () => {
    const existingInLevel = courses.filter((c) => c.level === courseLevelTab && c.category === 'compulsory');
    setCourseFormData({
      code: '',
      name: '',
      credits: 3,
      category: 'compulsory',
      orderNumber: existingInLevel.length + 1,
      level: courseLevelTab,
    });
    setEditingCourse(null);
    setIsAddCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseFormData({
      code: course.code,
      name: course.name,
      credits: course.credits,
      category: course.category,
      orderNumber: course.orderNumber,
      level: course.level,
    });
    setIsAddCourseModalOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormData.code.trim() || !courseFormData.name.trim()) {
      alert('กรุณากรอกรหัสวิชาและชื่อวิชาให้ครบถ้วน');
      return;
    }

    if (editingCourse) {
      // Update existing course
      const updated = courses.map((c) =>
        c.id === editingCourse.id
          ? {
              ...c,
              ...courseFormData,
            }
          : c
      );
      onUpdateCourses(updated);
    } else {
      // Add new course
      const newCourse: Course = {
        id: `custom-${Date.now()}`,
        ...courseFormData,
        isActive: true,
      };
      onUpdateCourses([...courses, newCourse]);
    }
    setIsAddCourseModalOpen(false);
    setEditingCourse(null);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm('คุณต้องการลบรายวิชานี้ออกจากฐานข้อมูลหรือไม่?')) {
      onUpdateCourses(courses.filter((c) => c.id !== courseId));
    }
  };

  const handleResetDefaultCourses = () => {
    if (confirm('ต้องการคืนค่ารายวิชาเริ่มต้นตามหลักสูตรทางการของ กศน./สกร. หรือไม่?')) {
      onUpdateCourses(INITIAL_COURSES);
    }
  };

  // Registrar central recording action: record all approved registrations
  const handleRecordAllApproved = () => {
    const now = new Date();
    const day = String(now.getDate());
    const monthNames = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
    ];
    const month = monthNames[now.getMonth()];
    const year = String(now.getFullYear() + 543);

    const approvedList = registrations.filter((r) => r.status === 'approved');
    if (approvedList.length === 0) {
      alert('ไม่มีรายการที่มีสถานะ "ครูอนุมัติแล้ว" เพื่อบันทึกข้อมูล');
      return;
    }

    if (confirm(`บันทึกข้อมูลทะเบียนกลางสำหรับ ${approvedList.length} รายการใช่หรือไม่?`)) {
      const updated = registrations.map((r) => {
        if (r.status === 'approved') {
          return {
            ...r,
            status: 'recorded' as const,
            recordedAt: `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-${day}`,
            registrarSignatureName: settings.defaultRegistrarName,
            recordDate: { day, month, year },
          };
        }
        return r;
      });
      onUpdateRegistrations(updated);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(tempSettings);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  // Calculate Overview Statistics
  const totalStudents = students.length;
  const registeredCount = registrations.filter((r) => r.items && r.items.length > 0).length;
  const pendingTeacherCount = registrations.filter((r) => r.status === 'pending_teacher').length;
  const approvedCount = registrations.filter((r) => r.status === 'approved').length;
  const recordedCount = registrations.filter((r) => r.status === 'recorded').length;

  // Filter courses for active level tab
  const displayedCourses = courses
    .filter((c) => c.level === courseLevelTab)
    .filter((c) => (courseCategoryFilter === 'all' ? true : c.category === courseCategoryFilter))
    .filter((c) => {
      if (!courseSearch.trim()) return true;
      const q = courseSearch.toLowerCase();
      return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (a.category !== b.category) {
        return a.category === 'compulsory' ? -1 : 1;
      }
      return a.orderNumber - b.orderNumber;
    });

  const handleResetDatabaseClick = async () => {
    if (
      window.confirm(
        'คุณต้องการล้างฐานข้อมูลเดิมทั้งหมด แล้วดึงข้อมูลจาก 2 ไฟล์ (1,040 คน) แทนใช่หรือไม่?\n\n• ระดับประถมศึกษา: 69 คน\n• ระดับมัธยมศึกษาตอนต้น: 465 คน\n• ระดับมัธยมศึกษาตอนปลาย: 506 คน\n• รวมทั้งหมด: 1,040 คน'
      )
    ) {
      if (onResetAllData) {
        setIsResetting(true);
        await onResetAllData();
        setIsResetting(false);
        setResetToast(true);
        setTimeout(() => setResetToast(false), 6000);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification for Settings */}
      {settingsSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>บันทึกการตั้งค่าระบบเรียบร้อยแล้ว</span>
        </div>
      )}

      {/* Toast Notification for Database Reset */}
      {resetToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 text-white text-xs px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-700 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold text-sm">ล้างฐานข้อมูลเดิมและนำเข้าข้อมูลใหม่เรียบร้อยแล้ว!</p>
            <p className="text-emerald-200 text-[11px] mt-0.5">รวม 1,040 คน (ประถม 69 คน, ม.ต้น 465 คน, ม.ปลาย 506 คน)</p>
          </div>
        </div>
      )}

      {/* Admin Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">ระบบหลังบ้านงานทะเบียน (Admin Console)</h1>
                <span className="text-xs bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded font-medium">
                  ผู้ดูแลระบบ
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {settings.institutionName} · ภาคเรียนที่ {settings.term}/{settings.academicYear} · จัดการฐานข้อมูลและภาพรวมทั้งระบบ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleResetDatabaseClick}
              disabled={isResetting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl shadow-xs transition-colors disabled:opacity-50"
              title="ล้างฐานข้อมูลเดิมทั้งหมด แล้วดึงข้อมูลจาก 2 ไฟล์ (1,040 คน) ใหม่ทันที"
            >
              <RotateCcw className={`w-4 h-4 text-rose-600 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'กำลังล้างและดึงข้อมูล...' : 'ล้างและดึงข้อมูลจาก 2 ไฟล์ (1,040 คน)'}</span>
            </button>

            {approvedCount > 0 && (
              <button
                onClick={handleRecordAllApproved}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
                title="ลงนามและบันทึกข้อมูลเข้าระบบทะเบียนกลาง"
              >
                <FileCheck className="w-4 h-4" />
                บันทึกข้อมูลทะเบียน ({approvedCount} รายการ)
              </button>
            )}
          </div>
        </div>

        {/* 4 Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveMainTab('overview')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
              activeMainTab === 'overview'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-purple-600" />
            1. ภาพรวมการลงทะเบียน
          </button>
          <button
            onClick={() => setActiveMainTab('courses')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
              activeMainTab === 'courses'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            2. จัดการฐานข้อมูลรายวิชา
          </button>
          <button
            onClick={() => setActiveMainTab('students')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
              activeMainTab === 'students'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            3. นักศึกษาและกลุ่มเรียน
          </button>
          <button
            onClick={() => setActiveMainTab('settings')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
              activeMainTab === 'settings'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-amber-600" />
            4. ตั้งค่าระบบงานทะเบียน
          </button>
        </div>
      </div>

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeMainTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">นักศึกษาทั้งหมด</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-800">{totalStudents}</span>
                <span className="text-xs text-slate-400">คน</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                ครอบคลุม 3 ระดับการศึกษา
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-blue-700 block font-medium">รอครูตรวจสอบอนุมัติ</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-blue-800">{pendingTeacherCount}</span>
                <span className="text-xs text-blue-600">คน</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                {Math.round((pendingTeacherCount / (totalStudents || 1)) * 100)}% ของนักศึกษาทั้งหมด
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-emerald-700 block font-medium">ครูอนุมัติแล้ว</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-emerald-800">{approvedCount}</span>
                <span className="text-xs text-emerald-600">คน</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                พร้อมบันทึกทะเบียนกลาง
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-teal-700 block font-medium">บันทึกข้อมูลทะเบียนแล้ว</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-teal-800">{recordedCount}</span>
                <span className="text-xs text-teal-600">คน</span>
              </div>
              <div className="text-[11px] text-teal-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                เสร็จสมบูรณ์ 100%
              </div>
            </div>
          </div>

          {/* 3 Education Level Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">ระดับประถมศึกษา</span>
                <span className="text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full font-semibold font-mono">
                  กลุ่ม 21xxxx
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-amber-950">
                  {students.filter((s) => s.level === 'primary').length}
                </span>
                <span className="text-xs text-amber-800">คน</span>
              </div>
              <p className="text-[11px] text-amber-700/90 mt-1">
                7 กลุ่มที่มีผู้เรียนลงทะเบียนในภาคเรียนนี้
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">ระดับมัธยมศึกษาตอนต้น</span>
                <span className="text-[10px] bg-blue-200/70 text-blue-900 px-2 py-0.5 rounded-full font-semibold font-mono">
                  กลุ่ม 22xxxx
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-blue-950">
                  {students.filter((s) => s.level === 'junior_high').length}
                </span>
                <span className="text-xs text-blue-800">คน</span>
              </div>
              <p className="text-[11px] text-blue-700/90 mt-1">
                ครอบคลุม 23 กลุ่ม ศกร.ตำบล
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">ระดับมัธยมศึกษาตอนปลาย</span>
                <span className="text-[10px] bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-full font-semibold font-mono">
                  กลุ่ม 23xxxx
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-emerald-950">
                  {students.filter((s) => s.level === 'senior_high').length}
                </span>
                <span className="text-xs text-emerald-800">คน</span>
              </div>
              <p className="text-[11px] text-emerald-700/90 mt-1">
                ครอบคลุม 23 กลุ่ม ศกร.ตำบล
              </p>
            </div>
          </div>

          {/* Group Overview Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  สรุปความคืบหน้าการลงทะเบียนเรียนรายกลุ่ม (ศูนย์ส่งเสริมการเรียนรู้ระดับอำเภอยี่งอ)
                </h2>
                <p className="text-xs text-slate-500">
                  ติดตามสถานะนักศึกษาของแต่ละ ศกร.ตำบล
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200">
                    <th className="py-3 px-4 font-semibold w-24">รหัสกลุ่ม</th>
                    <th className="py-3 px-4 font-semibold">ชื่อกลุ่ม / สถานที่</th>
                    <th className="py-3 px-4 font-semibold">ครูประจำกลุ่ม</th>
                    <th className="py-3 px-4 font-semibold text-center w-24">นักศึกษา</th>
                    <th className="py-3 px-4 font-semibold text-center w-28">รอครูอนุมัติ</th>
                    <th className="py-3 px-4 font-semibold text-center w-28">อนุมัติแล้ว</th>
                    <th className="py-3 px-4 font-semibold text-center w-28">บันทึกแล้ว</th>
                    <th className="py-3 px-4 font-semibold text-center w-36">ความคืบหน้า</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groups.map((grp) => {
                    const stdsInGroup = students.filter((s) => s.groupCode === grp.code);
                    const regsInGroup = registrations.filter((r) => r.groupCode === grp.code);
                    const pendingInGroup = regsInGroup.filter((r) => r.status === 'pending_teacher').length;
                    const approvedInGroup = regsInGroup.filter((r) => r.status === 'approved').length;
                    const recordedInGroup = regsInGroup.filter((r) => r.status === 'recorded').length;
                    const completedInGroup = approvedInGroup + recordedInGroup;
                    const percent = stdsInGroup.length > 0 ? Math.round((completedInGroup / stdsInGroup.length) * 100) : 0;

                    return (
                      <tr key={grp.code} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-700">{grp.code}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{grp.name}</div>
                          <div className="text-[11px] text-slate-400">{grp.location}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">{grp.advisorName}</td>
                        <td className="py-3 px-4 text-center font-mono font-semibold text-slate-800">
                          {stdsInGroup.length}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {pendingInGroup > 0 ? (
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              {pendingInGroup}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {approvedInGroup > 0 ? (
                            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              {approvedInGroup}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {recordedInGroup > 0 ? (
                            <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                              {recordedInGroup}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-2 rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                            {percent}% ({completedInGroup}/{stdsInGroup.length})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Level Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {EDUCATION_LEVELS.map((lvl) => {
              const stdsInLvl = students.filter((s) => s.level === lvl.id);
              const regsInLvl = registrations.filter((r) => r.level === lvl.id && r.status !== 'draft');
              const coursesInLvl = courses.filter((c) => c.level === lvl.id);
              const compulsoryCount = coursesInLvl.filter((c) => c.category === 'compulsory').length;
              const electiveCount = coursesInLvl.filter((c) => c.category === 'elective').length;

              return (
                <div key={lvl.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <h3 className="text-sm font-bold text-slate-800">{lvl.name}</h3>
                    <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      {lvl.shortName}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">นักศึกษาในระดับนี้:</span>
                      <strong className="font-mono text-slate-800">{stdsInLvl.length} คน</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ส่งลงทะเบียนแล้ว:</span>
                      <strong className="font-mono text-emerald-700">{regsInLvl.length} คน</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">รายวิชาในหลักสูตร:</span>
                      <strong className="font-mono text-slate-700">
                        บังคับ {compulsoryCount} / เลือก {electiveCount} วิชา
                      </strong>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCourseLevelTab(lvl.id);
                      setActiveMainTab('courses');
                    }}
                    className="w-full mt-4 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-medium transition-colors border border-slate-200"
                  >
                    จัดการรายวิชา {lvl.shortName} →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: COURSE DATABASE ================= */}
      {activeMainTab === 'courses' && (
        <div className="space-y-6">
          {/* Level Switcher (ประถมศึกษา / ม.ต้น / ม.ปลาย) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  ฐานข้อมูลรายวิชา 3 ระดับการศึกษา (ศูนย์ส่งเสริมการเรียนรู้ระดับอำเภอยี่งอ)
                </h2>
                <p className="text-xs text-slate-500">
                  จัดการรายวิชาบังคับและวิชาเลือกเสรีที่ปรากฏในแบบฟอร์มใบลงทะเบียนของแต่ละระดับ
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetDefaultCourses}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  title="คืนค่ารายวิชาเริ่มต้นตามเอกสาร กศน./สกร."
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  คืนค่าเริ่มต้น
                </button>
                <button
                  onClick={handleOpenAddCourse}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มรายวิชาใหม่
                </button>
              </div>
            </div>

            {/* Level selection buttons */}
            <div className="grid grid-cols-3 gap-2">
              {EDUCATION_LEVELS.map((lvl) => {
                const count = courses.filter((c) => c.level === lvl.id).length;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => setCourseLevelTab(lvl.id)}
                    className={`py-3 px-4 rounded-xl text-xs font-semibold border transition-all text-left ${
                      courseLevelTab === lvl.id
                        ? 'bg-emerald-50/80 border-emerald-400 text-emerald-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-sm font-bold">{lvl.name}</div>
                    <div className="text-[11px] opacity-75 font-normal mt-0.5">
                      {count} รายวิชาในแบบฟอร์ม
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Course filter & search bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setCourseCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  courseCategoryFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ทั้งหมด ({courses.filter((c) => c.level === courseLevelTab).length})
              </button>
              <button
                onClick={() => setCourseCategoryFilter('compulsory')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  courseCategoryFilter === 'compulsory'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                วิชาบังคับ ({courses.filter((c) => c.level === courseLevelTab && c.category === 'compulsory').length})
              </button>
              <button
                onClick={() => setCourseCategoryFilter('elective')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  courseCategoryFilter === 'elective'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                วิชาเลือกเสรี ({courses.filter((c) => c.level === courseLevelTab && c.category === 'elective').length})
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="ค้นหารหัสวิชา หรือชื่อวิชา..."
                className="text-xs bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Courses Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200">
                    <th className="py-3 px-3 font-semibold text-center w-12">ลำดับ</th>
                    <th className="py-3 px-3 font-semibold w-28">รหัสวิชา</th>
                    <th className="py-3 px-3 font-semibold">ชื่อสาระการเรียนรู้ / รายวิชา</th>
                    <th className="py-3 px-3 font-semibold w-28">หมวดวิชา</th>
                    <th className="py-3 px-3 font-semibold text-center w-20">หน่วยกิต</th>
                    <th className="py-3 px-3 font-semibold text-center w-24">สถานะ</th>
                    <th className="py-3 px-3 font-semibold text-right w-28">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedCourses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        ไม่พบรายวิชาตามเงื่อนไขที่ค้นหา
                      </td>
                    </tr>
                  ) : (
                    displayedCourses.map((c, idx) => (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 text-center text-slate-400 font-mono">{c.orderNumber}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">{c.code}</td>
                        <td className="py-3 px-3 font-medium text-slate-900">{c.name}</td>
                        <td className="py-3 px-3">
                          {c.category === 'compulsory' ? (
                            <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium">
                              วิชาบังคับ
                            </span>
                          ) : (
                            <span className="inline-block bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-medium">
                              วิชาเลือกเสรี
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                          {c.credits}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-block bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-[11px] font-medium">
                            เปิดสอน
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditCourse(c)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                              title="แก้ไขรายวิชา"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(c.id)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="ลบรายวิชา"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: STUDENTS & GROUPS ================= */}
      {activeMainTab === 'students' && (() => {
        const filteredStudents = students.filter((s) => {
          if (studentLevelFilter !== 'all' && s.level !== studentLevelFilter) return false;
          if (studentSearchQuery.trim()) {
            const q = studentSearchQuery.toLowerCase().trim();
            return (
              s.fullName.toLowerCase().includes(q) ||
              s.id.includes(q) ||
              s.groupCode.includes(q) ||
              s.advisorName.toLowerCase().includes(q)
            );
          }
          return true;
        });

        const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
        const currentPage = Math.min(studentPage, totalPages);
        const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

        const primaryCount = students.filter((s) => s.level === 'primary').length;
        const juniorCount = students.filter((s) => s.level === 'junior_high').length;
        const seniorCount = students.filter((s) => s.level === 'senior_high').length;

        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    ฐานข้อมูลนักศึกษาทั้งหมด ({students.length} คน)
                  </h2>
                  <p className="text-xs text-slate-500">
                    ประถม: {primaryCount} คน · ม.ต้น: {juniorCount} คน · ม.ปลาย: {seniorCount} คน
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Search box */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="ค้นหารหัส, ชื่อ-สกุล, กลุ่ม..."
                      value={studentSearchQuery}
                      onChange={(e) => {
                        setStudentSearchQuery(e.target.value);
                        setStudentPage(1);
                      }}
                      className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs w-56 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>

                  {/* Level Filter Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setStudentLevelFilter('all');
                        setStudentPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        studentLevelFilter === 'all'
                          ? 'bg-white text-slate-900 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ทั้งหมด ({students.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStudentLevelFilter('primary');
                        setStudentPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        studentLevelFilter === 'primary'
                          ? 'bg-amber-600 text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ประถม ({primaryCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStudentLevelFilter('junior_high');
                        setStudentPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        studentLevelFilter === 'junior_high'
                          ? 'bg-blue-600 text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ม.ต้น ({juniorCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStudentLevelFilter('senior_high');
                        setStudentPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        studentLevelFilter === 'senior_high'
                          ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ม.ปลาย ({seniorCount})
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200">
                      <th className="py-3 px-3 font-semibold text-center w-12">ที่</th>
                      <th className="py-3 px-3 font-semibold w-28">รหัสนักศึกษา</th>
                      <th className="py-3 px-3 font-semibold">ชื่อ - สกุล</th>
                      <th className="py-3 px-3 font-semibold w-28">ระดับการศึกษา</th>
                      <th className="py-3 px-3 font-semibold">กลุ่มเรียน</th>
                      <th className="py-3 px-3 font-semibold">ครูที่ปรึกษา</th>
                      <th className="py-3 px-3 font-semibold text-center w-28">สถานะการลงทะเบียน</th>
                      <th className="py-3 px-3 font-semibold text-right w-24">แบบฟอร์ม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          ไม่พบข้อมูลนักศึกษาตามเงื่อนไขที่ค้นหา
                        </td>
                      </tr>
                    ) : (
                      paginatedStudents.map((std, idx) => {
                        const reg = registrations.find((r) => r.studentId === std.id);
                        const lvlConfig = EDUCATION_LEVELS.find((l) => l.id === std.level);
                        const rowNumber = (currentPage - 1) * pageSize + idx + 1;

                        return (
                          <tr key={std.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{rowNumber}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{std.id}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">{std.fullName}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                std.level === 'primary' ? 'bg-amber-100 text-amber-800' :
                                std.level === 'junior_high' ? 'bg-blue-100 text-blue-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {lvlConfig?.shortName}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {std.groupName} ({std.groupCode})
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">{std.advisorName}</td>
                            <td className="py-2.5 px-3 text-center">
                              {reg?.status === 'recorded' ? (
                                <span className="inline-block bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-[11px] font-medium border border-teal-200">
                                  บันทึกแล้ว
                                </span>
                              ) : reg?.status === 'approved' ? (
                                <span className="inline-block bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-200">
                                  ครูอนุมัติแล้ว
                                </span>
                              ) : reg?.status === 'pending_teacher' ? (
                                <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px] font-medium border border-blue-200">
                                  รอครูอนุมัติ
                                </span>
                              ) : (
                                <span className="inline-block bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200">
                                  ยังไม่ลงทะเบียน
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {reg && reg.items && reg.items.length > 0 ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewDoc({
                                      record: reg,
                                      student: std,
                                    })
                                  }
                                  className="p-1.5 text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                  title="ดูและพิมพ์ใบลงทะเบียน (PDF)"
                                >
                                  <FileCheck className="w-4 h-4" />
                                </button>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination bar */}
              {totalPages > 1 && (
                <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-slate-50/50">
                  <span>
                    แสดง {Math.min((currentPage - 1) * pageSize + 1, filteredStudents.length)} -{' '}
                    {Math.min(currentPage * pageSize, filteredStudents.length)} จาก {filteredStudents.length} คน
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setStudentPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                    >
                      ก่อนหน้า
                    </button>
                    <span className="px-2 font-mono font-medium">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setStudentPage((p) => Math.min(totalPages, p + 1))}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                    >
                      ถัดไป
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ================= TAB 4: SETTINGS ================= */}
      {activeMainTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl">
          <h2 className="text-sm font-bold text-slate-900 mb-1">
            ตั้งค่าระบบงานทะเบียนและข้อมูลแบบฟอร์ม
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            ข้อมูลเหล่านี้จะถูกนำไปแสดงบนหัวกระดาษและท้ายกระดาษของใบลงทะเบียนเรียน
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                ชื่อสถานศึกษา (ปรากฏบนหัวแบบฟอร์ม)
              </label>
              <input
                type="text"
                value={tempSettings.institutionName}
                onChange={(e) => setTempSettings({ ...tempSettings, institutionName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ภาคเรียนที่
                </label>
                <input
                  type="text"
                  value={tempSettings.term}
                  onChange={(e) => setTempSettings({ ...tempSettings, term: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ปีการศึกษา
                </label>
                <input
                  type="text"
                  value={tempSettings.academicYear}
                  onChange={(e) => setTempSettings({ ...tempSettings, academicYear: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ชื่อเจ้าหน้าที่ทะเบียน (ช่องลงนาม)
                </label>
                <input
                  type="text"
                  value={tempSettings.defaultRegistrarName}
                  onChange={(e) => setTempSettings({ ...tempSettings, defaultRegistrarName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  เกณฑ์หน่วยกิตสูงสุดที่แนะนำ (นก./ภาคเรียน)
                </label>
                <input
                  type="number"
                  value={tempSettings.maxCreditsPerTerm}
                  onChange={(e) => setTempSettings({ ...tempSettings, maxCreditsPerTerm: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-xs transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                บันทึกการตั้งค่าระบบ
              </button>
            </div>
          </form>

          {/* Database Reset & Sync Card */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              จัดการฐานข้อมูลจาก 2 ไฟล์ทางการ (Database Reset & Sync)
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              หากต้องการรีเซ็ตฐานข้อมูลเดิมทั้งหมดและดึงข้อมูลใหม่จากไฟล์ฐานข้อมูลครูและฐานข้อมูลผู้เรียน
              ระบบจะตั้งค่าข้อมูลนักศึกษาทั้งหมด <strong>1,040 คน</strong> พร้อมผูกกลุ่มเรียนและครูที่ปรึกษาใหม่อัตโนมัติ
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4 text-xs space-y-1.5 text-slate-700 font-mono">
              <div className="flex justify-between">
                <span className="font-sans text-slate-600">ระดับประถมศึกษา:</span>
                <span className="font-bold text-amber-900">69 คน (7 กลุ่ม)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-slate-600">ระดับมัธยมศึกษาตอนต้น:</span>
                <span className="font-bold text-blue-900">465 คน (21 กลุ่ม)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-slate-600">ระดับมัธยมศึกษาตอนปลาย:</span>
                <span className="font-bold text-emerald-900">506 คน (23 กลุ่ม)</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 text-slate-900 font-bold">
                <span className="font-sans">รวมนักศึกษาทั้งหมด:</span>
                <span className="text-purple-900">1,040 คน (64 กลุ่มเรียน, 23 ครู)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetDatabaseClick}
              disabled={isResetting}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'กำลังล้างและดึงข้อมูลใหม่...' : 'ล้างฐานข้อมูลเดิมทั้งหมด และดึงข้อมูลจาก 2 ไฟล์ (1,040 คน)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Course Modal */}
      {isAddCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingCourse ? 'แก้ไขรายวิชา' : 'เพิ่มรายวิชาใหม่ลงฐานข้อมูล'}
              </h3>
              <button
                onClick={() => setIsAddCourseModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">ระดับการศึกษา</label>
                <select
                  value={courseFormData.level}
                  onChange={(e) =>
                    setCourseFormData({ ...courseFormData, level: e.target.value as EducationLevel })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white outline-none"
                >
                  {EDUCATION_LEVELS.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">หมวดวิชา</label>
                <select
                  value={courseFormData.category}
                  onChange={(e) =>
                    setCourseFormData({ ...courseFormData, category: e.target.value as CourseCategory })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white outline-none"
                >
                  <option value="compulsory">วิชาบังคับ</option>
                  <option value="elective">วิชาเลือกเสรี</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">รหัสวิชา</label>
                  <input
                    type="text"
                    value={courseFormData.code}
                    onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value })}
                    placeholder="เช่น สค32029 หรือ ทร31001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">จำนวนหน่วยกิต</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={courseFormData.credits}
                    onChange={(e) => setCourseFormData({ ...courseFormData, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ชื่อสาระการเรียนรู้ / รายวิชา
                </label>
                <input
                  type="text"
                  value={courseFormData.name}
                  onChange={(e) => setCourseFormData({ ...courseFormData, name: e.target.value })}
                  placeholder="เช่น การเงินเพื่อชีวิต 3 หรือ ทักษะการเรียนรู้"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCourseModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs transition-colors"
                >
                  {editingCourse ? 'บันทึกการแก้ไข' : 'เพิ่มรายวิชา'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  ใบลงทะเบียน: {previewDoc.student.fullName} ({previewDoc.student.id})
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-700 text-sm px-2 py-1 rounded"
              >
                ✕ ปิดหน้าต่าง
              </button>
            </div>

            <RegistrationDocument
              record={previewDoc.record}
              student={previewDoc.student}
              allCoursesForLevel={courses.filter((c) => c.level === previewDoc.student.level)}
              settings={settings}
              onClose={() => setPreviewDoc(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
