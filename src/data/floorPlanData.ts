import { BuildingInfo, RoomInfo } from '../types/navigation';

export type RoomCategory = 'shared' | 'workspace' | 'recreation' | 'core' | 'service';

export interface FloorRoomLayout {
  id: string;
  code: string; // e.g. "A1", "B1", "204"
  name: string; // Thai name e.g. "กองคลัง", "ห้องประชุม"
  nameEn?: string;
  category: RoomCategory;
  areaSqm?: number;
  // Bounding box in percentage or 32x15m normalized grid units
  // x: 0..32, y: 0..15, width: 0..32, height: 0..15
  x: number;
  y: number;
  width: number;
  height: number;
  door?: {
    side: 'top' | 'bottom' | 'left' | 'right';
    offset?: number; // offset along the side in meters
  };
  isTarget?: boolean;
  department?: string;
}

export interface BuildingFloorPlanData {
  buildingId: string;
  buildingName: string;
  buildingNameTh: string;
  floorNumber: number;
  floorTitle: string;
  totalAreaSqm: number;
  scaleText: string;
  rooms: FloorRoomLayout[];
  entrances?: Array<{
    side: 'top' | 'bottom';
    x: number;
    label: string;
  }>;
  safetyEquipment?: Array<{
    type: 'extinguisher' | 'alarm';
    x: number;
    y: number;
  }>;
}

// =========================================================================
// 1. DATASET OF REFERENCE PLAN: อาคารสำนักงานมหาวิทยาลัย (ชั้น 1 - 5)
// Exactly per the blueprints from PDF pages 1 to 5
// =========================================================================

