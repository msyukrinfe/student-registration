import React from 'react';
import { CurrentUser, EducationLevel } from '../types';
import { EDUCATION_LEVELS } from '../data/initialData';
import { GraduationCap, UserCheck, Shield, LogOut, ArrowRightLeft, LogIn } from 'lucide-react';

interface NavbarProps {
  currentUser: CurrentUser | null;
  onSwitchUserClick: () => void;
  onLogout: () => void;
  term: string;
  academicYear: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUserClick,
  onLogout,
  term,
  academicYear,
}) => {
  const getRoleLabel = () => {
    if (!currentUser) return '';
    switch (currentUser.role) {
      case 'student':
        return 'นักศึกษา';
      case 'teacher':
        return 'ครูประจำกลุ่ม';
      case 'admin':
        return 'ผู้ดูแลระบบ (Admin)';
    }
  };

  const getRoleIcon = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case 'student':
        return <GraduationCap className="w-4 h-4 text-emerald-600" />;
      case 'teacher':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-600" />;
    }
  };

  const getStudentLevelName = (level?: EducationLevel) => {
    if (!level) return '';
    const found = EDUCATION_LEVELS.find((l) => l.id === level);
    return found ? found.shortName : '';
  };

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm font-bold text-lg">
            สก
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 tracking-tight">
                ระบบลงทะเบียนเรียน สกร.
              </span>
              <span className="hidden sm:inline-block text-xs font-medium text-slate-500">
                อ.ยี่งอ
              </span>
            </div>
            <div className="text-xs text-slate-500 hidden md:block">
              ภาคเรียนที่ {term}/{academicYear} · 3 ระดับการศึกษา
            </div>
          </div>
        </div>

        {/* Zone 2: Active User Information */}
        {currentUser && (
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors">
              {getRoleIcon()}
              <div>
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <span className="text-[11px] font-normal text-slate-500">({getRoleLabel()})</span>
                </div>
                {currentUser.role === 'student' && currentUser.student && (
                  <div className="text-[11px] text-slate-500">
                    {getStudentLevelName(currentUser.student.level)} · รหัส {currentUser.student.id}
                  </div>
                )}
                {currentUser.role === 'teacher' && currentUser.group && (
                  <div className="text-[11px] text-slate-500">
                    {currentUser.group.name} ({currentUser.group.code})
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Zone 3: Actions */}
        {currentUser && (
          <div className="flex items-center gap-2">
            <button
              onClick={onSwitchUserClick}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              title="เปลี่ยนบทบาทผู้ใช้งาน (นักศึกษา / ครู / Admin)"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">สลับผู้ใช้</span>
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
              title="ออกจากระบบ"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
