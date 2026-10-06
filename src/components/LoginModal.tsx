import React, { useState } from 'react';
import { UserRole, Student, Group, CurrentUser } from '../types';
import { EDUCATION_LEVELS } from '../data/initialData';
import { RAW_TEACHERS } from '../data/allTeachers';
import {
  GraduationCap,
  UserCheck,
  Shield,
  KeyRound,
  Check,
  AlertCircle,
  X,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  students: Student[];
  groups: Group[];
  onSelectUser: (user: CurrentUser) => void;
  currentRole?: UserRole;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  students,
  groups,
  onSelectUser,
  currentRole = 'student',
}) => {
  const [activeTab, setActiveTab] = useState<UserRole>(currentRole);

  // Student inputs
  const [studentIdInput, setStudentIdInput] = useState('');
  const [studentError, setStudentError] = useState('');

  // Teacher inputs
  const [groupCodeInput, setGroupCodeInput] = useState('');
  const [teacherError, setTeacherError] = useState('');

  // Admin password
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminSelectName, setAdminSelectName] = useState('มูฮามดัสกรี ลาบูอาปี');
  const [adminError, setAdminError] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);

  if (!isOpen) return null;

  const handleStudentLogin = (idToUse?: string) => {
    const id = (idToUse || studentIdInput).trim();
    if (!id) {
      setStudentError('กรุณากรอกรหัสนักศึกษา');
      return;
    }
    const found = students.find((s) => s.id === id);
    if (!found) {
      setStudentError('ไม่พบรหัสนักศึกษานี้ในระบบ กรุณาตรวจสอบอีกครั้งหรือเลือกจากรายชื่อด้านล่าง');
      return;
    }
    setStudentError('');
    onSelectUser({
      role: 'student',
      student: found,
      name: found.fullName,
    });
    if (onClose) onClose();
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
    onSelectUser({
      role: 'teacher',
      group: groupObj,
      name: groupObj.advisorName,
    });
    if (onClose) onClose();
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput !== 'Admin1234') {
      setAdminError('รหัสผ่านไม่ถูกต้อง! กรุณากรอกรหัสผ่าน "Admin1234"');
      return;
    }
    setAdminError('');
    onSelectUser({
      role: 'admin',
      name: `${adminSelectName} (Admin)`,
    });
    if (onClose) onClose();
  };

  const getLevelLabel = (levelId: string) => {
    const found = EDUCATION_LEVELS.find((l) => l.id === levelId);
    return found ? found.shortName : levelId;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 my-8 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 mb-3 font-bold text-xl">
            สกร.
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            ระบบลงทะเบียนเรียนออนไลน์
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ศูนย์ส่งเสริมการเรียนรู้ระดับอำเภอยี่งอ · เลือกระดับผู้ใช้งานเพื่อเข้าสู่ระบบ
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl mb-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('student')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all ${
              activeTab === 'student'
                ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            1. นักศึกษา
          </button>
          <button
            onClick={() => setActiveTab('teacher')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all ${
              activeTab === 'teacher'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            2. ครูประจำกลุ่ม
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all ${
              activeTab === 'admin'
                ? 'bg-white text-purple-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            3. ผู้ดูแลระบบ
          </button>
        </div>

        {/* Tab 1: Student Login */}
        {activeTab === 'student' && (
          <div className="space-y-4">
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5 text-xs text-emerald-900">
              <span className="font-semibold">เข้าสู่ระบบด้วยรหัสนักศึกษา:</span> เลือกลงทะเบียนรายวิชาตามระดับการศึกษา (ประถม, ม.ต้น, ม.ปลาย) และพิมพ์ใบลงทะเบียนได้ทันที
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleStudentLogin();
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  รหัสนักศึกษา (10 หลัก)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                    placeholder="เช่น 6113000153, 6311000041, 5712000522"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                  />
                  <KeyRound className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                </div>
                {studentError && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {studentError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
              >
                เข้าสู่ระบบลงทะเบียนเรียน
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Teacher Login */}
        {activeTab === 'teacher' && (
          <div className="space-y-4">
            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-900">
              <span className="font-semibold">เข้าสู่ระบบด้วยรหัสกลุ่ม:</span> ครูประจำกลุ่มสามารถตรวจสอบรายชื่อนักศึกษา อนุมัติการลงทะเบียน และสั่งพิมพ์ใบลงทะเบียนทั้งกลุ่มได้
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTeacherLogin();
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  รหัสกลุ่ม (Group Code เช่น 210001, 220001, 230001)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={groupCodeInput}
                    onChange={(e) => setGroupCodeInput(e.target.value)}
                    placeholder="เช่น 210008, 220009, 230032"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                  <KeyRound className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                </div>
                {teacherError && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {teacherError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
              >
                เข้าสู่ระบบครูประจำกลุ่ม
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Admin Login */}
        {activeTab === 'admin' && (
          <div className="space-y-4">
            <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-3.5 text-xs text-purple-900">
              <span className="font-semibold">ระบบผู้ดูแลระบบส่วนกลาง (Admin Portal):</span> กรุณากรอกรหัสผ่านผู้ดูแลระบบเพื่อเข้าสู่ระบบ
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  บทบาทผู้ใช้งาน
                </label>
                <div className="px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium">
                  ผู้ดูแลระบบส่วนกลาง (Central Admin)
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
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
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    required
                  />
                  <Lock className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                </div>
                {adminError && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {adminError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 mt-4"
              >
                <Lock className="w-4 h-4" />
                เข้าสู่ระบบผู้ดูแลระบบ (Admin)
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
