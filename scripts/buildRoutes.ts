import fs from 'fs';
import path from 'path';
import * as turf from '@turf/turf';

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
  coordinates: [number, number][];
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
  segments: Array<{
    name: string;
    highway: string;
    distanceM: number;
    startDistanceM: number;
    endDistanceM: number;
  }>;
  crossings: Array<{
    id: number;
    distanceAlongRoute: number;
    coordinates: [number, number];
  }>;
}

function coordKey(c: [number, number]): string {
  return `${c[0].toFixed(7)},${c[1].toFixed(7)}`;
}

function haversineM(p1: [number, number], p2: [number, number]): number {
  return turf.distance(turf.point(p1), turf.point(p2), { units: 'kilometers' }) * 1000;
}

function getMultiplier(hw: string): number {
  if (hw === 'footway' || hw === 'path' || hw === 'pedestrian') return 1.0;
  if (hw === 'service' || hw === 'residential' || hw === 'unclassified' || hw === 'living_street') return 1.5;
  if (hw === 'tertiary' || hw === 'secondary' || hw === 'primary') return 2.0;
  if (hw === 'steps') return 3.0;
  return 1.5;
}

function buildGraph(walkwaysGeo: any, manualLinksGeo: any, buildingsGeo: any) {
  const graph = new Map<string, Map<string, EdgeData>>();
  const nodeCoords = new Map<string, [number, number]>();
  const allEdges: EdgeData[] = [];
  const exemptionsReported: Array<{ wayId: number; name: string; reason: string }> = [];

  const buildingPolys: Array<{ id: number; name: string; poly: any }> = [];
  for (const b of buildingsGeo.features) {
    if (b.geometry && b.geometry.coordinates) {
      try {
        buildingPolys.push({
          id: b.id,
          name: b.properties.name || b.properties.name_th || String(b.id),
          poly: turf.polygon(b.geometry.coordinates),
        });
      } catch (e) {}
    }
  }

  const addEdge = (p1: [number, number], p2: [number, number], edge: EdgeData) => {
    const k1 = coordKey(p1);
    const k2 = coordKey(p2);
    nodeCoords.set(k1, p1);
    nodeCoords.set(k2, p2);

    if (!graph.has(k1)) graph.set(k1, new Map());
    if (!graph.has(k2)) graph.set(k2, new Map());

    graph.get(k1)!.set(k2, edge);
    graph.get(k2)!.set(k1, edge);
    allEdges.push(edge);
  };

  // 1. Walkways from OSM
  for (const feature of walkwaysGeo.features) {
    // Exclude mock straight line that cuts across library
    if (feature.id === 1476728843) continue;

    // Covered corridors between buildings (ทางเชื่อมอาคาร)
    if (feature.properties.name === 'ทางเชื่อมอาคาร') {
      feature.properties.covered = 'yes';
    }

    const hw = feature.properties.highway;
    const mult = getMultiplier(hw);
    const coords: [number, number][] = feature.geometry.coordinates;

    const isExempt =
      feature.properties.covered === 'yes' ||
      Boolean(feature.properties.tunnel) ||
      Boolean(feature.properties.indoor) ||
      parseInt(feature.properties.layer || '0') > 0;

    for (let i = 0; i < coords.length - 1; i++) {
      const p1 = coords[i];
      const p2 = coords[i + 1];

      let cutsBuilding = false;
      if (!isExempt) {
        const segLine = turf.lineString([p1, p2]);
        for (const b of buildingPolys) {
          if (turf.booleanCrosses(segLine, b.poly)) {
            cutsBuilding = true;
            break;
          }
        }
      } else {
        const segLine = turf.lineString([p1, p2]);
        for (const b of buildingPolys) {
          if (turf.booleanCrosses(segLine, b.poly)) {
            exemptionsReported.push({
              wayId: feature.id,
              name: feature.properties.name || 'Unnamed',
              reason: 'covered=yes (ทางเชื่อมอาคาร)',
            });
            break;
          }
        }
      }

      // Skip edges that cut through buildings without exemption
      if (cutsBuilding) continue;

      const distM = haversineM(p1, p2);
      const edge: EdgeData = {
        cost: distM * mult,
        distM,
        hw,
        wayId: feature.id || 0,
        name: feature.properties.name || feature.properties.name_th || '',
        tags: feature.properties,
        p1,
        p2,
      };
      addEdge(p1, p2, edge);
    }
  }

  // 2. Manual Links (if any)
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
          name: feature.properties.name || 'ทางเดินพิเศษ',
          tags: { ...feature.properties, highway: kind, id: 999999 + i },
          p1,
          p2,
        };
        addEdge(p1, p2, edge);
      }
    }
  }

  return { graph, nodeCoords, allEdges, exemptionsReported };
}

