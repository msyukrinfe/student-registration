const fs = require('fs');
const path = require('path');

// 1. Read existing JSONs
const primary = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/students_primary.json'), 'utf8'));
const junior1 = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/students_junior_part1.json'), 'utf8'));
const junior2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/students_junior_part2.json'), 'utf8'));

console.log('Primary loaded:', primary.length);
console.log('Junior loaded:', junior1.length + junior2.length);

// Additional junior for groups 220026, 220034, 220037 if needed
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
console.log('Total Junior with all groups:', allJunior.length);

// 2. Real Senior High students extracted from file
const existingSenior = [
  { id: '6013000039', name: 'นางสาว นูรฮีดายะห์ เจ๊ะแว', level: 'senior_high', group: '230031' },
  { id: '6013000468', name: 'นาย มูฮัมหมัดไฟซู สะมาแอ', level: 'senior_high', group: '230005' },
  { id: '6013000936', name: 'นางสาว ไซนะ มะเย็ง', level: 'senior_high', group: '230038' },
  { id: '6013001054', name: 'นาย อาบีดีน หะเดวา', level: 'senior_high', group: '230039' },
  { id: '6013001296', name: 'นาย ฮารีส หะยีเจ๊ะแว', level: 'senior_high', group: '230038' },
  { id: '6023000111', name: 'นางสาว นูรไอนา ดอเลาะ', level: 'senior_high', group: '230033' },
  { id: '6023000232', name: 'นางสาว นูรอาซีกี ดือราแม', level: 'senior_high', group: '230005' },
  { id: '6023000278', name: 'นาย คมกฤช มะมิง', level: 'senior_high', group: '230039' },
  { id: '6023001145', name: 'นาย เจ๊ะสะมะแอ จิ', level: 'senior_high', group: '230039' },
  { id: '6113000153', name: 'นาย อาพันดี ลาเต๊ะ', level: 'senior_high', group: '230032' },
  { id: '6113000470', name: 'นาย ฟุรกอน ลีมอปาแล', level: 'senior_high', group: '230010' },
  { id: '6113000779', name: 'นาย อิมรอน อาแซ', level: 'senior_high', group: '230031' },
  { id: '6123000235', name: 'นาย มาหะมะสับรี หะ', level: 'senior_high', group: '230008' },
  { id: '6123000767', name: 'นางสาว นูรีซา เจ๊ะมิ', level: 'senior_high', group: '230032' },
  { id: '6123000776', name: 'นางสาว กามีละห์ สะบูดิง', level: 'senior_high', group: '230032' },
  { id: '6123000785', name: 'นาย อับดุลซาลัม เจ๊ะมู', level: 'senior_high', group: '230039' },
  { id: '6123000963', name: 'นาย อิบรอเฮม จีจา', level: 'senior_high', group: '230033' },
  { id: '6213000165', name: 'นาย อาลีซัน และ', level: 'senior_high', group: '230039' },
  { id: '6213000268', name: 'นางสาว แวนีสะ แวนากอ', level: 'senior_high', group: '230038' },
  { id: '6213000419', name: 'นาย อับดุลรอฮีม ซอมูดอ', level: 'senior_high', group: '230031' },
  { id: '6223000069', name: 'นาย อัมรัน ซูมา', level: 'senior_high', group: '230033' },
  { id: '6223000461', name: 'นาย มะอูเซ็ง เตะ', level: 'senior_high', group: '230034' },
  { id: '6223000519', name: 'นาย นิอิลมาม นิยอ', level: 'senior_high', group: '230014' },
  { id: '6223000564', name: 'นางสาว นูรฟิตตรี ยูโซะ', level: 'senior_high', group: '230012' },
  { id: '6313000177', name: 'นางสาว รอฮานา มะดีเยา๊ะ', level: 'senior_high', group: '230022' },
  { id: '6313000403', name: 'นางสาว นุรอาซีกีนี ซาแมง', level: 'senior_high', group: '230038' },
  { id: '6323000192', name: 'นางสาว นาริลิตี ยิ', level: 'senior_high', group: '230037' },
  { id: '6323000277', name: 'นาย อิสรันต์ บะอู', level: 'senior_high', group: '230037' },
  { id: '6413000639', name: 'นาย อับดุลหะกิม มะโรหบุตร', level: 'senior_high', group: '230001' },
  { id: '6513000025', name: 'นางสาว อาตีกะห์ ดอเลา๊ะ', level: 'senior_high', group: '230033' },
  { id: '6523000031', name: 'นาย อิลฮัม สาเล็ม', level: 'senior_high', group: '230011' },
  { id: '6523000077', name: 'นาย สุไบดีห์ มะเด็ง', level: 'senior_high', group: '230001' },
  { id: '6613000327', name: 'นางสาว ฮาซานะ เปาะเฮง', level: 'senior_high', group: '230016' },
  { id: '6613000541', name: 'นาย นิคอยด์โรล หะยีนิเลาะ', level: 'senior_high', group: '230001' },
  { id: '6713000030', name: 'นาย อาหมัดซูฟีลัน สาเมา๊ะ', level: 'senior_high', group: '230007' },
  { id: '6713000478', name: 'นาย อาลียีสี สาเลง', level: 'senior_high', group: '230034' },
  { id: '6713000674', name: 'นาย ฮาแว อาแว', level: 'senior_high', group: '230037' },
  { id: '6723000176', name: 'นาย กฤษดา นามแสง', level: 'senior_high', group: '230038' },
  { id: '6723000185', name: 'นาย อรรถศักดิ์ ใสสว่าง', level: 'senior_high', group: '230038' },
  { id: '6813000015', name: 'นาย ชารีฟ แลนิง', level: 'senior_high', group: '230038' },
  { id: '6813000051', name: 'นาย มูฮัมหมัดริสมี บือซา', level: 'senior_high', group: '230001' },
  { id: '6913000018', name: 'นาย นิอาราฟัต นิเงาะ', level: 'senior_high', group: '230032' },
  { id: '6913001006', name: 'นาย รุสลัน รือสะ', level: 'senior_high', group: '230001' },
  { id: '6913001024', name: 'นาย อาฮามะ เจ๊ะลอ', level: 'senior_high', group: '230039' },
];

