import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { CMU_BUILDINGS } from '../data/campusData';
import { BuildingInfo, TravelMode } from '../types/navigation';
import { getRouteForDestination } from '../data/routes/campusRoutes';
import busRouteData from '../data/routes/route-bus-to-rb5.json';
import 'leaflet/dist/leaflet.css';

interface CampusVectorMapProps {
  showRoute?: boolean;
  routeType?: 'preview-dash' | 'active-glow' | 'outdoor-turn';
  travelMode?: TravelMode;
  userLocation?: { x: number; y: number } | { lat: number; lng: number };
  targetBuilding?: BuildingInfo | null;
  selectedBuildingId?: string;
  onSelectBuilding?: (building: BuildingInfo) => void;
  showLayersControl?: boolean;
  showCompassControl?: boolean;
  showZoomControl?: boolean;
  onLayerToggle?: () => void;
  onRecenter?: () => void;
  interactive?: boolean;
  activeCheckpointIndex?: number;
  onCenterChange?: (center: { lat: number; lng: number }) => void;
}

// Map center adjustment
const MapController = ({
  targetBuilding,
  userLocation,
  showRoute,
  positions,
}: {
  targetBuilding?: BuildingInfo | null;
  userLocation?: any;
  showRoute?: boolean;
  positions?: [number, number][];
}) => {
  const map = useMap();
  useEffect(() => {
    if (showRoute && positions && positions.length > 0) {
      try {
        const bounds = L.latLngBounds(positions);
        map.fitBounds(bounds, {
          paddingTopLeft: [30, 60],
          paddingBottomRight: [30, 260],
          maxZoom: 17,
          animate: true,
        });
      } catch (e) {
        console.warn('fitBounds error:', e);
      }
    } else if (targetBuilding?.lat && targetBuilding?.lng) {
      map.flyTo([targetBuilding.lat, targetBuilding.lng], 16, { duration: 1.5 });
    } else if (userLocation && 'lat' in userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 1.5 });
    }
  }, [targetBuilding, userLocation, showRoute, positions, map]);
  return null;
};

const MapEvents = ({ onCenterChange }: { onCenterChange?: (c: { lat: number; lng: number }) => void }) => {
  useMapEvents({
    moveend: (e: any) => {
      if (onCenterChange) {
        const center = e.target.getCenter();
        onCenterChange({ lat: center.lat, lng: center.lng });
      }
    }
  });
  return null;
};