export const UNIVERSITY_OFFICE_FLOORS: Record<number, BuildingFloorPlanData> = {
  // -----------------------------------------------------------------------
  // ชั้น 1 (470 ตร.ม.) - Reference Plan Page 1
  // -----------------------------------------------------------------------
  1: {
    buildingId: 'cmu-univ-office',
    buildingName: 'University Office Building',
    buildingNameTh: 'อาคารสำนักงานมหาวิทยาลัย',
    floorNumber: 1,
    floorTitle: 'ผังพื้นชั้น 1',
    totalAreaSqm: 470,
    scaleText: 'มาตราส่วน 1 : 125',
    entrances: [
      { side: 'top', x: 8.5, label: 'ทางเข้าอาคาร' },
      { side: 'top', x: 23.5, label: 'ทางเข้าอาคาร' },
      { side: 'bottom', x: 8.5, label: 'ทางเข้าอาคาร' },
      { side: 'bottom', x: 23.5, label: 'ทางเข้าอาคาร' },
    ],
    safetyEquipment: [
      { type: 'extinguisher', x: 28.5, y: 1.5 },
      { type: 'extinguisher', x: 24.5, y: 13.5 },
      { type: 'alarm', x: 28.5, y: 6.5 },
    ],
    rooms: [
      // Left Core: Fire Staircase (ซ้ายบน)
      {
        id: 'u1-fire-stairs',
        code: 'ST-2',
        name: 'บันไดหนีไฟ',
        nameEn: 'Fire Exit Staircase',
        category: 'core',
        areaSqm: 12,
        x: 0,
        y: 0,
        width: 4.8,
        height: 4.2,
      },
      // Left Bottom: B1 พื้นที่ปรุงอาหาร (101 ตร.ม.)
      {
        id: 'u1-b1',
        code: 'B1',
        name: 'พื้นที่ปรุงอาหาร',
        nameEn: 'Cooking & Kitchen Area',
        category: 'workspace',
        areaSqm: 101,
        x: 0,
        y: 4.2,
        width: 7.2,
        height: 10.8,
        door: { side: 'right', offset: 5 },
      },
      // Center: A1 พื้นที่รับประทานอาหาร และพื้นที่จัดเก็บเศษอาหาร (207 ตร.ม.)
      {
        id: 'u1-a1',
        code: 'A1',
        name: 'พื้นที่รับประทานอาหาร และพื้นที่จัดเก็บเศษอาหาร',
        nameEn: 'Dining & Food Court Area',
        category: 'shared',
        areaSqm: 207,
        x: 7.2,
        y: 0,
        width: 14.8,
        height: 15.0,
        door: { side: 'right', offset: 7 },
      },
      // Partition: B4 พื้นที่ส่วนบริการ & B5 ตลาดคุณธรรม
      {
        id: 'u1-b5',
        code: 'B5',
        name: 'ตลาดคุณธรรม',
        nameEn: 'Fair-Trade Moral Market',
        category: 'workspace',
        areaSqm: 18,
        x: 22.0,
        y: 2.2,
        width: 2.2,
        height: 3.5,
      },
      {
        id: 'u1-b4',
        code: 'B4',
        name: 'พื้นที่ส่วนบริการ',
        nameEn: 'Service Area',
        category: 'workspace',
        areaSqm: 14,
        x: 22.0,
        y: 5.7,
        width: 2.2,
        height: 3.5,
      },
      // Main Center-Right Lobby: A2 โถงทางเดินหน้าลิฟต์ (77 ตร.ม.)
      {
        id: 'u1-a2',
        code: 'A2',
        name: 'โถงทางเดินหน้าลิฟต์ (ตลาดคุณธรรมและส่วนติดต่อราชการ)',
        nameEn: 'Central Elevator Lobby',
        category: 'shared',
        areaSqm: 77,
        x: 24.2,
        y: 0,
        width: 4.0,
        height: 15.0,
      },
      // Right Core Top: A3 ห้องน้ำชายหญิงและคนพิการ (27 ตร.ม.) + ท่อ 5 ตร.ม.
      {
        id: 'u1-a3',
        code: 'A3',
        name: 'ห้องน้ำชายหญิงและคนพิการลิฟต์',
        nameEn: 'Restrooms & Accessible WC',
        category: 'shared',
        areaSqm: 27,
        x: 28.2,
        y: 0,
        width: 3.8,
        height: 5.5,
        door: { side: 'left', offset: 3 },
      },
      // Right Core Middle: B2 ห้องควบคุมระบบ (9 ตร.ม.) & B3 ห้องเก็บอุปกรณ์ทำความสะอาด (5 ตร.ม.)
      {
        id: 'u1-b2',
        code: 'B2',
        name: 'ห้องควบคุมระบบ',
        nameEn: 'Control & Electrical Room',
        category: 'service',
        areaSqm: 9,
        x: 28.2,
        y: 5.5,
        width: 2.2,
        height: 3.5,
      },
      {
        id: 'u1-b3',
        code: 'B3',
        name: 'ห้องเก็บอุปกรณ์ทำความสะอาด',
        nameEn: 'Housekeeping & Cleaning Store',
        category: 'service',
        areaSqm: 5,
        x: 30.4,
        y: 5.5,
        width: 1.6,
        height: 3.5,
      },
      // Right Core Bottom: A4 ลิฟต์โดยสาร & บันไดหลัก-หนีไฟ (23 ตร.ม.)
      {
        id: 'u1-a4',
        code: 'A4',
        name: 'ลิฟต์โดยสาร',
        nameEn: 'Passenger Elevator',
        category: 'shared',
        areaSqm: 8,
        x: 28.2,
        y: 9.0,
        width: 3.8,
        height: 2.5,
      },
      {
        id: 'u1-main-stairs',
        code: 'ST-1',
        name: 'บันไดหลัก-หนีไฟ',
        nameEn: 'Main & Fire Staircase',
        category: 'core',
        areaSqm: 23,
        x: 28.2,
        y: 11.5,
        width: 3.8,
        height: 3.5,
      },
    ],
  },

  // -----------------------------------------------------------------------
  // ชั้น 2 (440 ตร.ม.) - Reference Plan Page 2
  // -----------------------------------------------------------------------
  2: {
    buildingId: 'cmu-univ-office',
    buildingName: 'University Office Building',
    buildingNameTh: 'อาคารสำนักงานมหาวิทยาลัย',
    floorNumber: 2,
    floorTitle: 'ผังพื้นชั้น 2',
    totalAreaSqm: 440,
    scaleText: 'มาตราส่วน 1 : 125',
    safetyEquipment: [
      { type: 'extinguisher', x: 28.5, y: 1.5 },
      { type: 'alarm', x: 28.5, y: 6.5 },
    ],
    rooms: [
      // Left Core: Fire Staircase
      {
        id: 'u2-fire-stairs',
        code: 'ST-2',
        name: 'บันไดหนีไฟ',
        category: 'core',
        areaSqm: 12,
        x: 0,
        y: 0,
        width: 4.8,
        height: 3.5,
      },
      // Main Office: B1 กองคลัง (287 ตร.ม.)
      {
        id: 'u2-b1',
        code: 'B1',
        name: 'กองคลัง',
        nameEn: 'Finance & Treasury Division',
        category: 'workspace',
        areaSqm: 287,
        x: 0,
        y: 3.5,
        width: 24.2,
        height: 11.5,
        door: { side: 'right', offset: 4 },
        department: 'กองคลัง มหาวิทยาลัยเชียงใหม่',
      },
      // Top Right Lobby Area: A1 พื้นที่จัดเตรียม (8 ตร.ม.)
      {
        id: 'u2-a1',
        code: 'A1',
        name: 'พื้นที่จัดเตรียม',
        nameEn: 'Pantry & Prep Area',
        category: 'shared',
        areaSqm: 8,
        x: 24.2,
        y: 0,
        width: 4.0,
        height: 3.8,
      },
      // Central Lobby: A2 โถง (51 ตร.ม.)
      {
        id: 'u2-a2',
        code: 'A2',
        name: 'โถงทางเดินกลาง',
        nameEn: 'Central Lobby',
        category: 'shared',
        areaSqm: 51,
        x: 24.2,
        y: 3.8,
        width: 4.0,
        height: 11.2,
      },
      // Right Core Top: A3 ห้องน้ำ (27 ตร.ม.)
      {
        id: 'u2-a3',
        code: 'A3',
        name: 'ห้องน้ำ',
        nameEn: 'Restrooms',
        category: 'shared',
        areaSqm: 27,
        x: 28.2,
        y: 0,
        width: 3.8,
        height: 5.5,
      },
      // Right Core Middle: B2 งานระบบ และส่วนแม่บ้าน (9 ตร.ม.)
      {
        id: 'u2-b2',
        code: 'B2',
        name: 'งานระบบ และส่วนแม่บ้าน',
        nameEn: 'Utility & Janitor',
        category: 'service',
        areaSqm: 9,
        x: 28.2,
        y: 5.5,
        width: 3.8,
        height: 3.5,
      },
      // Right Core Bottom: A4 ลิฟต์โดยสาร & บันไดหลัก-หนีไฟ (23 ตร.ม.)
      {
        id: 'u2-a4',
        code: 'A4',
        name: 'ลิฟต์โดยสาร',
        category: 'shared',
        areaSqm: 8,
        x: 28.2,
        y: 9.0,
        width: 3.8,
        height: 2.5,
      },
      {
        id: 'u2-main-stairs',
        code: 'ST-1',
        name: 'บันไดหลัก-หนีไฟ',
        category: 'core',
        areaSqm: 23,
        x: 28.2,
        y: 11.5,
        width: 3.8,
        height: 3.5,
      },
    ],
  },

  // -----------------------------------------------------------------------
  // ชั้น 3 (440 ตร.ม.) - Reference Plan Page 3
  // -----------------------------------------------------------------------
  3: {
    buildingId: 'cmu-univ-office',
    buildingName: 'University Office Building',
    buildingNameTh: 'อาคารสำนักงานมหาวิทยาลัย',
    floorNumber: 3,
    floorTitle: 'ผังพื้นชั้น 3',
    totalAreaSqm: 440,
    scaleText: 'มาตราส่วน 1 : 125',
    safetyEquipment: [
      { type: 'extinguisher', x: 28.5, y: 1.5 },
      { type: 'alarm', x: 28.5, y: 6.5 },
    ],
    rooms: [
      // Left Core: Fire Staircase
      {
        id: 'u3-fire-stairs',
        code: 'ST-2',
        name: 'บันไดหนีไฟ',
        category: 'core',
        areaSqm: 12,
        x: 0,
        y: 0,
        width: 4.8,
        height: 3.5,
      },
      // Left: B1 กองคลัง (212 ตร.ม.)
      {
        id: 'u3-b1',
        code: 'B1',
        name: 'กองคลัง',
        nameEn: 'Finance Division Offices',
        category: 'workspace',
        areaSqm: 212,
        x: 0,
        y: 3.5,
        width: 15.5,
        height: 11.5,
        door: { side: 'right', offset: 4 },
      },
      // Center Top: A1 ห้องประชุม (37 ตร.ม.)
      {
        id: 'u3-a1',
        code: 'A1',
        name: 'ห้องประชุม',
        nameEn: 'Meeting Room',
        category: 'shared',
        areaSqm: 37,
        x: 15.5,
        y: 0,
        width: 8.7,
        height: 6.5,
        door: { side: 'bottom', offset: 4 },
      },
      // Center Bottom: B2 สำนักงานผู้อำนวยการสำนักงานมหาวิทยาลัย (76 ตร.ม.)
      {
        id: 'u3-b2',
        code: 'B2',
        name: 'สำนักงานผู้อำนวยการสำนักงานมหาวิทยาลัย',
        nameEn: 'Director Office of University Affairs',
        category: 'workspace',
        areaSqm: 76,
        x: 15.5,
        y: 6.5,
        width: 8.7,
        height: 8.5,
        door: { side: 'right', offset: 3 },
      },
      // Lobby Prep: A2 พื้นที่จัดเตรียม (8 ตร.ม.)
      {
        id: 'u3-a2',
        code: 'A2',
        name: 'พื้นที่จัดเตรียม',
        category: 'shared',
        areaSqm: 8,
        x: 24.2,
        y: 0,
        width: 4.0,
        height: 4.0,
      },
      // Central Lobby: A3 โถง (31 ตร.ม.)
      {
        id: 'u3-a3',
        code: 'A3',
        name: 'โถงทางเดิน',
        category: 'shared',
        areaSqm: 31,
        x: 24.2,
        y: 4.0,
        width: 4.0,
        height: 11.0,
      },
      // Right Core: Restroom, Maint, Elevator, Stairs
      {
        id: 'u3-a4',
        code: 'A4',
        name: 'ห้องน้ำ',
        category: 'shared',
        areaSqm: 27,
        x: 28.2,
        y: 0,
        width: 3.8,
        height: 5.5,
      },
      {
        id: 'u3-b3',
        code: 'B3',
        name: 'งานระบบ และส่วนแม่บ้าน',
        category: 'service',
        areaSqm: 9,
        x: 28.2,
        y: 5.5,
        width: 3.8,
        height: 3.5,
      },
      {
        id: 'u3-a5',
        code: 'A5',
        name: 'ลิฟต์โดยสาร',
        category: 'shared',
        areaSqm: 8,
        x: 28.2,
        y: 9.0,
        width: 3.8,
        height: 2.5,
      },
      {
        id: 'u3-main-stairs',
        code: 'ST-1',
        name: 'บันไดหลัก-หนีไฟ',
        category: 'core',
        areaSqm: 23,
        x: 28.2,
        y: 11.5,
        width: 3.8,
        height: 3.5,
      },
    ],
  },

  // -----------------------------------------------------------------------
  // ชั้น 4 (440 ตร.ม.) - Reference Plan Page 4
  // -----------------------------------------------------------------------
  4: {
    buildingId: 'cmu-univ-office',
    buildingName: 'University Office Building',
    buildingNameTh: 'อาคารสำนักงานมหาวิทยาลัย',
    floorNumber: 4,
    floorTitle: 'ผังพื้นชั้น 4',
    totalAreaSqm: 440,
    scaleText: 'มาตราส่วน 1 : 125',
    safetyEquipment: [
      { type: 'extinguisher', x: 28.5, y: 1.5 },
      { type: 'alarm', x: 28.5, y: 6.5 },
    ],
    rooms: [
      // Left Core: Fire Staircase
      {
        id: 'u4-fire-stairs',
        code: 'ST-2',
        name: 'บันไดหนีไฟ',
        category: 'core',
        areaSqm: 12,
        x: 0,
        y: 0,
        width: 4.8,
        height: 3.5,
      },
      // Left Top/Mid: B1 กองแผน (248 ตร.ม.)
      {
        id: 'u4-b1',
        code: 'B1',
        name: 'กองแผน',
        nameEn: 'Planning & Strategy Division',
        category: 'workspace',
        areaSqm: 248,
        x: 0,
        y: 3.5,
        width: 17.5,
        height: 7.5,
        door: { side: 'right', offset: 3 },
      },
      // Left Bottom: A6 ห้องผู้อำนวยการ (24 ตร.ม.)
      {
        id: 'u4-a6',
        code: 'A6',
        name: 'ห้องผู้อำนวยการ',
        nameEn: 'Director Office',
        category: 'shared',
        areaSqm: 24,
        x: 0,
        y: 11.0,
        width: 6.0,
        height: 4.0,
      },
      // Center Top: A1 ห้องประชุม (37 ตร.ม.)
      {
        id: 'u4-a1',
        code: 'A1',
        name: 'ห้องประชุม',
        nameEn: 'Conference Room',
        category: 'shared',
        areaSqm: 37,
        x: 17.5,
        y: 0,
        width: 6.7,
        height: 6.5,
      },
      // Mid-Right: B3 ห้องปริ้นเตอร์ (16 ตร.ม.)
      {
        id: 'u4-b3',
        code: 'B3',
        name: 'ห้องปริ้นเตอร์',
        nameEn: 'Print & Copy Center',
        category: 'workspace',
        areaSqm: 16,
        x: 17.5,
        y: 6.5,
        width: 6.7,
        height: 8.5,
      },
      // Lobby Prep: A2 พื้นที่จัดเตรียม (8 ตร.ม.)
      {
        id: 'u4-a2',
        code: 'A2',
        name: 'พื้นที่จัดเตรียม',
        category: 'shared',
        areaSqm: 8,
        x: 24.2,
        y: 0,
        width: 4.0,
        height: 4.0,
      },
      // Central Lobby: A3 โถง (31 ตร.ม.)
      {
        id: 'u4-a3',
        code: 'A3',
        name: 'โถงทางเดิน',
        category: 'shared',
        areaSqm: 31,
        x: 24.2,
        y: 4.0,
        width: 4.0,
        height: 11.0,
      },
      // Right Core: Restroom, Maint, Elevator, Stairs
      {
        id: 'u4-a4',
        code: 'A4',
        name: 'ห้องน้ำ',
        category: 'shared',
        areaSqm: 27,
        x: 28.2,
        y: 0,
        width: 3.8,
        height: 5.5,
      },
      {
        id: 'u4-b2',
        code: 'B2',
        name: 'งานระบบ และส่วนแม่บ้าน',
        category: 'service',
        areaSqm: 9,
        x: 28.2,
        y: 5.5,
        width: 3.8,
        height: 3.5,
      },
      {
        id: 'u4-a5',
        code: 'A5',
        name: 'ลิฟต์โดยสาร',
        category: 'shared',
        areaSqm: 8,
        x: 28.2,
        y: 9.0,
        width: 3.8,
        height: 2.5,
      },
      {
        id: 'u4-main-stairs',
        code: 'ST-1',
        name: 'บันไดหลัก-หนีไฟ',
        category: 'core',
        areaSqm: 23,
        x: 28.2,
        y: 11.5,
        width: 3.8,
        height: 3.5,
      },
    ],
  },

  // -----------------------------------------------------------------------
  // ชั้น 5 (440 ตร.ม.) - Reference Plan Page 5
  // -----------------------------------------------------------------------
  5: {
    buildingId: 'cmu-univ-office',
    buildingName: 'University Office Building',
    buildingNameTh: 'อาคารสำนักงานมหาวิทยาลัย',
    floorNumber: 5,
    floorTitle: 'ผังพื้นชั้น 5',
    totalAreaSqm: 440,
    scaleText: 'มาตราส่วน 1 : 125',
    safetyEquipment: [
      { type: 'extinguisher', x: 28.5, y: 1.5 },
      { type: 'alarm', x: 28.5, y: 6.5 },
    ],
    rooms: [
      // Left Core: Fire Staircase
      {
        id: 'u5-fire-stairs',
        code: 'ST-2',
        name: 'บันไดหนีไฟ',
        category: 'core',
        areaSqm: 12,
        x: 0,
        y: 0,
        width: 4.8,
        height: 3.5,
      },
      // Left Half: A1 ห้องประชุมใหญ่ (202 ตร.ม.)
      {
        id: 'u5-a1',
        code: 'A1',
        name: 'ห้องประชุมใหญ่',
        nameEn: 'Grand Conference Hall',
        category: 'shared',
        areaSqm: 202,
        x: 0,
        y: 3.5,
        width: 15.5,
        height: 11.5,
        door: { side: 'right', offset: 5 },
      },
      // Center Top: B1 สำนักงานขับเคลื่อนยุทธศาสตร์ (48 ตร.ม. + 14 ตร.ม. = 62)
      {
        id: 'u5-b1',
        code: 'B1',
        name: 'สำนักงานขับเคลื่อนยุทธศาสตร์',
        nameEn: 'Strategic Driving Office',
        category: 'workspace',
        areaSqm: 62,
        x: 15.5,
        y: 0,
        width: 8.7,
        height: 7.5,
        door: { side: 'bottom', offset: 4 },
      },
      // Center Bottom & Lobby: C1 โถงและพื้นที่พักผ่อนหย่อนใจ (91 ตร.ม.)
      {
        id: 'u5-c1',
        code: 'C1',
        name: 'โถงและพื้นที่พักผ่อนหย่อนใจ',
        nameEn: 'Executive Lounge & Breakout Hall',
        category: 'recreation',
        areaSqm: 91,
        x: 15.5,
        y: 7.5,
        width: 12.7,
        height: 7.5,
      },
      // Lobby Prep: A2 พื้นที่จัดเตรียม (12 ตร.ม.)
      {
        id: 'u5-a2',
        code: 'A2',
        name: 'พื้นที่จัดเตรียม',
        category: 'shared',
        areaSqm: 12,
        x: 24.2,
        y: 0,
        width: 4.0,
        height: 4.0,
      },
      // Right Core: Restroom, Maint, Elevator, Stairs
      {
        id: 'u5-a3',
        code: 'A3',
        name: 'ห้องน้ำ',
        category: 'shared',
        areaSqm: 27,
        x: 28.2,
        y: 0,
        width: 3.8,
        height: 5.5,
      },
      {
        id: 'u5-b2',
        code: 'B2',
        name: 'งานระบบ และส่วนแม่บ้าน',
        category: 'service',
        areaSqm: 6,
        x: 28.2,
        y: 5.5,
        width: 3.8,
        height: 3.5,
      },
      {
        id: 'u5-a4',
        code: 'A4',
        name: 'ลิฟต์โดยสาร',
        category: 'shared',
        areaSqm: 8,
        x: 28.2,
        y: 9.0,
        width: 3.8,
        height: 2.5,
      },
      {
        id: 'u5-main-stairs',
        code: 'ST-1',
        name: 'บันไดหลัก-หนีไฟ',
        category: 'core',
        areaSqm: 23,
        x: 28.2,
        y: 11.5,
        width: 3.8,
        height: 3.5,
      },
    ],
  },
};

