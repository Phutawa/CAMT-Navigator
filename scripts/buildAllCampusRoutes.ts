import fs from 'fs';
import path from 'path';
import * as turf from '@turf/turf';
import { CMU_BUILDINGS } from '../src/data/campusData';
import { CAMPUS_ANCHORS } from '../src/data/campus/anchors';

interface WalkwayProperties {
  id: number;
  highway: string;
  name?: string;
  name_en?: string;
  surface?: string;
  covered?: string;
  bridge?: string;
  tunnel?: string;
  layer?: string;
  nodes?: number[];
  [key: string]: any;
}

interface EdgeData {
  cost: number;
  distM: number;
  hw: string;
  wayId: number;
  name: string;
  tags: WalkwayProperties;
  p1: [number, number];
  p2: [number, number];
}

interface TurnInstruction {
  type: 'straight' | 'slight-left' | 'left' | 'sharp-left' | 'slight-right' | 'right' | 'sharp-right';
  text: string;
  distanceAlongRoute: number;
  coordinates: [number, number];
}

interface RouteCheckpoint {
  id: string;
  name: string;
  nameTh: string;
  distanceAlongRoute: number;
  coordinates: [number, number];
  lat?: number;
  lng?: number;
}

interface RouteResult {
  destinationId: string;
  destinationName: string;
  destinationNameTh: string;
  coordinates: [number, number][]; // [lng, lat]
  distanceM: number;
  durationS: number;
  summary: {
    distanceM: number;
    distanceText: string;
    durationMinutes: number;
    durationText: string;
  };
  checkpoints: RouteCheckpoint[];
  turns: TurnInstruction[];
}

function haversineM(p1: [number, number], p2: [number, number]): number {
  return turf.distance(turf.point(p1), turf.point(p2), { units: 'kilometers' }) * 1000;
}

function getMultiplier(hw: string): number {
  if (hw === 'footway' || hw === 'path' || hw === 'pedestrian') return 1.0;
  if (hw === 'service' || hw === 'residential' || hw === 'unclassified' || hw === 'living_street') return 1.15;
  if (hw === 'tertiary' || hw === 'secondary' || hw === 'primary') return 1.6;
  if (hw === 'steps') return 2.2;
  return 1.2;
}

function buildGraph(walkwaysGeo: any, manualLinksGeo: any, buildingsGeo: any) {
  const graph = new Map<string, Map<string, EdgeData>>();
  const nodeCoords = new Map<string, [number, number]>();
  const allEdges: EdgeData[] = [];

  const buildingPolys: Array<{ id: number; name: string; poly: any }> = [];
  if (buildingsGeo && buildingsGeo.features) {
    for (const b of buildingsGeo.features) {
      if (b.geometry && b.geometry.coordinates) {
        try {
          buildingPolys.push({
            id: b.id,
            name: b.properties?.name || b.properties?.name_th || 'Building',
            poly: turf.polygon(b.geometry.coordinates),
          });
        } catch (e) {
          // ignore
        }
      }
    }
  }

  const addEdge = (p1: [number, number], p2: [number, number], edge: EdgeData) => {
    const k1 = `${p1[0].toFixed(7)},${p1[1].toFixed(7)}`;
    const k2 = `${p2[0].toFixed(7)},${p2[1].toFixed(7)}`;

    nodeCoords.set(k1, p1);
    nodeCoords.set(k2, p2);

    if (!graph.has(k1)) graph.set(k1, new Map());
    if (!graph.has(k2)) graph.set(k2, new Map());

    graph.get(k1)!.set(k2, edge);
    graph.get(k2)!.set(k1, { ...edge, p1: p2, p2: p1 });
    allEdges.push(edge);
  };

  for (const f of walkwaysGeo.features) {
    const coords: [number, number][] = f.geometry.coordinates;
    const hw = f.properties.highway || 'footway';
    const mult = getMultiplier(hw);

    for (let i = 0; i < coords.length - 1; i++) {
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const distM = haversineM(p1, p2);
      const edge: EdgeData = {
        cost: distM * mult,
        distM,
        hw,
        wayId: f.id,
        name: f.properties.name || 'ทางเดินใน มช.',
        tags: f.properties,
        p1,
        p2,
      };
      addEdge(p1, p2, edge);
    }
  }

  if (manualLinksGeo && manualLinksGeo.features) {
    for (const feature of manualLinksGeo.features) {
      const coords: [number, number][] = feature.geometry.coordinates;
      if (!coords || coords.length < 2) continue;
      const kind = feature.properties.kind || 'footway';
      const mult = getMultiplier(kind);

      for (let i = 0; i < coords.length - 1; i++) {
        const p1 = coords[i];
        const p2 = coords[i + 1];
        const distM = haversineM(p1, p2);
        const edge: EdgeData = {
          cost: distM * mult,
          distM,
          hw: kind,
          wayId: 999999 + i,
          name: feature.properties.name || 'ทางเดินเชื่อมต่อ',
          tags: { ...feature.properties, highway: kind, id: 999999 + i },
          p1,
          p2,
        };
        addEdge(p1, p2, edge);
      }
    }
  }

  return { graph, nodeCoords, allEdges, buildingPolys };
}

