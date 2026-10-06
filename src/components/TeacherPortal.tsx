import React, { useState } from 'react';
import { Group, Student, Course, RegistrationRecord, SystemSettings, EducationLevel } from '../types';
import { EDUCATION_LEVELS } from '../data/initialData';
import { RegistrationDocument } from './RegistrationDocument';
import {
  Users,
  CheckCircle2,
  Clock,
  Printer,
  Eye,
  Filter,
  Check,
  RotateCcw,
  BookOpen,
  Search,
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
  onBatchApprove,
}) => {
  const [levelFilter, setLevelFilter] = useState<'all' | EducationLevel>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected student record for document viewing or review modal
  const [activeRecordForDoc, setActiveRecordForDoc] = useState<{
    record: RegistrationRecord;
    student: Student;
  } | null>(null);

  const [activeRecordForReview, setActiveRecordForReview] = useState<{
    record: RegistrationRecord;
    student: Student;
  } | null>(null);

  // Filter students belonging to this group
  const groupStudents = students.filter((s) => s.groupCode === group.code);

  // Map students to their registration record
  const studentRows = groupStudents.map((std) => {
    const reg = registrations.find(
      (r) => r.studentId === std.id && r.term === settings.term && r.academicYear === settings.academicYear
    );
    return {
      student: std,
      registration: reg,
      status: reg?.status || 'not_registered',
      totalCredits: reg?.totalCredits || 0,
      itemCount: reg?.items?.filter((i) => i.isRegistered)?.length || 0,
    };
  });

  // Apply filters
  const filteredRows = studentRows.filter((row) => {
    if (levelFilter !== 'all' && row.student.level !== levelFilter) return false;
    if (statusFilter !== 'all' && row.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = row.student.fullName.toLowerCase().includes(q);
      const matchId = row.student.id.includes(q);
      if (!matchName && !matchId) return false;
    }
    return true;
  });

  // Calculate statistics
  const totalStudents = groupStudents.length;
  const pendingCount = studentRows.filter((r) => r.status === 'pending_teacher').length;
  const approvedCount = studentRows.filter((r) => r.status === 'approved' || r.status === 'recorded').length;
  const notRegisteredCount = studentRows.filter((r) => r.status === 'not_registered' || r.status === 'draft').length;

  const handleApproveStudent = (record: RegistrationRecord) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear() + 543}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updated: RegistrationRecord = {
      ...record,
      status: 'approved',
      approvedAt: formattedDate,
      teacherSignatureName: group.advisorName,
    };
    onUpdateRegistration(updated);
    if (activeRecordForReview) setActiveRecordForReview(null);
  };

  const handleRejectStudent = (record: RegistrationRecord) => {
    const reason = prompt('ระบุเหตุผลในการส่งกลับให้นักศึกษาแก้ไขรายวิชา:');
    if (reason === null) return;

    const updated: RegistrationRecord = {
      ...record,
      status: 'draft',
      teacherRemarks: reason,
    };
    onUpdateRegistration(updated);
    if (activeRecordForReview) setActiveRecordForReview(null);
  };

  const handleBatchApproveAllPending = () => {
    const pendingIds = studentRows.filter((r) => r.status === 'pending_teacher').map((r) => r.student.id);
    if (pendingIds.length === 0) {
      alert('ไม่มีรายการที่รอการตรวจสอบ');
      return;
    }
    if (confirm(`ต้องการอนุมัติการลงทะเบียนทั้งหมด ${pendingIds.length} รายการใช่หรือไม่?`)) {
      onBatchApprove(pendingIds);
    }
  };

  const getLevelLabel = (levelId: EducationLevel) => {
    const found = EDUCATION_LEVELS.find((l) => l.id === levelId);
    return found ? found.shortName : levelId;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'not_registered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3" />
            ยังไม่ลงทะเบียน
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
            แบบร่าง
          </span>
        );
      case 'pending_teacher':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 animate-pulse">
            <Clock className="w-3 h-3" />
            รอครูอนุมัติ
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            อนุมัติแล้ว
          </span>
        );
      case 'recorded':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
            <CheckCircle2 className="w-3 h-3" />
            บันทึกทะเบียนแล้ว
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Group Info Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">{group.name}</h1>
                <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded font-mono font-semibold">
                  รหัสกลุ่ม: {group.code}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>ครูประจำกลุ่ม: <strong className="text-slate-700">{group.advisorName}</strong></span>
                <span>·</span>
                <span>{settings.institutionName}</span>
                <span>·</span>
                <span>ภาคเรียนที่ {settings.term}/{settings.academicYear}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <button
                onClick={handleBatchApproveAllPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                อนุมัติที่รอดำเนินการ ({pendingCount})
              </button>
            )}
          </div>
        </div>

        {/* 4 Stat Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 block">นักศึกษาทั้งหมดในกลุ่ม</span>
            <span className="text-2xl font-bold font-mono text-slate-800">{totalStudents}</span>
            <span className="text-[11px] text-slate-400 ml-1">คน</span>
          </div>
          <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
            <span className="text-[11px] text-blue-700 block">รอครูตรวจสอบอนุมัติ</span>
            <span className="text-2xl font-bold font-mono text-blue-800">{pendingCount}</span>
            <span className="text-[11px] text-blue-600 ml-1">คน</span>
          </div>
          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
            <span className="text-[11px] text-emerald-700 block">อนุมัติเรียบร้อย</span>
            <span className="text-2xl font-bold font-mono text-emerald-800">{approvedCount}</span>
            <span className="text-[11px] text-emerald-600 ml-1">คน</span>
          </div>
          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
            <span className="text-[11px] text-amber-700 block">ยังไม่ลงทะเบียน</span>
            <span className="text-2xl font-bold font-mono text-amber-800">{notRegisteredCount}</span>
            <span className="text-[11px] text-amber-600 ml-1">คน</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Level Filters */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setLevelFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              levelFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทุกระดับ
          </button>
          <button
            onClick={() => setLevelFilter('primary')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              levelFilter === 'primary' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ประถมศึกษา
          </button>
          <button
            onClick={() => setLevelFilter('junior_high')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              levelFilter === 'junior_high' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ม.ต้น
          </button>
          <button
            onClick={() => setLevelFilter('senior_high')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              levelFilter === 'senior_high' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ม.ปลาย
          </button>
        </div>

        {/* Status & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="pending_teacher">รอครูอนุมัติ</option>
            <option value="approved">อนุมัติแล้ว</option>
            <option value="recorded">บันทึกทะเบียนแล้ว</option>
            <option value="not_registered">ยังไม่ลงทะเบียน</option>
          </select>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหารหัส / ชื่อนักศึกษา..."
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-56"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            รายชื่อนักศึกษาในกลุ่ม ({filteredRows.length} คน)
          </h2>
          <span className="text-xs text-slate-500">
            กลุ่ม {group.code} · ครูที่ปรึกษา {group.advisorName}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200">
                <th className="py-3 px-3 font-semibold text-center w-12">ลำดับ</th>
                <th className="py-3 px-3 font-semibold w-28">รหัสนักศึกษา</th>
                <th className="py-3 px-3 font-semibold">ชื่อ - สกุล</th>
                <th className="py-3 px-3 font-semibold w-28">ระดับการศึกษา</th>
                <th className="py-3 px-3 font-semibold text-center w-24">วิชา / นก.</th>
                <th className="py-3 px-3 font-semibold text-center w-32">สถานะ</th>
                <th className="py-3 px-3 font-semibold text-right w-44">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    ไม่พบข้อมูลนักศึกษาตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => {
                  const reg = row.registration;
                  const hasRegistration = !!reg && reg.items && reg.items.length > 0;

                  return (
                    <tr key={row.student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-700">{row.student.id}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{row.student.fullName}</div>
                        {row.student.phone && (
                          <div className="text-[11px] text-slate-400">{row.student.phone}</div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {getLevelLabel(row.student.level)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {hasRegistration ? (
                          <div className="font-mono">
                            <span className="font-bold text-slate-800">{row.totalCredits}</span>
                            <span className="text-[11px] text-slate-400"> นก. ({row.itemCount} วิชา)</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">{getStatusBadge(row.status)}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {row.status === 'pending_teacher' && reg && (
                            <button
                              onClick={() =>
                                setActiveRecordForReview({
                                  record: reg,
                                  student: row.student,
                                })
                              }
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-[11px] transition-colors shadow-xs"
                            >
                              ตรวจสอบ
                            </button>
                          )}

                          {hasRegistration && reg ? (
                            <button
                              onClick={() =>
                                setActiveRecordForDoc({
                                  record: reg,
                                  student: row.student,
                                })
                              }
                              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                              title="ดูและพิมพ์แบบฟอร์มใบลงทะเบียน (PDF)"
                            >
                              <FileCheck className="w-4 h-4 text-emerald-600" />
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">รอลงทะเบียน</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {activeRecordForReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  ตรวจสอบการลงทะเบียนเรียน: {activeRecordForReview.student.fullName}
                </h3>
                <p className="text-xs text-slate-500">
                  รหัสนักศึกษา {activeRecordForReview.student.id} · {getLevelLabel(activeRecordForReview.student.level)}
                </p>
              </div>
              <button
                onClick={() => setActiveRecordForReview(null)}
                className="text-slate-400 hover:text-slate-700 text-sm px-2 py-1 rounded"
              >
                ✕ ปิด
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                <span>จำนวนวิชาที่ขอลงทะเบียน: <strong>{activeRecordForReview.record.items.filter((i) => i.isRegistered).length} วิชา</strong></span>
                <span>รวมหน่วยกิต: <strong className="text-emerald-700 font-mono text-sm">{activeRecordForReview.record.totalCredits} หน่วยกิต</strong></span>
              </div>

              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 sticky top-0">
                    <tr>
                      <th className="p-2 w-12 text-center">ลำดับ</th>
                      <th className="p-2 w-24">รหัสวิชา</th>
                      <th className="p-2">ชื่อวิชา</th>
                      <th className="p-2 w-16 text-center">หน่วยกิต</th>
                      <th className="p-2 w-24 text-center">ประเภท</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeRecordForReview.record.items.map((item, idx) => (
                      <tr key={item.courseId} className="hover:bg-slate-50">
                        <td className="p-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-2 font-mono font-medium">{item.courseCode}</td>
                        <td className="p-2">{item.courseName}</td>
                        <td className="p-2 text-center font-mono font-semibold">{item.credits}</td>
                        <td className="p-2 text-center">
                          {item.isRegistered ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">ลงทะเบียน</span>
                          ) : (
                            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">เทียบโอน</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleRejectStudent(activeRecordForReview.record)}
                  className="px-4 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                >
                  ส่งกลับให้นักศึกษาแก้ไข
                </button>
                <button
                  type="button"
                  onClick={() => handleApproveStudent(activeRecordForReview.record)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  อนุมัติการลงทะเบียนและลงนาม
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document View / Print Modal */}
      {activeRecordForDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  ใบลงทะเบียนเรียน: {activeRecordForDoc.student.fullName} ({activeRecordForDoc.student.id})
                </h3>
              </div>
              <button
                onClick={() => setActiveRecordForDoc(null)}
                className="text-slate-400 hover:text-slate-700 text-sm px-2 py-1 rounded"
              >
                ✕ ปิดหน้าต่าง
              </button>
            </div>

            <RegistrationDocument
              record={activeRecordForDoc.record}
              student={activeRecordForDoc.student}
              allCoursesForLevel={courses.filter((c) => c.level === activeRecordForDoc.student.level)}
              settings={settings}
              onClose={() => setActiveRecordForDoc(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
