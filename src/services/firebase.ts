import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Course, Student, Group, RegistrationRecord, SystemSettings } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.warn('Firestore Notice:', JSON.stringify(errInfo));
  return errInfo;
}

// Test connectivity
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'settings', 'config'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using offline cache/local storage.');
    }
    return false;
  }
}

// Collection Helpers
export async function loadFirestoreCourses(): Promise<Course[] | null> {
  try {
    const snap = await getDocs(collection(db, 'courses'));
    if (snap.empty) return null;
    return snap.docs.map((d) => d.data() as Course);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'courses');
    return null;
  }
}

export async function saveFirestoreCourse(course: Course): Promise<void> {
  try {
    await setDoc(doc(db, 'courses', course.id), course);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `courses/${course.id}`);
  }
}

export async function deleteFirestoreCourse(courseId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'courses', courseId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `courses/${courseId}`);
  }
}

export async function loadFirestoreStudents(): Promise<Student[] | null> {
  try {
    const snap = await getDocs(collection(db, 'students'));
    if (snap.empty) return null;
    return snap.docs.map((d) => d.data() as Student);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'students');
    return null;
  }
}

export async function saveFirestoreStudentsBatch(students: Student[]): Promise<void> {
  try {
    // Save in parallel chunks
    const promises = students.map((s) => setDoc(doc(db, 'students', s.id), s));
    await Promise.all(promises);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'students');
  }
}

export async function loadFirestoreRegistrations(): Promise<RegistrationRecord[] | null> {
  try {
    const snap = await getDocs(collection(db, 'registrations'));
    if (snap.empty) return null;
    return snap.docs.map((d) => d.data() as RegistrationRecord);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'registrations');
    return null;
  }
}

export async function saveFirestoreRegistration(record: RegistrationRecord): Promise<void> {
  try {
    await setDoc(doc(db, 'registrations', record.id), record);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `registrations/${record.id}`);
  }
}

export async function loadFirestoreSettings(): Promise<SystemSettings | null> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'config'));
    if (snap.exists()) {
      return snap.data() as SystemSettings;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'settings/config');
    return null;
  }
}

export async function saveFirestoreSettings(settings: SystemSettings): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'config'), settings);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/config');
  }
}
