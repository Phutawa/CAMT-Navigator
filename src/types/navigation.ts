export type ScreenId =
  | 'splash'
  | 'home'
  | 'search'
  | 'starting-point'
  | 'route-preview'
  | 'outdoor-nav'
  | 'threshold-transition'
  | 'indoor-nav'
  | 'arrival'
  | 'profile';

export type TravelMode = 'walk' | 'car' | 'motorbike' | 'bus';

export interface RoomInfo {
  code: string;
  name: string;
  wing: string;
  floor: number;
  isTarget?: boolean;
  hasBackDoor?: boolean;
}

export interface BuildingInfo {
  id: string;
  code: string;
  name: string;
  nameTh?: string;
  faculty: string;
  zone: string;
  distance: string;
  walkTime: string;
  imageUrl: string;
  lat?: number;
  lng?: number;
  floors: number[];
  rooms: RoomInfo[];
  elevatorsAvailable: boolean;
  hours: string;
  cmuNumber?: number; // Corresponding number from CMU Map (1-20 or office 1-19)
  category?: 'faculty' | 'central' | 'landmark' | 'hall' | 'sports';
  coords?: { x: number; y: number }; // Map coordinate point in SVG
  aliases?: string[];
}

export interface VisualCheckpoint {
  id: string;
  number: number;
  title: string;
  description: string;
  distanceAhead: string;
  imageUrl: string;
  lat?: number;
  lng?: number;
  status: 'active' | 'upcoming' | 'goal';
}

export interface UserPreferences {
  stepFree: boolean;
  voiceGuidance: boolean;
  defaultTravelMode: TravelMode;
  navAlerts: boolean;
  gpsAllowed: boolean;
}