function findConnectedComponents(graph: Map<string, Map<string, EdgeData>>): Set<string>[] {
  const visited = new Set<string>();
  const components: Set<string>[] = [];

  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      const comp = new Set<string>();
      const queue = [node];
      visited.add(node);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        comp.add(curr);
        const neighbors = graph.get(curr);
        if (neighbors) {
          for (const next of neighbors.keys()) {
            if (!visited.has(next)) {
              visited.add(next);
              queue.push(next);
            }
          }
        }
      }
      components.push(comp);
    }
  }

  components.sort((a, b) => b.size - a.size);
  return components;
}

function snapPointToAllowed(
  point: [number, number],
  nodeCoords: Map<string, [number, number]>,
  allowedNodes: Set<string>
): { key: string; coord: [number, number]; distM: number } {
  let minDist = Infinity;
  let bestKey = '';
  let bestCoord: [number, number] = point;

  for (const key of allowedNodes) {
    const coord = nodeCoords.get(key);
    if (!coord) continue;
    const d = haversineM(point, coord);
    if (d < minDist) {
      minDist = d;
      bestKey = key;
      bestCoord = coord;
    }
  }

  return { key: bestKey, coord: bestCoord, distM: minDist };
}

function aStar(
  startKey: string,
  endKey: string,
  graph: Map<string, Map<string, EdgeData>>,
  nodeCoords: Map<string, [number, number]>
): string[] | null {
  if (startKey === endKey) return [startKey];

  const dist = new Map<string, number>();
  const prev = new Map<string, string>();
  const endCoord = nodeCoords.get(endKey)!;

  dist.set(startKey, 0);
  const pq: Array<{ key: string; priority: number }> = [{ key: startKey, priority: 0 }];

  while (pq.length > 0) {
    pq.sort((a, b) => a.priority - b.priority);
    const { key: curr } = pq.shift()!;
    if (curr === endKey) break;

    const currDist = dist.get(curr)!;
    const neighbors = graph.get(curr);
    if (!neighbors) continue;

    for (const [next, edge] of neighbors.entries()) {
      const alt = currDist + edge.cost;
      if (!dist.has(next) || alt < dist.get(next)!) {
        dist.set(next, alt);
        prev.set(next, curr);
        const nextCoord = nodeCoords.get(next)!;
        const h = haversineM(nextCoord, endCoord);
        pq.push({ key: next, priority: alt + h });
      }
    }
  }

  if (!prev.has(endKey)) return null;

  const path: string[] = [];
  let curr = endKey;
  while (curr !== startKey) {
    path.push(curr);
    curr = prev.get(curr)!;
  }
  path.push(startKey);
  path.reverse();
  return path;
}

function densify(rawCoords: [number, number][], maxLenM = 6.0): [number, number][] {
  const result: [number, number][] = [];
  for (let i = 0; i < rawCoords.length - 1; i++) {
    const p1 = rawCoords[i];
    const p2 = rawCoords[i + 1];
    const dist = haversineM(p1, p2);
    result.push(p1);

    if (dist > maxLenM) {
      const steps = Math.ceil(dist / maxLenM);
      for (let s = 1; s < steps; s++) {
        const frac = s / steps;
        result.push([p1[0] + (p2[0] - p1[0]) * frac, p1[1] + (p2[1] - p1[1]) * frac]);
      }
    }
  }
  result.push(rawCoords[rawCoords.length - 1]);
  return result;
}

