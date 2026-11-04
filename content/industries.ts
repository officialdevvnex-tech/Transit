export type Industry = {
  slug: string;
  n: string;
  name: string;
  line: string;
  detail: string;
  proof: { v: string; l: string };
  tags: string[];
  hue: number; // 0 signal, 1 cyan, 2 steel — drives the plate
};

export const INDUSTRIES: Industry[] = [
  { slug: 'automotive', n: '01', name: 'Automotive', hue: 0, line: 'Line-side, to the minute.',
    detail: 'Just-in-sequence inbound for 14 OEM plants. A part is a day late once, the line stops; we plan the buffer so it never is.',
    proof: { v: '99.4%', l: 'JIS windows hit' }, tags: ['Inbound sequencing', 'Milk runs', 'Spare parts', 'EV batteries (DG 9)'] },
  { slug: 'life-sciences', n: '02', name: 'Life sciences', hue: 1, line: 'Held at 2–8°C, proven at every handoff.',
    detail: 'GDP-certified lanes with continuous loggers, validated packaging and a named quality owner on every shipment.',
    proof: { v: '±1°C', l: 'alert threshold' }, tags: ['Cold chain', 'Clinical trials', 'Controlled substances', 'GDP audit trail'] },
  { slug: 'retail', n: '03', name: 'Retail & e-commerce', hue: 0, line: 'Peak season is a plan, not a panic.',
    detail: 'Forward-positioned stock, parcel-ready fulfilment and a returns loop that re-sells within 24 hours.',
    proof: { v: '2.3 days', l: 'median door-to-door, EU' }, tags: ['Fulfilment', 'Returns', 'Drop-ship', 'Peak allocation'] },
  { slug: 'energy', n: '04', name: 'Energy & industrial', hue: 2, line: 'Forty tonnes, one crane window, no second chance.',
    detail: 'Engineered heavy-lift and project cargo: route surveys, escorts, permits and the right vessel, planned months ahead.',
    proof: { v: '620 t', l: 'heaviest single lift' }, tags: ['Project cargo', 'Heavy lift', 'Turbines & transformers', 'Route surveys'] },
  { slug: 'technology', n: '05', name: 'Technology', hue: 1, line: 'Small, valuable, never unattended.',
    detail: 'Secure, GPS-sealed chains for semiconductors and devices, with white-glove install for data centre racks.',
    proof: { v: '0', l: 'lost pallets in 3 years' }, tags: ['High-value', 'Data centres', 'Wafers', 'Reverse logistics'] },
  { slug: 'food', n: '06', name: 'Food & fresh', hue: 2, line: 'Shelf life is the only clock that matters.',
    detail: 'Reefer ocean, perishable air and ripening-aware routing, so the fruit arrives ready for the shelf, not the bin.',
    proof: { v: '+4 days', l: 'average shelf life gained' }, tags: ['Perishables', 'Reefer', 'Controlled atmosphere', 'Phytosanitary'] },
];
