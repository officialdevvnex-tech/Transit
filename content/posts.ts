export type Post = {
  slug: string;
  title: string;
  category: 'Operations' | 'Customs' | 'Sustainability' | 'Technology';
  date: string; // ISO
  read: number;
  excerpt: string;
  body: string[];
};

export const CATEGORIES = ['All', 'Operations', 'Customs', 'Sustainability', 'Technology'] as const;

export const POSTS: Post[] = [
  {
    slug: 'the-date-is-the-product',
    title: 'The date is the product',
    category: 'Operations',
    date: '2026-09-18',
    read: 6,
    excerpt: 'Speed gets the headline. Predictability pays the bills. Why we quote from the slowest leg and what it did to our on-time rate.',
    body: [
      'Ask a shipper what they want from a forwarder and they will say "fast". Watch what they do when a container is three days late and they will tell you the truth: they wanted to know.',
      'In 2023 we changed one rule. Every quote is built from the slowest realistic leg, not the fastest advertised one. Carrier cut-offs, port dwell at the 80th percentile, the customs queue on that weekday, the dock appointment at the other end. The number that comes out is longer than the brochure, and for a quarter our win rate dipped.',
      'Then something quieter happened. On-time delivery moved from 88% to 96.8%, because we were no longer promising a date the network could not keep. Customers began planning production against our date. A planner in Stuttgart told us that she had stopped holding a safety week of stock for her Asian lanes.',
      'That is the product. Not the truck, not the flight, not the vessel: the date, and the ability to build a business on top of it.',
    ],
  },
  {
    slug: 'pre-clearing-91-percent',
    title: 'How we pre-clear 91% of entries before the ship arrives',
    category: 'Customs',
    date: '2026-08-02',
    read: 8,
    excerpt: 'The clearance clock starts at booking, not at the berth. A walkthrough of the document pipeline behind our fastest port releases.',
    body: [
      'A container waiting for paperwork costs more than a container waiting for a crane. Most delays at the border are not inspections; they are missing or inconsistent documents discovered too late.',
      'Our pipeline treats the commercial invoice as data, not a PDF. At booking we extract the parties, values, HS codes and origin, and run them against tariff rulings and the consignee\'s past entries. Anything that disagrees is flagged to a licensed broker the same day, while there are still four weeks of ocean left to fix it.',
      'The entry is lodged 24 hours before arrival wherever the regime allows. On average 91% of declarations are accepted before the vessel is alongside. For the rest, the broker already has the context and the customer\'s phone number.',
    ],
  },
  {
    slug: 'a-quieter-fleet',
    title: 'A quieter fleet: 1,900 electric tractors and what we learned',
    category: 'Sustainability',
    date: '2026-06-24',
    read: 7,
    excerpt: 'Charging, payload, driver hours and why the first lanes to electrify were not the ones we expected.',
    body: [
      'We expected short urban routes to go electric first. It turned out the best candidates were the repeatable 300-kilometre shuttles between our own hubs, where we control both ends and can charge at a predictable hour.',
      'Payload penalty is real but smaller than the headlines: about 1.4 tonnes on a 40-tonne combination. For most of our freight, which cubes out long before it weighs out, no customer noticed.',
      'The surprise was drivers. Retention on electric shuttle lanes is 22 points higher. Cabs are quieter, schedules are tighter, and nobody sleeps in a lay-by waiting for a loading slot. Cleaner freight turned out to be better work.',
    ],
  },
  {
    slug: 'one-event-schema',
    title: 'One event schema for air, ocean and road',
    category: 'Technology',
    date: '2026-05-11',
    read: 5,
    excerpt: 'Why "departed" means three different things in three modes, and the model we built so your systems only need to know one.',
    body: [
      'An airline says departed when the wheels lift. A shipping line says it when the vessel leaves the berth, which can be hours before it clears the port. A trucker\'s phone says it when the app was tapped.',
      'We rebuilt tracking around milestones that mean the same thing everywhere: picked up, handed to carrier, left origin country, arrived destination country, released, delivered. Mode-specific detail hangs off each milestone, but the spine never changes.',
      'Customers who integrate once get every mode. Our own control tower works the same way: an exception is an exception, whether it is a missed connection in Dubai or a flat tyre outside Ghent.',
    ],
  },
  {
    slug: 'peak-season-is-a-plan',
    title: 'Peak season is a plan, not a panic',
    category: 'Operations',
    date: '2026-03-30',
    read: 6,
    excerpt: 'Allocation, forward stock and the 9-week calendar we run with retail customers every year.',
    body: [
      'Peak season starts in February, when the first customers lock allocation. By June, our retail clients have agreed volumes by week, by lane, by mode. By August, the first forward-positioned stock is moving.',
      'The calendar has three rules: nothing important ships on the last available sailing, every lane has a booked fallback, and a named person on each side owns the decision to switch. Nobody improvises in October.',
      'The result is dull in the best way. In last year\'s peak, our retail volume rose 38% and the number of escalations fell by a quarter.',
    ],
  },
  {
    slug: 'cold-chain-in-a-heatwave',
    title: 'Cold chain in a heatwave: Rotterdam to Singapore, 41 hours faster',
    category: 'Operations',
    date: '2026-02-09',
    read: 9,
    excerpt: 'A pharmaceutical customer, a 14-day reefer sailing and a rerouted air bridge. What we changed and what the loggers said.',
    body: [
      'The shipment was 18 pallets of a biologic held at 2–8°C. The ocean leg was fine; the problem was the connection at the transhipment hub, where ambient temperatures were forecast at 41°C.',
      'We moved the transhipment to a covered, powered berth, added a cold dolly for the 70-metre walk to the aircraft, and booked the air bridge for the final stretch. Total door-to-door time dropped by 41 hours against the original plan.',
      'The loggers recorded a maximum of 6.8°C across the entire journey. The customer did not need to open a deviation report. That is the whole job.',
    ],
  },
];

export const postBySlug = (s: string) => POSTS.find((p) => p.slug === s);