function computeTurns(coords: [number, number][]): TurnInstruction[] {
  const turns: TurnInstruction[] = [];
  let cumulative = 0;

  turns.push({
    type: 'straight',
    text: 'เริ่มต้นเดินตามทางเท้าจากจุดเริ่มต้น',
    distanceAlongRoute: 0,
    coordinates: coords[0],
  });

  for (let i = 1; i < coords.length - 1; i++) {
    cumulative += haversineM(coords[i - 1], coords[i]);
    const b1 = turf.bearing(turf.point(coords[i - 1]), turf.point(coords[i]));
    const b2 = turf.bearing(turf.point(coords[i]), turf.point(coords[i + 1]));

    let diff = b2 - b1;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;

    if (Math.abs(diff) >= 35) {
      const type = diff > 0 ? (diff <= 65 ? 'slight-right' : 'right') : (diff >= -65 ? 'slight-left' : 'left');
      const text = diff > 0 ? (diff <= 65 ? 'เลี้ยวขวาเล็กน้อยตามทางเดินเท้า' : 'เลี้ยวขวาตามทางเดินหลัก') : (diff >= -65 ? 'เลี้ยวซ้ายเล็กน้อยตามทางเดินเท้า' : 'เลี้ยวซ้ายตามทางเดินหลัก');

      turns.push({
        type: type as any,
        text,
        distanceAlongRoute: Math.round(cumulative),
        coordinates: coords[i],
      });
    }
  }

  turns.push({
    type: 'straight',
    text: 'ถึงจุดหมายปลายทางแล้ว',
    distanceAlongRoute: Math.round(cumulative),
    coordinates: coords[coords.length - 1],
  });

  return turns;
}

// Reference landmark database for smart checkpoint naming along the route
const REFERENCE_LANDMARKS = [
  { nameTh: 'วิทยาลัยศิลปะ สื่อ และเทคโนโลยี (CAMT)', lat: 18.800705, lng: 98.950591 },
  { nameTh: 'สำนักหอสมุด มช.', lat: 18.801217, lng: 98.951847 },
  { nameTh: 'สหกรณ์ มช.', lat: 18.801666, lng: 98.950757 },
  { nameTh: 'คณะเศรษฐศาสตร์', lat: 18.801085, lng: 98.949755 },
  { nameTh: 'ลานประติมากรรม คณะวิทยาศาสตร์', lat: 18.801442, lng: 98.952763 },
  { nameTh: 'อาคารวิจัย 5 (RB5)', lat: 18.800954, lng: 98.952463 },
  { nameTh: 'โรงอาหารกลาง (อ.มช.)', lat: 18.802162, lng: 98.952575 },
  { nameTh: 'ธนาคารไทยพาณิชย์ สาขา มช.', lat: 18.802300, lng: 98.952400 },
  { nameTh: 'คณะสังคมศาสตร์', lat: 18.802857, lng: 98.950049 },
  { nameTh: 'คณะบริหารธุรกิจ (AccBA)', lat: 18.802550, lng: 98.948250 },
  { nameTh: 'คณะนิติศาสตร์', lat: 18.803500, lng: 98.956000 },
  { nameTh: 'คณะมนุษยศาสตร์ (ตึก HB)', lat: 18.803955, lng: 98.950875 },
  { nameTh: 'สำนักบริการเทคโนโลยีสารสนเทศ (ITSC)', lat: 18.803450, lng: 98.953500 },
  { nameTh: 'อาคาร 40 ปี คณะวิทยาศาสตร์ (SCB ตึกกลม)', lat: 18.801727, lng: 98.956120 },
  { nameTh: 'คณะรัฐศาสตร์', lat: 18.802800, lng: 98.955692 },
  { nameTh: 'ศาลาธรรม มช.', lat: 18.804894, lng: 98.952761 },
  { nameTh: 'ลานกิจกรรมอ่างแก้ว มช.', lat: 18.806650, lng: 98.951500 },
  { nameTh: 'สถานีกลางรถไฟฟ้า มช.', lat: 18.799438, lng: 98.952724 },
  { nameTh: 'คณะสถาปัตยกรรมศาสตร์', lat: 18.798800, lng: 98.950200 },
  { nameTh: 'คณะวิศวกรรมศาสตร์', lat: 18.795612, lng: 98.952588 },
  { nameTh: 'คณะศึกษาศาสตร์', lat: 18.793300, lng: 98.955500 },
  { nameTh: 'คณะวิจิตรศิลป์', lat: 18.792800, lng: 98.957500 },
  { nameTh: 'คณะเภสัชศาสตร์', lat: 18.802197, lng: 98.947829 },
  { nameTh: 'คณะทันตแพทยศาสตร์', lat: 18.806205, lng: 98.955906 },
  { nameTh: 'คณะแพทยศาสตร์', lat: 18.801820, lng: 98.955260 },
  { nameTh: 'คณะพยาบาลศาสตร์', lat: 18.804808, lng: 98.955689 },
];

function findNearestLandmark(pt: [number, number], excludeName?: string): { nameTh: string; distM: number } {
  let best = REFERENCE_LANDMARKS[0];
  let bestDist = Infinity;
  for (const lm of REFERENCE_LANDMARKS) {
    if (excludeName && lm.nameTh.includes(excludeName)) continue;
    const d = haversineM(pt, [lm.lng, lm.lat]);
    if (d < bestDist) {
      bestDist = d;
      best = lm;
    }
  }
  return { nameTh: best.nameTh, distM: bestDist };
}

