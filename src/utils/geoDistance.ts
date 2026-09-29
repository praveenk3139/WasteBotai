/**
 * Real Geographical & Distance Utilities for Campus Waste and Lost-and-Found tracking
 */

export interface GeoPoint {
  lat: number;
  lng: number;
}

// Default University Campus Center (Tech & Academic Campus Zone)
export const DEFAULT_CAMPUS_CENTER: GeoPoint = {
  lat: 13.0108,
  lng: 80.2355,
};

// Default User Initial Position (e.g. Campus Student Center Plaza)
export const DEFAULT_USER_LOCATION: GeoPoint = {
  lat: 13.0102,
  lng: 80.2352,
};

/**
 * Calculates Great-circle distance between two points in meters using the Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's mean radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Human-readable distance formatter
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Estimates pedestrian walking time based on standard 4.8 km/h (80 m/min) campus pace
 */
export function estimateWalkingTime(meters: number): string {
  const minutes = Math.max(1, Math.round(meters / 80));
  if (minutes === 1) return '1 min walk';
  return `${minutes} mins walk`;
}

/**
 * Compass direction bearing (N, NE, E, SE, S, SW, W, NW)
 */
export function getCompassDirection(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  let brng = (toDeg(Math.atan2(y, x)) + 360) % 360;
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(brng / 45) % 8;
  return directions[index];
}