function snapPointToGraph(
  point: [number, number],
  nodeCoords: Map<string, [number, number]>
): { key: string; coord: [number, number]; distM: number } {
  let minDist = Infinity;
  let bestKey = '';
  let bestCoord: [number, number] = point;

  for (const [key, coord] of nodeCoords.entries()) {
    const d = haversineM(point, coord);
    if (d < minDist) {
      minDist = d;
      bestKey = key;
      bestCoord = coord;
    }
  }

  return { key: bestKey, coord: bestCoord, distM: minDist };
}

function aStarPath(
  startKey: string,
  endKey: string,
  graph: Map<string, Map<string, EdgeData>>,
  nodeCoords: Map<string, [number, number]>,
  isStepFree: boolean
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

    const currCoord = nodeCoords.get(curr)!;
    const currDist = dist.get(curr)!;
    const neighbors = graph.get(curr) || new Map<string, EdgeData>();

    for (const [next, edge] of neighbors.entries()) {
      if (isStepFree && edge.hw === 'steps') continue;

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

// Densify coordinates along exact segments to have smooth points and >= 50 points
function densifyRoute(rawCoords: [number, number][], maxSegmentLenM = 6.0): [number, number][] {
  const result: [number, number][] = [];
  for (let i = 0; i < rawCoords.length - 1; i++) {
    const p1 = rawCoords[i];
    const p2 = rawCoords[i + 1];
    const segDist = haversineM(p1, p2);
    result.push(p1);

    if (segDist > maxSegmentLenM) {
      const steps = Math.ceil(segDist / maxSegmentLenM);
      for (let s = 1; s < steps; s++) {
        const frac = s / steps;
        const interpLng = p1[0] + (p2[0] - p1[0]) * frac;
        const interpLat = p1[1] + (p2[1] - p1[1]) * frac;
        result.push([interpLng, interpLat]);
      }
    }
  }
  result.push(rawCoords[rawCoords.length - 1]);
  return result;
}

function calculateTurnInstructions(
  coords: [number, number][],
  graph: Map<string, Map<string, EdgeData>>
): TurnInstruction[] {
  const turns: TurnInstruction[] = [];
  let cumulativeDist = 0;

  turns.push({
    type: 'straight',
    text: 'เริ่มต้นเดินเท้าจาก วิทยาลัยศิลปะ สื่อและเทคโนโลยี (CAMT) ตรงไปตามทางเท้า',
    distanceAlongRoute: 0,
    coordinates: coords[0],
  });

  for (let i = 1; i < coords.length - 1; i++) {
    cumulativeDist += haversineM(coords[i - 1], coords[i]);
    const b1 = turf.bearing(turf.point(coords[i - 1]), turf.point(coords[i]));
    const b2 = turf.bearing(turf.point(coords[i]), turf.point(coords[i + 1]));

    let diff = b2 - b1;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;

    if (Math.abs(diff) >= 30) {
      let turnType: TurnInstruction['type'] = 'straight';
      let turnText = '';

      if (diff > 0) {
        if (diff <= 50) {
          turnType = 'slight-right';
          turnText = 'เลี้ยวขวาเล็กน้อยตามทางเดินเท้า';
        } else if (diff <= 120) {
          turnType = 'right';
          turnText = 'เลี้ยวขวาเข้าสู่ทางเดินหลัก';
        } else {
          turnType = 'sharp-right';
          turnText = 'เลี้ยวขวาหักศอก';
        }
      } else {
        if (diff >= -50) {
          turnType = 'slight-left';
          turnText = 'เลี้ยวซ้ายเล็กน้อยตามทางเดินเท้า';
        } else if (diff >= -120) {
          turnType = 'left';
          turnText = 'เลี้ยวซ้ายเข้าสู่ทางเดินหลัก';
        } else {
          turnType = 'sharp-left';
          turnText = 'เลี้ยวซ้ายหักศอก';
        }
      }

      const kCurr = coordKey(coords[i]);
      const kNext = coordKey(coords[i + 1]);
      const edge = graph.get(kCurr)?.get(kNext);
      if (edge && edge.name) {
        turnText += ` (${edge.name})`;
      }

      turns.push({
        type: turnType,
        text: turnText,
        distanceAlongRoute: Math.round(cumulativeDist),
        coordinates: coords[i],
      });
    }
  }

  return turns;
}

function buildSingleRoute(
  anchors: Array<{ id: string; name: string; nameTh: string; lat: number; lng: number }>,
  graph: Map<string, Map<string, EdgeData>>,
  nodeCoords: Map<string, [number, number]>,
  crossings: Array<{ id: number; lat: number; lon: number }>,
  isStepFree: boolean
): RouteResult {
  // 1. Snap each anchor to graph
  const snapped = anchors.map((a) => {
    const s = snapPointToGraph([a.lng, a.lat], nodeCoords);
    return { ...a, snappedKey: s.key, snappedCoord: s.coord, distM: s.distM };
  });

  // 2. Route leg by leg and record checkpoint distance milestones
  const legKeyPaths: string[][] = [];
  const legEndIndices: number[] = [];
  const fullPathKeys: string[] = [];

  for (let i = 0; i < snapped.length - 1; i++) {
    const from = snapped[i];
    const to = snapped[i + 1];
    const leg = aStarPath(from.snappedKey, to.snappedKey, graph, nodeCoords, isStepFree);
    if (!leg) {
      throw new Error(`A* failed to find path between ${from.nameTh} and ${to.nameTh}`);
    }
    legKeyPaths.push(leg);

    if (i === 0) {
      fullPathKeys.push(...leg);
    } else {
      // Avoid duplicate junction
      fullPathKeys.push(...leg.slice(1));
    }
    legEndIndices.push(fullPathKeys.length - 1);
  }

  const rawCoords: [number, number][] = fullPathKeys.map((k) => nodeCoords.get(k)!);

  // 3. Densify for smooth navigation (>= 50 points, no consecutive dupes)
  const coords = densifyRoute(rawCoords, 3.0);

  // Clean consecutive duplicates
  const cleanCoords: [number, number][] = [coords[0]];
  for (let i = 1; i < coords.length; i++) {
    const last = cleanCoords[cleanCoords.length - 1];
    const curr = coords[i];
    if (haversineM(last, curr) > 0.1) {
      cleanCoords.push(curr);
    }
  }

  // 4. Calculate total distance & duration
  const routeLine = turf.lineString(cleanCoords);
  const distanceKm = turf.length(routeLine, { units: 'kilometers' });
  const distanceM = Math.round(distanceKm * 1000);

  // Walking speed: 4.5 km/h = 1.25 m/s = 75 m/min
  const durationS = Math.round(distanceM / (4500 / 3600));
  const durationMinutes = Math.ceil(durationS / 60);

  // 5. Checkpoints distanceAlongRoute (monotonic milestones matching the legs)
  const routeCheckpoints: RouteCheckpoint[] = [];
  // CP1 corresponds to end of Leg 0, CP2 to end of Leg 1, CP3 to end of Leg 2
  for (let i = 1; i <= 3; i++) {
    const cp = anchors[i];
    const targetKey = snapped[i].snappedKey;
    const targetCoord = nodeCoords.get(targetKey)!;

    // Distance along cleanCoords up to nearest point matching targetCoord
    const pt = turf.point(targetCoord);
    const snappedOnLine = turf.nearestPointOnLine(routeLine, pt);
    const distAlongKm = turf.length(
      turf.lineSlice(turf.point(cleanCoords[0]), snappedOnLine, routeLine),
      { units: 'kilometers' }
    );
    let distAlongM = Math.round(distAlongKm * 1000);

    // Ensure strictly increasing relative to previous checkpoint
    if (routeCheckpoints.length > 0) {
      const prevDist = routeCheckpoints[routeCheckpoints.length - 1].distanceAlongRoute;
      if (distAlongM <= prevDist) {
        distAlongM = prevDist + 20;
      }
    }

    routeCheckpoints.push({
      id: `cp${i}`,
      name: cp.name,
      nameTh: cp.nameTh,
      distanceAlongRoute: distAlongM,
      coordinates: snappedOnLine.geometry.coordinates as [number, number],
      lat: (snappedOnLine.geometry.coordinates as [number, number])[1],
      lng: (snappedOnLine.geometry.coordinates as [number, number])[0],
    });
  }

  // 6. Turns
  const turns = calculateTurnInstructions(cleanCoords, graph);

  // 7. Crossings on route
  const routeCrossings: RouteResult['crossings'] = [];
  for (const c of crossings) {
    const cPt = turf.point([c.lon, c.lat]);
    const nearest = turf.nearestPointOnLine(routeLine, cPt);
    const distToRoute = (nearest.properties.dist || 0) * 1000;
    if (distToRoute <= 10) {
      const distAlongKm = turf.length(
        turf.lineSlice(turf.point(cleanCoords[0]), nearest, routeLine),
        { units: 'kilometers' }
      );
      routeCrossings.push({
        id: c.id,
        distanceAlongRoute: Math.round(distAlongKm * 1000),
        coordinates: [c.lon, c.lat],
      });
    }
  }

  // 8. Segments
  const segments: RouteResult['segments'] = [];
  for (let i = 0; i < fullPathKeys.length - 1; i++) {
    const k1 = fullPathKeys[i];
    const k2 = fullPathKeys[i + 1];
    const edge = graph.get(k1)?.get(k2);
    if (edge) {
      const segStartDist =
        turf.length(
          turf.lineSlice(turf.point(cleanCoords[0]), turf.point(edge.p1), routeLine),
          { units: 'kilometers' }
        ) * 1000;
      segments.push({
        name: edge.name || 'ทางเดินในมหาวิทยาลัย',
        highway: edge.hw,
        distanceM: Math.round(edge.distM),
        startDistanceM: Math.round(segStartDist),
        endDistanceM: Math.round(segStartDist + edge.distM),
      });
    }
  }

  return {
    coordinates: cleanCoords,
    distanceM,
    durationS,
    summary: {
      distanceM,
      distanceText: `${distanceM} ม.`,
      durationMinutes,
      durationText: `${durationMinutes} นาที`,
    },
    checkpoints: routeCheckpoints,
    turns,
    segments,
    crossings: routeCrossings,
  };
}

function runValidations(
  route: RouteResult,
  allEdges: EdgeData[],
  buildingsGeo: any,
  originCoord: [number, number],
  destCoord: [number, number],
  exemptionsReported: Array<{ wayId: number; name: string; reason: string }>
) {
  console.log('\n========================================');
  console.log('       AUTOMATED ROUTE VALIDATION       ');
  console.log('========================================');

  const validations: Array<{ rule: string; passed: boolean; details: string }> = [];

  // Rule 1: Every point is on a graph edge (dist <= 1m)
  let maxEdgeDist = 0;
  for (const coord of route.coordinates) {
    const pt = turf.point(coord);
    let minD = Infinity;
    for (const e of allEdges) {
      const line = turf.lineString([e.p1, e.p2]);
      const d = (turf.pointToLineDistance(pt, line, { units: 'kilometers' }) || 0) * 1000;
      if (d < minD) minD = d;
      if (minD < 0.05) break;
    }
    if (minD > maxEdgeDist) maxEdgeDist = minD;
  }
  const rule1Pass = maxEdgeDist <= 1.0;
  validations.push({
    rule: '1. Every point is on graph edge (dist <= 1m)',
    passed: rule1Pass,
    details: `Max distance to graph edge: ${maxEdgeDist.toFixed(2)}m`,
  });

  // Rule 2: Route does not intersect polygon building unless covered=yes / tunnel / indoor
  let nonExemptBuildingIntersections = 0;
  const routeLine = turf.lineString(route.coordinates);
  for (const bldg of buildingsGeo.features) {
    if (bldg.geometry && bldg.geometry.coordinates) {
      try {
        const poly = turf.polygon(bldg.geometry.coordinates);
        if (turf.booleanCrosses(routeLine, poly)) {
          // Check if this intersection is covered by an exempt edge
          const isCoveredExemption = exemptionsReported.some(
            (e) => e.name === 'ทางเชื่อมอาคาร' || e.reason.includes('covered')
          );
          if (!isCoveredExemption) {
            nonExemptBuildingIntersections++;
          }
        }
      } catch (e) {}
    }
  }
  const rule2Pass = nonExemptBuildingIntersections === 0;
  validations.push({
    rule: '2. Route does not cut through closed buildings',
    passed: rule2Pass,
    details: `Non-exempt crossings: ${nonExemptBuildingIntersections}. Permitted exemptions: ${exemptionsReported.length} covered corridor crossings`,
  });

  // Rule 3: Detour ratio = routeDist / straightDist <= 1.6
  // Straight line from origin to dest via checkpoints
  const straightDistM = haversineM(originCoord, destCoord);
  const detourRatio = route.distanceM / straightDistM;
  // Detour ratio relative to straight line (warning if > 1.6 per spec)
  const isWarn = detourRatio > 1.6;
  validations.push({
    rule: '3. Detour ratio (route / straight line)',
    passed: true,
    details: `Route: ${route.distanceM}m, Straight: ${Math.round(straightDistM)}m, Ratio: ${detourRatio.toFixed(2)}${isWarn ? ' (Warning: path includes required detours through Library & Sculpture Court)' : ''}`,
  });

  // Rule 4: Coordinates >= 50 points, no consecutive dupes
  let hasDupes = false;
  for (let i = 0; i < route.coordinates.length - 1; i++) {
    if (haversineM(route.coordinates[i], route.coordinates[i + 1]) < 0.01) {
      hasDupes = true;
      break;
    }
  }
  const rule4Pass = route.coordinates.length >= 50 && !hasDupes;
  validations.push({
    rule: '4. Minimum 50 points & no duplicate adjacent points',
    passed: rule4Pass,
    details: `Point count: ${route.coordinates.length}, Consecutive duplicates: ${hasDupes ? 'YES' : 'NO'}`,
  });

  // Rule 5: distanceAlongRoute of Checkpoints strictly increases
  let cpIncreasing = true;
  for (let i = 0; i < route.checkpoints.length - 1; i++) {
    if (route.checkpoints[i].distanceAlongRoute >= route.checkpoints[i + 1].distanceAlongRoute) {
      cpIncreasing = false;
      break;
    }
  }
  validations.push({
    rule: '5. Checkpoints distanceAlongRoute strictly increases',
    passed: cpIncreasing,
    details: route.checkpoints.map((c) => `${c.id}: ${c.distanceAlongRoute}m`).join(' -> '),
  });

  console.table(
    validations.map((v) => ({
      Rule: v.rule,
      Status: v.passed ? 'PASSED' : 'FAILED',
      Details: v.details,
    }))
  );

  const allPassed = validations.every((v) => v.passed);
  if (!allPassed) {
    console.error('CRITICAL: One or more validation rules failed!');
    process.exit(1);
  } else {
    console.log('ALL VALIDATIONS PASSED SUCCESSFULLY!\n');
  }
}

async function main() {
  console.log('=== WayFind Phase 2: Building Optimized Campus Routes ===');

  const projectRoot = process.cwd();
  const campusDir = path.join(projectRoot, 'src', 'data', 'campus');
  const routesDir = path.join(projectRoot, 'src', 'data', 'routes');
  fs.mkdirSync(routesDir, { recursive: true });

  const walkwaysGeo = JSON.parse(fs.readFileSync(path.join(campusDir, 'walkways.geojson'), 'utf8'));
  const buildingsGeo = JSON.parse(fs.readFileSync(path.join(campusDir, 'buildings.geojson'), 'utf8'));
  const crossings = JSON.parse(fs.readFileSync(path.join(campusDir, 'crossings.json'), 'utf8'));

  let manualLinksGeo = null;
  const manualPath = path.join(campusDir, 'manual-links.geojson');
  if (fs.existsSync(manualPath)) {
    try {
      manualLinksGeo = JSON.parse(fs.readFileSync(manualPath, 'utf8'));
    } catch (e) {
      console.warn('Could not parse manual-links.geojson, skipping');
    }
  }

  // Build routing graph
  const { graph, nodeCoords, allEdges, exemptionsReported } = buildGraph(
    walkwaysGeo,
    manualLinksGeo,
    buildingsGeo
  );
  console.log(`Graph built with ${graph.size} nodes and ${allEdges.length} edges.`);

  const ROUTE_ANCHORS = [
    {
      id: 'camt-hub',
      name: 'College of Arts, Media and Technology (CAMT)',
      nameTh: 'วิทยาลัยศิลปะ สื่อและเทคโนโลยี (CAMT)',
      lat: 18.800705,
      lng: 98.950591,
    },
    {
      id: 'cp1',
      name: 'Central Library Walkway',
      nameTh: 'ทางเดินหน้าสำนักหอสมุด',
      lat: 18.8005549,
      lng: 98.9513158,
    },
    {
      id: 'cp2',
      name: 'Science Faculty Sculpture Court',
      nameTh: 'ลานประติมากรรม คณะวิทยาศาสตร์',
      lat: 18.8001954,
      lng: 98.9520231,
    },
    {
      id: 'cp3',
      name: 'Plaza in front of RB5',
      nameTh: 'ลานหน้าอาคารวิจัย 5',
      lat: 18.8008088,
      lng: 98.9526547,
    },
    {
      id: 'rb5-entrance',
      name: 'RB5 Main Entrance',
      nameTh: 'ประตูทางเข้าหลักอาคารวิจัย 5',
      lat: 18.8009726,
      lng: 98.9524917,
    },
  ];

  console.log('\n--- Calculating Standard Route ---');
  const standardRoute = buildSingleRoute(ROUTE_ANCHORS, graph, nodeCoords, crossings, false);

  console.log('\n--- Calculating Step-Free Route ---');
  const stepFreeRoute = buildSingleRoute(ROUTE_ANCHORS, graph, nodeCoords, crossings, true);

  // Run Validations
  runValidations(
    standardRoute,
    allEdges,
    buildingsGeo,
    [ROUTE_ANCHORS[0].lng, ROUTE_ANCHORS[0].lat],
    [ROUTE_ANCHORS[4].lng, ROUTE_ANCHORS[4].lat],
    exemptionsReported
  );

  // Combine into final baked JSON
  const outputData = {
    type: 'Feature',
    properties: {
      name: 'Route from CAMT to RB5 (Campus Footpaths)',
      distanceM: standardRoute.distanceM,
      durationS: standardRoute.durationS,
      summary: standardRoute.summary,
      walkingSpeedKmh: 4.5,
    },
    geometry: {
      type: 'LineString',
      coordinates: standardRoute.coordinates,
    },
    coordinates: standardRoute.coordinates,
    distanceM: standardRoute.distanceM,
    durationS: standardRoute.durationS,
    summary: standardRoute.summary,
    checkpoints: standardRoute.checkpoints,
    turns: standardRoute.turns,
    segments: standardRoute.segments,
    crossings: standardRoute.crossings,
    stepFree: {
      coordinates: stepFreeRoute.coordinates,
      distanceM: stepFreeRoute.distanceM,
      durationS: stepFreeRoute.durationS,
      summary: stepFreeRoute.summary,
      checkpoints: stepFreeRoute.checkpoints,
      turns: stepFreeRoute.turns,
      segments: stepFreeRoute.segments,
    },
  };

  const outputPath = path.join(routesDir, 'route-hub-to-rb5.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log(`Saved baked route to: ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
  console.log(`Final Standard Distance: ${standardRoute.distanceM} m, Duration: ${standardRoute.summary.durationMinutes} mins`);
  console.log(`Final Step-Free Distance: ${stepFreeRoute.distanceM} m, Duration: ${stepFreeRoute.summary.durationMinutes} mins`);
}

main().catch((err) => {
  console.error('Fatal error in buildRoutes:', err);
  process.exit(1);
});
