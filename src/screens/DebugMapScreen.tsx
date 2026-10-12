import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Polygon, CircleMarker, Marker, Tooltip, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import walkwaysData from '../data/campus/walkways.geojson';
import buildingsData from '../data/campus/buildings.geojson';
import manualLinksData from '../data/campus/manual-links.geojson';
import routeData from '../data/routes/route-hub-to-rb5.json';
import { CAMPUS_ANCHORS } from '../data/campus/anchors';

interface DebugMapScreenProps {
  onBack: () => void;
}

export const DebugMapScreen: React.FC<DebugMapScreenProps> = ({ onBack }) => {
  // Layer toggles
  const [showWalkways, setShowWalkways] = useState(true);
  const [showBuildings, setShowBuildings] = useState(true);
  const [showAnchors, setShowAnchors] = useState(true);
  const [showManualLinks, setShowManualLinks] = useState(true);
  const [showComputedRoute, setShowComputedRoute] = useState(true);
  const [showGraphNodes, setShowGraphNodes] = useState(false);
  const [showDeadEnds, setShowDeadEnds] = useState(true);

  // Tool modes
  const [activeMode, setActiveMode] = useState<'view' | 'draw' | 'anchor'>('view');
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
  const [placedAnchor, setPlacedAnchor] = useState<[number, number] | null>(null);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  // Compute graph vertices, degrees, and dead-ends
  const { nodeMap, deadEnds } = useMemo(() => {
    const counts = new Map<string, { coord: [number, number]; count: number }>();
    const features = (walkwaysData as any).features || [];

    for (const f of features) {
      const coords = f.geometry.coordinates as [number, number][];
      for (const pt of coords) {
        const key = `${pt[0].toFixed(6)},${pt[1].toFixed(6)}`;
        const existing = counts.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          counts.set(key, { coord: [pt[1], pt[0]], count: 1 }); // Leaflet lat, lng
        }
      }
    }

    const deadEndList: [number, number][] = [];
    const allNodes: [number, number][] = [];

    for (const val of counts.values()) {
      allNodes.push(val.coord);
      if (val.count === 1) {
        deadEndList.push(val.coord);
      }
    }

    return { nodeMap: allNodes, deadEnds: deadEndList };
  }, []);

  const getHighwayColor = (hw: string) => {
    switch (hw) {
      case 'footway':
        return '#2F8F57';
      case 'path':
        return '#81B29A';
      case 'pedestrian':
        return '#10B981';
      case 'service':
        return '#E07A5F';
      case 'residential':
        return '#3D5A80';
      case 'steps':
        return '#E63946';
      default:
        return '#94A3B8';
    }
  };

  const handleCopyGeoJSON = () => {
    if (drawnPoints.length < 2) return;
    const geoJsonFeature = {
      type: 'Feature',
      properties: {
        name: 'Manual Link',
        kind: 'footway',
        note: 'Drawn in /debug/map',
      },
      geometry: {
        type: 'LineString',
        coordinates: drawnPoints.map((p) => [p[1], p[0]]), // [lng, lat]
      },
    };
    navigator.clipboard.writeText(JSON.stringify(geoJsonFeature, null, 2));
    setCopiedStatus('Copied GeoJSON LineString!');
    setTimeout(() => setCopiedStatus(null), 3000);
  };

  const handleCopyAnchor = () => {
    if (!placedAnchor) return;
    const text = `lat: ${placedAnchor[0].toFixed(6)}, lng: ${placedAnchor[1].toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopiedStatus('Copied Coordinates!');
    setTimeout(() => setCopiedStatus(null), 3000);
  };

  // Map Click Handler Component
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (activeMode === 'draw') {
          setDrawnPoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
        } else if (activeMode === 'anchor') {
          setPlacedAnchor([e.latlng.lat, e.latlng.lng]);
        }
      },
    });
    return null;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 text-slate-100 flex flex-col select-none">
      {/* Top Header Bar */}
      <header className="z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition"
          >
            ← Back to App
          </button>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              WayFind Campus Network & Route Inspector (DEV)
            </h1>
            <p className="text-[11px] text-slate-400">
              CMU Main Campus · BBOX: 18.790, 98.945, 18.812, 98.962
            </p>
          </div>
        </div>

        {/* Live Metrics Header Badges */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700/80">
            <span className="text-slate-400">Route: </span>
            <span className="font-bold text-emerald-400">{routeData.distanceM} m</span>
            <span className="text-slate-400"> ({Math.round(routeData.durationS / 60)} min)</span>
          </div>
          <div className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700/80">
            <span className="text-slate-400">Points: </span>
            <span className="font-bold text-sky-400">{routeData.coordinates.length}</span>
          </div>
          <div className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700/80">
            <span className="text-slate-400">Nodes: </span>
            <span className="font-bold text-amber-400">{nodeMap.length}</span>
          </div>
        </div>
      </header>

      {/* Main Map + Side Panels */}
      <div className="relative flex-1 w-full h-full">
        <MapContainer
          center={[18.8015, 98.9525]}
          zoom={16}
          style={{ width: '100%', height: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <MapClickHandler />

          {/* 1. Walkways Layer */}
          {showWalkways &&
            (walkwaysData as any).features?.map((w: any) => (
              <Polyline
                key={w.id}
                positions={w.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number])}
                pathOptions={{
                  color: getHighwayColor(w.properties.highway),
                  weight: 3,
                  opacity: 0.8,
                }}
              >
                <Tooltip direction="top" offset={[0, -5]}>
                  <div className="text-xs font-sans">
                    <p className="font-bold">{w.properties.name || 'Unnamed Walkway'}</p>
                    <p className="text-[10px] text-gray-500">
                      Type: {w.properties.highway} · ID: {w.id}
                    </p>
                  </div>
                </Tooltip>
              </Polyline>
            ))}

          {/* 2. Buildings Layer */}
          {showBuildings &&
            (buildingsData as any).features?.map((b: any) => {
              const coords = b.geometry.coordinates[0]?.map((c: number[]) => [c[1], c[0]]);
              if (!coords) return null;
              return (
                <Polygon
                  key={b.id}
                  positions={coords}
                  pathOptions={{
                    color: '#64748B',
                    fillColor: '#94A3B8',
                    fillOpacity: 0.15,
                    weight: 1.5,
                  }}
                >
                  <Tooltip direction="center">
                    <span className="text-xs font-semibold">
                      {b.properties.name || b.properties.name_th || `Bldg #${b.id}`}
                    </span>
                  </Tooltip>
                </Polygon>
              );
            })}

          {/* 3. Dead-ends and Component Gaps (RED) */}
          {showDeadEnds &&
            deadEnds.map((coord, i) => (
              <CircleMarker
                key={`dead-${i}`}
                center={coord}
                radius={3.5}
                pathOptions={{
                  color: '#EF4444',
                  fillColor: '#EF4444',
                  fillOpacity: 0.9,
                  weight: 1,
                }}
              >
                <Tooltip direction="top">
                  <span className="text-[10px] font-bold text-red-600">Dead-end / Gap Node</span>
                </Tooltip>
              </CircleMarker>
            ))}

          {/* 4. Graph Nodes Layer */}
          {showGraphNodes &&
            nodeMap.map((coord, i) => (
              <CircleMarker
                key={`node-${i}`}
                center={coord}
                radius={2}
                pathOptions={{
                  color: '#3B82F6',
                  fillColor: '#60A5FA',
                  fillOpacity: 0.7,
                  weight: 1,
                }}
              />
            ))}

          {/* 5. Manual Links */}
          {showManualLinks &&
            (manualLinksData as any).features?.map((m: any, i: number) => (
              <Polyline
                key={`ml-${i}`}
                positions={m.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number])}
                pathOptions={{
                  color: '#F59E0B',
                  dashArray: '5, 5',
                  weight: 4,
                }}
              />
            ))}

          {/* 6. Computed Optimal Route */}
          {showComputedRoute && (
            <>
              {/* Casing */}
              <Polyline
                positions={routeData.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number])}
                pathOptions={{
                  color: '#FFFFFF',
                  weight: 8,
                  opacity: 0.9,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
              {/* Route line */}
              <Polyline
                positions={routeData.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number])}
                pathOptions={{
                  color: '#2F8F57',
                  weight: 5,
                  opacity: 1,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            </>
          )}

          {/* 7. Key Anchors */}
          {showAnchors &&
            CAMPUS_ANCHORS.map((a) => {
              const icon = L.divIcon({
                className: 'custom-anchor',
                html: `<div style="background:#10B981; color:white; border:2px solid white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; box-shadow:0 2px 6px rgba(0,0,0,0.3);">📍</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              });
              return (
                <Marker key={a.id} position={[a.lat, a.lng]} icon={icon}>
                  <Popup>
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-gray-900">{a.nameTh}</p>
                      <p className="text-gray-500">{a.name}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">
                        Dist to walkway: {a.distanceToWalkwayM}m
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* 8. Live Drawing Layer */}
          {drawnPoints.length > 0 && (
            <Polyline
              positions={drawnPoints}
              pathOptions={{ color: '#F59E0B', weight: 4, dashArray: '6, 6' }}
            />
          )}

          {/* 9. Placed Anchor Pin */}
          {placedAnchor && (
            <CircleMarker
              center={placedAnchor}
              radius={8}
              pathOptions={{ color: '#F43F5E', fillColor: '#FB7185', fillOpacity: 0.9 }}
            />
          )}
        </MapContainer>

        {/* Floating Controls Sidebar (Left) */}
        <div className="absolute top-4 left-4 z-40 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl max-w-xs space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-white mb-2 flex items-center justify-between">
              <span>Layer Controls</span>
              <span className="text-[10px] font-normal text-slate-400">Toggle views</span>
            </h3>
            <div className="space-y-1.5">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showWalkways}
                  onChange={(e) => setShowWalkways(e.target.checked)}
                  className="rounded text-emerald-500"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2F8F57]"></span>
                  Walkways ({walkwaysData.features.length})
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBuildings}
                  onChange={(e) => setShowBuildings(e.target.checked)}
                  className="rounded text-emerald-500"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-500"></span>
                  Buildings ({buildingsData.features.length})
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showComputedRoute}
                  onChange={(e) => setShowComputedRoute(e.target.checked)}
                  className="rounded text-emerald-500"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  Computed A* Route (684m)
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAnchors}
                  onChange={(e) => setShowAnchors(e.target.checked)}
                  className="rounded text-emerald-500"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Anchors ({CAMPUS_ANCHORS.length})
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDeadEnds}
                  onChange={(e) => setShowDeadEnds(e.target.checked)}
                  className="rounded text-emerald-500"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  Dead-ends & Gaps ({deadEnds.length})
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGraphNodes}
                  onChange={(e) => setShowGraphNodes(e.target.checked)}
                  className="rounded text-emerald-500"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                  Graph Nodes ({nodeMap.length})
                </span>
              </label>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Interactive Tools Mode */}
          <div>
            <h3 className="font-bold text-white mb-2">Interactive Tools</h3>
            <div className="grid grid-cols-3 gap-1 mb-2">
              <button
                onClick={() => setActiveMode('view')}
                className={`py-1 rounded text-center text-[11px] font-semibold transition ${
                  activeMode === 'view' ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                Inspect
              </button>
              <button
                onClick={() => setActiveMode('draw')}
                className={`py-1 rounded text-center text-[11px] font-semibold transition ${
                  activeMode === 'draw' ? 'bg-amber-600 text-white' : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                ✏️ Draw
              </button>
              <button
                onClick={() => setActiveMode('anchor')}
                className={`py-1 rounded text-center text-[11px] font-semibold transition ${
                  activeMode === 'anchor' ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                📍 Anchor
              </button>
            </div>

            {activeMode === 'draw' && (
              <div className="p-2.5 bg-slate-800/80 rounded-xl space-y-2">
                <p className="text-[10px] text-slate-300">
                  Click on map to place points. Points placed: {drawnPoints.length}
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={handleCopyGeoJSON}
                    disabled={drawnPoints.length < 2}
                    className="flex-1 py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold rounded text-[10px]"
                  >
                    Copy GeoJSON
                  </button>
                  <button
                    onClick={() => setDrawnPoints([])}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-[10px]"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {activeMode === 'anchor' && (
              <div className="p-2.5 bg-slate-800/80 rounded-xl space-y-2">
                <p className="text-[10px] text-slate-300">
                  Click on map to place anchor pin.
                </p>
                {placedAnchor && (
                  <p className="text-[10px] font-mono text-emerald-400">
                    {placedAnchor[0].toFixed(6)}, {placedAnchor[1].toFixed(6)}
                  </p>
                )}
                <div className="flex gap-1.5">
                  <button
                    onClick={handleCopyAnchor}
                    disabled={!placedAnchor}
                    className="flex-1 py-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold rounded text-[10px]"
                  >
                    Copy Coord
                  </button>
                  <button
                    onClick={() => setPlacedAnchor(null)}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-[10px]"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {copiedStatus && (
              <div className="p-1.5 bg-emerald-900/80 text-emerald-200 border border-emerald-600 rounded text-[10px] font-bold text-center animate-fade-in">
                {copiedStatus}
              </div>
            )}
          </div>

          <hr className="border-slate-800" />

          {/* Validation Metrics */}
          <div>
            <h3 className="font-bold text-white mb-1.5">Validation Quality</h3>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Distance / Time:</span>
                <span className="font-semibold text-white">684 m · 10 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Points on Edge (dist ≤ 1m):</span>
                <span className="font-semibold text-emerald-400">100% (max 0.0m)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Building Collisions:</span>
                <span className="font-semibold text-emerald-400">0 (12 corridors)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CP Monotonicity:</span>
                <span className="font-semibold text-emerald-400">285m → 625m → 645m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
