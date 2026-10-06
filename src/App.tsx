/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Course,
  Student,
  Group,
  RegistrationRecord,
  SystemSettings,
  CurrentUser,
  UserRole,
} from './types';
import {
  INITIAL_COURSES,
  INITIAL_STUDENTS,
  INITIAL_GROUPS,
  INITIAL_REGISTRATIONS,
  INITIAL_SETTINGS,
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { StudentPortal } from './components/StudentPortal';
import { TeacherPortal } from './components/TeacherPortal';
import { AdminPortal } from './components/AdminPortal';
import {
  testFirestoreConnection,
  loadFirestoreCourses,
  saveFirestoreCourse,
  loadFirestoreStudents,
  saveFirestoreStudentsBatch,
  loadFirestoreRegistrations,
  saveFirestoreRegistration,
  loadFirestoreSettings,
  saveFirestoreSettings,
} from './services/firebase';

export default function App() {
  // Database states with localStorage + Firebase persistence
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('skr_courses');
      return saved ? JSON.parse(saved) : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('skr_students');
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [groups, setGroups] = useState<Group[]>(() => {
    try {
      const saved = localStorage.getItem('skr_groups');
      return saved ? JSON.parse(saved) : INITIAL_GROUPS;
    } catch {
      return INITIAL_GROUPS;
    }
  });

  const [registrations, setRegistrations] = useState<RegistrationRecord[]>(() => {
    try {
      const saved = localStorage.getItem('skr_registrations');
      return saved ? JSON.parse(saved) : INITIAL_REGISTRATIONS;
    } catch {
      return INITIAL_REGISTRATIONS;
    }
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('skr_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [firebaseStatus, setFirebaseStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');

  // Current logged in user (defaults to authentic student from database)
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    const defaultStudent = INITIAL_STUDENTS[0];
    return {
      role: 'student',
      student: defaultStudent,
      name: defaultStudent.fullName,
    };
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Initialize and Sync with Firebase Firestore on mount
  useEffect(() => {
    let isMounted = true;

    async function initFirebase() {
      try {
        const isConnected = await testFirestoreConnection();
        if (!isMounted) return;

        if (isConnected) {
          setFirebaseStatus('connected');
          // Try loading from Firebase
          const [cloudCourses, cloudStudents, cloudRegistrations, cloudSettings] = await Promise.all([
            loadFirestoreCourses(),
            loadFirestoreStudents(),
            loadFirestoreRegistrations(),
            loadFirestoreSettings(),
          ]);

          if (!isMounted) return;

          if (cloudCourses && cloudCourses.length > 0) {
            setCourses(cloudCourses);
          } else {
            // First time seed to cloud
            INITIAL_COURSES.forEach((c) => saveFirestoreCourse(c));
          }

          if (cloudStudents && cloudStudents.length > 0) {
            setStudents(cloudStudents);
          } else {
            saveFirestoreStudentsBatch(INITIAL_STUDENTS);
          }

          if (cloudRegistrations && cloudRegistrations.length > 0) {
            setRegistrations(cloudRegistrations);
          } else {
            INITIAL_REGISTRATIONS.forEach((r) => saveFirestoreRegistration(r));
          }

          if (cloudSettings) {
            setSettings(cloudSettings);
          } else {
            saveFirestoreSettings(INITIAL_SETTINGS);
          }
        } else {
          setFirebaseStatus('offline');
        }
      } catch (err) {
        console.warn('Firebase sync warning:', err);
        if (isMounted) setFirebaseStatus('offline');
      }
    }

    initFirebase();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('skr_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('skr_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('skr_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('skr_registrations', JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem('skr_settings', JSON.stringify(settings));
  }, [settings]);

  // Handlers for updating registrations (syncs to both state & Firestore)
  const handleSaveRegistration = (newRecord: RegistrationRecord) => {
    setRegistrations((prev) => {
      const exists = prev.some((r) => r.id === newRecord.id);
      if (exists) {
        return prev.map((r) => (r.id === newRecord.id ? newRecord : r));
      } else {
        return [newRecord, ...prev];
      }
    });

    // Save to Firestore
    saveFirestoreRegistration(newRecord).catch((e) => console.warn(e));
  };

  const handleBatchApprove = (studentIds: string[]) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear() + 543}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setRegistrations((prev) =>
      prev.map((r) => {
        if (studentIds.includes(r.studentId) && r.status === 'pending_teacher') {
          const updated: RegistrationRecord = {
            ...r,
            status: 'approved',
            approvedAt: formattedDate,
            teacherSignatureName: currentUser.group?.advisorName || r.teacherSignatureName,
          };
          saveFirestoreRegistration(updated).catch((e) => console.warn(e));
          return updated;
        }
        return r;
      })
    );
  };

  const handleUpdateCourses = (newCourses: Course[]) => {
    setCourses(newCourses);
    newCourses.forEach((c) => saveFirestoreCourse(c).catch((e) => console.warn(e)));
  };

  const handleUpdateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    saveFirestoreSettings(newSettings).catch((e) => console.warn(e));
  };

  // Find current student registration
  const currentStudentRegistration =
    currentUser.role === 'student' && currentUser.student
      ? registrations.find(
          (r) =>
            r.studentId === currentUser.student?.id &&
            r.term === settings.term &&
            r.academicYear === settings.academicYear
        )
      : undefined;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Prompt',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onSwitchUserClick={() => setIsLoginModalOpen(true)}
        onLogout={() => setIsLoginModalOpen(true)}
        term={settings.term}
        academicYear={settings.academicYear}
      />

      {/* Cloud Status Badge */}
      <div className="no-print bg-slate-100 border-b border-slate-200 py-1 px-4 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            firebaseStatus === 'connected'
              ? 'bg-emerald-500'
              : firebaseStatus === 'connecting'
              ? 'bg-amber-500 animate-ping'
              : 'bg-slate-400'
          }`}
        />
        <span>
          ฐานข้อมูล Firebase (โปรเจ็ค <strong>student registration</strong>):{' '}
          {firebaseStatus === 'connected' ? (
            <span className="text-emerald-700 font-medium">เชื่อมต่อระบบคลาวด์ Firestore พร้อมใช้งาน</span>
          ) : firebaseStatus === 'connecting' ? (
            <span className="text-amber-700 font-medium">กำลังเชื่อมต่อคลาวด์...</span>
          ) : (
            <span className="text-slate-600">พร้อมใช้งาน (ระบบบันทึกข้อมูลแบบออฟไลน์/แคช)</span>
          )}
        </span>
      </div>

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentUser.role === 'student' && currentUser.student && (
          <StudentPortal
            student={currentUser.student}
            courses={courses}
            currentRegistration={currentStudentRegistration}
            settings={settings}
            onSaveRegistration={handleSaveRegistration}
          />
        )}

        {currentUser.role === 'teacher' && currentUser.group && (
          <TeacherPortal
            group={currentUser.group}
            students={students}
            courses={courses}
            registrations={registrations}
            settings={settings}
            onUpdateRegistration={handleSaveRegistration}
            onBatchApprove={handleBatchApprove}
          />
        )}

        {currentUser.role === 'admin' && (
          <AdminPortal
            courses={courses}
            students={students}
            groups={groups}
            registrations={registrations}
            settings={settings}
            onUpdateCourses={handleUpdateCourses}
            onUpdateStudents={setStudents}
            onUpdateGroups={setGroups}
            onUpdateRegistrations={setRegistrations}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </main>

      {/* Global Login & User Switch Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        students={students}
        groups={groups}
        onSelectUser={(user) => {
          setCurrentUser(user);
          setIsLoginModalOpen(false);
        }}
        currentRole={currentUser.role}
      />

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © {new Date().getFullYear() + 543} {settings.institutionName} · สกร.อำเภอยี่งอ
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>ระบบทะเบียน 3 ระดับการศึกษา</span>
            <span>·</span>
            <span>ฐานข้อมูลคลาวด์ Firebase: student registration</span>
            <span>·</span>
            <span>ดาวน์โหลดเอกสาร PDF มาตรฐาน</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