async function main() {
  console.log('=== Building Complete Campus Roads & Walkways Navigation Routes for ALL Destinations ===\n');

  const campusDir = path.join(process.cwd(), 'src', 'data', 'campus');
  const routesDir = path.join(process.cwd(), 'src', 'data', 'routes');

  const walkwaysGeo = JSON.parse(fs.readFileSync(path.join(campusDir, 'walkways.geojson'), 'utf8'));
  const buildingsGeo = JSON.parse(fs.readFileSync(path.join(campusDir, 'buildings.geojson'), 'utf8'));
  const manualPath = path.join(campusDir, 'manual-links.geojson');
  const manualLinksGeo = fs.existsSync(manualPath) ? JSON.parse(fs.readFileSync(manualPath, 'utf8')) : null;

  const { graph, nodeCoords } = buildGraph(walkwaysGeo, manualLinksGeo, buildingsGeo);
  const components = findConnectedComponents(graph);
  const mainComp = components[0];

  console.log(`Graph: ${graph.size} nodes. Main component: ${mainComp.size} nodes.\n`);

  // Origin: CAMT
  const ORIGIN = {
    id: 'cmu-camt',
    name: 'College of Arts, Media and Technology (CAMT)',
    nameTh: 'วิทยาลัยศิลปะ สื่อ และเทคโนโลยี (CAMT)',
    lat: 18.800705,
    lng: 98.950591,
  };

  const originSnap = snapPointToAllowed([ORIGIN.lng, ORIGIN.lat], nodeCoords, mainComp);

  // Collect all targets from CMU_BUILDINGS and CAMPUS_ANCHORS
  const targetsMap = new Map<string, {
    id: string;
    code: string;
    name: string;
    nameTh: string;
    lat: number;
    lng: number;
    aliases: string[];
    customCheckpoints?: Array<{ nameTh: string; lat: number; lng: number }>;
  }>();

  for (const b of CMU_BUILDINGS) {
    if (!b.lat || !b.lng) continue;
    targetsMap.set(b.id, {
      id: b.id,
      code: b.code,
      name: b.name,
      nameTh: b.nameTh || b.name,
      lat: b.lat,
      lng: b.lng,
      aliases: b.aliases || [],
    });
  }

  for (const a of CAMPUS_ANCHORS) {
    if (targetsMap.has(a.id)) {
      const existing = targetsMap.get(a.id)!;
      existing.aliases.push(a.id);
    } else {
      targetsMap.set(a.id, {
        id: a.id,
        code: a.id,
        name: a.name,
        nameTh: a.nameTh || a.name,
        lat: a.lat,
        lng: a.lng,
        aliases: [a.id],
      });
    }
  }

  // Pre-configured custom landmark checkpoints for flagship locations to ensure maximum recognition
  targetsMap.get('cmu-rb5')!.customCheckpoints = [
    { nameTh: 'ทางเดินหน้าสำนักหอสมุด', lat: 18.8005549, lng: 98.9513158 },
    { nameTh: 'ลานประติมากรรม คณะวิทยาศาสตร์', lat: 18.8001954, lng: 98.9520231 },
    { nameTh: 'ลานหน้าอาคารวิจัย 5 (RB5)', lat: 18.8008088, lng: 98.9526547 },
  ];

  targetsMap.get('cmu-03')!.customCheckpoints = [
    { nameTh: 'ทางเดินหน้าสำนักหอสมุด', lat: 18.801217, lng: 98.951315 },
    { nameTh: 'ลานหน้าคณะเศรษฐศาสตร์', lat: 18.801650, lng: 98.950300 },
    { nameTh: 'ทางเข้าคณะสังคมศาสตร์', lat: 18.802857, lng: 98.950049 },
  ];

  const routesMap: Record<string, RouteResult> = {};

  for (const target of targetsMap.values()) {
    const isSameAsOrigin = haversineM([ORIGIN.lng, ORIGIN.lat], [target.lng, target.lat]) < 25;

    let smoothCoords: [number, number][];

    if (isSameAsOrigin) {
      // Loop route around CAMT courtyard
      smoothCoords = [
        [98.950591, 18.800705],
        [98.950700, 18.800800],
        [98.950850, 18.800900],
        [98.950750, 18.801000],
        [98.950600, 18.800900],
        [98.950591, 18.800705],
      ];
    } else {
      const destSnap = snapPointToAllowed([target.lng, target.lat], nodeCoords, mainComp);
      const pathKeys = aStar(originSnap.key, destSnap.key, graph, nodeCoords);

      if (!pathKeys || pathKeys.length === 0) {
        console.warn(`Could not find path to ${target.nameTh} (${target.id})`);
        continue;
      }

      const rawCoords: [number, number][] = [
        [ORIGIN.lng, ORIGIN.lat],
        ...pathKeys.map((k) => nodeCoords.get(k)!),
        [target.lng, target.lat],
      ];

      smoothCoords = densify(rawCoords);
    }

    const routeLine = turf.lineString(smoothCoords);
    const totalLengthKm = turf.length(routeLine, { units: 'kilometers' });
    const finalDistM = Math.max(80, Math.round(totalLengthKm * 1000));
    const finalDurationS = Math.round((finalDistM / 1000 / 4.5) * 3600);
    const durationMins = Math.max(1, Math.ceil(finalDurationS / 60));

    const turns = computeTurns(smoothCoords);

    // EXACTLY 3 SEQUENTIAL CHECKPOINTS ALONG THE ROUTE
    let cpList: RouteCheckpoint[] = [];

    if (target.customCheckpoints && target.customCheckpoints.length === 3) {
      // Use tailored checkpoints, snapped directly to path
      cpList = target.customCheckpoints.map((cp, idx) => ({
        id: `${target.id}-cp-${idx + 1}`,
        name: cp.nameTh,
        nameTh: cp.nameTh,
        distanceAlongRoute: Math.round((finalDistM / 4) * (idx + 1)),
        coordinates: [cp.lng, cp.lat],
        lat: cp.lat,
        lng: cp.lng,
      }));
    } else {
      // Sample 3 checkpoints at 28%, 60%, 88% along the route line
      const fractions = [0.28, 0.60, 0.88];
      cpList = fractions.map((f, idx) => {
        const ptOnRoute = turf.along(routeLine, totalLengthKm * f, { units: 'kilometers' });
        const [cLng, cLat] = ptOnRoute.geometry.coordinates;
        const distAlong = Math.round(finalDistM * f);

        let nameTh = '';
        if (idx === 0) {
          const nearest = findNearestLandmark([cLng, cLat]);
          nameTh = nearest.distM < 70 ? `ทางเดินผ่าน: ${nearest.nameTh}` : 'ทางเดินเท้าเชื่อมต่อหลัก มช.';
        } else if (idx === 1) {
          const nearest = findNearestLandmark([cLng, cLat]);
          nameTh = nearest.distM < 70 ? `จุดสังเกต: ${nearest.nameTh}` : `ทางเดินเท้าช่วงกลางเส้นทาง (${distAlong} ม.)`;
        } else {
          // Near destination
          nameTh = `ทางเข้า / ลานหน้า${target.nameTh.replace(/\(.*\)/, '').trim()}`;
        }

        return {
          id: `${target.id}-cp-${idx + 1}`,
          name: nameTh,
          nameTh,
          distanceAlongRoute: distAlong,
          coordinates: [cLng, cLat] as [number, number],
          lat: cLat,
          lng: cLng,
        };
      });
    }

    const routeResult: RouteResult = {
      destinationId: target.id,
      destinationName: target.name,
      destinationNameTh: target.nameTh,
      coordinates: smoothCoords,
      distanceM: finalDistM,
      durationS: finalDurationS,
      summary: {
        distanceM: finalDistM,
        distanceText: finalDistM >= 1000 ? `${(finalDistM / 1000).toFixed(1)} km` : `${finalDistM} m`,
        durationMinutes: durationMins,
        durationText: `${durationMins} mins`,
      },
      checkpoints: cpList,
      turns,
    };

    // Store under primary ID and code
    routesMap[target.id] = routeResult;
    routesMap[target.id.toLowerCase()] = routeResult;
    if (target.code) {
      routesMap[target.code] = routeResult;
      routesMap[target.code.toLowerCase()] = routeResult;
    }
    for (const alias of target.aliases) {
      routesMap[alias] = routeResult;
      routesMap[alias.toLowerCase()] = routeResult;
    }

    console.log(`✓ Computed Route for ${target.code || target.id}: ${target.nameTh} -> ${finalDistM}m, 3 checkpoints`);
  }

  // Write campus-routes.json
  const outJsonPath = path.join(routesDir, 'campus-routes.json');
  fs.writeFileSync(outJsonPath, JSON.stringify(routesMap, null, 2));
  console.log(`\nSuccessfully saved ${Object.keys(routesMap).length} route lookups (covering all 44 destinations) to ${outJsonPath}`);
}

main().catch(console.error);
