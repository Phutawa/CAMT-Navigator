const fs = require('fs');
const glob = require('glob');

const replacements = {
  'ค้นหาRoom / ตึก / รหัสsecsชา เช่น RB5 204': 'Search Room / Building / Course (e.g. RB5 204)',
  'secsชา': 'Course',
  'Roomเป้าหมาย': 'Target Room',
  'ตำแหน่งLevel & บันได': 'Level & Stairs Location',
  'ขั้นตอนในอาคาร:': 'Indoor Steps:',
  '1. ขึ้นLevel 2  2. เลี้ยวซ้ายVending Machine  3. ประตู 204': '1. Go up to Level 2  2. Left at Vending Machine  3. Door 204',
  'เข้าสู่อาคาร • Startนำทางในตึก': 'Enter Building • Start Indoor Nav',
  'กลับไปดูแผนที่ภายนอก (Outdoor Map)': 'Back to Outdoor Map',
  'secsจัย 5': 'Research 5',
  'ธนาคาร': 'Bank',
  'Roomประชุม': 'Meeting Room',
  'ทางเดินหน้าCentral Library': 'Central Library Walkway',
  ' จุดสังเกต: Vending Machine / ️ Turn left, walk 15 m': ' Landmark: Vending Machine / Turn left, walk 15 m',
  'เลี้ยวแล้ว • ถึงหน้าRoom': 'Turned • Arrived at door',
  'หน้าRoom 204 (Robotics Lab)': 'Room 204 (Robotics Lab)',
  ' Room 204 ขวามือ (ประตูที่ 3)': 'Room 204 on the right (3rd door)',
  'ป้ายหน้าRoom': 'Room Sign',
  ' ภาพจุดสังเกตอ้างอิง (Visual Checkpoint)': ' Visual Checkpoint',
  'Discreet Entry (เข้าRoomแบบไม่สะดุด):': 'Discreet Entry:',
  'แนะนำเข้าทางประตูด้านหลัง (Back Door) ปลายโถง เพื่อไม่ให้รบกวนอาจารย์และเพื่อนร่วมคลาส': 'Use the Back Door at the end of the hall to avoid disturbing the class.',
  'I am lostในตึก (I am Lost - ขอHelp)': 'I am Lost (Indoor)',
  'ทิวเขาดอยสุเทพ (DOI SUTHEP)': 'DOI SUTHEP MOUNTAINS',
  'ถนนห้วยแก้ว (Thanon Huay Kaew - North Top Perimeter)': 'Huay Kaew Road (North Top Perimeter)',
  'ถนนห้วยแก้ว (HUAY KAEW RD.)': 'HUAY KAEW RD.',
  'ถนนสุเทพ (Thanon Suthep - South Bottom Perimeter)': 'Suthep Road (South Bottom Perimeter)',
  'ถนนสุเทพ (SUTHEP RD.)': 'SUTHEP RD.',
  'ถนนเลียบคลองชลประทาน (Canal Road - East Right Perimeter)': 'Canal Road (East Right Perimeter)',
  'ถนนเลียบคลองชลประทาน': 'Canal Road',
  'ประตูหน้า มช. (Main Entrance Gate)': 'Main Entrance Gate',
  'ประตูหน้า มช.': 'Main Entrance Gate',
  'ประตูsecsศวะ (Suthep / Engineering Gate)': 'Suthep / Engineering Gate',
  'ประตูsecsศวะ': 'Suthep / Engineering Gate',
  'ประตูเกษตร (Agriculture Gate)': 'Agriculture Gate',
  'ประตูเกษตร': 'Agriculture Gate',
  'ประตูไผ่ล้อม (Phai Lom East Gate)': 'Phai Lom East Gate',
  'ประตูไผ่ล้อม': 'Phai Lom East Gate',
  'อ่างเก็บน้ำAng Kaew (Ang Kaew Reservoir - Top Left)': 'Ang Kaew Reservoir (Top Left)',
  'สันเขื่อนAng Kaew': 'Ang Kaew Dam Crest',
  'อ่างตาดชมพู (Tard Chompoo Reservoir)': 'Tard Chompoo Reservoir',
  'อ่างตาดชมพู': 'Tard Chompoo Reservoir',
  'ทางเดินหลังคาคลุม หน้าCentral Library - Checkpoint 1 Path': 'Covered walkway in front of Central Library - Checkpoint 1 Path',
  'ศาลาธรรม (Sala Dham) Landmark': 'Sala Dham Landmark',
  'ศาลาธรรม': 'Sala Dham',
  'Central Library มช. (Main Library - Checkpoint 1)': 'CMU Central Library (Main Library - Checkpoint 1)',
  'Central Library มช.': 'CMU Central Library',
  'อาคารเรียนรวม Faculty of Science': 'Science Faculty Lecture Building',
  'Roomบรรยายรวม': 'Lecture Hall',
  'Roomบรรยาย': 'Lecture Room',
  'สำนักLibrary มหาวิทยาลัยเชียงใหม่': 'CMU Central Library',
  'Libraryกลาง': 'Central Library',
  'Food Center มช.': 'CMU Student Hub',
  'ถึงRoom 204 เรียบร้อยแล้ว!': 'Arrived at Room 204!',
  'ใช้เวลาเดินทั้งหมด 8 mins 42 วิmins (ทันเวลาก่อนStartคลาส)': 'Total walking time: 8 mins 42 secs (On time)',
  'ป้ายหน้าRoomตรงกับ:': 'Room sign matches:',
  'มีประตูหลัง (Back Door) สำหรับเข้าเงียบๆ ไม่รบกวนหน้าRoom': 'Back door available for quiet entry.',
  'เสร็จสิ้นการนำทาง • เข้าRoomเรียน': 'Finish Navigation • Enter Class',
  'รายงานข้อมูลหากป้ายหน้าRoomไม่ตรง': 'Report if room sign is incorrect',
  'ตึก': 'Building',
  'ขอHelp': 'Help',
  'ประตู': 'Gate/Door',
  'Room': 'Room',
  'มช.': 'CMU',
  'Level': 'Level',
};

const replaceInFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  for (const [th, en] of Object.entries(replacements)) {
    content = content.split(th).join(en);
  }

  // Remove any leftover Thai characters using a blind replace to ensure it's 100% english
  // But wait! If I just remove all Thai chars, `( )` might be left empty.
  // Instead I will just remove the Thai chars.
  content = content.replace(/[ก-๛]+/g, '');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
};

const srcFiles = glob.sync('src/**/*.{ts,tsx}', { nodir: true });
srcFiles.forEach(replaceInFile);
