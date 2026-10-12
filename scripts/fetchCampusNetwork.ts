import fs from 'fs';
import path from 'path';
import https from 'https';

// Campus Bounding Box: CMU Main Campus (Suan Sak)
// South: 18.790, West: 98.945, North: 18.812, East: 98.962
export const CAMPUS_BBOX = {
  south: 18.790,
  west: 98.945,
  north: 18.812,
  east: 98.962,
};

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const OSM_MAP_ENDPOINT = `https://api.openstreetmap.org/api/0.6/map?bbox=${CAMPUS_BBOX.west},${CAMPUS_BBOX.south},${CAMPUS_BBOX.east},${CAMPUS_BBOX.north}`;

const USER_AGENT = 'WayFind-CampusNavigation/1.0 (UX-Study CMU Navigation)';

interface OSMNode {
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

interface OverpassRawData {
  version: number;
  generator: string;
  osm3s?: Record<string, any>;
  elements: Array<{
    type: 'node' | 'way';
    id: number;
    lat?: number;
    lon?: number;
    nodes?: number[];
    geometry?: Array<{ lat: number; lon: number }>;
    tags?: Record<string, string>;
  }>;
}

export function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function requestUrl(url: string, postData?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options: https.RequestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: postData ? 'POST' : 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        ...(postData
          ? {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': Buffer.byteLength(postData),
              Accept: 'application/json',
            }
          : {
              Accept: '*/*',
            }),
      },
      timeout: 90000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 300)}`));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('Request timeout after 90s'));
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function parseOsmXmlToOverpassJson(xml: string): OverpassRawData {
  console.log('Parsing OSM XML to Overpass JSON format...');
  const nodeMap = new Map<number, OSMNode>();
  const elements: OverpassRawData['elements'] = [];

  const nodeRegex = /<node id="(\d+)"[^>]*lat="([0-9.-]+)" lon="([0-9.-]+)"(?:[^>]*\/>|>([\s\S]*?)<\/node>)/g;
  let match: RegExpExecArray | null;
  while ((match = nodeRegex.exec(xml)) !== null) {
    const id = parseInt(match[1]);
    const lat = parseFloat(match[2]);
    const lon = parseFloat(match[3]);
    const inner = match[4];
    const tags: Record<string, string> = {};
    if (inner) {
      const tagRegex = /<tag k="([^"]+)" v="([^"]*)"\/>/g;
      let tMatch: RegExpExecArray | null;
      while ((tMatch = tagRegex.exec(inner)) !== null) {
        tags[tMatch[1]] = tMatch[2];
      }
    }
    const nodeObj: OSMNode = { id, lat, lon, ...(Object.keys(tags).length > 0 ? { tags } : {}) };
    nodeMap.set(id, nodeObj);
    elements.push({ type: 'node', ...nodeObj });
  }

  const wayRegex = /<way id="(\d+)"[\s\S]*?>([\s\S]*?)<\/way>/g;
  while ((match = wayRegex.exec(xml)) !== null) {
    const id = parseInt(match[1]);
    const inner = match[2];
    const nodes: number[] = [];
    const ndRegex = /<nd ref="(\d+)"\/>/g;
    let ndMatch: RegExpExecArray | null;
    while ((ndMatch = ndRegex.exec(inner)) !== null) {
      nodes.push(parseInt(ndMatch[1]));
    }
    const tags: Record<string, string> = {};
    const tagRegex = /<tag k="([^"]+)" v="([^"]*)"\/>/g;
    let tMatch: RegExpExecArray | null;
    while ((tMatch = tagRegex.exec(inner)) !== null) {
      tags[tMatch[1]] = tMatch[2];
    }

    const geometry: Array<{ lat: number; lon: number }> = [];
    for (const nd of nodes) {
      const n = nodeMap.get(nd);
      if (n) {
        geometry.push({ lat: n.lat, lon: n.lon });
      }
    }

    elements.push({
      type: 'way',
      id,
      nodes,
      geometry,
      ...(Object.keys(tags).length > 0 ? { tags } : {}),
    });
  }

  return {
    version: 0.6,
    generator: 'OpenStreetMap API direct fallback parser',
    elements,
  };
}

async function fetchRawData(): Promise<OverpassRawData> {
  const overpassQuery = `[out:json][timeout:90];
