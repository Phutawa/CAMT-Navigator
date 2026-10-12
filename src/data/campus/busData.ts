import busRouteJson from '../routes/route-bus-to-rb5.json';

export interface CampusBusStop {
  id: string;
  name: string;
  nameTh: string;
  ref: string;
  lat: number;
  lng: number;
  shelter?: boolean;
  lines: string[];
}

export const CMU_BUS_STOPS: CampusBusStop[] = [
  {
    id: 'stop-hub-rb5',
    name: 'Student Hub & RB5 Bus Stop',
    nameTh: 'จุดจอดรถบัส อ.มช. (หน้าอาคารวิจัย 5)',
    ref: '38',
    lat: 18.8002979,
    lng: 98.9532765,
    shelter: true,
    lines: ['Line 1', 'Line 2', 'Line 3']
  },
  {
    id: 'stop-coop-library',
    name: 'CMU Cooperative & Library Bus Stop',
    nameTh: 'จุดจอดรถบัส สหกรณ์ มช. / สำนักหอสมุด',
    ref: '35',
    lat: 18.8015571,
    lng: 98.951173,
    shelter: true,
    lines: ['Line 1', 'Line 2']
  },
  {
    id: 'stop-econs',
    name: 'Faculty of Economics Bus Stop',
    nameTh: 'จุดจอดรถบัส หน้าคณะเศรษฐศาสตร์',
    ref: '4',
    lat: 18.8011466,
    lng: 98.9499884,
    shelter: true,
    lines: ['Line 4']
  },
  {
    id: 'stop-central-station',
    name: 'Central Bus Station (Female Dorm 3)',
    nameTh: 'สถานีกลาง รถไฟฟ้า (หอพักหญิง 3)',
    ref: 'T1',
    lat: 18.7994376,
    lng: 98.9527236,
    shelter: true,
    lines: ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5']
  },
  {
    id: 'stop-social-sci',
    name: 'Faculty of Social Sciences Bus Stop',
    nameTh: 'จุดจอดรถบัส คณะสังคมศาสตร์',
    ref: '36',
    lat: 18.8031713,
    lng: 98.9497331,
    shelter: true,
    lines: ['Line 1', 'Line 3']
  },
  {
    id: 'stop-hb7',
    name: 'HB7 Humanities Bus Stop',
    nameTh: 'จุดจอดรถบัส อาคาร HB7',
    ref: '38',
    lat: 18.8032025,
    lng: 98.9501405,
    shelter: true,
    lines: ['Line 1']
  },
  {
    id: 'stop-sci-40y',
    name: 'Faculty of Science 40th Year Building',
    nameTh: 'จุดจอดรถบัส อาคาร 40 ปี คณะวิทยาศาสตร์',
    ref: '30',
    lat: 18.8010921,
    lng: 98.956216,
    shelter: true,
    lines: ['Line 2']
  }
];

function haversineDistM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Find the nearest bus stop to a given destination coordinate
 */
export function getNearestBusStop(lat: number, lng: number): { stop: CampusBusStop; distanceM: number } {
  let closest = CMU_BUS_STOPS[0];
  let minD = Infinity;

  for (const stop of CMU_BUS_STOPS) {
    const d = haversineDistM(lat, lng, stop.lat, stop.lng);
    if (d < minD) {
      minD = d;
      closest = stop;
    }
  }

  return { stop: closest, distanceM: Math.round(minD) };
}

export const BUS_ROUTE_CAMT_TO_RB5 = busRouteJson;
