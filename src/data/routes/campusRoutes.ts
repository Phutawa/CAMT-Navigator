import allRoutesJson from './campus-routes.json';
import defaultRb5Route from './route-hub-to-rb5.json';
import { BuildingInfo } from '../campusData';

export interface CampusRouteData {
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
  checkpoints: Array<{
    id: string;
    name: string;
    nameTh: string;
    distanceAlongRoute: number;
    coordinates: [number, number];
    lat?: number;
    lng?: number;
  }>;
  turns: Array<{
    type: string;
    text: string;
    distanceAlongRoute: number;
    coordinates: [number, number];
  }>;
}

const routesDatabase: Record<string, CampusRouteData> = allRoutesJson as any;

/**
 * Returns the exact optimal route along the campus road and walkway network
 * for any given destination building.
 */
export function getRouteForDestination(targetBuilding?: BuildingInfo | null): CampusRouteData {
  if (!targetBuilding) {
    return defaultRb5Route as any;
  }

  // Check by building ID
  if (targetBuilding.id && routesDatabase[targetBuilding.id]) {
    return routesDatabase[targetBuilding.id];
  }

  // Check by building code
  if (targetBuilding.code && routesDatabase[targetBuilding.code]) {
    return routesDatabase[targetBuilding.code];
  }

  // Check by lower-cased code or id
  const idLower = (targetBuilding.id || '').toLowerCase();
  const codeLower = (targetBuilding.code || '').toLowerCase();
  if (routesDatabase[idLower]) return routesDatabase[idLower];
  if (routesDatabase[codeLower]) return routesDatabase[codeLower];

  // Check by aliases
  if (targetBuilding.aliases) {
    for (const alias of targetBuilding.aliases) {
      if (routesDatabase[alias]) return routesDatabase[alias];
      if (routesDatabase[alias.toLowerCase()]) return routesDatabase[alias.toLowerCase()];
    }
  }

  // Default to RB5 route if not found
  return defaultRb5Route as any;
}

export { allRoutesJson };
