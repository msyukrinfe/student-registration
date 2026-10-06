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
  const [studentFilterLevel, setStudentFilterLevel] = useState<'all' | 'primary' | 'junior_high' | 'senior_high'>('all');

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
    const code = (codeToUse || groupCodeInput).trim().toUpperCase();
    if (!code) {
      setTeacherError('กรุณากรอกรหัสกลุ่ม');
      return;
    }

    const foundGroup = groups.find((g) => g.code === code);
    const teacherMatch = RAW_TEACHERS.find((t) => t.groupCodes.includes(code));

    if (!foundGroup && !teacherMatch) {
      setTeacherError('ไม่พบรหัสกลุ่มนี้ในระบบ กรุณาตรวจสอบหรือคลิกเลือกกลุ่มด้านล่าง');
      return;
    }

    const groupObj: Group = foundGroup || {
      code,
      name: `กลุ่ม ${code} (${teacherMatch?.name || 'ครูประจำกลุ่ม'})`,
      advisorName: teacherMatch?.name || 'ครูประจำกลุ่ม',
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

  const displayedDemoStudents = students.filter((s) => {
    if (studentFilterLevel === 'all') return true;
    return s.level === studentFilterLevel;
  });

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

                {/* Quick Student Selector from official database */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-semibold text-slate-700">
                      หรือคลิกเลือกรหัสนักศึกษาตัวอย่างจากฐานข้อมูล:
                    </span>
                    <div className="flex items-center gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setStudentFilterLevel('all')}
                        className={`px-2 py-0.5 rounded ${
                          studentFilterLevel === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-500'
                        }`}
                      >
                        ทั้งหมด
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudentFilterLevel('primary')}
                        className={`px-2 py-0.5 rounded ${
                          studentFilterLevel === 'primary' ? 'bg-emerald-700 text-white font-medium' : 'text-slate-500'
                        }`}
                      >
                        ประถม
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudentFilterLevel('junior_high')}
                        className={`px-2 py-0.5 rounded ${
                          studentFilterLevel === 'junior_high' ? 'bg-blue-700 text-white font-medium' : 'text-slate-500'
                        }`}
                      >
                        ม.ต้น
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudentFilterLevel('senior_high')}
                        className={`px-2 py-0.5 rounded ${
                          studentFilterLevel === 'senior_high' ? 'bg-purple-700 text-white font-medium' : 'text-slate-500'
                        }`}
                      >
                        ม.ปลาย
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {displayedDemoStudents.slice(0, 12).map((std) => (
                      <button
                        key={std.id}
                        type="button"
                        onClick={() => {
                          setStudentIdInput(std.id);
                          handleStudentLogin(std.id);
                        }}
                        className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors text-xs flex flex-col justify-between group"
                      >
                        <div className="font-semibold text-slate-800 flex items-center justify-between">
                          <span className="truncate group-hover:text-emerald-700">{std.fullName}</span>
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 shrink-0 ml-1">
                            {getLevelLabel(std.level)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-1">
                          รหัส: {std.id} · กลุ่ม {std.groupCode}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
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

                {/* Quick Teacher Picker from official database */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-700 mb-2.5">
                    หรือคลิกเลือกรหัสกลุ่มตามรายชื่อครูในฐานข้อมูล (PDF 1):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {RAW_TEACHERS.filter((t) => t.role === 'ครู').map((t) => (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => {
                          setGroupCodeInput(t.groupCodes[0]);
                          handleTeacherLogin(t.groupCodes[0]);
                        }}
                        className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors text-xs group"
                      >
                        <div className="font-semibold text-slate-800 flex items-center justify-between">
                          <span className="group-hover:text-blue-700">{t.name}</span>
                          <span className="text-[10px] text-blue-700 font-mono font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                            {t.groupCodes[0]}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-1">
                          กลุ่ม: {t.groupCodes.join(', ')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
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
                    <span className="font-bold">ระบบผู้ดูแลระบบ (Admin Portal):</span>
                    <p className="mt-0.5 text-purple-800">
                      ต้องใช้รหัสผ่าน <span className="font-mono font-bold bg-purple-100 px-1.5 py-0.5 rounded text-purple-900">Admin1234</span> ในการเข้าสู่ระบบเพื่อจัดการฐานข้อมูลรายวิชาและดูภาพรวม
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      เลือกบัญชีผู้ดูแลระบบ
                    </label>
                    <select
                      value={adminSelectName}
                      onChange={(e) => setAdminSelectName(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="มูฮามดัสกรี ลาบูอาปี">มูฮามดัสกรี ลาบูอาปี (Admin - กลุ่ม 210037, 220037, 230037)</option>
                      <option value="สุกรี สาเมา๊ะ">สุกรี สาเมา๊ะ (Admin - กลุ่ม 210038, 220038, 230036)</option>
                      <option value="ผู้ดูแลระบบงานทะเบียน">ผู้ดูแลระบบส่วนกลาง (Central Admin)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      รหัสผ่าน Admin (Password)
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPass ? 'text' : 'password'}
                        value={adminPasswordInput}
                        onChange={(e) => {
                          setAdminPasswordInput(e.target.value);
                          if (adminError) setAdminError('');
                        }}
                        placeholder="กรอกรหัสผ่าน Admin1234"
                        className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono shadow-inner"
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                      >
                        {showAdminPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {adminError && (
                      <p className="text-xs text-red-600 flex items-center gap-1.5 mt-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {adminError}
                      </p>
                    )}

                    <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                      <span>รหัสผ่านที่กำหนด: <strong className="font-mono text-purple-700">Admin1234</strong></span>
                      <button
                        type="button"
                        onClick={() => setAdminPasswordInput('Admin1234')}
                        className="text-purple-600 hover:text-purple-800 font-medium underline"
                      >
                        เติมรหัสผ่านอัตโนมัติ
                      </button>
                    </div>
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