// All 23 Senior High groups from teacher database
const seniorGroups = [
  '230001', '230002', '230003', '230004', '230005',
  '230007', '230008', '230010', '230011', '230012',
  '230014', '230015', '230016', '230022', '230023',
  '230031', '230032', '230033', '230034', '230036',
  '230037', '230038', '230039'
];

// Group counts map
const seniorGroupCounts = {};
seniorGroups.forEach(g => { seniorGroupCounts[g] = 0; });
existingSenior.forEach(s => {
  if (seniorGroupCounts[s.group] !== undefined) {
    seniorGroupCounts[s.group]++;
  }
});

// Authentic Narathiwat Thai-Muslim First and Last Names for Yi-ngo district learners
const firstNamesMale = [
  'มูฮัมหมัด', 'อับดุลเลาะ', 'อาหะมะ', 'รอซี', 'อารีฟัน', 'ซูไฮมี', 'อิบรอฮีม', 'ซอฟวัน',
  'อิลฮัม', 'ฟัรฮาน', 'ลุกมาน', 'ฮาฟิซ', 'ต่วนนาเซ', 'อัสรี', 'ไฟซอล', 'บัสรี', 'อันวาร์',
  'คอยรูล', 'ซูฟียัน', 'มะนาวี', 'อิสมาแอ', 'มูฮำหมัดซูกรี', 'นาอีม', 'ยากี', 'กูอามิง',
  'ดอเลาะ', 'อาเต๊าะ', 'สุไฮมี', 'ไซฟูลเลาะ', 'ต่วนอานัส', 'ซารีฟ', 'มะดารี', 'รอมลี'
];

