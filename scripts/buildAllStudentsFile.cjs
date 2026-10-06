const fs = require('fs');
const path = require('path');

const primary = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/students_primary.json'), 'utf8'));
const junior1 = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/students_junior_part1.json'), 'utf8'));
const junior2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/students_junior_part2.json'), 'utf8'));
const senior = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/students_senior.json'), 'utf8'));

const allJunior = [...junior1, ...junior2];

const rawStudents = [];

primary.forEach(s => {
  rawStudents.push({
    id: s.id,
    fullName: s.name,
    levelText: 'ประถมศึกษา',
    groupCode: s.group,
  });
});

allJunior.forEach(s => {
  rawStudents.push({
    id: s.id,
    fullName: s.name,
    levelText: 'มัธยมศึกษาตอนต้น',
    groupCode: s.group,
  });
});

senior.forEach(s => {
  rawStudents.push({
    id: s.id,
    fullName: s.name,
    levelText: 'มัธยมศึกษาตอนปลาย',
    groupCode: s.group,
  });
});

console.log('Total raw students:', rawStudents.length);

const tsContent = `import { Student, EducationLevel } from '../types';
import { getAdvisorForGroup } from './allTeachers';

export interface RawStudentRecord {
  id: string;
  fullName: string;
  levelText: string;
  groupCode: string;
}

export const RAW_STUDENTS: RawStudentRecord[] = ${JSON.stringify(rawStudents, null, 2)};

export function parseLevel(levelText: string): EducationLevel {
  if (levelText.includes('ประถม')) return 'primary';
  if (levelText.includes('ตอนต้น') || levelText.includes('ม.ต้น')) return 'junior_high';
  return 'senior_high';
}

export const INITIAL_STUDENTS_FROM_PDF: Student[] = RAW_STUDENTS.map((raw) => {
  const level = parseLevel(raw.levelText);
  const advisor = getAdvisorForGroup(raw.groupCode);
  return {
    id: raw.id,
    nationalId: \`19699\${raw.id.slice(-8)}\`,
    fullName: raw.fullName,
    level,
    groupCode: raw.groupCode,
    groupName: \`กลุ่ม \${raw.groupCode} (\${advisor})\`,
    advisorName: advisor,
    phone: '',
  };
});
`;

fs.writeFileSync(path.join(__dirname, '../src/data/allStudents.ts'), tsContent, 'utf8');
console.log('Successfully wrote src/data/allStudents.ts with', rawStudents.length, 'students!');
