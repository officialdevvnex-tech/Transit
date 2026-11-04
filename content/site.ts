export const SITE = {
  name: 'TransitArc Logistics',
  short: 'TransitArc',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://transitarc.example',
  tagline: 'Every shipment, on time, everywhere.',
  description:
    'TransitArc moves freight by air, ocean and road across 140 countries, with one live view of every shipment and a delivery date we keep.',
  phone: '+31 10 555 0142',
  email: 'hello@transitarc.example',
};

export const NAV = [
  { href: '/services', label: 'Services' },
  { href: '/network', label: 'Network' },
  { href: '/industries', label: 'Industries' },
  { href: '/track', label: 'Track' },
  { href: '/about', label: 'About' },
  { href: '/careers', label: 'Careers' },
  { href: '/blog', label: 'Journal' },
  { href: '/contact', label: 'Contact' },
];

export const STATS = [
  { value: 1240, suffix: '', label: 'Departures every day', note: 'air, ocean and road combined' },
  { value: 96.8, suffix: '%', label: 'Delivered on the promised date', note: 'rolling 12 months, all modes', decimals: 1 },
  { value: 140, suffix: '', label: 'Countries with our own customs desk', note: 'not a partner, our people' },
  { value: 31, suffix: 'min', label: 'Median time to a quote', note: 'a person replies, not a form' },
];

export const OFFICES = [
  { id: 'RTM', city: 'Rotterdam', role: 'Global headquarters', address: 'Wilhelminakade 91, 3072 AP Rotterdam', tz: 'Europe/Amsterdam', phone: '+31 10 555 0142' },
  { id: 'SIN', city: 'Singapore', role: 'Asia Pacific hub', address: '8 Marina Boulevard, Level 31, 018981', tz: 'Asia/Singapore', phone: '+65 6555 0188' },
  { id: 'LAX', city: 'Los Angeles', role: 'Americas hub', address: '5757 W Century Blvd, Suite 700, CA 90045', tz: 'America/Los_Angeles', phone: '+1 310 555 0116' },
  { id: 'DXB', city: 'Dubai', role: 'Middle East & Africa hub', address: 'Dubai South, Logistics District, Plot 214', tz: 'Asia/Dubai', phone: '+971 4 555 0173' },
];

export const FAQ = [
  { q: 'How is the delivery date calculated?', a: 'We quote from the slowest real leg, not the fastest brochure one: carrier cut-offs, port dwell, customs queue and last-mile slot. If we say Thursday, Thursday is the date on the contract.' },
  { q: 'What happens when something slips?', a: 'You hear from a named person before the delay shows on any screen, with the new date and the recovery option we have already priced. Delay credits apply automatically on Express and Standard.' },
  { q: 'Do you handle dangerous goods and cold chain?', a: 'Yes. IATA/IMDG/ADR-certified teams handle DG, and our temperature-controlled lanes carry continuous loggers with live alerts at ±1°C from setpoint.' },
  { q: 'Can I integrate tracking into my own systems?', a: 'Every shipment has a REST + webhook feed with milestone events in the same schema across air, ocean and road. EDI is available for the stubborn ERP.' },
  { q: 'What is the minimum shipment size?', a: 'There is none. A single pallet gets the same tracking, the same customs desk and the same promise as a 40-foot container.' },
];
