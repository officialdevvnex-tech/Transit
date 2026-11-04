import type { Mode } from '@/lib/geo';

export type Service = {
  slug: string;
  n: string;
  title: string;
  emph: string;
  mode: Mode | 'all';
  kicker: string;
  summary: string;
  body: string;
  specs: { k: string; v: string }[];
  steps: string[];
  levels?: { name: string; time: string; note: string }[];
};

export const SERVICES: Service[] = [
  {
    slug: 'air', n: '01', title: 'Air', emph: 'freight', mode: 'air',
    kicker: 'Overnight to 5 days',
    summary: 'Wheels up inside six hours of pickup, on capacity we have already bought.',
    body: 'We hold block space on 38 carriers and charter when the schedule will not do. Your cargo is on a named flight before the truck leaves your dock, and you see the flight number, not a status called "in transit".',
    specs: [{ k: 'Departures', v: '310 / day' }, { k: 'Max piece', v: '4.2 t · 3.0 m' }, { k: 'Cut-off', v: '3 h before ULD close' }, { k: 'Charter', v: 'Narrow- and wide-body' }],
    steps: ['Pickup within 2 h of booking', 'Screening & ULD build at hub', 'Named flight confirmed', 'Customs pre-cleared in flight', 'Dock-door delivery'],
    levels: [
      { name: 'Express', time: '1–2 days', note: 'Next available flight, door to door.' },
      { name: 'Standard', time: '3–4 days', note: 'Guaranteed uplift, consolidated.' },
      { name: 'Economy', time: '5–7 days', note: 'Best-rate capacity, fixed date.' },
    ],
  },
  {
    slug: 'ocean', n: '02', title: 'Ocean', emph: 'freight', mode: 'sea',
    kicker: 'FCL · LCL · Reefer · Project',
    summary: 'Full-container economics, with a sailing schedule you can plan a factory around.',
    body: 'Contracts with the top ten carriers, allocation guaranteed in peak season, and a control tower that watches port congestion so your container is not the one waiting at anchor.',
    specs: [{ k: 'Sailings', v: '420 / week' }, { k: 'Equipment', v: '20′ 40′ HC · Reefer · OT · FR' }, { k: 'Ports', v: '312 served' }, { k: 'Peak space', v: 'Guaranteed allocation' }],
    steps: ['Booking & equipment release', 'Export clearance', 'Gate-in & vessel stow', 'Live vessel & port tracking', 'Import clearance & drayage'],
  },
  {
    slug: 'road', n: '03', title: 'Road', emph: 'freight', mode: 'road',
    kicker: 'FTL · LTL · Last mile',
    summary: 'The last 600 km decide the whole trip. We run them like the first.',
    body: 'Our own cross-border fleet in Europe and North America, vetted partners everywhere else, and GPS on every trailer. Drivers get a slot, a dock and a name at the other end.',
    specs: [{ k: 'Fleet', v: '6,800 tractors' }, { k: 'Coverage', v: 'EU · UK · US · MX · CA · GCC' }, { k: 'Telematics', v: '30 s GPS pings' }, { k: 'Border', v: 'Pre-lodged TIR / T1' }],
    steps: ['Slot booked at both docks', 'Trailer sealed & geofenced', 'Live ETA, re-planned every 5 min', 'Border pre-lodged', 'Signed proof of delivery in minutes'],
  },
  {
    slug: 'warehousing', n: '04', title: 'Ware', emph: 'housing', mode: 'all',
    kicker: '4.1 M m² across 62 sites',
    summary: 'Stock that sits where the demand will be, and leaves before the order does.',
    body: 'Bonded and free-trade space, pick-and-pack, kitting, returns and cross-dock. The WMS speaks the same event language as the rest of the network, so inventory is a map, not a spreadsheet.',
    specs: [{ k: 'Sites', v: '62 in 24 countries' }, { k: 'Bonded', v: '38 sites' }, { k: 'Order accuracy', v: '99.97%' }, { k: 'Cut-off', v: 'Same-day, 18:00 local' }],
    steps: ['Inbound appointment & ASN match', 'Putaway by velocity', 'Pick, pack, kit', 'Carrier hand-off', 'Returns & re-stock in 24 h'],
  },
  {
    slug: 'customs', n: '05', title: 'Customs', emph: 'brokerage', mode: 'all',
    kicker: 'Own desks in 140 countries',
    summary: 'Paperwork that clears before the cargo lands, with a licensed human on the hook.',
    body: 'Classification, duty optimisation, AEO and C-TPAT programs, drawback and bonded transit. We file in advance, we flag problems while there is still time, and we pay the fine if the mistake is ours.',
    specs: [{ k: 'Declarations', v: '2.1 M / year' }, { k: 'Pre-clearance', v: '91% before arrival' }, { k: 'Programs', v: 'AEO · C-TPAT · PIP' }, { k: 'Rulings', v: 'Binding tariff info' }],
    steps: ['Classification & valuation', 'Document check, 24 h before arrival', 'Pre-lodged entry', 'Duty & VAT optimised', 'Release and audit trail'],
  },
];
