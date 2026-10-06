import React, { useState } from 'react';
import { Student, Course, RegistrationRecord, RegistrationItem, SystemSettings } from '../types';
import { EDUCATION_LEVELS } from '../data/initialData';
import { RegistrationDocument } from './RegistrationDocument';
import {
  GraduationCap,
  FileText,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
  Save,
  Send,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface StudentPortalProps {
  student: Student;
  courses: Course[];
  currentRegistration?: RegistrationRecord;
  settings: SystemSettings;
  onSaveRegistration: (record: RegistrationRecord) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  student,
  courses,
  currentRegistration,
  settings,
  onSaveRegistration,
}) => {
  const [showDocModal, setShowDocModal] = useState(false);
  const [saveToast, setSaveToast] = useState('');

  // Find level configuration
  const levelConfig = EDUCATION_LEVELS.find((l) => l.id === student.level) || EDUCATION_LEVELS[2];

  // Filter courses for this student's level only
  const levelCourses = courses.filter((c) => c.level === student.level && c.isActive);
  const compulsoryCourses = levelCourses.filter((c) => c.category === 'compulsory').sort((a, b) => a.orderNumber - b.orderNumber);
  const electiveCourses = levelCourses.filter((c) => c.category === 'elective').sort((a, b) => a.orderNumber - b.orderNumber);

  // Initialize selected items state based on currentRegistration or empty
  const [selectedItems, setSelectedItems] = useState<{
    [courseId: string]: { isRegistered: boolean; isTransferred: boolean; remarks: string };
  }>(() => {
    const map: { [courseId: string]: { isRegistered: boolean; isTransferred: boolean; remarks: string } } = {};
    if (currentRegistration) {
      currentRegistration.items.forEach((item) => {
        map[item.courseId] = {
          isRegistered: item.isRegistered,
          isTransferred: item.isTransferred,
          remarks: item.remarks || '',
        };
      });
    }
    return map;
  });

  // Calculate registered credits
  const totalRegisteredCredits = levelCourses.reduce((sum, course) => {
    const state = selectedItems[course.id];
    if (state?.isRegistered) {
      return sum + course.credits;
    }
    return sum;
  }, 0);

  const totalTransferredCredits = levelCourses.reduce((sum, course) => {
    const state = selectedItems[course.id];
    if (state?.isTransferred) {
      return sum + course.credits;
    }
    return sum;
  }, 0);

  const handleToggleRegister = (courseId: string) => {
    // If registration is locked by recorded status
    if (currentRegistration?.status === 'recorded') {
      alert('ใบลงทะเบียนนี้ได้รับการบันทึกข้อมูลเรียบร้อยแล้ว ไม่สามารถแก้ไขได้');
      return;
    }

    setSelectedItems((prev) => {
      const current = prev[courseId] || { isRegistered: false, isTransferred: false, remarks: '' };
      return {
        ...prev,
        [courseId]: {
          ...current,
          isRegistered: !current.isRegistered,
          // If registered, uncheck transfer
          isTransferred: !current.isRegistered ? false : current.isTransferred,
        },
      };
    });
  };

  const handleToggleTransfer = (courseId: string) => {
    if (currentRegistration?.status === 'recorded') {
      alert('ใบลงทะเบียนนี้ได้รับการบันทึกข้อมูลเรียบร้อยแล้ว ไม่สามารถแก้ไขได้');
      return;
    }

    setSelectedItems((prev) => {
      const current = prev[courseId] || { isRegistered: false, isTransferred: false, remarks: '' };
      return {
        ...prev,
        [courseId]: {
          ...current,
          isTransferred: !current.isTransferred,
          // If transferred, uncheck registered
          isRegistered: !current.isTransferred ? false : current.isRegistered,
        },
      };
    });
  };

  const handleRemarkChange = (courseId: string, remarks: string) => {
    setSelectedItems((prev) => {
      const current = prev[courseId] || { isRegistered: false, isTransferred: false, remarks: '' };
      return {
        ...prev,
        [courseId]: {
          ...current,
          remarks,
        },
      };
    });
  };

  const buildRegistrationRecord = (status: RegistrationRecord['status']): RegistrationRecord => {
    const items: RegistrationItem[] = [];

    levelCourses.forEach((c) => {
      const state = selectedItems[c.id];
      if (state && (state.isRegistered || state.isTransferred || state.remarks)) {
        items.push({
          courseId: c.id,
          courseCode: c.code,
          courseName: c.name,
          credits: c.credits,
          category: c.category,
          orderNumber: c.orderNumber,
          isRegistered: !!state.isRegistered,
          isTransferred: !!state.isTransferred,
          remarks: state.remarks || '',
        });
      }
    });

    const now = new Date();
    const formattedDate = `${now.getFullYear() + 543}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return {
      id: currentRegistration?.id || `reg-${student.id}-${settings.academicYear}-${settings.term}`,
      studentId: student.id,
      studentName: student.fullName,
      level: student.level,
      groupCode: student.groupCode,
      groupName: student.groupName,
      term: settings.term,
      academicYear: settings.academicYear,
      status,
      items,
      totalCredits: totalRegisteredCredits,
      submittedAt: status === 'pending_teacher' ? formattedDate : currentRegistration?.submittedAt,
      studentSignatureName: student.fullName,
      teacherSignatureName: currentRegistration?.teacherSignatureName || student.advisorName,
      registrarSignatureName: currentRegistration?.registrarSignatureName || settings.defaultRegistrarName,
    };
  };

  const handleSaveDraft = () => {
    const record = buildRegistrationRecord('draft');
    onSaveRegistration(record);
    setSaveToast('บันทึกแบบร่างสำเร็จ');
    setTimeout(() => setSaveToast(''), 3000);
  };

  const handleSubmit = () => {
    if (totalRegisteredCredits === 0 && totalTransferredCredits === 0) {
      alert('กรุณาเลือกรายวิชาอย่างน้อย 1 วิชาเพื่อลงทะเบียน');
      return;
    }
    if (totalRegisteredCredits > settings.maxCreditsPerTerm) {
      const confirmExceed = confirm(
        `จำนวนหน่วยกิตที่ลงทะเบียน (${totalRegisteredCredits} นก.) เกินเกณฑ์แนะนำ (${settings.maxCreditsPerTerm} นก.) คุณต้องการยืนยันการส่งลงทะเบียนหรือไม่?`
      );
      if (!confirmExceed) return;
    }

    const record = buildRegistrationRecord('pending_teacher');
    onSaveRegistration(record);
    setSaveToast('ส่งใบลงทะเบียนเรียนเรียบร้อยแล้ว รอครูประจำกลุ่มอนุมัติ');
    setTimeout(() => setSaveToast(''), 4000);
  };

  const getStatusBadge = () => {
    const status = currentRegistration?.status || 'not_registered';
    switch (status) {
      case 'not_registered':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            ยังไม่ได้ลงทะเบียน
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
            <Save className="w-3.5 h-3.5" />
            บันทึกแบบร่าง (ยังไม่ส่ง)
          </span>
        );
      case 'pending_teacher':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            ส่งแล้ว รอครูประจำกลุ่มตรวจสอบอนุมัติ
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ครูอนุมัติแล้ว (พร้อมพิมพ์ใบลงทะเบียน)
          </span>
        );
      case 'recorded':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            บันทึกข้อมูลทะเบียนแล้ว (เสร็จสมบูรณ์)
          </span>
        );
    }
  };

  // Prepare a record object for printable preview even if not yet saved
  const previewRecord = buildRegistrationRecord(currentRegistration?.status || 'draft');

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Student Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">{student.fullName}</h1>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                  รหัสนักศึกษา: {student.id}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{settings.institutionName}</span>
                <span>·</span>
                <span>{levelConfig.name}</span>
                <span>·</span>
                <span>{student.groupName} ({student.groupCode})</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div>{getStatusBadge()}</div>
            <button
              onClick={() => setShowDocModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors whitespace-nowrap"
            >
              <Eye className="w-4 h-4" />
              ดูแบบฟอร์ม / พิมพ์ใบลงทะเบียน
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
          <div>
            <span className="text-slate-400 block text-[11px]">ระดับการศึกษา</span>
            <span className="font-semibold text-slate-800">{levelConfig.shortName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">ภาคเรียน / ปีการศึกษา</span>
            <span className="font-semibold text-slate-800">
              {settings.term}/{settings.academicYear}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">ครูที่ปรึกษา</span>
            <span className="font-semibold text-slate-800">{student.advisorName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">เกณฑ์หน่วยกิต</span>
            <span className="font-semibold text-slate-800">
              ไม่เกิน {settings.maxCreditsPerTerm} นก./ภาคเรียน
            </span>
          </div>
        </div>
      </div>

      {/* Credit Summary Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs text-slate-500 block">หน่วยกิตลงทะเบียน</span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-2xl font-bold font-mono ${
                  totalRegisteredCredits > settings.maxCreditsPerTerm
                    ? 'text-amber-600'
                    : totalRegisteredCredits > 0
                    ? 'text-emerald-700'
                    : 'text-slate-400'
                }`}
              >
                {totalRegisteredCredits}
              </span>
              <span className="text-xs text-slate-500">
                / สูงสุด {settings.maxCreditsPerTerm} หน่วยกิต
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          <div className="hidden sm:block">
            <span className="text-xs text-slate-500 block">เทียบโอน</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-slate-700">
                {totalTransferredCredits}
              </span>
              <span className="text-xs text-slate-500">หน่วยกิต</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            บันทึกแบบร่าง
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            บันทึกและส่งลงทะเบียน
          </button>
        </div>
      </div>

      {/* Course Selection Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              รายวิชาที่เปิดให้ลงทะเบียน ({levelConfig.documentTitle})
            </h2>
            <p className="text-xs text-slate-500">
              ทำเครื่องหมายถูก (✓) ในช่อง "ลงทะเบียน" หรือ "เทียบโอน" เพื่อเลือกรายวิชา
            </p>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            มี {levelCourses.length} รายวิชาในระดับนี้
          </div>
        </div>

        {/* Compulsory Courses Table */}
        <div className="overflow-x-auto">
          <div className="bg-emerald-50/70 px-4 py-2 text-xs font-semibold text-emerald-900 border-y border-emerald-100 flex items-center justify-between">
            <span>1. วิชาบังคับ ({compulsoryCourses.length} รายวิชา)</span>
            <span className="text-[11px] font-normal text-emerald-700">
              เลือกตามแผนการเรียนที่ครูแนะนำ
            </span>
          </div>

          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold text-center w-12">ที่</th>
                <th className="py-2.5 px-3 font-semibold w-28">รหัสวิชา</th>
                <th className="py-2.5 px-3 font-semibold">ชื่อสาระการเรียนรู้ / รายวิชา</th>
                <th className="py-2.5 px-3 font-semibold text-center w-20">หน่วยกิต</th>
                <th className="py-2.5 px-3 font-semibold text-center w-24">ลงทะเบียน</th>
                <th className="py-2.5 px-3 font-semibold text-center w-24">เทียบโอน</th>
                <th className="py-2.5 px-3 font-semibold w-36">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {compulsoryCourses.map((course, idx) => {
                const state = selectedItems[course.id] || {
                  isRegistered: false,
                  isTransferred: false,
                  remarks: '',
                };

                return (
                  <tr
                    key={course.id}
                    className={`hover:bg-slate-50/60 transition-colors ${
                      state.isRegistered ? 'bg-emerald-50/30' : state.isTransferred ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono font-medium text-slate-700">{course.code}</td>
                    <td className="py-2 px-3 font-medium text-slate-800">{course.name}</td>
                    <td className="py-2 px-3 text-center font-mono font-semibold text-slate-700">
                      {course.credits}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={state.isRegistered}
                          onChange={() => handleToggleRegister(course.id)}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        />
                      </label>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={state.isTransferred}
                          onChange={() => handleToggleTransfer(course.id)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </label>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={state.remarks}
                        onChange={(e) => handleRemarkChange(course.id, e.target.value)}
                        placeholder="ระบุเพิ่มเติม..."
                        className="w-full text-xs px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded outline-none transition-all"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Elective Courses Table */}
          <div className="bg-blue-50/70 px-4 py-2 text-xs font-semibold text-blue-900 border-y border-blue-100 flex items-center justify-between mt-4">
            <span>2. วิชาเลือกเสรี ({electiveCourses.length} รายวิชา)</span>
            <span className="text-[11px] font-normal text-blue-700">
              เลือกตามความสนใจหรือที่เปิดสอนในภาคเรียนนี้
            </span>
          </div>

          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold text-center w-12">ที่</th>
                <th className="py-2.5 px-3 font-semibold w-28">รหัสวิชา</th>
                <th className="py-2.5 px-3 font-semibold">ชื่อสาระการเรียนรู้ / รายวิชา</th>
                <th className="py-2.5 px-3 font-semibold text-center w-20">หน่วยกิต</th>
                <th className="py-2.5 px-3 font-semibold text-center w-24">ลงทะเบียน</th>
                <th className="py-2.5 px-3 font-semibold text-center w-24">เทียบโอน</th>
                <th className="py-2.5 px-3 font-semibold w-36">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {electiveCourses.map((course, idx) => {
                const state = selectedItems[course.id] || {
                  isRegistered: false,
                  isTransferred: false,
                  remarks: '',
                };

                return (
                  <tr
                    key={course.id}
                    className={`hover:bg-slate-50/60 transition-colors ${
                      state.isRegistered ? 'bg-emerald-50/30' : state.isTransferred ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono font-medium text-slate-700">{course.code}</td>
                    <td className="py-2 px-3 font-medium text-slate-800">{course.name}</td>
                    <td className="py-2 px-3 text-center font-mono font-semibold text-slate-700">
                      {course.credits}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={state.isRegistered}
                          onChange={() => handleToggleRegister(course.id)}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        />
                      </label>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={state.isTransferred}
                          onChange={() => handleToggleTransfer(course.id)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </label>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={state.remarks}
                        onChange={(e) => handleRemarkChange(course.id, e.target.value)}
                        placeholder="ระบุเพิ่มเติม..."
                        className="w-full text-xs px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded outline-none transition-all"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for full official document preview & PDF generation (Full-Screen A4) */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 flex flex-col items-center justify-start overflow-y-auto no-scrollbar p-0 sm:py-6 print:p-0 print:bg-white print:static print:overflow-visible">
          {/* Floating Action Bar (Screen only) */}
          <div className="no-print sticky top-3 z-50 mb-4 flex items-center gap-2.5 bg-slate-900/95 text-white backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl border border-slate-700">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ใบลงทะเบียน A4</span>
            </button>
            <button
              type="button"
              onClick={() => setShowDocModal(false)}
              className="inline-flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors border border-slate-700"
            >
              <span className="text-sm">✕</span>
              <span>ปิดหน้าต่าง</span>
            </button>
          </div>

          {/* Full A4 Document (No frame, no border, single page) */}
          <div className="w-auto mx-auto print:m-0 print:p-0">
            <RegistrationDocument
              record={previewRecord}
              student={student}
              allCoursesForLevel={levelCourses}
              settings={settings}
              onClose={() => setShowDocModal(false)}
              hideActionToolbar={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