(
  way(${CAMPUS_BBOX.south},${CAMPUS_BBOX.west},${CAMPUS_BBOX.north},${CAMPUS_BBOX.east})["highway"~"^(footway|path|pedestrian|steps|cycleway|track|service|living_street|residential|unclassified|tertiary|secondary|primary)$"];
  way(${CAMPUS_BBOX.south},${CAMPUS_BBOX.west},${CAMPUS_BBOX.north},${CAMPUS_BBOX.east})["building"];
  node(${CAMPUS_BBOX.south},${CAMPUS_BBOX.west},${CAMPUS_BBOX.north},${CAMPUS_BBOX.east})["highway"="crossing"];
  node(${CAMPUS_BBOX.south},${CAMPUS_BBOX.west},${CAMPUS_BBOX.north},${CAMPUS_BBOX.east})["name"];
);
out geom;`;

  // 1. Try Overpass endpoints with retry
  for (const endpoint of OVERPASS_ENDPOINTS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Attempt ${attempt}] Querying Overpass endpoint: ${endpoint}`);
        const postData = `data=${encodeURIComponent(overpassQuery)}`;
        const resText = await requestUrl(endpoint, postData);
        if (resText.startsWith('{') && resText.includes('"elements"')) {
          console.log(`Successfully fetched from ${endpoint}!`);
          return JSON.parse(resText) as OverpassRawData;
        }
      } catch (err: any) {
        console.warn(`Overpass endpoint ${endpoint} failed: ${err.message}`);
        await new Promise((r) => setTimeout(r, 2000 * attempt));
      }
    }
  }

  // 2. High-reliability Fallback: Official OpenStreetMap API map export
  console.log('Falling back to official OpenStreetMap API map endpoint...');
  console.log(`URL: ${OSM_MAP_ENDPOINT}`);
  const xmlData = await requestUrl(OSM_MAP_ENDPOINT);
  return parseOsmXmlToOverpassJson(xmlData);
}

