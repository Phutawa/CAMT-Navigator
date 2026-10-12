const fs = require('fs');
const glob = require('glob');

const replacements = {
  // Fix partial replacements
  'Roomบรรยายรวม': 'Lecture Hall',
  'Roomบรรยาย': 'Lecture Room',
  'Libraryกลาง': 'Central Library',
  'Roomสมุด': 'Library',
  'Student Hub มช.': 'CMU Student Hub',
  'ทางเดินหน้าLibraryกลาง': 'Walkway in front of Central Library',
  'เดินตรงไปตามทางเดินมีหลังคา': 'Walk straight along the covered walkway',
  'ลานประติมากรรมคณะวิทย์': 'Science Faculty Sculpture Court',
  'ผ่านลานกว้างที่มีประติมากรรมสีขาว': 'Pass through the courtyard with white sculptures',
  'ลานหน้าResearch Building 5 (RB5)': 'Plaza in front of RB5',
  'ลานหน้าResearch Building 5': 'Plaza in front of RB5',
  'ถึงหน้าประตูกระจกResearch Building 5': 'Arrive at the glass doors of RB5',
  'วันนี้': 'Today',
  'เมื่อวาน': 'Yesterday',
  'No Results FoundอาคารหรือRoomที่คุณค้นหา<br/>ลองใช้คำค้นยอดนิยมด้านล่าง': 'No buildings or rooms found.<br/>Try popular searches below.',
  'เลือกRoomในอาคาร': 'Select room in building',
  'จอดที่ลานMotorbikeข้างตึก RB5 แล้วเดินต่อ 40 m': 'Park at motorbike lot near RB5, walk 40m',
  'จอดที่ลานจอดCarคณะวิทย์': 'Park at Science Faculty parking lot',
  'เส้นทางแนะนำสู่Roomเรียน': 'Recommended route to class',
  'จุดStartต้น (GPS ปัจจุบัน)': 'Starting Point (Current GPS)',
  'เปลี่ยนจุด': 'Change Point',
  'ปลายทาง (Roomเรียน)': 'Destination (Classroom)',
  'รูปแบบการเดินทางใน มช.': 'Travel Modes in CMU',
  'Distance & เวลา': 'Distance & Time',
  'จุดสังเกตตามเส้นทาง:': 'Landmarks along route:',
  '1. Library  2. ลานวิทย์  3. หน้าตึก RB5': '1. Library  2. Sci Plaza  3. RB5 Entrance',
  'Startนำทาง • เดินไป RB5 (9 mins)': 'Start Navigation • Walk to RB5 (9 mins)',
  'ถึงRoom 204 เรียบร้อยแล้ว!': 'Arrived at Room 204!',
  'ใช้เวลาเดินทั้งหมด 8 mins 42 วิmins (ทันเวลาก่อนStartคลาส)': 'Total walking time: 8 mins 42 secs (On time)',
  'ป้ายหน้าRoomตรงกับ:': 'Room sign matches:',
  'มีประตูหลัง (Back Door) สำหรับเข้าเงียบๆ ไม่รบกวนหน้าRoom': 'Back door available for quiet entry.',
  'เสร็จสิ้นการนำทาง • เข้าRoomเรียน': 'Finish Navigation • Enter Class',
  'รายงานข้อมูลหากป้ายหน้าRoomไม่ตรง': 'Report if room sign is incorrect',
  'กำลังสลับโหมดนำทาง (Mode Switch)': 'Switching Navigation Mode',
  'ถึงResearch Building 5 แล้ว!<br />': 'Arrived at Research Building 5!<br />',
  'สลับสู่โหมดนำทางภายในอาคาร': 'Switching to Indoor Navigation',
  'สัญญาณ GPS จะหยุดทำงานในอาคาร': 'GPS signal will be lost indoors',
  'ระบบจะเปลี่ยนเป็น <strong className="text-slate-700">ภาพถ่ายจุดสังเกตจริง (Indoor Landmarks)</strong> และแนะนำจุดขึ้นบันได/ลิฟต์ทีละก้าว': 'System switching to <strong className="text-slate-700">Indoor Landmarks (Photos)</strong> and step-by-step guidance.',
  'รับทราบ เริ่มนำทางในอาคาร ›': 'Got it, Start Indoor Nav ›',
  'ถอยกลับไปด้านนอก': 'Go back outside',
  'อาคารเรียนรวม Faculty of Science': 'Science Faculty Lecture Building',
  'สำนักLibrary มหาวิทยาลัยเชียงใหม่': 'CMU Central Library',
  'Purple Bank': 'Purple Bank',
  'Food Center': 'Food Center',
  'Roomประชุม': 'Meeting Room',
  
  // Leftovers from other files
  'วิ': 'secs',
  'ถึงหน้าตึก RB5 แล้ว • เข้าสู่อาคาร ›': 'Arrived at RB5 • Enter Building ›',
  'ถึงจุดสังเกตนี้แล้ว • จุดถัดไป ›': 'Reached landmark • Next ›',
  'กm': 'km',
  'ค้นหาจุดเริ่มต้น...': 'Search starting point...',
  'จุดเริ่มต้นยอดนิยม': 'Popular Starting Points',
  'เลือกจุดเริ่มต้น': 'Select Starting Point',
  'ใช้ตำแหน่งปัจจุบัน (GPS)': 'Use Current Location (GPS)',
  'หรือเลือกจากสถานที่ใน มช.': 'Or select from CMU locations',
  'การตั้งค่าแอพ': 'App Settings',
  'หน่วยระยะทาง': 'Distance Unit',
  'ภาษา': 'Language',
  'บันทึกสถานที่': 'Saved Places',
  'ข้อมูลส่วนตัว': 'Profile',
  'รหัสนักศึกษา': 'Student ID',
  'เข้าสู่ระบบ': 'Login',
  'ประวัติการเดินทาง': 'Travel History',
  'ความช่วยเหลือ': 'Help',
  'ฉันหลงทาง': 'I am lost',
  'กลับสู่หน้าหลัก': 'Return to Home',
  'ตึกกลม': 'Round Building',
  'สิ่งอำนวยความสะดวก': 'Facilities',
  'ห้องบรรยาย': 'Lecture Room',
  'หอสมุดกลาง': 'Central Library',
  'คณะวิทยาศาสตร์': 'Faculty of Science',
  'ธนาคารไทยพาณิชย์': 'SCB Bank',
  'ตึกเพชร (HB)': 'Diamond Building (HB)',
  'ศูนย์อาหาร': 'Food Center',
  'อ่างแก้ว': 'Ang Kaew',
  'ลานกิจกรรม': 'Activity Area',
  'ศาลาอ่างแก้ว': 'Ang Kaew Pavilion',
  'ลานพักผ่อน': 'Recreation Area',
  'เปิด 24 ชั่วโมง': 'Open 24 hours',
  'เปิดถึง': 'Open until',
  'เปิด': 'Open',
  'น.': '',
  'อาคารวิจัย 5': 'Research Building 5',
  'คณะมนุษยศาสตร์': 'Faculty of Humanities',
  'ตึกเพชร': 'Diamond Building',
  'ห้องสมุด': 'Library',
  'แบงค์ม่วง': 'Purple Bank',
  'จุดบริการ': 'Service Desk',
  'วิชา': 'Course',
  'ชั้น': 'Level',
  'ม.': 'm',
  'นาที': 'mins',
  'อมช': 'Student Hub',
  'อมช.': 'Student Hub',

  'คุณดูเหมือนจะหลงทาง (You seem lost)': 'You seem lost',
  'ระบบตรวจพบว่าคุณอาจหลงทาง ต้องการความช่วยเหลือหรือไม่?': 'The system detected you might be lost. Need help?',
  'ขอเส้นทางใหม่ (Recalculate Route)': 'Recalculate Route',
  'โทรหาเพื่อน/เจ้าหน้าที่': 'Call a friend/staff',
  'ปิดหน้าต่างนี้': 'Close',

  'รายงานปัญหาเส้นทาง': 'Report Route Issue',
  'พบปัญหาอะไรบ้าง?': 'What is the issue?',
  'ป้ายไม่ตรงกับในแอป': 'Sign does not match app',
  'เส้นทางนี้ถูกปิดกั้น (ก่อสร้าง/ล็อก)': 'Route is blocked (construction/locked)',
  'จุดสังเกตหายไป/เปลี่ยนไป': 'Landmark missing/changed',
  'อื่นๆ': 'Other',
  'ส่งรายงาน': 'Submit Report',

  'ปิด': 'Close',

  'ไม่พบข้อมูล': 'No Results Found',
  'ลองค้นหาด้วยชื่ออาคารหรือรหัสวิชา': 'Try searching by building name or course code',
  'อาคารที่ใกล้เคียง (Other matches)': 'Other matches',
  
  // Outdoor Nav
  'เริ่มนำทาง': 'Start Navigation',
  'ออกจากโหมดนำทาง': 'Exit Navigation',
  'ระยะทางรวม': 'Total Dist',
  'เหลืออีก': 'Left',
  'ถึงที่หมาย': 'Arrival',

  // Misc Profile
  'ดูตารางเรียน': 'View Class Schedule',
  'เชื่อมต่อกับ CMU Mobile': 'Connected to CMU Mobile',
  'สถานที่ที่บันทึกไว้': 'Saved Places',
  'เส้นทางประจำ': 'Regular Routes',
  'ไม่มีสถานที่ที่บันทึกไว้': 'No saved places',
  
  'การตั้งค่า': 'Settings',
  'การนำทาง': 'Navigation',
  'หลีกเลี่ยงบันได (Step-free)': 'Avoid Stairs (Step-free)',
  'เตือนเมื่อออกนอกเส้นทาง': 'Alert when off route',
  'ทั่วไป': 'General',
  'ภาษา (Language)': 'Language',
  'โหมดมืด (Dark Mode)': 'Dark Mode',
  'ล็อกเอาท์': 'Log out',
  
  'การช่วยเหลือการเข้าถึง (Accessibility)': 'Accessibility',
  'โหมดความคมชัดสูง': 'High Contrast Mode',
  'ขนาดตัวอักษร': 'Text Size',

  // Profile data
  'นักศึกษาปริญญาตรี ปี 2': '2nd Year Undergraduate',
  'คณะวิศวกรรมศาสตร์': 'Faculty of Engineering',
};

const replaceInFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Text replacements
  for (const [th, en] of Object.entries(replacements)) {
    content = content.split(th).join(en);
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
};

const srcFiles = glob.sync('src/**/*.{ts,tsx}', { nodir: true });
srcFiles.forEach(replaceInFile);