export const CampusVectorMap: React.FC<CampusVectorMapProps> = ({
  showRoute,
  targetBuilding,
  userLocation,
  travelMode,
  onSelectBuilding,
  routeType,
  activeCheckpointIndex,
  showLayersControl,
  showCompassControl,
  showZoomControl,
  onCenterChange,
}) => {
  // Default Center (Student Hub)
  const defaultCenter: [number, number] = [18.802162, 98.952575];

  const createIcon = (color: string, iconStr: string) => {
    const markerHtmlStyles = `
      background-color: ${color};
      width: 32px;
      height: 32px;
      display: block;
      left: -16px;
      top: -32px;
      position: relative;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    const iconHtml = `<div style="transform: rotate(45deg); font-size: 14px;">${iconStr}</div>`;
    
    return L.divIcon({
      className: 'custom-pin-real',
      html: `<span style="${markerHtmlStyles}">${iconHtml}</span>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
  };

  const userIcon = L.divIcon({
    className: 'user-pin',
    html: `<div style="width: 16px; height: 16px; background-color: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  const createCheckpointIcon = (index: number, isActive: boolean) => {
    return L.divIcon({
      className: 'checkpoint-pin',
      html: `
        <div style="
          background-color: ${isActive ? '#EA580C' : '#F97316'};
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 11px;
          transform: translate(-12px, -12px);
          ${isActive ? 'outline: 3px solid rgba(234, 88, 12, 0.4);' : ''}
        ">
          ${index}
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  };

  const createBusStopIcon = (label: string, isDropoff: boolean) => {
    return L.divIcon({
      className: 'bus-stop-pin',
      html: `
        <div style="
          background-color: ${isDropoff ? '#0284C7' : '#0D9488'};
          color: white;
          padding: 3px 8px;
          border-radius: 12px;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 800;
          font-size: 11px;
          white-space: nowrap;
          transform: translate(-50%, -50%);
          ${isDropoff ? 'outline: 3px solid rgba(2, 132, 199, 0.4);' : ''}
        ">
          <span style="font-size: 12px;">🚏</span>
          <span>${label}</span>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  };

  const isRB5Target = !targetBuilding || targetBuilding.code === 'RB5' || targetBuilding.id === 'cmu-rb5';
  const activeRouteData = getRouteForDestination(targetBuilding);
  const rawCoords = activeRouteData.coordinates || (activeRouteData as any).geometry?.coordinates || [];
  const routePositions: [number, number][] = [
    ...(userLocation && 'lat' in userLocation && typeof userLocation.lat === 'number'
      ? [[userLocation.lat, userLocation.lng] as [number, number]]
      : []),
    ...rawCoords.map((pt: number[]) => [pt[1], pt[0]] as [number, number])
  ];

  // Bus mode coordinates
  const isBusMode = travelMode === 'bus' && isRB5Target;
  const busWalk1Positions: [number, number][] = isBusMode
    ? (busRouteData.legs.walkToStop.coordinates as number[][]).map((pt) => [pt[1], pt[0]] as [number, number])
    : [];
  const busRidePositions: [number, number][] = isBusMode
    ? (busRouteData.legs.busRide.coordinates as number[][]).map((pt) => [pt[1], pt[0]] as [number, number])
    : [];
  const busWalk2Positions: [number, number][] = isBusMode
    ? (busRouteData.legs.walkToDest.coordinates as number[][]).map((pt) => [pt[1], pt[0]] as [number, number])
    : [];
  const allBusPositions: [number, number][] = isBusMode
    ? [...busWalk1Positions, ...busRidePositions, ...busWalk2Positions]
    : [];

  const effectivePositions = isBusMode ? allBusPositions : routePositions;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
      <MapContainer 
        center={defaultCenter} 
        zoom={15} 
        zoomControl={false} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapEvents onCenterChange={onCenterChange} />
        
        {CMU_BUILDINGS.filter(b => b.lat && b.lng).map((building) => {
          const isSelected = !!targetBuilding && (targetBuilding.id === building.id || targetBuilding.code === building.code);
          const color = isSelected ? 'var(--primary, #3F6B4B)' : (building.category === 'service' as any ? '#2563EB' : 'var(--primary-dark, #2B4D36)');
          const iconStr = building.category === 'service' as any ? '📍' : '🎓';
          
          return (
            <Marker 
              key={building.id} 
              position={[building.lat!, building.lng!]} 
              icon={createIcon(color, iconStr)}
              eventHandlers={{
                click: () => onSelectBuilding && onSelectBuilding(building)
              }}
            >
              <Tooltip 
                permanent={isSelected} 
                direction="top" 
                offset={[0, -28]}
                className="font-sans text-xs font-semibold shadow-md rounded-lg"
              >
                <span>{building.code} • {building.nameTh || building.name}</span>
              </Tooltip>
              <Popup className="rounded-xl overflow-hidden">
                <div className="min-w-[190px] -m-3">
                  <div className="h-20 w-full bg-cover bg-center" style={{ backgroundImage: `url(${building.imageUrl})` }}></div>
                  <div className="p-3">
                    <div className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 mb-1">
                      {building.code}
                    </div>
                    <h3 className="font-bold text-sm text-gray-800 mb-0.5 leading-tight">{building.nameTh || building.name}</h3>
                    <p className="text-xs text-gray-500">{building.name}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{building.faculty}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* If targetBuilding is not in CMU_BUILDINGS, render a dedicated target pin */}
        {targetBuilding && targetBuilding.lat && targetBuilding.lng && !CMU_BUILDINGS.some(b => b.id === targetBuilding.id || b.code === targetBuilding.code) && (
          <Marker
            position={[targetBuilding.lat, targetBuilding.lng]}
            icon={createIcon('var(--primary, #3F6B4B)', '📍')}
          >
            <Tooltip
              permanent
              direction="top"
              offset={[0, -28]}
              className="font-sans text-xs font-semibold shadow-md rounded-lg"
            >
              <span>{targetBuilding.code || targetBuilding.name} • {targetBuilding.nameTh || targetBuilding.name}</span>
            </Tooltip>
          </Marker>
        )}

        {/* User Location */}
        {userLocation && 'lat' in userLocation && typeof userLocation.lat === 'number' && !isNaN(userLocation.lat) && typeof userLocation.lng === 'number' && !isNaN(userLocation.lng) && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Tooltip 
              permanent 
              direction="bottom" 
              offset={[0, 8]}
              className="font-sans text-[11px] font-bold text-blue-700 shadow-sm rounded-md"
            >
              <span>📍 จุดเริ่มต้น (CAMT)</span>
            </Tooltip>
          </Marker>
        )}

        {/* BUS MODE ROUTE: Walk to stop -> Bus Ride -> Walk from nearest stop to RB5 */}
        {showRoute && isBusMode && (
          <>
            {/* 1. Walk to Boarding Bus Stop (Dashed Green) */}
            <Polyline
              positions={busWalk1Positions}
              pathOptions={{
                color: 'var(--route, #2F8F57)',
                weight: 4,
                dashArray: '6, 6',
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />

            {/* 2. Shuttle Bus Ride along Campus Road (Cyan/Blue Solid Line) */}
            <Polyline
              positions={busRidePositions}
              pathOptions={{
                color: '#0284C7',
                weight: 12,
                opacity: 0.2,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <Polyline
              positions={busRidePositions}
              pathOptions={{
                color: '#0284C7',
                weight: 6,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />

            {/* 3. Walk from Nearest Bus Stop to RB5 (Dashed Green) */}
            <Polyline
              positions={busWalk2Positions}
              pathOptions={{
                color: 'var(--route, #2F8F57)',
                weight: 4,
                dashArray: '6, 6',
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />

            {/* Boarding Bus Stop Pin */}
            <Marker
              position={[busRouteData.properties.boardingBusStop.lat, busRouteData.properties.boardingBusStop.lng]}
              icon={createBusStopIcon('ป้ายสหกรณ์ มช. (จุดขึ้นรถ)', false)}
            >
              <Tooltip permanent direction="top" offset={[0, -14]} className="font-sans text-[11px] font-bold">
                <span>🚏 ขึ้นรถบัส มช. สาย 1 (เดิน 110 ม.)</span>
              </Tooltip>
            </Marker>

            {/* Nearest Drop-off Bus Stop Pin (Nearest to RB5!) */}
            <Marker
              position={[busRouteData.properties.nearestBusStopToDestination.lat, busRouteData.properties.nearestBusStopToDestination.lng]}
              icon={createBusStopIcon('ป้าย อ.มช. (ใกล้ RB5 ที่สุด)', true)}
            >
              <Tooltip permanent direction="top" offset={[0, -14]} className="font-sans text-[11px] font-bold">
                <span>🚏 จุดจอดใกล้ที่สุด: ป้าย อ.มช. (เดินต่อ 110 ม. ถึงตึก)</span>
              </Tooltip>
            </Marker>
          </>
        )}

        {/* STANDARD WALK ROUTE */}
        {showRoute && !isBusMode && routePositions.length > 0 && (
          <>
            {/* Outer Glow for Active Navigation */}
            {routeType === 'active-glow' && (
              <Polyline 
                positions={routePositions} 
                pathOptions={{ color: 'var(--route, #2F8F57)', weight: 14, opacity: 0.25, lineCap: 'round', lineJoin: 'round' }} 
              />
            )}
            {/* Main Route Line */}
            <Polyline 
              positions={routePositions} 
              pathOptions={{ 
                color: 'var(--route, #2F8F57)', 
                weight: 5, 
                dashArray: routeType === 'preview-dash' ? '8, 8' : undefined,
                lineCap: 'round', 
                lineJoin: 'round' 
              }} 
            />

            {/* Sequential Checkpoints along Route */}
            {activeRouteData.checkpoints?.map((cp: any, idx: number) => {
              const lat = cp.lat ?? cp.coordinates?.[1];
              const lng = cp.lng ?? cp.coordinates?.[0];
              if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;
              const isActive = activeCheckpointIndex === idx;
              return (
                <Marker
                  key={cp.id || `cp-${idx}`}
                  position={[lat, lng]}
                  icon={createCheckpointIcon(idx + 1, isActive)}
                >
                  <Tooltip direction="top" offset={[0, -14]} className="font-sans text-[11px] font-bold">
                    <span>{cp.nameTh || cp.name}</span>
                  </Tooltip>
                </Marker>
              );
            })}
          </>
        )}

        <MapController 
          targetBuilding={targetBuilding} 
          userLocation={userLocation} 
          showRoute={showRoute}
          positions={effectivePositions}
        />
      </MapContainer>
    </div>
  );
};