async function main() {
  console.log('=== WayFind Phase 1: Fetching CMU Campus Walkways & Buildings ===');
  console.log(`BBOX: South=${CAMPUS_BBOX.south}, West=${CAMPUS_BBOX.west}, North=${CAMPUS_BBOX.north}, East=${CAMPUS_BBOX.east}`);

  const projectRoot = process.cwd();
  const dataSourceDir = path.join(projectRoot, 'data-source');
  const campusDir = path.join(projectRoot, 'src', 'data', 'campus');

  fs.mkdirSync(dataSourceDir, { recursive: true });
  fs.mkdirSync(campusDir, { recursive: true });

  // 1. Fetch raw data (or use cached if recently downloaded)
  let rawData: OverpassRawData;
  const rawPath = path.join(dataSourceDir, 'overpass-raw.json');
  if (fs.existsSync(rawPath) && fs.statSync(rawPath).size > 100000) {
    console.log(`Loading existing raw data from: ${rawPath}`);
    rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  } else {
    rawData = await fetchRawData();
    fs.writeFileSync(rawPath, JSON.stringify(rawData, null, 2));
    console.log(`Saved raw Overpass data to: ${rawPath} (${(fs.statSync(rawPath).size / 1024 / 1024).toFixed(2)} MB)`);
  }

  // Build complete node coordinate lookup (from nodes + way geometries)
  const nodeCoords = new Map<number, { lat: number; lon: number }>();
  for (const el of rawData.elements) {
    if (el.type === 'node' && el.lat !== undefined && el.lon !== undefined) {
      nodeCoords.set(el.id, { lat: el.lat, lon: el.lon });
    } else if (el.type === 'way' && el.nodes && el.geometry) {
      for (let i = 0; i < el.nodes.length; i++) {
        if (el.geometry[i]) {
          nodeCoords.set(el.nodes[i], { lat: el.geometry[i].lat, lon: el.geometry[i].lon });
        }
      }
    }
  }
  console.log(`Total unique nodes with coordinates: ${nodeCoords.size}`);

  // 2. Extract Walkways
  const ALLOWED_HIGHWAYS = new Set([
    'footway', 'path', 'pedestrian', 'steps', 'cycleway', 'track',
    'service', 'living_street', 'residential', 'unclassified',
    'tertiary', 'secondary', 'primary',
  ]);

  const highwayWays: OverpassRawData['elements'] = [];
  const highwayCounts: Record<string, number> = {};
  let totalLengthM = 0;

  for (const el of rawData.elements) {
    if (el.type === 'way' && el.tags && el.tags.highway) {
      const hw = el.tags.highway;
      if (!ALLOWED_HIGHWAYS.has(hw)) continue;

      // Filter out prohibited foot paths
      const foot = el.tags.foot;
      const access = el.tags.access;
      if (foot === 'no') continue;
      if (access === 'private' || access === 'no') continue;

      highwayCounts[hw] = (highwayCounts[hw] || 0) + 1;
      highwayWays.push(el);

      const coords = el.geometry || (el.nodes ? el.nodes.map(nid => {
        const n = nodeCoords.get(nid);
        return n ? { lat: n.lat, lon: n.lon } : null;
      }).filter((c): c is { lat: number; lon: number } => c !== null) : []);

      for (let i = 0; i < coords.length - 1; i++) {
        totalLengthM += haversineMeters(coords[i].lat, coords[i].lon, coords[i + 1].lat, coords[i + 1].lon);
      }
    }
  }

  // Walkways GeoJSON
  const walkwaysGeojson = {
    type: 'FeatureCollection',
    name: 'walkways',
    features: highwayWays.map((w) => {
      const coords = w.geometry
        ? w.geometry.map((pt) => [pt.lon, pt.lat])
        : (w.nodes || [])
            .map((nid) => {
              const n = nodeCoords.get(nid);
              return n ? [n.lon, n.lat] : null;
            })
            .filter((c): c is [number, number] => c !== null);

      return {
        type: 'Feature',
        id: w.id,
        properties: {
          id: w.id,
          highway: w.tags?.highway,
          name: w.tags?.name || '',
          name_en: w.tags?.['name:en'] || '',
          surface: w.tags?.surface || '',
          covered: w.tags?.covered || '',
          bridge: w.tags?.bridge || '',
          tunnel: w.tags?.tunnel || '',
          layer: w.tags?.layer || '0',
          nodes: w.nodes || [],
        },
        geometry: {
          type: 'LineString',
          coordinates: coords,
        },
      };
    }),
  };

  const walkwaysPath = path.join(campusDir, 'walkways.geojson');
  fs.writeFileSync(walkwaysPath, JSON.stringify(walkwaysGeojson, null, 2));
  console.log(`Saved walkways GeoJSON: ${walkwaysPath} (${walkwaysGeojson.features.length} features, ${(totalLengthM / 1000).toFixed(2)} km)`);

  // 3. Extract Buildings
  const buildingWays = rawData.elements.filter(
    (el) => el.type === 'way' && el.tags && el.tags.building
  );

  const buildingsGeojson = {
    type: 'FeatureCollection',
    name: 'buildings',
    features: buildingWays.map((b) => {
      const coords = b.geometry
        ? b.geometry.map((pt) => [pt.lon, pt.lat])
        : (b.nodes || [])
            .map((nid) => {
              const n = nodeCoords.get(nid);
              return n ? [n.lon, n.lat] : null;
            })
            .filter((c): c is [number, number] => c !== null);

      // Ensure closed polygon
      if (coords.length > 0 && (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])) {
        coords.push(coords[0]);
      }

      return {
        type: 'Feature',
        id: b.id,
        properties: {
          id: b.id,
          building: b.tags?.building,
          name: b.tags?.name || '',
          name_th: b.tags?.['name:th'] || b.tags?.name || '',
          name_en: b.tags?.['name:en'] || '',
          ref: b.tags?.ref || '',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [coords],
        },
      };
    }),
  };

  const buildingsPath = path.join(campusDir, 'buildings.geojson');
  fs.writeFileSync(buildingsPath, JSON.stringify(buildingsGeojson, null, 2));
  console.log(`Saved buildings GeoJSON: ${buildingsPath} (${buildingsGeojson.features.length} buildings)`);

  // 4. Extract Crossings
  const crossings = rawData.elements.filter(
    (el) => el.type === 'node' && el.tags && el.tags.highway === 'crossing'
  );

  const crossingsData = crossings.map((c) => ({
    id: c.id,
    lat: c.lat,
    lon: c.lon,
    name: c.tags?.name || '',
    crossing: c.tags?.crossing || '',
  }));

  const crossingsPath = path.join(campusDir, 'crossings.json');
  fs.writeFileSync(crossingsPath, JSON.stringify(crossingsData, null, 2));
  console.log(`Saved crossings: ${crossingsPath} (${crossingsData.length} crossings)`);

  // 5. Extract Named Places
  const namedPlaces = rawData.elements
    .filter((el) => el.tags && (el.tags.name || el.tags['name:th'] || el.tags['name:en']))
    .map((el) => ({
      type: el.type,
      id: el.id,
      name: el.tags?.name || '',
      name_th: el.tags?.['name:th'] || '',
      name_en: el.tags?.['name:en'] || '',
      category: el.tags?.amenity || el.tags?.leisure || el.tags?.shop || el.tags?.office || el.tags?.building || '',
      lat: el.lat || (el.geometry ? el.geometry[0]?.lat : undefined),
      lon: el.lon || (el.geometry ? el.geometry[0]?.lon : undefined),
    }));

  const namedPlacesPath = path.join(campusDir, 'named-places.json');
  fs.writeFileSync(namedPlacesPath, JSON.stringify(namedPlaces, null, 2));
  console.log(`Saved named places: ${namedPlacesPath} (${namedPlaces.length} places)`);

  // 6. Connected Components Analysis
  console.log('\n--- Analyzing Connected Components ---');
  const adj = new Map<number, Set<number>>();
  for (const w of highwayWays) {
    const nds = w.nodes || [];
    for (let i = 0; i < nds.length - 1; i++) {
      const u = nds[i];
      const v = nds[i + 1];
      if (!adj.has(u)) adj.set(u, new Set());
      if (!adj.has(v)) adj.set(v, new Set());
      adj.get(u)!.add(v);
      adj.get(v)!.add(u);
    }
  }

  const visited = new Set<number>();
  const components: Array<Set<number>> = [];
  for (const node of adj.keys()) {
    if (!visited.has(node)) {
      const comp = new Set<number>();
      const queue = [node];
      visited.add(node);
      while (queue.length > 0) {
        const curr = queue.shift()!;
        comp.add(curr);
        const neighbors = adj.get(curr) || new Set();
        for (const n of neighbors) {
          if (!visited.has(n)) {
            visited.add(n);
            queue.push(n);
          }
        }
      }
      components.push(comp);
    }
  }

  components.sort((a, b) => b.size - a.size);
  console.log(`Total Walkway Graph Nodes: ${adj.size}`);
  console.log(`Total Connected Components: ${components.length}`);
  console.log(`Largest Component: ${components[0]?.size || 0} nodes (${((components[0]?.size || 0) / adj.size * 100).toFixed(1)}% of all nodes)`);

  // 7. Verify Anchors
  console.log('\n--- Verifying Key Anchors ---');
  const mainComponent = components[0] || new Set();

  const ANCHORS_DEF = [
    {
      id: 'student-hub',
      name: 'Student Hub (อมช.)',
      nameTh: 'ศูนย์อาหารและกิจกรรมนักศึกษา (อมช.)',
      lat: 18.802162,
      lng: 98.952575,
      osmNodeId: 2105872906,
      source: 'osm' as const,
      needsVerification: false,
      distanceToWalkwayM: 0,
      inMainComponent: true,
    },
    {
      id: 'cmu-library',
      name: 'Central Library',
      nameTh: 'สำนักหอสมุดมหาวิทยาลัยเชียงใหม่',
      lat: 18.801217,
      lng: 98.951847,
      osmNodeId: 13545183848,
      source: 'osm' as const,
      needsVerification: false,
      distanceToWalkwayM: 0,
      inMainComponent: true,
    },
    {
      id: 'science-sculpture',
      name: 'Faculty of Science Sculpture Lawn',
      nameTh: 'ลานประติมากรรม คณะวิทยาศาสตร์',
      lat: 18.801442,
      lng: 98.952763,
      osmNodeId: 13546428824,
      source: 'osm' as const,
      needsVerification: false,
      distanceToWalkwayM: 0,
      inMainComponent: true,
    },
    {
      id: 'rb5-building',
      name: 'Research Building 5 (RB5)',
      nameTh: 'อาคารวิจัย 5 (RB5)',
      lat: 18.800954,
      lng: 98.952463,
      osmNodeId: 13545183847,
      source: 'osm' as const,
      needsVerification: false,
      distanceToWalkwayM: 0,
      inMainComponent: true,
    },
    {
      id: 'rb5-main-entrance',
      name: 'RB5 Main Entrance (Front Plaza)',
      nameTh: 'ทางเข้าหลักอาคารวิจัย 5 (ลานหน้าอาคาร)',
      lat: 18.800972,
      lng: 98.952491,
      osmNodeId: 13545183847,
      source: 'osm' as const,
      needsVerification: false,
      distanceToWalkwayM: 0,
      inMainComponent: true,
    },
  ];

  for (const anchor of ANCHORS_DEF) {
    let minDist = Infinity;
    let closestNodeId = -1;
    let inMainComp = false;

    for (const [nid, pos] of nodeCoords.entries()) {
      if (adj.has(nid)) {
        const d = haversineMeters(anchor.lat, anchor.lng, pos.lat, pos.lon);
        if (d < minDist) {
          minDist = d;
          closestNodeId = nid;
          inMainComp = mainComponent.has(nid);
        }
      }
    }

    anchor.osmNodeId = closestNodeId;
    anchor.distanceToWalkwayM = parseFloat(minDist.toFixed(1));
    anchor.inMainComponent = inMainComp;

    console.log(
      `Anchor: "${anchor.nameTh}" -> Closest node: ${closestNodeId}, Distance: ${minDist.toFixed(1)}m, In Main Component: ${inMainComp ? 'YES' : 'NO'}`
    );
  }

  // 8. Generate anchors.ts
  const anchorsContent = `// Auto-generated by scripts/fetchCampusNetwork.ts - Phase 1
export interface CampusAnchor {
  id: string;
  name: string;
  nameTh: string;
  lat: number;
  lng: number;
  osmNodeId?: number;
  distanceToWalkwayM: number;
  inMainComponent: boolean;
  source: 'osm' | 'manual' | 'placeholder';
  needsVerification: boolean;
  note?: string;
}

export const CAMPUS_ANCHORS: CampusAnchor[] = ${JSON.stringify(ANCHORS_DEF, null, 2)};
`;

  const anchorsPath = path.join(campusDir, 'anchors.ts');
  fs.writeFileSync(anchorsPath, anchorsContent);
  console.log(`Saved anchors to: ${anchorsPath}`);

  // 9. Create manual-links.geojson template if not exists
  const manualLinksPath = path.join(campusDir, 'manual-links.geojson');
  if (!fs.existsSync(manualLinksPath)) {
    const manualLinksInitial = {
      type: 'FeatureCollection',
      name: 'manual-links',
      features: [],
    };
    fs.writeFileSync(manualLinksPath, JSON.stringify(manualLinksInitial, null, 2));
    console.log(`Created template: ${manualLinksPath}`);
  }

  // 10. Summary report
  console.log('\n=== Summary Metrics ===');
  console.log('Highway ways count by type:');
  console.table(highwayCounts);
  console.log(`Total Walkways Length: ${(totalLengthM / 1000).toFixed(2)} km`);
  console.log(`Total Buildings: ${buildingsGeojson.features.length}`);
  console.log(`Total Crossings: ${crossingsData.length}`);
  console.log(`Total Named Places: ${namedPlaces.length}`);
  console.log(`Connected Components: ${components.length}`);
}

main().catch((err) => {
  console.error('Fatal error in fetchCampusNetwork:', err);
  process.exit(1);
});
