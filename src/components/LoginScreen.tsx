import React, { useState } from 'react';
import { UserRole, Student, Group, CurrentUser } from '../types';
import { EDUCATION_LEVELS } from '../data/initialData';
import { RAW_TEACHERS } from '../data/allTeachers';
import {
  GraduationCap,
  UserCheck,
  Shield,
  KeyRound,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  BookOpen,
  School,
} from 'lucide-react';

interface LoginScreenProps {
  students: Student[];
  groups: Group[];
  onLogin: (user: CurrentUser) => void;
  institutionName: string;
  term: string;
  academicYear: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  students,
  groups,
  onLogin,
  institutionName,
  term,
  academicYear,
}) => {
  const [activeTab, setActiveTab] = useState<UserRole>('student');

  // Student inputs
  const [studentIdInput, setStudentIdInput] = useState('');
  const [studentError, setStudentError] = useState('');

  // Teacher inputs
  const [groupCodeInput, setGroupCodeInput] = useState('');
  const [teacherError, setTeacherError] = useState('');

  // Admin inputs
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminSelectName, setAdminSelectName] = useState('มูฮามดัสกรี ลาบูอาปี');
  const [adminError, setAdminError] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);

  const handleStudentLogin = (idToUse?: string) => {
    const id = (idToUse || studentIdInput).trim();
    if (!id) {
      setStudentError('กรุณากรอกรหัสนักศึกษา 10 หลัก');
      return;
    }
    const found = students.find((s) => s.id === id);
    if (!found) {
      setStudentError('ไม่พบรหัสนักศึกษานี้ในระบบ กรุณาตรวจสอบหรือคลิกเลือกจากรายชื่อด้านล่าง');
      return;
    }
    setStudentError('');
    onLogin({
      role: 'student',
      student: found,
      name: found.fullName,
    });
  };

  const handleTeacherLogin = (codeToUse?: string) => {
    const rawInput = (codeToUse || groupCodeInput).trim();
    if (!rawInput) {
      setTeacherError('กรุณากรอกรหัสกลุ่ม เช่น 210008, 220009, 230032');
      return;
    }

    const code = rawInput.toUpperCase();
    const foundGroup = groups.find((g) => g.code === code);
    const teacherMatch = RAW_TEACHERS.find(
      (t) => t.groupCodes.includes(code) || t.name.toLowerCase().includes(rawInput.toLowerCase())
    );

    if (!foundGroup && !teacherMatch) {
      setTeacherError('ไม่พบรหัสกลุ่มหรือชื่อครูนี้ในระบบ กรุณาตรวจสอบรหัสกลุ่ม เช่น 210008, 220009, 230032');
      return;
    }

    const actualCode = foundGroup?.code || teacherMatch?.groupCodes[0] || code;
    const advisor = teacherMatch?.name || foundGroup?.advisorName || 'ครูประจำกลุ่ม';

    const groupObj: Group = foundGroup || {
      code: actualCode,
      name: `กลุ่ม ${actualCode} (${advisor})`,
      advisorName: advisor,
    };

    setTeacherError('');
    onLogin({
      role: 'teacher',
      group: groupObj,
      name: groupObj.advisorName,
    });
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput !== 'Admin1234') {
      setAdminError('รหัสผ่านไม่ถูกต้อง! กรุณากรอกรหัสผ่าน "Admin1234"');
      return;
    }
    setAdminError('');
    onLogin({
      role: 'admin',
      name: `${adminSelectName} (Admin)`,
    });
  };

  const getLevelLabel = (levelId: string) => {
    const found = EDUCATION_LEVELS.find((l) => l.id === levelId);
    return found ? found.shortName : levelId;
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <div className="max-w-2xl w-full">
        {/* Header Institution Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md font-bold text-2xl mb-4">
            สกร.
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            ระบบลงทะเบียนเรียนออนไลน์
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            {institutionName}
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-2">
            <span>ภาคเรียนที่ {term}/{academicYear}</span>
            <span>·</span>
            <span>3 ระดับการศึกษา (ประถม / ม.ต้น / ม.ปลาย)</span>
          </div>
        </div>

        {/* Login Container Box */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* 3 Main Role Tabs */}
          <div className="grid grid-cols-3 bg-slate-100 p-1.5 border-b border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl transition-all ${
                activeTab === 'student'
                  ? 'bg-white text-emerald-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>1. นักศึกษา</span>
            </button>
            <button
              onClick={() => setActiveTab('teacher')}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl transition-all ${
                activeTab === 'teacher'
                  ? 'bg-white text-blue-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>2. ครูประจำกลุ่ม</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-purple-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>3. ผู้ดูแลระบบ</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* ================= TAB 1: STUDENT LOGIN ================= */}
            {activeTab === 'student' && (
              <div className="space-y-6">
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 text-xs text-emerald-900 leading-relaxed flex items-start gap-3">
                  <div className="p-1 bg-emerald-100 rounded-lg text-emerald-700 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold">เข้าสู่ระบบด้วยรหัสนักศึกษา (10 หลัก):</span>
                    <p className="mt-0.5 text-emerald-800">
                      นักศึกษาสามารถเลือกลงทะเบียนรายวิชาตามระดับการศึกษา (ประถมศึกษา, ม.ต้น, ม.ปลาย) บันทึกแบบร่าง ตรวจสอบผล และพิมพ์ใบลงทะเบียนพร้อมดาวน์โหลด PDF ได้ทันที
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleStudentLogin();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      รหัสนักศึกษา 10 หลัก
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={studentIdInput}
                        onChange={(e) => setStudentIdInput(e.target.value)}
                        placeholder="กรอกรหัสนักศึกษา เช่น 6113000153, 6311000041, 5712000522"
                        className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono shadow-inner"
                        autoFocus
                      />
                      <KeyRound className="w-5 h-5 absolute right-3.5 top-3.5 text-slate-400" />
                    </div>
                    {studentError && (
                      <p className="text-xs text-red-600 flex items-center gap-1.5 mt-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {studentError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <GraduationCap className="w-4 h-4" />
                    เข้าสู่ระบบลงทะเบียนเรียน
                  </button>
                </form>
              </div>
            )}

            {/* ================= TAB 2: TEACHER LOGIN ================= */}
            {activeTab === 'teacher' && (
              <div className="space-y-6">
                <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 text-xs text-blue-900 leading-relaxed flex items-start gap-3">
                  <div className="p-1 bg-blue-100 rounded-lg text-blue-700 mt-0.5">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold">เข้าสู่ระบบด้วยรหัสกลุ่ม (Group Code):</span>
                    <p className="mt-0.5 text-blue-800">
                      ครูประจำกลุ่มสามารถเข้าตรวจสอบรายชื่อนักศึกษา อนุมัติวิชาที่ขอลงทะเบียน และพิมพ์ใบลงทะเบียนทั้งกลุ่มได้
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleTeacherLogin();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      รหัสกลุ่ม (Group Code เช่น 210008, 220009, 230032, 210001)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={groupCodeInput}
                        onChange={(e) => setGroupCodeInput(e.target.value)}
                        placeholder="กรอกรหัสกลุ่ม เช่น 210008 หรือ 230032"
                        className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono shadow-inner"
                        autoFocus
                      />
                      <KeyRound className="w-5 h-5 absolute right-3.5 top-3.5 text-slate-400" />
                    </div>
                    {teacherError && (
                      <p className="text-xs text-red-600 flex items-center gap-1.5 mt-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {teacherError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    เข้าสู่ระบบครูประจำกลุ่ม
                  </button>
                </form>
              </div>
            )}

            {/* ================= TAB 3: ADMIN LOGIN ================= */}
            {activeTab === 'admin' && (
              <div className="space-y-6">
                <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 text-xs text-purple-900 leading-relaxed flex items-start gap-3">
                  <div className="p-1 bg-purple-100 rounded-lg text-purple-700 mt-0.5">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold">ระบบผู้ดูแลระบบส่วนกลาง (Admin Portal):</span>
                    <p className="mt-0.5 text-purple-800">
                      กรุณากรอกรหัสผ่านผู้ดูแลระบบเพื่อเข้าสู่ระบบจัดการฐานข้อมูลรายวิชาและดูภาพรวมการลงทะเบียน
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      บทบาทผู้ใช้งาน
                    </label>
                    <div className="px-4 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-medium">
                      ผู้ดูแลระบบส่วนกลาง (Central Admin)
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      รหัสผ่าน (Password)
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={adminPasswordInput}
                        onChange={(e) => {
                          setAdminPasswordInput(e.target.value);
                          if (adminError) setAdminError('');
                        }}
                        placeholder="กรอกรหัสผ่านผู้ดูแลระบบ"
                        className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono shadow-inner"
                        required
                        autoFocus
                      />
                      <Lock className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                    </div>

                    {adminError && (
                      <p className="text-xs text-red-600 flex items-center gap-1.5 mt-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {adminError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-4"
                  >
                    <Lock className="w-4 h-4" />
                    เข้าสู่ระบบผู้ดูแลระบบ (Admin)
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