// =========================================================================
// 2. DATASET OF RB5 BUILDING (อาคารวิจัย 5) - Target Course 953351 Room 204
// =========================================================================

export const RB5_FLOORS: Record<number, BuildingFloorPlanData> = {
  1: {
    buildingId: 'cmu-rb5',
    buildingName: 'Research Building 5',
    buildingNameTh: 'อาคารวิจัย 5 (RB5)',
    floorNumber: 1,
    floorTitle: 'ผังพื้นชั้น 1 (โถงทางเข้าหลัก)',
    totalAreaSqm: 460,
    scaleText: 'มาตราส่วน 1 : 125',
    entrances: [
      { side: 'top', x: 10.0, label: 'ทางเข้าหลัก (ลานหน้าอาคาร)' },
      { side: 'bottom', x: 18.0, label: 'ทางเข้าฝั่งลานจอด' },
    ],
    rooms: [
      { id: 'rb5-1-fire', code: 'ST-2', name: 'บันไดหนีไฟ', category: 'core', areaSqm: 12, x: 0, y: 0, width: 4.8, height: 4.0 },
      { id: 'rb5-101', code: '101', name: 'Lecture Room 101 (ห้องบรรยาย)', category: 'workspace', areaSqm: 120, x: 0, y: 4.0, width: 9.0, height: 11.0 },
      { id: 'rb5-102', code: '102', name: 'Lecture Room 102 (ห้องบรรยายรวม)', category: 'workspace', areaSqm: 110, x: 9.0, y: 4.0, width: 8.5, height: 11.0 },
      { id: 'rb5-1-lobby', code: 'A1', name: 'โถงนิทรรศการและทางเข้ากลาง', category: 'shared', areaSqm: 110, x: 17.5, y: 0, width: 10.7, height: 15.0 },
      { id: 'rb5-1-wc', code: 'A2', name: 'ห้องน้ำชาย-หญิง และคนพิการ', category: 'shared', areaSqm: 27, x: 28.2, y: 0, width: 3.8, height: 5.5 },
      { id: 'rb5-1-elec', code: 'B2', name: 'ห้องควบคุมไฟฟ้าและระบบ', category: 'service', areaSqm: 9, x: 28.2, y: 5.5, width: 3.8, height: 3.5 },
      { id: 'rb5-1-lift', code: 'A3', name: 'ลิฟต์โดยสาร', category: 'shared', areaSqm: 8, x: 28.2, y: 9.0, width: 3.8, height: 2.5 },
      { id: 'rb5-1-stairs', code: 'ST-1', name: 'บันไดหลักสู่ชั้น 2', category: 'core', areaSqm: 23, x: 28.2, y: 11.5, width: 3.8, height: 3.5 },
    ],
  },
  2: {
    buildingId: 'cmu-rb5',
    buildingName: 'Research Building 5',
    buildingNameTh: 'อาคารวิจัย 5 (RB5)',
    floorNumber: 2,
    floorTitle: 'ผังพื้นชั้น 2 (ห้องเรียน 204)',
    totalAreaSqm: 460,
    scaleText: 'มาตราส่วน 1 : 125',
    rooms: [
      { id: 'rb5-2-fire', code: 'ST-2', name: 'บันไดหนีไฟด้านหลัง', category: 'core', areaSqm: 12, x: 0, y: 0, width: 4.8, height: 4.0 },
      { id: 'rb5-201', code: '201', name: 'Meeting Room 201', category: 'shared', areaSqm: 45, x: 0, y: 4.0, width: 5.5, height: 5.5 },
      { id: 'rb5-202', code: '202', name: 'Lecture Room 202', category: 'workspace', areaSqm: 55, x: 0, y: 9.5, width: 5.5, height: 5.5 },
      { id: 'rb5-203', code: '203', name: 'Software Lab 203', category: 'workspace', areaSqm: 85, x: 5.5, y: 0, width: 6.5, height: 7.5 },
      // Target: Room 204 Robotics Lab
      {
        id: 'rb5-204',
        code: '204',
        name: 'Robotics Lab (Course 953351)',
        nameEn: 'Robotics & Hardware Lab (Room 204)',
        category: 'workspace',
        areaSqm: 95,
        x: 5.5,
        y: 7.5,
        width: 8.5,
        height: 7.5,
        isTarget: true,
        department: 'ภาควิชาวิทยาการคอมพิวเตอร์ / ซอฟต์แวร์',
        door: { side: 'right', offset: 3 },
      },
      { id: 'rb5-205', code: '205', name: 'Seminar Room 205', category: 'shared', areaSqm: 58, x: 12.0, y: 0, width: 6.0, height: 7.5 },
      { id: 'rb5-2-break', code: 'C1', name: 'พื้นที่นั่งพักและตู้กดน้ำอัตโนมัติ', category: 'recreation', areaSqm: 48, x: 14.0, y: 7.5, width: 4.0, height: 7.5 },
      // Lobby
      { id: 'rb5-2-hall', code: 'A1', name: 'โถงทางเดินชั้น 2 (West Wing)', category: 'shared', areaSqm: 55, x: 18.0, y: 0, width: 10.2, height: 15.0 },
      // Core Right
      { id: 'rb5-2-wc', code: 'A2', name: 'ห้องน้ำชาย-หญิง', category: 'shared', areaSqm: 27, x: 28.2, y: 0, width: 3.8, height: 5.5 },
      { id: 'rb5-2-serv', code: 'B2', name: 'ห้องงานระบบ และแม่บ้าน', category: 'service', areaSqm: 9, x: 28.2, y: 5.5, width: 3.8, height: 3.5 },
      { id: 'rb5-2-lift', code: 'A3', name: 'ลิฟต์โดยสาร', category: 'shared', areaSqm: 8, x: 28.2, y: 9.0, width: 3.8, height: 2.5 },
      { id: 'rb5-2-stairs', code: 'ST-1', name: 'บันไดหลัก', category: 'core', areaSqm: 23, x: 28.2, y: 11.5, width: 3.8, height: 3.5 },
    ],
  },
  3: {
    buildingId: 'cmu-rb5',
    buildingName: 'Research Building 5',
    buildingNameTh: 'อาคารวิจัย 5 (RB5)',
    floorNumber: 3,
    floorTitle: 'ผังพื้นชั้น 3 (ห้องวิจัยและห้องเรียน)',
    totalAreaSqm: 460,
    scaleText: 'มาตราส่วน 1 : 125',
    rooms: [
      { id: 'rb5-3-fire', code: 'ST-2', name: 'บันไดหนีไฟ', category: 'core', areaSqm: 12, x: 0, y: 0, width: 4.8, height: 4.0 },
      { id: 'rb5-301', code: '301', name: 'Research Lab 301', category: 'workspace', areaSqm: 90, x: 0, y: 4.0, width: 7.0, height: 11.0 },
      { id: 'rb5-302', code: '302', name: 'Advanced Lab 302', category: 'workspace', areaSqm: 85, x: 7.0, y: 4.0, width: 7.0, height: 11.0 },
      { id: 'rb5-303', code: '303', name: 'Conference Room 303', category: 'shared', areaSqm: 65, x: 14.0, y: 0, width: 6.0, height: 7.5 },
      { id: 'rb5-3-hall', code: 'A1', name: 'โถงทางเดินชั้น 3', category: 'shared', areaSqm: 55, x: 20.0, y: 0, width: 8.2, height: 15.0 },
      { id: 'rb5-3-wc', code: 'A2', name: 'ห้องน้ำ', category: 'shared', areaSqm: 27, x: 28.2, y: 0, width: 3.8, height: 5.5 },
      { id: 'rb5-3-serv', code: 'B2', name: 'งานระบบ', category: 'service', areaSqm: 9, x: 28.2, y: 5.5, width: 3.8, height: 3.5 },
      { id: 'rb5-3-lift', code: 'A3', name: 'ลิฟต์โดยสาร', category: 'shared', areaSqm: 8, x: 28.2, y: 9.0, width: 3.8, height: 2.5 },
      { id: 'rb5-3-stairs', code: 'ST-1', name: 'บันไดหลัก', category: 'core', areaSqm: 23, x: 28.2, y: 11.5, width: 3.8, height: 3.5 },
    ],
  },
  4: {
    buildingId: 'cmu-rb5',
    buildingName: 'Research Building 5',
    buildingNameTh: 'อาคารวิจัย 5 (RB5)',
    floorNumber: 4,
    floorTitle: 'ผังพื้นชั้น 4 (ห้องพักอาจารย์และบัณฑิตศึกษา)',
    totalAreaSqm: 460,
    scaleText: 'มาตราส่วน 1 : 125',
    rooms: [
      { id: 'rb5-4-fire', code: 'ST-2', name: 'บันไดหนีไฟ', category: 'core', areaSqm: 12, x: 0, y: 0, width: 4.8, height: 4.0 },
      { id: 'rb5-401', code: '401', name: 'Faculty Offices 401', category: 'workspace', areaSqm: 110, x: 0, y: 4.0, width: 8.5, height: 11.0 },
      { id: 'rb5-402', code: '402', name: 'Graduate Study Room', category: 'workspace', areaSqm: 95, x: 8.5, y: 4.0, width: 7.5, height: 11.0 },
      { id: 'rb5-4-lounge', code: 'C1', name: 'Staff & Student Lounge', category: 'recreation', areaSqm: 50, x: 16.0, y: 0, width: 5.5, height: 7.5 },
      { id: 'rb5-4-hall', code: 'A1', name: 'โถงทางเดินชั้น 4', category: 'shared', areaSqm: 55, x: 21.5, y: 0, width: 6.7, height: 15.0 },
      { id: 'rb5-4-wc', code: 'A2', name: 'ห้องน้ำ', category: 'shared', areaSqm: 27, x: 28.2, y: 0, width: 3.8, height: 5.5 },
      { id: 'rb5-4-serv', code: 'B2', name: 'งานระบบ', category: 'service', areaSqm: 9, x: 28.2, y: 5.5, width: 3.8, height: 3.5 },
      { id: 'rb5-4-lift', code: 'A3', name: 'ลิฟต์โดยสาร', category: 'shared', areaSqm: 8, x: 28.2, y: 9.0, width: 3.8, height: 2.5 },
      { id: 'rb5-4-stairs', code: 'ST-1', name: 'บันไดหลัก', category: 'core', areaSqm: 23, x: 28.2, y: 11.5, width: 3.8, height: 3.5 },
    ],
  },
};

