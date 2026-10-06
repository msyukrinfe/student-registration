const fs = require('fs');
const path = require('path');

const primary = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/students_primary.json'), 'utf8'));
const junior1 = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/students_junior_part1.json'), 'utf8'));
const junior2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/students_junior_part2.json'), 'utf8'));
const senior = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/students_senior.json'), 'utf8'));

const additionalJunior = [
  { id: '6812000991', name: 'นาย อิลฮัม สาเด็ง', level: 'junior_high', group: '220026' },
  { id: '6812000992', name: 'นางสาว ฟารีดา มะแซ', level: 'junior_high', group: '220026' },
  { id: '6812000993', name: 'นาย ซุลกิฟลี ดาโอะ', level: 'junior_high', group: '220026' },
  { id: '6912000994', name: 'นางสาว รูซีนา มะยิ', level: 'junior_high', group: '220026' },
  { id: '6912000995', name: 'นาย ฮาฟิซ สาเด็ง', level: 'junior_high', group: '220026' },

  { id: '6812000996', name: 'นาย อับดุลเลาะ สาบูดิง', level: 'junior_high', group: '220034' },
  { id: '6812000997', name: 'นางสาว อาซีซะห์ ยะโกะ', level: 'junior_high', group: '220034' },
  { id: '6812000998', name: 'นาย มูฮัมหมัดซูกรี สะมะแอ', level: 'junior_high', group: '220034' },
  { id: '6912000999', name: 'นางสาว นูรีดา มะดีเยาะ', level: 'junior_high', group: '220034' },
  { id: '6912001000', name: 'นาย อัสรัน เจ๊ะเลาะ', level: 'junior_high', group: '220034' },

  { id: '6812001001', name: 'นาย มูฮัมหมัดอารีฟ ลาบูอาปี', level: 'junior_high', group: '220037' },
  { id: '6812001002', name: 'นางสาว ฮานาน ดือราแม', level: 'junior_high', group: '220037' },
  { id: '6812001003', name: 'นาย ฟาริส หะยีอาแว', level: 'junior_high', group: '220037' },
  { id: '6912001004', name: 'นางสาว โรสนานี แวหะมะ', level: 'junior_high', group: '220037' },
  { id: '6912001005', name: 'นาย มูฮำมัดฟาอีส บือโต', level: 'junior_high', group: '220037' },
];

const allJunior = [...junior1, ...junior2, ...additionalJunior];

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
