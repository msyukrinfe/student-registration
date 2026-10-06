import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Group, Student, Course, RegistrationRecord, RegistrationItem, SystemSettings, EducationLevel } from '../types';
import { EDUCATION_LEVELS } from '../data/initialData';
import { RAW_TEACHERS } from '../data/allTeachers';
import { RegistrationDocument } from './RegistrationDocument';
import {
  Users,
  CheckCircle2,
  Clock,
  Printer,
  Check,
  Search,
  Layers,
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Save,
  AlertCircle,
  FileText,
  UserCheck,
  RotateCcw,
  PlusCircle,
  X,
  FileCheck,
} from 'lucide-react';

interface TeacherPortalProps {
  group: Group;
  students: Student[];
  courses: Course[];
  registrations: RegistrationRecord[];
  settings: SystemSettings;
  onUpdateRegistration: (record: RegistrationRecord) => void;
  onBatchApprove: (studentIds: string[]) => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  group,
  students,
  courses,
  registrations,
  settings,
  onUpdateRegistration,
}) => {
  // Find all groups managed by this teacher
  const teacherRecord = RAW_TEACHERS.find((t) => t.groupCodes.includes(group.code));
  const assignedGroupCodes = teacherRecord?.groupCodes || [group.code];

  // Search input state
  const [studentInput, setStudentInput] = useState('');
  const [searchError, setSearchError] = useState('');
  const [saveToast, setSaveToast] = useState('');

  // Currently selected student for registration
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  // Modal for printable official registration document
  const [showDocModal, setShowDocModal] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input on initial load or reset
  useEffect(() => {
    if (!activeStudent && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeStudent]);

  // Find existing registration for the active student
  const activeStudentRegistration = useMemo(() => {
    if (!activeStudent) return undefined;
    return registrations.find(
      (r) =>
        r.studentId === activeStudent.id &&
        r.term === settings.term &&
        r.academicYear === settings.academicYear
    );
  }, [activeStudent, registrations, settings.term, settings.academicYear]);

  // Selected courses map: { [courseId]: { isRegistered, isTransferred, remarks } }
  const [selectedItems, setSelectedItems] = useState<{
    [courseId: string]: { isRegistered: boolean; isTransferred: boolean; remarks: string };
  }>({});

  // Sync selected items when activeStudent or existing registration changes
  useEffect(() => {
    if (!activeStudent) {
      setSelectedItems({});
      return;
    }

    const map: { [courseId: string]: { isRegistered: boolean; isTransferred: boolean; remarks: string } } = {};
    if (activeStudentRegistration && activeStudentRegistration.items) {
      activeStudentRegistration.items.forEach((item) => {
        map[item.courseId] = {
          isRegistered: !!item.isRegistered,
          isTransferred: !!item.isTransferred,
          remarks: item.remarks || '',
        };
      });
    }
    setSelectedItems(map);
  }, [activeStudent, activeStudentRegistration]);

  // Filter courses for active student's education level
  const studentLevelCourses = useMemo(() => {
    if (!activeStudent) return [];
    return courses.filter((c) => c.level === activeStudent.level && c.isActive);
  }, [activeStudent, courses]);

  const compulsoryCourses = useMemo(() => {
    return studentLevelCourses
      .filter((c) => c.category === 'compulsory')
      .sort((a, b) => a.orderNumber - b.orderNumber);
  }, [studentLevelCourses]);

  const electiveCourses = useMemo(() => {
    return studentLevelCourses
      .filter((c) => c.category === 'elective')
      .sort((a, b) => a.orderNumber - b.orderNumber);
  }, [studentLevelCourses]);

  // Realtime search suggestions (up to 6 students)
  const searchSuggestions = useMemo(() => {
    const q = studentInput.trim().toLowerCase();
    if (!q || activeStudent) return [];
    return students
      .filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.fullName.toLowerCase().includes(q) ||
          s.groupCode.includes(q)
      )
      .slice(0, 6);
  }, [studentInput, students, activeStudent]);

  // Total calculated credits
  const totalRegisteredCredits = useMemo(() => {
    return studentLevelCourses.reduce((sum, course) => {
      const state = selectedItems[course.id];
      if (state?.isRegistered) {
        return sum + Number(course.credits || 0);
      }
      return sum;
    }, 0);
  }, [studentLevelCourses, selectedItems]);

  const totalTransferredCredits = useMemo(() => {
    return studentLevelCourses.reduce((sum, course) => {
      const state = selectedItems[course.id];
      if (state?.isTransferred) {
        return sum + Number(course.credits || 0);
      }
      return sum;
    }, 0);
  }, [studentLevelCourses, selectedItems]);

  // Handle student search submission
  const handleSearchStudent = (idToSearch?: string) => {
    const targetId = (idToSearch || studentInput).trim().replace(/\s+/g, '');
    if (!targetId) {
      setSearchError('กรุณากรอกรหัสนักศึกษา 10 หลัก');
      return;
    }

    // Try finding by exact ID or case-insensitive
    const found = students.find((s) => s.id === targetId || s.id.toLowerCase() === targetId.toLowerCase());
    if (!found) {
      // Also try finding by name if entered name
      const foundByName = students.find((s) => s.fullName.toLowerCase().includes(targetId.toLowerCase()));
      if (foundByName) {
        setActiveStudent(foundByName);
        setSearchError('');
        setStudentInput(foundByName.id);
        return;
      }

      setSearchError(`ไม่พบรหัสนักศึกษา "${targetId}" ในระบบ กรุณาตรวจสอบรหัส 10 หลักอีกครั้ง`);
      return;
    }

    setActiveStudent(found);
    setSearchError('');
    setStudentInput(found.id);
  };

  const handleToggleRegister = (courseId: string) => {
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

  const handleSelectAllCompulsory = () => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      compulsoryCourses.forEach((c) => {
        next[c.id] = {
          isRegistered: true,
          isTransferred: false,
          remarks: prev[c.id]?.remarks || '',
        };
      });
      return next;
    });
  };

  const handleClearAllCourses = () => {
    setSelectedItems({});
  };

  const buildRecord = (status: RegistrationRecord['status']): RegistrationRecord => {
    if (!activeStudent) throw new Error('No active student');

    const items: RegistrationItem[] = [];
    studentLevelCourses.forEach((c) => {
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
      id: activeStudentRegistration?.id || `reg-${activeStudent.id}-${settings.academicYear}-${settings.term}`,
      studentId: activeStudent.id,
      studentName: activeStudent.fullName,
      level: activeStudent.level,
      groupCode: activeStudent.groupCode,
      groupName: activeStudent.groupName,
      term: settings.term,
      academicYear: settings.academicYear,
      status,
      items,
      totalCredits: totalRegisteredCredits,
      submittedAt: activeStudentRegistration?.submittedAt || formattedDate,
      approvedAt: status === 'approved' ? formattedDate : activeStudentRegistration?.approvedAt,
      studentSignatureName: activeStudent.fullName,
      teacherSignatureName: group.advisorName,
      registrarSignatureName: activeStudentRegistration?.registrarSignatureName || settings.defaultRegistrarName,
    };
  };

  const handleSaveAndApprove = () => {
    if (!activeStudent) return;
    if (totalRegisteredCredits === 0 && totalTransferredCredits === 0) {
      alert('กรุณาเลือกรายวิชาอย่างน้อย 1 วิชาเพื่อลงทะเบียน');
      return;
    }

    if (totalRegisteredCredits > settings.maxCreditsPerTerm) {
      const confirmExceed = confirm(
        `จำนวนหน่วยกิตที่เลือกลงทะเบียน (${totalRegisteredCredits} นก.) เกินเกณฑ์แนะนำ (${settings.maxCreditsPerTerm} นก.) คุณต้องการยืนยันการลงทะเบียนหรือไม่?`
      );
      if (!confirmExceed) return;
    }

    const record = buildRecord('approved');
    onUpdateRegistration(record);
    setSaveToast(`บันทึกและอนุมัติการลงทะเบียนของ "${activeStudent.fullName}" (${activeStudent.id}) เรียบร้อยแล้ว!`);
    setTimeout(() => setSaveToast(''), 4500);
  };

  const handleSaveDraft = () => {
    if (!activeStudent) return;
    const record = buildRecord('draft');
    onUpdateRegistration(record);
    setSaveToast(`บันทึกแบบร่างการลงทะเบียนของ "${activeStudent.fullName}" สำเร็จ`);
    setTimeout(() => setSaveToast(''), 3500);
  };

  const handleRegisterNextStudent = () => {
    setActiveStudent(null);
    setStudentInput('');
    setSearchError('');
  };

  const getLevelLabel = (levelId: EducationLevel) => {
    const found = EDUCATION_LEVELS.find((l) => l.id === levelId);
    return found ? found.name : levelId;
  };

  // Recent registrations for teacher's groups
  const recentRegistrations = useMemo(() => {
    return registrations
      .filter((r) => r.term === settings.term && r.academicYear === settings.academicYear)
      .slice(0, 8);
  }, [registrations, settings.term, settings.academicYear]);

  // Current record for document modal
  const previewDocRecord = activeStudent
    ? buildRecord(activeStudentRegistration?.status || 'approved')
    : undefined;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Teacher Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">ระบบลงทะเบียนเรียนสำหรับครูประจำกลุ่ม</h1>
                <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded font-mono font-semibold">
                  ครู {group.advisorName}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{settings.institutionName}</span>
                <span>·</span>
                <span>ภาคเรียนที่ {settings.term}/{settings.academicYear}</span>
                <span>·</span>
                <span>กลุ่มที่รับผิดชอบ: <strong className="text-slate-700 font-mono">{assignedGroupCodes.join(', ')}</strong></span>
              </div>
            </div>
          </div>

          {activeStudent && (
            <button
              type="button"
              onClick={handleRegisterNextStudent}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ค้นหา / เปลี่ยนนักศึกษาคนใหม่</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= FLOW 1: SEARCH & INPUT STUDENT ID ================= */}
      {!activeStudent ? (
        <div className="space-y-6">
          {/* Main Focused Input Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md mb-4">
              <GraduationCap className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              ลงทะเบียนเรียนรายบุคคล
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              กรุณากรอกรหัสนักศึกษา 10 หลัก เพื่อเริ่มเลือกลงทะเบียนรายวิชา อนุมัติ และพิมพ์ใบลงทะเบียนเรียนได้ทันที
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchStudent();
              }}
              className="mt-6 space-y-4 max-w-lg mx-auto text-left"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  รหัสนักศึกษา (10 หลัก)
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={studentInput}
                    onChange={(e) => {
                      setStudentInput(e.target.value);
                      if (searchError) setSearchError('');
                    }}
                    placeholder="กรอกรหัสนักศึกษา เช่น 6113000153, 6311000041, 5712000522"
                    className="w-full px-4 py-3.5 text-base sm:text-lg bg-slate-50 border border-slate-300 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono shadow-inner tracking-wider"
                    autoFocus
                  />
                  {studentInput ? (
                    <button
                      type="button"
                      onClick={() => setStudentInput('')}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <Search className="w-5 h-5 absolute right-4 top-4 text-slate-400" />
                  )}
                </div>

                {searchError && (
                  <p className="text-xs text-rose-600 flex items-center gap-1.5 mt-2 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{searchError}</span>
                  </p>
                )}
              </div>

              {/* Suggestions dropdown if user typed */}
              {searchSuggestions.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-lg space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400 px-2 py-1">
                    ผลการค้นหาที่ตรงกัน ({searchSuggestions.length} คน):
                  </div>
                  {searchSuggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSearchStudent(s.id)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-between text-xs group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-slate-800 group-hover:text-blue-600">
                          {s.id}
                        </span>
                        <span className="text-slate-700 font-medium">{s.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                          กลุ่ม {s.groupCode}
                        </span>
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                          {getLevelLabel(s.level)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>ค้นหาและเริ่มลงทะเบียน</span>
              </button>
            </form>
          </div>

          {/* Recent Registrations List */}
          {recentRegistrations.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs max-w-4xl mx-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    รายการลงทะเบียนล่าสุดในภาคเรียนนี้ ({recentRegistrations.length} รายการ)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  คลิกที่ชื่อเพื่อเปิดดูและพิมพ์ใบลงทะเบียน
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {recentRegistrations.map((reg) => {
                  const studentObj = students.find((s) => s.id === reg.studentId);
                  return (
                    <div
                      key={reg.id}
                      className="p-3 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 rounded-xl transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900">{reg.studentId}</span>
                          <span className="text-slate-400">·</span>
                          <span className="font-semibold text-slate-800 truncate">{reg.studentName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>กลุ่ม {reg.groupCode}</span>
                          <span>·</span>
                          <span>{reg.totalCredits} หน่วยกิต</span>
                          {reg.status === 'approved' && (
                            <span className="text-emerald-700 font-medium">● อนุมัติแล้ว</span>
                          )}
                          {reg.status === 'recorded' && (
                            <span className="text-teal-700 font-medium">● บันทึกแล้ว</span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (studentObj) {
                            setActiveStudent(studentObj);
                          } else {
                            handleSearchStudent(reg.studentId);
                          }
                        }}
                        className="px-2.5 py-1.5 bg-white hover:bg-blue-600 hover:text-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors shrink-0"
                      >
                        เปิดดู / แก้ไข
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= FLOW 2: DIRECT REGISTRATION FORM ================= */
        <div className="space-y-6">
          {/* Active Student Info Header Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{activeStudent.fullName}</h2>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded font-mono font-bold">
                      รหัส: {activeStudent.id}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {getLevelLabel(activeStudent.level)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>เลข ปชช: <strong className="font-mono text-slate-700">{activeStudent.nationalId}</strong></span>
                    <span>·</span>
                    <span>กลุ่ม: <strong className="font-mono text-slate-700">{activeStudent.groupCode}</strong></span>
                    <span>·</span>
                    <span>ครูที่ปรึกษา: <strong className="text-slate-700">{activeStudent.advisorName}</strong></span>
                  </div>
                </div>
              </div>

              {/* Status Badge & Document Button */}
              <div className="flex items-center gap-2 flex-wrap">
                {activeStudentRegistration?.status === 'approved' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    อนุมัติแล้ว
                  </span>
                ) : activeStudentRegistration?.status === 'recorded' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    บันทึกทะเบียนแล้ว
                  </span>
                ) : activeStudentRegistration?.status === 'draft' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    <Save className="w-3.5 h-3.5" />
                    แบบร่าง
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-3.5 h-3.5" />
                    ยังไม่ได้ลงทะเบียน
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setShowDocModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors shadow-xs"
                >
                  <Printer className="w-4 h-4 text-blue-600" />
                  <span>พิมพ์ใบลงทะเบียน (PDF)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Toolbar for Course Selection */}
          <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">เลือกรายวิชาลงทะเบียน:</span>
              <button
                type="button"
                onClick={handleSelectAllCompulsory}
                className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 font-medium transition-colors"
              >
                + เลือกวิชาบังคับทั้งหมด
              </button>
              <button
                type="button"
                onClick={handleClearAllCourses}
                className="px-2.5 py-1 bg-white hover:bg-slate-200 text-rose-600 rounded-lg border border-slate-300 font-medium transition-colors"
              >
                ล้างที่เลือกทั้งหมด
              </button>
            </div>

            <div className="flex items-center gap-4 text-slate-700 font-medium">
              <div>
                ลงทะเบียน: <strong className="text-blue-700 font-mono text-sm">{totalRegisteredCredits}</strong> / {settings.maxCreditsPerTerm} นก.
              </div>
              {totalTransferredCredits > 0 && (
                <div>
                  เทียบโอน: <strong className="text-emerald-700 font-mono text-sm">{totalTransferredCredits}</strong> นก.
                </div>
              )}
            </div>
          </div>

          {/* 1. Compulsory Courses Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-blue-50/70 p-3.5 border-b border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold text-blue-900">
                  1. รายวิชาบังคับ ({compulsoryCourses.length} วิชา)
                </h3>
              </div>
              <span className="text-[11px] text-blue-700 font-medium">
                เลือกแล้ว {compulsoryCourses.filter((c) => selectedItems[c.id]?.isRegistered).length} วิชา
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
                    <th className="py-2.5 px-3 font-semibold text-center w-12">ที่</th>
                    <th className="py-2.5 px-3 font-semibold w-24">รหัสวิชา</th>
                    <th className="py-2.5 px-3 font-semibold">ชื่อรายวิชา</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-20">หน่วยกิต</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-28 bg-blue-50/40">ลงทะเบียน</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-28 bg-emerald-50/40">เทียบโอน</th>
                    <th className="py-2.5 px-3 font-semibold w-36">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {compulsoryCourses.map((course, idx) => {
                    const isReg = !!selectedItems[course.id]?.isRegistered;
                    const isTrans = !!selectedItems[course.id]?.isTransferred;
                    const remarks = selectedItems[course.id]?.remarks || '';

                    return (
                      <tr
                        key={course.id}
                        className={`transition-colors ${
                          isReg ? 'bg-blue-50/30' : isTrans ? 'bg-emerald-50/30' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{course.code}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{course.name}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                          {course.credits}
                        </td>
                        <td className="py-2.5 px-3 text-center bg-blue-50/20">
                          <label className="inline-flex items-center justify-center cursor-pointer p-1">
                            <input
                              type="checkbox"
                              checked={isReg}
                              onChange={() => handleToggleRegister(course.id)}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            />
                          </label>
                        </td>
                        <td className="py-2.5 px-3 text-center bg-emerald-50/20">
                          <label className="inline-flex items-center justify-center cursor-pointer p-1">
                            <input
                              type="checkbox"
                              checked={isTrans}
                              onChange={() => handleToggleTransfer(course.id)}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                            />
                          </label>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={remarks}
                            onChange={(e) => handleRemarkChange(course.id, e.target.value)}
                            placeholder="ระบุถ้ามี..."
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Elective Courses Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-emerald-50/70 p-3.5 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold text-emerald-900">
                  2. รายวิชาเลือก ({electiveCourses.length} วิชา)
                </h3>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">
                เลือกแล้ว {electiveCourses.filter((c) => selectedItems[c.id]?.isRegistered).length} วิชา
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
                    <th className="py-2.5 px-3 font-semibold text-center w-12">ที่</th>
                    <th className="py-2.5 px-3 font-semibold w-24">รหัสวิชา</th>
                    <th className="py-2.5 px-3 font-semibold">ชื่อรายวิชา</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-20">หน่วยกิต</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-28 bg-blue-50/40">ลงทะเบียน</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-28 bg-emerald-50/40">เทียบโอน</th>
                    <th className="py-2.5 px-3 font-semibold w-36">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {electiveCourses.map((course, idx) => {
                    const isReg = !!selectedItems[course.id]?.isRegistered;
                    const isTrans = !!selectedItems[course.id]?.isTransferred;
                    const remarks = selectedItems[course.id]?.remarks || '';

                    return (
                      <tr
                        key={course.id}
                        className={`transition-colors ${
                          isReg ? 'bg-blue-50/30' : isTrans ? 'bg-emerald-50/30' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{course.code}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{course.name}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                          {course.credits}
                        </td>
                        <td className="py-2.5 px-3 text-center bg-blue-50/20">
                          <label className="inline-flex items-center justify-center cursor-pointer p-1">
                            <input
                              type="checkbox"
                              checked={isReg}
                              onChange={() => handleToggleRegister(course.id)}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            />
                          </label>
                        </td>
                        <td className="py-2.5 px-3 text-center bg-emerald-50/20">
                          <label className="inline-flex items-center justify-center cursor-pointer p-1">
                            <input
                              type="checkbox"
                              checked={isTrans}
                              onChange={() => handleToggleTransfer(course.id)}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                            />
                          </label>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={remarks}
                            onChange={(e) => handleRemarkChange(course.id, e.target.value)}
                            placeholder="ระบุถ้ามี..."
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Bar at Bottom */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-900">ครูผู้รับลงทะเบียน:</span> {group.advisorName}
              <span className="mx-2 text-slate-300">|</span>
              <span>รวมเลือกลงทะเบียน: <strong>{totalRegisteredCredits}</strong> หน่วยกิต</span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกแบบร่าง</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndApprove}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>บันทึกและอนุมัติการลงทะเบียน</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDocModal(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์ใบลงทะเบียน</span>
              </button>

              <button
                type="button"
                onClick={handleRegisterNextStudent}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>ลงทะเบียนคนต่อไป →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Document Modal (Requirement 1 & 2: Full-Screen A4, No Frame, No Side Scrollbar, No Header Text) */}
      {showDocModal && previewDocRecord && activeStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 flex flex-col items-center justify-start overflow-y-auto no-scrollbar p-0 sm:py-6 print:p-0 print:bg-white print:static print:overflow-visible">
          {/* Floating Action Bar (Screen only - No bulky window header) */}
          <div className="no-print sticky top-3 z-50 mb-4 flex items-center gap-2.5 bg-slate-900/95 text-white backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl border border-slate-700">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ใบลงทะเบียน A4</span>
            </button>
            <button
              type="button"
              onClick={() => setShowDocModal(false)}
              className="inline-flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors border border-slate-700"
            >
              <X className="w-4 h-4" />
              <span>ปิดหน้าต่าง</span>
            </button>
          </div>

          {/* Full A4 Document (No frame, no border, exact single page) */}
          <div className="w-auto mx-auto print:m-0 print:p-0">
            <RegistrationDocument
              record={previewDocRecord}
              student={activeStudent}
              allCoursesForLevel={studentLevelCourses}
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
