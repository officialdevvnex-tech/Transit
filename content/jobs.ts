export type Job = {
  id: string;
  title: string;
  dept: 'Operations' | 'Engineering' | 'Customs' | 'Commercial';
  location: string;
  type: string;
  summary: string;
  duties: string[];
};

export const DEPTS = ['All', 'Operations', 'Engineering', 'Customs', 'Commercial'] as const;

export const JOBS: Job[] = [
  { id: 'ctl-01', title: 'Control Tower Lead, Ocean', dept: 'Operations', location: 'Rotterdam, NL', type: 'Full-time',
    summary: 'Run the 24/7 desk that sees every vessel, every delay and every recovery option before the customer does.',
    duties: ['Lead a 14-person shift rotation across three time zones', 'Own exception playbooks and recovery pricing', 'Partner with carriers on allocation and re-routing', 'Report weekly on-time and root-cause trends'] },
  { id: 'eng-02', title: 'Senior Frontend Engineer, Visibility', dept: 'Engineering', location: 'Remote (EU)', type: 'Full-time',
    summary: 'Build the tracking and quoting products our customers open ten times a day.',
    duties: ['Ship fast, accessible interfaces in React and TypeScript', 'Own real-time data views and map rendering', 'Work with design on motion and performance budgets', 'Mentor two mid-level engineers'] },
  { id: 'eng-03', title: 'Data Engineer, Milestone Platform', dept: 'Engineering', location: 'Singapore', type: 'Full-time',
    summary: 'Turn thousands of messy carrier feeds into one clean event stream.',
    duties: ['Design streaming pipelines on Kafka and Postgres', 'Normalise EDI, API and email-derived events', 'Build data-quality monitors and alerting', 'Collaborate with ops on exception detection'] },
  { id: 'cus-04', title: 'Licensed Customs Broker', dept: 'Customs', location: 'Los Angeles, US', type: 'Full-time',
    summary: 'File accurate entries early and flag problems while they are still cheap to fix.',
    duties: ['Classify and value complex commodity mixes', 'Pre-lodge entries and manage CBP communications', 'Advise on duty drawback and FTZ strategy', 'Train junior brokers'] },
  { id: 'com-05', title: 'Key Account Manager, Life Sciences', dept: 'Commercial', location: 'Dubai, UAE', type: 'Full-time',
    summary: 'Be the person pharma shippers call first. Know their lanes better than they do.',
    duties: ['Own a portfolio of 12 strategic accounts', 'Lead quarterly service reviews with data', 'Coordinate GDP quality requirements across teams', 'Build tenders and win multi-year contracts'] },
  { id: 'ops-06', title: 'Warehouse Operations Manager', dept: 'Operations', location: 'Chicago, US', type: 'Full-time',
    summary: 'Run a 40,000 m² bonded site where accuracy is a habit, not a target.',
    duties: ['Lead 120 colleagues across three shifts', 'Drive safety, accuracy and throughput KPIs', 'Implement continuous-improvement projects', 'Own customer onboarding for new inventory'] },
];

export const PERKS = [
  { t: 'A real date for every move', d: 'We plan sabbatical, parental leave and holidays the way we plan freight: early, in writing, without drama.' },
  { t: 'Learning budget, no questions', d: '€2,400 a year for courses, certifications, conferences or books. Spend it before December.' },
  { t: 'See the network', d: 'Every colleague gets a funded week at another hub within their first three years.' },
  { t: 'Equity for everyone', d: 'Everyone, from the dock to the data team, is a shareholder after 12 months.' },
];
