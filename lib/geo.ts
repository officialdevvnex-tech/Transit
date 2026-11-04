export type Hub = { id: string; name: string; country: string; lat: number; lon: number; region: string; tz: string };

export const HUBS: Hub[] = [
  { id: 'RTM', name: 'Rotterdam', country: 'Netherlands', lat: 51.95, lon: 4.14, region: 'Europe', tz: 'Europe/Amsterdam' },
  { id: 'HAM', name: 'Hamburg', country: 'Germany', lat: 53.55, lon: 9.99, region: 'Europe', tz: 'Europe/Berlin' },
  { id: 'LHR', name: 'London', country: 'United Kingdom', lat: 51.47, lon: -0.45, region: 'Europe', tz: 'Europe/London' },
  { id: 'DXB', name: 'Dubai', country: 'UAE', lat: 25.2, lon: 55.27, region: 'Middle East', tz: 'Asia/Dubai' },
  { id: 'SIN', name: 'Singapore', country: 'Singapore', lat: 1.35, lon: 103.82, region: 'Asia Pacific', tz: 'Asia/Singapore' },
  { id: 'SHA', name: 'Shanghai', country: 'China', lat: 31.23, lon: 121.47, region: 'Asia Pacific', tz: 'Asia/Shanghai' },
  { id: 'HKG', name: 'Hong Kong', country: 'China', lat: 22.31, lon: 113.92, region: 'Asia Pacific', tz: 'Asia/Hong_Kong' },
  { id: 'NRT', name: 'Tokyo', country: 'Japan', lat: 35.55, lon: 139.78, region: 'Asia Pacific', tz: 'Asia/Tokyo' },
  { id: 'BOM', name: 'Mumbai', country: 'India', lat: 19.08, lon: 72.88, region: 'Asia Pacific', tz: 'Asia/Kolkata' },
  { id: 'SYD', name: 'Sydney', country: 'Australia', lat: -33.87, lon: 151.21, region: 'Asia Pacific', tz: 'Australia/Sydney' },
  { id: 'LAX', name: 'Los Angeles', country: 'United States', lat: 33.94, lon: -118.41, region: 'Americas', tz: 'America/Los_Angeles' },
  { id: 'ORD', name: 'Chicago', country: 'United States', lat: 41.97, lon: -87.9, region: 'Americas', tz: 'America/Chicago' },
  { id: 'JFK', name: 'New York', country: 'United States', lat: 40.64, lon: -73.78, region: 'Americas', tz: 'America/New_York' },
  { id: 'GRU', name: 'São Paulo', country: 'Brazil', lat: -23.43, lon: -46.47, region: 'Americas', tz: 'America/Sao_Paulo' },
  { id: 'JNB', name: 'Johannesburg', country: 'South Africa', lat: -26.13, lon: 28.24, region: 'Africa', tz: 'Africa/Johannesburg' },
  { id: 'LOS', name: 'Lagos', country: 'Nigeria', lat: 6.58, lon: 3.32, region: 'Africa', tz: 'Africa/Lagos' },
];

export const hubById = (id: string) => HUBS.find((h) => h.id === id);

/** Globe rotation.y that brings a longitude to face +Z (camera). */
export const lonToRotY = (lon: number) => -(lon * Math.PI) / 180;
/** Globe rotation.x that tilts a latitude toward the camera. */
export const latToRotX = (lat: number) => (lat * Math.PI) / 180;

export type Mode = 'air' | 'sea' | 'road';
export type Lane = { from: string; to: string; mode: Mode };

export const LANES: Lane[] = [
  { from: 'RTM', to: 'SIN', mode: 'sea' }, { from: 'SHA', to: 'LAX', mode: 'sea' }, { from: 'HAM', to: 'JFK', mode: 'sea' },
  { from: 'SIN', to: 'SYD', mode: 'sea' }, { from: 'DXB', to: 'BOM', mode: 'sea' }, { from: 'GRU', to: 'RTM', mode: 'sea' },
  { from: 'JNB', to: 'DXB', mode: 'sea' }, { from: 'HKG', to: 'LAX', mode: 'sea' },
  { from: 'LHR', to: 'JFK', mode: 'air' }, { from: 'HKG', to: 'ORD', mode: 'air' }, { from: 'DXB', to: 'SYD', mode: 'air' },
  { from: 'NRT', to: 'LAX', mode: 'air' }, { from: 'SIN', to: 'LHR', mode: 'air' }, { from: 'JNB', to: 'LHR', mode: 'air' },
  { from: 'GRU', to: 'JFK', mode: 'air' }, { from: 'SHA', to: 'RTM', mode: 'air' }, { from: 'BOM', to: 'DXB', mode: 'air' },
  { from: 'RTM', to: 'HAM', mode: 'road' }, { from: 'LHR', to: 'RTM', mode: 'road' }, { from: 'ORD', to: 'JFK', mode: 'road' },
  { from: 'LAX', to: 'ORD', mode: 'road' }, { from: 'SHA', to: 'HKG', mode: 'road' }, { from: 'SHA', to: 'NRT', mode: 'road' },
  { from: 'JNB', to: 'LOS', mode: 'road' },
];

export const MODE_LIFT: Record<Mode, number> = { air: 0.34, sea: 0.05, road: 0.012 };

/** Great-circle distance, km */
export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
