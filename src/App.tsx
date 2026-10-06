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
} from './types';
import {
  INITIAL_COURSES,
  INITIAL_STUDENTS,
  INITIAL_GROUPS,
  INITIAL_REGISTRATIONS,
  INITIAL_SETTINGS,
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
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

const DB_VERSION_KEY = 'skr_clean_db_v8_1018_all_verified';

function getInitialDataCleanly() {
  try {
    const cachedVersion = localStorage.getItem('skr_db_version');
    const cachedStudents = localStorage.getItem('skr_students');
    const isAuthentic = cachedStudents && cachedStudents.includes('6513000249');

    if (cachedVersion !== DB_VERSION_KEY || !isAuthentic) {
      localStorage.clear();
      localStorage.setItem('skr_db_version', DB_VERSION_KEY);
      localStorage.setItem('skr_students', JSON.stringify(INITIAL_STUDENTS));
      localStorage.setItem('skr_groups', JSON.stringify(INITIAL_GROUPS));
      localStorage.setItem('skr_courses', JSON.stringify(INITIAL_COURSES));
      localStorage.setItem('skr_registrations', JSON.stringify(INITIAL_REGISTRATIONS));
      localStorage.setItem('skr_settings', JSON.stringify(INITIAL_SETTINGS));
    }
  } catch {
    // ignore
  }
}
getInitialDataCleanly();

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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_STUDENTS.length && parsed.some(s => s.id === '6513000249')) {
          return parsed;
        }
      }
      return INITIAL_STUDENTS;
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

  // CRITICAL REQUIREMENT: When opening the link, ALWAYS start at the Login Screen (currentUser = null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

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

          if (cloudStudents && cloudStudents.length >= INITIAL_STUDENTS.length && cloudStudents.some(s => s.id === '6513000249')) {
            setStudents(cloudStudents);
          } else {
            setStudents(INITIAL_STUDENTS);
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
            teacherSignatureName: currentUser?.group?.advisorName || r.teacherSignatureName,
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

  const handleResetAllData = async (): Promise<boolean> => {
    try {
      localStorage.clear();
      localStorage.setItem('skr_db_version', DB_VERSION_KEY);
      localStorage.setItem('skr_students', JSON.stringify(INITIAL_STUDENTS));
      localStorage.setItem('skr_groups', JSON.stringify(INITIAL_GROUPS));
      localStorage.setItem('skr_courses', JSON.stringify(INITIAL_COURSES));
      localStorage.setItem('skr_registrations', JSON.stringify(INITIAL_REGISTRATIONS));
      localStorage.setItem('skr_settings', JSON.stringify(INITIAL_SETTINGS));

      setStudents(INITIAL_STUDENTS);
      setGroups(INITIAL_GROUPS);
      setCourses(INITIAL_COURSES);
      setRegistrations(INITIAL_REGISTRATIONS);
      setSettings(INITIAL_SETTINGS);

      // Re-seed to cloud
      saveFirestoreStudentsBatch(INITIAL_STUDENTS).catch((e) => console.warn(e));
      return true;
    } catch (err) {
      console.warn('Error during reset:', err);
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Find current student registration
  const currentStudentRegistration =
    currentUser?.role === 'student' && currentUser.student
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
        onSwitchUserClick={() => {
          if (currentUser) {
            setIsLoginModalOpen(true);
          } else {
            setCurrentUser(null);
          }
        }}
        onLogout={handleLogout}
        term={settings.term}
        academicYear={settings.academicYear}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* If NOT logged in: Show the dedicated Login Screen every time! */}
        {!currentUser && (
          <LoginScreen
            students={students}
            groups={groups}
            onLogin={(user) => setCurrentUser(user)}
            institutionName={settings.institutionName}
            term={settings.term}
            academicYear={settings.academicYear}
          />
        )}

        {/* If logged in as Student */}
        {currentUser?.role === 'student' && currentUser.student && (
          <StudentPortal
            student={currentUser.student}
            courses={courses}
            currentRegistration={currentStudentRegistration}
            settings={settings}
            onSaveRegistration={handleSaveRegistration}
          />
        )}

        {/* If logged in as Teacher */}
        {currentUser?.role === 'teacher' && currentUser.group && (
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

        {/* If logged in as Admin */}
        {currentUser?.role === 'admin' && (
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
            onResetAllData={handleResetAllData}
          />
        )}
      </main>

      {/* Modal for switching user when already logged in */}
      {currentUser && (
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
      )}

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
