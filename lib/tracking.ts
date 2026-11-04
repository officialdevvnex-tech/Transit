import { HUBS, distanceKm, hubById } from './geo';
import { arcPoints } from './geo3d';
import { hash, rand } from './utils';

export type TrackEvent = { code: string; label: string; place: string; at: string; done: boolean };
export type TrackResult = {
  id: string;
  mode: 'air' | 'sea' | 'road';
  status: 'Booked' | 'In transit' | 'At customs' | 'Out for delivery' | 'Delivered';
  origin: { id: string; name: string; lat: number; lon: number };
  destination: { id: string; name: string; lat: number; lon: number };
  position: { lat: number; lon: number };
  progress: number;
  eta: string;
  promised: string;
  onTime: boolean;
  weightKg: number;
  pieces: number;
  carrierRef: string;
  events: TrackEvent[];
};

const MODES = ['air', 'sea', 'road'] as const;
const DAY = 86_400_000;

/** Deterministic mock: the same ID always tells the same story. */
export function mockTrack(id: string, now = Date.now()): TrackResult {
  const h = hash(id);
  const suffix = id.slice(-3);
  const destination = hubById(suffix) ?? HUBS[h % HUBS.length];
  let origin = HUBS[(h >>> 4) % HUBS.length];
  if (origin.id === destination.id) origin = HUBS[((h >>> 4) + 5) % HUBS.length];
  const mode = MODES[(h >>> 8) % 3];
  const km = distanceKm(origin, destination);
  const speed = mode === 'air' ? 3200 : mode === 'sea' ? 700 : 900; // km/day incl. dwell
  const totalDays = Math.max(1.5, km / speed + (mode === 'sea' ? 4 : 1.2));
  const progress = 0.28 + rand(h) * 0.62;
  const start = now - progress * totalDays * DAY;
  const pts = arcPoints(origin, destination, 0, 80);
  const p = pts[Math.round(progress * 80)];
  const lat = (Math.asin(p.y / p.length()) * 180) / Math.PI;
  const lon = (Math.atan2(p.x, p.z) * 180) / Math.PI;
  const eta = start + totalDays * DAY;
  const late = rand(h * 3) > 0.9;
  const promised = eta - (late ? 0.6 : -0.3) * DAY;
  const at = (f: number) => new Date(start + f * totalDays * DAY).toISOString();
  const mk = (code: string, label: string, place: string, f: number): TrackEvent => ({ code, label, place, at: at(f), done: f <= progress });
  const status = progress > 0.88 ? 'Out for delivery' : progress > 0.74 ? 'At customs' : 'In transit';
  return {
    id, mode, status, origin: { id: origin.id, name: origin.name, lat: origin.lat, lon: origin.lon },
    destination: { id: destination.id, name: destination.name, lat: destination.lat, lon: destination.lon },
    position: { lat, lon }, progress, eta: new Date(eta).toISOString(), promised: new Date(promised).toISOString(), onTime: !late,
    weightKg: 400 + (h % 18_000), pieces: 2 + (h % 38), carrierRef: `${mode === 'air' ? 'TAF' : mode === 'sea' ? 'TAV' : 'TAR'}${(h % 9000) + 1000}`,
    events: [
      mk('PU', 'Picked up from shipper', origin.name, 0),
      mk('HO', 'Handed to carrier', `${origin.name} hub`, 0.1),
      mk('DE', mode === 'air' ? 'Departed on flight' : mode === 'sea' ? 'Vessel departed' : 'Trailer departed', origin.name, 0.2),
      mk('TR', mode === 'sea' ? 'Transhipment completed' : 'Border crossing cleared', 'En route', 0.5),
      mk('AR', 'Arrived destination country', destination.country, 0.74),
      mk('CL', 'Customs released', destination.name, 0.84),
      mk('OD', 'Out for delivery', destination.name, 0.92),
      mk('DL', 'Delivered, signed', destination.name, 1),
    ],
  };
}
