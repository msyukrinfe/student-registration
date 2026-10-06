export interface RawTeacherRecord {
  groupCodes: string[];
  name: string;
  role: 'Admin' | 'ครู';
}

export const RAW_TEACHERS: RawTeacherRecord[] = [
  { groupCodes: ['210037', '220037', '230037'], name: 'มูฮามดัสกรี ลาบูอาปี', role: 'Admin' },
  { groupCodes: ['210038', '220038', '230036'], name: 'สุกรี สาเมา๊ะ', role: 'Admin' },
  { groupCodes: ['210001', '220001', '230001'], name: 'รุสดา นิดิง', role: 'ครู' },
  { groupCodes: ['210016', '220016', '230016'], name: 'กิสนี ตอเละ', role: 'ครู' },
  { groupCodes: ['220040', '230038'], name: 'นุรอาซียะ แซมิง', role: 'ครู' },
  { groupCodes: ['210003', '220003', '230003'], name: 'ซีมา บือราเฮงดือรา', role: 'ครู' },
  { groupCodes: ['220026', '230032'], name: 'กาตีนี สาเด็ง', role: 'ครู' },
  { groupCodes: ['210023', '220023', '230023'], name: 'กาญจนา พรศิริ', role: 'ครู' },
  { groupCodes: ['210002', '230033'], name: 'ซูไรนับ หะยีวาเด็ง', role: 'ครู' },
  { groupCodes: ['210022', '220022', '230023'], name: 'สาลือมา บือซา', role: 'ครู' },
  { groupCodes: ['220005', '230005'], name: 'สุไฮนา มะวะวา', role: 'ครู' },
  { groupCodes: ['220009', '220034'], name: 'มะนาวี สาบูดิง', role: 'ครู' },
  { groupCodes: ['220031', '230031'], name: 'ฟาตีเมาะ ปะจูดิง', role: 'ครู' },
  { groupCodes: ['210004', '220004', '230004'], name: 'อามีนา ดามิเด็ง', role: 'ครู' },
  { groupCodes: ['210039', '220041', '230011'], name: 'อาซียะห์ โละมะ', role: 'ครู' },
  { groupCodes: ['210024', '220002', '230002'], name: 'รูฮานา กือลาแต', role: 'ครู' },
  { groupCodes: ['210008', '220008', '230008'], name: 'สุนีย์ บินแวนาแว', role: 'ครู' },
  { groupCodes: ['210007', '220007', '230007'], name: 'รุซฎา วาเจะ', role: 'ครู' },
  { groupCodes: ['210014', '220014', '230014'], name: 'อานีซา สะมะแอ', role: 'ครู' },
  { groupCodes: ['210012', '220012', '230012'], name: 'นาดีญา สาและ', role: 'ครู' },
  { groupCodes: ['210015', '220015', '230015'], name: 'อามลีนา อูมา', role: 'ครู' },
  { groupCodes: ['210010', '220010', '230010'], name: 'อดุลย์ ซะลอ', role: 'ครู' },
  { groupCodes: ['220042', '230039'], name: 'นุชนารถ แก้วถาวร', role: 'ครู' },
];

export function getAdvisorForGroup(groupCode: string): string {
  const teacher = RAW_TEACHERS.find((t) => t.groupCodes.includes(groupCode));
  return teacher ? teacher.name : 'ครูประจำกลุ่ม';
}