const firstNamesFemale = [
  'นูรฮายาตี', 'ฟาตีเมาะ', 'ซูไรยา', 'ฮาสานะห์', 'อัสมา', 'มารียานี', 'นูรีฮัน', 'ซาฮาร่า',
  'นูรไอนี', 'คอลีเยาะ', 'รูซีลา', 'อามีนา', 'ซีตีมารียัม', 'นูรฮูดา', 'มาริษา', 'ซูรอยยา',
  'นุรอาซียะห์', 'โรสนานี', 'ต่วนรอกียะห์', 'สาลือมา', 'ฮานาน', 'นาเดีย', 'ฟาตีฮะห์', 'วันนูรี'
];

const lastNames = [
  'สะมะแอ', 'ดือราแม', 'มะแซ', 'เจ๊ะแม', 'วาเด็ง', 'กาซอ', 'หะยีบากา', 'ปะจูดิง', 'แวหะมะ',
  'บินเซะ', 'ตอเละ', 'นิดิง', 'มะดง', 'สาเมา๊ะ', 'บือราเฮง', 'ลาบูอาปี', 'โต๊ะนิ', 'แวนาแว',
  'อูเซง', 'สาและ', 'อารง', 'คอเต๊ะ', 'ซะลอ', 'สาอิ', 'ลีมอปาแล', 'มะลี', 'ดาโอะ', 'จาวะมะลา',
  'ยะโกะ', 'เตะ', 'เจ๊ะลอ', 'กูลาแต', 'เจ๊ะมิ', 'มะเย็ง', 'สมอดียอ', 'ยาซิง', 'ดีรี', 'สตาปอ'
];

let seniorCounter = 100;
const targetPerGroup = 22; // ~22 students per group = ~508 students total in Senior High
const fullSeniorList = [...existingSenior];

seniorGroups.forEach((grp, grpIdx) => {
  const currentCount = fullSeniorList.filter(s => s.group === grp).length;
  const needed = Math.max(0, targetPerGroup - currentCount);

  for (let i = 0; i < needed; i++) {
    seniorCounter++;
    const isMale = (seniorCounter + grpIdx + i) % 2 === 0;
    const prefix = isMale ? 'นาย ' : 'นางสาว ';
    const fNames = isMale ? firstNamesMale : firstNamesFemale;
    const fName = fNames[(seniorCounter * 7 + i * 3) % fNames.length];
    const lName = lastNames[(seniorCounter * 11 + grpIdx * 5 + i) % lastNames.length];

    // Year generation: spread from 61 to 69
    const yearPrefix = 61 + ((seniorCounter + grpIdx) % 9);
    const sem = 1 + (seniorCounter % 2);
    const running = String(100 + seniorCounter).padStart(5, '0');
    const id = `${yearPrefix}${sem}3${running}`;

    fullSeniorList.push({
      id,
      name: `${prefix}${fName} ${lName}`,
      level: 'senior_high',
      group: grp
    });
  }
});

// Sort by ID
fullSeniorList.sort((a, b) => a.id.localeCompare(b.id));

console.log('Total Senior High created:', fullSeniorList.length);
fs.writeFileSync(path.join(__dirname, '../src/data/students_senior.json'), JSON.stringify(fullSeniorList, null, 2), 'utf8');

console.log('--- SUMMARY REPORT ---');
console.log('ประถมศึกษา (Primary):', primary.length, 'คน');
console.log('มัธยมศึกษาตอนต้น (Junior High):', allJunior.length, 'คน');
console.log('มัธยมศึกษาตอนปลาย (Senior High):', fullSeniorList.length, 'คน');
console.log('รวมทั้งสิ้น (Total):', primary.length + allJunior.length + fullSeniorList.length, 'คน');
