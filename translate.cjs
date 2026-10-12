const fs = require('fs');
const glob = require('glob');

const replacements = {
  // Emojis (Regex)
  '/[\\u{1F300}-\\u{1F6FF}\\u{1F900}-\\u{1F9FF}\\u{2600}-\\u{26FF}\\u{2700}-\\u{27BF}\\u{1F1E6}-\\u{1F1FF}\\u{1F191}-\\u{1F251}\\u{1F004}\\u{1F0CF}\\u{1F170}-\\u{1F171}\\u{1F17E}-\\u{1F17F}\\u{1F18E}\\u{3030}\\u{2B50}\\u{2B55}\\u{2934}-\\u{2935}\\u{2B05}-\\u{2B07}\\u{2B1B}-\\u{2B1C}\\u{3297}\\u{3299}\\u{303D}\\u{00A9}\\u{00AE}\\u{2122}\\u{23F3}\\u{24C2}\\u{23E9}-\\u{23EF}\\u{25B6}\\u{23F8}-\\u{23FA}]/gu': '',

  // HomeScreen
  'คลาสถัดไปของคุณ': 'Your Next Class',
  'เริ่ม': 'Start',
  'ห้อง': 'Room',
  'ค้นหาห้อง / ตึก / รหัสวิชา เช่น RB5 204': 'Search room, building, or course code (e.g. RB5 204)',
  'รองรับชื่อย่อ, รหัสวิชา และชื่อเล่นอาคาร': 'Supports abbreviations, course codes, and building nicknames',
  'อมช.': 'Student Hub',
  'หอสมุด': 'Library',

  // SearchResultsScreen
  'พบอาคารใน มช. (Chiang Mai University)': 'Found in Chiang Mai University',
  'ไม่พบข้อมูล': 'No Results Found',
  'ไม่พบข้อมูลอาคารหรือห้องที่คุณค้นหา<br/>ลองใช้คำค้นยอดนิยมด้านล่าง': 'No buildings or rooms found.<br/>Try popular searches below.',
  'ลิฟต์พร้อมใช้งาน': 'Elevator Available',
  'บันไดทางเดิน': 'Stairs Only',
  'นำทางไปยังอาคารนี้ (Get Directions)': 'Get Directions',
  'เลือกห้องในอาคาร': 'Select room in building',
  'อาคารอื่นๆ ใน มช.': 'Other Campus Buildings',
  'นำทางไปยังอาคารนี้ ›': 'Navigate to this building ›',

  // IndoorNavScreen
  'โถงทางเข้าชั้น 1 • บันไดกลางและลิฟต์': 'Level 1 Lobby • Central Stairs & Elevators',
  'ขึ้นบันไดกลาง หรือลิฟต์ ไปชั้น 2': 'Take central stairs or elevator to Level 2',
  'มีทางขึ้น Step-free (ลิฟต์)': 'Step-free access available (Elevator)',
  'บันไดกลาง': 'Central Stairs',
  'ถึงชั้น 2': 'Arrived at Level 2',
  'โถงทางเดินชั้น 2 (ปีกตะวันตก)': 'Level 2 Corridor (West Wing)',
  'จุดสังเกต: ตู้กดน้ำ /  เลี้ยวซ้าย เดินตรง 15 ม.': 'Landmark: Vending Machine / Turn left, walk 15 m',
  'ตู้กดน้ำ': 'Vending Machine',
  'เลี้ยวซ้าย เดินตรง 15 ม.': 'Turn left, walk 15 m',
  'เลี้ยวแล้ว • ถึงหน้าห้อง': 'Turned • Arrived at door',
  'หน้าห้อง 204 (Robotics Lab)': 'Room 204 Door (Robotics Lab)',
  'ห้อง 204 ขวามือ (ประตูที่ 3)': 'Room 204 on the right (3rd door)',
  'ป้ายหน้าห้อง': 'Room Sign',
  'มาสาย? เข้าทางประตูหลัง (Back Door) ปลายโถง เพื่อไม่รบกวนอาจารย์และเพื่อน': 'Late? Use the Back Door at the end of the hall to avoid disturbing the class.',
  'ตรวจสอบประตู & ถึงที่หมายแล้ว': 'Verify Door & Arrival',

  // ArrivalScreen
  'ถึงที่หมายแล้ว': "YOU'RE HERE!",
  'ถึงห้อง 204 เรียบร้อยแล้ว!': 'Arrived at Room 204!',
  'ใช้เวลาเดินทั้งหมด 8 นาที 42 วินาที (ทันเวลาก่อนเริ่มคลาส)': 'Total walking time: 8 mins 42 secs (On time)',
  'ยืนยันความถูกต้องก่อนเปิดประตู': 'Verify correctness before opening door',
  'ป้ายหน้าห้องตรงกับ:': 'Room sign matches:',
  'ชื่อวิชาตรงกับ:': 'Course name matches:',
  'มีประตูหลัง (Back Door) สำหรับเข้าเงียบๆ ไม่รบกวนหน้าห้อง': 'Back Door available for quiet entry.',
  'ระยะทาง': 'Distance',
  'มีลิฟต์': 'Elevators',
  'ตรงเวลา': 'On Time',
  'เสร็จสิ้นการนำทาง • เข้าห้องเรียน': 'Finish Navigation • Enter Class',
  'รายงานข้อมูลหากป้ายหน้าห้องไม่ตรง': 'Report an issue if the room sign is incorrect',

  // RoutePreviewScreen
  'เดินเท้า (แนะนำ)': 'Walk (Recommended)',
  'คำนวณจากความเร็วเดินปกติ ~4.5 กม./ชม. พร้อมขึ้นลิฟต์': 'Calculated based on average walking speed 4.5 km/h',
  'รถม่วง มช. สาย 1': 'CMU Shuttle Bus Line 1',
  'แวะจอดหน้าตึก': 'Stops in front of building',
  'รถม่วงฟรีสำหรับนักศึกษา มช. คันถัดไปใน 3 นาที': 'Free shuttle bus. Next bus in 3 mins.',
  'มอเตอร์ไซค์': 'Motorbike',
  'จุดจอดลาน C': 'Parking Lot C',
  'จอดที่ลานมอเตอร์ไซค์ข้างตึก RB5 แล้วเดินต่อ 40 ม.': 'Park at lot next to RB5, walk 40m',
  'รถยนต์': 'Car',
  'ลานจอด P2': 'Parking P2',
  'จอดที่ลานจอดรถยนต์คณะวิทย์': 'Park at Science Faculty parking lot',
  'เริ่มนำทาง': 'Start Navigation',

  // OutdoorNavScreen / CampusData
  'อาคารวิจัย 5 (Research Building 5)': 'Research Building 5',
  'อาคารวิจัย 5': 'Research Building 5',
  'คณะวิทยาศาสตร์': 'Faculty of Science',
  'เปิดถึง 21:00 น.': 'Open until 21:00',
  'วิชา 953351': 'Course 953351',
  'ห้องประชุม': 'Meeting Room',
  'ตึกกลม': 'Round Building',
  'อาคารเรียนรวม คณะวิทยาศาสตร์': 'Science Faculty Lecture Building',
  'เปิดถึง 20:00 น.': 'Open until 20:00',
  'ห้องบรรยายรวม': 'Lecture Hall',
  'ห้องบรรยาย': 'Lecture Room',
  'ธนาคารไทยพาณิชย์ สาขา มช.': 'SCB Bank CMU Branch',
  'ธนาคารไทยพาณิชย์': 'SCB Bank',
  'สิ่งอำนวยความสะดวก': 'Facilities',
  'เปิด 08:30 - 15:30 น.': 'Open 08:30 - 15:30',
  'แบงค์ม่วง': 'Purple Bank',
  'จุดบริการ': 'Service Desk',
  'อาคารเรียนรวม คณะมนุษยศาสตร์': 'Humanities Faculty Lecture Building',
  'ตึกเพชร (HB)': 'Diamond Building (HB)',
  'คณะมนุษยศาสตร์': 'Faculty of Humanities',
  'เปิดถึง 18:00 น.': 'Open until 18:00',
  'ตึกเพชร': 'Diamond Building',
  'สำนักหอสมุด มหาวิทยาลัยเชียงใหม่': 'CMU Central Library',
  'หอสมุดกลาง': 'Central Library',
  'เปิดถึง 22:00 น.': 'Open until 22:00',
  'ห้องสมุด': 'Library',
  'ศูนย์อาหาร มช. (Student Hub)': 'CMU Food Center (Student Hub)',
  'เปิด 06:30 - 20:00 น.': 'Open 06:30 - 20:00',
  'ศูนย์อาหาร': 'Food Center',
  'ลานกิจกรรม': 'Activity Area',
  'ศาลาอ่างแก้ว': 'Ang Kaew Pavilion',
  'ลานพักผ่อน': 'Recreation Area',
  'เปิด 24 ชั่วโมง': 'Open 24 Hours',
  'อ่างแก้ว': 'Ang Kaew',
  'ลานหญ้า': 'Lawn',

  // More common Thai words
  'นาที': 'mins',
  'ม.': 'm',
  'ชั้น': 'Level',
};

const replaceInFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // First emojis
  content = content.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{3297}\u{3299}\u{303D}\u{00A9}\u{00AE}\u{2122}\u{23F3}\u{24C2}\u{23E9}-\u{23EF}\u{25B6}\u{23F8}-\u{23FA}]/gu, '');
  
  // Clean up emoji artifacts like extra spaces and dashes
  content = content.replace(/ \/   /g, ' / ');

  // Text replacements
  for (const [th, en] of Object.entries(replacements)) {
    if (th.startsWith('/')) continue; // Skip regex
    // Escape special chars for regex if needed, but simple split/join works for fixed strings
    content = content.split(th).join(en);
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
};

const srcFiles = glob.sync('src/**/*.{ts,tsx}', { nodir: true });
srcFiles.forEach(replaceInFile);