// =========================================================================
// 3. DYNAMIC GENERATOR: สร้างผังชั้นตามกฎแม่แบบสำหรับทุกอาคารใน มช.
// "ผังทุกชั้นของทุกอาคารในแอปต้องถูกสร้างจากข้อมูลของอาคารนั้น ๆ ตามกฎ"
// =========================================================================

export function getFloorPlanData(
  building?: BuildingInfo | null,
  floorNumber: number = 2,
  targetRoom?: RoomInfo | null
): BuildingFloorPlanData {
  const bId = building?.id || 'cmu-rb5';
  const bCode = building?.code || 'RB5';
  const bNameTh = building?.nameTh || building?.name || 'อาคารวิจัย 5 (RB5)';
  const bName = building?.name || 'Research Building 5';

  // 1. Check if it's the University Office Building (อาคารสำนักงานมหาวิทยาลัย)
  if (bId === 'cmu-univ-office' || bCode.includes('สำนักงานมหาวิทยาลัย') || bNameTh.includes('สำนักงานมหาวิทยาลัย')) {
    const floor = Math.max(1, Math.min(5, floorNumber));
    return UNIVERSITY_OFFICE_FLOORS[floor] || UNIVERSITY_OFFICE_FLOORS[1];
  }

  // 2. Check if it's RB5 (อาคารวิจัย 5)
  if (bId === 'cmu-rb5' || bCode === 'RB5') {
    const floor = Math.max(1, Math.min(4, floorNumber));
    const data = RB5_FLOORS[floor] || RB5_FLOORS[2];
    // If targetRoom specified, mark it
    if (targetRoom) {
      data.rooms.forEach((r) => {
        r.isTarget = r.code === targetRoom.code || r.name.includes(targetRoom.code);
      });
    }
    return data;
  }

  // 3. Dynamic Generator for ANY other CMU building (e.g. คณะสังคมศาสตร์, ตึก SCB, คณะมนุษยศาสตร์ HB, etc.)
  // Following all 6 architectural rules from the Reference Plan:
  // - Ratio 32 x 15m
  // - Right Core: Restroom top-right, Lift & Stairs bottom-right, Maint middle-right
  // - Left Fire Exit top-left
  // - Central Elevator Lobby
  // - Large workspace on left/center, shared near lobby
  // - Entrances on Floor 1 only
  const validFloor = Math.max(1, Math.min(building?.floors?.length || 4, floorNumber));
  const floorRooms = building?.rooms?.filter((r) => r.floor === validFloor) || [];

  const dynamicRooms: FloorRoomLayout[] = [
    // Rule 3: Left Fire Staircase
    {
      id: `${bId}-f${validFloor}-fire`,
      code: 'ST-2',
      name: 'บันไดหนีไฟ',
      category: 'core',
      areaSqm: 12,
      x: 0,
      y: 0,
      width: 4.8,
      height: 3.5,
    },
    // Rule 2: Right Core - Restrooms (ขวาบน)
    {
      id: `${bId}-f${validFloor}-wc`,
      code: 'A3',
      name: 'ห้องน้ำชาย-หญิง และคนพิการ',
      nameEn: 'Restrooms & Accessible WC',
      category: 'shared',
      areaSqm: 27,
      x: 28.2,
      y: 0,
      width: 3.8,
      height: 5.5,
    },
    // Rule 2: Right Core - Utility & Maint (ขวากลาง)
    {
      id: `${bId}-f${validFloor}-serv`,
      code: 'B2',
      name: 'ห้องงานระบบ และแม่บ้าน',
      nameEn: 'Maintenance & Janitor Room',
      category: 'service',
      areaSqm: 9,
      x: 28.2,
      y: 5.5,
      width: 3.8,
      height: 3.5,
    },
    // Rule 2: Right Core - Lift (ขวาล่าง)
    {
      id: `${bId}-f${validFloor}-lift`,
      code: 'A4',
      name: 'ลิฟต์โดยสาร',
      nameEn: 'Passenger Elevator',
      category: 'shared',
      areaSqm: 8,
      x: 28.2,
      y: 9.0,
      width: 3.8,
      height: 2.5,
    },
    // Rule 2: Right Core - Main & Fire Stairs (ขวาล่างสุด)
    {
      id: `${bId}-f${validFloor}-stairs`,
      code: 'ST-1',
      name: 'บันไดหลัก-หนีไฟ',
      nameEn: 'Main & Fire Staircase',
      category: 'core',
      areaSqm: 23,
      x: 28.2,
      y: 11.5,
      width: 3.8,
      height: 3.5,
    },
    // Rule 4: Elevator Lobby (โถงหน้าลิฟต์)
    {
      id: `${bId}-f${validFloor}-lobby`,
      code: 'A2',
      name: `โถงทางเดินกลาง ชั้น ${validFloor}`,
      nameEn: 'Elevator Lobby & Corridor',
      category: 'shared',
      areaSqm: 50,
      x: 22.5,
      y: 0,
      width: 5.7,
      height: 15.0,
    },
  ];

  // Distribute building's actual rooms or synthesize typical faculty workspaces
  if (floorRooms.length > 0) {
    const roomCount = Math.min(4, floorRooms.length);
    const availableWidth = 22.5; // from x=0 to x=22.5
    const slotW = availableWidth / roomCount;

    floorRooms.slice(0, 4).forEach((r, idx) => {
      const isTarget = targetRoom ? r.code === targetRoom.code : r.isTarget || idx === 0;
      dynamicRooms.push({
        id: `${bId}-f${validFloor}-r${r.code}`,
        code: r.code,
        name: r.name,
        nameEn: `${r.name} (${r.code})`,
        category: idx % 2 === 0 ? 'workspace' : 'shared',
        areaSqm: Math.round(55 + (idx * 25)),
        x: Number((idx * slotW).toFixed(1)),
        y: idx === 0 && validFloor > 1 ? 3.5 : 0, // avoid fire stair on top-left
        width: Number(slotW.toFixed(1)),
        height: idx === 0 && validFloor > 1 ? 11.5 : 15.0,
        isTarget: isTarget,
        department: building?.faculty,
        door: { side: 'right', offset: 4 },
      });
    });
  } else {
    // Synthesize generic faculty rooms based on the reference layout
    dynamicRooms.push(
      {
        id: `${bId}-f${validFloor}-gen1`,
        code: `${validFloor}01`,
        name: `ห้องเรียน / บรรยายรวม ${validFloor}01`,
        nameEn: `Lecture Hall ${validFloor}01`,
        category: 'workspace',
        areaSqm: 180,
        x: 0,
        y: 3.5,
        width: 13.0,
        height: 11.5,
        door: { side: 'right', offset: 5 },
      },
      {
        id: `${bId}-f${validFloor}-gen2`,
        code: `${validFloor}02`,
        name: `ห้องปฏิบัติการคอมพิวเตอร์ / วิจัย ${validFloor}02`,
        nameEn: `Computer & Research Lab ${validFloor}02`,
        category: 'workspace',
        areaSqm: 95,
        x: 13.0,
        y: 0,
        width: 9.5,
        height: 7.5,
        isTarget: true,
      },
      {
        id: `${bId}-f${validFloor}-gen3`,
        code: 'A1',
        name: `ห้องประชุมและสัมมนา ชั้น ${validFloor}`,
        nameEn: 'Seminar Room',
        category: 'shared',
        areaSqm: 65,
        x: 13.0,
        y: 7.5,
        width: 9.5,
        height: 7.5,
      }
    );
  }

  // Rule 6: Entrances on Floor 1 only
  const entrances =
    validFloor === 1
      ? [
          { side: 'top' as const, x: 9.0, label: 'ทางเข้าอาคารหลัก' },
          { side: 'bottom' as const, x: 19.0, label: 'ทางเข้าด้านข้าง' },
        ]
      : undefined;

  return {
    buildingId: bId,
    buildingName: bName,
    buildingNameTh: bNameTh,
    floorNumber: validFloor,
    floorTitle: `ผังพื้นชั้น ${validFloor} • ${bCode}`,
    totalAreaSqm: 450,
    scaleText: 'มาตราส่วน 1 : 125',
    rooms: dynamicRooms,
    entrances,
    safetyEquipment: [
      { type: 'extinguisher', x: 28.5, y: 1.5 },
      { type: 'alarm', x: 28.5, y: 6.5 },
    ],
  };
}
